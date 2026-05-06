'use client';

/**
 * TrackedExternalLink — UCC T36 Phase 2 client island.
 *
 * Wraps a plain `<a>` tag to fire the GA4 `dashboard_external_link` event
 * on click. Used for the layout's GitHub link and any per-page link that
 * leaves the dashboard (KnowledgeHub doc cards, etc.).
 *
 * Always opens in a new tab with `noopener,noreferrer`.
 */

import type { ReactNode } from 'react';
import {
  trackExternalLink,
  type ExternalLinkType,
} from '@/lib/control-room/analytics';

export interface TrackedExternalLinkProps {
  href: string;
  linkType: ExternalLinkType;
  /** Opaque target identifier (e.g. issue number, doc slug, repo name). */
  targetId: string;
  className?: string;
  children: ReactNode;
}

export function TrackedExternalLink({
  href,
  linkType,
  targetId,
  className,
  children,
}: TrackedExternalLinkProps) {
  const handleClick = () => {
    trackExternalLink({ link_type: linkType, target_id: targetId });
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
