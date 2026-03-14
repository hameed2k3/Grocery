import React from 'react';
import { useParams, Link } from 'react-router-dom';

const InfoPage = () => {
    const { page } = useParams();

    const renderContent = () => {
        switch (page) {
            case 'about':
                return (
                    <>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">About FreshCart</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            Welcome to <strong>FreshCart</strong>, your number one source for all things organic and fresh. We're dedicated to providing you the very best of local produce, with an emphasis on quality, sustainability, and community support.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            Founded in 2024, FreshCart has come a long way from its beginnings. When we first started out, our passion for "eco-friendly grocery shopping" drove us to start our own business.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                        </p>
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                            <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">Our Mission</h3>
                            <p className="text-green-700 dark:text-green-300">
                                To make healthy, organic food accessible to everyone while supporting local farmers and reducing our environmental footprint.
                            </p>
                        </div>
                    </>
                );
            case 'contact':
                return (
                    <>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Contact Us</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Have a question or feedback? We'd love to hear from you. Fill out the form or reach out to us directly.
                                </p>
                                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                    <span>123 Organic Lane, Green City, NY 10012</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                                    <span className="material-symbols-outlined text-primary">call</span>
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                                    <span className="material-symbols-outlined text-primary">mail</span>
                                    <span>support@freshcart.com</span>
                                </div>
                            </div>
                            <form className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input type="text" className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" placeholder="Your Name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input type="email" className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" placeholder="your@email.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                    <textarea className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 h-32 resize-none" placeholder="How can we help?"></textarea>
                                </div>
                                <button className="w-full bg-primary text-gray-900 font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </>
                );
            case 'faq':
                return (
                    <>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h1>
                        <div className="space-y-4">
                            {[
                                { q: "How do I place an order?", a: "Simply browse our products, add items to your cart, and proceed to checkout. You can checkout as a guest or create an account." },
                                { q: "What are your delivery hours?", a: "We deliver every day from 8 AM to 9 PM. Same-day delivery is available for orders placed before 2 PM." },
                                { q: "Do you offer organic products?", a: "Yes! The majority of our produce is certified organic and sourced from local sustainable farms." },
                                { q: "What is your return policy?", a: "We have a 'Freshness Guarantee'. If you're not satisfied with the quality of any perishable item, let us know within 24 hours for a full refund." }
                            ].map((item, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.q}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'shipping':
                return (
                    <>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Shipping Policy</h1>
                        <div className="space-y-6 text-gray-600 dark:text-gray-400">
                            <p>
                                At FreshCart, we strive to deliver your groceries as quickly and freshly as possible.
                            </p>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Areas</h3>
                            <p>
                                We currently deliver to most neighborhoods within the greater city area. Enter your zip code at checkout to confirm availability.
                            </p>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Fees</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Orders over ₹500: <strong>FREE Delivery</strong></li>
                                <li>Orders under ₹500: Flat rate of ₹50</li>
                                <li>Express Delivery (1-hour window): Additional ₹100</li>
                            </ul>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Times</h3>
                            <p>
                                Standard delivery windows are available from 8 AM to 9 PM daily. You can select your preferred 2-hour window during checkout.
                            </p>
                        </div>
                    </>
                );
            case 'returns':
                return (
                    <>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Return & Refund Policy</h1>
                        <div className="space-y-6 text-gray-600 dark:text-gray-400">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                                <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">100% Freshness Guarantee</h3>
                                <p className="text-blue-700 dark:text-blue-300">
                                    We stand behind the quality of our products. If you are not completely satisfied with the freshness of any item, we will refund you in full.
                                </p>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">How to Request a Refund</h3>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li><strong>Perishables:</strong> Please report any issues with perishable items (fruits, vegetables, dairy, meat) within 24 hours of delivery.</li>
                                <li><strong>Non-Perishables:</strong> Unopened non-perishable items can be returned within 7 days of purchase.</li>
                                <li>Contact our customer support via the app or email support@freshcart.com with your order number and a photo of the item (if damaged/spoiled).</li>
                            </ol>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Refund Process</h3>
                            <p>
                                Refunds will be processed to your original payment method within 3-5 business days after approval. Wallet refunds are instant.
                            </p>
                        </div>
                    </>
                );
            case 'privacy':
                return (
                    <>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
                        <div className="space-y-4 text-gray-600 dark:text-gray-400">
                            <p>Last updated: January 2024</p>
                            <p>
                                This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Collecting and Using Your Personal Data</h3>
                            <p>
                                We retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your personal data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Security of Your Personal Data</h3>
                            <p>
                                The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
                            </p>
                        </div>
                    </>
                );
            default:
                return (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-300">description</span>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
                        <p className="text-gray-500 mt-2">The informational page you are looking for does not exist.</p>
                        <Link to="/" className="text-primary font-bold mt-4 inline-block hover:underline">Go Home</Link>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark py-12">
            <div className="max-w-[800px] mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <span className="capitalize text-gray-900 dark:text-white">{page}</span>
                </nav>

                {renderContent()}
            </div>
        </div>
    );
};

export default InfoPage;
