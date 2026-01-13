import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        products: {},
        orders: {},
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [productStats, orderStats] = await Promise.all([
                productsAPI.getStats(),
                ordersAPI.getStats(),
            ]);
            setStats({
                products: productStats.data.data,
                orders: orderStats.data.data,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Orders',
            value: stats.orders.totalOrders || 0,
            icon: 'shopping_bag',
            color: 'bg-blue-500',
            change: '+12%',
        },
        {
            title: 'Total Revenue',
            value: `₹${(stats.orders.totalRevenue || 0).toFixed(2)}`,
            icon: 'currency_rupee',
            color: 'bg-green-500',
            change: '+8%',
        },
        {
            title: 'Pending Orders',
            value: stats.orders.pendingOrders || 0,
            icon: 'pending',
            color: 'bg-yellow-500',
            change: null,
        },
        {
            title: 'Total Products',
            value: stats.products.activeProducts || 0,
            icon: 'inventory_2',
            color: 'bg-purple-500',
            change: null,
        },
    ];

    const quickActions = [
        { title: 'Manage Products', icon: 'inventory_2', path: '/admin/products', color: 'bg-blue-50 text-blue-600' },
        { title: 'View Orders', icon: 'receipt_long', path: '/admin/orders', color: 'bg-green-50 text-green-600' },
        { title: 'Low Stock Alerts', icon: 'warning', path: '/admin/products?filter=low-stock', color: 'bg-yellow-50 text-yellow-600' },
        { title: 'Reports', icon: 'analytics', path: '/admin/reports', color: 'bg-purple-50 text-purple-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
            {/* Top Navigation */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-primary">
                            <div className="size-8">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        clipRule="evenodd"
                                        d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-black text-gray-900 dark:text-white">FreshCart</span>
                        </Link>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">Admin</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm text-gray-500 hover:text-primary">
                            View Store
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{user?.name?.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-red-500"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.name}! Here's what's happening today.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" message="Loading dashboard..." />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map((card, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">{card.title}</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{card.value}</p>
                                            {card.change && (
                                                <span className="text-xs text-green-500 font-medium">{card.change} from last month</span>
                                            )}
                                        </div>
                                        <div className={`${card.color} p-3 rounded-xl`}>
                                            <span className="material-symbols-outlined text-white">{card.icon}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={index}
                                        to={action.path}
                                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all text-center"
                                    >
                                        <div className={`w-12 h-12 mx-auto rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                                            <span className="material-symbols-outlined">{action.icon}</span>
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Stock Alerts */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Stock Alerts</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-red-500">error</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Out of Stock</span>
                                        </div>
                                        <span className="font-bold text-red-500">{stats.products.outOfStock || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-yellow-500">warning</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Low Stock</span>
                                        </div>
                                        <span className="font-bold text-yellow-500">{stats.products.lowStock || 0}</span>
                                    </div>
                                </div>
                                <Link to="/admin/products?filter=low-stock" className="text-primary text-sm font-medium mt-4 inline-block hover:underline">
                                    View all alerts →
                                </Link>
                            </div>

                            {/* Order Status */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Status</h2>
                                <div className="space-y-3">
                                    {Object.entries(stats.orders.statusBreakdown || {}).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status.replace('-', ' ')}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/admin/orders" className="text-primary text-sm font-medium mt-4 inline-block hover:underline">
                                    View all orders →
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
