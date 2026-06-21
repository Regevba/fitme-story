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
  { cssVar: '--text-display-xl', value: 'clamp(2rem, 4vw, 3rem)', label: 'Display XL', note: 'Hero headlines.' },
  { cssVar: '--text-display-lg', value: 'clamp(1.75rem, 3.25vw, 2.5rem)', label: 'Display LG', note: 'Page titles.' },
  { cssVar: '--text-display-md', value: 'clamp(1.375rem, 2.5vw, 2rem)', label: 'Display MD', note: 'Section titles.' },
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

export interface MotionToken {
  cssVar: string;
  value: string;
  label: string;
  category: 'duration' | 'easing';
  note?: string;
}

export const MOTION_TOKENS: MotionToken[] = [
  { cssVar: '--motion-duration-fast', value: '120ms', label: 'Fast', category: 'duration', note: 'Micro-feedback — copy ✓, hover affordance.' },
  { cssVar: '--motion-duration-standard', value: '200ms', label: 'Standard', category: 'duration', note: 'Default for state changes — modal open, badge appearance.' },
  { cssVar: '--motion-duration-slow', value: '320ms', label: 'Slow', category: 'duration', note: 'Significant transitions — page-level transitions, large layout shifts.' },
  { cssVar: '--motion-easing-standard', value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Standard', category: 'easing', note: 'Symmetric in/out — default for most transitions.' },
  { cssVar: '--motion-easing-decelerate', value: 'cubic-bezier(0, 0, 0.2, 1)', label: 'Decelerate', category: 'easing', note: 'Element entering — slows as it lands.' },
  { cssVar: '--motion-easing-emphasized', value: 'cubic-bezier(0.2, 0, 0, 1)', label: 'Emphasized', category: 'easing', note: 'Hero moments — extra anticipation + landing.' },
];

export interface ElevationToken {
  cssVar: string;
  lightValue: string;
  darkValue: string;
  level: 1 | 2 | 3 | 4;
  label: string;
  note?: string;
}

export const ELEVATION_TOKENS: ElevationToken[] = [
  { cssVar: '--elevation-1', lightValue: '0 1px 2px rgb(0 0 0 / 0.06)', darkValue: '0 1px 2px rgb(0 0 0 / 0.4)', level: 1, label: 'Level 1', note: 'Resting cards, subtle separation from background.' },
  { cssVar: '--elevation-2', lightValue: '0 4px 8px rgb(0 0 0 / 0.08)', darkValue: '0 4px 8px rgb(0 0 0 / 0.5)', level: 2, label: 'Level 2', note: 'Hovered cards, dropdowns, popovers.' },
  { cssVar: '--elevation-3', lightValue: '0 8px 16px rgb(0 0 0 / 0.10)', darkValue: '0 8px 16px rgb(0 0 0 / 0.6)', level: 3, label: 'Level 3', note: 'Floating panels, sticky headers.' },
  { cssVar: '--elevation-4', lightValue: '0 16px 32px rgb(0 0 0 / 0.12)', darkValue: '0 16px 32px rgb(0 0 0 / 0.7)', level: 4, label: 'Level 4', note: 'Modals, drawers — highest elevation.' },
];

export interface ZIndexToken {
  cssVar: string;
  value: number;
  label: string;
  note?: string;
}

export const Z_INDEX_TOKENS: ZIndexToken[] = [
  { cssVar: '--z-base', value: 0, label: 'Base', note: 'Default flow — most page content.' },
  { cssVar: '--z-elevated', value: 10, label: 'Elevated', note: 'Hover state, dropdown trigger lift.' },
  { cssVar: '--z-header', value: 100, label: 'Header', note: 'Sticky site header above content.' },
  { cssVar: '--z-modal', value: 1000, label: 'Modal', note: 'Dialogs, drawers — fully blocking.' },
  { cssVar: '--z-toast', value: 10000, label: 'Toast', note: 'Transient feedback — above everything.' },
];
