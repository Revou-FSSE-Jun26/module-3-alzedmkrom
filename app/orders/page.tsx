'use client';

// app/orders/page.tsx
//
// Customer order view, protected by useRequireRole to ensure only logged-in
// users can access this page. Renders a list of the user's own orders.
//
// This is a usability layer, not a security boundary: the API independently
// returns orders only for the authenticated user.

import { useRequireRole } from '@/hooks/useRequireRole';

export default function OrdersPage() {
  const { ready } = useRequireRole();

  // Render nothing while authorization is being checked. This prevents a flash
  // of protected content before the redirect.
  if (!ready) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">
          Orders
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Your order history in RevoShop.
        </p>
      </header>

      {/* TODO: Implement orders list when task 10 is executed */}
      <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
        <p className="font-semibold text-black dark:text-white">
          Orders coming soon
        </p>
        <p className="text-sm text-black/60 dark:text-white/60">
          This feature will be implemented in the next task.
        </p>
      </div>
    </section>
  );
}