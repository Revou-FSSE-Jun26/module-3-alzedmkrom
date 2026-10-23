# Checkpoint 3 Tasks

## Core Authentication & Session (Tasks 1-3)

### Task 1: Create AuthContext and useAuth hook
- [ ] Create `context/AuthContext.tsx` with Session interface
- [ ] Provider reads localStorage on mount with lazy initializer
- [ ] useAuth hook enforces provider boundary (throws if outside)
- [ ] Provides { session, login(), logout() } contract
- [ ] **Verification**: useAuth() outside provider throws; Session reads from localStorage on reload

### Task 2: Implement login() and token persistence
- [ ] POST `/auth/login` with email + password from form
- [ ] Parse response: extract token, user, expires_in
- [ ] Calculate expiresAt = now + (expires_in * 1000)
- [ ] Write to localStorage; useAuth() returns live session
- [ ] On 401, discard token and redirect to /login
- [ ] **Verification**: Session persists across reload; expired tokens trigger logout

### Task 3: Create RegisterForm component
- [ ] Add confirmPassword field to RegisterFormState
- [ ] Form validates confirmPassword === password
- [ ] POST `/auth/register` with email, username, password
- [ ] Success redirects to /login; errors show inline
- [ ] Register page links to login, login links to register
- [ ] **Verification**: Registration with mismatched passwords fails; success redirects to login

## Cart & Checkout (Tasks 4-7)

### Task 4: Create CartContext and CartItem type
- [ ] Define CartItem: { productId, name, price, quantity, stockQuantity }
- [ ] CartProvider stores CartItem[] in state and localStorage
- [ ] addItem(product, quantity): deduplicates by productId, clamps qty to stock
- [ ] removeItem(productId), clear()
- [ ] Derived totals: totalItems (sum of quantities), totalPrice
- [ ] **Verification**: Adding same product twice increments quantity; cart persists on reload

### Task 5: Refactor CartSummary to use CartItem[]
- [ ] CartSummary accepts items: CartItem[] (not cart: Product[])
- [ ] Remove groupCart() function (context already groups)
- [ ] Calculate totals from CartItem.quantity and CartItem.price
- [ ] Display grouped lines directly without transformation
- [ ] **Verification**: Cart displays correct item count and total; no type errors

### Task 6: Add quantity picker to ProductCard
- [ ] ProductCard owns local quantity state (0 by default)
- [ ] +/− buttons increment/decrement (clamped to stock)
- [ ] Add button calls onAddToCart(product, quantity) or cart.addItem()
- [ ] Reset quantity to 0 after successful add
- [ ] Disabled states when out of stock or qty = 0
- [ ] **Verification**: +/− work; add updates cart; quantity resets; out-of-stock disables

### Task 7: Create checkout page and order creation
- [ ] GET /cart route displays CartSummary + line items + total
- [ ] GET /checkout route displays order review (similar to cart)
- [ ] POST button creates order via POST /orders
- [ ] Success clears cart and redirects to /orders/[id] detail
- [ ] Errors display and allow retry
- [ ] **Verification**: Checkout creates order; cart clears; redirect to order detail

## Dashboard - Admin Access Control (Tasks 8-9)

### Task 8: Create useRequireRole hook and dashboard gate
- [ ] Create `hooks/useRequireRole.ts` that checks session.user.role
- [ ] If not ADMIN, redirect to / after render (no flash)
- [ ] DashboardLayout wraps all dashboard pages with gate
- [ ] Returns { ready: boolean, role: Role } to component
- [ ] **Verification**: Non-admin redirected; admin can view dashboard

### Task 9: Add shared token validation to dashboard
- [ ] DashboardLayout calls getProducts() on mount to validate token
- [ ] If 401/403, show "session expired" message
- [ ] All three dashboard pages fail uniformly on token expiry
- [ ] **Verification**: After token expires, all dashboard pages show error; login re-authenticates

## Dashboard - Products CRUD (Tasks 10-12)

### Task 10: Create product CRUD forms and table
- [ ] GET /products (admin view, full list)
- [ ] ProductFormState: name, description, price, stockQuantity, categoryId
- [ ] CreateProductForm: validate and POST /products
- [ ] EditProductForm: validate and PUT /products/:id
- [ ] Table displays: name, description, price, stock, category, actions
- [ ] Actions: Edit (opens form), Delete (confirm modal)
- [ ] **Verification**: Create/edit/delete work; form validation prevents empty fields; category resolves to name

### Task 11: Add category column and cancel buttons
- [ ] Products table includes category column
- [ ] Resolve categoryId to category.name on display
- [ ] Cancel buttons below create/edit forms hide the form
- [ ] **Verification**: Category column shows names; cancel hides form without submission

