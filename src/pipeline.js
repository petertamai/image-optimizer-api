'use strict';

const imageProcessor = require('./imageProcessor');
const imageLoader = require('./imageLoader');
const config = require('./config');

/**
 * Pipeline - Handles multi-step image processing pipelines
 */
class Pipeline {
  /**
   * Execute a processing pipeline on an image
   * 
   * @param {Object} options - Pipeline options
   * @param {String|Buffer} options.input - URL or image buffer
   * @param {Array} options.steps - Processing steps to apply
   * @returns {Promise<Object>} Processing results
   */
  async execute(options) {
    try {
      // Validate pipeline options
      this.validatePipelineOptions(options);
      
      // Load the image
      let imageData;
      if (typeof options.input === 'string') {
        // Input is a URL
        imageData = await imageLoader.fromUrl(options.input);
      } else if (Buffer.isBuffer(options.input)) {
        // Input is a buffer
        imageData = await imageLoader.fromBuffer(options.input);
      } else {
        throw new Error('Invalid input type. Expected URL string or image buffer.');
      }
      
      // Process the image through the pipeline
      const result = await imageProcessor.processPipeline(imageData.buffer, options.steps);
      
      // Return the results with additional information
      return {
        ...result,
        originalType: imageData.type,
        originalFormat: imageData.format,
        compressionRatio: (result.processedSize / imageData.size * 100).toFixed(2) + '%',
        base64: this.shouldIncludeBase64(result.processedSize) 
          ? `data:${config.image.formats[result.format]};base64,${result.buffer.toString('base64')}`
          : undefined
      };
    } catch (error) {
      console.error('Pipeline execution error:', error);
      throw error;
    }
  }
  
  /**
   * Validate pipeline options
   * 
   * @param {Object} options - Pipeline options
   * @throws {Error} If options are invalid
   */
  validatePipelineOptions(options) {
    if (!options) {
      throw new Error('Pipeline options are required');
    }
    
    if (!options.input) {
      throw new Error('Pipeline input is required');
    }
    
    if (!options.steps || !Array.isArray(options.steps) || options.steps.length === 0) {
      throw new Error('Pipeline steps array is required and cannot be empty');
    }
    
    // Validate each step
    options.steps.forEach((step, index) => {
      if (!step.type) {
        throw new Error(`Step ${index + 1} is missing a type`);
      }
      
      switch (step.type) {
        case 'resize':
          if (!step.width && !step.height) {
            throw new Error(`Resize step ${index + 1} must specify at least one of width or height`);
          }
          break;
          
        case 'convert':
          if (!step.format) {
            throw new Error(`Convert step ${index + 1} must specify a format`);
          }
          if (!Object.keys(config.image.formats).includes(step.format)) {
            throw new Error(`Format '${step.format}' in step ${index + 1} is not supported`);
          }
          break;
          
        case 'compress':
          // Compression has reasonable defaults, no strict validation needed
          break;
          
        case 'rotate':
          if (typeof step.angle !== 'number') {
            throw new Error(`Rotate step ${index + 1} must specify a numeric angle`);
          }
          break;
          
        case 'flip':
          // At least one flip direction should be true
          if (step.horizontal !== true && step.vertical !== true) {
            throw new Error(`Flip step ${index + 1} must specify at least one of horizontal or vertical as true`);
          }
          break;
          
        case 'metadata':
          // No specific validation needed
          break;
          
        default:
          throw new Error(`Step type '${step.type}' in step ${index + 1} is not supported`);
      }
    });
  }
  
  /**
   * Determine if base64 encoded image should be included in the response
   * Only include for small images to avoid huge responses
   * 
   * @param {Number} size - Image size in bytes
   * @returns {Boolean} Whether to include base64
   */
  shouldIncludeBase64(size) {
    // Only include base64 for images smaller than 1MB
    return size < 1024 * 1024;
  }
}

module.exports = new Pipeline();