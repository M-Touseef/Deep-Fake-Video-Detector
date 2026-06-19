const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');

const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

const analysisQueue = new Queue('analysis', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: {
            age: 24 * 60 * 60,
            count: 100,
        },
        removeOnFail: {
            age: 24 * 60 * 60,
            count: 100,
        },
    },
});

const enqueueAnalysis = (videoId) => {
    const jobId = videoId.toString();

    return analysisQueue.add(
        'analyze-video',
        { videoId: jobId },
        { jobId }
    );
};

module.exports = {
    analysisQueue,
    connection,
    enqueueAnalysis,
};
