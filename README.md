# Image Optimizer API

A high-performance Node.js API for image optimization, resizing, and format conversion using the Sharp library. This service offers both simple and advanced image processing capabilities with support for pipeline operations.

## Features

- Image compression (lossy, glossy, lossless)
- Resizing (outer, inner, and smart cropping)
- Format conversion (WebP, AVIF, JPEG, PNG, GIF)
- EXIF data handling
- CMYK to RGB conversion
- Multi-step processing pipeline
- Support for both URL and binary image inputs
- Automatic file format detection
- Temporary file storage with automatic cleanup

## Requirements

- Node.js 18.x or higher
- NPM or Yarn
- PM2 (for production deployment)

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/image-optimizer-api.git
cd image-optimizer-api