import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background-light dark:bg-background-dark">
            <div className="text-center">
                <h1 className="text-9xl font-black text-primary">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
                <p className="text-gray-500 mt-2 max-w-md">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Go Home
                    </Link>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <span className="material-symbols-outlined">shopping_bag</span>
                        Shop Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
