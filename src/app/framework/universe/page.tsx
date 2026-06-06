/**
 * src/app/framework/universe/page.tsx — first user-visible URL for the
 * 3D Universe walkthrough.
 *
 * Phase 4.G / T-route-framework.
 *
 * This file is a Server Component (no `'use client'` directive) so it
 * exports `metadata` for SEO + static optimization. The actual 3D
 * scene lives behind a Client Component wrapper at
 * `FrameworkUniverseClient.tsx` — Next.js 16 App Router rules forbid
 * `next/dynamic({ ssr: false })` inside a Server Component, so the
 * wrapper holds the dynamic import.
 *
 * Routed at `/framework/universe` rather than bare `/framework` because
 * the existing `/framework` page is a content-rich documentation hub
 * (8-floor blueprint + v7.8 bridge timeline + dev-guide entry); routing
 * the Universe alongside as `/framework/universe` preserves that
 * content. Migration of the final URL (per PRD FR-1) is deferred to
 * an operator decision after the Universe is ready for prime time.
 *
 * IntersectionObserver-gated load (FR-10 strict reading) is deferred
 * to a follow-up — the Universe IS the page content here, so gating
 * on scroll-into-view doesn't add value. The dynamic-import + poster
 * fallback in the client wrapper satisfy "initial JS = 0 KB" on every
 * OTHER route practically: the main bundle ships page chrome only,
 * and the 3D code lives in a separate chunk hydrated after first
 * paint.
 *
 * Phase 4.F (T-rive-tier-2 + T-poster-tier-3 + T-fallback-cascade)
 * upgrades the fallback into a proper Tier 2 / Tier 3 cascade.
 *
 * Phase 4.E (T-scrub-pause-timedilation) adds keyboard / pointer
 * controls.
 */

import { buildMetadata } from '@/lib/seo';
import { FrameworkUniverseClient } from './FrameworkUniverseClient';

export const metadata = buildMetadata({
  title: 'Framework Universe',
  description:
    'A cinematic 3D walkthrough of the framework that ships FitMe. Six acts trace the evolution from v1.0 to v7.9.1 — architecture, gate firings, measurement adoption, and every shipped feature as a monument.',
  slug: '/framework/universe',
});

export default function FrameworkUniversePage() {
  return (
    <main
      style={{
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <FrameworkUniverseClient />
    </main>
  );
}
