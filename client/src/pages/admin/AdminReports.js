import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminReports = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await productsAPI.getSalesStats();
                setStats(response.data.data.stats);
            } catch (error) {
                console.error('Failed to fetch sales stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner size="lg" message="Loading report..." />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link to="/admin" className="flex items-center gap-2 text-gray-500 hover:text-primary">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Ordered Products</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Selling Products</h2>
                        <p className="text-sm text-gray-500">Ranked by total quantity sold</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="p-4 font-medium text-gray-500">Rank</th>
                                    <th className="p-4 font-medium text-gray-500">Product Name</th>
                                    <th className="p-4 font-medium text-gray-500">SKU</th>
                                    <th className="p-4 font-medium text-gray-500 text-right">Items Sold</th>
                                    <th className="p-4 font-medium text-gray-500 text-right">Orders Count</th>
                                    <th className="p-4 font-medium text-gray-500 text-right">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {stats.length > 0 ? (
                                    stats.map((item, index) => (
                                        <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4 text-gray-500">#{index + 1}</td>
                                            <td className="p-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                            <td className="p-4 font-mono text-gray-500">{item.sku}</td>
                                            <td className="p-4 text-right font-bold text-primary">{item.totalQuantity}</td>
                                            <td className="p-4 text-right">{item.orderCount}</td>
                                            <td className="p-4 text-right font-medium">₹{item.totalRevenue.toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            No sales data available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminReports;
