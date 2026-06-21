import Link from 'next/link';
import { HeroSubtitle } from '@/components/home/HeroSubtitle';
import { LensToggle } from '@/components/ui/LensToggle';

export function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-16 sm:py-20 text-center">
      <Link
        href="/framework"
        className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-xs font-sans font-medium bg-[var(--color-brand-indigo)]/10 text-[var(--color-brand-indigo)] hover:bg-[var(--color-brand-indigo)]/15 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-indigo)] opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-indigo)]" />
        </span>
        v7.10 shipped — GATE_COVERAGE_ZERO observability + T14/F16 enforced
      </Link>
      <p className="font-sans text-xs uppercase tracking-[0.08em] text-[var(--color-neutral-500)] font-semibold">
        A worked example of building software differently
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-[length:var(--text-display-xl)] leading-[1.1] sm:leading-[1.05] font-serif break-words">
        How <span className="text-[var(--color-brand-indigo)]">/pm-flow</span> became a framework, and grew up alongside a fitness app.
      </h1>
      <p className="mt-5 font-sans text-base text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] max-w-[var(--measure-narrow)] mx-auto leading-relaxed">
        I&apos;m Regev — an iOS developer building FitMe, a privacy-first fitness app. To stop
        shipping fast-and-wrong, I wrote one command that enforced research, planning, testing, and
        learning. It grew into a measurable framework. This site is the guided tour.
      </p>
      <HeroSubtitle />

      {/* Audience chooser — the front door (dual-audience redesign #1/#3).
          Replaces the former 4-persona PersonaBar. */}
      <div className="mt-12 max-w-2xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-[0.06em] text-[var(--color-neutral-500)] font-semibold mb-4">
          Choose how you want to read this
        </p>
        <LensToggle variant="chooser" />
        <p className="mt-4 font-sans text-xs text-[var(--color-neutral-400)]">
          You can switch anytime from the header. Not sure? Product manager is a good default.
        </p>
      </div>
    </section>
  );
}
