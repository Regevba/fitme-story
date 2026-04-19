'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PHASES } from '@/lib/lifecycle-phases';
import { getSkill, type SkillSlug } from '@/lib/skill-ecosystem';

const SVG_SIZE = 720;
const CENTER = SVG_SIZE / 2;
const INNER_RING_RADIUS = 220;
const OUTER_RING_RADIUS = 320;

// Convert a phase's order (0..9) to an angle on the clock face.
// P0 sits at 12 o'clock (-90deg), increasing clockwise.
function phaseAngle(order: number): number {
  return -Math.PI / 2 + (order * 2 * Math.PI) / PHASES.length;
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function scrollToSection(hash: string) {
  const el = document.getElementById(hash);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function LifecycleLoop() {
  const reduced = useReducedMotion();

  return (
    <div className="my-8 max-w-[720px] mx-auto" aria-label="Product-development lifecycle loop — 10 phases + 3 feedback-layer skills">
      <svg
        role="img"
        aria-labelledby="loop-title loop-desc"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full h-auto"
      >
        <title id="loop-title">Product-development lifecycle loop</title>
        <desc id="loop-desc">
          Ten phases arranged in a clockwise circle — Research, PRD, Tasks, UX/Design, Implement, Test, Review, Merge, Docs, Learn —
          with a feedback arc closing the loop from Learn back to Research. Outer ring shows three feedback-layer skills that
          continuously feed information into the cycle: cx, ops, and marketing.
        </desc>

        {/* Inner ring dashed guide circle */}
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

        {/* Inner ring — phase pips */}
        {PHASES.map((phase) => {
          const angle = phaseAngle(phase.order);
          const { x, y } = polar(CENTER, CENTER, INNER_RING_RADIUS, angle);
          const skill = getSkill(phase.primarySkillSlug as SkillSlug);
          const labelR = INNER_RING_RADIUS + 34;
          const labelPos = polar(CENTER, CENTER, labelR, angle);

          return (
            <g
              key={phase.id}
              role="link"
              tabIndex={0}
              aria-label={`Phase ${phase.id} ${phase.name} — jump to column`}
              onClick={() => scrollToSection(`column-${phase.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToSection(`column-${phase.id}`); }}
              className="cursor-pointer focus:outline-none"
              style={{ outlineOffset: 4 }}
            >
              <circle cx={x} cy={y} r={12} fill={skill.accent} />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)] font-sans"
                fontSize="12"
              >
                {phase.id} {phase.name}
              </text>
            </g>
          );
        })}

        {/* Feedback arc — from P9 back to P0. A bold curve drawn outside the ring. */}
        {(() => {
          const start = polar(CENTER, CENTER, INNER_RING_RADIUS, phaseAngle(9));
          const end = polar(CENTER, CENTER, INNER_RING_RADIUS, phaseAngle(0));
          // Control point above the top of the ring to arc the feedback curve over the circle.
          const cx = CENTER;
          const cy = CENTER - INNER_RING_RADIUS - 80;
          return (
            <motion.path
              d={`M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`}
              stroke="var(--color-brand-coral)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              markerEnd="url(#arrowhead-coral)"
              animate={reduced ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          );
        })()}

        <defs>
          <marker id="arrowhead-coral" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M 0 0 L 8 3 L 0 6 Z" fill="var(--color-brand-coral)" />
          </marker>
        </defs>

        {/* Outer ring — three feedback-layer skills (cx, ops, marketing) as arc segments */}
        {(() => {
          const OUTER_SKILLS = ['cx', 'ops', 'marketing'] as const;
          return OUTER_SKILLS.map((slug, i) => {
            const s = getSkill(slug);
            const totalArcSpan = (2 * Math.PI) / 3; // each segment gets 120° of arc
            const arcStart = -Math.PI / 2 + i * totalArcSpan + 0.15;
            const arcEnd = arcStart + totalArcSpan - 0.3; // tiny gap between segments
            const startPt = polar(CENTER, CENTER, OUTER_RING_RADIUS, arcStart);
            const endPt = polar(CENTER, CENTER, OUTER_RING_RADIUS, arcEnd);
            const largeArcFlag = arcEnd - arcStart > Math.PI ? 1 : 0;
            const arcPath = `M ${startPt.x} ${startPt.y} A ${OUTER_RING_RADIUS} ${OUTER_RING_RADIUS} 0 ${largeArcFlag} 1 ${endPt.x} ${endPt.y}`;

            const labelAngle = (arcStart + arcEnd) / 2;
            const labelPos = polar(CENTER, CENTER, OUTER_RING_RADIUS + 18, labelAngle);

            return (
              <g
                key={slug}
                role="link"
                tabIndex={0}
                aria-label={`${s.displayName} — jump to always-on row`}
                onClick={() => scrollToSection(`always-on-${slug}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToSection(`always-on-${slug}`); }}
                className="cursor-pointer focus:outline-none"
              >
                <path d={arcPath} stroke={s.accent} strokeWidth="28" fill="none" strokeLinecap="round" opacity="0.8" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)] font-sans"
                  fontSize="13"
                  fontWeight="600"
                >
                  {s.displayName}
                </text>
              </g>
            );
          });
        })()}

        {/* Center label */}
        <text
          x={CENTER}
          y={CENTER - 8}
          textAnchor="middle"
          className="font-serif fill-[var(--color-neutral-900)] dark:fill-[var(--color-neutral-100)]"
          fontSize="18"
        >
          the product-development loop
        </text>
        <text
          x={CENTER}
          y={CENTER + 14}
          textAnchor="middle"
          className="fill-[var(--color-neutral-500)] font-sans"
          fontSize="12"
        >
          ships forward · feedback flows back
        </text>
      </svg>
    </div>
  );
}
