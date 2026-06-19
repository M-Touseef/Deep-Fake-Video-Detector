const { asyncHandler } = require('../middleware/errorHandler');
const jobService = require('../services/jobService');
const videoService = require('../services/videoService');
const { enqueueAnalysis } = require('../queues/analysisQueue');

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

    await enqueueAnalysis(videoId);

    // Send immediate response
    res.json({
        success: true,
        data: {
            videoId: video._id,
            jobId: job._id,
            status: job.status,
            message: 'Analysis queued. Poll status endpoint for updates.',
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
