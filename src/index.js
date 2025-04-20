'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

// Import configuration
const config = require('./config');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/auth');

// Import routes
const routes = require('./routes');

// Import storage utilities
const { cleanOldFiles } = require('./storage');

// Create Express app
const app = express();

// Create uploads directory if it doesn't exist
if (!fs.existsSync(config.storage.path)) {
  fs.mkdirSync(config.storage.path, { recursive: true });
}

// Enable security middleware
app.use(helmet());
app.use(cors());

// Logging middleware - use a more memory-efficient logging format in production
if (config.server.env === 'production') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Skip logging successful requests in production
  }));
} else {
  app.use(morgan('dev'));
}

// Request body parsing with size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve static files from the uploads directory
app.use('/downloads', express.static(path.join(process.cwd(), config.storage.path), {
  maxAge: '1h' // Add cache control
}));

// Register routes
app.use('/', authenticate, routes);

// Add a memory usage monitor and periodic garbage collection
const memoryMonitor = () => {
  const memoryUsage = process.memoryUsage();
  const mbUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const mbTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  
  console.log(`Memory Usage: ${mbUsed}MB / ${mbTotal}MB`);
  
  // Force garbage collection when heap usage exceeds 75% of max
  if (memoryUsage.heapUsed > 0.75 * memoryUsage.heapTotal) {
    console.log('Triggering manual garbage collection');
    if (global.gc) {
      global.gc();
    }
  }
};

// Run memory monitor every 30 seconds
setInterval(memoryMonitor, 30000);

// Error handling middleware (should be last)
app.use(errorHandler);

// Schedule cleanup for old files
cron.schedule('0 * * * *', async () => { // Run hourly instead of daily
  console.log('Running scheduled cleanup of old files...');
  try {
    const deletedCount = await cleanOldFiles();
    console.log(`Cleanup completed: ${deletedCount} files removed`);
    
    // Force garbage collection after cleanup
    if (global.gc) {
      global.gc();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

// Start the server
const server = app.listen(config.server.port, () => {
  console.log(`Image Optimizer API running on port ${config.server.port} in ${config.server.env} mode`);
  console.log(`Storage path: ${config.storage.path}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force close if it takes too long
  setTimeout(() => {
    console.log('Forcing server shutdown after timeout');
    process.exit(1);
  }, 10000); // 10 second timeout
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the process running but log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process running but log the error
});

module.exports = server; // Export for testing
