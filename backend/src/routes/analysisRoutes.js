const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const analysisController = require('../controllers/analysisController');
const { handleValidation, validateVideoId } = require('../middleware/validate');

/**
 * @route   POST /api/analysis/start/:videoId
 * @desc    Start analysis for a video
 * @access  Public
 */
router.post(
    '/start/:videoId',
    [
        param('videoId').custom(validateVideoId),
        handleValidation,
    ],
    analysisController.startAnalysis
);

/**
 * @route   GET /api/analysis/status/:videoId
 * @desc    Get analysis status for a video
 * @access  Public
 */
router.get(
    '/status/:videoId',
    [
        param('videoId').custom(validateVideoId),
        handleValidation,
    ],
    analysisController.getAnalysisStatus
);

module.exports = router;
