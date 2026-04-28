// Index page for the case-study presentation preview.
// Links to both alternatives and explains the experiment.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case-study presentation preview — fitme-story',
  description:
    'Two alternative presentations of the case-study format. Reviewer picks one to land in production.',
  robots: { index: false, follow: false },
};

export default function CaseStudyPreviewIndex() {
  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <div className="font-sans text-sm uppercase tracking-wider text-[var(--color-brand-indigo)] mb-2">
        Preview · review only
      </div>
      <h1 className="font-serif text-[length:var(--text-display-lg)] leading-tight">
        Case-study presentation refactor
      </h1>
      <p className="mt-4 font-sans text-base text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
        Two alternative presentations of the same source case study (Data Integrity
        Framework v7.5). Both are rendered in the production fitme-story design
        language. Click each to compare; pick the one that should land.
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/case-studies-preview/alternative-a"
          className="block rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-800)] p-6 hover:border-[var(--color-brand-indigo)] transition-colors"
        >
          <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-indigo)] mb-2">
            Alternative A
          </div>
          <h2 className="font-serif text-2xl leading-tight">
            Web-First Card + Disclosure Tail
          </h2>
          <p className="mt-3 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
            Per-case page stays primary. Lead with a tight card; full narrative
            body sits right below, untouched. Lower migration risk.
          </p>
          <ul className="mt-4 space-y-1 font-sans text-xs text-[var(--color-neutral-500)]">
            <li>• Card on top + 3 key numbers + kill banner + deferred items</li>
            <li>• 9-section v7.5 narrative below (full)</li>
            <li>• ~30 lines of new chrome above the existing body</li>
            <li>• 3 components, ~6 frontmatter fields</li>
          </ul>
          <div className="mt-5 font-sans text-sm text-[var(--color-brand-indigo)] font-medium">
            View Alternative A →
          </div>
        </a>

        <a
          href="/case-studies-preview/alternative-b"
          className="block rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-800)] p-6 hover:border-[var(--color-brand-indigo)] transition-colors"
        >
          <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-coral)] mb-2">
            Alternative B
          </div>
          <h2 className="font-serif text-2xl leading-tight">
            Anthology + Card Quote
          </h2>
          <p className="mt-3 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
            The per-case page IS the card. Long-form body is collapsed under a
            disclosure (one click deeper). Primary surface is the cross-case
            anthology view.
          </p>
          <ul className="mt-4 space-y-1 font-sans text-xs text-[var(--color-neutral-500)]">
            <li>• Card + 4 panels (key numbers, kill, disclosures, deferred)</li>
            <li>• Long body collapsed under &quot;View full methodology&quot;</li>
            <li>• Page renders in &lt;60s; depth one click away</li>
            <li>• 6 components, ~10 frontmatter fields</li>
          </ul>
          <div className="mt-5 font-sans text-sm text-[var(--color-brand-coral)] font-medium">
            View Alternative B →
          </div>
        </a>
      </div>

      <div className="mt-12 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-900)] p-5 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
        <strong className="font-semibold">Both alternatives</strong> use identical
        underlying data: same TL;DR, same 3 key numbers, same kill criterion, same
        3 honest disclosures, same 3 deferred items, same 9-section v7.5 narrative.
        The only thing that changes is <em>where each lives on the page</em>.
      </div>
    </article>
  );
}
