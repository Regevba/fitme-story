export interface Floor {
  level: number;
  name: string;
  sub: string;
  components: string[];
  accent: string;
}

export const FLOORS: Floor[] = [
  { level: 7, name: 'v7.7 Validity Closure', sub: 'Mechanical enforcement', components: ['pre-commit gates', '72h integrity cycle', 'per-PR review bot', 'weekly framework-status cron', 'Tier 1/2/3 dashboards'], accent: '#0EA5E9' },
  { level: 6, name: 'v6.0 Measurement', sub: 'Instrumentation overlay', components: ['phase-timing.json', 'cache-hits.json', 'CU v2', 'rolling baselines'], accent: '#A855F7' },
  { level: 5, name: 'v5.2 Dispatch Intelligence', sub: 'Parallel Write Safety', components: ['complexity_scoring', 'model_routing', 'tool_budgets', 'mirror_pattern', 'snapshot/rollback'], accent: '#EC4899' },
  { level: 4, name: 'v5.1 Adaptive Batch', sub: 'Throughput primitives', components: ['batch_dispatch', 'result_forwarding', 'model_tiering', 'speculative_preload', 'systolic_chains', 'task_complexity_gate'], accent: '#F97066' },
  { level: 3, name: 'v5.0 SoC-on-Software', sub: 'Reclaim context', components: ['phase_skills (skill-on-demand)', 'compressed_view (cache compression)'], accent: '#F59E0B' },
  { level: 2, name: 'Skills + Cache', sub: 'Hub-and-spoke', components: ['pm-workflow/SKILL.md', '.claude/cache/ L1/L2/L3'], accent: '#10B981' },
  { level: 1, name: 'Shared State', sub: 'The load-bearing slab', components: ['audit-findings.json', 'skill-routing.json', 'feature-registry.json', 'design-system.json', 'token-budget.json'], accent: '#4F46E5' },
];
