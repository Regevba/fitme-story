'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export interface SearchInputProps {
  /** Visible variant. Compact = icon only (mobile / hamburger), full = input row. */
  variant?: 'compact' | 'full';
  /** Optional className applied to the root form element. */
  className?: string;
}

export function SearchInput({ variant = 'full', className = '' }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Read query param on every render (no state needed). The input is uncontrolled;
  // we use `key` to remount the input whenever the URL's `q` changes so it resets.
  const queryFromURL = searchParams.get('q') ?? '';

  // ⌘K / Ctrl+K hotkey: focus this input from anywhere on the site.
  useEffect(() => {
    function handleHotkey(event: KeyboardEvent) {
      const isMacCmd = event.metaKey && event.key.toLowerCase() === 'k';
      const isCtrlCmd = event.ctrlKey && event.key.toLowerCase() === 'k';
      if (isMacCmd || isCtrlCmd) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, []);

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
          className="rounded-md p-2 text-[var(--color-neutral-600)] transition hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] dark:text-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)] dark:hover:text-[var(--color-neutral-50)]"
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
          className="w-full rounded-md border border-[var(--color-neutral-300)] bg-[var(--color-neutral-0)] py-1.5 pl-9 pr-12 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-500)] focus-visible:border-[var(--color-brand-indigo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-indigo)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)] dark:placeholder:text-[var(--color-neutral-400)]"
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