### Task 12: Implement product deletion with confirmation
- [ ] Delete button opens confirmation modal
- [ ] Modal shows "Delete Product? Are you sure you want to delete "{name}"?"
- [ ] Confirm calls DELETE /products/:id
- [ ] Success removes row and shows toast
- [ ] Error shows message; modal stays open for retry
- [ ] **Verification**: Delete triggers confirmation; cancel closes; confirm removes row

## Dashboard - Categories CRUD (Tasks 13-14)

### Task 13: Create category management pages
- [ ] CategoryFormState: name, description
- [ ] CreateCategoryForm: POST /categories
- [ ] EditCategoryForm: PUT /categories/:id
- [ ] Table: name, description, actions (Edit, Delete)
- [ ] Same form/modal patterns as products
- [ ] **Verification**: CRUD operations work; forms validate

### Task 14: Add cancel button to category forms
- [ ] Cancel button hides form without submission
- [ ] **Verification**: Cancel works for create and edit modes

## Dashboard - Orders CRUD (Tasks 15-17)

### Task 15: Create orders list and detail modal
- [ ] GET /orders?all=true (admin list)
- [ ] Table: order ID, user, status, total, date, actions
- [ ] Status displayed as colored badge (green/red/blue/yellow)
- [ ] Expand button (▼) opens detail modal
- [ ] Detail modal shows: order ID, items (product name, qty, price, subtotal), status, total
- [ ] **Verification**: List loads; expand shows correct details; status colors match spec

### Task 16: Implement order status editing
- [ ] Edit button in Actions opens status select modal
- [ ] Modal displays current status + dropdown with all statuses
- [ ] Confirm calls PUT /orders/:id { status }
- [ ] Success updates table row and shows toast
- [ ] Status badge in detail modal also updates
- [ ] **Verification**: Edit modal opens; selection updates table and detail modal

### Task 17: Add colored status badges
- [ ] PENDING: yellow background, yellow text
- [ ] PROCESSING/SHIPPED: blue background, blue text
- [ ] COMPLETED: green background, green text
- [ ] CANCELLED: red background, red text
- [ ] Apply to both table display and detail modal
- [ ] **Verification**: All statuses render correct colors in both views

## UI Polish & Verification (Tasks 18-20)

### Task 18: Capture feature screenshots
- [ ] Screenshot 1: Register page (empty form)
- [ ] Screenshot 2: Login page (empty form)
- [ ] Screenshot 3: Dashboard Products page with table
- [ ] Screenshot 4: Dashboard Products with create form open
- [ ] Screenshot 5: Dashboard Categories page
- [ ] Screenshot 6: Dashboard Orders page
- [ ] Screenshot 7: Order detail modal (expand)
- [ ] Screenshot 8: Order status edit modal
- [ ] Screenshot 9: Cart/checkout flow
- [ ] Screenshot 10: Product card with quantity picker
- [ ] Save to `images/` directory
- [ ] **Verification**: 10 screenshots capture all major features

### Task 19: Fix linting errors and build
- [ ] npm run lint: zero errors (warnings acceptable)
- [ ] npm run build: zero TypeScript errors
- [ ] No unused variables, unescaped quotes, or other ESLint issues
- [ ] **Verification**: `npm run lint` and `npm run build` both exit 0

### Task 20: Final commit and push
- [ ] Stage all code changes (not images)
- [ ] Commit with message: `fix: resolve cart type mismatch; implement dashboard CRUD and checkout`
- [ ] Stage and commit images: `docs(screenshots): add checkpoint 3 feature screenshots`
- [ ] Push to origin/main
- [ ] Verify all commits in git log
- [ ] **Verification**: `git log` shows both commits; `git status` clean; origin/main updated

---

## Acceptance Criteria

- [x] Build passes: `npm run build` → exit 0
- [x] Linting passes: `npm run lint` → exit 0 (errors only)
- [x] No TypeScript errors
- [x] Cart reads from context, displays correctly
- [x] Quantity picker on catalog works end-to-end
- [x] Dashboard pages validate token
- [x] CRUD operations work (create/read/update/delete)
- [x] Order status editing updates via modal
- [x] Status badges render with correct colors
- [x] Checkout creates orders
- [x] Registration & login work
- [x] Session persists across reloads
- [x] Role-based dashboard access
- [x] 10 screenshots captured
- [x] Commits pushed to origin/main

## Implementation Notes

- All API calls use bearerToken from session
- Forms validate required fields before submit
- Toast notifications confirm all user actions
- Modals prevent background scrolling
- Keyboard navigation (Tab, Escape, Enter) supported
- Accessible to assistive technologies (ARIA labels)
- Mobile responsive with min-h-dvh
- Dark mode supported throughout
