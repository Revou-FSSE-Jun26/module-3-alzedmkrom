'use client';

// app/checkout/page.tsx
//
// Checkout page where the user confirms their order. Protected by
// useRequireRole() to ensure only logged-in users can access.
//
// Displays an order summary with cart items, total price, and a confirm
// button. On confirm:
//   1. POST the cart items to the API as an order
//   2. On success: clear the cart and redirect to /orders
//   3. On failure: leave the cart intact and show the error
//
// The confirm button is disabled while the request is in flight, preventing
// double-submission. It is also disabled when the cart is empty, though the
// page guards should prevent reaching checkout with no items.
//
// This is a client component because it reads cart state, calls the API, and
// manages async request state.

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useRequireRole } from '@/hooks/useRequireRole';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { createOrder } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';

export default function CheckoutPage() {
  const { ready } = useRequireRole();
  const { session } = useAuth();
  const { items, totalPrice, isEmpty, clear } = useCart();
  const router = useRouter();

  // Track the submit-in-flight state; while true, disable the confirm button
  // so a double-click cannot create two orders.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Render nothing while authorization is being checked.
  if (!ready) {
    return null;
  }

  // Guard against empty cart. The checkout button on /cart is disabled when
  // empty, but a direct URL visit or stale page state could get here. Render
  // an error state rather than allowing an invalid submission.
  if (isEmpty) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 pt-6 pb-12 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">
            Checkout
          </h1>
        </header>

        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-yellow-400 bg-yellow-50 p-8 text-center dark:bg-yellow-950 dark:border-yellow-600">
          <p className="font-semibold text-yellow-900 dark:text-yellow-100">
            Your cart is empty
          </p>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Add items to your cart before checking out.
          </p>
          <Link
            href="/cart"
            className="mt-2 inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Return to Cart
          </Link>
        </div>
      </section>
    );
  }

  const handleConfirm = async () => {
    // Guard: cannot proceed without a token.
    if (!session?.token) {
      toastError(new Error('You must be logged in to checkout.'));
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert cart items to the API format: {productId, quantity} pairs.
      // The API helper will map to snake_case.
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // POST the order. The API reprices server-side using current catalogue
      // prices, so the cart's snapshot prices are not sent to the API.
      await createOrder(orderItems, session.token);

      // Success: clear the cart (state and storage) and navigate to orders.
      clear();
      toastSuccess('Order created successfully!');
      router.push('/orders');
    } catch (error) {
      // Failure: leave the cart intact so the user can retry. Surface the
      // error and do not redirect.
      toastError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pt-6 pb-12 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">
          Order Summary
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Review your items and confirm your order.
        </p>
      </header>

      {/* Order summary table */}
      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 mb-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-black/2 dark:border-white/10 dark:bg-white/5">
              <th className="px-4 py-3 font-semibold text-black dark:text-white">
                Product
              </th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white text-right">
                Unit Price
              </th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white text-right">
                Quantity
              </th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white text-right">
                Line Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <tr
                  key={item.productId}
                  className="border-b border-black/10 transition hover:bg-black/2 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-black dark:text-white font-medium">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-right text-black/70 dark:text-white/70">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="px-4 py-3 text-right text-black dark:text-white">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-black dark:text-white">
                    {formatRupiah(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order total and quantity */}
      <div className="mb-8 flex flex-col items-end gap-4 rounded-lg bg-black/2 p-4 dark:bg-white/5">
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-col items-end gap-1">
            <p className="text-black/60 dark:text-white/60">Total Quantity</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              {items.reduce((sum, item) => sum + item.quantity, 0)} total quantity
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-black/60 dark:text-white/60">Order Total</p>
            <p className="text-3xl font-bold text-black dark:text-white">
              {formatRupiah(totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Confirm and cancel buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Link
          href="/cart"
          className="inline-block rounded-lg border border-black/10 bg-transparent px-6 py-3 font-semibold text-black transition hover:bg-black/5 active:scale-95 text-center dark:border-white/10 dark:text-white dark:hover:bg-white/10"
        >
          Back to Cart
        </Link>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="inline-block rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </section>
  );
}
