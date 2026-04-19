'use client';

import { motion } from 'framer-motion';
import { usePersona, type Persona } from '@/lib/persona';

const OPTIONS: { value: Exclude<Persona, null>; label: string }[] = [
  { value: 'hr', label: "I'm hiring" },
  { value: 'pm', label: 'I run a team' },
  { value: 'dev', label: 'I build software' },
  { value: 'academic', label: 'I research this' },
];

export function PersonaBar() {
  const [persona, setPersona] = usePersona();

  return (
    <div className="flex flex-wrap gap-2 justify-center font-sans" role="group" aria-label="Select your perspective">
      {OPTIONS.map((opt) => {
        const isActive = persona === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setPersona(isActive ? null : opt.value)}
            aria-pressed={isActive}
            className="relative px-4 py-2 rounded-full text-sm border transition-colors border-[var(--color-neutral-300)] hover:border-[var(--color-brand-indigo)]"
          >
            {isActive && (
              <motion.span
                layoutId="persona-pill-active"
                className="absolute inset-0 rounded-full bg-[var(--color-brand-indigo)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative ${isActive ? 'text-white' : ''}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
