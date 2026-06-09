'use client';

// Lens-aware framing sentence for /story (dual-audience redesign T6). PM lens
// frames the narrative around product/process; Dev lens around the engineering.

import { useLens } from '@/lib/lens-client';

const LINE = {
  pm: 'Read as a product story: why the workflow existed, what each version produced, and how the outcomes were measured. The engineering is here as supporting depth.',
  dev: 'Read as an engineering story: how one command became an 8-floor framework — skill decomposition, dispatch, measurement, and enforcement gates. The product is the motivating context.',
} as const;

export function StoryLensLine() {
  const lens = useLens() ?? 'pm';
  return (
    <p className="mt-4 font-sans text-base text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] max-w-[var(--measure-body)] leading-relaxed">
      {LINE[lens]}
    </p>
  );
}
