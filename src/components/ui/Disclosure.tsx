'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

interface DisclosureProps {
  label: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Disclosure({ label, summary, defaultOpen = false, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();
  const panelId = useId();

  return (
    <div className="rounded-md border border-[var(--color-neutral-200)] bg-white dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center gap-4 px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)] focus:ring-inset"
      >
        <div className="flex-1">
          <div className="font-serif text-lg leading-tight">{label}</div>
          {summary ? (
            <p className="mt-1 text-xs font-sans text-[var(--color-neutral-500)]">{summary}</p>
          ) : null}
        </div>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="shrink-0 text-[var(--color-neutral-500)]"
        >
          <ChevronDown width={20} height={20} strokeWidth={1.75} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={reduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: reduced ? 0 : 0.28 },
                opacity: { duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: reduced ? 0 : 0.22 },
                opacity: { duration: reduced ? 0 : 0.15 },
              },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-5 py-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
