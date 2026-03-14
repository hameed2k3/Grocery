# FreshCart - Grocery Web Application
## Project Folder Structure

```
Grocery web application/
│
├── client/                                 # React Frontend Application
│   ├── public/                            # Public static assets
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/                               # Source code
│   │   ├── components/                    # Reusable React components
│   │   │   ├── Layout/                    # Layout components
│   │   │   │   ├── Footer.js
│   │   │   │   ├── Layout.js
│   │   │   │   └── Navbar.js
│   │   │   ├── Vendor/                    # Vendor-specific components
│   │   │   │   └── NotificationCenter.js
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── ProductCard.js             # Product display card
│   │   │   └── ProtectedRoute.js          # Route protection wrapper
│   │   │
│   │   ├── context/                       # React Context providers
│   │   │   ├── AuthContext.js             # Authentication state
│   │   │   ├── CartContext.js             # Shopping cart state
│   │   │   └── ThemeContext.js            # Dark/Light theme
│   │   │
│   │   ├── pages/                         # Page components
│   │   │   ├── admin/                     # Admin panel pages
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── AdminOrders.js
│   │   │   │   ├── AdminProducts.js       # Product management with bulk upload
│   │   │   │   ├── AdminReports.js        # Sales reports & analytics
│   │   │   │   └── StoreManagement.js
│   │   │   ├── vendor/                    # Vendor portal pages
│   │   │   │   ├── VendorDashboard.js     # Vendor dashboard with bulk tools
│   │   │   │   └── VendorOrders.js
│   │   │   ├── CartPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── HomePage.js
│   │   │   ├── InfoPage.js                # Dynamic info pages (About, Privacy, etc.)
│   │   │   ├── LoginPage.js
│   │   │   ├── NotFoundPage.js
│   │   │   ├── OrdersPage.js
│   │   │   ├── ProductDetailPage.js       # (Currently disabled/commented)
│   │   │   ├── ProductsPage.js            # Product listing with search & filters
│   │   │   ├── ProfilePage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── StorePage.js               # Individual store view with search
│   │   │   ├── StoresPage.js              # All stores listing
│   │   │   └── WishlistPage.js
│   │   │
│   │   ├── services/                      # API service layer
│   │   │   └── api.js                     # Centralized API calls
│   │   │
│   │   ├── App.js                         # Main app component with routing
│   │   ├── index.js                       # React entry point
│   │   └── index.css                      # Global styles
│   │
│   ├── .env                               # Environment variables
│   ├── package.json                       # Frontend dependencies
│   ├── vercel.json                        # Vercel deployment config
│   └── tailwind.config.js                 # Tailwind CSS configuration
│
├── server/                                # Node.js Backend Application
│   ├── config/                            # Configuration files
│   │   └── db.js                          # MongoDB connection
│   │
│   ├── controllers/                       # Business logic controllers
│   │   ├── auth.controller.js             # Authentication logic
│   │   ├── cart.controller.js             # Cart operations
│   │   ├── order.controller.js            # Order management
│   │   ├── product.controller.js          # Product CRUD + sales stats
│   │   ├── store.controller.js            # Store management
│   │   └── vendor.controller.js           # Vendor operations + bulk upload
│   │
│   ├── middleware/                        # Express middleware
│   │   ├── asyncHandler.js                # Async error handling
│   │   ├── auth.middleware.js             # JWT authentication
│   │   ├── errorHandler.js                # Global error handler
│   │   └── index.js                       # Middleware exports
│   │
│   ├── models/                            # MongoDB Mongoose models
│   │   ├── Order.js                       # Order schema
│   │   ├── Product.js                     # Product schema
│   │   ├── Store.js                       # Store schema
│   │   └── User.js                        # User schema
│   │
│   ├── routes/                            # API route definitions
│   │   ├── auth.routes.js                 # /api/auth/*
│   │   ├── cart.routes.js                 # /api/cart/*
│   │   ├── order.routes.js                # /api/orders/*
│   │   ├── product.routes.js              # /api/products/*
│   │   ├── store.routes.js                # /api/stores/*
│   │   ├── vendor.routes.js               # /api/vendor/*
│   │   └── index.js                       # Route aggregator
│   │
│   ├── validations/                       # Request validation schemas
│   │   ├── auth.validation.js
│   │   ├── product.validation.js          # Updated with flexible category validation
│   │   └── index.js
│   │
│   ├── server/                            # Server entry point
│   │   └── server.js                      # Express app initialization
│   │
│   ├── .env                               # Environment variables (not in git)
│   └── package.json                       # Backend dependencies
│
└── PROJECT_STRUCTURE.md                   # This file

```

## Key Features by Module

### **Frontend (Client)**

