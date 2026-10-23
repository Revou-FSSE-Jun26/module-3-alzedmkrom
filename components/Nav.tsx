// components/Nav.tsx
//
// The primary navigation. A client component, because determining the active
// route relies on usePathname(), which is a hook and so runs in the browser.
//
// Active-route styling is conveyed by more than colour: the active link also
// gets a bottom border and bolder weight, and carries aria-current="page" so
// assistive technology announces the current page. This keeps the active
// state perceivable without relying on colour alone.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "Orders" },
];

// Exact match for the home link; prefix match everywhere else, so a detail
// route such as /products/3 still highlights "Products".
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Whole literal Tailwind strings per branch so Tailwind resolves them by
// scanning this source. The active string adds weight and an underline on top
// of colour, so the state is not carried by colour alone.
const ACTIVE_LINK =
  "border-b-2 border-blue-600 pb-1 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400";
const INACTIVE_LINK =
  "border-b-2 border-transparent pb-1 font-medium text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white";

/**
 * CartBadge is a separate client component that reads useCart().
 * This isolates the hydration-sensitive code so Nav can render on server
 * without calling hooks that depend on context that isn't available yet.
 */
function CartBadge() {
  const pathname = usePathname();
  const cart = useCart();

  return (
    <Link
      href="/cart"
      aria-current={isActive(pathname, "/cart") ? "page" : undefined}
      className={isActive(pathname, "/cart") ? ACTIVE_LINK : INACTIVE_LINK}
    >
      Cart
      <span
        aria-label={cart.totalItems > 0 ? `${cart.totalItems} items in cart` : undefined}
        className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
          cart.totalItems > 0
            ? "bg-blue-600 text-white dark:bg-blue-400 dark:text-black"
            : "hidden"
        }`}
      >
        {cart.totalItems}
      </span>
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:gap-x-6"
    >
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={active ? ACTIVE_LINK : INACTIVE_LINK}
          >
            {link.label}
          </Link>
        );
      })}
      
      {/* Cart link with item count badge - isolated in its own component */}
      <CartBadge />
    </nav>
  );
}

// Prerender fallback for the Suspense boundary around <Nav /> in the Header.
// It reads no pathname, so it is safe to prerender on a dynamic route; every
// link renders in its inactive state and the real active styling streams in
// once usePathname() resolves on the client. The markup matches <Nav /> so the
// swap is visually seamless.
export function NavFallback() {
  return (
    <nav
      aria-label="Primary"
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:gap-x-6"
    >
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={INACTIVE_LINK}>
          {link.label}
        </Link>
      ))}
      <Link href="/cart" className={INACTIVE_LINK}>
        Cart
      </Link>
    </nav>
  );
}
