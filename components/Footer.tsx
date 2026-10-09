// components/Footer.tsx
//
// The application footer. A server component — purely presentational, no state
// and no hooks. Pushed to the bottom by the flex-column body in the root layout.
//
// The copyright year is read through a "use cache" function with cacheLife('max').
// With Cache Components enabled, calling `new Date()` directly during a static
// prerender is rejected as non-deterministic; a stable annotation like the
// copyright year is the documented case for caching the read instead.

import { cacheLife } from "next/cache";

async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export default async function Footer() {
  const year = await currentYear();

  return (
    <footer className="mt-auto border-t border-black/10 bg-white dark:border-white/15 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-black/60 dark:text-white/60">
        <p>&copy; {year} RevoShop. Built for Module 3, Checkpoint 2.</p>
      </div>
    </footer>
  );
}
