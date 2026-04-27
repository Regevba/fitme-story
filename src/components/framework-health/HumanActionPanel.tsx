/**
 * HumanActionPanel — T24
 * Surfaces D1 and D2: the two framework gaps that cannot be closed mechanically.
 */

import { ExternalLink } from 'lucide-react';

interface DeferredItem {
  id: string;
  title: string;
  why: string;
  status: string;
  statusDoc?: string;
  externalLink?: { href: string; label: string };
}

const DEFERRED_ITEMS: DeferredItem[] = [
  {
    id: 'D1',
    title: 'Tier 2.1 — Real-provider auth playbook',
    why: 'Requires a human at a physical device running the iOS simulator with live Supabase credentials. No CI agent can substitute for in-person auth flow verification.',
    status: 'Playbook written; execution pending human operator session',
    statusDoc: 'docs/setup/auth-runtime-verification-playbook.md',
  },
  {
    id: 'D2',
    title: 'Tier 3.3 — External replication',
    why: 'Requires an external operator — someone outside this project — to independently reproduce the measurement results. Cannot be self-certified.',
    status: 'Open invitation filed as GitHub issue #142',
    externalLink: {
      href: 'https://github.com/Regevba/FitTracker2/issues/142',
      label: 'Issue #142 — External replication invitation',
    },
  },
];

function DeferredCard({ item }: { item: DeferredItem }) {
  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-sans font-bold text-xs shrink-0">
          {item.id}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans font-semibold text-sm text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] font-sans leading-relaxed">
            {item.why}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
              Status: {item.status}
            </span>
            {item.statusDoc && (
              <span className="text-xs font-mono text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-500)]">
                {item.statusDoc}
              </span>
            )}
            {item.externalLink && (
              <a
                href={item.externalLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-sans text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {item.externalLink.label}
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HumanActionPanel() {
  return (
    <div>
      <div className="mb-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 px-4 py-3">
        <p className="text-sm font-sans text-amber-900 dark:text-amber-100">
          <strong>Mechanically unclosable.</strong> These 2 items require human or external action —
          no pre-commit hook or CI job can substitute. A system that knows what it cannot check is
          more trustworthy than one that pretends every check is a check.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {DEFERRED_ITEMS.map((item) => (
          <DeferredCard key={item.id} item={item} />
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--color-neutral-500)] font-sans">
        Full enumeration:{' '}
        <span className="font-mono">docs/case-studies/meta-analysis/unclosable-gaps.md</span> in
        the FitTracker2 repo. v7.6 closed the mechanically closable gaps; these 2 are genuinely
        out-of-reach for automation.
      </p>
    </div>
  );
}
