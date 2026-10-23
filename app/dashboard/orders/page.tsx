'use client';

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
import { getAllOrders, updateOrderStatus } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Order } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/format';
import Link from 'next/link';

export default function DashboardOrdersPage() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all orders on mount.
  useEffect(() => {
    let didCall = false;

    async function init() {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const allOrders = await getAllOrders(session.token);
        setOrders(allOrders);
        setError(null);
      } catch (err) {
        if (!didCall) {
          toastError(err);
          didCall = true;
        }
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
  }, [session]);

  function openEditModal(order: Order): void {
    setEditingOrderId(order.id);
    setEditingStatus(order.status);
  }

  function closeEditModal(): void {
    setEditingOrderId(null);
    setEditingStatus('');
  }

  async function handleStatusSubmit(): Promise<void> {
    if (editingOrderId === null || !session?.token) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(editingOrderId, editingStatus, session.token);
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrderId ? updated : o)),
      );
      toastSuccess(`Order status changed to ${editingStatus}`);
      closeEditModal();
    } catch (err) {
      toastError(err);
    } finally {
      setIsUpdating(false);
    }
  }

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
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-8">
      <nav className="flex gap-6 border-b border-black/10 dark:border-white/15 pb-4">
        <Link href="/dashboard" className="text-2xl font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white">
          Products
        </Link>
        <Link href="/dashboard/categories" className="text-2xl font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white">
          Categories
        </Link>
        <Link href="/dashboard/orders" className="text-2xl font-bold text-black dark:text-white hover:text-black/70 dark:hover:text-white/70">
          Orders
        </Link>
      </nav>

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
                <th className="px-4 py-3 text-right font-semibold text-black dark:text-white">
                  Actions
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
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(order)}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit status modal */}
      {editingOrderId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-6 shadow-lg dark:border-white/15 dark:bg-black">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Edit Order #{editingOrderId} Status
            </h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Status
              </label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value)}
                disabled={isUpdating}
                className="w-full rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-black dark:text-white disabled:opacity-50"
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={closeEditModal}
                disabled={isUpdating}
                className="flex-1 rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                disabled={isUpdating}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
    </section>
  );
}

