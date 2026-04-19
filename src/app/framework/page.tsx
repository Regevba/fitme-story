import type { Metadata } from 'next';
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
      <div className="prose prose-lg max-w-[var(--measure-body)] mt-16">
        <h2>How the floors cooperate</h2>
        <p>
          The framework is organized as six floors stacked on a shared slab. Floor 1 holds the source-of-truth state. Floor 2 is the hub-and-spoke of skills and their cache tiers. Floors 3–5 add successive SoC-inspired primitives — skill-on-demand loading, batch dispatch, dispatch intelligence. Floor 6 observes everything else via the v6.0 measurement overlay.
        </p>
        <p>
          For the full worked example of a single sprint flowing through these floors, see the{' '}
          <a href="/case-studies/soc-on-software">SoC-v5.0 case study</a>.
        </p>
      </div>
    </article>
  );
}
