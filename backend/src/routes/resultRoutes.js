const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const resultController = require('../controllers/resultController');
const { handleValidation, validateVideoId } = require('../middleware/validate');

/**
 * @route   GET /api/results/:videoId
 * @desc    Get analysis results for a video
 * @access  Public
 */
router.get(
    '/:videoId',
    [
        param('videoId').custom(validateVideoId),
        handleValidation,
    ],
    resultController.getResults
);

module.exports = router;
