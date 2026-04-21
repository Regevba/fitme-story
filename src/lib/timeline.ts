import { getAllCaseStudies, type ContentEntry } from './content';

export interface FrameworkVersion {
  version: string;
  date: string;
  headline: string;
  keyMetric: { value: string; label: string };
}

export const FRAMEWORK_VERSIONS: FrameworkVersion[] = [
  { version: '2.0', date: '2026-04-06', headline: 'The first PM-orchestrated feature', keyMetric: { value: '1', label: 'pilot' } },
  { version: '4.3', date: '2026-04-11', headline: 'Hub-and-spoke topology emerges', keyMetric: { value: '6.5x', label: 'speedup' } },
  { version: '4.4', date: '2026-04-13', headline: 'Formal eval layer + mandatory monitoring', keyMetric: { value: '100%', label: 'coverage' } },
  { version: '5.0', date: '2026-04-14', headline: 'Hardware architecture principles rewire the framework', keyMetric: { value: '54K', label: 'tokens reclaimed' } },
  { version: '5.1', date: '2026-04-15', headline: 'Adaptive batch execution', keyMetric: { value: '12.4x', label: 'parallel throughput' } },
  { version: '5.2', date: '2026-04-16', headline: 'Dispatch intelligence + parallel write safety', keyMetric: { value: '48%', label: 'tool-budget reduction' } },
  { version: '6.0', date: '2026-04-16', headline: 'The framework learns to measure itself', keyMetric: { value: '7/9', label: 'DVs deterministic' } },
  { version: '6.1', date: '2026-04-16', headline: 'Hardware-aware dispatch (HADF)', keyMetric: { value: '17', label: 'chip profiles' } },
];

const PERSONA_METRIC_LABELS: Record<string, Record<string, string>> = {
  '2.0': {
    default: 'pilot', hr: 'first shipped feature', pm: 'first PM-managed feature',
    dev: 'first orchestrated run', academic: 'baseline run',
  },
  '4.3': {
    default: 'speedup', hr: 'faster shipping', pm: '6 refactors managed',
    dev: 'hub-and-spoke topology', academic: 'power law R²=0.82',
  },
  '4.4': {
    default: 'coverage', hr: 'quality enforced', pm: 'every feature tracked',
    dev: 'eval layer added', academic: 'eval coverage gate',
  },
  '5.0': {
    default: 'tokens reclaimed', hr: 'less wasted work', pm: '27% more context',
    dev: 'skill-on-demand + compression', academic: 'reclaim measured',
  },
  '5.1': {
    default: 'parallel throughput', hr: '4 features at once', pm: 'parallel phases',
    dev: 'batch dispatch + tiering', academic: '12.4× throughput',
  },
  '5.2': {
    default: 'tool-budget reduction', hr: 'less overhead', pm: '3-stage dispatch',
    dev: 'complexity + write-safety', academic: '48% reduction',
  },
  '6.0': {
    default: 'DVs deterministic', hr: 'measurable results', pm: 'phase timing live',
    dev: 'instrumentation overlay', academic: '7/9 DVs deterministic',
  },
  '6.1': {
    default: 'chip profiles', hr: 'hardware-aware', pm: 'adaptive dispatch',
    dev: 'HADF routing', academic: 'Mahalanobis fingerprinting',
  },
};

export type TimelineMode = 'versions' | 'cases' | 'features';

export interface TimelineNode {
  id: string;
  label: string;
  subLabel: string;
  href: string;
  version: string;
  date: string;
  metric: { value: string; label: string };
  metricLabelByPersona?: Record<string, string>;
}

// Features mode — shipped FitMe product & framework features, each linked to
// its canonical case study on this site. Curated (not auto-derived) so that
// feature cards use product-facing names rather than case-study titles, and
// so the ordering tells a story across app + framework + failure-mode lenses.
interface FeatureEntry {
  id: string;
  label: string;
  caseStudySlug: string;
  headlineMetric: { value: string; label: string };
}

