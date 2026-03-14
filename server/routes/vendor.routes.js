const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware');
const {
    uploadInventory,
    getVendorProducts,
    updateVendorStock,
    getVendorStats,
    uploadImages,
    getVendorOrders
} = require('../controllers/vendor.controller');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for zips
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/zip',
            'application/x-zip-compressed',
            'application/x-zip'
        ];

        if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.zip')) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel, CSV, or ZIP files allowed!'), false);
        }
    }
});

// All routes require vendor_admin or admin role
router.use(protect);
router.use(authorize('vendor_admin', 'admin'));

/**
 * @route   POST /api/vendor/inventory/upload
 * @desc    Bulk upload inventory via Excel/CSV
 * @access  Private (Vendor Admin)
 */
router.post('/inventory/upload', upload.single('file'), uploadInventory);
router.post('/inventory/upload-images', upload.single('file'), uploadImages);

/**
 * @route   GET /api/vendor/orders
 * @desc    Get orders for the logged-in vendor
 * @access  Private (Vendor Admin)
 */
router.get('/orders', getVendorOrders);

/**
 * @route   GET /api/vendor/products
 * @desc    Get all products for the logged-in vendor
 * @access  Private (Vendor Admin)
 */
router.get('/products', getVendorProducts);

/**
 * @route   PATCH /api/vendor/products/:id/stock
 * @desc    Update single product stock
 * @access  Private (Vendor Admin)
 */
router.patch('/products/:id/stock', updateVendorStock);

/**
 * @route   GET /api/vendor/stats
 * @desc    Get vendor dashboard statistics
 * @access  Private (Vendor Admin)
 */
router.get('/stats', getVendorStats);

module.exports = router;
