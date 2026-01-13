const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, ApiError } = require('../middleware');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOrCreateCart(req.user.id);

    // Populate product details
    await cart.populate({
        path: 'items.product',
        select: 'name price images stock discount unit sku isActive',
    });

    // Filter out inactive products and calculate current prices
    const validItems = cart.items.filter(item => item.product && item.product.isActive);

    const itemsWithDetails = validItems.map(item => {
        const product = item.product;
        const currentPrice = product.discount?.percentage > 0
            ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
            : product.price;

        return {
            _id: item._id,
            product: {
                _id: product._id,
                name: product.name,
                sku: product.sku,
                price: product.price,
                discountedPrice: currentPrice,
                discount: product.discount,
                unit: product.unit,
                stock: product.stock,
                image: product.images?.[0]?.url || '',
                inStock: product.stock > 0,
            },
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd,
            currentPrice,
            subtotal: currentPrice * item.quantity,
        };
    });

    // Calculate totals
    const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = itemsWithDetails.reduce((count, item) => count + item.quantity, 0);
    const discount = cart.couponDiscount || 0;
    const estimatedTotal = Math.max(0, subtotal - discount);

    // Check for free delivery threshold
    const freeDeliveryThreshold = 50;
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 4.99;
    const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

    res.status(200).json({
        success: true,
        data: {
            cart: {
                _id: cart._id,
                items: itemsWithDetails,
                totalItems,
                subtotal: Number(subtotal.toFixed(2)),
                couponCode: cart.couponCode,
                couponDiscount: discount,
                deliveryFee,
                amountToFreeDelivery: Number(amountToFreeDelivery.toFixed(2)),
                estimatedTotal: Number((estimatedTotal + deliveryFee).toFixed(2)),
            },
        },
    });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    // Validate product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    if (!product.isActive) {
        throw new ApiError('Product is no longer available', 400);
    }

    if (product.stock < quantity) {
        throw new ApiError(`Only ${product.stock} items available in stock`, 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Calculate current price with discount
    const currentPrice = product.discount?.percentage > 0
        ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
        : product.price;

    // Check if item already exists in cart
    const existingItem = cart.items.find(
        item => item.product.toString() === productId
    );

    if (existingItem) {
        // Check total quantity doesn't exceed stock
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
            throw new ApiError(`Cannot add more items. Only ${product.stock} available in stock`, 400);
        }
        existingItem.quantity = newQuantity;
        existingItem.priceAtAdd = currentPrice;
    } else {
        cart.items.push({
            product: productId,
            quantity,
            priceAtAdd: currentPrice,
        });
    }

    await cart.save();

    res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: {
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
    });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/update
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        throw new ApiError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new ApiError('Item not found in cart', 404);
    }

    if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
    } else {
        // Validate stock
        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError('Product not found', 404);
        }

        if (quantity > product.stock) {
            throw new ApiError(`Only ${product.stock} items available in stock`, 400);
        }

        cart.items[itemIndex].quantity = quantity;

        // Update price to current
        const currentPrice = product.discount?.percentage > 0
            ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
            : product.price;
        cart.items[itemIndex].priceAtAdd = currentPrice;
    }

    await cart.save();

    res.status(200).json({
        success: true,
        message: quantity <= 0 ? 'Item removed from cart' : 'Cart updated',
        data: {
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
    });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:productId
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        throw new ApiError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new ApiError('Item not found in cart', 404);
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: {
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
    });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
        cart.items = [];
        cart.couponCode = null;
        cart.couponDiscount = 0;
        await cart.save();
    }

    res.status(200).json({
        success: true,
        message: 'Cart cleared',
    });
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/cart/apply-coupon
 * @access  Private
 */
const applyCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
        throw new ApiError('Your cart is empty', 400);
    }

    // Simple coupon validation - in production, you'd have a Coupon model
    const validCoupons = {
        'FRESH20': { type: 'percentage', value: 20, minOrder: 30 },
        'SAVE10': { type: 'fixed', value: 10, minOrder: 50 },
        'FIRST15': { type: 'percentage', value: 15, minOrder: 20 },
    };

    const coupon = validCoupons[code.toUpperCase()];
    if (!coupon) {
        throw new ApiError('Invalid coupon code', 400);
    }

    // Calculate cart subtotal
    await cart.populate({
        path: 'items.product',
        select: 'price discount',
    });

    const subtotal = cart.items.reduce((sum, item) => {
        const price = item.product.discount?.percentage > 0
            ? item.product.price * (1 - item.product.discount.percentage / 100)
            : item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    if (subtotal < coupon.minOrder) {
        throw new ApiError(`Minimum order amount of $${coupon.minOrder} required for this coupon`, 400);
    }

    // Calculate discount
    let discount;
    if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
    } else {
        discount = coupon.value;
    }

    cart.couponCode = code.toUpperCase();
    cart.couponDiscount = Number(discount.toFixed(2));
    await cart.save();

    res.status(200).json({
        success: true,
        message: 'Coupon applied successfully',
        data: {
            couponCode: cart.couponCode,
            discount: cart.couponDiscount,
        },
    });
});

/**
 * @desc    Remove coupon from cart
 * @route   DELETE /api/cart/remove-coupon
 * @access  Private
 */
const removeCoupon = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
        cart.couponCode = null;
        cart.couponDiscount = 0;
        await cart.save();
    }

    res.status(200).json({
        success: true,
        message: 'Coupon removed',
    });
});

/**
 * @desc    Get cart item count
 * @route   GET /api/cart/count
 * @access  Private
 */
const getCartCount = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    const count = cart
        ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;

    res.status(200).json({
        success: true,
        data: {
            count,
        },
    });
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartCount,
};
