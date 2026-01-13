import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CartPage = () => {
    const {
        cart,
        loading,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        isEmpty,
        subtotal,
        deliveryFee,
        discount,
        total,
    } = useCart();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        setApplyingCoupon(true);
        await applyCoupon(couponCode);
        setApplyingCoupon(false);
    };

    const handleRemoveCoupon = async () => {
        await removeCoupon();
        setCouponCode('');
    };

    const freeDeliveryThreshold = 500;
    const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

    if (loading && !cart) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" message="Loading cart..." />
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 lg:px-10 py-20 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300">shopping_cart</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Your cart is empty</h2>
                <p className="text-gray-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all"
                >
                    <span className="material-symbols-outlined">shopping_bag</span>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="fade-in max-w-[1280px] mx-auto px-4 lg:px-10 py-8">
            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Link to="/" className="text-gray-500 text-sm font-medium hover:text-primary">Home</Link>
                <span className="text-gray-400 text-sm">/</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium">Shopping Cart</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-gray-900 dark:text-white text-3xl font-black">Your Shopping Cart</h1>
                        <p className="text-gray-500">{cart?.totalItems || 0} items in your basket</p>
                    </div>

                    {/* Free Delivery Progress */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                <p className="text-gray-900 dark:text-white font-semibold">Free Delivery</p>
                            </div>
                            <p className="text-sm font-bold">₹{subtotal.toFixed(2)} / ₹500.00</p>
                        </div>
                        <div className="rounded-full bg-gray-100 dark:bg-gray-700 h-2.5 w-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                            ></div>
                        </div>
                        {amountToFreeDelivery > 0 && (
                            <p className="text-gray-500 text-sm mt-2">
                                Spend <span className="font-bold text-primary">₹{amountToFreeDelivery.toFixed(2)}</span> more for free delivery!
                            </p>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div className="flex flex-col gap-4">
                        {cart?.items?.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md"
                            >
                                {/* Product Image */}
                                <Link to={`/products/${item.product._id}`} className="flex-shrink-0">
                                    <div
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-cover bg-center bg-gray-100"
                                        style={{ backgroundImage: `url(${item.product.image || 'https://via.placeholder.com/100'})` }}
                                    ></div>
                                </Link>

                                {/* Product Info */}
                                <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <Link to={`/products/${item.product._id}`} className="text-gray-900 dark:text-white font-bold hover:text-primary">
                                            {item.product.name}
                                        </Link>
                                        <p className="text-gray-400 text-sm">{item.quantity} × ₹{item.currentPrice.toFixed(2)} / {item.product.unit}</p>
                                        <p className="text-primary font-bold">₹{item.subtotal.toFixed(2)}</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-1.5 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                disabled={loading}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-md shadow-sm hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                disabled={loading || item.quantity >= item.product.stock}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-md shadow-sm hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            disabled={loading}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Clear Cart Button */}
                    <button
                        onClick={clearCart}
                        className="self-start text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">delete_sweep</span>
                        Clear Cart
                    </button>
                </div>

                {/* Order Summary */}
                <aside className="w-full lg:w-[380px]">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg">
                            <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-6">Order Summary</h2>

                            {/* Coupon Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Have a promo code?</label>
                                {cart?.couponCode ? (
                                    <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg">
                                        <div>
                                            <p className="font-bold text-primary">{cart.couponCode}</p>
                                            <p className="text-sm text-gray-500">-₹{discount.toFixed(2)} off</p>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-red-500 hover:underline text-sm">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            className="flex-1 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-primary focus:border-primary"
                                        />
                                        <button
                                            type="submit"
                                            disabled={applyingCoupon || !couponCode.trim()}
                                            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                                        >
                                            {applyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-700 pt-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery Fee</span>
                                    <span className={`font-bold ${deliveryFee === 0 ? 'text-primary' : ''}`}>
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm bg-primary/10 p-2 rounded-lg">
                                        <span className="text-primary font-medium">Coupon Discount</span>
                                        <span className="font-bold text-primary">-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                                    <span className="text-lg font-black">Total</span>
                                    <span className="text-2xl font-black">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-primary hover:bg-primary/90 text-gray-900 font-black py-4 px-6 rounded-xl mt-6 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span>Proceed to Checkout</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>

                            {/* Trust Badges */}
                            <div className="mt-6 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-gray-500 text-xs">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    <span className="uppercase tracking-wider">Secure Payment Guaranteed</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 text-xs">
                                    <span className="material-symbols-outlined text-sm">assignment_return</span>
                                    <span className="uppercase tracking-wider">Easy 30-day Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CartPage;
