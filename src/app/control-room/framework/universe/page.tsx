/**
 * src/app/control-room/framework/universe/page.tsx
 *
 * Operator-mode Framework Universe at /control-room/framework/universe.
 *
 * Phase 4.G / T-route-control-room. Closes FR-8 (operator mode with
 * live WebSocket telemetry overlay, UCC-passkey gated). For this PR
 * the scene tree is identical to the visitor route — the differentiation
 * is a small "OPERATOR MODE" status pill rendered in the bottom-left
 * corner. Live telemetry wiring is a separate task (deferred until the
 * WebSocket substrate is built).
 *
 * Routed at /control-room/framework/universe rather than replacing the
 * existing /control-room/framework page because that page is a content-
 * rich Framework-Health Dashboard (7 panels) that operators rely on.
 * Same additive routing pattern as the visitor side
 * (/framework/universe rather than bare /framework).
 *
 * Auth: inherits the basic-auth proxy gating already applied to
 * /control-room/* by proxy.ts. UCC-passkey gating per the v7.8.1
 * passkey-auth feature is upstream of this route.
 *
 * Indexing: /control-room/* is excluded from sitemap + robots.txt per
 * the existing convention (see src/app/sitemap.ts + src/app/robots.ts).
 */

import type { Metadata } from 'next';
import { FrameworkUniverseClient } from '@/app/framework/universe/FrameworkUniverseClient';

export const metadata: Metadata = {
  title: 'Operator Framework Universe — FitMe',
  description:
    'Operator-mode 3D Universe walkthrough at /control-room/framework/universe. Same scene tree as the public route with operator-mode telemetry overlay.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ControlRoomFrameworkUniversePage() {
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
      <FrameworkUniverseClient mode="operator" />
    </main>
  );
}
