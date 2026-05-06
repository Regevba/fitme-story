export type FloorState = 'idle' | 'firing' | 'done' | 'dormant';

export interface TraceBeat {
  id: string;
  title: string;
  narrative: string;
  floorStates: Record<number, FloorState>;   // 1–8 → state
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
  subtitle: 'Low-risk mechanical work. Routed to a LITTLE core. Only 2 skills loaded. Floors 7–8 dormant — they did not exist yet.',
  sourceRef: {
    label: 'Full Sprint I methodology →',
    href: '/case-studies/soc-on-software',
  },
  beats: [
    {
      id: 'entry',
      title: 'Request arrives',
      narrative: 'Sprint I enters the framework: 10 mechanical UI/DS fixes queued from the audit backlog. Raw fonts, inline shadows, unmapped opacity literals.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'findings', value: '10' }, { label: 'risk', value: 'low' }],
    },
    {
      id: 'read-state',
      title: 'Floor 1 — shared state read',
      narrative: 'audit-findings.json returns 10 unresolved UI/DS findings. feature-registry.json maps them to 6 views. design-system.json exposes the token API.',
      floorStates: { 1: 'firing', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'dormant', 8: 'dormant' },
    },
    {
      id: 'classify',
      title: 'Floor 5 — dispatch intelligence classifies',
      narrative: 'complexity_scoring: "mechanical token migration, low." task_complexity_gate routes to LITTLE core. tool_budgets allocates small Edit-heavy budget. No parallel dispatch needed.',
      floorStates: { 1: 'done', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'firing', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'core', value: 'LITTLE' }, { label: 'dispatch', value: 'serial' }],
    },
    {
      id: 'skills-load',
      title: 'Floor 3 — skills loaded on-demand',
      narrative: 'phase_skills["implement"] loads only `design` and `dev` SKILL.md. The other 9 skills stay dormant. compressed_view reads cache in palettized form.',
      floorStates: { 1: 'done', 2: 'idle', 3: 'firing', 4: 'idle', 5: 'done', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'skills loaded', value: '2 / 11' }, { label: 'context saved', value: '~27K tok' }],
    },
    {
      id: 'cache-consult',
      title: 'Floor 2 — cache tiers consulted',
      narrative: 'L1 cache returns the design/token map (AppText.displayXL = 36pt). L2 returns ux-foundations principles. L3 returns prior v2 migration patterns. cache-hits.json increments.',
      floorStates: { 1: 'done', 2: 'firing', 3: 'done', 4: 'idle', 5: 'done', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      flow: [{ from: 2, to: 6, label: 'hits +3' }],
    },
    {
      id: 'execute',
      title: 'Floor 4 — systolic execution loop',
      narrative: 'Per finding: Grep → Read → Edit forwards results without reloading. 10 iterations in sequence. Floor 5 keeps a snapshot armed; rollback unnecessary, never fires.',
      floorStates: { 1: 'done', 2: 'done', 3: 'done', 4: 'firing', 5: 'done', 6: 'firing', 7: 'dormant', 8: 'dormant' },
      flow: [{ from: 4, to: 6, label: 'phase-timing tick' }],
      metrics: [{ label: 'edits', value: '10' }, { label: 'rollbacks', value: '0' }],
    },
    {
      id: 'exit',
      title: 'Write-back & exit',
      narrative: 'audit-findings.json updated: 10 resolved. case-study-monitoring records phase transition. cache-metrics flushed. PR #97 opened and merged.',
      floorStates: { 1: 'firing', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'findings resolved', value: '10 / 10' }, { label: 'PR', value: '#97' }],
    },
  ],
};

