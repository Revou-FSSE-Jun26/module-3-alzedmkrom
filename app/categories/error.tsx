// app/categories/error.tsx
//
// Error boundary for the categories segment. Error boundaries must be Client
// Components, so this file carries the "use client" directive. It receives the
// `{ error, reset }` props Next.js passes to a segment error boundary, logs the
// error to the console for debugging, and renders a friendly recovery UI with a
// retry button wired to `reset()`.
//
// It never renders a raw stack trace: only a short, human-readable line is
// shown — never `error.stack`.

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for debugging; the UI below stays friendly regardless.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
        Couldn&apos;t load categories
      </h1>
      <p className="max-w-md text-black/60 dark:text-white/60">
        The category list is temporarily unavailable. The storefront may be
        offline, or the connection may have dropped. Please try again in a
        moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        Try again
      </button>
    </section>
  );
}
