'use client';

// components/ProductDetailCart.tsx
//
// The cart controls for the product detail page: a quantity stepper (− / +)
// sitting to the left of the add-to-cart action. A client component because it
// owns the quantity counter.
//
// It reuses AddToCartButton for the action itself, which carries the login
// guard (logged-out visitors see "Log in to add to cart" instead) and the
// out-of-stock handling, so this component only has to manage quantity.
//
// Quantity is clamped to [1, stockQuantity]: the detail page always adds at
// least one, and never more than is in stock.

import { useState } from 'react';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/lib/types';

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default function ProductDetailCart({ product }: { product: Product }) {
  const isOutOfStock = product.stockQuantity === 0;
  // Start at 1 (or 0 when out of stock so the stepper reads honestly).
  const [quantity, setQuantity] = useState(isOutOfStock ? 0 : 1);

  const max = product.stockQuantity;
  const decrement = () => setQuantity((q) => clamp(q - 1, 1, max));
  const increment = () => setQuantity((q) => clamp(q + 1, 1, max));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      {/* Quantity stepper — hidden when out of stock since there's nothing to add. */}
      {!isOutOfStock && (
        <div className="flex items-center justify-center gap-3 rounded-md border border-black/10 px-2 dark:border-white/15">
          <button
            type="button"
            onClick={decrement}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-8 w-8 items-center justify-center rounded-md font-semibold text-black transition hover:bg-black/5 active:not-disabled:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-white/10"
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
            disabled={quantity >= max}
            aria-label="Increase quantity"
            className="flex h-8 w-8 items-center justify-center rounded-md font-semibold text-black transition hover:bg-black/5 active:not-disabled:scale-90 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-white/10"
          >
            +
          </button>
        </div>
      )}

      <div className="flex-1">
        <AddToCartButton product={product} quantity={quantity} />
      </div>
    </div>
  );
}
