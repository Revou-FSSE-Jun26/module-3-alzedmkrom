# Requirements — Checkpoint 2: RevoShop Next.js Frontend

## Introduction

Checkpoint 1 validated the raw fundamentals. This checkpoint builds the actual RevoShop frontend: a scaffolded Next.js project with a typed, reusable component library, file-based App Router routing, and live data fetched from the Flask API built in Module 2.

Scope boundary set by the assignment: forms are wired to **local component state only**. Real `POST`/`PUT`/`DELETE` calls, authentication, and the cart/checkout flow belong to Checkpoint 3. Data fetching in this checkpoint is read-only (`GET`).

## Glossary

- **App Router**: Next.js routing driven by the `app/` directory, where each route is a folder containing `page.tsx`.
- **Server Component**: A component rendered on the server. The default in the App Router. May be `async` and may `await fetch` directly. Cannot use hooks or browser events.
- **Client Component**: A component opted in with the `"use client"` directive. Runs in the browser, may use hooks (`useState`, `useEffect`, `usePathname`, `useSearchParams`).
- **Controlled input**: A form input whose displayed value comes from React state, updated through an `onChange` handler.
- **Immutable state update**: Producing a new array or object rather than mutating the existing one, e.g. `setCart([...cart, product])` instead of `cart.push(product)`.
- **Nested layout**: A `layout.tsx` inside a route segment that wraps that segment's pages and stays mounted while navigating between sibling routes within it.
- **Dynamic route params**: Values captured from the URL path by a bracketed folder name such as `products/[id]`.

## Requirements

### Requirement 1 — Project scaffold and structure

**User Story:** As a grader, I want a cleanly scaffolded Next.js project that starts without errors, so that I can run and inspect the app immediately.

#### Acceptance Criteria

1. THE project SHALL be scaffolded with `create-next-app` using TypeScript, App Router, and Tailwind CSS.
2. WHEN `npm run dev` is run THEN the development server SHALL start AND the app SHALL render with no build errors and no runtime errors in the terminal or browser console.
3. THE repository SHALL separate concerns into distinct directories: a `components/` directory for reusable components, an `app/` directory for routes, and a directory for utilities and shared types.
4. ALL components and route files SHALL be TypeScript (`.tsx` / `.ts`), with no plain `.jsx` or `.js` component files.
5. THE project SHALL type-check and build without errors.
6. THE repository SHALL accumulate a commit history showing incremental progress in the order scaffold, then components, then routing, then API integration — not a single squashed commit.

### Requirement 2 — Typed reusable component library

**User Story:** As a developer, I want typed reusable components, so that the UI is composable and the props are self-documenting.

#### Acceptance Criteria

1. THE `components/` directory SHALL contain at least `Header`, `Footer`, `ProductCard`, `Card`, `SearchBar`, and `AddProductForm`, each a functional component written in TypeScript.
2. THE code SHALL define a `ProductCardProps` interface typing every prop `ProductCard` accepts.
3. `ProductCardProps` SHALL include at least one optional prop, AND that prop SHALL receive a default value via destructuring defaults in the component signature.
4. THE `Card` component SHALL be a presentational wrapper that renders arbitrary children inside a shared container style, AND `ProductCard` SHALL compose it rather than duplicating that container markup.
5. THE typed product shape SHALL be reused from the Checkpoint 1 model — mirroring the Flask API's `products` fields — rather than redefined with different field names.

### Requirement 3 — ProductCard behavior and conditional rendering

**User Story:** As a shopper, I want each product card to reflect its real stock state, so that I can tell what is purchasable.

#### Acceptance Criteria

1. `ProductCard` SHALL implement a quantity counter allowing the displayed quantity to be increased and decreased.
2. THE quantity SHALL never go below zero, AND SHALL not exceed the product's available stock.
3. `ProductCard` SHALL conditionally render based on stock state, showing a different control and label for an in-stock product than for an out-of-stock one.
4. WHEN a product is out of stock THEN its add control SHALL be disabled, so stock state drives behavior and not only styling.
5. THE code SHALL implement a function with the signature `getButtonClasses(inStock: boolean): string` that returns a different complete Tailwind class string for the available and unavailable states.
6. `getButtonClasses` SHALL return complete literal class strings, since Tailwind resolves classes by scanning source text.

### Requirement 4 — Component tree decomposition

**User Story:** As a reviewer, I want the catalog page composed of components, so that the page file reads as structure rather than markup.

#### Acceptance Criteria

