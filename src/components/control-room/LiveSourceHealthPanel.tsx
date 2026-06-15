/**
 * LiveSourceHealthPanel — overview Source-Health card (UCC live-feed Phase 1).
 *
 * Renders the merged live-or-snapshot rows from
 * `lib/control-room/live/present.ts::buildSourceHealthRows`. Each row shows a
 * per-source headline + detail and a `live`/`snapshot` mode badge so the
 * operator can see at a glance which sources are reporting in real time vs.
 * served from the last build-time sync.
 *
 * Server-compatible: pure render, no hooks, no client APIs.
 */

import type { SourceHealthRow } from '@/lib/control-room/live/present';

interface LiveSourceHealthPanelProps {
  rows: SourceHealthRow[];
  /** ISO timestamp of the synced snapshot baseline (external-sync-status.updated). */
  snapshotUpdated?: string | null;
}

function ModeBadge({ mode }: { mode: 'live' | 'snapshot' }) {
  if (mode === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        live
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-500)] dark:bg-white/[0.08] dark:text-white/55">
      snapshot
    </span>
  );
}

export function LiveSourceHealthPanel({ rows, snapshotUpdated = null }: LiveSourceHealthPanelProps) {
  const liveCount = rows.filter((r) => r.mode === 'live').length;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
          Source Health
        </h3>
        <span className="text-[10px] text-[var(--color-neutral-500)]">
          {liveCount > 0
            ? `${liveCount}/${rows.length} live`
            : snapshotUpdated
              ? `snapshot · ${snapshotUpdated.slice(0, 10)}`
              : 'snapshot'}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const dot = row.healthy ? 'bg-emerald-500' : 'bg-amber-500';
          return (
            <div
              key={row.key}
              className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
                  <span className="font-sans text-sm font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                    {row.label}
                  </span>
                </div>
                <ModeBadge mode={row.mode} />
              </div>
              <div className="font-sans text-sm text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-200)]">
                {row.headline}
              </div>
              <div className="mt-0.5 font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                {row.detail}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
