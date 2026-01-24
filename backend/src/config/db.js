const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGODB_URI);

        console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
};

module.exports = connectDB;
