const { asyncHandler } = require('../middleware/errorHandler');
const mlService = require('../services/mlService');
const videoService = require('../services/videoService');
const jobService = require('../services/jobService');

/**
 * Get analysis results for a video
 * GET /api/results/:videoId
 */
const getResults = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if video exists
    const video = await videoService.getVideoById(videoId);
    if (!video) {
        return res.status(404).json({
            success: false,
            error: 'Video not found',
        });
    }

    if (!videoService.canAccessVideo(video, req.user)) {
        return res.status(403).json({
            success: false,
            error: 'You can only view results for your own videos',
        });
    }

    // Check job status
    const job = await jobService.getJobByVideoId(videoId);
    if (!job) {
        return res.status(404).json({
            success: false,
            error: 'No analysis job found for this video',
        });
    }

    if (job.status === 'queued' || job.status === 'running') {
        return res.status(202).json({
            success: true,
            data: {
                videoId,
                status: job.status,
                progress: job.progress,
                message: 'Analysis is still in progress',
            },
        });
    }

    if (job.status === 'failed') {
        return res.status(500).json({
            success: false,
            error: 'Analysis failed',
            details: job.errorMessage,
        });
    }

    // Get result
    const result = await mlService.getResultByVideoId(videoId);

    if (!result) {
        return res.status(404).json({
            success: false,
            error: 'Results not found',
        });
    }

    res.json({
        success: true,
        data: {
            videoId: result.videoId,
            verdict: result.verdict,
            confidence: result.confidence,
            topkConfidence: result.topkConfidence,
            confidenceLabel: result.confidenceLabel,
            qualityWarnings: result.qualityWarnings,
            qualitySummary: result.qualitySummary,
            manipulatedSegments: result.manipulatedSegments,
            frameEvidence: result.frameEvidence,
            modelVersion: result.modelVersion,
            processingTime: result.processingTime,
            createdAt: result.createdAt,
            summary: {
                totalManipulatedSegments: result.manipulatedSegments.length,
                totalFrameEvidence: result.frameEvidence.length,
                highConfidenceFrames: result.frameEvidence.filter(f => f.score > 80).length,
            },
            video: {
                filename: video.originalName,
                duration: video.duration,
                fps: video.fps,
                frameCount: video.frameCount,
                sourceUrl: video.sourceUrl,
                sourceHost: video.sourceHost,
                claim: video.claim,
                verificationMode: video.verificationMode,
            },
        },
    });
});

module.exports = {
    getResults,
};
