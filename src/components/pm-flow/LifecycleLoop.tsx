'use client';

import { PHASES } from '@/lib/lifecycle-phases';
import { getSkill, type SkillSlug } from '@/lib/skill-ecosystem';

const SVG_SIZE = 760;
const CENTER = SVG_SIZE / 2;
const ORBIT_RADIUS = 220;
const HUB_RADIUS = 104;
const SEGMENT_STROKE = 28;

function phaseAngle(order: number): number {
  return -Math.PI / 2 + (order * 2 * Math.PI) / PHASES.length;
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, radius, startAngle);
  const end = polar(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function splitPhaseName(name: string) {
  switch (name) {
    case 'UX/Design':
      return ['UX /', 'Design'];
    default:
      return [name];
  }
}

function InfoCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
        {eyebrow}
      </div>
      <h3 className="mt-3 font-serif text-xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        {body}
      </p>
    </div>
  );
}

function WorkTypeRow({
  color,
  label,
  detail,
}: {
  color: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
      <span
        aria-hidden="true"
        className="mt-1 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-[var(--color-neutral-500)]">{detail}</div>
      </div>
    </div>
  );
}

export function LifecycleLoop() {
  const learnAngle = phaseAngle(9);
  const researchAngle = phaseAngle(0);
  const learnPoint = polar(CENTER, CENTER, ORBIT_RADIUS + 30, learnAngle);
  const researchPoint = polar(CENTER, CENTER, ORBIT_RADIUS + 30, researchAngle);
  const feedbackPath = [
    `M ${learnPoint.x} ${learnPoint.y}`,
    `C ${learnPoint.x - 132} ${learnPoint.y + 74}, ${researchPoint.x - 132} ${researchPoint.y + 74}, ${researchPoint.x} ${researchPoint.y}`,
  ].join(' ');

  return (
    <div className="my-8 rounded-[32px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] md:p-8">
      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_18rem] xl:items-center">
        <div className="space-y-4">
          <InfoCard
            eyebrow="Step 1"
            title="A task arrives."
            body="The real entry point is a request: a user prompt, a customer signal, or an ops incident. The framework starts by translating that input into structured work."
          />
          <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
              Step 3
            </div>
            <h3 className="mt-3 font-serif text-xl leading-tight">Work type picks the entry lane.</h3>
            <div className="mt-4 space-y-3">
              <WorkTypeRow color="#4F46E5" label="Feature" detail="takes the full P0 → P9 loop" />
              <WorkTypeRow color="#F97316" label="Enhancement" detail="joins later at Tasks (P2)" />
              <WorkTypeRow color="#EF4444" label="Fix" detail="joins at Implement (P4)" />
              <WorkTypeRow color="#64748B" label="Chore" detail="uses the shortest implementation lane" />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-4 text-center">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
              The Lifecycle Orbit
            </div>
            <h3 className="mt-2 font-serif text-2xl">The hub routes work through the phases.</h3>
          </div>

          <svg
            role="img"
            aria-label="PM-flow lifecycle orbit"
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="mx-auto w-full max-w-[680px] h-auto"
          >
            <defs>
              <marker
                id="feedback-arrow"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-neutral-500)" />
              </marker>
            </defs>

            <circle
              cx={CENTER}
              cy={CENTER}
              r={ORBIT_RADIUS}
              fill="none"
              stroke="var(--color-neutral-200)"
              strokeWidth="2"
              strokeDasharray="6 8"
            />

            {PHASES.map((phase) => {
              const skill = getSkill(phase.primarySkillSlug as SkillSlug);
              const gap = 0.1;
              const start = phaseAngle(phase.order) + gap;
              const end = phaseAngle(phase.order + 1) - gap;
              return (
                <path
                  key={`segment-${phase.id}`}
                  d={arcPath(CENTER, CENTER, ORBIT_RADIUS, start, end)}
                  fill="none"
                  stroke={skill.accent}
                  strokeWidth={SEGMENT_STROKE}
                  strokeLinecap="round"
                  opacity="0.95"
                />
              );
            })}

            <path
              d={feedbackPath}
              fill="none"
              stroke="var(--color-neutral-500)"
              strokeWidth="3"
              strokeDasharray="10 8"
              markerEnd="url(#feedback-arrow)"
            />
            <text
              x={CENTER}
              y={CENTER - ORBIT_RADIUS - 58}
              textAnchor="middle"
              className="fill-[var(--color-neutral-500)] font-sans"
              fontSize="12"
            >
              feedback loop
            </text>

            <circle
              cx={CENTER}
              cy={CENTER}
              r={HUB_RADIUS + 18}
              fill="none"
              stroke="var(--color-neutral-300)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS} fill="var(--color-neutral-900)" />

            <text
              x={CENTER}
              y={CENTER - 14}
              textAnchor="middle"
              className="fill-white font-serif"
              fontSize="28"
            >
              /pm-workflow
            </text>
            <text
              x={CENTER}
              y={CENTER + 22}
              textAnchor="middle"
              className="fill-white font-serif"
              fontSize="28"
            >
              the hub
            </text>
            <text
              x={CENTER}
              y={CENTER + 62}
              textAnchor="middle"
              className="fill-[rgba(255,255,255,0.78)] font-sans"
              fontSize="14"
            >
              reads state • classifies work • dispatches skills
            </text>

            {PHASES.map((phase) => {
              const angle = phaseAngle(phase.order);
              const skill = getSkill(phase.primarySkillSlug as SkillSlug);
              const node = polar(CENTER, CENTER, ORBIT_RADIUS, angle);
              const label = polar(CENTER, CENTER, ORBIT_RADIUS + 64, angle);
              const cosine = Math.cos(angle);
              const lines = splitPhaseName(phase.name);
              let anchor: 'start' | 'middle' | 'end' = 'middle';
              let labelX = label.x;

              if (cosine > 0.3) {
                anchor = 'start';
                labelX += 10;
              } else if (cosine < -0.3) {
                anchor = 'end';
                labelX -= 10;
              }

              return (
                <g key={phase.id}>
                  <circle cx={node.x} cy={node.y} r="13" fill={skill.accent} stroke="white" strokeWidth="3" />
                  <text
                    x={labelX}
                    y={label.y - (lines.length > 1 ? 8 : 0)}
                    textAnchor={anchor}
                    className="fill-[var(--color-neutral-800)] font-sans dark:fill-[var(--color-neutral-100)]"
                    fontSize="12"
                  >
                    <tspan x={labelX} dy="0">{phase.id}</tspan>
                    {lines.map((line, index) => (
                      <tspan key={`${phase.id}-${line}`} x={labelX} dy={index === 0 ? 14 : 14}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-4 text-sm leading-6 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
              <div className="font-medium">P0 → P9</div>
              <div className="text-[var(--color-neutral-500)]">Full product-development loop</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-4 text-sm leading-6 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
              <div className="font-medium">Shared memory underneath</div>
              <div className="text-[var(--color-neutral-500)]">`state.json` + `.claude/shared/*.json` keep the system in sync</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-white p-4 text-sm leading-6 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
              <div className="font-medium">Learn closes the loop</div>
              <div className="text-[var(--color-neutral-500)]">Evidence from shipped work becomes the next input</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <InfoCard
            eyebrow="Step 2"
            title="The hub translates the request."
            body="It reads the current feature state, decides what kind of work this is, loads only the relevant skills, and chooses where the task should enter the lifecycle."
          />
          <InfoCard
            eyebrow="Step 4"
            title="Gates and tool sync keep the loop honest."
            body="User approval, CI, evals, analytics, and review checks gate advancement. GitHub, Notion, Figma, and Vercel stay aligned while the feature moves."
          />
          <InfoCard
            eyebrow="Step 5"
            title="Shipping is a midpoint, not the end."
            body="The Learn phase monitors outcomes and feeds them back into the next cycle. That is what turns the PM-flow from a pipeline into a living operating system."
          />
        </div>
      </div>
    </div>
  );
}
