'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { trackSearchQuerySubmitted, type SearchSource } from '@/lib/search-analytics';
import { openSearchPalette } from '@/lib/search-palette-config';

const VARIANT_SOURCE: Record<'compact' | 'full' | 'expandable', SearchSource> = {
  compact: 'compact',
  full: 'mobile',
  expandable: 'nav',
};

export interface SearchInputProps {
  /**
   * Visible variant.
   * - `compact`: icon-only button + sr-only input (legacy fallback).
   * - `full`: visible pill with the input always rendered (mobile drawer).
   * - `expandable`: collapsed icon by default; click or ⌘K expands to a pill
   *   input. Auto-collapses on blur when empty. Used in the desktop nav so
   *   the search field doesn't compete with primary nav links for space.
   */
  variant?: 'compact' | 'full' | 'expandable';
  /** Optional className applied to the root element. */
  className?: string;
}

export function SearchInput({ variant = 'full', className = '' }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryFromURL = searchParams.get('q') ?? '';

  // Icon-trigger variants (desktop header / legacy compact) open the ⌘K
  // palette, which owns the global hotkey and the instant-search UI. The
  // visible 'full' pill (mobile drawer) stays a typeable, no-JS-friendly
  // fallback that navigates to the server-rendered /search page.
  if (variant === 'compact' || variant === 'expandable') {
    return (
      <button
        type="button"
        onClick={() => openSearchPalette()}
        aria-label="Open search"
        className={`${className} inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full px-2 text-[var(--color-neutral-700)] transition hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] dark:text-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)]`}
      >
        <Search className="h-5 w-5" aria-hidden="true" />
        {variant === 'expandable' && (
          <kbd className="pointer-events-none hidden select-none rounded border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-neutral-600)] lg:inline-block dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]">
            ⌘K
          </kbd>
        )}
      </button>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = inputRef.current?.value.trim() ?? '';
    if (!trimmed) return;
    trackSearchQuerySubmitted({
      query_length: trimmed.length,
      source: VARIANT_SOURCE[variant],
    });
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={className} role="search" aria-label="Site search">
      <label className="sr-only" htmlFor="site-search-input">
        Search
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-500)]"
          aria-hidden="true"
        />
        <input
          key={queryFromURL}
          ref={inputRef}
          id="site-search-input"
          type="search"
          name="q"
          defaultValue={queryFromURL}
          placeholder="Search…"
          className="w-full rounded-full border border-[var(--color-neutral-300)] bg-[var(--color-neutral-0)] py-1.5 pl-9 pr-4 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-500)] focus-visible:border-[var(--color-brand-indigo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)] dark:placeholder:text-[var(--color-neutral-400)]"
        />
      </div>
    </form>
  );
}
