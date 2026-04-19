import { ChevronDown } from 'lucide-react';
import { PersonaBar } from '@/components/PersonaBar';
import { HeroSubtitle } from '@/components/home/HeroSubtitle';
import { PersonaIndicator } from '@/components/PersonaIndicator';

export function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24 text-center">
      <h1 className="text-[length:var(--text-display-xl)] leading-[1.05] font-serif">
        How an AI-orchestrated PM framework grew up alongside a fitness app.
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
