import * as React from 'react';
import Link from 'next/link';

type FrameworkVersionCardProps = {
  href?: string;
  version: string;
  date?: string;
  outcome?: string;
};

export function FrameworkVersionCard({
  href,
  version,
  date,
  outcome,
}: FrameworkVersionCardProps) {
  const inner = (
    <div className="p-6 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)] hover:shadow-lg transition-all">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-lg text-[var(--color-brand-indigo)]">
          v{version}
        </span>
        {date ? (
          <span className="text-xs text-[var(--color-neutral-500)] font-sans">
            {date}
          </span>
        ) : null}
      </div>
      {outcome ? (
        <p className="mt-3 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          {outcome}
        </p>
      ) : null}
    </div>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
