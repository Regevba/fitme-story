/**
 * Shared primitives for analytics dashboard tiles.
 *
 * Phase 3.A.1 of analytics-observability. Lives next to the tile components
 * (EventVolumeTile, DriftTrendTile, …) rather than in the broader
 * `primitives.tsx` to keep this PR's blast radius limited to the new
 * `/control-room/analytics` route.
 *
 * Server-compatible: pure render, no hooks, no client APIs.
 */

import type { TileBand, TileMeta } from '@/lib/control-room/analytics-types';

// ────────────────────────────────────────────────────────────────────────────
// Formatters
// ────────────────────────────────────────────────────────────────────────────

/** Format a number with thousands separators. */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** Format a percentage to 1 decimal place when fractional, integer otherwise. */
export function formatPct(n: number): string {
  if (Number.isInteger(n)) return `${n}%`;
  return `${n.toFixed(1)}%`;
}

/** Format an ISO-8601 timestamp as a short relative time (e.g. "2m ago"). */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffSec = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

// ────────────────────────────────────────────────────────────────────────────
// Color helpers
// ────────────────────────────────────────────────────────────────────────────

/** Return a Tailwind background-color class for a band. */
export function bandColorClass(band: TileBand): string {
  switch (band) {
    case 'green':
      return 'bg-[var(--color-success-500)]';
    case 'amber':
      return 'bg-[var(--color-warning-500)]';
    case 'red':
      return 'bg-[var(--color-danger-500)]';
    default:
      return 'bg-[var(--color-neutral-400)]';
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Tile meta badge
// ────────────────────────────────────────────────────────────────────────────

export interface TileMetaBadgeProps {
  meta: TileMeta;
}

/**
 * Renders a small badge in the top-right corner of a tile indicating
 * fixture vs live data + last-refresh time.
 *
 * During the calibration window (2026-05-14 → 2026-06-04), every
 * GA4-backed tile shows "Fixture data" prominently to remind the operator
 * that live binding has not shipped yet.
 */
export function TileMetaBadge({ meta }: TileMetaBadgeProps) {
  const isFixture = meta.status === 'fixture';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wider ${
        isFixture
          ? 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)] dark:bg-[var(--color-warning-900)] dark:text-[var(--color-warning-200)]'
          : 'bg-[var(--color-success-100)] text-[var(--color-success-700)] dark:bg-[var(--color-success-900)] dark:text-[var(--color-success-200)]'
      }`}
      title={`Source: ${meta.source}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {isFixture ? 'Fixture' : 'Live'}
    </span>
  );
}
