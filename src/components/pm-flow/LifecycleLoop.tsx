'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles, Wrench, Bandage, Package,
  MessageSquare, Activity, Megaphone, FileText,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { PHASES, type PhaseId } from '@/lib/lifecycle-phases';
import { getSkill, type SkillSlug } from '@/lib/skill-ecosystem';
import { WORK_ITEM_TYPES, type WorkItemType, getWorkItemType } from '@/lib/work-item-types';
import { FEEDBACK_SOURCES, type FeedbackSourceId } from '@/lib/feedback-sources';
import { INTERNAL_SATELLITES } from '@/lib/internal-satellites';

const SVG_SIZE = 900;
const CENTER = SVG_SIZE / 2;
const INNER_RING_RADIUS = 220;
const OUTER_RING_RADIUS = 310;
const ANCHOR_RADIUS = 360;
const PILL_H = 44;
const PILL_ICON_ZONE = 42;
const PILL_RIGHT_PAD = 18;
const DOCS_PILL_H = 36;
const DOCS_PILL_W = 132;
const STORAGE_KEY = 'fitme-story.lifecycle.work-item-type';

type HoverTarget = 'p8' | 'docs' | FeedbackSourceId | null;

function estimatePillWidth(label: string, description: string): number {
  const labelPx = label.length * 7.3;
  const descPx = description.length * 5.6;
  return Math.ceil(PILL_ICON_ZONE + Math.max(labelPx, descPx) + PILL_RIGHT_PAD);
}

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function phaseAngle(order: number): number {
  return -Math.PI / 2 + (order * 2 * Math.PI) / PHASES.length;
}

function anchorAngle(deg: number): number {
  return -Math.PI / 2 + (deg * Math.PI) / 180;
}

