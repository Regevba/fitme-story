import type { PhaseId } from './lifecycle-phases';

export type SkillSlug =
  | 'pm-workflow' | 'research' | 'ux' | 'design' | 'dev'
  | 'qa' | 'analytics' | 'cx' | 'marketing' | 'ops' | 'release';

export type RingPosition = 'hub' | 'inner' | 'outer';

export interface Skill {
  slug: SkillSlug;
  displayName: string;            // "/pm-workflow"
  oneLiner: string;               // 1 sentence — shows on brick front + loop tooltip
  accent: string;                 // hex (mirrors blueprint-data.ts pattern)
  accentVar: string;              // CSS var name — e.g. 'var(--skill-pm-workflow)'
  ring: RingPosition;             // 'hub' | 'inner' | 'outer' — drives Lego Wall placement
  phaseOwnership: PhaseId[];      // [0] is primary column in assembled view
  subCommands: string[];          // ["plan", "run", "coverage", ...]
  purpose: string;                // 2-3 sentence paragraph (shows on brick back)
  invokes: SkillSlug[];           // skills this skill calls
  invokedBy: SkillSlug[];         // skills that call this one
  readsFromShared: string[];      // JSON filenames it reads
  writesToShared: string[];       // JSON filenames it writes
  standaloneExample: string;      // "Used alone: /qa coverage prints current coverage."
  docsHref: string;               // GitHub URL to docs/skills/{name}.md
}

const GH_DOCS = 'https://github.com/Regevba/FitTracker2/blob/main/docs/skills';

