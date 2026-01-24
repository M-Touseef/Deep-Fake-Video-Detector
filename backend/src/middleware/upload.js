const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomstring.extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `video-${uniqueSuffix}${ext}`);
    },
});

// File filter for video validation
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Check MIME type
    if (!env.ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${env.ALLOWED_MIMETYPES.join(', ')}`), false);
    }

    // Check extension
    if (!env.ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error(`Invalid file extension. Allowed extensions: ${env.ALLOWED_EXTENSIONS.join(', ')}`), false);
    }

    cb(null, true);
};

// Create multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.MAX_FILE_SIZE,
    },
});

// Middleware wrapper to handle multer errors
const uploadMiddleware = (fieldName) => {
    return (req, res, next) => {
        const uploadSingle = upload.single(fieldName);

        uploadSingle(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        error: `File too large. Maximum size: ${env.MAX_FILE_SIZE / (1024 * 1024)}MB`,
                    });
                }
                return res.status(400).json({
                    success: false,
                    error: err.message,
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message,
                });
            }
            next();
        });
    };
};

module.exports = {
    upload,
    uploadMiddleware,
};
