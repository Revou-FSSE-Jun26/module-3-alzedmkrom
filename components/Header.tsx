'use client';

// components/Header.tsx
//
// The application header: the RevoGarb wordmark, the primary navigation, and
// the session state. The interactive parts (active-route detection and auth UI)
// are client islands.

import { Suspense } from "react";
import Link from "next/link";
import Nav, { NavFallback } from "./Nav";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

function SessionUI() {
  const { user, isLoading, logout } = useAuth();

  // While the session is being restored from localStorage, render the logged-out
  // affordances to avoid a hydration mismatch. Once isLoading resolves, the
  // correct affordances appear.
  if (isLoading) {
    return (
      <div className="flex gap-4">
        <Link href="/login" className="text-sm font-medium hover:underline">
          Log in
        </Link>
        <Link href="/register" className="text-sm font-medium hover:underline">
          Register
        </Link>
      </div>
    );
  }

  // Logged in: show username and logout control.
  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{user.username}</span>
        <button
          onClick={logout}
          className="text-sm font-medium hover:underline"
        >
          Log out
        </button>
      </div>
    );
  }

  // Logged out: show login and register links.
  return (
    <div className="flex gap-4">
      <Link href="/login" className="text-sm font-medium hover:underline">
        Log in
      </Link>
      <Link href="/register" className="text-sm font-medium hover:underline">
        Register
      </Link>
    </div>
  );
}

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-white dark:border-white/15 dark:bg-gray-800/80">
      <div className="flex w-full flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-[#ffde3d] [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000,0_0_12px_rgba(255,222,61,0.9)]"
        >
          RevoGarb
        </Link>
        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-6">
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
          <ThemeToggle />
          <SessionUI />
        </div>
      </div>
    </header>
  );
}
