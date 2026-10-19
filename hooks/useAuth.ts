// hooks/useAuth.ts
//
// The single entry point every component uses to read auth state. It reads the
// context and throws a clear error when used outside AuthProvider, so a missing
// provider surfaces as an explicit message at the call site rather than a
// confusing "cannot read property of null" deeper in the component.

import { useContext } from 'react';

import { AuthContext } from '@/context/AuthContext';
import type { AuthContextValue } from '@/context/AuthContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
