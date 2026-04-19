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
  // Object-form props (for programmatic use)
  before?: Side;
  after?: Side;
  // Flat-string props (for MDX inline use — RSC-safe primitives)
  beforeLabel?: string;
  beforeValue?: string;
  beforeSubtitle?: string;
  afterLabel?: string;
  afterValue?: string;
  afterSubtitle?: string;
  afterAccentVar?: string;
  delta?: string;       // "+79%", "12.4× faster" — shown on the arrow
  className?: string;
}

export function BeforeAfter({
  before,
  after,
  beforeLabel,
  beforeValue,
  beforeSubtitle,
  afterLabel,
  afterValue,
  afterSubtitle,
  afterAccentVar,
  delta,
  className = '',
}: Props) {
  const reduced = useReducedMotion();

  // Resolve from either object-form or flat-string props
  const bLabel = before?.label ?? beforeLabel ?? '';
  const bValue = before?.value ?? beforeValue ?? '';
  const bSubtitle = before?.subtitle ?? beforeSubtitle;
  const aLabel = after?.label ?? afterLabel ?? '';
  const aValue = after?.value ?? afterValue ?? '';
  const aSubtitle = after?.subtitle ?? afterSubtitle;

  const beforeAccent = before?.accentVar ?? 'var(--color-neutral-500)';
  const afterAccent = after?.accentVar ?? afterAccentVar ?? 'var(--color-brand-indigo)';

  return (
    <figure
      className={`my-10 max-w-[var(--measure-body)] mx-auto ${className}`}
      aria-label={`Comparison: ${bLabel} ${bValue} versus ${aLabel} ${aValue}`}
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
            {bLabel}
          </div>
          <div className="mt-2 font-serif text-4xl" style={{ color: beforeAccent }}>
            {bValue}
          </div>
          {bSubtitle && (
            <div className="mt-1 text-xs text-[var(--color-neutral-500)] font-sans">{bSubtitle}</div>
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
            {aLabel}
          </div>
          <div className="mt-2 font-serif text-4xl" style={{ color: afterAccent }}>
            {aValue}
          </div>
          {aSubtitle && (
            <div className="mt-1 text-xs text-[var(--color-neutral-500)] font-sans">{aSubtitle}</div>
          )}
        </motion.div>
      </div>
    </figure>
  );
}
