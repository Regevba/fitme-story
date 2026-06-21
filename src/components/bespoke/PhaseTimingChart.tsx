'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Phase colors reuse the project's semantic --skill-* token palette so the
// stack reads as siblings to the rest of the site rather than an ad-hoc gradient.
const PHASES = [
  { name: 'Research', minutes: 45, color: 'var(--skill-research)' },
  { name: 'PRD', minutes: 30, color: 'var(--skill-pm-workflow)' },
  { name: 'Tasks', minutes: 20, color: 'var(--color-brand-indigo)' },
  { name: 'UX', minutes: 40, color: 'var(--skill-ux)' },
  { name: 'Implement', minutes: 90, color: 'var(--skill-design)' },
  { name: 'Test', minutes: 35, color: 'var(--color-brand-coral)' },
  { name: 'Review', minutes: 15, color: 'var(--skill-qa)' },
  { name: 'Merge', minutes: 10, color: 'var(--skill-release)' },
  { name: 'Release', minutes: 15, color: 'var(--skill-release)' },
];

const totalMinutes = PHASES.reduce((sum, p) => sum + p.minutes, 0);

export function PhaseTimingChart() {
  const reduced = useReducedMotion();
  return (
    <figure className="my-12 font-sans" aria-label="Onboarding pilot phase timing">
      <div
        role="img"
        aria-label={`Stacked phase timing. Total ${Math.floor(totalMinutes / 60)} hours ${totalMinutes % 60} minutes. ${PHASES.map((p) => `${p.name} ${p.minutes} minutes`).join(', ')}.`}
        className="flex h-14 rounded-lg overflow-hidden"
      >
        {PHASES.map((phase, i) => {
          const pct = (phase.minutes / totalMinutes) * 100;
          return (
            <motion.div
              key={phase.name}
              initial={reduced ? false : { width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ backgroundColor: phase.color }}
              title={`${phase.name}: ${phase.minutes}m`}
            />
          );
        })}
      </div>
      <figcaption className="mt-5">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-2 text-xs">
          {PHASES.map((phase) => (
            <li key={phase.name} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: phase.color }}
              />
              <span className="font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                {phase.name}
              </span>
              <span className="ml-auto tabular-nums text-[var(--color-neutral-500)]">
                {phase.minutes}m
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">
          Total: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m — the first fully PM-orchestrated feature (v2.0 pilot).
        </p>
      </figcaption>
    </figure>
  );
}
