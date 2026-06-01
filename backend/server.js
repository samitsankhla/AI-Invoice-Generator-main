require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// middlewares to handle cors
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://ai-invoice-generator-ddxr.vercel.app',
            'https://*.vercel.app',
            'https://ai-invoice-generator-backend.onrender.com',
            process.env.CLIENT_URL // Add dynamic CLIENT_URL from env
        ].filter(Boolean), // Filter out falsy values
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 200
    })
);

// Connect to database before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// middleware to parse json
app.use(express.json());

// Routes here
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'AI Invoice Generator API is running!' });
});

// Export for serverless deployment
module.exports = app;

// Start server if run directly (for local development)
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}