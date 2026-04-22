# Eventide — Backend API

Node.js + Express REST API for the Event Management System. Handles authentication, users, vendors, items, carts, orders, guest lists, and memberships.

---

## Tech Stack

| Layer        | Technology                           |
| ------------ | ------------------------------------ |
| Runtime      | Node.js 18+                          |
| Framework    | Express 4                            |
| Database     | MongoDB (via Mongoose 8)             |
| Auth         | JWT (access + refresh + temp tokens) |
| File uploads | Multer → Cloudinary                  |
| Email        | Nodemailer (SMTP)                    |
| Security     | Helmet, express-rate-limit, bcryptjs |
| Validation   | Joi                                  |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- _(Optional)_ Cloudinary account for avatar uploads
- _(Optional)_ SMTP credentials for transactional email

---

## Local Development Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

Open `.env` and set the variables below.

### 3. Start the dev server

```bash
npm run dev       # nodemon — auto-restarts on file changes
# or
npm start         # plain node
```

The API will be available at **http://localhost:8000**.

---

## Environment Variables

| Variable                | Required | Default                    | Description                                                   |
| ----------------------- | -------- | -------------------------- | ------------------------------------------------------------- |
| `PORT`                  | No       | `8000`                     | Port the server listens on                                    |
| `NODE_ENV`              | No       | `development`              | `development` \| `production` \| `test`                       |
| `CORS_ORIGIN`           | No       | `*`                        | Comma-separated allowed origins, e.g. `http://localhost:5173` |
| `MONGODB_URI`           | **Yes**  | —                          | MongoDB connection string (without DB name)                   |
| `ACCESS_TOKEN_SECRET`   | **Yes**  | —                          | Long random string for signing access JWTs                    |
| `ACCESS_TOKEN_EXPIRY`   | No       | `15m`                      | Access token lifetime                                         |
| `REFRESH_TOKEN_SECRET`  | **Yes**  | —                          | Long random string for signing refresh JWTs                   |
| `REFRESH_TOKEN_EXPIRY`  | No       | `7d`                       | Refresh token lifetime                                        |
| `TEMP_TOKEN_SECRET`     | **Yes**  | —                          | Long random string for signing temp JWTs (email/reset)        |
| `TEMP_TOKEN_EXPIRY`     | No       | `15m`                      | Temp token lifetime                                           |
| `BCRYPT_SALT_ROUNDS`    | No       | `10`                       | bcrypt cost factor                                            |
| `CLOUDINARY_CLOUD_NAME` | No       | —                          | Cloudinary cloud name                                         |
| `CLOUDINARY_API_KEY`    | No       | —                          | Cloudinary API key                                            |
| `CLOUDINARY_API_SECRET` | No       | —                          | Cloudinary API secret                                         |
| `SMTP_HOST`             | No       | —                          | SMTP server hostname (e.g. `smtp.gmail.com`)                  |
| `SMTP_PORT`             | No       | `587`                      | SMTP port (`587` for TLS, `465` for SSL)                      |
| `SMTP_USER`             | No       | —                          | SMTP auth username / email                                    |
| `SMTP_PASS`             | No       | —                          | SMTP auth password / app-password                             |
| `SMTP_FROM`             | No       | `no-reply@eventmgmt.local` | Sender address shown in emails                                |
| `CLIENT_URL`            | No       | `http://localhost:5173`    | Frontend URL used in email links                              |

> **Tip:** Generate secure secrets with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Available Scripts

| Script        | Description                                 |
| ------------- | ------------------------------------------- |
| `npm run dev` | Start with nodemon (auto-reload on changes) |
| `npm start`   | Start without nodemon (production-like)     |

---

## Seeding Demo Accounts

A seed script is provided to create three ready-to-use accounts:

| Email                 | Password     | Role   |
| --------------------- | ------------ | ------ |
| `admin@eventide.com`  | `Admin@123`  | admin  |
| `vendor@eventide.com` | `Vendor@123` | vendor |
| `user@eventide.com`   | `User@1234`  | user   |

Run the seed script **with the backend `.env` loaded**:

```bash
node scripts/seed.js
```

Existing accounts (matched by email) are skipped — it is safe to run multiple times.

---

## API Overview

All routes are prefixed with `/api/v1`.

### Health

| Method | Path      | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

### Auth (`/auth`)

