const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Secure Express headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows cross-origin image requests in development
  })
);

// Enable CORS for frontend accessibility (Vite ports, etc.)
app.use(
  cors({
    origin: '*', // In production, replace with actual frontend domain URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Simple Request Logging Middleware for debugging
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.originalUrl} (Origin: ${req.headers.origin || 'none'})`);
  next();
});


// Parse JSON request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded image static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RED_x Multi-Tenant E-Commerce SaaS API is fully operational',
    timestamp: new Date(),
  });
});

// Load SaaS application routes
app.use('/api', apiRoutes);

// Catch-all route for missing APIs
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource API Route '${req.originalUrl}' not found. Please review the documentation.`,
  });
});

// Centralized error treatment
app.use(errorHandler);

module.exports = app;
