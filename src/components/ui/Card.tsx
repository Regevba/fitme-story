import * as React from 'react';

export type CardVariant = 'flat' | 'tinted';
export type CardPadding = 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Background style. `flat` = bordered only; `tinted` = bordered + neutral-50 fill. */
  variant?: CardVariant;
  /** Padding scale. `md` = p-6; `lg` = p-6 sm:p-8 (used for hero/methodology blocks). */
  padding?: CardPadding;
  /** Adds hover border + shadow; use when the Card wraps an interactive element (Link, button). */
  interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  flat: '',
  tinted: 'bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)]',
};

const paddingClasses: Record<CardPadding, string> = {
  md: 'p-6',
  lg: 'p-6 sm:p-8',
};

const baseClasses =
  'rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]';

const interactiveClasses =
  'transition-colors hover:border-[var(--color-brand-indigo)]';

export function Card({
  variant = 'flat',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    interactive ? interactiveClasses : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  );
}