1. THE product catalog page SHALL be decomposed so its `page.tsx` renders the page-level component tree — `<Header />`, a `<ProductGrid />` (or equivalent page content component), and `<Footer />` — rather than inline product markup.
2. THE product grid SHALL render its cards from a single `.map()` over a typed `Product[]` array, with no hardcoded or repeated `ProductCard` instances.
3. WHERE `Header` and `Footer` are supplied by a layout, THE page SHALL NOT duplicate them.

### Requirement 5 — Controlled forms with validation

**User Story:** As a user, I want forms that respond as I type and tell me what is wrong, so that I can correct mistakes before submitting.

#### Acceptance Criteria

1. `SearchBar` SHALL be a controlled component whose input value is held in state AND updated through an `onChange` handler.
2. `AddProductForm` SHALL use controlled inputs for every field, each bound to state and updated on change.
3. THE code SHALL implement a `validate(data: FormState): FormErrors` function returning per-field error messages.
4. WHEN a field fails validation THEN its error message SHALL render below that specific input.
5. WHEN the form is submitted THEN default browser submission SHALL be prevented.
6. WHEN validation fails THEN the entered values SHALL be preserved rather than cleared.
7. THE forms SHALL write to local component state only; no `POST`, `PUT`, or `DELETE` request SHALL be issued in this checkpoint.

### Requirement 6 — Interactive catalog with immutable state

**User Story:** As a shopper, I want search, add-to-cart, and a cart summary working together, so that the catalog behaves like a real storefront.

#### Acceptance Criteria

1. THE product list SHALL render from state, so that state changes are reflected in the rendered list.
2. WHEN the user types in the search bar THEN the rendered list SHALL filter live.
3. WHEN the user activates "Add to Cart" THEN the product SHALL be added to a `Product[]` cart state using an immutable update, AND the existing cart array SHALL NOT be mutated.
4. THE cart summary SHALL display the correct item count AND the correct total price, both derived from cart state on each render so they cannot drift.
5. WHEN `AddProductForm` is submitted with valid data THEN the new product SHALL be appended to the product list using the immutable spread pattern, AND SHALL appear in the rendered list.
6. ALL state updates in the catalog SHALL be immutable — no in-place `push`, `splice`, or property assignment on state values.

### Requirement 7 — App Router route structure and layouts

**User Story:** As a user, I want every page reachable by URL with consistent chrome, so that navigation feels like one application.

#### Acceptance Criteria

1. THE app SHALL define routes as `page.tsx` files under `app/` for home, `/products`, `/products/[id]`, `/categories`, and `/orders`.
2. THE app SHALL define `app/layout.tsx` as the root layout wrapping every page with `<Header />` and `<Footer />`.
3. THE app SHALL define a nested `app/products/layout.tsx` wrapping the products segment.
4. WHEN the user navigates between `/products` and `/products/[id]` THEN the nested products layout SHALL remain mounted AND SHALL NOT re-render, AND this SHALL be verifiable by observation (for example a mount-only log or React DevTools).

### Requirement 8 — Navigation with active-route styling

**User Story:** As a user, I want to see which page I am on, so that I can orient myself in the app.

#### Acceptance Criteria

1. THE navigation bar SHALL link to every internal route defined in Requirement 7.
2. THE navigation SHALL determine the current route using `usePathname()`.
3. WHEN a nav link corresponds to the current route THEN that link SHALL render with distinct active styling.
4. THE active state SHALL be conveyed by more than color alone, AND the current page SHALL be marked for assistive technology (for example `aria-current="page"`).

### Requirement 9 — Search driven by the URL

**User Story:** As a user, I want my search reflected in the URL, so that I can share or reload a filtered view.

#### Acceptance Criteria

1. WHEN the user presses Enter in the search bar THEN the app SHALL navigate to `/products?search=${query}` using `router.push()`.
2. THE products page SHALL read the `search` query parameter using `useSearchParams()` AND SHALL display the current search value.
3. WHEN the `search` query parameter changes THEN the displayed product list SHALL update to match.
4. WHEN the products page is loaded directly with a `search` parameter already in the URL THEN the list SHALL render already filtered.

### Requirement 10 — Environment configuration

**User Story:** As a developer, I want the API base URL configurable, so that the app can point at a local or deployed API without code changes.

#### Acceptance Criteria

