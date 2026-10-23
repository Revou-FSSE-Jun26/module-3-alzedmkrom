# Requirements — Checkpoint 3: RevoShop Auth, Cart and Admin

## Introduction

Checkpoint 3 completes the RevoShop frontend. Checkpoint 1 proved the fundamentals, Checkpoint 2 built the component tree, routing, and read-only API integration. This checkpoint adds authentication with session persistence, a cart backed by `localStorage`, checkout that writes a real order, role-based route protection, full admin CRUD for products and categories, toast notifications, and a Playwright end-to-end suite.

The app is built and tested **locally** against the Module 2 Flask API. Vercel deployment is explicitly out of scope for this checkpoint and belongs to the final Module 3 submission.

## Glossary

- **Session persistence**: the logged-in user surviving a full page refresh, restored from `localStorage` rather than re-fetched from a login call.
- **Role**: the authenticated user's permission level. The API issues `CUSTOMER` or `ADMIN` and enforces admin-only writes server-side.
- **Protected route**: a route that redirects unauthorized or logged-out visitors instead of rendering.
- **Deletion guard**: refusing to delete a record that other records depend on, and surfacing why.
- **Optimistic vs confirmed**: cart changes are local state; checkout is confirmed only when the API accepts the order.
- **E2E test**: a Playwright test driving a real browser through a complete user journey.

## Requirements

### Requirement 1 — Registration

**User Story:** As a new visitor, I want to create an account, so that I can shop as a logged-in customer.

#### Acceptance Criteria

1. THE app SHALL provide a `/register` route rendering a `RegisterForm`.
2. `RegisterForm` SHALL use controlled inputs for username, email, and password, and SHALL validate every field before submitting.
3. THE validation SHALL reject an empty username, an email that is not a valid address, and a password shorter than the API's 8-character minimum, showing a per-field message below the offending input.
4. WHEN registration succeeds THEN the user SHALL be logged in automatically AND redirected according to Requirement 4.
5. IF the API rejects the registration (for example a duplicate email) THEN the returned message SHALL be surfaced to the user AND the entered values SHALL be preserved.
6. THE registration request SHALL target the API's current registration endpoint.

### Requirement 2 — Login

**User Story:** As a returning user, I want to log in, so that I can access my cart, orders, and any admin tools.

#### Acceptance Criteria

1. THE app SHALL provide a `/login` route rendering a `LoginForm` with controlled email and password inputs.
2. WHEN credentials are valid THEN the user SHALL be logged in AND redirected according to Requirement 4.
3. IF credentials are invalid THEN an error message SHALL render on the form AND no redirect SHALL occur.
4. THE login response's access token and user record SHALL be captured for use by subsequent authenticated requests.

### Requirement 3 — Session persistence and header state

**User Story:** As a logged-in user, I want to stay logged in across refreshes, so that I do not lose my session on navigation.

#### Acceptance Criteria

1. THE session SHALL persist in `localStorage`.
2. WHEN the page is refreshed THEN the logged-in user SHALL remain logged in.
3. THE `Header` SHALL display the logged-in username, AND that name SHALL survive a full page refresh.
4. THE `Header` SHALL offer a logout control that clears the stored session and returns the user to a logged-out state.
5. WHILE no user is logged in THE `Header` SHALL present login and register affordances instead of a username.
6. THE stored session SHALL be read in a way that does not break server rendering, since `localStorage` is browser-only.

### Requirement 4 — Role-based redirects and route protection

**User Story:** As the system, I want each role to reach only its own pages, so that customers cannot use admin tools.

#### Acceptance Criteria

1. WHEN an `ADMIN` logs in or registers THEN they SHALL be redirected to `/dashboard`.
2. WHEN a `CUSTOMER` logs in or registers THEN they SHALL be redirected to `/`.
3. WHEN a `CUSTOMER` requests `/dashboard`, `/dashboard/orders`, or `/dashboard/categories` THEN they SHALL be redirected to `/`.
4. WHEN a logged-out visitor requests any protected route THEN they SHALL be redirected away rather than shown the page.
5. THE protected customer routes — `/cart`, `/checkout`, `/orders`, `/orders/[id]` — SHALL require a logged-in user.
6. THE redirect SHALL occur without briefly rendering the protected content.

### Requirement 5 — Cart

**User Story:** As a customer, I want a cart that remembers what I picked, so that I can review it before buying.

#### Acceptance Criteria

1. THE app SHALL provide an `AddToCartButton` that adds a product to the cart.
2. THE cart SHALL persist in `localStorage` AND SHALL survive a page refresh.
3. THE app SHALL provide a `/cart` route rendering a table of cart items with, per row, the product, its quantity, a line total, and a remove button.
4. THE cart page SHALL display an overall total.
5. WHEN the cart is empty THEN an empty state SHALL render AND the checkout button SHALL be disabled.
6. WHEN a remove button is activated THEN that item SHALL be removed from the cart and from `localStorage`.
7. ALL cart state updates SHALL be immutable.

### Requirement 6 — Checkout

**User Story:** As a customer, I want to confirm my order, so that my purchase is recorded.

#### Acceptance Criteria