// Curved Bezier path between two polar points, bowing outward via an outer
// control point. Used for fan-out (P8 → pill) and return (pill → phase) arrows.
function bezierArcPath(startAngle: number, startR: number, endAngle: number, endR: number, ctrlR: number): string {
  const start = polar(CENTER, CENTER, startR, startAngle);
  const end = polar(CENTER, CENTER, endR, endAngle);
  // Midpoint angle, taking the SHORT path (handle wraparound at 0/2π).
  let midAngle = (startAngle + endAngle) / 2;
  if (Math.abs(endAngle - startAngle) > Math.PI) {
    midAngle += Math.PI;
  }
  const ctrl = polar(CENTER, CENTER, ctrlR, midAngle);
  return `M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
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

const SATELLITE_ICONS: Record<'FileText', ComponentType<SVGProps<SVGSVGElement>>> = {
  FileText,
};

export function LifecycleLoop() {
  const reduced = useReducedMotion();
  const [workItemType, setWorkItemType] = useState<WorkItemType>('feature');
  const [hover, setHover] = useState<HoverTarget>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as WorkItemType | null;
      if (stored && WORK_ITEM_TYPES.some((w) => w.id === stored)) {
        setWorkItemType(stored);
      }
    } catch {
      // localStorage unavailable
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
      ? 'release fans out · feedback closes the loop'
      : `${activeType.phaseCount} of ${PHASES.length} phases active`;

  // Phases with an outer pill nearby — flip their labels inward so they
  // don't crowd the pill's airspace.
  const anchorTargetedPhases = new Set<PhaseId>(['P0', 'P8', 'P9']);

  const p8 = PHASES.find((p) => p.id === 'P8')!;
  const p9 = PHASES.find((p) => p.id === 'P9')!;
  const p0 = PHASES.find((p) => p.id === 'P0')!;

  // Hover predicates — cheap to compute, no need to memoize.
  const showFanOut = (pillId: FeedbackSourceId) => hover === 'p8' || hover === pillId;
  const showReturn = (pillId: FeedbackSourceId) => hover === 'p8' || hover === pillId;
  const showDocs = hover === 'docs';

  return (
    <div
      className="my-8 max-w-[900px] mx-auto"
      aria-label="Product-development lifecycle — orbital diagram with release fan-out and feedback return"
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
        Two-ring lifecycle diagram. Inner ring: ten forward phases — Research, PRD, Tasks,
        UX, Implement, Test, Review, Merge, Release, Learn — clockwise. After Release at
        P8, three feedback skills (Marketing, Ops, CX) observe the shipped product and
        feed back into Research and Learn, closing the loop. A separate Docs satellite
        sits off-cycle, flowing artifacts between PRD, Tasks, UX, and Test. Hover or
        focus the Release phase or any feedback pill to see the fan-out and return
        arrows; hover the Docs satellite to see its connectors.
      </span>

      <svg
        id="lifecycle-svg"
        role="img"
        aria-label="Product-development lifecycle loop with release fan-out, feedback return, and Docs satellite"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full h-auto"
      >
        <defs>
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
          <marker
            id="arrow-closure"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--color-brand-coral)" />
          </marker>
        </defs>

        {/* === Outer ring (counter-clockwise direction marker) === */}
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

        {/* === Always-visible: P9 → P0 loop closure arc === */}
        <path
          d={bezierArcPath(
            phaseAngle(p9.order),
            INNER_RING_RADIUS,
            phaseAngle(p0.order) + 2 * Math.PI, // unwrap to ensure short path
            INNER_RING_RADIUS,
            INNER_RING_RADIUS - 36
          )}
          fill="none"
          stroke="var(--color-brand-coral)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.75"
          markerEnd="url(#arrow-closure)"
          aria-hidden="true"
        />

        {/* === Always-visible: ship badge at P8 Release === */}
        {(() => {
          const p8Pos = polar(CENTER, CENTER, INNER_RING_RADIUS, phaseAngle(p8.order));
          // Position badge just outside the P8 pip, away from center
          const badgePos = polar(CENTER, CENTER, INNER_RING_RADIUS + 38, phaseAngle(p8.order));
          return (
            <g aria-hidden="true">
              <line
                x1={p8Pos.x}
                y1={p8Pos.y}
                x2={badgePos.x}
                y2={badgePos.y}
                stroke="var(--skill-release)"
                strokeWidth="1"
                opacity="0.5"
              />
              <text
                x={badgePos.x}
                y={badgePos.y + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                className="font-sans"
                style={{ fill: 'var(--skill-release)', letterSpacing: '0.06em' }}
              >
                ◇ SHIP
              </text>
            </g>
          );
        })()}

        {/* === Hover-revealed: fan-out arrows from P8 Release to each pill === */}
        <AnimatePresence>
          {FEEDBACK_SOURCES.map((src) => {
            if (!showFanOut(src.id)) return null;
            const fromAngle = phaseAngle(p8.order);
            const toAngle = anchorAngle(src.anchorAngleDeg);
            return (
              <motion.path
                key={`fanout-${src.id}`}
                d={bezierArcPath(
                  fromAngle,
                  INNER_RING_RADIUS + 18,
                  toAngle,
                  ANCHOR_RADIUS - PILL_H / 2,
                  OUTER_RING_RADIUS - 5
                )}
                fill="none"
                stroke="var(--skill-release)"
                strokeWidth="1.75"
                strokeDasharray="0"
                opacity="0.85"
                markerEnd="url(#arrow-in)"
                style={{ color: 'var(--skill-release)' }}
                initial={reduced ? { opacity: 0.85 } : { opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.18 }}
              />
            );
          })}
        </AnimatePresence>

        {/* === Hover-revealed: return arrows from each pill to its primary phase === */}
        <AnimatePresence>
          {FEEDBACK_SOURCES.map((src) => {
            if (!showReturn(src.id)) return null;
            const primaryPhaseId = src.targetPhases[0];
            const phase = PHASES.find((p) => p.id === primaryPhaseId);
            if (!phase) return null;
            const skill = getSkill(src.skillSlug);
            const fromAngle = anchorAngle(src.anchorAngleDeg);
            const toAngle = phaseAngle(phase.order);
            // Offset to ensure the path doesn't overlap with the fan-out
            const ctrlR = OUTER_RING_RADIUS + 14;
            return (
              <motion.path
                key={`return-${src.id}`}
                d={bezierArcPath(
                  fromAngle,
                  ANCHOR_RADIUS - PILL_H / 2,
                  toAngle,
                  INNER_RING_RADIUS + 18,
                  ctrlR
                )}
                fill="none"
                stroke={skill.accent}
                strokeWidth="1.5"
                strokeDasharray="3 4"
                opacity="0.7"
                markerEnd="url(#arrow-in)"
                style={{ color: skill.accent }}
                initial={reduced ? { opacity: 0.7 } : { opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.18, delay: reduced ? 0 : 0.06 }}
              />
            );
          })}
        </AnimatePresence>

        {/* === Hover-revealed: Docs satellite connectors === */}
        <AnimatePresence>
          {showDocs &&
            INTERNAL_SATELLITES.flatMap((sat) =>
              sat.connectedPhases.map((phaseId) => {
                const phase = PHASES.find((p) => p.id === phaseId);
                if (!phase) return null;
                const fromAngle = anchorAngle(sat.anchorAngleDeg);
                const toAngle = phaseAngle(phase.order);
                return (
                  <motion.path
                    key={`docs-${phaseId}`}
                    d={bezierArcPath(
                      fromAngle,
                      ANCHOR_RADIUS - DOCS_PILL_H / 2,
                      toAngle,
                      INNER_RING_RADIUS + 18,
                      OUTER_RING_RADIUS - 5
                    )}
                    fill="none"
                    stroke="var(--color-neutral-500)"
                    strokeWidth="1.25"
                    strokeDasharray="2 4"
                    opacity="0.6"
                    initial={reduced ? { opacity: 0.6 } : { opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.18 }}
                  />
                );
              })
            )}
        </AnimatePresence>

        {/* === Outer feedback pills (always visible) === */}
        {FEEDBACK_SOURCES.map((src) => {
          const angle = anchorAngle(src.anchorAngleDeg);
          const anchor = polar(CENTER, CENTER, ANCHOR_RADIUS, angle);
          const skill = getSkill(src.skillSlug);
          const Icon = FEEDBACK_ICONS[src.iconName];
          const pillW = estimatePillWidth(src.label, src.description);
          const pillLeft = anchor.x - pillW / 2;
          const isHovered = hover === src.id || hover === 'p8';

          return (
            <g
              key={src.id}
              role="link"
              tabIndex={0}
              aria-label={`${src.label} feedback skill — observes shipped product after Release, feeds back to ${src.targetPhases.join(', ')}`}
              onClick={() => scrollToSection(`column-${src.skillSlug}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToSection(`column-${src.skillSlug}`);
              }}
              onMouseEnter={() => setHover(src.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(src.id)}
              onBlur={() => setHover(null)}
              className="cursor-pointer focus:outline-none"
            >
              <rect
                x={pillLeft}
                y={anchor.y - PILL_H / 2}
                width={pillW}
                height={PILL_H}
                rx={PILL_H / 2}
                ry={PILL_H / 2}
                fill="white"
                stroke={skill.accent}
                strokeWidth={isHovered ? 2.5 : 2}
                className="dark:fill-[var(--color-neutral-900)] transition-[stroke-width]"
              />
              <g
                transform={`translate(${pillLeft + 14}, ${anchor.y - 10})`}
                style={{ color: skill.accent }}
              >
                <Icon aria-hidden="true" width={20} height={20} strokeWidth={1.75} />
              </g>
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

        {/* === Docs internal satellite (always visible, muted style) === */}
        {INTERNAL_SATELLITES.map((sat) => {
          const angle = anchorAngle(sat.anchorAngleDeg);
          const anchor = polar(CENTER, CENTER, ANCHOR_RADIUS, angle);
          const Icon = SATELLITE_ICONS[sat.iconName];
          const pillLeft = anchor.x - DOCS_PILL_W / 2;
          const isHovered = hover === 'docs';

          return (
            <g
              key={sat.id}
              role="img"
              tabIndex={0}
              aria-label={`${sat.label} satellite — internal artifacts that flow between PRD, Tasks, UX, and Test phases. Hover to see connections.`}
              onMouseEnter={() => setHover('docs')}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover('docs')}
              onBlur={() => setHover(null)}
              className="cursor-help focus:outline-none"
            >
              <rect
                x={pillLeft}
                y={anchor.y - DOCS_PILL_H / 2}
                width={DOCS_PILL_W}
                height={DOCS_PILL_H}
                rx={DOCS_PILL_H / 2}
                ry={DOCS_PILL_H / 2}
                fill="var(--color-neutral-50)"
                stroke="var(--color-neutral-400)"
                strokeWidth={isHovered ? 2 : 1.5}
                strokeDasharray="4 3"
                className="dark:fill-[var(--color-neutral-900)] transition-[stroke-width]"
              />
              <g
                transform={`translate(${pillLeft + 12}, ${anchor.y - 8})`}
                style={{ color: 'var(--color-neutral-500)' }}
              >
                <Icon aria-hidden="true" width={16} height={16} strokeWidth={1.75} />
              </g>
              <text
                x={pillLeft + 36}
                y={anchor.y - 1}
                className="font-sans fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)]"
                fontSize="12"
                fontWeight="600"
              >
                {sat.label}
              </text>
              <text
                x={pillLeft + 36}
                y={anchor.y + 11}
                className="font-sans fill-[var(--color-neutral-500)]"
                fontSize="9"
              >
                internal artifacts
              </text>
            </g>
          );
        })}

        {/* === Inner ring (forward) === */}
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
          const isP8 = phase.id === 'P8';

          const c = Math.cos(angle);
          const labelR = isAnchorTargeted ? INNER_RING_RADIUS - 28 : INNER_RING_RADIUS + 28;
          let labelX = CENTER + labelR * c;
          const labelY = CENTER + labelR * Math.sin(angle);
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (isAnchorTargeted) {
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
              aria-label={`Phase ${phase.id} ${phase.name}${isActive ? '' : ' — not in this work-item type'}${isP8 ? ' — public ship moment; hover to reveal feedback flow' : ''}`}
              onClick={() => scrollToSection(`column-${phase.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToSection(`column-${phase.id}`);
              }}
              onMouseEnter={isP8 ? () => setHover('p8') : undefined}
              onMouseLeave={isP8 ? () => setHover(null) : undefined}
              onFocus={isP8 ? () => setHover('p8') : undefined}
              onBlur={isP8 ? () => setHover(null) : undefined}
              className={isP8 ? 'cursor-help focus:outline-none' : 'cursor-pointer focus:outline-none'}
              style={{ outlineOffset: 4, opacity: isActive ? 1 : 0.25 }}
            >
              {isActive ? (
                <circle
                  cx={x}
                  cy={y}
                  r={isP8 && (hover === 'p8' || hover) ? 14 : 12}
                  fill={skill.accent}
                  className="transition-[r]"
                />
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

      {/* Hover hint — affordance for the reveal interaction */}
      <p className="mt-3 text-center text-[11px] font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mx-auto">
        Hover or focus <strong>P8 Release</strong> or any feedback pill to see the
        ship-fan-out and feedback-return arrows. Hover the <strong>Docs</strong>{' '}
        satellite to see which phases produce and consume internal artifacts.
      </p>

      {/* === Work-item-type legend === */}
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
