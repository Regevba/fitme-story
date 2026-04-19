import type { SkillSlug } from './skill-ecosystem';

export interface SharedDataFile {
  filename: string;         // "skill-routing.json"
  oneLiner: string;         // 1-line purpose
  readBy: SkillSlug[];
  writtenBy: SkillSlug[];
}

export const SHARED_DATA_FILES: SharedDataFile[] = [
  {
    filename: 'context.json',
    oneLiner: 'Global product context — personas, mission, top-level goals.',
    readBy: ['pm-workflow', 'research', 'ux'],
    writtenBy: ['pm-workflow', 'research'],
  },
  {
    filename: 'feature-registry.json',
    oneLiner: 'Master list of all features, their phase, branch, and current state.',
    readBy: ['pm-workflow', 'ux', 'design', 'dev', 'qa', 'analytics', 'cx'],
    writtenBy: ['pm-workflow', 'ux', 'dev'],
  },
  {
    filename: 'skill-routing.json',
    oneLiner: 'Maps each phase to 1-2 skills the hub loads on-demand.',
    readBy: ['pm-workflow'],
    writtenBy: ['pm-workflow'],
  },
  {
    filename: 'framework-manifest.json',
    oneLiner: 'Canonical version + structural metadata for the framework.',
    readBy: ['pm-workflow'],
    writtenBy: ['pm-workflow'],
  },
  {
    filename: 'case-study-monitoring.json',
    oneLiner: 'Every feature opens an entry here — process + quality metrics become case studies.',
    readBy: ['pm-workflow'],
    writtenBy: ['pm-workflow'],
  },
  {
    filename: 'design-system.json',
    oneLiner: 'Token inventory, component catalog, WCAG compliance status.',
    readBy: ['design', 'ux'],
    writtenBy: ['design'],
  },
  {
    filename: 'test-coverage.json',
    oneLiner: 'Per-feature test counts, coverage percentages, CI status.',
    readBy: ['qa', 'dev', 'release'],
    writtenBy: ['qa'],
  },
  {
    filename: 'metric-status.json',
    oneLiner: 'Current value of every tracked product metric vs PRD targets.',
    readBy: ['analytics', 'pm-workflow'],
    writtenBy: ['analytics'],
  },
  {
    filename: 'cx-signals.json',
    oneLiner: 'App-store reviews, NPS, sentiment, post-deployment feedback.',
    readBy: ['cx', 'research', 'marketing'],
    writtenBy: ['cx'],
  },
  {
    filename: 'campaign-tracker.json',
    oneLiner: 'Marketing campaigns in flight + post-campaign performance.',
    readBy: ['marketing'],
    writtenBy: ['marketing'],
  },
  {
    filename: 'health-status.json',
    oneLiner: 'Infrastructure health — crash-free rate, uptime, error-tracking signals.',
    readBy: ['ops'],
    writtenBy: ['ops'],
  },
  {
    filename: 'change-log.json',
    oneLiner: 'Per-version changelog — auto-generated from merged features.',
    readBy: ['release', 'pm-workflow'],
    writtenBy: ['release', 'pm-workflow', 'dev'],
  },
  {
    filename: 'token-budget.json',
    oneLiner: 'Context-window usage tracking per skill per session.',
    readBy: ['pm-workflow'],
    writtenBy: ['pm-workflow'],
  },
  {
    filename: 'chip-affinity-map.json',
    oneLiner: '17 chip profiles + 7 cloud signatures for HADF hardware-aware dispatch.',
    readBy: ['pm-workflow'],
    writtenBy: ['pm-workflow'],
  },
  {
    filename: 'external-sync-status.json',
    oneLiner: 'Linear + Notion sync snapshot — detects workspace drift.',
    readBy: ['pm-workflow'],
    writtenBy: ['pm-workflow'],
  },
];
