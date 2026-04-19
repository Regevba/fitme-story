'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { getSkill } from '@/lib/skill-ecosystem';
import type { Skill, SkillSlug } from '@/lib/skill-ecosystem';

interface Props {
  skill: Skill;
  isOpen: boolean;
  onToggle: () => void;
  onPickSkill: (slug: SkillSlug) => void; // clicking an invokes/invoked-by chip
}

// Opening a brick expands it to take the full grid row ("center stage") while
// Framer's `layout` prop animates the surrounding bricks into their new
// positions. No 3D flip, no absolute-positioned back face — just grid
// reflow + content reveal.
export function LegoBrick({ skill, isOpen, onToggle, onPickSkill }: Props) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const hoverTintStyle =
    hovered && !isOpen ? { backgroundColor: `${skill.accent}18` } : {};

  return (
    <motion.div
      layoutId={`brick-${skill.slug}`}
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className={`relative ${isOpen ? 'col-span-full z-10' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full text-left rounded-md border bg-white dark:bg-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)] overflow-hidden transition-shadow ${
          isOpen
            ? 'border-transparent shadow-xl'
            : 'border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]'
        }`}
        style={{
          borderLeft: `6px solid ${skill.accent}`,
          ...hoverTintStyle,
        }}
      >
        <motion.div layout="position" className={isOpen ? 'p-6 md:p-8' : 'p-4'}>
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
            {isOpen && (
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
              isOpen ? 'text-2xl md:text-3xl' : 'text-lg'
            }`}
          >
            {skill.displayName}
          </div>

          <p
            className={`mt-2 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] ${
              isOpen ? 'text-base md:text-lg max-w-[var(--measure-body)]' : 'text-xs'
            }`}
          >
            {skill.oneLiner}
          </p>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="details"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                transition={{
                  duration: reduced ? 0 : 0.35,
                  delay: reduced ? 0 : 0.15,
                }}
                className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-sm"
              >
                <div>
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

                <div>
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
        </motion.div>
      </motion.button>
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
