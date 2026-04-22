'use client';

import { PHASES, type PhaseId } from '@/lib/lifecycle-phases';
import { getSkill, type SkillSlug } from '@/lib/skill-ecosystem';

const WIDTH = 900;
const HEIGHT = 760;
const CENTER_X = 445;
const CENTER_Y = 340;
const ORBIT_RADIUS = 228;
const SEGMENT_STROKE = 28;
const HUB_RADIUS = 112;

type Point = { x: number; y: number };

type WorkTypeLane = {
  label: string;
  entryPhase: PhaseId;
  color: string;
  note: string;
  y: number;
};

const WORK_TYPE_LANES: WorkTypeLane[] = [
  { label: 'Feature', entryPhase: 'P0', color: '#4F46E5', note: 'starts at research', y: 264 },
  { label: 'Enhancement', entryPhase: 'P2', color: '#F97316', note: 'joins at tasks', y: 318 },
  { label: 'Fix', entryPhase: 'P4', color: '#EF4444', note: 'joins at implement', y: 372 },
  { label: 'Chore', entryPhase: 'P4', color: '#64748B', note: 'minimal late entry', y: 426 },
];

function phaseAngle(order: number): number {
  return -Math.PI / 2 + (order * 2 * Math.PI) / PHASES.length;
}

