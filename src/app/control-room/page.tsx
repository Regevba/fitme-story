/**
 * /control-room — Overview page (UCC T20 port).
 *
 * Replaces the minimal scaffold (shipped 2026-04-27) with the full ControlRoom.jsx
 * Hero + NumbersPanel verbatim port. Other sections of ControlRoom.jsx
 * (System Pulse, Drift Lists, Documentation Debt, External Sync, Maintenance Ribbon)
 * deferred to follow-up tasks (T20.5+) — this PR keeps T20 scope tight per
 * task description: "Port ControlRoom → page.tsx with Hero + NumbersPanel verbatim".
 *
 * Data source: src/data/control-room-seeds/features.json (built at prebuild time
 * by sync-from-fittracker2.ts → builder.ts pipeline; T31-T33 shipped 2026-05-08).
 *
 * Below the Hero+Numbers, the existing Framework Health quick-link card is
 * preserved (was the scaffold's primary navigation; now a "next stop" CTA).
 *
 * NOT YET WIRED (deferred to subsequent PRs):
 *   - System Pulse panel (source health + top blockers) — needs alerts + sources data
 *   - Drift Lists (missing in shared / static) — needs frameworkPulse computation
 *   - Documentation Debt panel — needs documentation-debt.json wired
 *   - External Sync panel — needs externalSyncStatus wired
 *   - Real-time framework_version (currently hardcoded; layout.tsx has same TODO)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import featuresData from '@/data/control-room-seeds/features.json';

export const metadata: Metadata = {
  title: 'Overview — Control room',
  robots: { index: false, follow: false },
};

// ────────────────────────────────────────────────────────────────────────────
// Phase grouping (verbatim from dashboard/src/components/ControlRoom.jsx)
// ────────────────────────────────────────────────────────────────────────────

const PHASE_OPEN = new Set(['backlog', 'research', 'prd']);
const PHASE_ACTIVE = new Set([
  'tasks',
  'ux',
  'integration',
  'implement',
  'implementation',
  'testing',
  'review',
  'merge',
  'docs',
]);
const PHASE_CLOSED = new Set(['done', 'complete', 'closed']);

interface FeatureSeed {
  name: string;
  slug: string;
  phase: string | null;
  priority: string | null;
  rice: number | null;
  category: string | null;
  shipped: string | null;
  prd: string | null;
}

interface FeaturesSeedFile {
  shipped: FeatureSeed[];
  planned: FeatureSeed[];
  backlog: FeatureSeed[];
}

interface Summary {
  open: number;
  active: number;
  closed: number;
  critical: number;
  high: number;
}

function summarizeFeatures(features: FeatureSeed[]): Summary {
  const summary: Summary = { open: 0, active: 0, closed: 0, critical: 0, high: 0 };
  for (const feature of features) {
    const phase = feature.phase ?? 'backlog';
    if (PHASE_CLOSED.has(phase)) summary.closed += 1;
    else if (PHASE_ACTIVE.has(phase)) summary.active += 1;
    else if (PHASE_OPEN.has(phase)) summary.open += 1;
    else summary.open += 1; // unknown phases bucket as open
    if (feature.priority === 'critical') summary.critical += 1;
    if (feature.priority === 'high') summary.high += 1;
  }
  return summary;
}

// ────────────────────────────────────────────────────────────────────────────
// MetricCard (Hero numbers panel cell)
// ────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  accent: string;
  detail: string;
}

function MetricCard({ label, value, accent, detail }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-4`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-xs leading-5 text-white/55">{detail}</div>
    </div>
  );
}

// TODO(T20-followup): replace hardcoded framework_version with builder.ts data load
const FRAMEWORK_VERSION = '7.8';
const TOTAL_SKILLS = 11;
const SHARED_FILES = 15;
// TODO(T20-followup): compute source-truth score from external-sync-status.json
const SOURCE_TRUTH_SCORE = '100';

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function ControlRoomPage() {
  // The seeds group features by status bucket (shipped/planned/backlog) but
  // the summary needs phase-level grouping per ControlRoom.jsx logic. Combine
  // and re-bucket.
  const seed = featuresData as unknown as FeaturesSeedFile;
  const allFeatures: FeatureSeed[] = [...(seed.shipped ?? []), ...(seed.planned ?? []), ...(seed.backlog ?? [])];
  const summary = summarizeFeatures(allFeatures);
  const riskCount = summary.critical + summary.high;

  return (
    <article className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      {/* ───────────────────────────────────────────────────────── */}
      {/* Hero — gradient background + title + version pills + Numbers grid */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,143,64,0.26),transparent_34%),radial-gradient(circle_at_top_right,rgba(138,199,255,0.2),transparent_28%),linear-gradient(135deg,#151824_0%,#0f1218_46%,#0b0d11_100%)] p-6 text-white shadow-[0_24px_90px_rgba(6,10,18,0.35)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Operations Control Room
            </div>
            <h2 className="max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Executive health, source drift, planning sync, and blockers in one operator view.
            </h2>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-6 text-white/72 sm:text-base">
              The control room is intentionally narrow: it focuses on what is open, what is under pressure, where truth
              is drifting, and which operational source needs attention next.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white/58">
              <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1">
                Framework v{FRAMEWORK_VERSION}
              </span>
              <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1">
                {TOTAL_SKILLS} skills
              </span>
              <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1">
                {SHARED_FILES} shared files
              </span>
              <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1">
                Source truth {SOURCE_TRUTH_SCORE}
              </span>
            </div>
          </div>

          {/* NumbersPanel — Open / Active / Closed / Risk */}
          <div className="grid min-w-[280px] gap-3 sm:grid-cols-2">
            <MetricCard
              label="Open"
              value={summary.open}
              accent="from-white/30 to-white/5"
              detail="Backlog, research, and PRD load"
            />
            <MetricCard
              label="Active"
              value={summary.active}
              accent="from-sky-300/40 to-sky-400/10"
              detail="Current implementation, test, and review work"
            />
            <MetricCard
              label="Closed"
              value={summary.closed}
              accent="from-emerald-300/40 to-emerald-400/10"
              detail="Shipped and fully closed work"
            />
            <MetricCard
              label="Risk"
              value={riskCount}
              accent="from-amber-300/40 to-rose-400/10"
              detail="Critical and high-priority unresolved items"
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Quick links (Framework Health) — preserved from scaffold */}
      {/* ───────────────────────────────────────────────────────── */}
      <section className="mt-8">
        <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
          Live modules
        </h3>
        <Link
          href="/control-room/framework"
          className="group block rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)] p-5 hover:border-[var(--color-brand-indigo)] hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h2 className="font-sans font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] group-hover:text-[var(--color-brand-indigo)]">
                  Framework Health
                </h2>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  v7.8
                </span>
              </div>
              <p className="font-sans text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                Tier 1.1 adoption trend, documentation-debt coverage, automation map, and 72h integrity cycle snapshot.
              </p>
            </div>
            <ArrowRight
              size={20}
              className="mt-0.5 shrink-0 text-[var(--color-neutral-400)] transition-colors group-hover:text-[var(--color-brand-indigo)]"
              aria-hidden="true"
            />
          </div>
        </Link>
      </section>

      <p className="mt-10 font-sans text-xs text-[var(--color-neutral-400)]">
        UCC migration in progress (T20 shipped 2026-05-08; T21-T30 board/table/tasks/knowledge views in flight). Source:
        dashboard/src/components/ControlRoom.jsx. Hero + NumbersPanel ported verbatim per task spec; remaining sections
        (System Pulse, Drift, Documentation Debt) follow in subsequent PRs.
      </p>
    </article>
  );
}
