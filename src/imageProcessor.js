'use strict';

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { nanoid } = require('nanoid');
const config = require('./config');

// Configure Sharp for better memory management
sharp.cache(false); // Disable caching to reduce memory usage
sharp.simd(true); // Enable SIMD if available

/**
 * Image Processor - Handles all image transformation operations
 */
class ImageProcessor {
  /**
   * Process an image with the given options
   * 
   * @param {Buffer} imageBuffer - The image buffer to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing results
   */
  async processImage(imageBuffer, options) {
    try {
      const originalSize = imageBuffer.length;
      
      // Get minimal metadata instead of full metadata to reduce memory usage
      const metadata = await sharp(imageBuffer, { failOnError: false }).metadata();
      
      // Create Sharp instance with the input image
      let image = sharp(imageBuffer, { 
        failOnError: false,
        limitInputPixels: 50000000 // Limit input to 50MP to prevent memory issues
      });
      
      // Set default options if not provided
      const processingOptions = this.normalizeOptions(options, metadata);
      
      // Apply CMYK to RGB conversion if requested
      if (processingOptions.cmyk2rgb && metadata.space === 'cmyk') {
        image = image.toColorspace('srgb');
      }
      
      // Apply resizing if requested
      if (processingOptions.resize !== config.constants.RESIZE_METHODS.NONE) {
        image = await this.applyResize(image, processingOptions, metadata);
      }
      
      // Process image based on format and compression settings
      const { buffer, format, info } = await this.applyFormatAndCompression(
        image, 
        processingOptions, 
        metadata
      );
      
      // Explicitly remove references to help GC
      imageBuffer = null;
      image = null;
      
      // Save the processed image
      const filename = `${nanoid(10)}.${format}`;
      const outputPath = path.join(config.storage.path, filename);
      await fs.writeFile(outputPath, buffer);
      
      // Return the results
      return {
        originalSize,
        processedSize: buffer.length,
        width: info.width,
        height: info.height,
        format,
        filename,
        buffer,
        outputPath,
        downloadUrl: `/downloads/${filename}`
      };
    } catch (error) {
      console.error('Image processing error:', error);
      const err = new Error('Failed to process the image');
      err.name = 'ProcessingError';
      err.original = error;
      throw err;
    }
  }
  
  /**
   * Process an image through a sequence of operations
   * 
   * @param {Buffer} imageBuffer - The image buffer to process
   * @param {Array} steps - Array of processing steps
   * @returns {Promise<Object>} Processing results
   */
  async processPipeline(imageBuffer, steps) {
    try {
      const originalSize = imageBuffer.length;
      
      // Get minimal metadata to reduce memory usage
      const metadata = await sharp(imageBuffer, { failOnError: false }).metadata();
      
      let image = sharp(imageBuffer, { 
        failOnError: false,
        limitInputPixels: 50000000 // Limit input to 50MP to prevent memory issues
      });
      let currentFormat = metadata.format;
      let currentMetadata = metadata;
      
      // Apply each step in the pipeline
      for (const step of steps) {
        switch (step.type) {
          case 'resize':
            image = await this.applyResize(image, step, currentMetadata);
            break;
            
          case 'convert':
            const formatOptions = {
              format: step.format,
              quality: step.quality || config.image.defaults.quality,
              lossless: step.lossless || false
            };
            image = this.applyFormat(image, formatOptions);
            currentFormat = step.format;
            break;
            
          case 'compress':
            const compressionOptions = {
              compression: step.level || config.image.defaults.compression,
              quality: step.quality || config.image.defaults.quality
            };
            image = this.applyCompression(image, compressionOptions, currentFormat);
            break;
            
          case 'rotate':
            image = image.rotate(step.angle || 0, { 
              background: step.background || { r: 255, g: 255, b: 255, alpha: 0 }
            });
            break;
            
          case 'flip':
            if (step.horizontal) image = image.flop();
            if (step.vertical) image = image.flip();
            break;
            
          case 'metadata':
            if (step.keepExif === false) {
              image = image.withMetadata({ exif: {} });
            } else {
              image = image.withMetadata();
            }
            break;
            
          default:
            console.warn(`Unknown pipeline step type: ${step.type}`);
        }
        
        // Update metadata after each step if needed for the next step
        if (step.type === 'resize') {
          currentMetadata = await image.metadata();
        }
      }
      
      // Finalize the image
      const { buffer, format, info } = await this.finalizeImage(image, currentFormat);
      
      // Explicitly remove references to help GC
      imageBuffer = null;
      image = null;
      
      // Save the processed image
      const filename = `${nanoid(10)}.${format}`;
      const outputPath = path.join(config.storage.path, filename);
      await fs.writeFile(outputPath, buffer);
      
      // Return the results
      return {
        originalSize,
        processedSize: buffer.length,
        width: info.width,
        height: info.height,
        format,
        filename,
        buffer,
        outputPath,
        downloadUrl: `/downloads/${filename}`
      };
    } catch (error) {
      console.error('Pipeline processing error:', error);
      const err = new Error('Failed to process the image pipeline');
      err.name = 'ProcessingError';
      err.original = error;
      throw err;
    }
  }
  
  /**
   * Normalize options by applying defaults
   * 
   * @param {Object} options - User provided options
   * @param {Object} metadata - Image metadata
   * @returns {Object} Normalized options
   */
  normalizeOptions(options, metadata) {
    return {
      // Default values
      compression: config.image.defaults.compression,
      resize: config.constants.RESIZE_METHODS.NONE,
      resize_width: null,
      resize_height: null,
      cmyk2rgb: true,
      keep_exif: false,
      convertto: null,
      
      // Override with user options
      ...options,
      
      // If only maxWidth is provided, calculate height proportionally
      ...(options.maxWidth && !options.resize_width ? {
        resize: config.constants.RESIZE_METHODS.OUTER,
        resize_width: options.maxWidth,
        resize_height: Math.round(metadata.height * (options.maxWidth / metadata.width))
      } : {})
    };
  }
  
