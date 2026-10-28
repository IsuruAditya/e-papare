import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Move keyboard focus to the main region's heading on every route change
 * (EXPERIENCE.md Focus Management: "focus moves to page heading on route
 * change"). Attach the returned ref to the `<main>` landmark; on each pathname
 * change this focuses the first `<h1>` inside it (pages render a `tabIndex=-1`
 * heading), falling back to the main element itself.
 *
 * The first render is skipped so initial load does not steal focus from the
 * skip link (which must be the first Tab stop).
 */
export function useRouteFocus<T extends HTMLElement>(): React.RefObject<T> {
  const ref = useRef<T>(null);
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const container = ref.current;
    if (!container) return;
    const heading = container.querySelector<HTMLElement>('h1');
    (heading ?? container).focus();
  }, [pathname]);

  return ref;
}
