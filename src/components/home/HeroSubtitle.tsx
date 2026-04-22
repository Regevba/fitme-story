'use client';

import { useCurrentPersona } from '@/lib/persona-context';

const SUBTITLES: Record<string, string> = {
  default:
    'A worked example of building software differently — one PM flow enforced research, planning, testing, and learning until it became a measurable framework.',
  hr: 'A PM flow that became operating leverage: 16 shipped features, public audits, honest regressions, and a framework you can inspect page by page.',
  pm: 'Start with the flow itself: phases, skills, handoffs, and shared state. Then trace how that workflow evolved across 7 framework versions.',
  dev: 'From /pm-flow to SoC-on-software to hardware-aware dispatch — the framework is explained floor by floor, with real code and real receipts behind it.',
  academic:
    'Workflow first, measurement second: normalization R²=0.82, 7/9 DVs deterministic, public audit findings, and methodological gaps stated plainly.',
};

export function HeroSubtitle() {
  const persona = useCurrentPersona();
  const copy = (persona && SUBTITLES[persona]) || SUBTITLES.default;
  return (
    <p className="mt-6 text-lg max-w-[var(--measure-narrow)] mx-auto text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
      {copy}
    </p>
  );
}
