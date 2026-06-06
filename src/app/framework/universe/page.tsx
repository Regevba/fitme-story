/**
 * src/app/framework/universe/page.tsx — 3D Universe walkthrough route.
 *
 * **TEMPORARILY 404'D (2026-06-06)** — animation polish needed before
 * re-launching to the public. The R3F scene tree, FrameworkUniverseClient,
 * all primitives, scenes, fallback cascade, analytics, and operator route
 * (`/control-room/framework/universe`) stay on main so iteration continues
 * without recreating any implementation.
 *
 * To re-launch:
 *   1. Restore the original `export default function FrameworkUniversePage`
 *      that returns `<FrameworkUniverseClient />` (see git history pre-this
 *      commit, or just remove the `notFound()` below).
 *   2. Restore the discovery card in `src/app/framework/page.tsx` (linked
 *      `/framework/universe` between "See the framework in motion" and
 *      "Developer guide").
 *   3. Re-add `/framework/universe` to the lighthouse-ci URL list in
 *      `.github/workflows/lighthouse-ci.yml`.
 *
 * Out of scope for the 404 — the operator route at
 * `/control-room/framework/universe` stays mounted (auth-gated, internal
 * iteration surface).
 *
 * Empirical note — calling `notFound()` from the Server Component yields a
 * real 404 with the global not-found.tsx UI, not a soft redirect. SEO
 * implications: the route emits the same X-Robots-Tag the parent app does;
 * search engines that previously indexed the route (if any did in the
 * ~30-min prod window between PR #200 merge and this revert) will drop it
 * on the next crawl.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

// Metadata kept so `next/link` previews + search-engine results don't
// suddenly emit a generic "fitme-story" title if a crawler caches the
// route. The route still 404s — metadata only renders for the not-found
// shell.
export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Framework Universe',
    description:
      'The 3D Universe walkthrough is temporarily offline while we polish the animation. Check back soon.',
    slug: '/framework/universe',
  }),
  // Don't index a 404'd route.
  robots: { index: false, follow: false },
};

export default function FrameworkUniversePage(): never {
  notFound();
}
