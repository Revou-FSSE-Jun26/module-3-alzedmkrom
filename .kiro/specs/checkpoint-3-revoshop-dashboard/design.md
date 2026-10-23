# Checkpoint 3 Design

## Architecture

### Authentication Flow
1. User registers with email, username, password, confirm-password
2. POST `/auth/register` creates user (no token returned)
3. User logs in with email + password
4. POST `/auth/login` returns `{ access_token, expires_in, user }`
5. Token stored in Session (localStorage) with calculated `expiresAt`
6. All authenticated requests include token in Authorization header
7. 401 responses trigger logout and redirect to /login

### Cart State Management
- **CartContext** owns the cart: `CartItem[]` (grouped by productId, not flat)
- Each CartItem: `{ productId, name, price, quantity, stockQuantity }`
- Persisted to localStorage on every change
- Context provides: `addItem()`, `removeItem()`, `clear()`, totals
- ProductCard calls `cart.addItem(product, quantity)` in catalog mode
- CartSummary reads from context and displays grouped lines

### Component Hierarchy

```
App
├─ CartProvider (context)
├─ AuthProvider (session from localStorage)
├─ Layout
│  ├─ Header (logout, cart link)
│  ├─ Nav (home, products, cart, dashboard if admin)
│  └─ Outlet
├─ Products (catalog)
│  ├─ ProductList (read cart from context)
│  │  ├─ SearchBar
│  │  ├─ CategoryFilter
│  │  ├─ ProductGrid
│  │  │  └─ ProductCard (quantity picker, add to cart)
│  │  └─ CartSummary (display from context)
│  └─ ProductDetail
├─ Cart (display & review)
│  └─ CartSummary (expandable)
├─ Checkout (order creation)
├─ Orders (customer view, list & detail)
├─ Auth
│  ├─ Register
│  ├─ Login
│  └─ Logout (POST /auth/logout)
└─ Dashboard (admin-only, gated by role)
   ├─ DashboardLayout (token validation)
   ├─ Products (table + create/edit forms)
   ├─ Categories (table + create/edit forms)
   └─ Orders (table + status edit modal + detail modal)
```

### Type Distinctions

**Product** (full catalog record):
```typescript
{
  id, categoryId, name, description, price,
  stockQuantity, isDeleted, createdAt, imageUrl
}
```

**CartItem** (snapshot when added):
```typescript
{
  productId, name, price, quantity, stockQuantity
}
```

CartSummary accepts `CartItem[]`, not `Product[]`. This prevents type mismatch and reflects the actual cart structure (already grouped, snapshot prices).

### Form Patterns

All forms use a consistent pattern:
1. Local state for form fields (strings, parsed on validation)
2. Separate `isSubmitting` boolean for loading state
3. onSubmit handler calls API, updates parent state, shows toast
4. Errors displayed inline next to each field
5. Cancel button hides the form (or resets to previous mode)
6. Confirm-password field validated to match password

### API Integration

**Auth endpoints:**
- POST `/auth/register` → User (no token)
- POST `/auth/login` → { access_token, expires_in, user }
- POST `/auth/logout` (optional, tokens are stateless)

**Products:**
- GET `/products?search=&categoryId=` → Product[]
- GET `/products/:id` → Product
- POST `/products` (admin) → Product
- PUT `/products/:id` (admin) → Product
- DELETE `/products/:id` (admin) → {}

**Categories:**
- GET `/categories` → Category[]
- POST `/categories` (admin) → Category
- PUT `/categories/:id` (admin) → Category
- DELETE `/categories/:id` (admin) → {}

**Orders:**
- GET `/orders` → Order[]
- GET `/orders?all=true` (admin) → Order[]
- GET `/orders/:id` → OrderDetail (includes items)
- POST `/orders` (checkout) → Order
- PUT `/orders/:id` (admin status edit) → Order

### State Management

**Session (localStorage):**
```typescript
{
  token: string,
  user: User,
  expiresAt: number // epoch ms
}
```

**Cart (localStorage):**
```typescript
CartItem[]
```

**Component state:**
- ProductList: items, categoryId, isPending, fetchError
- ProductCard: quantity (local counter)
- Forms: field values, isSubmitting, errors
- Dashboard: selectedProduct/Category, formMode, deleteConfirm

## Styling

- **Mobile-first responsive**: sm: breakpoint at 640px
- **Dark mode support**: dark: classes throughout
- **Status colors**:
  - PENDING: yellow (bg-yellow-50, text-yellow-700)
  - PROCESSING: blue (bg-blue-50, text-blue-700)
  - SHIPPED: blue (bg-blue-50, text-blue-700)
  - COMPLETED: green (bg-green-50, text-green-700)
  - CANCELLED: red (bg-red-50, text-red-700)
- **Buttons**: rounded-md, border, px-3 py-2, transition, hover/active states
- **Forms**: text inputs with borders, error text in red, labels above
- **Tables**: bordered, zebra striping with dark mode support
- **Modals**: overlay, card centered, backdrop blur

## Key Design Decisions

1. **CartItem vs Product**: Context stores grouped CartItem[] to reflect actual cart structure. CartSummary accepts CartItem[], avoiding type mismatch.

2. **Token persistence**: Calculated `expiresAt` at login time so expiry survives reloads without network calls.

3. **Shared token validation**: Dashboard layout validates token on mount (not just /orders). All three routes fail uniformly on expiry.

4. **Form modals**: Order status edit and order detail use modals instead of page navigation to keep context.

5. **Quantity picker**: +/− controls on each product card so user chooses qty before adding (not fixed 1).

6. **Status badges**: Color-coded, consistent between table and detail views.

7. **Min-height viewport**: `min-h-dvh` (dynamic viewport height) instead of `min-h-screen` for mobile — addresses viewport height shrinking on mobile scrolls.

8. **Accessibility**: ARIA labels, live regions for cart count, semantic HTML.
