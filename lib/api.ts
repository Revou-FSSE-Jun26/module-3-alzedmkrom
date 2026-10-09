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
  Order,
  OrderRecord,
  Product,
  ProductRecord,
} from './types';
import { toCategory, toOrder, toProduct } from './types';

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

/**
 * Fetches a user's orders from `GET /orders?user_id=`. The endpoint requires a
 * JWT, so the request is wrapped in `withBearerToken` (lib/auth.ts), which logs
 * in server-side with the demo credentials, attaches
 * `Authorization: Bearer <access_token>`, and retries once on a 401. The token
 * is created and used entirely on the server and never reaches the browser.
 *
 * `userId` must be the id of the authenticated demo account (DEMO_USER_ID): a
 * token for one user requesting another user's orders returns 403, verified
 * against the live API.
 *
 * The response is a bare array of order headers — no nested line items. Records
 * are mapped into the app `Order` shape and soft-deleted rows are filtered out,
 * so snake_case and the `is_delete` flag never escape this module.
 *
 * `withBearerToken` is imported lazily inside the function so that lib/auth.ts
 * — which pulls in `server-only` — is loaded only when orders are actually
 * fetched, keeping the top of this module free of a hard server-only edge.
 */
async function getOrders(userId: number): Promise<Order[]> {
  const { withBearerToken } = await import('./auth');

  const records = await withBearerToken((token) =>
    fetchJson<OrderRecord[]>(`/orders?user_id=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

  return records.map(toOrder).filter((order) => !order.isDeleted);
}

export {
  baseUrl,
  describeFailure,
  fetchJson,
  getProducts,
  getProduct,
  getCategories,
  getOrders,
};