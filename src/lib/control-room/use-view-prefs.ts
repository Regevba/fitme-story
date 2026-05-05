'use client';

/**
 * `useViewPrefs<T>` — UCC task T30 view persistence hook.
 *
 * PRD §15 Q3 = A: persist control-room view state to localStorage so the
 * operator's last sort / filter / column choices survive a page reload.
 * Per-view keys live under `control-room:<viewKey>` (e.g.
 * `control-room:table`, `control-room:tasks`). Cross-tab sync is automatic
 * via the browser `storage` event.
 *
 * `?reset=true` URL param clears the stored value AND replaces the URL so
 * the reset doesn't fire again on subsequent renders. The default value is
 * applied when storage is empty or malformed.
 *
 * Hydration-safe: uses `useSyncExternalStore` with a server snapshot that
 * always returns the default. The first client paint may flicker briefly
 * to the persisted value — acceptable for sort/filter chrome where the
 * data underneath is server-rendered.
 *
 * Lint-safe: avoids the React 19 `react-hooks/set-state-in-effect` rule by
 * mutating localStorage + dispatching a synthetic `storage` event in the
 * setter (the same `useSyncExternalStore` re-read picks up the change).
 *
 * Source: dashboard/src/components/* used inline `useState` per-view; this
 * hook centralises the persistence layer for ports T22 (Table), T24+
 * (Tasks), and any future control-room views.
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';

const STORAGE_PREFIX = 'control-room:';
const STORAGE_EVENT = 'storage';
const RESET_PARAM = 'reset';

function fullKey(viewKey: string): string {
  return `${STORAGE_PREFIX}${viewKey}`;
}

function readSnapshot<T>(key: string, defaultValue: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    // Malformed storage — fall back to default; do not throw at the caller.
    return defaultValue;
  }
}

function writeSnapshot<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // `storage` events don't fire in the originating window — broadcast
    // manually so any `useSyncExternalStore` consumer in the same tab
    // re-reads its snapshot.
    window.dispatchEvent(new StorageEvent(STORAGE_EVENT, { key }));
  } catch {
    // Storage quota exceeded or disabled — leave React state as-is.
  }
}

function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, callback);
  return () => window.removeEventListener(STORAGE_EVENT, callback);
}

/**
 * Returns `[state, setState]` mirroring the persisted view prefs for `viewKey`.
 *
 * Setter accepts a value or an updater function (matches `useState`).
 *
 * The hook also handles the `?reset=true` URL param: on mount, if `reset=true`
 * is present, the stored entry is removed and the URL is replaced (without
 * navigation) to drop the param so the reset doesn't fire again.
 */
export function useViewPrefs<T>(
  viewKey: string,
  defaultValue: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const key = fullKey(viewKey);

  const state = useSyncExternalStore(
    subscribeToStorage,
    () => readSnapshot<T>(key, defaultValue),
    () => defaultValue,
  );

  const setState = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readSnapshot<T>(key, defaultValue);
      const value =
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeSnapshot(key, value);
    },
    [key, defaultValue],
  );

  // `?reset=true` handler — runs once on mount per URL change. Reads the URL
  // directly from `window.location` to avoid the Suspense-boundary cost of
  // `useSearchParams` in this hook (the auth-gated /control-room is not
  // statically rendered anyway, but the hook is lighter without the dep).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get(RESET_PARAM) !== 'true') return;

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best-effort.
    }
    window.dispatchEvent(new StorageEvent(STORAGE_EVENT, { key }));

    // Drop the param so the reset doesn't fire on subsequent renders if the
    // operator interacts with filters again. Use replaceState — no nav.
    url.searchParams.delete(RESET_PARAM);
    const next = url.pathname + (url.search ? url.search : '') + url.hash;
    window.history.replaceState({}, '', next);
  }, [key]);

  return [state, setState];
}