#### **Pages**
- **Public Pages**: Home, Products, Stores, Store Detail, Login, Register
- **Protected Pages**: Cart, Checkout, Orders, Profile, Wishlist
- **Admin Pages**: Dashboard, Products (with bulk upload), Orders, Reports, Store Management
- **Vendor Pages**: Dashboard (with bulk upload), Orders

#### **Components**
- **Layout**: Navbar (with search), Footer, Layout wrapper
- **Product**: ProductCard (no navigation to detail page)
- **Vendor**: NotificationCenter
- **Common**: LoadingSpinner, ProtectedRoute

#### **Context**
- **AuthContext**: User authentication, wishlist management
- **CartContext**: Shopping cart state
- **ThemeContext**: Dark/Light mode toggle

### **Backend (Server)**

#### **API Endpoints**

**Authentication** (`/api/auth`)
- POST `/register` - User registration
- POST `/login` - User login
- POST `/logout` - User logout
- GET `/me` - Get current user
- PUT `/profile` - Update profile
- PUT `/change-password` - Change password
- POST/GET/DELETE `/addresses` - Address management
- GET/POST/DELETE `/wishlist/:productId` - Wishlist operations

**Products** (`/api/products`)
- GET `/` - Get all products (with search, filters, pagination)
- GET `/featured` - Get featured products
- GET `/best-sellers` - Get best sellers
- GET `/stats` - Admin product statistics
- GET `/sales-stats` - Admin sales analytics (NEW)
- GET `/category/:category` - Products by category
- GET `/:id` - Get single product
- POST `/` - Create product (Admin)
- PUT `/:id` - Update product (Admin)
- PATCH `/:id/stock` - Update stock (Admin)
- DELETE `/:id` - Soft delete product (Admin)

**Vendor** (`/api/vendor`)
- GET `/stats` - Vendor statistics
- GET `/products` - Vendor's products
- GET `/orders` - Vendor's orders
- PATCH `/products/:id/stock` - Update product stock
- POST `/inventory/upload` - Bulk upload inventory (Excel/CSV)
- POST `/inventory/upload-images` - Bulk upload images (ZIP)

**Cart** (`/api/cart`)
- GET `/` - Get cart
- GET `/count` - Get cart item count
- POST `/add` - Add to cart
- PUT `/update` - Update cart item
- DELETE `/remove/:productId` - Remove from cart
- DELETE `/clear` - Clear cart
- POST `/apply-coupon` - Apply coupon
- DELETE `/remove-coupon` - Remove coupon

**Orders** (`/api/orders`)
- POST `/` - Create order
- GET `/my` - Get user's orders
- GET `/:id` - Get order details
- POST `/:id/cancel` - Cancel order
- POST `/:id/reorder` - Reorder
- GET `/all` - Get all orders (Admin)
- PUT `/:id/status` - Update order status (Admin)
- GET `/stats` - Order statistics (Admin)

**Stores** (`/api/stores`)
- GET `/` - Get all stores
- GET `/:id` - Get store details
- POST `/` - Create store (Admin)
- PUT `/:id` - Update store (Admin)
- DELETE `/:id` - Delete store (Admin)

## Important Notes

### **Recent Changes**
1. **Product Detail Page**: Disabled/commented out - products no longer link to individual pages
2. **Product Reviews**: Functionality exists but not currently accessible (was on detail page)
3. **Admin Reports**: New page added for sales analytics
4. **Bulk Upload**: Available in both Admin Products and Vendor Dashboard
5. **Search**: Fixed validation to allow empty category parameter
6. **StorePage**: Enhanced with auto-search (debounced) and proper category filtering

### **Environment Variables**

**Client (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Server (.env)**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

### **Deployment**
- **Frontend**: Vercel (configured via vercel.json)
- **Backend**: Can be deployed to any Node.js hosting (Heroku, Railway, etc.)
- **Database**: MongoDB Atlas

## Development Commands

### **Client**
```bash
cd client
npm install          # Install dependencies
npm start           # Start dev server (port 3001)
npm run build       # Build for production
```

### **Server**
```bash
cd server
npm install          # Install dependencies
npm start           # Start server (port 5000)
```

## Folder Structure Best Practices

1. **Keep components modular**: Each component should have a single responsibility
2. **Use context for global state**: Auth, Cart, Theme
3. **Centralize API calls**: All in `services/api.js`
4. **Organize by feature**: Admin pages in `/admin`, Vendor pages in `/vendor`
5. **Validate on both sides**: Frontend validation + Backend validation
6. **Consistent naming**: PascalCase for components, camelCase for functions
7. **Environment-based config**: Use .env files for configuration

---

**Last Updated**: 2026-01-28
**Version**: 1.0.0
