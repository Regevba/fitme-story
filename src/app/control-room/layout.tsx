/**
 * /control-room layout — UCC T18 port (Dashboard.jsx → layout.tsx).
 *
 * Replaces the minimal scaffold (shipped 2026-04-27) with the full chrome
 * port from `dashboard/src/components/Dashboard.jsx`:
 *   - Brand icon (orange→blue gradient) + title + version + Maintenance badge
 *   - Primary nav (5 views: Overview, Board, Table, Tasks, Knowledge)
 *   - Secondary nav (Framework Health)
 *   - GitHub external link
 *   - Children slot for per-route page content
 *
 * Gated by `proxy.ts` basic-auth. Excluded from sitemap + robots.
 *
 * NOT YET WIRED (deferred to T20-T28 implementation):
 *   - StatPill counts (Open/Active/Closed) — needs builder.ts data load (T31 shipped, wiring TBD)
 *   - Workspaces dropdown (secondary views: research console, figma handoff) — routes don't exist
 *   - AlertsBanner slot — T24
 *   - PipelineOverview slot — T27
 *   - ThemeToggle — fitme-story uses system-pref dark mode; explicit toggle deferred
 *
 * The version badge is hardcoded to v7.8 for now; T20 will server-load
 * framework_version from the builder.ts framework manifest.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Control room — fitme-story',
  description: 'Internal dashboard for FitMe framework operations. Gated access.',
  robots: { index: false, follow: false },
};

interface NavItem {
  href: string;
  label: string;
  /** When true, this route is fully built; when false, link still works but page is a placeholder */
  built?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { href: '/control-room', label: 'Overview', built: true },
  { href: '/control-room/board', label: 'Board', built: true },
  { href: '/control-room/table', label: 'Table', built: true },
  { href: '/control-room/tasks', label: 'Tasks', built: false },
  { href: '/control-room/knowledge', label: 'Knowledge', built: false },
];

const SECONDARY_NAV: NavItem[] = [
  { href: '/control-room/framework', label: 'Framework Health', built: true },
];

// TODO(T20): replace hardcoded version with server-loaded value from builder.ts
const FRAMEWORK_VERSION = 'v7.8';

export default function ControlRoomLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-950)]">
      {/* ────────────────────────────────────────────────────────── */}
      {/* Header — brand icon + title + version + Maintenance badge */}
      {/* ────────────────────────────────────────────────────────── */}
      <header className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)]">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: brand icon + title block */}
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FA8F40_0%,#FFD39F_45%,#8AC7FF_100%)] shadow-[0_12px_30px_rgba(250,143,64,0.35)]"
                aria-hidden="true"
              >
                <span className="text-sm font-bold text-slate-950">FM</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    FitMe Operations Control Room
                  </h1>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/8 dark:text-white/55">
                    Maintenance mode
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/8 dark:text-white/55">
                    PM-flow {FRAMEWORK_VERSION}
                  </span>
                </div>
                <p className="mt-1 max-w-2xl font-sans text-sm leading-6 text-slate-500 dark:text-white/52">
                  Delivery, PM truth, design handoff, research workspaces, and case-study monitoring in one operational
                  surface.
                </p>
              </div>
            </div>

            {/* Right: GitHub link (deferred: stat pills + theme toggle) */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://github.com/Regevba/FitTracker2"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 font-sans text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/55 dark:hover:text-white sm:block"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Primary + secondary nav */}
      {/* ────────────────────────────────────────────────────────── */}
      <nav
        className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)]"
        aria-label="Control room navigation"
      >
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-1 px-4 sm:px-6 lg:px-8">
          {/* Primary views */}
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.built ? item.href : '#'}
              className={`inline-flex min-h-[44px] items-center px-3 font-sans text-sm transition-colors ${
                item.built
                  ? 'text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:text-[var(--color-brand-indigo)] border-b-2 border-transparent hover:border-[var(--color-brand-indigo)]'
                  : 'text-[var(--color-neutral-400)] dark:text-[var(--color-neutral-500)] cursor-not-allowed border-b-2 border-transparent'
              }`}
              aria-disabled={!item.built}
              tabIndex={item.built ? 0 : -1}
              title={item.built ? undefined : 'Coming soon — placeholder until T20-T28 ship'}
            >
              {item.label}
              {!item.built && (
                <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-white/8 dark:text-white/45">
                  soon
                </span>
              )}
            </Link>
          ))}

          {/* Visual separator before secondary nav */}
          <div
            aria-hidden="true"
            className="mx-2 h-6 w-px bg-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-700)]"
          />

          {/* Secondary nav (Framework Health, etc.) */}
          {SECONDARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-[44px] items-center px-3 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:text-[var(--color-brand-indigo)] border-b-2 border-transparent hover:border-[var(--color-brand-indigo)] transition-colors"
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
