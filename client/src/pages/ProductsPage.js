import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [filters, setFilters] = useState({
        organic: searchParams.get('organic') === 'true',
        inStock: searchParams.get('inStock') === 'true',
    });

    const categories = [
        { name: 'All Products', slug: '' },
        { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
        { name: 'Dairy & Eggs', slug: 'dairy-eggs' },
        { name: 'Bakery', slug: 'bakery' },
        { name: 'Meat & Seafood', slug: 'meat-seafood' },
        { name: 'Pantry', slug: 'pantry' },
        { name: 'Beverages', slug: 'beverages' },
        { name: 'Frozen', slug: 'frozen' },
        { name: 'Snacks', slug: 'snacks' },
    ];

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: searchParams.get('page') || 1,
                limit: 12,
                category: searchParams.get('category') || undefined,
                search: searchParams.get('search') || undefined,
                sortBy: searchParams.get('sortBy') || 'createdAt',
                sortOrder: searchParams.get('sortOrder') || 'desc',
                minPrice: searchParams.get('minPrice') || undefined,
                maxPrice: searchParams.get('maxPrice') || undefined,
                organic: searchParams.get('organic') || undefined,
                inStock: searchParams.get('inStock') || undefined,
                featured: searchParams.get('featured') || undefined,
                bestSeller: searchParams.get('bestSeller') || undefined,
            };

            const response = await productsAPI.getAll(params);
            setProducts(response.data.data.products);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilters = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleCategoryChange = (slug) => {
        setSelectedCategory(slug);
        updateFilters('category', slug);
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortBy(value);
        const [sortField, sortOrder] = value.split('-');
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sortBy', sortField);
        newParams.set('sortOrder', sortOrder);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleFilterChange = (key) => {
        const newValue = !filters[key];
        setFilters({ ...filters, [key]: newValue });
        updateFilters(key, newValue ? 'true' : '');
    };

    const handlePageChange = (page) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page.toString());
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const searchQuery = searchParams.get('search');

    return (
        <div className="fade-in">
            <main className="flex flex-1 px-4 md:px-10 lg:px-20 py-8 gap-8">
                {/* Sidebar Filters */}
                <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-8 sticky top-24 h-fit">
                    {/* Categories */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">Categories</h3>
                        <div className="flex flex-col gap-1">
                            {categories.map((category) => (
                                <button
                                    key={category.slug}
                                    onClick={() => handleCategoryChange(category.slug)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedCategory === category.slug
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <p className="text-sm">{category.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">Preferences</h3>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.organic}
                                    onChange={() => handleFilterChange('organic')}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Organic Only</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.inStock}
                                    onChange={() => handleFilterChange('inStock')}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">In Stock</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-4">
                        <div>
                            <nav className="flex text-xs text-gray-500 mb-2 gap-2">
                                <Link to="/" className="hover:text-primary">Home</Link>
                                <span>/</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {searchQuery ? `Search: "${searchQuery}"` : selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'All Products'}
                                </span>
                            </nav>
                            <h2 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                                {searchQuery ? 'Search Results' : selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'All Products'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">{pagination.totalProducts} products found</p>
                        </div>

                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="bg-white dark:bg-gray-800 border-none text-sm font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-primary rounded-lg py-1 pr-8"
                                >
                                    <option value="createdAt-desc">Newest</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A-Z</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="lg" message="Loading products..." />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-gray-300">inventory_2</span>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">No products found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all"
                            >
                                View All Products
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-12 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>

                                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`flex items-center justify-center h-10 w-10 rounded-lg font-bold ${pagination.currentPage === page
                                                    ? 'bg-primary text-gray-900'
                                                    : 'border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-primary/10 hover:border-primary'
                                                    } transition-all`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProductsPage;
