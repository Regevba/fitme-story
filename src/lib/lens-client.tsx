'use client';

// Client-side lens helpers — a thin, lens-typed layer over the persona context
// (src/lib/persona-context.tsx). Components that care about the audience lens
// (dev|pm) use these instead of the raw 4-value persona hooks, so the lens
// concept reads cleanly and the eventual persona→lens narrowing is localized.

import { usePersona, useCurrentPersona } from './persona-context';
import { isLens, type Lens, type LensOrNull } from './lens';

/** Current lens, or null when the visitor hasn't chosen one (or legacy persona). */
export function useLens(): LensOrNull {
  const persona = useCurrentPersona();
  return isLens(persona) ? persona : null;
}

/** Lens value + setter. Setting persists to cookie + localStorage (see persona.ts). */
export function useSetLens(): [LensOrNull, (lens: Lens) => void] {
  const [persona, setPersona] = usePersona();
  const lens = isLens(persona) ? persona : null;
  return [lens, (l: Lens) => setPersona(l)];
}

/**
 * Render children only under the given lens. When no lens is chosen yet, the
 * `pm` branch shows (PM is the default audience) so first-time visitors get the
 * product/process spine rather than an empty render.
 */
export function LensGate({
  lens,
  children,
}: {
  lens: Lens;
  children: React.ReactNode;
}) {
  const active = useLens();
  const effective: Lens = active ?? 'pm';
  return effective === lens ? <>{children}</> : null;
}
