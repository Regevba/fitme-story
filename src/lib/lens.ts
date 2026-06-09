// Lens — the audience point-of-view that defines the site's narrative spine.
//
// Two lenses: `dev` (engineering leads, product/process supports) and `pm`
// (product/process leads, engineering supports). The lens is the narrowed
// successor to the legacy 4-value `persona` (hr|pm|dev|academic); see
// src/lib/persona.ts. During the dual-audience redesign the lens is the
// canonical concept and `persona` is being folded into it.
//
// This module is PURE (no React, no next/headers) so it is safe to import from
// BOTH client and server code. Server-only cookie reads live in
// src/lib/lens.server.ts; the client mirror lives in src/lib/persona.ts.

export type Lens = 'dev' | 'pm';
export type LensOrNull = Lens | null;

/** Cookie that carries the chosen lens across requests (SSR source of truth). */
export const LENS_COOKIE = 'fitme_lens';

/** One year, in seconds — the lens choice is a durable preference. */
export const LENS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Default lens for visitors who have not chosen one yet, on surfaces that must
 * pick a spine anyway (anything except the home chooser). PM is the broader
 * audience, so a no-cookie deep link renders the PM spine with a dismissible
 * "switch to Dev" hint rather than a neutral page.
 */
export const DEFAULT_LENS: Lens = 'pm';

/** Narrowing type guard for an unknown cookie/string value. */
export function isLens(value: unknown): value is Lens {
  return value === 'dev' || value === 'pm';
}

/** Human-facing label for each lens (used by the chooser/toggle + a11y). */
export const LENS_LABELS: Record<Lens, string> = {
  dev: 'Developer',
  pm: 'Product manager',
};
