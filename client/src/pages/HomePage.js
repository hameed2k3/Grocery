import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const [featuredRes, bestSellersRes] = await Promise.all([
                productsAPI.getFeatured(4),
                productsAPI.getBestSellers(4),
            ]);
            setFeaturedProducts(featuredRes.data.data.products);
            setBestSellers(bestSellersRes.data.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const categories = [
        { name: 'Fruits & Veggies', slug: 'fruits-vegetables', icon: 'nutrition', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300' },
        { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: 'egg_alt', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300' },
        { name: 'Bakery', slug: 'bakery', icon: 'bakery_dining', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' },
        { name: 'Meat & Seafood', slug: 'meat-seafood', icon: 'set_meal', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300' },
        { name: 'Pantry', slug: 'pantry', icon: 'kitchen', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300' },
        { name: 'Beverages', slug: 'beverages', icon: 'local_cafe', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300' },
    ];

    return (
        <div className="fade-in">
            {/* Hero Section */}
            <section className="px-6 lg:px-10 py-10">
                <div className="max-w-[1200px] mx-auto bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div
                            className="w-full lg:w-1/2 bg-center bg-no-repeat aspect-video lg:aspect-square bg-cover"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?w=800")' }}
                        ></div>
                        <div className="flex flex-col gap-6 p-8 lg:p-12 lg:w-1/2">
                            <div className="flex flex-col gap-4">
                                <span className="text-primary font-bold uppercase tracking-widest text-xs">
                                    Fresh & Fast Delivery
                                </span>
                                <h1 className="text-gray-900 dark:text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight">
                                    Fresh Groceries Delivered to Your Doorstep
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                    Shop the finest organic produce and household essentials from the comfort of your home. Quality guaranteed from farm to table.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/products"
                                    className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-primary text-gray-900 text-lg font-bold transition-all hover:shadow-lg hover:shadow-primary/20"
                                >
                                    Shop Now
                                </Link>
                                <Link
                                    to="/products?featured=true"
                                    className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-bold"
                                >
                                    View Deals
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    <div className="size-10 rounded-full border-2 border-white bg-gray-200 bg-cover" style={{ backgroundImage: 'url(https://randomuser.me/api/portraits/women/1.jpg)' }}></div>
                                    <div className="size-10 rounded-full border-2 border-white bg-gray-200 bg-cover" style={{ backgroundImage: 'url(https://randomuser.me/api/portraits/men/2.jpg)' }}></div>
                                    <div className="size-10 rounded-full border-2 border-white bg-gray-200 bg-cover" style={{ backgroundImage: 'url(https://randomuser.me/api/portraits/women/3.jpg)' }}></div>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Joined by 10k+ happy customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="px-6 lg:px-10 py-8">
                <div className="max-w-[1200px] mx-auto">
                    <div className="bg-gradient-to-r from-primary/10 to-green-100 dark:from-primary/5 dark:to-green-900/20 rounded-2xl p-8 border border-primary/20">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                What are you looking for?
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Search from thousands of fresh products
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus-within:border-primary transition-colors overflow-hidden shadow-sm">
                                    <span className="material-symbols-outlined text-gray-400 ml-4">search</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for products, categories, or brands..."
                                        className="flex-1 px-4 py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-primary hover:bg-primary/90 text-gray-900 font-bold rounded-xl transition-all hover:shadow-lg flex items-center gap-2"
                                >
                                    <span className="hidden sm:inline">Search</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </form>

                        {/* Quick Category Filters */}
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            <span className="text-xs text-gray-500 dark:text-gray-400 self-center mr-2">Quick search:</span>
                            {['Organic', 'Fresh Fruits', 'Dairy', 'Bakery', 'Beverages'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        setSearchQuery(term);
                                        navigate(`/products?search=${encodeURIComponent(term)}`);
                                    }}
                                    className="px-4 py-1.5 bg-white dark:bg-gray-800 hover:bg-primary hover:text-gray-900 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-700 transition-all"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="bg-yellow-50 dark:bg-gray-800/20 py-12 px-6 lg:px-10">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-primary">
                            <span className="material-symbols-outlined text-3xl">local_shipping</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Fast 2-Hour Delivery</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Free on orders over $50. Straight to your kitchen.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-primary">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Organic Certified</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Every product is checked for maximum freshness.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-primary">
                            <span className="material-symbols-outlined text-3xl">support_agent</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">24/7 Support</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Our team is here to help you with any issue.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="px-6 lg:px-10 py-12">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex justify-between items-end mb-8 px-4">
                        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Shop by Category</h2>
                        <Link to="/products" className="text-primary font-bold text-sm hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 px-4">
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                to={`/products?category=${category.slug}`}
                                className="group cursor-pointer"
                            >
                                <div
                                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl transition-transform group-hover:-translate-y-2 group-hover:shadow-md border border-gray-100 dark:border-gray-800"
                                    style={{ backgroundImage: `url(${category.image})` }}
                                ></div>
                                <p className="mt-3 text-center font-bold text-sm group-hover:text-primary text-gray-900 dark:text-white">
                                    {category.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="px-6 lg:px-10 py-12 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Best Sellers</h2>
                            <p className="text-gray-500 text-sm mt-1">Our most popular items this week</p>
                        </div>
                        <Link to="/products?bestSeller=true" className="text-primary font-bold text-sm hover:underline">View All</Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner message="Loading products..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {bestSellers.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="px-6 lg:px-10 py-12">
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Featured Products</h2>
                            <p className="text-gray-500 text-sm mt-1">Handpicked just for you</p>
                        </div>
                        <Link to="/products?featured=true" className="text-primary font-bold text-sm hover:underline">View All</Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner message="Loading products..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>


        </div>
    );
};

export default HomePage;
