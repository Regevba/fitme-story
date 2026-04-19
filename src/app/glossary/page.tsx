import type { Metadata } from 'next';
import { GLOSSARY } from '@/lib/glossary';

export const metadata: Metadata = {
  title: 'Glossary — fitme-story',
  description: 'Plain-language definitions of hardware-inspired software terminology used throughout the site.',
};

const CATEGORY_LABELS: Record<string, string> = {
  'hardware-analog': 'Hardware analogs',
  framework: 'Framework components',
  methodology: 'Methodology',
  web: 'Web vitals',
};

const CATEGORY_ORDER = ['hardware-analog', 'framework', 'methodology', 'web'];

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: CATEGORY_LABELS[cat],
    entries: sorted.filter((e) => e.category === cat),
  }));

  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">Glossary</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Plain-language definitions of the hardware-inspired software terminology used throughout the site.
        </p>
      </header>

      {/* Category nav */}
      <nav className="mb-12 flex flex-wrap gap-2 font-sans text-sm" aria-label="Glossary sections">
        {byCategory.map((c) => (
          <a
            key={c.key}
            href={`#cat-${c.key}`}
            className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-full border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)] hover:text-[var(--color-brand-indigo)] transition-colors"
          >
            {c.label} <span className="ml-2 text-[var(--color-neutral-500)]">({c.entries.length})</span>
          </a>
        ))}
      </nav>

      {byCategory.map((c) => (
        <section id={`cat-${c.key}`} key={c.key} className="mb-16 scroll-mt-28">
          <h2 className="font-serif text-2xl mb-6">{c.label}</h2>
          <dl className="space-y-8">
            {c.entries.map((e) => (
              <div key={e.slug} id={e.slug} className="scroll-mt-28">
                <dt className="font-serif text-xl text-[var(--color-brand-indigo)]">{e.term}</dt>
                <dd className="mt-2 prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">
                  <p>{e.full}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <footer className="mt-16 pt-8 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] text-sm font-sans text-[var(--color-neutral-500)]">
        <p>
          Miss a term?{' '}
          <a className="underline" href="https://github.com/Regevba/fitme-story/issues">
            Open an issue
          </a>{' '}
          and we&apos;ll add it.
        </p>
      </footer>
    </article>
  );
}
