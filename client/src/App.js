import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import StoresPage from './pages/StoresPage'; // New
import StorePage from './pages/StorePage'; // New
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports'; // New
import StoreManagement from './pages/admin/StoreManagement'; // Re-added
import VendorDashboard from './pages/vendor/VendorDashboard'; // Re-added
import NotFoundPage from './pages/NotFoundPage'; // Re-added
import InfoPage from './pages/InfoPage'; // New
import WishlistPage from './pages/WishlistPage'; // New

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import VendorRoute from './components/VendorRoute'; // New

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductsPage />} />
                {/* <Route path="products/:id" element={<ProductDetailPage />} /> */}
                <Route path="category/:category" element={<ProductsPage />} />
                <Route path="stores" element={<StoresPage />} />
                <Route path="stores/:id" element={<StorePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* Static pages: about, contact, faq, shipping, returns, privacy */}
                <Route path=":page" element={<InfoPage />} />

                {/* Protected Routes - Require Authentication */}
                <Route element={<ProtectedRoute />}>
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/stores" element={<StoreManagement />} />
                <Route path="/admin/reports" element={<AdminReports />} />
            </Route>

            {/* Vendor Routes */}
            <Route element={<VendorRoute />}>
                <Route path="/vendor" element={<VendorDashboard />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
