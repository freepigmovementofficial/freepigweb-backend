# Freepig Movement REST API Documentation 

Welcome to the REST API documentation for the **Freepig Movement** store and spotlight platform. This document covers authentication, standard response structures, and details for every single available endpoint.

---

## Base URL
- **Local Development**: `http://localhost:5000/api`
- **Staging / Production**: `https://freepigweb-backend-production.up.railway.app/api`

---

## Authentication

All protected endpoints require a JWT token transmitted via HTTP headers using the Bearer scheme:

```http
Authorization: Bearer <your_jwt_token>
```

Tokens are retrieved from either of these endpoints:
1. `POST /auth/verify-otp` (Registration verification)
2. `POST /auth/login` (Standard login)

There are two primary roles:
- **`USER`**: Can view catalogs, add items to wishlists, write reviews, and submit custom orders.
- **`ADMIN`**: Full administration rights (managing users, orders, releases, statistics).

---

## Standard Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {
    "key": "value"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description here",
  "errors": null
}
```
*(Validation errors from Zod include structured error fields)*:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Paginated Response Structure
Endpoints returning lists use this pagination layout inside the `data` envelope:
```json
{
  "success": true,
  "message": "Fetched successfully",
  "data": {
    "items": [],
    "meta": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Enum Values

| Enum Name | Allowed Values |
|-----------|----------------|
| **`Role`** | `USER`, `ADMIN` |
| **`SkillLevel`** | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `GROMS` |
| **`WaveLevel`** | `SMALL`, `MEDIUM`, `BIG`, `WAVE_POOL` |
| **`ImageType`** | `DECK`, `BOTTOM`, `NOSE`, `FINS`, `RAIL` |
| **`CustomOrderStatus`** | `PENDING`, `CONFIRMED`, `CANCELLED` |

---

## 1. Authentication Module (`/auth`)

### 1.1 Register User
- **Method & Path**: `POST /auth/register`
- **Description**: Submits registration details and triggers an email with a 6-digit OTP code to verify the account.
- **Authentication**: None
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `name` | `string` | Yes | Min 2 characters. |
  | `email` | `string` | Yes | Valid email address. Must be unique. |
  | `password` | `string` | Yes | Min 8 characters. |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "OTP sent to your email. Please verify your account.",
    "data": {
      "email": "user@example.com"
    }
  }
  ```

---

### 1.2 Verify OTP
- **Method & Path**: `POST /auth/verify-otp`
- **Description**: Verifies the email address using the 6-digit OTP received, saves the user to the database, and logs the user in.
- **Authentication**: None
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `email` | `string` | Yes | Valid email address. |
  | `code` | `string` | Yes | 6-digit OTP verification code. |

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Email verified. Registration complete!",
    "data": {
      "user": {
        "id": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
        "name": "Jane Doe",
        "email": "user@example.com",
        "role": "USER"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

---

### 1.3 Login User
- **Method & Path**: `POST /auth/login`
- **Description**: Authenticates user credentials and returns a Bearer JWT Token.
- **Authentication**: None
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `email` | `string` | Yes | Registered email. |
  | `password` | `string` | Yes | User password. |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
        "name": "Jane Doe",
        "email": "user@example.com",
        "role": "USER"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

---

### 1.4 Get Profile
- **Method & Path**: `GET /auth/me`
- **Description**: Retrieves current logged-in user profile info.
- **Authentication**: `USER` or `ADMIN`
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User fetched successfully",
    "data": {
      "id": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
      "name": "Jane Doe",
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2026-06-01T04:20:00Z"
    }
  }
  ```

---

## 2. Products Module (`/products`)

### 2.1 List All Products (Public)
- **Method & Path**: `GET /products`
- **Description**: Returns all active products. Includes average rating calculated from product reviews.
- **Authentication**: None
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `page` | `string` | No | Page number (default: `1`). |
  | `limit` | `string` | No | Limit per page (default: `12`). |
  | `search` | `string` | No | Case-insensitive product title query. |
  | `categoryId` | `string` | No | Filter by category UUID. |
  | `skillLevel` | `SkillLevel` | No | Filter by product skillLevel. |
  | `waveLevel` | `WaveLevel` | No | Filter by wave levels. |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Products fetched successfully",
    "data": {
      "products": [
        {
          "id": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
          "name": "Freepig Fish 5.8",
          "slug": "freepig-fish-5-8",
          "skillLevel": "INTERMEDIATE",
          "waveLevels": ["SMALL", "MEDIUM"],
          "isActive": true,
          "categoryId": "c47f7d1b-0e1c-43f1-bd1b-c744ef65cb68",
          "images": [
            {
              "id": "40ab12f0-51c3-4d43-bb90-e5bf7e0d37e2",
              "url": "https://res.cloudinary.com/.../img.png",
              "order": 0,
              "type": "DECK"
            }
          ],
          "avgRating": 4.5
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 12,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

---

### 2.2 Get All Categories (Public)
- **Method & Path**: `GET /products/categories`
- **Description**: Retrieves all surf board categories.
- **Authentication**: None
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Categories fetched",
    "data": [
      {
        "id": "c47f7d1b-0e1c-43f1-bd1b-c744ef65cb68",
        "name": "Fish Board",
        "slug": "fish-board"
      }
    ]
  }
  ```

---

### 2.3 Get Product Detail (Public)
- **Method & Path**: `GET /products/:slug`
- **Description**: Returns complete details of a single product using its slug.
- **Authentication**: None
- **Parameters**:
  - `slug` (Path parameter): Unique product URL slug.

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Product fetched successfully",
    "data": {
      "id": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
      "name": "Freepig Fish 5.8",
      "slug": "freepig-fish-5-8",
      "description": "Premium speed and fish tail design.",
      "skillLevel": "INTERMEDIATE",
      "waveLevels": ["SMALL", "MEDIUM"],
      "isActive": true,
      "category": {
        "id": "c47f7d1b-0e1c-43f1-bd1b-c744ef65cb68",
        "name": "Fish Board"
      },
      "images": [
        {
          "id": "40ab12f0-51c3-4d43-bb90-e5bf7e0d37e2",
          "url": "https://res.cloudinary.com/.../img.png",
          "order": 0,
          "type": "DECK"
        }
      ],
      "dimensions": [
        {
          "id": "31fe11bc-9e12-4011-87ab-0bb183c267c1",
          "size": "5'8\"",
          "width": "20 1/2\"",
          "thickness": "2 3/8\"",
          "volume": "32L"
        }
      ],
      "avgRating": 4.5
    }
  }
  ```

---

### 2.4 Create Product (Admin Only)
- **Method & Path**: `POST /products`
- **Description**: Creates a new product. Generates the `slug` automatically based on the `name`.
- **Authentication**: `ADMIN`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `name` | `string` | Yes | Min 2 characters. |
  | `description` | `string` | No | Detailed description. |
  | `categoryId` | `string` | Yes | UUID of category. |
  | `skillLevel` | `SkillLevel` | Yes | Board skill levels. |
  | `waveLevels` | `array` | Yes | List of `WaveLevel` enums (min 1). |
  | `dimensions` | `array object`| Yes | Dimension of board insteed size, width, thickness, and volume|
  
- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": {
      "id": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
      "name": "Freepig Fish 5.8",
      "slug": "freepig-fish-5-8",
      "skillLevel": "INTERMEDIATE",
      "dimensions": [
        {
          "size": "6cm",
          "width": "5m",
          "thickness": "87mm",
          "volume": "0.9llm"
        }
      ]
    }
  }
  ```

---

### 2.5 Update Product (Admin Only)
- **Method & Path**: `PUT /products/:id`
- **Description**: Updates product general specs.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Product UUID.
- **Request Body**: Same properties as create, but all optional. Supports `isActive` (boolean).

---

### 2.6 Delete Product (Admin Only)
- **Method & Path**: `DELETE /products/:id`
- **Description**: Deletes product from database and **automatically destroys all associated images from Cloudinary**.
- **Authentication**: `ADMIN`

---

### 2.7 Upload Product Images (Admin Only)
- **Method & Path**: `POST /products/:id/images`
- **Description**: Uploads up to 10 images directly as binary buffers to Cloudinary.
- **Authentication**: `ADMIN`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  - `images` (File): Key hosting file arrays. Supports `.jpg`, `.png`, `.webp` (Max 5MB each).
  - `types` (string | array): List of image positions aligned with each image (mapped to `ImageType` enums: `DECK`, `BOTTOM`, etc.).

---

### 2.8 Delete Product Image (Admin Only)
- **Method & Path**: `DELETE /products/:id/images/:imageId`
- **Description**: Detaches and deletes the image record, purging the file from Cloudinary storage.
- **Authentication**: `ADMIN`

---

### 2.9 Set Product Primary Image (Admin Only)
- **Method & Path**: `PATCH /products/:id/images/:imageId/primary`
- **Description**: Designates a specific product image as the primary (main) photo. All other images of the product will have their primary flag cleared.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Product UUID.
  - `imageId` (Path): ProductImage UUID.
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Image set as primary successfully",
    "data": [
      {
        "id": "cdfe6fd7-67b3-4612-8680-8d7ae5e6ecc2",
        "url": "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129953/surf-store/products/claim-claim-%281%29.jpg",
        "type": "DECK",
        "order": 1,
        "isPrimary": true,
        "productId": "ec7b6d53-06a8-4450-a6b7-901ab5c6225b"
      },
      {
        "id": "0a4fa756-0245-40c3-85e6-2e9365282954",
        "url": "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129950/surf-store/products/claim-claim-logo.jpg",
        "type": "LOGO",
        "order": 0,
        "isPrimary": false,
        "productId": "ec7b6d53-06a8-4450-a6b7-901ab5c6225b"
      }
    ]
  }
  ```

---

### 2.10 Add Product Dimension (Admin Only)
- **Method & Path**: `POST /products/:id/dimensions`
- **Description**: Creates specific size variation matrices for a surfboard.
- **Authentication**: `ADMIN`
- **Request Body**:
  - `size` (string): e.g. `5'10"`
  - `width` (string): e.g. `19 3/4"`
  - `thickness` (string): e.g. `2 1/2"`
  - `volume` (string, optional): e.g. `31.5L`

---

### 2.11 Delete Product Dimension (Admin Only)
- **Method & Path**: `DELETE /products/:id/dimensions/:dimensionId`
- **Description**: Deletes a size variant.
- **Authentication**: `ADMIN`

---

## 3. Reviews Module (`/products/:productId/reviews`, `/reviews`)

### 3.1 List Product Reviews (Public)
- **Method & Path**: `GET /products/:productId/reviews`
- **Description**: Gets all reviews submitted for a surfboard. Includes paginated results.
- **Authentication**: None
- **Query Parameters**: `page`, `limit` (standard pagination parameters).

---

### 3.2 Create Review
- **Method & Path**: `POST /products/:productId/reviews`
- **Description**: Creates a user product review. Users can only write **one review per product**.
- **Authentication**: `USER` or `ADMIN`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `rating` | `number` | Yes | Integer between `1` and `5`. |
  | `comment` | `string` | No | Written review feedback. |

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Review created successfully",
    "data": {
      "id": "e2cd7d9b-d7d8-4f8e-a9ff-ef78cb0eb52e",
      "rating": 5,
      "comment": "Incredible board!"
    }
  }
  ```

---

### 3.3 Update Review
- **Method & Path**: `PUT /reviews/:id`
- **Description**: Updates a review. Users can only modify reviews **belonging to themselves**.
- **Authentication**: `USER` or `ADMIN`
- **Request Body**: `rating` (1-5, optional), `comment` (string, optional).

---

### 3.4 Delete Review
- **Method & Path**: `DELETE /reviews/:id`
- **Description**: Deletes a review. Users can only delete their own reviews; Admins can delete any review.
- **Authentication**: `USER` or `ADMIN`

---

## 4. Wishlist Module (`/wishlist`)

### 4.1 Toggle Wishlist Product
- **Method & Path**: `POST /wishlist/:productId`
- **Description**: Saves or removes a product in a user's wishlist catalog. If it is already wishlisted, it deletes it; otherwise, it creates it.
- **Authentication**: `USER` or `ADMIN`
- **Example Success Response (Added)**:
  ```json
  {
    "success": true,
    "message": "Product added to wishlist",
    "data": {
      "action": "added",
      "wishlist": {
        "id": "90fe83fa-b0f1-4322-9fa9-ef8a10bc11e3",
        "productId": "d0408544-e22a-43cf-be79-cc7cc0ebfaee"
      }
    }
  }
  ```

---

### 4.2 Get My Wishlist
- **Method & Path**: `GET /wishlist`
- **Description**: Retrieves all saved wishlist products for the logged-in user.
- **Authentication**: `USER` or `ADMIN`

---

### 4.3 Check Wishlist Status
- **Method & Path**: `GET /wishlist/:productId/check`
- **Description**: Simple utility verifying whether a product is currently wishlisted by the user.
- **Authentication**: `USER` or `ADMIN`
- **Example Success Response**:
  ```json
  {
    "success": true,
    "message": "Wishlist status fetched successfully",
    "data": {
      "isWishlisted": true
    }
  }
  ```

---

## 🛹 5. Riders Module (`/riders`)

### 5.1 List All Riders (Public)
- **Method & Path**: `GET /riders`
- **Description**: Lists active riders spotlights.
- **Authentication**: None
- **Query Parameters**: `page`, `limit` (standard pagination parameters).

---

### 5.2 Get Rider Detail (Public)
- **Method & Path**: `GET /riders/:id`
- **Description**: Retrieves detailed rider info and ordered photos.
- **Authentication**: None

---

### 5.3 Create Rider (Admin Only)
- **Method & Path**: `POST /riders`
- **Description**: Registers a rider profile. Images are uploaded in a subsequent step.
- **Authentication**: `ADMIN`
- **Request Body**:
  - `name` (string): Rider name.
  - `location` (string): Home spot location.
  - `bio` (string): Bio text description (min 10 chars).

---

### 5.4 Update Rider (Admin Only)
- **Method & Path**: `PUT /riders/:id`
- **Description**: Updates rider fields. Supports `isActive` toggles.
- **Authentication**: `ADMIN`

---

### 5.5 Delete Rider (Admin Only)
- **Method & Path**: `DELETE /riders/:id`
- **Description**: Purges a rider profile. **Automatically purges all their rider image files from Cloudinary storage**.
- **Authentication**: `ADMIN`

---

### 5.6 Upload Rider Images (Admin Only)
- **Method & Path**: `POST /riders/:id/images`
- **Description**: Uploads photos for a rider profile to Cloudinary. Supports up to 10 files.
- **Authentication**: `ADMIN`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  - `images` (File): Binary stream files.

---

### 5.7 Delete Rider Image (Admin Only)
- **Method & Path**: `DELETE /riders/:id/images/:imageId`
- **Description**: Deletes a rider image record and purges the file from Cloudinary.
- **Authentication**: `ADMIN`

---

### 5.8 Upload Rider Video (Admin Only)
- **Method & Path**: `POST /riders/:id/video`
- **Description**: Uploads a single video profile for the rider to Cloudinary. Supports formats like `mp4`, `mov`, `webm` (up to 50MB). Automatically deletes the previous video file from Cloudinary if one exists.
- **Authentication**: `ADMIN`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  - `video` (File): Binary video file stream.
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Rider video uploaded successfully",
    "data": {
      "id": "5cb19e2f-e8b9-450a-8bf1-2292f7c00e12",
      "name": "Jane Doe",
      "location": "Bali, Indonesia",
      "bio": "Professional surfer from Bali with 10+ years experience.",
      "videoUrl": "https://res.cloudinary.com/dlkjeffiv/video/upload/v1780129953/surf-store/riders/jane-doe/video.mp4",
      "isActive": true,
      "createdAt": "2026-06-01T04:20:00.000Z",
      "updatedAt": "2026-06-02T09:03:00.000Z",
      "images": []
    }
  }
  ```

