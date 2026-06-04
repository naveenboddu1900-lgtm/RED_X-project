# Multi-Tenant E-Commerce SaaS Platform (RED_x E-Commerce)

A production-ready, highly interactive Multi-Tenant E-Commerce SaaS application built on the MERN stack (React, Node, Express, MongoDB). The system features isolated tenant store fronts, role-based user management, inventory control, automated stock calculations, analytics, and Stripe integrations (with sandboxed local mock configurations).

---

## Technical Architecture Overview

### Backend Design (Node.js & Express.js)
- **Scale-Ready Folder Layout**: Separates database schemas (`models/`), controller actions (`controllers/`), system policies (`middleware/`), and external resources (`services/`).
- **Relational Data Modeling (Mongoose)**:
  - `User`: Handles role profiles ('customer', 'vendor', 'admin') with password hashing and schema validators.
  - `Store`: Tenant store model linked to the vendor. Implements auto-slugification for URLs.
  - `Product`: Catalog items scoped by `store` with indexes for text searches and category filtering.
  - `Order`: Checkout transactions capturing customer shipping, details snapshots, and stock statuses.
- **Failover Services Layer**:
  - **Stripe Service**: Automatically connects to Stripe SDK if secret keys are in `.env`, otherwise falls back to a sandbox overlay interface for local checkouts.
  - **Cloudinary Service**: Stream uploads to Cloudinary for product assets. Falls back to static folder writing (`backend/uploads/`) if credentials are absent.
  - **Nodemailer Service**: Triggers transactional emails. Falls back to logging emails inside formatted terminal console boxes in offline environments.

### Frontend Design (Vite & React.js)
- **Redux State Management**: Uses Redux Toolkit to manage authentication session details and Cart configurations.
- **Multi-Tenant Cart Scoping**: The Cart slice dynamically isolates and saves buyer carts to `localStorage` per store slug (e.g. `cart_aura-store`), preventing cross-store checkouts.
- **Visual System (Vanilla CSS)**: Uses custom variables, responsive grids, sleek cards, glassmorphic layout wrappers, transitions, and dark/light modes.
- **Analytics Visuals (Recharts)**: Uses Area, Bar, and Pie charts to display vendor and admin sales performance metrics.

---

## Folder Directory Structure

```
saas-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Passport keys configurations
│   │   ├── controllers/        # Express handlers (Auth, Stores, Products, Orders, Analytics)
│   │   ├── middleware/         # System filters (JWT Protect, RBAC, Multer uploads)
│   │   ├── models/             # Mongoose schemas (User, Store, Product, Order)
│   │   ├── routes/             # API Router endpoints
│   │   ├── services/           # Service failovers (Stripe, Mail, Cloudinary)
│   │   ├── app.js              # Express app configs
│   │   └── server.js           # Server startup script
│   ├── uploads/                # Local media upload folder
│   ├── .env.example            # Sample configs template
│   ├── .env                    # System runtime configurations
│   ├── test-api.js             # Automated integration test script
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/         # Common layouts (Navbar, Sidebar, StatCards)
    │   ├── features/           # Slice logic components
    │   │   ├── auth/           # Login, Register, & authSlice
    │   │   ├── cart/           # Cart, Checkout, & cartSlice
    │   │   ├── store/          # Storefront catalogs
    │   │   ├── product/        # Detail cards
    │   │   ├── order/          # Order history
    │   │   ├── vendor/         # Vendor panels & analytics
    │   │   └── admin/          # Platform Approvals panel
    │   ├── services/           # Api client helpers
    │   ├── store/              # Redux configureStore
    │   ├── styles/             # Global system CSS stylesheet
    │   ├── App.css
    │   ├── App.jsx             # React Routes mapping
    │   └── main.jsx            # React mount script
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Installation & Setup Instructions

### Prerequisites
- Node.js installed locally (LTS recommended)
- MongoDB Community Server installed and running on default port `27017`

### Step 1: Clone or Open Project Workspace
Locate the workspace subdirectory at:
`C:\Users\BODDU\.gemini\antigravity\scratch\saas-ecommerce`

### Step 2: Configure Backend Environment
Open `backend/` directory, verify that the `.env` file exists (automatically created with local development defaults):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/saas-ecommerce
JWT_SECRET=supersecretjwtkey123456!
JWT_EXPIRES_IN=7d
```

### Step 3: Install Dependencies
Open two terminal windows to install dependencies in both project directories:

#### In Backend Terminal:
```bash
cd backend
npm install
```

#### In Frontend Terminal:
```bash
cd frontend
npm install
```

---

