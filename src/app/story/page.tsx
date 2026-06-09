import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { OriginNarrative } from '@/components/home/OriginNarrative';
import { Timeline } from '@/components/home/Timeline';
import { StoryScrollTracker } from '@/components/story/StoryScrollTracker';
import { StoryLensLine } from '@/components/story/StoryLensLine';
import { buildAllTimelines } from '@/lib/timeline';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';

export const metadata = buildMetadata({
  title: 'The story',
  description:
    'How a personal fitness app and a single /pm-workflow command grew into a measured framework — who built it, what it is, how it started, and how it grew.',
  slug: '/story',
});

const STORY_BREADCRUMBS = breadcrumbJsonLd([
  { name: 'Home', href: '/' },
  { name: 'The story', href: '/story' },
]);

// /story — the deep narrative offloaded from the compact home (dual-audience
// redesign T6). Lens-aware framing; reuses the OriginNarrative beats (who →
// started) and the interactive Timeline (grew). story_scroll_depth fires per
// section via StoryScrollTracker.
export default async function StoryPage() {
  const timelines = await buildAllTimelines();
  return (
    <StoryScrollTracker>
      <JsonLd data={STORY_BREADCRUMBS} />

      <section
        data-story-section="who"
        className="max-w-4xl mx-auto px-6 pt-16 pb-8"
      >
        <h1 className="font-serif text-[length:var(--text-display-lg)] leading-tight">
          The story
        </h1>
        <p className="mt-4 font-sans text-lg text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)] leading-relaxed">
          Who built this, what it is, how it started, and how it grew into a framework that measures
          itself.
        </p>
        <StoryLensLine />
      </section>

      {/* started — the origin beats (personal project → /pm-workflow → evolution) */}
      <div data-story-section="started">
        <OriginNarrative />
      </div>

      {/* grew — the interactive evolution timeline */}
      <div data-story-section="grew">
        <Timeline timelines={timelines} />
      </div>

      {/* today — where it landed + where to go next */}
      <section
        data-story-section="today"
        className="max-w-4xl mx-auto px-6 py-16 text-center"
      >
        <h2 className="font-serif text-[length:var(--text-display-md)]">Where it is today</h2>
        <p className="mt-4 font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)] mx-auto leading-relaxed">
          Sixteen features shipped, eight framework versions, a public audit trail, and a living
          design system — all documented, including the regressions. Pick a thread:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 font-sans text-sm">
          <Link
            href="/framework"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-5 py-3 font-medium hover:border-[var(--color-brand-indigo)] hover:text-[var(--color-brand-indigo)] transition-colors"
          >
            The framework <ArrowRight size={15} aria-hidden />
          </Link>
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-5 py-3 font-medium hover:border-[var(--color-brand-indigo)] hover:text-[var(--color-brand-indigo)] transition-colors"
          >
            Case studies <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </section>
    </StoryScrollTracker>
  );
}
