"use server";

// app/orders/actions.ts
//
// Server Actions for order-related operations. Currently not in use as order
// detail is fetched client-side with the session token. This file is kept as
// a placeholder for future server-side order operations.

import { ApiError } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

export type OrderDetailResult =
  | { ok: true; detail: OrderDetail }
  | { ok: false; message: string };

/**
 * Placeholder for future server-side order detail loading.
 * Currently not in use.
 */
export async function loadOrderDetail(
  orderId: number,
): Promise<OrderDetailResult> {
  const message =
    "This action is not currently in use. Order details are fetched client-side.";
  return { ok: false, message };
}
