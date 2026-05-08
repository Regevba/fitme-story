import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

// PredecessorChain — typed v7.5 → v7.6 → v7.7 chain, replacing the
// ad-hoc prose chains rebuilt every time. Closes audit CS-014 + CS-024.
//
// MDX usage:
//   <PredecessorChain
//     chain={[
//       { version: 'v7.5', slug: 'data-integrity-framework-v7-5', focus: 'cooperating defenses' },
//       { version: 'v7.6', slug: 'mechanical-enforcement-v7-6', focus: 'Class B → A promotions' },
//       { version: 'v7.7', slug: 'framework-v7-7-validity-closure', focus: 'gap closure' },
//       { version: 'v7.8', slug: 'framework-v7-8-bridge', focus: 'bridge mechanisms A–F' },
//       { version: 'v7.8.1', slug: 'framework-v7-8-branch-isolation', focus: 'branch isolation + closure completeness' },
//     ]}
//   />
//
// Renders horizontally on md+ with chevrons between items; vertically
// stacked with arrows-down on mobile.
export interface PredecessorChainItem {
  version: string;
  slug: string;
  focus: string;
}

export function PredecessorChain({ chain }: { chain: PredecessorChainItem[] }) {
  if (!chain || chain.length === 0) return null;
  return (
    <nav
      aria-label="Predecessor chain"
      className="not-prose my-6 rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] p-5"
    >
      <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)] mb-3">
        Predecessor chain
      </div>
      <ol className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2 md:gap-1">
        {chain.map((item, i) => (
          <li
            key={item.slug}
            className="flex md:flex-row items-center gap-2 md:gap-1"
          >
            <Link
              href={`/case-studies/${item.slug}`}
              className="inline-flex flex-col rounded border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] bg-white dark:bg-[var(--color-neutral-900)] px-3 py-2 hover:border-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
            >
              <span className="font-mono text-xs text-[var(--color-brand-indigo)] font-semibold">
                {item.version}
              </span>
              <span className="font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                {item.focus}
              </span>
            </Link>
            {i < chain.length - 1 ? (
              <ChevronRight
                size={16}
                aria-hidden="true"
                className="shrink-0 text-[var(--color-neutral-500)] rotate-90 md:rotate-0"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
