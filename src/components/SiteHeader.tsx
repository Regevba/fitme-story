'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useSyncExternalStore } from 'react';
import { Lock, Moon, Sun } from 'lucide-react';
import { NAV, isCurrentNav } from '@/lib/nav';
import { MobileNav } from './MobileNav';
import { SearchInput } from './SearchInput';

const STORAGE_KEY = 'fitme-story-theme';
const STORAGE_EVENT = 'storage';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

// `useSyncExternalStore`-backed dark-mode read so we don't trip React 19's
// `react-hooks/set-state-in-effect` rule. Same pattern as the control-room
// ThemeToggle. Subscribes to localStorage cross-tab updates + the OS
// prefers-color-scheme media query.

function subscribeToTheme(callback: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, callback);
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener('change', callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    mq.removeEventListener('change', callback);
  };
}

function getThemeSnapshot(): boolean {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

function getThemeServerSnapshot(): boolean {
  return false;
}

export function SiteHeader() {
  const pathname = usePathname();
  const dark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  // DOM-mirror only — no setState in effect, satisfies the lint rule.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    // storage events don't fire in the originating tab; broadcast manually
    // so useSyncExternalStore re-reads the snapshot.
    window.dispatchEvent(new StorageEvent(STORAGE_EVENT, { key: STORAGE_KEY }));
  };

  return (
    <header className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between font-sans">
        <Link
          href="/"
          className="font-semibold tracking-tight inline-flex items-center min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:rounded"
        >
          fitme<span className="text-[var(--color-brand-indigo)]">·</span>story
        </Link>
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary navigation">
            {NAV.map((item) => {
              const current = !item.gated && isCurrentNav(pathname, item.href);
              const baseLink =
                'inline-flex items-center min-h-[44px] hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:rounded';
              const currentClasses = current
                ? ' text-[var(--color-brand-indigo)] border-b-2 border-[var(--color-brand-indigo)]'
                : '';

              return item.gated ? (
                // Gated routes use a plain <a> with target="_blank" + rel,
                // NOT next/link. Two reasons:
                //   1. next/link auto-prefetches `/control-room` on viewport
                //      visibility, which fires a background 401 from proxy.ts
                //      that some browsers surface as an unexpected auth
                //      dialog before the user has clicked anything.
                //   2. Opening the auth flow in a NEW tab means cancelling
                //      the basic-auth dialog just closes the tab — the
                //      visitor stays on the showcase tab they came from
                //      instead of being stranded on a 401 error page.
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener"
                  className={`${baseLink} gap-1.5`}
                  title="Gated: requires operator credentials. Opens in a new tab."
                >
                  {item.label}
                  <Lock size={12} className="opacity-60" aria-label="gated" />
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  className={`${baseLink}${currentClasses}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {/* Trailing icon cluster — visually distinct from the nav links so
              the bar reads as two groups (links | tools) instead of one
              evenly-dispersed strip. */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop search: collapsed icon-only by default; click or ⌘K to
                expand into the pill input. Saves nav-bar width and matches
                the GitHub/Linear pattern. MobileNav drawer keeps the
                always-visible pill so the field is one-tap away on small
                screens. Wrapped in <Suspense> because SearchInput calls
                useSearchParams(), which would otherwise CSR-bailout on
                prerender of /_not-found (per Next.js
                missing-suspense-with-csr-bailout). */}
            <Suspense fallback={<div className="hidden md:block h-11 w-11" aria-hidden="true" />}>
              <SearchInput variant="expandable" className="hidden md:inline-flex" />
            </Suspense>
            {/* Desktop theme toggle: hidden on mobile (MobileNav drawer has
                its own copy so the toggle stays one-tap-away on every
                viewport). Audit P-MOBNAV (2026-05-08). */}
            <button
              onClick={toggle}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={dark}
              className="hidden md:inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <MobileNav dark={dark} onToggleTheme={toggle} />
          </div>
        </div>
      </div>
    </header>
  );
}
