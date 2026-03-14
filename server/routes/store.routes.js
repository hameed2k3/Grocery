const express = require('express');
const router = express.Router();
const {
    createStore,
    getAllStores,
    getStoreById,
    updateStore,
    deleteStore
} = require('../controllers/store.controller');
const { protect, authorize, optionalAuth } = require('../middleware'); // Assuming optionalAuth exists or we use protect

// Public routes
router.get('/', optionalAuth, getAllStores); // optionalAuth allows admin to see more
router.get('/:id', getStoreById);

// Protected routes
router.use(protect);

// Create Store - Admin only
router.post('/', authorize('admin'), createStore);

// Update Store - Admin or Vendor Admin (Owner)
router.put('/:id', authorize('admin', 'vendor_admin'), updateStore);

// Delete Store - Admin only
router.delete('/:id', authorize('admin'), deleteStore);

module.exports = router;
