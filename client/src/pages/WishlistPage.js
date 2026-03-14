import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api'; // We'll need to fetch full product details
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const WishlistPage = () => {
    const { user, getWishlist } = useAuth();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (user?.wishlist?.length > 0) {
                try {
                    // Assuming getWishlist returns populated products or we fetch them
                    // Based on my auth controller, it populates 'wishlist'
                    const response = await getWishlist();
                    if (response.success) {
                        setWishlistProducts(response.wishlist);
                    }
                } catch (error) {
                    console.error('Failed to fetch wishlist', error);
                }
            } else {
                setWishlistProducts([]);
            }
            setLoading(false);
        };

        if (user) {
            fetchWishlistProducts();
        } else {
            setLoading(false);
        }
    }, [user, getWishlist]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner size="lg" message="Loading your wishlist..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">favorite</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please Login</h2>
                <p className="text-gray-500 mb-6">You need to be logged in to view your wishlist.</p>
                <Link to="/login" className="px-6 py-2 bg-primary text-gray-900 font-bold rounded-lg hover:bg-primary/90">
                    Login Now
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark py-8 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <span className="material-symbols-outlined text-4xl text-primary">favorite</span>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Wishlist</h1>
                </div>

                {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlistProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4">heart_broken</span>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Seems like you haven't saved any products yet. Explore our store and find something you love!
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-gray-900 font-bold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                        >
                            <span className="material-symbols-outlined">storefront</span>
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
