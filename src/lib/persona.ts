'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export type Persona = 'hr' | 'pm' | 'dev' | 'academic' | null;

export const STORAGE_KEY = 'fitme-story-persona';

export function readStored(): Persona {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'hr' || stored === 'pm' || stored === 'dev' || stored === 'academic') return stored;
  return null;
}

/**
 * usePersonaState — manages the persona state without touching useSearchParams.
 * Safe to call from the outer PersonaProvider (no SSG suspension).
 */
export function usePersonaState(): [Persona, (p: Persona) => void] {
  const [persona, setPersonaState] = useState<Persona>(null);

  // Hydrate from localStorage on mount (client-only).
  useEffect(() => {
    const stored = readStored();
    if (stored) setPersonaState(stored);
  }, []);

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    if (p) window.localStorage.setItem(STORAGE_KEY, p);
    else window.localStorage.removeItem(STORAGE_KEY);
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
      window.localStorage.setItem(STORAGE_KEY, paramPersona);
    }
  }, [searchParams, setPersona]);

  // Expose a setPersona that also syncs the URL.
  return useCallback(
    (p: Persona) => {
      setPersona(p);
      if (p) window.localStorage.setItem(STORAGE_KEY, p);
      else window.localStorage.removeItem(STORAGE_KEY);
      const params = new URLSearchParams(searchParams.toString());
      if (p) params.set('p', p);
      else params.delete('p');
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [router, pathname, searchParams, setPersona],
  );
}
