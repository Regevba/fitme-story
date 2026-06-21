import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { NumbersPanel } from '@/components/home/NumbersPanel';
import { FeaturedStudies } from '@/components/home/FeaturedStudies';
import { JsonLd } from '@/components/JsonLd';
import { buildMetadata, websiteJsonLd, organizationJsonLd } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'How a PM flow became a framework',
  description:
    'PM flow, framework evolution, design system, case studies, and research from building FitMe.',
  slug: '/',
});

// Compact home (dual-audience redesign T5): who/what + audience chooser high up,
// numbers, lens-aware featured studies, then a CTA into the full /story
// narrative. The deep origin narrative + interactive timeline live on /story
// (T6); the former 4-persona ThreeWaysIn block is removed.
export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <NumbersPanel />
      <FeaturedStudies />

      {/* About this project — moved here from /about (operator decision
          2026-06-09); /about now carries only the disclaimer. */}
      <section
        className="page-shell section-padding-x py-12 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)]"
        aria-labelledby="about-heading"
      >
        <h2 id="about-heading" className="font-serif text-[length:var(--text-display-md)] mb-5 max-w-[var(--measure-body)] mx-auto">
          About this project
        </h2>
        <div className="space-y-4 font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed max-w-[var(--measure-body)] mx-auto">
          <p>
            FitMe is a personal project — an iOS app I built to track my own fitness and wellbeing
            the way I wanted: fast, privacy-first, and entirely owned by the person using it. Data
            stays on-device by default, analysis happens locally when possible, and no health signal
            gets silently shipped to a cloud AI. The interesting part isn&apos;t the app. It&apos;s
            what happened while building it.
          </p>
          <p>
            I built an AI-orchestrated PM workflow — <code className="font-mono text-sm">/pm-workflow</code> —
            to enforce the planning discipline I kept abandoning. Then the workflow itself started
            evolving. Caches, eval layers, dispatch intelligence, measurement. By v7.0 it was routing
            to hardware-aware models. By v7.9 (shipped 2026-05-21) the framework was using its own
            Mechanism A telemetry as a gate on its own promotion decisions — the first version where
            the calibration discipline applied to itself, codified in honesty-ledger entry FT2-FH-003.
          </p>
          <p>
            This site is the guided tour of that process. All docs are from real shipped work. All
            metrics are measured, not estimated. The regressions are as public as the successes.
          </p>
        </div>
      </section>

      <section className="page-shell section-padding-x pb-20 text-center">
        <Link
          href="/story"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-6 py-3 font-sans font-medium hover:border-[var(--color-brand-indigo)] hover:text-[var(--color-brand-indigo)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
        >
          Read the full story — how it started, grew, and measures itself
          <ArrowRight size={16} aria-hidden />
        </Link>
      </section>
    </>
  );
}
