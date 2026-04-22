'use client';

import { getSkill, type SkillSlug } from '@/lib/skill-ecosystem';

type WorkType = {
  label: string;
  entry: string;
  accent: string;
  background: string;
};

type PhaseBlueprint = {
  id: string;
  title: string;
  summary: string;
  skills: SkillSlug[];
  sync?: string;
};

const INPUTS = ['User prompt', 'CX signal', 'Ops incident', 'Research trigger'];

const WORK_TYPES: WorkType[] = [
  {
    label: 'Feature',
    entry: 'P0',
    accent: 'var(--color-brand-indigo)',
    background: 'color-mix(in srgb, var(--color-brand-indigo) 10%, white)',
  },
  {
    label: 'Enhancement',
    entry: 'P2',
    accent: 'var(--color-brand-coral)',
    background: 'color-mix(in srgb, var(--color-brand-coral) 10%, white)',
  },
  {
    label: 'Fix',
    entry: 'P4',
    accent: 'var(--color-brand-indigo-hover)',
    background: 'color-mix(in srgb, var(--color-brand-indigo-hover) 8%, white)',
  },
  {
    label: 'Chore',
    entry: 'Minimal',
    accent: 'var(--color-neutral-500)',
    background: 'color-mix(in srgb, var(--color-neutral-500) 10%, white)',
  },
];

const PHASES: PhaseBlueprint[] = [
  {
    id: 'P0',
    title: 'Research',
    summary: 'Validate the problem and gather context.',
    skills: ['research', 'cx', 'marketing'],
  },
  {
    id: 'P1',
    title: 'PRD',
    summary: 'Define metrics, guardrails, and scope.',
    skills: ['pm-workflow', 'analytics'],
  },
  {
    id: 'P2',
    title: 'Tasks',
    summary: 'Assign work, dependencies, and ownership.',
    skills: ['pm-workflow'],
  },
  {
    id: 'P3',
    title: 'UX / Integration',
    summary: 'Translate intent into experience and system rules.',
    skills: ['ux', 'design'],
    sync: 'Figma',
  },
  {
    id: 'P4',
    title: 'Implement',
    summary: 'Execute in code and infra.',
    skills: ['dev', 'design', 'ops'],
  },
  {
    id: 'P5',
    title: 'Test',
    summary: 'Run quality gates and instrumentation checks.',
    skills: ['qa', 'analytics'],
  },
  {
    id: 'P6',
    title: 'Review',
    summary: 'Validate code, spec, and UX quality.',
    skills: ['dev', 'design', 'ux'],
  },
  {
    id: 'P7',
    title: 'Merge',
    summary: 'Ship safely and broadcast the change.',
    skills: ['release', 'dev'],
    sync: 'GitHub + Vercel',
  },
  {
    id: 'P8',
    title: 'Docs',
    summary: 'Launch, handoff, and communicate the work.',
    skills: ['marketing', 'analytics', 'cx'],
    sync: 'Notion',
  },
  {
    id: 'P9',
    title: 'Learn',
    summary: 'Assess outcomes and feed the next cycle.',
    skills: ['cx', 'analytics', 'ops'],
  },
];

const CONTINUOUS = [
  {
    title: '/cx',
    detail: 'Customer voice across P0, P8, and P9.',
    accent: 'var(--color-brand-coral)',
  },
  {
    title: '/marketing',
    detail: 'Positioning before launch and after ship.',
    accent: 'var(--color-brand-indigo)',
  },
  {
    title: '/ops',
    detail: 'Health, incidents, and operational drift across the loop.',
    accent: 'var(--color-neutral-500)',
  },
];

const SHARED_FILES = [
  'state.json',
  'feature-registry.json',
  'task-queue.json',
  'change-log.json',
  'metric-status.json',
  'health-status.json',
  'cx-signals.json',
  'campaign-tracker.json',
];

function SkillChip({ slug }: { slug: SkillSlug }) {
  const skill = getSkill(slug);
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium"
      style={{
        borderColor: `${skill.accent}55`,
        backgroundColor: `${skill.accent}14`,
        color: skill.accent,
      }}
    >
      {skill.displayName}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand-indigo)] dark:text-[var(--color-brand-indigo)]">
      {children}
    </div>
  );
}

