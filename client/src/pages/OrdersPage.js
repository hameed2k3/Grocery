import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [statusFilter, setStatusFilter] = useState('');

    const fetchOrders = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;

            const response = await ordersAPI.getMyOrders(params);
            setOrders(response.data.data.orders);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

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

    const getStatusIcon = (status) => {
        const icons = {
            'pending': 'schedule',
            'confirmed': 'check_circle',
            'processing': 'inventory',
            'shipped': 'local_shipping',
            'out-for-delivery': 'directions_bike',
            'delivered': 'done_all',
            'cancelled': 'cancel',
        };
        return icons[status] || 'info';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="fade-in max-w-[1200px] mx-auto px-4 lg:px-10 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <nav className="flex text-sm text-gray-500 mb-2 gap-2">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white">My Orders</span>
                    </nav>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black">My Orders</h1>
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-4 text-sm font-medium"
                >
                    <option value="">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" message="Loading orders..." />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-gray-300">inventory_2</span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">No orders found</h2>
                    <p className="text-gray-500 mt-2">
                        {statusFilter ? 'No orders match this filter.' : "You haven't placed any orders yet."}
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-gray-900 font-bold rounded-lg"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            to={`/orders/${order._id}`}
                            className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                        >
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                                    <p className="text-xs text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                                    <span className="material-symbols-outlined text-sm">{getStatusIcon(order.orderStatus)}</span>
                                    <span className="capitalize">{order.orderStatus.replace('-', ' ')}</span>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex -space-x-3">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <div
                                            key={index}
                                            className="w-12 h-12 rounded-lg bg-cover bg-center bg-gray-100 border-2 border-white dark:border-gray-800"
                                            style={{ backgroundImage: `url(${item.image || 'https://via.placeholder.com/48'})` }}
                                        ></div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-sm font-bold">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {order.totalItems} item{order.totalItems > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    ₹{order.totalAmount.toFixed(2)}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            {order.orderStatus !== 'cancelled' && (
                                <div className="relative">
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${order.deliveryProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>Ordered</span>
                                        <span>Processing</span>
                                        <span>Shipped</span>
                                        <span>Delivered</span>
                                    </div>
                                </div>
                            )}

                            {/* Estimated Delivery */}
                            {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && order.estimatedDelivery && (
                                <p className="text-sm text-gray-500 mt-4">
                                    <span className="material-symbols-outlined text-sm align-middle mr-1">schedule</span>
                                    Expected by {formatDate(order.estimatedDelivery)}
                                </p>
                            )}
                        </Link>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => fetchOrders(i + 1)}
                                    className={`w-10 h-10 rounded-lg font-bold ${pagination.currentPage === i + 1
                                        ? 'bg-primary text-gray-900'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
