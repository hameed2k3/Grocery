import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await vendorAPI.getOrders({ page, limit: 10 });
            setOrders(response.data.data.orders);
            setTotalPages(response.data.data.pagination.pages);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    if (loading && orders.length === 0) return <LoadingSpinner />;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Store Orders</h2>
                <button
                    onClick={fetchOrders}
                    className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
                    title="Refresh Orders"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Order ID</th>
                            <th className="p-4 font-medium text-gray-500">Date</th>
                            <th className="p-4 font-medium text-gray-500">Customer</th>
                            <th className="p-4 font-medium text-gray-500">Location</th>
                            <th className="p-4 font-medium text-gray-500">Items (Your Store)</th>
                            <th className="p-4 font-medium text-gray-500">Your Earnings</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl text-gray-300">shopping_bag</span>
                                        <p>No orders found for your store yet.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-mono font-medium text-green-600">
                                        #{order.orderNumber}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                        <div className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{order.customer?.name || 'Guest'}</div>
                                        <div className="text-xs text-gray-500">{order.customer?.email}</div>
                                        <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        {order.shippingAddress?.latitude && order.shippingAddress?.longitude ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full w-fit transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">map</span>
                                                View Map
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                                N/A
                                            </span>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={`${order.shippingAddress?.street}, ${order.shippingAddress?.city}`}>
                                            {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 max-w-xs">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-xs border-b border-gray-100 dark:border-gray-700 last:border-0 pb-1 last:pb-0">
                                                    <span className="text-gray-700 dark:text-gray-300 truncate" title={item.name}>{item.name}</span>
                                                    <span className="font-medium whitespace-nowrap ml-2">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                                        ₹{order.vendorTotal?.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize inline-flex items-center gap-1
                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center items-center gap-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page <span className="font-medium text-gray-900 dark:text-white">{page}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default VendorOrders;
