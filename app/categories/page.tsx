// app/categories/page.tsx
//
// The categories route. A pure Server Component — no "use client" directive and
// no hooks anywhere in its own tree. It fetches the category list on the server
// with `await getCategories()` and renders each one through <Card />, reusing
// the shared surface so the category tiles match every other card in the app.
//
// Categories have no stock or price, so each tile shows only the name and
// description. The chrome (Header/Footer) comes from the root layout, so this
// page renders only its own section.
//
// A thrown ApiError (API down, bad status) propagates to
// app/categories/error.tsx; the in-flight fetch shows app/categories/loading.tsx.

import type { Metadata } from "next";
import { getCategories } from "@/lib/api";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Categories — RevoShop",
  description:
    "Browse the product categories in the RevoShop catalog, served live from the RevoShop API.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-6 pb-12">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Categories
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Explore the product categories in the RevoShop catalog.
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
          <p className="font-semibold text-black dark:text-white">
            No categories found
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            The catalog has no categories to show right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {category.name}
              </h2>
              <p className="text-sm text-black/60 dark:text-white/60">
                {category.description}
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
