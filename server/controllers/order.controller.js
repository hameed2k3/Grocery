const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, ApiError } = require('../middleware');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod, deliverySlot, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate({
        path: 'items.product',
        select: 'name sku price stock discount images isActive',
    });

    if (!cart || cart.items.length === 0) {
        throw new ApiError('Your cart is empty', 400);
    }

    // Validate all products and check stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
        const product = item.product;

        if (!product || !product.isActive) {
            throw new ApiError(`Product "${item.product?.name || 'Unknown'}" is no longer available`, 400);
        }

        if (product.stock < item.quantity) {
            throw new ApiError(`Insufficient stock for "${product.name}". Only ${product.stock} available.`, 400);
        }

        // Calculate current price
        const currentPrice = product.discount?.percentage > 0
            ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
            : product.price;

        orderItems.push({
            product: product._id,
            name: product.name,
            sku: product.sku,
            price: currentPrice,
            quantity: item.quantity,
            image: product.images?.[0]?.url || '',
        });

        subtotal += currentPrice * item.quantity;
    }

    // Calculate fees and totals
    const freeDeliveryThreshold = 50;
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 4.99;
    const taxRate = 0.08; // 8% tax
    const tax = Number((subtotal * taxRate).toFixed(2));
    const discount = cart.couponDiscount || 0;
    const totalAmount = Number((subtotal + deliveryFee + tax - discount).toFixed(2));

    // Calculate estimated delivery date (2 days from now by default)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

    // Generate unique order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `FC-${year}${month}${random}`;

    // Create order
    const order = await Order.create({
        orderNumber,
        user: req.user.id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee,
        tax,
        discount,
        couponCode: cart.couponCode || '',
        totalAmount,
        orderStatus: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        estimatedDelivery,
        deliverySlot: deliverySlot || {},
        notes: notes || '',
    });

    // Reduce stock for each product
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
        });
    }

    // Clear the cart
    cart.items = [];
    cart.couponCode = null;
    cart.couponDiscount = 0;
    await cart.save();

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus,
                estimatedDelivery: order.estimatedDelivery,
            },
        },
    });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user.id };
    if (status) {
        filter.orderStatus = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Order.countDocuments(filter),
    ]);

    // Add computed fields
    const ordersWithProgress = orders.map(order => ({
        ...order,
        deliveryProgress: getDeliveryProgress(order.orderStatus),
        totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    res.status(200).json({
        success: true,
        data: {
            orders: ordersWithProgress,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalOrders: total,
            },
        },
    });
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .lean();

    if (!order) {
        throw new ApiError('Order not found', 404);
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized to view this order', 403);
    }

    // Add computed fields
    order.deliveryProgress = getDeliveryProgress(order.orderStatus);
    order.totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
        success: true,
        data: {
            order,
        },
    });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders/all
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (status) {
        filter.orderStatus = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('user', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Order.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: {
            orders,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalOrders: total,
            },
        },
    });
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError('Order not found', 404);
    }

    // Validate status transition
    const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['out-for-delivery', 'cancelled'],
        'out-for-delivery': ['delivered'],
        'delivered': [],
        'cancelled': [],
    };

    if (!validTransitions[order.orderStatus].includes(status)) {
        throw new ApiError(`Cannot change status from '${order.orderStatus}' to '${status}'`, 400);
    }

    // Update status
    order.updateStatus(status, note || `Status updated to ${status}`);

    // Update payment status if marked as paid
    if (status === 'confirmed' && order.paymentMethod !== 'cod') {
        order.paymentStatus = 'paid';
        order.paymentDetails.paidAt = new Date();
    }

    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order status updated',
        data: {
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                statusHistory: order.statusHistory,
            },
        },
    });
});

/**
 * @desc    Cancel order
 * @route   POST /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError('Order not found', 404);
    }

    // Check ownership for non-admin users
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError('Not authorized to cancel this order', 403);
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ['delivered', 'cancelled', 'out-for-delivery'];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
        throw new ApiError(`Cannot cancel order with status '${order.orderStatus}'`, 400);
    }

    // Cancel order and restore stock
    await order.cancelOrder(reason || 'Cancelled by user');
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
            },
        },
    });
});

/**
 * @desc    Reorder - Add all items from previous order to cart
 * @route   POST /api/orders/:id/reorder
 * @access  Private
 */
const reorder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        throw new ApiError('Order not found', 404);
    }

    // Check ownership
    if (order.user.toString() !== req.user.id) {
        throw new ApiError('Not authorized', 403);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Add items to cart
    const unavailableItems = [];
    let addedCount = 0;

    for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product || !product.isActive) {
            unavailableItems.push(item.name);
            continue;
        }

        const availableQty = Math.min(item.quantity, product.stock);
        if (availableQty <= 0) {
            unavailableItems.push(item.name);
            continue;
        }

        // Calculate current price
        const currentPrice = product.discount?.percentage > 0
            ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
            : product.price;

        // Check if already in cart
        const existingItem = cart.items.find(
            ci => ci.product.toString() === product._id.toString()
        );

        if (existingItem) {
            existingItem.quantity = Math.min(existingItem.quantity + availableQty, product.stock);
            existingItem.priceAtAdd = currentPrice;
        } else {
            cart.items.push({
                product: product._id,
                quantity: availableQty,
                priceAtAdd: currentPrice,
            });
        }
        addedCount++;
    }

    await cart.save();

    res.status(200).json({
        success: true,
        message: addedCount > 0
            ? `${addedCount} item(s) added to cart`
            : 'No items could be added',
        data: {
            addedCount,
            unavailableItems,
        },
    });
});

/**
 * @desc    Get order statistics (Admin)
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        totalOrders,
        pendingOrders,
        todayOrders,
        revenueStats,
        statusBreakdown,
        dailyOrders,
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: 'pending' }),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' },
                },
            },
        ]),
        Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                },
            },
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalOrders,
            pendingOrders,
            todayOrders,
            totalRevenue: revenueStats[0]?.totalRevenue || 0,
            avgOrderValue: revenueStats[0]?.avgOrderValue || 0,
            statusBreakdown: statusBreakdown.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            dailyOrders,
        },
    });
});

// Helper function to get delivery progress
function getDeliveryProgress(status) {
    const progressMap = {
        'pending': 10,
        'confirmed': 25,
        'processing': 40,
        'shipped': 60,
        'out-for-delivery': 85,
        'delivered': 100,
        'cancelled': 0,
    };
    return progressMap[status] || 0;
}

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    reorder,
    getOrderStats,
};
