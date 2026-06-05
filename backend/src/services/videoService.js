const Video = require('../models/Video');
const AnalysisJob = require('../models/AnalysisJob');
const Result = require('../models/Result');
const fs = require('fs');
const { extractMetadata } = require('../utils/videoMetadata');

const NEWS_VIDEO_MIN_DURATION_SECONDS = 5;
const NEWS_VIDEO_MAX_DURATION_SECONDS = 120;

const normaliseVerificationContext = (context = {}) => {
    if (context.verificationMode !== 'news-video') {
        return {
            sourceUrl: null,
            sourceHost: null,
            claim: null,
            verificationMode: null,
        };
    }

    const sourceUrl = context.sourceUrl.trim();
    const parsed = new URL(sourceUrl);

    return {
        sourceUrl,
        sourceHost: parsed.hostname.replace(/^www\./i, '').toLowerCase(),
        claim: context.claim.trim(),
        verificationMode: 'news-video',
    };
};

const validateNewsVideoDuration = (metadata) => {
    if (!metadata.duration) {
        const err = new Error('Could not read video duration. Please upload a valid MP4.');
        err.statusCode = 400;
        throw err;
    }

    if (metadata.duration < NEWS_VIDEO_MIN_DURATION_SECONDS) {
        const err = new Error('Video must be at least 5 seconds.');
        err.statusCode = 400;
        throw err;
    }

    if (metadata.duration > NEWS_VIDEO_MAX_DURATION_SECONDS) {
        const err = new Error('Video must be 2 minutes or less.');
        err.statusCode = 400;
        throw err;
    }
};

/**
 * Create a new video record with metadata
 * @param {Object} fileData - Multer file object
 * @param {string} userId - Optional user ID
 * @returns {Promise<Object>} Created video document
 */
const createVideo = async (fileData, userId = null, verificationContext = {}) => {
    // Extract video metadata
    const metadata = await extractMetadata(fileData.path);
    const context = normaliseVerificationContext(verificationContext);

    if (context.verificationMode === 'news-video') {
        try {
            validateNewsVideoDuration(metadata);
        } catch (error) {
            if (fileData.path && fs.existsSync(fileData.path)) {
                fs.unlinkSync(fileData.path);
            }
            throw error;
        }
    }

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
        sourceUrl: context.sourceUrl,
        sourceHost: context.sourceHost,
        claim: context.claim,
        verificationMode: context.verificationMode,
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
 * Delete a video plus its associated job/result records and uploaded file.
 * @param {string} videoId - Video document ID
 * @returns {Promise<Object|null>} Deleted video document
 */
const deleteVideoWithData = async (videoId) => {
    const video = await Video.findById(videoId);
    if (!video) {
        return null;
    }

    if (video.filePath && fs.existsSync(video.filePath)) {
        fs.unlinkSync(video.filePath);
    }

    await AnalysisJob.deleteOne({ videoId });
    await Result.deleteOne({ videoId });
    await Video.findByIdAndDelete(videoId);

    return video;
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
    NEWS_VIDEO_MIN_DURATION_SECONDS,
    NEWS_VIDEO_MAX_DURATION_SECONDS,
    getVideoById,
    updateVideoStatus,
    deleteVideoWithData,
    getVideos,
};
