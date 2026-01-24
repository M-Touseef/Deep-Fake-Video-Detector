const mongoose = require('mongoose');

const manipulatedSegmentSchema = new mongoose.Schema({
    startFrame: {
        type: Number,
        required: true,
    },
    endFrame: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        default: 'Manipulation detected',
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
    },
}, { _id: false });

const frameEvidenceSchema = new mongoose.Schema({
    frame: {
        type: Number,
        required: true,
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
    },
    heatmapPath: {
        type: String,
        default: null,
    },
    anomalyType: {
        type: String,
        default: null,
    },
}, { _id: false });

const resultSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: [true, 'Video ID is required'],
        unique: true,
        index: true,
    },
    verdict: {
        type: String,
        enum: ['real', 'fake'],
        required: [true, 'Verdict is required'],
    },
    confidence: {
        type: Number,
        required: [true, 'Confidence score is required'],
        min: 0,
        max: 1,
    },
    manipulatedSegments: [manipulatedSegmentSchema],
    frameEvidence: [frameEvidenceSchema],
    modelVersion: {
        type: String,
        default: null,
    },
    processingTime: {
        type: Number, // milliseconds
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Summary statistics virtual
resultSchema.virtual('summary').get(function () {
    return {
        totalManipulatedSegments: this.manipulatedSegments.length,
        totalFrameEvidence: this.frameEvidence.length,
        highConfidenceFrames: this.frameEvidence.filter(f => f.confidence > 0.8).length,
    };
});

module.exports = mongoose.model('Result', resultSchema);
