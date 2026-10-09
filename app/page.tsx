// app/page.tsx
//
// The home route. A pure Server Component — no "use client" directive and no
// hooks anywhere in its own tree. It fetches the catalog on the server with
// `await getProducts({})`, takes the first five products, and renders them
// through <ProductGrid /> in read-only mode. Read-only means the cards drop
// their quantity counter and add control, so nothing below this page needs to
// be interactive and the whole subtree stays server-rendered (design
// Property 1).
//
// A thrown ApiError (API down, bad status) propagates to app/error.tsx; the
// in-flight fetch shows app/loading.tsx.

import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";

export const metadata: Metadata = {
  title: "RevoShop — Home",
  description:
    "Discover a selection of featured products from the RevoShop catalog, served live from the RevoShop API.",
};

export default async function Home() {
  const products = await getProducts({});
  const featured = products.slice(0, 5);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Featured products
        </h1>
        <p className="text-black/60 dark:text-white/60">
          A quick look at five products from the RevoShop catalog.
        </p>
      </header>

      <ProductGrid products={featured} readOnly />
    </section>
  );
}
