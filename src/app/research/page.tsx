import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research — fitme-story',
  description: 'SoC-on-software, hardware-aware dispatch, and where the framework points next.',
};

type ResearchItem = {
  title: string;
  body: string;
  href: string;
  external?: boolean;
};

const RESEARCH: ResearchItem[] = [
  {
    title: 'SoC-on-Software Architecture',
    body: '7 hardware principles applied to software frameworks. Foundation for v5.0.',
    href: '/case-studies/soc-on-software',
  },
  {
    title: 'V7.0 HADF (Hardware-Aware Dispatch)',
    body: '17 chip profiles, 7 cloud signatures, Mahalanobis-distance fingerprinting.',
    href: '/case-studies/hadf',
  },
  {
    title: 'Parallel Write Safety',
    body: 'Deterministic isolation via snapshot/rollback + 3-tier mirror pattern.',
    href: '/case-studies/parallel-write-safety',
  },
  {
    title: 'Framework → Hardware mapping',
    body: '1:1 mapping from v5.0–v5.2 components to chip units with open-source building blocks.',
    href: 'https://github.com/Regevba/fitme-showcase/blob/main/05-research/framework-to-hardware.md',
    external: true,
  },
  {
    title: 'Orchid — AI Orchestration Accelerator',
    body: '26K+ simulation runs, 6 experiments, design space findings.',
    href: 'https://github.com/Regevba/fitme-showcase/blob/main/05-research/orchid-accelerator.md',
    external: true,
  },
];

export default function ResearchPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The research frontier</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Where the framework pointed next — and what a fitness app had to do with chip design.
        </p>
      </header>
      <ul className="space-y-6">
        {RESEARCH.map((r) => {
          const cls = "group block p-5 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)]";
          const inner = (
            <>
              <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">{r.title}</h2>
              <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">{r.body}</p>
            </>
          );
          return (
            <li key={r.title}>
              {r.external ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <Link href={r.href} className={cls}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
