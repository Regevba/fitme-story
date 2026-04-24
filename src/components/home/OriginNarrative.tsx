'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Smartphone, RefreshCw, ShieldCheck, Compass } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { ORIGIN_BEATS, type LucideIconName } from './origin-beats';

const ICON_MAP: Record<LucideIconName, ComponentType<SVGProps<SVGSVGElement>>> = {
  Smartphone,
  RefreshCw,
  ShieldCheck,
  Compass,
};

export function OriginNarrative() {
  const reduced = useReducedMotion();

  return (
    <section className="max-w-3xl mx-auto px-6 py-16" aria-label="Origin story">
      <ol className="space-y-20">
        {ORIGIN_BEATS.map((beat, i) => {
          const Icon = beat.visual.kind === 'lucide' ? ICON_MAP[beat.visual.icon] : null;
          return (
            <motion.li
              key={i}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="grid md:grid-cols-[6rem_1fr] gap-6 items-start"
            >
              <div className="font-sans text-[var(--color-neutral-500)]">
                {beat.visual.kind === 'metric' ? (
                  <div>
                    <div className="text-4xl font-semibold text-[var(--color-brand-indigo)]">{beat.visual.value}</div>
                    <div className="text-xs uppercase tracking-wider mt-1">{beat.visual.label}</div>
                  </div>
                ) : (
                  Icon && (
                    <Icon
                      width={40}
                      height={40}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="text-[var(--color-brand-indigo)]"
                    />
                  )
                )}
              </div>
              <div>
                <h2 className="font-serif text-2xl leading-tight">{beat.title}</h2>
                <p className="mt-3 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">{beat.body}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
