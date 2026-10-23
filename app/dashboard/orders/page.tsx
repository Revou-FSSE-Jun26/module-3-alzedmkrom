'use client';
export const instant = false;

// app/dashboard/orders/page.tsx
//
// Admin order overview showing all user orders across the system.
// This is a read-only view with no mutation controls. The admin gate is
// inherited from the dashboard layout, which redirects non-admins away.
//
// State:
// - orders: the full order list from GET /orders?all=true
// - isLoading: request-in-flight flag

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllOrders } from '@/lib/api';
import { toastError } from '@/lib/toast';
import type { Order } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/format';

export default function DashboardOrdersPage() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders on mount.
  useEffect(() => {
    async function init() {
      if (!session?.token) return;

      try {
        const allOrders = await getAllOrders(session.token);
        setOrders(allOrders);
        setError(null);
      } catch (err) {
        toastError(err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load orders',
        );
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [session?.token]);

  // Guard: token is required.
  if (!session?.token) {
    return (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300">
        You must be logged in to access the dashboard.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8 text-black dark:text-white">Loading orders…</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-black dark:text-white">
        All Orders
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-md border border-black/10 bg-white p-8 text-center text-black dark:border-white/15 dark:bg-white/5 dark:text-white">
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                  User ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-black dark:text-white">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-semibold text-black dark:text-white">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/15">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-black/2 dark:hover:bg-white/2"
                >
                  <td className="px-4 py-3 text-black dark:text-white font-medium">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">
                    {order.userId}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                          : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                            : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                              : order.status === 'PROCESSING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-black dark:text-white font-medium">
                    {formatRupiah(order.totalPrice)}
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}




