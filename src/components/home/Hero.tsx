import { ChevronDown } from 'lucide-react';
import { PersonaBar } from '@/components/PersonaBar';

export function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24 text-center">
      <h1 className="text-[length:var(--text-display-xl)] leading-[1.05] font-serif">
        How an AI-orchestrated PM framework grew up alongside a fitness app.
      </h1>
      <p className="mt-6 text-lg max-w-[var(--measure-narrow)] mx-auto text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        A worked example of building software differently — 16 features shipped through
        a framework that taught itself to measure its own work.
      </p>
      <div className="mt-10">
        <PersonaBar />
      </div>
      <div className="mt-16 flex flex-col items-center gap-2 text-sm text-[var(--color-neutral-500)] font-sans">
        <span>The story starts here</span>
        <ChevronDown aria-hidden className="motion-safe:animate-bounce" size={20} />
      </div>
    </section>
  );
}
