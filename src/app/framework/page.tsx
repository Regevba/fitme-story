import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlueprintOverlay } from '@/components/bespoke/BlueprintOverlay';

export const metadata: Metadata = {
  title: 'The framework — fitme-story',
  description: 'Six floors of an AI-orchestrated PM framework, explained layer by layer.',
};

export default function FrameworkPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The framework</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Six floors. Hover to explore how each layer contributes.
        </p>
      </header>
      <BlueprintOverlay interactive />
      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)] mt-16">
        <h2>How the floors cooperate</h2>
        <p>
          The framework is organized as six floors stacked on a shared slab. Floor 1 holds the source-of-truth state. Floor 2 is the hub-and-spoke of skills and their cache tiers. Floors 3–5 add successive SoC-inspired primitives — skill-on-demand loading, batch dispatch, dispatch intelligence. Floor 6 observes everything else via the v6.0 measurement overlay.
        </p>
        <p>
          For the full worked example of a single sprint flowing through these floors, see the{' '}
          <a href="/case-studies/soc-on-software">SoC-v5.0 case study</a>.
        </p>
      </div>
      <section className="mt-16">
        <Link
          href="/framework/dispatch"
          className="group block rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-6 hover:border-[var(--color-brand-indigo)] hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                See the framework in motion →
              </h2>
              <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                Two real feature traces walked through the six floors — scroll-driven, with floor-by-floor firing order.
              </p>
            </div>
            <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
          </div>
        </Link>
      </section>
      <section className="mt-6">
        <Link
          href="/framework/dev-guide"
          className="group block rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-6 hover:border-[var(--color-brand-indigo)] hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                Developer guide (v1.0 → v7.6) →
              </h2>
              <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                Technical reference for developers onboarding to the framework. 4 enforcement layers, <code>state.json</code> schema, phase lifecycle, dispatch model, cache architecture, measurement protocol, 12 integrity check codes, 3 operational walkthroughs, compressed v1.0 → v7.6 timeline.
              </p>
            </div>
            <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
          </div>
        </Link>
      </section>
    </article>
  );
}
