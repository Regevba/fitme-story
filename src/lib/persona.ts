'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LENS_COOKIE, LENS_COOKIE_MAX_AGE, isLens } from './lens';

export type Persona = 'hr' | 'pm' | 'dev' | 'academic' | null;

export const STORAGE_KEY = 'fitme-story-persona';

// --- cookie mirror (lens) ---------------------------------------------------
// The lens choice is mirrored into the `fitme_lens` cookie (in addition to
// localStorage) so it survives across sessions AND is readable server-side by
// any page that opts into a server render (src/lib/lens.server.ts). Only the
// two lens values (dev|pm) are written to the cookie; legacy persona values
// (hr|academic) live only in localStorage.

function readLensCookie(): Persona {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LENS_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLens(value) ? value : null;
}

function writeLensCookie(p: Persona): void {
  if (typeof document === 'undefined') return;
  if (isLens(p)) {
    document.cookie = `${LENS_COOKIE}=${p}; path=/; max-age=${LENS_COOKIE_MAX_AGE}; samesite=lax`;
  } else {
    // Clear the cookie for null / legacy non-lens personas.
    document.cookie = `${LENS_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

export function readStored(): Persona {
  if (typeof window === 'undefined') return null;
  // Cookie (the SSR-readable source of truth) wins over localStorage.
  const cookieLens = readLensCookie();
  if (cookieLens) return cookieLens;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'hr' || stored === 'pm' || stored === 'dev' || stored === 'academic') return stored;
  return null;
}

function persist(p: Persona): void {
  if (p) window.localStorage.setItem(STORAGE_KEY, p);
  else window.localStorage.removeItem(STORAGE_KEY);
  writeLensCookie(p);
}

/**
 * usePersonaState — manages the persona state without touching useSearchParams.
 * Safe to call from the outer PersonaProvider (no SSG suspension).
 */
export function usePersonaState(): [Persona, (p: Persona) => void] {
  const [persona, setPersonaState] = useState<Persona>(null);

  // Hydrate from cookie/localStorage on mount (client-only).
  useEffect(() => {
    const stored = readStored();
    if (stored) setPersonaState(stored);
  }, []);

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    persist(p);
  }, []);

  return [persona, setPersona];
}

/**
 * useSearchParamsPersona — reads the ?p= URL param and syncs it into the
 * provided setter. This hook calls useSearchParams() so it MUST be rendered
 * inside a Suspense boundary. It is used only by PersonaSearchParamsSync,
 * which is an inner component rendered inside its own Suspense in the provider.
 */
export function useSearchParamsPersonaSync(
  setPersona: (p: Persona) => void,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // suspends during SSG — intentionally in inner component

  useEffect(() => {
    const paramPersona = (searchParams.get('p') as Persona) ?? null;
    if (paramPersona) {
      setPersona(paramPersona);
      persist(paramPersona);
    }
  }, [searchParams, setPersona]);

  // Expose a setPersona that also syncs the URL.
  return useCallback(
    (p: Persona) => {
      setPersona(p);
      persist(p);
      const params = new URLSearchParams(searchParams.toString());
      if (p) params.set('p', p);
      else params.delete('p');
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [router, pathname, searchParams, setPersona],
  );
}
