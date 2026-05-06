'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FLOORS, compareVersions } from './blueprint-data';

interface BlueprintOverlayProps {
  interactive?: boolean;
  /** When set, floors with a `version` newer than this render as inactive
   *  (dimmed, non-interactive, "shipped at vX.Y" badge). Used on case studies
   *  for features that pre-date later floors. */
  activeAsOf?: string;
}

export function BlueprintOverlay({ interactive = true, activeAsOf }: BlueprintOverlayProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <div className="my-12 max-w-4xl mx-auto font-sans" aria-label="Framework blueprint overlay">
      <ol className="flex flex-col-reverse gap-px">
        {FLOORS.map((floor) => {
          const isInactive = activeAsOf !== undefined && compareVersions(floor.version, activeAsOf) > 0;
          const isHovered = hovered === floor.level && !isInactive;
          const focusable = interactive && !isInactive;
          return (
            <motion.li
              key={floor.level}
              onHoverStart={() => focusable && setHovered(floor.level)}
              onHoverEnd={() => focusable && setHovered(null)}
              onFocus={() => focusable && setHovered(floor.level)}
              onBlur={() => focusable && setHovered(null)}
              tabIndex={focusable ? 0 : -1}
              aria-disabled={isInactive || undefined}
              animate={reduced ? {} : { scale: isHovered ? 1.02 : 1 }}
              className="relative rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-5 bg-white dark:bg-[var(--color-neutral-900)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)]"
              style={{
                borderLeft: `6px solid ${isInactive ? 'var(--color-neutral-300)' : floor.accent}`,
                backgroundColor: isHovered ? `${floor.accent}14` : undefined,
                opacity: isInactive ? 0.45 : 1,
              }}
            >
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">Floor {floor.level}</span>
                <span className="font-serif text-xl">{floor.name}</span>
                <span className="text-sm text-[var(--color-neutral-500)]">{floor.sub}</span>
                {isInactive && (
                  <span className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)] border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-700)] rounded px-2 py-0.5">
                    Not yet — shipped v{floor.version}
                  </span>
                )}
              </div>
              <motion.div
                initial={false}
                animate={{
                  height: isHovered ? 'auto' : 0,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: reduced ? 0 : 0.25 }}
                className="overflow-hidden"
              >
                <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                  {floor.components.map((c) => (
                    <li key={c} className="px-2 py-1 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">
                      {c}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.li>
          );
        })}
      </ol>
      {interactive && (
        <p className="mt-6 text-center text-sm text-[var(--color-neutral-500)]">
          {activeAsOf
            ? `Hover or focus a floor to reveal its components. Floors above v${activeAsOf} did not exist when this feature shipped.`
            : 'Hover or focus a floor to reveal its components.'}
        </p>
      )}
    </div>
  );
}