---

### 5.9 Delete Rider Video (Admin Only)
- **Method & Path**: `DELETE /riders/:id/video`
- **Description**: Detaches the video URL and deletes the video file from Cloudinary storage.
- **Authentication**: `ADMIN`
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Rider video deleted successfully",
    "data": {
      "id": "5cb19e2f-e8b9-450a-8bf1-2292f7c00e12",
      "name": "Jane Doe",
      "location": "Bali, Indonesia",
      "bio": "Professional surfer from Bali with 10+ years experience.",
      "videoUrl": null,
      "isActive": true,
      "createdAt": "2026-06-01T04:20:00.000Z",
      "updatedAt": "2026-06-02T09:03:00.000Z",
      "images": []
    }
  }
  ```

---

## 6. Custom Orders Module (`/custom-orders`)

### 6.1 Submit Custom Order Enquiry
- **Method & Path**: `POST /custom-orders`
- **Description**: Files a custom board enquiry form request. Default status set to `PENDING`.
- **Authentication**: `USER` or `ADMIN`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `name` | `string` | Yes | Contact name (manual input). |
  | `phone` | `string` | Yes | Phone number (min 8 digits). |
  | `location` | `string` | Yes | Location address details. |
  | `enquiry` | `string` | Yes | Description detailing requests (dimensions, shapes). |

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Custom order submitted successfully",
    "data": {
      "id": "5cb19e2f-e8b9-450a-8bf1-2292f7c00e12",
      "name": "Alex",
      "phone": "+62812345678",
      "status": "PENDING"
    }
  }
  ```

