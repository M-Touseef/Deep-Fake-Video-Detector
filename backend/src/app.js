const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const env = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const videoRoutes = require('./routes/videoRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const resultRoutes = require('./routes/resultRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const app = express();

// Ensure directories exist
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};
ensureDir(env.UPLOAD_DIR);
ensureDir(env.HEATMAP_DIR);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads and heatmaps)
app.use('/uploads', express.static(env.UPLOAD_DIR));
app.use('/heatmaps', express.static(env.HEATMAP_DIR));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Proof of Reality API is running',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// API routes
app.use('/api/video', videoRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Proof of Reality - Video Deepfake Detection API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            video: {
                upload: 'POST /api/video/upload',
                list: 'GET /api/video',
                get: 'GET /api/video/:id',
            },
            analysis: {
                start: 'POST /api/analysis/start/:videoId',
                status: 'GET /api/analysis/status/:videoId',
            },
            results: {
                get: 'GET /api/results/:videoId',
            },
            admin: {
                stats: 'GET /api/admin/stats',
                config: 'GET /api/admin/config',
                videos: 'GET /api/admin/videos',
                deleteVideo: 'DELETE /api/admin/videos/:videoId',
                bulkDelete: 'POST /api/admin/videos/bulk-delete',
                reprocess: 'POST /api/admin/videos/:videoId/reprocess',
            },
        },
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
