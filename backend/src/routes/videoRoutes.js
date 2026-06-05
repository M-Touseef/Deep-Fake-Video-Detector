const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const videoController = require('../controllers/videoController');
const { uploadMiddleware } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { handleValidation, validateVideoId } = require('../middleware/validate');

/**
 * @route   POST /api/video/upload
 * @desc    Upload a new video
 * @access  Authenticated
 */
router.post(
    '/upload',
    requireAuth,
    uploadMiddleware('video'),
    [
        body('verificationMode')
            .optional({ checkFalsy: true })
            .equals('news-video')
            .withMessage('Verification mode must be news-video'),
        body('sourceUrl')
            .if(body('verificationMode').equals('news-video'))
            .trim()
            .isLength({ min: 1, max: 500 })
            .withMessage('Source URL is required and must be 500 characters or less')
            .bail()
            .custom((value) => {
                let parsed;
                try {
                    parsed = new URL(value);
                } catch (error) {
                    throw new Error('Source URL must be a valid URL');
                }

                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    throw new Error('Source URL must start with http or https');
                }
                return true;
            }),
        body('claim')
            .if(body('verificationMode').equals('news-video'))
            .trim()
            .isLength({ min: 10, max: 280 })
            .withMessage('Claim/headline must be 10-280 characters'),
        handleValidation,
    ],
    videoController.uploadVideo
);

/**
 * @route   GET /api/video
 * @desc    Get all videos with pagination
 * @access  Authenticated
 */
router.get('/', requireAuth, videoController.getVideos);

/**
 * @route   GET /api/video/:id
 * @desc    Get video by ID
 * @access  Authenticated
 */
router.get(
    '/:id',
    requireAuth,
    [
        param('id').custom(validateVideoId),
        handleValidation,
    ],
    videoController.getVideo
);

/**
 * @route   DELETE /api/video/:id
 * @desc    Delete a video owned by the current user
 * @access  Authenticated
 */
router.delete(
    '/:id',
    requireAuth,
    [
        param('id').custom(validateVideoId),
        handleValidation,
    ],
    videoController.deleteVideo
);

module.exports = router;