---

### 6.2 Get My Custom Orders
- **Method & Path**: `GET /custom-orders/me`
- **Description**: Lists paginated history of custom orders submitted by the logged-in user.
- **Authentication**: `USER` or `ADMIN`

---

### 6.3 Get Custom Order Detail
- **Method & Path**: `GET /custom-orders/:id`
- **Description**: Detail of an order. Users can only view their own custom orders; Admins can view any order.
- **Authentication**: `USER` or `ADMIN`

---

## 7. Admin Module (`/admin`)

### 7.1 Dashboard Statistics
- **Method & Path**: `GET /admin/dashboard`
- **Description**: Retrieves aggregate analytics counts for the admin homepage.
- **Authentication**: `ADMIN`
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Dashboard statistics fetched successfully",
    "data": {
      "products": {
        "totalSurfboards": 18,
        "totalAccessories": 14,
        "total": 32
      },
      "totalUsers": 211,
      "totalRiders": 8,
      "storeReviews": {
        "total": 20,
        "avgRating": 4.5
      },
      "totalTestimonials": 12,
      "totalGalleries": 6,
      "totalFeaturedSections": 3,
      "activeNewRelease": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Summer 2026 Collection"
      }
    }
  }
  ```

---

### 7.2 List All Users
- **Method & Path**: `GET /admin/users`
- **Description**: List of registered user accounts.
- **Authentication**: `ADMIN`
- **Query Parameters**: `page`, `limit`, `search` (searches across name or email).

---

### 7.3 Delete User
- **Method & Path**: `DELETE /admin/users/:id`
- **Description**: Permenantly removes a user account. Admins **cannot delete other admin accounts**.
- **Authentication**: `ADMIN`

---

### 7.4 List All Custom Orders
- **Method & Path**: `GET /admin/custom-orders`
- **Description**: Lists custom order requests.
- **Authentication**: `ADMIN`
- **Query Parameters**:
  - `page`, `limit`
  - `status` (`CustomOrderStatus` filter: `PENDING`, `CONFIRMED`, `CANCELLED`).

---

### 7.5 Update Custom Order Status
- **Method & Path**: `PATCH /admin/custom-orders/:id/status`
- **Description**: Transition order status. Can only be updated to `CONFIRMED` or `CANCELLED`.
- **Authentication**: `ADMIN`
- **Request Body**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```

