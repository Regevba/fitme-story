// Era × subject grouping for the /case-studies index (dual-audience redesign,
// T8). Pure logic (no React, no zod, no next) so it is unit-testable in
// isolation. `era` is derived here from the framework version — it is NOT a
// stored frontmatter field (DRY: era is a pure function of version).
//
// Eligibility: only studies with a numeric framework version AND a product-ish
// category (framework / design-system / product) appear in the era accordions.
// meta + dev-deepdive + version-less studies render in their own dedicated page
// sections, so era counts stay clean.

import type { Lens } from './lens';

export type Category = 'framework' | 'design-system' | 'product' | 'meta' | 'dev-deepdive';

export interface GroupableStudy {
  slug: string;
  title: string;
  version: string | null; // timeline_position.version, e.g. "7.9"
  date: string; // ISO or ''
  category: Category;
  readingTimeMin: number;
  /** persona_emphasis hints — presence of the active lens key floats a study up. */
  emphasis?: Partial<Record<Lens, string>>;
  isMilestone: boolean;
  // Milestone-only passthrough (preserves the curated chronological narrative
  // inside its era; populated for milestones in case-studies/page.tsx).
  hook?: string;
  impact?: string;
  accentVar?: string;
}

export interface SubGroup {
  category: Exclude<Category, 'meta' | 'dev-deepdive'>;
  label: string;
  studies: GroupableStudy[];
}

export interface EraGroup {
  id: string;
  label: string;
  defaultOpen: boolean;
  count: number;
  milestones: GroupableStudy[];
  subGroups: SubGroup[];
}

// Newest first. `lower` is the inclusive lower version bound.
const ERAS: Array<{ id: string; label: string; lower: number; defaultOpen: boolean }> = [
  { id: 'v7', label: 'v7.x — Integrity, cross-repo & promotion', lower: 7.0, defaultOpen: true },
  { id: 'v6', label: 'v6.0 — Measurement', lower: 6.0, defaultOpen: false },
  { id: 'v5', label: 'v5.x — Dispatch & parallelism', lower: 5.0, defaultOpen: false },
  { id: 'v4', label: 'v4.x — Eval & Separation of Concerns', lower: 4.0, defaultOpen: false },
  { id: 'v2', label: 'v2.0 — Pilot', lower: -Infinity, defaultOpen: false },
];

const SUBGROUP_ORDER: SubGroup['category'][] = ['framework', 'design-system', 'product'];
const SUBGROUP_LABEL: Record<SubGroup['category'], string> = {
  framework: 'Framework',
  'design-system': 'Design System',
  product: 'Product features',
};

const ERA_ELIGIBLE: ReadonlySet<Category> = new Set<Category>(['framework', 'design-system', 'product']);

export function parseVersion(raw: string | null): number {
  if (!raw) return NaN;
  return parseFloat(String(raw).replace(/^v/, ''));
}

export function eraIdForVersion(vnum: number): string {
  if (Number.isNaN(vnum)) return 'v2';
  for (const e of ERAS) if (vnum >= e.lower) return e.id;
  return 'v2';
}

/** A study appears in the era accordions only if it has a numeric version and an era-eligible category. */
export function isEraEligible(s: GroupableStudy): boolean {
  return ERA_ELIGIBLE.has(s.category) && !Number.isNaN(parseVersion(s.version));
}

function dateKey(iso: string): string {
  return iso || '0000-00-00';
}

/** Lens-aware sort: studies whose persona_emphasis has the active lens key float up; then newest date first. */
function sortLensAware(studies: GroupableStudy[], lens: Lens): GroupableStudy[] {
  return studies.slice().sort((a, b) => {
    const ae = a.emphasis?.[lens] ? 1 : 0;
    const be = b.emphasis?.[lens] ? 1 : 0;
    if (ae !== be) return be - ae; // emphasized first
    return dateKey(b.date).localeCompare(dateKey(a.date)); // newest first
  });
}

/**
 * Build the era accordion groups, newest era first. Within each era: milestones
 * pinned (lens-aware order), then subject sub-groups in fixed order (each
 * lens-aware sorted). Empty eras are omitted.
 */
export function buildEraGroups(all: GroupableStudy[], lens: Lens = 'pm'): EraGroup[] {
  const eligible = all.filter(isEraEligible);
  const byEra = new Map<string, GroupableStudy[]>(ERAS.map((e) => [e.id, []]));
  for (const s of eligible) byEra.get(eraIdForVersion(parseVersion(s.version)))!.push(s);

  const groups: EraGroup[] = [];
  for (const era of ERAS) {
    const studies = byEra.get(era.id)!;
    if (studies.length === 0) continue;
    const milestones = sortLensAware(studies.filter((s) => s.isMilestone), lens);
    const nonMilestone = studies.filter((s) => !s.isMilestone);
    const subGroups: SubGroup[] = SUBGROUP_ORDER.map((cat) => ({
      category: cat,
      label: SUBGROUP_LABEL[cat],
      studies: sortLensAware(nonMilestone.filter((s) => s.category === cat), lens),
    })).filter((g) => g.studies.length > 0);
    groups.push({
      id: era.id,
      label: era.label,
      defaultOpen: era.defaultOpen,
      count: studies.length,
      milestones,
      subGroups,
    });
  }
  return groups;
}

/** Studies excluded from the era accordions (meta + dev-deepdive + version-less), for the dedicated sections. */
export function nonEraStudies(all: GroupableStudy[]): GroupableStudy[] {
  return all.filter((s) => !isEraEligible(s));
}

export const ERA_IDS = ERAS.map((e) => e.id);
