# Freepig Movement REST API Documentation 

Welcome to the REST API documentation for the **Freepig Movement** store and spotlight platform. This document covers authentication, standard response structures, and details for every single available endpoint.

---

## Base URL
- **Local Development**: `http://localhost:5000/api`
- **Staging / Production**: `https://<your-railway-domain>.up.railway.app/api`

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

- **Example Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": {
      "id": "d0408544-e22a-43cf-be79-cc7cc0ebfaee",
      "name": "Freepig Fish 5.8",
      "slug": "freepig-fish-5-8",
      "skillLevel": "INTERMEDIATE"
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

### 2.9 Add Product Dimension (Admin Only)
- **Method & Path**: `POST /products/:id/dimensions`
- **Description**: Creates specific size variation matrices for a surfboard.
- **Authentication**: `ADMIN`
- **Request Body**:
  - `size` (string): e.g. `5'10"`
  - `width` (string): e.g. `19 3/4"`
  - `thickness` (string): e.g. `2 1/2"`
  - `volume` (string, optional): e.g. `31.5L`

---

### 2.10 Delete Product Dimension (Admin Only)
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
      "totalProducts": 32,
      "totalUsers": 211,
      "totalCustomOrders": 89,
      "pendingCustomOrders": 12,
      "totalRiders": 8,
      "totalReviews": 454,
      "averageRating": 4.6
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
