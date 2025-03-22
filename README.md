# Image Optimizer API

A high-performance Node.js API for image optimization, resizing, and format conversion using the Sharp library. This service offers both simple and advanced image processing capabilities with support for multi-step pipeline operations.

## Features

- Image compression (lossy, glossy, lossless)
- Resizing with multiple methods (outer/contain, inner/cover, smart cropping)
- Format conversion (WebP, AVIF, JPEG, PNG, GIF)
- EXIF data handling (preserve or strip)
- CMYK to RGB colour space conversion
- Multi-step processing pipeline for complex transformations
- Support for both URL and binary image inputs
- Automatic file format detection
- Temporary file storage with automatic cleanup

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
  - [Simple Optimization (GET)](#simple-optimization-get)
  - [Advanced Optimization (POST)](#advanced-optimization-post)
  - [Pipeline Processing (POST)](#pipeline-processing-post)
- [Request Parameters](#request-parameters)
- [Pipeline Steps Reference](#pipeline-steps-reference)
- [Response Format](#response-format)
- [Examples](#examples)
  - [Simple Optimization Example](#simple-optimization-example)
  - [Advanced Optimization Examples](#advanced-optimization-examples)
  - [Pipeline Processing Examples](#pipeline-processing-examples)
- [Error Handling](#error-handling)
- [Production Deployment](#production-deployment)

## Requirements

- Node.js 18.x or higher
- NPM or Yarn
- PM2 (for production deployment)

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/image-optimizer-api.git
cd image-optimizer-api
```

### Install dependencies

```bash
npm install
```

### Create environment file

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
API_KEY=your-api-key
STORAGE_PATH=./uploads
STORAGE_RETENTION_DAYS=3
DEFAULT_COMPRESSION=1
DEFAULT_MAX_WIDTH=1200
DEFAULT_QUALITY=80
DEFAULT_FORMAT=webp
LOG_LEVEL=info
```

### Run the application

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

Or with PM2:

```bash
pm2 start ecosystem.config.js
```

## Configuration

The application can be configured through environment variables or by editing the `config.js` file. The main configuration options are:

| Option | Description | Default |
|--------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `API_KEY` | API key for authentication | default-api-key-for-development |
| `STORAGE_PATH` | Path for storing temporary files | ./uploads |
| `STORAGE_RETENTION_DAYS` | Days to keep temporary files | 3 |
| `DEFAULT_COMPRESSION` | Default compression level (0: lossless, 1: lossy, 2: glossy) | 1 |
| `DEFAULT_MAX_WIDTH` | Default maximum width for resizing | 1200 |
| `DEFAULT_QUALITY` | Default quality level (1-100) | 80 |
| `DEFAULT_FORMAT` | Default output format | webp |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | info |

## API Endpoints

The API provides three main endpoints for image optimization:

### Simple Optimization (GET)

This endpoint provides a simple way to optimize images with minimal configuration. It returns the optimized image directly.

**Endpoint:** `GET /optimize`

**Authentication:** API key via `x-api-key` header or `apiKey` query parameter

**Query Parameters:**
- `url` (required): URL of the image to optimize
- `maxWidth` (optional): Maximum width of the output image
- `compression` (optional): Compression level (0: lossless, 1: lossy, 2: glossy)

**Response:** The optimized image binary data with appropriate content type header

### Advanced Optimization (POST)

This endpoint provides advanced optimization with more configuration options. It returns JSON with optimization results and a download URL.

**Endpoint:** `POST /optimize`

**Authentication:** API key via `x-api-key` header or `apiKey` query parameter

**Content-Type:** `application/json` or `multipart/form-data`

**Request Parameters:** See [Request Parameters](#request-parameters) section

**Response:** JSON with optimization results (see [Response Format](#response-format))

### Pipeline Processing (POST)

This endpoint allows for multi-step image processing with a sequence of operations. It returns JSON with processing results and a download URL.

**Endpoint:** `POST /pipeline`

**Authentication:** API key via `x-api-key` header or `apiKey` query parameter

**Content-Type:** `application/json` or `multipart/form-data`

**Request Parameters:**
- `url` (optional): URL of the image to process
- `image` (optional): Binary image file upload or base64 encoded image
- `pipeline` (required): JSON object or string with pipeline configuration (see [Pipeline Steps Reference](#pipeline-steps-reference))

**Response:** JSON with processing results (see [Response Format](#response-format))

## Request Parameters

For the `POST /optimize` endpoint, the following parameters are available:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `url` | string | URL of the image to optimize (required if no file upload) | - |
| `image` | file | Binary image file upload (required if no URL) | - |
| `compression` | integer | Compression level (0: lossless, 1: lossy, 2: glossy) | 1 |
| `resize` | integer | Resize method (0: none, 1: outer/contain, 3: inner/cover, 4: smart) | 0 |
| `resize_width` | integer | Width for resizing (required if resize != 0) | - |
| `resize_height` | integer | Height for resizing (required if resize != 0) | - |
| `cmyk2rgb` | integer | Convert CMYK to RGB (1: yes, 0: no) | 1 |
| `keep_exif` | integer | Keep EXIF metadata (1: yes, 0: no) | 0 |
| `convertto` | string | Output format (jpeg, jpg, png, webp, avif, gif) | webp |
| `quality` | integer | Quality level (1-100) | 80 |

## Pipeline Steps Reference

For the `POST /pipeline` endpoint, the pipeline configuration should be a JSON object with an array of steps. Each step is an object with a `type` property and additional parameters depending on the step type.

### Step Types and Parameters

#### Resize Step

```json
{
  "type": "resize",
  "width": 800,
  "height": 600,
  "fit": "inside",
  "position": "centre"
}
```

Parameters:
- `width` (required): Width in pixels
- `height` (required): Height in pixels
- `fit` (optional): Fit method ("inside", "cover", "contain", "fill", "outside")
- `position` (optional): Position for cropping ("centre", "north", "east", "south", "west", "northeast", "southeast", "southwest", "northwest", "attention" for smart cropping)

#### Convert Step

```json
{
  "type": "convert",
  "format": "webp",
  "quality": 80,
  "lossless": false
}
```

Parameters:
- `format` (required): Output format (jpeg, jpg, png, webp, avif, gif)
- `quality` (optional): Quality level (1-100)
- `lossless` (optional): Use lossless compression (true/false)

#### Compress Step

```json
{
  "type": "compress",
  "level": 1,
  "quality": 80
}
```

Parameters:
- `level` (optional): Compression level (0: lossless, 1: lossy, 2: glossy)
- `quality` (optional): Quality level (1-100)

#### Rotate Step

```json
{
  "type": "rotate",
  "angle": 90,
  "background": {"r": 255, "g": 255, "b": 255, "alpha": 0}
}
```

Parameters:
- `angle` (required): Rotation angle in degrees
- `background` (optional): Background color as RGBA object

#### Flip Step

```json
{
  "type": "flip",
  "horizontal": true,
  "vertical": false
}
```

Parameters:
- `horizontal` (optional): Flip horizontally (true/false)
- `vertical` (optional): Flip vertically (true/false)

#### Metadata Step

```json
{
  "type": "metadata",
  "keepExif": false
}
```

Parameters:
- `keepExif` (optional): Keep EXIF metadata (true/false)

## Response Format

For the `POST /optimize` and `POST /pipeline` endpoints, the response is a JSON object with the following structure:

```json
{
  "status": {
    "code": 2,
    "message": "Image processed successfully"
  },
  "originalUrl": "https://example.com/image.jpg",
  "originalSize": 1024000,
  "processedSize": 102400,
  "format": "webp",
  "width": 800,
  "height": 600,
  "compressionRatio": "10.00%",
  "downloadUrl": "http://localhost:3000/downloads/1234567890.webp",
  "base64": "data:image/webp;base64,..."
}
```

The `base64` field is only included for images smaller than 1MB.

## Examples

### Simple Optimization Example

#### Request

```
GET /optimize?url=https://example.com/image.jpg&maxWidth=800&compression=1&apiKey=your-api-key
```

#### Response

The optimized image binary data with appropriate content type header.

### Advanced Optimization Examples

#### Optimize from URL

```bash
curl -X POST "http://localhost:3000/optimize" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/image.jpg",
    "resize": 1,
    "resize_width": 800,
    "resize_height": 600,
    "convertto": "webp",
    "quality": 90
  }'
```

#### Optimize from File Upload

```bash
curl -X POST "http://localhost:3000/optimize" \
  -H "x-api-key: your-api-key" \
  -F "image=@/path/to/image.jpg" \
  -F "resize=1" \
  -F "resize_width=800" \
  -F "resize_height=600" \
  -F "convertto=webp" \
  -F "quality=90"
```

### Pipeline Processing Examples

#### Basic Pipeline with Resize and Convert

```bash
curl -X POST "http://localhost:3000/pipeline" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/image.jpg",
    "pipeline": {
      "steps": [
        {
          "type": "resize",
          "width": 800,
          "height": 600,
          "fit": "inside"
        },
        {
          "type": "convert",
          "format": "webp",
          "quality": 90
        }
      ]
    }
  }'
```

#### Complex Pipeline with Multiple Steps

```bash
curl -X POST "http://localhost:3000/pipeline" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/image.jpg",
    "pipeline": {
      "steps": [
        {
          "type": "metadata",
          "keepExif": false
        },
        {
          "type": "resize",
          "width": 1200,
          "height": 800,
          "fit": "inside"
        },
        {
          "type": "rotate",
          "angle": 90
        },
        {
          "type": "convert",
          "format": "avif",
          "quality": 80
        },
        {
          "type": "compress",
          "level": 1
        }
      ]
    }
  }'
```

#### File Upload with Pipeline

```bash
curl -X POST "http://localhost:3000/pipeline" \
  -H "x-api-key: your-api-key" \
  -F "image=@/path/to/image.jpg" \
  -F 'pipeline={"steps":[{"type":"resize","width":800,"height":600},{"type":"convert","format":"webp"}]}'
```

## Error Handling

The API returns standardized error responses with appropriate HTTP status codes. The general format for error responses is:

```json
{
  "status": {
    "code": -400,
    "message": "Error message"
  },
  "error": {
    "code": "ERROR_CODE",
    "details": "Error details (only in development mode)"
  }
}
```

Common error codes:

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | INVALID_API_KEY | Invalid or missing API key |
| 413 | FILE_TOO_LARGE | File size exceeds the maximum allowed size |
| 415 | UNSUPPORTED_FORMAT | Unsupported image format |
| 422 | PROCESSING_ERROR | Error processing the image |
| 500 | INTERNAL_SERVER_ERROR | Unexpected server error |

## Production Deployment

For production deployment, it's recommended to use PM2 for process management. The repository includes an `ecosystem.config.js` file with production-ready configuration.

### Deploy with PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

### PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs image-optimizer

# Restart the application
pm2 restart image-optimizer

# Stop the application
pm2 stop image-optimizer

# Set PM2 to start on boot
pm2 startup
pm2 save
```

### Environment Recommendations

- Use a reverse proxy like Nginx or Apache in front of the application
- Set up SSL/TLS for secure connections
- Use a strong API key for authentication
- Configure appropriate storage retention based on your needs
- Monitor server resources (CPU, memory, disk space)
