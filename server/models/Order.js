const mongoose = require('mongoose');

/**
 * Order Schema for tracking customer orders
 */
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    image: {
        type: String,
        default: '',
    },
}, { _id: true });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'USA' },
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'cod', 'wallet'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentDetails: {
        transactionId: { type: String, default: '' },
        paidAt: { type: Date, default: null },
    },
    subtotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    couponCode: {
        type: String,
        default: '',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending',
    },
    statusHistory: [{
        status: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        note: {
            type: String,
            default: '',
        },
    }],
    estimatedDelivery: {
        type: Date,
        default: null,
    },
    actualDelivery: {
        type: Date,
        default: null,
    },
    deliverySlot: {
        date: { type: Date, default: null },
        timeSlot: { type: String, default: '' },
    },
    notes: {
        type: String,
        default: '',
    },
    deliveryProof: {
        image: { type: String, default: '' },
        signature: { type: String, default: '' },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Indexes (orderNumber index auto-created by unique:true)
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

/**
 * Generate unique order number before saving
 */
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `FC-${year}${month}${random}`;

        // Add initial status to history
        this.statusHistory.push({
            status: 'pending',
            timestamp: new Date(),
            note: 'Order placed',
        });
    }
    next();
});

/**
 * Virtual: Total items count
 */
orderSchema.virtual('totalItems').get(function () {
    return this.items.reduce((count, item) => count + item.quantity, 0);
});

/**
 * Virtual: Calculate delivery progress percentage
 */
orderSchema.virtual('deliveryProgress').get(function () {
    const progressMap = {
        'pending': 10,
        'confirmed': 25,
        'processing': 40,
        'shipped': 60,
        'out-for-delivery': 85,
        'delivered': 100,
        'cancelled': 0,
    };
    return progressMap[this.orderStatus] || 0;
});

/**
 * Update order status with history tracking
 * @param {string} newStatus - New status
 * @param {string} note - Optional note
 */
orderSchema.methods.updateStatus = function (newStatus, note = '') {
    this.orderStatus = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note,
    });

    if (newStatus === 'delivered') {
        this.actualDelivery = new Date();
        if (this.paymentMethod === 'cod') {
            this.paymentStatus = 'paid';
        }
    }
};

/**
 * Cancel order
 * @param {string} reason - Cancellation reason
 */
orderSchema.methods.cancelOrder = async function (reason) {
    if (['delivered', 'cancelled'].includes(this.orderStatus)) {
        throw new Error('Cannot cancel this order');
    }

    this.updateStatus('cancelled', reason);

    // Restore stock for each item
    const Product = mongoose.model('Product');
    for (const item of this.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
        });
    }
};

/**
 * Static: Get orders by user
 */
orderSchema.statics.findByUser = function (userId, options = {}) {
    const { page = 1, limit = 10, status } = options;

    const filter = { user: userId };
    if (status) {
        filter.orderStatus = status;
    }

    return this.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

/**
 * Static: Get order statistics for admin dashboard
 */
orderSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' },
            },
        },
    ]);

    const pendingOrders = await this.countDocuments({ orderStatus: 'pending' });
    const deliveredOrders = await this.countDocuments({ orderStatus: 'delivered' });

    return {
        ...stats[0],
        pendingOrders,
        deliveredOrders,
    };
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
