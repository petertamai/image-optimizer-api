'use strict';

const { fileTypeFromBuffer } = require('file-type');
const fs = require('fs').promises;
const config = require('./config');
const https = require('https');
const http = require('http');

/**
 * ImageLoader - Handles loading images from URLs or binary data
 */
class ImageLoader {
  /**
   * Load an image from a URL
   * 
   * @param {String} url - Image URL
   * @returns {Promise<Object>} Image buffer and metadata
   */
  async fromUrl(url) {
    try {
      // Download the image using Node.js native http/https modules
      const imageBuffer = await this.downloadImage(url);
      
      // Validate the image
      return this.validateAndIdentifyImage(imageBuffer);
    } catch (error) {
      console.error(`Error downloading image from ${url}:`, error);
      
      const err = new Error(`Failed to download image from URL: ${error.message}`);
      err.name = 'DownloadError';
      err.original = error;
      throw err;
    }
  }
  
  /**
   * Download image from URL using native http/https modules
   * 
   * @param {String} url - Image URL
   * @returns {Promise<Buffer>} Image buffer
   */
  downloadImage(url) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const requestLib = parsedUrl.protocol === 'https:' ? https : http;
      
      const options = {
        headers: {
          'User-Agent': 'Image-Optimizer-API/1.0',
          'Accept': 'image/*'
        },
        timeout: 15000
      };
      
      const req = requestLib.get(url, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Handle redirects
          return resolve(this.downloadImage(res.headers.location));
        }
        
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP error: ${res.statusCode}`));
        }
        
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
      
      req.end();
    });
  }
  
  /**
   * Load an image from binary data
   * 
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<Object>} Image buffer and metadata
   */
  async fromBuffer(buffer) {
    try {
      // Validate the image
      return this.validateAndIdentifyImage(buffer);
    } catch (error) {
      console.error('Error processing image buffer:', error);
      
      const err = new Error('Invalid or unsupported image format');
      err.name = 'FileTypeError';
      err.original = error;
      throw err;
    }
  }
  
  /**
   * Load an image from a file path
   * 
   * @param {String} filePath - Path to the image file
   * @returns {Promise<Object>} Image buffer and metadata
   */
  async fromFile(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      return this.validateAndIdentifyImage(buffer);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      
      const err = new Error(`Failed to read image file: ${error.message}`);
      err.name = 'FileReadError';
      err.original = error;
      throw err;
    }
  }
  
  /**
   * Validate and identify image type from buffer
   * 
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<Object>} Validated image data
   */
  async validateAndIdentifyImage(buffer) {
    // Check if buffer is valid
    if (!buffer || !Buffer.isBuffer(buffer)) {
      const err = new Error('Invalid image data');
      err.name = 'InvalidImageError';
      throw err;
    }
    
    // Check if file size is within limits
    if (buffer.length > config.constants.MAX_FILE_SIZE) {
      const err = new Error('Image file size exceeds the maximum allowed size');
      err.name = 'FileTooLargeError';
      throw err;
    }
    
    // Detect file type
    const fileType = await fileTypeFromBuffer(buffer);
    
    // Check if it's a supported image format
    if (!fileType || !Object.values(config.image.formats).includes(fileType.mime)) {
      const err = new Error('Unsupported image format');
      err.name = 'UnsupportedFormatError';
      throw err;
    }
    
    // Find the format key from the mime type
    const format = Object.keys(config.image.formats).find(
      key => config.image.formats[key] === fileType.mime
    );
    
    return {
      buffer,
      type: fileType.mime,
      format,
      extension: fileType.ext,
      size: buffer.length
    };
  }
}

module.exports = new ImageLoader();
