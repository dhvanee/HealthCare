const User = require('../database/models/User');
const { generateToken } = require('../middleware/auth');
const { sanitize } = require('../utils/validation');

/**
 * User Registration Controller
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
    try {
        const userData = sanitize.object(req.body);

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: userData.email },
                { phone: userData.phone }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === userData.email
                    ? 'User with this email already exists'
                    : 'User with this phone number already exists'
            });
        }

        // Create new user
        const user = new User(userData);
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        // Update last login
        await user.updateLastLogin();

        // Prepare response data
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            }
        });

    } catch (error) {
        console.error('Signup error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

/**
 * User Login Controller
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Update last login
        await user.updateLastLogin();

        // Prepare response data
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

/**
 * Get Current User Profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
    try {
        // User is already attached to req by authentication middleware
        const user = await User.findById(req.user._id)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
};

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = sanitize.object(req.body);

        // Remove fields that shouldn't be updated via this endpoint
        delete updateData.password;
        delete updateData.email;
        delete updateData.role;
        delete updateData.isVerified;
        delete updateData.isActive;

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            { ...updateData, updatedAt: new Date() },
            {
                new: true,
                runValidators: true,
                select: '-password'
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * Change Password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Get user with password
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

/**
 * Logout Controller (for future token blacklisting)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // In a production app, you might want to blacklist the token
        // For now, we'll just return success
        // The client should remove the token from storage

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

/**
 * Refresh Token Controller
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
    try {
        const userId = req.user._id;

        // Generate new token
        const token = generateToken(userId);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token'
        });
    }
};

/**
 * Verify Email (placeholder for future implementation)
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        // This would verify email verification token
        // For now, just return success

        res.json({
            success: true,
            message: 'Email verification feature not yet implemented'
        });

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Email verification failed'
        });
    }
};

/**
 * Request Password Reset (placeholder for future implementation)
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // This would send password reset email
        // For now, just return success

        res.json({
            success: true,
            message: 'Password reset feature not yet implemented'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset request failed'
        });
    }
};

/**
 * Reset Password (placeholder for future implementation)
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // This would reset password using reset token
        // For now, just return success

        res.json({
            success: true,
            message: 'Password reset feature not yet implemented'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed'
        });
    }
};

module.exports = {
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
};
