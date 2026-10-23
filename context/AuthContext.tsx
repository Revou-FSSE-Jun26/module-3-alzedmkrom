'use client';

// context/AuthContext.tsx
//
// AuthProvider owns the one piece of session state in the app. Everything else
// reads it through useAuth(). Two rules shape this file:
//
//   1. The persisted session must be read AFTER mount, never during the render
//      that the server also produces, so the server HTML and the first client
//      render agree. Reading localStorage during a plain render would make the
//      client's first paint differ from the server's HTML and trip a hydration
//      mismatch. This is implemented with useSyncExternalStore: its server
//      snapshot is a stable "loading" value, so the server and the client's
//      first render both see isLoading = true; the live store value takes over
//      only after hydration. isLoading covers that first tick, and route guards
//      wait for it rather than bouncing a user who is actually logged in.
//   2. POST /register returns only the user object, no token. So register()
//      chains into login() to obtain a session. If that follow-up login fails,
//      the account exists but the user is not signed in, and the surfaced
//      message says exactly that rather than implying registration failed.

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ReactNode } from 'react';

import { login as apiLogin, register as apiRegister, refreshToken as apiRefreshToken } from '@/lib/api';
import { isSession, readJson, remove, writeJson } from '@/lib/storage';
import { CART_KEY, SESSION_KEY, toUser } from '@/lib/types';
import type { Session, User } from '@/lib/types';

export interface AuthContextValue {
  /** The current session, or null when logged out. */
  session: Session | null;
  /** Convenience accessor: session?.user ?? null. */
  user: User | null;
  /** True until the first localStorage read resolves after hydration. */
  isLoading: boolean;
  /**
   * Authenticates, persists the session, and returns the signed-in user so the
   * caller can route by role.
   */
  login: (email: string, password: string) => Promise<User>;
  /**
   * Registers an account then logs in with the same credentials, returning the
   * signed-in user. Throws if the follow-up login fails, with a message making
   * clear the account was created but sign-in did not succeed.
   */
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<User>;
  /** Clears the session and the cart storage, resetting to a logged-out state. */
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Builds a persisted Session from a raw LoginResponse. The token lifetime
 * arrives as a relative count of seconds (expires_in); it is converted to an
 * absolute epoch-ms timestamp here so expiry survives reloads without
 * re-reading a countdown.
 */
function sessionFromLogin(response: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: Parameters<typeof toUser>[0];
}): Session {
  const now = Date.now();
  // Backend returns expires_in in SECONDS, so multiply by 1000 for milliseconds
  const expiresInMs = response.expires_in * 1000;
  const expiresAt = now + expiresInMs;
  
  console.log(`[Token Refresh] Session created:`);
  console.log(`  - expires_in from API: ${response.expires_in} (raw value)`);
  console.log(`  - expires_in in seconds: ${response.expires_in}s`);
  console.log(`  - expires_in in ms: ${expiresInMs}ms`);
  console.log(`  - now: ${now}`);
  console.log(`  - calculated expiresAt: ${expiresAt}`);
  console.log(`  - time until expiry: ${expiresAt - now}ms (${((expiresAt - now) / 1000).toFixed(0)}s)`);
  
  return {
    token: response.access_token,
    refreshToken: response.refresh_token,
    user: toUser(response.user),
    expiresAt,
  };
}

/**
 * A tiny external store holding the session. useSyncExternalStore reads it with
 * matching server and client-hydration snapshots, so the restore happens
 * outside render and never trips a hydration mismatch.
 *
 * The snapshot is memoised: getClientSnapshot must return a referentially
 * stable value between notifications, or useSyncExternalStore detects a change
 * on every render and loops. So the store caches the current snapshot and only
 * rebuilds it when the session actually changes.
 */
interface AuthSnapshot {
  session: Session | null;
  /** False only once the first client-side read has run. */
  isLoading: boolean;
}

function createAuthStore() {
  const listeners = new Set<() => void>();

  // Loading until the first client read; the server always reports this value.
  let snapshot: AuthSnapshot = { session: null, isLoading: true };
  // Fixed server snapshot: identical across renders so hydration agrees.
  const serverSnapshot: AuthSnapshot = { session: null, isLoading: true };
  let hasRead = false;

  function emit() {
    for (const listener of listeners) listener();
  }

  function setSnapshot(session: Session | null) {
    snapshot = { session, isLoading: false };
    emit();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): AuthSnapshot {
      // The first client read happens lazily, the first time a subscribed
      // component reads the store after hydration — outside any render-phase
      // mutation of React state, so no effect-time setState is involved.
      if (!hasRead) {
        hasRead = true;
        snapshot = { session: readJson(SESSION_KEY, isSession), isLoading: false };
      }
      return snapshot;
    },
    getServerSnapshot(): AuthSnapshot {
      return serverSnapshot;
    },
    setSession(session: Session | null) {
      setSnapshot(session);
    },
  };
}

