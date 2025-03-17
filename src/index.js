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

// Logging middleware
app.use(morgan('combined'));

// Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/downloads', express.static(path.join(process.cwd(), config.storage.path)));

// Register routes
app.use('/', authenticate, routes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Schedule cleanup for old files
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled cleanup of old files...');
  try {
    const deletedCount = await cleanOldFiles();
    console.log(`Cleanup completed: ${deletedCount} files removed`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

// Start the server
const server = app.listen(config.server.port, () => {
  console.log(`Image Optimizer API running on port ${config.server.port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server; // Export for testing