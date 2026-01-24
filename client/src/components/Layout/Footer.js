import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 px-6 lg:px-10 py-16">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 text-primary">
                        <div className="size-6">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    clipRule="evenodd"
                                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h2 className="text-gray-900 dark:text-white text-lg font-bold">FreshCart</h2>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Your daily organic grocery store delivering fresh products straight from local farms to your doorstep.
                    </p>
                    <div className="flex gap-4">
                        <div className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">share</span>
                        </div>
                        <div className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </div>
                        <div className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">alternate_email</span>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Quick Links</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li>
                            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
                        </li>
                        <li>
                            <Link to="/products" className="hover:text-primary transition-colors">All Products</Link>
                        </li>
                        <li>
                            <Link to="/orders" className="hover:text-primary transition-colors">Track Order</Link>
                        </li>
                        <li>
                            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
                        </li>
                    </ul>
                </div>

                {/* Customer Service */}
                <div>
                    <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Customer Service</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li>
                            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                        </li>
                        <li>
                            <Link to="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link>
                        </li>
                        <li>
                            <Link to="/returns" className="hover:text-primary transition-colors">Return Policy</Link>
                        </li>
                        <li>
                            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-bold mb-6 text-gray-900 dark:text-white">Newsletter</h4>
                    <p className="text-sm text-gray-500 mb-4">Subscribe to get weekly updates and special offers.</p>
                    <div className="flex flex-col gap-2">
                        <input
                            type="email"
                            className="rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary h-10"
                            placeholder="Your email"
                        />
                        <button className="w-full bg-primary text-gray-900 font-bold h-10 rounded-lg hover:shadow-lg transition-all">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <p>© 2024 FreshCart Inc. All rights reserved.</p>

            </div>
        </footer>
    );
};

export default Footer;
