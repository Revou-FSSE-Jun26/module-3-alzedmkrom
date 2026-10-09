// components/Header.tsx
//
// The application header: the RevoShop wordmark plus the primary navigation.
// A server component — it holds no state and uses no hooks. The interactive
// part (active-route detection) lives in <Nav />, the only client island here.

import { Suspense } from "react";
import Link from "next/link";
import Nav, { NavFallback } from "./Nav";

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-white dark:border-white/15 dark:bg-black">
      <div className="flex w-full items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-black dark:text-white"
        >
          RevoShop
        </Link>
        {/*
          Nav calls usePathname() for active-route styling. On a statically
          known path that resolves during prerender, but on a dynamic route
          such as /products/[id] the pathname is only known at runtime, which
          would block prerendering the shared chrome. Wrapping Nav in Suspense
          lets the shell prerender with the inactive fallback and streams the
          active state in — the documented fix for a runtime client hook.
        */}
        <Suspense fallback={<NavFallback />}>
          <Nav />
        </Suspense>
      </div>
    </header>
  );
}