---

### 7.6 List All Global Reviews
- **Method & Path**: `GET /admin/reviews`
- **Description**: Lists all user reviews on the platform. Includes product metadata.
- **Authentication**: `ADMIN`

---

### 7.7 Delete Any Review
- **Method & Path**: `DELETE /admin/reviews/:id`
- **Description**: Force-deletes a review written by any user.
- **Authentication**: `ADMIN`

---

## 8. New Releases Module (`/new-releases`)

### 8.1 Get Active New Release (Public)
- **Method & Path**: `GET /new-releases/active`
- **Description**: Fetches the currently active marketing new release with its video stream, featured product details, and up to 2 high-quality release images.
- **Authentication**: None
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Active new release fetched successfully",
    "data": {
      "id": "cc7cc0eb-d040-43cf-be79-faeed0408544",
      "title": "The Summer Release 2026",
      "description": "Introducing our state of the art performance surfs.",
      "videoUrl": "https://res.cloudinary.com/.../video.mp4",
      "isActive": true,
      "product": {
        "id": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
        "name": "Freepig Fish 5.8",
        "slug": "freepig-fish-5-8"
      },
      "images": [
        {
          "id": "e211ba90-51c3-4d43-bb90-e5bf7e0d37e2",
          "url": "https://res.cloudinary.com/.../release-img1.png",
          "order": 0
        }
      ]
    }
  }
  ```

---

### 8.2 List All Releases (Admin Only)
- **Method & Path**: `GET /new-releases`
- **Description**: Lists all releases created in the system.
- **Authentication**: `ADMIN`

---

### 8.3 Create New Release (Admin Only)
- **Method & Path**: `POST /new-releases`
- **Description**: Creates a new release campaign entry. Videos and marketing images are uploaded separately.
- **Authentication**: `ADMIN`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | `string` | Yes | Min 2 characters. |
  | `description` | `string` | Yes | Min 10 characters. |
  | `videoUrl` | `string` | No | Initial URL reference (can be empty string). |
  | `productId` | `string` | No | Associated product UUID to feature. |
  | `isActive` | `boolean` | No | Active flag (default: `false`). If set to `true`, **all other releases are automatically set to `isActive: false`**. |

---

### 8.4 Update Release Specs (Admin Only)
- **Method & Path**: `PUT /new-releases/:id`
- **Description**: Modifies text or active product association.
- **Authentication**: `ADMIN`

---

### 8.5 Delete Release (Admin Only)
- **Method & Path**: `DELETE /new-releases/:id`
- **Description**: Removes the release campaign and **purges its background video and release images from Cloudinary**.
- **Authentication**: `ADMIN`

---

### 8.6 Upload Background Video (Admin Only)
- **Method & Path**: `POST /new-releases/:id/video`
- **Description**: Uploads a video background file directly to Cloudinary. Stream-uploads in chunks up to 50MB. Allowed formats: `mp4`, `mov`, `webm`. **Automatically deletes the previous release video from Cloudinary if it exists**.
- **Authentication**: `ADMIN`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  - `video` (File): Binary video file stream.

---

### 8.7 Toggle Release Active (Admin Only)
- **Method & Path**: `PATCH /new-releases/:id/toggle`
- **Description**: Toggles active state. If activating this release, **automatically deactivates the currently active release**.
- **Authentication**: `ADMIN`

---

### 8.8 Upload Release Images (Admin Only)
- **Method & Path**: `POST /new-releases/:id/images`
- **Description**: Uploads high-quality marketing campaign images to Cloudinary (up to 2 files).
- **Authentication**: `ADMIN`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  - `images` (File): Binary stream files.

---

### 8.9 Delete Release Image (Admin Only)
- **Method & Path**: `DELETE /new-releases/:id/images/:imageId`
- **Description**: Removes a release image and destroys its asset file on Cloudinary.
- **Authentication**: `ADMIN`

---

## 9. Featured Sections Module (`/featured`)

Featured Sections allow the admin to curate a highlighted collection of products displayed on the storefront. **Only one featured section can be active at any time** — activating one automatically deactivates all others.

### 9.1 Get Active Featured Section (Public)
- **Method & Path**: `GET /featured/active`
- **Description**: Fetches the currently active featured section with its full product catalog. Products are ordered by their `order` field (ascending). Each product includes images (sorted by `isPrimary` DESC, `order` ASC), category, name, slug, skillLevel, and waveLevels.
- **Authentication**: None
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Active featured section fetched successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Summer Picks 2026",
      "isActive": true,
      "createdAt": "2026-06-01T04:20:00.000Z",
      "updatedAt": "2026-06-02T09:03:00.000Z",
      "products": [
        {
          "id": "fp-001",
          "order": 0,
          "featuredSectionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "productId": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
          "product": {
            "id": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
            "name": "Freepig Fish 5.8",
            "slug": "freepig-fish-5-8",
            "skillLevel": "INTERMEDIATE",
            "waveLevels": ["SMALL", "MEDIUM"],
            "category": {
              "id": "c47f7d1b-0e1c-43f1-bd1b-c744ef65cb68",
              "name": "Fish Board",
              "slug": "fish-board"
            },
            "images": [
              {
                "id": "40ab12f0-51c3-4d43-bb90-e5bf7e0d37e2",
                "url": "https://res.cloudinary.com/.../img.png",
                "order": 0,
                "isPrimary": true,
                "type": "DECK"
              }
            ]
          }
        }
      ]
    }
  }
  ```
