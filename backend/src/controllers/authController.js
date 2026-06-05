const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const authService = require('../services/authService');

const respondWithSession = (res, user) => {
    res.json({
        success: true,
        data: {
            user: user.toSafeJSON(),
            token: authService.createToken(user),
        },
    });
};

const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and password are required',
        });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            error: 'Email already exists',
        });
    }

    const user = new User({
        name,
        email,
        role: 'user',
    });
    user.setPassword(password);
    await user.save();

    res.status(201);
    respondWithSession(res, user);
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required',
        });
    }

    await authService.ensureDefaultAdmin();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.verifyPassword(password)) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials',
        });
    }

    respondWithSession(res, user);
});

const me = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user.toSafeJSON(),
        },
    });
});

module.exports = {
    signup,
    login,
    me,
};
