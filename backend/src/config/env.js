const path = require('path');

const required = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} must be set`);
    }
    return value;
};

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
    // Server
    PORT: process.env.PORT || 3000,
    NODE_ENV: nodeEnv,

    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/proof-of-reality',

    // ML Service — Flask deepfake detector
    // In production set ML_SERVICE_URL to the Azure Container App URL:
    //   https://<app-name>.<region>.azurecontainerapps.io/predict
    ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5000/predict',
    ML_SERVICE_TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT) || 300000, // 5 minutes

    // File Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50 MB (aligned with ML service)
    UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
    HEATMAP_DIR: process.env.HEATMAP_DIR || path.join(__dirname, '../../heatmaps'),
    VIDEO_RETENTION_HOURS: parseInt(process.env.VIDEO_RETENTION_HOURS) || 12,
    CLEANUP_INTERVAL_MINUTES: parseInt(process.env.CLEANUP_INTERVAL_MINUTES) || 60,

    // Allowed video formats (MP4 only — matches Flask /predict)
    ALLOWED_MIMETYPES: ['video/mp4'],
    ALLOWED_EXTENSIONS: ['.mp4'],

    // JWT (optional)
    JWT_SECRET: nodeEnv === 'production'
        ? required('JWT_SECRET')
        : process.env.JWT_SECRET || 'development-only-secret-change-me',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    AUTH_TOKEN_TTL_MS: parseInt(process.env.AUTH_TOKEN_TTL_MS) || 7 * 24 * 60 * 60 * 1000,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@deepfake.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_NAME: process.env.ADMIN_NAME || 'Admin User',
};

module.exports = env;
