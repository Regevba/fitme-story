import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { buildMetadata, searchResultsPageJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { getSearchIndex, getSearchIndexFacets, type SearchCategory } from '@/lib/search-index';
import { search, type SearchFilters, type SearchHit } from '@/lib/search';
import { Tag } from '@/components/ui/Tag';

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  'case-study': 'Case Study',
  glossary: 'Glossary',
  research: 'Research',
  framework: 'Framework',
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    version?: string;
    tier?: string;
    glossary_category?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = (params.q ?? '').trim();

  // Dynamic title makes the browser tab + bookmarks + share-cards
  // informative ("Results for 'readiness'" vs static "Search").
  const title = query ? `Results for "${query}"` : 'Search';
  const description = query
    ? `Search results for "${query}" across case studies, the glossary, research notes, and the framework dev guide.`
    : 'Search across case studies, the glossary, research notes, and the framework dev guide.';

  const meta = buildMetadata({
    title,
    description,
    slug: 'search',
    type: 'website',
  });

  // SEO best practice (Google Search Central): dynamic search-results
  // pages should be noindex to avoid duplicate-content penalties and
  // to keep the SERP clean. The base /search route (no query) stays
  // indexable so users can land on it from sitelinks.
  if (query) {
    meta.robots = { index: false, follow: true };
  }

  return meta;
}

function isCategory(value: string | undefined): value is SearchCategory {
  return value === 'case-study' || value === 'glossary' || value === 'research' || value === 'framework';
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? '').trim();
  const filters: SearchFilters = {
    category: isCategory(params.category) ? params.category : undefined,
    version: params.version,
    tier: params.tier,
    glossaryCategory: params.glossary_category,
  };

  const index = await getSearchIndex();
  const facets = getSearchIndexFacets(index);
  const hits = search(index, query, filters, 100);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={searchResultsPageJsonLd(query || undefined, query ? hits.length : undefined)} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
          Search
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-300)]">
          Across {index.length} case studies, glossary terms, research notes, and framework docs.
          Try the ⌘K shortcut from anywhere on the site.
        </p>
      </header>

      <SearchSummary query={query} filters={filters} hitCount={hits.length} />

      <FilterBar facets={facets} active={filters} query={query} />

      <ResultsList hits={hits} query={query} />
    </main>
  );
}

function SearchSummary({
  query,
  filters,
  hitCount,
}: {
  query: string;
  filters: SearchFilters;
  hitCount: number;
}) {
  const filterDescriptors: string[] = [];
  if (filters.category) filterDescriptors.push(`category=${filters.category}`);
  if (filters.version) filterDescriptors.push(`version=${filters.version}`);
  if (filters.tier) filterDescriptors.push(`tier=${filters.tier}`);
  if (filters.glossaryCategory) filterDescriptors.push(`glossary=${filters.glossaryCategory}`);

  const hasFilters = filterDescriptors.length > 0;

  return (
    <div className="mb-4 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
      {query ? (
        <>
          <strong className="text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
            {hitCount}
          </strong>{' '}
          {hitCount === 1 ? 'result' : 'results'} for{' '}
          <strong className="text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
            “{query}”
          </strong>
          {hasFilters && <> · filters: {filterDescriptors.join(', ')}</>}
        </>
      ) : (
        <>Browse all {hitCount} entries{hasFilters && <> matching {filterDescriptors.join(', ')}</>}.</>
      )}
    </div>
  );
}