## Quick Start
Use these commands in separate terminals after dependencies are installed.

> Important: Open a separate terminal for backend and frontend. Do not run `cd frontend` from inside `backend`.

#### Start the backend server
```bash
cd backend
npm run dev
```

#### Start the frontend app
```bash
cd frontend
npm run dev
```

If you started `npm run dev` in `backend` already and it is running on port `5000`, you only need to open another terminal and run the frontend command there.

If `5000` is already in use, stop the existing backend process first or restart the terminal with the correct project folder.

```

Once both servers are running, open the app in your browser at:

- Frontend: `http://localhost:5173`
- Backend API root: `http://localhost:5000/api`
- Backend API health: `http://localhost:5000/api/health`

After seeding, the backend can create 10 sample stores with 100 products per store for a larger catalog.

Common frontend route examples:

- Store listing: `http://localhost:5173/store/:storeSlug`
- Product detail: `http://localhost:5173/store/:storeSlug/product/:productId`
- Checkout: `http://localhost:5173/store/:storeSlug/checkout`

Payments are supported via Stripe integration in the backend. If `STRIPE_SECRET_KEY` is not configured in `backend/.env`, the app falls back to a local mock payment gateway for sandbox testing.

You can also seed the backend sample data with:

```bash
cd backend
npm run seed
```

---

## Running the Application

### Option A: Running Development Servers (Local execution)

1. **Start Backend Server**:
   In your backend terminal, run:
   ```bash
   npm run dev
   ```
   *You should see output confirming MongoDB connection and the server listening on http://localhost:5000.*

2. **Start Frontend Client**:
   In your frontend terminal, run:
   ```bash
   npm run dev
   ```
   *The React client will start up, typically listening on http://localhost:5173.*

3. **Browse Platform**:
   Open your browser and navigate to `http://localhost:5173/`. You can:
   - Register as a Customer or Vendor.
   - List items in the inventory.
   - Browse store fronts like `/store/:storeSlug`.
   - Test sandboxed payment checkouts.

### Option B: Running Automated Verification Tests
You can run the automated API script which tests backend routing, registrations, catalog creations, stock deductions, checkouts, and database integrity.

1. Make sure the backend server is running (`npm run dev`).
2. Open a separate terminal inside `backend/` directory.
3. Run the test command:
   ```bash
   node test-api.js
   ```
   *You will see step-by-step logs printing success checks and a success banner when all 10 integration test stages complete.*

---

## API Routes Documentation

| Endpoint | Method | Security | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register customer or vendor (creates store in pending) |
| `/api/auth/login` | `POST` | Public | Log in user, return JWT and store slug details |
| `/api/auth/me` | `GET` | Private | Retrieve current user profile details |
| `/api/stores` | `GET` | Public | Get list of approved tenant stores |
| `/api/stores/slug/:slug` | `GET` | Public | Get store metadata by slug (checks access permissions) |
| `/api/stores/:id` | `PUT` | Private (Vendor) | Update store settings (name, description, logo upload) |
| `/api/products/store/:storeIdOrSlug` | `GET` | Public | List products for store with search, categories, sort, pagination |
| `/api/products/:id` | `GET` | Public | Get details of a single product |
| `/api/products` | `POST` | Private (Vendor) | List a new catalog product (attaches files) |
| `/api/products/:id` | `PUT` | Private (Vendor) | Update listed product parameters |
| `/api/products/:id` | `DELETE` | Private (Vendor) | Remove product listing |
| `/api/orders` | `POST` | Public (Opt Auth) | Create order and initialize Stripe payment intent |
| `/api/orders/confirm` | `POST` | Public | Confirm transaction payment, deduct inventory stocks, trigger emails |
| `/api/orders/vendor/my-store` | `GET` | Private (Vendor) | Retrieve incoming customer orders queue |
| `/api/orders/customer/my-history` | `GET` | Private (Customer) | Retrieve buyer personal purchase logs |
| `/api/orders/:id/status` | `PUT` | Private (Vendor) | Update order shipment delivery status |
| `/api/analytics/vendor` | `GET` | Private (Vendor) | Fetch store analytics aggregations (revenue, categories, trends) |
| `/api/analytics/admin` | `GET` | Private (Admin) | Fetch platform aggregated analytics summary data |
| `/api/admin/stores` | `GET` | Private (Admin) | List all registered stores with status |
| `/api/admin/stores/:id/approve` | `PUT` | Private (Admin) | Approve store, making it live |
| `/api/admin/stores/:id/suspend` | `PUT` | Private (Admin) | Suspend or reactivate store |