const fitmeStoryBuild: Trace = {
  id: 'fitme-story',
  title: 'fitme-story — building the showcase site itself',
  subtitle: 'Medium complexity, 37 tasks, UI-heavy. Routes to big core. 5 skills dispatched in a batched chain. Floors 7–8 dormant — they did not exist yet.',
  sourceRef: {
    label: 'Full fitme-story case study →',
    href: '/case-studies/framework-story-site',
  },
  beats: [
    {
      id: 'entry',
      title: 'Request arrives',
      narrative: 'User brief: build a public showcase site of the PM framework, timeline-first, Next.js 16 + rich motion. 37 tasks scoped across 7 phases.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'tasks', value: '37' }, { label: 'risk', value: 'medium' }],
    },
    {
      id: 'classify-big',
      title: 'Floor 5 — classified as UI-heavy, medium complexity',
      narrative: 'complexity_scoring returns "medium-high, multi-file, novel visual components." task_complexity_gate routes to big core (Sonnet). tool_budgets allocates wide budget across Read/Edit/Write.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'firing', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'core', value: 'big' }, { label: 'model', value: 'Sonnet' }],
    },
    {
      id: 'skill-chain',
      title: 'Floor 2 — skill chain activates',
      narrative: 'pm-workflow → brainstorming (8 questions) → writing-plans (37 tasks) → subagent-driven-development. Chain orchestrates without coordinator context switch.',
      floorStates: { 1: 'idle', 2: 'firing', 3: 'idle', 4: 'idle', 5: 'done', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'skills chained', value: '4' }, { label: 'brainstorm qs', value: '8' }],
    },
    {
      id: 'on-demand-per-phase',
      title: 'Floor 3 — skills on-demand per phase',
      narrative: 'Phase-specific loads: scaffold phase → design+dev; content pipeline → pm-workflow; persona system → dev only. The other 9 skills stay dormant across all phases.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'firing', 4: 'idle', 5: 'done', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      flow: [{ from: 3, to: 2, label: 'phase-skill swap' }],
    },
    {
      id: 'batch-dispatch',
      title: 'Floor 4 — batched subagent dispatch',
      narrative: 'batch_dispatch groups tightly-coupled tasks into single subagent calls: Phase 0 scaffold (5 tasks → 1 dispatch), Phase 2 persona (4 → 1), Phase 6 pages (6 → 1). 5x reduction vs strict one-per-task.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'done', 4: 'firing', 5: 'done', 6: 'idle', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'dispatches', value: '23 / 111' }, { label: 'reduction', value: '80%' }],
    },
    {
      id: 'measure',
      title: 'Floor 6 — measurement observes',
      narrative: 'phase-timing records each subagent duration. cache-hits tracks L1/L2/L3 per dispatch. CU v2 computes complexity in real time: 45 CU total, 2.7 min/CU — framework all-time best.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'firing', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'min/CU', value: '2.7' }, { label: 'wall clock', value: '2h 2min' }],
    },
    {
      id: 'ship',
      title: 'Write-back & exit',
      narrative: 'Floor 1 records: 37 commits, 12/12 tests, 36 pre-rendered routes. Production live at fitme-story.vercel.app. Case study auto-written and committed to both FitTracker2 and fitme-showcase.',
      floorStates: { 1: 'firing', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done', 7: 'dormant', 8: 'dormant' },
      metrics: [{ label: 'commits', value: '37' }, { label: 'Lighthouse', value: '95+/100/100/100' }],
    },
  ],
};

