/**
 * Database Seeder Script
 * Populates the database with sample data for development and testing
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshcart');

// Sample Users
const users = [
    {
        name: 'Admin User',
        email: 'admin@freshcart.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91-9876543210',
        addresses: [
            {
                label: 'work',
                fullName: 'Admin User',
                phone: '+91-9876543210',
                street: '100 Tech Park, Tower A, Floor 5',
                city: 'Mumbai',
                state: 'Maharashtra',
                zipCode: '400001',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'password123',
        role: 'user',
        phone: '+91-9123456789',
        addresses: [
            {
                label: 'home',
                fullName: 'Rahul Sharma',
                phone: '+91-9123456789',
                street: '42, MG Road, Flat 303',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560001',
                country: 'India',
                isDefault: true,
            },
            {
                label: 'work',
                fullName: 'Rahul Sharma',
                phone: '+91-9123456780',
                street: '15, Whitefield IT Park',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560066',
                country: 'India',
                isDefault: false,
            },
        ],
    },
    {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'password123',
        role: 'user',
        phone: '+91-9234567890',
        addresses: [
            {
                label: 'home',
                fullName: 'Priya Patel',
                phone: '+91-9234567890',
                street: '78, Connaught Place',
                city: 'New Delhi',
                state: 'Delhi',
                zipCode: '110001',
                country: 'India',
                isDefault: true,
            },
        ],
    },
];

// Sample Products
const products = [
    // Fruits & Vegetables
    {
        name: 'Organic Honeycrisp Apples',
        sku: 'FV-APPLE-001',
        description: 'Sweet and crisp organic Honeycrisp apples from local farms. Perfect for snacking, baking, or making fresh apple juice. These premium apples are pesticide-free and hand-picked at peak ripeness.',
        category: 'fruits-vegetables',
        subcategory: 'Fruits',
        price: 399,
        unit: 'lb',
        stock: 150,
        lowStockThreshold: 20,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
                alt: 'Fresh red Honeycrisp apples',
                isPrimary: true,
            },
        ],
        tags: ['organic', 'fruit', 'apples', 'local'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
            nonGMO: true,
            localFarm: true,
        },
        nutritionInfo: {
            calories: 95,
            protein: '0g',
            carbs: '25g',
            fat: '0g',
            fiber: '4g',
        },
        origin: 'Washington State, USA',
        isFeatured: true,
        isBestSeller: true,
        ratings: { average: 4.8, count: 234 },
    },
    {
        name: 'Fresh Organic Bananas',
        sku: 'FV-BANANA-001',
        description: 'Naturally ripened organic bananas. Rich in potassium and perfect for smoothies, breakfast bowls, or a quick energy boost. Sourced from sustainable farms.',
        category: 'fruits-vegetables',
        subcategory: 'Fruits',
        price: 59,
        unit: 'lb',
        stock: 200,
        lowStockThreshold: 30,
        discount: { percentage: 15, validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500',
                alt: 'Yellow ripe bananas',
                isPrimary: true,
            },
        ],
        tags: ['organic', 'fruit', 'bananas', 'tropical'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
            nonGMO: true,
        },
        nutritionInfo: {
            calories: 105,
            protein: '1g',
            carbs: '27g',
            fat: '0g',
            fiber: '3g',
        },
        origin: 'Ecuador',
        isFeatured: true,
        isBestSeller: true,
        ratings: { average: 4.7, count: 456 },
    },
    {
        name: 'Organic Hass Avocados',
        sku: 'FV-AVOCADO-001',
        description: 'Creamy and delicious Hass avocados, perfect for guacamole, toast, or salads. Rich in healthy fats and nutrients.',
        category: 'fruits-vegetables',
        subcategory: 'Fruits',
        price: 149,
        unit: 'piece',
        stock: 80,
        lowStockThreshold: 15,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
                alt: 'Fresh Hass avocados',
                isPrimary: true,
            },
        ],
        tags: ['organic', 'fruit', 'avocado', 'healthy-fats'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
            nonGMO: true,
        },
        isBestSeller: true,
        ratings: { average: 4.6, count: 189 },
    },
    {
        name: 'Organic Baby Carrots',
        sku: 'FV-CARROT-001',
        description: 'Sweet and crunchy organic baby carrots. Perfect for snacking, salads, or cooking. Pre-washed and ready to eat.',
        category: 'fruits-vegetables',
        subcategory: 'Vegetables',
        price: 279,
        unit: 'pack',
        stock: 100,
        lowStockThreshold: 20,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500',
                alt: 'Fresh baby carrots',
                isPrimary: true,
            },
        ],
        tags: ['organic', 'vegetable', 'carrots', 'snack'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
            nonGMO: true,
            localFarm: true,
        },
        ratings: { average: 4.5, count: 112 },
    },
    {
        name: 'Fresh Broccoli',
        sku: 'FV-BROCCOLI-001',
        description: 'Nutrient-rich fresh broccoli crowns. Excellent source of vitamins C and K. Great for steaming, roasting, or stir-frying.',
        category: 'fruits-vegetables',
        subcategory: 'Vegetables',
        price: 239,
        unit: 'bunch',
        stock: 75,
        lowStockThreshold: 15,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500',
                alt: 'Fresh green broccoli',
                isPrimary: true,
            },
        ],
        tags: ['vegetable', 'broccoli', 'superfood'],
        attributes: {
            glutenFree: true,
            vegan: true,
        },
        ratings: { average: 4.4, count: 87 },
    },
    {
        name: 'Vine Ripe Tomatoes',
        sku: 'FV-TOMATO-001',
        description: 'Juicy vine-ripened tomatoes with exceptional flavor. Perfect for salads, sandwiches, or cooking.',
        category: 'fruits-vegetables',
        subcategory: 'Vegetables',
        price: 319,
        unit: 'lb',
        stock: 120,
        lowStockThreshold: 25,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1546470427-227c7a6c2d60?w=500',
                alt: 'Red vine tomatoes',
                isPrimary: true,
            },
        ],
        tags: ['organic', 'vegetable', 'tomatoes'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
        },
        isFeatured: true,
        ratings: { average: 4.6, count: 156 },
    },

    // Dairy & Eggs
    {
        name: 'Organic Whole Milk',
        sku: 'DE-MILK-001',
        description: 'Fresh organic whole milk from grass-fed cows. No antibiotics or growth hormones. Rich and creamy taste.',
        category: 'dairy-eggs',
        subcategory: 'Milk',
        price: 479,
        unit: 'gallon',
        stock: 60,
        lowStockThreshold: 15,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
                alt: 'Glass of fresh milk',
                isPrimary: true,
            },
        ],
        tags: ['organic', 'dairy', 'milk', 'grass-fed'],
        attributes: {
            organic: true,
            nonGMO: true,
            localFarm: true,
        },
        brand: 'Horizon Organic',
        isFeatured: true,
        isBestSeller: true,
        ratings: { average: 4.9, count: 312 },
    },
    {
        name: 'Free Range Large Eggs',
        sku: 'DE-EGGS-001',
        description: 'Farm fresh free-range eggs from pasture-raised hens. Rich golden yolks with superior taste and nutrition.',
        category: 'dairy-eggs',
        subcategory: 'Eggs',
        price: 119,
        unit: 'dozen',
        stock: 80,
        lowStockThreshold: 20,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500',
                alt: 'Fresh brown eggs in carton',
                isPrimary: true,
            },
        ],
        tags: ['free-range', 'eggs', 'protein'],
        attributes: {
            organic: true,
            glutenFree: true,
            nonGMO: true,
            localFarm: true,
        },
        brand: 'Happy Hen Farms',
        isBestSeller: true,
        ratings: { average: 4.8, count: 278 },
    },
    {
        name: 'Greek Yogurt Plain',
        sku: 'DE-YOGURT-001',
        description: 'Thick and creamy plain Greek yogurt. High in protein and probiotics. Perfect for breakfast or cooking.',
        category: 'dairy-eggs',
        subcategory: 'Yogurt',
        price: 179,
        unit: 'pack',
        stock: 45,
        lowStockThreshold: 10,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500',
                alt: 'Greek yogurt in bowl',
                isPrimary: true,
            },
        ],
        tags: ['dairy', 'yogurt', 'protein', 'probiotic'],
        attributes: {
            glutenFree: true,
        },
        brand: 'Fage',
        ratings: { average: 4.7, count: 198 },
    },
    {
        name: 'Sharp Cheddar Cheese',
        sku: 'DE-CHEESE-001',
        description: 'Aged sharp cheddar cheese with bold, tangy flavor. Perfect for sandwiches, cheese boards, or cooking.',
        category: 'dairy-eggs',
        subcategory: 'Cheese',
        price: 639,
        unit: 'lb',
        stock: 35,
        lowStockThreshold: 8,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500',
                alt: 'Sharp cheddar cheese block',
                isPrimary: true,
            },
        ],
        tags: ['dairy', 'cheese', 'cheddar'],
        attributes: {
            glutenFree: true,
        },
        brand: 'Tillamook',
        ratings: { average: 4.8, count: 145 },
    },

    // Bakery
    {
        name: 'Artisan Sourdough Bread',
        sku: 'BK-BREAD-001',
        description: 'Freshly baked artisan sourdough bread with crispy crust and tangy flavor. Made with traditional fermentation methods.',
        category: 'bakery',
        subcategory: 'Bread',
        price: 179,
        unit: 'piece',
        stock: 25,
        lowStockThreshold: 5,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
                alt: 'Freshly baked sourdough bread',
                isPrimary: true,
            },
        ],
        tags: ['bakery', 'bread', 'sourdough', 'artisan'],
        attributes: {
            vegan: true,
        },
        isFeatured: true,
        isBestSeller: true,
        ratings: { average: 4.9, count: 267 },
    },
    {
        name: 'Butter Croissants',
        sku: 'BK-CROISSANT-001',
        description: 'Flaky, buttery croissants baked fresh daily. Perfect for breakfast or as a snack. Pack of 4.',
        category: 'bakery',
        subcategory: 'Pastry',
        price: 299,
        unit: 'pack',
        stock: 30,
        lowStockThreshold: 8,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
                alt: 'Golden butter croissants',
                isPrimary: true,
            },
        ],
        tags: ['bakery', 'pastry', 'croissant', 'french'],
        attributes: {},
        ratings: { average: 4.7, count: 189 },
    },
    {
        name: 'Whole Wheat Bread',
        sku: 'BK-BREAD-002',
        description: '100% whole wheat bread made with organic flour. High in fiber and nutrients. Perfect for sandwiches.',
        category: 'bakery',
        subcategory: 'Bread',
        price: 129,
        unit: 'piece',
        stock: 40,
        lowStockThreshold: 10,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500',
                alt: 'Whole wheat bread loaf',
                isPrimary: true,
            },
        ],
        tags: ['bakery', 'bread', 'whole-wheat', 'healthy'],
        attributes: {
            organic: true,
            vegan: true,
        },
        ratings: { average: 4.5, count: 156 },
    },

    // Meat & Seafood
    {
        name: 'Grass-Fed Ground Beef',
        sku: 'MS-BEEF-001',
        description: 'Premium grass-fed ground beef, 85% lean. No hormones or antibiotics. Perfect for burgers, meatballs, or tacos.',
        category: 'meat-seafood',
        subcategory: 'Beef',
        price: 499,
        unit: 'lb',
        stock: 50,
        lowStockThreshold: 10,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500',
                alt: 'Fresh ground beef',
                isPrimary: true,
            },
        ],
        tags: ['meat', 'beef', 'grass-fed', 'protein'],
        attributes: {
            glutenFree: true,
            nonGMO: true,
        },
        isBestSeller: true,
        ratings: { average: 4.8, count: 234 },
    },
    {
        name: 'Atlantic Salmon Fillets',
        sku: 'MS-SALMON-001',
        description: 'Fresh Atlantic salmon fillets. Rich in omega-3 fatty acids. Sustainably sourced.',
        category: 'meat-seafood',
        subcategory: 'Seafood',
        price: 899,
        unit: 'lb',
        stock: 30,
        lowStockThreshold: 8,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=500',
                alt: 'Fresh salmon fillet',
                isPrimary: true,
            },
        ],
        tags: ['seafood', 'salmon', 'omega-3', 'healthy'],
        attributes: {
            glutenFree: true,
        },
        isFeatured: true,
        ratings: { average: 4.7, count: 178 },
    },
    {
        name: 'Organic Chicken Breast',
        sku: 'MS-CHICKEN-001',
        description: 'Organic boneless skinless chicken breast. Free-range, no antibiotics. Lean and versatile.',
        category: 'meat-seafood',
        subcategory: 'Poultry',
        price: 349,
        unit: 'lb',
        stock: 60,
        lowStockThreshold: 12,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500',
                alt: 'Raw chicken breast',
                isPrimary: true,
            },
        ],
        tags: ['meat', 'chicken', 'organic', 'protein'],
        attributes: {
            organic: true,
            glutenFree: true,
            nonGMO: true,
        },
        isBestSeller: true,
        ratings: { average: 4.6, count: 289 },
    },

    // Pantry
    {
        name: 'Extra Virgin Olive Oil',
        sku: 'PT-OIL-001',
        description: 'Premium cold-pressed extra virgin olive oil. Rich, fruity flavor. Perfect for cooking and dressing.',
        category: 'pantry',
        subcategory: 'Oils',
        price: 599,
        unit: 'liter',
        stock: 80,
        lowStockThreshold: 15,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
                alt: 'Olive oil bottle',
                isPrimary: true,
            },
        ],
        tags: ['pantry', 'oil', 'olive', 'cooking'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
        },
        origin: 'Italy',
        isFeatured: true,
        ratings: { average: 4.9, count: 312 },
    },
    {
        name: 'Organic Quinoa',
        sku: 'PT-GRAIN-001',
        description: 'Organic white quinoa. Complete protein with all essential amino acids. Gluten-free and versatile.',
        category: 'pantry',
        subcategory: 'Grains',
        price: 299,
        unit: 'lb',
        stock: 100,
        lowStockThreshold: 20,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
                alt: 'White quinoa grains',
                isPrimary: true,
            },
        ],
        tags: ['pantry', 'grain', 'quinoa', 'protein'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
            nonGMO: true,
        },
        ratings: { average: 4.7, count: 167 },
    },
    {
        name: 'Raw Honey',
        sku: 'PT-HONEY-001',
        description: 'Pure raw unfiltered honey from local apiaries. Rich in antioxidants and natural enzymes.',
        category: 'pantry',
        subcategory: 'Sweeteners',
        price: 449,
        unit: 'pack',
        stock: 55,
        lowStockThreshold: 10,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500',
                alt: 'Jar of raw honey',
                isPrimary: true,
            },
        ],
        tags: ['pantry', 'honey', 'natural', 'sweetener'],
        attributes: {
            glutenFree: true,
            localFarm: true,
        },
        ratings: { average: 4.8, count: 198 },
    },

    // Beverages
    {
        name: 'Cold Pressed Orange Juice',
        sku: 'BV-JUICE-001',
        description: 'Fresh cold-pressed orange juice. No added sugar or preservatives. 100% pure Florida oranges.',
        category: 'beverages',
        subcategory: 'Juice',
        price: 199,
        unit: 'liter',
        stock: 45,
        lowStockThreshold: 10,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500',
                alt: 'Fresh orange juice',
                isPrimary: true,
            },
        ],
        tags: ['beverage', 'juice', 'orange', 'fresh'],
        attributes: {
            glutenFree: true,
            vegan: true,
        },
        isFeatured: true,
        ratings: { average: 4.6, count: 134 },
    },
    {
        name: 'Sparkling Mineral Water',
        sku: 'BV-WATER-001',
        description: 'Natural sparkling mineral water from mountain springs. Refreshing with fine bubbles.',
        category: 'beverages',
        subcategory: 'Water',
        price: 79,
        unit: 'liter',
        stock: 200,
        lowStockThreshold: 50,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500',
                alt: 'Sparkling water bottle',
                isPrimary: true,
            },
        ],
        tags: ['beverage', 'water', 'sparkling'],
        attributes: {
            glutenFree: true,
            vegan: true,
        },
        brand: 'San Pellegrino',
        ratings: { average: 4.5, count: 89 },
    },

    // Frozen
    {
        name: 'Frozen Mixed Berries',
        sku: 'FZ-BERRIES-001',
        description: 'Organic frozen mixed berries - strawberries, blueberries, raspberries. Perfect for smoothies.',
        category: 'frozen',
        subcategory: 'Fruits',
        price: 399,
        unit: 'pack',
        stock: 65,
        lowStockThreshold: 15,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=500',
                alt: 'Frozen mixed berries',
                isPrimary: true,
            },
        ],
        tags: ['frozen', 'berries', 'organic', 'smoothie'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
        },
        isBestSeller: true,
        ratings: { average: 4.7, count: 178 },
    },

    // Snacks
    {
        name: 'Organic Trail Mix',
        sku: 'SN-MIX-001',
        description: 'Premium organic trail mix with nuts, seeds, and dried fruits. Perfect healthy snack.',
        category: 'snacks',
        subcategory: 'Nuts & Seeds',
        price: 349,
        unit: 'pack',
        stock: 90,
        lowStockThreshold: 20,
        images: [
            {
                url: 'https://images.unsplash.com/photo-1604064428416-bec0f54ebe69?w=500',
                alt: 'Trail mix',
                isPrimary: true,
            },
        ],
        tags: ['snack', 'nuts', 'healthy', 'organic'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
        },
        isFeatured: true,
        ratings: { average: 4.6, count: 145 },
    },
    {
        name: 'Dark Chocolate Bar',
        sku: 'SN-CHOC-001',
        description: '72% dark chocolate bar made with organic cacao. Rich, intense flavor. Fair trade certified.',
        category: 'snacks',
        subcategory: 'Chocolate',
        price: 249,
        unit: 'piece',
        stock: 75,
        lowStockThreshold: 15,
        discount: { percentage: 20, validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500',
                alt: 'Dark chocolate bar',
                isPrimary: true,
            },
        ],
        tags: ['snack', 'chocolate', 'dark', 'organic'],
        attributes: {
            organic: true,
            glutenFree: true,
            vegan: true,
        },
        ratings: { average: 4.8, count: 234 },
    },
];

// Seed function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Create users
        console.log('👥 Creating users...');
        const createdUsers = [];
        for (const userData of users) {
            const user = await User.create(userData);
            createdUsers.push(user);
            console.log(`   ✓ User created: ${user.email} (${user.role})`);
        }
        console.log(`✅ ${createdUsers.length} users created\n`);

        // Create products
        console.log('📦 Creating products...');
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} products created\n`);

        // Create sample cart for Rahul Sharma
        console.log('🛒 Creating sample cart...');
        const rahul = createdUsers.find(u => u.email === 'rahul@example.com');
        if (rahul) {
            const sampleProducts = createdProducts.slice(0, 3);
            await Cart.create({
                user: rahul._id,
                items: sampleProducts.map((p, index) => ({
                    product: p._id,
                    quantity: index + 1,
                    priceAtAdd: p.price,
                })),
            });
            console.log(`✅ Sample cart created for ${rahul.email}\n`);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 Database seeding completed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📋 Test Accounts:');
        console.log('   Admin: admin@freshcart.com / admin123');
        console.log('   User:  rahul@example.com / password123');
        console.log('   User:  priya@example.com / password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Clear database function
const clearDatabase = async () => {
    try {
        console.log('🗑️  Clearing all data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});
        console.log('✅ Database cleared');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Run based on command line argument
if (process.argv[2] === '--clear') {
    clearDatabase();
} else {
    seedDatabase();
}
