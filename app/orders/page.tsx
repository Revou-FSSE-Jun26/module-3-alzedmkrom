'use client';

// app/orders/page.tsx
//
// Customer order view, protected by useRequireRole to ensure only logged-in
// users can access this page. Renders a list of the user's own orders.
//
// This is a usability layer, not a security boundary: the API independently
// returns orders only for the authenticated user.

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { getMyOrders } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { ready } = useRequireRole();
  const { session, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch when authorized and have a token
    if (!ready || !session?.token) {
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMyOrders(session.token);
        setOrders(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load orders'
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ready, session?.token]);

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

      {isLoading ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 p-8 dark:border-white/20">
          <p className="text-black dark:text-white">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-800 dark:text-red-100">Error: {error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
          <p className="font-semibold text-black dark:text-white">
            No orders yet
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            You haven&rsquo;t placed any orders yet. Start shopping!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black/5 hover:bg-black/2 dark:border-white/5 dark:hover:bg-white/2"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">
                    ${(order.totalPrice / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-black/60 dark:text-white/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}