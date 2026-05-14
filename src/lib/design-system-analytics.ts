/**
 * GA4 event helpers for the public /design-system route.
 *
 * Per CLAUDE.md "Analytics Naming Convention": every screen-scoped event
 * uses the `design_system_` prefix. Events declared here also appear in
 * docs/product/analytics-taxonomy.csv with screen_scope=design_system.
 *
 * Every helper is a no-op when:
 *   - rendered on the server (typeof window === 'undefined')
 *   - window.gtag is unavailable (NEXT_PUBLIC_GA_ID unset, or GA blocked by
 *     a privacy extension)
 *
 * Cousin file: src/lib/control-room/analytics.ts (operator-side analytics
 * for /control-room/* routes; same gtag-wrapper pattern).
 *
 * Verification: post-deploy operator workflow.
 *   1. Deploy preview
 *   2. Open GA4 Real-Time DebugView (admin → DebugView)
 *   3. Visit /design-system on the preview URL with `?gtm_debug=x`
 *   4. Confirm all 4 events fire on the corresponding interactions
 */

import { teeToDebugMirror } from './analytics-debug-mirror';

interface GtagWindow extends Window {
  gtag?: (command: 'event', eventName: string, params: Record<string, unknown>) => void;
}

function emit(eventName: string, params: object): void {
  if (typeof window === 'undefined') return;
  const gw = window as GtagWindow;
  if (typeof gw.gtag !== 'function') return;
  gw.gtag('event', eventName, params as Record<string, unknown>);
  // Phase 2.A.4: also tee to local mirror when NEXT_PUBLIC_DEBUG_ANALYTICS=1.
  // No-op when env var unset — production behavior unchanged.
  teeToDebugMirror(eventName, params);
}

export type DesignSystemSection =
  | 'parity'
  | 'tokens-web'
  | 'components-web'
  | 'drift'
  | 'dark-mode'
  | 'heritage'
  | 'contribute'
  | 'principles'
  | 'onboarding-flow'
  | 'live-app'
  | 'under-the-hood';

export interface SectionViewEvent {
  section_id: DesignSystemSection;
  is_first_view_in_session: boolean;
}

export interface ComponentExpandEvent {
  component_name: string;
  component_status: 'Stable' | 'Experimental' | 'Deprecated' | 'Internal';
}

export interface CodeCopyEvent {
  component_name: string;
  snippet_type: 'react' | 'figma' | 'usage';
}

export interface FigmaLinkClickEvent {
  component_name: string;
  figma_node_id: string;
  outbound_url: string;
}

export function trackDesignSystemSectionView(payload: SectionViewEvent): void {
  emit('design_system_section_view', payload);
}

/**
 * @forward-declared
 *
 * Helper exported for future use. As of 2026-05-13 there is no UI that
 * calls this — the `/design-system` ComponentCard does not yet have an
 * expand button. Honored as intentional forward-declaration by:
 *   - FT2 `docs/product/analytics-taxonomy.csv` row (Notes prefixed `[FORWARD-DECLARED]`)
 *   - FT2 `docs/master-plan/analytics-master-plan-2026-05-13.md` §5.4 convention
 *
 * When the expand UI ships:
 *   1. Wire this helper from the new component
 *   2. Remove `[FORWARD-DECLARED]` from the CSV Notes
 *   3. Add a unit test confirming the helper fires
 *   4. Update implementing feature's state.json
 */
export function trackDesignSystemComponentExpand(payload: ComponentExpandEvent): void {
  emit('design_system_component_expand', payload);
}

/**
 * @forward-declared
 *
 * Helper exported for future use. As of 2026-05-13 there is no UI that
 * calls this — the `/design-system` Copy snippet button is not yet
 * implemented. Honored as intentional forward-declaration by:
 *   - FT2 `docs/product/analytics-taxonomy.csv` row (Notes prefixed `[FORWARD-DECLARED]`)
 *   - FT2 `docs/master-plan/analytics-master-plan-2026-05-13.md` §5.4 convention
 *
 * When the Copy button ships:
 *   1. Wire this helper from the button onClick
 *   2. Remove `[FORWARD-DECLARED]` from the CSV Notes
 *   3. Add a unit test confirming the helper fires
 *   4. Update implementing feature's state.json
 */
export function trackDesignSystemCodeCopy(payload: CodeCopyEvent): void {
  emit('design_system_code_copy', payload);
}

export function trackDesignSystemFigmaLinkClick(payload: FigmaLinkClickEvent): void {
  emit('design_system_figma_link_click', payload);
}
