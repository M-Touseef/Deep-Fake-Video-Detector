const express = require('express');
const { param } = require('express-validator');
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
