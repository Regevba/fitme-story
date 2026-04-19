'use client';

import { useCurrentPersona } from '@/lib/persona-context';
import type { Persona } from '@/lib/persona';

type Only = Exclude<Persona, null>;

export function PersonaLens({
  show,
  children,
}: {
  show: Only[] | 'all';
  children: React.ReactNode;
}) {
  const persona = useCurrentPersona();
  if (persona === null) return <>{children}</>;
  if (show === 'all') return <>{children}</>;
  if (show.includes(persona)) return <>{children}</>;
  return null;
}
