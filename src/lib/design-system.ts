/**
 * Typed manifest of every fitme-story website component that participates
 * in the design system. Drives the public /design-system showcase route
 * AND the drift-detection script (Bucket D).
 *
 * To add a new component:
 *   1. Add an entry to DESIGN_SYSTEM_COMPONENTS below
 *   2. Add a Figma node ID once the frame exists in the library
 *   3. Add a .figma.tsx mapping file alongside the component
 *   4. The /design-system showcase route surfaces it automatically
 *
 * Drift detection (scripts/figma-drift.mjs) cross-checks this manifest
 * against the .figma.tsx files in src/components/** to catch:
 *   - components in code but missing from manifest
 *   - manifest entries with figmaNodeIds but no .figma.tsx mapping
 *   - .figma.tsx mappings whose node IDs don't appear in the live Figma file
 */

export type ComponentCategory =
  | 'primitive'
  | 'layout'
  | 'callout'
  | 'control-room'
  | 'persona'
  | 'bespoke'
  | 'ui-utility';

export type ComponentStatus =
  | 'Stable'
  | 'Experimental'
  | 'Deprecated'
  | 'Internal';

export type DarkModeStatus =
  | 'Designed'      // Explicit Light + Dark Figma frames; visually verified
  | 'AutoDerived'   // Token swap is sufficient; no separate Dark frame needed
  | 'NotApplicable' // Component is mode-agnostic (e.g., admin-only)
  | 'TODO';         // Needs designer attention; flag in matrix

export interface FigmaNodeMapping {
  /** The variant or use-case this node represents. */
  variant: string;
  /** Figma node ID, in the format "5-4" or "5:4". */
  nodeId: string;
}

export interface ComponentManifestEntry {
  /** Component name, matches the React export. */
  name: string;
  /** Where the component lives in the codebase (relative to fitme-story repo root). */
  githubPath: string;
  /** One-line description (< 80 chars). */
  purpose: string;
  /** Where in the site the component appears. */
  whereUsed: string;
  category: ComponentCategory;
  status: ComponentStatus;
  /**
   * Figma node IDs in the FitMe Story Web library (file fsjHfFLAHELACZHku8Rfcl).
   * `null` means not yet captured (component exists in code but no Figma frame).
   * Drift detection treats `null` as "needs Figma frame" until Bucket C closes the gap.
   */
  figmaNodeIds: FigmaNodeMapping[] | null;
  /** Does this component have a corresponding .figma.tsx Code Connect mapping file? */
  hasFigmaConnect: boolean;
  /** Dark-mode design status — see DarkModeStatus. */
  darkModeStatus: DarkModeStatus;
  /** Sample React snippet for the showcase to render in the Copy button. */
  codeSnippet?: string;
}

/**
 * The Figma file that hosts every node ID in `figmaNodeIds[].nodeId`.
 * Used by the showcase route + drift detection for URL construction.
 */
export const FITME_STORY_FIGMA_FILE_KEY = 'fsjHfFLAHELACZHku8Rfcl';
export const FITME_STORY_FIGMA_FILE_NAME = 'FitMe-Story-Web-Design-System';