function FilterBar({
  facets,
  active,
  query,
}: {
  facets: ReturnType<typeof getSearchIndexFacets>;
  active: SearchFilters;
  query: string;
}) {
  return (
    <form
      method="get"
      action="/search"
      className="mb-6 flex flex-wrap gap-2 rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]"
    >
      <input type="hidden" name="q" defaultValue={query} />
      <FilterSelect
        name="category"
        label="Type"
        value={active.category ?? ''}
        options={facets.categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
      />
      <FilterSelect
        name="version"
        label="Version"
        value={active.version ?? ''}
        options={facets.versions.map((v) => ({ value: v, label: `v${v}` }))}
      />
      <FilterSelect
        name="tier"
        label="Tier"
        value={active.tier ?? ''}
        options={facets.tiers.map((t) => ({ value: t, label: t }))}
      />
      <FilterSelect
        name="glossary_category"
        label="Glossary cat"
        value={active.glossaryCategory ?? ''}
        options={facets.glossaryCategories.map((c) => ({ value: c, label: c }))}
      />
      <button
        type="submit"
        className="rounded-md bg-[var(--color-brand-indigo)] px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] focus-visible:ring-offset-2"
      >
        Apply
      </button>
      {(active.category || active.version || active.tier || active.glossaryCategory) && (
        <Link
          href={`/search?q=${encodeURIComponent(query)}`}
          className="rounded-md border border-[var(--color-neutral-300)] px-3 py-1.5 text-sm text-[var(--color-neutral-700)] transition hover:bg-[var(--color-neutral-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] dark:border-[var(--color-neutral-600)] dark:text-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)]"
        >
          Clear filters
        </Link>
      )}
    </form>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
}) {
  if (options.length === 0) return null;
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
      <span className="font-medium">{label}</span>
      {/* P1-042 (DS lens audit 2026-05-10): bumped tap target to 44px min-height
          (V-004 lineage) + restored visible focus ring per design system a11y
          requirement. Was: py-1 (~24px) + outline-none. */}
      <select
        name={name}
        defaultValue={value}
        className="min-h-[44px] rounded border border-[var(--color-neutral-300)] bg-[var(--color-neutral-0)] px-2 py-2 text-sm text-[var(--color-neutral-900)] focus-visible:border-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-50)]"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultsList({ hits, query }: { hits: SearchHit[]; query: string }) {
  if (hits.length === 0) {
    return (
      <div className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-6 text-center text-sm text-[var(--color-neutral-700)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-300)]">
        {query ? (
          <>
            No results for <strong>“{query}”</strong>. Try a broader query, remove filters, or
            check the <Link href="/glossary" className="underline">glossary</Link>.
          </>
        ) : (
          <>Type a query above or pick a filter to browse.</>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {hits.map((hit) => (
        <ResultItem key={`${hit.entry.category}:${hit.entry.id}`} hit={hit} />
      ))}
    </ul>
  );
}

/**
 * Wrap each case-insensitive occurrence of a matched query token in <mark>.
 * Longer tokens (quoted phrases) are tried first so a phrase wins over its
 * constituent words. Fuzzy-matched tokens that don't appear verbatim simply
 * don't highlight — which is correct, since there's nothing exact to mark.
 */
function highlight(text: string, tokens: string[]): ReactNode {
  const escaped = tokens
    .filter((t) => t.length > 0)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);
  if (escaped.length === 0 || !text) return text;

  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    nodes.push(
      <mark
        key={`${idx}-${m[0]}`}
        className="rounded-[2px] bg-[color-mix(in_srgb,var(--color-brand-indigo)_18%,transparent)] px-0.5 text-inherit"
      >
        {m[0]}
      </mark>,
    );
    last = idx + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function ResultItem({ hit }: { hit: SearchHit }) {
  const { entry } = hit;
  const snippet = hit.snippet || entry.description;
  return (
    <li className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-0)] p-4 transition hover:border-[var(--color-brand-indigo)] hover:shadow-sm dark:border-[var(--color-neutral-800)] dark:bg-[var(--color-neutral-950)]">
      <Link href={hit.url} className="block focus-visible:outline-none">
        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <h2 className="text-lg font-semibold text-[var(--color-neutral-900)] hover:underline dark:text-[var(--color-neutral-50)]">
            {highlight(entry.title, hit.matchedTokens)}
          </h2>
          <Tag variant="muted">{CATEGORY_LABELS[entry.category]}</Tag>
          {entry.tags.version && <Tag variant="muted">v{entry.tags.version}</Tag>}
          {entry.tags.tier && <Tag variant="muted">{entry.tags.tier}</Tag>}
        </div>
        <p className="text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          {highlight(snippet, hit.matchedTokens)}
        </p>
        <p className="mt-1 font-mono text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
          {hit.url}
        </p>
      </Link>
    </li>
  );
}
