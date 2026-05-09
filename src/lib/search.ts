import type { SearchCategory, SearchEntry } from './search-index';

export interface SearchFilters {
  category?: SearchCategory;
  version?: string;
  tier?: string;
  glossaryCategory?: string;
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  /** Indices of matched query tokens within title/body for highlighting. */
  matchedTokens: string[];
  /** Body excerpt around the first body match (≤ 240 chars). */
  snippet: string;
}

const TITLE_WEIGHT = 12;
const TAG_WEIGHT = 6;
const DESCRIPTION_WEIGHT = 4;
const BODY_WEIGHT = 1;
const TOKEN_BONUS = 0.5;

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,;|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    const found = haystack.indexOf(needle, idx);
    if (found === -1) break;
    count++;
    idx = found + needle.length;
  }
  return count;
}

function buildSnippet(body: string, token: string): string {
  if (!token || !body) return '';
  const lowered = body.toLowerCase();
  const idx = lowered.indexOf(token);
  if (idx === -1) return body.slice(0, 220) + (body.length > 220 ? '…' : '');
  const start = Math.max(0, idx - 60);
  const end = Math.min(body.length, idx + token.length + 160);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < body.length ? '…' : '';
  return prefix + body.slice(start, end) + suffix;
}

function applyFilters(entries: SearchEntry[], filters: SearchFilters): SearchEntry[] {
  return entries.filter((entry) => {
    if (filters.category && entry.category !== filters.category) return false;
    if (filters.version && entry.tags.version !== filters.version) return false;
    if (filters.tier && entry.tags.tier !== filters.tier) return false;
    if (filters.glossaryCategory && entry.tags.glossary_category !== filters.glossaryCategory) {
      return false;
    }
    return true;
  });
}

function scoreEntry(entry: SearchEntry, tokens: string[]): { score: number; matched: string[] } {
  if (tokens.length === 0) return { score: 0, matched: [] };

  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const body = entry.body.toLowerCase();
  const tagBag = [
    entry.tags.version,
    entry.tags.work_type,
    entry.tags.era,
    entry.tags.tier,
    entry.tags.glossary_category,
    ...(entry.tags.persona ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  const matched: string[] = [];

  for (const token of tokens) {
    const titleHits = countOccurrences(title, token);
    const tagHits = countOccurrences(tagBag, token);
    const descHits = countOccurrences(description, token);
    const bodyHits = countOccurrences(body, token);

    const tokenScore =
      titleHits * TITLE_WEIGHT +
      tagHits * TAG_WEIGHT +
      descHits * DESCRIPTION_WEIGHT +
      bodyHits * BODY_WEIGHT;

    if (tokenScore > 0) {
      score += tokenScore + TOKEN_BONUS;
      matched.push(token);
    }
  }

  // Bonus for matching every requested token (boosts AND-style relevance).
  if (matched.length === tokens.length) {
    score *= 1.25;
  }

  return { score, matched };
}

export function search(
  entries: SearchEntry[],
  query: string,
  filters: SearchFilters = {},
  limit = 50,
): SearchHit[] {
  const filtered = applyFilters(entries, filters);
  const tokens = tokenize(query);

  if (tokens.length === 0) {
    // Empty query: return filtered list in stable order (case studies first by version).
    return filtered.slice(0, limit).map((entry) => ({
      entry,
      score: 0,
      matchedTokens: [],
      snippet: entry.description,
    }));
  }

  const hits: SearchHit[] = [];
  for (const entry of filtered) {
    const { score, matched } = scoreEntry(entry, tokens);
    if (score === 0) continue;
    const firstMatch = matched[0] ?? '';
    hits.push({
      entry,
      score,
      matchedTokens: matched,
      snippet: buildSnippet(entry.body || entry.description, firstMatch),
    });
  }

  hits.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return hits.slice(0, limit);
}
