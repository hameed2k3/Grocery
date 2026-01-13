const { body, param, query } = require('express-validator');

/**
 * Validation rules for authentication routes
 */
const authValidation = {
    /**
     * Register user validation
     */
    register: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('phone')
            .optional()
            .trim()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),
    ],

    /**
     * Login validation
     */
    login: [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
    ],

    /**
     * Update profile validation
     */
    updateProfile: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('phone')
            .optional()
            .trim()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),
    ],

    /**
     * Change password validation
     */
    changePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .notEmpty()
            .withMessage('New password is required')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters'),
    ],

    /**
     * Add address validation
     */
    addAddress: [
        body('label')
            .optional()
            .isIn(['home', 'work', 'other'])
            .withMessage('Label must be home, work, or other'),
        body('fullName')
            .trim()
            .notEmpty()
            .withMessage('Full name is required'),
        body('phone')
            .trim()
            .notEmpty()
            .withMessage('Phone is required'),
        body('street')
            .trim()
            .notEmpty()
            .withMessage('Street address is required'),
        body('city')
            .trim()
            .notEmpty()
            .withMessage('City is required'),
        body('state')
            .trim()
            .notEmpty()
            .withMessage('State is required'),
        body('zipCode')
            .trim()
            .notEmpty()
            .withMessage('ZIP code is required'),
        body('country')
            .optional()
            .trim(),
        body('isDefault')
            .optional()
            .isBoolean()
            .withMessage('isDefault must be a boolean'),
    ],
};

module.exports = authValidation;
