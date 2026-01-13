const mongoose = require('mongoose');

/**
 * Cart Schema for user shopping carts
 */
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    priceAtAdd: {
        type: Number,
        required: true,
    },
}, { _id: true, timestamps: true });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
    couponCode: {
        type: String,
        default: null,
    },
    couponDiscount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Note: user index is auto-created by unique:true

/**
 * Virtual: Calculate subtotal
 */
cartSchema.virtual('subtotal').get(function () {
    return this.items.reduce((total, item) => {
        return total + (item.priceAtAdd * item.quantity);
    }, 0);
});

/**
 * Virtual: Calculate total items count
 */
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((count, item) => count + item.quantity, 0);
});

/**
 * Virtual: Calculate estimated total
 */
cartSchema.virtual('estimatedTotal').get(function () {
    const subtotal = this.subtotal;
    const discount = this.couponDiscount || 0;
    return Math.max(0, subtotal - discount);
});

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {number} price - Current product price
 */
cartSchema.methods.addItem = function (productId, quantity, price) {
    const existingItem = this.items.find(
        item => item.product.toString() === productId.toString()
    );

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.priceAtAdd = price; // Update to current price
    } else {
        this.items.push({
            product: productId,
            quantity,
            priceAtAdd: price,
        });
    }
};

/**
 * Update item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
    const item = this.items.find(
        item => item.product.toString() === productId.toString()
    );

    if (item) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            this.items = this.items.filter(
                i => i.product.toString() !== productId.toString()
            );
        } else {
            item.quantity = quantity;
        }
    }
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 */
cartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
    );
};

/**
 * Clear all items from cart
 */
cartSchema.methods.clearCart = function () {
    this.items = [];
    this.couponCode = null;
    this.couponDiscount = 0;
};

/**
 * Apply coupon to cart
 * @param {string} code - Coupon code
 * @param {number} discount - Discount amount
 */
cartSchema.methods.applyCoupon = function (code, discount) {
    this.couponCode = code;
    this.couponDiscount = discount;
};

/**
 * Remove coupon from cart
 */
cartSchema.methods.removeCoupon = function () {
    this.couponCode = null;
    this.couponDiscount = 0;
};

/**
 * Static: Find or create cart for user
 * @param {string} userId - User ID
 */
cartSchema.statics.findOrCreateCart = async function (userId) {
    let cart = await this.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price images stock discount unit',
    });

    if (!cart) {
        cart = await this.create({ user: userId, items: [] });
    }

    return cart;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
