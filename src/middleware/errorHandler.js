'use strict';

const { constants } = require('../config');

/**
 * Global error handling middleware
 * Provides consistent error responses
 */
module.exports = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error status and message
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  
  // Handle known error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'FileTypeError') {
    statusCode = 415;
    message = 'Unsupported file type';
    errorCode = constants.ERROR_CODES.UNSUPPORTED_FORMAT;
  } else if (err.name === 'DownloadError') {
    statusCode = 400;
    message = 'Could not download the image from the provided URL';
    errorCode = constants.ERROR_CODES.INVALID_URL;
  } else if (err.name === 'ProcessingError') {
    statusCode = 422;
    message = 'Error processing the image';
    errorCode = constants.ERROR_CODES.PROCESSING_ERROR;
  } else if (err.name === 'PayloadTooLargeError') {
    statusCode = 413;
    message = 'File too large';
    errorCode = constants.ERROR_CODES.FILE_TOO_LARGE;
  }
  
  // Send standardized error response
  res.status(statusCode).json({
    status: {
      code: -statusCode,
      message
    },
    error: {
      code: errorCode,
      details: config.server.env === 'development' ? err.stack : undefined
    }
  });
};