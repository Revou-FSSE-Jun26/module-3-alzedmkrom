// components/ProductList.tsx
//
// The interactive catalog's client subtree. The server/client boundary sits
// here: the products route (a Server Component) fetches the initial products
// and categories on the server and hands them down as props, and everything
// from this component downward runs in the browser.
//
// This is a MINIMAL version so the products route compiles and renders live
// data today. Later tasks flesh it out:
//   - Task 12 adds the SearchBar, the useSearchParams()-driven refetch, and the
//     CategoryFilter.
//   - Task 13 adds cart state, CartSummary, and AddProductForm.
// Until then it simply renders the server-fetched products through
// ProductGrid in read-only mode, so the route is never broken by referencing a
// component that does nothing.

"use client";

import ProductGrid from "@/components/ProductGrid";
import type { Category, Product } from "@/lib/types";

interface ProductListProps {
  /** The initial product set fetched on the server, honouring any `search`. */
  products: Product[];
  /** The category list fetched on the server, for the filter added in task 12. */
  categories: Category[];
}

export default function ProductList({ products }: ProductListProps) {
  return <ProductGrid products={products} />;
}
