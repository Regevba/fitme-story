/**
 * GA4 event helpers for site-wide search (the /search route + the ⌘K input).
 *
 * Per CLAUDE.md "Analytics Naming Convention": every screen-scoped event uses
 * the `search_` prefix. Events declared here should also appear in the FT2
 * `docs/product/analytics-taxonomy.csv` with screen_scope=search.
 *
 * Every helper is a no-op when:
 *   - rendered on the server (typeof window === 'undefined')
 *   - window.gtag is unavailable (NEXT_PUBLIC_GA_ID unset, or GA blocked)
 *
 * Cousin files: src/lib/design-system-analytics.ts and
 * src/lib/control-room/analytics.ts (same gtag-wrapper + debug-mirror tee).
 *
 * Verification (post-deploy operator workflow):
 *   1. Deploy preview
 *   2. Open GA4 Real-Time DebugView (admin → DebugView)
 *   3. Visit /search?q=… on the preview URL with `?gtm_debug=x`
 *   4. Confirm the events fire on submit / results render / result click
 */

import { teeToDebugMirror } from './analytics-debug-mirror';

interface GtagWindow extends Window {
  gtag?: (command: 'event', eventName: string, params: Record<string, unknown>) => void;
}

function emit(eventName: string, params: object): void {
  if (typeof window === 'undefined') return;
  const gw = window as GtagWindow;
  if (typeof gw.gtag !== 'function') return;
  try {
    gw.gtag('event', eventName, params as Record<string, unknown>);
  } catch {
    // A throwing gtag (privacy shim, broken tag) must never break the UI.
    return;
  }
  // Also tee to the local mirror when NEXT_PUBLIC_DEBUG_ANALYTICS=1 (no-op otherwise).
  teeToDebugMirror(eventName, params);
}

/** Where the query was submitted from — maps to SearchInput's variant. */
export type SearchSource = 'nav' | 'mobile' | 'compact';

export interface SearchQuerySubmittedEvent {
  /** Length of the trimmed query — never the query text itself (PII-safe). */
  query_length: number;
  source: SearchSource;
}

export interface SearchResultsViewedEvent {
  query_length: number;
  result_count: number;
  has_filters: boolean;
}

export interface SearchZeroResultsEvent {
  query_length: number;
  has_filters: boolean;
}

export interface SearchResultClickedEvent {
  result_category: string;
  /** 0-based rank of the clicked result within the list. */
  result_rank: number;
  query_length: number;
}

/** Fired when a user submits a query from any search input. */
export function trackSearchQuerySubmitted(payload: SearchQuerySubmittedEvent): void {
  emit('search_query_submitted', payload);
}

/** Fired once when a results page renders with at least one hit. */
export function trackSearchResultsViewed(payload: SearchResultsViewedEvent): void {
  emit('search_results_viewed', payload);
}

/** Fired once when a query returns no hits (dedicated event for funnels/alerts). */
export function trackSearchZeroResults(payload: SearchZeroResultsEvent): void {
  emit('search_zero_results', payload);
}

/** Fired when a user clicks through to a result. */
export function trackSearchResultClicked(payload: SearchResultClickedEvent): void {
  emit('search_result_clicked', payload);
}
