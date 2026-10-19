// lib/storage.ts
//
// Every read of localStorage is guarded twice: once for the server, where
// `window` does not exist, and once for the shape, because `JSON.parse`
// returns `any` and a corrupted or stale entry must not propagate as valid
// state. A read that fails either guard returns `null`, so a bad entry logs
// the user out rather than throwing during render.
//
// Writes and removes are no-ops on the server; nothing calls them during SSR
// in practice, but guarding here keeps every call site free of a `window`
// check.

import type { CartItem, Role, Session } from './types';

/**
 * Reads `key` from localStorage and returns the parsed value only when it
 * passes `isValid`. Returns `null` during server rendering, when the key is
 * missing, when the stored text is malformed JSON, or when the parsed value
 * fails its type guard. The read and parse are wrapped in try/catch so
 * malformed JSON or storage blocked by the browser both fall through to
 * `null` instead of throwing.
 */
export function readJson<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    // Malformed JSON, or a browser that throws on localStorage access
    // (private mode, blocked storage). Treat it as absent.
    return null;
  }
}

/**
 * Serialises `value` and stores it under `key`. A no-op during server
 * rendering, where `window` is undefined.
 */
export function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Removes `key` from localStorage. A no-op during server rendering, where
 * `window` is undefined.
 */
export function remove(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

/**
 * Narrows an unknown value to a {@link Role}. The union is closed, so an
 * unrecognised string is rejected rather than treated as privileged.
 */
function isRole(value: unknown): value is Role {
  return value === 'CUSTOMER' || value === 'ADMIN';
}

/**
 * Validates the full persisted {@link Session} shape, including the nested
 * user. A bare cast is not acceptable here: `JSON.parse` returns `any`, and a
 * session written by an older build or hand-edited in devtools must not pass
 * as valid.
 */
export function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Record<string, unknown>;

  if (typeof session.token !== 'string') return false;
  if (typeof session.expiresAt !== 'number') return false;

  if (typeof session.user !== 'object' || session.user === null) return false;
  const user = session.user as Record<string, unknown>;

  return (
    typeof user.id === 'number' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    isRole(user.role) &&
    typeof user.isActive === 'boolean' &&
    typeof user.createdAt === 'string'
  );
}

/**
 * Validates that an unknown value is an array of well-formed {@link CartItem}
 * lines. Every element is checked, so a single corrupted line rejects the
 * whole cart rather than being silently kept.
 */
export function isCartItemArray(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const line = item as Record<string, unknown>;
    return (
      typeof line.productId === 'number' &&
      typeof line.name === 'string' &&
      typeof line.price === 'number' &&
      typeof line.quantity === 'number' &&
      typeof line.stockQuantity === 'number'
    );
  });
}
