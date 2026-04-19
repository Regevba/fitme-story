'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Lane {
  feature: string;         // "Push Notifications"
  complexity: string;      // "Medium · permission handling"
  endedAt: number;         // minute offset where this lane finished (e.g. 54 for all of them)
  colorVar: string;        // 'var(--skill-xxx)' — lane's accent
  phaseMark: string;       // "Testing 10/12 tasks" — what phase/progress it ended in
}

interface Props {
  lanes: Lane[];
  totalMinutes: number;    // e.g. 54
  caption?: string;
  className?: string;
}

export function ParallelGantt({ lanes, totalMinutes, caption, className = '' }: Props) {
  const reduced = useReducedMotion();

  return (
    <figure
      className={`my-10 max-w-[var(--measure-wide)] mx-auto font-sans ${className}`}
      aria-label={`Parallel Gantt chart — ${lanes.length} features running concurrently over ${totalMinutes} minutes`}
    >
      {/* Time-scale header */}
      <div className="mb-3 ml-[12rem] flex justify-between text-[10px] uppercase tracking-wider text-[var(--color-neutral-500)]">
        <span>0 min</span>
        <span>{Math.round(totalMinutes / 2)} min</span>
        <span>{totalMinutes} min — all four finished</span>
      </div>

      {/* Lanes */}
      <div className="space-y-2">
        {lanes.map((lane, i) => {
          const widthPct = (lane.endedAt / totalMinutes) * 100;
          return (
            <div key={lane.feature} className="grid grid-cols-[12rem_1fr] items-center gap-3">
              <div className="text-right pr-3">
                <div className="text-sm font-medium truncate">{lane.feature}</div>
                <div className="text-[10px] text-[var(--color-neutral-500)] truncate">{lane.complexity}</div>
              </div>
              <div className="relative h-8 rounded-md bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] overflow-hidden">
                <motion.div
                  initial={reduced ? false : { width: 0 }}
                  whileInView={{ width: `${widthPct}%` }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : i * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
                  className="h-full rounded-md flex items-center justify-end pr-3 text-xs font-medium text-white"
                  style={{ backgroundColor: lane.colorVar }}
                  role="img"
                  aria-label={`${lane.feature}: finished at ${lane.endedAt} minutes in ${lane.phaseMark}`}
                >
                  <span className="truncate">{lane.phaseMark}</span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Convergence line at totalMinutes */}
      <div className="mt-3 ml-[12rem] text-[10px] text-right text-[var(--color-brand-coral)] font-semibold uppercase tracking-wider">
        ↕ all four converge here
      </div>

      {caption && (
        <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">{caption}</figcaption>
      )}
    </figure>
  );
}
