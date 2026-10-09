// components/ProductGrid.tsx
//
// The product grid. A server component — it has no state and no hooks; it only
// receives a Product[] and lays them out. Each card is a ProductCard, which is
// itself a client component, so the server/client boundary sits at the card,
// not here.
//
// There is exactly one ProductCard call site in the whole codebase: the single
// .map() below. Nothing hardcodes or repeats a card, so adding or removing a
// product is purely a data change (design Property 12).
//
// The layout is mobile-first: one column by default, two at `sm`, four at `lg`.
// When the array is empty — a filter that matched nothing, say — an empty state
// renders in place of the grid so the surrounding layout never collapses.

import ProductCard from "@/components/ProductCard";
import type { Product, ProductCardProps } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  /** Forwarded to every card: hides the counter and add control. */
  readOnly?: ProductCardProps["readOnly"];
  /** Forwarded to every card: label on the add control. */
  actionLabel?: ProductCardProps["actionLabel"];
  /** Forwarded to every card: invoked when a product is added. */
  onAddToCart?: ProductCardProps["onAddToCart"];
}

export default function ProductGrid({
  products,
  readOnly,
  actionLabel,
  onAddToCart,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
        <p className="font-semibold text-black dark:text-white">
          No products found
        </p>
        <p className="text-sm text-black/60 dark:text-white/60">
          Try a different search or category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          readOnly={readOnly}
          actionLabel={actionLabel}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