- **Error Response (`404`)**: Returned when no featured section is currently active.

---

### 9.2 List All Featured Sections (Admin Only)
- **Method & Path**: `GET /featured`
- **Description**: Lists all featured sections (active and inactive), ordered by creation date descending. Each section includes its associated products with full details.
- **Authentication**: `ADMIN`
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Featured sections fetched successfully",
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Summer Picks 2026",
        "isActive": true,
        "createdAt": "2026-06-01T04:20:00.000Z",
        "updatedAt": "2026-06-02T09:03:00.000Z",
        "products": []
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "title": "Best Sellers",
        "isActive": false,
        "createdAt": "2026-05-15T10:00:00.000Z",
        "updatedAt": "2026-05-20T12:30:00.000Z",
        "products": []
      }
    ]
  }
  ```

---

### 9.3 Create Featured Section (Admin Only)
- **Method & Path**: `POST /featured`
- **Description**: Creates a new featured section. The section is created with `isActive: false` by default. Products must be assigned separately.
- **Authentication**: `ADMIN`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | `string` | Yes | Min 2 characters. Display title for the section. |

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Featured section created successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Summer Picks 2026",
      "isActive": false,
      "createdAt": "2026-06-01T04:20:00.000Z",
      "updatedAt": "2026-06-01T04:20:00.000Z",
      "products": []
    }
  }
  ```

---

### 9.4 Update Featured Section (Admin Only)
- **Method & Path**: `PUT /featured/:id`
- **Description**: Updates the title of an existing featured section.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Featured section UUID.
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | `string` | Yes | Min 2 characters. Updated display title. |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Featured section updated successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Updated Summer Picks 2026",
      "isActive": true,
      "createdAt": "2026-06-01T04:20:00.000Z",
      "updatedAt": "2026-06-03T08:15:00.000Z",
      "products": []
    }
  }
  ```

---

### 9.5 Delete Featured Section (Admin Only)
- **Method & Path**: `DELETE /featured/:id`
- **Description**: Permanently deletes a featured section. All associated featured product entries are automatically removed via cascade delete.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Featured section UUID.
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Featured section deleted successfully",
    "data": {
      "message": "Featured section deleted successfully"
    }
  }
  ```

---

### 9.6 Set Featured Products (Admin Only)
- **Method & Path**: `POST /featured/:id/products`
- **Description**: Replaces the entire product list of a featured section. All existing featured products are removed and replaced with the new list in a single atomic transaction (`prisma.$transaction`). Products are ordered based on their position in the submitted array.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Featured section UUID.
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `productIds` | `string[]` | Yes | Array of product UUIDs. Min 1 item. Order in the array determines display order. |

