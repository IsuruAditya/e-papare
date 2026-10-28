import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * AuthContext — UI-state auth stub (AD-18).
 *
 * Story 1.7 scope: hold the access token + role as UI state so `ProtectedRoute`
 * and the role-scoped navigation can read them. It is DELIBERATELY unauthenticated
 * by default and reads NOTHING from storage.
 *
 * NOT in scope (Epic 2): login/registration/activation UI, real JWT issuance,
 * refresh-cookie handling, and `PATCH /users/me/preferences` sync. Do not add
 * fake production authentication or persist tokens here — the `setSession` seam
 * exists for tests and for Epic 2's real auth flow to call.
 */

/** The five roles (EXPERIENCE.md). The shared-types/Prisma enum arrives in Story 2.1. */
export type Role =
  'STUDENT' | 'TEACHER' | 'FINANCE_ADMIN' | 'ADMINISTRATOR' | 'SUPER_ADMINISTRATOR';

export interface Session {
  /** Short-lived JWT access token (Authorization header). Never persisted here. */
  token: string;
  role: Role;
}

export interface AuthContextValue {
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  /** Establish a session (Epic 2 login / tests). */
  setSession: (session: Session) => void;
  /** Clear the session (logout / tests). */
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  /** Test seam: start with a seeded session instead of unauthenticated. */
  initialSession?: Session | null;
}

export function AuthProvider({
  children,
  initialSession = null,
}: AuthProviderProps): React.JSX.Element {
  const [session, setSessionState] = useState<Session | null>(initialSession);

  const setSession = useCallback((next: Session) => {
    setSessionState(next);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.token ?? null,
      role: session?.role ?? null,
      isAuthenticated: session !== null,
      setSession,
      clearSession,
    }),
    [session, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access auth state. Throws outside an `AuthProvider` (fail fast). */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
