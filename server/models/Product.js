const mongoose = require('mongoose');

/**
 * Product Schema for grocery items
 */
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: [
            'fruits-vegetables',
            'dairy-eggs',
            'bakery',
            'meat-seafood',
            'pantry',
            'beverages',
            'frozen',
            'snacks',
            'household',
            'personal-care',
        ],
    },
    subcategory: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'lb', 'g', 'oz', 'piece', 'pack', 'liter', 'gallon', 'dozen', 'bunch'],
        default: 'piece',
    },
    discount: {
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        validUntil: {
            type: Date,
            default: null,
        },
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
    },
    images: [{
        url: {
            type: String,
            required: true,
        },
        alt: {
            type: String,
            default: '',
        },
        isPrimary: {
            type: Boolean,
            default: false,
        },
    }],
    tags: [{
        type: String,
        lowercase: true,
        trim: true,
    }],
    attributes: {
        organic: { type: Boolean, default: false },
        glutenFree: { type: Boolean, default: false },
        vegan: { type: Boolean, default: false },
        nonGMO: { type: Boolean, default: false },
        localFarm: { type: Boolean, default: false },
    },
    nutritionInfo: {
        calories: { type: Number, default: null },
        protein: { type: String, default: '' },
        carbs: { type: String, default: '' },
        fat: { type: String, default: '' },
        fiber: { type: String, default: '' },
    },
    brand: {
        type: String,
        default: '',
    },
    origin: {
        type: String,
        default: '',
    },
    ratings: {
        average: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isBestSeller: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Indexes for faster queries (sku index auto-created by unique:true)
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'attributes.organic': 1 });

/**
 * Virtual: Calculate discounted price
 */
productSchema.virtual('discountedPrice').get(function () {
    if (this.discount.percentage > 0) {
        const now = new Date();
        // Check if discount is still valid
        if (!this.discount.validUntil || this.discount.validUntil > now) {
            return Number((this.price * (1 - this.discount.percentage / 100)).toFixed(2));
        }
    }
    return this.price;
});

/**
 * Virtual: Check if product is in stock
 */
productSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});

/**
 * Virtual: Check if product is low on stock
 */
productSchema.virtual('isLowStock').get(function () {
    return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

/**
 * Virtual: Get stock status
 */
productSchema.virtual('stockStatus').get(function () {
    if (this.stock === 0) return 'out-of-stock';
    if (this.stock <= this.lowStockThreshold) return 'low-stock';
    return 'in-stock';
});

/**
 * Get primary image
 */
productSchema.methods.getPrimaryImage = function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0] || null;
};

/**
 * Update stock quantity
 * @param {number} quantity - Quantity to reduce (positive) or add (negative)
 */
productSchema.methods.updateStock = async function (quantity) {
    this.stock = Math.max(0, this.stock - quantity);
    await this.save();
};

/**
 * Static: Find products by category
 */
productSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true });
};

/**
 * Static: Find featured products
 */
productSchema.statics.findFeatured = function (limit = 8) {
    return this.find({ isFeatured: true, isActive: true }).limit(limit);
};

/**
 * Static: Find best sellers
 */
productSchema.statics.findBestSellers = function (limit = 8) {
    return this.find({ isBestSeller: true, isActive: true }).limit(limit);
};

/**
 * Static: Search products
 */
productSchema.statics.search = function (query, options = {}) {
    const { category, minPrice, maxPrice, organic, inStock, page = 1, limit = 12 } = options;

    const filter = { isActive: true };

    if (query) {
        filter.$text = { $search: query };
    }
    if (category) {
        filter.category = category;
    }
    if (minPrice !== undefined) {
        filter.price = { ...filter.price, $gte: minPrice };
    }
    if (maxPrice !== undefined) {
        filter.price = { ...filter.price, $lte: maxPrice };
    }
    if (organic) {
        filter['attributes.organic'] = true;
    }
    if (inStock) {
        filter.stock = { $gt: 0 };
    }

    return this.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
