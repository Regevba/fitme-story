import type { Metadata } from 'next';
import { DispatchReplay } from '@/components/bespoke/DispatchReplay';

export const metadata: Metadata = {
  title: 'The framework in motion — fitme-story',
  description: 'Watch a real feature flow through the framework: dispatch intelligence, skill-on-demand loading, batched execution, measurement.',
};

export default function DispatchDemoPage() {
  return (
    <article className="max-w-6xl mx-auto px-6 py-16">
      <header className="mb-10 max-w-3xl">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The framework in motion</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Two real feature traces walked through the 6-floor stack. Pick a trace, scroll to advance, or press play. Floors light up as they fire, dim when they stay dormant.
        </p>
      </header>
      <DispatchReplay />
      <section className="mt-16 max-w-[var(--measure-body)]">
        <h2 className="font-serif text-2xl">How this works</h2>
        <div className="prose prose-lg dark:prose-invert mt-4">
          <p>
            Each trace is a beat-by-beat replay of a real feature that shipped through the framework. The floors mirror the static{' '}
            <a href="/framework">framework blueprint</a>: Floor 1 is the shared state slab, Floors 2–5 are successive dispatch primitives, Floor 6 is the measurement overlay.
          </p>
          <p>
            Floors marked <em>firing</em> are actively executing in that beat. Floors marked <em>dormant</em> were skipped entirely for this feature — which is the point: the framework selectively activates only what each task needs. Sprint I (mechanical) used 2 of 11 skills; the fitme-story build (UI-heavy) used 4 different ones.
          </p>
          <p>
            The traces are pinned to the static methodology docs — click through for the full story.
          </p>
        </div>
      </section>
    </article>
  );
}
