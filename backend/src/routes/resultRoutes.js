const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const resultController = require('../controllers/resultController');
const { requireAuth } = require('../middleware/auth');
const { handleValidation, validateVideoId } = require('../middleware/validate');

router.use(requireAuth);

/**
 * @route   GET /api/results/:videoId
 * @desc    Get analysis results for a video
 * @access  Authenticated owner/admin
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