const validityClosureV77: Trace = {
  id: 'validity-closure-v7-7',
  title: 'v7.7 Validity Closure — the framework instrumenting itself',
  subtitle: 'The meta-feature that built floor 7. Watch the framework gain mechanical enforcement as it runs through itself.',
  sourceRef: {
    label: 'Full v7.7 case study →',
    href: '/case-studies/framework-v7-7-validity-closure',
  },
  beats: [
    {
      id: 'entry',
      title: 'Request arrives',
      narrative: 'A 2026-04-27 ledger pull surfaces 3 of 5 Class B gaps still mechanically closable: cache_hits writer-path, cu_v2 schema, T1/T2/T3 tag correctness. Single-session retro authored as forward work.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'idle', 8: 'dormant' },
      metrics: [{ label: 'closable gaps', value: '3 / 5' }, { label: 'risk', value: 'high (self-modifying)' }],
    },
    {
      id: 'state-read',
      title: 'Floor 1 — full inventory pulled',
      narrative: 'audit-findings.json + state.json across 45 features read. measurement-adoption-history.json checked. Documentation-debt ledger surfaces 32 case-study frontmatters needing tier-tag bulk-backfill.',
      floorStates: { 1: 'firing', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'idle', 8: 'dormant' },
      metrics: [{ label: 'features audited', value: '45' }, { label: 'frontmatters to backfill', value: '32' }],
    },
    {
      id: 'classify-meta',
      title: 'Floor 5 — classified as framework-meta, single-session',
      narrative: 'complexity_scoring: "high — touches 8 hooks + cycle-time runner + 32 case studies + 3 paused features." Routes to big core, single-session retro execution. tool_budgets allocates wide Edit + Write + Bash.',
      floorStates: { 1: 'done', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'firing', 6: 'idle', 7: 'idle', 8: 'dormant' },
      metrics: [{ label: 'core', value: 'big' }, { label: 'session', value: 'single ~6h' }],
    },
    {
      id: 'skills-execute',
      title: 'Floors 3 + 4 — skills load + systolic execution',
      narrative: 'pm-workflow + writing-plans + subagent-driven-development + verification-before-completion load. 5 PR-units batched: M1 cache_hits gate, M2 cu_v2 schema, M3 STATE_NO_CASE_STUDY_LINK + CASE_STUDY_MISSING_FIELDS, M4 TIER_TAG_LIKELY_INCORRECT advisory, M5 backfill.',
      floorStates: { 1: 'done', 2: 'done', 3: 'done', 4: 'firing', 5: 'done', 6: 'idle', 7: 'idle', 8: 'dormant' },
      flow: [{ from: 4, to: 1, label: '5 PR-units' }],
      metrics: [{ label: 'commits', value: '32' }, { label: 'PRs', value: '2' }],
    },
    {
      id: 'measure-self',
      title: 'Floor 6 — measurement instruments itself',
      narrative: 'phase-timing.json records v7.7\'s own phase durations. cache-hits.jsonl bootstraps. CU v2 logs the meta-feature\'s complexity factors. The instrumentation is observing the feature that adds gates to it.',
      floorStates: { 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'firing', 7: 'idle', 8: 'dormant' },
      metrics: [{ label: 'self-measurement', value: 'recursive' }],
    },
    {
      id: 'gates-online',
      title: 'Floor 7 — mechanical enforcement comes online',
      narrative: 'CACHE_HITS_EMPTY_POST_V6 + CU_V2_INVALID + STATE_NO_CASE_STUDY_LINK + CASE_STUDY_MISSING_FIELDS pre-commit hooks install. CU_V2_INVALID adds to cycle-time. TIER_TAG_LIKELY_INCORRECT ships as advisory (kill criterion 2 fired honestly at baseline). 11 → 25 mechanical gates + 1 advisory.',
      floorStates: { 1: 'done', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done', 7: 'firing', 8: 'dormant' },
      flow: [{ from: 7, to: 1, label: 'gate state.json' }],
      metrics: [{ label: 'new gates', value: '+5' }, { label: 'cycle codes', value: '12 → 13' }],
    },
    {
      id: 'exit',
      title: 'Write-back & exit',
      narrative: 'state.json transitions to current_phase=complete (gated by its own new hooks). Case study published verbatim per publish-then-remediate policy. PR #144 merged. v7.7 framework version stamped.',
      floorStates: { 1: 'firing', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done', 7: 'done', 8: 'dormant' },
      metrics: [{ label: 'gates total', value: '25 + 1 advisory' }, { label: 'PR', value: '#144' }],
    },
  ],
};

const unifiedControlCenterV78: Trace = {
  id: 'unified-control-center',
  title: 'Unified Control Center — a real product feature on v7.8',
  subtitle: 'Migrate the legacy Astro dashboard into the public showcase under basic-auth. 22 PRs across 2 repos. Exercises every floor including the new advisory layer.',
  sourceRef: {
    label: 'Full UCC case study →',
    href: '/case-studies/unified-control-center',
  },
  beats: [
    {
      id: 'entry',
      title: 'Request arrives',
      narrative: 'Brief: retire the legacy Astro operator dashboard, migrate inside the public showcase as basic-auth-gated /control-room route, instrument 8 GA4 events, kill the standalone Vercel project. 44 tasks, 2 repos.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle', 6: 'idle', 7: 'idle', 8: 'idle' },
      metrics: [{ label: 'tasks', value: '44' }, { label: 'repos', value: '2' }],
    },
    {
      id: 'classify-big',
      title: 'Floor 5 — classified as multi-repo high-complexity',
      narrative: 'complexity_scoring: "high — cross-repo, ESLint guard, basic-auth proxy, GA4 instrumentation." Routes to big core. tool_budgets allocates wide Read+Edit+Write+Bash. dispatch_pattern: serial within a wave, batched across waves.',
      floorStates: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'firing', 6: 'idle', 7: 'idle', 8: 'idle' },
      metrics: [{ label: 'core', value: 'big' }, { label: 'pattern', value: 'serial-in-wave' }],
    },
    {
      id: 'skill-chain',
      title: 'Floors 2 + 3 — skill chain activates per-phase',
      narrative: 'pm-workflow chains brainstorming → writing-plans → subagent-driven-development → finishing-a-development-branch. analytics + dev + design SKILL.md load on-demand for instrumentation, ESLint rule, and token-aligned routes.',
      floorStates: { 1: 'idle', 2: 'firing', 3: 'firing', 4: 'idle', 5: 'done', 6: 'idle', 7: 'idle', 8: 'idle' },
      metrics: [{ label: 'skills chained', value: '4' }, { label: 'on-demand loads', value: '3' }],
    },
    {
      id: 'batch-execute',
      title: 'Floor 4 — 22 PRs in coordinated waves',
      narrative: 'Wave 1: scaffold + sync script + ESLint guard. Wave 2: routes + components + analytics. Wave 3: basic-auth proxy + GA4 events. Wave 4: redirect + reconcile. Each wave batches tightly-coupled tasks into one dispatch.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'done', 4: 'firing', 5: 'done', 6: 'idle', 7: 'idle', 8: 'idle' },
      flow: [{ from: 4, to: 1, label: '22 commits' }],
      metrics: [{ label: 'PRs', value: '22' }, { label: 'days', value: '11' }],
    },
    {
      id: 'measure-and-gate',
      title: 'Floors 6 + 7 — measurement + mechanical gates fire on every commit',
      narrative: 'phase-timing records each wave\'s wall-clock. cache-hits.jsonl logs L1/L2/L3 per dispatch. Pre-commit hooks fire 22 times: SCHEMA_DRIFT, PR_NUMBER_UNRESOLVED, PHASE_TRANSITION_NO_LOG, CASE_STUDY_MISSING_TIER_TAGS — all pass. Per-PR review bot validates each PR.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'firing', 7: 'firing', 8: 'idle' },
      flow: [{ from: 7, to: 1, label: 'gate every commit' }],
      metrics: [{ label: 'gate firings', value: '22 × 6 = 132' }, { label: 'rejections', value: '0' }],
    },
    {
      id: 'coverage-observe',
      title: 'Floor 8 — coverage + session attribution observe',
      narrative: 'Mechanism A coverage gates emit {candidates, checked, skipped, skip_reasons} for each gate run → .claude/logs/gate-coverage.jsonl. Mechanism C PostToolUse:Read hook auto-captures Read events with active-feature attribution = "unified-control-center". Mechanism F membrane-status surfaces UCC as the active feature.',
      floorStates: { 1: 'idle', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done', 7: 'done', 8: 'firing' },
      flow: [{ from: 8, to: 1, label: 'session events' }],
      metrics: [{ label: 'coverage entries', value: '132' }, { label: 'session events', value: 'auto' }],
    },
    {
      id: 'exit',
      title: 'Write-back & exit',
      narrative: 'state.json: 42/44 tasks done + 1 deferred + 1 blocked → current_phase=complete (PR #232). Source case study at slot 23a. fitme-story.vercel.app/control-room live. Legacy Vercel project deleted. 0 regressions on showcase throughout.',
      floorStates: { 1: 'firing', 2: 'done', 3: 'done', 4: 'done', 5: 'done', 6: 'done', 7: 'done', 8: 'done' },
      metrics: [{ label: 'tasks shipped', value: '42 / 44' }, { label: 'PRs total', value: '22' }],
    },
  ],
};

export const TRACES: Trace[] = [sprintI, fitmeStoryBuild, validityClosureV77, unifiedControlCenterV78];
