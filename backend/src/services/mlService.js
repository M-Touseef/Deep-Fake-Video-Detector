const axios = require('axios');
const Result = require('../models/Result');
const env = require('../config/env');

/**
 * Call ML service to analyze video
 * @param {Object} video - Video document
 * @returns {Promise<Object>} Analysis result from ML service
 */
const analyzeVideo = async (video) => {
    try {
        const response = await axios.post(
            env.ML_SERVICE_URL,
            {
                videoPath: video.filePath,
                videoId: video._id.toString(),
                metadata: {
                    duration: video.duration,
                    fps: video.fps,
                    frameCount: video.frameCount,
                    width: video.width,
                    height: video.height,
                },
            },
            {
                timeout: env.ML_SERVICE_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            throw new Error('ML service is not available');
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            throw new Error('ML service request timed out');
        }
        throw new Error(`ML service error: ${error.message}`);
    }
};

/**
 * Save analysis result to database
 * @param {string} videoId - Video document ID
 * @param {Object} mlResponse - Response from ML service
 * @returns {Promise<Object>} Saved result document
 */
const saveResult = async (videoId, mlResponse) => {
    // Check if result already exists
    let result = await Result.findOne({ videoId });

    const resultData = {
        videoId,
        verdict: mlResponse.verdict || 'real',
        confidence: mlResponse.confidence || 0,
        manipulatedSegments: mlResponse.manipulatedSegments || [],
        frameEvidence: mlResponse.frameEvidence || [],
        modelVersion: mlResponse.modelVersion || null,
        processingTime: mlResponse.processingTime || null,
    };

    if (result) {
        // Update existing result
        Object.assign(result, resultData);
        await result.save();
    } else {
        // Create new result
        result = new Result(resultData);
        await result.save();
    }

    return result;
};

/**
 * Get result by video ID
 * @param {string} videoId - Video document ID
 * @returns {Promise<Object|null>} Result document
 */
const getResultByVideoId = async (videoId) => {
    return Result.findOne({ videoId });
};

/**
 * Mock analysis for testing without ML service
 * Returns realistic dummy responses for deepfake detection
 * @param {Object} video - Video document
 * @returns {Promise<Object>} Mock analysis result
 */
const mockAnalyze = async (video) => {
    // Simulate varying processing times (2-5 seconds)
    const processingTime = 2000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Weighted random: 60% fake, 40% real for demo purposes
    const isDeepfake = Math.random() > 0.4;

    // Generate confidence based on verdict (fake videos typically detected with higher confidence)
    const baseConfidence = isDeepfake ? 0.75 : 0.85;
    const confidence = baseConfidence + Math.random() * 0.2; // 0.75-0.95 for fake, 0.85-1.0 for real

    const mockResult = {
        verdict: isDeepfake ? 'fake' : 'real',
        confidence: Math.round(Math.min(confidence, 0.99) * 100) / 100,
        manipulatedSegments: [],
        frameEvidence: [],
        modelVersion: 'DeepfakeDetector-v2.1-demo',
        processingTime: Math.round(processingTime),
    };

    // Generate realistic fake detection data
    if (isDeepfake) {
        const frameCount = video.frameCount || 900; // Default 30fps * 30sec
        const fps = video.fps || 30;

        // Detection reasons for variety
        const detectionReasons = [
            'Face swap artifacts detected',
            'Temporal inconsistency in facial movements',
            'Blending boundary anomalies',
            'Audio-visual synchronization mismatch',
            'Unnatural eye blinking pattern',
            'Skin texture irregularities',
            'Facial landmark displacement',
        ];

        const anomalyTypes = [
            'face_swap',
            'lip_sync',
            'expression_transfer',
            'full_face_reenactment',
            'boundary_artifacts',
        ];

        // Generate 1-3 manipulated segments
        const numSegments = Math.floor(Math.random() * 3) + 1;
        const segmentLength = Math.floor(frameCount / (numSegments + 2));

        for (let i = 0; i < numSegments; i++) {
            const startFrame = Math.floor(segmentLength * (i + 0.5) + Math.random() * segmentLength * 0.3);
            const endFrame = startFrame + Math.floor(segmentLength * 0.4 + Math.random() * segmentLength * 0.3);
            const segmentConfidence = 0.7 + Math.random() * 0.25;

            mockResult.manipulatedSegments.push({
                startFrame,
                endFrame,
                startTime: Math.round((startFrame / fps) * 100) / 100,
                endTime: Math.round((endFrame / fps) * 100) / 100,
                reason: detectionReasons[Math.floor(Math.random() * detectionReasons.length)],
                confidence: Math.round(segmentConfidence * 100) / 100,
            });

            // Add frame evidence for each segment (2-4 key frames)
            const numEvidence = Math.floor(Math.random() * 3) + 2;
            const evidenceSpacing = Math.floor((endFrame - startFrame) / numEvidence);

            for (let j = 0; j < numEvidence; j++) {
                const evidenceFrame = startFrame + evidenceSpacing * j + Math.floor(Math.random() * evidenceSpacing * 0.5);
                const frameConfidence = 0.65 + Math.random() * 0.3;

                mockResult.frameEvidence.push({
                    frame: evidenceFrame,
                    timestamp: Math.round((evidenceFrame / fps) * 100) / 100,
                    confidence: Math.round(frameConfidence * 100) / 100,
                    heatmapPath: null, // Would be generated by real ML model
                    anomalyType: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
                    description: `Anomaly detected at frame ${evidenceFrame}`,
                });
            }
        }

        // Sort frame evidence by frame number
        mockResult.frameEvidence.sort((a, b) => a.frame - b.frame);
    }

    return mockResult;
};

module.exports = {
    analyzeVideo,
    saveResult,
    getResultByVideoId,
    mockAnalyze,
};