const FEATURES: FeatureEntry[] = [
  { id: 'onboarding', label: 'Onboarding', caseStudySlug: 'onboarding-pilot', headlineMetric: { value: '24', label: 'findings' } },
  { id: 'six-refactors', label: 'Home + 6 v2 refactors', caseStudySlug: 'framework-evolution', headlineMetric: { value: '6.5×', label: 'speedup' } },
  { id: 'eval-layer', label: 'Eval layer', caseStudySlug: 'eval-driven-development', headlineMetric: { value: '29/29', label: 'green' } },
  { id: 'user-profile', label: 'User profile', caseStudySlug: 'user-profile', headlineMetric: { value: '2h', label: 'end-to-end' } },
  { id: 'soc-framework', label: 'SoC framework', caseStudySlug: 'soc-on-software', headlineMetric: { value: '63%', label: 'overhead cut' } },
  { id: 'auth-flow', label: 'Auth flow', caseStudySlug: 'auth-flow-velocity', headlineMetric: { value: '86%', label: 'faster' } },
  { id: 'ai-engine', label: 'AI engine architecture', caseStudySlug: 'ai-engine-architecture', headlineMetric: { value: '45%', label: 'cache hit' } },
  { id: 'parallel-dispatch', label: 'Parallel dispatch', caseStudySlug: 'parallel-stress-test', headlineMetric: { value: '12.4×', label: 'throughput' } },
  { id: 'dispatch-intel', label: 'Dispatch intelligence', caseStudySlug: 'dispatch-intelligence', headlineMetric: { value: '48%', label: 'tools saved' } },
  { id: 'write-safety', label: 'Parallel write safety', caseStudySlug: 'parallel-write-safety', headlineMetric: { value: '0', label: 'conflicts' } },
  { id: 'measurement', label: 'Framework measurement', caseStudySlug: 'measurement-v6', headlineMetric: { value: '7/9', label: 'DVs deterministic' } },
  { id: 'hadf', label: 'Hardware-aware dispatch', caseStudySlug: 'hadf', headlineMetric: { value: '17', label: 'chip profiles' } },
  { id: 'full-audit', label: 'Full-system audit', caseStudySlug: 'full-system-audit', headlineMetric: { value: '185', label: 'findings' } },
  { id: 'story-site', label: 'Story site', caseStudySlug: 'framework-story-site', headlineMetric: { value: '2h', label: 'meta-build' } },
  { id: 'dual-sync-race', label: 'Data sync', caseStudySlug: 'dual-sync-race', headlineMetric: { value: '3', label: 'critical findings' } },
  { id: 'stacked-pr-misfire', label: 'Multi-phase release', caseStudySlug: 'stacked-pr-misfire', headlineMetric: { value: '20m', label: 'recovery' } },
  { id: 'xcuitest-harness', label: 'XCUITest harness', caseStudySlug: 'xctwaiter-abort-retry', headlineMetric: { value: '1→2', label: 'attempts to ship' } },
];

export async function buildTimeline(mode: TimelineMode): Promise<TimelineNode[]> {
  if (mode === 'versions') {
    return FRAMEWORK_VERSIONS.map((v) => ({
      id: `v${v.version}`,
      label: `v${v.version}`,
      subLabel: v.headline,
      href: `/timeline/${v.version}`,
      version: v.version,
      date: v.date,
      metric: v.keyMetric,
      metricLabelByPersona: PERSONA_METRIC_LABELS[v.version],
    }));
  }
  if (mode === 'cases') {
    const studies: ContentEntry[] = (await getAllCaseStudies()).filter((c) =>
      ['flagship', 'standard', 'light'].includes(c.frontmatter.tier),
    );
    return studies
      .filter((c) => c.frontmatter.timeline_position)
      .map((c) => ({
        id: c.frontmatter.slug,
        label: c.frontmatter.title,
        subLabel: `v${c.frontmatter.timeline_position!.version}`,
        href: `/case-studies/${c.frontmatter.slug}`,
        version: c.frontmatter.timeline_position!.version,
        date: c.frontmatter.date ?? '',
        metric: { value: `${c.readingTimeMin}`, label: 'min read' },
      }));
  }
  // features mode — each feature card links to its canonical case study.
  const all = await getAllCaseStudies();
  const bySlug = new Map(all.map((c) => [c.frontmatter.slug, c]));
  return FEATURES.flatMap((f) => {
    const entry = bySlug.get(f.caseStudySlug);
    if (!entry) return [];
    const version = entry.frontmatter.timeline_position?.version ?? '';
    return [
      {
        id: f.id,
        label: f.label,
        subLabel: version ? `v${version} · ${entry.readingTimeMin} min read` : `${entry.readingTimeMin} min read`,
        href: `/case-studies/${f.caseStudySlug}`,
        version,
        date: entry.frontmatter.date ?? '',
        metric: f.headlineMetric,
      },
    ];
  });
}

export async function buildAllTimelines(): Promise<Record<TimelineMode, TimelineNode[]>> {
  const [versions, cases, features] = await Promise.all([
    buildTimeline('versions'),
    buildTimeline('cases'),
    buildTimeline('features'),
  ]);
  return { versions, cases, features };
}
