import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlueprintOverlay } from '@/components/bespoke/BlueprintOverlay';
import { Card } from '@/components/ui/Card';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'The framework',
  description: 'Eight floors of an AI-orchestrated PM framework, explained layer by layer.',
  slug: '/framework',
});

type Floor = {
  n: number;
  title: string;
  summary: React.ReactNode;
  href?: string;
  hrefLabel?: string;
};

const FLOORS: Floor[] = [
  {
    n: 1,
    title: 'State',
    summary: (
      <>
        Source of truth — <code>state.json</code> per feature, integrity ledgers, append-only checkpoint logs.
      </>
    ),
  },
  {
    n: 2,
    title: 'Skill ecosystem',
    summary: (
      <>
        <strong>12 skills</strong> since 2026-05-14 (1 hub + 11 spokes; was 11 through v7.8.4) plus their L1 / L2 / L3 cache tiers.
      </>
    ),
    href: '/pm-flow',
    hrefLabel: 'See the skills',
  },
  {
    n: 3,
    title: 'Skill-on-demand loading (v5.0)',
    summary: (
      <>
        SoC primitive: load only the <code>SKILL.md</code> files the current phase needs — reclaims ~30K tokens per session.
      </>
    ),
  },
  {
    n: 4,
    title: 'Batch dispatch (v5.1)',
    summary: <>SoC primitive: template-once-iterate-N pattern across feature tasks; reduces per-task overhead.</>,
  },
  {
    n: 5,
    title: 'Dispatch intelligence (v5.2)',
    summary: (
      <>
        Score complexity → probe capability → dispatch with budget. Cuts average tool usage <strong>48%</strong> and variance <strong>84%</strong>.
      </>
    ),
  },
  {
    n: 6,
    title: 'Measurement (v6.0)',
    summary: <>Deterministic phase timing, cache-hit tracking, eval coverage gates, CU v2 continuous factors.</>,
  },
  {
    n: 7,
    title: 'Enforcement (v7.x)',
    summary: (
      <>
        <strong>37 mechanical gates + 5 advisories</strong> (3 advisories promoted to enforced via v7.9 promotion 2026-05-21) — write-time pre-commit hooks, 72h integrity cycle, per-PR review bot, weekly framework-status cron, Tier 1 / 2 / 3 readouts.
      </>
    ),
  },
  {
    n: 8,
    title: 'v7.8 → v7.9 bridge cadence',
    summary: <>Patch-level releases adding observability surfaces without new enforcement gates. See timeline below.</>,
  },
];

type BridgeEntry = {
  version: string;
  date: string;
  summary: React.ReactNode;
  planned?: boolean;
};

const BRIDGE_TIMELINE: BridgeEntry[] = [
  {
    version: 'v7.8',
    date: '2026-05-04',
    summary: <>Bridge layer ships — six advisory mechanisms <strong>A–F</strong>.</>,
  },
  {
    version: 'v7.8.1',
    date: '2026-05-07',
    summary: <>Branch-isolation + feature-closure-completeness gates added (advisory).</>,
  },
  {
    version: 'v7.8.2',
    date: '2026-05-08',
    summary: <>Cross-repo telemetry exemption documented — closes v7.9 candidates F7 + F8.</>,
  },
  {
    version: 'v7.8.3',
    date: '2026-05-11',
    summary: (
      <>
        Cross-repo state-sync release umbrella (<code>V2 / V9 / D-1 / D-3</code>) — 5 phases × 10 PRs across 2 repos.
      </>
    ),
  },
  {
    version: 'v7.8.4',
    date: '2026-05-12',
    summary: (
      <>
        <code>TIER_TAG_LIKELY_INCORRECT</code> heuristic narrowed + PR cache auto-refresh — clears a 33-finding false-positive class.
      </>
    ),
  },
  {
    version: 'v7.8.5',
    date: '2026-05-13',
    summary: <>Observed Patterns Catalog (23 gate + 9 workflow patterns) + W9 branch-drift hook.</>,
  },
  {
    version: 'v7.8.5+S',
    date: '2026-05-14',
    summary: (
      <>
        12 SKILL.md sweep + <code>make skills-audit</code> with 6 conformance checks. <code>/brainstorm-pm</code> added (12th skill).
      </>
    ),
  },
  {
    version: 'v7.8.6',
    date: '2026-05-15',
    summary: (
      <>
        Cadence batch — <code>make integrity-diff</code> vs anchor, unified <code>make preflight WORK_TYPE</code>, weekly Mechanism A zero-drift, W1 ssh-agent preflight.
      </>
    ),
  },
  {
    version: 'v7.9',
    date: '2026-05-21',
    summary: <>Promotion Release shipped: 3 advisory gates → enforced via single-flag flip at <code>scripts/check-state-schema.py:132</code> after 14-day Mechanism A calibration (18 + 13 + 13 firings, 0 zero-candidate rows, 0 false positives). 37 mechanical gates + 5 advisories post-promotion. Phase E validation soak 2026-05-21 → 2026-06-04.</>,
  },
];

