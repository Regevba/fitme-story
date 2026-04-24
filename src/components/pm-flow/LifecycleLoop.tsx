'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Wrench, Bandage, Package, MessageSquare, Activity, Megaphone } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { PHASES, type PhaseId } from '@/lib/lifecycle-phases';
import { getSkill, type SkillSlug } from '@/lib/skill-ecosystem';
import { WORK_ITEM_TYPES, type WorkItemType, getWorkItemType } from '@/lib/work-item-types';
import { FEEDBACK_SOURCES } from '@/lib/feedback-sources';

const SVG_SIZE = 900;       // grown from 800 to fit Marketing (P8 @ 288°)
const CENTER = SVG_SIZE / 2;
const INNER_RING_RADIUS = 220;
const OUTER_RING_RADIUS = 310;        // the dashed guide circle
const ANCHOR_RADIUS = 360;            // pill CENTERS sit outside the ring
const PILL_H = 44;
const PILL_ICON_ZONE = 42;            // icon + spacing before label text
const PILL_RIGHT_PAD = 18;
const STORAGE_KEY = 'fitme-story.lifecycle.work-item-type';

// Character-width heuristic at the pill's two font sizes. SVG can't auto-
// size pills from their content, so we estimate and size each pill
// per-source to avoid overflow for longer descriptions like Ops's.
function estimatePillWidth(label: string, description: string): number {
  const labelPx = label.length * 7.3;        // ~13px semibold sans
  const descPx = description.length * 5.6;   // ~10px regular sans
  return Math.ceil(PILL_ICON_ZONE + Math.max(labelPx, descPx) + PILL_RIGHT_PAD);
}

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

// P0 sits at 12 o'clock (-π/2), increasing clockwise.
function phaseAngle(order: number): number {
  return -Math.PI / 2 + (order * 2 * Math.PI) / PHASES.length;
}

// Outer ring anchors — anchorAngleDeg is measured clockwise from 12 o'clock (0°).
function anchorAngle(deg: number): number {
  return -Math.PI / 2 + (deg * Math.PI) / 180;
}

