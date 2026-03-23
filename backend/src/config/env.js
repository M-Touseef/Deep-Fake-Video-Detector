const path = require('path');

const env = {
    // Server
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

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

    // Allowed video formats (MP4 only — matches Flask /predict)
    ALLOWED_MIMETYPES: ['video/mp4'],
    ALLOWED_EXTENSIONS: ['.mp4'],

    // JWT (optional)
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = env;
