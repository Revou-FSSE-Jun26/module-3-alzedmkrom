# RevoGarb

**Requirement 14.1** — RevoGarb is a full-stack e-commerce frontend built with Next.js and the App Router, backed by a Flask API. It provides a browsable product catalog with search and filtering, user authentication with session persistence, a shopping cart backed by localStorage, order checkout and management, role-based admin tools for product and category CRUD, toast notifications for user feedback, and an automated end-to-end test suite.

## Features

**Requirement 14.2** — The app implements the following pages and functionality:

### Customer Pages
- **Home** — Browse a featured set of products from the API
- **Products** — Full product listing with real-time search and category filtering
- **Product Detail** — Individual product page with dynamic page title and SEO metadata
- **Categories** — All product categories
- **Cart** — Review items before purchase, adjust quantities, or remove products
- **Checkout** — Confirm an order and create it in the system
- **Orders** — View the logged-in customer's own orders and their details
- **Register** — Create a new customer account with validated inputs
- **Login** — Sign in with email and password

### Admin Pages
- **Dashboard** — Manage the product catalog: create, edit, and delete products with a live table
- **Dashboard Categories** — Manage product categories: create, edit, and delete with a live table
- **Dashboard Orders** — Read-only overview of all orders across all users

### Interactive Features
- **Session Persistence** — User stays logged in after a page refresh
- **Shopping Cart** — Add products to a cart backed by localStorage; the cart survives page reloads
- **Toast Notifications** — Immediate feedback on all actions (success and error)
- **Route Protection** — Customer and admin routes are gated by role; redirects occur without flashing protected content
- **Deletion Guards** — The system refuses to delete a product or category that has dependencies, with a user-visible explanation

## Technologies

**Requirement 14.3** — The project is built with:

- **Next.js** — React framework with App Router for file-based routing and Server Components
- **React** — Component library and hooks for UI and state management
- **TypeScript** — Type safety across components, API calls, and form logic
- **Tailwind CSS** — Utility-first CSS framework for styling
- **react-hot-toast** — Toast notifications for user feedback
- **Playwright** — End-to-end testing framework for automated journey testing
- **next/navigation** — Client-side routing and navigation primitives
- **localStorage** — Session persistence (session token and user record) and cart persistence
- **NEXT_PUBLIC_API_BASE_URL** — Environment variable for the backend API endpoint

## Getting Started

**Requirement 14.4** — To run the app locally:

### Prerequisites
- Node.js 18+ and npm
- The RevoGarb Flask API running (see `.env.example` for the live production endpoint)

### Setup and Run

1. **Copy the environment template to create a local configuration file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Open `.env.local` and fill in the values:**

   ```env
   NEXT_PUBLIC_API_BASE_URL=https://web-production-03650.up.railway.app
   E2E_ADMIN_EMAIL=your-admin-email@example.com
   E2E_ADMIN_PASSWORD=your-admin-password
   ```

   - `NEXT_PUBLIC_API_BASE_URL` — The base URL of the RevoGarb Flask API (no `/api` path, no trailing slash)
   - `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` — Optional; only needed to run Playwright tests

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Public | Base URL of the Flask API; exposed to the browser for client-side catalog fetches. No trailing slash. |
| `E2E_ADMIN_EMAIL` | Playwright only | Admin email for end-to-end test runs. Never commit real credentials. |
| `E2E_ADMIN_PASSWORD` | Playwright only | Admin password for end-to-end tests. Never commit real credentials. |

## Running Tests

### Playwright End-to-End Suite

The project includes an automated suite of three journeys: authentication (register/login), shopping (browse/add to cart/checkout), and admin CRUD.

1. **Ensure the dev server is running** (or let Playwright start it):

   ```bash
   npm run dev
   ```

   Or run tests directly and let them start the server:

   ```bash
   npm run test:e2e
   ```

2. **Run the Playwright suite:**

   ```bash
   npm run test:e2e
   ```

   Or with the UI mode for debugging:

   ```bash
   npm run test:e2e:ui
   ```

The suite creates unique test data on each run (timestamped emails for registration, uniquely named products) so it is fully repeatable. Test credentials come from `.env.local`.

### Linting and Type Checking

```bash
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run build         # Next.js build (also runs type checking)
```

## Important Notes

### Admin Role Cannot Be Self-Registered

The `POST /register` API endpoint always returns a `CUSTOMER` role, regardless of input. Admin accounts cannot be created through the UI and must be provisioned out of band (e.g., by an API administrator). When an admin account is available in the system, logging in with admin credentials will grant access to the dashboard and admin CRUD tools; the dashboard is protected and inaccessible to customers.

### Session and Cart Storage

The app uses `localStorage` for two key data sets:

- **Session** — The logged-in user's access token and user record, under the key `revogarb.session`. Survives page refreshes and is cleared on logout.
- **Cart** — Items, quantities, and prices, under the key `revogarb.cart`. Survives page refreshes and is cleared after a successful checkout.

Both are secured by type guards so a corrupted value does not crash the app; instead, the guard rejects it and treats it as absent (logged out or empty cart).

## Project Structure

```
module-3-alzedmkrom/
├─ app/                    # Routes and page components
│  ├─ login/
│  ├─ register/
│  ├─ cart/
│  ├─ checkout/
│  ├─ orders/
│  └─ dashboard/
├─ components/             # Reusable UI components
├─ context/                # Auth and Cart context providers
├─ hooks/                  # useAuth, useCart, useRequireRole
├─ lib/                    # Types, API utilities, storage, format helpers
├─ e2e/                    # Playwright test specs
├─ public/                 # Static assets
├─ .env.example            # Environment template (committed)
├─ .env.local              # Local configuration (git-ignored)
└─ README.md
```

## Checkpoint History

### Checkpoint 1 on a separate branch

The Checkpoint 1 fundamentals exercises — the semantic HTML/CSS profile page, the vanilla JavaScript DOM and array-methods exercises, and the TypeScript + Tailwind typed product catalog — are archived on the [`checkpoint-1`](../../tree/checkpoint-1) branch.

```bash
git checkout checkpoint-1
```

That branch holds its own README with setup and run instructions for those exercises, plus the screenshots submitted as evidence.



## Screenshots

**Requirement 14.5** — The following screenshots demonstrate the app in action, captured running against the live API.

### Checkpoint 3 — Full-Stack Application

These screenshots showcase the completed Checkpoint 3 application with authentication, cart, checkout, and admin functionality.

#### Customer Journeys

**Home Page** — Browse featured products

![Home page with featured products](images/checkpoint3_home.jpg)

**Products Listing** — Browse all products with search and filtering

![Products listing page](images/checkpoint3_products_listing.jpg)

**Product Detail** — Individual product page with add to cart

![Product detail page](images/checkpoint3_product_detail.jpg)

**Categories** — View product categories

![Categories listing page](images/checkpoint3_categories.jpg)

#### Authentication

**Register Page** — Create a new account

![Registration form with validated fields](images/checkpoint3_register.jpg)

**Login Page** — Sign in with email and password

![Login form](images/checkpoint3_login.jpg)

#### Admin Pages

**Admin Dashboard** — Manage products with create, edit, and delete

![Admin dashboard for product management](images/checkpoint3_admin_dashboard.jpg)

---

### Checkpoint 2 Evidence (Previous Checkpoint)

Preserved below for reference, showing the read-only storefront that Checkpoint 3 built upon.

#### Home — five real products from the API

![Home page rendering five products fetched from the API](images/homepage.jpg)

#### Products — live search and category filtering

![Products page with a live search query applied](images/products_with_live_search.jpg)

![Products page filtered by a selected category](images/products_filter_with_category.jpg)

#### Product detail — dynamic page title

![Product detail page showing real data and a dynamic page title](images/product_id_detail.jpg)

#### Active-route highlighting

![Navigation bar highlighting the active route via usePathname()](images/active_route_highlighting_categories_page.jpg)

#### Categories and orders

![Categories page with live data](images/products_page.jpg)

![Orders page showing an order with its line items](images/orders_page_with_detail.jpg)

#### Loading states (`loading.tsx`)

Every data-fetching route renders a skeleton while its Server Component fetch is in flight.

| Route | Screenshot |
|---|---|
| Home | ![Home loading skeleton](images/homepage_loading_skeleton.jpg) |
| Products | ![Products loading skeleton](images/products_loading_skeleton.jpg) |
| Product detail | ![Product detail loading skeleton](images/product_id_loading_skeleton.jpg) |
| Categories | ![Categories loading skeleton](images/categories_loading_skeleton.jpg) |
| Orders | ![Orders loading skeleton](images/orders_loading_skeleton.jpg) |

#### Error states (`error.tsx`)

Captured by pointing `NEXT_PUBLIC_API_BASE_URL` at an unreachable host so every fetch throws. Each route catches the thrown error and shows a friendly recovery UI with a retry control.

| Route | Screenshot |
|---|---|
| Home | ![Home error state](images/homepage_error_state.jpg) |
| Products | ![Products error state](images/products_error_state.jpg) |
| Product detail | ![Product detail error state](images/product_id_error_state.jpg) |
| Categories | ![Categories error state](images/categories_error_state.jpg) |
| Orders | ![Orders error state](images/orders_error_state.jpg) |
