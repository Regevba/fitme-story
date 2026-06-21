// Dev-only visual-aid gallery (QA harness + preview review surface).
//
// Renders ALL 18 case-study visual-aid components with representative sample
// data shaped to each component's real prop contract. This page's build is the
// QA gate: if any component is broken or its sample data is malformed, the
// build fails. It is deliberately NOT linked from nav and is marked
// noindex — it exists for local/preview review and CI build verification only.
//
// Pass 3 (the next pass) assigns these components across ~43 case studies; this
// gallery is the reference surface that proves all 18 render correctly and
// share one visual language before that assignment happens.
//
// Catalog: docs/design-system/case-study-visual-aid-catalog.md (FitTracker2).

import type { ReactNode } from 'react';

import { KeyNumbersChart } from '@/components/case-study/alt-a-chrome';
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

export const metadata = { robots: { index: false } };

// ---------------------------------------------------------------------------
// Gallery section frame — labels each component + a one-line "use when…" and
// wraps the rendered component in the same not-prose isolation a real article
// uses (CaseStudyArticle wraps VisualAidResolver output in not-prose).
// ---------------------------------------------------------------------------
function Section({
  name,
  dir,
  useWhen,
  children,
}: {
  name: string;
  dir: string;
  useWhen: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] pt-8">
      <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-serif text-2xl text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
            {name}
          </h2>
          <code className="font-mono text-xs text-[var(--color-neutral-500)]">{dir}</code>
        </div>
        <p className="mt-1 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          <span className="uppercase tracking-wider text-[10px] text-[var(--color-neutral-500)] mr-2">
            use when
          </span>
          {useWhen}
        </p>
      </div>
      {/* not-prose mirrors how the resolver isolates visual aids from article prose */}
      <div className="not-prose rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}

export default function VisualAidGalleryPage() {
  return (
    <div className="max-w-[84rem] mx-auto section-padding-x py-16">
      <header className="mb-12">
        <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-coral)]">
          Dev preview · noindex
        </div>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          Visual-aid gallery
        </h1>
        <p className="mt-4 font-sans text-base text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)]">
          All 18 case-study visual-aid components rendered with representative
          sample data. This page is the QA gate — if any component is broken or
          its sample data is malformed, the build fails. Not linked from nav and
          not indexed; for local + preview review only. Toggle your OS / browser
          dark mode to verify both themes.
        </p>
      </header>

      <div className="space-y-12">
        {/* === KeyNumbersChart — the reference / fallback === */}
        <Section
          name="KeyNumbersChart"
          dir="case-study/alt-a-chrome/index.tsx"
          useWhen="Last-resort fallback — no specialised visual fits. Auto-renders the three key_numbers from frontmatter (progress / delta / all-clear / big-number). This is the well-styled reference all others match."
        >
          <KeyNumbersChart
            numbers={[
              { label: 'Implementation tasks shipped', value: '28 of 28', tier: 'T1' },
              { label: 'Integrity findings', value: '0 across 47 features', tier: 'T1' },
              { label: 'Wall-time per CU', value: '3.21 → 1.84', tier: 'T2' },
            ]}
          />
        </Section>

        {/* === HeroMetric === */}
        <Section
          name="HeroMetric"
          dir="case-study/HeroMetric.tsx"
          useWhen="One headline outcome — a single value the whole study is about (“12.4× throughput”, “0 findings”, “first wall-clock check”)."
        >
          <HeroMetric
            value="12.4×"
            label="parallel dispatch throughput"
            context="Four features ran concurrently and all finished in the wall-clock time of the single slowest serial run — a 12.4× speedup over the serial baseline (T2, declared from phase-timing.json)."
          />
        </Section>

        {/* === BeforeAfter === */}
        <Section
          name="BeforeAfter"
          dir="case-study/BeforeAfter.tsx"
          useWhen="A measurable change between two states — before + after snapshots (“1170 → 294 lines”, “v7.1 → v7.5 capability matrix”)."
        >
          <BeforeAfter
            before={{ label: 'Serial', value: '3.21 min/CU', subtitle: 'baseline measurement' }}
            after={{
              label: 'Parallel',
              value: '0.26 min/CU',
              subtitle: '4-way dispatch',
              accentVar: 'var(--color-brand-indigo)',
            }}
            delta="12.4× faster"
          />
        </Section>

        {/* === DurationStack === */}
        <Section
          name="DurationStack"
          dir="case-study/DurationStack.tsx"
          useWhen="A breakdown of total time/effort across phases summing to a whole (“10h split as 2h research + 4h impl + …”)."
        >
          <DurationStack
            segments={[
              { label: 'Research', minutes: 45, colorVar: 'var(--skill-research)' },
              { label: 'PRD', minutes: 30, colorVar: 'var(--skill-pm-workflow)' },
              { label: 'Tasks', minutes: 20, colorVar: 'var(--color-brand-indigo)' },
              { label: 'Implement', minutes: 90, colorVar: 'var(--skill-design)' },
              { label: 'Test', minutes: 35, colorVar: 'var(--color-brand-coral)' },
              { label: 'Review', minutes: 15, colorVar: 'var(--skill-qa)' },
              { label: 'Merge', minutes: 10, colorVar: 'var(--skill-release)' },
            ]}
            caption="v7.8.1 branch isolation — single-session lifecycle"
          />
        </Section>

        {/* === RankedBars === */}
        <Section
          name="RankedBars"
          dir="case-study/RankedBars.tsx"
          useWhen="A ranking — which thing dominated, which was smallest (“P1 findings by severity”, “3 chips ranked by latency”)."
        >
          <RankedBars
            title="UI-audit P1 findings by category"
            items={[
              { label: 'Raw color', value: 74, valueSuffix: ' findings' },
              { label: 'Magic padding', value: 49, colorVar: 'var(--skill-design)' },
              { label: 'Missing a11y', value: 50, colorVar: 'var(--color-brand-coral)' },
              { label: 'Raw font', value: 12, colorVar: 'var(--skill-qa)' },
            ]}
            caption="108 P1 findings across 5 categories (T1, from make ui-audit)"
          />
        </Section>

        {/* === FlowDiagram === */}
        <Section
          name="FlowDiagram"
          dir="case-study/FlowDiagram.tsx"
          useWhen="A linear sequence of process steps (“Research → PRD → Tasks → Implement → …”)."
        >
          <FlowDiagram
            nodes={[
              { label: 'Research', sublabel: 'wide → narrow', colorVar: 'var(--skill-research)' },
              { label: 'PRD', sublabel: 'success metrics', colorVar: 'var(--skill-pm-workflow)' },
              { label: 'Tasks', sublabel: 'decompose', colorVar: 'var(--color-brand-indigo)' },
              { label: 'Implement', sublabel: 'v2 bottom-up', colorVar: 'var(--skill-design)' },
              { label: 'Test', sublabel: 'xcodebuild', colorVar: 'var(--skill-qa)' },
              { label: 'Merge', sublabel: 'CI green', colorVar: 'var(--skill-release)' },
            ]}
            caption="The 9-phase PM lifecycle, abridged"
          />
        </Section>

        {/* === ParallelGantt === */}
        <Section
          name="ParallelGantt"
          dir="case-study/ParallelGantt.tsx"
          useWhen="Parallel work happening on a clock — multi-lane timeline with start/end (“3 features ran concurrently for 4h”)."
        >
          <ParallelGantt
            totalMinutes={54}
            lanes={[
              {
                feature: 'Push Notifications',
                complexity: 'Medium · permission handling',
                endedAt: 54,
                colorVar: 'var(--skill-dev)',
                phaseMark: 'Testing 10/12 tasks',
              },
              {
                feature: 'Import Training Plan',
                complexity: 'High · parser + mapping',
                endedAt: 54,
                colorVar: 'var(--skill-design)',
                phaseMark: 'Review 28/28 tasks',
              },
              {
                feature: 'Stats v2',
                complexity: 'Medium · chart refactor',
                endedAt: 54,
                colorVar: 'var(--skill-analytics)',
                phaseMark: 'Merge — CI green',
              },
              {
                feature: 'Onboarding v2',
                complexity: 'Low · token migration',
                endedAt: 54,
                colorVar: 'var(--skill-release)',
                phaseMark: 'Docs 9/9 phases',
              },
            ]}
            caption="Four features dispatched concurrently; all converged at 54 min"
          />
        </Section>

        {/* === AuditFunnel === */}
        <Section
          name="AuditFunnel"
          dir="case-study/AuditFunnel.tsx"
          useWhen="A funnel — items entering, items surviving each filter (“185 findings → 35 closed → 0 critical”)."
        >
          <AuditFunnel
            tiers={[
              { label: 'Raised', count: 185 },
              { label: 'Triaged', count: 96, colorVar: 'var(--skill-analytics)' },
              { label: 'Closed', count: 35, colorVar: 'var(--skill-design)' },
              { label: 'Critical open', count: 0, colorVar: 'var(--skill-release)' },
            ]}
            caption="Gemini independent audit — 185 findings burned down to 0 critical"
          />
        </Section>

        {/* === RaceTimeline === */}
        <Section
          name="RaceTimeline"
          dir="case-study/RaceTimeline.tsx"
          useWhen="A race between concurrent attempts that may collide — multi-lane events on a shared time axis (“2 writers wrote at t=3.2s, conflict at t=4.1s”)."
        >
          <RaceTimeline
            collisionAt={4100}
            collisionLabel="Last writer wins — silent data loss"
            maxMs={5000}
            lanes={[
              {
                label: 'Agent A',
                colorVar: 'var(--skill-dev)',
                events: [
                  { t: 1200, label: 'read state.json', detail: 'phase = tasks' },
                  { t: 3200, label: 'write phase = ux' },
                ],
              },
              {
                label: 'Agent B',
                colorVar: 'var(--color-brand-coral)',
                events: [
                  { t: 1400, label: 'read state.json', detail: 'phase = tasks' },
                  { t: 4100, label: 'write phase = implement' },
                ],
              },
            ]}
            caption="Two agents sharing one working tree raced on state.json"
          />
        </Section>

        {/* === PRStackDiagram === */}
        <Section
          name="PRStackDiagram"
          dir="case-study/PRStackDiagram.tsx"
          useWhen="PR dependencies — a DAG of nodes with base relationships (“M-1a → M-1b → M-1c → M-1d”)."
        >
          <PRStackDiagram
            nodes={[
              { id: 'main', label: 'main', base: null },
              { id: 'm2a', label: 'm2a', title: 'PR #126', base: 'main', highlight: 'ok' },
              { id: 'm2b', label: 'm2b', title: 'PR #127', base: 'm2a', highlight: 'intended' },
              { id: 'm2c', label: 'm2c', title: 'PR #128', base: 'main', highlight: 'wrong' },
            ]}
            caption="m2c was branched off main instead of its intended base m2b"
          />
        </Section>

        {/* === FrameworkAdvancement === */}
        <Section
          name="FrameworkAdvancement"
          dir="case-study/FrameworkAdvancement.tsx"
          useWhen="A trend across versions / over time — scatter of (time × metric) with click-to-enlarge modal. Defaults to the canonical ADVANCEMENT_POINTS dataset when no points prop is supplied."
        >
          <FrameworkAdvancement />
        </Section>

        {/* === BlueprintOverlay (bespoke, no data) === */}
        <Section
          name="BlueprintOverlay"
          dir="bespoke/BlueprintOverlay.tsx"
          useWhen="A taxonomic floor / framework architecture — levels with nested components. Reads the hardcoded FLOORS dataset; takes no data props."
        >
          <BlueprintOverlay />
        </Section>

        {/* === ChipAffinityMap (bespoke, no data) === */}
        <Section
          name="ChipAffinityMap"
          dir="bespoke/ChipAffinityMap.tsx"
          useWhen="A skill-or-chip × signature heatmap — a two-axis affinity matrix. Reads the hardcoded CHIPS × SIGNATURES × AFFINITY data; takes no props."
        >
          <ChipAffinityMap />
        </Section>

        {/* === PhaseTimingChart (bespoke, no data) === */}
        <Section
          name="PhaseTimingChart"
          dir="bespoke/PhaseTimingChart.tsx"
          useWhen="Phase duration breakdown for the v2.0 onboarding pilot specifically — hardcoded PHASES; takes no props. (For arbitrary data use DurationStack.)"
        >
          <PhaseTimingChart />
        </Section>

        {/* === DispatchReplay (bespoke, optional props) === */}
        <Section
          name="DispatchReplay"
          dir="bespoke/DispatchReplay.tsx"
          useWhen="A trace/replay of an execution — timeline of beats with per-floor states. Reads the hardcoded TRACES dataset; props are optional (traceId, allowTraceSwitch)."
        >
          <DispatchReplay />
        </Section>

        {/* === MetricsCard === */}
        <Section
          name="MetricsCard"
          dir="mdx/MetricsCard.tsx"
          useWhen="A pinned key-metrics list in the article margin — a small stack of (value, label) pairs."
        >
          <MetricsCard
            metrics={[
              { value: '28/28', label: 'tasks shipped' },
              { value: '130', label: 'unit tests pass' },
              { value: '19/19', label: 'pipeline assertions' },
              { value: '0', label: 'integrity findings' },
            ]}
          />
        </Section>

        {/* === FindingsTable === */}
        <Section
          name="FindingsTable"
          dir="mdx/FindingsTable.tsx"
          useWhen="A findings list with severity coding — an array of (severity, domain, description)."
        >
          <FindingsTable
            findings={[
              {
                id: 'A-001',
                severity: 'critical',
                domain: 'auth',
                description: 'Leaked PAT in workflow log output.',
              },
              {
                id: 'A-008',
                severity: 'high',
                domain: 'sync',
                description: 'Last-writer-wins on daily log merge drops concurrent edits.',
              },
              {
                id: 'A-014',
                severity: 'medium',
                domain: 'design-system',
                description: 'Raw pastel hex literals in PRStackDiagram lack a dark-mode counterpart.',
              },
              {
                id: 'A-021',
                severity: 'low',
                domain: 'docs',
                description: 'Glossary entry for "validity closure" missing cross-link.',
              },
            ]}
          />
        </Section>

        {/* === Figure === */}
        <Section
          name="Figure"
          dir="mdx/Figure.tsx"
          useWhen="A static image / diagram with optional caption. Sample uses an inline SVG data URI so the gallery has no external asset dependency."
        >
          <Figure
            src={SAMPLE_FIGURE_SVG}
            alt="Sample placeholder diagram for the Figure component"
            caption="Figure renders a next/image with an optional caption (sample uses an inline SVG data URI)."
            width={1200}
            height={500}
          />
        </Section>
      </div>
    </div>
  );
}

// Inline SVG data URI so <Figure>'s next/image has a real, dependency-free
// source in the gallery (an external/missing asset would break the build).
const SAMPLE_FIGURE_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500">
      <rect width="1200" height="500" fill="#F5F5F4"/>
      <rect x="40" y="40" width="1120" height="420" rx="16" fill="#FFFFFF" stroke="#E7E5E4" stroke-width="2"/>
      <text x="600" y="250" font-family="serif" font-size="40" fill="#4F46E5" text-anchor="middle" dominant-baseline="middle">Sample figure placeholder</text>
      <text x="600" y="300" font-family="sans-serif" font-size="18" fill="#5C5754" text-anchor="middle" dominant-baseline="middle">1200 × 500 — inline SVG data URI</text>
    </svg>`,
  );
