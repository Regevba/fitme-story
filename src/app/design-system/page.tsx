import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The design system — fitme-story',
  description: '13 UX foundations and ~125 tokens that underpin FitMe.',
};

const PRINCIPLES = [
  'Clarity over cleverness',
  'Touch affordances above 44pt',
  'One primary CTA per screen',
  'Progressive disclosure by default',
  'Motion communicates state change, not personality',
  'Empty states teach, not decorate',
  'Error recovery beats error prevention',
  'Loading states beat spinners',
  'Color is a last-resort differentiator',
  'Every interactive element has a disabled variant',
  'Accessibility is a constraint, not a feature',
  'Typography owns hierarchy',
  'Spacing owns grouping',
];

export default function DesignSystemPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The design system</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          13 UX foundations. ~125 semantic tokens. 13 reusable components. CI-enforced.
        </p>
      </header>
      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-6">The 13 principles</h2>
        <ol className="space-y-3 font-sans">
          {PRINCIPLES.map((p, i) => (
            <li key={p} className="flex gap-4">
              <span className="text-[var(--color-brand-indigo)] font-semibold w-6 shrink-0">{i + 1}.</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="font-serif text-2xl mb-6">Screens</h2>
        <p className="text-[var(--color-neutral-500)] text-sm font-sans">
          Exported Figma frames will appear here. (Gallery populated post-launch via manual export.)
        </p>
      </section>
    </article>
  );
}
