const mongoose = require('mongoose');

/**
 * Store Schema
 * Represents a vendor (supermarket, restaurant, etc.)
 */
const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Store name is required'],
        trim: true,
        maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        default: '',
    },
    logo: {
        type: String, // URL to the logo image
        default: '',
    },
    type: {
        type: String,
        enum: ['grocery', 'restaurant', 'other'],
        required: true,
        default: 'grocery',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // The vendor_admin user who owns this store
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number,
        },
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true },
    },
    deliveryRules: {
        freeDeliveryThreshold: {
            type: Number,
            default: 200, // Default ₹200 for free delivery
            min: 0
        },
        deliveryFee: {
            type: Number,
            default: 30, // Standard delivery fee if below threshold
            min: 0
        },
        maxDeliveryRangeKm: {
            type: Number,
            default: 5, // Range in KM
        }
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false, // For "Verified Local Seller" badge
    }
}, {
    timestamps: true,
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