  /**
   * Apply resize operation based on options
   * 
   * @param {Sharp} image - Sharp instance
   * @param {Object} options - Resize options
   * @param {Object} metadata - Image metadata
   * @returns {Sharp} Modified Sharp instance
   */
  async applyResize(image, options, metadata) {
    const { resize, resize_width, resize_height } = options;
    
    // Skip if no resize needed
    if (resize === config.constants.RESIZE_METHODS.NONE || (!resize_width && !resize_height)) {
      return image;
    }
    
    const width = resize_width || metadata.width;
    const height = resize_height || metadata.height;
    
    // Apply resize based on method
    switch (resize) {
      case config.constants.RESIZE_METHODS.OUTER: // Contain
        return image.resize({
          width,
          height,
          fit: 'inside',
          withoutEnlargement: true
        });
        
      case config.constants.RESIZE_METHODS.INNER: // Cover
        return image.resize({
          width,
          height,
          fit: 'cover'
        });
        
      case config.constants.RESIZE_METHODS.SMART: // Smart crop
        return image.resize({
          width,
          height,
          fit: 'cover',
          position: 'attention'
        });
        
      default:
        return image;
    }
  }
  
  /**
   * Apply format and compression settings
   * 
   * @param {Sharp} image - Sharp instance
   * @param {Object} options - Processing options
   * @param {Object} metadata - Image metadata
   * @returns {Promise<Object>} Processed image data
   */
  async applyFormatAndCompression(image, options, metadata) {
    const { compression, convertto, quality } = options;
    
    // Determine output format
    let outputFormat = metadata.format;
    if (convertto) {
      const formatMatch = convertto.match(/\+?(\w+)/);
      if (formatMatch && formatMatch[1]) {
        outputFormat = formatMatch[1];
      }
    }
    
    // Apply format and compression
    image = this.applyFormat(image, { 
      format: outputFormat,
      quality
    });
    
    image = this.applyCompression(image, { 
      compression,
      quality
    }, outputFormat);
    
    // If keeping EXIF data
    if (options.keep_exif) {
      image = image.withMetadata();
    }
    
    // Process and return the image
    const { data, info } = await image.toBuffer({ resolveWithObject: true });
    
    return {
      buffer: data,
      format: outputFormat,
      info
    };
  }
  
  /**
   * Apply format conversion
   * 
   * @param {Sharp} image - Sharp instance
   * @param {Object} options - Format options
   * @returns {Sharp} Modified Sharp instance
   */
  applyFormat(image, options) {
    const { format, quality, lossless } = options;
    
    switch (format) {
      case 'jpeg':
      case 'jpg':
        return image.jpeg({ 
          quality: quality || 80,
          mozjpeg: true // Use MozJPEG for better compression
        });
        
      case 'png':
        return image.png({ 
          quality: quality || 80,
          compressionLevel: 9, // Maximum compression
          adaptiveFiltering: true // Better compression with adaptive filtering
        });
        
      case 'webp':
        return image.webp({ 
          quality: quality || 80,
          lossless: lossless || false,
          smartSubsample: true // Better quality with smart subsampling
        });
        
      case 'avif':
        return image.avif({ 
          quality: quality || 50, // AVIF typically uses lower quality values
          lossless: lossless || false,
          speed: 3 // Balance between speed and compression (0-8, 0 is slowest/best)
        });
        
      case 'gif':
        return image.gif();
        
      default:
        return image; // Use input format
    }
  }
  
  /**
   * Apply compression based on type and format
   * 
   * @param {Sharp} image - Sharp instance
   * @param {Object} options - Compression options
   * @param {String} format - Image format
   * @returns {Sharp} Modified Sharp instance
   */
  applyCompression(image, options, format) {
    const { compression, quality } = options;
    const compressionType = config.image.compressionTypes[compression] || 'lossy';
    
    // Different formats have different compression options
    switch (format) {
      case 'jpeg':
      case 'jpg':
        return image.jpeg({ 
          quality: compressionType === 'lossless' ? 100 : (
            compressionType === 'glossy' ? 90 : (quality || 80)
          ),
          mozjpeg: true // Use MozJPEG for better compression
        });
        
      case 'png':
        return image.png({ 
          quality: quality || 80,
          compressionLevel: compressionType === 'lossless' ? 0 : (
            compressionType === 'glossy' ? 6 : 9
          ),
          adaptiveFiltering: true
        });
        
      case 'webp':
        return image.webp({ 
          quality: compressionType === 'lossless' ? 100 : (
            compressionType === 'glossy' ? 90 : (quality || 80)
          ),
          lossless: compressionType === 'lossless',
          smartSubsample: true
        });
        
      case 'avif':
        return image.avif({ 
          quality: compressionType === 'lossless' ? 100 : (
            compressionType === 'glossy' ? 70 : (quality || 50)
          ),
          lossless: compressionType === 'lossless',
          speed: 3 // Balance between speed and compression
        });
        
      default:
        return image; // Use default compression
    }
  }
  
  /**
   * Finalize image processing and get buffer
   * 
   * @param {Sharp} image - Sharp instance
   * @param {String} format - Output format
   * @returns {Promise<Object>} Processed image data
   */
  async finalizeImage(image, format) {
    // Ensure format is applied
    if (format) {
      image = this.applyFormat(image, { format });
    }
    
    // Get buffer with metadata
    const { data, info } = await image.toBuffer({ resolveWithObject: true });
    
    return {
      buffer: data,
      format: format || info.format,
      info
    };
  }
}

module.exports = new ImageProcessor();
