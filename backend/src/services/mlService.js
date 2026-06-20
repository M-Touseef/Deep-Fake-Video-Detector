const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Result = require('../models/Result');
const env = require('../config/env');

/** Derive the health-check URL from the predict URL (replace /predict with /health). */
const getHealthUrl = () => {
    const base = env.ML_SERVICE_URL.replace(/\/[^\/]+$/, '');
    return `${base}/health`;
};

/**
 * Ping the ML service /health endpoint to wake it from scale-to-zero.
 * Waits up to 90 s for the service to become available.
 */
const warmUpMlService = async () => {
    const healthUrl = getHealthUrl();
    const maxWaitMs = 90000;
    const pollInterval = 5000;
    const started = Date.now();
    console.log(`[ML] Warming up ML service at ${healthUrl}...`);
    while (Date.now() - started < maxWaitMs) {
        try {
            const res = await axios.get(healthUrl, { timeout: 10000 });
            if (res.status === 200) {
                console.log('[ML] ML service is warm and ready.');
                return;
            }
        } catch (_) {
            // still starting — wait and retry
        }
        await new Promise((r) => setTimeout(r, pollInterval));
    }
    console.warn('[ML] Warm-up timed out — proceeding anyway.');
};

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
    // ── Warm up the ML service in case it scaled to zero ──────────────────────
    await warmUpMlService();

    const MAX_RETRIES = 2;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        const form = new FormData();
        // Field MUST be "video" — matches Flask's `request.files['video']`
        form.append('video', fs.createReadStream(video.filePath), {
            filename: path.basename(video.filePath),
            contentType: 'video/mp4',
        });

        const startTime = Date.now();

        try {
            const response = await axios.post(
                env.ML_SERVICE_URL,   // e.g. https://fyp-ml-service.../predict
                form,
                {
                    timeout: env.ML_SERVICE_TIMEOUT,
                    headers: { ...form.getHeaders() },
                }
            );

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
                rank:              f.rank,
                timestamp:         f.timestamp,        // string e.g. "1.0s"
                score:             f.score,             // 0-100 %
                originalBase64:    f.original_image,
                heatmapBase64:     f.image,             // base64 JPEG string
                activationRegion:  f.activation_region || '',
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

        } catch (error) {
            // Surface NO_FACE_DETECTED immediately — no retry
            if (error.response?.data?.code === 'NO_FACE_DETECTED') {
                throw new Error(error.response.data.error);
            }

            const status = error.response?.status;
            const isTransient = !status || status === 502 || status === 503 || status === 504
                || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED';

            lastError = error;

            if (isTransient && attempt <= MAX_RETRIES) {
                console.warn(`[ML] Transient error (attempt ${attempt}/${MAX_RETRIES + 1}), retrying in 10 s... Status: ${status || error.code}`);
                await new Promise((r) => setTimeout(r, 10000));
                continue;
            }

            // Permanent or retries exhausted — throw a clean error
            if (error.code === 'ECONNREFUSED') {
                throw new Error('ML service is not available. Is the Flask server running?');
            }
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                throw new Error('ML service request timed out after 5 minutes.');
            }
            const msg = error.response?.data?.error || error.message;
            throw new Error(`ML service error: ${msg}`);
        }
    }

    // All retries exhausted
    const msg = lastError?.response?.data?.error || lastError?.message || 'Unknown ML error';
    throw new Error(`ML service error (retries exhausted): ${msg}`);
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
