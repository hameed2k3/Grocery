const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    reorder,
    getOrderStats,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware');
const { validate, orderValidation } = require('../validations');

// All order routes require authentication
router.use(protect);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', orderValidation.createOrder, validate, createOrder);

/**
 * @route   GET /api/orders/my
 * @desc    Get current user's orders
 * @access  Private
 */
router.get('/my', orderValidation.getOrders, validate, getMyOrders);

/**
 * @route   GET /api/orders/all
 * @desc    Get all orders (Admin)
 * @access  Private/Admin
 */
router.get('/all', authorize('admin'), orderValidation.getOrders, validate, getAllOrders);

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics (Admin)
 * @access  Private/Admin
 */
router.get('/stats', authorize('admin'), getOrderStats);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', orderValidation.getById, validate, getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin)
 * @access  Private/Admin
 */
router.put(
    '/:id/status',
    authorize('admin'),
    orderValidation.updateStatus,
    validate,
    updateOrderStatus
);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post('/:id/cancel', orderValidation.cancelOrder, validate, cancelOrder);

/**
 * @route   POST /api/orders/:id/reorder
 * @desc    Reorder items from previous order
 * @access  Private
 */
router.post('/:id/reorder', reorder);

module.exports = router;
