const Product = require('../models/Product');
const { asyncHandler, ApiError } = require('../middleware');

/**
 * @desc    Get all products with filtering and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
    console.log('=== GET PRODUCTS REQUEST ===');
    console.log('Query params:', req.query);

    const {
        page = 1,
        limit = 12,
        category,
        search,
        minPrice,
        maxPrice,
        organic,
        glutenFree,
        vegan,
        inStock,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        featured,
        bestSeller,
        store, // Add store filter
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
        filter.category = category;
        console.log('Category filter applied:', category);
    }

    if (store) {
        filter.store = store;
        console.log('Store filter applied:', store);
    }

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
        ];
        console.log('Search filter applied:', search);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
        console.log('Price filter applied:', filter.price);
    }

    if (organic === 'true') filter['attributes.organic'] = true;
    if (glutenFree === 'true') filter['attributes.glutenFree'] = true;
    if (vegan === 'true') filter['attributes.vegan'] = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (featured === 'true') filter.isFeatured = true;
    if (bestSeller === 'true') filter.isBestSeller = true;

    console.log('Final filter object:', JSON.stringify(filter, null, 2));

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments(filter),
    ]);

    console.log(`Found ${products.length} products out of ${total} total`);

    // Calculate discounted prices
    const productsWithDiscount = products.map(product => ({
        ...product,
        discountedPrice: product.discount?.percentage > 0
            ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
            : product.price,
        inStock: product.stock > 0,
        stockStatus: product.stock === 0 ? 'out-of-stock' : product.stock <= (product.lowStockThreshold || 10) ? 'low-stock' : 'in-stock',
    }));

    res.status(200).json({
        success: true,
        data: {
            products: productsWithDiscount,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalProducts: total,
                hasMore: pageNum * limitNum < total,
            },
        },
    });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Add computed fields
    const productWithComputed = {
        ...product,
        discountedPrice: product.discount?.percentage > 0
            ? Number((product.price * (1 - product.discount.percentage / 100)).toFixed(2))
            : product.price,
        inStock: product.stock > 0,
        stockStatus: product.stock === 0 ? 'out-of-stock' : product.stock <= (product.lowStockThreshold || 10) ? 'low-stock' : 'in-stock',
    };

    res.status(200).json({
        success: true,
        data: {
            product: productWithComputed,
        },
    });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 8;

    const products = await Product.find({ isFeatured: true, isActive: true })
        .limit(limit)
        .lean();

    res.status(200).json({
        success: true,
        data: {
            products,
        },
    });
});

/**
 * @desc    Get best seller products
 * @route   GET /api/products/best-sellers
 * @access  Public
 */
const getBestSellers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 8;

    const products = await Product.find({ isBestSeller: true, isActive: true })
        .limit(limit)
        .lean();

    res.status(200).json({
        success: true,
        data: {
            products,
        },
    });
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
const getProductsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
        Product.find({ category, isActive: true })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments({ category, isActive: true }),
    ]);

    res.status(200).json({
        success: true,
        data: {
            products,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalProducts: total,
            },
        },
    });
});

/**
 * @desc    Create a new product (Admin)
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
    const productData = {
        name: req.body.name,
        sku: req.body.sku,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory,
        price: req.body.price,
        unit: req.body.unit || 'piece',
        stock: req.body.stock,
        lowStockThreshold: req.body.lowStockThreshold || 10,
        images: req.body.images || [],
        tags: req.body.tags || [],
        attributes: req.body.attributes || {},
        nutritionInfo: req.body.nutritionInfo || {},
        brand: req.body.brand || '',
        origin: req.body.origin || '',
        isFeatured: req.body.isFeatured || false,
        isBestSeller: req.body.isBestSeller || false,
    };

    if (req.body.discount) {
        productData.discount = {
            percentage: req.body.discount.percentage || 0,
            validUntil: req.body.discount.validUntil || null,
        };
    }

    const product = await Product.create(productData);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
            product,
        },
    });
});

/**
 * @desc    Update a product (Admin)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Fields that can be updated
    const allowedUpdates = [
        'name', 'description', 'category', 'subcategory', 'price', 'unit',
        'stock', 'lowStockThreshold', 'images', 'tags', 'attributes',
        'nutritionInfo', 'brand', 'origin', 'isFeatured', 'isBestSeller',
        'discount', 'isActive',
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: {
            product,
        },
    });
});

/**
 * @desc    Delete a product (Admin)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Soft delete - just set isActive to false
    product.isActive = false;
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
    });
});

/**
 * @desc    Permanently delete a product (Admin)
 * @route   DELETE /api/products/:id/permanent
 * @access  Private/Admin
 */
const permanentDeleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Product permanently deleted',
    });
});

/**
 * @desc    Get product statistics (Admin)
 * @route   GET /api/products/stats
 * @access  Private/Admin
 */
const getProductStats = asyncHandler(async (req, res) => {
    const [
        totalProducts,
        activeProducts,
        outOfStock,
        lowStock,
        categoryStats,
    ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ stock: 0, isActive: true }),
        Product.countDocuments({
            $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] },
            isActive: true,
        }),
        Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
            { $sort: { count: -1 } },
        ]),
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalProducts,
            activeProducts,
            outOfStock,
            lowStock,
            categoryStats,
        },
    });
});

/**
 * @desc    Update product stock (Admin)
 * @route   PATCH /api/products/:id/stock
 * @access  Private/Admin
 */
const updateStock = asyncHandler(async (req, res) => {
    const { stock, operation } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    if (operation === 'add') {
        product.stock += stock;
    } else if (operation === 'subtract') {
        product.stock = Math.max(0, product.stock - stock);
    } else {
        product.stock = stock;
    }

    await product.save();

    res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: {
            product: {
                id: product._id,
                name: product.name,
                stock: product.stock,
                stockStatus: product.stock === 0 ? 'out-of-stock' : product.stock <= product.lowStockThreshold ? 'low-stock' : 'in-stock',
            },
        },
    });
});

const Order = require('../models/Order'); // Import Order model

/**
 * @desc    Get product sales statistics (frequently ordered)
 * @route   GET /api/products/sales-stats
 * @access  Private/Admin
 */
const getProductSalesStats = asyncHandler(async (req, res) => {
    const stats = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                sku: { $first: '$items.sku' },
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                orderCount: { $sum: 1 },
                lastOrdered: { $max: '$createdAt' },
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 50 }
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats
        },
    });
});

/**
 * @desc    Create new review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    const alreadyReviewed = product.ratings.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        throw new ApiError('Product already reviewed', 400);
    }

    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
    };

    product.ratings.reviews.push(review);

    product.ratings.count = product.ratings.reviews.length;
    product.ratings.average =
        product.ratings.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.ratings.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getBestSellers,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    permanentDeleteProduct,
    getProductStats,
    getProductSalesStats,
    updateStock,
    addProductReview,
};
