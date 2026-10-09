// app/loading.tsx
//
// Instant loading UI for the home route, shown while the Server Component's
// product fetch is in flight. It mirrors the real layout: the same page
// container and heading area, then a grid using the exact same responsive
// column classes as ProductGrid (one column, two at `sm`, four at `lg`) so the
// skeleton occupies the same shape the content will fill.
//
// A Server Component by default — it only renders static markup. Five skeleton
// cards match the five featured products the home page slices.

const SKELETON_CARDS = 5;

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-white/5">
      <div className="aspect-square w-full rounded-lg bg-slate-200 dark:bg-white/10" />
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
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </header>

      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
      <span className="sr-only">Loading featured products…</span>
    </section>
  );
}
