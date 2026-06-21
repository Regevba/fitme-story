/**
 * Design heritage — the durable design decisions made on fitme-story
 * before this design-system feature shipped. The showcase route's
 * "Design heritage" section walks these so designers + contributors
 * can see WHY tokens / components / patterns are the way they are.
 *
 * Source-tagged so each entry traces back to its audit, PR, or doc.
 *
 * To add an entry: append to AUDIT_DECISIONS or LOCKED_PATTERNS below.
 * Drift detection (Bucket D) does NOT validate this file — it's
 * narrative-grade documentation, not a parity check.
 */

export interface AuditDecision {
  /** Stable ID — usually the audit finding ID (A-002, CS-008, etc.). */
  id: string;
  /** Short title (< 60 chars). */
  title: string;
  /** What was wrong before. */
  problem: string;
  /** What was changed to fix it. */
  fix: string;
  /** Date the fix landed. */
  resolvedDate: string;
  /** PR number(s) where the fix landed. */
  resolvedIn: string[];
  /** Severity at audit time. */
  severity: 'P0' | 'P1' | 'P2';
  /** Affected token / component / pattern (for cross-referencing the manifest). */
  affects: string[];
  /** Source doc / audit reference. */
  source: string;
}

export const AUDIT_DECISIONS: AuditDecision[] = [
  {
    id: 'A-001',
    title: 'Skip-to-content link',
    problem: 'Keyboard users had no way to bypass the site nav on every page navigation.',
    fix: 'Site-wide "Skip to main content" link rendered as the first focusable element on every route.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['fitme-story #59'],
    severity: 'P0',
    affects: ['SiteHeader', 'app/layout.tsx'],
    source: 'docs/research/2026-05-08-fitme-story-public-site-audit.md',
  },
  {
    id: 'A-002',
    title: 'Light-mode body text contrast',
    problem: '--color-neutral-500 was #78716C, computing 4.16:1 contrast on neutral-50 — a P0 WCAG AA fail for body text.',
    fix: 'Shifted to #5C5754, which computes 4.83:1 on neutral-50.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['FT2 #254'],
    severity: 'P0',
    affects: ['--color-neutral-500'],
    source: 'globals.css:35 inline comment + audit synthesis §2',
  },
  {
    id: 'A-014',
    title: 'Image alt-text is content-describing, not a title',
    problem: '`<Image alt={shot.title} />` repeated the visible figcaption — useless to screen readers.',
    fix: 'Wrote unique content-describing alt text for every onboarding + live-app screenshot. Title and caption stay in the figcaption; alt describes the image itself.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['fitme-story #61'],
    severity: 'P1',
    affects: ['/design-system/page.tsx (Part 1 onboarding + live-app screens)'],
    source: 'src/app/design-system/page.tsx:30-32 inline comment',
  },
  {
    id: 'A-018',
    title: 'Dark-mode body text contrast',
    problem: 'After A-002 fix, dark-mode --color-neutral-500 still failed on the new background.',
    fix: 'Confirmed dark-mode override at #A8A29E passes WCAG AA on neutral-900 background.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['FT2 #254'],
    severity: 'P0',
    affects: ['--color-neutral-500 (dark)'],
    source: 'globals.css:64 + audit synthesis §2',
  },
  {
    id: 'V-004',
    title: 'Mobile hamburger nav',
    problem: 'No mobile nav; nav links were hidden on viewports < 768px with no replacement affordance.',
    fix: 'Built `<MobileNav>` with full primary-link list + theme toggle + close-on-route-change.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['fitme-story #59'],
    severity: 'P0',
    affects: ['MobileNav', 'SiteHeader'],
    source: 'audit synthesis §2 + §4 S5',
  },
  {
    id: 'CS-006',
    title: 'Editorial table mobile overflow',
    problem: 'Wide tables in case-study prose overflowed the viewport at < 640px with no scroll affordance.',
    fix: 'Added `display: block` + `overflow-x: auto` + `-webkit-overflow-scrolling: touch` to `.prose table`.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['fitme-story #61'],
    severity: 'P1',
    affects: ['.prose table CSS'],
    source: 'globals.css:129-139',
  },
  {
    id: 'CS-008',
    title: 'Frontmatter chrome bimodal',
    problem: 'Some case studies had rich frontmatter chrome (SummaryCard, DataKey, callouts), others showed just the markdown — bimodal experience.',
    fix: 'Locked Alternative A chrome 2026-04-28: SummaryCard → DataKey → VisualAidResolver → KillCriterionBanner → DeferredItemsList → narrative body. Backfilled 25/25 case studies.',
    resolvedDate: '2026-04-28',
    resolvedIn: ['fitme-story #8', 'FT2 #146'],
    severity: 'P1',
    affects: ['case-study layout', 'frontmatter audit'],
    source: 'docs/case-studies/case-study-presentation-refactor-case-study.md',
  },
  {
    id: 'CS-016',
    title: 'TimelineNav unused',
    problem: 'Component shipped but no route imported it — dead code.',
    fix: 'Removed TimelineNav. Replaced with ArticleNav (sticky TOC + scroll progress + prev/next) which IS used.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['fitme-story #59'],
    severity: 'P2',
    affects: ['ArticleNav (replacement)'],
    source: 'audit synthesis §4 S1',
  },
  {
    id: 'CS-020',
    title: 'Wide table overflow at narrow viewports',
    problem: 'Same root cause as CS-006 but in a different MDX context.',
    fix: 'Resolved by the same `.prose table` CSS update.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['fitme-story #61'],
    severity: 'P1',
    affects: ['.prose table CSS'],
    source: 'globals.css:129-139',
  },
  {
    id: 'R-009',
    title: 'Table cell readability',
    problem: 'Default Tailwind typography table styling was too tight + lacked clear header band.',
    fix: 'Editorial overrides: tighter cell padding, warmer borders (neutral-200/300), header band with 0.04em letter-spacing.',
    resolvedDate: '2026-05-08',
    resolvedIn: ['fitme-story #61'],
    severity: 'P2',
    affects: ['.prose table CSS'],
    source: 'globals.css:140-173',
  },
  {
    id: 'T24',
    title: 'Inline code overflow at narrow viewports',
    problem: 'Long file paths or commit SHAs in inline `<code>` blew out the 360px viewport.',
    fix: '`overflow-wrap: anywhere` + `word-break: break-word` on `.prose code`.',
    resolvedDate: '2026-05-09',
    resolvedIn: ['fitme-story #75 (T24)'],
    severity: 'P2',
    affects: ['.prose code CSS'],
    source: 'globals.css:111-114',
  },
];

