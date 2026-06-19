require('dotenv').config();

const { Worker } = require('bullmq');
const connectDB = require('../config/db');
const env = require('../config/env');
const { connection } = require('../queues/analysisQueue');
const Video = require('../models/Video');
const jobService = require('../services/jobService');
const mlService = require('../services/mlService');

const processAnalysisJob = async (queueJob) => {
    const { videoId } = queueJob.data;
    let progressTimer = null;

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new Error('Video not found');
        }

        await jobService.startJob(videoId);
        await jobService.updateJobProgress(videoId, 20);
        await queueJob.updateProgress(20);

        console.log(`[ML] Calling ML service for video: ${videoId}`);

        const startedAt = Date.now();
        progressTimer = setInterval(async () => {
            try {
                const elapsedSeconds = (Date.now() - startedAt) / 1000;
                const estimatedProgress = 25 + Math.min(60, elapsedSeconds * 2);
                await jobService.updateJobProgress(videoId, estimatedProgress);
                await queueJob.updateProgress(Math.round(estimatedProgress));
            } catch (progressError) {
                console.warn(`[WARN] Failed to update progress for video ${videoId}:`, progressError.message);
            }
        }, 5000);

        const mlResult = await mlService.analyzeVideo(video);

        clearInterval(progressTimer);
        progressTimer = null;

        await jobService.updateJobProgress(videoId, 88);
        await queueJob.updateProgress(88);

        await mlService.saveResult(videoId, mlResult);

        await jobService.updateJobProgress(videoId, 95);
        await queueJob.updateProgress(95);

        await jobService.completeJob(videoId);
        await queueJob.updateProgress(100);

        console.log(`[SUCCESS] Analysis complete for video: ${videoId}`);

        return {
            videoId,
            status: 'done',
        };
    } catch (error) {
        if (progressTimer) {
            clearInterval(progressTimer);
        }

        console.error(`[ERROR] Analysis failed for video ${videoId}:`, error.message);

        const maxAttempts = queueJob.opts.attempts || 1;
        const isFinalAttempt = queueJob.attemptsMade + 1 >= maxAttempts;
        if (isFinalAttempt) {
            await jobService.failJob(videoId, error.message);
        } else {
            const analysisJob = await jobService.getJobByVideoId(videoId);
            if (analysisJob) {
                await jobService.updateJobStatus(analysisJob._id, {
                    status: 'queued',
                    progress: 0,
                    errorMessage: `Retrying after error: ${error.message}`,
                });
            }
        }

        throw error;
    }
};

const startWorker = async () => {
    await connectDB();

    const resetCount = await jobService.resetInterruptedJobs();
    if (resetCount > 0) {
        console.log(`[WORKER] Reset ${resetCount} interrupted job(s) to queued`);
    }

    const worker = new Worker('analysis', processAnalysisJob, {
        connection,
        concurrency: env.ANALYSIS_WORKER_CONCURRENCY,
    });

    worker.on('completed', (job) => {
        console.log(`[WORKER] Job ${job.id} completed`);
    });

    worker.on('failed', (job, error) => {
        console.error(`[WORKER] Job ${job?.id || 'unknown'} failed:`, error.message);
    });

    console.log(`[WORKER] Analysis worker started with concurrency ${env.ANALYSIS_WORKER_CONCURRENCY}`);
};

if (require.main === module) {
    startWorker().catch((error) => {
        console.error('[WORKER] Failed to start:', error.message);
        process.exit(1);
    });
}

module.exports = {
    processAnalysisJob,
    startWorker,
};