1. THE app SHALL provide a `/checkout` route that summarizes the cart and offers a confirm action.
2. WHEN checkout is confirmed THEN the app SHALL create the order via an authenticated `POST /orders` carrying the cart's product ids and quantities.
3. WHEN the order is accepted THEN the cart SHALL be cleared from state and `localStorage`, AND the user SHALL be redirected to `/orders`.
4. IF the order request fails THEN the cart SHALL be left intact AND the failure SHALL be surfaced to the user.
5. THE checkout action SHALL be unavailable when the cart is empty.

### Requirement 7 — Customer order views

**User Story:** As a customer, I want to see my orders, so that I can confirm what I bought.

#### Acceptance Criteria

1. `/orders` SHALL list the logged-in user's own orders.
2. `/orders/[id]` SHALL show a single order including its line items, each with product, quantity, and unit price.
3. THE order requests SHALL be authenticated, AND SHALL request only the logged-in user's own data.
4. WHEN the user has no orders THEN an empty state SHALL render.

### Requirement 8 — Admin product CRUD

**User Story:** As an admin, I want to manage the catalog, so that the storefront reflects real inventory.

#### Acceptance Criteria

1. `/dashboard` SHALL present the product list and full create, edit, and delete controls.
2. `CreateProductForm` SHALL validate its fields, submit to the API, AND on success the new product SHALL appear in the product table.
3. `EditProductForm` SHALL load an existing product's values, submit an update, AND on success the table SHALL reflect the change.
4. THE delete action SHALL remove a product AND the table SHALL reflect the removal.
5. WHEN deleting a product that has active orders THEN the deletion SHALL be refused AND a visible error SHALL explain why.
6. ALL product writes SHALL be authenticated as an admin.

### Requirement 9 — Admin category CRUD

**User Story:** As an admin, I want to manage categories, so that products stay organized.

#### Acceptance Criteria

1. `/dashboard/categories` SHALL present the category list with full create, edit, and delete controls.
2. `CreateCategoryForm` SHALL validate the name field AND create a new category on submit.
3. THE edit action SHALL update an existing category.
4. WHEN deleting a category that still has linked products THEN the deletion SHALL be refused AND a visible error SHALL explain why.

### Requirement 10 — Admin order overview

**User Story:** As an admin, I want to see all orders, so that I can monitor the shop.

#### Acceptance Criteria

1. `/dashboard/orders` SHALL present a read-only overview of orders across all users.
2. THE view SHALL be reachable only by an `ADMIN`.
3. THE view SHALL offer no mutation controls.

### Requirement 11 — Toast notifications

**User Story:** As a user, I want immediate feedback on my actions, so that I know whether they worked.

#### Acceptance Criteria

1. THE app SHALL show a toast on success for cart actions and for every CRUD operation.
2. THE app SHALL show a toast on error for cart actions and for every CRUD operation.
3. THE toasts SHALL be rendered through a single app-wide provider.
4. THE toast text SHALL name what happened rather than showing a raw error object.

### Requirement 12 — Project structure

**User Story:** As a reviewer, I want a clean structure, so that I can navigate the codebase.

#### Acceptance Criteria

1. THE repository SHALL separate pages (routes), components, hooks, context, and library utilities into distinct directories.
2. THE authentication and cart state SHALL each be exposed through a context provider and a matching hook.
3. THE repository SHALL accumulate a commit history reflecting progress across forms, authentication, and testing.
4. THE project SHALL type-check, lint, and build without errors.

### Requirement 13 — Playwright end-to-end suite

**User Story:** As a grader, I want an automated suite proving the journeys work, so that the app is verifiably correct.

#### Acceptance Criteria

1. THE project SHALL include Playwright, configured to run against the locally running app.
2. THE suite SHALL run and pass locally via a documented command.
3. THE suite SHALL cover the registration and login flow.
4. THE suite SHALL cover the full browsing journey: products list, add to cart, checkout.
5. THE suite SHALL cover the full admin CRUD dashboard journey: create, edit, delete.
6. THE tests SHALL generate unique data per run where the API rejects duplicates, so the suite is repeatable.
7. THE tests SHALL read credentials and the API base URL from configuration rather than hardcoding secrets.

### Requirement 14 — Documentation

**User Story:** As a grader, I want a README that explains and demonstrates the project, so that I can assess it without reverse-engineering.

#### Acceptance Criteria

1. THE README SHALL include an overview of what the RevoShop frontend does.
2. THE README SHALL list the implemented pages and major functionality.
3. THE README SHALL list the technologies used, including Next.js, React, TypeScript, Tailwind CSS, react-hot-toast, Playwright, `next/navigation`, `localStorage` session persistence, and `NEXT_PUBLIC_API_BASE_URL`.
4. THE README SHALL give step-by-step instructions to run the app locally AND to run the Playwright suite.
5. THE README SHALL include at least one screenshot for each major page: home, product listing, product detail, category listing, register, login, and admin dashboard.

### Requirement 15 — Secret hygiene

**User Story:** As the repository owner, I want no secrets committed, so that credentials never leak.

#### Acceptance Criteria

1. REAL credentials SHALL live only in a git-ignored environment file.
2. A committed example environment file SHALL document the required variable names with placeholder values.
3. NO admin or customer password SHALL appear in committed source, tests, or documentation.
4. THE Playwright suite SHALL source its test credentials from environment configuration.
