'use client';

// app/cart/page.tsx
//
// Shopping cart page, protected by useRequireRole to ensure only logged-in
// users can access this page. Displays cart items in a table with quantities,
// prices, and line totals. Allows removing items, shows overall total, and
// disables checkout when cart is empty.
//
// This is a client component because it reads and manipulates cart state
// through useCart() context.

import Link from 'next/link';

import { useRequireRole } from '@/hooks/useRequireRole';
import { useCart } from '@/hooks/useCart';
import { formatRupiah } from '@/lib/format';
import { toastSuccess } from '@/lib/toast';

export default function CartPage() {
  const { ready } = useRequireRole();
  const { items, removeItem, totalPrice, isEmpty } = useCart();

  // Render nothing while authorization is being checked. This prevents a flash
  // of protected content before the redirect.
  if (!ready) {
    return null;
  }

  const handleRemoveItem = (productId: number, productName: string) => {
    removeItem(productId);
    toastSuccess(`${productName} removed from cart`);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">
          Shopping Cart
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Review your items before checkout.
        </p>
      </header>

      {isEmpty ? (
        // Empty cart state
        <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
          <p className="font-semibold text-black dark:text-white">
            Your cart is empty
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            Add some products to get started.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        // Cart with items
        <div className="flex flex-col gap-6">
          {/* Cart table */}
          <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
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
                  <th className="px-4 py-3 font-semibold text-black dark:text-white text-right">
                    Action
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
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveItem(item.productId, item.name)}
                          className="text-red-600 hover:text-red-700 font-semibold transition active:scale-95 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total and checkout */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-black/60 dark:text-white/60">Total Quantity</p>
                <p className="text-lg font-semibold text-black dark:text-white">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-black/60 dark:text-white/60">Order Total</p>
                <p className="text-3xl font-bold text-black dark:text-white">
                  {formatRupiah(totalPrice)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Link
                href="/checkout"
                className="inline-block rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-95 text-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="inline-block rounded-lg border border-black/10 bg-transparent px-8 py-3 font-semibold text-black transition hover:bg-black/5 active:scale-95 text-center dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
