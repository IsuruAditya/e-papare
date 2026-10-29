import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SkipLink } from '../../components/ui/SkipLink';
import { useAuth } from '../auth/AuthContext';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Drawer } from './Drawer';
import { BottomNav } from './BottomNav';
import { useRouteFocus } from './useRouteFocus';

/**
 * Authenticated app shell (DESIGN.md "Layout Architecture"). Composes the skip
 * link, topbar, responsive navigation, and the `<main id="main-content">`
 * landmark that hosts the routed page via `<Outlet>`.
 *
 * Responsive behavior:
 *   - Desktop (≥1024px / `lg`): persistent `Sidebar`; no hamburger.
 *   - Tablet + non-Student mobile: topbar hamburger opens the `Drawer`.
 *   - Student mobile (<768px / `md`): fixed `BottomNav`.
 *
 * Rendered only under a `ProtectedRoute`, so `role` is always present; a
 * defensive guard keeps TypeScript honest and avoids a crash if misused.
 */
export interface AppLayoutProps {
  /**
   * Content to render in the main region. Normally omitted: routed pages arrive
   * via the router `<Outlet>`. The dev-only dashboard preview passes its content
   * directly as `children` so it can mount the shell without a router outlet
   * (it supplies its own nested AuthProvider). Production routing is unaffected.
   */
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps = {}): React.JSX.Element | null {
  const { t } = useTranslation('common');
  const { role } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRouteFocus<HTMLElement>();

  if (role === null) return null;

  const isStudent = role === 'STUDENT';

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <SkipLink>{t('skipLink')}</SkipLink>

      <Topbar showMenuButton onOpenMenu={() => setDrawerOpen(true)} />

      <div className="flex flex-1">
        <Sidebar role={role} />

        <main id="main-content" ref={mainRef} tabIndex={-1} className={cxMain(isStudent)}>
          <div className="mx-auto w-full max-w-[1200px]">{children ?? <Outlet />}</div>
        </main>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} role={role} />

      {/* Student-only mobile bottom nav; hidden at md+ by the component itself. */}
      {isStudent && <BottomNav />}
    </div>
  );
}

/**
 * Main-region padding (DESIGN.md): desktop `20px 24px`; mobile `14px` with extra
 * bottom space for the Student bottom nav (safe-area aware). Non-student roles
 * have no bottom nav, so they keep the standard mobile padding.
 */
function cxMain(isStudent: boolean): string {
  const base = 'flex-1 overflow-y-auto p-[14px] lg:px-6 lg:py-5';
  if (!isStudent) return base;
  // Reserve space for the 60px bottom nav + safe-area inset on mobile only.
  return `${base} pb-[max(74px,calc(60px+env(safe-area-inset-bottom)))] md:pb-[14px] lg:pb-5`;
}
