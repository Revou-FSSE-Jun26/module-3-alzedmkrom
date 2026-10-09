// components/ProductList.tsx
//
// The interactive catalog's client subtree. The server/client boundary sits
// here: the products route (a Server Component) fetches the initial products
// and categories on the server and hands them down as props, and everything
// from this component downward runs in the browser.
//
// This component owns the catalog's state. For this task that is:
//   - items        : the rendered Product[], seeded from the `products` prop
//   - categoryId   : the selected category, or null for "All categories"
//   - isPending    : true while a client-side refetch is in flight
//   - fetchError   : a recoverable message when a client fetch fails
//   - cart         : the Product[] added to the cart, replaced immutably on
//                    every add so CartSummary can derive its figures freshly.
//
// Two filters, composed with AND, exactly as the API supports:
//   - Search is URL-driven. SearchBar pushes /products?search=<q>; this
//     component reads the `search` param back out with useSearchParams() and a
//     useEffect refetches GET /products?search=<q> whenever that value changes.
//     Keying the effect on the search string means a direct load of
//     /products?search=watch arrives already filtered, with the term shown.
//   - Category is selection-driven. CategoryFilter refetches on change and
//     hands the result up through onCategoryChange, which updates both
//     `categoryId` and `items`.
//
// When both a search term and a category are active, the refetch sends both
// params together — getProducts({ search, categoryId }) — so the two filters
// intersect rather than overwrite each other.
//
// Async effects guard against stale updates with an `active` flag cleanup, the
// same pattern CategoryFilter uses, so a slow fetch that resolves after a newer
// one can never clobber the fresher list.

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import CartSummary from "@/components/CartSummary";
import AddProductForm from "@/components/AddProductForm";
import { getProducts } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

interface ProductListProps {
  /** The initial product set fetched on the server, honouring any `search`. */
  products: Product[];
  /** The category list fetched on the server, seeding the filter's first paint. */
  categories: Category[];
}

export default function ProductList({
  products,
  categories,
}: ProductListProps) {
  // The `search` value lives in the URL, so it is the single source of truth
  // for the active search term — read here for both the fetch and the display.
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") ?? "";

  // The rendered list, seeded from the server-fetched prop so first paint shows
  // real data (already filtered when the URL carried a `search`).
  const [items, setItems] = useState<Product[]>(products);
  // The selected category, or null for "All categories".
  const [categoryId, setCategoryId] = useState<number | null>(null);
  // The cart. Held here because this is the single interactive subtree. It is
  // only ever *replaced* with a new array — never mutated in place — so React
  // sees a fresh reference and CartSummary recomputes from it (design
  // Property 7).
  const [cart, setCart] = useState<Product[]>([]);
  // True while a client refetch is in flight; drives the pending indicator.
  const [isPending, setIsPending] = useState<boolean>(false);
  // A recoverable message shown instead of silently rendering an empty list.
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Refetch whenever the URL's `search` value changes. Keyed on the search
  // string (and the current category) so a direct load of
  // /products?search=watch renders filtered without any interaction, and so a
  // search composes with an already-selected category via AND.
  //
  // The initial `products` prop is already fetched on the server for the first
  // `search`, but running the effect on mount keeps the rendered list in sync
  // with the URL even after client-side navigation, and the `active` guard
  // keeps a stale response from overwriting a newer one.
  useEffect(() => {
    let active = true;

    // Wrapped in an async function so the state updates run in a microtask
    // rather than synchronously in the effect body — the latter triggers
    // cascading renders. The `active` guard drops any update from a fetch that
    // resolves after the effect has been cleaned up by a newer run.
    async function load(): Promise<void> {
      setIsPending(true);
      setFetchError(null);
      try {
        const fetched = await getProducts({
          search: searchTerm || undefined,
          categoryId: categoryId ?? undefined,
        });
        if (active) setItems(fetched);
      } catch (cause: unknown) {
        if (active) {
          setFetchError(
            cause instanceof Error
              ? cause.message
              : "Could not load products. Please try again.",
          );
        }
      } finally {
        if (active) setIsPending(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [searchTerm, categoryId]);

  // CategoryFilter has already refetched for the new category, so adopt both
  // its selection and its result rather than triggering a second fetch here.
  // When a search term is active the effect above still owns the composed
  // fetch, but handling the result directly keeps the "All categories" and
  // search-free paths instant.
  function handleCategoryChange(
    nextCategoryId: number | null,
    nextProducts: Product[],
  ): void {
    setCategoryId(nextCategoryId);
    setItems(nextProducts);
    setFetchError(null);
  }

  // Add a product to the cart immutably: the updater returns a brand-new array
  // with the product appended, so the cart is replaced rather than mutated —
  // no push/splice/element assignment (design Property 7). ProductCard only
  // ever invokes this for an in-stock product (its control is disabled when
  // out of stock), so a sold-out product can never land in the cart. The
  // product is appended once per add action, matching the design's
  // `[...prev, product]` wording; the card's quantity counter stays local.
  function handleAddToCart(product: Product): void {
    setCart((prev) => [...prev, product]);
  }

  // Prepend a locally-added product immutably: the updater returns a brand-new
  // array with the new product at the front, so the rendered list is replaced
  // rather than mutated and the addition appears at the top of the grid (the
  // design's `[newProduct, ...prev]` wording). Local state only — no POST is
  // issued; persistence is Checkpoint 3.
  function handleAddProduct(newProduct: Product): void {
    setItems((prev) => [newProduct, ...prev]);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="w-full sm:flex-1">
          <SearchBar initialQuery={searchTerm} />
        </div>
        <div className="w-full sm:w-64">
          <CategoryFilter
            categories={categories}
            selectedCategoryId={categoryId}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      <div className="flex min-h-6 flex-col gap-2">
        {searchTerm && (
          <p className="text-sm text-black/70 dark:text-white/70">
            Showing results for{" "}
            <span className="font-semibold text-black dark:text-white">
              &ldquo;{searchTerm}&rdquo;
            </span>
          </p>
        )}
        {isPending && (
          <p
            role="status"
            className="text-sm text-black/60 dark:text-white/60"
          >
            Loading products…
          </p>
        )}
        {fetchError && (
          <p
            role="alert"
            className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {fetchError}
          </p>
        )}
      </div>

      <CartSummary cart={cart} />

      <AddProductForm categories={categories} onAdd={handleAddProduct} />

      <ProductGrid products={items} onAddToCart={handleAddToCart} />
    </div>
  );
}
