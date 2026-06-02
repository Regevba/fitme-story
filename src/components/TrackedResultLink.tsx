'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackSearchResultClicked } from '@/lib/search-analytics';

interface TrackedResultLinkProps {
  href: string;
  resultCategory: string;
  resultRank: number;
  queryLength: number;
  className?: string;
  children: ReactNode;
}

/**
 * next/link wrapper that fires `search_result_clicked` before navigation.
 * Used by each search result so we can measure click-through, rank
 * distribution, and which corpus (case-study / glossary / research /
 * framework) earns the clicks. The query text is never sent — only its length.
 */
export function TrackedResultLink({
  href,
  resultCategory,
  resultRank,
  queryLength,
  className,
  children,
}: TrackedResultLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackSearchResultClicked({
          result_category: resultCategory,
          result_rank: resultRank,
          query_length: queryLength,
        })
      }
    >
      {children}
    </Link>
  );
}
