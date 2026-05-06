'use client';

/**
 * TrackedNavLink — UCC T36 Phase 2 client island.
 *
 * Wraps Next.js `<Link>` to fire the GA4 `dashboard_view_change` event on
 * click. Resolves the `from_view` from the current pathname; the parent
 * passes the destination `to_view`. Both ends fall back to `'external'`
 * when the route doesn't map onto the 6 known control-room routes (e.g.
 * the `/case-studies` link in SECONDARY_NAV — it leaves the dashboard).
 *
 * Usage in `layout.tsx`:
 *   <TrackedNavLink href={item.href} toView={routeKeyFor(item.href)}
 *     className="..." aria-disabled={...}> {item.label} </TrackedNavLink>
 *
 * Pure client wrapper — does not change visual chrome. The disabled link
 * variant (placeholder routes) still works because we forward `aria-disabled`,
 * `tabIndex`, and `title` props verbatim.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  trackViewChange,
  type ControlRoomRoute,
  type DashboardViewChangeEvent,
} from '@/lib/control-room/analytics';

const ROUTE_KEY_BY_PATH: Record<string, ControlRoomRoute> = {
  '/control-room': 'overview',
  '/control-room/board': 'board',
  '/control-room/table': 'table',
  '/control-room/tasks': 'tasks',
  '/control-room/knowledge': 'knowledge',
  '/control-room/framework': 'framework',
};

function routeKeyForPath(path: string | null): DashboardViewChangeEvent['from_view'] {
  if (!path) return 'external';
  return ROUTE_KEY_BY_PATH[path] ?? 'external';
}

export interface TrackedNavLinkProps {
  href: string;
  /** The destination route key. `'external'` for off-dashboard links. */
  toView: DashboardViewChangeEvent['to_view'];
  className?: string;
  'aria-disabled'?: boolean;
  tabIndex?: number;
  title?: string;
  children: ReactNode;
}

export function TrackedNavLink({
  href,
  toView,
  className,
  'aria-disabled': ariaDisabled,
  tabIndex,
  title,
  children,
}: TrackedNavLinkProps) {
  const pathname = usePathname();
  const fromView = routeKeyForPath(pathname);

  const handleClick = () => {
    if (ariaDisabled) return;
    if (fromView === toView) return; // don't fire on no-op same-route clicks
    trackViewChange({ from_view: fromView, to_view: toView });
  };

  return (
    <Link
      href={href}
      className={className}
      aria-disabled={ariaDisabled}
      tabIndex={tabIndex}
      title={title}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
