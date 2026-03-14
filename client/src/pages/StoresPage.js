import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StoresPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await storesAPI.getAll();
                setStores(response.data.data.stores);
            } catch (error) {
                console.error('Failed to fetch stores', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    if (loading) return <LoadingSpinner size="lg" />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark py-8 transition-colors duration-200">
            <div className="max-w-[1280px] mx-auto px-4 lg:px-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Our Supermarkets</h1>
                    <p className="text-gray-500 text-lg">Browse specific stores and shop from your favorite local vendors.</p>
                </div>

                {/* Stores Grid */}
                {stores.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">storefront</span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Stores Found</h2>
                        <p className="text-gray-500 mt-2">Check back later for new vendors!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map(store => (
                            <Link
                                key={store._id}
                                to={`/stores/${store._id}`}
                                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 overflow-hidden flex flex-col"
                            >
                                {/* Store "Banner" Placeholder - could be an image if we had one */}
                                <div className="h-32 bg-gradient-to-r from-green-400 to-teal-500 relative flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-6xl opacity-50">store</span>
                                    {/* If we had a banner image:
                                     <img src={store.banner} alt={store.name} className="w-full h-full object-cover" /> 
                                     */}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                            {store.name}
                                        </h2>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                            Open
                                        </span>
                                    </div>

                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                                        {store.description || 'No description available.'}
                                    </p>

                                    <div className="space-y-2 mt-auto">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                                            <span className="material-symbols-outlined text-lg text-primary">location_on</span>
                                            <span className="truncate">{store.address?.city || 'Location N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                                            <span className="material-symbols-outlined text-lg text-primary">call</span>
                                            <span>{store.contact?.phone || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 -mx-6 -mb-6 px-6 py-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="text-sm font-bold">Visit Store</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoresPage;
