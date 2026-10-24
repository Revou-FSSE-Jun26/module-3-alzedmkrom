// components/CategoryFilter.tsx
//
// A dropdown that narrows the catalog by category. A client component because
// it owns a selection, runs effects, and refetches on change.
//
// Two fetches, by design:
//   1. On mount it calls getCategories() in a useEffect with an empty
//      dependency array, satisfying the "fetches GET /categories on mount"
//      contract. The server-fetched `categories` prop seeds the <select> for
//      first paint, so the options are present before this fetch resolves;
//      when it resolves the local list is replaced with the fresh result.
//   2. On selection it calls getProducts({ categoryId }) and hands the
//      resulting Product[] up to the parent through `onCategoryChange`, so
//      ProductList (task 12.3) can swap the rendered grid. The "All
//      categories" option refetches with no category via getProducts({}).
//
// The products refetch exposes a pending state (the <select> is disabled and a
// small indicator shows) and a recoverable error message when either fetch
// fails, so the UI is never silently frozen or empty.

"use client";

import { useEffect, useState } from "react";
import { getCategories, getProducts } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import CustomSelect, { type SelectOption } from "./CustomSelect";

interface CategoryFilterProps {
  /** Server-fetched categories, used for first paint before the mount fetch resolves. */
  categories: Category[];
  /** The currently selected category id, or null for "All categories". */
  selectedCategoryId: number | null;
  /** Called with the new selection and the refetched products for that category. */
  onCategoryChange: (categoryId: number | null, products: Product[]) => void;
}

const ALL_CATEGORIES = "" as const;

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: CategoryFilterProps) {
  // Seeded from the server-fetched prop so the dropdown has options on the
  // very first render; replaced by the client fetch when it resolves.
  const [options, setOptions] = useState<Category[]>(categories);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetches GET /categories once on mount. Empty dependency array: this runs a
  // single time regardless of how the prop later changes.
  useEffect(() => {
    let active = true;

    getCategories()
      .then((fetched) => {
        if (active) {
          setOptions(fetched);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load categories.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Refetches the catalog for the chosen category and lifts the result up. An
  // empty value means "All categories" and refetches with no category filter.
  async function handleChange(raw: string): Promise<void> {
    const categoryId = raw === ALL_CATEGORIES ? null : Number(raw);

    setIsPending(true);
    setError(null);
    try {
      const products = await getProducts(
        categoryId === null ? {} : { categoryId },
      );
      onCategoryChange(categoryId, products);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load products for that category.",
      );
    } finally {
      setIsPending(false);
    }
  }

  const selectValue =
    selectedCategoryId === null ? ALL_CATEGORIES : String(selectedCategoryId);

  const selectOptions: SelectOption[] = [
    { value: ALL_CATEGORIES, label: "All categories" },
    ...options.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ];

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center gap-2">
        <CustomSelect
          id="category-filter"
          ariaLabel="Filter by category"
          options={selectOptions}
          value={selectValue}
          onChange={handleChange}
          disabled={isPending}
        />
        {isPending && (
          <span
            role="status"
            className="shrink-0 text-sm text-black/60 dark:text-white/60"
          >
            Loading…
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
