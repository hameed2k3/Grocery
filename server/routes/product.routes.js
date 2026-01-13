const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getBestSellers,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    permanentDeleteProduct,
    getProductStats,
    updateStock,
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware');
const { validate, productValidation } = require('../validations');

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering
 * @access  Public
 */
router.get('/', productValidation.getProducts, validate, getProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', getFeaturedProducts);

/**
 * @route   GET /api/products/best-sellers
 * @desc    Get best seller products
 * @access  Public
 */
router.get('/best-sellers', getBestSellers);

/**
 * @route   GET /api/products/stats
 * @desc    Get product statistics (Admin)
 * @access  Private/Admin
 */
router.get('/stats', protect, authorize('admin'), getProductStats);

/**
 * @route   GET /api/products/category/:category
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:category', getProductsByCategory);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', productValidation.getById, validate, getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post(
    '/',
    protect,
    authorize('admin'),
    productValidation.createProduct,
    validate,
    createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private/Admin
 */
router.put(
    '/:id',
    protect,
    authorize('admin'),
    productValidation.updateProduct,
    validate,
    updateProduct
);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock
 * @access  Private/Admin
 */
router.patch('/:id/stock', protect, authorize('admin'), updateStock);

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft delete a product
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), deleteProduct);

/**
 * @route   DELETE /api/products/:id/permanent
 * @desc    Permanently delete a product
 * @access  Private/Admin
 */
router.delete('/:id/permanent', protect, authorize('admin'), permanentDeleteProduct);

module.exports = router;
