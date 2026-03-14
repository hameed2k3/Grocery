import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storesAPI, productsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const StorePage = () => {
    const { id } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);

    // Filters for store products
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchStoreDetails();
    }, [id]);

    useEffect(() => {
        if (store) {
            // Debounce search
            const timer = setTimeout(() => {
                fetchStoreProducts();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [store, categoryFilter, searchTerm]);

    const fetchStoreDetails = async () => {
        try {
            setLoading(true);
            const response = await storesAPI.getById(id);
            setStore(response.data.data.store);
        } catch (error) {
            console.error('Failed to fetch store details', error);
            toast.error('Store not found');
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreProducts = async () => {
        try {
            setProductsLoading(true);
            const params = {
                store: id,
                search: searchTerm || undefined,
                category: categoryFilter || undefined,
                limit: 20
            };
            console.log('Fetching store products with params:', params);
            const response = await productsAPI.getAll(params);
            console.log('Store products response:', response.data);
            setProducts(response.data.data.products);
        } catch (error) {
            console.error('Failed to fetch store products', error);
            toast.error('Failed to load products');
        } finally {
            setProductsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is already handled by useEffect with debouncing
    };

    if (loading) return <LoadingSpinner size="lg" />;
    if (!store) return <div className="text-center py-20 text-xl font-bold">Store not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark animate-fadeIn">

            {/* Store Hero / Banner */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-[1280px] mx-auto px-4 lg:px-10 py-8 lg:py-12 flex flex-col md:flex-row gap-8 items-center md:items-start">

                    {/* Store Logo / Placeholder */}
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="material-symbols-outlined text-white text-6xl">storefront</span>
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white capitalize">
                                {store.name}
                            </h1>
                            <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-sm inline-block w-fit mx-auto md:mx-0">
                                Verified Vendor
                            </span>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-6 max-w-2xl">
                            {store.description || 'Welcome to our store! We offer the best quality products just for you.'}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-300">
                            {store.address && (
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                    <span>{store.address.street}, {store.address.city}</span>
                                </div>
                            )}
                            {store.contact && (
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">call</span>
                                    <span>{store.contact.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-yellow-500">star</span>
                                <span>4.8 (120 reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Content */}
            <div className="max-w-[1280px] mx-auto px-4 lg:px-10 py-8">

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder={`Search in ${store.name}...`}
                            className="bg-transparent w-full py-3 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="text-primary font-bold hover:text-primary-dark">Search</button>
                    </form>

                    <select
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="fruits-vegetables">Fruits & Vegetables</option>
                        <option value="dairy-eggs">Dairy & Eggs</option>
                        <option value="bakery">Bakery</option>
                        <option value="meat-seafood">Meat & Seafood</option>
                        <option value="pantry">Pantry</option>
                        <option value="beverages">Beverages</option>
                        <option value="frozen">Frozen</option>
                        <option value="snacks">Snacks</option>
                        <option value="household">Household</option>
                        <option value="personal-care">Personal Care</option>
                    </select>
                </div>

                {/* Product Results */}
                {productsLoading ? (
                    <div className="py-20"><LoadingSpinner /></div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                                Products from this Store
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({products.length} items)</span>
                            </h2>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
                                <p className="text-gray-500 mt-1">Try changing your search or category filter.</p>
                                {(searchTerm || categoryFilter) && (
                                    <button
                                        onClick={() => { setSearchTerm(''); setCategoryFilter(''); }}
                                        className="mt-4 text-primary font-bold hover:underline"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StorePage;
