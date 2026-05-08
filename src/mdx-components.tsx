import type { MDXComponents } from 'mdx/types';
import { MetricsCard } from '@/components/mdx/MetricsCard';
import { Pullquote } from '@/components/mdx/Pullquote';
import { Figure } from '@/components/mdx/Figure';
import { TimelineNav } from '@/components/mdx/TimelineNav';
import { FindingsTable } from '@/components/mdx/FindingsTable';
import { DevDive } from '@/components/mdx/DevDive';
import { Term } from '@/components/mdx/Term';
import { Pre } from '@/components/mdx/Pre';
import { BlueprintOverlay } from '@/components/bespoke/BlueprintOverlay';
import { ChipAffinityMap } from '@/components/bespoke/ChipAffinityMap';
import { PhaseTimingChart } from '@/components/bespoke/PhaseTimingChart';
import { DispatchReplay } from '@/components/bespoke/DispatchReplay';
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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // Override <pre> for code blocks (audit T17 P-MDX-CODE, 2026-05-08):
    // adds syntax highlighting via rehype-pretty-code (wired in compileMDX
    // call sites) + a copy-button overlay via the Pre wrapper.
    pre: Pre,
    MetricsCard,
    Pullquote,
    Figure,
    TimelineNav,
    FindingsTable,
    DevDive,
    Term,
    BlueprintOverlay,
    ChipAffinityMap,
    PhaseTimingChart,
    DispatchReplay,
    HeroMetric,
    BeforeAfter,
    DurationStack,
    RankedBars,
    FlowDiagram,
    ParallelGantt,
    AuditFunnel,
    RaceTimeline,
    PRStackDiagram,
    FrameworkAdvancement,
  };
}