- **Example Request Body**:
  ```json
  {
    "productIds": [
      "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
      "e1509655-f33b-54d0-cf90-dd8dd1fcgbff",
      "f2610766-a44c-65e1-d0a1-ee9ee2gdhcgg"
    ]
  }
  ```

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Featured products set successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Summer Picks 2026",
      "isActive": true,
      "products": [
        {
          "id": "fp-001",
          "order": 0,
          "productId": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
          "product": {
            "id": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
            "name": "Freepig Fish 5.8",
            "slug": "freepig-fish-5-8",
            "images": [],
            "category": { "id": "...", "name": "Fish Board", "slug": "fish-board" }
          }
        }
      ]
    }
  }
  ```

- **Error Response (`400`)**: Returned when one or more `productIds` do not exist in the database.
  ```json
  {
    "success": false,
    "message": "Products not found: e1509655-f33b-54d0-cf90-dd8dd1fcgbff",
    "errors": null
  }
  ```

---

### 9.7 Remove Product from Featured (Admin Only)
- **Method & Path**: `DELETE /featured/:id/products/:productId`
- **Description**: Removes a single product from a featured section without affecting other products in the list.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Featured section UUID.
  - `productId` (Path): Product UUID to remove.
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Product removed from featured section",
    "data": {
      "message": "Product removed from featured section"
    }
  }
  ```
- **Error Response (`404`)**: Returned when the product is not found in the specified featured section.

---

### 9.8 Toggle Featured Section Active (Admin Only)
- **Method & Path**: `PATCH /featured/:id/toggle`
- **Description**: Toggles the `isActive` status of a featured section. **When activating a section, all other sections are automatically set to `isActive: false`** to enforce the single-active constraint. Deactivating a section does not affect other sections.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Featured section UUID.
- **Example Success Response (Activated, `200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Featured section activated successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Summer Picks 2026",
      "isActive": true,
      "createdAt": "2026-06-01T04:20:00.000Z",
      "updatedAt": "2026-06-03T14:00:00.000Z",
      "products": []
    }
  }
  ```
- **Example Success Response (Deactivated, `200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Featured section deactivated successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Summer Picks 2026",
      "isActive": false,
      "createdAt": "2026-06-01T04:20:00.000Z",
      "updatedAt": "2026-06-03T14:00:00.000Z",
      "products": []
    }
  }
  ```

---

## 10. Store Reviews Module (`/store-reviews`)

### 10.1 List Store Reviews (Public)
- **Method & Path**: `GET /store-reviews`
- **Description**: Gets all reviews submitted for the surf store. Returns paginated results, the average store rating (`avgRating`), total review count (`totalReviews`), and a flag (`hasReviewed`) indicating if the requesting authenticated user has already reviewed the store.
- **Authentication**: None (Optional Bearer token is parsed from headers to compute `hasReviewed`)
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `page` | `string` | No | Page number (default: `1`). |
  | `limit` | `string` | No | Limit per page (default: `10`). |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Store reviews fetched successfully",
    "data": {
      "avgRating": 4.5,
      "totalReviews": 20,
      "hasReviewed": true,
      "reviews": [
        {
          "id": "e2cd7d9b-d7d8-4f8e-a9ff-ef78cb0eb52e",
          "rating": 5,
          "comment": "Best surf store ever!",
          "createdAt": "2026-06-03T10:30:00.000Z",
          "userId": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
          "user": {
            "id": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
            "name": "Jane Doe",
            "email": "user@example.com",
            "role": "USER",
            "createdAt": "2026-06-01T04:20:00.000Z"
          }
        }
      ],
      "meta": {
        "total": 20,
        "page": 1,
        "limit": 10,
        "totalPages": 2,
        "hasNextPage": true,
        "hasPrevPage": false
      }
    }
  }
  ```

---

### 10.2 Create Store Review
- **Method & Path**: `POST /store-reviews`
- **Description**: Submits a review for the store. A user can only review the store **once**.
- **Authentication**: `USER` or `ADMIN`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `rating` | `number` | Yes | Integer between `1` and `5`. |
  | `comment` | `string` | No | Feedback description. |

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Store review created successfully",
    "data": {
      "id": "e2cd7d9b-d7d8-4f8e-a9ff-ef78cb0eb52e",
      "rating": 5,
      "comment": "Excellent customer service!",
      "createdAt": "2026-06-03T10:31:00.000Z",
      "userId": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
      "user": {
        "id": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
        "name": "Jane Doe",
        "email": "user@example.com",
        "role": "USER",
        "createdAt": "2026-06-01T04:20:00.000Z"
      }
    }
  }
  ```
- **Error Response (`409 Conflict`)**: Returned when the user has already submitted a store review.
  ```json
  {
    "success": false,
    "message": "You have already reviewed the store",
    "errors": null
  }
  ```

---

### 10.3 Update Store Review
- **Method & Path**: `PUT /store-reviews/:id`
- **Description**: Updates the rating or comment of a user's store review. Users can only update their **own** reviews.
- **Authentication**: `USER` or `ADMIN`
- **Parameters**:
  - `id` (Path): StoreReview UUID.
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `rating` | `number` | No | Integer between `1` and `5`. |
  | `comment` | `string` | No | Feedback description. |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Store review updated successfully",
    "data": {
      "id": "e2cd7d9b-d7d8-4f8e-a9ff-ef78cb0eb52e",
      "rating": 4,
      "comment": "Updated feedback comment.",
      "createdAt": "2026-06-03T10:31:00.000Z",
      "userId": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
      "user": {
        "id": "a90bfa38-6625-4c07-ba91-0309e3e78b7b",
        "name": "Jane Doe",
        "email": "user@example.com",
        "role": "USER",
        "createdAt": "2026-06-01T04:20:00.000Z"
      }
    }
  }
  ```
- **Error Response (`403 Forbidden`)**: Returned when trying to edit another user's review.

---

### 10.4 Delete Store Review
- **Method & Path**: `DELETE /store-reviews/:id`
- **Description**: Deletes a store review. Users can only delete their **own** store reviews; Admins can delete any store review.
- **Authentication**: `USER` or `ADMIN`
- **Parameters**:
  - `id` (Path): StoreReview UUID.

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Store review deleted successfully",
    "data": {
      "message": "Store review deleted successfully"
    }
  }
  ```
