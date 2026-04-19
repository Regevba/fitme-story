'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCurrentPersona } from '@/lib/persona-context';

type PersonaKey = 'default' | 'hr' | 'pm' | 'dev' | 'academic';

const NUMBERS: { value: string; labels: Record<PersonaKey, string> }[] = [
  {
    value: '16',
    labels: {
      default: 'features shipped',
      hr: 'shipping outcomes',
      pm: 'tracked features',
      dev: 'features in the dataset',
      academic: 'normalized data points',
    },
  },
  {
    value: '7',
    labels: {
      default: 'framework versions',
      hr: 'capability levels',
      pm: 'workflow generations',
      dev: 'framework versions',
      academic: 'evolution milestones',
    },
  },
  {
    value: '5.6×',
    labels: {
      default: 'serial speedup',
      hr: 'faster shipping',
      pm: 'lifecycle speedup',
      dev: 'serial min/CU reduction',
      academic: 'velocity improvement (normalized)',
    },
  },
  {
    value: '12.4×',
    labels: {
      default: 'parallel throughput',
      hr: '4 features · 54 minutes',
      pm: 'concurrent phases',
      dev: 'parallel throughput',
      academic: 'batch scaling factor',
    },
  },
  {
    value: '185',
    labels: {
      default: 'audit findings (12 critical)',
      hr: 'issues found + published',
      pm: 'findings tracked',
      dev: 'audit items (12 critical)',
      academic: 'full-system review findings',
    },
  },
];

const FOOTER_LINE: Record<PersonaKey, string> = {
  default: 'Cross-feature velocity normalized by CU formula (R²=0.82).',
  hr: 'Speed + scope calibrated by an AI-engine normalization formula (R²=0.82).',
  pm: 'Lifecycle normalized for cross-feature comparison (R²=0.82).',
  dev: 'Complexity Units (CU), power-law fit R²=0.82.',
  academic: 'Cross-feature complexity normalized via log-linear CU regression (R²=0.82).',
};

export function NumbersPanel() {
  const reduced = useReducedMotion();
  const persona = useCurrentPersona();
  const key: PersonaKey = persona ?? 'default';

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
                {n.labels[key]}
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm font-sans text-[var(--color-neutral-500)]">
          <span className="text-[var(--color-brand-coral)]">{FOOTER_LINE[key]}</span>
        </p>
      </div>
    </section>
  );
}
