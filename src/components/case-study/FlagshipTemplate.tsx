import type { ContentEntry } from '@/lib/content';
import { FullCaseStudyLink } from './FullCaseStudyLink';
import {
  SummaryCard,
  DataKey,
  KillCriterionBanner,
  DeferredItemsList,
} from './alt-a-chrome';
import { VisualAidResolver } from './alt-a-chrome/VisualAidResolver';

export function FlagshipTemplate({
  entry,
  hero,
  children,
}: {
  entry: ContentEntry;
  hero?: React.ReactNode;
  children: React.ReactNode;
}) {
  const fm = entry.frontmatter;
  const hasChrome = Boolean(
    fm.tldr ||
      fm.key_numbers ||
      fm.honest_disclosures ||
      fm.kill_criteria ||
      fm.visual_aid,
  );
  return (
    <article>
      {hero ? (
        <div className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">{hero}</div>
      ) : null}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1fr_280px] gap-12">
        <div>
          <header className="mb-10">
            <div className="inline-block font-sans text-sm uppercase tracking-wider text-white bg-[var(--color-brand-coral)] px-3 py-1 rounded">
              Flagship · v{fm.timeline_position?.version}
            </div>
            {!hasChrome ? (
              <h1 className="mt-4 font-serif text-[length:var(--text-display-xl)] leading-[1.05]">
                {fm.title}
              </h1>
            ) : null}
            <p className="mt-2 text-sm text-[var(--color-neutral-500)] font-sans">
              {entry.readingTimeMin} min read
            </p>
          </header>
          {hasChrome ? (
            <div className="mb-12 space-y-4">
              <SummaryCard fm={fm} />
              <DataKey />
              <VisualAidResolver fm={fm} />
              <KillCriterionBanner
                criteria={fm.kill_criteria ?? []}
                fired={fm.kill_criterion_fired ?? false}
              />
              <DeferredItemsList items={fm.deferred_items ?? []} />
            </div>
          ) : null}
          <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">{children}</div>
          <FullCaseStudyLink fm={fm} />
        </div>
        <aside aria-label="Sidebar" className="hidden md:block" />
      </div>
    </article>
  );
}
