// components/ProductCard.tsx
//
// A single product card. A client component, because it owns the quantity
// counter — local state and click handlers run in the browser. It composes the
// shared Card surface rather than repeating the border/padding styling.
//
// Rendering is conditional on derived availability (see availabilityOf): the
// badge text and colour, and whether the add control is enabled, all follow the
// discriminated union. In read-only mode the counter and add control are
// omitted entirely, which is how the home-page grid reuses this component
// without interactivity.
//
// There is no image column on the products table yet, so every card shows a
// typed placeholder; the slot is ready for real images to drop in later.

"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { availabilityOf, type ProductCardProps } from "@/lib/types";
import {
  getBadgeClasses,
  getBadgeLabel,
  getButtonClasses,
} from "@/lib/productStyles";
import { formatRupiah } from "@/lib/format";

// Clamp a quantity into [0, max] inclusive, so the counter can never drop below
// zero or climb past the available stock.
function clamp(value: number, max: number): number {
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
}

export default function ProductCard({
  product,
  readOnly = false,
  actionLabel = "Add to cart",
  onAddToCart,
}: ProductCardProps) {
  const availability = availabilityOf(product);
  const inStock = availability.kind !== "out-of-stock";

  // Every product starts at 0; the shopper chooses a quantity before adding.
  const [quantity, setQuantity] = useState(0);

  const decrement = () =>
    setQuantity((current) => clamp(current - 1, product.stockQuantity));
  const increment = () =>
    setQuantity((current) => clamp(current + 1, product.stockQuantity));

  const handleAdd = () => {
    if (!inStock || quantity < 1) return; // nothing to add at zero
    onAddToCart?.(product, quantity);
  };

  return (
    <Card className="flex flex-col gap-3">
      {/* Placeholder image — no image column exists yet. */}
      <div className="flex aspect-4/3 w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/10">
        {product.imageUrl === null ? (
          <span className="text-sm">No image</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-lg object-cover"
          />
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 font-semibold text-black dark:text-white">
          {product.name}
        </h3>
        <span className={`${getBadgeClasses(availability)} shrink-0 whitespace-nowrap`}>
          {getBadgeLabel(availability)}
        </span>
      </div>

      <p className="line-clamp-2 text-sm text-black/70 dark:text-white/70">
        {product.description}
      </p>

      <p className="text-lg font-bold text-black dark:text-white">
        {formatRupiah(product.price)}
      </p>

      {!readOnly && (
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={decrement}
              disabled={!inStock || quantity <= 0}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 font-semibold text-black transition hover:bg-black/5 active:not-disabled:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
            >
              −
            </button>
            <span
              aria-live="polite"
              className="w-8 text-center font-semibold text-black dark:text-white"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={increment}
              disabled={!inStock || quantity >= product.stockQuantity}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-black/10 font-semibold text-black transition hover:bg-black/5 active:not-disabled:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock}
            className={getButtonClasses(inStock)}
          >
            {inStock ? actionLabel : "Out of stock"}
          </button>
        </div>
      )}
    </Card>
  );
}
