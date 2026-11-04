// components/SearchBar.tsx
//
// The catalog search input. A controlled client component: its displayed value
// is held in React state and updated through an onChange handler, so the input
// never drifts from state.
//
// Search filters live as the user types. A debounced effect mirrors the input
// into the URL's `search` param (router.replace, scroll:false) 300ms after the
// last keystroke, so ProductList — which reads `search` via useSearchParams()
// and refetches — updates without needing a submit. encodeURIComponent keeps a
// query such as "a&b" from corrupting the query string. Submitting with Enter
// still works and simply flushes the same navigation immediately.
//
// router.replace (not push) is used so typing doesn't stack a history entry per
// keystroke; the Back button returns to the previous page, not each character.
//
// An optional `initialQuery` seeds the input so a direct load of
// /products?search=watch shows the active term in the box, not an empty field.

"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  /** Optional: seeds the input, e.g. from the current `search` query param. */
  initialQuery?: string;
}

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(initialQuery);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
  }

  // Debounced live filter: push the trimmed query into the URL 300ms after the
  // user stops typing. Skip when it already matches the current `search` param,
  // so re-renders from external URL changes don't loop.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === (searchParams.get("search") ?? "")) return;

    const timeoutId = setTimeout(() => {
      router.replace(
        trimmed
          ? `/products?search=${encodeURIComponent(trimmed)}`
          : "/products",
        { scroll: false },
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchParams, router]);

  // Wrapped in a <form> so Enter submits naturally; preventDefault stops the
  // full-page GET and we navigate client-side instead. The debounce above also
  // handles typing, so this just flushes the current query right away.
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = query.trim();
    router.replace(
      trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products",
      { scroll: false },
    );
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
        className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        Search
      </button>
    </form>
  );
}
