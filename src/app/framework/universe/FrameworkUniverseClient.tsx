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
 * Phase 4.G / T-route-framework + T-route-control-room.
 *
 * Mode prop is forwarded to the underlying FrameworkUniverse. The
 * visitor route (this file's original consumer) passes the default
 * 'visitor'. The operator route at /control-room/framework/universe
 * passes 'operator' — same scene tree, future WebSocket telemetry
 * overlay differentiated only by data subscription (FR-8). For this
 * PR the operator mode is visually distinguished by a subtle bottom-
 * left status pill; live telemetry is a separate task.
 *
 * The PosterFallback below is the minimum-viable Tier 3 fallback per
 * FR-4; Phase 4.F replaces it with the full Rive Tier 2 / poster
 * Tier 3 cascade.
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

export interface FrameworkUniverseClientProps {
  /** FR-8 — `'visitor'` is the public scene at /framework/universe;
   *  `'operator'` is the same scene at /control-room/framework/universe
   *  with a subtle status pill (and future live WebSocket telemetry). */
  mode?: 'visitor' | 'operator';
}

export function FrameworkUniverseClient({
  mode = 'visitor',
}: FrameworkUniverseClientProps = {}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <FrameworkUniverse mode={mode} />
      {mode === 'operator' ? <OperatorStatusPill /> : null}
    </div>
  );
}

/**
 * Small bottom-left pill rendered on top of the Canvas in operator
 * mode. Marks the scene as operator-side without obstructing the 3D
 * content. Future live-telemetry wiring (FR-8) will replace the
 * static text with a real connection-status indicator + the latest
 * telemetry tick.
 */
function OperatorStatusPill() {
  return (
    <div
      role="status"
      aria-label="Operator mode"
      style={{
        position: 'absolute',
        left: '1rem',
        bottom: '1rem',
        background: 'rgba(15, 23, 42, 0.85)',
        color: '#A7F3D0',
        padding: '0.375rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        letterSpacing: '0.05em',
        border: '1px solid rgba(167, 243, 208, 0.3)',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.3)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      OPERATOR MODE
    </div>
  );
}
