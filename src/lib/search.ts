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
  /**
   * Resolved destination URL — `entry.url` deep-linked to the matched section's
   * heading anchor when the entry has sections and a token lands inside one.
   */
  url: string;
}

const TITLE_WEIGHT = 12;
const TAG_WEIGHT = 6;
const DESCRIPTION_WEIGHT = 4;
const BODY_WEIGHT = 1;
const TOKEN_BONUS = 0.5;

/** Fuzzy (typo) matches earn a fraction of the field weight so exact hits always win. */
const FUZZY_FACTOR = 0.4;
/** Tokens shorter than this never fuzzy-match — too noisy (e.g. 'soc' ~ 'cpu'). */
const FUZZY_MIN_LEN = 4;

/**
 * Tokenize a query into searchable tokens. Quoted "phrases" are preserved as a
 * single token (kept contiguous, space included) so phrase search works via the
 * same substring path. Everything else splits on whitespace / common separators.
 */
function tokenize(query: string): string[] {
  const tokens: string[] = [];
  const phraseRe = /"([^"]+)"/g;
  for (const match of query.matchAll(phraseRe)) {
    const phrase = match[1].trim().toLowerCase();
    if (phrase.length > 0) tokens.push(phrase);
  }
  // Strip quoted segments before splitting the remainder into bare tokens.
  const rest = query.replace(phraseRe, ' ');
  for (const t of rest.toLowerCase().split(/[\s,;|]+/)) {
    const trimmed = t.trim();
    if (trimmed.length > 0) tokens.push(trimmed);
  }
  return tokens;
}

/** A token is a phrase when it contains an internal space (came from quotes). */
function isPhrase(token: string): boolean {
  return token.includes(' ');
}

/**
 * Levenshtein edit distance with an early-exit cap. Returns a number > max as
 * soon as the distance is known to exceed `max` (keeps fuzzy matching cheap).
 */
function boundedLevenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;
  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1; // whole row exceeds the cap — bail out.
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Max edit distance allowed for a token of a given length. */
function fuzzyCap(token: string): number {
  return token.length <= 5 ? 1 : 2;
}

/**
 * Does any word in `field` fuzzily match `token` within its allowed cap?
 * Used only as a fallback when the token has no exact substring hit.
 */
function fuzzyFieldMatch(field: string, token: string): boolean {
  if (token.length < FUZZY_MIN_LEN || isPhrase(token)) return false;
  const cap = fuzzyCap(token);
  for (const word of field.split(/[^a-z0-9]+/)) {
    if (word.length === 0) continue;
    if (boundedLevenshtein(word, token, cap) <= cap) return true;
  }
  return false;
}

/**
 * Quality multiplier applied to an entry's raw score. Flagship case studies and
 * more-recent framework versions get a modest lift so they break ties upward
 * without overriding strong textual relevance.
 */
function qualityBoost(entry: SearchEntry): number {
  let boost = 1;
  if (entry.tags.tier === 'flagship') boost += 0.15;
  const version = entry.tags.version;
  if (version) {
    const major = Number(version.split('.')[0]);
    const minor = Number(version.split('.')[1] ?? 0);
    if (Number.isFinite(major)) {
      // Normalize roughly to v5..v8 → +0.0..+0.06; newer ranks above older.
      boost += Math.max(0, Math.min(0.06, ((major - 5) * 10 + minor) / 500));
    }
  }
  return boost;
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

    let tokenScore =
      titleHits * TITLE_WEIGHT +
      tagHits * TAG_WEIGHT +
      descHits * DESCRIPTION_WEIGHT +
      bodyHits * BODY_WEIGHT;

    // Fuzzy fallback: only when the token had no exact hit anywhere. Awards a
    // fraction of the best matching field's weight so a typo still surfaces the
    // entry but always ranks below an exact match.
    if (tokenScore === 0) {
      let fuzzyWeight = 0;
      if (fuzzyFieldMatch(title, token)) fuzzyWeight = TITLE_WEIGHT;
      else if (fuzzyFieldMatch(tagBag, token)) fuzzyWeight = TAG_WEIGHT;
      else if (fuzzyFieldMatch(description, token)) fuzzyWeight = DESCRIPTION_WEIGHT;
      else if (fuzzyFieldMatch(body, token)) fuzzyWeight = BODY_WEIGHT;
      tokenScore = fuzzyWeight * FUZZY_FACTOR;
    }

    if (tokenScore > 0) {
      score += tokenScore + TOKEN_BONUS;
      matched.push(token);
    }
  }

  // Bonus for matching every requested token (boosts AND-style relevance).
  if (matched.length === tokens.length) {
    score *= 1.25;
  }

  // Quality lift (flagship tier + recency) — modest, applied last.
  score *= qualityBoost(entry);

  return { score, matched };
}

/** Append a heading anchor only when the URL has none already (glossary/research carry their own). */
function appendAnchor(url: string, anchor: string): string {
  if (!anchor || url.includes('#')) return url;
  return `${url}#${anchor}`;
}

/**
 * Deep-link to the first section whose cleaned body contains a matched token.
 * Falls back to the entry's top-level URL when there are no sections or no
 * exact in-section match (e.g. fuzzy-only or preamble matches).
 */
function resolveUrl(entry: SearchEntry, matched: string[]): string {
  if (!entry.sections || entry.sections.length === 0 || matched.length === 0) {
    return entry.url;
  }
  for (const section of entry.sections) {
    const hay = section.body.toLowerCase();
    if (matched.some((token) => hay.includes(token))) {
      return appendAnchor(entry.url, section.anchor);
    }
  }
  return entry.url;
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
      url: entry.url,
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
      url: resolveUrl(entry, matched),
    });
  }

  hits.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return hits.slice(0, limit);
}
