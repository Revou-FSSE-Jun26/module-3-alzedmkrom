// app/products/loading.tsx
//
// Instant loading UI for the products route, shown while the Server
// Component's product and category fetches are in flight. It mirrors the real
// page shape: the same container and heading area, a placeholder bar standing
// in for the search and filter controls task 12 adds, then a grid using the
// exact same responsive column classes as ProductGrid (one column, two at
// `sm`, three at `lg`) so the skeleton occupies the shape the content will fill.
//
// A Server Component by default — it only renders static markup.

const SKELETON_CARDS = 8;

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-white/5">
      <div className="aspect-[4/3] w-full rounded-lg bg-slate-200 dark:bg-white/10" />
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="h-5 w-32 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-3 h-6 w-24 rounded bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6">
      <header className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-white/10 sm:max-w-sm" />
        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-white/10 sm:w-48" />
      </div>

      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
      <span className="sr-only">Loading products…</span>
    </section>
  );
}
