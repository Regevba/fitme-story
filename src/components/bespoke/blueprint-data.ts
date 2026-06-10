export interface Floor {
  level: number;
  name: string;
  sub: string;
  components: string[];
  accent: string;
}

export const FLOORS: Floor[] = [
  { level: 7, name: 'v7.x Integrity & Enforcement', sub: 'Data integrity → mechanical enforcement → promotion', components: ['v7.5 Data Integrity Framework (8 cooperating defenses)', 'v7.6 mechanical enforcement (write-time gates)', 'v7.7 validity closure + per-PR review bot + 72h integrity cycle', 'v7.8 bridge Mechanisms A–F', 'v7.8.1 branch isolation + feature-closure completeness', 'v7.8.3 cross-repo state sync', 'v7.8.5 Observed Patterns Catalog + W9 drift hook', 'v7.8.6 cadence batch (integrity-diff, unified preflight)', 'v7.9 promotion — 3 advisory gates → enforced', 'v7.9.1 F16 try-repo harness + F17 last-fired index + F2 reality-check', 'HADF dispatch program incl. Phase 3A sensing layer', 't14 platforms_tested parity field'], accent: '#06B6D4' },
  { level: 6, name: 'v6.0 Measurement', sub: 'Instrumentation overlay', components: ['phase-timing.json', 'cache-hits.json', 'CU v2', 'rolling baselines'], accent: '#A855F7' },
  { level: 5, name: 'v5.2 Dispatch Intelligence', sub: 'Parallel Write Safety', components: ['complexity_scoring', 'model_routing', 'tool_budgets', 'mirror_pattern', 'snapshot/rollback'], accent: '#EC4899' },
  { level: 4, name: 'v5.1 Adaptive Batch', sub: 'Throughput primitives', components: ['batch_dispatch', 'result_forwarding', 'model_tiering', 'speculative_preload', 'systolic_chains', 'task_complexity_gate'], accent: '#F97066' },
  { level: 3, name: 'v5.0 SoC-on-Software', sub: 'Reclaim context', components: ['phase_skills (skill-on-demand)', 'compressed_view (cache compression)'], accent: '#F59E0B' },
  { level: 2, name: 'Skills + Cache', sub: 'Hub-and-spoke', components: ['pm-workflow/SKILL.md', '.claude/cache/ L1/L2/L3'], accent: '#10B981' },
  { level: 1, name: 'Shared State', sub: 'The load-bearing slab', components: ['audit-findings.json', 'skill-routing.json', 'feature-registry.json', 'design-system.json', 'token-budget.json'], accent: '#4F46E5' },
];
