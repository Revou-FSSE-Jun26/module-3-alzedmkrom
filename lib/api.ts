// lib/api.ts
//
// One module owns every request to the Flask API. Pages never call `fetch`
// with a raw URL.
//
// Two API facts shape this file:
//   1. res.ok is checked BEFORE res.json(). An unhandled 500 from Flask
//      returns an HTML error page, so parsing first would surface a
//      misleading JSON syntax error instead of the real status.
//   2. Handled error bodies are JSON `{ error, message }`; unhandled ones are
//      HTML. describeFailure guards the JSON parse so it never throws.

import type {
  Category,
  CategoryRecord,
  LoginResponse,
  Order,
  OrderDetail,
  OrderDetailRecord,
  OrderRecord,
  Product,
  ProductRecord,
  User,
  UserRecord,
} from './types';
import {
  toCategory,
  toOrder,
  toOrderDetail,
  toProduct,
  toUser,
} from './types';

/**
 * A typed error carrying the HTTP status and the URL that failed, so
 * `error.tsx` can show something more useful than a generic message.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * The bare API origin, with any trailing slash stripped so callers can
 * concatenate a leading-slash path without producing a double slash.
 * Throws a message that names the variable when it is missing.
 */
function baseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local.',
    );
  }
  return base.replace(/\/$/, '');
}

/**
 * Reads the API's JSON `{ error, message }` body to build a useful message,
 * preferring `message` and falling back to `error`. Unhandled 500s return
 * HTML, so the JSON parse is guarded and this never throws — it falls back to
 * the response status text instead.
 */
async function describeFailure(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object') {
      const { message, error } = body as {
        message?: unknown;
        error?: unknown;
      };
      if (typeof message === 'string' && message.length > 0) return message;
      if (typeof error === 'string' && error.length > 0) return error;
    }
  } catch {
    // Body was not JSON (e.g. a Flask HTML 500 page). Fall through to the
    // status text so this helper never throws.
  }
  return res.statusText || `Request failed with status ${res.status}`;
}

/**
 * Builds the URL from `baseUrl()` + path and fetches it. Defaults to
 * `cache: 'no-store'` so pages always show live data and the error states
 * stay reachable, while still letting a caller override the cache via `init`.
 * Checks `res.ok` before parsing and throws `ApiError` on failure.
 */
async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, { cache: 'no-store', ...init });

  // res.ok is checked BEFORE parsing. A 500 from Flask returns HTML, so
  // parsing first would throw a misleading JSON syntax error.
  if (!res.ok) {
    throw new ApiError(await describeFailure(res), res.status, url);
  }

  return (await res.json()) as T;
}

/**
 * The authenticated sibling of `fetchJson`. Attaches `Authorization: Bearer
 * <token>` and a JSON content type, then reuses the same res.ok-before-parse
 * check and `ApiError` so authenticated and public requests fail identically.
 *
 * Headers are merged in order — the standard pair first, then any `init.headers`
 * — so a caller can still override `Content-Type` (for example to omit it on a
 * bodyless DELETE) without losing the Authorization header.
 */
async function authedFetchJson<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(await describeFailure(res), res.status, url);
  }

  return (await res.json()) as T;
}

/**
 * Fetches the catalog from `GET /products`, optionally narrowed by `search`
 * and `categoryId`. The query string is built with `URLSearchParams`, which
 * handles encoding and lets empty values be omitted, so `getProducts({})`
 * requests a clean `/products` with no trailing `?`. The API's query params
 * are snake_case (`search`, `category_id`); callers pass camelCase.
 *
 * Every record is mapped into the app `Product` shape immediately, and
 * soft-deleted rows (`isDeleted`) are filtered out, so snake_case and the
 * `is_delete` flag never escape this module.
 */
