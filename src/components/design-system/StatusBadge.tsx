import * as React from 'react';
import type { ComponentStatus } from '@/lib/design-system';

const STATUS_CLASSES: Record<ComponentStatus, string> = {
  Stable:
    'bg-[var(--color-brand-indigo)] text-white',
  Experimental:
    'bg-[var(--skill-research)] text-[var(--color-neutral-900)]',
  Deprecated:
    'bg-[var(--color-neutral-500)] text-white line-through',
  Internal:
    'bg-[var(--color-neutral-700)] text-[var(--color-neutral-100)]',
};

const STATUS_DESCRIPTIONS: Record<ComponentStatus, string> = {
  Stable: 'Production-ready. Safe to use anywhere.',
  Experimental: 'In trial. API may change.',
  Deprecated: 'Will be removed. Migrate to alternative.',
  Internal: 'For internal/operator surfaces only.',
};

type Props = {
  status: ComponentStatus;
};

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold uppercase tracking-wide ${STATUS_CLASSES[status]}`}
      aria-label={`Component status: ${status}. ${STATUS_DESCRIPTIONS[status]}`}
      title={STATUS_DESCRIPTIONS[status]}
      data-status={status}
    >
      {status}
    </span>
  );
}
