// components/OrderList.tsx
//
// The expandable orders list. A Client Component because each row toggles open
// to reveal its line items, which is local interaction state. The order
// HEADERS arrive as a prop from the server (OrdersContent already fetched them
// with the token); the per-order ITEMS are loaded on demand through the
// loadOrderDetail server action when a row is first expanded.
//
// Why a server action rather than a client fetch: the orders API needs a JWT,
// and that token must never reach the browser. The action runs on the server,
// authenticates there, and returns only the token-free OrderDetail. The client
// never sees a credential.
//
// Each order's detail is cached in a Map after its first load, so re-expanding
// a row does not refetch. A per-row status drives the inline loading and error
// UI, so one failed row shows a recoverable message instead of breaking the
// whole list.

"use client";

import { useState } from "react";

import Card from "@/components/Card";
import { formatDate, formatRupiah } from "@/lib/format";
import type { Order, OrderDetail } from "@/lib/types";
import { loadOrderDetail } from "@/app/orders/actions";

interface OrderListProps {
  orders: Order[];
}

type RowStatus = "idle" | "loading" | "error";

export default function OrderList({ orders }: OrderListProps) {
  // Which order ids are currently expanded.
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  // Cached details per order id, so re-expanding never refetches.
  const [details, setDetails] = useState<Map<number, OrderDetail>>(new Map());
  // Per-row load status, keyed by order id.
  const [status, setStatus] = useState<Map<number, RowStatus>>(new Map());
  // Per-row error message when a load fails.
  const [errors, setErrors] = useState<Map<number, string>>(new Map());

  async function toggle(orderId: number) {
    const nextOpen = new Set(openIds);
    const isOpening = !nextOpen.has(orderId);

    if (isOpening) {
      nextOpen.add(orderId);
    } else {
      nextOpen.delete(orderId);
    }
    setOpenIds(nextOpen);

    // Only fetch on the first open, and only if not already cached.
    if (!isOpening || details.has(orderId)) return;

    setStatus((prev) => new Map(prev).set(orderId, "loading"));
    const result = await loadOrderDetail(orderId);

    if (result.ok) {
      setDetails((prev) => new Map(prev).set(orderId, result.detail));
      setStatus((prev) => new Map(prev).set(orderId, "idle"));
    } else {
      setErrors((prev) => new Map(prev).set(orderId, result.message));
      setStatus((prev) => new Map(prev).set(orderId, "error"));
    }
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => {
        const isOpen = openIds.has(order.id);
        const rowStatus = status.get(order.id) ?? "idle";
        const detail = details.get(order.id);

        return (
          <li key={order.id}>
            <Card className="flex flex-col gap-0 overflow-hidden !p-0">
              {/* Header row — the whole bar toggles the item breakdown. */}
              <button
                type="button"
                onClick={() => toggle(order.id)}
                aria-expanded={isOpen}
                aria-controls={`order-items-${order.id}`}
                className="flex flex-col gap-2 px-4 py-3 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold text-black dark:text-white">
                    Order #{order.id}
                  </span>
                  <span className="text-sm text-black/60 dark:text-white/60">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                    {order.status}
                  </span>
                  <span className="text-lg font-semibold text-black dark:text-white">
                    {formatRupiah(order.totalPrice)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`text-black/50 transition-transform dark:text-white/50 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </div>
              </button>

              {/* Item breakdown, loaded on demand. */}
              {isOpen && (
                <div
                  id={`order-items-${order.id}`}
                  className="border-t border-black/10 px-4 py-2 dark:border-white/15"
                >
                  {rowStatus === "loading" && (
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Loading items…
                    </p>
                  )}

                  {rowStatus === "error" && (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.get(order.id)}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          // Clear the cached failure and re-expand to retry.
                          setDetails((prev) => {
                            const next = new Map(prev);
                            next.delete(order.id);
                            return next;
                          });
                          void toggle(order.id); // close
                          void toggle(order.id); // reopen -> refetch
                        }}
                        className="shrink-0 rounded-md border border-black/15 px-3 py-1 text-sm font-medium text-black hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {rowStatus === "idle" && detail && (
                    <ul className="divide-y divide-black/5 dark:divide-white/5">
                      {detail.items.map((item) => (
                        <li
                          key={item.product.id}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-black dark:text-white">
                              {item.product.name}
                            </p>
                            <p className="text-black/55 dark:text-white/55">
                              {formatRupiah(item.unitPrice)} &times;{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <span className="shrink-0 font-semibold tabular-nums text-black dark:text-white">
                            {formatRupiah(item.lineTotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