function scrollToSection(hash: string) {
  const el = document.getElementById(hash) ?? document.getElementById('wall');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const PILL_ICONS: Record<WorkItemType, ComponentType<SVGProps<SVGSVGElement>>> = {
  feature: Sparkles,
  enhancement: Wrench,
  fix: Bandage,
  chore: Package,
};

const FEEDBACK_ICONS: Record<'MessageSquare' | 'Activity' | 'Megaphone', ComponentType<SVGProps<SVGSVGElement>>> = {
  MessageSquare,
  Activity,
  Megaphone,
};

export function LifecycleLoop() {
  const reduced = useReducedMotion();
  const [workItemType, setWorkItemType] = useState<WorkItemType>('feature');

  // Restore last choice from localStorage.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as WorkItemType | null;
      if (stored && WORK_ITEM_TYPES.some((w) => w.id === stored)) {
        setWorkItemType(stored);
      }
    } catch {
      // localStorage unavailable — fall through with default.
    }
  }, []);

  const handleSelect = (id: WorkItemType) => {
    setWorkItemType(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const activeType = getWorkItemType(workItemType);
  const activePhaseSet = new Set<PhaseId>(activeType.phases);

  const centerLabel =
    workItemType === 'feature'
      ? 'the product-development loop'
      : `${activeType.label.toLowerCase()} lifecycle`;
  const centerSubtitle =
    workItemType === 'feature'
      ? 'inner ships forward · outer feeds back'
      : `${activeType.phaseCount} of ${PHASES.length} phases active`;

  // Phases that sit directly under an outer feedback anchor — their labels
  // flip inward so they don't crowd the pill above the pip.
  const anchorTargetedPhases = new Set<PhaseId>(
    FEEDBACK_SOURCES.map((s) => s.targetPhases[0])
  );

  return (
    <div
      className="my-8 max-w-[900px] mx-auto"
      aria-label="Product-development lifecycle — inner 10-phase ring plus outer feedback ring"
    >
      {/* Work-item type pill toggle */}
      <div
        role="tablist"
        aria-label="Work item type"
        className="mb-6 flex flex-wrap justify-center gap-2"
      >
        {WORK_ITEM_TYPES.map((w) => {
          const active = w.id === workItemType;
          const Icon = PILL_ICONS[w.id];
          return (
            <button
              key={w.id}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls="lifecycle-svg"
              onClick={() => handleSelect(w.id)}
              className={[
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-sans transition',
                'border focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)]',
                active
                  ? 'bg-[var(--color-brand-indigo)] text-white border-[var(--color-brand-indigo)] shadow-sm'
                  : 'bg-transparent border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] dark:border-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:border-[var(--color-neutral-500)]',
              ].join(' ')}
            >
              <Icon aria-hidden="true" width={14} height={14} strokeWidth={1.75} />
              {w.label}
              <span className={active ? 'opacity-70' : 'text-[var(--color-neutral-500)]'}>
                ({w.phaseCount})
              </span>
            </button>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="mb-4 text-center text-xs font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mx-auto"
      >
        {activeType.summary}
      </p>

      <span className="sr-only">
        Two-ring lifecycle diagram. Inner ring: ten forward phases (Research, PRD, Tasks,
        UX, Implement, Test, Review, Merge, Docs, Learn) arranged clockwise. Outer ring:
        three feedback skills arranged around the cycle at the phases where they fire.
        CX sits at Research — reviews, sentiment, and NPS feed new research. Marketing
        sits at Documentation — ASO, campaigns, and launch comms. Ops sits at Learn —
        incidents, latency, and SLOs feed post-launch synthesis; Ops also runs
        continuously in the background across every phase.
      </span>

      <svg
        id="lifecycle-svg"
        role="img"
        aria-label="Product-development lifecycle loop with concentric feedback ring"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full h-auto"
      >
        <defs>
          {/* Arrowhead for inward-pointing radial connectors */}
          <marker
            id="arrow-in"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
          {/* Arrowhead for outer-ring direction cue (counter-clockwise) */}
          <marker
            id="arrow-ring"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--color-neutral-500)" opacity="0.7" />
          </marker>
        </defs>

        {/* === Outer ring (counter-clockwise feedback) === */}
        <motion.g
          initial={reduced ? false : { rotate: 4 }}
          whileInView={{ rotate: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: reduced ? 0 : 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ originX: `${CENTER}px`, originY: `${CENTER}px` }}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_RING_RADIUS}
            fill="none"
            stroke="var(--color-neutral-300)"
            strokeWidth="1.5"
            strokeDasharray="8 10"
            opacity="0.55"
            markerEnd="url(#arrow-ring)"
            markerMid="url(#arrow-ring)"
          />
        </motion.g>

        {/* === Outer anchor nodes — pills sit OUTSIDE the dashed ring at
             ANCHOR_RADIUS so the ring itself is a clean unbroken circle.
             Pill width is per-source so longer descriptions (e.g. Ops) don't
             spill outside the rounded rect. */}
        {FEEDBACK_SOURCES.map((src) => {
          const angle = anchorAngle(src.anchorAngleDeg);
          const anchor = polar(CENTER, CENTER, ANCHOR_RADIUS, angle);
          const skill = getSkill(src.skillSlug);
          const Icon = FEEDBACK_ICONS[src.iconName];
          const pillW = estimatePillWidth(src.label, src.description);
          const pillLeft = anchor.x - pillW / 2;

          return (
            <g
              key={src.id}
              role="link"
              tabIndex={0}
              aria-label={`${src.label} feedback source — informs ${src.targetPhases.join(', ')}`}
              onClick={() => scrollToSection(`column-${src.skillSlug}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToSection(`column-${src.skillSlug}`);
              }}
              className="cursor-pointer focus:outline-none"
            >
              {/* Pill background */}
              <rect
                x={pillLeft}
                y={anchor.y - PILL_H / 2}
                width={pillW}
                height={PILL_H}
                rx={PILL_H / 2}
                ry={PILL_H / 2}
                fill="white"
                stroke={skill.accent}
                strokeWidth="2"
                className="dark:fill-[var(--color-neutral-900)]"
              />
              {/* Icon */}
              <g
                transform={`translate(${pillLeft + 14}, ${anchor.y - 10})`}
                style={{ color: skill.accent }}
              >
                <Icon aria-hidden="true" width={20} height={20} strokeWidth={1.75} />
              </g>
              {/* Label + description */}
              <text
                x={pillLeft + PILL_ICON_ZONE}
                y={anchor.y - 2}
                className="font-sans fill-[var(--color-neutral-900)] dark:fill-[var(--color-neutral-100)]"
                fontSize="13"
                fontWeight="600"
              >
                {src.label}
              </text>
              <text
                x={pillLeft + PILL_ICON_ZONE}
                y={anchor.y + 12}
                className="font-sans fill-[var(--color-neutral-500)]"
                fontSize="10"
              >
                {src.description}
              </text>
            </g>
          );
        })}

        {/* === Radial connectors: anchor -> PRIMARY target phase pip ===
             Anchors are positioned at the same angle as their primary target,
             so each connector is a short radial line — no diagonal lines
             crossing through the center. Secondary targets (e.g. Ops → P1)
             are surfaced in the anchor description + aria-label, not drawn. */}
        {FEEDBACK_SOURCES.map((src) => {
          const primaryPhaseId = src.targetPhases[0];
          const phase = PHASES.find((p) => p.id === primaryPhaseId);
          if (!phase) return null;
          const skill = getSkill(src.skillSlug);
          const angle = anchorAngle(src.anchorAngleDeg);
          // Start just inside the pill's inward edge, end just outside the
          // phase pip — line passes cleanly over the outer dashed ring.
          const anchorPos = polar(CENTER, CENTER, ANCHOR_RADIUS - PILL_H / 2, angle);
          const phasePos = polar(CENTER, CENTER, INNER_RING_RADIUS + 18, phaseAngle(phase.order));
          return (
            <line
              key={`${src.id}-${primaryPhaseId}`}
              x1={anchorPos.x}
              y1={anchorPos.y}
              x2={phasePos.x}
              y2={phasePos.y}
              stroke={skill.accent}
              strokeWidth="1.5"
              strokeDasharray="3 4"
              opacity="0.6"
              markerEnd="url(#arrow-in)"
              style={{ color: skill.accent }}
            />
          );
        })}

        {/* === Inner ring (forward, unchanged guide) === */}
        <motion.g
          initial={reduced ? false : { rotate: -4 }}
          whileInView={{ rotate: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: reduced ? 0 : 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ originX: `${CENTER}px`, originY: `${CENTER}px` }}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_RING_RADIUS}
            fill="none"
            stroke="var(--color-neutral-300)"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.5"
          />
        </motion.g>

        {/* === Inner phase pips === */}
        {PHASES.map((phase) => {
          const angle = phaseAngle(phase.order);
          const { x, y } = polar(CENTER, CENTER, INNER_RING_RADIUS, angle);
          const skill = getSkill(phase.primarySkillSlug as SkillSlug);
          const isActive = activePhaseSet.has(phase.id);
          const isAnchorTargeted = anchorTargetedPhases.has(phase.id);

          const c = Math.cos(angle);
          // Label sits OUTSIDE the pip by default; flip to INSIDE for phases
          // with an outer-ring feedback anchor so they don't crowd the pill.
          const labelR = isAnchorTargeted ? INNER_RING_RADIUS - 28 : INNER_RING_RADIUS + 28;
          let labelX = CENTER + labelR * c;
          const labelY = CENTER + labelR * Math.sin(angle);
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (isAnchorTargeted) {
            // When flipped inward, lean the anchor AWAY from the center so
            // the text reads on the side opposite its pip.
            if (c > 0.3) {
              textAnchor = 'end';
              labelX -= 6;
            } else if (c < -0.3) {
              textAnchor = 'start';
              labelX += 6;
            }
          } else if (c > 0.3) {
            textAnchor = 'start';
            labelX += 6;
          } else if (c < -0.3) {
            textAnchor = 'end';
            labelX -= 6;
          }

          return (
            <g
              key={phase.id}
              role="link"
              tabIndex={0}
              aria-label={`Phase ${phase.id} ${phase.name}${isActive ? '' : ' — not in this work-item type'}`}
              onClick={() => scrollToSection(`column-${phase.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToSection(`column-${phase.id}`);
              }}
              className="cursor-pointer focus:outline-none"
              style={{ outlineOffset: 4, opacity: isActive ? 1 : 0.25 }}
            >
              {isActive ? (
                <circle cx={x} cy={y} r={12} fill={skill.accent} />
              ) : (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="none"
                  stroke={skill.accent}
                  strokeWidth="2"
                />
              )}
              <text
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className="fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)] font-sans"
                fontSize="12"
              >
                {phase.id} {phase.name}
              </text>
            </g>
          );
        })}

        {/* === Center label === */}
        <text
          x={CENTER}
          y={CENTER - 8}
          textAnchor="middle"
          className="font-serif fill-[var(--color-neutral-900)] dark:fill-[var(--color-neutral-100)]"
          fontSize="18"
        >
          {centerLabel}
        </text>
        <text
          x={CENTER}
          y={CENTER + 14}
          textAnchor="middle"
          className="fill-[var(--color-neutral-500)] font-sans"
          fontSize="12"
        >
          {centerSubtitle}
        </text>
      </svg>

      {/* === Work-item-type legend ===
           Explains what each pill actually means — counts + one-line scope +
           the exact phases included. The active type gets a subtle accent. */}
      <div className="mt-10 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] pt-6">
        <div className="mb-4 text-center text-xs font-sans uppercase tracking-wider text-[var(--color-neutral-500)]">
          work-item types
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 font-sans">
          {WORK_ITEM_TYPES.map((w) => {
            const Icon = PILL_ICONS[w.id];
            const isActive = w.id === workItemType;
            return (
              <li
                key={w.id}
                className={[
                  'rounded-md border p-4 transition',
                  isActive
                    ? 'border-[var(--color-brand-indigo)] bg-[var(--color-brand-indigo)]/5'
                    : 'border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-transparent',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    aria-hidden="true"
                    width={16}
                    height={16}
                    strokeWidth={1.75}
                    className={isActive ? 'text-[var(--color-brand-indigo)]' : 'text-[var(--color-neutral-500)]'}
                  />
                  <span className="font-serif text-base">{w.label}</span>
                  <span className="ml-auto text-xs text-[var(--color-neutral-500)] tabular-nums">
                    {w.phaseCount} {w.phaseCount === 1 ? 'phase' : 'phases'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
                  {w.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {w.phases.map((p) => (
                    <code
                      key={p}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]"
                    >
                      {p}
                    </code>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 text-center text-[11px] font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mx-auto">
          Not every work item runs all ten phases. Features get the full
          lifecycle; smaller work skips the upstream phases it doesn&apos;t need.
          Pick a type above to see which phases fire.
        </p>
      </div>
    </div>
  );
}
