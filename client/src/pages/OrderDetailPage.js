import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getById(id);
            setOrder(response.data.data.order);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    useEffect(() => {
        if (location.state?.orderSuccess) {
            toast.success('Your order has been placed successfully!');
        }
    }, [location.state?.orderSuccess]);

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            setCancelling(true);
            await ordersAPI.cancel(id, 'Cancelled by customer');
            toast.success('Order cancelled successfully');
            fetchOrder();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleReorder = async () => {
        try {
            const response = await ordersAPI.reorder(id);
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reorder');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'confirmed': 'bg-blue-100 text-blue-700',
            'processing': 'bg-purple-100 text-purple-700',
            'shipped': 'bg-indigo-100 text-indigo-700',
            'out-for-delivery': 'bg-cyan-100 text-cyan-700',
            'delivered': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" message="Loading order..." />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-gray-300">error</span>
                <h2 className="text-xl font-bold mt-4">Order Not Found</h2>
                <Link to="/orders" className="text-primary font-bold mt-4 inline-block">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const canCancel = !['delivered', 'cancelled', 'out-for-delivery'].includes(order.orderStatus);

    return (
        <div className="fade-in max-w-[1200px] mx-auto px-4 lg:px-10 py-8">
            {/* Breadcrumb */}
            <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link to="/orders" className="hover:text-primary">Orders</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">{order.orderNumber}</span>
            </nav>

            {/* Order Success Message */}
            {location.state?.orderSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8 flex items-start gap-4">
                    <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                    <div>
                        <h2 className="text-lg font-bold text-green-800 dark:text-green-200">Order Placed Successfully!</h2>
                        <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                            Thank you for your order. We'll send you updates on your delivery.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Order Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                    Order #{order.orderNumber}
                                </h1>
                                <p className="text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.orderStatus)}`}>
                                <span className="capitalize">{order.orderStatus.replace('-', ' ')}</span>
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        {order.orderStatus !== 'cancelled' && (
                            <div className="mt-8">
                                <div className="relative">
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${order.deliveryProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-3">
                                        {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => (
                                            <div key={step} className="text-center">
                                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${order.deliveryProgress >= (index + 1) * 25
                                                    ? 'bg-primary text-gray-900'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-sm">
                                                        {order.deliveryProgress >= (index + 1) * 25 ? 'check' : 'circle'}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-2 text-gray-500">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Estimated Delivery */}
                        {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && order.estimatedDelivery && (
                            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    <span className="material-symbols-outlined text-primary align-middle mr-2">local_shipping</span>
                                    Estimated Delivery: {formatDate(order.estimatedDelivery)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item._id} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                    <div
                                        className="w-16 h-16 rounded-lg bg-cover bg-center bg-gray-100"
                                        style={{ backgroundImage: `url(${item.image || 'https://via.placeholder.com/64'})` }}
                                    ></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} × ₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        ₹{(item.quantity * item.price).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status History */}
                    {order.statusHistory?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Timeline</h2>
                            <div className="space-y-4">
                                {order.statusHistory.map((entry, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                            {index < order.statusHistory.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                                            )}
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                                                {entry.status.replace('-', ' ')}
                                            </p>
                                            <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                                            {entry.note && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{entry.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="w-full lg:w-[350px] space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Delivery Fee</span>
                                <span className="font-medium">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax</span>
                                <span className="font-medium">₹{order.tax.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-primary">
                                    <span>Discount</span>
                                    <span className="font-medium">-₹{order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                                <span className="font-bold">Total</span>
                                <span className="text-xl font-black text-primary">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-500">
                                Payment: <span className="font-medium capitalize">{order.paymentMethod}</span>
                            </p>
                            <p className={`text-sm mt-1 ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                Status: {order.paymentStatus}
                            </p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
                        <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.fullName}</p>
                        <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.phone}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {canCancel && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="w-full py-3 px-4 border border-red-300 text-red-500 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                        <button
                            onClick={handleReorder}
                            className="w-full py-3 px-4 bg-primary text-gray-900 font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                            Reorder
                        </button>
                        <Link
                            to="/orders"
                            className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to Orders
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default OrderDetailPage;
