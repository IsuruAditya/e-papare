import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type Role } from '../auth/AuthContext';
import { AccessRestricted } from '../pages/AccessRestricted';

/**
 * Route guard (Story 1.7 AC-1 + five-role scoping).
 *
 *   - Unauthenticated → redirect to `/` with the attempted path preserved as
 *     `?returnUrl=<path>` (so a future real login can send the user back).
 *   - Authenticated but wrong role → render `AccessRestricted` (never the target
 *     role's surface or nav).
 *   - Authenticated with the required role → render the nested routes.
 *
 * Used as a layout route wrapping each role's subtree via `<Outlet>`.
 */
export interface ProtectedRouteProps {
  role: Role;
}

export function ProtectedRoute({ role }: ProtectedRouteProps): React.JSX.Element {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/?returnUrl=${returnUrl}`} replace />;
  }

  if (currentRole !== role) {
    return <AccessRestricted />;
  }

  return <Outlet />;
}