- **Error Response (`403 Forbidden`)**: Returned when trying to delete another user's review without Admin rights.

---

## 11. Gallery Module (`/gallery`)

The Gallery module manages the photo gallery for the Freepig Movement storefront. Admins can upload multiple images at once, update captions, and remove photos. All images are stored on Cloudinary under the `surf-store/gallery` folder. Gallery items are ordered using an `order` field that auto-increments from the last existing entry.

### 11.1 List Gallery Photos (Public)
- **Method & Path**: `GET /gallery`
- **Description**: Returns all gallery photos ordered by `order` ASC with pagination support.
- **Authentication**: None
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `page` | `string` | No | Page number (default: `1`). |
  | `limit` | `string` | No | Limit per page (default: `12`). |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Gallery fetched successfully",
    "data": {
      "galleries": [
        {
          "id": "f8a1c2d3-e4b5-6789-abcd-ef0123456789",
          "url": "https://res.cloudinary.com/.../gallery-img1.jpg",
          "caption": "Sunset surf session at Uluwatu",
          "order": 0,
          "createdAt": "2026-06-01T04:20:00.000Z"
        },
        {
          "id": "a9b2c3d4-f5e6-7890-bcde-f01234567890",
          "url": "https://res.cloudinary.com/.../gallery-img2.jpg",
          "caption": null,
          "order": 1,
          "createdAt": "2026-06-01T04:20:01.000Z"
        }
      ],
      "meta": {
        "total": 2,
        "page": 1,
        "limit": 12,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

---

### 11.2 Upload Gallery Photos (Admin Only)
- **Method & Path**: `POST /gallery`
- **Description**: Uploads one or more gallery images to Cloudinary (max 20 files per request). Each uploaded image is saved to the database with an auto-incremented `order` value that continues from the highest existing order in the database (not reset to 0). Images are stored in the `surf-store/gallery` Cloudinary folder.
- **Authentication**: `ADMIN`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `images` | `File[]` | Yes | Binary image files. Supports `.jpg`, `.png`, `.webp` (Max 5MB each, up to 20 files). |

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Gallery uploaded successfully",
    "data": [
      {
        "id": "f8a1c2d3-e4b5-6789-abcd-ef0123456789",
        "url": "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129953/surf-store/gallery/img1.jpg",
        "caption": null,
        "order": 0,
        "createdAt": "2026-06-03T10:30:00.000Z"
      },
      {
        "id": "a9b2c3d4-f5e6-7890-bcde-f01234567890",
        "url": "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129954/surf-store/gallery/img2.jpg",
        "caption": null,
        "order": 1,
        "createdAt": "2026-06-03T10:30:01.000Z"
      }
    ]
  }
  ```
- **Error Response (`400`)**: Returned when no image files are provided.
  ```json
  {
    "success": false,
    "message": "No images uploaded",
    "errors": null
  }
  ```

---

### 11.3 Update Gallery Caption (Admin Only)
- **Method & Path**: `PATCH /gallery/:id`
- **Description**: Updates the caption of a gallery photo. Caption is optional and can be set to `null`.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Gallery UUID.
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `caption` | `string \| null` | No | Photo caption text. Pass `null` to clear. |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Gallery updated successfully",
    "data": {
      "id": "f8a1c2d3-e4b5-6789-abcd-ef0123456789",
      "url": "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129953/surf-store/gallery/img1.jpg",
      "caption": "Morning glass at Padang Padang",
      "order": 0,
      "createdAt": "2026-06-03T10:30:00.000Z"
    }
  }
  ```
- **Error Response (`404`)**: Returned when the gallery photo is not found.
  ```json
  {
    "success": false,
    "message": "Gallery not found",
    "errors": null
  }
  ```

---

### 11.4 Delete Gallery Photo (Admin Only)
- **Method & Path**: `DELETE /gallery/:id`
- **Description**: Deletes a gallery photo. The image file is **purged from Cloudinary first** before the database record is removed.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Gallery UUID.
- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Gallery deleted successfully",
    "data": {
      "message": "Gallery deleted successfully"
    }
  }
  ```
- **Error Response (`404`)**: Returned when the gallery photo is not found.
  ```json
  {
    "success": false,
    "message": "Gallery not found",
    "errors": null
  }
  ```

---

## 12. Testimonials Module (`/testimonials`)

The Testimonials module manages customer reviews/testimonials for the Freepig Movement store. All testimonials contain a customer name, review body, optional instagram handle, order sequence, active flag, and customer photo. Photos are uploaded to Cloudinary under the `surf-store/testimonials` folder.

### 12.1 List Active Testimonials (Public)
- **Method & Path**: `GET /testimonials`
- **Description**: Returns all active testimonials (`isActive: true`) ordered by `order` ASC with pagination support.
- **Authentication**: None
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `page` | `string` | No | Page number (default: `1`). |
  | `limit` | `string` | No | Limit per page (default: `12`). |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Testimonials fetched successfully",
    "data": {
      "testimonials": [
        {
          "id": "e9a4f8d2-c3b5-4a1b-9e8c-5d6e7f8a9b0c",
          "name": "John Surfer",
          "photoUrl": "https://res.cloudinary.com/.../customer1.jpg",
          "review": "Awesome surfboards! Excellent performance.",
          "instagram": "john_surfer",
          "order": 1,
          "isActive": true,
          "createdAt": "2026-06-05T09:00:00.000Z",
          "updatedAt": "2026-06-05T09:00:00.000Z"
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 12,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

---

### 12.2 List All Testimonials (Admin Only)
- **Method & Path**: `GET /testimonials/all`
- **Description**: Returns all testimonials, including inactive ones, ordered by `order` ASC with pagination support.
- **Authentication**: `ADMIN`
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `page` | `string` | No | Page number (default: `1`). |
  | `limit` | `string` | No | Limit per page (default: `12`). |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "All testimonials fetched successfully",
    "data": {
      "testimonials": [
        {
          "id": "e9a4f8d2-c3b5-4a1b-9e8c-5d6e7f8a9b0c",
          "name": "John Surfer",
          "photoUrl": "https://res.cloudinary.com/.../customer1.jpg",
          "review": "Awesome surfboards! Excellent performance.",
          "instagram": "john_surfer",
          "order": 1,
          "isActive": true,
          "createdAt": "2026-06-05T09:00:00.000Z",
          "updatedAt": "2026-06-05T09:00:00.000Z"
        },
        {
          "id": "b3c5a7f2-1b8e-4a9d-9c8e-5f0a1b2c3d4e",
          "name": "Jane Wave",
          "photoUrl": null,
          "review": "Fast shipping.",
          "instagram": null,
          "order": 2,
          "isActive": false,
          "createdAt": "2026-06-05T09:10:00.000Z",
          "updatedAt": "2026-06-05T09:10:00.000Z"
        }
      ],
      "meta": {
        "total": 2,
        "page": 1,
        "limit": 12,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

---

### 12.3 Create Testimonial (Admin Only)
- **Method & Path**: `POST /testimonials`
- **Description**: Creates a new testimonial record.
- **Authentication**: `ADMIN`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `name` | `string` | Yes | Customer name. |
  | `review` | `string` | Yes | Review feedback body text. |
  | `instagram` | `string` | No | Instagram handle. Can be null/omitted. |
  | `order` | `number` | No | Display sorting order (default: `0`). |
  | `isActive` | `boolean` | No | Active status flag (default: `true`). |

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Testimonial created successfully",
    "data": {
      "id": "e9a4f8d2-c3b5-4a1b-9e8c-5d6e7f8a9b0c",
      "name": "John Surfer",
      "photoUrl": null,
      "review": "Awesome surfboards! Excellent performance.",
      "instagram": "john_surfer",
      "order": 1,
      "isActive": true,
      "createdAt": "2026-06-05T09:00:00.000Z",
      "updatedAt": "2026-06-05T09:00:00.000Z"
    }
  }
  ```

