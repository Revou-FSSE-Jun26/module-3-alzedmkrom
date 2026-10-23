// components/CartSummary.tsx
//
// A read-only view of the cart. A client component, because it lives inside the
// interactive catalog subtree, reads the cart from context and owns a small
// piece of local UI state: whether the line-item panel is expanded.
//
// Both headline figures — the item count and the running total — are *derived*
// from the cart context on every render, not accumulated into state as products
// are added (design Property 8). Because the numbers are recomputed from the
// single source of truth each time, they can never drift out of sync with the
// cart: there is no second copy to fall behind.
//
// The cart context stores CartItem[] where each line is already grouped by
// product (i.e., adding three of one item produces one line with quantity: 3,
// not three duplicate lines). The summary renders these grouped lines directly
// without needing to group them.

"use client";

import { useState } from "react";

import type { CartItem } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

interface CartSummaryProps {
  /** The cart's line items from context. Already grouped by product. */
  items: CartItem[];
}

export default function CartSummary({ items }: CartSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Derived, not stored: recomputed from cart context on every render so the
  // figures cannot drift from the actual cart contents. CartItem.quantity is
  // already the grouped quantity, so totalItems is the sum of those quantities.
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const isEmpty = items.length === 0;

  return (
    <section className="rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-white/5">
      {/* Headline bar. It is a button only when there is something to expand. */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={isEmpty}
        aria-expanded={isOpen && !isEmpty}
        aria-controls="cart-details"
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left disabled:cursor-default"
      >
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-black dark:text-white">Cart</span>
          <span
            aria-live="polite"
            className="text-sm text-black/60 dark:text-white/60"
          >
            {isEmpty
              ? "No items yet"
              : `${totalItems} ${totalItems === 1 ? "item" : "items"}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-black dark:text-white">
            {formatRupiah(totalPrice)}
          </span>
          {!isEmpty && (
            <span
              aria-hidden="true"
              className={`text-black/50 transition-transform dark:text-white/50 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          )}
        </div>
      </button>

      {/* Line-item breakdown. Shown only when expanded. */}
      {isOpen && !isEmpty && (
        <ul
          id="cart-details"
          className="divide-y divide-black/5 border-t border-black/10 px-4 dark:divide-white/5 dark:border-white/15"
        >
          {items.map((line) => (
            <li
              key={line.productId}
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-black dark:text-white">
                  {line.name}
                </p>
                <p className="text-black/55 dark:text-white/55">
                  {formatRupiah(line.price)} &times; {line.quantity}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-black dark:text-white">
                {formatRupiah(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
