// Alternative A — "Web-First Card + Disclosure Tail"
// Per-case page stays primary. Lead with a tight summary card; full narrative
// body remains below, untouched. The card derives from frontmatter.

import type { Metadata } from 'next';
import {
  PreviewBanner,
  SummaryCard,
  KeyNumbersChart,
  KillCriterionBanner,
  DeferredItemsList,
  SectionDivider,
  SwitchAlternativeBar,
  DataKey,
} from '../_components';
import {
  v75Meta,
  v75KeyNumbers,
  v75HonestDisclosures,
  v75DeferredItems,
  v75KillCriteria,
  LongFormBody,
} from '../_data';

export const metadata: Metadata = {
  title: 'Alt A — Web-First Card + Disclosure Tail (preview)',
  description:
    'Preview of Alternative A for the case-study presentation refactor. Per-case page is primary, leads with a card.',
  robots: { index: false, follow: false },
};

export default function AlternativeAPreview() {
  return (
    <>
      <PreviewBanner alt="A" />
      <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-12">
        <div className="font-sans text-sm uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
          Case study · {v75Meta.readingTime}
        </div>

        {/* Card on top */}
        <SummaryCard
          title={v75Meta.title}
          version={v75Meta.version}
          shipDate={v75Meta.shipDate}
          workType={v75Meta.workType}
          trigger={v75Meta.trigger}
          tldr={v75Meta.tldr}
          showDisclosuresInline={true}
          honestDisclosures={v75HonestDisclosures}
        />

        {/* Reader's key — collapsed by default; explains conventions */}
        <div className="mt-4">
          <DataKey />
        </div>

        <div className="mt-6 space-y-4">
          <KeyNumbersChart numbers={v75KeyNumbers} />
          <KillCriterionBanner
            threshold={v75KillCriteria.threshold}
            fired={v75KillCriteria.fired}
            evidence={v75KillCriteria.evidence}
          />
          <DeferredItemsList items={v75DeferredItems} />
        </div>

        <SectionDivider>Full narrative below</SectionDivider>

        {/* Body untouched — original case-study prose */}
        <LongFormBody />

        <SwitchAlternativeBar current="A" />
      </article>
    </>
  );
}
