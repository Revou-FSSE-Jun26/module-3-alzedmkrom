// app/products/page.tsx
//
// The products route. A Server Component: it fetches the initial product set
// and the category list on the server, then hands them to <ProductList />, the
// client subtree that owns search, filtering and the cart (fleshed out in
// tasks 12 and 13).
//
// `searchParams` is a Promise in Next 15+, so it is awaited. The initial fetch
// honours any `search` value already in the URL, so a direct load of
// /products?search=watch arrives already filtered rather than filtering only
// after hydration.
//
// ProductList reads useSearchParams(), a Client Component hook that forces the
// subtree up to the nearest Suspense boundary to render on the client during a
// prerender. It is therefore wrapped in <Suspense> here, in its Server
// Component parent, so the rest of the route can still be prerendered.
//
// A thrown ApiError (API down, bad status) propagates to
// app/products/error.tsx; the in-flight fetch shows app/products/loading.tsx.

import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import ProductList from "@/components/ProductList";

export const metadata: Metadata = {
  title: "Products — RevoShop",
  description:
    "Browse the full RevoShop catalog. Search by name and filter by category, served live from the RevoShop API.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[] }>;
}) {
  const { search } = await searchParams;
  // A repeated `?search=` would arrive as an array; take the first value so the
  // fetch always receives a single string.
  const searchTerm = Array.isArray(search) ? search[0] : search;

  const [products, categories] = await Promise.all([
    getProducts(searchTerm ? { search: searchTerm } : {}),
    getCategories(),
  ]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Products
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Search and filter the full RevoShop catalog.
        </p>
      </header>

      <Suspense fallback={null}>
        <ProductList products={products} categories={categories} />
      </Suspense>
    </section>
  );
}
