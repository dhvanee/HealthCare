const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
    try {
        const token = getTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = getTokenFromHeader(req);

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};

/**
 * Role-based Authorization Middleware
 * Requires user to have specific role(s)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

/**
 * Admin Only Middleware
 * Requires user to be an admin
 */
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.'
        });
    }

    next();
};

/**
 * Verified Users Only Middleware
 * Requires user account to be verified
 */
const verifiedOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Account verification required. Please verify your email address.'
        });
    }

    next();
};

/**
 * Resource Owner Middleware
 * Checks if authenticated user owns the requested resource
 */
const resourceOwner = (resourceIdParam = 'id', userIdField = 'user') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            const resourceId = req.params[resourceIdParam];
            const userId = req.user._id.toString();

            // For admin users, allow access to all resources
            if (req.user.role === 'admin') {
                return next();
            }

            // If checking user's own profile
            if (resourceIdParam === 'userId' || resourceIdParam === 'user_id') {
                if (resourceId !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. You can only access your own resources.'
                    });
                }
                return next();
            }

            // For other resources, you might need to query the database
            // This is a simplified version - you might need to customize based on your models
            next();

        } catch (error) {
            console.error('Resource owner check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed.'
            });
        }
    };
};

/**
 * Token Blacklist Middleware (for logout functionality)
 * In a production app, you'd want to maintain a blacklist of revoked tokens
 */
const checkTokenBlacklist = async (req, res, next) => {
    try {
        const token = getTokenFromHeader(req);

        if (token) {
            // Here you would check if token is in blacklist
            // For now, we'll just pass through
            // In production, you might use Redis to store blacklisted tokens
        }

        next();
    } catch (error) {
        console.error('Token blacklist check error:', error);
        next();
    }
};

/**
 * Rate Limiting by User
 * Applies different rate limits based on user role
 */
const userRateLimit = (req, res, next) => {
    // This would integrate with express-rate-limit
    // Different limits for different user types
    if (req.user) {
        if (req.user.role === 'admin') {
            // Admins get higher limits
            req.rateLimitMax = 1000;
        } else {
            // Regular users get standard limits
            req.rateLimitMax = 100;
        }
    } else {
        // Anonymous users get lower limits
        req.rateLimitMax = 50;
    }

    next();
};

/**
 * Helper function to extract token from request headers
 */
const getTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Also check for token in cookies (if you're using cookie-based auth)
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    // Check for token in query parameters (not recommended for production)
    if (req.query.token) {
        return req.query.token;
    }

    return null;
};

/**
 * Generate JWT Token
 */
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRE || '7d') => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Decode JWT Token without verification (useful for expired token info)
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
    adminOnly,
    verifiedOnly,
    resourceOwner,
    checkTokenBlacklist,
    userRateLimit,
    generateToken,
    verifyToken,
    decodeToken,
    getTokenFromHeader
};
