**Important Notes:**

*   **API Key:**  Remember to replace `"test"` with your actual API key in all requests.
*   **Content-Type:** Pay close attention to the `Content-Type` header.  `application/json` is used when sending JSON data, and `multipart/form-data` is used when uploading files.
*   **File Paths:**  Replace `/path/to/image.jpg` with the actual path to your image file on your system.
*   **Error Handling:**  Always check the HTTP status code and the JSON response body for errors.
*   **Base64 Encoding:** The `base64` field in the response is only included for images smaller than 1MB.

**1. Simple Optimization (GET /optimize)**

*   **Example 1: Basic Optimization with URL**

    ```bash
    curl "https://imgopt.petertam.pro/optimize?url=https://example.com/image.jpg&apiKey=test"
    ```

    This will download the optimized image directly.  The output will be the binary image data.  You'll need to save it to a file (e.g., `optimized.webp`) to view it.

*   **Example 2:  Specifying Max Width and Compression**

    ```bash
    curl "https://imgopt.petertam.pro/optimize?url=https://example.com/image.jpg&maxWidth=600&compression=1&apiKey=test"
    ```

    This optimizes the image, resizing it to a maximum width of 600 pixels and using lossy compression.

*   **Example 3:  Using `x-api-key` Header**

    ```bash
    curl -H "x-api-key: test" "https://imgopt.petertam.pro/optimize?url=https://example.com/image.jpg&maxWidth=400"
    ```

    This achieves the same as above, but passes the API key in the `x-api-key` header.

**2. Advanced Optimization (POST /optimize)**

*   **Example 4: Optimize from URL (JSON Payload)**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/optimize" \
      -H "x-api-key: test" \
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

    This resizes the image to 800x600 (using `outer/contain` resize), converts it to WebP format with a quality of 90, and includes the API key in the header.

*   **Example 5: Optimize from File Upload (multipart/form-data)**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/optimize" \
      -H "x-api-key: test" \
      -F "image=@/path/to/image.jpg" \
      -F "resize=1" \
      -F "resize_width=800" \
      -F "resize_height=600" \
      -F "convertto=webp" \
      -F "quality=90"
    ```

    This uploads the image file `/path/to/image.jpg` and applies the same optimization parameters as the previous example.

*   **Example 6:  CMYK to RGB Conversion and EXIF Handling**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/optimize" \
      -H "x-api-key: test" \
      -H "Content-Type: application/json" \
      -d '{
        "url": "https://example.com/image.jpg",
        "cmyk2rgb": 1,
        "keep_exif": 0,
        "convertto": "png"
      }'
    ```

    This converts the image from CMYK to RGB, strips EXIF metadata, and converts it to PNG format.

*   **Example 7: Using `apiKey` in the body**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/optimize" \
      -H "Content-Type: application/json" \
      -d '{
        "url": "https://example.com/image.jpg",
        "apiKey": "test",
        "resize": 1,
        "resize_width": 800,
        "resize_height": 600,
        "convertto": "webp",
        "quality": 90
      }'
    ```

    This is the same as example 4, but the API key is passed in the body.

**3. Pipeline Processing (POST /pipeline)**

*   **Example 8: Basic Pipeline (Resize and Convert) - URL Input**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/pipeline" \
      -H "x-api-key: test" \
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

    This resizes the image to fit inside an 800x600 box and converts it to WebP with a quality of 90.

*   **Example 9: Complex Pipeline (Multiple Steps) - URL Input**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/pipeline" \
      -H "x-api-key: test" \
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

    This pipeline strips EXIF data, resizes to fit inside 1200x800, rotates 90 degrees, converts to AVIF with a quality of 80, and applies lossy compression.

*   **Example 10: File Upload with Pipeline (multipart/form-data)**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/pipeline" \
      -H "x-api-key: test" \
      -F "image=@/path/to/image.jpg" \
      -F 'pipeline={"steps":[{"type":"resize","width":800,"height":600},{"type":"convert","format":"webp"}]}'
    ```

    This uploads the image file and applies a pipeline that resizes to 800x600 and converts to WebP.  Note the single quotes around the `pipeline` value to prevent shell interpretation issues.

*   **Example 11: Rotate with Background Color**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/pipeline" \
      -H "x-api-key: test" \
      -H "Content-Type: application/json" \
      -d '{
        "url": "https://example.com/image.jpg",
        "pipeline": {
          "steps": [
            {
              "type": "rotate",
              "angle": 45,
              "background": {"r": 0, "g": 0, "b": 255, "alpha": 0.5}
            }
          ]
        }
      }'
    ```

    This rotates the image 45 degrees with a semi-transparent blue background.

*   **Example 12: Flip Horizontally and Vertically**

    ```bash
    curl -X POST "https://imgopt.petertam.pro/pipeline" \
      -H "x-api-key: test" \
      -H "Content-Type: application/json" \
      -d '{
        "url": "https://example.com/image.jpg",
        "pipeline": {
          "steps": [
            {
              "type": "flip",
              "horizontal": true,
              "vertical": true
            }
          ]
        }
      }'
    ```

    This flips the image both horizontally and vertically.

**4. Error Handling Examples (Simulated)**

These examples show what *might* happen if you make a mistake.  The actual error messages and codes might vary slightly.

*   **Example 13: Invalid API Key**

    If you use an incorrect API key, you might get a response like this:

    ```json
    {
      "status": {
        "code": -401,
        "message": "Invalid API key"
      },
      "error": {
        "code": "INVALID_API_KEY",
        "details": "API key is invalid or missing"
      }
    }
    ```

*   **Example 14: Validation Error (Missing URL)**

    If you try to optimize without providing a URL or image, you might get:

    ```json
    {
      "status": {
        "code": -400,
        "message": "Validation error"
      },
      "error": {
        "code": "VALIDATION_ERROR",
        "details": "Missing required parameter: url or image"
      }
    }
    ```

*   **Example 15: Unsupported Format**

    If you try to process an image with an unsupported format, you might get:

    ```json
    {
      "status": {
        "code": -415,
        "message": "Unsupported image format"
      },
      "error": {
        "code": "UNSUPPORTED_FORMAT",
        "details": "The provided image format is not supported"
      }
    }
    ```

**Important Considerations:**

*   **URL Encoding:**  If your image URL contains special characters (e.g., spaces, question marks), make sure to URL-encode them properly.  `curl` usually handles this automatically, but be aware of it.
*   **File Size Limits:**  Be mindful of any file size limits imposed by the API.  The documentation mentions a `FILE_TOO_LARGE` error.
*   **Testing:**  Start with simple examples and gradually increase the complexity to ensure that each step in your pipeline is working correctly.
*   **Logging:**  Enable logging on your server to help diagnose any issues that may arise.

This comprehensive set of examples should give you a solid foundation for using the Image Optimizer API. Remember to adapt the examples to your specific needs and always check the API documentation for the most up-to-date information. Good luck!
