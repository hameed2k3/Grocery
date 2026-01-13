/**
 * Utility helper functions
 */

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price string
 */
const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(price);
};

/**
 * Generate a random alphanumeric string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Calculate percentage discount
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
const paginate = (array, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = array.slice(startIndex, endIndex);

    return {
        items,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(array.length / limit),
            totalItems: array.length,
            hasMore: endIndex < array.length,
        },
    };
};

/**
 * Slugify a string
 * @param {string} text - Text to slugify
 * @returns {string} URL-friendly slug
 */
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} Valid or not
 */
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted date string
 */
const formatDate = (date, locale = 'en-US') => {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Get estimated delivery date
 * @param {number} days - Days from now
 * @returns {Date} Estimated delivery date
 */
const getEstimatedDeliveryDate = (days = 2) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Remove undefined and null values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
const cleanObject = (obj) => {
    const cleaned = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined && obj[key] !== null) {
            cleaned[key] = obj[key];
        }
    });
    return cleaned;
};

module.exports = {
    formatPrice,
    generateRandomString,
    calculateDiscountPercentage,
    paginate,
    slugify,
    deepClone,
    isValidObjectId,
    formatDate,
    getEstimatedDeliveryDate,
    capitalizeWords,
    cleanObject,
};
