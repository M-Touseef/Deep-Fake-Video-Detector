const { asyncHandler } = require('../middleware/errorHandler');
const Video = require('../models/Video');
const AnalysisJob = require('../models/AnalysisJob');
const Result = require('../models/Result');
const User = require('../models/User');
const videoService = require('../services/videoService');

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalVideos,
        analyzedVideos,
        processingVideos,
        failedVideos,
        totalFakeVideos,
        totalRealVideos,
        activeUsers,
        recentJobs,
    ] = await Promise.all([
        Video.countDocuments(),
        Video.countDocuments({ status: 'analyzed' }),
        Video.countDocuments({ status: 'processing' }),
        Video.countDocuments({ status: 'failed' }),
        Result.countDocuments({ verdict: 'fake' }),
        Result.countDocuments({ verdict: 'real' }),
        User.countDocuments(),
        AnalysisJob.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('videoId', 'originalName'),
    ]);

    res.json({
        success: true,
        data: {
            totalUsers: activeUsers,
            totalVideos,
            analysesToday: analyzedVideos,
            fakeDetections: totalFakeVideos,
            reportsGenerated: analyzedVideos,
            storageUsed: '0 GB',
            overview: {
                activeUsers,
                totalVideos,
                analyzedVideos,
                processingVideos,
                failedVideos,
                pendingVideos: totalVideos - analyzedVideos - processingVideos - failedVideos,
            },
            results: {
                fakeVideos: totalFakeVideos,
                realVideos: totalRealVideos,
                detectionRate: totalFakeVideos + totalRealVideos > 0
                    ? ((totalFakeVideos / (totalFakeVideos + totalRealVideos)) * 100).toFixed(2)
                    : 0,
            },
            recentActivity: recentJobs.map(job => ({
                jobId: job._id,
                videoName: job.videoId?.originalName || 'Unknown',
                status: job.status,
                createdAt: job.createdAt,
                completedAt: job.completedAt,
            })),
        },
    });
});

/**
 * Get all videos with filters (admin view)
 * GET /api/admin/videos
 */
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        verdict,
        sortBy = 'uploadedAt',
        sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;

    // Get videos
    const videos = await Video.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('userId', 'name');

    // Get results for verdict filter
    const videoIds = videos.map(v => v._id);
    const results = await Result.find({ videoId: { $in: videoIds } });
    const resultsMap = {};
    results.forEach(r => {
        resultsMap[r.videoId.toString()] = r;
    });

    // Combine data
    let combinedVideos = videos.map(video => ({
        id: video._id,
        _id: video._id,
        filename: video.filename,
        originalName: video.originalName,
        owner: video.userId?.name || 'Unknown',
        fileSize: video.fileSize,
        duration: video.duration,
        fps: video.fps,
        frameCount: video.frameCount,
        status: video.status,
        uploadedAt: video.uploadedAt,
        verdict: resultsMap[video._id.toString()] ? resultsMap[video._id.toString()].verdict : '-',
        confidence: resultsMap[video._id.toString()] ? resultsMap[video._id.toString()].confidence : null,
        result: resultsMap[video._id.toString()] ? {
            verdict: resultsMap[video._id.toString()].verdict,
            confidence: resultsMap[video._id.toString()].confidence,
        } : null,
    }));

    // Filter by verdict if specified
    if (verdict) {
        combinedVideos = combinedVideos.filter(v => v.result?.verdict === verdict);
    }

    const total = await Video.countDocuments(query);

    res.json({
        success: true,
        data: combinedVideos,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
});

/**
 * Delete a video and its associated data
 * DELETE /api/admin/videos/:videoId
 */
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await videoService.deleteVideoWithData(videoId);
    if (!video) {
        return res.status(404).json({
            success: false,
            error: 'Video not found',
        });
    }

    res.json({
        success: true,
        message: 'Video and associated data deleted successfully',
    });
});

/**
 * Bulk delete videos
 * POST /api/admin/videos/bulk-delete
 */
const bulkDeleteVideos = asyncHandler(async (req, res) => {
    const { videoIds } = req.body;

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Please provide an array of video IDs',
        });
    }

    let deletedCount = 0;
    const errors = [];

    for (const videoId of videoIds) {
        try {
            const video = await videoService.deleteVideoWithData(videoId);
            if (video) {
                deletedCount++;
            }
        } catch (err) {
            errors.push({ videoId, error: err.message });
        }
    }

    res.json({
        success: true,
        data: {
            requested: videoIds.length,
            deleted: deletedCount,
            errors: errors.length > 0 ? errors : undefined,
        },
    });
});

/**
 * Get all users for admin management
 * GET /api/admin/users
 */
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .sort({ createdAt: -1 })
        .select('name email role createdAt');

    const usersWithStats = await Promise.all(users.map(async (user) => {
        const videosCount = await Video.countDocuments({ userId: user._id });
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            videos: videosCount,
            joinedAt: user.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
            ...user.toSafeJSON()
        };
    }));

    res.json({
        success: true,
        data: usersWithStats,
    });
});

/**
 * Delete a user and their associated videos
 * DELETE /api/admin/users/:userId
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user?._id.toString() === userId) {
        return res.status(400).json({
            success: false,
            error: 'You cannot delete your own admin account',
        });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found',
        });
    }

    const videos = await Video.find({ userId });
    for (const video of videos) {
        await videoService.deleteVideoWithData(video._id);
    }

    await User.findByIdAndDelete(userId);

    res.json({
        success: true,
        message: 'User and associated videos deleted successfully',
    });
});

/**
 * Reprocess a failed video
 * POST /api/admin/videos/:videoId/reprocess
 */
const reprocessVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json({
            success: false,
            error: 'Video not found',
        });
    }

    // Reset video status
    video.status = 'uploaded';
    await video.save();

    // Reset or create job
    let job = await AnalysisJob.findOne({ videoId });
    if (job) {
        job.status = 'queued';
        job.errorMessage = null;
        job.progress = 0;
        job.startedAt = null;
        job.completedAt = null;
        await job.save();
    } else {
        job = await AnalysisJob.create({
            videoId,
            status: 'queued',
        });
    }

    // Delete old result
    await Result.deleteOne({ videoId });

    res.json({
        success: true,
        message: 'Video queued for reprocessing',
        data: {
            videoId: video._id,
            jobId: job._id,
            status: job.status,
        },
    });
});

/**
 * Get system configuration
 * GET /api/admin/config
 */
const getConfig = asyncHandler(async (req, res) => {
    const env = require('../config/env');

    res.json({
        success: true,
        data: {
            server: {
                port: env.PORT,
                environment: env.NODE_ENV,
            },
            uploads: {
                maxFileSize: env.MAX_FILE_SIZE,
                maxFileSizeMB: Math.round(env.MAX_FILE_SIZE / (1024 * 1024)),
                allowedFormats: env.ALLOWED_EXTENSIONS,
            },
            mlService: {
                url: env.ML_SERVICE_URL,
                timeout: env.ML_SERVICE_TIMEOUT,
            },
        },
    });
});

module.exports = {
    getDashboardStats,
    getAllVideos,
    deleteVideo,
    bulkDeleteVideos,
    reprocessVideo,
    getConfig,
    getUsers,
    deleteUser,
};
