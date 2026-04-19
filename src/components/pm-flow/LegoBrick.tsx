'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSkill } from '@/lib/skill-ecosystem';
import type { Skill, SkillSlug } from '@/lib/skill-ecosystem';

interface Props {
  skill: Skill;
  isOpen: boolean;
  onToggle: () => void;
  onPickSkill: (slug: SkillSlug) => void; // clicking an invokes/invoked-by chip
}

// Open/close animation sequencing:
//
// Open:  isOpen=true → expanded=true immediately → container expands (CSS
//        grid snap via col-span-full) → AnimatePresence enter fades details
//        in after ~150ms (waits for container + sibling reflow to settle).
//
// Close: isOpen=false → AnimatePresence exit starts (details animate both
//        height AND opacity to 0 over ~250ms) → onExitComplete fires →
//        expanded=false → container collapses → siblings reflow.
//
// The key to clean timing is that the container stays wide (expanded=true)
// throughout the details' exit animation. Because the details animate their
// OWN height to 0, the container's natural height shrinks with them — so
// there's no moment where a wide-but-empty container snaps narrow.
export function LegoBrick({ skill, isOpen, onToggle, onPickSkill }: Props) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setExpanded(true);
    // Close case is handled by AnimatePresence onExitComplete.
  }, [isOpen]);

  const hoverTintStyle =
    hovered && !expanded ? { backgroundColor: `${skill.accent}18` } : {};

  return (
    <motion.div
      // layout="position" animates ONLY translate (for sibling reflow),
      // never scale — active brick never gets its content stretched.
      layout="position"
      transition={{ type: 'spring', stiffness: 300, damping: 34 }}
      className={`relative overflow-hidden rounded-md ${
        expanded ? 'col-span-full z-10' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent stripe lives outside the button so its width stays fixed
          regardless of any transforms on inner content. */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1.5 pointer-events-none"
        style={{ backgroundColor: skill.accent }}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full text-left rounded-md border bg-white dark:bg-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)] overflow-hidden transition-shadow pl-1.5 ${
          expanded
            ? 'border-transparent shadow-xl'
            : 'border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]'
        }`}
        style={hoverTintStyle}
      >
        <div className={expanded ? 'p-6 md:p-8' : 'p-4'}>
          <div className="flex items-center gap-2 font-sans text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: skill.accent }}
              aria-hidden
            />
            <span className="uppercase tracking-wider text-[var(--color-neutral-500)]">
              {skill.ring === 'hub'
                ? 'Hub · all phases'
                : skill.ring === 'outer'
                ? 'Outer · feedback'
                : `Owns ${skill.phaseOwnership.join(', ')}`}
            </span>
            {expanded && (
              <span
                aria-hidden
                className="ml-auto uppercase tracking-wider text-[var(--color-neutral-500)]"
              >
                ↺ close
              </span>
            )}
          </div>

          <div
            className={`mt-1 font-serif leading-tight ${
              expanded ? 'text-2xl md:text-3xl' : 'text-lg'
            }`}
          >
            {skill.displayName}
          </div>

          <p
            className={`mt-2 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] ${
              expanded ? 'text-base md:text-lg max-w-[var(--measure-body)]' : 'text-xs'
            }`}
          >
            {skill.oneLiner}
          </p>

          <AnimatePresence
            initial={false}
            onExitComplete={() => {
              // Only collapse if the parent still wants it closed. If the
              // user re-opened mid-exit, isOpen will already be true and
              // we keep expanded=true.
              if (!isOpen) setExpanded(false);
            }}
          >
            {isOpen && (
              <motion.div
                key="details"
                initial={
                  reduced
                    ? { opacity: 1, height: 'auto' }
                    : { opacity: 0, height: 0 }
                }
                animate={{
                  opacity: 1,
                  height: 'auto',
                  transition: {
                    height: { duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.1 },
                    opacity: { duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.2 },
                  },
                }}
                // On close: shrink height and fade opacity together. The
                // container stays expanded=true until this finishes, so the
                // grid cell's natural height follows the details down to 0
                // smoothly — no mid-air snap.
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: { duration: reduced ? 0 : 0.25 },
                    opacity: { duration: reduced ? 0 : 0.18 },
                  },
                }}
                style={{ overflow: 'hidden' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-sm"
              >
                <div className="mt-6">
                  <SectionLabel>Purpose</SectionLabel>
                  <p className="mt-1 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
                    {skill.purpose}
                  </p>

                  <div className="mt-5">
                    <SectionLabel>Sub-commands</SectionLabel>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skill.subCommands.map((c) => (
                        <code
                          key={c}
                          className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] font-mono"
                        >
                          {c}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {skill.invokes.length > 0 && (
                    <div>
                      <SectionLabel>Invokes</SectionLabel>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {skill.invokes.map((s) => (
                          <SkillChip key={s} slug={s} onPick={onPickSkill} />
                        ))}
                      </div>
                    </div>
                  )}

                  {skill.invokedBy.length > 0 && (
                    <div className={skill.invokes.length > 0 ? 'mt-5' : ''}>
                      <SectionLabel>Invoked by</SectionLabel>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {skill.invokedBy.map((s) => (
                          <SkillChip key={s} slug={s} onPick={onPickSkill} />
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-5 text-xs italic text-[var(--color-neutral-500)] leading-relaxed">
                    {skill.standaloneExample}
                  </p>

                  <Link
                    href={skill.docsHref}
                    className="mt-4 inline-block text-xs underline text-[var(--color-brand-indigo)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Full docs →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)] font-sans font-semibold">
      {children}
    </span>
  );
}

function SkillChip({
  slug,
  onPick,
}: {
  slug: SkillSlug;
  onPick: (s: SkillSlug) => void;
}) {
  const s = getSkill(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPick(slug);
      }}
      className="text-[11px] px-2.5 py-1 min-h-[24px] inline-flex items-center rounded font-sans hover:underline text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-100)]"
      style={{ backgroundColor: `${s.accent}33` }}
    >
      {s.displayName}
    </button>
  );
}
