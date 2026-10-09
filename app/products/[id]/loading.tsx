// app/products/[id]/loading.tsx
//
// Instant loading UI for the product detail route, shown while the Server
// Component's single-product fetch is in flight. It mirrors the real page
// shape: the same container, then a Card-shaped surface with an image block on
// one side and stacked title, price, description and spec rows on the other,
// using the same responsive md:flex-row split the detail page uses, so the
// skeleton occupies the shape the content will fill.
//
// The inner skeleton is factored into DetailSkeleton so the page can reuse it
// as the fallback of its in-page <Suspense> boundary without double-wrapping
// the <section> container. The default export remains the route-level
// loading.tsx Next renders during navigation.
//
// A Server Component by default — it only renders static markup.

export function DetailSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col gap-6 rounded-xl border border-black/10 bg-white p-4 shadow-sm md:flex-row dark:border-white/15 dark:bg-white/5"
    >
      <div className="aspect-square w-full rounded-lg bg-slate-200 md:max-w-sm dark:bg-white/10" />

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="h-7 w-56 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="h-9 w-40 rounded bg-slate-200 dark:bg-white/10" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="h-6 w-full rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-6 w-full rounded bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10">
      <DetailSkeleton />
      <span className="sr-only">Loading product…</span>
    </section>
  );
}
