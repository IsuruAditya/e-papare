import React from 'react';
import { AuthProvider } from '../../app/auth/AuthContext';
import { AppLayout } from '../../app/layout/AppLayout';
import { StudentDashboardPreview } from './StudentDashboardPreview';

/**
 * Dev-only preview host for the Student Dashboard.
 *
 * ── Isolation (task §5) ────────────────────────────────────────────────────
 * This route is registered ONLY when `import.meta.env.DEV` is true (see
 * `routes.tsx`); Vite statically replaces that flag with `false` in production
 * builds, so the entire branch — and this component — is tree-shaken out of the
 * production bundle. There is no way to reach `/preview/*` in production.
 *
 * To render the real shell chrome (student nav, topbar) WITHOUT weakening the
 * real `ProtectedRoute`, the preview mounts its OWN nested `AuthProvider` seeded
 * with a throwaway STUDENT session. This is the sanctioned test/preview seam on
 * `AuthProvider` (see its doc comment) — it overrides auth state only for this
 * subtree and never persists a token or exposes a fake session to the real
 * `/student` route, which still requires genuine Epic-2 auth.
 *
 * `AppLayout` reads the role from this nested provider and renders the Student
 * sidebar/bottom-nav; the preview dashboard is rendered as its single child
 * instead of the router `<Outlet>` content.
 */
export function PreviewRoute(): React.JSX.Element {
  return (
    <AuthProvider initialSession={{ token: 'preview-demo', role: 'STUDENT' }}>
      <AppLayout>
        <StudentDashboardPreview />
      </AppLayout>
    </AuthProvider>
  );
}
