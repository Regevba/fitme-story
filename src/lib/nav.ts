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

export const NAV: NavItem[] = [
  { href: '/pm-flow', label: 'PM Flow' },
  { href: '/framework', label: 'Framework' },
  { href: '/design-system', label: 'Design System' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
  { href: '/control-room', label: 'Control Center', gated: true },
];

// Match a nav item against the current pathname. Exact match for "/", and
// prefix match for everything else so /case-studies/<slug> still highlights
// the "Case Studies" tab. Audit V-003 + A-003 (2026-05-08).
export function isCurrentNav(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
