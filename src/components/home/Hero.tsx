import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { PersonaBar } from '@/components/PersonaBar';
import { HeroSubtitle } from '@/components/home/HeroSubtitle';
import { PersonaIndicator } from '@/components/PersonaIndicator';

export function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-16 sm:py-24 text-center">
      <Link
        href="/case-studies/framework-v7-9-1-promotion"
        className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-xs font-sans font-medium bg-[var(--color-brand-indigo)]/10 text-[var(--color-brand-indigo)] hover:bg-[var(--color-brand-indigo)]/15 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-indigo)] opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-indigo)]" />
        </span>
        v7.9.1 build window CLOSED 2026-06-04 — 8 ships, 14 PRs, 0 new gates
      </Link>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[length:var(--text-display-xl)] leading-[1.1] sm:leading-[1.05] font-serif break-words">
        How <span className="text-[var(--color-brand-indigo)]">/pm-flow</span> became a framework, and grew up alongside a fitness app.
      </h1>
      <HeroSubtitle />
      <div className="mt-10">
        <PersonaBar />
        <div className="flex justify-center">
          <PersonaIndicator />
        </div>
      </div>
      <div className="mt-16 flex flex-col items-center gap-2 text-sm text-[var(--color-neutral-500)] font-sans">
        <span>The story starts here</span>
        <ChevronDown aria-hidden className="motion-safe:animate-bounce" size={20} />
      </div>
    </section>
  );
}
