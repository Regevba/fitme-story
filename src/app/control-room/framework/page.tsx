/**
 * /control-room/framework — Framework-Health Dashboard
 *
 * v7.7 M4 / PR-7. Server component. Loads FitTracker2 ledgers via
 * lib/framework-health/load-ledgers.ts and renders:
 *  - Tier 1.1 adoption trend (AdoptionTrendChart)
 *  - Documentation-debt coverage (DocDebtTrendChart)
 *  - Automation map of all 20 check codes (AutomationMap)
 *  - Mechanically-unclosable deferred items D1+D2 (HumanActionPanel)
 *  - Latest 72h integrity cycle snapshot (CycleSnapshotPanel)
 *  - Predecessor cross-links footer (T26)
 *
 * Gated by proxy.ts basic-auth on /control-room/*.
 * Excluded from sitemap + robots (see src/app/sitemap.ts + robots.ts).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { loadFrameworkLedgers } from '@/lib/framework-health/load-ledgers';
import { AdoptionTrendChart } from '@/components/framework-health/AdoptionTrendChart';
import { DocDebtTrendChart } from '@/components/framework-health/DocDebtTrendChart';
import { AutomationMap } from '@/components/framework-health/AutomationMap';
import { HumanActionPanel } from '@/components/framework-health/HumanActionPanel';
import { CycleSnapshotPanel } from '@/components/framework-health/CycleSnapshotPanel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Framework Health — control room',
  description:
    'Live dashboard for the FitMe PM framework v7.7: Tier 1.1 adoption trends, documentation-debt coverage, automation map, and 72h integrity cycle snapshot.',
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
    href: 'https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/',
    external: true,
    current: true,
    description: 'This dashboard. 4 new write-time gates + TIER_TAG_LIKELY_INCORRECT advisory. M4/PR-7.',
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
  const ledgers = await loadFrameworkLedgers();

  const snapshots = ledgers.adoptionHistory?.snapshots ?? [];
  const currentAdoption = ledgers.adoptionCurrent;
  const debt = ledgers.documentationDebt;

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
          v7.7 live dashboard — Tier 1.1 measurement adoption, documentation-debt coverage, full
          automation map, and last 72h integrity cycle snapshot.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-sans">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            v7.7 — Validity Closure
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
        title="Automation map — all 20 check codes"
        subtitle="Every gating and advisory check code active as of v7.7. Three enforcement layers: write-time (pre-commit), cycle-time gating (72h CI), and cycle-time advisory."
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

      {/* ── T26 — Predecessor cross-links ── */}
      <PredecessorFooter />
    </article>
  );
}
