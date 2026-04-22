# Eventide — Frontend

React 18 single-page application for the Event Management System. Supports User, Vendor, and Admin roles with a role-aware routing system, real-time cart, guest lists, order management, and PWA support.

---

## Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| UI Library    | React 18                        |
| Bundler       | Vite 5                          |
| Styling       | Tailwind CSS 3                  |
| Routing       | React Router v6                 |
| State         | Zustand (auth store)            |
| Data Fetching | TanStack Query (React Query v5) |
| HTTP Client   | Axios (with auto token-refresh) |
| Animations    | Framer Motion                   |
| Notifications | react-hot-toast                 |
| Icons         | Lucide React                    |
| PWA           | vite-plugin-pwa                 |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- The **backend API** running (default: `http://localhost:8000`)

---

## Local Development Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` — at minimum set the backend proxy URL:

```env
VITE_API_PROXY=http://localhost:8000
```

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Environment Variables

| Variable         | Required | Default                 | Description                                                                   |
| ---------------- | -------- | ----------------------- | ----------------------------------------------------------------------------- |
| `VITE_API_PROXY` | No       | `http://localhost:8000` | Backend URL used by the Vite dev-server proxy (dev only)                      |
| `VITE_API_BASE`  | No       | _(empty)_               | When set, Axios hits this URL directly (useful for staging/production builds) |

> In **production** (static build served behind a reverse proxy), set `VITE_API_BASE` to the full backend URL, e.g. `https://api.eventide.example.com`.

---

## Available Scripts

| Script            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR on port 5173         |
| `npm run build`   | Production build → `dist/`                          |
| `npm run preview` | Serve the production build locally for final checks |
| `npm run lint`    | ESLint code quality check                           |

---

## Demo Accounts

The backend seed script creates these ready-to-use accounts:

| Email                 | Password     | Role   | Access                          |
| --------------------- | ------------ | ------ | ------------------------------- |
| `admin@eventide.com`  | `Admin@123`  | Admin  | Full admin dashboard            |
| `vendor@eventide.com` | `Vendor@123` | Vendor | Vendor dashboard (items/orders) |
| `user@eventide.com`   | `User@1234`  | User   | Shopping, cart, guest lists     |

> These accounts are pre-verified — email verification is not required to log in.

---

## Routing Structure

```
/                        → Landing page
/login                   → Login
/signup                  → Signup (user/vendor)
/verify-email            → Email verification
/forgot-password         → Forgot password
/reset-password          → Reset password

/user/home               → User dashboard
/user/vendors            → Browse vendors
/user/vendors/:id        → Vendor detail
/user/items              → Browse items
/user/cart               → Shopping cart
/user/checkout           → Checkout
/user/orders             → My orders
/user/orders/:id         → Order detail
/user/guest-lists        → My guest lists
/user/guest-lists/:id    → Guest list detail
/user/requests           → My item requests

/vendor/home             → Vendor dashboard
/vendor/items            → My items
/vendor/items/new        → Add item
/vendor/items/:id/edit   → Edit item
/vendor/orders           → Incoming orders
/vendor/orders/:id       → Order detail
/vendor/requests         → Incoming requests

/admin/home              → Admin dashboard
/admin/users             → Manage users
/admin/users/new         → Create user
/admin/users/:id/edit    → Edit user
/admin/memberships       → Manage memberships
```

---

## Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── api/
│   │   └── axios.js         # Axios instance + token-refresh interceptor
│   ├── components/
│   │   ├── AuthShell.jsx    # Auth page wrapper
│   │   ├── Layout.jsx       # App shell with sidebar/navbar
│   │   ├── ProtectedRoute.jsx # Role-based route guard
│   │   ├── Loader.jsx
│   │   ├── Empty.jsx
│   │   └── Logo.jsx
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   ├── user/            # User pages
│   │   └── vendor/          # Vendor pages
│   ├── store/
│   │   └── auth.js          # Zustand auth store
│   ├── utils/
│   │   └── format.js        # Date/currency formatters
│   ├── App.jsx              # Router config
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Deployment

### Build for production

```bash
npm run build
```

Output is in the `dist/` directory — serve it from any static host.

### Vercel / Netlify

1. Set **Build Command** → `npm run build`
2. Set **Output Directory** → `dist`
3. Add env var: `VITE_API_BASE=https://your-backend-url.com`
4. Add a rewrite/redirect rule so all routes fall back to `index.html`:

    **Netlify** (`public/_redirects`):

    ```
    /*  /index.html  200
    ```

    **Vercel** (`vercel.json`):

    ```json
    {
        "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

### Nginx (self-hosted)

```nginx
server {
    listen 80;
    root /var/www/eventide/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: proxy API calls to avoid CORS
    location /api/ {
        proxy_pass http://localhost:8000;
    }
}
```

### Docker (optional)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Build:

```bash
docker build --build-arg VITE_API_BASE=https://api.eventide.example.com -t eventide-frontend .
```
