const { body, param, query } = require('express-validator');

/**
 * Validation rules for product routes
 */
const productValidation = {
    /**
     * Create product validation
     */
    createProduct: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Product name is required')
            .isLength({ max: 100 })
            .withMessage('Product name cannot exceed 100 characters'),
        body('sku')
            .trim()
            .notEmpty()
            .withMessage('SKU is required')
            .isAlphanumeric('en-US', { ignore: '-' })
            .withMessage('SKU can only contain letters, numbers, and hyphens'),
        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required')
            .isLength({ max: 2000 })
            .withMessage('Description cannot exceed 2000 characters'),
        body('category')
            .trim()
            .notEmpty()
            .withMessage('Category is required')
            .isIn([
                'fruits-vegetables',
                'dairy-eggs',
                'bakery',
                'meat-seafood',
                'pantry',
                'beverages',
                'frozen',
                'snacks',
                'household',
                'personal-care',
            ])
            .withMessage('Invalid category'),
        body('price')
            .notEmpty()
            .withMessage('Price is required')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        body('unit')
            .optional()
            .isIn(['kg', 'lb', 'g', 'oz', 'piece', 'pack', 'liter', 'gallon', 'dozen', 'bunch'])
            .withMessage('Invalid unit'),
        body('stock')
            .notEmpty()
            .withMessage('Stock is required')
            .isInt({ min: 0 })
            .withMessage('Stock must be a non-negative integer'),
        body('discount.percentage')
            .optional()
            .isFloat({ min: 0, max: 100 })
            .withMessage('Discount must be between 0 and 100'),
        body('images')
            .optional()
            .isArray()
            .withMessage('Images must be an array'),
        body('images.*.url')
            .optional()
            .isURL()
            .withMessage('Image URL must be valid'),
        body('attributes.organic')
            .optional()
            .isBoolean(),
        body('attributes.glutenFree')
            .optional()
            .isBoolean(),
        body('attributes.vegan')
            .optional()
            .isBoolean(),
        body('attributes.nonGMO')
            .optional()
            .isBoolean(),
        body('attributes.localFarm')
            .optional()
            .isBoolean(),
    ],

    /**
     * Update product validation
     */
    updateProduct: [
        param('id')
            .isMongoId()
            .withMessage('Invalid product ID'),
        body('name')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Product name cannot exceed 100 characters'),
        body('price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        body('stock')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Stock must be a non-negative integer'),
        body('discount.percentage')
            .optional()
            .isFloat({ min: 0, max: 100 })
            .withMessage('Discount must be between 0 and 100'),
    ],

    /**
     * Get product by ID validation
     */
    getById: [
        param('id')
            .isMongoId()
            .withMessage('Invalid product ID'),
    ],

    /**
     * Get products query validation
     */
    getProducts: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        query('category')
            .optional()
            .isIn([
                'fruits-vegetables',
                'dairy-eggs',
                'bakery',
                'meat-seafood',
                'pantry',
                'beverages',
                'frozen',
                'snacks',
                'household',
                'personal-care',
            ])
            .withMessage('Invalid category'),
        query('minPrice')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Minimum price must be a positive number'),
        query('maxPrice')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Maximum price must be a positive number'),
    ],
};

module.exports = productValidation;
