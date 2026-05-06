'use client';

/**
 * TrackedDocLink — UCC T36 Phase 2 client island.
 *
 * Anchor wrapper for KnowledgeHub doc cards. Fires the GA4
 * `dashboard_knowledge_open` event on click with the doc path + group label.
 * Always opens external (target=_blank) since docs link out to GitHub or
 * other source-of-truth surfaces.
 *
 * Different from `TrackedExternalLink` because the PRD §10.1 declares
 * `dashboard_knowledge_open` as a distinct event with different params
 * (`doc_path` + `doc_group`) — used for KnowledgeHub-scoped funnel
 * analysis without polluting the generic external-link bucket.
 */

import type { ReactNode } from 'react';
import { trackKnowledgeOpen } from '@/lib/control-room/analytics';

export interface TrackedDocLinkProps {
  href: string;
  /** Doc path (e.g. `docs/case-studies/foo.md`). */
  docPath: string;
  /** Group label (e.g. `case-studies`, `master-plan`, or `featured` for hero docs). */
  docGroup: string;
  className?: string;
  children: ReactNode;
}

export function TrackedDocLink({
  href,
  docPath,
  docGroup,
  className,
  children,
}: TrackedDocLinkProps) {
  const handleClick = () => {
    trackKnowledgeOpen({ doc_path: docPath, doc_group: docGroup });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
