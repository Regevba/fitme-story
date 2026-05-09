import * as React from 'react';
import Link from 'next/link';
import { Tag, type TagVariant } from './Tag';

type CaseStudyCardProps = {
  href: string;
  title: string;
  tldr?: string;
  tagLabel?: string;
  tagVariant?: TagVariant;
};

export function CaseStudyCard({
  href,
  title,
  tldr,
  tagLabel,
  tagVariant = 'standard',
}: CaseStudyCardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)] hover:shadow-lg transition-all"
    >
      {tagLabel ? (
        <Tag variant={tagVariant} className="mb-3">
          {tagLabel}
        </Tag>
      ) : null}
      <h3 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
        {title}
      </h3>
      {tldr ? (
        <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          {tldr}
        </p>
      ) : null}
    </Link>
  );
}
