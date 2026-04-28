// Alternative B — "Anthology + Card Quote"
// The per-case page IS the card. Long-form body is collapsed under a disclosure
// (one click deeper). The primary surface is the cross-case anthology table at
// /control-room/case-studies, which links here for the short read.

import type { Metadata } from 'next';
import { Disclosure } from '@/components/ui/Disclosure';
import {
  PreviewBanner,
  SummaryCard,
  KeyNumbersPanel,
  HonestDisclosuresPanel,
  KillCriteriaPanel,
  DeferredItemsPanel,
  SwitchAlternativeBar,
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
  title: 'Alt B — Anthology + Card Quote (preview)',
  description:
    'Preview of Alternative B for the case-study presentation refactor. Card is the primary surface; long-form body is one click deeper.',
  robots: { index: false, follow: false },
};

export default function AlternativeBPreview() {
  return (
    <>
      <PreviewBanner alt="B" />

      {/* Mock anthology back-link to suggest the IA above this page */}
      <div className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-900)] border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
        <div className="max-w-[var(--measure-wide)] mx-auto px-6 py-2 font-sans text-xs text-[var(--color-neutral-500)]">
          ← <span className="text-[var(--color-brand-indigo)] font-medium">/control-room/case-studies</span>{' '}
          (anthology view) · You&apos;re on the short tier for this case.
        </div>
      </div>

      <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-12">
        <div className="font-sans text-sm uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
          Short tier · ~60s
        </div>

        {/* Card is the page */}
        <SummaryCard
          title={v75Meta.title}
          version={v75Meta.version}
          shipDate={v75Meta.shipDate}
          workType={v75Meta.workType}
          trigger={v75Meta.trigger}
          tldr={v75Meta.tldr}
          showDisclosuresInline={false}
          honestDisclosures={v75HonestDisclosures}
        />

        <div className="mt-10 space-y-10">
          <KeyNumbersPanel numbers={v75KeyNumbers} />
          <KillCriteriaPanel
            threshold={v75KillCriteria.threshold}
            fired={v75KillCriteria.fired}
            evidence={v75KillCriteria.evidence}
          />
          <HonestDisclosuresPanel disclosures={v75HonestDisclosures} />
          <DeferredItemsPanel items={v75DeferredItems} />
        </div>

        {/* Long body collapsed */}
        <div className="mt-12">
          <Disclosure
            label="View full methodology"
            summary="Gemini audit deep-dive · all 8 defenses · end-to-end data flow · lessons (~15 min read)"
            defaultOpen={false}
          >
            <LongFormBody />
          </Disclosure>
        </div>

        <SwitchAlternativeBar current="B" />
      </article>
    </>
  );
}
