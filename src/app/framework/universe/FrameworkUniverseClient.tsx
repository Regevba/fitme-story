/**
 * src/app/framework/universe/FrameworkUniverseClient.tsx
 *
 * Client-Component wrapper for the dynamic `<FrameworkUniverse>` import.
 *
 * Per Next.js 16 App Router rules, `next/dynamic({ ssr: false })` is
 * only legal inside a Client Component. The page (page.tsx) stays a
 * Server Component so it can export `metadata` and keep SEO/static
 * rendering for everything except the 3D scene; this thin client
 * wrapper hosts the dynamic import that gates the R3F bundle.
 *
 * Phase 4.G / T-route-framework. The PosterFallback below is the
 * minimum-viable Tier 3 fallback per FR-4; Phase 4.F replaces it with
 * the full Rive Tier 2 / poster Tier 3 cascade.
 */

'use client';

import dynamic from 'next/dynamic';

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
 * Poster fallback rendered while the deferred 3D bundle loads. Inline
 * styles rather than the project's Tailwind tokens because this slot
 * paints before the layout's CSS budget fully resolves — inline gives
 * predictable visuals on cold paint.
 *
 * Phase 4.F T-poster-tier-3 replaces this with a proper hero-shot PNG
 * + WebP variant; for the T-route-framework MVP this is a typographic
 * placeholder so the route still ships something readable.
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

export function FrameworkUniverseClient() {
  return <FrameworkUniverse />;
}
