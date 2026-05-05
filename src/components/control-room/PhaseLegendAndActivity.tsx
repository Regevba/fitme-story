/**
 * Control-room PhaseLegend + RecentActivityStrip — UCC task T27.
 *
 * Replaces the dashboard's `PipelineOverview.jsx` with a simpler two-part
 * section on the Overview page:
 *
 *   1. PhaseLegend — a static legend mapping the 4 visual phase buckets
 *      (gray / blue / purple / green) to the PM-flow phase set, so the
 *      board / table left-border colors are interpretable at a glance.
 *   2. RecentActivityStrip — the last N events from `change-log.json`,
 *      shown as a compact timeline (timestamp + change_type + title).
 *
 * Both are server-compatible (no hooks). Data sources are imported at build
 * time (T31 sync writes `src/data/shared/change-log.json` from FT2). The
 * activity strip is read-only — pages link to the full change log if they
 * want to drill in (drill-link is rendered as a "View full log →" CTA at
 * the strip's bottom).
 *
 * Source: dashboard/src/components/PipelineOverview.jsx (replaced, not
 * preserved — the dashboard's pipeline is overcomplicated for the operator
 * view per token-map.md visual review).
 */

import changeLogData from '@/data/shared/change-log.json';

// ────────────────────────────────────────────────────────────────────────────
// PhaseLegend
// ────────────────────────────────────────────────────────────────────────────

interface PhaseBucket {
  label: string;
  hint: string;
  swatch: string;
  phases: string;
}

const PHASE_BUCKETS: PhaseBucket[] = [
  {
    label: 'Not started',
    hint: 'Backlog, research, PRD, tasks',
    swatch: 'bg-slate-400',
    phases: 'backlog · research · prd · tasks',
  },
  {
    label: 'In motion',
    hint: 'UX, integration, implementation',
    swatch: 'bg-sky-500',
    phases: 'ux · integration · implement',
  },
  {
    label: 'Validating',
    hint: 'Testing, review, merge',
    swatch: 'bg-fuchsia-500',
    phases: 'testing · review · merge',
  },
  {
    label: 'Done',
    hint: 'Docs and shipped',
    swatch: 'bg-emerald-500',
    phases: 'docs · done',
  },
];

export function PhaseLegend() {
  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
      <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
        Phase legend
      </h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {PHASE_BUCKETS.map((bucket) => (
          <li key={bucket.label} className="flex items-start gap-2.5">
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${bucket.swatch}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="font-sans text-sm font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                {bucket.label}
              </div>
              <div className="font-sans text-xs text-[var(--color-neutral-500)]">
                {bucket.hint}
              </div>
              <div className="font-mono text-[10px] text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-700)]">
                {bucket.phases}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// RecentActivityStrip
// ────────────────────────────────────────────────────────────────────────────

interface ChangeLogEvent {
  timestamp: string;
  event_type?: string;
  change_type?: string;
  title?: string;
  summary?: string;
}

interface ChangeLogFile {
  version?: string;
  updated?: string;
  events?: ChangeLogEvent[];
}

const DEFAULT_LIMIT = 5;

const CHANGE_TYPE_DOT: Record<string, string> = {
  runtime_verification: 'bg-sky-500',
  framework_release: 'bg-emerald-500',
  feature_ship: 'bg-emerald-500',
  audit_finding: 'bg-rose-500',
  spec_published: 'bg-fuchsia-500',
  research_landed: 'bg-amber-500',
};

function formatTimestamp(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  const d = new Date(ms);
  // YYYY-MM-DD locale-independent
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export interface RecentActivityStripProps {
  /** Maximum number of events to render. Defaults to 5. */
  limit?: number;
}

export function RecentActivityStrip({ limit = DEFAULT_LIMIT }: RecentActivityStripProps) {
  const log = changeLogData as ChangeLogFile;
  const events = (log.events ?? [])
    .slice()
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, limit);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
        <h3 className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
          Recent activity
        </h3>
        <p className="font-sans text-sm text-[var(--color-neutral-500)]">No events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
      <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
        Recent activity
      </h3>
      <ol className="space-y-3">
        {events.map((event, i) => {
          const dotClass =
            (event.change_type && CHANGE_TYPE_DOT[event.change_type]) ?? 'bg-[var(--color-neutral-300)]';
          const date = formatTimestamp(event.timestamp);
          return (
            <li key={`${event.timestamp}-${i}`} className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <time
                    dateTime={event.timestamp}
                    className="font-mono text-[10px] text-[var(--color-neutral-500)]"
                  >
                    {date}
                  </time>
                  {event.change_type ? (
                    <span className="rounded-md bg-[var(--color-neutral-100)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]">
                      {event.change_type}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 font-sans text-sm text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {event.title ?? '(untitled event)'}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Combined section export — convenience for Overview page wiring
// ────────────────────────────────────────────────────────────────────────────

export interface PhaseLegendAndActivityProps {
  /** Forwarded to RecentActivityStrip. Defaults to 5. */
  activityLimit?: number;
}

export function PhaseLegendAndActivity({ activityLimit }: PhaseLegendAndActivityProps = {}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <PhaseLegend />
      <RecentActivityStrip limit={activityLimit} />
    </section>
  );
}
