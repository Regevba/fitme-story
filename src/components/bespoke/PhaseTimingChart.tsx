'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PHASES = [
  { name: 'Research', minutes: 45, color: '#4F46E5' },
  { name: 'PRD', minutes: 30, color: '#6366F1' },
  { name: 'Tasks', minutes: 20, color: '#8B5CF6' },
  { name: 'UX', minutes: 40, color: '#A855F7' },
  { name: 'Implement', minutes: 90, color: '#EC4899' },
  { name: 'Test', minutes: 35, color: '#F97066' },
  { name: 'Review', minutes: 15, color: '#F59E0B' },
  { name: 'Merge', minutes: 10, color: '#10B981' },
  { name: 'Docs', minutes: 15, color: '#14B8A6' },
];

const totalMinutes = PHASES.reduce((sum, p) => sum + p.minutes, 0);

export function PhaseTimingChart() {
  const reduced = useReducedMotion();
  return (
    <div className="my-12 font-sans" aria-label="Onboarding pilot phase timing">
      <div className="flex h-14 rounded-lg overflow-hidden">
        {PHASES.map((phase, i) => {
          const pct = (phase.minutes / totalMinutes) * 100;
          return (
            <motion.div
              key={phase.name}
              initial={reduced ? false : { width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: phase.color }}
              title={`${phase.name}: ${phase.minutes}m`}
            >
              {pct > 7 && phase.name}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 md:grid-cols-9 gap-3 text-xs">
        {PHASES.map((phase) => (
          <div key={phase.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: phase.color }} />
            <span>{phase.name}</span>
            <span className="text-[var(--color-neutral-500)] ml-auto">{phase.minutes}m</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">
        Total: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m — the first fully PM-orchestrated feature (v2.0 pilot).
      </p>
    </div>
  );
}
