'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface Side {
  label: string;        // "Before", "Serial", "v4.3"
  value: string;        // "3.21 min/CU", "4× 15 min"
  subtitle?: string;    // "baseline measurement"
  accentVar?: string;   // defaults to neutral-500 for "before"
}

interface Props {
  before: Side;
  after: Side;
  delta?: string;       // "+79%", "12.4× faster" — shown on the arrow
  className?: string;
}

export function BeforeAfter({ before, after, delta, className = '' }: Props) {
  const reduced = useReducedMotion();
  const beforeAccent = before.accentVar ?? 'var(--color-neutral-500)';
  const afterAccent = after.accentVar ?? 'var(--color-brand-indigo)';

  return (
    <figure
      className={`my-10 max-w-[var(--measure-body)] mx-auto ${className}`}
      aria-label={`Comparison: ${before.label} ${before.value} versus ${after.label} ${after.value}`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.5 }}
          className="text-center"
        >
          <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
            {before.label}
          </div>
          <div className="mt-2 font-serif text-4xl" style={{ color: beforeAccent }}>
            {before.value}
          </div>
          {before.subtitle && (
            <div className="mt-1 text-xs text-[var(--color-neutral-500)] font-sans">{before.subtitle}</div>
          )}
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.15 }}
          className="flex flex-col items-center gap-1 text-[var(--color-brand-coral)]"
          aria-hidden
        >
          <ArrowRight size={28} />
          {delta && <span className="text-xs font-sans font-semibold">{delta}</span>}
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.1 }}
          className="text-center"
        >
          <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
            {after.label}
          </div>
          <div className="mt-2 font-serif text-4xl" style={{ color: afterAccent }}>
            {after.value}
          </div>
          {after.subtitle && (
            <div className="mt-1 text-xs text-[var(--color-neutral-500)] font-sans">{after.subtitle}</div>
          )}
        </motion.div>
      </div>
    </figure>
  );
}
