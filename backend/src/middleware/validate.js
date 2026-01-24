const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }

    next();
};

/**
 * Validate MongoDB ObjectId format
 */
const isValidObjectId = (value) => {
    return /^[0-9a-fA-F]{24}$/.test(value);
};

/**
 * Custom validator for video ID
 */
const validateVideoId = (value) => {
    if (!isValidObjectId(value)) {
        throw new Error('Invalid video ID format');
    }
    return true;
};

module.exports = {
    handleValidation,
    isValidObjectId,
    validateVideoId,
};
