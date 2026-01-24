const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    refreshToken,
    logout,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware');
const { validate, authValidation } = require('../validations');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authValidation.register, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authValidation.login, validate, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, authValidation.updateProfile, validate, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put(
    '/change-password',
    protect,
    authValidation.changePassword,
    validate,
    changePassword
);

/**
 * @route   POST /api/auth/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post('/addresses', protect, authValidation.addAddress, validate, addAddress);

/**
 * @route   PUT /api/auth/addresses/:addressId
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:addressId', protect, updateAddress);

/**
 * @route   DELETE /api/auth/addresses/:addressId
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:addressId', protect, deleteAddress);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
const passport = require('passport');
const { generateTokenPair } = require('../config/jwt');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth Callback
 * @access  Public
 */
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        const { accessToken, refreshToken } = generateTokenPair(req.user);

        // Redirect to client with token
        // In a real app, strict cookie or postMessage is safer, but query param works for simple MVP
        // redirecting to a dedicated "auth-success" page on frontend to extract token
        const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/login?token=${accessToken}&refresh=${refreshToken}`;
        res.redirect(redirectUrl);
    }
);

module.exports = router;