async function getProducts(
  params: { search?: string; categoryId?: number } = {},
): Promise<Product[]> {
  const query = new URLSearchParams();
  if (typeof params.search === 'string' && params.search.length > 0) {
    query.set('search', params.search);
  }
  if (typeof params.categoryId === 'number') {
    query.set('category_id', String(params.categoryId));
  }

  const qs = query.toString();
  const path = qs ? `/products?${qs}` : '/products';

  const records = await fetchJson<ProductRecord[]>(path);
  return records.map(toProduct).filter((product) => !product.isDeleted);
}

/**
 * Fetches one product from `GET /products/:id`. The detail endpoint returns a
 * single object rather than an array, so this maps the lone record through
 * `toProduct` without filtering.
 */
async function getProduct(id: number): Promise<Product> {
  const record = await fetchJson<ProductRecord>(`/products/${id}`);
  return toProduct(record);
}

/**
 * Fetches the category list from `GET /categories`, a bare JSON array, and
 * maps each record into the app `Category` shape.
 */
async function getCategories(): Promise<Category[]> {
  const records = await fetchJson<CategoryRecord[]>('/categories');
  return records.map(toCategory);
}

// ---------- authentication ----------

/**
 * Registers a new account via `POST /register`. The endpoint moved here from
 * `POST /users`, which now returns 404, so this is deliberately the new path.
 * The body is the camelCase trio the API happens to accept as-is. The response
 * is a bare `UserRecord` (no token — login is a separate step), mapped through
 * `toUser` so snake_case never leaves this module.
 */
async function register(
  username: string,
  email: string,
  password: string,
): Promise<User> {
  const record = await fetchJson<UserRecord>('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return toUser(record);
}

/**
 * Authenticates via `POST /auth/login` and returns the raw `LoginResponse`.
 * Unlike the other helpers this does not map the body: the caller (AuthProvider)
 * needs `access_token` and `expires_in` to build a session, and the nested
 * `user` is mapped there. Login itself carries no token, so it uses `fetchJson`.
 */
async function login(email: string, password: string): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Refresh the access token using the refresh token. The backend requires the
 * refresh token (with @jwt_required(refresh=True)) in the Authorization header.
 * Returns a new LoginResponse with fresh access and refresh tokens.
 * Called proactively when the token is close to expiry.
 */
async function refreshToken(token: string): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

// ---------- admin writes ----------
//
// The input shapes are camelCase, matching the app models the forms produce.
// Each helper maps outbound to the snake_case the API expects and maps the
// returned record back through the `toProduct` / `toCategory` mappers, so the
// wire shape is confined to this module in both directions. Every write takes
// the caller's token explicitly rather than reading a shared one, keeping the
// module free of ambient auth state.

/** A product create/update payload in app (camelCase) shape. */
interface ProductWriteInput {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
}

/** A category create/update payload in app (camelCase) shape. */
interface CategoryWriteInput {
  name: string;
  description: string;
}

/**
 * Maps a camelCase product payload to the snake_case body the API expects.
 * Pulled out so create and update share one translation and cannot drift.
 */
function toProductBody(input: ProductWriteInput) {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    stock_quantity: input.stockQuantity,
    category_id: input.categoryId,
  };
}

/** Creates a product via `POST /products` (admin). */
async function createProduct(
  input: ProductWriteInput,
  token: string,
): Promise<Product> {
  const record = await authedFetchJson<ProductRecord>('/products', token, {
    method: 'POST',
    body: JSON.stringify(toProductBody(input)),
  });
  return toProduct(record);
}

