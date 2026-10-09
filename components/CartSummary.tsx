// components/CartSummary.tsx
//
// A read-only view of the cart. A client component, because it lives inside the
// interactive catalog subtree, receives the cart state from ProductList, and
// now owns a small piece of local UI state: whether the line-item panel is
// expanded.
//
// Both headline figures — the item count and the running total — are *derived*
// from the `cart` prop on every render, not accumulated into state as products
// are added (design Property 8). Because the numbers are recomputed from the
// single source of truth each time, they can never drift out of sync with the
// cart: there is no second copy to fall behind.
//
// The cart is a flat Product[] where adding three of one product stores three
// identical entries. For a readable breakdown that is *grouped by product* for
// display only — "T-Shirt x 3" rather than three rows. The grouping is derived
// at render time and does not change the underlying flat array, which stays as
// it is pending the Checkpoint 3 cart refactor.

"use client";

import { useState } from "react";

import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

interface CartSummaryProps {
  /** The cart's products. The summary derives its figures from this alone. */
  cart: Product[];
}

/** One grouped line for display: a product plus how many of it are in the cart. */
interface CartLine {
  product: Product;
  quantity: number;
  subtotal: number;
}

// Collapse the flat Product[] into one line per distinct product, preserving
// first-seen order. Derived on every render; never stored.
function groupCart(cart: Product[]): CartLine[] {
  const order: number[] = [];
  const byId = new Map<number, CartLine>();

  for (const product of cart) {
    const existing = byId.get(product.id);
    if (existing === undefined) {
      order.push(product.id);
      byId.set(product.id, { product, quantity: 1, subtotal: product.price });
    } else {
      existing.quantity += 1;
      existing.subtotal += product.price;
    }
  }

  return order.map((id) => byId.get(id) as CartLine);
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Derived, not stored: recomputed from `cart` on every render so the figures
  // cannot drift from the actual cart contents.
  const itemCount = cart.length;
  const totalPrice = cart.reduce((sum, product) => sum + product.price, 0);
  const lines = groupCart(cart);

  const isEmpty = itemCount === 0;

  return (
    <section className="rounded-xl border border-black/10 bg-black/2 dark:border-white/15 dark:bg-white/3">
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
              : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
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

      {/* Line-item breakdown, grouped by product. Shown only when expanded. */}
      {isOpen && !isEmpty && (
        <ul
          id="cart-details"
          className="divide-y divide-black/5 border-t border-black/10 px-4 dark:divide-white/5 dark:border-white/15"
        >
          {lines.map((line) => (
            <li
              key={line.product.id}
              className="flex items-center justify-between gap-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-black dark:text-white">
                  {line.product.name}
                </p>
                <p className="text-black/55 dark:text-white/55">
                  {formatRupiah(line.product.price)} &times; {line.quantity}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-black dark:text-white">
                {formatRupiah(line.subtotal)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
