const { body, param } = require('express-validator');

/**
 * Validation rules for cart routes
 */
const cartValidation = {
    /**
     * Add item to cart validation
     */
    addItem: [
        body('productId')
            .notEmpty()
            .withMessage('Product ID is required')
            .isMongoId()
            .withMessage('Invalid product ID'),
        body('quantity')
            .notEmpty()
            .withMessage('Quantity is required')
            .isInt({ min: 1 })
            .withMessage('Quantity must be at least 1'),
    ],

    /**
     * Update cart item validation
     */
    updateItem: [
        body('productId')
            .notEmpty()
            .withMessage('Product ID is required')
            .isMongoId()
            .withMessage('Invalid product ID'),
        body('quantity')
            .notEmpty()
            .withMessage('Quantity is required')
            .isInt({ min: 0 })
            .withMessage('Quantity must be a non-negative integer'),
    ],

    /**
     * Remove item from cart validation
     */
    removeItem: [
        param('productId')
            .isMongoId()
            .withMessage('Invalid product ID'),
    ],

    /**
     * Apply coupon validation
     */
    applyCoupon: [
        body('code')
            .trim()
            .notEmpty()
            .withMessage('Coupon code is required')
            .isLength({ min: 3, max: 20 })
            .withMessage('Coupon code must be between 3 and 20 characters'),
    ],
};

module.exports = cartValidation;
