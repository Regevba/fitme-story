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
  // features mode: placeholder — populated in a later phase
  return [];
}

export async function buildAllTimelines(): Promise<Record<TimelineMode, TimelineNode[]>> {
  const [versions, cases, features] = await Promise.all([
    buildTimeline('versions'),
    buildTimeline('cases'),
    buildTimeline('features'),
  ]);
  return { versions, cases, features };
}
