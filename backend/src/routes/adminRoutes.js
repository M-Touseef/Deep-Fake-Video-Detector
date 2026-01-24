const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { handleValidation, validateVideoId } = require('../middleware/validate');

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get('/stats', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/config
 * @desc    Get system configuration
 * @access  Admin
 */
router.get('/config', adminController.getConfig);

/**
 * @route   GET /api/admin/videos
 * @desc    Get all videos with filters
 * @access  Admin
 */
router.get('/videos', adminController.getAllVideos);

/**
 * @route   DELETE /api/admin/videos/:videoId
 * @desc    Delete a video
 * @access  Admin
 */
router.delete(
    '/videos/:videoId',
    [
        param('videoId').custom(validateVideoId),
        handleValidation,
    ],
    adminController.deleteVideo
);

/**
 * @route   POST /api/admin/videos/bulk-delete
 * @desc    Bulk delete videos
 * @access  Admin
 */
router.post(
    '/videos/bulk-delete',
    [
        body('videoIds').isArray().withMessage('videoIds must be an array'),
        handleValidation,
    ],
    adminController.bulkDeleteVideos
);

/**
 * @route   POST /api/admin/videos/:videoId/reprocess
 * @desc    Reprocess a failed video
 * @access  Admin
 */
router.post(
    '/videos/:videoId/reprocess',
    [
        param('videoId').custom(validateVideoId),
        handleValidation,
    ],
    adminController.reprocessVideo
);

module.exports = router;
