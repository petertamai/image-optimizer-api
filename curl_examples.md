**I. Simple Optimization (GET /optimize)**

*   **Endpoint:** `GET /optimize`
*   **Parameters:**
    *   `url` (required): URL of the image to optimize.
    *   `maxWidth` (optional): Maximum width of the output image (integer).
    *   `compression` (optional): Compression level (integer).
        *   `0`: Lossless
        *   `1`: Lossy (default)
        *   `2`: Glossy
    *   `apiKey` (optional): Your API key (can also be passed in the `x-api-key` header).

*   **Example Requests (using `https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg` as the test image):**

    *   **Basic Optimization:**
        *   URL: `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&apiKey=test`
    *   **With `maxWidth`:**
        *   URL: `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&maxWidth=800&apiKey=test`
    *   **With `compression`:**
        *   URL: `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&compression=0&apiKey=test` (Lossless)
        *   URL: `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&compression=2&apiKey=test` (Glossy)
    *   **All parameters combined:**
        *   URL: `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&maxWidth=600&compression=1&apiKey=test`
    *   **Using `x-api-key` header:**
        *   URL: `https://imgopt.petertam.pro/optimize?url=https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg&maxWidth=600&compression=1`
        *   Headers: `x-api-key: test`

**II. Advanced Optimization (POST /optimize)**

*   **Endpoint:** `POST /optimize`
*   **Parameters:**
    *   `url` (optional): URL of the image to optimize (string).  Required if `image` is not provided.
    *   `image` (optional): Binary image file upload. Required if `url` is not provided.  (multipart/form-data)
    *   `compression` (optional): Compression level (integer).
        *   `0`: Lossless
        *   `1`: Lossy (default)
        *   `2`: Glossy
    *   `resize` (optional): Resize method (integer).
        *   `0`: None (default)
        *   `1`: Outer/Contain
        *   `3`: Inner/Cover
        *   `4`: Smart
    *   `resize_width` (optional): Width for resizing (integer). Required if `resize` is not 0.
    *   `resize_height` (optional): Height for resizing (integer). Required if `resize` is not 0.
    *   `cmyk2rgb` (optional): Convert CMYK to RGB (integer).
        *   `0`: No
        *   `1`: Yes (default)
    *   `keep_exif` (optional): Keep EXIF metadata (integer).
        *   `0`: No (default)
        *   `1`: Yes
    *   `convertto` (optional): Output format (string).
        *   `jpeg`, `jpg`, `png`, `webp`, `avif`, `gif` (default: `webp`)
    *   `quality` (optional): Quality level (integer, 1-100). Default: 80
    *   `apiKey` (optional): Your API key (can also be passed in the `x-api-key` header).

