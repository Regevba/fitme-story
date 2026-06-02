'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft } from 'lucide-react';
import MiniSearch from 'minisearch';
import {
  MINISEARCH_OPTIONS,
  PALETTE_SEARCH_OPTIONS,
  SEARCH_INDEX_URL,
  OPEN_PALETTE_EVENT,
  type StoredDoc,
} from '@/lib/search-palette-config';
import {
  trackSearchPaletteOpened,
  trackSearchQuerySubmitted,
  trackSearchResultClicked,
} from '@/lib/search-analytics';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface PaletteResult extends StoredDoc {
  id: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  'case-study': 'Case Study',
  glossary: 'Glossary',
  research: 'Research',
  framework: 'Framework',
};

const MAX_RESULTS = 8;

/**
 * ⌘K instant-search palette. A progressive enhancement layered over the
 * server-rendered /search page: opens on ⌘K (or the {@link OPEN_PALETTE_EVENT}
 * dispatched by the header search affordance), lazy-loads the prebuilt
 * MiniSearch index on first open, and runs fuzzy/prefix search in-browser.
 * "See all results" and the no-JS fallback both route to /search.
 */
export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [mini, setMini] = useState<MiniSearch | null>(null);
  const loadStartedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load the prebuilt index exactly once, kicked off by the open action
  // (a user event) rather than an effect — keeps setState out of effect bodies.
  const loadIndex = useCallback(async () => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    setStatus('loading');
    try {
      const res = await fetch(SEARCH_INDEX_URL, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`index fetch ${res.status}`);
      const data = (await res.json()) as { index: unknown; count: number };
      setMini(MiniSearch.loadJSON(JSON.stringify(data.index), MINISEARCH_OPTIONS));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  const openPalette = useCallback(
    (trigger: 'hotkey' | 'click') => {
      setOpen(true);
      trackSearchPaletteOpened({ trigger });
      void loadIndex();
    },
    [loadIndex],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  // Derive results during render (no effect) so the lint rule against
  // setState-in-effect is satisfied and there's no extra render pass.
  const results = useMemo<PaletteResult[]>(() => {
    if (!mini) return [];
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];
    return mini
      .search(trimmed, PALETTE_SEARCH_OPTIONS)
      .slice(0, MAX_RESULTS)
      .map((h) => ({
        id: h.id as number,
        title: h.title as string,
        url: h.url as string,
        category: h.category as string,
        version: (h.version as string | null) ?? null,
        tier: (h.tier as string | null) ?? null,
        description: h.description as string,
      }));
  }, [query, mini]);

  // Global ⌘K + external open-event listeners.
  useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette('hotkey');
      }
    }
    function onOpenEvent() {
      openPalette('click');
    }
    window.addEventListener('keydown', onKeydown);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    };
  }, [openPalette]);

  // Focus the input + lock body scroll while open. (No setState here.)
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const onQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(0);
  }, []);

  const goToAllResults = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    trackSearchQuerySubmitted({ query_length: trimmed.length, source: 'palette' });
    close();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, router, close]);

  const select = useCallback(
    (result: PaletteResult, rank: number) => {
      trackSearchResultClicked({
        result_category: result.category,
        result_rank: rank,
        query_length: query.trim().length,
      });
      close();
      if (/^https?:\/\//.test(result.url)) {
        window.location.href = result.url;
      } else {
        router.push(result.url);
      }
    },
    [query, router, close],
  );

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = results[activeIndex];
      if (active) select(active, activeIndex);
      else goToAllResults();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={close}
        className="absolute inset-0 cursor-default bg-[color-mix(in_srgb,var(--color-neutral-950)_55%,transparent)] backdrop-blur-sm"
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-0)] shadow-2xl dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-neutral-200)] px-3 dark:border-[var(--color-neutral-800)]">
          <Search className="h-4 w-4 shrink-0 text-[var(--color-neutral-500)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search case studies, glossary, research, docs…"
            aria-label="Search query"
            className="w-full bg-transparent py-3 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-500)] focus:outline-none dark:text-[var(--color-neutral-50)]"
          />
          <kbd className="hidden shrink-0 rounded border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-neutral-600)] sm:inline-block dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]">
            Esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {status === 'loading' && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-neutral-500)]">Loading search…</p>
          )}
          {status === 'error' && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-neutral-500)]">
              Couldn’t load instant search.{' '}
              <button type="button" onClick={goToAllResults} className="underline">
                Use full search
              </button>{' '}
              instead.
            </p>
          )}
          {status === 'ready' && query.trim() !== '' && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-neutral-500)]">
              No quick matches.{' '}
              <button type="button" onClick={goToAllResults} className="underline">
                Search everything
              </button>
              .
            </p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-[var(--color-neutral-100)] py-1 dark:divide-[var(--color-neutral-800)]">
              {results.map((result, index) => {
                const active = index === activeIndex;
                return (
                  <li key={`${result.category}:${result.id}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(result, index)}
                      aria-current={active}
                      className={`flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left transition ${
                        active
                          ? 'border-[var(--color-brand-indigo)] bg-[var(--color-neutral-100)] dark:bg-[color-mix(in_srgb,var(--color-brand-indigo)_24%,transparent)]'
                          : 'border-transparent'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
                          {result.title}
                        </span>
                        <span className="block truncate text-xs text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                          {result.description || result.url}
                        </span>
                      </span>
                      <span className="shrink-0 rounded border border-[var(--color-neutral-300)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-neutral-600)] dark:border-[var(--color-neutral-700)] dark:text-[var(--color-neutral-400)]">
                        {CATEGORY_LABEL[result.category] ?? result.category}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {query.trim() !== '' && (
          <button
            type="button"
            onClick={goToAllResults}
            className="flex w-full items-center justify-between border-t border-[var(--color-neutral-200)] px-4 py-2.5 text-xs text-[var(--color-neutral-600)] transition hover:bg-[var(--color-neutral-50)] dark:border-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)]"
          >
            <span>
              See all results for <span className="font-medium">“{query.trim()}”</span>
            </span>
            <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