1. THE project SHALL define `NEXT_PUBLIC_API_BASE_URL` in an environment file AND all API calls SHALL read the base URL from it rather than hardcoding a host.
2. THE project SHALL define `API_SECRET_KEY` as a server-only variable, AND it SHALL NOT be prefixed with `NEXT_PUBLIC_`, so it is never bundled into client-side JavaScript.
3. THE repository SHALL NOT commit real secret values. A committed example file SHALL document the required variable names with placeholder values, AND the file holding real values SHALL be git-ignored.
4. IF `NEXT_PUBLIC_API_BASE_URL` is missing at runtime THEN the failure SHALL surface as a clear error rather than a request to an undefined host.

### Requirement 11 — Metadata

**User Story:** As a visitor, I want accurate page titles, so that tabs, history, and shared links are meaningful.

#### Acceptance Criteria

1. THE root layout SHALL export `metadata` with `title` and `description` fields.
2. EACH of the four static page routes — home, `/products`, `/categories`, `/orders` — SHALL export `metadata` with `title` and `description` fields.
3. `app/products/[id]/page.tsx` SHALL implement `generateMetadata` producing a dynamic title derived from the route's `id` parameter.
4. `generateMetadata` for the product detail route SHALL fetch the product AND use the real product name as the page `<title>`.

### Requirement 12 — Server Component data fetching

**User Story:** As a visitor, I want pages to arrive with real data already rendered, so that content is fast and indexable.

#### Acceptance Criteria

1. THE app SHALL fetch `GET /products` inside a Server Component using `async`/`await` with the native `fetch` API.
2. `app/page.tsx` SHALL be a pure Server Component that fetches `GET /products` AND renders the first five results as read-only `ProductCard` components.
3. `app/products/[id]/page.tsx` SHALL fetch a single product using the `id` route parameter.
4. `app/categories/page.tsx` SHALL independently apply the Server Component fetch pattern to `GET /categories`.
5. `app/orders/page.tsx` SHALL independently apply the Server Component fetch pattern to `GET /orders`.
6. THE fetched API responses SHALL be mapped into the typed product and category models before rendering.

### Requirement 13 — Client-side product list with search and category filter

**User Story:** As a shopper, I want to search and filter products interactively, so that I can find what I want.

#### Acceptance Criteria

1. THE app SHALL define a `ProductList` Client Component marked `"use client"` that accepts `products: Product[]` as a prop from its Server Component parent.
2. `ProductList` SHALL render a `SearchBar` that navigates to `/products?search=${query}` on Enter.
3. `ProductList` SHALL implement a `useEffect` that reads `useSearchParams()` AND fetches `GET /products?search=${query}` whenever the query changes.
4. `ProductList` SHALL implement a `CategoryFilter` dropdown that fetches `GET /categories` on mount.
5. WHEN a category is selected THEN `ProductList` SHALL refetch `GET /products?category_id=${id}`.
6. WHILE a client-side fetch is in flight THE UI SHALL indicate the pending state rather than appearing frozen.
7. IF a client-side fetch fails THEN the UI SHALL show a recoverable message rather than rendering an empty list silently.

### Requirement 14 — Error and loading handling

**User Story:** As a user, I want useful feedback when data is slow or unavailable, so that the app never appears broken.

#### Acceptance Criteria

1. EVERY fetch helper SHALL check `res.ok` AND SHALL throw a typed error when the response is not successful.
2. `app/products/error.tsx` SHALL catch thrown errors in the products segment AND render a friendly recovery UI.
3. `app/products/loading.tsx` SHALL render a skeleton UI while the products data is being fetched.
4. EVERY data-fetching route SHALL have both a `loading.tsx` and an `error.tsx`.
5. WHEN the API is unreachable or returns an error status THEN the corresponding `error.tsx` SHALL render instead of an unhandled exception or a blank page.

### Requirement 15 — End-to-end completion and demo evidence

**User Story:** As a grader, I want proof the whole application works against real data, so that I can assess it without rebuilding the environment.

#### Acceptance Criteria

1. THE home page SHALL show five real products fetched from the Flask API.
2. THE products list SHALL have working live search AND a working category filter.
3. THE product detail page SHALL show real data AND a dynamic page title reflecting the product name.
4. THE categories and orders pages SHALL show live data from the API.
5. THE navigation SHALL show active-route highlighting on the current page.
6. EVERY data-fetching route SHALL have a working `loading.tsx` and `error.tsx`, AND the error state SHALL be demonstrably reachable (for example by stopping the API).
7. THE deliverable SHALL include local demo evidence — screenshots or a short recording — covering the home page with five products, live search and category filtering, the product detail page with its dynamic title, active-route highlighting, and the triggered loading and error states.
