/**
 * GA4 event helpers for the /framework/universe + /control-room/framework/universe
 * routes.
 *
 * Phase 4.H / T-ga4-events. Closes AC-17 (analytics coverage).
 *
 * Per CLAUDE.md "Analytics Naming Convention": every screen-scoped event uses
 * the `framework_universe_` prefix because all 6 are emitted from the 3D
 * Universe scenes. Events declared here also appear in
 * `docs/product/analytics-taxonomy.csv` with `screen_scope=framework_universe`
 * (FT2-side taxonomy CSV update is a follow-up task).
 *
 * Every helper is a no-op when:
 *   - rendered on the server (typeof window === 'undefined')
 *   - `window.gtag` is unavailable (NEXT_PUBLIC_GA_ID unset, or GA blocked by
 *     a privacy extension)
 *
 * Cousin files:
 *   - `src/lib/design-system-analytics.ts` (public /design-system events)
 *   - `src/lib/control-room/analytics.ts` (operator-side /control-room/* events)
 *
 * Verification: post-deploy operator workflow.
 *   1. Deploy preview
 *   2. Open GA4 Real-Time DebugView (admin → DebugView)
 *   3. Visit /framework/universe on the preview URL with `?gtm_debug=x`
 *   4. Confirm the 6 events fire on the corresponding interactions
 *
 * PII discipline: no event carries user names, emails, or IP-derived data.
 * Act IDs, time-dilation factors, and tier names are deliberately enums.
 */

import { teeToDebugMirror } from './analytics-debug-mirror';

interface GtagWindow extends Window {
  gtag?: (
    command: 'event',
    eventName: string,
    params: Record<string, unknown>,
  ) => void;
}

function emit(eventName: string, params: object): void {
  if (typeof window === 'undefined') return;
  const gw = window as GtagWindow;
  if (typeof gw.gtag !== 'function') return;
  gw.gtag('event', eventName, params as Record<string, unknown>);
  // Tee to local mirror when NEXT_PUBLIC_DEBUG_ANALYTICS=1; no-op otherwise.
  teeToDebugMirror(eventName, params);
}

// ─── Shared types ───────────────────────────────────────────────────────

/** Canonical act IDs for the 6-act walkthrough. */
export type UniverseActId =
  | 'I_threshold'
  | 'II_emergence'
  | 'III_architecture'
  | 'IV_gate_firings'
  | 'V_measurement'
  | 'VI_legacy';

/** Where the scene is mounted — public visitor vs operator dashboard. */
export type UniverseMode = 'visitor' | 'operator';

/** Three-tier fallback per FR-4. */
export type UniverseFallbackTier = 'tier_1_r3f' | 'tier_2_rive' | 'tier_3_poster';

/** Class of label hovered — used by Acts III/IV/V annotations. */
export type UniverseLabelKind =
  | 'chamber'
  | 'pattern'
  | 'gate_firing'
  | 'adoption_bar'
  | 'monument';

// ─── Event 1: framework_universe_act_enter ──────────────────────────────

interface ActEnterParams {
  act_id: UniverseActId;
  /** Index 1-6 — handy for funnel + completion-rate dashboards. */
  act_index: 1 | 2 | 3 | 4 | 5 | 6;
  mode: UniverseMode;
  /** Wall-clock seconds since session start when the act entered. */
  session_elapsed_sec: number;
}

export function logUniverseActEnter(params: ActEnterParams): void {
  emit('framework_universe_act_enter', params);
}

// ─── Event 2: framework_universe_label_hover ────────────────────────────

interface LabelHoverParams {
  act_id: UniverseActId;
  label_kind: UniverseLabelKind;
  /** Free-form label identifier — pattern W-ID, chamber slug, etc. PII-free
   *  by construction (the wider scenes only render canonical IDs). */
  label_id: string;
  mode: UniverseMode;
}

export function logUniverseLabelHover(params: LabelHoverParams): void {
  emit('framework_universe_label_hover', params);
}

// ─── Event 3: framework_universe_scrub_seek ─────────────────────────────

interface ScrubSeekParams {
  /** Target position in the timeline as a fraction 0..1 of total runtime. */
  target_fraction: number;
  /** Resolved act at the seek target — included so funnels can group seeks
   *  by destination scene without joining act_enter events. */
  target_act_id: UniverseActId;
  mode: UniverseMode;
}

export function logUniverseScrubSeek(params: ScrubSeekParams): void {
  emit('framework_universe_scrub_seek', params);
}

// ─── Event 4: framework_universe_time_dilation ──────────────────────────

interface TimeDilationParams {
  /** Multiplier (e.g. 0.25 for 4× slow). 1.0 = real-time; >1.0 = fast-forward. */
  rate_multiplier: number;
  act_id: UniverseActId;
  mode: UniverseMode;
}

export function logUniverseTimeDilation(params: TimeDilationParams): void {
  emit('framework_universe_time_dilation', params);
}

// ─── Event 5: framework_universe_replay ─────────────────────────────────

interface ReplayParams {
  /** What triggered the replay — explicit user click on a replay control,
   *  or auto-loop after the final act's hold ended. */
  trigger: 'user_click' | 'auto_loop';
  mode: UniverseMode;
}

export function logUniverseReplay(params: ReplayParams): void {
  emit('framework_universe_replay', params);
}

// ─── Event 6: framework_universe_fallback_tier_activated ────────────────

interface FallbackTierParams {
  tier: UniverseFallbackTier;
  /** Why the cascade fell back from a higher tier. The detection logic in
   *  Phase 4.F T-fallback-cascade derives these reasons; for now we ship
   *  the enum so scene code that already knows can emit. */
  reason:
    | 'prefers_reduced_motion'
    | 'low_memory'
    | 'webgpu_unavailable'
    | 'webgl_unavailable'
    | 'saved_data'
    | 'no_js'
    | 'unknown';
  mode: UniverseMode;
}

export function logUniverseFallbackTierActivated(params: FallbackTierParams): void {
  emit('framework_universe_fallback_tier_activated', params);
}
