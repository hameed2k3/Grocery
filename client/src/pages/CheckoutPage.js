import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { user } = useAuth();
    const { cart, subtotal, deliveryFee, discount, total, isEmpty, fetchCart } = useCart();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(
        user?.addresses?.find(a => a.isDefault)?._id || user?.addresses?.[0]?._id || null
    );
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
    });

    // Payment methods array removed as we only support COD now

    const handlePlaceOrder = async () => {
        if (!selectedAddress && !showNewAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        const address = showNewAddress
            ? newAddress
            : user?.addresses?.find(a => a._id === selectedAddress);

        if (!address || !address.street || !address.city) {
            toast.error('Please complete your delivery address');
            return;
        }

        try {
            setLoading(true);
            const orderData = {
                shippingAddress: {
                    fullName: address.fullName,
                    phone: address.phone,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zipCode: address.zipCode,
                    country: address.country || 'India',
                },
                paymentMethod,
                notes,
            };

            const response = await ordersAPI.create(orderData);
            toast.success('Order placed successfully!');
            await fetchCart(); // Refresh cart (will be empty)
            navigate(`/orders/${response.data.data.order._id}`, {
                state: { orderSuccess: true }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (isEmpty) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 lg:px-10 py-20 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300">shopping_cart</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Your cart is empty</h2>
                <p className="text-gray-500 mt-2">Add some items to proceed to checkout.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-gray-900 font-bold rounded-lg"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="fade-in max-w-[1280px] mx-auto px-4 lg:px-10 py-8">
            {/* Breadcrumb */}
            <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link to="/cart" className="hover:text-primary">Cart</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Checkout</span>
            </nav>

            <h1 className="text-gray-900 dark:text-white text-3xl font-black mb-8">Secure Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Forms */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Delivery Address */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            Delivery Address
                        </h2>

                        {user?.addresses?.length > 0 && !showNewAddress && (
                            <div className="grid gap-4">
                                {user.addresses.map((address) => (
                                    <label
                                        key={address._id}
                                        className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAddress === address._id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            value={address._id}
                                            checked={selectedAddress === address._id}
                                            onChange={() => setSelectedAddress(address._id)}
                                            className="mt-1 text-primary focus:ring-primary"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900 dark:text-white">{address.fullName}</p>
                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">
                                                    {address.label}
                                                </span>
                                                {address.isDefault && (
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {address.street}, {address.city}, {address.state} {address.zipCode}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowNewAddress(!showNewAddress)}
                            className="mt-4 flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {showNewAddress ? 'close' : 'add'}
                            </span>
                            {showNewAddress ? 'Cancel' : 'Add New Address'}
                        </button>

                        {showNewAddress && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={newAddress.fullName}
                                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                    className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    className="md:col-span-2 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={newAddress.state}
                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                    className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    value={newAddress.zipCode}
                                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                                    className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={newAddress.country}
                                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                    className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                            </div>
                        )}
                    </section>

                    {/* Payment Method - Simplified */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">payments</span>
                            Payment Method
                        </h2>

                        <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5">
                            <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Cash on Delivery</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Pay securely with cash or UPI when your order arrives.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Order Notes */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            Order Notes (Optional)
                        </h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions for delivery..."
                            rows={3}
                            className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        />
                    </section>
                </div>

                {/* Right Column - Order Summary */}
                <aside className="w-full lg:w-[380px]">
                    <div className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                        {/* Items Preview */}
                        <div className="max-h-48 overflow-y-auto mb-6 space-y-3">
                            {cart?.items?.map((item) => (
                                <div key={item._id} className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-lg bg-cover bg-center bg-gray-100"
                                        style={{ backgroundImage: `url(${item.product.image})` }}
                                    ></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} × ₹{item.currentPrice.toFixed(2)}</p>
                                    </div>
                                    <p className="font-bold">₹{item.subtotal.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal ({cart?.totalItems} items)</span>
                                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery Fee</span>
                                <span className={deliveryFee === 0 ? 'text-primary font-medium' : 'font-medium'}>
                                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax (8%)</span>
                                <span className="font-medium">₹{(subtotal * 0.08).toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-primary">
                                    <span>Coupon Discount</span>
                                    <span className="font-medium">-₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                                <span className="text-lg font-black">Total</span>
                                <span className="text-2xl font-black text-primary">
                                    ₹{(total + subtotal * 0.08).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-gray-900 font-black py-4 px-6 rounded-xl mt-6 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">lock</span>
                                    Place Order
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By placing this order, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
