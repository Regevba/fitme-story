'use client';

import { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { LegoBrick } from './LegoBrick';
import {
  SKILLS,
  alwaysOnSkills,
  phaseColumnSkills,
  type Skill,
  type SkillSlug,
} from '@/lib/skill-ecosystem';
import { PHASES } from '@/lib/lifecycle-phases';

type Layout = 'scattered' | 'assembled';

export function LegoWall() {
  const [layout, setLayout] = useState<Layout>('scattered');
  const [openSlug, setOpenSlug] = useState<SkillSlug | null>(null);

  // Escape closes open brick
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenSlug(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // When a user clicks an invokes/invoked-by chip, flip-target that skill
  const pickSkill = (slug: SkillSlug) => setOpenSlug(slug);
  const toggle = (slug: SkillSlug) => setOpenSlug((cur) => (cur === slug ? null : slug));

  return (
    <div className="my-8" aria-label="Lego wall — 11 skills in scattered or assembled layout">
      <LayoutGroup id="pm-flow-lego-wall">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-1 font-sans text-sm border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] rounded-full p-1" role="tablist" aria-label="Layout">
            <LayoutPill label="Scattered" active={layout === 'scattered'} onClick={() => setLayout('scattered')} />
            <LayoutPill label="Assembled" active={layout === 'assembled'} onClick={() => setLayout('assembled')} />
          </div>
          <p className="text-xs text-[var(--color-neutral-500)] font-sans">
            Click a brick to flip • Esc to close
          </p>
        </div>

        {layout === 'scattered' ? (
          <ScatteredLayout
            skills={SKILLS}
            openSlug={openSlug}
            onToggle={toggle}
            onPickSkill={pickSkill}
          />
        ) : (
          <AssembledLayout openSlug={openSlug} onToggle={toggle} onPickSkill={pickSkill} />
        )}
      </LayoutGroup>
    </div>
  );
}

function LayoutPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-3 py-2 min-h-[44px] rounded-full transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]'
      }`}
    >
      {label}
    </button>
  );
}

function ScatteredLayout({
  skills,
  openSlug,
  onToggle,
  onPickSkill,
}: {
  skills: Skill[];
  openSlug: SkillSlug | null;
  onToggle: (slug: SkillSlug) => void;
  onPickSkill: (slug: SkillSlug) => void;
}) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      aria-label="Scattered — each skill stands alone"
    >
      {skills.map((s) => (
        <LegoBrick
          key={s.slug}
          skill={s}
          isOpen={openSlug === s.slug}
          onToggle={() => onToggle(s.slug)}
          onPickSkill={onPickSkill}
        />
      ))}
    </motion.div>
  );
}

function AssembledLayout({
  openSlug,
  onToggle,
  onPickSkill,
}: {
  openSlug: SkillSlug | null;
  onToggle: (slug: SkillSlug) => void;
  onPickSkill: (slug: SkillSlug) => void;
}) {
  const alwaysOn = alwaysOnSkills();

  return (
    <div className="space-y-8" aria-label="Assembled — skills snapped into phase columns">
      {/* Phase columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-min">
          {PHASES.map((phase) => {
            const columnSkills = phaseColumnSkills(phase.id);
            return (
              <div key={phase.id} id={`column-${phase.id}`} className="min-w-[180px] max-w-[220px] shrink-0 scroll-mt-28">
                <div className="mb-2 font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
                  <div className="font-semibold text-[var(--color-brand-indigo)]">{phase.id}</div>
                  <div>{phase.name}</div>
                </div>
                <div className="space-y-2">
                  {columnSkills.length === 0 ? (
                    <div className="text-[10px] italic text-[var(--color-neutral-500)] font-sans">
                      No phase-bound skill
                    </div>
                  ) : (
                    columnSkills.map((s) => (
                      <LegoBrick
                        key={s.slug}
                        skill={s}
                        isOpen={openSlug === s.slug}
                        onToggle={() => onToggle(s.slug)}
                        onPickSkill={onPickSkill}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Always-on row */}
      <div className="border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] pt-6">
        <div className="mb-3 font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
          Cross-phase / feedback layer
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {alwaysOn.map((s) => (
            <div key={s.slug} id={`always-on-${s.slug}`} className="scroll-mt-28">
              <LegoBrick
                skill={s}
                isOpen={openSlug === s.slug}
                onToggle={() => onToggle(s.slug)}
                onPickSkill={onPickSkill}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
