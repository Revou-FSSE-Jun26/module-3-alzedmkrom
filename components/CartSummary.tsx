// components/CartSummary.tsx
//
// A read-only view of the cart. A client component, because it lives inside the
// interactive catalog subtree and receives the cart state from ProductList.
//
// It stores nothing of its own. Both figures it shows — the item count and the
// running total — are *derived* from the `cart` prop on every render, not
// accumulated into state as products are added (design Property 8). Because the
// numbers are recomputed from the single source of truth each time, they can
// never drift out of sync with the cart: there is no second copy to fall
// behind. The count is the array length; the total is a `reduce` over the
// products' prices, formatted with the shared rupiah formatter.

"use client";

import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

interface CartSummaryProps {
  /** The cart's products. The summary derives its figures from this alone. */
  cart: Product[];
}

export default function CartSummary({ cart }: CartSummaryProps) {
  // Derived, not stored: recomputed from `cart` on every render so the figures
  // cannot drift from the actual cart contents.
  const itemCount = cart.length;
  const totalPrice = cart.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-black/2 px-4 py-3 dark:border-white/15 dark:bg-white/3">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-black dark:text-white">Cart</span>
        <span
          aria-live="polite"
          className="text-sm text-black/60 dark:text-white/60"
        >
          {itemCount === 0
            ? "No items yet"
            : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        </span>
      </div>
      <span className="text-lg font-bold text-black dark:text-white">
        {formatRupiah(totalPrice)}
      </span>
    </div>
  );
}
