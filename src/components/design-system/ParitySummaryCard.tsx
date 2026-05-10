import * as React from 'react';
import { getDesignSystemMetrics } from '@/lib/design-system';
import { Stat } from '@/components/ui/Stat';

export function ParitySummaryCard() {
  const m = getDesignSystemMetrics();
  return (
    <aside
      className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-4 mb-6"
      aria-label="Design system parity summary"
    >
      {/* BHF-4 (DS lens audit 2026-05-10): 3 of 4 stats migrated to <Stat>.
          The 4th (Dark designed, emerald-tinted) keeps inline styling because
          Stat's `accent` prop only covers brand-indigo; adding an emerald
          variant would expand the API for a single consumer. Acceptable
          trade-off; revisit if a second emerald-stat consumer appears. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat
          value={`${m.parityCoverage}%`}
          label="Public parity"
          sublabel={`${m.publicMapped} / ${m.publicTotal}`}
          size="sm"
          accent
        />
        <Stat
          value={m.mapped}
          label={
            <>
              Total mapped <span className="text-[var(--color-neutral-500)]">/ {m.total}</span>
            </>
          }
          size="sm"
        />
        <Stat value={m.totalFigmaNodes} label="Figma nodes" size="sm" />
        <div className="text-center">
          <div className="font-serif text-3xl font-semibold text-emerald-700 dark:text-emerald-300">
            {m.darkModeBreakdown.Designed}
          </div>
          <div className="text-[11px] font-sans uppercase tracking-wide text-[var(--color-neutral-500)] mt-1">
            Dark designed
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs font-sans text-[var(--color-neutral-500)] text-center">
        Status breakdown: {m.statusBreakdown.Stable} Stable ·{' '}
        {m.statusBreakdown.Internal} Internal ·{' '}
        {m.statusBreakdown.Experimental} Experimental ·{' '}
        {m.statusBreakdown.Deprecated} Deprecated
      </p>
      <p className="mt-1 text-[11px] font-sans text-[var(--color-neutral-500)] text-center italic">
        Public parity excludes Internal components from the denominator —
        operator-only surfaces follow code-first design, not Figma-first.
      </p>
    </aside>
  );
}
