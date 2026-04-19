'use client';

import { useCurrentPersona } from '@/lib/persona-context';

const SUBTITLES: Record<string, string> = {
  default:
    'A worked example of building software differently — 16 features shipped through a framework that taught itself to measure its own work.',
  hr: '16 features shipped. 185 audit findings published. Measured outcomes, honest regressions — ready for an interview about any of them.',
  pm: 'Nine phases, enforced. A workflow that learned to measure itself across 7 framework versions and 13 documented case studies.',
  dev: 'From SoC-on-software to hardware-aware dispatch — an AI-orchestrated PM framework explained floor by floor, with real code behind every claim.',
  academic:
    'Normalization R²=0.82. 7/9 DVs deterministic. Full-system audit findings public. Bias acknowledged in the meta-analysis.',
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
