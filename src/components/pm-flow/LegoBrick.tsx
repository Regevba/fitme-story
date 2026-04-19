'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { getSkill } from '@/lib/skill-ecosystem';
import type { Skill, SkillSlug } from '@/lib/skill-ecosystem';

interface Props {
  skill: Skill;
  isOpen: boolean;
  onToggle: () => void;
  onPickSkill: (slug: SkillSlug) => void;   // clicking an invokes/invoked-by chip
}

export function LegoBrick({ skill, isOpen, onToggle, onPickSkill }: Props) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // Soft background tint when hovered/focused (skill color at ~10% alpha)
  const hoverTintStyle = hovered
    ? { backgroundColor: `${skill.accent}18` }
    : {};

  return (
    <motion.div
      layoutId={`brick-${skill.slug}`}
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="relative"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)]"
        style={{
          borderLeft: `6px solid ${skill.accent}`,
          transformStyle: 'preserve-3d',
          ...hoverTintStyle,
        }}
        animate={reduced ? {} : { rotateY: isOpen ? 180 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Front face */}
        <div
          className="p-4"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center gap-2 font-sans text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: skill.accent }}
              aria-hidden
            />
            <span className="uppercase tracking-wider text-[var(--color-neutral-500)]">
              {skill.ring === 'hub' ? 'Hub · all phases' : skill.ring === 'outer' ? 'Outer · feedback' : `Owns ${skill.phaseOwnership.join(', ')}`}
            </span>
          </div>
          <div className="mt-1 font-serif text-lg leading-tight">{skill.displayName}</div>
          <p className="mt-2 text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            {skill.oneLiner}
          </p>
        </div>

        {/* Back face (revealed on flip) */}
        <div
          className="absolute inset-0 p-4 overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="font-serif text-base text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] border-b-2 pb-0.5"
              style={{ borderColor: skill.accent }}
            >
              {skill.displayName}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-neutral-500)] font-sans">
              ↺ close
            </span>
          </div>
          <p className="mt-2 text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            {skill.purpose}
          </p>
          <div className="mt-3">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-neutral-500)] font-sans">
              sub-commands
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {skill.subCommands.map((c) => (
                <code key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] font-mono">
                  {c}
                </code>
              ))}
            </div>
          </div>
          {skill.invokes.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-neutral-500)] font-sans">
                invokes
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {skill.invokes.map((s) => (
                  <SkillChip key={s} slug={s} onPick={onPickSkill} />
                ))}
              </div>
            </div>
          )}
          {skill.invokedBy.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-neutral-500)] font-sans">
                invoked by
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {skill.invokedBy.map((s) => (
                  <SkillChip key={s} slug={s} onPick={onPickSkill} />
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-[11px] italic text-[var(--color-neutral-500)]">
            {skill.standaloneExample}
          </p>
          <Link
            href={skill.docsHref}
            className="mt-3 inline-block text-[11px] underline text-[var(--color-brand-indigo)]"
            onClick={(e) => e.stopPropagation()}
          >
            Full docs →
          </Link>
        </div>
      </motion.button>
    </motion.div>
  );
}

function SkillChip({ slug, onPick }: { slug: SkillSlug; onPick: (s: SkillSlug) => void }) {
  const s = getSkill(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPick(slug);
      }}
      className="text-[11px] px-2 py-1 min-h-[24px] inline-flex items-center rounded font-sans hover:underline text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-100)]"
      style={{ backgroundColor: `${s.accent}33` }}
    >
      {s.displayName}
    </button>
  );
}
