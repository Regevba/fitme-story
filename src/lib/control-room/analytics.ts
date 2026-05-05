/**
 * Control-room analytics helpers — UCC task T36.
 *
 * Typed wrappers around `window.gtag('event', name, params)` for the 8
 * GA4 events declared in the UCC PRD §10.1. Every helper is a no-op on
 * the server (SSR) and on the client when `window.gtag` is undefined
 * (no GA configured / blocked by a privacy extension).
 *
 * The fitme-story root layout already mounts `@next/third-parties/google`'s
 * `<GoogleAnalytics gaId={NEXT_PUBLIC_GA_ID} />` which installs `gtag` on
 * window — these helpers piggy-back on that integration.
 *
 * Naming convention (CLAUDE.md "Analytics Naming Convention"): every event
 * carries the `dashboard_` screen-prefix because all 8 are emitted from
 * `/control-room/*` surfaces. PII never lands in any param.
 *
 * For the matching taxonomy CSV update, see UCC T37 (FT2 docs/product/
 * analytics-taxonomy.csv).
 */

// ────────────────────────────────────────────────────────────────────────────
// Event payload types — one per GA4 event in the PRD
// ────────────────────────────────────────────────────────────────────────────

export type ControlRoomRoute =
  | 'overview'
  | 'board'
  | 'table'
  | 'tasks'
  | 'knowledge'
  | 'framework';

export type AlertSeverity = 'red' | 'amber' | 'blue' | 'purple' | 'info';

export type ExternalLinkType = 'github' | 'linear' | 'notion' | 'vercel';

export type AuthMethod = 'basic' | 'public' | 'extracted';

export interface DashboardLoadEvent {
  route: ControlRoomRoute;
  data_freshness_minutes: number;
  auth_method: AuthMethod;
}

export interface DashboardBlockerAcknowledgedEvent {
  feature_id: string;
  alert_severity: AlertSeverity;
  time_since_load_ms: number;
}

export interface DashboardViewChangeEvent {
  from_view: ControlRoomRoute | 'external';
  to_view: ControlRoomRoute | 'external';
}

export interface DashboardFilterApplyEvent {
  filter_field: string;
  filter_value_count: number;
}

export interface DashboardKanbanDragEvent {
  feature_id: string;
  from_phase: string;
  to_phase: string;
}

export interface DashboardKnowledgeOpenEvent {
  doc_path: string;
  doc_group: string;
}

export interface DashboardExternalLinkEvent {
  link_type: ExternalLinkType;
  target_id: string;
}

export interface DashboardSyncWarningShownEvent {
  staleness_hours: number;
  source: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Low-level emit
// ────────────────────────────────────────────────────────────────────────────

type GtagFn = (
  command: 'event',
  eventName: string,
  params: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

function emit<T extends object>(eventName: string, params: T): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params as unknown as Record<string, unknown>);
  } catch {
    // GA failures must never break the dashboard.
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Public helpers — one per event
// ────────────────────────────────────────────────────────────────────────────

export function trackDashboardLoad(p: DashboardLoadEvent): void {
  emit('dashboard_load', p);
}

export function trackBlockerAcknowledged(p: DashboardBlockerAcknowledgedEvent): void {
  emit('dashboard_blocker_acknowledged', p);
}

export function trackViewChange(p: DashboardViewChangeEvent): void {
  emit('dashboard_view_change', p);
}

export function trackFilterApply(p: DashboardFilterApplyEvent): void {
  emit('dashboard_filter_apply', p);
}

/**
 * Stub helper — Kanban drag-to-update isn't yet implemented (the Wave 1
 * Kanban port is a status-only surface). When drag lands in a follow-up,
 * call this from the drop handler. Shipped now so the taxonomy is
 * complete and the call site doesn't need to import a new helper later.
 */
export function trackKanbanDrag(p: DashboardKanbanDragEvent): void {
  emit('dashboard_kanban_drag', p);
}

export function trackKnowledgeOpen(p: DashboardKnowledgeOpenEvent): void {
  emit('dashboard_knowledge_open', p);
}

export function trackExternalLink(p: DashboardExternalLinkEvent): void {
  emit('dashboard_external_link', p);
}

export function trackSyncWarningShown(p: DashboardSyncWarningShownEvent): void {
  emit('dashboard_sync_warning_shown', p);
}

// ────────────────────────────────────────────────────────────────────────────
// Session-relative time helper — for `time_since_load_ms` on the
// `dashboard_blocker_acknowledged` event (TTC measurement).
//
// Anchored at module load (which on the client = roughly first paint, since
// the layout's analytics shell hydrates before any AlertsBanner click is
// possible). Not perfectly accurate against the navigation entry's first
// paint timestamp, but within ±100ms in practice and far simpler than a
// PerformanceObserver dance.
// ────────────────────────────────────────────────────────────────────────────

const DASHBOARD_LOAD_ANCHOR_MS =
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : 0;

export function timeSinceLoadMs(): number {
  if (typeof performance === 'undefined' || typeof performance.now !== 'function') return 0;
  return Math.max(0, Math.round(performance.now() - DASHBOARD_LOAD_ANCHOR_MS));
}
