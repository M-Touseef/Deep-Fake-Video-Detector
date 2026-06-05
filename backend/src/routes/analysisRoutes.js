const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const analysisController = require('../controllers/analysisController');
const { requireAuth } = require('../middleware/auth');
const { handleValidation, validateVideoId } = require('../middleware/validate');

router.use(requireAuth);

/**
 * @route   POST /api/analysis/start/:videoId
 * @desc    Start analysis for a video
 * @access  Authenticated owner/admin
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
 * @access  Authenticated owner/admin
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
