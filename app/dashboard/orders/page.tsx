// app/dashboard/orders/page.tsx
//
// Server Component entry for the admin orders overview. It exists purely to
// carry the segment config and render the client UI (orders-client.tsx).
//
// `instant = false` opts this page out of Next.js 16's instant-navigation
// validation. The page loads its data in the browser behind a client-side auth
// gate, so it cannot produce an instant static shell. `instant` throws if
// exported from a Client Component, which is why the interactive UI lives in
// orders-client.tsx and this thin page stays a Server Component.

import OrdersClient from './orders-client';

export const instant = false;

export default function DashboardOrdersPage() {
  return <OrdersClient />;
}
