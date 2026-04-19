import type { ContentEntry } from '@/lib/content';

export function FlagshipTemplate({
  entry,
  hero,
  children,
}: {
  entry: ContentEntry;
  hero?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article>
      {hero ? (
        <div className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">{hero}</div>
      ) : null}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1fr_280px] gap-12">
        <div>
          <header className="mb-10">
            <div className="inline-block font-sans text-sm uppercase tracking-wider text-white bg-[var(--color-brand-coral)] px-3 py-1 rounded">
              Flagship · v{entry.frontmatter.timeline_position?.version}
            </div>
            <h1 className="mt-4 font-serif text-[length:var(--text-display-xl)] leading-[1.05]">
              {entry.frontmatter.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-neutral-500)] font-sans">
              {entry.readingTimeMin} min read
            </p>
          </header>
          <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">{children}</div>
        </div>
        <aside aria-label="Sidebar" className="hidden md:block" />
      </div>
    </article>
  );
}
