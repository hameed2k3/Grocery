const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const {
    authRoutes,
    productRoutes,
    cartRoutes,
    orderRoutes,
} = require('./routes');

// Import middleware
const { notFound, errorHandler } = require('./middleware');
require('./config/passport'); // Initialize passport strategy

// Initialize express app
const app = express();

// Connect to database
connectDB();

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CLIENT_URL,
].filter(Boolean);

// Permissive CORS for development
app.use(cors({
    origin: true, // Reflects the request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FreshCart API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint for Health Check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FreshCart API is running!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to FreshCart Grocery API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me',
                logout: 'POST /api/auth/logout',
                profile: 'PUT /api/auth/profile',
                addresses: 'POST/PUT/DELETE /api/auth/addresses',
            },
            products: {
                getAll: 'GET /api/products',
                getOne: 'GET /api/products/:id',
                featured: 'GET /api/products/featured',
                bestSellers: 'GET /api/products/best-sellers',
                byCategory: 'GET /api/products/category/:category',
                create: 'POST /api/products (Admin)',
                update: 'PUT /api/products/:id (Admin)',
                delete: 'DELETE /api/products/:id (Admin)',
            },
            cart: {
                get: 'GET /api/cart',
                add: 'POST /api/cart/add',
                update: 'PUT /api/cart/update',
                remove: 'DELETE /api/cart/remove/:productId',
                clear: 'DELETE /api/cart/clear',
                applyCoupon: 'POST /api/cart/apply-coupon',
            },
            orders: {
                create: 'POST /api/orders',
                myOrders: 'GET /api/orders/my',
                getOne: 'GET /api/orders/:id',
                all: 'GET /api/orders/all (Admin)',
                updateStatus: 'PUT /api/orders/:id/status (Admin)',
                cancel: 'POST /api/orders/:id/cancel',
                reorder: 'POST /api/orders/:id/reorder',
            },
        },
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
    });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
🚀 FreshCart Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
📡 API URL: http://localhost:${PORT}/api
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`❌ Uncaught Exception: ${err.message}`);
    process.exit(1);
});

module.exports = app;
