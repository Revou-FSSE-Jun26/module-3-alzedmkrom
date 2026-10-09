// lib/auth.ts
//
// Server-side authentication for the orders route. The orders endpoint
// requires a JWT, but user-facing authentication is Checkpoint 3 scope. The
// resolution: the Server Component authenticates with demo credentials held
// in server-only environment variables, then calls /orders with the bearer
// token. The token is created and used on the server and never reaches the
// browser.
//
// `import 'server-only'` is a build-time guard: if this module is ever
// imported from a Client Component, the build fails. That is what keeps the
// demo credentials and the token out of the client bundle.

import 'server-only';

import { ApiError, baseUrl, fetchJson } from './api';
import type { Order, OrderDetail, OrderDetailRecord, OrderRecord } from './types';
import { toOrder, toOrderDetail } from './types';

/**
 * The subset of the `POST /auth/login` response this checkpoint uses. The API
 * also returns `refresh_token`, `refresh_expires_in`, `token_type` and `user`,
 * but refresh is Checkpoint 3 scope so only `access_token` and `expires_in`
 * are read here.
 */
interface LoginResponse {
  access_token: string;
  expires_in: number; // seconds until the access token expires
}

/**
 * A cached token lives in module scope for the life of the server process.
 * This is adequate for a short-lived local demo; a real deployment would use
 * a shared cache. `expiresAt` is an absolute epoch-millisecond timestamp.
 */
interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;

/**
 * A safety margin so a token that is about to expire is treated as already
 * expired. Avoids sending a request with a token that lapses in flight.
 */
const EXPIRY_SKEW_MS = 30_000;

/**
 * Reads a required server-only environment variable, throwing a message that
 * names the variable when it is missing — the same failure shape `baseUrl()`
 * uses, so a misconfigured environment surfaces clearly rather than as a
 * confusing auth error downstream.
 */
function requireEnv(name: 'DEMO_USER_EMAIL' | 'DEMO_USER_PASSWORD'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Copy .env.example to .env.local.`);
  }
  return value;
}

/**
 * True when there is no cached token or the cached one has reached (or is
 * within the skew margin of) its expiry.
 */
function isExpired(token: CachedToken | null): token is null {
  return token === null || Date.now() >= token.expiresAt - EXPIRY_SKEW_MS;
}

/**
 * Performs `POST /auth/login` with the demo credentials and returns a fresh
 * cached token. Checks `res.ok` before parsing, consistent with the API
 * client, so a Flask HTML error page never surfaces as a JSON parse error.
 */
async function login(): Promise<CachedToken> {
  const url = `${baseUrl()}/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: requireEnv('DEMO_USER_EMAIL'),
      password: requireEnv('DEMO_USER_PASSWORD'),
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new ApiError(
      `Login failed with status ${res.status}`,
      res.status,
      url,
    );
  }

  const body = (await res.json()) as LoginResponse;
  return {
    accessToken: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
}

/**
 * Returns a valid access token, logging in and caching the result on the
 * first call and whenever the cached token has expired. Subsequent calls
 * within the token's lifetime reuse the cached value, so a single page render
 * does not re-authenticate for every request.
 */
export async function getAccessToken(): Promise<string> {
  if (isExpired(cached)) {
    cached = await login();
  }
  return cached.accessToken;
}

/**
 * Discards the cached token. Called after a 401 so the next request forces a
 * fresh login rather than resending a token the API has already rejected.
 */
export function clearAccessToken(): void {
  cached = null;
}

/**
 * Runs `request` with a bearer token, handling the one case the token cache
 * cannot anticipate: a token the API rejects with 401 before its recorded
 * expiry (revoked server-side, process clock skew, a rotated signing key).
 *
 * On a 401 it discards the cached token, logs in once more, and retries. If
 * the retry also 401s it gives up with an `ApiError`, so a genuinely bad
 * credential set fails loudly instead of looping.
 */
export async function withBearerToken<T>(
  request: (token: string) => Promise<T>,
): Promise<T> {
  const token = await getAccessToken();
  try {
    return await request(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAccessToken();
      const retryToken = await getAccessToken();
      try {
        return await request(retryToken);
      } catch (retryError) {
        if (retryError instanceof ApiError && retryError.status === 401) {
          clearAccessToken();
          throw new ApiError(
            'Authentication failed after retry. Check DEMO_USER_EMAIL and DEMO_USER_PASSWORD.',
            401,
            retryError.url,
          );
        }
        throw retryError;
      }
    }
    throw error;
  }
}

/**
 * Fetches a user's orders from `GET /orders?user_id=`. The endpoint requires a
 * JWT, so the request is wrapped in `withBearerToken`, which logs in
 * server-side with the demo credentials, attaches
 * `Authorization: Bearer <access_token>`, and retries once on a 401. The token
 * is created and used entirely on the server and never reaches the browser.
 *
 * This lives in lib/auth.ts rather than lib/api.ts because it is inherently
 * server-only: it depends on the token cache and the demo credentials. Keeping
 * it here lets lib/api.ts stay free of any `server-only` edge, so its
 * client-safe read helpers can be imported from Client Components.
 *
 * `userId` must be the id of the authenticated demo account (DEMO_USER_ID): a
 * token for one user requesting another user's orders returns 403, verified
 * against the live API.
 *
 * The response is a bare array of order headers — no nested line items. Records
 * are mapped into the app `Order` shape and soft-deleted rows are filtered out,
 * so snake_case and the `is_delete` flag never escape the data layer.
 */
export async function getOrders(userId: number): Promise<Order[]> {
  const records = await withBearerToken((token) =>
    fetchJson<OrderRecord[]>(`/orders?user_id=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

  return records.map(toOrder).filter((order) => !order.isDeleted);
}

/**
 * Fetches a single order WITH its line items from `GET /orders/:id`. Unlike the
 * list endpoint, this returns the nested `items` array (each with its product,
 * quantity and unit price), so the orders UI can show what was ordered.
 *
 * Authenticated the same way as getOrders — wrapped in withBearerToken, token
 * server-side only. The API scopes an order to its owner, so requesting an
 * order that does not belong to the demo account returns 403/404 and surfaces
 * as an ApiError.
 */
export async function getOrderDetail(orderId: number): Promise<OrderDetail> {
  const record = await withBearerToken((token) =>
    fetchJson<OrderDetailRecord>(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

  return toOrderDetail(record);
}