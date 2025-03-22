**1. Simple Optimization (GET /optimize)**

*   **Example 1: Basic Optimization with URL**

    *   **URL:** `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&apiKey=test`
    *   **Method:** GET
    *   **Headers:** None (or `Content-Type: application/octet-stream` if ReqBin requires it)
    *   **Payload:** None

*   **Example 2: Specifying Max Width and Compression**

    *   **URL:** `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&maxWidth=600&compression=1&apiKey=test`
    *   **Method:** GET
    *   **Headers:** None (or `Content-Type: application/octet-stream` if ReqBin requires it)
    *   **Payload:** None

*   **Example 3: Using `x-api-key` Header**

    *   **URL:** `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&maxWidth=400`
    *   **Method:** GET
    *   **Headers:** `x-api-key: test`
    *   **Payload:** None

**2. Advanced Optimization (POST /optimize)**

*   **Example 4: Optimize from URL (JSON Payload)**

    *   **URL:** `https://imgopt.petertam.pro/optimize`
    *   **Method:** POST
    *   **Headers:**
        *   `x-api-key: test`
        *   `Content-Type: application/json`
    *   **Payload:**

        ```json
        {
          "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
          "resize": 1,
          "resize_width": 800,
          "resize_height": 600,
          "convertto": "webp",
          "quality": 90
        }
        ```

*   **Example 5: CMYK to RGB Conversion and EXIF Handling**

    *   **URL:** `https://imgopt.petertam.pro/optimize`
    *   **Method:** POST
    *   **Headers:**
        *   `x-api-key: test`
        *   `Content-Type: application/json`
    *   **Payload:**

        ```json
        {
          "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
          "cmyk2rgb": 1,
          "keep_exif": 0,
          "convertto": "png"
        }
        ```

*   **Example 6: Using `apiKey` in the body**

    *   **URL:** `https://imgopt.petertam.pro/optimize`
    *   **Method:** POST
    *   **Headers:**
        *   `Content-Type: application/json`
    *   **Payload:**

        ```json
        {
          "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
          "apiKey": "test",
          "resize": 1,
          "resize_width": 800,
          "resize_height": 600,
          "convertto": "webp",
          "quality": 90
        }
        ```

**3. Pipeline Processing (POST /pipeline)**

*   **Example 7: Basic Pipeline (Resize and Convert) - URL Input**

    *   **URL:** `https://imgopt.petertam.pro/pipeline`
    *   **Method:** POST
    *   **Headers:**
        *   `x-api-key: test`
        *   `Content-Type: application/json`
    *   **Payload:**

        ```json
        {
          "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
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
        }
        ```

*   **Example 8: Complex Pipeline (Multiple Steps) - URL Input**

    *   **URL:** `https://imgopt.petertam.pro/pipeline`
    *   **Method:** POST
    *   **Headers:**
        *   `x-api-key: test`
        *   `Content-Type: application/json`
    *   **Payload:**

        ```json
        {
          "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
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
        }
        ```

*   **Example 9: Rotate with Background Color**

    *   **URL:** `https://imgopt.petertam.pro/pipeline`
    *   **Method:** POST
    *   **Headers:**
        *   `x-api-key: test`
        *   `Content-Type: application/json`
    *   **Payload:**

        ```json
        {
          "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
          "pipeline": {
            "steps": [
              {
                "type": "rotate",
                "angle": 45,
                "background": {"r": 0, "g": 0, "b": 255, "alpha": 0.5}
              }
            ]
          }
        }
        ```

*   **Example 10: Flip Horizontally and Vertically**

    *   **URL:** `https://imgopt.petertam.pro/pipeline`
    *   **Method:** POST
    *   **Headers:**
        *   `x-api-key: test`
        *   `Content-Type: application/json`
    *   **Payload:**

        ```json
        {
          "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
          "pipeline": {
            "steps": [
              {
                "type": "flip",
                "horizontal": true,
                "vertical": true
              }
            ]
          }
        }
        ```

**Important Notes for ReqBin:**

*   **File Upload (multipart/form-data):**  ReqBin might have a specific way to handle file uploads.  Look for a "File" or "Binary" input field in ReqBin's interface.  You'll need to select the image file from your computer.  The `Content-Type` header should be set automatically by ReqBin when you use the file upload feature.  I can't provide the exact steps without knowing the specific version of ReqBin you're using.  If you need to upload a file, let me know and I'll try to help you find the right settings in ReqBin.
*   **Content-Type:**  Make sure the `Content-Type` header is set correctly.  `application/json` for JSON payloads and `multipart/form-data` for file uploads.
*   **API Key:**  Double-check that the API key is included in the header or payload as shown in the examples.
*   **Response:**  After sending the request, check the HTTP status code and the response body in ReqBin to see the results.

These examples should be directly usable in ReqBin.  Remember to adjust the parameters to your specific requirements. Good luck!
