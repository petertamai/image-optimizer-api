'use strict';

require('dotenv').config();

// Utility function to ensure required environment variables are set
const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

// Application configuration
const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    apiKey: process.env.API_KEY || 'default-api-key-for-development'
  },
  storage: {
    path: process.env.STORAGE_PATH || './uploads',
    retentionDays: parseInt(process.env.STORAGE_RETENTION_DAYS || '3', 10)
  },
  image: {
    defaults: {
      compression: parseInt(process.env.DEFAULT_COMPRESSION || '1', 10), // 0: lossless, 1: lossy, 2: glossy
      maxWidth: parseInt(process.env.DEFAULT_MAX_WIDTH || '1200', 10),
      quality: parseInt(process.env.DEFAULT_QUALITY || '80', 10),
      format: process.env.DEFAULT_FORMAT || 'webp'
    },
    // Define supported formats and their mime types
    formats: {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif'
    },
    // Compression options map
    compressionTypes: {
      0: 'lossless',
      1: 'lossy',
      2: 'glossy'
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Constants for the application
const constants = {
  // Maximum file size for uploads (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Resize methods
  RESIZE_METHODS: {
    NONE: 0,      // No resizing
    OUTER: 1,     // Contain within dimensions
    INNER: 3,     // Cover dimensions
    SMART: 4      // Smart cropping
  },
  
  // Error codes
  ERROR_CODES: {
    INVALID_API_KEY: 'INVALID_API_KEY',
    INVALID_URL: 'INVALID_URL',
    INVALID_IMAGE: 'INVALID_IMAGE',
    PROCESSING_ERROR: 'PROCESSING_ERROR',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT'
  }
};

module.exports = {
  ...config,
  constants
};