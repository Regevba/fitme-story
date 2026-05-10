import * as React from 'react';
import { getDesignSystemMetrics } from '@/lib/design-system';

export function ParitySummaryCard() {
  const m = getDesignSystemMetrics();
  return (
    <aside
      className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-4 mb-6"
      aria-label="Design system parity summary"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div className="font-serif text-3xl font-semibold text-[var(--color-brand-indigo)]">
            {m.parityCoverage}%
          </div>
          <div className="text-[11px] font-sans uppercase tracking-wide text-[var(--color-neutral-500)] mt-1">
            Public parity
          </div>
          <div className="text-[10px] font-mono text-[var(--color-neutral-500)]">
            {m.publicMapped} / {m.publicTotal}
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-semibold">{m.mapped}</div>
          <div className="text-[11px] font-sans uppercase tracking-wide text-[var(--color-neutral-500)] mt-1">
            Total mapped <span className="text-[var(--color-neutral-500)]">/ {m.total}</span>
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl font-semibold">{m.totalFigmaNodes}</div>
          <div className="text-[11px] font-sans uppercase tracking-wide text-[var(--color-neutral-500)] mt-1">
            Figma nodes
          </div>
        </div>
        <div>
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
