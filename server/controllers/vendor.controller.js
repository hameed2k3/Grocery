const Product = require('../models/Product');
const Store = require('../models/Store');
const Order = require('../models/Order');
const { asyncHandler, ApiError } = require('../middleware');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Helper to parse excel file buffer
const parseExcel = (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Read first sheet
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
};

/**
 * @desc    Bulk upload inventory via Excel
 * @route   POST /api/vendor/inventory/upload
 * @access  Private (Vendor Admin)
 */
const uploadInventory = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError('Please upload an Excel or CSV file', 400);
    }

    // Identify the store
    const storeId = req.user.storeId;
    if (!storeId && req.user.role !== 'admin') {
        throw new ApiError('User is not associated with any store', 403);
    }

    try {
        const rows = parseExcel(req.file.buffer);

        if (rows.length === 0) {
            throw new ApiError('File is empty', 400);
        }

        const results = {
            updated: 0,
            failed: 0,
            errors: []
        };

        // Process each row
        // Expected columns: SKU, Stock, Price (Optional)
        for (const [index, row] of rows.entries()) {
            const rowNumber = index + 2; // +2 because 1-indexed and header row
            const sku = row['SKU'] || row['sku'];
            const stock = row['Stock'] || row['stock'];
            const price = row['Price'] || row['price'];

            if (!sku) {
                results.failed++;
                results.errors.push(`Row ${rowNumber}: Missing SKU`);
                continue;
            }

            // Find product by SKU
            const product = await Product.findOne({ sku: sku.toString().trim() });

            if (!product) {
                results.failed++;
                results.errors.push(`Row ${rowNumber}: Product with SKU '${sku}' not found`);
                continue;
            }

            // Verify ownership
            if (product.store && product.store.toString() !== storeId.toString() && req.user.role !== 'admin') {
                results.failed++;
                results.errors.push(`Row ${rowNumber}: Product '${sku}' belongs to another store`);
                continue;
            }

            // Update fields
            if (stock !== undefined && stock !== null) {
                product.stock = parseInt(stock, 10);
            }
            if (price !== undefined && price !== null) {
                product.price = parseFloat(price);
            }

            // Assign store if not assigned (First claim)
            if (!product.store && storeId) {
                product.store = storeId;
            }

            await product.save();
            results.updated++;
        }

        res.status(200).json({
            success: true,
            message: `Processed ${rows.length} rows`,
            data: results
        });

    } catch (error) {
        console.error('Inventory upload error:', error);
        throw new ApiError('Failed to process file: ' + error.message, 500);
    }
});

/**
 * @desc    Get all products for the logged-in vendor
 * @route   GET /api/vendor/products
 * @access  Private (Vendor Admin)
 */
const getVendorProducts = asyncHandler(async (req, res) => {
    const storeId = req.user.storeId;
    if (!storeId && req.user.role !== 'admin') {
        throw new ApiError('User is not associated with any store', 403);
    }

    const { page = 1, limit = 20, search } = req.query;

    const filter = req.user.role === 'admin' ? {} : { store: storeId };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } }
        ];
    }

    const products = await Product.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ updatedAt: -1 });

    const count = await Product.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: {
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        }
    });
});

/**
 * @desc    Update single product stock
 * @route   PATCH /api/vendor/products/:id/stock
 * @access  Private (Vendor Admin)
 */
const updateVendorStock = asyncHandler(async (req, res) => {
    const { stock } = req.body;
    const storeId = req.user.storeId;

    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Permission check
    if (product.store && product.store.toString() !== storeId.toString() && req.user.role !== 'admin') {
        throw new ApiError('Not authorized to update this product', 403);
    }

    product.stock = stock;
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Stock updated',
        data: { stock: product.stock }
    });
});

/**
 * @desc    Get vendor statistics
 * @route   GET /api/vendor/stats
 * @access  Private (Vendor Admin)
 */
const getVendorStats = asyncHandler(async (req, res) => {
    const storeId = req.user.storeId;

    const [totalProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
        Product.countDocuments({ store: storeId }),
        Product.countDocuments({ store: storeId, stock: { $lte: 10, $gt: 0 } }),
        Product.countDocuments({ store: storeId, stock: 0 })
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalProducts,
            lowStockProducts,
            outOfStockProducts,
        }
    });
});

/**
 * @desc    Bulk upload product images via ZIP
 * @route   POST /api/vendor/inventory/upload-images
 * @access  Private (Vendor Admin)
 */
const uploadImages = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError('Please upload a ZIP file', 400);
    }

    const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const results = { updated: 0, failed: 0, errors: [] };
    const buffer = req.file.buffer;

    try {
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
            if (entry.isDirectory || entry.entryName.startsWith('__MACOSX')) continue;

            const ext = path.extname(entry.name).toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                continue;
            }

            const sku = path.basename(entry.name, ext);
            const filename = `${sku}-${Date.now()}${ext}`;
            const filepath = path.join(uploadDir, filename);

            fs.writeFileSync(filepath, entry.getData());

            const publicUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/products/${filename}`;

            const product = await Product.findOne({ sku: sku });

            if (product) {
                if (!product.store || (req.user.role !== 'admin' && product.store.toString() !== req.user.storeId?.toString())) {
                    results.failed++;
                    results.errors.push(`SKU ${sku}: Not authorized`);
                    continue;
                }

                product.images = [{
                    url: publicUrl,
                    alt: product.name,
                    isPrimary: true
                }];

                await product.save();
                results.updated++;
            } else {
                results.failed++;
                results.errors.push(`SKU ${sku}: Product not found`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${zipEntries.length} files`,
            data: results
        });

    } catch (error) {
        console.error('Zip processing error:', error);
        throw new ApiError('Failed to process ZIP: ' + error.message, 500);
    }
});

/**
 * @desc    Get orders for the logged-in vendor
 * @route   GET /api/vendor/orders
 * @access  Private (Vendor Admin)
 */
const getVendorOrders = asyncHandler(async (req, res) => {
    const storeId = req.user.storeId;
    if (!storeId && req.user.role !== 'admin') {
        throw new ApiError('User is not associated with any store', 403);
    }

    const { page = 1, limit = 20, status } = req.query;

    const query = req.user.role === 'admin'
        ? {}
        : { 'items.store': storeId };

    if (status) {
        query.orderStatus = status;
    }

    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

    const vendorOrders = orders.map(order => {
        const vendorItems = req.user.role === 'admin'
            ? order.items
            : order.items.filter(item => item.store.toString() === storeId.toString());

        const vendorSubtotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return {
            _id: order._id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            customer: order.user,
            shippingAddress: order.shippingAddress,
            status: order.orderStatus,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            items: vendorItems,
            vendorTotal: vendorSubtotal,
        };
    });

    res.status(200).json({
        success: true,
        data: {
            orders: vendorOrders,
            pagination: {
                total: totalOrders,
                page: parseInt(page),
                pages: Math.ceil(totalOrders / limit)
            }
        }
    });
});

module.exports = {
    uploadInventory,
    getVendorProducts,
    updateVendorStock,
    getVendorStats,
    uploadImages,
    getVendorOrders
};
