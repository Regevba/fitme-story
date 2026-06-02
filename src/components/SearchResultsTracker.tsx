'use client';

import { useEffect } from 'react';
import {
  trackSearchResultsViewed,
  trackSearchZeroResults,
} from '@/lib/search-analytics';

interface SearchResultsTrackerProps {
  query: string;
  resultCount: number;
  hasFilters: boolean;
}

/**
 * Invisible client island that fires a GA4 event once when a /search results
 * view renders for a non-empty query. Emits `search_zero_results` when the
 * query matched nothing, otherwise `search_results_viewed`. Browsing with an
 * empty query (filter-only navigation) intentionally fires nothing.
 *
 * The /search page re-mounts on every navigation, so the effect runs exactly
 * once per distinct results render — no manual dedup needed.
 */
export function SearchResultsTracker({
  query,
  resultCount,
  hasFilters,
}: SearchResultsTrackerProps) {
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    if (resultCount === 0) {
      trackSearchZeroResults({ query_length: trimmed.length, has_filters: hasFilters });
    } else {
      trackSearchResultsViewed({
        query_length: trimmed.length,
        result_count: resultCount,
        has_filters: hasFilters,
      });
    }
  }, [query, resultCount, hasFilters]);

  return null;
}
