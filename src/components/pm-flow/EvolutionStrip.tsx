import Link from 'next/link';

interface Milestone {
  version: string;
  date: string;
  headline: string;
  what: string;
  caseStudyHref: string;
  tintVar: string;   // var(--skill-xxx) to tint the milestone chip
}

const MILESTONES: Milestone[] = [
  {
    version: 'v1.0',
    date: '2026-04-02',
    headline: 'Monolithic /pm-workflow',
    what: 'A single skill did everything inline — research, PRD, UX, code review, testing, docs. The ecosystem was one very large file.',
    caseStudyHref: '/case-studies/onboarding-pilot',
    tintVar: 'var(--skill-pm-workflow)',
  },
  {
    version: 'v2.0',
    date: '2026-04-07',
    headline: '/ux splits from /design',
    what: 'First spoke extracted. /ux owns what & why; /design owns how it looks. Signal that the monolith could decompose.',
    caseStudyHref: '/case-studies/onboarding-pilot',
    tintVar: 'var(--skill-ux)',
  },
  {
    version: 'v4.3',
    date: '2026-04-11',
    headline: 'Hub-and-spoke topology formalized',
    what: '6 refactors validated the pattern. 6.5× measured speedup vs. the monolith. 11 skills in the topology.',
    caseStudyHref: '/case-studies/framework-evolution',
    tintVar: 'var(--color-brand-indigo)',
  },
  {
    version: 'v5.0',
    date: '2026-04-14',
    headline: 'SoC-on-software',
    what: 'Skill-on-demand loading + cache compression. ~54K context tokens reclaimed. Chip architecture principles applied to software.',
    caseStudyHref: '/case-studies/soc-on-software',
    tintVar: 'var(--skill-research)',
  },
  {
    version: 'v5.2',
    date: '2026-04-16',
    headline: 'Dispatch intelligence + write safety',
    what: '3-stage pre-flight: complexity scoring → model routing → tool budgets. Snapshot/rollback + mirror pattern for parallel writes.',
    caseStudyHref: '/case-studies/dispatch-intelligence',
    tintVar: 'var(--skill-qa)',
  },
  {
    version: 'v6.1',
    date: '2026-04-16',
    headline: 'HADF — hardware-aware dispatch',
    what: '17 chip profiles + 7 cloud signatures. Mahalanobis fingerprinting picks the right model tier for the detected environment.',
    caseStudyHref: '/case-studies/hadf',
    tintVar: 'var(--skill-analytics)',
  },
];

export function EvolutionStrip() {
  return (
    <div className="my-8 overflow-x-auto pb-4" aria-label="Evolution of the skill ecosystem">
      <ol className="flex gap-4 min-w-min">
        {MILESTONES.map((m) => (
          <li key={m.version} className="min-w-[260px] max-w-[300px] shrink-0">
            <Link
              href={m.caseStudyHref}
              className="block group rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4 hover:border-[var(--color-brand-indigo)] hover:shadow-md transition-all bg-white dark:bg-[var(--color-neutral-900)]"
              style={{ borderTop: `4px solid ${m.tintVar}` }}
            >
              <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
                {m.version} · {m.date}
              </div>
              <div className="mt-1 font-serif text-base leading-tight group-hover:text-[var(--color-brand-indigo)]">
                {m.headline}
              </div>
              <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                {m.what}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
