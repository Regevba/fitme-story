import type { ContentEntry } from '@/lib/content';

export function LightTemplate({
  entry,
  children,
}: {
  entry: ContentEntry;
  children: React.ReactNode;
}) {
  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <header className="mb-10">
        <div className="font-sans text-sm uppercase tracking-wider text-[var(--color-neutral-500)]">
          {entry.frontmatter.timeline_position ? `v${entry.frontmatter.timeline_position.version}` : null}
          {' · '}
          {entry.readingTimeMin} min read
        </div>
        <h1 className="mt-3 font-serif text-[length:var(--text-display-lg)] leading-tight">
          {entry.frontmatter.title}
        </h1>
      </header>
      <div className="prose prose-lg dark:prose-invert max-w-none">{children}</div>
    </article>
  );
}
