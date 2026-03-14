const Store = require('../models/Store');
const User = require('../models/User');
const { asyncHandler, ApiError } = require('../middleware');

/**
 * @desc    Create a new store
 * @route   POST /api/stores
 * @access  Private (Admin)
 */
const createStore = asyncHandler(async (req, res) => {
    const {
        name, description, type, ownerEmail,
        address, contact, deliveryRules
    } = req.body;

    // 1. Find or Create the owner user
    let owner = await User.findOne({ email: ownerEmail });
    let isNewUser = false;

    if (!owner) {
        // Automatically create a new user request
        try {
            owner = await User.create({
                name: `Owner - ${name}`,
                email: ownerEmail,
                password: 'password123', // Default temporary password
                role: 'user', // Will be upgraded to vendor_admin below
                phone: contact?.phone || '',
            });
            isNewUser = true;
        } catch (error) {
            throw new ApiError('Failed to create new user for store owner: ' + error.message, 400);
        }
    }

    // Check if existing user is already a vendor
    if (owner.role === 'vendor_admin' || owner.storeId) {
        throw new ApiError('User is already assigned to a store', 400);
    }

    // 2. Create the store
    const store = await Store.create({
        name,
        description,
        type,
        owner: owner._id,
        address,
        contact,
        deliveryRules
    });

    // 3. Update the user role and assign storeId
    owner.role = 'vendor_admin';
    owner.storeId = store._id;
    await owner.save();

    res.status(201).json({
        success: true,
        message: isNewUser
            ? 'Store created and NEW user account created (Password: password123)'
            : 'Store created and existing user assigned successfully',
        data: { store }
    });
});

/**
 * @desc    Get all stores
 * @route   GET /api/stores
 * @access  Public (Basic info) / Admin (Full info)
 */
const getAllStores = asyncHandler(async (req, res) => {
    // If admin, return everything. If public, maybe filter active only.
    // For now, let's just return all active stores for public view.

    const filter = { isActive: true };
    if (req.user && req.user.role === 'admin') {
        delete filter.isActive; // Admin sees inactive stores too
    }

    const stores = await Store.find(filter)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: stores.length,
        data: { stores }
    });
});

/**
 * @desc    Get single store
 * @route   GET /api/stores/:id
 * @access  Public
 */
const getStoreById = asyncHandler(async (req, res) => {
    const store = await Store.findById(req.params.id)
        .populate('owner', 'name email');

    if (!store) {
        throw new ApiError('Store not found', 404);
    }

    res.status(200).json({
        success: true,
        data: { store }
    });
});

/**
 * @desc    Update store
 * @route   PUT /api/stores/:id
 * @access  Private (Admin or Store Owner)
 */
const updateStore = asyncHandler(async (req, res) => {
    let store = await Store.findById(req.params.id);

    if (!store) {
        throw new ApiError('Store not found', 404);
    }

    // Check permissions
    // Allow if user is Admin OR if user is the Owner of this store
    const isOwner = req.user.storeId && req.user.storeId.toString() === store._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
        throw new ApiError('Not authorized to update this store', 403);
    }

    store = await Store.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: 'Store updated successfully',
        data: { store }
    });
});

/**
 * @desc    Delete store (Soft delete)
 * @route   DELETE /api/stores/:id
 * @access  Private (Admin)
 */
const deleteStore = asyncHandler(async (req, res) => {
    const store = await Store.findById(req.params.id);

    if (!store) {
        throw new ApiError('Store not found', 404);
    }

    // Soft delete
    store.isActive = false;
    await store.save();

    // Ideally, we should also deactivate the products or cache, 
    // but for now we just deactivate the store entry.

    res.status(200).json({
        success: true,
        message: 'Store deactivated successfully'
    });
});

module.exports = {
    createStore,
    getAllStores,
    getStoreById,
    updateStore,
    deleteStore
};
