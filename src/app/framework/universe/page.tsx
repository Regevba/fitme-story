/**
 * src/app/framework/universe/page.tsx — first user-visible URL for the
 * 3D Universe walkthrough.
 *
 * Phase 4.G / T-route-framework.
 *
 * Lazy-loads `<FrameworkUniverse>` via `next/dynamic` with `ssr: false`
 * so the R3F + Three.js stack never lands in the main-bundle JS (FR-10:
 * initial JS = 0 KB on routes that don't visit /framework/universe).
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
 * fallback satisfy "initial JS = 0 KB" practically: the main bundle
 * ships page chrome only, and the 3D code lives in a separate chunk
 * hydrated after first paint.
 *
 * Phase 4.F (T-rive-tier-2 + T-poster-tier-3 + T-fallback-cascade)
 * upgrades the fallback into a proper Tier 2 / Tier 3 cascade.
 *
 * Phase 4.E (T-scrub-pause-timedilation) adds keyboard / pointer
 * controls.
 */

import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Framework Universe',
  description:
    'A cinematic 3D walkthrough of the framework that ships FitMe. Six acts trace the evolution from v1.0 to v7.9.1 — architecture, gate firings, measurement adoption, and every shipped feature as a monument.',
  slug: '/framework/universe',
});

// Dynamic import with ssr: false — the R3F bundle is client-only.
// The fallback below renders while the chunk loads.
const FrameworkUniverse = dynamic(
  () =>
    import('@/components/bespoke/framework-universe/FrameworkUniverse').then(
      (m) => ({ default: m.FrameworkUniverse }),
    ),
  {
    ssr: false,
    loading: () => <PosterFallback />,
  },
);

/**
 * Poster fallback — rendered while the deferred 3D bundle loads OR
 * when next/dynamic cannot resolve (e.g., JS disabled). Phase 4.F
 * T-poster-tier-3 replaces this with a proper hero-shot PNG + WebP
 * variant; for the T-route-framework MVP this is a typographic
 * placeholder so the route still ships something readable.
 *
 * Uses inline style rather than the project's Tailwind tokens because
 * the dynamic import's `loading:` slot is rendered server-side before
 * client hydration finishes, and Tailwind utility classes are only
 * guaranteed once the layout's CSS budget has fully resolved. Inline
 * style gives the fallback predictable visuals on cold paint.
 */
function PosterFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 100%)',
        color: '#1E293B',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>
        Framework Universe
      </h1>
      <p style={{ maxWidth: '36ch', margin: 0, opacity: 0.7, fontSize: '1rem' }}>
        Loading the cinematic 3D walkthrough — six acts trace the
        framework&rsquo;s evolution from v1.0 to v7.9.1.
      </p>
    </div>
  );
}

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
      <FrameworkUniverse />
    </main>
  );
}
