// app/cart/layout.tsx
//
// A thin Server Component layout whose only job is to set the tab title for the
// /cart route. The page itself is a Client Component ('use client'), which
// cannot export `metadata`, so the title lives here and the page renders as
// this layout's child.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Cart' };

export default function CartLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
