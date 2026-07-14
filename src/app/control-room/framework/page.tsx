/**
 * /control-room/framework — Framework-Health Dashboard
 *
 * v7.7 M4 / PR-7 + v7.8 T19 (Mechanism F panel). Server component. Loads
 * FitTracker2 ledgers via lib/framework-health/load-ledgers.ts and the
 * v7.8 membrane-status JSON via lib/framework-health/load-membrane-status.ts.
 * Renders:
 *  - Tier 1.1 adoption trend (AdoptionTrendChart)
 *  - Documentation-debt coverage (DocDebtTrendChart)
 *  - Automation map of all 33 instrumented gates (AutomationMap)
 *  - Mechanically-unclosable deferred items D1+D2 (HumanActionPanel)
 *  - Latest 72h integrity cycle snapshot (CycleSnapshotPanel)
 *  - v7.8 Mechanism F membrane status — advisory smartlog (MembraneStatusPanel)
 *  - Predecessor cross-links footer (T26)
 *
 * Gated by proxy.ts basic-auth on /control-room/*.
 * Excluded from sitemap + robots (see src/app/sitemap.ts + robots.ts).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadFrameworkLedgers } from '@/lib/framework-health/load-ledgers';
import { loadMembraneStatus } from '@/lib/framework-health/load-membrane-status';
import { aggregateGateCoverage, countEventsBySource } from '@/lib/control-room/gate-coverage-aggregator';
import { AdoptionTrendChart } from '@/components/framework-health/AdoptionTrendChart';
import { DocDebtTrendChart } from '@/components/framework-health/DocDebtTrendChart';
import { AutomationMap } from '@/components/framework-health/AutomationMap';
import { HumanActionPanel } from '@/components/framework-health/HumanActionPanel';
import { CycleSnapshotPanel } from '@/components/framework-health/CycleSnapshotPanel';
import { MembraneStatusPanel } from '@/components/framework-health/MembraneStatusPanel';
import { VisitorComprehensionPanel } from '@/components/framework-health/VisitorComprehensionPanel';
import { HadfSignaturePanel } from '@/components/framework-health/HadfSignaturePanel';
import { loadHadfSensing } from '@/lib/framework-health/load-hadf-signatures';
import { getBundleText } from '@/lib/live-data/data-source';
import AuditLogPanel from '@/components/control-room/AuditLogPanel';

export const dynamic = 'force-dynamic';

// ── v7.8.3 C-4 — Cross-repo gate-coverage loader ─────────────────────────────

async function loadGateCoverage() {
  // FT2 stream: live state Blob first (Phase 2), else the synced snapshot file.
  const liveFt2 = await getBundleText('integrity/gate-coverage-ft2.jsonl');
  const ft2Path = join(process.cwd(), 'src', 'data', 'integrity', 'gate-coverage-ft2.jsonl');
  const ft2Content =
    liveFt2 ?? (existsSync(ft2Path) ? readFileSync(ft2Path, 'utf-8') : '');
  // fitme-story-local stream stays a local read (it is this repo's own ledger).
  const fsPath = join(process.cwd(), '.claude', 'logs', 'gate-coverage.jsonl');
  const fsContent = existsSync(fsPath) ? readFileSync(fsPath, 'utf-8') : '';
  return {
    events: aggregateGateCoverage(ft2Content, fsContent),
    counts: countEventsBySource(ft2Content, fsContent),
  };
}

export const metadata: Metadata = {
  title: 'Framework Health — control room',
  description:
    'Live dashboard for the FitMe PM framework v7.10 (shipped 2026-06-10): Tier 1.1 adoption trends, documentation-debt coverage, automation map (33 instrumented gates: 21 write-time + 9 cycle-time + 2 W9 hooks + 1 standalone — incl. BRANCH_ISOLATION_VIOLATION Mode B + Mode C + FEATURE_CLOSURE_COMPLETENESS enforced at v7.9, PLATFORMS_TESTED enforced 2026-06-21, F16 try-repo harness enforced 2026-06-17, and the 2026-06-29 analytics advisories CSV_TAXONOMY_DRIFT + GA4_MCP_DISCONNECTED), 72h integrity cycle snapshot, v7.8 Mechanism F membrane status, v7.8.3 cross-repo gate-coverage aggregator (FT2 + fitme-story streams time-sorted), v7.8.5 Observed Patterns Catalog (gate-firing patterns + W1–W43 workflow patterns incl. cross-layer tracker lag) with W9 branch-drift real-time alert hook, v7.8.6 cadence batch (make integrity-diff + make preflight + weekly gate-coverage zero-drift scan + per-dimension trend nudge + W1 ssh-agent SessionStart preflight + weekly dependency audit), v7.10 GATE_COVERAGE_ZERO observability + field-rename closure, and the 2026-06-29 cross-layer naming convention (slug + linear_id + scheme-prefixed codes, make crosswalk) + state.json schema_version.',
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14">
      <div className="mb-5">
        <h2 className="font-serif text-xl text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Predecessor cross-links footer (T26) ─────────────────────────────────────

const PREDECESSOR_LINKS = [
  {
    label: 'Gemini 2.5 Pro Independent Audit',
    version: 'v7.4',
    date: '2026-04-21',
    href: 'https://github.com/Regevba/FitTracker2/blob/main/trust/audits/2026-04-21-gemini/remediation-plan-2026-04-23.md',
    external: true,
    current: false,
    description: 'Source trigger. 9-tier audit surfaced the measurement adoption gap and Class B mechanical gaps.',
  },
  {
    label: 'v7.5 — Data Integrity Framework',
    version: 'v7.5',
    date: '2026-04-24',
    href: '/case-studies/measurement-v6',
    external: false,
    current: false,
    description: 'Eight cooperating defenses: write-time + cycle-time + readout-time. The policy response to the audit.',
  },
  {
    label: 'v7.6 — Mechanical Enforcement',
    version: 'v7.6',
    date: '2026-04-25',
    href: '/case-studies/mechanical-enforcement-v7-6',
    external: false,
    current: false,
    description: '4 Class B → Class A promotions. Per-PR review bot + weekly cron. 5 documented unclosable gaps.',
  },
  {
    label: 'v7.7 — Validity Closure',
    version: 'v7.7',
    date: '2026-04-27',
    href: '/case-studies/validity-closure-v7-7',
    external: false,
    current: false,
    description: '4 new write-time gates + TIER_TAG_LIKELY_INCORRECT advisory. Shipped with the silent-pass that v7.8 closed.',
  },
  {
    label: 'v7.8 — Bridge to v7.9',
    version: 'v7.8',
    date: '2026-05-04',
    href: '/case-studies/framework-v7-8-bridge',
    external: false,
    current: false,
    description: 'Mechanisms A-F (advisory). First honesty-ledger entry FT2-FH-001. 9 PRs in 2 days.',
  },
  {
    label: 'v7.8.1 — Branch Isolation + Closure Completeness',
    version: 'v7.8.1',
    date: '2026-05-07',
    href: '/case-studies/framework-v7-8-1-branch-isolation',
    external: false,
    current: false,
    description: '3 new write-time gates (BRANCH_ISOLATION_VIOLATION, FEATURE_CLOSURE_COMPLETENESS, ISOLATION_OPT_OUT_REASON_MISSING) + 3 cycle-time advisories. First feature shipped via v7.8 protocol.',
  },
  {
    label: 'v7.8.2 — Cross-Repo Telemetry Asymmetry',
    version: 'v7.8.2',
    date: '2026-05-08',
    href: 'https://github.com/Regevba/FitTracker2/blob/main/docs/superpowers/specs/2026-05-08-cross-repo-gate-asymmetry.md',
    external: true,
    current: false,
    description: 'Patch-level. Documents FT2-only Mechanism A telemetry as exemption. Bash short-circuit on PostToolUse:Read silences cross-repo Mechanism C noise.',
  },
  {
    label: 'v7.8.3 — Cross-Repo State-Sync Release Umbrella',
    version: 'v7.8.3',
    date: '2026-05-11',
    href: '/case-studies/cross-repo-state-sync-impl',
    external: false,
    current: false,
    description: 'V2 enforced + V9 logs + 3 new state_owner gates + D-3 unified PR cite cache + C-4 telemetry aggregator + D-1 reverse-sync GH Action. 10 PRs / 2 repos / 1 day.',
  },
  {
    label: 'v7.8.4 — Pre-v7.9 Telemetry Calibration',
    version: 'v7.8.4',
    date: '2026-05-12',
    href: 'https://github.com/Regevba/FitTracker2/pull/314',
    external: true,
    current: false,
    description: 'Patch-level. Adds PR_CACHE_STALE auto-refresh (closes 33-finding false-positive class). Narrows TIER_TAG_LIKELY_INCORRECT heuristic (target/kill filter + \\b word-boundary + intervening-tier-marker skip). cache_hits[] backfills + 5 doc-debt closures. make integrity-check: 35+9 → 0+0.',
  },
  {
    label: 'v7.8.5 — Observability Layer',
    version: 'v7.8.5',
    date: '2026-05-13',
    href: 'https://github.com/Regevba/FitTracker2/pull/328',
    external: true,
    current: false,
    description: 'Patch-level. Ships the Observed Patterns Catalog (23 gate patterns + 9 workflow patterns at .claude/integrity/observed-patterns.md) + W9 branch-drift real-time alert via PostToolUse:Bash hook (scripts/check-branch-drift.py). Detects when a concurrent Claude session sharing the working directory runs git checkout, flipping HEAD. No new gates — operator-facing observability + workflow patterns. PRs #328 + #341.',
  },
  {
    label: 'v7.8.6 — Cadence Batch',
    version: 'v7.8.6',
    date: '2026-05-15',
    href: 'https://github.com/Regevba/FitTracker2/pull/363',
    external: true,
    description: 'Patch-level. Closes the 96h drift window between weekly framework-status cron and 72h integrity cycle (data-integrity §2.1+§2.3). Adds make integrity-diff vs 2026-05-14 anchor; make preflight WORK_TYPE=<type> unified entry point writing .claude/shared/preflight-cache.json consumed by all 10 skills; W1 ssh-agent SessionStart preflight; weekly Mechanism A gate-coverage zero-drift scan + per-dimension trend nudge (cu_v2/fully_adopted_post_v6 watch); calendar reminders for B1/B2/B4/B5 follow-ups. Nice-to-have batch: weekly dependency audit workflow + daily stale-branch + PR babysit sections. No new enforcement gates. PRs #363 (MUST) + #365 (nice-to-have).',
  },
  {
    label: 'v7.9 — Promotion Release',
    version: 'v7.9',
    date: '2026-05-21',
    href: 'https://github.com/Regevba/FitTracker2/pull/417',
    external: true,
    current: false,
    description: 'SHIPPED 2026-05-21 via single-flag flip at scripts/check-state-schema.py (BRANCH_ISOLATION_ADVISORY_MODE = True → False). Promotes 3 v7.8.1 advisory gates to enforced: BRANCH_ISOLATION_VIOLATION Mode B (infra commit-level) + Mode C (per-state.json mutation) + FEATURE_CLOSURE_COMPLETENESS (write-time). All 4 §2.2 promotion criteria met against 14d Mechanism A telemetry (18 + 13 + 13 firings, 0 zero-candidate). First real-world Mode C gate fire caught + resolved same-session. Phase E validation soak ran 2026-05-21 → 2026-06-04. FT2-FH-003 honesty ledger codifies the calibration discipline.',
  },
  {
    label: 'v7.10 — GATE_COVERAGE_ZERO observability + field-rename closure',
    version: 'v7.10',
    date: '2026-06-10',
    href: 'https://github.com/Regevba/FitTracker2/blob/main/docs/FRAMEWORK-FACTS.md',
    external: true,
    current: true,
    description: 'SHIPPED 2026-06-10. Hardens observability of the gates themselves: GATE_COVERAGE_ZERO meta-check reads the F17 gate-last-fired index + adds a 0-candidate mis-wire detector; cycle-time coverage emission wired for BROKEN_PR_CITATION + CASE_STUDY_MISSING_TIER_TAGS + PATTERN_SKILL_UNMAPPED; two field-rename reader mismatches closed (measurement-adoption cu_v2; gate-last-fired ts key). Current canonical state (2026-07-13): 131 features, 33 instrumented / 34 live gates (21 write-time + 9 cycle-time + 2 W9 hooks + 1 standalone), 28 firing, 0 integrity findings. PLATFORMS_TESTED enforced 2026-06-21; F16 try-repo harness enforced 2026-06-17; F4 FRAMEWORK_VERSION_STALE enforced 2026-07-08; CSV_TAXONOMY_DRIFT enforced 2026-07-13 (B16); SCHEMA_DIFF (T12) shipped 2026-07-09. Extended 2026-06-29 (v7.10 chores): cross-layer naming convention, state.json schema_version, analytics advisories CSV_TAXONOMY_DRIFT + GA4_MCP_DISCONNECTED, integrity-check parallelized (9.4s→1.84s).',
  },
];

function PredecessorFooter() {
  return (
    <section className="mt-16 pt-10 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <h2 className="font-serif text-lg text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-6">
        Framework evolution — predecessor case studies
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {PREDECESSOR_LINKS.map((link) => {
          const inner = (
            <div
              className={`rounded-lg border p-4 h-full transition-colors ${
                link.current
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-neutral-400)] dark:hover:border-[var(--color-neutral-500)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded ${
                        link.current
                          ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100'
                          : 'bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]'
                      }`}
                    >
                      {link.version}
                    </span>
                    <span className="text-[10px] font-sans text-[var(--color-neutral-400)]">
                      {link.date}
                    </span>
                    {link.current && (
                      <span className="text-[10px] font-sans font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        current
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-sans font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                    {link.label}
                  </p>
                  <p className="mt-1 text-xs font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] leading-relaxed">
                    {link.description}
                  </p>
                </div>
                {link.external && (
                  <ExternalLink
                    size={14}
                    className="shrink-0 mt-1 text-[var(--color-neutral-400)]"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );

          if (link.external) {
            return (
              <a
                key={link.version}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={link.version} href={link.href} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FrameworkHealthPage() {
  const [ledgers, membraneStatus] = await Promise.all([
    loadFrameworkLedgers(),
    loadMembraneStatus(),
  ]);

  const snapshots = ledgers.adoptionHistory?.snapshots ?? [];
  const currentAdoption = ledgers.adoptionCurrent;
  const debt = ledgers.documentationDebt;

  // v7.8.3 C-4 — cross-repo gate coverage (live FT2 Blob stream or snapshot)
  const gateCoverage = await loadGateCoverage();
  const ft2FireCount = gateCoverage.counts.ft2;
  const fsFireCount = gateCoverage.counts['fitme-story'];
  const totalFireCount = gateCoverage.events.length;

  // HADF Phase 3A T4 — sensing-layer panel (build-time, no await needed)
  const hadfSensing = loadHadfSensing();

  return (
    <article className="max-w-5xl mx-auto px-6 py-12">
      {/* ── Header ── */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/control-room"
            className="text-sm font-sans text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)] dark:hover:text-[var(--color-neutral-300)]"
          >
            Control room
          </Link>
          <span className="text-[var(--color-neutral-400)]" aria-hidden="true">/</span>
          <span className="text-sm font-sans text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
            Framework Health
          </span>
        </div>
        <h1 className="font-serif text-[length:var(--text-display-lg)]">Framework Health</h1>
        <p className="mt-3 text-lg text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-2xl font-sans">
          v7.10 live dashboard — Tier 1.1 measurement adoption, documentation-debt coverage, full
          automation map, last 72h integrity cycle snapshot, and Mechanism F membrane status.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-sans">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            v7.10
          </span>
          {currentAdoption && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
              {currentAdoption.summary.features_post_v6} post-v6 features ·{' '}
              {currentAdoption.summary.fully_adopted} fully adopted
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
            Updated {currentAdoption?.updated?.slice(0, 10) ?? 'unknown'}
          </span>
        </div>
      </header>

      {/* ── Load errors (dev mode only) ── */}
      {ledgers.loadErrors.length > 0 && process.env.NODE_ENV !== 'production' && (
        <div className="mb-8 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
          <p className="text-sm font-sans font-semibold text-red-800 dark:text-red-200 mb-2">
            Ledger load errors (dev only — configure FITTRACKER_REPO_PATH if needed)
          </p>
          <ul className="text-xs font-mono text-red-700 dark:text-red-300 space-y-1">
            {ledgers.loadErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── T21 — Adoption trend ── */}
      <Section
        id="adoption-trend"
        title="Tier 1.1 — Measurement adoption trend"
        subtitle="Post-v6 feature adoption of 4 measurement dimensions (timing_wall_time, per_phase_timing, cache_hits, cu_v2). Y = percent of post-v6 features with each field present."
      >
        <AdoptionTrendChart snapshots={snapshots} />
        {currentAdoption && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                ['timing_wall_time', 'Wall time'],
                ['per_phase_timing', 'Per-phase timing'],
                ['cache_hits', 'Cache hits'],
                ['cu_v2', 'CU v2'],
              ] as const
            ).map(([key, label]) => {
              const stat = currentAdoption.dimension_coverage[key];
              return (
                <div
                  key={key}
                  className="rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-3 text-center"
                >
                  <p className="text-xl font-bold font-sans text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                    {stat.post_v6_percent.toFixed(0)}%
                  </p>
                  <p className="text-xs font-sans text-[var(--color-neutral-500)] mt-0.5">{label}</p>
                  <p className="text-[10px] font-sans text-[var(--color-neutral-400)] mt-0.5">
                    {stat.post_v6_present}/{currentAdoption.summary.features_post_v6} post-v6
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── T22 — Documentation debt ── */}
      <Section
        id="doc-debt"
        title="Tier 3.2 — Documentation-debt coverage"
        subtitle="Case-study field coverage across all features. Trend mode unlocks after 3 scheduled 72h cycle snapshots."
      >
        {debt ? (
          <DocDebtTrendChart debt={debt} />
        ) : (
          <p className="text-sm font-sans text-[var(--color-neutral-500)] italic">
            documentation-debt.json not found. Run{' '}
            <code className="font-mono">make documentation-debt</code> in the FitTracker2 repo.
          </p>
        )}
      </Section>

      {/* ── T23 — Automation map ── */}
      <Section
        id="automation-map"
        title="Automation map — all 33 instrumented gates"
        subtitle="Every instrumented gate as of v7.10: 21 write-time (pre-commit, incl. F4 enforced + SCHEMA_DIFF + CSV_TAXONOMY_DRIFT + GA4_MCP_DISCONNECTED) + 9 cycle-time (72h CI) + 2 W9 real-time hooks, plus 3 non-gating cycle-time advisories. 34 live gates total."
      >
        <AutomationMap />
      </Section>

      {/* ── T24 — Human-action panel ── */}
      <Section
        id="human-action"
        title="Deferred items — mechanically unclosable"
        subtitle="2 gaps that require human or external operator action. Enumerated explicitly per the v7.6 principle: a system that knows its limits is more trustworthy than one that pretends every check is a check."
      >
        <HumanActionPanel />
      </Section>

      {/* ── T25 — Cycle snapshot ── */}
      <Section
        id="cycle-snapshot"
        title="Last 72h integrity cycle snapshot"
        subtitle="Generated every 72h by the GitHub Actions framework-status workflow. Run make integrity-snapshot locally to force a new snapshot."
      >
        <CycleSnapshotPanel snapshot={ledgers.latestIntegritySnapshot} />
      </Section>

      {/* ── v7.8 T19 — Mechanism F membrane status ── */}
      <Section
        id="membrane-status"
        title="Mechanism F — membrane status (v7.8 advisory)"
        subtitle="Read-only smartlog of in-flight feature work. Joins state.json + agent-leases.json + open-branch reflog. v7.8 ships advisory; v7.9 wires /pm-workflow lease acquisition. Pattern: Sapling smartlog (Meta), Jujutsu op-log."
      >
        <MembraneStatusPanel status={membraneStatus} />
      </Section>

      {/* ── 3d-interactive-framework-flow-diagram Phase 4.H T-comprehension-panel ── */}
      <Section
        id="visitor-comprehension"
        title="Visitor Comprehension — 3D Universe (Phase 4.H)"
        subtitle="GA4 funnel for /framework/universe + /control-room/framework/universe. 6 framework_universe_* events emit from the same scene tree across both modes. Live data lands once GA4 collection accumulates post-deploy."
      >
        <VisitorComprehensionPanel />
      </Section>

      {/* ── ucc-passkey-auth T19 — Auth surface telemetry ── */}
      <Section
        id="auth-surface"
        title="Auth surface — passkey gate"
        subtitle="Operator dashboard authentication telemetry. Sourced from .claude/logs/ucc-auth-events.jsonl (synced daily from fitme-story Vercel Blob)."
      >
        <AuditLogPanel />
      </Section>

      {/* ── fitme-story-website-design-system Bucket B T8 — public DS cross-link ── */}
      <Section
        id="public-design-system"
        title="Public design system"
        subtitle="The system that renders this site itself — public-facing inventory of tokens, components, drift, and dark-mode parity. Companion to the framework health view above."
      >
        <Link
          href="/design-system"
          className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[var(--color-brand-indigo)] hover:underline"
        >
          Open /design-system →
        </Link>
      </Section>

      {/* ── v7.8.3 C-4 — Cross-repo gate coverage ── */}
      <Section
        id="gate-coverage"
        title="Gate coverage — cross-repo (v7.8.3)"
        subtitle="Aggregated gate-fire events from FT2 (synced via src/data/integrity/gate-coverage-ft2.jsonl) and fitme-story local (.claude/logs/gate-coverage.jsonl). Build-time snapshot; refreshes on each Vercel deploy."
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(
            [
              ['FT2', ft2FireCount, 'indigo'],
              ['fitme-story', fsFireCount, 'violet'],
              ['Total', totalFireCount, 'neutral'],
            ] as const
          ).map(([label, count, color]) => (
            <div
              key={label}
              className={`rounded-lg border p-3 text-center ${
                color === 'indigo'
                  ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950'
                  : color === 'violet'
                    ? 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950'
                    : 'border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]'
              }`}
            >
              <p
                className={`text-2xl font-bold font-sans ${
                  color === 'indigo'
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : color === 'violet'
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]'
                }`}
              >
                {count.toLocaleString()}
              </p>
              <p className="text-xs font-sans text-[var(--color-neutral-500)] mt-0.5">{label} fires</p>
            </div>
          ))}
        </div>
        {ft2FireCount === 0 && fsFireCount === 0 && (
          <p className="text-sm font-sans text-[var(--color-neutral-500)] italic">
            No gate-coverage events found. Run{' '}
            <code className="font-mono">make integrity-check</code> in the FitTracker2 repo to
            populate gate-coverage-ft2.jsonl, or trigger the sync script.
          </p>
        )}
      </Section>

      {/* ── HADF Phase 3A T4 — sensing-layer observability panel ── */}
      <Section
        id="hadf-sensing"
        title="HADF sensing layer — reference signatures + drift (Phase 3A)"
        subtitle="Passive detection/observability of streaming TTFT/TPS fingerprints from closed Phase 2-bis calibrations. Advisory only — no dispatch decision is made on this data; acting layer (RQ4/Phase 3B) is unstarted."
      >
        <HadfSignaturePanel data={hadfSensing} />
      </Section>

      {/* ── T26 — Predecessor cross-links ── */}
      <PredecessorFooter />
    </article>
  );
}
