// components/Header.tsx
//
// The application header: the RevoShop wordmark plus the primary navigation.
// A server component — it holds no state and uses no hooks. The interactive
// part (active-route detection) lives in <Nav />, the only client island here.

import Link from "next/link";
import Nav from "./Nav";

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-white dark:border-white/15 dark:bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-black dark:text-white"
        >
          RevoShop
        </Link>
        <Nav />
      </div>
    </header>
  );
}