---

### 12.4 Update Testimonial (Admin Only)
- **Method & Path**: `PUT /testimonials/:id`
- **Description**: Updates fields of an existing testimonial. All body fields are optional.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Testimonial UUID.
- **Request Body**: Same properties as create, but all optional.

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Testimonial updated successfully",
    "data": {
      "id": "e9a4f8d2-c3b5-4a1b-9e8c-5d6e7f8a9b0c",
      "name": "John Updated",
      "photoUrl": null,
      "review": "Awesome surfboards! Excellent performance.",
      "instagram": "john_surfer",
      "order": 1,
      "isActive": true,
      "createdAt": "2026-06-05T09:00:00.000Z",
      "updatedAt": "2026-06-05T09:15:00.000Z"
    }
  }
  ```

---

### 12.5 Delete Testimonial (Admin Only)
- **Method & Path**: `DELETE /testimonials/:id`
- **Description**: Deletes a testimonial. The associated customer photo is **purged from Cloudinary first** (if present) before deleting the database record.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Testimonial UUID.

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Testimonial deleted successfully",
    "data": {
      "message": "Testimonial deleted successfully"
    }
  }
  ```

---

### 12.6 Upload Testimonial Photo (Admin Only)
- **Method & Path**: `POST /testimonials/:id/photo`
- **Description**: Uploads a customer profile photo to Cloudinary. Automatically deletes the previous photo from Cloudinary if one exists.
- **Authentication**: `ADMIN`
- **Request Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `photo` | `File` | Yes | Binary image file. Supports `.jpg`, `.png`, `.webp` (Max 5MB). |

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Testimonial photo uploaded successfully",
    "data": {
      "id": "e9a4f8d2-c3b5-4a1b-9e8c-5d6e7f8a9b0c",
      "name": "John Surfer",
      "photoUrl": "https://res.cloudinary.com/dlkjeffiv/image/upload/v1780129953/surf-store/testimonials/customer1.jpg",
      "review": "Awesome surfboards! Excellent performance.",
      "instagram": "john_surfer",
      "order": 1,
      "isActive": true,
      "createdAt": "2026-06-05T09:00:00.000Z",
      "updatedAt": "2026-06-05T09:20:00.000Z"
    }
  }
  ```

---

### 12.7 Toggle Testimonial Status (Admin Only)
- **Method & Path**: `PATCH /testimonials/:id/toggle`
- **Description**: Toggles the active status (`isActive`) of a testimonial between `true` and `false`.
- **Authentication**: `ADMIN`
- **Parameters**:
  - `id` (Path): Testimonial UUID.

- **Example Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Testimonial status toggled successfully",
    "data": {
      "id": "e9a4f8d2-c3b5-4a1b-9e8c-5d6e7f8a9b0c",
      "name": "John Surfer",
      "photoUrl": null,
      "review": "Awesome surfboards! Excellent performance.",
      "instagram": "john_surfer",
      "order": 1,
      "isActive": false,
      "createdAt": "2026-06-05T09:00:00.000Z",
      "updatedAt": "2026-06-05T09:25:00.000Z"
    }
  }
  ```

