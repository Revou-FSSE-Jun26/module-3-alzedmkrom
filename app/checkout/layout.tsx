// app/checkout/layout.tsx
//
// A thin Server Component layout that sets the tab title for the /checkout
// route, since the page is a Client Component and cannot export `metadata`.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Checkout' };

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
