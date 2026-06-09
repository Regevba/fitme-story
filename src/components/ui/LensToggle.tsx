'use client';

// LensToggle — the audience point-of-view selector (Dev | PM).
//
// The one genuinely-new primitive in the dual-audience redesign: the site has
// no segmented control today. Two variants:
//   - `header`  : compact segmented control for the SiteHeader icon cluster.
//   - `chooser` : large two-card chooser for the home hero.
//
// A11y: role="radiogroup" with two role="radio" options, roving tabindex,
// ←/→/Home/End keyboard selection, visible focus ring, ≥44px targets, and a
// reduce-motion-safe active-segment transition. Selecting persists to the
// fitme_lens cookie + localStorage (via useSetLens) and fires analytics.

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { useSetLens } from '@/lib/lens-client';
import { trackHomeLensSelect, trackNavLensSwitch } from '@/lib/lens-analytics';
import { LENS_LABELS, type Lens } from '@/lib/lens';

const ORDER: Lens[] = ['pm', 'dev'];
const SHORT_LABELS: Record<Lens, string> = { dev: 'Dev', pm: 'PM' };

export function LensToggle({
  variant = 'header',
  className = '',
}: {
  variant?: 'header' | 'chooser';
  className?: string;
}) {
  const [active, setLens] = useSetLens();
  const router = useRouter();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const choose = useCallback(
    (next: Lens, source: 'header' | 'chooser') => {
      if (next === active) return;
      if (source === 'chooser') trackHomeLensSelect(next);
      else trackNavLensSwitch(active, next);
      setLens(next);
      router.refresh(); // re-render any page that read the lens server-side
    },
    [active, setLens, router],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, source: 'header' | 'chooser') => {
      const idx = ORDER.indexOf((active ?? 'pm') as Lens);
      let nextIdx = idx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % ORDER.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + ORDER.length) % ORDER.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = ORDER.length - 1;
      else return;
      e.preventDefault();
      refs.current[nextIdx]?.focus();
      choose(ORDER[nextIdx], source);
    },
    [active, choose],
  );

  if (variant === 'chooser') {
    return (
      <div
        role="radiogroup"
        aria-label="Choose your view"
        className={`grid gap-3 sm:grid-cols-2 ${className}`}
      >
        {ORDER.map((lens, i) => {
          const checked = active === lens;
          return (
            <button
              key={lens}
              ref={(el) => { refs.current[i] = el; }}
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (active === null && i === 0) ? 0 : -1}
              onClick={() => choose(lens, 'chooser')}
              onKeyDown={(e) => onKeyDown(e, 'chooser')}
              className={`text-left rounded-lg border p-5 min-h-[44px] motion-safe:transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] focus-visible:ring-offset-2 ${
                checked
                  ? 'border-[var(--color-brand-indigo)] bg-[var(--color-brand-indigo)]/5'
                  : 'border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)]'
              }`}
            >
              <span className="font-serif text-lg">{LENS_LABELS[lens]}</span>
              <span className="mt-1 block text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                {lens === 'pm'
                  ? 'The product & process story — lifecycle, outcomes, the design system.'
                  : 'The engineering — architecture, gates, the state schema, Code Connect.'}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // header (compact segmented control)
  return (
    <div
      role="radiogroup"
      aria-label="Audience lens"
      className={`inline-flex rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-0.5 ${className}`}
    >
      {ORDER.map((lens, i) => {
        const checked = active === lens;
        return (
          <button
            key={lens}
            ref={(el) => { refs.current[i] = el; }}
            role="radio"
            aria-checked={checked}
            aria-label={`View as ${LENS_LABELS[lens]}`}
            tabIndex={checked || (active === null && i === 0) ? 0 : -1}
            onClick={() => choose(lens, 'header')}
            onKeyDown={(e) => onKeyDown(e, 'header')}
            className={`min-h-[36px] rounded px-2.5 text-xs font-medium motion-safe:transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] ${
              checked
                ? 'bg-[var(--color-brand-indigo)] text-white'
                : 'text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-300)] hover:text-[var(--color-brand-indigo)]'
            }`}
          >
            {SHORT_LABELS[lens]}
          </button>
        );
      })}
    </div>
  );
}
