require('dotenv').config();
const mongoose = require('mongoose');

const checkConnection = async () => {
    const uri = process.env.MONGODB_URI;
    console.log('Testing MongoDB connection...');
    console.log(`URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Hide password in logs

    try {
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connection Successful!');
        console.log(`Connected to host: ${mongoose.connection.host}`);
        console.log(`Database name: ${mongoose.connection.name}`);

        // Optional: List collections to verify read access
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Files in database:');
        collections.forEach(collection => console.log(` - ${collection.name}`));

        await mongoose.disconnect();
        console.log('Connection closed.');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
};

checkConnection();
