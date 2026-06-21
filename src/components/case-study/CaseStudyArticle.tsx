import type { ContentEntry } from '@/lib/content';
import { FullCaseStudyLink } from './FullCaseStudyLink';
import { CaseStudyToolbar } from './CaseStudyToolbar';
import { ArticleNav } from './ArticleNav';
import {
  HonestDisclosures,
  TierLegend,
  KillCriterionBanner,
  DeferredItemsList,
} from './alt-a-chrome';
import { VisualAidResolver } from './alt-a-chrome/VisualAidResolver';
import { TimelineNav } from '@/components/mdx/TimelineNav';

type Sibling = { href: string; label: string };
type Tier = 'flagship' | 'standard' | 'light' | 'appendix' | 'ops-combined' | 'unassigned';

// One config-driven template (2026-06-21 consolidation) — replaces the former
// Flagship/Standard/Light template trio, which differed only by accent, badge,
// H1 size, container width, and sidebar presence. Reading flow is story-first:
// header (+ tldr lead) → at-a-glance visual band → prose → honest-disclosures
// epilogue → kill-criterion + deferred (post-launch housekeeping, below the body).
type TierConfig = {
  badge: 'box-coral' | 'box-indigo' | 'inline';
  badgePrefix: string;
  h1: string;
  container: string;
  proseMax: string;
  sidebar: boolean;
};

const H1_BIG =
  'font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[length:var(--text-display-xl)] leading-[1.1] sm:leading-[1.05] break-words';
const H1_MED =
  'font-serif text-2xl sm:text-3xl md:text-[length:var(--text-display-lg)] leading-tight break-words';

const TIER_CONFIG: Record<Tier, TierConfig> = {
  flagship: { badge: 'box-coral', badgePrefix: 'Flagship · v', h1: H1_BIG, container: 'max-w-[84rem]', proseMax: 'max-w-[var(--measure-body)]', sidebar: true },
  standard: { badge: 'box-indigo', badgePrefix: 'v', h1: H1_MED, container: 'max-w-[84rem]', proseMax: 'max-w-[var(--measure-body)]', sidebar: true },
  light: { badge: 'inline', badgePrefix: 'v', h1: H1_MED, container: 'max-w-[var(--measure-wide)]', proseMax: 'max-w-none', sidebar: false },
  appendix: { badge: 'inline', badgePrefix: 'v', h1: H1_MED, container: 'max-w-[var(--measure-wide)]', proseMax: 'max-w-none', sidebar: false },
  'ops-combined': { badge: 'inline', badgePrefix: 'v', h1: H1_MED, container: 'max-w-[var(--measure-wide)]', proseMax: 'max-w-none', sidebar: false },
  unassigned: { badge: 'inline', badgePrefix: 'v', h1: H1_MED, container: 'max-w-[var(--measure-wide)]', proseMax: 'max-w-none', sidebar: false },
};

export function CaseStudyArticle({
  entry,
  hero,
  siblings,
  children,
}: {
  entry: ContentEntry;
  hero?: React.ReactNode;
  siblings?: { prev?: Sibling; next?: Sibling };
  children: React.ReactNode;
}) {
  const fm = entry.frontmatter;
  const cfg = TIER_CONFIG[(fm.tier as Tier) ?? 'light'] ?? TIER_CONFIG.light;
  const version = fm.timeline_position?.version ?? null;
  const hasVisual = Boolean(fm.visual_aid) || (Array.isArray(fm.key_numbers) && fm.key_numbers.length > 0);
  const hasEpilogue = Boolean(
    (fm.honest_disclosures && fm.honest_disclosures.length > 0) ||
      (fm.kill_criteria && fm.kill_criteria.length > 0) ||
      (fm.deferred_items && fm.deferred_items.length > 0),
  );

  const badgeBox = cfg.badge === 'box-coral' ? 'bg-[var(--color-brand-coral)]' : 'bg-[var(--color-brand-indigo)]';

  const main = (
    <div>
      <CaseStudyToolbar />
      <header className="mb-8">
        {cfg.badge === 'inline' ? (
          <div className="font-sans text-sm uppercase tracking-wider text-[var(--color-neutral-500)]">
            {version ? `v${version} · ` : ''}
            {entry.readingTimeMin} min read
            {fm.date ? ` · ${fm.date}` : ''}
          </div>
        ) : (
          <>
            <div className={`inline-block font-sans text-sm uppercase tracking-wider text-white ${badgeBox} px-3 py-1 rounded`}>
              {cfg.badgePrefix}
              {version}
            </div>
            <p className="mt-2 text-sm text-[var(--color-neutral-500)] font-sans">
              {entry.readingTimeMin} min read{fm.date ? ` · ${fm.date}` : ''}
            </p>
          </>
        )}
        {/* Audit A-019: single h1, always in <header>. */}
        <h1 className={`mt-4 ${cfg.h1}`}>{fm.title}</h1>
        {fm.tldr ? (
          <p className="mt-5 font-serif text-xl leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)]">
            {fm.tldr}
          </p>
        ) : null}
      </header>

      {/* At-a-glance visual band — the single most important result, up top. */}
      {hasVisual ? (
        <div className="mb-12">
          <VisualAidResolver fm={fm} />
          <TierLegend />
        </div>
      ) : null}

      {/* The story. */}
      <div className={`prose prose-lg dark:prose-invert ${cfg.proseMax}`}>{children}</div>

      {/* Epilogue — credibility + post-launch housekeeping, below the narrative. */}
      {hasEpilogue ? (
        <div className="mt-12 space-y-4">
          <HonestDisclosures items={fm.honest_disclosures ?? []} />
          <KillCriterionBanner criteria={fm.kill_criteria ?? []} fired={fm.kill_criterion_fired ?? false} />
          <DeferredItemsList items={fm.deferred_items ?? []} />
        </div>
      ) : null}

      <TimelineNav prev={siblings?.prev} next={siblings?.next} />
      <FullCaseStudyLink fm={fm} />
    </div>
  );

  const containerCls = `${cfg.container} mx-auto section-padding-x py-16`;

  return (
    <article>
      {hero ? (
        <div className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">{hero}</div>
      ) : null}
      {cfg.sidebar ? (
        <div className={`${containerCls} grid md:grid-cols-[minmax(0,1fr)_280px] gap-12`}>
          {main}
          <aside aria-label="Article navigation" className="hidden md:block">
            <ArticleNav />
          </aside>
        </div>
      ) : (
        <div className={containerCls}>{main}</div>
      )}
    </article>
  );
}
