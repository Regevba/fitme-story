export type FloorState = 'idle' | 'firing' | 'done' | 'dormant';

export interface TraceBeat {
  id: string;
  title: string;
  narrative: string;
  floorStates: Record<number, FloorState>;   // 1–6 → state
  metrics?: { label: string; value: string }[];
  flow?: Array<{ from: number; to: number; label: string }>;  // optional arrows between floors
}

export interface Trace {
  id: string;
  title: string;
  subtitle: string;
  sourceRef: { label: string; href: string };
  beats: TraceBeat[];
}

const sprintI: Trace = {
  id: 'sprint-i',
  title: 'Sprint I — 10 UI/DS token migrations',
  subtitle: 'Low-risk mechanical work. Routed to a LITTLE core. Only 2 skills loaded.',
  sourceRef: {
    label: 'Full Sprint I methodology →',
    href: '/case-studies/soc-on-software',
  },
  beats: [
    {
      id: 'entry',
      title: 'Request arrives',
      narrative: 'Sprint I enters the framework: 10 mechanical UI/DS fixes queued from the audit backlog. Raw fonts, inline shadows, unmapped opacity literals.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle' },
      metrics: [{ label: 'findings', value: '10' }, { label: 'risk', value: 'low' }],
    },
    {
      id: 'read-state',
      title: 'Floor 1 — shared state read',
      narrative: 'audit-findings.json returns 10 unresolved UI/DS findings. feature-registry.json maps them to 6 views. design-system.json exposes the token API.',
      floorStates: { 1: 'firing', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle' },
    },
    {
      id: 'classify',
      title: 'Floor 5 — dispatch intelligence classifies',
      narrative: 'complexity_scoring: "mechanical token migration, low." task_complexity_gate routes to LITTLE core. tool_budgets allocates small Edit-heavy budget. No parallel dispatch needed.',
      floorStates: { 1: 'done', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'firing', 6: 'idle' },
      metrics: [{ label: 'core', value: 'LITTLE' }, { label: 'dispatch', value: 'serial' }],
    },
    {
      id: 'skills-load',
      title: 'Floor 3 — skills loaded on-demand',
      narrative: 'phase_skills["implement"] loads only `design` and `dev` SKILL.md. The other 9 skills stay dormant. compressed_view reads cache in palettized form.',
      floorStates: { 1: 'done', 2: 'idle', 3: 'firing', 4: 'idle', 5: 'done', 6: 'idle' },
      metrics: [{ label: 'skills loaded', value: '2 / 11' }, { label: 'context saved', value: '~27K tok' }],
    },
    {
      id: 'cache-consult',
      title: 'Floor 2 — cache tiers consulted',
      narrative: 'L1 cache returns the design/token map (AppText.displayXL = 36pt). L2 returns ux-foundations principles. L3 returns prior v2 migration patterns. cache-hits.json increments.',
      floorStates: { 1: 'done', 2: 'firing', 3: 'done', 4: 'idle', 5: 'done', 6: 'idle' },
      flow: [{ from: 2, to: 6, label: 'hits +3' }],
    },
    {
      id: 'execute',
      title: 'Floor 4 — systolic execution loop',
      narrative: 'Per finding: Grep → Read → Edit forwards results without reloading. 10 iterations in sequence. Floor 5 keeps a snapshot armed; rollback unnecessary, never fires.',
      floorStates: { 1: 'done', 2: 'done', 3: 'done', 4: 'firing', 5: 'done', 6: 'firing' },
      flow: [{ from: 4, to: 6, label: 'phase-timing tick' }],
      metrics: [{ label: 'edits', value: '10' }, { label: 'rollbacks', value: '0' }],
    },
    {
      id: 'exit',
      title: 'Write-back & exit',
      narrative: 'audit-findings.json updated: 10 resolved. case-study-monitoring records phase transition. cache-metrics flushed. PR #97 opened and merged.',
      floorStates: { 1: 'firing', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done' },
      metrics: [{ label: 'findings resolved', value: '10 / 10' }, { label: 'PR', value: '#97' }],
    },
  ],
};

const fitmeStoryBuild: Trace = {
  id: 'fitme-story',
  title: 'fitme-story — building the showcase site itself',
  subtitle: 'Medium complexity, 37 tasks, UI-heavy. Routes to big core. 5 skills dispatched in a batched chain.',
  sourceRef: {
    label: 'Full fitme-story case study →',
    href: '/case-studies/framework-story-site',
  },
  beats: [
    {
      id: 'entry',
      title: 'Request arrives',
      narrative: 'User brief: build a public showcase site of the PM framework, timeline-first, Next.js 16 + rich motion. 37 tasks scoped across 7 phases.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle' },
      metrics: [{ label: 'tasks', value: '37' }, { label: 'risk', value: 'medium' }],
    },
    {
      id: 'classify-big',
      title: 'Floor 5 — classified as UI-heavy, medium complexity',
      narrative: 'complexity_scoring returns "medium-high, multi-file, novel visual components." task_complexity_gate routes to big core (Sonnet). tool_budgets allocates wide budget across Read/Edit/Write.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'firing', 6: 'idle' },
      metrics: [{ label: 'core', value: 'big' }, { label: 'model', value: 'Sonnet' }],
    },
    {
      id: 'skill-chain',
      title: 'Floor 2 — skill chain activates',
      narrative: 'pm-workflow → brainstorming (8 questions) → writing-plans (37 tasks) → subagent-driven-development. Chain orchestrates without coordinator context switch.',
      floorStates: { 1: 'idle', 2: 'firing', 3: 'idle', 4: 'idle', 5: 'done', 6: 'idle' },
      metrics: [{ label: 'skills chained', value: '4' }, { label: 'brainstorm qs', value: '8' }],
    },
    {
      id: 'on-demand-per-phase',
      title: 'Floor 3 — skills on-demand per phase',
      narrative: 'Phase-specific loads: scaffold phase → design+dev; content pipeline → pm-workflow; persona system → dev only. The other 9 skills stay dormant across all phases.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'firing', 4: 'idle', 5: 'done', 6: 'idle' },
      flow: [{ from: 3, to: 2, label: 'phase-skill swap' }],
    },
    {
      id: 'batch-dispatch',
      title: 'Floor 4 — batched subagent dispatch',
      narrative: 'batch_dispatch groups tightly-coupled tasks into single subagent calls: Phase 0 scaffold (5 tasks → 1 dispatch), Phase 2 persona (4 → 1), Phase 6 pages (6 → 1). 5x reduction vs strict one-per-task.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'done', 4: 'firing', 5: 'done', 6: 'idle' },
      metrics: [{ label: 'dispatches', value: '23 / 111' }, { label: 'reduction', value: '80%' }],
    },
    {
      id: 'measure',
      title: 'Floor 6 — measurement observes',
      narrative: 'phase-timing records each subagent duration. cache-hits tracks L1/L2/L3 per dispatch. CU v2 computes complexity in real time: 45 CU total, 2.7 min/CU — framework all-time best.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'firing' },
      metrics: [{ label: 'min/CU', value: '2.7' }, { label: 'wall clock', value: '2h 2min' }],
    },
    {
      id: 'ship',
      title: 'Write-back & exit',
      narrative: 'Floor 1 records: 37 commits, 12/12 tests, 36 pre-rendered routes. Production live at fitme-story.vercel.app. Case study auto-written and committed to both FitTracker2 and fitme-showcase.',
      floorStates: { 1: 'firing', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done' },
      metrics: [{ label: 'commits', value: '37' }, { label: 'Lighthouse', value: '95+/100/100/100' }],
    },
  ],
};

export const TRACES: Trace[] = [sprintI, fitmeStoryBuild];
