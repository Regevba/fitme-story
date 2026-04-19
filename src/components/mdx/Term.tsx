'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { GLOSSARY } from '@/lib/glossary';

type Props = {
  slug?: string;              // explicit glossary slug, if known
  children: React.ReactNode;  // display text
};

export function Term({ slug, children }: Props) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  // Resolve entry: by slug or by fuzzy-matching children against aliases
  const childText = typeof children === 'string' ? children.trim() : '';
  const entry =
    (slug && GLOSSARY.find((g) => g.slug === slug)) ||
    GLOSSARY.find(
      (g) =>
        g.term.toLowerCase() === childText.toLowerCase() ||
        g.aliases?.some((a) => a.toLowerCase() === childText.toLowerCase()),
    );

  if (!entry) {
    return <span>{children}</span>;
  }

  return (
    <span className="relative inline-block">
      <Link
        href={`/glossary#${entry.slug}`}
        className="underline decoration-dotted underline-offset-2 decoration-[var(--color-brand-coral)] hover:text-[var(--color-brand-indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)] rounded-sm"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-describedby={`term-tooltip-${entry.slug}`}
      >
        {children}
      </Link>
      <AnimatePresence>
        {open && (
          <motion.span
            id={`term-tooltip-${entry.slug}`}
            role="tooltip"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
            className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-3 rounded-lg bg-[var(--color-neutral-900)] text-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-900)] text-xs font-sans leading-relaxed shadow-lg"
          >
            <span className="block font-semibold mb-1">{entry.term}</span>
            <span className="block">{entry.tooltip}</span>
            <span className="block mt-2 text-[var(--color-brand-coral)]">Click to read more →</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
