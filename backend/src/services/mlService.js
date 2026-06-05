const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Result = require('../models/Result');
const env = require('../config/env');

const getConfidenceLabel = (confidence) => {
    if (confidence > 0.85) return 'High confidence';
    if (confidence >= 0.60) return 'Medium confidence';
    return 'Low confidence';
};

const getCompressionWarning = (video) => {
    const duration = Number(video.duration || 0);
    const fileSize = Number(video.fileSize || 0);
    const estimatedBitrate = duration > 0 && fileSize > 0
        ? (fileSize * 8) / duration
        : null;

    if (estimatedBitrate !== null && estimatedBitrate < 500000) {
        return 'Heavy compression. Low estimated bitrate may hide or create forensic artifacts.';
    }

    if (video.width && video.height && Math.min(video.width, video.height) < 360) {
        return 'Heavy compression. Low source resolution may reduce forensic reliability.';
    }

    return null;
};

/**
 * Call the Flask ML service to analyse a video.
 *
 * ML API contract (Flask /predict):
 *   Request : POST multipart/form-data, field "video" (.mp4)
 *   Response JSON:
 *     prediction      – "Fake" | "Real"
 *     confidence      – number 0-100 (%)
 *     topk_confidence – number 0-100 (%) — top-K adjusted score
 *     segments        – array of { label, time_range, score, verdict, verdict_css }
 *     top3_frames     – array of { image (base64 JPEG), rank, timestamp, score }
 *
 * @param {Object} video  – Video mongoose document
 * @returns {Promise<Object>} Normalised analysis result
 */
const analyzeVideo = async (video) => {
    const form = new FormData();
    // Field MUST be "video" — matches Flask's `request.files['video']`
    form.append('video', fs.createReadStream(video.filePath), {
        filename: require('path').basename(video.filePath),
        contentType: 'video/mp4',
    });

    const startTime = Date.now();

    const response = await axios.post(
        env.ML_SERVICE_URL,   // default: http://localhost:5000/predict
        form,
        {
            timeout: env.ML_SERVICE_TIMEOUT,
            headers: { ...form.getHeaders() },
        }
    ).catch((error) => {
        if (error.code === 'ECONNREFUSED') {
            throw new Error('ML service is not available. Is the Flask server running?');
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            throw new Error('ML service request timed out after 5 minutes.');
        }
        if (error.response?.data?.code === 'NO_FACE_DETECTED') {
            throw new Error(error.response.data.error);
        }
        const msg = error.response?.data?.error || error.message;
        throw new Error(`ML service error: ${msg}`);
    });

    const ml = response.data;
    const processingTime = Date.now() - startTime;

    /*
     * Map Flask response → internal format stored in MongoDB.
     *
     * ml.prediction  "Fake"/"Real"  → verdict  "fake"/"real"
     * ml.confidence  0-100 %        → confidence  0-1 (DB schema)
     * ml.segments    [{label, time_range, score, verdict}]
     *                               → manipulatedSegments [{label, timeRange, score, verdict, startTime, endTime}]
     * ml.top3_frames [{rank, timestamp, score, image}]
     *                               → frameEvidence [{rank, timestamp, score, heatmapBase64}]
     */
    const verdict = ml.prediction === 'Fake' ? 'fake' : 'real';
    const confidence = +(ml.confidence / 100).toFixed(4);           // 0-1
    const topkConfidence = +(ml.topk_confidence / 100).toFixed(4);  // 0-1
    const confidenceLabel = getConfidenceLabel(confidence);
    const qualitySummary = {
        validFaceFrames: ml.quality_summary?.valid_face_frames ?? null,
        avgFaceDetectionScore: ml.quality_summary?.avg_face_detection_score ?? null,
        minFaceArea: ml.quality_summary?.min_face_area ?? null,
    };
    const qualityWarnings = [...(ml.quality_summary?.warnings || [])];
    const compressionWarning = getCompressionWarning(video);
    if (compressionWarning) {
        qualityWarnings.push(compressionWarning);
    }

    // segments → manipulatedSegments
    const manipulatedSegments = (ml.segments || []).map((seg) => {
        // time_range format: "0.0s – 2.5s"
        const [tsStart, tsEnd] = seg.time_range
            ? seg.time_range.replace(/s/g, '').split('–').map((v) => parseFloat(v.trim()))
            : [0, 0];
        return {
            label:     seg.label     || '',
            timeRange: seg.time_range || '',
            score:     seg.score     || 0,
            verdict:   seg.verdict   || '',
            startTime: isNaN(tsStart) ? 0 : tsStart,
            endTime:   isNaN(tsEnd)   ? 0 : tsEnd,
        };
    });

    // top3_frames → frameEvidence
    const frameEvidence = (ml.top3_frames || []).map((f) => ({
        rank:           f.rank,
        timestamp:      f.timestamp,   // string e.g. "1.0s"
        score:          f.score,        // 0-100 %
        originalBase64: f.original_image,
        heatmapBase64:  f.image,        // base64 JPEG string
        activationRegion: f.activation_region || '',
        regionExplanation: f.region_explanation || '',
    }));

    return {
        verdict,
        confidence,
        topkConfidence,
        confidenceLabel,
        qualityWarnings,
        qualitySummary,
        manipulatedSegments,
        frameEvidence,
        modelVersion:   'SpatialDeepfakeDetector-v1',
        processingTime,
    };
};

/**
 * Save analysis result to MongoDB.
 */
const saveResult = async (videoId, mlResponse) => {
    let result = await Result.findOne({ videoId });

    const resultData = {
        videoId,
        verdict:              mlResponse.verdict         || 'real',
        confidence:           mlResponse.confidence      || 0,
        topkConfidence:       mlResponse.topkConfidence  || 0,
        confidenceLabel:      mlResponse.confidenceLabel || 'Low confidence',
        qualityWarnings:      mlResponse.qualityWarnings || [],
        qualitySummary:       mlResponse.qualitySummary  || {},
        manipulatedSegments:  mlResponse.manipulatedSegments || [],
        frameEvidence:        mlResponse.frameEvidence   || [],
        modelVersion:         mlResponse.modelVersion    || null,
        processingTime:       mlResponse.processingTime  || null,
    };

    if (result) {
        Object.assign(result, resultData);
        await result.save();
    } else {
        result = new Result(resultData);
        await result.save();
    }

    return result;
};

/**
 * Retrieve a saved result by video ID.
 */
const getResultByVideoId = async (videoId) => {
    return Result.findOne({ videoId });
};

module.exports = { analyzeVideo, saveResult, getResultByVideoId };
