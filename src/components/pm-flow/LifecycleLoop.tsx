'use client';

import { PHASES } from '@/lib/lifecycle-phases';
import { getSkill, type SkillSlug } from '@/lib/skill-ecosystem';

const SVG_SIZE = 640;
const CENTER = SVG_SIZE / 2;
const INNER_RING_RADIUS = 220;

// Convert a phase's order (0..9) to an angle on the clock face.
// P0 sits at 12 o'clock (-90deg), increasing clockwise.
function phaseAngle(order: number): number {
  return -Math.PI / 2 + (order * 2 * Math.PI) / PHASES.length;
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function scrollToSection(hash: string) {
  const el = document.getElementById(hash) ?? document.getElementById('wall');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function LifecycleLoop() {
  return (
    <div
      className="my-8 max-w-[640px] mx-auto"
      aria-label="Product-development lifecycle loop — 10 phases"
    >
      <span className="sr-only">
        Product-development lifecycle loop. Ten phases arranged in a clockwise circle
        — Research, PRD, Tasks, UX/Design, Implement, Test, Review, Merge, Docs, Learn
        — with the circle itself communicating how the cycle closes from Learn back to
        Research.
      </span>
      <svg
        role="img"
        aria-label="Product-development lifecycle loop — 10 phases"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full h-auto"
      >
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

        {/* Phase pips */}
        {PHASES.map((phase) => {
          const angle = phaseAngle(phase.order);
          const { x, y } = polar(CENTER, CENTER, INNER_RING_RADIUS, angle);
          const skill = getSkill(phase.primarySkillSlug as SkillSlug);

          // Label placement: for phases on the left/right sides of the
          // circle, textAnchor='middle' causes the text to overlap the dot
          // (half the label extends back toward center). Anchor the text on
          // the side AWAY from the dot based on cos(angle); pad horizontally
          // so there's a consistent gap.
          const c = Math.cos(angle);
          const s = Math.sin(angle);
          const labelR = INNER_RING_RADIUS + 28;
          let labelX = CENTER + labelR * c;
          let labelY = CENTER + labelR * s;
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (c > 0.3) {
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
              aria-label={`Phase ${phase.id} ${phase.name} — jump to column`}
              onClick={() => scrollToSection(`column-${phase.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') scrollToSection(`column-${phase.id}`);
              }}
              className="cursor-pointer focus:outline-none"
              style={{ outlineOffset: 4 }}
            >
              <circle cx={x} cy={y} r={12} fill={skill.accent} />
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
