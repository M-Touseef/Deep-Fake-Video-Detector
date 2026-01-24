const { asyncHandler } = require('../middleware/errorHandler');
const videoService = require('../services/videoService');
const jobService = require('../services/jobService');

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
    const video = await videoService.createVideo(req.file, req.userId || null);

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
        userId: req.userId || null,
    });

    res.json({
        success: true,
        data: result.videos,
        pagination: result.pagination,
    });
});

module.exports = {
    uploadVideo,
    getVideo,
    getVideos,
};
