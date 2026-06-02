/**
 * Isomorphic config shared by the build-time index generator
 * (scripts/build-search-index.ts) and the client ⌘K palette
 * (src/components/SearchPalette.tsx).
 *
 * MUST stay free of node-only imports (fs, gray-matter, github-slugger) so the
 * client bundle can import it. The MiniSearch *options* must be identical on
 * both sides — MiniSearch.loadJSON() requires the same `fields`/`idField` the
 * index was built with.
 */

/** Fields stored in the serialized index and returned on each search result. */
export interface StoredDoc {
  title: string;
  url: string;
  category: string;
  version: string | null;
  tier: string | null;
  description: string;
}

/** Constructor options — must match between build and client load. */
export const MINISEARCH_OPTIONS = {
  idField: 'docId',
  fields: ['title', 'description', 'body', 'tagText'],
  storeFields: ['title', 'url', 'category', 'version', 'tier', 'description'],
};

/** Per-query search options: prefix + light fuzzy, title-weighted. */
export const PALETTE_SEARCH_OPTIONS = {
  boost: { title: 4, tagText: 2, description: 1.5 },
  prefix: true,
  fuzzy: 0.2,
};

/** Public URL of the prebuilt index emitted into /public at build time. */
export const SEARCH_INDEX_URL = '/search-index.json';

/** Window CustomEvent name used to open the palette from anywhere. */
export const OPEN_PALETTE_EVENT = 'fitme:open-search-palette';

/** Dispatch the open-palette event (client-only; no-op on the server). */
export function openSearchPalette(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}
