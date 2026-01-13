# 🛒 FreshCart - Online Grocery Store

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce application for online grocery shopping. Features a modern, responsive UI with complete shopping cart functionality, user authentication, order management, and an admin dashboard.

![FreshCart Banner](https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop)

## ✨ Features

### Customer Features
- 🛍️ **Product Browsing** - Browse products by category with search and filters
- 🛒 **Shopping Cart** - Add, update, remove items with real-time price calculation
- 💳 **Checkout** - Secure checkout with multiple payment options (UPI, Card, COD)
- 📦 **Order Tracking** - Track order status with detailed timeline
- 👤 **User Profile** - Manage profile, addresses, and security settings
- 🎟️ **Coupon Support** - Apply discount coupons at checkout
- 🚚 **Free Delivery** - Free delivery on orders above ₹500

### Admin Features
- 📊 **Dashboard** - Overview of sales, orders, and inventory
- 📦 **Product Management** - Add, edit, delete products
- 📋 **Order Management** - View and update order status
- 📈 **Stock Alerts** - Low stock and out of stock notifications

### Technical Features
- 🔐 **JWT Authentication** - Secure token-based authentication
- 🔒 **Role-based Access** - Admin and User roles
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ⚡ **Optimized Performance** - Fast loading with lazy loading

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - UI Library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **CSS3** - Custom styling with CSS variables

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📁 Project Structure

```
freshcart-grocery/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # React Context (Auth, Cart)
│       ├── pages/          # Page components
│       │   ├── admin/      # Admin pages
│       │   └── ...         # Customer pages
│       ├── services/       # API services
│       ├── App.js
│       └── index.js
│
├── server/                 # Express backend
│   ├── config/             # DB and JWT config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, error handling
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── validations/        # Input validation
│   ├── utils/              # Helper functions
│   ├── seeder.js           # Database seeder
│   └── server.js           # Entry point
│
├── .env.example            # Environment template
├── .gitignore
├── package.json            # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/freshcart-grocery.git
   cd freshcart-grocery
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   This installs both server and client dependencies.

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/freshcart
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```
   This creates sample users and products.

5. **Start the application**
   ```bash
   npm run dev
   ```
   This starts both backend (port 5000) and frontend (port 3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and client |
| `npm run server` | Start only the backend |
| `npm run client` | Start only the frontend |
| `npm run seed` | Seed database with sample data |
| `npm run seed:clear` | Clear all data from database |
| `npm run build` | Build client for production |

## 👤 Test Accounts

After running the seeder, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@freshcart.com | admin123 |
| **User** | rahul@example.com | password123 |
| **User** | priya@example.com | password123 |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh-token` | Refresh access token |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update item quantity |
| DELETE | `/api/cart/remove/:productId` | Remove item |
| POST | `/api/cart/coupon` | Apply coupon |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user's orders |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/orders/all` | Get all orders (Admin) |

## 📸 Screenshots

### Home Page
<img src="https://via.placeholder.com/800x450?text=Home+Page" alt="Home Page" width="100%">

### Products Page
<img src="https://via.placeholder.com/800x450?text=Products+Page" alt="Products Page" width="100%">

### Shopping Cart
<img src="https://via.placeholder.com/800x450?text=Shopping+Cart" alt="Shopping Cart" width="100%">

### Admin Dashboard
<img src="https://via.placeholder.com/800x450?text=Admin+Dashboard" alt="Admin Dashboard" width="100%">

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com) for product images
- [Google Material Symbols](https://fonts.google.com/icons) for icons
- [React Hot Toast](https://react-hot-toast.com) for notifications

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yourusername">Your Name</a>
</p>
