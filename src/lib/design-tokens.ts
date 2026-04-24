export interface TokenSwatch {
  cssVar: string;
  hex: string;
  label: string;
  note?: string;
}

export interface TokenGroup {
  name: string;
  description: string;
  swatches: TokenSwatch[];
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    name: 'Brand',
    description: 'The two voices of FitMe — indigo speaks structure and authority, coral speaks energy and recovery.',
    swatches: [
      { cssVar: '--color-brand-indigo', hex: '#4F46E5', label: 'Indigo', note: 'Primary CTAs, links, focus rings.' },
      { cssVar: '--color-brand-indigo-hover', hex: '#4338CA', label: 'Indigo hover' },
      { cssVar: '--color-brand-coral', hex: '#F97066', label: 'Coral', note: 'Recovery + feedback accents.' },
      { cssVar: '--color-brand-coral-hover', hex: '#F15048', label: 'Coral hover' },
    ],
  },
  {
    name: 'Skill palette',
    description: 'Eleven skill colors — one per framework skill, used across the Lego wall, lifecycle ring, and case-study accent bars.',
    swatches: [
      { cssVar: '--skill-pm-workflow', hex: '#4F46E5', label: 'pm-workflow', note: 'Hub · all phases' },
      { cssVar: '--skill-research', hex: '#F59E0B', label: 'research' },
      { cssVar: '--skill-ux', hex: '#D946EF', label: 'ux' },
      { cssVar: '--skill-design', hex: '#EC4899', label: 'design' },
      { cssVar: '--skill-dev', hex: '#0EA5E9', label: 'dev' },
      { cssVar: '--skill-qa', hex: '#84CC16', label: 'qa' },
      { cssVar: '--skill-analytics', hex: '#06B6D4', label: 'analytics' },
      { cssVar: '--skill-cx', hex: '#F43F5E', label: 'cx', note: 'Outer ring · feedback' },
      { cssVar: '--skill-marketing', hex: '#F97316', label: 'marketing', note: 'Outer ring · feedback' },
      { cssVar: '--skill-ops', hex: '#64748B', label: 'ops', note: 'Outer ring · feedback' },
      { cssVar: '--skill-release', hex: '#10B981', label: 'release' },
    ],
  },
  {
    name: 'Neutrals',
    description: 'Warm greys — picked for editorial feel and WCAG AA contrast at 4.5:1 on both light and dark backgrounds.',
    swatches: [
      { cssVar: '--color-neutral-50', hex: '#FAFAF9', label: 'neutral-50', note: 'Page background (light).' },
      { cssVar: '--color-neutral-100', hex: '#F5F5F4', label: 'neutral-100' },
      { cssVar: '--color-neutral-200', hex: '#E7E5E4', label: 'neutral-200', note: 'Borders, dividers.' },
      { cssVar: '--color-neutral-300', hex: '#D6D3D1', label: 'neutral-300' },
      { cssVar: '--color-neutral-500', hex: '#78716C', label: 'neutral-500', note: 'Captions, muted body.' },
      { cssVar: '--color-neutral-700', hex: '#44403C', label: 'neutral-700', note: 'Body text (light).' },
      { cssVar: '--color-neutral-800', hex: '#292524', label: 'neutral-800' },
      { cssVar: '--color-neutral-900', hex: '#1C1917', label: 'neutral-900', note: 'Page background (dark).' },
    ],
  },
];

export interface TypeScaleEntry {
  cssVar: string;
  value: string;
  label: string;
  note: string;
}

export const TYPE_SCALE: TypeScaleEntry[] = [
  { cssVar: '--text-display-xl', value: 'clamp(2.5rem, 5vw, 4.5rem)', label: 'Display XL', note: 'Hero headlines.' },
  { cssVar: '--text-display-lg', value: 'clamp(2rem, 4vw, 3.25rem)', label: 'Display LG', note: 'Page titles.' },
  { cssVar: '--text-display-md', value: 'clamp(1.5rem, 3vw, 2.25rem)', label: 'Display MD', note: 'Section titles.' },
  { cssVar: '--text-body', value: '1.0625rem', label: 'Body', note: 'Line-height 1.7 — editorial reading pace.' },
];

export interface MeasureEntry {
  cssVar: string;
  value: string;
  label: string;
}

export const MEASURES: MeasureEntry[] = [
  { cssVar: '--measure-narrow', value: '58ch', label: 'Narrow — callouts, pullquotes' },
  { cssVar: '--measure-body', value: '65ch', label: 'Body — editorial reading width' },
  { cssVar: '--measure-wide', value: '72ch', label: 'Wide — tables, code blocks' },
];
