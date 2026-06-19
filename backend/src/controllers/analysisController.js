const { asyncHandler } = require('../middleware/errorHandler');
const jobService = require('../services/jobService');
const videoService = require('../services/videoService');
const mlService = require('../services/mlService');

/**
 * Start analysis for a video
 * POST /api/analysis/start/:videoId
 */
const startAnalysis = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Get video
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
            error: 'You can only analyse your own videos',
        });
    }

    // Get or check job
    let job = await jobService.getJobByVideoId(videoId);
    if (!job) {
        job = await jobService.createJob(videoId);
    }

    if (job.status === 'running') {
        return res.status(400).json({
            success: false,
            error: 'Analysis is already in progress',
        });
    }

    if (job.status === 'done') {
        return res.status(400).json({
            success: false,
            error: 'Analysis has already completed. Retrieve results instead.',
        });
    }

    let progressTimer = null;

    try {
        await jobService.startJob(videoId);
        await jobService.updateJobProgress(videoId, 20);

        const startedAt = Date.now();
        progressTimer = setInterval(async () => {
            try {
                const elapsedSeconds = (Date.now() - startedAt) / 1000;
                const estimatedProgress = 25 + Math.min(60, elapsedSeconds * 2);
                await jobService.updateJobProgress(videoId, estimatedProgress);
            } catch (progressError) {
                console.warn(`[WARN] Failed to update progress for video ${videoId}:`, progressError.message);
            }
        }, 5000);

        const mlResult = await mlService.analyzeVideo(video);

        clearInterval(progressTimer);
        progressTimer = null;

        await jobService.updateJobProgress(videoId, 88);
        await mlService.saveResult(videoId, mlResult);
        await jobService.updateJobProgress(videoId, 95);
        await jobService.completeJob(videoId);
    } catch (error) {
        if (progressTimer) {
            clearInterval(progressTimer);
        }

        await jobService.failJob(videoId, error.message);
        throw error;
    }

    res.json({
        success: true,
        data: {
            videoId: video._id,
            jobId: job._id,
            status: 'done',
            message: 'Analysis completed. Retrieve results from the results endpoint.',
        },
    });
});

/**
 * Get analysis status
 * GET /api/analysis/status/:videoId
 */
const getAnalysisStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
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
            error: 'You can only view analysis status for your own videos',
        });
    }

    const job = await jobService.getJobByVideoId(videoId);

    if (!job) {
        return res.status(404).json({
            success: false,
            error: 'No analysis job found for this video',
        });
    }

    res.json({
        success: true,
        data: {
            videoId,
            jobId: job._id,
            status: job.status,
            progress: job.progress,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            errorMessage: job.errorMessage,
        },
    });
});

module.exports = {
    startAnalysis,
    getAnalysisStatus,
};
