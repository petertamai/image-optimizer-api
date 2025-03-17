'use strict';

const config = require('../config');

/**
 * Simple API key authentication middleware
 * Verifies that the request includes a valid API key in the header or query parameter
 */
module.exports = (req, res, next) => {
  // Skip authentication in development mode if configured to do so
  if (config.server.env === 'development' && process.env.SKIP_AUTH === 'true') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== config.server.apiKey) {
    return res.status(401).json({
      status: {
        code: -401,
        message: 'Invalid API key. Please provide a valid API key.'
      }
    });
  }
  
  next();
};