export interface LockedPattern {
  /** Stable ID — short kebab-case slug. */
  id: string;
  /** Short name. */
  name: string;
  /** When the pattern was locked. */
  lockedDate: string;
  /** What the pattern is. */
  description: string;
  /** What was the alternative considered + why this won. */
  rationale: string;
  /** Where the canonical implementation / spec lives. */
  source: string;
  /** Components or routes that follow this pattern. */
  appliesTo: string[];
}

export const LOCKED_PATTERNS: LockedPattern[] = [
  {
    id: 'case-study-alt-a-chrome',
    name: 'Case-study presentation: Alternative A chrome',
    lockedDate: '2026-04-28',
    description: 'Story-first composition (2026-06-21): header (badge · h1 · tldr lead) → visual-aid band + compact TierLegend → narrative body → HonestDisclosures · KillCriterionBanner · DeferredItemsList epilogue. One config-driven template (CaseStudyArticle) renders every tier. Frontmatter audit gates the chrome.',
    rationale: 'Picked over Alternative B (lighter, less structured chrome) because cross-case-study comparison + skim-readability was a primary user goal. 25/25 case studies backfilled to validate.',
    source: 'docs/case-studies/case-study-presentation-refactor-case-study.md',
    appliesTo: ['/case-studies/[slug]', 'all MDX in content/04-case-studies/'],
  },
  {
    id: 'frontmatter-audit-gate',
    name: 'Frontmatter audit gate',
    lockedDate: '2026-04-28',
    description: 'Build-time validator (`fitme-story/scripts/validate-frontmatter.ts`) gates every MDX for presence of: tldr, key_numbers, visual_aid, honest_disclosures, kill_criteria, related_features, primary_metric, framework_version. PR fails CI if any required field missing.',
    rationale: 'Avoids silent regressions where new case studies skip the chrome and revert to bare markdown.',
    source: 'fitme-story/scripts/validate-frontmatter.ts',
    appliesTo: ['all content/04-case-studies/*.mdx'],
  },
  {
    id: 'page-structure-glossary',
    name: '/glossary route page-structure pattern',
    lockedDate: '2026-04-15',
    description: 'Editorial single-page route: hero → category headers → entry list. Sourced from a typed manifest (`src/lib/glossary.ts`).',
    rationale: 'Type-safe, server-rendered, easily searchable. Generalizes to other typed-manifest routes (the new `/design-system` route follows this).',
    source: 'src/app/glossary/page.tsx + src/lib/glossary.ts',
    appliesTo: ['/glossary', '/design-system (this feature)'],
  },
  {
    id: 'token-prefix-naming',
    name: 'CSS variable naming: --{category}-{property}-{variant}',
    lockedDate: '2026-04-12',
    description: '`--color-brand-indigo`, `--text-display-xl`, `--measure-body`, `--motion-duration-fast`. Category prefix narrows the search space; variant suffix is the value qualifier.',
    rationale: 'Predictable + grep-friendly + matches Tailwind v4 @theme convention.',
    source: 'globals.css',
    appliesTo: ['all design tokens'],
  },
  {
    id: 'reduced-motion-blanket-opt-out',
    name: 'Reduced motion: blanket opt-out',
    lockedDate: '2026-04-15',
    description: '`@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.001ms !important; ... transition-duration: 0.001ms !important; ... } }`',
    rationale: 'One global override is more robust than per-component opt-outs (which contributors would forget to add). Catches reduced-motion users by default.',
    source: 'globals.css:70-77',
    appliesTo: ['all routes'],
  },
  {
    id: 'persona-emphasis-soft-overlay',
    name: 'Persona emphasis: soft overlay, not branching content',
    lockedDate: '2026-04-20',
    description: 'PersonaIndicator + PersonaLens render as INLINE markers within unified content — they do not branch the prose tree. Same MDX is read by every persona; the lens just highlights different bits.',
    rationale: 'Avoids content drift across personas. Single source of truth, multiple reading orientations.',
    source: 'src/components/PersonaLens.tsx + src/lib/persona-context.tsx',
    appliesTo: ['MDX content', 'PersonaIndicator', 'PersonaLens'],
  },
  {
    id: 'safari-tap-highlight-removal',
    name: 'Safari tap-highlight removal',
    lockedDate: '2026-04-28',
    description: '`-webkit-tap-highlight-color: transparent` on `details > summary`, `button`, `a`, `[role="button"]`. Custom focus ring (Tailwind focus-visible) is the canonical interactive feedback.',
    rationale: 'iOS Safari blue highlight conflicted with our editorial color palette. Custom focus ring is more on-brand.',
    source: 'globals.css:84-99',
    appliesTo: ['all interactive elements'],
  },
];

/** Computed metrics for the heritage section's summary card. */
export function getHeritageMetrics() {
  const auditTotals = {
    P0: AUDIT_DECISIONS.filter(d => d.severity === 'P0').length,
    P1: AUDIT_DECISIONS.filter(d => d.severity === 'P1').length,
    P2: AUDIT_DECISIONS.filter(d => d.severity === 'P2').length,
  };
  return {
    auditTotal: AUDIT_DECISIONS.length,
    auditTotals,
    lockedPatternsTotal: LOCKED_PATTERNS.length,
    earliestAudit: [...AUDIT_DECISIONS].sort((a, b) => a.resolvedDate.localeCompare(b.resolvedDate))[0]?.resolvedDate ?? null,
    latestAudit: [...AUDIT_DECISIONS].sort((a, b) => b.resolvedDate.localeCompare(a.resolvedDate))[0]?.resolvedDate ?? null,
  };
}
