const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required'],
    },
    passwordSalt: {
        type: String,
        required: [true, 'Password salt is required'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.methods.setPassword = function (password) {
    this.passwordSalt = crypto.randomBytes(16).toString('hex');
    this.passwordHash = crypto
        .pbkdf2Sync(password, this.passwordSalt, 120000, 64, 'sha512')
        .toString('hex');
};

userSchema.methods.verifyPassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.passwordSalt, 120000, 64, 'sha512')
        .toString('hex');

    return crypto.timingSafeEqual(
        Buffer.from(this.passwordHash, 'hex'),
        Buffer.from(hash, 'hex')
    );
};

userSchema.methods.toSafeJSON = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model('User', userSchema);
