// app/dashboard/page.tsx
//
// Server Component entry for the admin dashboard. It exists purely to carry the
// segment config and render the client UI (dashboard-client.tsx).
//
// `instant = false` opts this page out of Next.js 16's instant-navigation
// validation. The dashboard loads all its data in the browser and sits behind
// a client-side auth gate, so it legitimately cannot produce an instant static
// shell. `instant` throws if exported from a Client Component, which is why the
// interactive UI lives in dashboard-client.tsx and this thin page stays a
// Server Component.

import DashboardClient from './dashboard-client';

export const instant = false;

export default function DashboardPage() {
  return <DashboardClient />;
}
