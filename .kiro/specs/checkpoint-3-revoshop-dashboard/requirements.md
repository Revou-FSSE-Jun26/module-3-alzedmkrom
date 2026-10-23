# Checkpoint 3: RevoShop Dashboard & Checkout

**Checkpoint 3** completes the RevoShop frontend by adding full user-facing authentication, cart persistence, checkout, and an admin dashboard for product/category/order management.

## Scope

Build on Checkpoint 2's read-only catalog with:
- User authentication (registration, login, JWT token management)
- Shopping cart with persistence (localStorage) and quantity tracking
- Checkout workflow
- Admin dashboard (role-based access control)
- Full CRUD for products, categories, and orders
- Order status management and detail views
- Session token validation across pages

## Key Features

### Authentication
- Registration form with email, username, password, confirm-password
- Login form with JWT token handling
- Token stored in localStorage with expiry time
- Role-based routing (admin vs. customer)
- Session expiry handling with re-authentication prompt

### Cart & Checkout
- Real-time cart updates via context (CartContext)
- Persistent cart in localStorage
- Quantity picker on product cards (+/− controls)
- Cart summary with expandable line-item breakdown
- Checkout page with order review and payment simulation
- Toast notifications on cart updates

### Dashboard (Admin-Only)
- Product management: create, read, update, delete
- Category management: create, read, update, delete
- Order management: view, edit status, expand order details
- Colored status badges (green/red/blue/yellow)
- Modal-based editing and detail views
- Token validation on all dashboard pages

### UI Enhancements
- Quantity picker component on catalog product cards
- Colored status badges in order lists and modals
- Order detail expansion modal with line items and total
- Cancel buttons on all forms
- Confirm-password field in registration
- Category column in admin products table
- Dynamic viewport height (min-h-dvh) for mobile support

## Technical Requirements

- **Types**: CartItem vs Product distinction maintained
- **Cart Context**: Deduplicates lines by productId, not flat array
- **Persistence**: localStorage for cart and session
- **API Integration**: Full CRUD endpoints for products, categories, orders
- **Authentication**: JWT token with expiry tracking
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation
- **Build Quality**: TypeScript strict mode, ESLint passing, zero errors

## Success Criteria

✅ Build passes with zero TypeScript errors and zero ESLint errors
✅ Cart state reads from context, displays correct totals
✅ Quantity picker on catalog cards works end-to-end
✅ Dashboard pages validate token on mount
✅ All CRUD operations work (create, read, update, delete)
✅ Order status editing updates via modal
✅ Status badges render with correct colors
✅ Checkout flow completes order creation
✅ Login/registration forms validate and authenticate
✅ Session persists across page reloads
✅ Non-admin users cannot access dashboard
✅ All 10 feature screenshots captured