export function LifecycleLoop() {
  return (
    <div className="my-8 space-y-6">
      <div className="rounded-[32px] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] md:p-8">
        <div
          className="rounded-[28px] border border-[var(--color-neutral-200)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-[var(--color-neutral-700)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(79,70,229,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(249,112,102,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          <div className="text-center">
            <SectionLabel>Blueprint View</SectionLabel>
            <h3 className="mt-2 font-serif text-2xl md:text-3xl">
              The hub, the lanes, and the full PM-flow cycle
            </h3>
          </div>

          <div className="mt-8 space-y-5">
            <div className="rounded-3xl border border-[var(--color-neutral-200)] bg-white p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
              <SectionLabel>Inputs</SectionLabel>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {INPUTS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-4 py-2 text-sm dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-center text-[var(--color-neutral-500)]">↓</div>
            </div>

            <div className="rounded-3xl border border-[color:color-mix(in_srgb,var(--color-brand-indigo)_22%,transparent)] bg-[var(--color-neutral-900)] px-6 py-7 text-white shadow-[0_18px_40px_rgba(79,70,229,0.12)] dark:bg-[var(--color-neutral-800)]">
              <SectionLabel>PM Workflow Hub</SectionLabel>
              <div className="mt-3 font-serif text-3xl">/pm-workflow</div>
              <p className="mt-3 max-w-[60ch] text-sm leading-6 text-[rgba(255,255,255,0.78)]">
                Reads feature state, classifies the work type, chooses the entry point,
                dispatches the right skills, enforces phase gates, and keeps external
                systems aligned while the work moves.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--color-neutral-200)] bg-white p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
              <SectionLabel>Work Type Lanes</SectionLabel>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {WORK_TYPES.map((type) => (
                  <div
                    key={type.label}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: `${type.accent}33`, backgroundColor: type.background }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-serif text-lg">{type.label}</div>
                      <span
                        className="rounded-full border px-2.5 py-1 text-xs font-medium"
                        style={{
                          borderColor: `${type.accent}55`,
                          color: type.accent,
                        }}
                      >
                        {type.entry}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-neutral-200)] bg-white p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
              <SectionLabel>Phase Spine</SectionLabel>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {PHASES.map((phase) => (
                  <div
                    key={phase.id}
                    className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4 transition-colors hover:border-[color:color-mix(in_srgb,var(--color-brand-indigo)_24%,var(--color-neutral-200))] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-brand-indigo)]">
                          {phase.id}
                        </div>
                        <div className="mt-1 font-serif text-xl">{phase.title}</div>
                      </div>
                      {phase.sync ? (
                        <div className="rounded-full border border-[color:color-mix(in_srgb,var(--color-brand-coral)_28%,var(--color-neutral-200))] bg-[color:color-mix(in_srgb,var(--color-brand-coral)_8%,white)] px-3 py-1 text-xs text-[var(--color-neutral-700)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]">
                          {phase.sync}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {phase.skills.map((slug) => (
                        <SkillChip key={`${phase.id}-${slug}`} slug={slug} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-3xl border border-[var(--color-neutral-200)] bg-white p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
                <SectionLabel>Continuous Layer</SectionLabel>
                <div className="mt-4 space-y-3">
                {CONTINUOUS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: `${item.accent}33`,
                      backgroundColor: `color-mix(in srgb, ${item.accent} 10%, white)`,
                    }}
                  >
                      <div className="text-sm font-semibold" style={{ color: item.accent }}>
                        {item.title}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--color-neutral-200)] bg-white p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)]">
                <SectionLabel>Shared Memory + Broadcast</SectionLabel>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SHARED_FILES.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-1.5 text-xs text-[var(--color-neutral-700)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-300)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--color-neutral-500)]">
                  Merge writes to the shared layer, `change-log.json` broadcasts the update,
                  and new signals route back into the hub as a fix, enhancement, or re-scope.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
            How To Read It
          </div>
          <h3 className="mt-3 font-serif text-xl">The diagram stays structural.</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            The boxes above show the system architecture itself: inputs, hub, work-type lanes,
            phase spine, continuous roles, and shared memory. The longer explanation lives
            down here so the blueprint stays clear.
          </p>
        </div>
        <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-brand-coral)_22%,var(--color-neutral-200))] bg-[color:color-mix(in_srgb,var(--color-brand-coral)_6%,var(--color-neutral-50))] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
            Fast Lanes
          </div>
          <h3 className="mt-3 font-serif text-xl">Not every task starts at the top.</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            Features use the full P0 to P9 lifecycle. Enhancements can join at Tasks.
            Fixes and chores enter later, usually around Implement, then still pass through
            test, review, and merge.
          </p>
        </div>
        <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-brand-indigo)_22%,var(--color-neutral-200))] bg-[color:color-mix(in_srgb,var(--color-brand-indigo)_6%,var(--color-neutral-50))] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
            Continuous Roles
          </div>
          <h3 className="mt-3 font-serif text-xl">CX, marketing, and ops stay alive throughout.</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            They are not one-off endcaps. CX keeps the feedback loop honest, marketing shapes
            the story around shipped work, and ops keeps the system healthy while the cycle runs.
          </p>
        </div>
      </div>
    </div>
  );
}
