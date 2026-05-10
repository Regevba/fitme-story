import * as React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-brand-indigo)] text-white hover:bg-[var(--color-brand-indigo-hover)]',
  secondary:
    'bg-[var(--color-neutral-100)] text-[var(--color-neutral-900)] border border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-100)] dark:border-[var(--color-neutral-700)] dark:hover:bg-[var(--color-neutral-700)]',
  ghost:
    'bg-transparent text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-300)] dark:hover:bg-[var(--color-neutral-800)]',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-md text-sm font-sans font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] disabled:opacity-50 disabled:pointer-events-none';

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
