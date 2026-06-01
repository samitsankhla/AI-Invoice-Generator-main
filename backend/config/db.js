const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB already connected');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        isConnected = true;
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        throw err; // Don't exit process in serverless environment
    }
};

// Export both the function and connection state for serverless usage
connectDB.isConnected = () => isConnected;

module.exports = connectDB;