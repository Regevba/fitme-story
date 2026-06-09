// Server-only lens resolution. Reads the lens cookie via next/headers so a
// page that deliberately opts into dynamic rendering can render the correct
// narrative spine server-side with no flash.
//
// IMPORTANT: importing this module (transitively) opts a route into dynamic
// rendering, because cookies() is a dynamic API. It is therefore NOT wired
// into the root layout (that would make the whole statically-generated site
// dynamic and regress the perf guardrail). The default lens experience is
// resolved client-side via src/lib/persona.ts (consistent with the existing
// persona/theme systems). Call these helpers only from a specific page that
// needs server-rendered, lens-correct content and accepts dynamic rendering.

import { cookies } from 'next/headers';
import { isLens, DEFAULT_LENS, LENS_COOKIE, type Lens, type LensOrNull } from './lens';

/** Read the lens from the request cookie. Returns null when unset. */
export async function getLens(): Promise<LensOrNull> {
  const store = await cookies();
  const value = store.get(LENS_COOKIE)?.value;
  return isLens(value) ? value : null;
}

/** Read the lens, falling back to DEFAULT_LENS when unset. */
export async function getLensWithDefault(): Promise<Lens> {
  return (await getLens()) ?? DEFAULT_LENS;
}
