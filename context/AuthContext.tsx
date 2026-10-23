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
  expires_in: number;
  user: Parameters<typeof toUser>[0];
}): Session {
  return {
    token: response.access_token,
    user: toUser(response.user),
    expiresAt: Date.now() + response.expires_in * 1000,
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
  // not rely on a closure-captured snapshot, because the snapshot changes
  // every time the token is refreshed. If we captured snapshot.session once,
  // the interval would use stale expiresAt and never refresh when needed.
  useEffect(() => {
    if (!snapshot.session?.token) return; // Not logged in

    const checkAndRefresh = async () => {
      // Read the current session from the store, not from closure
      const currentSession = store.getSnapshot().session;
      
      // If session was cleared (logged out), stop checking
      if (!currentSession?.token) return;
      
      const now = Date.now();
      const timeUntilExpiry = currentSession.expiresAt - now;
      // Refresh if expiring within 1 minute (60000 ms)
      if (timeUntilExpiry < 60000) {
        try {
          const response = await apiRefreshToken(currentSession.token);
          const next: Session = {
            token: response.access_token,
            user: currentSession.user, // User doesn't change on refresh
            expiresAt: now + response.expires_in * 1000,
          };
          writeJson(SESSION_KEY, next);
          store.setSession(next);
        } catch (error) {
          // Refresh failed; token has expired. Log out the user.
          logout();
        }
      }
    };

    const interval = setInterval(checkAndRefresh, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [store, logout]); // Only depend on store and logout, not snapshot.session

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
