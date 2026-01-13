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

module.exports = router;
