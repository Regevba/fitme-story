import { z } from 'zod';

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
  hero_component: z.enum(['BlueprintOverlay', 'ChipAffinityMap', 'PhaseTimingChart', 'ParallelGantt']).optional(),
  related: z.array(z.string()).optional(),
  reading_time_min: z.number().optional(),
  date: z.string().optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
