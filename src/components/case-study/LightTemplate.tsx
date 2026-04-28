import type { ContentEntry } from '@/lib/content';
import { FullCaseStudyLink } from './FullCaseStudyLink';
import {
  SummaryCard,
  DataKey,
  KillCriterionBanner,
  DeferredItemsList,
} from './alt-a-chrome';
import { VisualAidResolver } from './alt-a-chrome/VisualAidResolver';

export function LightTemplate({
  entry,
  children,
}: {
  entry: ContentEntry;
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
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <header className="mb-10">
        <div className="font-sans text-sm uppercase tracking-wider text-[var(--color-neutral-500)]">
          {fm.timeline_position ? `v${fm.timeline_position.version}` : null}
          {fm.timeline_position ? ' · ' : null}
          {entry.readingTimeMin} min read
        </div>
        {!hasChrome ? (
          <h1 className="mt-3 font-serif text-[length:var(--text-display-lg)] leading-tight">
            {fm.title}
          </h1>
        ) : null}
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
      <div className="prose prose-lg dark:prose-invert max-w-none">{children}</div>
      <FullCaseStudyLink fm={fm} />
    </article>
  );
}
