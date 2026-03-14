import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import VendorOrders from './VendorOrders';

import NotificationCenter from '../../components/Vendor/NotificationCenter';

const VendorDashboard = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // State for Inventory Upload
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // State for Image Upload
    const [zipFile, setZipFile] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, productsRes] = await Promise.all([
                vendorAPI.getStats(),
                vendorAPI.getProducts({ limit: 10 })
            ]);
            setStats(statsRes.data.data);
            setProducts(productsRes.data.data.products);
        } catch (error) {
            console.error('Failed to load dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleZipChange = (e) => {
        setZipFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const loadingToast = toast.loading('Uploading inventory...');

            const response = await vendorAPI.uploadInventory(formData);

            toast.dismiss(loadingToast);
            toast.success(response.data.message);

            // Show stats of upload
            const { updated, failed, errors } = response.data.data;
            if (errors.length > 0) {
                toast.error(`Updated ${updated} items, but ${failed} failed.`);
                console.error('Upload errors:', errors);
            } else {
                toast.success(`Successfully updated ${updated} products!`);
            }

            setFile(null);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!zipFile) return;

        const formData = new FormData();
        formData.append('file', zipFile);

        try {
            setUploadingImages(true);
            const loadingToast = toast.loading('Uploading images...');

            const response = await vendorAPI.uploadImages(formData);

            toast.dismiss(loadingToast);
            toast.success(response.data.message);

            const { updated, failed, errors } = response.data.data;
            if (errors.length > 0) {
                toast.error(`Updated ${updated} images, but ${failed} failed.`);
                console.error('Image upload errors:', errors);
            } else {
                toast.success(`Successfully updated ${updated} product images!`);
            }

            setZipFile(null);
            fetchDashboardData();
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Image upload failed');
        } finally {
            setUploadingImages(false);
        }
    };

    if (loading) return <LoadingSpinner size="lg" />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl">store</span>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white">Vendor Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <span className="text-sm text-gray-600 dark:text-gray-300 border-l pl-4 border-gray-200 dark:border-gray-700">
                            {user?.name}
                        </span>
                        <button onClick={logout} className="text-sm text-red-500 font-medium hover:text-red-700">Logout</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm text-gray-500 font-medium">Total Products</h3>
                                <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">{stats.totalProducts || 0}</p>
                            </div>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm text-gray-500 font-medium">Low Stock Items</h3>
                                <p className="text-3xl font-black text-yellow-500 mt-2">{stats.lowStockProducts || 0}</p>
                            </div>
                            <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                <span className="material-symbols-outlined">warning</span>
                            </span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm text-gray-500 font-medium">Out of Stock</h3>
                                <p className="text-3xl font-black text-red-500 mt-2">{stats.outOfStockProducts || 0}</p>
                            </div>
                            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <span className="material-symbols-outlined">error</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'overview'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview & Uploads
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'orders'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders Management
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' ? (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Bulk Upload Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inventory Excel Upload */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                        <span className="material-symbols-outlined text-3xl">table_view</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Update Stock & Price</h2>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Upload Excel/CSV. Columns: <code>SKU</code>, <code>Stock</code>, <code>Price</code>.
                                        </p>

                                        <form onSubmit={handleUpload} className="flex gap-2 items-center flex-col sm:flex-row">
                                            <input
                                                type="file"
                                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                onChange={handleFileChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!file || uploading}
                                                className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50 text-sm whitespace-nowrap transition-colors"
                                            >
                                                {uploading ? '...' : 'Upload Data'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Image Zip Upload */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                        <span className="material-symbols-outlined text-3xl">folder_zip</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Bulk Image Upload</h2>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Upload <strong>ZIP file</strong> containing images named by SKU.
                                        </p>

                                        <form onSubmit={handleImageUpload} className="flex gap-2 items-center flex-col sm:flex-row">
                                            <input
                                                type="file"
                                                accept=".zip, application/zip, application/x-zip-compressed"
                                                onChange={handleZipChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!zipFile || uploadingImages}
                                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 text-sm whitespace-nowrap transition-colors"
                                            >
                                                {uploadingImages ? '...' : 'Upload Images'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Preview */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Inventory Preview</h2>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">Last 10 items</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="p-4 font-medium text-gray-500">Image</th>
                                            <th className="p-4 font-medium text-gray-500">Product</th>
                                            <th className="p-4 font-medium text-gray-500">SKU</th>
                                            <th className="p-4 font-medium text-gray-500">Price</th>
                                            <th className="p-4 font-medium text-gray-500">Stock</th>
                                            <th className="p-4 font-medium text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {products.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                                        {product.images?.[0]?.url ? (
                                                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-gray-300">image</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                                <td className="p-4 text-gray-500 font-mono">{product.sku}</td>
                                                <td className="p-4 font-bold">₹{product.price}</td>
                                                <td className="p-4 font-medium">{product.stock}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                        <VendorOrders />
                    </div>
                )}

            </main>
        </div>
    );
};

export default VendorDashboard;
