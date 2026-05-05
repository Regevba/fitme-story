'use client';

/**
 * Control-room ThemeToggle — TypeScript port of dashboard/src/components/ThemeToggle.jsx
 *
 * UCC task T24. Toggles a `dark` class on <html> and persists the choice in
 * localStorage('theme'). Falls back to the OS `prefers-color-scheme` query.
 *
 * Layout note: layout.tsx currently relies on system-pref dark mode (no
 * explicit toggle). This component is shipped for parity with the source
 * dashboard so any future page/header that wants an explicit toggle can use
 * it without re-porting. Wiring into layout.tsx is intentionally deferred.
 *
 * Reactivity: subscribes via `useSyncExternalStore` to (a) storage events
 * (so other tabs stay in sync) and (b) the `prefers-color-scheme` media
 * query (so the OS-level toggle is reflected when the user has not yet
 * picked an explicit theme). The DOM class on `<html>` is mirrored from
 * the snapshot inside an effect — no setState in effect.
 *
 * SSR snapshot is `false` (light mode); first client paint reconciles to
 * the persisted/system value. There may be a brief light → dark flash if
 * a returning user has the dark theme stored. The fix for that flash is
 * a blocking <script> in <head> (out of scope for this task).
 *
 * Source: dashboard/src/components/ThemeToggle.jsx (38 lines)
 */

import { useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';
const STORAGE_EVENT = 'storage';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function subscribeToTheme(callback: () => void) {
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

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    // storage events don't fire in the originating window; broadcast manually
    // so useSyncExternalStore re-reads the snapshot.
    window.dispatchEvent(new StorageEvent(STORAGE_EVENT, { key: STORAGE_KEY }));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 transition-colors hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-[var(--color-neutral-700)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}
