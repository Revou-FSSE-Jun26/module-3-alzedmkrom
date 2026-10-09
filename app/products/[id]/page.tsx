// app/products/[id]/page.tsx
//
// The product detail route. A Server Component: it reads the dynamic `id`
// segment and fetches that single product on the server with
// `await getProduct(id)`. In Next 15+ (this project targets 16) `params` is a
// Promise, so it is awaited — `const { id } = await params`.
//
// Two async entry points read `params`:
//   - the page, which hands the params promise to a <Suspense>-wrapped child
//     that awaits it and fetches the product
//   - generateMetadata, to set the browser-tab title to the real product name
//
// Why the Suspense boundary: Cache Components is enabled and this route has no
// generateStaticParams, so the `id` is runtime data. Awaiting `params` at the
// page's top level would make the whole route — including the shared chrome
// from the root layout, whose <Nav> calls usePathname() — runtime, which
// blocks prerendering the static shell. Passing the params promise down and
// awaiting it inside a <Suspense> boundary lets the shell prerender while the
// product content streams in. (See the Cache Components section of the dynamic
// routes docs.)
//
// generateMetadata resolves the title from live data, with the raw id as the
// fallback so a failed metadata fetch degrades to "Product <id> — RevoShop"
// instead of breaking the page (design: the dynamic title uses the real name,
// the id is the fallback).
//
// A thrown ApiError — an unknown id returns a non-OK status, which getProduct
// turns into an ApiError — propagates to app/products/[id]/error.tsx; the
// in-flight fetch shows app/products/[id]/loading.tsx. The nested
// app/products/layout.tsx stays mounted across the /products <-> /products/[id]
// navigation, which its mount probe proves.

import { Suspense } from "react";
import type { Metadata } from "next";
import { getProduct } from "@/lib/api";
import { availabilityOf } from "@/lib/types";
import { getBadgeClasses, getBadgeLabel } from "@/lib/productStyles";
import { formatRupiah } from "@/lib/format";
import Card from "@/components/Card";
import { DetailSkeleton } from "./loading";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(Number(id));
    return {
      title: `${product.name} — RevoShop`,
      description: product.description,
    };
  } catch {
    // The fetch failed (unknown id, API down). Degrade to the id rather than
    // letting the metadata resolution break the page.
    return { title: `Product ${id} — RevoShop` };
  }
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <Suspense fallback={<DetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </section>
  );
}

async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(Number(id));

  const availability = availabilityOf(product);

  return (
    <Card className="flex flex-col gap-6 md:flex-row">
      {/* Placeholder image — the products table has no image column yet. */}
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-slate-100 text-slate-400 md:max-w-sm dark:bg-white/10">
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

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            {product.name}
          </h1>
          <span className={getBadgeClasses(availability)}>
            {getBadgeLabel(availability)}
          </span>
        </div>

        <p className="text-3xl font-bold text-black dark:text-white">
          {formatRupiah(product.price)}
        </p>

        <p className="text-black/70 dark:text-white/70">
          {product.description}
        </p>

        <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-2 border-b border-black/5 py-1 dark:border-white/10">
            <dt className="text-black/60 dark:text-white/60">Stock</dt>
            <dd className="font-medium text-black dark:text-white">
              {product.stockQuantity}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-black/5 py-1 dark:border-white/10">
            <dt className="text-black/60 dark:text-white/60">Category</dt>
            <dd className="font-medium text-black dark:text-white">
              #{product.categoryId}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
