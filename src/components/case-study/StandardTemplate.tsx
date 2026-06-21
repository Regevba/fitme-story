import type { ContentEntry } from '@/lib/content';
import { FullCaseStudyLink } from './FullCaseStudyLink';
import { CaseStudyToolbar } from './CaseStudyToolbar';
import { ArticleNav } from './ArticleNav';
import {
  SummaryCard,
  DataKey,
  KillCriterionBanner,
  DeferredItemsList,
} from './alt-a-chrome';
import { VisualAidResolver } from './alt-a-chrome/VisualAidResolver';
import { TimelineNav } from '@/components/mdx/TimelineNav';

type Sibling = { href: string; label: string };

export function StandardTemplate({
  entry,
  siblings,
  children,
}: {
  entry: ContentEntry;
  siblings?: { prev?: Sibling; next?: Sibling };
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
    <article className="max-w-[84rem] mx-auto section-padding-x py-16 grid md:grid-cols-[minmax(0,1fr)_280px] gap-12">
      <div>
        <CaseStudyToolbar />
        <header className="mb-10">
          <div className="inline-block font-sans text-sm uppercase tracking-wider text-white bg-[var(--color-brand-indigo)] px-3 py-1 rounded">
            {fm.timeline_position ? `v${fm.timeline_position.version}` : null}
          </div>
          {/* Audit A-019 (2026-05-08): h1 always in <header>. */}
          <h1 className="mt-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[length:var(--text-display-lg)] leading-tight break-words">
            {fm.title}
          </h1>
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
        <TimelineNav prev={siblings?.prev} next={siblings?.next} />
        <FullCaseStudyLink fm={fm} />
      </div>
      <aside aria-label="Article navigation" className="hidden md:block">
        <ArticleNav />
      </aside>
    </article>
  );
}
