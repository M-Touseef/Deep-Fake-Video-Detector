const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Optional for now (future auth)
    },
    filename: {
        type: String,
        required: [true, 'Filename is required'],
    },
    originalName: {
        type: String,
        required: [true, 'Original filename is required'],
    },
    filePath: {
        type: String,
        required: [true, 'File path is required'],
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required'],
        enum: ['video/mp4', 'video/avi', 'video/x-msvideo'],
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required'],
    },
    duration: {
        type: Number, // in seconds
        default: null,
    },
    fps: {
        type: Number,
        default: null,
    },
    frameCount: {
        type: Number,
        default: null,
    },
    width: {
        type: Number,
        default: null,
    },
    height: {
        type: Number,
        default: null,
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'analyzed', 'failed'],
        default: 'uploaded',
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
videoSchema.index({ status: 1 });
videoSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