type AuthStore = ReturnType<typeof createAuthStore>;

export function AuthProvider({ children }: { children: ReactNode }) {
  // One store instance per provider mount, kept stable across renders via the
  // lazy initialiser so it is created exactly once and safe to read in render.
  const [store] = useState<AuthStore>(createAuthStore);

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const response = await apiLogin(email, password);
      const next = sessionFromLogin(response);
      writeJson(SESSION_KEY, next);
      store.setSession(next);
      return next.user;
    },
    [store],
  );

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
    ): Promise<User> => {
      // POST /register returns only the user object, so the account exists
      // after this resolves even though we hold no token yet.
      await apiRegister(username, email, password);

      // Chain into login to obtain a session. If this step fails the account
      // was still created, so the message must not imply registration failed.
      try {
        return await login(email, password);
      } catch {
        throw new Error(
          'Your account was created, but we could not sign you in automatically. Please log in.',
        );
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    // Clearing the cart on logout is why AuthProvider wraps CartProvider:
    // the auth event owns the cart teardown, not the reverse.
    remove(SESSION_KEY);
    remove(CART_KEY);
    store.setSession(null);
  }, [store]);

  // Refresh the token when it's close to expiry. The backend auto-refreshes
  // tokens when the user is active, so we proactively refresh before expiry
  // to keep the session alive. Check every 10 seconds if a refresh is needed.
  //
  // The interval must read the CURRENT session from the store on each check,
  // not rely on a closure-captured snapshot. We set up the interval on mount
  // and never tear it down, letting the check function itself decide whether
  // to refresh based on the current store state.
  useEffect(() => {
    console.log('[Token Refresh] Effect setup, initializing token refresh interval');

    const checkAndRefresh = async () => {
      // Read the current session from the store, not from closure
      const currentSession = store.getSnapshot().session;
      
      // If session was cleared (logged out), skip this check
      if (!currentSession?.token) {
        console.log(`[Token Refresh] No active session, skipping refresh`);
        return;
      }
      
      const now = Date.now();
      const timeUntilExpiry = currentSession.expiresAt - now;
      
      // Log for debugging
      console.log(`[Token Refresh] Now: ${now}, ExpiresAt: ${currentSession.expiresAt}, Time until expiry: ${timeUntilExpiry}ms (${(timeUntilExpiry / 1000).toFixed(0)}s)`);
      
      // Refresh when token has less than 5 minutes remaining (300000 ms)
      // This keeps the session actively refreshed throughout the user's browsing
      if (timeUntilExpiry < 300000) {
        console.log(`[Token Refresh] Refreshing token (expiring in ${timeUntilExpiry}ms)`);
        try {
          console.log(`[Token Refresh] Calling apiRefreshToken with refresh token: ${currentSession.refreshToken.substring(0, 20)}...`);
          const response = await apiRefreshToken(currentSession.refreshToken);
          console.log(`[Token Refresh] Refresh API response:`, response);
          
          const next: Session = {
            token: response.access_token,
            refreshToken: response.refresh_token,
            user: currentSession.user, // User doesn't change on refresh
            expiresAt: now + response.expires_in * 1000,
          };
          console.log(`[Token Refresh] Token refreshed successfully. New expiry: ${next.expiresAt}, New token: ${next.token.substring(0, 20)}...`);
          writeJson(SESSION_KEY, next);
          store.setSession(next);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[Token Refresh] Refresh failed: ${errorMessage}`);
          
          // Only log out on actual failure, not invalid token (which might be recoverable)
          // Check if it's a 401 Unauthorized or similar auth error
          if (error instanceof Error && (errorMessage.includes('401') || errorMessage.includes('Unauthorized'))) {
            console.log(`[Token Refresh] Token unauthorized, logging out`);
            logout();
          } else {
            console.log(`[Token Refresh] Refresh error is recoverable, keeping session alive`);
          }
        }
      }
    };

    // Check immediately on effect setup
    console.log('[Token Refresh] Running initial check');
    checkAndRefresh();
    
    // Then check every 10 seconds
    const interval = setInterval(() => {
      console.log('[Token Refresh] Running interval check');
      checkAndRefresh();
    }, 10000);
    
    console.log('[Token Refresh] Interval started, ID:', interval);
    
    return () => {
      console.log('[Token Refresh] Cleaning up interval');
      clearInterval(interval);
    };
  }, [store, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: snapshot.session,
      user: snapshot.session?.user ?? null,
      isLoading: snapshot.isLoading,
      login,
      register,
      logout,
    }),
    [snapshot, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
