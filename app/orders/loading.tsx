// app/orders/loading.tsx
//
// Instant loading UI for the orders route, shown while the Server Component
// logs in and fetches the order list. It mirrors the real page shape: the same
// container and heading area, then a vertical stack of skeleton rows matching
// the real order rows (id/date on the left, status/total on the right).
//
// A Server Component by default — static markup only. Three skeleton rows match
// the three orders the demo account (user 14) returns.

const SKELETON_ROWS = 3;

function SkeletonRow() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/15 dark:bg-white/5">
      <div className="flex flex-col gap-2">
        <div className="h-5 w-28 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="h-5 w-24 rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6">
      <header className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </header>

      <div aria-hidden="true" className="flex flex-col gap-4">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
      <span className="sr-only">Loading orders…</span>
    </section>
  );
}