export const SKILLS: Skill[] = [
  {
    slug: 'pm-workflow',
    displayName: '/pm-workflow',
    oneLiner: 'The hub. Orchestrates the 10-phase lifecycle.',
    accent: '#4F46E5',
    accentVar: 'var(--skill-pm-workflow)',
    ring: 'hub',
    phaseOwnership: ['P1', 'P2', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'],
    subCommands: ['{feature-name}'],
    purpose: 'The orchestrator at the heart of the framework. /pm-workflow runs a feature through nine lifecycle phases, dispatches the ten spoke skills as needed, and syncs state into the shared data layer. It is the only skill that touches every phase.',
    invokes: ['research', 'ux', 'design', 'dev', 'qa', 'analytics', 'cx', 'marketing', 'ops', 'release'],
    invokedBy: [],
    readsFromShared: ['context.json', 'feature-registry.json', 'skill-routing.json', 'framework-manifest.json', 'case-study-monitoring.json'],
    writesToShared: ['feature-registry.json', 'case-study-monitoring.json', 'change-log.json'],
    standaloneExample: 'Used alone: /pm-workflow my-feature starts a new feature through the full nine-phase lifecycle.',
    docsHref: `${GH_DOCS}/pm-workflow.md`,
  },
  {
    slug: 'research',
    displayName: '/research',
    oneLiner: "What's out there. Cross-industry to feature-specific research.",
    accent: '#F59E0B',
    accentVar: 'var(--skill-research)',
    ring: 'inner',
    phaseOwnership: ['P0'],
    subCommands: ['wide', 'narrow', 'feature', 'competitive', 'market', 'ux-patterns', 'aso'],
    purpose: '/research funnels from cross-industry pattern recognition down to feature-specific deep dives. It surfaces competitive moves, market trends, UX patterns, and ASO keywords so the team starts Phase 0 with a clear landscape instead of assumptions.',
    invokes: ['cx', 'marketing'],
    invokedBy: ['pm-workflow'],
    readsFromShared: ['context.json', 'cx-signals.json'],
    writesToShared: ['context.json'],
    standaloneExample: 'Used alone: /research feature smart-reminders fetches prior-art for a new feature idea.',
    docsHref: `${GH_DOCS}/research.md`,
  },
  {
    slug: 'ux',
    displayName: '/ux',
    oneLiner: 'What & Why. Research, principles, specs, audits.',
    accent: '#D946EF',
    accentVar: 'var(--skill-ux)',
    ring: 'inner',
    phaseOwnership: ['P3'],
    subCommands: ['research', 'spec', 'wireframe', 'validate', 'audit', 'patterns', 'prompt'],
    purpose: '/ux owns UX planning — principles, specs, wireframes, v2 audits, validation. Split from /design in v2.0 to keep "what & why" separate from "how it looks." Feeds directly into Phase 3 UX before design kicks in.',
    invokes: ['research', 'design'],
    invokedBy: ['pm-workflow', 'design'],
    readsFromShared: ['feature-registry.json', 'context.json'],
    writesToShared: ['feature-registry.json'],
    standaloneExample: 'Used alone: /ux audit runs the 13-principle audit on an existing screen.',
    docsHref: `${GH_DOCS}/ux.md`,
  },
  {
    slug: 'design',
    displayName: '/design',
    oneLiner: 'How it Looks. Tokens, Figma, WCAG, components.',
    accent: '#EC4899',
    accentVar: 'var(--skill-design)',
    ring: 'inner',
    phaseOwnership: ['P3', 'P6'],
    subCommands: ['audit', 'ux-spec', 'figma', 'tokens', 'accessibility', 'prompt', 'build'],
    purpose: '/design owns the visual layer: token governance, Figma MCP builds, component library maintenance, WCAG AA checks. Runs after /ux has defined what & why; keeps the design system coherent across every new feature.',
    invokes: ['ux'],
    invokedBy: ['pm-workflow', 'ux'],
    readsFromShared: ['design-system.json', 'feature-registry.json'],
    writesToShared: ['design-system.json'],
    standaloneExample: 'Used alone: /design tokens runs the token drift check independent of any feature.',
    docsHref: `${GH_DOCS}/design.md`,
  },
  {
    slug: 'dev',
    displayName: '/dev',
    oneLiner: "How it's Built. Branching, review, CI, perf.",
    accent: '#0EA5E9',
    accentVar: 'var(--skill-dev)',
    ring: 'inner',
    phaseOwnership: ['P4', 'P6', 'P7'],
    subCommands: ['branch', 'review', 'deps', 'perf', 'ci-status'],
    purpose: '/dev owns implementation hygiene: branching conventions, code review discipline, CI status, dependency freshness, performance profiling. Shows up whenever code is being written or shipped.',
    invokes: ['qa'],
    invokedBy: ['pm-workflow'],
    readsFromShared: ['feature-registry.json', 'test-coverage.json'],
    writesToShared: ['feature-registry.json', 'change-log.json'],
    standaloneExample: 'Used alone: /dev review audits a PR for common issues independent of the hub.',
    docsHref: `${GH_DOCS}/dev.md`,
  },
  {
    slug: 'qa',
    displayName: '/qa',
    oneLiner: 'Does it Work. Tests, coverage, regression, security.',
    accent: '#84CC16',
    accentVar: 'var(--skill-qa)',
    ring: 'inner',
    phaseOwnership: ['P5'],
    subCommands: ['plan', 'run', 'coverage', 'regression', 'security'],
    purpose: '/qa owns test planning, execution, coverage reporting, regression sweeps, and security audits. It gates Phase 5 and blocks advancement when coverage or pass-rate drops.',
    invokes: ['dev', 'analytics'],
    invokedBy: ['pm-workflow', 'dev'],
    readsFromShared: ['test-coverage.json', 'feature-registry.json'],
    writesToShared: ['test-coverage.json'],
    standaloneExample: 'Used alone: /qa security runs a static security audit without touching the rest of the hub.',
    docsHref: `${GH_DOCS}/qa.md`,
  },
  {
    slug: 'analytics',
    displayName: '/analytics',
    oneLiner: 'Can We Measure It. Events, dashboards, funnels.',
    accent: '#06B6D4',
    accentVar: 'var(--skill-analytics)',
    ring: 'inner',
    phaseOwnership: ['P1', 'P5', 'P8'],
    subCommands: ['spec', 'validate', 'dashboard', 'report', 'funnel'],
    purpose: '/analytics owns event taxonomy, instrumentation validation, dashboard templates, and funnel analysis. It is how the framework knows whether a shipped feature met its PRD success criteria.',
    invokes: [],
    invokedBy: ['pm-workflow', 'qa', 'cx'],
    readsFromShared: ['metric-status.json', 'feature-registry.json'],
    writesToShared: ['metric-status.json'],
    standaloneExample: 'Used alone: /analytics funnel defines a new conversion funnel independently.',
    docsHref: `${GH_DOCS}/analytics.md`,
  },
  {
    slug: 'cx',
    displayName: '/cx',
    oneLiner: 'What Users Say. Reviews, NPS, sentiment, feedback.',
    accent: '#F43F5E',
    accentVar: 'var(--skill-cx)',
    ring: 'outer',
    phaseOwnership: ['P0', 'P8', 'P9'],
    subCommands: ['reviews', 'nps', 'sentiment', 'testimonials', 'roadmap', 'digest', 'analyze'],
    purpose: '/cx ingests app-store reviews, NPS scores, sentiment signals, and post-deployment feedback into the shared data layer. It is one of three outer-ring skills that continuously feed information into the cycle rather than owning a single phase.',
    invokes: ['analytics', 'marketing'],
    invokedBy: ['pm-workflow', 'research'],
    readsFromShared: ['cx-signals.json', 'feature-registry.json'],
    writesToShared: ['cx-signals.json'],
    standaloneExample: 'Used alone: /cx reviews pulls the latest App Store reviews without running a full lifecycle.',
    docsHref: `${GH_DOCS}/cx.md`,
  },
  {
    slug: 'marketing',
    displayName: '/marketing',
    oneLiner: 'How We Tell the World. ASO, campaigns, launch.',
    accent: '#F97316',
    accentVar: 'var(--skill-marketing)',
    ring: 'outer',
    phaseOwnership: ['P0', 'P8'],
    subCommands: ['aso', 'campaign', 'competitive', 'content', 'email', 'launch', 'screenshots'],
    purpose: '/marketing owns outbound communication: App Store optimization, campaigns, competitive positioning, content, email sequences, launch coordination. Outer-ring: it feeds in market intelligence and receives shipped outcomes.',
    invokes: [],
    invokedBy: ['pm-workflow', 'research', 'cx'],
    readsFromShared: ['campaign-tracker.json', 'cx-signals.json'],
    writesToShared: ['campaign-tracker.json'],
    standaloneExample: 'Used alone: /marketing aso runs an ASO audit before a release.',
    docsHref: `${GH_DOCS}/marketing.md`,
  },
  {
    slug: 'ops',
    displayName: '/ops',
    oneLiner: 'Is It Up. Infrastructure, incidents, cost, alerts.',
    accent: '#64748B',
    accentVar: 'var(--skill-ops)',
    ring: 'outer',
    phaseOwnership: [],
    subCommands: ['health', 'incident', 'cost', 'alerts'],
    purpose: '/ops owns infrastructure monitoring, incident response, cost tracking, and alert configuration. It spans every phase — there is no single phase in which /ops lives; it is always running in the background.',
    invokes: [],
    invokedBy: ['pm-workflow'],
    readsFromShared: ['health-status.json'],
    writesToShared: ['health-status.json'],
    standaloneExample: 'Used alone: /ops health prints current infrastructure health without any active feature work.',
    docsHref: `${GH_DOCS}/ops.md`,
  },
  {
    slug: 'release',
    displayName: '/release',
    oneLiner: 'Is It Ready. Versions, changelog, TestFlight, App Store.',
    accent: '#10B981',
    accentVar: 'var(--skill-release)',
    ring: 'inner',
    phaseOwnership: ['P7'],
    subCommands: ['prepare', 'checklist', 'notes', 'submit'],
    purpose: '/release owns the pre-ship gauntlet: version bumps, changelog generation, TestFlight preparation, App Store submission checklists. Owns Phase 7 cleanly.',
    invokes: ['dev', 'qa'],
    invokedBy: ['pm-workflow'],
    readsFromShared: ['change-log.json', 'test-coverage.json'],
    writesToShared: ['change-log.json'],
    standaloneExample: 'Used alone: /release checklist prints the pre-submit checklist at any time.',
    docsHref: `${GH_DOCS}/release.md`,
  },
];

// Derived helpers
export function getSkill(slug: SkillSlug): Skill {
  const s = SKILLS.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown skill: ${slug}`);
  return s;
}

export function skillsByPhase(phaseId: PhaseId): Skill[] {
  return SKILLS.filter((s) => s.phaseOwnership.includes(phaseId));
}

export function alwaysOnSkills(): Skill[] {
  // Ring=hub or ring=outer — bricks that live in the always-on row below the columns
  return SKILLS.filter((s) => s.ring === 'hub' || s.ring === 'outer');
}

export function phaseColumnSkills(phaseId: PhaseId): Skill[] {
  // Bricks that show up in the assembled-view phase columns.
  // Skill must (a) own this phase AND (b) not be in the always-on row.
  return SKILLS.filter(
    (s) => s.phaseOwnership.includes(phaseId) && s.ring === 'inner',
  );
}

export function primaryPhaseSkill(phaseId: PhaseId): Skill | undefined {
  // The single skill whose color tints the inner-ring phase pip (from lifecycle-phases.ts primarySkillSlug).
  return SKILLS.find((s) => s.phaseOwnership[0] === phaseId && s.ring === 'inner');
}
