'use strict';

const crypto = require('crypto');
const path = require('path');
const config = require('./config');

/**
 * Utility functions for the application
 */
const utils = {
  /**
   * Generate a random filename with specified extension
   * 
   * @param {String} extension - File extension (without dot)
   * @returns {String} Random filename
   */
  generateFilename(extension) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}-${random}.${extension}`;
  },
  
  /**
   * Parse size string to bytes
   * 
   * @param {String} sizeStr - Size string (e.g., '10MB', '1GB')
   * @returns {Number} Size in bytes
   */
  parseSize(sizeStr) {
    const units = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024
    };
    
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
    if (!match) {
      throw new Error(`Invalid size format: ${sizeStr}`);
    }
    
    const size = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    if (!units[unit]) {
      throw new Error(`Unknown size unit: ${unit}`);
    }
    
    return Math.floor(size * units[unit]);
  },
  
  /**
   * Format bytes to human-readable size
   * 
   * @param {Number} bytes - Size in bytes
   * @param {Number} decimals - Decimal places (default: 2)
   * @returns {String} Formatted size
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  
  /**
   * Validate image parameters
   * 
   * @param {Object} params - Image parameters
   * @returns {Object} Validation result
   */
  validateImageParams(params) {
    const errors = [];
    
    // Validate compression
    if (params.compression !== undefined) {
      const compression = parseInt(params.compression, 10);
      if (isNaN(compression) || compression < 0 || compression > 2) {
        errors.push('Compression must be 0, 1, or 2');
      }
    }
    
    // Validate resize
    if (params.resize !== undefined) {
      const resize = parseInt(params.resize, 10);
      const validResizeValues = Object.values(config.constants.RESIZE_METHODS);
      if (isNaN(resize) || !validResizeValues.includes(resize)) {
        errors.push(`Resize must be one of: ${validResizeValues.join(', ')}`);
      }
      
      // If resize mode is specified, validate dimensions
      if (resize !== config.constants.RESIZE_METHODS.NONE) {
        if (params.resize_width === undefined && params.resize_height === undefined) {
          errors.push('Either resize_width or resize_height must be specified for resize operations');
        }
      }
    }
    
    // Validate dimensions
    if (params.resize_width !== undefined) {
      const width = parseInt(params.resize_width, 10);
      if (isNaN(width) || width <= 0) {
        errors.push('resize_width must be a positive integer');
      }
    }
    
    if (params.resize_height !== undefined) {
      const height = parseInt(params.resize_height, 10);
      if (isNaN(height) || height <= 0) {
        errors.push('resize_height must be a positive integer');
      }
    }
    
    // Validate format
    if (params.convertto !== undefined) {
      const format = params.convertto.replace(/^\+/, '').toLowerCase();
      const validFormats = Object.keys(config.image.formats);
      
      if (!validFormats.includes(format)) {
        errors.push(`Format must be one of: ${validFormats.join(', ')}`);
      }
    }
    
    // Validate quality
    if (params.quality !== undefined) {
      const quality = parseInt(params.quality, 10);
      if (isNaN(quality) || quality < 1 || quality > 100) {
        errors.push('Quality must be between 1 and 100');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Create a standardized API response
   * 
   * @param {Number} code - Status code
   * @param {String} message - Status message
   * @param {Object} data - Response data
   * @returns {Object} Formatted response
   */
  createResponse(code, message, data = {}) {
    return {
      status: {
        code,
        message
      },
      ...data
    };
  },
  
  /**
   * Generate a download URL for a file
   * 
   * @param {Object} req - Express request object
   * @param {String} filename - Filename
   * @returns {String} Download URL
   */
  getDownloadUrl(req, filename) {
    return `${req.protocol}://${req.get('host')}/downloads/${filename}`;
  },
  
  /**
   * Detect if a string is a valid URL
   * 
   * @param {String} str - String to check
   * @returns {Boolean} True if valid URL
   */
  isValidUrl(str) {
    try {
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Get extension from mime type
   * 
   * @param {String} mimeType - MIME type
   * @returns {String|null} File extension or null if not found
   */
  getExtensionFromMime(mimeType) {
    const formats = config.image.formats;
    for (const [extension, mime] of Object.entries(formats)) {
      if (mime === mimeType) {
        return extension;
      }
    }
    return null;
  },
  
  /**
   * Check if a value is numeric
   * 
   * @param {*} value - Value to check
   * @returns {Boolean} True if numeric
   */
  isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  /**
   * Sleep for a specified time
   * 
   * @param {Number} ms - Milliseconds to sleep
   * @returns {Promise} Resolves after sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

module.exports = utils;