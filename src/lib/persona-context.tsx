'use client';

import { createContext, useContext, Suspense } from 'react';
import {
  usePersonaState,
  useSearchParamsPersonaSync,
  type Persona,
} from './persona';

export type { Persona };

interface PersonaContextValue {
  persona: Persona;
  setPersona: (p: Persona) => void;
}

const PersonaContext = createContext<PersonaContextValue>({
  persona: null,
  setPersona: () => {},
});

/**
 * Inner component that calls useSearchParams (suspends during SSG).
 * Wrapped in Suspense by PersonaProvider so the outer tree renders fully
 * server-side even when this inner component suspends.
 */
function PersonaSearchParamsSync({
  setPersona,
}: {
  setPersona: (p: Persona) => void;
}) {
  // This hook calls useSearchParams() — suspension is intentional here.
  useSearchParamsPersonaSync(setPersona);
  return null;
}

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  // usePersonaState does NOT call useSearchParams — safe for SSG/SSR.
  const [persona, setPersona] = usePersonaState();

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {/*
        PersonaSearchParamsSync reads useSearchParams and may suspend during
        SSG. Its own Suspense boundary catches that suspension; fallback=null
        means the suspension is invisible and children render fully.
      */}
      <Suspense fallback={null}>
        <PersonaSearchParamsSync setPersona={setPersona} />
      </Suspense>
      {children}
    </PersonaContext.Provider>
  );
}

export function useCurrentPersona(): Persona {
  return useContext(PersonaContext).persona;
}

/**
 * Full persona hook — persona value + URL-aware setter.
 * Use this in components that need to both read and change the persona.
 */
export function usePersona(): [Persona, (p: Persona) => void] {
  const { persona, setPersona } = useContext(PersonaContext);
  return [persona, setPersona];
}
