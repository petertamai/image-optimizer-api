'use strict';

const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const imageProcessor = require('./imageProcessor');
const imageLoader = require('./imageLoader');
const pipeline = require('./pipeline');
const config = require('./config');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.constants.MAX_FILE_SIZE
  }
});

/**
 * Utility function to handle async route handlers
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * GET /optimize - Simple image optimization with URL
 * Returns the optimized image directly
 */
router.get('/optimize', asyncHandler(async (req, res) => {
  const { url, maxWidth, compression } = req.query;
  
  if (!url) {
    return res.status(400).json({
      status: {
        code: -400,
        message: 'URL parameter is required'
      }
    });
  }
  
  // Load the image from URL
  const image = await imageLoader.fromUrl(url);
  
  // Process the image with simplified options
  const options = {
    maxWidth: maxWidth ? parseInt(maxWidth, 10) : config.image.defaults.maxWidth,
    compression: compression ? parseInt(compression, 10) : config.image.defaults.compression,
    convertto: config.image.defaults.format
  };
  
  const result = await imageProcessor.processImage(image.buffer, options);
  
  // Set appropriate content type header
  res.setHeader('Content-Type', config.image.formats[result.format] || 'application/octet-stream');
  res.setHeader('Content-Length', result.buffer.length);
  
  // Stream the image buffer directly to the response
  res.end(result.buffer);
}));

/**
 * POST /optimize - Advanced image optimization
 * Accepts image as URL or uploaded file
 * Returns JSON with optimization results and download URL
 */
router.post('/optimize', upload.single('image'), asyncHandler(async (req, res) => {
  let imageData;
  const options = parseOptions(req.body);
  
  // Load image from URL or uploaded file
  if (req.body.url) {
    imageData = await imageLoader.fromUrl(req.body.url);
  } else if (req.file) {
    imageData = await imageLoader.fromBuffer(req.file.buffer);
  } else {
    return res.status(400).json({
      status: {
        code: -400,
        message: 'Either url parameter or image file upload is required'
      }
    });
  }
  
  // Process the image
  const result = await imageProcessor.processImage(imageData.buffer, options);
  
  // Prepare the response
  const response = {
    status: {
      code: 2,
      message: 'Image processed successfully'
    },
    originalUrl: req.body.url || 'uploaded-file',
    originalSize: imageData.size,
    processedSize: result.processedSize,
    format: result.format,
    width: result.width,
    height: result.height,
    compressionRatio: (result.processedSize / imageData.size * 100).toFixed(2) + '%',
    downloadUrl: `${req.protocol}://${req.get('host')}${result.downloadUrl}`
  };
  
  // Include base64 for small images
  if (result.processedSize < 1024 * 1024) {
    response.base64 = `data:${config.image.formats[result.format]};base64,${result.buffer.toString('base64')}`;
  }
  
  res.status(200).json(response);
}));

/**
 * POST /pipeline - Multi-step image processing pipeline
 * Accepts image as URL or uploaded file and applies a sequence of operations
 */
router.post('/pipeline', upload.single('image'), asyncHandler(async (req, res) => {
  // Parse pipeline options
  let pipelineOptions;
  
  try {
    pipelineOptions = typeof req.body.pipeline === 'string' 
      ? JSON.parse(req.body.pipeline) 
      : req.body.pipeline;
      
    if (!pipelineOptions) {
      return res.status(400).json({
        status: {
          code: -400,
          message: 'Pipeline configuration is required'
        }
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: {
        code: -400,
        message: 'Invalid pipeline configuration: ' + error.message
      }
    });
  }
  
  // Get input image from URL, uploaded file, or body
  let input;
  if (req.body.url) {
    input = req.body.url;
  } else if (req.file) {
    input = req.file.buffer;
  } else if (req.body.image) {
    // Try to parse base64 image if provided
    try {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      input = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return res.status(400).json({
        status: {
          code: -400,
          message: 'Invalid base64 image data'
        }
      });
    }
  } else {
    return res.status(400).json({
      status: {
        code: -400,
        message: 'Image input is required (url, file upload, or base64)'
      }
    });
  }
  
  // Execute the pipeline
  const pipelineConfig = {
    input,
    steps: pipelineOptions.steps || []
  };
  
  const result = await pipeline.execute(pipelineConfig);
  
  // Prepare the response
  const response = {
    status: {
      code: 2,
      message: 'Pipeline executed successfully'
    },
    originalSize: result.originalSize,
    processedSize: result.processedSize,
    format: result.format,
    width: result.width,
    height: result.height,
    compressionRatio: result.compressionRatio,
    downloadUrl: `${req.protocol}://${req.get('host')}${result.downloadUrl}`
  };
  
  // Include base64 for small images
  if (result.base64) {
    response.base64 = result.base64;
  }
  
  res.status(200).json(response);
}));

/**
 * Helper function to parse optimization options from request body
 * 
 * @param {Object} body - Request body
 * @returns {Object} Normalized options
 */
function parseOptions(body) {
  return {
    compression: body.lossy !== undefined ? parseInt(body.lossy, 10) : config.image.defaults.compression,
    resize: body.resize !== undefined ? parseInt(body.resize, 10) : config.constants.RESIZE_METHODS.NONE,
    resize_width: body.resize_width ? parseInt(body.resize_width, 10) : null,
    resize_height: body.resize_height ? parseInt(body.resize_height, 10) : null,
    cmyk2rgb: body.cmyk2rgb !== undefined ? parseInt(body.cmyk2rgb, 10) === 1 : true,
    keep_exif: body.keep_exif !== undefined ? parseInt(body.keep_exif, 10) === 1 : false,
    convertto: body.convertto || config.image.defaults.format,
    quality: body.quality ? parseInt(body.quality, 10) : config.image.defaults.quality
  };
}

module.exports = router;