/** All 31 components currently in the fitme-story website design system. */
export const DESIGN_SYSTEM_COMPONENTS: ComponentManifestEntry[] = [
  // --- Primitives (4) ---
  {
    name: 'Button',
    githubPath: 'src/components/ui/Button.tsx',
    purpose: '3-variant CTA: primary / secondary / ghost. 44px min-touch target, focus ring.',
    whereUsed: 'Almost every page: nav, hero CTAs, MDX callouts, control-room actions.',
    category: 'primitive',
    status: 'Stable',
    figmaNodeIds: [
      { variant: 'primary', nodeId: '5-4' },
      { variant: 'secondary', nodeId: '5-6' },
      { variant: 'ghost', nodeId: '5-8' },
    ],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
    codeSnippet: `import { Button } from '@/components/ui/Button';\n\n<Button variant="primary">Click me</Button>`,
  },
  {
    name: 'Tag',
    githubPath: 'src/components/ui/Tag.tsx',
    purpose: 'Compact 3-variant label: flagship / standard / tier_t1.',
    whereUsed: 'Case-study cards, hero status badges, framework-version metadata.',
    category: 'primitive',
    status: 'Stable',
    figmaNodeIds: [
      { variant: 'flagship', nodeId: '5-12' },
      { variant: 'standard', nodeId: '5-14' },
      { variant: 'tier_t1', nodeId: '5-16' },
    ],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
    codeSnippet: `import { Tag } from '@/components/ui/Tag';\n\n<Tag variant="flagship">Flagship</Tag>`,
  },
  {
    name: 'CaseStudyCard',
    githubPath: 'src/components/ui/CaseStudyCard.tsx',
    purpose: 'Hero card linking to a case study: title + tldr + tag + href.',
    whereUsed: 'Homepage feed, /case-studies index, related-work blocks.',
    category: 'primitive',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-52' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
    codeSnippet: `import { CaseStudyCard } from '@/components/ui/CaseStudyCard';\n\n<CaseStudyCard\n  href="/case-studies/example"\n  title="Example case study"\n  tldr="One-line summary."\n  tagLabel="Standard"\n  tagVariant="standard"\n/>`,
  },
  {
    name: 'FrameworkVersionCard',
    githubPath: 'src/components/ui/FrameworkVersionCard.tsx',
    purpose: 'Card for a framework version: version + date + outcome + href.',
    whereUsed: 'Framework timeline, /pm-flow page, related-version blocks.',
    category: 'primitive',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-59' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
    codeSnippet: `import { FrameworkVersionCard } from '@/components/ui/FrameworkVersionCard';\n\n<FrameworkVersionCard\n  href="/framework"\n  version="7.8.2"\n  date="2026-05-08"\n  outcome="Cross-repo gate asymmetry policy"\n/>`,
  },

  // --- Layout (4) ---
  {
    name: 'SiteHeader',
    githubPath: 'src/components/SiteHeader.tsx',
    purpose: 'Top nav with theme toggle, search, primary route links.',
    whereUsed: 'All pages (rendered in app/layout.tsx).',
    category: 'layout',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-74' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },
  {
    name: 'SiteFooter',
    githubPath: 'src/components/SiteFooter.tsx',
    purpose: 'Footer with copyright + secondary links.',
    whereUsed: 'All pages.',
    category: 'layout',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-89' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },
  {
    name: 'MobileNav',
    githubPath: 'src/components/MobileNav.tsx',
    purpose: 'Hamburger menu for narrow viewports — primary nav links + theme toggle.',
    whereUsed: 'Site-wide, rendered inside SiteHeader at < 768px.',
    category: 'layout',
    status: 'Stable',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'Designed',
  },
  {
    name: 'SearchInput',
    githubPath: 'src/components/SearchInput.tsx',
    purpose: 'Search input with command-palette behavior (Cmd+K).',
    whereUsed: 'SiteHeader (desktop) and /search route.',
    category: 'layout',
    status: 'Stable',
    figmaNodeIds: [
      { variant: 'placeholder', nodeId: '5-65' },
      { variant: 'focused', nodeId: '5-67' },
    ],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },

  // --- Callouts (5) — MDX components used in case studies + research notes ---
  {
    name: 'HonestDisclosure',
    githubPath: 'src/components/mdx/callouts/HonestDisclosure.tsx',
    purpose: 'Callout for honest disclosure of failures, limits, or contradictions.',
    whereUsed: 'Case studies + meta-analyses (MDX).',
    category: 'callout',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-20' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },
  {
    name: 'TriggerIncident',
    githubPath: 'src/components/mdx/callouts/TriggerIncident.tsx',
    purpose: 'Surfaces the incident or audit finding that triggered a feature.',
    whereUsed: 'Framework-version case studies (MDX).',
    category: 'callout',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-26' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },
  {
    name: 'MemoryRef',
    githubPath: 'src/components/mdx/callouts/MemoryRef.tsx',
    purpose: 'Reference to a memory entry — links the narrative to durable context.',
    whereUsed: 'Case studies (MDX).',
    category: 'callout',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-32' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },
  {
    name: 'PredecessorChain',
    githubPath: 'src/components/mdx/callouts/PredecessorChain.tsx',
    purpose: 'Shows the dependency chain — what feature unblocked this one.',
    whereUsed: 'Feature case studies (MDX).',
    category: 'callout',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-38' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },
  {
    name: 'KillCriterionResolution',
    githubPath: 'src/components/mdx/callouts/KillCriterionResolution.tsx',
    purpose: 'Resolution of a kill criterion declared in PRD — what happened, what we learned.',
    whereUsed: 'Case studies (MDX).',
    category: 'callout',
    status: 'Stable',
    figmaNodeIds: [{ variant: 'default', nodeId: '5-44' }],
    hasFigmaConnect: true,
    darkModeStatus: 'Designed',
  },

  // --- UI utility (1) ---
  {
    name: 'Disclosure',
    githubPath: 'src/components/ui/Disclosure.tsx',
    purpose: 'Accessible expand/collapse with custom chevron and Safari quirks fixed.',
    whereUsed: '/design-system Part 1 sections, FAQ-style content blocks.',
    category: 'ui-utility',
    status: 'Stable',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'AutoDerived',
  },

  // --- Control-room (10) — Internal: power /control-room/* routes (gated) ---
  {
    name: 'FeatureCard',
    githubPath: 'src/components/control-room/FeatureCard.tsx',
    purpose: 'Card for a feature in the control-room dashboard with status + phase.',
    whereUsed: '/control-room/features list view.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'TaskCard',
    githubPath: 'src/components/control-room/TaskCard.tsx',
    purpose: 'Single task display for the operator backlog view.',
    whereUsed: '/control-room/tasks list view.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'TaskTree',
    githubPath: 'src/components/control-room/TaskTree.tsx',
    purpose: 'Nested task hierarchy view for feature breakdowns.',
    whereUsed: '/control-room/features detail view.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'AlertsBanner',
    githubPath: 'src/components/control-room/AlertsBanner.tsx',
    purpose: 'Top-of-page alert strip for active framework status / overdue features.',
    whereUsed: '/control-room/* pages.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'AuditEventRow',
    githubPath: 'src/components/control-room/AuditEventRow.tsx',
    purpose: 'One row of the integrity-cycle audit log.',
    whereUsed: '/control-room/audit log view.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'AuditLogPanel',
    githubPath: 'src/components/control-room/AuditLogPanel.tsx',
    purpose: 'Container for a paginated audit-event list with filtering.',
    whereUsed: '/control-room/audit dashboard.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'AuthPasskeyForm',
    githubPath: 'src/components/control-room/AuthPasskeyForm.tsx',
    purpose: 'WebAuthn passkey registration / sign-in form for /control-room/sign-in.',
    whereUsed: '/control-room/sign-in only.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'DevicesTable',
    githubPath: 'src/components/control-room/DevicesTable.tsx',
    purpose: 'List of registered passkey devices for the signed-in operator.',
    whereUsed: '/control-room/account.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'TODO',
  },
  {
    name: 'TrackedDocLink',
    githubPath: 'src/components/control-room/TrackedDocLink.tsx',
    purpose: 'Link to a doc with click-tracking instrumentation for ops analytics.',
    whereUsed: '/control-room/* docs surfaces.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'AutoDerived',
  },
  {
    name: 'ThemeToggle',
    githubPath: 'src/components/control-room/ThemeToggle.tsx',
    purpose: 'Light / Dark / System theme switcher button.',
    whereUsed: 'SiteHeader + control-room dashboard.',
    category: 'control-room',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'Designed',
  },

  // --- Persona (3) — Personalization mechanism ---
  {
    name: 'PersonaBar',
    githubPath: 'src/components/PersonaBar.tsx',
    purpose: 'Top strip showing the active reading persona + switcher.',
    whereUsed: 'Site-wide (when persona selected).',
    category: 'persona',
    status: 'Stable',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'Designed',
  },
  {
    name: 'PersonaIndicator',
    githubPath: 'src/components/PersonaIndicator.tsx',
    purpose: 'Inline indicator that content has been emphasized for the current persona.',
    whereUsed: 'Inline within case-study / framework MDX content.',
    category: 'persona',
    status: 'Stable',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'Designed',
  },
  {
    name: 'PersonaLens',
    githubPath: 'src/components/PersonaLens.tsx',
    purpose: 'Visual treatment applied to content blocks under a persona context.',
    whereUsed: 'MDX content wrappers.',
    category: 'persona',
    status: 'Stable',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'Designed',
  },

  // --- Bespoke (4) — Custom illustrations + interactive blocks ---
  {
    name: 'BlueprintOverlay',
    githubPath: 'src/components/bespoke/BlueprintOverlay.tsx',
    purpose: 'Architecture-blueprint overlay used in framework explanation pages.',
    whereUsed: '/framework + selected case studies.',
    category: 'bespoke',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'AutoDerived',
  },
  {
    name: 'ChipAffinityMap',
    githubPath: 'src/components/bespoke/ChipAffinityMap.tsx',
    purpose: 'Hardware-chip affinity visualization for HADF case studies.',
    whereUsed: 'HADF case studies + research notes.',
    category: 'bespoke',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'AutoDerived',
  },
  {
    name: 'DispatchReplay',
    githubPath: 'src/components/bespoke/DispatchReplay.tsx',
    purpose: 'Live-demo of dispatch decisions on real traces.',
    whereUsed: 'Framework demo page.',
    category: 'bespoke',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'AutoDerived',
  },
  {
    name: 'PhaseTimingChart',
    githubPath: 'src/components/bespoke/PhaseTimingChart.tsx',
    purpose: 'Timing chart showing phase durations across features.',
    whereUsed: 'Meta-analysis case studies.',
    category: 'bespoke',
    status: 'Internal',
    figmaNodeIds: null,
    hasFigmaConnect: false,
    darkModeStatus: 'AutoDerived',
  },
];

/** Computed metrics for the showcase route's drift summary card. */
export function getDesignSystemMetrics() {
  const total = DESIGN_SYSTEM_COMPONENTS.length;
  const mapped = DESIGN_SYSTEM_COMPONENTS.filter(c => c.hasFigmaConnect).length;
  const totalFigmaNodes = DESIGN_SYSTEM_COMPONENTS.reduce(
    (sum, c) => sum + (c.figmaNodeIds?.length ?? 0),
    0,
  );
  const darkModeBreakdown = {
    Designed: DESIGN_SYSTEM_COMPONENTS.filter(c => c.darkModeStatus === 'Designed').length,
    AutoDerived: DESIGN_SYSTEM_COMPONENTS.filter(c => c.darkModeStatus === 'AutoDerived').length,
    NotApplicable: DESIGN_SYSTEM_COMPONENTS.filter(c => c.darkModeStatus === 'NotApplicable').length,
    TODO: DESIGN_SYSTEM_COMPONENTS.filter(c => c.darkModeStatus === 'TODO').length,
  };
  const statusBreakdown = {
    Stable: DESIGN_SYSTEM_COMPONENTS.filter(c => c.status === 'Stable').length,
    Experimental: DESIGN_SYSTEM_COMPONENTS.filter(c => c.status === 'Experimental').length,
    Deprecated: DESIGN_SYSTEM_COMPONENTS.filter(c => c.status === 'Deprecated').length,
    Internal: DESIGN_SYSTEM_COMPONENTS.filter(c => c.status === 'Internal').length,
  };
  return {
    total,
    mapped,
    parityCoverage: total === 0 ? 0 : Math.round((mapped / total) * 100),
    totalFigmaNodes,
    darkModeBreakdown,
    statusBreakdown,
  };
}

/** Group components by category for ordered rendering on the showcase route. */
export function groupComponentsByCategory(): Record<ComponentCategory, ComponentManifestEntry[]> {
  const buckets: Record<ComponentCategory, ComponentManifestEntry[]> = {
    primitive: [],
    layout: [],
    callout: [],
    'ui-utility': [],
    'control-room': [],
    persona: [],
    bespoke: [],
  };
  for (const c of DESIGN_SYSTEM_COMPONENTS) {
    buckets[c.category].push(c);
  }
  return buckets;
}

/** Build the canonical Figma file URL for a node ID. */
export function buildFigmaNodeUrl(nodeId: string): string {
  return `https://www.figma.com/design/${FITME_STORY_FIGMA_FILE_KEY}/${FITME_STORY_FIGMA_FILE_NAME}?node-id=${nodeId}`;
}

/** Build the canonical GitHub source URL for a component. */
export function buildGitHubSourceUrl(githubPath: string): string {
  return `https://github.com/Regevba/fitme-story/blob/main/${githubPath}`;
}
