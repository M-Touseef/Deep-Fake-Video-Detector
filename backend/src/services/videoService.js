const Video = require('../models/Video');
const AnalysisJob = require('../models/AnalysisJob');
const { extractMetadata } = require('../utils/videoMetadata');

/**
 * Create a new video record with metadata
 * @param {Object} fileData - Multer file object
 * @param {string} userId - Optional user ID
 * @returns {Promise<Object>} Created video document
 */
const createVideo = async (fileData, userId = null) => {
    // Extract video metadata
    const metadata = await extractMetadata(fileData.path);

    const video = new Video({
        userId,
        filename: fileData.filename,
        originalName: fileData.originalname,
        filePath: fileData.path,
        mimeType: fileData.mimetype,
        fileSize: fileData.size,
        duration: metadata.duration,
        fps: metadata.fps,
        frameCount: metadata.frameCount,
        width: metadata.width,
        height: metadata.height,
        status: 'uploaded',
    });

    await video.save();
    return video;
};

/**
 * Get video by ID
 * @param {string} videoId - Video document ID
 * @returns {Promise<Object|null>} Video document
 */
const getVideoById = async (videoId) => {
    return Video.findById(videoId);
};

/**
 * Update video status
 * @param {string} videoId - Video document ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} Updated video document
 */
const updateVideoStatus = async (videoId, status) => {
    return Video.findByIdAndUpdate(
        videoId,
        { status },
        { new: true }
    );
};

/**
 * Get all videos with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated videos
 */
const getVideos = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        status = null,
        userId = null,
    } = options;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const videos = await Video.find(query)
        .sort({ uploadedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Video.countDocuments(query);

    return {
        videos,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

module.exports = {
    createVideo,
    getVideoById,
    updateVideoStatus,
    getVideos,
};
