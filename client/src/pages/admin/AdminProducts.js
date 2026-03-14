import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, vendorAPI } from '../../services/api'; // Added vendorAPI
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category: 'fruits-vegetables',
        price: '',
        unit: 'piece',
        stock: '',
        isFeatured: false,
        isBestSeller: false,
    });

    // Bulk Upload State
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [zipFile, setZipFile] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [showUploads, setShowUploads] = useState(false); // Toggle for upload section

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleZipChange = (e) => setZipFile(e.target.files[0]);

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

            const { updated, failed, errors } = response.data.data;
            if (errors.length > 0) {
                toast.error(`Updated ${updated} items, but ${failed} failed.`);
            } else {
                toast.success(`Successfully updated ${updated} products!`);
            }
            setFile(null);
            fetchProducts();
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
            } else {
                toast.success(`Successfully updated ${updated} product images!`);
            }
            setZipFile(null);
            fetchProducts();
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Image upload failed');
        } finally {
            setUploadingImages(false);
        }
    };

    const fetchProducts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll({ page, limit: 20, search: searchQuery });
            setProducts(response.data.data.products);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(1);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            sku: '',
            description: '',
            category: 'fruits-vegetables',
            price: '',
            unit: 'piece',
            stock: '',
            isFeatured: false,
            isBestSeller: false,
        });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            description: product.description,
            category: product.category,
            price: product.price,
            unit: product.unit,
            stock: product.stock,
            isFeatured: product.isFeatured,
            isBestSeller: product.isBestSeller,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct._id, formData);
                toast.success('Product updated successfully');
            } else {
                await productsAPI.create(formData);
                toast.success('Product created successfully');
            }
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productsAPI.delete(productId);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const categories = [
        { value: 'fruits-vegetables', label: 'Fruits & Vegetables' },
        { value: 'dairy-eggs', label: 'Dairy & Eggs' },
        { value: 'bakery', label: 'Bakery' },
        { value: 'meat-seafood', label: 'Meat & Seafood' },
        { value: 'pantry', label: 'Pantry' },
        { value: 'beverages', label: 'Beverages' },
        { value: 'frozen', label: 'Frozen' },
        { value: 'snacks', label: 'Snacks' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="flex items-center gap-2 text-gray-500 hover:text-primary">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Products</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowUploads(!showUploads)}
                            className={`font-bold py-2 px-4 rounded-lg flex items-center gap-2 border transition-all ${showUploads ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <span className="material-symbols-outlined">upload_file</span>
                            Bulk Tools
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="bg-primary text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Add Product
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto px-6 py-8">

                {/* Bulk Upload Tools */}
                {showUploads && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fadeIn">
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
                )}
                {/* Search & Filters */}
                <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                    <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium">
                        Search
                    </button>
                </form>

                {/* Products Table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" message="Loading products..." />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg bg-cover bg-center bg-gray-100"
                                                    style={{ backgroundImage: `url(${product.images?.[0]?.url || 'https://via.placeholder.com/40'})` }}
                                                ></div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                                    {(product.isFeatured || product.isBestSeller) && (
                                                        <div className="flex gap-1 mt-1">
                                                            {product.isFeatured && (
                                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Featured</span>
                                                            )}
                                                            {product.isBestSeller && (
                                                                <span className="text-[10px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded">Best Seller</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm capitalize">{product.category.replace('-', ' & ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium">₹{product.price.toFixed(2)}</span>
                                            <span className="text-gray-400 text-sm">/{product.unit}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0
                                                ? 'bg-red-100 text-red-600'
                                                : product.stock <= 10
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : 'bg-green-100 text-green-600'
                                                }`}>
                                                {product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-base">inventory_2</span>
                                                    Stock
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    title="Edit Product"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                    title="Delete Product"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {products.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No products found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => fetchProducts(i + 1)}
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
            </main>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU *</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={3}
                                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                    >
                                        <option value="piece">Piece</option>
                                        <option value="lb">Pound</option>
                                        <option value="kg">Kilogram</option>
                                        <option value="pack">Pack</option>
                                        <option value="dozen">Dozen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                        className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Featured</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isBestSeller}
                                        onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Best Seller</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-gray-900 font-bold py-2.5 rounded-lg hover:bg-primary/90"
                                >
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
