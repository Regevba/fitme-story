import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

// HonestDisclosure — coral-bordered callout for the recurring "Honest
// disclosures" prose pattern observed across 4+ case studies (slot 22,
// slot 23, slot 25, slot 26). Closes audit CS-014 + CS-024 (2026-05-08).
//
// The Alternative A chrome (2026-04-28) renders frontmatter
// `honest_disclosures` array inside the SummaryCard. This component
// covers the *prose-level* disclosure pattern that appears in body
// content — distinct from the SummaryCard array, with its own visual
// distinct from regular prose.
//
// MDX usage:
//   <HonestDisclosure>
//     The eval suite passed but only because we mocked the rate-limit
//     API. Real network conditions remain untested.
//   </HonestDisclosure>
export function HonestDisclosure({ children }: { children: ReactNode }) {
  return (
    <aside
      role="note"
      aria-label="Honest disclosure"
      className="not-prose my-6 rounded-md border-l-4 border-[var(--color-brand-coral)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] p-5 font-sans text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]"
    >
      <div className="flex items-center gap-2 mb-2 text-[var(--color-brand-coral)]">
        <AlertTriangle size={14} aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider font-semibold">
          Honest disclosure
        </span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">{children}</div>
    </aside>
  );
}
