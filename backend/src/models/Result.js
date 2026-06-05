const mongoose = require('mongoose');

// ── Segment schema (maps from Flask's `segments` array) ──────────────────────
const manipulatedSegmentSchema = new mongoose.Schema({
    label: { type: String, default: '' },         // e.g. "Segment A"
    timeRange: { type: String, default: '' },         // e.g. "0.0s – 2.5s"
    score: { type: Number, default: 0 },          // 0-100 %
    verdict: { type: String, default: '' },         // "HIGH" | "MEDIUM" | "LOW"
    startTime: { type: Number, default: 0 },          // seconds
    endTime: { type: Number, default: 0 },          // seconds
}, { _id: false });

// ── Frame evidence schema (maps from Flask's `top3_frames` array) ─────────────
const frameEvidenceSchema = new mongoose.Schema({
    rank: { type: Number, required: true },  // 1, 2, 3
    timestamp: { type: String, default: '' },     // e.g. "1.0s"
    score: { type: Number, default: 0 },      // 0-100 %
    originalBase64: { type: String, default: null },  // original face crop JPEG
    heatmapBase64: { type: String, default: null },   // base64 JPEG from Grad-CAM
    activationRegion: { type: String, default: '' },
    regionExplanation: { type: String, default: '' },
}, { _id: false });

// ── Main result schema ────────────────────────────────────────────────────────
const resultSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: [true, 'Video ID is required'],
        unique: true,
        index: true,
    },
    // "fake" | "real"  (lowercased from Flask's "Fake"/"Real")
    verdict: {
        type: String,
        enum: ['real', 'fake'],
        required: [true, 'Verdict is required'],
    },
    // Raw model confidence 0-1 (Flask returns 0-100, divided by mlService)
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
    },
    // Top-K adjusted confidence 0-1
    topkConfidence: {
        type: Number,
        default: null,
        min: 0,
        max: 1,
    },
    confidenceLabel: {
        type: String,
        enum: ['High confidence', 'Medium confidence', 'Low confidence'],
        default: 'Low confidence',
    },
    qualityWarnings: {
        type: [String],
        default: [],
    },
    qualitySummary: {
        validFaceFrames: { type: Number, default: null },
        avgFaceDetectionScore: { type: Number, default: null },
        minFaceArea: { type: Number, default: null },
    },
    manipulatedSegments: [manipulatedSegmentSchema],
    frameEvidence: [frameEvidenceSchema],
    modelVersion: {
        type: String,
        default: null,
    },
    processingTime: {
        type: Number,   // milliseconds
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ── Virtual summary ───────────────────────────────────────────────────────────
resultSchema.virtual('summary').get(function () {
    return {
        totalSegments: this.manipulatedSegments.length,
        highRiskSegments: this.manipulatedSegments.filter(s => s.verdict === 'HIGH').length,
        totalFrameEvidence: this.frameEvidence.length,
    };
});

module.exports = mongoose.model('Result', resultSchema);
