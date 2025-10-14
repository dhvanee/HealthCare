const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./database/connection');
const mlService = require('./services/mlService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize ML models at startup
mlService.initializeModels();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Queue Prediction Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = {
        success: false,
        message: 'Internal server error'
    };

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(error => error.message);
        error.message = messages.join(', ');
        return res.status(400).json(error);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        return res.status(400).json(error);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        return res.status(401).json(error);
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        return res.status(401).json(error);
    }

    res.status(err.statusCode || 500).json(error);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Queue Prediction Management System API ready!`);
});

module.exports = app;
