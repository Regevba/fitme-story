// Lens — the audience point-of-view that defines the site's narrative spine.
//
// Two lenses: `dev` (engineering leads, product/process supports) and `pm`
// (product/process leads, engineering supports). The lens is the narrowed
// successor to the legacy 4-value `persona` (hr|pm|dev|academic); see
// src/lib/persona.ts. During the dual-audience redesign the lens is the
// canonical concept and `persona` is being folded into it.
//
// This module is SERVER-SAFE (no 'use client'): it reads the lens cookie via
// next/headers so the App Router can render the correct spine during SSR with
// no flash-of-wrong-content. The cookie (not localStorage) is the source of
// truth for rendering; the client mirror lives in src/lib/persona.ts.

import { cookies } from 'next/headers';

export type Lens = 'dev' | 'pm';
export type LensOrNull = Lens | null;

/** Cookie that carries the chosen lens across requests (SSR source of truth). */
export const LENS_COOKIE = 'fitme_lens';

/**
 * Default lens for visitors who have not chosen one yet, on pages that must
 * pick a spine anyway (any page except the home chooser). PM is the broader
 * audience, so a no-cookie deep link renders the PM spine with a dismissible
 * "switch to Dev" hint rather than a neutral page.
 */
export const DEFAULT_LENS: Lens = 'pm';

/** Narrowing type guard for an unknown cookie/string value. */
export function isLens(value: unknown): value is Lens {
  return value === 'dev' || value === 'pm';
}

/**
 * Server-only: read the lens from the request cookie.
 * Returns `null` when unset — the home page uses null to render its neutral
 * chooser; other pages call {@link getLensWithDefault}.
 *
 * Calling this opts the route into dynamic rendering (cookie access). Keep it
 * out of `use cache` scopes; pass the resolved lens down as an argument so any
 * cached subtree keys on the lens value instead.
 */
export async function getLens(): Promise<LensOrNull> {
  const store = await cookies();
  const value = store.get(LENS_COOKIE)?.value;
  return isLens(value) ? value : null;
}

/**
 * Server-only: read the lens, falling back to {@link DEFAULT_LENS} when unset.
 * Use on every lens-aware page that is not the home chooser.
 */
export async function getLensWithDefault(): Promise<Lens> {
  return (await getLens()) ?? DEFAULT_LENS;
}
