const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const videoController = require('../controllers/videoController');
const { uploadMiddleware } = require('../middleware/upload');
const { handleValidation, validateVideoId } = require('../middleware/validate');

/**
 * @route   POST /api/video/upload
 * @desc    Upload a new video
 * @access  Public
 */
router.post(
    '/upload',
    uploadMiddleware('video'),
    videoController.uploadVideo
);

/**
 * @route   GET /api/video
 * @desc    Get all videos with pagination
 * @access  Public
 */
router.get('/', videoController.getVideos);

/**
 * @route   GET /api/video/:id
 * @desc    Get video by ID
 * @access  Public
 */
router.get(
    '/:id',
    [
        param('id').custom(validateVideoId),
        handleValidation,
    ],
    videoController.getVideo
);

module.exports = router;
