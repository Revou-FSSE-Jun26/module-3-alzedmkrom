// components/SearchBar.tsx
//
// The catalog search input. A controlled client component: its displayed value
// is held in React state and updated through an onChange handler, so the input
// never drifts from state.
//
// On Enter it drives the URL rather than filtering locally: it calls
// router.push("/products?search=" + encodeURIComponent(query)). That keeps the
// search shareable and reload-safe — ProductList reads the `search` param back
// out via useSearchParams() and refetches — and encodeURIComponent keeps a
// query such as "a&b" from corrupting the query string.
//
// An optional `initialQuery` seeds the input so a direct load of
// /products?search=watch shows the active term in the box, not an empty field.

"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  /** Optional: seeds the input, e.g. from the current `search` query param. */
  initialQuery?: string;
}

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState<string>(initialQuery);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
  }

  // Wrapped in a <form> so Enter submits naturally; preventDefault stops the
  // full-page GET and we navigate client-side instead.
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    router.push("/products?search=" + encodeURIComponent(query.trim()));
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2"
    >
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        type="search"
        name="search"
        value={query}
        onChange={handleChange}
        placeholder="Search products…"
        autoComplete="off"
        className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        Search
      </button>
    </form>
  );
}
