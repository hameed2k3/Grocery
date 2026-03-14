import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VendorRoute = () => {
    const { isAuthenticated, isVendor, isAdmin, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full spin"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Allow Admin AND Vendor Admin
    if (!isVendor && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default VendorRoute;
