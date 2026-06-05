const User = require('../models/User');
const authService = require('../services/authService');

const attachUser = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        const decoded = authService.verifyToken(token);

        if (decoded?.sub) {
            const user = await User.findById(decoded.sub);
            if (user) {
                req.user = user;
                req.userId = user._id;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
    }

    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
    }

    next();
};

module.exports = {
    attachUser,
    requireAuth,
    requireAdmin,
};