*   **Example Requests:**

    *   **From URL, minimal parameters:**
        *   URL: `https://imgopt.petertam.pro/optimize`
        *   Headers: `x-api-key: test`, `Content-Type: application/json`
        *   Payload: `{"url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg"}`
    *   **From URL, all parameters:**
        *   URL: `https://imgopt.petertam.pro/optimize`
        *   Headers: `x-api-key: test`, `Content-Type: application/json`
        *   Payload:

            ```json
            {
              "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
              "compression": 2,
              "resize": 1,
              "resize_width": 700,
              "resize_height": 500,
              "cmyk2rgb": 0,
              "keep_exif": 1,
              "convertto": "png",
              "quality": 95
            }
            ```
    *   **From File Upload, minimal parameters:**
        *   URL: `https://imgopt.petertam.pro/optimize`
        *   Headers: `x-api-key: test`, `Content-Type: multipart/form-data`
        *   Payload:  (In ReqBin, use the file upload feature to upload the image.  You'll likely need to add a field named "image" and select the file.)
    *   **From File Upload, all parameters:**
        *   URL: `https://imgopt.petertam.pro/optimize`
        *   Headers: `x-api-key: test`, `Content-Type: multipart/form-data`
        *   Payload: (In ReqBin, use the file upload feature to upload the image.  You'll likely need to add a field named "image" and select the file.  Then, add other fields with the corresponding names and values.)  For example:
            *   `image`: (File upload)
            *   `compression`: `2`
            *   `resize`: `3`
            *   `resize_width`: `600`
            *   `resize_height`: `400`
            *   `cmyk2rgb`: `0`
            *   `keep_exif`: `1`
            *   `convertto`: `avif`
            *   `quality`: `75`

**III. Pipeline Processing (POST /pipeline)**

*   **Endpoint:** `POST /pipeline`
*   **Parameters:**
    *   `url` (optional): URL of the image to process (string). Required if `image` is not provided.
    *   `image` (optional): Binary image file upload. Required if `url` is not provided. (multipart/form-data)
    *   `pipeline` (required): JSON object or string with pipeline configuration.

*   **Pipeline Steps Reference (as JSON objects within the `pipeline.steps` array):**

    *   **Resize Step:**
        *   `type`: `"resize"`
        *   `width` (required): Width in pixels (integer).
        *   `height` (required): Height in pixels (integer).
        *   `fit` (optional): Fit method (string).
            *   `"inside"` (default)
            *   `"cover"`
            *   `"contain"`
            *   `"fill"`
            *   `"outside"`
        *   `position` (optional): Position for cropping (string).
            *   `"centre"` (default)
            *   `"north"`
            *   `"east"`
            *   `"south"`
            *   `"west"`
            *   `"northeast"`
            *   `"southeast"`
            *   `"southwest"`
            *   `"northwest"`
            *   `"attention"` (for smart cropping)

    *   **Convert Step:**
        *   `type`: `"convert"`
        *   `format` (required): Output format (string).
            *   `"jpeg"`, `"jpg"`, `"png"`, `"webp"`, `"avif"`, `"gif"`
        *   `quality` (optional): Quality level (integer, 1-100).
        *   `lossless` (optional): Use lossless compression (boolean). `true` or `false`.

    *   **Compress Step:**
        *   `type`: `"compress"`
        *   `level` (optional): Compression level (integer).
            *   `0`: Lossless
            *   `1`: Lossy (default)
            *   `2`: Glossy
        *   `quality` (optional): Quality level (integer, 1-100).

    *   **Rotate Step:**
        *   `type`: `"rotate"`
        *   `angle` (required): Rotation angle in degrees (integer).
        *   `background` (optional): Background color as RGBA object.
            *   `r`: Red (integer, 0-255)
            *   `g`: Green (integer, 0-255)
            *   `b`: Blue (integer, 0-255)
            *   `alpha`: Alpha (float, 0-1)

    *   **Flip Step:**
        *   `type`: `"flip"`
        *   `horizontal` (optional): Flip horizontally (boolean). `true` or `false`.
        *   `vertical` (optional): Flip vertically (boolean). `true` or `false`.

    *   **Metadata Step:**
        *   `type`: `"metadata"`
        *   `keepExif` (optional): Keep EXIF metadata (boolean). `true` or `false`.

*   **Example Requests:**

    *   **From URL, minimal pipeline (resize):**
        *   URL: `https://imgopt.petertam.pro/pipeline`
        *   Headers: `x-api-key: test`, `Content-Type: application/json`
        *   Payload:

            ```json
            {
              "url": "https://images.pexels.com/photos/5604369/pexels-photo-5604369.jpeg",
              "pipeline": {
                "steps": [
                  {
                    "type": "resize",
                    "width": 600,
                    "height": 400
                  }
                ]
              }
            }
            ```

    *   **From URL, complex pipeline (all steps):**
        *   URL: `https://imgopt.petertam.pro/pipeline`
        *   Headers: `x-api-key: test`, `Content-Type: application/json`
        *   Payload:

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
                    "width": 800,
                    "height": 600,
                    "fit": "cover",
                    "position": "attention"
                  },
                  {
                    "type": "rotate",
                    "angle": 180,
                    "background": {
                      "r": 255,
                      "g": 0,
                      "b": 0,
                      "alpha": 0.8
                    }
                  },
                  {
                    "type": "flip",
                    "horizontal": true,
                    "vertical": false
                  },
                  {
                    "type": "convert",
                    "format": "avif",
                    "quality": 70,
                    "lossless": false
                  },
                  {
                    "type": "compress",
                    "level": 2,
                    "quality": 60
                  }
                ]
              }
            }
            ```

    *   **From File Upload, minimal pipeline (resize):**
        *   URL: `https://imgopt.petertam.pro/pipeline`
        *   Headers: `x-api-key: test`, `Content-Type: multipart/form-data`
        *   Payload: (In ReqBin, upload the image file and add a `pipeline` field with the JSON string.  You might need to escape the quotes within the JSON string.)

            ```
            image: (File upload)
            pipeline: {"steps": [{"type": "resize", "width": 600, "height": 400}]}
            ```

    *   **From File Upload, complex pipeline (all steps):**
        *   URL: `https://imgopt.petertam.pro/pipeline`
        *   Headers: `x-api-key: test`, `Content-Type: multipart/form-data`
        *   Payload: (In ReqBin, upload the image file and add a `pipeline` field with the JSON string.  You might need to escape the quotes within the JSON string.)

            ```
            image: (File upload)
            pipeline: {"steps": [{"type": "metadata", "keepExif": false}, {"type": "resize", "width": 800, "height": 600, "fit": "cover", "position": "attention"}, {"type": "rotate", "angle": 180, "background": {"r": 255, "g": 0, "b": 0, "alpha": 0.8}}, {"type": "flip", "horizontal": true, "vertical": false}, {"type": "convert", "format": "avif", "quality": 70, "lossless": false}, {"type": "compress", "level": 2, "quality": 60}]}
            ```

**Key Reminders:**

*   **ReqBin Specifics:**  The exact steps for file uploads and handling JSON strings in `multipart/form-data` payloads depend on the version of ReqBin you're using.  Consult ReqBin's documentation or help resources if you're unsure.
*   **JSON Escaping:**  When embedding JSON strings within `multipart/form-data` payloads, you might need to escape the quotes (e.g., `"` becomes `\"`).
*   **Testing:**  Start with simple examples and gradually add complexity to ensure that each parameter and step is working as expected.
*   **Error Handling:**  Always check the HTTP status code and the response body for errors.

This should be a complete and exhaustive list of all options and parameters. Let me know if you have any other questions.