function polar(cx: number, cy: number, radius: number, angle: number): Point {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polar(cx, cy, radius, startAngle);
  const end = polar(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function lanePath(y: number, end: Point): string {
  return `M 246 ${y} C 304 ${y}, 320 ${end.y}, ${end.x} ${end.y}`;
}

function scrollToSection(hash: string) {
  const el = document.getElementById(hash) ?? document.getElementById('wall');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getPhase(id: PhaseId) {
  const phase = PHASES.find((entry) => entry.id === id);
  if (!phase) throw new Error(`Unknown phase: ${id}`);
  return phase;
}

function TextBlock({
  x,
  y,
  lines,
  className,
  fontSize,
  lineHeight,
  anchor = 'start',
}: {
  x: number;
  y: number;
  lines: string[];
  className?: string;
  fontSize: number;
  lineHeight: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text x={x} y={y} className={className} fontSize={fontSize} textAnchor={anchor}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function LifecycleLoop() {
  const learnPoint = polar(CENTER_X, CENTER_Y, ORBIT_RADIUS + 20, phaseAngle(9));
  const returnPath = `M ${learnPoint.x} ${learnPoint.y} C ${learnPoint.x - 90} ${learnPoint.y + 115}, 212 566, 106 198`;
  const panelClass = 'fill-[var(--color-neutral-50)] dark:fill-[var(--color-neutral-900)] stroke-[var(--color-neutral-200)] dark:stroke-[var(--color-neutral-700)]';
  const panelTextClass = 'fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)] font-sans';

  return (
    <div
      className="my-8 max-w-[920px] mx-auto rounded-[32px] border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-4"
      aria-label="Task translation orbit for the PM-flow ecosystem"
    >
      <span className="sr-only">
        A task translation orbit. A task arrives from a user request, customer feedback,
        or an incident. The pm-workflow hub reads state, classifies the work type,
        decides where the task enters the lifecycle, dispatches the right skills, syncs
        shared memory and external tools, and loops learnings back into the next cycle.
      </span>
      <svg
        role="img"
        aria-label="Task translation orbit for the PM-flow ecosystem"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
      >
        <defs>
          <marker
            id="lane-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        <rect x="24" y="92" width="218" height="108" rx="24" className={panelClass} opacity="0.88" />
        <TextBlock
          x={46}
          y={122}
          lines={['1. A task arrives', 'user prompt', 'cx signal', 'ops incident']}
          className="fill-[var(--color-neutral-900)] dark:fill-[var(--color-neutral-100)] font-sans"
          fontSize={14}
          lineHeight={22}
        />

        <rect x="24" y="226" width="218" height="240" rx="24" className={panelClass} opacity="0.88" />
        <TextBlock
          x={46}
          y={256}
          lines={[
            '3. Work type decides entry point',
            'Feature uses the full orbit.',
            'Enhancements and fixes join later.',
            'The same hub handles all four lanes.',
          ]}
          className={panelTextClass}
          fontSize={13}
          lineHeight={20}
        />

        <rect x="312" y="46" width="266" height="86" rx="28" className={panelClass} opacity="0.92" />
        <TextBlock
          x={445}
          y={76}
          lines={[
            '2. The hub translates the request',
            'reads state.json, current phase, and routing rules',
            'then wakes only the skills this task needs',
          ]}
          className="fill-[var(--color-neutral-900)] dark:fill-[var(--color-neutral-100)] font-sans"
          fontSize={13}
          lineHeight={20}
          anchor="middle"
        />

        <rect x="646" y="104" width="226" height="152" rx="24" className={panelClass} opacity="0.88" />
        <TextBlock
          x={670}
          y={134}
          lines={[
            '5. Spokes + tool sync',
            'research, ux, design, dev, qa',
            'analytics, cx, marketing, ops, release',
            'GitHub, Notion, Figma, Vercel on transitions',
          ]}
          className={panelTextClass}
          fontSize={13}
          lineHeight={20}
        />

        <rect x="646" y="278" width="226" height="152" rx="24" className={panelClass} opacity="0.88" />
        <TextBlock
          x={670}
          y={308}
          lines={[
            '6. Gates decide if the orbit can advance',
            'explicit user approval',
            'CI, eval, analytics, and review checks',
            'evidence lands before the next phase opens',
          ]}
          className={panelTextClass}
          fontSize={13}
          lineHeight={20}
        />

        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={ORBIT_RADIUS}
          fill="none"
          className="stroke-[var(--color-neutral-200)] dark:stroke-[var(--color-neutral-700)]"
          strokeWidth="2"
          strokeDasharray="6 7"
        />

        {PHASES.map((phase) => {
          const gap = 0.12;
          const startAngle = phaseAngle(phase.order) + gap;
          const endAngle = phaseAngle(phase.order + 1) - gap;
          const skill = getSkill(phase.primarySkillSlug as SkillSlug);
          return (
            <path
              key={`segment-${phase.id}`}
              d={arcPath(CENTER_X, CENTER_Y, ORBIT_RADIUS, startAngle, endAngle)}
              fill="none"
              stroke={skill.accent}
              strokeWidth={SEGMENT_STROKE}
              strokeLinecap="round"
              opacity="0.9"
            />
          );
        })}

        {WORK_TYPE_LANES.map((lane) => {
          const phase = getPhase(lane.entryPhase);
          const target = polar(CENTER_X, CENTER_Y, ORBIT_RADIUS - 8, phaseAngle(phase.order));
          return (
            <g key={lane.label} style={{ color: lane.color }}>
              <path
                d={lanePath(lane.y, target)}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="8 7"
                markerEnd="url(#lane-arrow)"
              />
              <rect
                x="46"
                y={lane.y - 16}
                width="128"
                height="32"
                rx="16"
                className="fill-[var(--color-neutral-50)] dark:fill-[var(--color-neutral-800)]"
                stroke="currentColor"
              />
              <text
                x="110"
                y={lane.y + 5}
                textAnchor="middle"
                className="font-sans"
                fontSize="13"
                fill="currentColor"
              >
                {lane.label}
              </text>
              <text
                x="188"
                y={lane.y + 5}
                className="fill-[var(--color-neutral-500)] dark:fill-[var(--color-neutral-500)] font-sans"
                fontSize="12"
              >
                {lane.note}
              </text>
            </g>
          );
        })}

        <path
          d={returnPath}
          fill="none"
          stroke="var(--color-neutral-500)"
          strokeWidth="3"
          strokeDasharray="10 8"
          markerEnd="url(#lane-arrow)"
          style={{ color: 'var(--color-neutral-500)' }}
        />
        <TextBlock
          x={188}
          y={548}
          lines={['7. Learn closes the loop', 'new evidence becomes the next intake']}
          className="fill-[var(--color-neutral-500)] font-sans"
          fontSize={12}
          lineHeight={18}
        />

        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={HUB_RADIUS}
          className="fill-[var(--color-neutral-900)] dark:fill-[var(--color-neutral-800)]"
          opacity="0.98"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={HUB_RADIUS + 20}
          fill="none"
          className="stroke-[var(--color-neutral-300)] dark:stroke-[var(--color-neutral-500)]"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.8"
        />
        <TextBlock
          x={CENTER_X}
          y={312}
          lines={['/pm-workflow', 'the hub']}
          className="fill-white font-serif"
          fontSize={24}
          lineHeight={26}
          anchor="middle"
        />
        <TextBlock
          x={CENTER_X}
          y={370}
          lines={[
            'read feature state',
            'classify work type',
            'load phase skills',
            'dispatch + sync',
          ]}
          className="fill-[rgba(255,255,255,0.76)] font-sans"
          fontSize={13}
          lineHeight={18}
          anchor="middle"
        />

        {PHASES.map((phase) => {
          const angle = phaseAngle(phase.order);
          const skill = getSkill(phase.primarySkillSlug as SkillSlug);
          const node = polar(CENTER_X, CENTER_Y, ORBIT_RADIUS, angle);
          const label = polar(CENTER_X, CENTER_Y, ORBIT_RADIUS + 56, angle);
          const cosine = Math.cos(angle);
          const sine = Math.sin(angle);
          let anchor: 'start' | 'middle' | 'end' = 'middle';
          let labelX = label.x;
          let labelY = label.y;

          if (cosine > 0.28) {
            anchor = 'start';
            labelX += 8;
          } else if (cosine < -0.28) {
            anchor = 'end';
            labelX -= 8;
          }

          if (sine > 0.7) labelY += 8;
          if (sine < -0.7) labelY -= 8;

          return (
            <g
              key={phase.id}
              role="link"
              tabIndex={0}
              aria-label={`${phase.id} ${phase.name} — jump to the matching phase column`}
              onClick={() => scrollToSection(`column-${phase.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  scrollToSection(`column-${phase.id}`);
                }
              }}
              className="cursor-pointer focus:outline-none"
              style={{ outlineOffset: 4 }}
            >
              <circle cx={node.x} cy={node.y} r="14" fill={skill.accent} stroke="white" strokeWidth="3" />
              <TextBlock
                x={labelX}
                y={labelY}
                lines={[phase.id, phase.name]}
                className="fill-[var(--color-neutral-800)] dark:fill-[var(--color-neutral-100)] font-sans"
                fontSize={12}
                lineHeight={14}
                anchor={anchor}
              />
            </g>
          );
        })}

        <rect x="82" y="626" width="748" height="96" rx="28" className={panelClass} opacity="0.9" />
        <TextBlock
          x={110}
          y={658}
          lines={[
            'Shared memory beneath everything',
            'state.json tracks current phase and approvals. .claude/shared/*.json lets skills communicate without calling each other directly.',
            'change-log, case-study monitoring, and external-sync status turn the orbit into an auditable system.',
          ]}
          className={panelTextClass}
          fontSize={13}
          lineHeight={20}
        />
      </svg>
    </div>
  );
}
