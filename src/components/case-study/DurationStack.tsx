'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Segment {
  label: string;          // "Research", "PRD", "Implement"
  minutes: number;        // e.g. 45
  colorVar: string;       // 'var(--skill-research)' or 'var(--color-brand-indigo)'
}

interface Props {
  segments: Segment[];
  caption?: string;       // "v2.0 pilot — 9 phases, 5h total"
  showLegend?: boolean;   // default true
  className?: string;
}

export function DurationStack({ segments, caption, showLegend = true, className = '' }: Props) {
  const reduced = useReducedMotion();
  const total = segments.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <figure
      className={`my-10 max-w-[var(--measure-body)] mx-auto font-sans ${className}`}
      aria-label={`Duration breakdown totaling ${total} minutes across ${segments.length} segments`}
    >
      <div className="flex h-14 rounded-lg overflow-hidden">
        {segments.map((seg, i) => {
          const pct = (seg.minutes / total) * 100;
          return (
            <motion.div
              key={seg.label + i}
              initial={reduced ? false : { width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: seg.colorVar }}
              role="img"
              aria-label={`${seg.label}: ${seg.minutes} minutes, ${pct.toFixed(1)} percent`}
              title={`${seg.label}: ${seg.minutes}m`}
            >
              {pct > 7 && seg.label}
            </motion.div>
          );
        })}
      </div>
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: seg.colorVar }} aria-hidden />
              <span>{seg.label}</span>
              <span className="text-[var(--color-neutral-500)] ml-auto">{seg.minutes}m</span>
            </div>
          ))}
        </div>
      )}
      {caption && (
        <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">
          {caption} · Total: {Math.floor(total / 60)}h {total % 60}m
        </figcaption>
      )}
    </figure>
  );
}