| Method | Path                   | Auth? | Description                           |
| ------ | ---------------------- | ----- | ------------------------------------- |
| POST   | `/signup/user`         | No    | Register a new user                   |
| POST   | `/signup/vendor`       | No    | Register a new vendor                 |
| POST   | `/signup/admin`        | No    | Register a new admin                  |
| POST   | `/login`               | No    | Login (returns access + refresh JWT)  |
| POST   | `/logout`              | Yes   | Invalidate refresh token              |
| POST   | `/refresh`             | No    | Rotate access token via refresh token |
| POST   | `/verify-email`        | No    | Confirm email with token              |
| POST   | `/resend-verification` | No    | Resend verification email             |
| POST   | `/forgot-password`     | No    | Send password-reset email             |
| POST   | `/reset-password`      | No    | Set new password via reset token      |
| GET    | `/me`                  | Yes   | Get current user profile              |
| PATCH  | `/change-password`     | Yes   | Change password                       |
| PATCH  | `/update-profile`      | Yes   | Update name / phone / contactInfo     |
| PATCH  | `/update-avatar`       | Yes   | Upload new avatar (multipart)         |

### Admin (`/admin`)

| Method | Path               | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | `/users`           | Create user / vendor / admin |
| GET    | `/users`           | List all users (paginated)   |
| GET    | `/users/:id`       | Get user by ID               |
| PATCH  | `/users/:id`       | Update user                  |
| DELETE | `/users/:id`       | Delete user                  |
| POST   | `/memberships`     | Grant membership to vendor   |
| GET    | `/memberships`     | List all memberships         |
| PATCH  | `/memberships/:id` | Update membership            |
| GET    | `/orders`          | List all orders              |

### Vendor (`/vendor`)

| Method | Path                 | Description             |
| ------ | -------------------- | ----------------------- |
| GET    | `/items`             | List own items          |
| POST   | `/items`             | Create item (multipart) |
| PATCH  | `/items/:id`         | Update item             |
| DELETE | `/items/:id`         | Delete item             |
| GET    | `/requests`          | Incoming item requests  |
| PATCH  | `/requests/:id`      | Accept / reject request |
| GET    | `/orders`            | Orders for own items    |
| GET    | `/orders/:id`        | Order detail            |
| PATCH  | `/orders/:id/status` | Update order status     |

### User (`/user`)

| Method | Path               | Description           |
| ------ | ------------------ | --------------------- |
| GET    | `/vendors`         | Browse all vendors    |
| GET    | `/vendors/:id`     | Vendor detail + items |
| GET    | `/items`           | Browse all items      |
| POST   | `/cart`            | Add item to cart      |
| GET    | `/cart`            | View cart             |
| DELETE | `/cart/:itemId`    | Remove item from cart |
| POST   | `/checkout`        | Place order from cart |
| GET    | `/orders`          | Own orders            |
| GET    | `/orders/:id`      | Order detail          |
| GET    | `/guest-lists`     | Own guest lists       |
| POST   | `/guest-lists`     | Create guest list     |
| GET    | `/guest-lists/:id` | Guest list detail     |
| PATCH  | `/guest-lists/:id` | Update guest list     |
| DELETE | `/guest-lists/:id` | Delete guest list     |
| POST   | `/requests`        | Request a custom item |
| GET    | `/requests`        | Own requests          |

---

## Project Structure

```
backend/
├── controllers/       # Route handler logic
├── db/                # MongoDB connection
├── middlewares/       # Auth, error, multer, rate-limit, validation
├── models/            # Mongoose schemas
├── routes/            # Express routers
├── scripts/           # One-off scripts (seed, etc.)
├── utils/             # ApiError, ApiResponse, asyncHandler, cloudinary, mails, tokens
├── validators/        # Joi schemas
├── app.js             # Express app setup
├── constants.js       # Shared enums and constants
└── server.js          # Entry point (DB connect + listen)
```

---

## Deployment

### Environment (Production)

Set `NODE_ENV=production` and make sure all **Required** env vars above are set.

### Docker (optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t eventide-backend .
docker run -p 8000:8000 --env-file .env eventide-backend
```

### Render / Railway / Fly.io

1. Point the service to the `backend/` directory (or root if deploying monorepo).
2. Set `npm start` as the start command.
3. Add all required env vars in the platform's secret/env dashboard.
4. Set `CORS_ORIGIN` to your deployed frontend URL.
