'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export type Persona = 'hr' | 'pm' | 'dev' | 'academic' | null;

const STORAGE_KEY = 'fitme-story-persona';

function readStored(): Persona {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'hr' || stored === 'pm' || stored === 'dev' || stored === 'academic') return stored;
  return null;
}

export function usePersona(): [Persona, (p: Persona) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramPersona = (searchParams.get('p') as Persona) ?? null;

  const [persona, setPersonaState] = useState<Persona>(paramPersona ?? null);

  useEffect(() => {
    if (paramPersona) {
      setPersonaState(paramPersona);
      window.localStorage.setItem(STORAGE_KEY, paramPersona);
    } else {
      const stored = readStored();
      if (stored) setPersonaState(stored);
    }
  }, [paramPersona]);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    if (p) window.localStorage.setItem(STORAGE_KEY, p);
    else window.localStorage.removeItem(STORAGE_KEY);
    const params = new URLSearchParams(searchParams.toString());
    if (p) params.set('p', p);
    else params.delete('p');
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  };

  return [persona, setPersona];
}
