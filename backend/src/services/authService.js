const crypto = require('crypto');
const env = require('../config/env');
const User = require('../models/User');

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const sign = (payload) => crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(payload)
    .digest('base64url');

const createToken = (user) => {
    const payload = encode({
        sub: user._id.toString(),
        role: user.role,
        exp: Date.now() + env.AUTH_TOKEN_TTL_MS,
    });

    return `${payload}.${sign(payload)}`;
};

const verifyToken = (token) => {
    try {
        if (!token || !token.includes('.')) {
            return null;
        }

        const [payload, signature] = token.split('.');
        const expectedSignature = sign(payload);
        if (signature.length !== expectedSignature.length) {
            return null;
        }

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return null;
        }

        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!decoded.exp || decoded.exp < Date.now()) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
};

const ensureDefaultAdmin = async () => {
    if (!env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD must be set in backend/.env before admin login can be used.');
    }

    const email = env.ADMIN_EMAIL.toLowerCase();
    let admin = await User.findOne({ email });

    if (!admin) {
        admin = new User({
            name: env.ADMIN_NAME,
            email,
            role: 'admin',
        });
        admin.setPassword(env.ADMIN_PASSWORD);
        await admin.save();
    } else {
        let shouldSave = false;

        if (admin.role !== 'admin') {
            admin.role = 'admin';
            shouldSave = true;
        }

        if (admin.name !== env.ADMIN_NAME) {
            admin.name = env.ADMIN_NAME;
            shouldSave = true;
        }

        if (!admin.verifyPassword(env.ADMIN_PASSWORD)) {
            admin.setPassword(env.ADMIN_PASSWORD);
            shouldSave = true;
        }

        if (shouldSave) {
            await admin.save();
        }
    }

    return admin;
};

module.exports = {
    createToken,
    verifyToken,
    ensureDefaultAdmin,
};