/** Updates a product via `PUT /products/:id` (admin). */
async function updateProduct(
  id: number,
  input: ProductWriteInput,
  token: string,
): Promise<Product> {
  const record = await authedFetchJson<ProductRecord>(
    `/products/${id}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(toProductBody(input)),
    },
  );
  return toProduct(record);
}

/**
 * Deletes a product via `DELETE /products/:id` (admin). The API refuses a
 * delete when the product has active orders and returns its own message, which
 * surfaces unchanged through `ApiError` — the guard is not re-implemented here.
 */
async function deleteProduct(id: number, token: string): Promise<void> {
  await authedFetchJson<unknown>(`/products/${id}`, token, {
    method: 'DELETE',
  });
}

/** Creates a category via `POST /categories` (admin). */
async function createCategory(
  input: CategoryWriteInput,
  token: string,
): Promise<Category> {
  const record = await authedFetchJson<CategoryRecord>('/categories', token, {
    method: 'POST',
    body: JSON.stringify({ name: input.name, description: input.description }),
  });
  return toCategory(record);
}

/** Updates a category via `PUT /categories/:id` (admin). */
async function updateCategory(
  id: number,
  input: CategoryWriteInput,
  token: string,
): Promise<Category> {
  const record = await authedFetchJson<CategoryRecord>(
    `/categories/${id}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({ name: input.name, description: input.description }),
    },
  );
  return toCategory(record);
}

/**
 * Deletes a category via `DELETE /categories/:id` (admin). As with products,
 * the API refuses when products are still linked and its message is surfaced
 * verbatim through `ApiError`.
 */
async function deleteCategory(id: number, token: string): Promise<void> {
  await authedFetchJson<unknown>(`/categories/${id}`, token, {
    method: 'DELETE',
  });
}

// ---------- orders (authenticated) ----------

/** A single checkout line in app (camelCase) shape. */
interface OrderLineInput {
  productId: number;
  quantity: number;
}

/**
 * Creates an order via `POST /orders` (201). The body is `{items: [{product_id,
 * quantity}]}`, so the camelCase lines are mapped outbound here. The response is
 * an order header (no nested items on create), mapped through `toOrder`.
 */
async function createOrder(
  items: OrderLineInput[],
  token: string,
): Promise<Order> {
  const record = await authedFetchJson<OrderRecord>('/orders', token, {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    }),
  });
  return toOrder(record);
}

/**
 * Fetches the caller's own orders via `GET /orders`. Returns headers only
 * (no line items), each mapped through `toOrder`.
 */
async function getMyOrders(token: string): Promise<Order[]> {
  const records = await authedFetchJson<OrderRecord[]>('/orders', token);
  return records.map(toOrder);
}

/**
 * Fetches one order with its line items via `GET /orders/:id`. The detail
 * endpoint nests the full product and unit price per line, so this maps through
 * `toOrderDetail` rather than `toOrder`.
 */
async function getOrderDetail(id: number, token: string): Promise<OrderDetail> {
  const record = await authedFetchJson<OrderDetailRecord>(
    `/orders/${id}`,
    token,
  );
  return toOrderDetail(record);
}

/**
 * Fetches every user's orders via `GET /orders?all=true` (admin only). The API
 * returns 403 `admin_required` for a non-admin token; the client role check is
 * a routing affordance, not the security boundary. Returns headers only.
 */
async function getAllOrders(token: string): Promise<Order[]> {
  const records = await authedFetchJson<OrderRecord[]>(
    '/orders?all=true',
    token,
  );
  return records.map(toOrder);
}

async function updateOrderStatus(id: number, status: string, token: string): Promise<Order> {
  const record = await authedFetchJson<OrderRecord>(
    `/orders/${id}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    },
  );
  return toOrder(record);
}

// NOTE: `getOrders` lives in lib/auth.ts, not here. It requires a server-only
// bearer token, and lib/auth.ts imports `server-only`. Keeping it out of this
// module means lib/api.ts carries no edge to `server-only`, so the client-safe
// read helpers above (getProducts, getProduct, getCategories) can be imported
// from Client Components such as CategoryFilter and ProductList without pulling
// the auth module — and the demo credentials — into the client bundle.

export {
  baseUrl,
  describeFailure,
  fetchJson,
  authedFetchJson,
  getProducts,
  getProduct,
  getCategories,
  register,
  login,
  refreshToken,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createOrder,
  getMyOrders,
  getOrderDetail,
  getAllOrders,
  updateOrderStatus,
};
export type {
  ProductWriteInput,
  CategoryWriteInput,
  OrderLineInput,
};