'use client';

import { createContext, useContext } from 'react';
import { usePersona, type Persona } from './persona';

const PersonaContext = createContext<Persona>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona] = usePersona();
  return <PersonaContext.Provider value={persona}>{children}</PersonaContext.Provider>;
}

export function useCurrentPersona(): Persona {
  return useContext(PersonaContext);
}
