import * as React from 'react';
import { Button, type ButtonVariant } from '@/components/ui/Button';
import { Tag, type TagVariant } from '@/components/ui/Tag';

/**
 * Pre-baked variant-grid renderers for the showcase. Each renderer
 * takes no props and emits a horizontal grid of all variants of a
 * given primitive — used inside <ComponentCard>'s `preview` slot.
 */

export function ButtonVariants() {
  const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {variants.map((v) => (
        <Button key={v} variant={v}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </Button>
      ))}
    </div>
  );
}

export function TagVariants() {
  const variants: TagVariant[] = ['flagship', 'standard', 'tier_t1'];
  const labels: Record<TagVariant, string> = {
    flagship: 'Flagship',
    standard: 'Standard',
    tier_t1: 'T1',
  };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {variants.map((v) => (
        <Tag key={v} variant={v}>
          {labels[v]}
        </Tag>
      ))}
    </div>
  );
}

/**
 * Generic grid wrapper for inline variant rendering in case-by-case
 * usage. Accepts arbitrary children and lays them out in a responsive
 * grid with a small label per slot.
 */

type GridProps = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
};

export function VariantGrid({ children, columns = 3 }: GridProps) {
  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : columns === 3
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
  return <div className={`grid gap-3 ${gridClass}`}>{children}</div>;
}
