const env = require('../config/env');
const videoService = require('./videoService');

let cleanupTimer = null;
let cleanupRunning = false;

const runCleanup = async () => {
    if (cleanupRunning) {
        return 0;
    }

    cleanupRunning = true;
    try {
        const retentionMs = env.VIDEO_RETENTION_HOURS * 60 * 60 * 1000;
        const cutoff = new Date(Date.now() - retentionMs);
        const deleted = await videoService.cleanupExpiredVideos(cutoff);

        if (deleted > 0) {
            console.log(`[CLEANUP] Deleted ${deleted} expired video(s) older than ${env.VIDEO_RETENTION_HOURS}h`);
        }

        return deleted;
    } catch (error) {
        console.error('[CLEANUP] Failed:', error.message);
        return 0;
    } finally {
        cleanupRunning = false;
    }
};

const startCleanupScheduler = () => {
    if (cleanupTimer) {
        return cleanupTimer;
    }

    const intervalMs = env.CLEANUP_INTERVAL_MINUTES * 60 * 1000;
    cleanupTimer = setInterval(runCleanup, intervalMs);
    cleanupTimer.unref?.();
    runCleanup();

    console.log(`[CLEANUP] Scheduler active: every ${env.CLEANUP_INTERVAL_MINUTES} min, retention ${env.VIDEO_RETENTION_HOURS}h`);
    return cleanupTimer;
};

module.exports = {
    runCleanup,
    startCleanupScheduler,
};
