const { asyncHandler } = require('../middleware/errorHandler');
const videoService = require('../services/videoService');
const jobService = require('../services/jobService');
const mlService = require('../services/mlService');

/**
 * Upload a new video
 * POST /api/video/upload
 */
const uploadVideo = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No video file provided',
        });
    }

    // Create video record with metadata
    const video = await videoService.createVideo(req.file, req.user?._id || null);

    // Create analysis job
    const job = await jobService.createJob(video._id);

    res.status(201).json({
        success: true,
        data: {
            videoId: video._id,
            filename: video.filename,
            originalName: video.originalName,
            duration: video.duration,
            fps: video.fps,
            frameCount: video.frameCount,
            width: video.width,
            height: video.height,
            status: video.status,
            jobId: job._id,
            uploadedAt: video.uploadedAt,
        },
    });
});

/**
 * Get video by ID
 * GET /api/video/:id
 */
const getVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const video = await videoService.getVideoById(id);

    if (!video) {
        return res.status(404).json({
            success: false,
            error: 'Video not found',
        });
    }

    res.json({
        success: true,
        data: video,
    });
});

/**
 * Get all videos with pagination
 * GET /api/video
 */
const getVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const result = await videoService.getVideos({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        userId: req.user?.role === 'admin' ? null : req.user?._id,
    });

    const videosWithResults = await Promise.all(result.videos.map(async (video) => {
        const resultDoc = await mlService.getResultByVideoId(video._id);
        return {
            ...video.toObject(),
            result: resultDoc ? {
                verdict: resultDoc.verdict,
                confidence: resultDoc.confidence,
            } : null,
        };
    }));

    res.json({
        success: true,
        data: videosWithResults,
        pagination: result.pagination,
    });
});

/**
 * Delete a video owned by the current user
 * DELETE /api/video/:id
 */
const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const video = await videoService.getVideoById(id);
    if (!video) {
        return res.status(404).json({
            success: false,
            error: 'Video not found',
        });
    }

    const isOwner = video.userId?.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            success: false,
            error: 'You can only delete your own videos',
        });
    }

    await videoService.deleteVideoWithData(id);

    res.json({
        success: true,
        message: 'Video deleted successfully',
    });
});

module.exports = {
    uploadVideo,
    getVideo,
    getVideos,
    deleteVideo,
};
