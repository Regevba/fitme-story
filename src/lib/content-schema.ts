import { z } from 'zod';

// Whitelist of components that can be referenced as a per-case visual aid.
// See docs/design-system/case-study-visual-aid-catalog.md (FitTracker2) for
// the data shape → component mapping.
export const VisualAidComponentEnum = z.enum([
  'HeroMetric',
  'BeforeAfter',
  'DurationStack',
  'RankedBars',
  'FlowDiagram',
  'ParallelGantt',
  'AuditFunnel',
  'RaceTimeline',
  'PRStackDiagram',
  'FrameworkAdvancement',
  'BlueprintOverlay',
  'ChipAffinityMap',
  'PhaseTimingChart',
  'DispatchReplay',
  'MetricsCard',
  'FindingsTable',
  'Figure',
  'KeyNumbersChart', // fallback default
]);

export const KeyNumberSchema = z.object({
  label: z.string(),
  value: z.string(),
  tier: z.enum(['T1', 'T2', 'T3']),
});

export const VisualAidSchema = z.object({
  component: VisualAidComponentEnum,
  // Component-specific props. Validated at the component layer; we accept
  // record(unknown) here to keep the schema flexible across 18 component shapes.
  data: z.record(z.string(), z.unknown()).optional(),
});

export const DeferredItemSchema = z.object({
  title: z.string(),
  ledger: z.string(),
  reason: z.string(),
});

export const FrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  upstream_path: z.string().optional(),
  upstream_sha: z.string().optional(),
  tier: z.enum(['flagship', 'standard', 'light', 'appendix', 'ops-combined', 'unassigned']),
  timeline_position: z
    .object({
      version: z.string(),
      order: z.number(),
    })
    .optional(),
  persona_emphasis: z
    .object({
      hr: z.string().optional(),
      pm: z.string().optional(),
      dev: z.string().optional(),
      academic: z.string().optional(),
    })
    .optional(),
  // Legacy: kept for backward compat. Superseded by `visual_aid` (broader catalog).
  hero_component: z
    .enum(['BlueprintOverlay', 'ChipAffinityMap', 'PhaseTimingChart', 'ParallelGantt'])
    .optional(),
  related: z.array(z.string()).optional(),
  reading_time_min: z.number().optional(),
  date: z.string().optional(),

  // === Alternative A locked-design fields (2026-04-28) ===
  // See docs/design-system/case-study-visual-aid-catalog.md (FitTracker2).
  tldr: z.string().optional(),
  key_numbers: z.array(KeyNumberSchema).optional(),
  honest_disclosures: z.array(z.string()).optional(),
  kill_criteria: z.array(z.string()).optional(),
  kill_criterion_fired: z.boolean().optional(),
  deferred_items: z.array(DeferredItemSchema).optional(),
  visual_aid: VisualAidSchema.optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type KeyNumber = z.infer<typeof KeyNumberSchema>;
export type VisualAid = z.infer<typeof VisualAidSchema>;
export type DeferredItemFM = z.infer<typeof DeferredItemSchema>;
