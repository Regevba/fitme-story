/**
 * EventVolumeTile — answers "are events firing today at the rate they fired
 * yesterday / last week?"
 *
 * Phase 3.A.1 of analytics-observability. Calibration safety: live GA4
 * binding deferred to 2026-06-04 per master plan §7.5; until then this
 * tile renders fixture data via `meta.status === 'fixture'`.
 *
 * Metric formula + thresholds: see FT2
 * `docs/master-plan/analytics-dashboard-metric-definitions.md` Tile 1.
 *
 * Server-compatible: pure render, no hooks, no client APIs.
 */

import type { EventVolumeData, TileBand } from '@/lib/control-room/analytics-types';

import { TileMetaBadge, bandColorClass, formatNumber } from './analytics-tile-primitives';

export interface EventVolumeTileProps {
  data: EventVolumeData;
}

export function EventVolumeTile({ data }: EventVolumeTileProps) {
  const delta = data.events_24h - data.events_24h_prior;
  const deltaPct =
    data.events_24h_prior === 0
      ? 0
      : Math.round((delta / data.events_24h_prior) * 100);

  return (
    <article
      className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)] p-5"
      aria-labelledby="event-volume-title"
    >
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h3 id="event-volume-title" className="font-sans text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            Event Volume
          </h3>
          <p className="mt-1 font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
            GA4 events fired in the last 24 hours
          </p>
        </div>
        <TileMetaBadge meta={data.meta} />
      </header>

      <div className="flex items-baseline gap-3">
        <span
          className={`font-sans text-3xl font-semibold tabular-nums ${bandTextColor(data.band)}`}
          aria-label={`${formatNumber(data.events_24h)} events in last 24 hours`}
        >
          {formatNumber(data.events_24h)}
        </span>
        <span
          className={`font-sans text-sm tabular-nums ${
            delta >= 0
              ? 'text-[var(--color-success-700)] dark:text-[var(--color-success-400)]'
              : 'text-[var(--color-danger-700)] dark:text-[var(--color-danger-400)]'
          }`}
        >
          {delta >= 0 ? '↑' : '↓'} {Math.abs(deltaPct)}% vs prior 24h
        </span>
      </div>

      <p className="mt-2 font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
        7-day average: <span className="tabular-nums">{formatNumber(data.events_7d_avg)}</span>{' '}
        events/day
      </p>

      <Sparkline values={data.sparkline_14d} band={data.band} />

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

function bandTextColor(band: TileBand): string {
  switch (band) {
    case 'green':
      return 'text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]';
    case 'amber':
      return 'text-[var(--color-warning-700)] dark:text-[var(--color-warning-400)]';
    case 'red':
      return 'text-[var(--color-danger-700)] dark:text-[var(--color-danger-400)]';
    default:
      return 'text-[var(--color-neutral-500)]';
  }
}

interface SparklineProps {
  values: number[];
  band: TileBand;
}

function Sparkline({ values, band }: SparklineProps) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 280;
  const h = 40;
  const stepX = w / Math.max(values.length - 1, 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const stroke =
    band === 'green'
      ? 'var(--color-success-600)'
      : band === 'amber'
        ? 'var(--color-warning-600)'
        : band === 'red'
          ? 'var(--color-danger-600)'
          : 'var(--color-neutral-500)';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 h-10 w-full"
      role="img"
      aria-label={`14-day event volume sparkline. Range ${min} to ${max}.`}
    >
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}
