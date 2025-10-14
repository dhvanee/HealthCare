const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { userValidation } = require('../utils/validation');
const {
    signup,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validate(userValidation.register), signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', validate(userValidation.login), login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, validate(userValidation.updateProfile), updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, validate(userValidation.changePassword), changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (for future token blacklisting)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh-token', authenticate, refreshToken);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email address
 * @access  Public
 */
router.post('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

module.exports = router;
