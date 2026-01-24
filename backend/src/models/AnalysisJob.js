const mongoose = require('mongoose');

const analysisJobSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: [true, 'Video ID is required'],
        index: true,
    },
    status: {
        type: String,
        enum: ['queued', 'running', 'done', 'failed'],
        default: 'queued',
    },
    progress: {
        type: Number, // 0-100 percentage
        default: 0,
    },
    errorMessage: {
        type: String,
        default: null,
    },
    startedAt: {
        type: Date,
        default: null,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient status queries
analysisJobSchema.index({ status: 1 });
analysisJobSchema.index({ createdAt: -1 });

// Virtual for duration calculation
analysisJobSchema.virtual('duration').get(function () {
    if (this.startedAt && this.completedAt) {
        return this.completedAt - this.startedAt;
    }
    return null;
});

module.exports = mongoose.model('AnalysisJob', analysisJobSchema);
