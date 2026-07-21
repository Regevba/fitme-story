import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlueprintOverlay } from '@/components/bespoke/BlueprintOverlay';
import { Card } from '@/components/ui/Card';
import { LensFraming } from '@/components/LensFraming';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'The framework',
  description: 'Seven floors of an AI-orchestrated PM framework, explained layer by layer.',
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
    title: 'Integrity & enforcement (v7.x)',
    summary: (
      <>
        <strong>33 instrumented / 34 live gates (21 write-time + 9 cycle-time + 2 W9 hooks + 1 standalone), 29 firing</strong> across v7.5 → v7.10 (3 advisories promoted to enforced via the v7.9 promotion 2026-05-21): the v7.5 Data Integrity Framework, write-time pre-commit hooks, the 72h integrity cycle, per-PR review bot, weekly framework-status cron, branch isolation, feature-closure completeness, cross-repo state sync, the Observed Patterns Catalog, and the v7.9.1 build window (F16 try-repo harness, F17 last-fired index, F2 reality-check). <strong>v7.10</strong> (2026-06-10) hardened the meta-layer with the <strong>GATE_COVERAGE_ZERO</strong> observability check, and the <strong>v8.x build window</strong> (opened 2026-06-17) promoted F16 try-repo harness advisory→enforced (2026-06-17) and T14 PLATFORMS_TESTED advisory→enforced (2026-06-21) and shipped the F4/F1/F3 roadmap-realism advisory gates. Includes the <strong>HADF</strong> dispatch program through its Phase&nbsp;3A sensing layer.
      </>
    ),
    href: '/framework/dispatch',
    hrefLabel: 'See the dispatch layer',
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
  {
    version: 'v7.9.1',
    date: '2026-06-04',
    summary: <>Build window opened at Phase E exit — 8 ships / 14 PRs, <strong>0 new enforcement gates</strong> (Phase E exit discipline held). Observability + dev-env hardening: F16 try-repo pre-commit harness (3rd gate-test layer), F17 per-gate <code>last_fired_at</code> index, F2 Phase 0 reality-check, launchd-drift extension, reusable deployed-URL probe. CI workflows 8 → 14; Observed-Patterns W1–W28 → W1–W32.</>,
  },
  {
    version: 'v7.10',
    date: '2026-06-10',
    summary: <>GATE_COVERAGE_ZERO observability + field-rename closure — hardens the meta-layer watching whether each gate is actually firing, with <strong>no new product-facing gates</strong>. The <code>GATE_COVERAGE_ZERO</code> meta-check reads the F17 <code>gate-last-fired.json</code> index to flag silent gates plus 0-candidate mis-wires; three cycle-time checks now emit <code>mode=&quot;cycle&quot;</code> coverage; two reader/index field-rename silent-passes closed (observed-patterns #24).</>,
  },
  {
    version: 'v8.x build window',
    date: '2026-06-17',
    summary: <>Build window opened (kickoff gate cleared) — <strong>F16 try-repo harness promoted advisory→enforced</strong> 1 day early via main required status checks (the <code>try-repo-harness</code> CI job, not a code flag; K2 0% false-positive rate over 60 CI runs / 13 days). Three ready-now roadmap-realism advisory gates shipped: F4 <code>FRAMEWORK_VERSION_STALE</code> (write-time, PR #740), F1 <code>STATE_TASKS_FILESYSTEM_DRIFT</code> (cycle-time, PR #752), F3 <code>DEPENDENCY_GRAPH_CYCLE</code> (cycle-time, PR #753). F4 later promoted advisory→enforced 2026-07-08 (PR #858); SCHEMA_DIFF (T12) shipped 2026-07-09. 33 instrumented / 34 live gates total.</>,
  },
];

export default function FrameworkPage() {
  return (
    <article className="page-shell section-padding-x py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The framework</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Seven floors. Hover to explore how each layer contributes.
        </p>
      </header>

      <LensFraming
        className="mb-8 rounded-lg border-l-2 border-[var(--color-brand-indigo)] bg-[var(--color-brand-indigo)]/5 px-5 py-4 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)] mx-auto"
        pm={
          <>
            <strong>Reading as a PM:</strong> the framework is the product lifecycle made
            enforceable — why it exists, what each version shipped, and how outcomes get measured.
            The seven floors below are the &ldquo;how&rdquo;; the{' '}
            <a href="#bridge" className="text-[var(--color-brand-indigo)] hover:underline">
              version timeline
            </a>{' '}
            is the &ldquo;what changed.&rdquo;
          </>
        }
        dev={
          <>
            <strong>Reading as a dev:</strong> seven floors, bottom-up — state → skills → primitives
            → measurement → enforcement. Each floor adds one capability on the one below. For the
            implementation reference, see the{' '}
            <Link href="/framework/dev-guide" className="text-[var(--color-brand-indigo)] hover:underline">
              developer guide
            </Link>
            .
          </>
        }
      />

      <BlueprintOverlay interactive />
      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)] mx-auto mt-16">
        <h2>How the floors cooperate</h2>
        <p>
          Seven floors stacked on a shared state slab. Each floor adds one capability on top of the floors below it — read top-down to see how state becomes skills, skills become primitives, primitives become measurement, and measurement becomes the consolidated v7.x integrity-and-enforcement layer.
        </p>
      </div>

      <section className="mt-8 grid gap-3" aria-label="The seven floors of the framework">
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

      <section id="bridge" className="mt-12 scroll-mt-16" aria-label="v7.8 to v7.10 release timeline">
        <h2 className="font-serif text-2xl">v7.8 → v7.10 release timeline</h2>
        <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)] mx-auto">
          The early entries are patch-level releases on Floor 8 (the v7.8 bridge); later entries carry the framework through the v7.9 promotion and into v7.10. In that pre-v7.9 bridge era the enforcement-gate count held at <strong>34 mechanical + 5 advisories</strong> until the v7.9 promotion (2026-05-21) flipped 3 advisories to enforced.
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
                  Two real feature traces walked through the seven floors — scroll-driven, with floor-by-floor firing order.
                </p>
              </div>
              <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
            </div>
          </Card>
        </Link>
      </section>
      {/* Framework Universe (3D walkthrough) — pulled from production
          2026-06-06 pending animation polish. The /framework/universe
          route returns 404 in the meantime; the R3F scene tree stays
          on main so iteration continues without recreating the
          implementation. Re-link when the visual polish lands. */}
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
                  Developer guide (v1.0 → v7.10) →
                </h2>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  Technical reference for developers onboarding to the framework. 4 enforcement layers, <code>state.json</code> schema (incl. v7.8.3 cross-repo <code>state_owner</code> enum), phase lifecycle, dispatch model, cache architecture, measurement protocol, 33 instrumented gates, v7.8 bridge mechanisms A–F, v7.8.3 cross-repo state-sync, v7.8.5 Observed Patterns Catalog + W9 branch-drift alert, v7.8.5+S skills-review execution (12 skills + <code>make skills-audit</code>), v7.8.6 cadence batch (unified preflight + integrity-diff + weekly trend scan + dependency audit), 3 operational walkthroughs, compressed v1.0 → v7.10 timeline.
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
