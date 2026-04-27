/**
 * /control-room layout — shared nav for all control-room sub-routes.
 *
 * Gated by proxy.ts basic-auth. This layout is a minimal scaffold that will
 * be replaced by the full UCC T18 port (Dashboard.jsx → layout.tsx) in a
 * subsequent PR. For now it provides the nav link structure so that
 * /control-room/framework (M4/PR-7) has a proper navigation context.
 *
 * Excluded from sitemap + robots (see src/app/sitemap.ts + robots.ts).
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Control room — fitme-story',
  description: 'Internal dashboard for FitMe framework operations. Gated access.',
  robots: { index: false, follow: false },
};

const CONTROL_ROOM_NAV = [
  { href: '/control-room', label: 'Overview', exact: true },
  { href: '/control-room/framework', label: 'Framework Health' },
];

export default function ControlRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-950)]">
      {/* Control-room sub-nav */}
      <nav
        className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)]"
        aria-label="Control room navigation"
      >
        <div className="max-w-5xl mx-auto px-6 py-0 flex items-center gap-1">
          <span className="mr-4 text-xs font-sans font-semibold text-[var(--color-neutral-500)] uppercase tracking-widest py-3 select-none">
            Control room
          </span>
          {CONTROL_ROOM_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center min-h-[44px] px-3 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:text-[var(--color-brand-indigo)] border-b-2 border-transparent hover:border-[var(--color-brand-indigo)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Page content */}
      {children}
    </div>
  );
}
