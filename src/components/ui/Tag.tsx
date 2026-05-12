import * as React from 'react';

export type TagVariant = 'flagship' | 'standard' | 'tier_t1' | 'muted';

type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
};

const variantClasses: Record<TagVariant, string> = {
  flagship: 'bg-[var(--color-brand-coral)] text-white',
  standard:
    'bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-200)]',
  tier_t1:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  // muted: less-emphasis informational tag — used for /search category badges
  // and similar contexts where the tag is supplementary, not primary.
  // Distinct from standard via rounded-full + lighter neutral surface.
  muted:
    'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)] !rounded-full',
};

const baseClasses =
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-sans font-medium';

export function Tag({
  variant = 'standard',
  className = '',
  children,
  ...rest
}: TagProps) {
  return (
    <span
      {...rest}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
