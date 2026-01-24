const AnalysisJob = require('../models/AnalysisJob');
const Video = require('../models/Video');

/**
 * Create a new analysis job for a video
 * @param {string} videoId - Video document ID
 * @returns {Promise<Object>} Created job document
 */
const createJob = async (videoId) => {
    // Check if job already exists for this video
    const existingJob = await AnalysisJob.findOne({ videoId });
    if (existingJob) {
        return existingJob;
    }

    const job = new AnalysisJob({
        videoId,
        status: 'queued',
    });

    await job.save();
    return job;
};

/**
 * Get job by video ID
 * @param {string} videoId - Video document ID
 * @returns {Promise<Object|null>} Job document
 */
const getJobByVideoId = async (videoId) => {
    return AnalysisJob.findOne({ videoId });
};

/**
 * Get job by job ID
 * @param {string} jobId - Job document ID
 * @returns {Promise<Object|null>} Job document
 */
const getJobById = async (jobId) => {
    return AnalysisJob.findById(jobId);
};

/**
 * Update job status
 * @param {string} jobId - Job document ID
 * @param {Object} updates - Status updates
 * @returns {Promise<Object|null>} Updated job document
 */
const updateJobStatus = async (jobId, updates) => {
    const { status, errorMessage, progress } = updates;

    const updateData = { status };

    if (status === 'running' && !updates.startedAt) {
        updateData.startedAt = new Date();
    }

    if (status === 'done' || status === 'failed') {
        updateData.completedAt = new Date();
    }

    if (errorMessage !== undefined) {
        updateData.errorMessage = errorMessage;
    }

    if (progress !== undefined) {
        updateData.progress = progress;
    }

    const job = await AnalysisJob.findByIdAndUpdate(
        jobId,
        updateData,
        { new: true }
    );

    // Also update video status
    if (job && status) {
        let videoStatus;
        switch (status) {
            case 'running':
                videoStatus = 'processing';
                break;
            case 'done':
                videoStatus = 'analyzed';
                break;
            case 'failed':
                videoStatus = 'failed';
                break;
        }
        if (videoStatus) {
            await Video.findByIdAndUpdate(job.videoId, { status: videoStatus });
        }
    }

    return job;
};

/**
 * Start a job (set to running)
 * @param {string} videoId - Video document ID
 * @returns {Promise<Object|null>} Updated job document
 */
const startJob = async (videoId) => {
    const job = await AnalysisJob.findOne({ videoId });
    if (!job) {
        throw new Error('Job not found for this video');
    }

    if (job.status === 'running') {
        throw new Error('Job is already running');
    }

    if (job.status === 'done') {
        throw new Error('Job has already completed');
    }

    return updateJobStatus(job._id, { status: 'running' });
};

/**
 * Mark job as complete
 * @param {string} videoId - Video document ID
 * @returns {Promise<Object|null>} Updated job document
 */
const completeJob = async (videoId) => {
    const job = await AnalysisJob.findOne({ videoId });
    if (!job) {
        throw new Error('Job not found for this video');
    }

    return updateJobStatus(job._id, { status: 'done', progress: 100 });
};

/**
 * Mark job as failed
 * @param {string} videoId - Video document ID
 * @param {string} errorMessage - Error details
 * @returns {Promise<Object|null>} Updated job document
 */
const failJob = async (videoId, errorMessage) => {
    const job = await AnalysisJob.findOne({ videoId });
    if (!job) {
        throw new Error('Job not found for this video');
    }

    return updateJobStatus(job._id, { status: 'failed', errorMessage });
};

module.exports = {
    createJob,
    getJobByVideoId,
    getJobById,
    updateJobStatus,
    startJob,
    completeJob,
    failJob,
};
