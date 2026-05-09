'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

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

  // Expanded only matters for variant === 'expandable'. If the URL already
  // has a query (e.g. user landed on /search?q=foo), start expanded so they
  // can edit it.
  const [expanded, setExpanded] = useState(
    variant === 'expandable' && queryFromURL !== '',
  );

  // ⌘K / Ctrl+K hotkey: focus this input from anywhere on the site. For the
  // expandable variant this also expands the collapsed icon-only state.
  useEffect(() => {
    function handleHotkey(event: KeyboardEvent) {
      const isCmd = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isCmd) return;
      event.preventDefault();
      if (variant === 'expandable') {
        setExpanded(true);
      }
      // Wait one frame so the input is in the DOM if we just expanded.
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [variant]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = inputRef.current?.value.trim() ?? '';
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={className} role="search" aria-label="Site search">
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="rounded-full p-2 text-[var(--color-neutral-600)] transition hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] dark:text-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)] dark:hover:text-[var(--color-neutral-50)]"
          aria-label="Search"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
        <input
          key={queryFromURL}
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={queryFromURL}
          aria-label="Search query"
          className="sr-only"
        />
      </form>
    );
  }

  if (variant === 'expandable' && !expanded) {
    return (
      <button
        type="button"
        onClick={() => {
          setExpanded(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        aria-label="Open search"
        aria-expanded={false}
        className={`${className} inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-[var(--color-neutral-700)] transition hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] dark:text-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)]`}
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  // 'full' OR ('expandable' && expanded) — same visible pill.
  function handleBlur() {
    if (variant !== 'expandable') return;
    if ((inputRef.current?.value.trim() ?? '') === '') {
      setExpanded(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (variant === 'expandable' && event.key === 'Escape') {
      event.currentTarget.blur();
      setExpanded(false);
    }
  }

  // Expandable variant supplies its own width. Uses larger breakpoints so
  // the open pill feels generous on full-width chrome (no longer constrained
  // by the prior max-w-6xl wrapper).
  const formClass =
    variant === 'expandable'
      ? `${className} w-72 md:w-96 lg:w-[28rem] xl:w-[32rem]`
      : className;

  return (
    <form onSubmit={handleSubmit} className={formClass} role="search" aria-label="Site search">
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
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full border border-[var(--color-neutral-300)] bg-[var(--color-neutral-0)] py-1.5 pl-9 pr-12 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-500)] focus-visible:border-[var(--color-brand-indigo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)] dark:placeholder:text-[var(--color-neutral-400)]"
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-neutral-600)] sm:inline-block dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]"
        >
          ⌘K
        </kbd>
      </div>
    </form>
  );
}
