# Freepig Movement Backend API 🏄‍♂️

Welcome to the backend service of **Freepig Movement**, a premium digital store for surfboards, apparel, surf accessories, and community rider spotlights. This backend is built using a highly structured, scalable modular architecture using modern and robust technologies.

---

## 🚀 Tech Stack

- **Runtime Environment**: Node.js
- **Programming Language**: TypeScript (Strict Mode)
- **Framework**: Express.js (v5)
- **Database ORM**: Prisma ORM
- **Database Engine**: PostgreSQL
- **Security & Utilities**: JWT, BcryptJS, Helmet, CORS, Express Rate Limit, Zod, Morgan, Nodemailer
- **Media Hosting**: Cloudinary (Image & Video streams)
- **Deployment Platform**: Railway

---

## 🛠️ Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.x or v20.x+ recommended)
- **NPM** (v9.x+ or v10.x+)
- **PostgreSQL** (v14+ running locally or a remote hosted instance)
- **Cloudinary** Account (for hosting images and video releases)
- **Gmail Account** (for sending registration OTP verification emails via App Password)

---

## 📋 Project Directory Structure

The project implements a **Modular Pattern**. Each business domain (module) encapsulates its routes, validation, controller, and services into a single folder, keeping the codebase highly maintainable.

```
src/
├── config/              # Centralized configuration (Database, Cloudinary, JWT, Mailer)
│   ├── database.ts
│   ├── cloudinary.ts
│   ├── jwt.ts
│   └── mailer.ts
├── middlewares/         # Shared Express Middlewares
│   ├── auth.middleware.ts       # Decodes JWT and attaches req.user
│   ├── role.middleware.ts       # Restricts access to ADMIN-only routes
│   ├── upload.middleware.ts     # Multer config (MemoryStorage, fileFilters for image/video)
│   └── validate.middleware.ts   # Zod request validation runner
├── modules/             # Encapsulated Business Modules
│   ├── auth/            # User Auth flow: Register (OTP), Verification, Login
│   ├── products/        # Product catalogue, image variants, dimensions
│   ├── reviews/         # Product ratings and testimonials
│   ├── wishlist/        # User product saving
│   ├── riders/          # Spotlights for surf riders and teams
│   ├── custom-orders/   # Bespoke surfboard custom order requests
│   ├── admin/           # Admin Dashboard, global reviews, custom orders and user moderation
│   └── new-releases/    # Video-focused homepage features and releases
├── utils/               # Standardized Helper functions
│   ├── response.ts      # Unified API success/error structure
│   └── pagination.ts    # Helper for page calculation & metadata
├── types/               # Type augmentations (e.g., Express.Request)
│   └── express.d.ts
├── routes.ts            # Central API route index mounting all modules
└── app.ts               # Core express configuration, security, global error handler, and server start
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the project based on the following configurations:

```env
# Server Configurations
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Connections
DATABASE_URL="postgresql://username:password@localhost:5432/freepig_db?schema=public"

# Authentication (JWT)
JWT_SECRET="your_jwt_super_secret_key"
JWT_EXPIRES_IN="7d"

# Gmail SMTP for OTP Sending
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

### Explanations:
- **`DATABASE_URL`**: PostgreSQL connection string used by Prisma.
- **`JWT_SECRET`**: Random secret string used to sign JSON Web Tokens.
- **`JWT_EXPIRES_IN`**: Token lifespan (e.g., `7d`, `24h`).
- **`GMAIL_USER`** & **`GMAIL_APP_PASSWORD`**: Credentials utilized by `nodemailer` to dispatch OTP emails during registration. Use a Gmail App Password rather than your account's primary password.
- **`CLOUDINARY_*`**: API credentials from your Cloudinary Dashboard to handle binary streams of product images, rider photos, and video assets.

---

## 🛠️ Installation & Local Setup

Follow these steps to spin up the API locally:

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd freepig-backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` (or create a new `.env` file) and update it with your local credentials.

### 3. Database Migration
Run the Prisma migrations to generate database tables and synchronized client typings:
```bash
npm run prisma:migrate
```

### 4. Seed Database
Populate the database with sample data (Categories, Products, etc.):
```bash
npm run prisma:seed
```

---

## 🎮 Available Scripts

Inside `package.json`, you have these scripts ready to use:

- **`npm run dev`**: Spins up the local development server utilizing `ts-node` and `nodemon` for auto-reloading upon file modifications.
- **`npm run build`**: Transpiles raw TypeScript code into production-ready JavaScript inside the `/dist` directory.
- **`npm run start`**: Runs the compiled production server from the `/dist` build directory.
- **`npm run prisma:generate`**: Generates typescript types for `@prisma/client`.
- **`npm run prisma:migrate`**: Applies schema changes to your database in development.
- **`npm run prisma:studio`**: Opens a visual database GUI in your browser at `http://localhost:5555`.
- **`npm run prisma:seed`**: Triggers the seeding script.

---

## ☁️ Deployment to Railway

To deploy the **Freepig Movement Backend API** to Railway:

### Step 1: Initialize Database on Railway
1. Go to your Railway Dashboard.
2. Click **New Project** -> **Provision PostgreSQL**.
3. Railway will spin up a PostgreSQL instance and automatically inject the `DATABASE_URL` variable.

### Step 2: Deploy the Service
1. Click **New** -> **Github Repo** and link this repository.
2. Under **Variables** for your service, add all environment variables specified in `.env` (except `DATABASE_URL` if it's already automatically linked to your PostgreSQL database).

### Step 3: Build & Start Configuration
Railway will automatically discover Node.js projects. It reads the scripts from your `package.json`:
- **Build Command**: Railway runs `npm run build`.
- **Start Command**: Railway runs `npm run start`.
- Make sure to add `npx prisma migrate deploy` in your Railway setup or as a postinstall step to run migrations automatically during container build.

---

*Made with 🏄‍♂️ by the Freepig Movement Development Team.*
