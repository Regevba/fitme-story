'use client';

import { motion, useReducedMotion } from 'framer-motion';

const NUMBERS = [
  { value: '16', label: 'features shipped' },
  { value: '7', label: 'framework versions' },
  { value: '5.6×', label: 'serial speedup' },
  { value: '12.4×', label: 'parallel throughput' },
  { value: '185', label: 'audit findings (12 critical)' },
];

export function NumbersPanel() {
  const reduced = useReducedMotion();
  return (
    <section className="py-20 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif text-3xl text-center mb-12">The numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {NUMBERS.map((n, i) => (
            <motion.div
              key={i}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduced ? 0 : i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-5xl font-semibold text-[var(--color-brand-indigo)]">{n.value}</div>
              <div className="mt-2 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                {n.label}
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm font-sans text-[var(--color-neutral-500)]">
          Cross-feature velocity normalized by <span className="text-[var(--color-brand-coral)]">CU formula (R²=0.82)</span>.
        </p>
      </div>
    </section>
  );
}
