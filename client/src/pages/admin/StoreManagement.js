import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storesAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const StoreManagement = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStore, setEditingStore] = useState(null);

    // New Store Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'grocery',
        ownerEmail: '',
        contact: { phone: '', email: '' },
        address: { street: '', city: '', state: '', zipCode: '' },
        deliveryRules: { freeDeliveryThreshold: 200, deliveryFee: 30 }
    });

    // Auto-fill contact email when owner email changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            contact: { ...prev.contact, email: prev.ownerEmail }
        }));
    }, [formData.ownerEmail]);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await storesAPI.getAll();
            setStores(response.data.data.stores);
        } catch (error) {
            toast.error('Failed to load stores');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        try {
            const loadingToast = toast.loading('Creating store...');
            await storesAPI.create(formData);
            toast.dismiss(loadingToast);
            toast.success('Store created successfully!');
            setShowCreateModal(false);
            fetchStores(); // Refresh list
            // Reset form
            setFormData({
                name: '', description: '', type: 'grocery', ownerEmail: '',
                contact: { phone: '', email: '' },
                address: { street: '', city: '', state: '', zipCode: '' },
                deliveryRules: { freeDeliveryThreshold: 200, deliveryFee: 30 }
            });
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Failed to create store');
        }
    };

    const handleEditClick = (store) => {
        setEditingStore(store);
        setFormData({
            name: store.name,
            description: store.description || '',
            type: store.type,
            ownerEmail: store.owner?.email || '',
            contact: store.contact || { phone: '', email: '' },
            address: store.address || { street: '', city: '', state: '', zipCode: '' },
            deliveryRules: store.deliveryRules || { freeDeliveryThreshold: 200, deliveryFee: 30 }
        });
        setShowEditModal(true);
    };

    const handleUpdateStore = async (e) => {
        e.preventDefault();
        try {
            const loadingToast = toast.loading('Updating store...');
            await storesAPI.update(editingStore._id, formData);
            toast.dismiss(loadingToast);
            toast.success('Store updated successfully!');
            setShowEditModal(false);
            fetchStores();
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Failed to update store');
        }
    };

    const handleDeleteStore = async (storeId) => {
        if (!window.confirm('Are you sure you want to deactivate this store? This action cannot be fully undone from the UI.')) {
            return;
        }
        try {
            const loadingToast = toast.loading('Deactivating store...');
            await storesAPI.delete(storeId);
            toast.dismiss(loadingToast);
            toast.success('Store deactivated successfully!');
            fetchStores();
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Failed to deactivate store');
        }
    };

    if (loading) return <LoadingSpinner size="lg" />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark p-6">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Store Management</h1>
                        <p className="text-gray-500">Manage local supermarkets and sub-agents</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary hover:bg-primary/90 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add_business</span>
                        Add New Store
                    </button>
                </div>

                {/* Stores Grid */}
                {stores.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">storefront</span>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">No items found</h2>
                        <p className="text-gray-500">Create your first store to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map(store => (
                            <div key={store._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${store.type === 'restaurant' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                        <span className="material-symbols-outlined">
                                            {store.type === 'restaurant' ? 'restaurant' : 'store'}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {store.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{store.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{store.description || 'No description'}</p>

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        <span>{store.owner?.name || store.owner?.email || 'Unknown Owner'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        <span className="truncate">{store.address.city}, {store.address.state}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                                        <span>Free above ₹{store.deliveryRules.freeDeliveryThreshold}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditClick(store)}
                                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteStore(store._id)}
                                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                    >
                                        Deactivate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create/Edit Modal */}
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <form onSubmit={showEditModal ? handleUpdateStore : handleCreateStore} className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {showEditModal ? 'Edit Store' : 'Create New Store'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setShowEditModal(false);
                                            setEditingStore(null);
                                        }}
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Info */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2">Basic Info</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Store Name"
                                                className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <select
                                                className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="grocery">Grocery Store</option>
                                                <option value="restaurant">Restaurant/Cafe</option>
                                            </select>
                                        </div>
                                        <textarea
                                            placeholder="Description"
                                            className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Owner Info */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2">Owner & Contact</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                required
                                                type="email"
                                                placeholder="Owner ID (Email)"
                                                className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                                value={formData.ownerEmail}
                                                onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                                                disabled={showEditModal} // Cannot easily change owner email after creation due to user linking
                                            />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Store Contact Phone"
                                                className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                value={formData.contact.phone}
                                                onChange={e => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2">Location</h3>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Street Address"
                                            className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 mb-2 outline-none focus:ring-2 focus:ring-primary"
                                            value={formData.address.street}
                                            onChange={e => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                required
                                                type="text"
                                                placeholder="City"
                                                className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                value={formData.address.city}
                                                onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                            />
                                            <input
                                                required
                                                type="text"
                                                placeholder="State"
                                                className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                value={formData.address.state}
                                                onChange={e => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                            />
                                            <input
                                                required
                                                type="text"
                                                placeholder="ZIP Code"
                                                className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                value={formData.address.zipCode}
                                                onChange={e => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    {/* Delivery Rules */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white border-b pb-2">Delivery Rules</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Free Delivery Above (₹)</label>
                                                <input
                                                    type="number"
                                                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                    value={formData.deliveryRules.freeDeliveryThreshold}
                                                    onChange={e => setFormData({ ...formData, deliveryRules: { ...formData.deliveryRules, freeDeliveryThreshold: e.target.value } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Std Delivery Fee (₹)</label>
                                                <input
                                                    type="number"
                                                    className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 outline-none focus:ring-2 focus:ring-primary"
                                                    value={formData.deliveryRules.deliveryFee}
                                                    onChange={e => setFormData({ ...formData, deliveryRules: { ...formData.deliveryRules, deliveryFee: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setShowEditModal(false);
                                            setEditingStore(null);
                                        }}
                                        className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-primary text-gray-900 font-bold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all"
                                    >
                                        {showEditModal ? 'Update Store' : 'Create Store'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreManagement;
