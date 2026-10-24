// app/dashboard/categories/page.tsx
//
// Server Component entry for the admin category dashboard. It exists purely to
// carry the segment config and render the client UI (categories-client.tsx).
//
// `instant = false` opts this page out of Next.js 16's instant-navigation
// validation. The page loads its data in the browser behind a client-side auth
// gate, so it cannot produce an instant static shell. `instant` throws if
// exported from a Client Component, which is why the interactive UI lives in
// categories-client.tsx and this thin page stays a Server Component.

import CategoriesClient from './categories-client';

export const instant = false;

export default function CategoriesPage() {
  return <CategoriesClient />;
}
