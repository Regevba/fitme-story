/**
 * /control-room — Overview page (scaffold).
 *
 * This is a minimal placeholder that will be replaced by the full UCC T20
 * port (ControlRoom.jsx → page.tsx with Hero + NumbersPanel) in a subsequent
 * PR. Its purpose here is to make the /control-room route serve a valid page
 * so the layout and nav work correctly during the M4/PR-7 framework-health
 * dashboard development.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Overview — Control room',
  robots: { index: false, follow: false },
};

const QUICK_LINKS = [
  {
    href: '/control-room/framework',
    label: 'Framework Health',
    description:
      'Tier 1.1 adoption trend, documentation-debt coverage, automation map, and 72h integrity cycle snapshot.',
    badge: 'v7.7',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  },
];

export default function ControlRoomPage() {
  return (
    <article className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">Control room</h1>
        <p className="mt-3 text-lg text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] font-sans max-w-2xl">
          Internal operations dashboard for the FitMe PM framework. Full UCC migration in progress
          — M4/PR-7 framework-health dashboard is the first live module.
        </p>
      </header>

      <div className="grid gap-4">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group block rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-5 hover:border-[var(--color-brand-indigo)] hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-sans font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] group-hover:text-[var(--color-brand-indigo)]">
                    {link.label}
                  </h2>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-medium ${link.badgeColor}`}
                  >
                    {link.badge}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] font-sans">
                  {link.description}
                </p>
              </div>
              <ArrowRight
                size={20}
                className="text-[var(--color-neutral-400)] group-hover:text-[var(--color-brand-indigo)] shrink-0 mt-0.5 transition-colors"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-[var(--color-neutral-400)] font-sans">
        Full dashboard migration (UCC T18–T39) in progress. This page is a scaffold that will
        be replaced by the complete port of the Astro control center in a subsequent PR.
      </p>
    </article>
  );
}
