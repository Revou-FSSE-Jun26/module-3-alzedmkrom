// app/orders/page.tsx
//
// The orders route. A Server Component that reads the demo user's orders from
// the authenticated API. Authentication happens entirely on the server:
// getOrders -> withBearerToken (lib/auth.ts) logs in with the demo credentials,
// attaches the bearer token, and the token never reaches the browser.
//
// DEMO_USER_ID identifies which account's orders to read, and it MUST match the
// authenticated account (DEMO_USER_EMAIL). A token for one user requesting
// another user's orders returns 403, verified against the live API — so the id
// is read from the environment rather than hardcoded or guessed.
//
// The API returns order HEADERS only — id, status, total, date — with no nested
// line items, so each row shows exactly those four fields. An account with no
// orders (users 15 and 16 in the demo seed) renders the empty state.
//
// A thrown ApiError (API down, bad status, auth failure) propagates to
// app/orders/error.tsx; the in-flight fetch shows app/orders/loading.tsx.

import type { Metadata } from "next";
import { getOrders } from "@/lib/auth";
import { formatDate, formatRupiah } from "@/lib/format";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Orders — RevoShop",
  description:
    "Review your RevoShop orders — status, total and date — served live from the authenticated RevoShop API.",
};

/**
 * Reads DEMO_USER_ID and parses it to a number. Throws a clear, named error
 * when it is missing or not a valid integer, so a misconfigured environment
 * surfaces plainly in error.tsx rather than as a confusing 403 or NaN query.
 */
function demoUserId(): number {
  const raw = process.env.DEMO_USER_ID;
  if (!raw) {
    throw new Error("DEMO_USER_ID is not set. Copy .env.example to .env.local.");
  }
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`DEMO_USER_ID must be a positive integer; got "${raw}".`);
  }
  return id;
}

export default async function OrdersPage() {
  const orders = await getOrders(demoUserId());

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Orders
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Your order history, served live from the RevoShop API.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
          <p className="font-semibold text-black dark:text-white">
            No orders yet
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            This account has not placed any orders.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold text-black dark:text-white">
                    Order #{order.id}
                  </span>
                  <span className="text-sm text-black/60 dark:text-white/60">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                    {order.status}
                  </span>
                  <span className="text-lg font-semibold text-black dark:text-white">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}