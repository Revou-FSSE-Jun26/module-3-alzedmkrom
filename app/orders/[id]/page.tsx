'use client';

// app/orders/[id]/page.tsx
//
// Order detail view showing a single order with its line items. Protected by
// useRequireRole to ensure only logged-in users can access this page.
//
// The API scopes order access to the owner or admin, so requesting another
// user's order returns 403.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { getOrderDetail } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import type { OrderDetail } from '@/lib/types';

export default function OrderDetailPage() {
  const { ready } = useRequireRole();
  const { session } = useAuth();
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
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
        const data = await getOrderDetail(orderId, session.token);
        setOrder(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load order'
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [ready, session?.token, orderId]);

  // Render nothing while authorization is being checked. This prevents a flash
  // of protected content before the redirect.
  if (!ready) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to orders
      </Link>

      {isLoading ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 p-8 dark:border-white/20">
          <p className="text-black dark:text-white">Loading order...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-red-800 dark:text-red-100">Error: {error}</p>
        </div>
      ) : !order ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
          <p className="font-semibold text-black dark:text-white">
            Order not found
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <header className="mb-6 flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">
              Order #{order.id}
            </h1>
            <p className="text-black/60 dark:text-white/60">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </header>

          <div className="grid gap-4 rounded-lg border border-black/10 p-4 dark:border-white/10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Status
                </p>
                <p className="mt-1 font-semibold text-black dark:text-white">
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Items
                </p>
                <p className="mt-1 font-semibold text-black dark:text-white">
                  {order.items.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Total
                </p>
                <p className="mt-1 font-semibold text-black dark:text-white">
                  {formatRupiah(order.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-black/60 dark:text-white/60">
                  User ID
                </p>
                <p className="mt-1 font-semibold text-black dark:text-white">
                  {order.userId}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Line Items
            </h2>
            <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                      Line Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.product.id}
                      className="border-b border-black/5 hover:bg-black/2 dark:border-white/5 dark:hover:bg-white/2"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {item.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-black dark:text-white">
                        {formatRupiah(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-black dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-black dark:text-white">
                        {formatRupiah(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
