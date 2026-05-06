'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FLOORS } from './blueprint-data';

export function BlueprintOverlay({ interactive = true }: { interactive?: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <div className="my-12 max-w-4xl mx-auto font-sans" aria-label="Framework blueprint overlay">
      <ol className="flex flex-col-reverse gap-px">
        {FLOORS.map((floor) => {
          const isHovered = hovered === floor.level;
          return (
            <motion.li
              key={floor.level}
              onHoverStart={() => interactive && setHovered(floor.level)}
              onHoverEnd={() => interactive && setHovered(null)}
              onFocus={() => interactive && setHovered(floor.level)}
              onBlur={() => interactive && setHovered(null)}
              tabIndex={interactive ? 0 : -1}
              animate={reduced ? {} : { scale: isHovered ? 1.02 : 1 }}
              className="relative rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-5 bg-white dark:bg-[var(--color-neutral-900)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)]"
              style={{
                borderLeft: `6px solid ${floor.accent}`,
                backgroundColor: isHovered ? `${floor.accent}14` : undefined,
              }}
            >
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">Floor {floor.level}</span>
                <span className="font-serif text-xl">{floor.name}</span>
                <span className="text-sm text-[var(--color-neutral-500)]">{floor.sub}</span>
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
          Hover or focus a floor to reveal its components.
        </p>
      )}
    </div>
  );
}
