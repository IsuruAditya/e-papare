import React from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Landing } from '../pages/Landing';
import { NotFound } from '../pages/NotFound';
import { RolePlaceholder } from '../pages/RolePlaceholder';
import type { Role } from '../auth/AuthContext';

/**
 * Route tree (EXPERIENCE.md Surface Map). Story 1.7 ships the shell and the
 * role-root skeleton only:
 *   - `/`            public Landing/Login
 *   - `/student` …   role roots, each guarded by `ProtectedRoute` and mounted in
 *                    the `AppLayout` shell, rendering a placeholder dashboard
 *   - `*`            NotFound
 *
 * Deeper feature routes are added by their epics. `createBrowserRouter` is
 * exported via a factory so tests can supply a memory router with seeded auth.
 */

const roleRoots: { path: string; role: Role }[] = [
  { path: '/student', role: 'STUDENT' },
  { path: '/teacher', role: 'TEACHER' },
  { path: '/finance', role: 'FINANCE_ADMIN' },
  { path: '/admin', role: 'ADMINISTRATOR' },
  { path: '/owner', role: 'SUPER_ADMINISTRATOR' },
];

function roleBranch({ path, role }: { path: string; role: Role }): RouteObject {
  return {
    path,
    element: <ProtectedRoute role={role} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <RolePlaceholder role={role} /> },
          // Story 1.7 ships only the role-root placeholder; the deeper feature
          // routes arrive with their epics (3–8). Until then, any in-role
          // sub-path (the nav-config advertises several) resolves to the same
          // placeholder INSIDE the shell — so a nav link never dead-ends on the
          // bare top-level 404. The real routes replace this wildcard per epic.
          { path: '*', element: <RolePlaceholder role={role} /> },
        ],
      },
    ],
  };
}

export const routes: RouteObject[] = [
  { path: '/', element: <Landing /> },
  ...roleRoots.map(roleBranch),
  { path: '*', element: <NotFound /> },
];

export function createAppRouter(): ReturnType<typeof createBrowserRouter> {
  return createBrowserRouter(routes);
}
