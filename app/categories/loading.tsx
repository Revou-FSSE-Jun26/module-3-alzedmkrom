// app/categories/loading.tsx
//
// Instant loading UI for the categories route, shown while the Server
// Component's category fetch is in flight. It mirrors the real page shape: the
// same container and heading area, then a grid using the exact same responsive
// column classes as the categories page (one column, two at `sm`, three at
// `lg`) so the skeleton occupies the shape the content will fill.
//
// A Server Component by default â€” it only renders static markup. Four skeleton
// tiles match the four real categories the API returns.

const SKELETON_TILES = 4;

function SkeletonTile() {
  return (
    <div className="animate-pulse rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-white/5">
      <div className="h-5 w-32 rounded bg-slate-200 dark:bg-white/10" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <div className="h-8 w-44 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </header>

      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: SKELETON_TILES }).map((_, index) => (
          <SkeletonTile key={index} />
        ))}
      </div>
      <span className="sr-only">Loading categoriesâ€¦</span>
    </section>
  );
}
