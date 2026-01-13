const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartCount,
} = require('../controllers/cart.controller');
const { protect } = require('../middleware');
const { validate, cartValidation } = require('../validations');

// All cart routes require authentication
router.use(protect);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', getCart);

/**
 * @route   GET /api/cart/count
 * @desc    Get cart item count
 * @access  Private
 */
router.get('/count', getCartCount);

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', cartValidation.addItem, validate, addToCart);

/**
 * @route   PUT /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/update', cartValidation.updateItem, validate, updateCartItem);

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/remove/:productId', cartValidation.removeItem, validate, removeFromCart);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/clear', clearCart);

/**
 * @route   POST /api/cart/apply-coupon
 * @desc    Apply coupon to cart
 * @access  Private
 */
router.post('/apply-coupon', cartValidation.applyCoupon, validate, applyCoupon);

/**
 * @route   DELETE /api/cart/remove-coupon
 * @desc    Remove coupon from cart
 * @access  Private
 */
router.delete('/remove-coupon', removeCoupon);

module.exports = router;
