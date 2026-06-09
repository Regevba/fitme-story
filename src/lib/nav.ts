// Shared navigation source. SiteHeader (desktop) + MobileNav (hamburger)
// both read from this so adding/renaming a route updates both surfaces.
// Extracted 2026-05-08 with the MobileNav ship (audit V-004 P0).

export interface NavItem {
  href: string;
  label: string;
  /** When true, renders a small lock icon next to the label as a hint that
      the destination is auth-gated (the basic-auth dialog will appear on
      navigation). */
  gated?: boolean;
}

import type { Lens } from './lens';

export const NAV: NavItem[] = [
  { href: '/pm-flow', label: 'PM Flow' },
  { href: '/framework', label: 'Framework' },
  { href: '/design-system', label: 'Design System' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/story', label: 'Story' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
  { href: '/control-room', label: 'Control Center', gated: true },
];

// Per-lens ordering of the four PRIMARY routes (dual-audience redesign T11).
// PM leads with the product/process surfaces; Dev leads with the engineering
// surfaces. Secondary routes (Story, Research, About) and the gated Control
// Center keep a fixed trailing order. Unknown/no lens → PM order (the default).
const PRIMARY_ORDER: Record<Lens, string[]> = {
  pm: ['/pm-flow', '/case-studies', '/framework', '/design-system'],
  dev: ['/framework', '/design-system', '/case-studies', '/pm-flow'],
};
const TRAILING = ['/story', '/research', '/about', '/control-room'];

export function navForLens(lens: Lens | null): NavItem[] {
  const order = [...PRIMARY_ORDER[lens ?? 'pm'], ...TRAILING];
  const byHref = new Map(NAV.map((item) => [item.href, item]));
  const ordered = order
    .map((href) => byHref.get(href))
    .filter((x): x is NavItem => Boolean(x));
  const seen = new Set(order);
  // Forward-safe: append any NAV item not explicitly ordered.
  return [...ordered, ...NAV.filter((item) => !seen.has(item.href))];
}

// Match a nav item against the current pathname. Exact match for "/", and
// prefix match for everything else so /case-studies/<slug> still highlights
// the "Case Studies" tab. Audit V-003 + A-003 (2026-05-08).
export function isCurrentNav(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
