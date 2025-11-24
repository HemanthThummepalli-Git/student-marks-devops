// src/config/db.js
const mongoose = require('mongoose');
const logger = false;


const connectDB = async (mongoUri) => {
const uri = mongoUri || process.env.MONGO_URI || 'mongodb://localhost:27017/studentmarks';
try {
await mongoose.connect(uri, {
connectTimeoutMS: 10000,
serverSelectionTimeoutMS: 10000
});
if (logger) console.log('MongoDB connected');
} catch (err) {
console.error('MongoDB connection error:', err.message);
throw err;
}
};


module.exports = connectDB;