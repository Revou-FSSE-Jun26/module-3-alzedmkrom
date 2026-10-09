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
import { Suspense } from "react";
import { connection } from "next/server";
import { getOrders } from "@/lib/auth";
import OrderList from "@/components/OrderList";

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

// The page itself is now a static shell: the heading prerenders, and the
// authenticated, request-time order fetch streams in through <Suspense>. This
// is the Cache Components model (enabled by default in this project): fresh
// per-request data is not opted in with force-dynamic, it is wrapped in a
// Suspense boundary so the prerender completes with the shell and the dynamic
// read runs at request time. Without the boundary, the token cache's
// Date.now() expiry check trips Next's "unstable value during prerender" error.
export default function OrdersPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-6 pb-12">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          Orders
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Your order history in RevoShop.
        </p>
      </header>

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </section>
  );
}

// A lightweight inline skeleton for the streamed region. app/orders/loading.tsx
// still covers the initial navigation; this covers the Suspense fallback for
// the request-time fetch within the already-rendered shell.
function OrdersSkeleton() {
  return (
    <ul className="flex flex-col gap-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-20 animate-pulse rounded-xl border border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5"
        />
      ))}
    </ul>
  );
}

// The request-time, authenticated read. Isolated here so only this subtree is
// dynamic; everything above it prerenders into the static shell.
async function OrdersContent() {
  // Stop prerendering here: the auth token cache checks Date.now() for expiry,
  // an unstable value Next refuses to prerender. connection() defers everything
  // below to request time, which is correct — these are live authenticated
  // orders, never a static snapshot.
  await connection();
  const orders = await getOrders(demoUserId());

  return (
    <>
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
        <OrderList orders={orders} />
      )}
    </>
  );
}