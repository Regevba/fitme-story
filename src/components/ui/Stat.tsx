import * as React from 'react';

export type StatSize = 'sm' | 'md' | 'lg';

export interface StatProps {
  /** The big number / value. Strings preferred so callers can format (e.g. "100%", "1.2K"). */
  value: React.ReactNode;
  /** Short label rendered below the value in muted uppercase. */
  label: React.ReactNode;
  /** Optional sub-label (e.g. "/ 30 total") shown beneath the label. */
  sublabel?: React.ReactNode;
  /** Size scale for the value. sm = text-3xl; md = text-4xl; lg = text-5xl. Default 'md'. */
  size?: StatSize;
  /** Use brand-indigo accent for the value (otherwise default neutral text). Default false. */
  accent?: boolean;
  /** Use serif typeface for the value (matches editorial pages like ParitySummaryCard). Default true. */
  serif?: boolean;
  /** Center-align value + label (typical for stat-grid use). Default true. */
  centered?: boolean;
  /** Additional className for one-off layout overrides. */
  className?: string;
}

const sizeClasses: Record<StatSize, string> = {
  sm: 'text-3xl',
  md: 'text-4xl',
  lg: 'text-5xl',
};

/**
 * Editorial metric-display primitive — a big number + small label.
 *
 * Replaces inline `text-{3,4,5}xl font-semibold text-[var(--color-brand-indigo)]`
 * patterns repeated across NumbersPanel (home), OriginNarrative (home),
 * timeline pages, and ParitySummaryCard (design-system showcase).
 *
 * Closes BHF-4 from DS lens audit 2026-05-10.
 *
 * Usage:
 *   <Stat value="100%" label="Public parity" sublabel="17 / 17" size="sm" accent />
 *   <Stat value="3.5x" label="Speedup" size="lg" accent />
 *   <Stat value={n.value} label={n.label} accent serif={false} />
 */
export function Stat({
  value,
  label,
  sublabel,
  size = 'md',
  accent = false,
  serif = true,
  centered = true,
  className = '',
}: StatProps) {
  const valueClasses = [
    serif ? 'font-serif' : 'font-sans',
    sizeClasses[size],
    'font-semibold',
    accent ? 'text-[var(--color-brand-indigo)]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [centered ? 'text-center' : '', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses || undefined}>
      <div className={valueClasses}>{value}</div>
      <div className="text-[11px] font-sans uppercase tracking-wide text-[var(--color-neutral-500)] mt-1">
        {label}
      </div>
      {sublabel != null && (
        <div className="text-[10px] font-mono text-[var(--color-neutral-500)]">
          {sublabel}
        </div>
      )}
    </div>
  );
}
