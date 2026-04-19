'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { usePersona, useCurrentPersona } from '@/lib/persona-context';

const PERSONA_LABELS: Record<string, string> = {
  hr: 'a hiring manager',
  pm: 'a product manager',
  dev: 'a developer',
  academic: 'a researcher',
};

export function PersonaIndicator() {
  const persona = useCurrentPersona();
  const [, setPersona] = usePersona();
  const reduced = useReducedMotion();

  if (!persona) return null;

  const label = PERSONA_LABELS[persona] ?? persona;

  return (
    <motion.div
      key={persona}
      initial={reduced ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex items-center gap-3 mt-4 px-4 py-2 rounded-md text-sm font-sans
        border-l-4 border-[var(--color-brand-coral)]
        bg-[color-mix(in_srgb,var(--color-brand-coral)_8%,transparent)]
        text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]"
    >
      <span>
        ▸ You&apos;re reading as <strong>{label}</strong>
      </span>
      <button
        type="button"
        onClick={() => setPersona(null)}
        aria-label="Clear persona filter"
        className="ml-1 flex items-center justify-center w-6 h-6 min-w-[44px] min-h-[44px]
          -m-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-brand-coral)_15%,transparent)]
          transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-[var(--color-brand-coral)]"
      >
        <X size={14} aria-hidden />
      </button>
    </motion.div>
  );
}
