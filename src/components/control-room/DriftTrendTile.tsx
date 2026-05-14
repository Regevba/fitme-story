/**
 * DriftTrendTile — answers "has CSV taxonomy drift increased since the last
 * snapshot?"
 *
 * Phase 3.A.1 of analytics-observability. Static-source tile (reads
 * external-sync-status.json + git history, not GA4) — calibration impact
 * green per master plan §7.5. Currently rendered with fixture data for
 * scaffold consistency; can swap to live read of FT2's
 * `.claude/shared/external-sync-status.json` any time post-merge.
 *
 * Metric formula + thresholds: FT2
 * `docs/master-plan/analytics-dashboard-metric-definitions.md` Tile 2.
 */

import type { DriftTrendData } from '@/lib/control-room/analytics-types';

import {
  TileMetaBadge,
  bandColorClass,
  formatNumber,
} from './analytics-tile-primitives';

export interface DriftTrendTileProps {
  data: DriftTrendData;
}

export function DriftTrendTile({ data }: DriftTrendTileProps) {
  const delta = data.current_drift - data.prior_snapshot;
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  const deltaText =
    delta === 0 ? 'no change' : `${arrow} ${Math.abs(delta)} vs prior snapshot`;

  return (
    <article
      className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)] p-5"
      aria-labelledby="drift-trend-title"
    >
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h3 id="drift-trend-title" className="font-sans text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            CSV Taxonomy Drift
          </h3>
          <p className="mt-1 font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
            Events declared in code but missing from canonical CSV
          </p>
        </div>
        <TileMetaBadge meta={data.meta} />
      </header>

      <div className="flex items-baseline gap-3">
        <span
          className="font-sans text-3xl font-semibold tabular-nums text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]"
          aria-label={`${formatNumber(data.current_drift)} drift count`}
        >
          {formatNumber(data.current_drift)}
        </span>
        <span className="font-sans text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          {deltaText}
        </span>
      </div>

      <DriftBars values={data.sparkline_14d} />

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${bandColorClass(data.band)}`}
          aria-hidden="true"
        />
        <span className="font-sans text-xs text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] capitalize">
          {data.band}
        </span>
      </div>
    </article>
  );
}

interface DriftBarsProps {
  values: number[];
}

function DriftBars({ values }: DriftBarsProps) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  return (
    <div
      className="mt-3 flex items-end gap-0.5"
      role="img"
      aria-label={`14-snapshot drift trend; max ${max}, latest ${values[values.length - 1]}`}
    >
      {values.map((v, i) => {
        const pct = (v / max) * 100;
        const heightStyle = { height: `${Math.max(pct, 3)}%` };
        return (
          <div
            key={i}
            style={heightStyle}
            className={`flex-1 rounded-sm ${
              v === 0
                ? 'bg-[var(--color-success-200)] dark:bg-[var(--color-success-800)]'
                : v <= 5
                  ? 'bg-[var(--color-warning-300)] dark:bg-[var(--color-warning-700)]'
                  : 'bg-[var(--color-danger-400)] dark:bg-[var(--color-danger-600)]'
            }`}
          />
        );
      })}
    </div>
  );
}
