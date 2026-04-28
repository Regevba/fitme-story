// Per-case visual aid resolver (Alt-A locked design, 2026-04-28).
//
// Reads frontmatter.visual_aid and renders the named component with the
// declared data. Falls back to <KeyNumbersChart /> when no visual_aid is
// specified but key_numbers is. If both are missing, renders nothing
// (the validator will fail the build before reaching this state).
//
// Catalog: docs/design-system/case-study-visual-aid-catalog.md (FitTracker2).

import type { Frontmatter, VisualAid } from '@/lib/content-schema';
import { KeyNumbersChart } from './index';

import { HeroMetric } from '@/components/case-study/HeroMetric';
import { BeforeAfter } from '@/components/case-study/BeforeAfter';
import { DurationStack } from '@/components/case-study/DurationStack';
import { RankedBars } from '@/components/case-study/RankedBars';
import { FlowDiagram } from '@/components/case-study/FlowDiagram';
import { ParallelGantt } from '@/components/case-study/ParallelGantt';
import { AuditFunnel } from '@/components/case-study/AuditFunnel';
import { RaceTimeline } from '@/components/case-study/RaceTimeline';
import { PRStackDiagram } from '@/components/case-study/PRStackDiagram';
import { FrameworkAdvancement } from '@/components/case-study/FrameworkAdvancement';
import { BlueprintOverlay } from '@/components/bespoke/BlueprintOverlay';
import { ChipAffinityMap } from '@/components/bespoke/ChipAffinityMap';
import { PhaseTimingChart } from '@/components/bespoke/PhaseTimingChart';
import { DispatchReplay } from '@/components/bespoke/DispatchReplay';
import { MetricsCard } from '@/components/mdx/MetricsCard';
import { FindingsTable } from '@/components/mdx/FindingsTable';
import { Figure } from '@/components/mdx/Figure';

// Component registry — mirrors VisualAidComponentEnum in content-schema.ts.
// Each entry is a "best-effort" props passthrough — frontmatter authors
// supply a record<string, unknown> that matches the component's props shape.
// Type-narrowing happens at the component layer.
//
// The data field from frontmatter.visual_aid.data flows into the component
// as spread props. Components that need no props (BlueprintOverlay,
// ChipAffinityMap, PhaseTimingChart, DispatchReplay) ignore the data.
//
// Using `any` here is intentional: frontmatter is data-driven and we trust
// schema validation + per-component prop validation to catch bad shapes.
/* eslint-disable @typescript-eslint/no-explicit-any */
const REGISTRY: Record<VisualAid['component'], (data: any) => React.ReactElement> = {
  HeroMetric: (d) => <HeroMetric {...d} />,
  BeforeAfter: (d) => <BeforeAfter {...d} />,
  DurationStack: (d) => <DurationStack {...d} />,
  RankedBars: (d) => <RankedBars {...d} />,
  FlowDiagram: (d) => <FlowDiagram {...d} />,
  ParallelGantt: (d) => <ParallelGantt {...d} />,
  AuditFunnel: (d) => <AuditFunnel {...d} />,
  RaceTimeline: (d) => <RaceTimeline {...d} />,
  PRStackDiagram: (d) => <PRStackDiagram {...d} />,
  FrameworkAdvancement: (d) => <FrameworkAdvancement {...d} />,
  BlueprintOverlay: () => <BlueprintOverlay />,
  ChipAffinityMap: () => <ChipAffinityMap />,
  PhaseTimingChart: () => <PhaseTimingChart />,
  DispatchReplay: (d) => <DispatchReplay {...d} />,
  MetricsCard: (d) => <MetricsCard {...d} />,
  FindingsTable: (d) => <FindingsTable {...d} />,
  Figure: (d) => <Figure {...d} />,
  // KeyNumbersChart needs `numbers` prop; we wrap it in resolveVisualAid below
  // to pass frontmatter.key_numbers directly.
  KeyNumbersChart: (d) => <KeyNumbersChart numbers={d?.numbers ?? []} />,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function VisualAidResolver({ fm }: { fm: Frontmatter }) {
  if (fm.visual_aid) {
    const render = REGISTRY[fm.visual_aid.component];
    if (render) {
      return (
        <section
          aria-label={`Visual aid: ${fm.visual_aid.component}`}
          className="not-prose"
        >
          {render(fm.visual_aid.data ?? {})}
        </section>
      );
    }
  }
  if (fm.key_numbers && fm.key_numbers.length > 0) {
    return <KeyNumbersChart numbers={fm.key_numbers} />;
  }
  return null;
}
