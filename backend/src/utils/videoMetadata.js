const ffmpeg = require('fluent-ffmpeg');

/**
 * Extract metadata from video file
 * @param {string} filePath - Path to video file
 * @returns {Promise<Object>} Video metadata
 */
const extractMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                // If ffprobe fails, return basic metadata
                console.warn('FFprobe error:', err.message);
                return resolve({
                    duration: null,
                    fps: null,
                    frameCount: null,
                    width: null,
                    height: null,
                    codec: null,
                });
            }

            try {
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');

                if (!videoStream) {
                    return resolve({
                        duration: null,
                        fps: null,
                        frameCount: null,
                        width: null,
                        height: null,
                        codec: null,
                    });
                }

                // Parse frame rate (could be "30/1" or "29.97")
                let fps = null;
                if (videoStream.r_frame_rate) {
                    const parts = videoStream.r_frame_rate.split('/');
                    fps = parts.length === 2
                        ? parseFloat(parts[0]) / parseFloat(parts[1])
                        : parseFloat(parts[0]);
                    fps = Math.round(fps * 100) / 100; // Round to 2 decimals
                }

                const duration = parseFloat(metadata.format.duration) || null;
                const frameCount = videoStream.nb_frames
                    ? parseInt(videoStream.nb_frames)
                    : (duration && fps ? Math.round(duration * fps) : null);

                resolve({
                    duration,
                    fps,
                    frameCount,
                    width: videoStream.width || null,
                    height: videoStream.height || null,
                    codec: videoStream.codec_name || null,
                });
            } catch (parseError) {
                console.warn('Metadata parse error:', parseError.message);
                resolve({
                    duration: null,
                    fps: null,
                    frameCount: null,
                    width: null,
                    height: null,
                    codec: null,
                });
            }
        });
    });
};

module.exports = {
    extractMetadata,
};
