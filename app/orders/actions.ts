// app/orders/actions.ts
//
// A Server Action that lets the client-side orders list fetch one order's line
// items on demand (when a row is expanded) WITHOUT the auth token ever reaching
// the browser. The action runs on the server: it calls getOrderDetail, which
// logs in with the demo credentials and attaches the bearer token server-side,
// and returns only the mapped, token-free OrderDetail to the client.
//
// This is the server/client seam for the expandable orders UI: the list is a
// Client Component (it holds expand state), but the authenticated fetch stays
// on the server behind this action.

"use server";

import { getOrderDetail } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

export type OrderDetailResult =
  | { ok: true; detail: OrderDetail }
  | { ok: false; message: string };

/**
 * Loads one order's detail for the expandable row. Returns a discriminated
 * result rather than throwing, so the client can render a recoverable inline
 * message instead of tripping the route's error boundary for a single row.
 */
export async function loadOrderDetail(
  orderId: number,
): Promise<OrderDetailResult> {
  try {
    const detail = await getOrderDetail(orderId);
    return { ok: true, detail };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? `Could not load items (${error.status}).`
        : "Could not load items. Please try again.";
    return { ok: false, message };
  }
}
