/**
 * Analytics debug mirror — Phase 2.A.4 of analytics-observability.
 *
 * Companion to FT2 `scripts/analytics-watch-server.py` (Phase 2.A.1) and
 * the iOS DebugSinkAdapter (Phase 2.A.3). When NEXT_PUBLIC_DEBUG_ANALYTICS=1
 * is set at build time, every event the web app fires via gtag is also
 * POSTed to a local SSE server so an operator can tail it with
 * `python3 scripts/analytics-watch.py` (in the FT2 repo).
 *
 * DESIGN PROPERTIES
 * -----------------
 *   - PRODUCTION SAFE: when env unset, this is a no-op. The production
 *     gtag path is unchanged.
 *   - PASSIVE TEE: fire-and-forget fetch with `keepalive: true`. The
 *     mirror is dev-only — losing events here must never affect real GA4.
 *   - SSR SAFE: `typeof window === 'undefined'` short-circuit at the top.
 *   - PII SAFE: caller decides what to send. Existing emit() functions
 *     in design-system-analytics.ts and control-room/analytics.ts pass
 *     only the params already approved for GA4.
 *
 * SETUP (operator, local dev only)
 * --------------------------------
 *   1. In the FT2 repo, start the SSE mirror server:
 *        python3 scripts/analytics-watch-server.py
 *   2. In `.env.local`, set:
 *        NEXT_PUBLIC_DEBUG_ANALYTICS=1
 *   3. Run `npm run dev` (or `vercel dev`)
 *   4. Tail events:
 *        python3 scripts/analytics-watch.py
 *
 * To override the mirror URL:
 *   NEXT_PUBLIC_DEBUG_ANALYTICS_URL=http://localhost:9999/event
 */

const DEFAULT_SINK_URL = 'http://127.0.0.1:8765/event';

/**
 * Resolve whether the mirror is enabled + the URL to POST to.
 *
 * Reads `process.env` once at module-load time. NEXT_PUBLIC_* env vars
 * are inlined by Next.js at build, so this is effectively a compile-time
 * constant in the production bundle (== `false`, eliminating the entire
 * tee path via dead-code elimination).
 */
function resolveSinkURL(): string | null {
  // Build-time check first (avoids per-call overhead in prod)
  if (process.env.NEXT_PUBLIC_DEBUG_ANALYTICS !== '1') return null;
  return process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL || DEFAULT_SINK_URL;
}

const SINK_URL = resolveSinkURL();

/**
 * Tee a GA4 event payload to the local mirror server (no-op when disabled).
 *
 * Call this AFTER `gtag('event', ...)` succeeds. Production analytics is
 * never affected by sink failures — fetch errors are swallowed.
 *
 * Visible for testing via the `__teeToDebugMirrorWithURL` named export below.
 */
export function teeToDebugMirror(eventName: string, params: object): void {
  if (SINK_URL === null) return;
  if (typeof window === 'undefined') return;
  void postEvent(SINK_URL, eventName, params);
}

/** Internal: actual fetch. Exported as a named symbol for unit tests. */
export function __postEventForTests(url: string, eventName: string, params: object): Promise<void> {
  return postEvent(url, eventName, params);
}

async function postEvent(url: string, eventName: string, params: object): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: eventName, params }),
      // keepalive lets the request survive page-unload (gtag events
      // commonly fire just before navigation)
      keepalive: true,
      // Sink is local — no need for cookies or credentials
      credentials: 'omit',
      mode: 'cors',
    });
  } catch {
    // Discard — local debug sink failures must never affect production.
  }
}

/**
 * Test-only helper: re-resolves the sink URL from current env.
 * Production code uses the cached `SINK_URL` constant; tests can call
 * this to validate the resolution logic without module-reload tricks.
 */
export function __resolveSinkURLForTests(): string | null {
  return resolveSinkURL();
}