export default function FrameworkPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The framework</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Eight floors. Hover to explore how each layer contributes.
        </p>
      </header>
      <BlueprintOverlay interactive />
      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)] mt-16">
        <h2>How the floors cooperate</h2>
        <p>
          Eight floors stacked on a shared state slab. Each floor adds one capability on top of the floors below it — read top-down to see how state becomes skills, skills become primitives, primitives become measurement, and measurement becomes enforcement.
        </p>
      </div>

      <section className="mt-8 grid gap-3" aria-label="The eight floors of the framework">
        {FLOORS.map((floor) => (
          <Card key={floor.n} variant="flat" padding="md">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs tabular-nums text-[var(--color-neutral-500)]">
                {String(floor.n).padStart(2, '0')}
              </span>
              <h3 className="font-serif text-lg leading-tight">{floor.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
              {floor.summary}
            </p>
            {floor.href && (
              <Link
                href={floor.href}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-brand-indigo)] hover:underline"
              >
                {floor.hrefLabel ?? 'Learn more'} <ArrowRight size={12} aria-hidden />
              </Link>
            )}
          </Card>
        ))}
      </section>

      <section className="mt-12" aria-label="v7.8 to v7.9 bridge timeline">
        <h2 className="font-serif text-2xl">v7.8 → v7.9 bridge timeline</h2>
        <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)]">
          Each entry is a patch-level release on Floor 8. All advisory surfaces; the enforcement-gate count holds at <strong>34 mechanical + 5 advisories</strong> until v7.9 promotion.
        </p>
        <ol className="mt-6 space-y-4 border-l border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] pl-6">
          {BRIDGE_TIMELINE.map((entry) => (
            <li key={entry.version} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[29px] top-1.5 inline-block h-2.5 w-2.5 rounded-full ${
                  entry.planned
                    ? 'border-2 border-[var(--color-brand-indigo)] bg-transparent'
                    : 'bg-[var(--color-brand-indigo)]'
                }`}
              />
              <div className="flex items-baseline gap-3 flex-wrap">
                <code className="font-mono text-sm font-semibold">{entry.version}</code>
                <time className="text-xs tabular-nums text-[var(--color-neutral-500)]">{entry.date}</time>
                {entry.planned && (
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-neutral-500)]">
                    Planned
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                {entry.summary}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        For the full worked example of a single sprint flowing through these floors, see the{' '}
        <a href="/case-studies/soc-on-software" className="text-[var(--color-brand-indigo)] hover:underline">
          SoC-v5.0 case study
        </a>
        .
      </p>

      {/* T1 (P2-022 audit follow-up 2026-05-10): 2 inline rounded-lg interactive
          nav cards migrated to <Card interactive>. Hover-shadow-lg preserved
          via className override since the base Card doesn't include shadow. */}
      <section className="mt-16">
        <Link href="/framework/dispatch" className="block">
          <Card
            interactive
            padding="md"
            className="group hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                  See the framework in motion →
                </h2>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  Two real feature traces walked through the eight floors — scroll-driven, with floor-by-floor firing order.
                </p>
              </div>
              <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
            </div>
          </Card>
        </Link>
      </section>
      <section className="mt-6">
        <Link href="/framework/universe" className="block">
          <Card
            interactive
            padding="md"
            className="group hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                  Framework Universe (3D walkthrough) →
                </h2>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  Cinematic 6-act 3D walkthrough of the framework&rsquo;s evolution from v1.0 to v7.9.1 — architecture stack, FR-13 pattern overlay, live gate firings (W34/W30/W31/W32/W11), live adoption bars (timing / per_phase / cache_hits / cu_v2), and ~92 shipped features as a chronological monument grid. Built with React Three Fiber + Drei.
                </p>
              </div>
              <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
            </div>
          </Card>
        </Link>
      </section>
      <section className="mt-6">
        <Link href="/framework/dev-guide" className="block">
          <Card
            interactive
            padding="md"
            className="group hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                  Developer guide (v1.0 → v7.9) →
                </h2>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  Technical reference for developers onboarding to the framework. 4 enforcement layers, <code>state.json</code> schema (incl. v7.8.3 cross-repo <code>state_owner</code> enum), phase lifecycle, dispatch model, cache architecture, measurement protocol, 34 mechanical gates + 5 advisories, v7.8 bridge mechanisms A–F, v7.8.3 cross-repo state-sync, v7.8.5 Observed Patterns Catalog + W9 branch-drift alert, v7.8.5+S skills-review execution (12 skills + <code>make skills-audit</code>), v7.8.6 cadence batch (unified preflight + integrity-diff + weekly trend scan + dependency audit), 3 operational walkthroughs, compressed v1.0 → v7.9 timeline.
                </p>
              </div>
              <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
            </div>
          </Card>
        </Link>
      </section>
    </article>
  );
}
