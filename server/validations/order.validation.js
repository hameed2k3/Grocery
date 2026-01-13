const { body, param, query } = require('express-validator');

/**
 * Validation rules for order routes
 */
const orderValidation = {
    /**
     * Create order validation
     */
    createOrder: [
        body('shippingAddress.fullName')
            .trim()
            .notEmpty()
            .withMessage('Full name is required'),
        body('shippingAddress.phone')
            .trim()
            .notEmpty()
            .withMessage('Phone is required'),
        body('shippingAddress.street')
            .trim()
            .notEmpty()
            .withMessage('Street address is required'),
        body('shippingAddress.city')
            .trim()
            .notEmpty()
            .withMessage('City is required'),
        body('shippingAddress.state')
            .trim()
            .notEmpty()
            .withMessage('State is required'),
        body('shippingAddress.zipCode')
            .trim()
            .notEmpty()
            .withMessage('ZIP code is required'),
        body('paymentMethod')
            .notEmpty()
            .withMessage('Payment method is required')
            .isIn(['card', 'upi', 'cod', 'wallet'])
            .withMessage('Invalid payment method'),
        body('deliverySlot.date')
            .optional()
            .isISO8601()
            .withMessage('Invalid delivery date'),
        body('deliverySlot.timeSlot')
            .optional()
            .trim(),
        body('notes')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Notes cannot exceed 500 characters'),
    ],

    /**
     * Get order by ID validation
     */
    getById: [
        param('id')
            .isMongoId()
            .withMessage('Invalid order ID'),
    ],

    /**
     * Update order status validation (Admin)
     */
    updateStatus: [
        param('id')
            .isMongoId()
            .withMessage('Invalid order ID'),
        body('status')
            .notEmpty()
            .withMessage('Status is required')
            .isIn(['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'])
            .withMessage('Invalid order status'),
        body('note')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage('Note cannot exceed 200 characters'),
    ],

    /**
     * Cancel order validation
     */
    cancelOrder: [
        param('id')
            .isMongoId()
            .withMessage('Invalid order ID'),
        body('reason')
            .optional()
            .trim()
            .isLength({ max: 300 })
            .withMessage('Reason cannot exceed 300 characters'),
    ],

    /**
     * Get orders query validation
     */
    getOrders: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('Limit must be between 1 and 50'),
        query('status')
            .optional()
            .isIn(['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'])
            .withMessage('Invalid order status'),
    ],
};

module.exports = orderValidation;
