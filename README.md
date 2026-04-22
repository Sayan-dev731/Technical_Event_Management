<div align="center">

<br />

```
███████╗██╗   ██╗███████╗███╗   ██╗████████╗██╗██████╗ ███████╗
██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██║██╔══██╗██╔════╝
█████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ██║██║  ██║█████╗
██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ██║██║  ██║██╔══╝
███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ██║██████╔╝███████╗
╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═════╝ ╚══════╝
```

### Plan it. Source it. Execute it.

**A full-stack event management platform for users, vendors, and administrators.**  
Built with Node.js, Express, MongoDB, and React.

<br />

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

<br />

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API](#-api-reference) · [Demo Accounts](#-demo-accounts) · [Deployment](#-deployment)

<br />

</div>

---

## What is Eventide?

Eventide is a production-grade **event management system** that connects three distinct worlds:

| Role          | What they do                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 👤 **User**   | Browse vendors & items, manage a shopping cart, place orders, track deliveries, manage guest lists with RSVP tracking     |
| 🏪 **Vendor** | List products/services with live stock tracking, manage incoming orders & custom item requests, monitor membership status |
| 🛡️ **Admin**  | Full maintenance console — manage all users & vendors, assign & renew vendor memberships, oversee all orders              |

Everything from vendor discovery to checkout to guest-list management lives in one cohesive platform — with JWT auth, role-based access control, Cloudinary image hosting, SMTP email notifications, and a PWA-ready frontend.

---

## ✨ Features

### For Users

- 🔍 **Browse vendors** by category (Catering, Florist, Decoration, Lighting) or name
- 🛒 **Smart cart** — real-time stock validation, prevents over-ordering
- 💳 **Checkout** with UPI / Card / Netbanking / Cash / COD + shipping address
- 📦 **Order tracking** across 7 statuses from Confirmed → Delivered
- 📋 **Guest lists** with per-guest RSVP tracking (Yes / No / Maybe / Pending)
- 📬 **Custom item requests** sent directly to any vendor
- 👤 **Profile management** with avatar upload (Cloudinary)

### For Vendors

- 📦 **Item catalog** — create, update, delete items with image upload
- 📉 **Live stock management** — stock auto-decrements on every order; item auto-marks `out_of_stock` at 0
- 📨 **Incoming requests** — accept or reject custom user requests
- 📊 **Order dashboard** — view all orders for their items, update status & payment
- 🏅 **Membership system** — vendors must hold an active membership to list items

### For Admins

- 👥 **User management** — create, edit, deactivate, delete any user / vendor / admin
- 🏅 **Membership control** — grant memberships with 6-month / 1-year / 2-year plans; extend or cancel with one click
- 🔎 **Live vendor search** in the membership form — no manual ID copy-paste
- 📋 **All orders overview** — platform-wide order visibility
- 📧 **Email notifications** — automatic emails on membership grant, renewal, order confirmation

### Platform-wide

- 🔐 **JWT auth** with auto-refreshing access tokens (15 min) + refresh tokens (7 days)
- 📧 **Email verification** + password reset flows via secure temp tokens
- 🛡️ **Rate limiting** — auth endpoints individually limited, general API limited globally
- 🪖 **Helmet** security headers, CORS allowlist, bcrypt password hashing
- 📱 **PWA** — installable on mobile, offline shell via vite-plugin-pwa
- ☁️ **Cloudinary** image hosting for avatars and item photos
- ✅ **Joi validation** on every request body

---

## 🏗️ Architecture

```
eventManagement/
│
├── backend/                   # Node.js + Express REST API
│   ├── controllers/           # Business logic per domain
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── vendor.controller.js
│   │   └── user.controller.js
│   ├── models/                # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── Item.model.js
│   │   ├── Cart.model.js
│   │   ├── Order.model.js
│   │   ├── Membership.model.js
│   │   ├── GuestList.model.js
│   │   └── ItemRequest.model.js
│   ├── routes/                # Express routers
│   ├── middlewares/           # Auth, validation, multer, rate-limit, error
│   ├── validators/            # Joi schemas
│   ├── utils/                 # Cloudinary, mailer, JWT helpers, ApiError/Response
│   ├── scripts/
│   │   └── seed.js            # One-shot demo account seeder
│   ├── constants.js           # Shared enums (ROLES, ORDER_STATUS, etc.)
│   └── server.js              # Entry point
│
├── frontend/                  # React 18 SPA (Vite + Tailwind + PWA)
│   └── src/
│       ├── pages/
│       │   ├── admin/         # Admin dashboard pages
│       │   ├── vendor/        # Vendor dashboard pages
│       │   └── user/          # User-facing pages
│       ├── components/        # Shared UI (Layout, ProtectedRoute, Loader…)
│       ├── store/             # Zustand auth store
│       ├── api/               # Axios instance + silent token-refresh interceptor
│       └── utils/             # Formatters
│
└── README.md                  # You are here
```

### Data flow

```
Browser (React + Zustand)
  │  axios (Bearer token + cookie)
  ▼
Express API  ──► Joi validation ──► JWT middleware ──► Role guard
  │
  ├──► MongoDB (Mongoose)
  ├──► Cloudinary   (image upload)
  └──► Nodemailer   (SMTP email)
```

---

## 🚀 Getting Started

### Prerequisites

| Tool    | Minimum version    |
| ------- | ------------------ |
| Node.js | 18                 |
| npm     | 9                  |
| MongoDB | 6 (local or Atlas) |

### 1 — Clone the repo

```bash
git clone https://github.com/Sayan-dev731/Technical_Event_Management.git
cd Technical_Event_Management
```

### 2 — Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in the required values:

```env
# Required
MONGODB_URI=mongodb://127.0.0.1:27017
ACCESS_TOKEN_SECRET=<64-char random string>
REFRESH_TOKEN_SECRET=<64-char random string>
TEMP_TOKEN_SECRET=<64-char random string>

# Recommended for local dev
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173
PORT=8000

# Optional — image uploads (items & avatars)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional — transactional email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

> **Generate secrets instantly:**
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 3 — Start the backend

```bash
npm install
npm run dev        # nodemon, auto-restarts on changes
```

API available at → **http://localhost:8000**

### 4 — Configure the frontend

```bash
cd ../frontend
cp .env.example .env
# .env already points to http://localhost:8000 — nothing else needed for local dev
```

### 5 — Start the frontend

```bash
npm install
npm run dev
```

App available at → **http://localhost:5173**

### 6 — Seed demo accounts

```bash
cd ../backend
node scripts/seed.js
```

---

## 🎭 Demo Accounts

| Role      | Email                 | Password     | Access                 |
| --------- | --------------------- | ------------ | ---------------------- |
| 🛡️ Admin  | `admin@eventide.com`  | `Admin@123`  | Full admin console     |
| 🏪 Vendor | `vendor@eventide.com` | `Vendor@123` | Vendor dashboard       |
| 👤 User   | `user@eventide.com`   | `User@1234`  | Shopping & guest lists |

> All seed accounts are pre-verified — no email confirmation step needed.

---

## 🗺️ Application Flow

```
START
  └─► Landing page (INDEX)
        └─► LOGIN  ──────────────────────────────────────────────┐
              │                                                    │
        ┌─────▼──────┐          ┌────────────┐          ┌────────▼───────┐
        │   VENDOR   │          │   ADMIN    │          │     USER       │
        └─────┬──────┘          └─────┬──────┘          └────────┬───────┘
              │                       │                           │
        ┌─────▼──────┐    ┌───────────▼────────────┐    ┌────────▼───────────────┐
        │  Main Page │    │   Maintenance Menu     │    │ Vendors / Cart /       │
        └──┬──┬──┬───┘    │   (Admin access only)  │    │ Guest Lists / Orders   │
           │  │  │        └───────────┬────────────┘    └────────────────────────┘
        Items Reqs Orders    Add/Update Membership
        CRUD  View  Track    Add/Update User/Vendor
                             Manage all Orders
```

---

## 📡 API Reference

All routes are prefixed with `/api/v1`.

<details>
<summary><strong>🔓 Auth</strong> — <code>/api/v1/auth</code></summary>

| Method  | Endpoint               | Auth | Description                  |
| ------- | ---------------------- | ---- | ---------------------------- |
| `POST`  | `/signup/user`         | —    | Register user                |
| `POST`  | `/signup/vendor`       | —    | Register vendor              |
| `POST`  | `/signup/admin`        | —    | Register admin               |
| `POST`  | `/login`               | —    | Login → access + refresh JWT |
| `POST`  | `/logout`              | ✅   | Invalidate session           |
| `POST`  | `/refresh`             | —    | Rotate access token          |
| `POST`  | `/verify-email`        | —    | Confirm email                |
| `POST`  | `/resend-verification` | —    | Resend verification link     |
| `POST`  | `/forgot-password`     | —    | Send reset email             |
| `POST`  | `/reset-password`      | —    | Set new password             |
| `GET`   | `/me`                  | ✅   | Current user profile         |
| `PATCH` | `/me`                  | ✅   | Update profile               |
| `PATCH` | `/me/avatar`           | ✅   | Upload avatar                |
| `PATCH` | `/change-password`     | ✅   | Change password              |

</details>

<details>
<summary><strong>🛡️ Admin</strong> — <code>/api/v1/admin</code></summary>

| Method   | Endpoint               | Description                            |
| -------- | ---------------------- | -------------------------------------- |
| `POST`   | `/users`               | Create user / vendor / admin           |
| `GET`    | `/users`               | List all users (paginated, filterable) |
| `GET`    | `/users/:id`           | Get user by ID                         |
| `PATCH`  | `/users/:id`           | Update user                            |
| `DELETE` | `/users/:id`           | Delete user                            |
| `POST`   | `/memberships`         | Grant membership to vendor             |
| `GET`    | `/memberships`         | List all memberships                   |
| `PATCH`  | `/memberships`         | Extend or cancel membership            |
| `GET`    | `/memberships/:number` | Get membership by number               |
| `GET`    | `/orders`              | Platform-wide orders                   |

</details>

<details>
<summary><strong>🏪 Vendor</strong> — <code>/api/v1/vendor</code></summary>

| Method   | Endpoint        | Description                      |
| -------- | --------------- | -------------------------------- |
| `GET`    | `/items`        | List own items                   |
| `POST`   | `/items`        | Create item (multipart)          |
| `GET`    | `/items/:id`    | Get item                         |
| `PATCH`  | `/items/:id`    | Update item (multipart)          |
| `DELETE` | `/items/:id`    | Delete item                      |
| `GET`    | `/requests`     | Incoming item requests           |
| `PATCH`  | `/requests/:id` | Accept / reject request          |
| `GET`    | `/orders`       | Orders containing vendor's items |
| `GET`    | `/orders/:id`   | Order detail                     |
| `PATCH`  | `/orders/:id`   | Update order status              |

</details>

<details>
<summary><strong>👤 User</strong> — <code>/api/v1/user</code></summary>

| Method   | Endpoint           | Description                 |
| -------- | ------------------ | --------------------------- |
| `GET`    | `/vendors`         | Browse vendors              |
| `GET`    | `/vendors/:id`     | Vendor + items              |
| `GET`    | `/items`           | Browse all items            |
| `GET`    | `/cart`            | View cart                   |
| `POST`   | `/cart`            | Add item                    |
| `PATCH`  | `/cart/:lineId`    | Update quantity             |
| `DELETE` | `/cart/:lineId`    | Remove item                 |
| `DELETE` | `/cart`            | Clear cart                  |
| `POST`   | `/checkout`        | Place order                 |
| `GET`    | `/orders`          | My orders                   |
| `GET`    | `/orders/:id`      | Order detail                |
| `DELETE` | `/orders/:id`      | Cancel order                |
| `GET`    | `/guest-lists`     | My guest lists              |
| `POST`   | `/guest-lists`     | Create guest list           |
| `GET`    | `/guest-lists/:id` | Guest list detail           |
| `PATCH`  | `/guest-lists/:id` | Update guest list / RSVP    |
| `DELETE` | `/guest-lists/:id` | Delete guest list           |
| `POST`   | `/requests`        | Send item request to vendor |
| `GET`    | `/requests`        | My requests                 |

</details>

---

## 🗄️ Data Models

```
User ──────────────────────────────────────────────────────────────
  _id, name, email, password(hashed), role, category, phone,
  contactInfo, avatar, avatarPublicId, isVerified, isActive,
  membership → Membership, refreshToken, tempToken*, lastLoginAt

Item ──────────────────────────────────────────────────────────────
  _id, vendor → User, name, description, category, price,
  stock, status(available|out_of_stock|discontinued),
  image, imagePublicId

Cart ──────────────────────────────────────────────────────────────
  user → User
  items[]: { item → Item, vendor → User, quantity, priceAtAdd }

Order ─────────────────────────────────────────────────────────────
  user → User, items[], totalAmount, shippingAddress,
  status(pending→confirmed→…→delivered|cancelled),
  paymentStatus, paymentMethod, paymentRef

Membership ────────────────────────────────────────────────────────
  vendor → User, membershipNumber, plan(6m|1y|2y),
  startDate, endDate, status, amountPaid, history[]

GuestList ─────────────────────────────────────────────────────────
  user → User, eventName, eventDate, notes,
  guests[]: { name, email, phone, rsvp(pending|yes|no|maybe) }

ItemRequest ───────────────────────────────────────────────────────
  user → User, vendor → User, item → Item,
  message, quantity, status(pending|accepted|rejected), responseNote
```

---

## 🔒 Security

| Layer            | Implementation                                                                     |
| ---------------- | ---------------------------------------------------------------------------------- |
| Password hashing | bcryptjs (10 rounds)                                                               |
| Auth tokens      | JWT — RS-256 inspired separation: access (15 min), refresh (7 days), temp (15 min) |
| Token rotation   | Refresh token reuse detection — single-use per session                             |
| HTTP headers     | Helmet (CSP, HSTS, X-Frame-Options, …)                                             |
| Rate limiting    | Auth endpoints: 10 req/15 min · General API: 200 req/15 min                        |
| Input validation | Joi schemas on every mutating endpoint                                             |
| File uploads     | Mimetype allowlist (jpeg/png/webp/gif/svg), 5 MB max                               |
| CORS             | Explicit allowlist via `CORS_ORIGIN` env var                                       |

---

## 🌍 Environment Variables

| Variable                  | Service             | Required    |
| ------------------------- | ------------------- | ----------- |
| `MONGODB_URI`             | Database            | ✅          |
| `ACCESS_TOKEN_SECRET`     | JWT                 | ✅          |
| `REFRESH_TOKEN_SECRET`    | JWT                 | ✅          |
| `TEMP_TOKEN_SECRET`       | JWT                 | ✅          |
| `CORS_ORIGIN`             | CORS                | Recommended |
| `CLIENT_URL`              | Email links         | Recommended |
| `CLOUDINARY_CLOUD_NAME`   | Images              | Optional    |
| `CLOUDINARY_API_KEY`      | Images              | Optional    |
| `CLOUDINARY_API_SECRET`   | Images              | Optional    |
| `SMTP_HOST` / `SMTP_PORT` | Email               | Optional    |
| `SMTP_USER` / `SMTP_PASS` | Email               | Optional    |
| `VITE_API_PROXY`          | Frontend dev proxy  | Dev only    |
| `VITE_API_BASE`           | Frontend production | Production  |

---

## 📦 Tech Stack

### Backend

| Package              | Purpose                       |
| -------------------- | ----------------------------- |
| `express`            | HTTP framework                |
| `mongoose`           | MongoDB ODM                   |
| `bcryptjs`           | Password hashing              |
| `jsonwebtoken`       | JWT sign / verify             |
| `helmet`             | HTTP security headers         |
| `express-rate-limit` | DDoS / brute-force protection |
| `multer`             | Multipart file handling       |
| `cloudinary`         | Cloud image hosting           |
| `nodemailer`         | Transactional email           |
| `joi`                | Request validation            |
| `cors`               | Cross-Origin Resource Sharing |
| `morgan`             | HTTP request logger           |
| `cookie-parser`      | Cookie handling               |
| `dotenv`             | Env var loading               |

### Frontend

| Package                 | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `react` + `react-dom`   | UI library                              |
| `react-router-dom`      | SPA routing                             |
| `@tanstack/react-query` | Server-state & data fetching            |
| `zustand`               | Client auth state                       |
| `axios`                 | HTTP client + token-refresh interceptor |
| `tailwindcss`           | Utility-first styling                   |
| `framer-motion`         | Animations                              |
| `lucide-react`          | Icon set                                |
| `react-hot-toast`       | Toast notifications                     |
| `vite-plugin-pwa`       | Progressive Web App manifest            |

---

## 🚢 Deployment

### Backend — any Node host (Render, Railway, Fly.io)

1. Set all required env vars in the platform dashboard
2. Set start command: `node server.js`
3. Set `CORS_ORIGIN` to your deployed frontend URL
4. Set `NODE_ENV=production`

### Frontend — any static host (Vercel, Netlify)

1. Build command: `npm run build` · Output dir: `dist`
2. Set `VITE_API_BASE=https://your-backend-url.com`
3. Add a catch-all redirect to `index.html` for SPA routing

### Docker (both services)

```bash
# Backend
docker build -t eventide-api ./backend
docker run -p 8000:8000 --env-file ./backend/.env eventide-api

# Frontend
docker build \
  --build-arg VITE_API_BASE=https://api.yoursite.com \
  -t eventide-web ./frontend
docker run -p 80:80 eventide-web
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a conventional message: `git commit -m "feat: add something awesome"`
4. Push and open a Pull Request

Please keep PRs focused — one feature / fix per PR.

---

## 📄 License

Distributed under the **ISC License**.  
© 2026 [Sayan](https://github.com/Sayan-dev731) — built with ☕ and way too many late nights.

---

<div align="center">

**[⬆ back to top](#)**

<br />

_If this project helped you, leave a ⭐ — it keeps the coffee budget alive._

</div>
