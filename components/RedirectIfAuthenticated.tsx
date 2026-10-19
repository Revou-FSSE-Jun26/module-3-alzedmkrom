// components/RedirectIfAuthenticated.tsx
//
// A thin Client Component wrapper for the auth pages (/login, /register). It
// runs useRedirectIfAuthenticated and renders its children only once the
// visitor is confirmed logged out. While the session read is still resolving,
// or while a logged-in visitor is being redirected away, it renders nothing —
// so the form never flashes before the redirect fires.
//
// This exists so the page.tsx files can stay thin server components: they
// compose this wrapper around the form rather than each becoming a client
// component and repeating the guard logic.

'use client';

import type { ReactNode } from 'react';

import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';

export default function RedirectIfAuthenticated({
  children,
}: {
  children: ReactNode;
}) {
  const { checking } = useRedirectIfAuthenticated();

  // Render nothing until we are certain the visitor is logged out, so an
  // already-signed-in visitor never sees a flash of the auth form.
  if (checking) return null;

  return <>{children}</>;
}
