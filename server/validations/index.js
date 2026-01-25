const { validationResult } = require('express-validator');
const authValidation = require('./auth.validation');
const productValidation = require('./product.validation');
const cartValidation = require('./cart.validation');
const orderValidation = require('./order.validation');

/**
 * Middleware to check validation results
 * Use after validation rules
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
        }));

        // Log validation errors for debugging
        console.warn(`[Validation Failed] ${req.originalUrl}:`, JSON.stringify(errorMessages));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages,
        });
    }

    next();
};

module.exports = {
    validate,
    authValidation,
    productValidation,
    cartValidation,
    orderValidation,
};
