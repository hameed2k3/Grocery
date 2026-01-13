const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../config/jwt');
const { asyncHandler, ApiError } = require('../middleware');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError('An account with this email already exists', 400);
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
            accessToken,
            refreshToken,
        },
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError('Invalid email or password', 401);
    }

    // Check if account is active
    if (!user.isActive) {
        throw new ApiError('Your account has been deactivated. Please contact support.', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError('Invalid email or password', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
            },
            accessToken,
            refreshToken,
        },
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                addresses: user.addresses,
                memberSince: user.memberSince,
                createdAt: user.createdAt,
            },
        },
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw new ApiError('Refresh token is required', 400);
    }

    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(token);

        // Find user
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== token) {
            throw new ApiError('Invalid refresh token', 401);
        }

        // Generate new tokens
        const tokens = generateTokenPair(user);

        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        });
    } catch (error) {
        throw new ApiError('Invalid or expired refresh token', 401);
    }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    // Clear refresh token
    await User.findByIdAndUpdate(req.user.id, { refreshToken: '' });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, avatar } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updateFields,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
            },
        },
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new ApiError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new tokens
    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        },
    });
});

/**
 * @desc    Add new address
 * @route   POST /api/auth/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    const newAddress = {
        label: req.body.label || 'home',
        fullName: req.body.fullName,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country || 'USA',
        isDefault: req.body.isDefault || user.addresses.length === 0,
    };

    // If new address is default, unset other defaults
    if (newAddress.isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: {
            addresses: user.addresses,
        },
    });
});

/**
 * @desc    Update address
 * @route   PUT /api/auth/addresses/:addressId
 * @access  Private
 */
const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
        throw new ApiError('Address not found', 404);
    }

    // Update address fields
    Object.keys(req.body).forEach(key => {
        if (key !== '_id' && address[key] !== undefined) {
            address[key] = req.body[key];
        }
    });

    // Handle default address
    if (req.body.isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: {
            addresses: user.addresses,
        },
    });
});

/**
 * @desc    Delete address
 * @route   DELETE /api/auth/addresses/:addressId
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
        throw new ApiError('Address not found', 404);
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If deleted address was default, make first address default
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        data: {
            addresses: user.addresses,
        },
    });
});

module.exports = {
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
};
