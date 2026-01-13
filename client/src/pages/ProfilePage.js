import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, updateProfile, addAddress, updateAddress, deleteAddress } = useAuth();

    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'home',
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        isDefault: false,
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateProfile(profileData);
        setLoading(false);

        if (result.success) {
            toast.success('Profile updated successfully!');
            setEditing(false);
        } else {
            toast.error(result.error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!newAddress.fullName || !newAddress.street || !newAddress.city) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        const result = await addAddress(newAddress);
        setLoading(false);

        if (result.success) {
            toast.success('Address added successfully!');
            setShowAddAddress(false);
            setNewAddress({
                label: 'home',
                fullName: '',
                phone: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'USA',
                isDefault: false,
            });
        } else {
            toast.error(result.error);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        const result = await deleteAddress(addressId);
        if (result.success) {
            toast.success('Address deleted');
        } else {
            toast.error(result.error);
        }
    };

    const handleSetDefault = async (addressId) => {
        const result = await updateAddress(addressId, { isDefault: true });
        if (result.success) {
            toast.success('Default address updated');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: 'person' },
        { id: 'addresses', label: 'Addresses', icon: 'location_on' },
        { id: 'orders', label: 'Orders', icon: 'inventory_2' },
        { id: 'security', label: 'Security', icon: 'lock' },
    ];

    return (
        <div className="fade-in max-w-[1200px] mx-auto px-4 lg:px-10 py-8">
            {/* Header */}
            <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">My Account</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-64">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                        {/* User Avatar */}
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-3xl font-bold text-primary">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="font-bold text-gray-900 dark:text-white mt-4">{user?.name}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                                {user?.role}
                            </span>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                                {!editing && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="text-primary font-medium flex items-center gap-1 hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email (cannot be changed)
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-primary text-gray-900 font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500">Full Name</span>
                                        <span className="font-medium">{user?.name}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500">Email</span>
                                        <span className="font-medium">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="font-medium">{user?.phone || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between py-3">
                                        <span className="text-gray-500">Member Since</span>
                                        <span className="font-medium">
                                            {new Date(user?.memberSince || user?.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Addresses</h2>
                                <button
                                    onClick={() => setShowAddAddress(!showAddAddress)}
                                    className="text-primary font-medium flex items-center gap-1 hover:underline"
                                >
                                    <span className="material-symbols-outlined text-sm">{showAddAddress ? 'close' : 'add'}</span>
                                    {showAddAddress ? 'Cancel' : 'Add New'}
                                </button>
                            </div>

                            {/* Add New Address Form */}
                            {showAddAddress && (
                                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select
                                            value={newAddress.label}
                                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600"
                                        >
                                            <option value="home">Home</option>
                                            <option value="work">Work</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Full Name *"
                                            value={newAddress.fullName}
                                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Street Address *"
                                            value={newAddress.street}
                                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                            className="md:col-span-2 rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600"
                                        />
                                        <input
                                            type="text"
                                            placeholder="City *"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State *"
                                            value={newAddress.state}
                                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600"
                                        />
                                        <input
                                            type="text"
                                            placeholder="ZIP Code *"
                                            value={newAddress.zipCode}
                                            onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                                            className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newAddress.isDefault}
                                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                            className="rounded text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Set as default address</span>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-primary text-gray-900 font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {loading ? 'Adding...' : 'Add Address'}
                                    </button>
                                </form>
                            )}

                            {/* Address List */}
                            {user?.addresses?.length > 0 ? (
                                <div className="space-y-4">
                                    {user.addresses.map((address) => (
                                        <div
                                            key={address._id}
                                            className="flex items-start justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">
                                                        {address.label}
                                                    </span>
                                                    {address.isDefault && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                                                    )}
                                                </div>
                                                <p className="font-medium text-gray-900 dark:text-white">{address.fullName}</p>
                                                <p className="text-sm text-gray-500">{address.phone}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {address.street}, {address.city}, {address.state} {address.zipCode}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!address.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(address._id)}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteAddress(address._id)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No addresses saved yet.</p>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order History</h2>
                            <Link
                                to="/orders"
                                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                            >
                                <span className="material-symbols-outlined">arrow_forward</span>
                                View All Orders
                            </Link>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                            <div className="space-y-4">
                                <Link
                                    to="/change-password"
                                    className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-400">lock</span>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                                            <p className="text-sm text-gray-500">Update your password regularly</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
