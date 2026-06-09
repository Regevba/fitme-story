'use client';

// Renders per-lens framing for a page (dual-audience redesign T10/T12). Lets a
// server-rendered page carry a lens-aware "read this as…" intro + emphasis
// without physically reordering its content (which would force dynamic
// rendering — cacheComponents is off). PM defaults when no lens is chosen.

import { type ReactNode } from 'react';
import { useLens } from '@/lib/lens-client';

export function LensFraming({
  pm,
  dev,
  className,
}: {
  pm: ReactNode;
  dev: ReactNode;
  className?: string;
}) {
  const lens = useLens() ?? 'pm';
  return <div className={className}>{lens === 'pm' ? pm : dev}</div>;
}
