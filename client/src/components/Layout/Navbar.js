import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setShowUserMenu(false);
    };

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark px-6 py-3 lg:px-10 sticky top-0 z-50">
            {/* Logo & Search */}
            <div className="flex items-center gap-8 flex-1">
                <Link to="/" className="flex items-center gap-2 text-primary">
                    <div className="size-8">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path
                                clipRule="evenodd"
                                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                                fill="currentColor"
                                fillRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 className="text-gray-900 dark:text-white text-xl font-black leading-tight tracking-tight">
                        FreshCart
                    </h2>
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-col min-w-40 h-10 max-w-md w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-gray-200 dark:border-gray-700">
                        <div className="text-gray-400 flex bg-gray-50 dark:bg-gray-800 items-center justify-center pl-4 rounded-l-lg">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex w-full min-w-0 flex-1 border-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-0 h-full placeholder:text-gray-400 px-4 rounded-r-lg pl-2 text-sm"
                            placeholder="Search for groceries..."
                        />
                    </div>
                </form>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-1 justify-end gap-6 items-center">
                <nav className="hidden xl:flex items-center gap-8">
                    <Link to="/" className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link to="/products" className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors">
                        Products
                    </Link>
                    <Link to="/products?featured=true" className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors">
                        Deals
                    </Link>
                    {isAuthenticated && (
                        <Link to="/orders" className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors">
                            Orders
                        </Link>
                    )}
                </nav>

                <div className="flex gap-3 items-center">
                    {/* Cart Button */}
                    <Link
                        to="/cart"
                        className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center rounded-lg h-10 px-4 bg-primary text-gray-900 text-sm font-bold transition-transform hover:scale-105 relative"
                    >
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                        <span className="truncate">Cart</span>
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </Link>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 min-w-[48px] cursor-pointer justify-center rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                <span className="truncate hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                        Profile
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                        My Orders
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 min-w-[48px] cursor-pointer justify-center rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            <span className="truncate hidden sm:inline">Login</span>
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="xl:hidden flex items-center justify-center rounded-lg h-10 w-10 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white"
                    >
                        <span className="material-symbols-outlined">
                            {showMobileMenu ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 px-6 xl:hidden z-40">
                    <nav className="flex flex-col gap-4">
                        <Link to="/" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            Home
                        </Link>
                        <Link to="/products" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            Products
                        </Link>
                        <Link to="/products?featured=true" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            Deals
                        </Link>
                        {isAuthenticated && (
                            <Link to="/orders" onClick={() => setShowMobileMenu(false)} className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                Orders
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
