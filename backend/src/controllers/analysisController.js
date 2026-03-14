const { asyncHandler } = require('../middleware/errorHandler');
const jobService = require('../services/jobService');
const videoService = require('../services/videoService');
const mlService = require('../services/mlService');
const env = require('../config/env');

/**
 * Start analysis for a video
 * POST /api/analysis/start/:videoId
 */
const startAnalysis = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { mock = false } = req.query; // Use mock mode for testing

    // Get video
    const video = await videoService.getVideoById(videoId);
    if (!video) {
        return res.status(404).json({
            success: false,
            error: 'Video not found',
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

    // Start job
    job = await jobService.startJob(videoId);

    // Send immediate response
    res.json({
        success: true,
        data: {
            videoId: video._id,
            jobId: job._id,
            status: job.status,
            message: 'Analysis started. Poll status endpoint for updates.',
        },
    });

    // Process in background (async, no await)
    processAnalysis(video, mock === 'true' || mock === true);
});

/**
 * Background analysis processing
 */
const processAnalysis = async (video, useMock = false) => {
    try {
        let mlResult;

        if (useMock) {
            // Use mock analysis when explicitly requested
            console.log(`[MOCK] Using mock analysis for video: ${video._id}`);
            mlResult = await mlService.mockAnalyze(video);
        } else {
            // Call real ML service
            console.log(`[ML] Calling ML service for video: ${video._id}`);
            mlResult = await mlService.analyzeVideo(video);
        }

        // Save result
        await mlService.saveResult(video._id, mlResult);

        // Mark job complete
        await jobService.completeJob(video._id);

        console.log(`[SUCCESS] Analysis complete for video: ${video._id}`);
    } catch (error) {
        console.error(`[ERROR] Analysis failed for video ${video._id}:`, error.message);
        await jobService.failJob(video._id, error.message);
    }
};

/**
 * Get analysis status
 * GET /api/analysis/status/:videoId
 */
const getAnalysisStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

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
