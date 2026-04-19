import type { ReactNode } from 'react';

interface Props {
  value: string;             // "12.4×", "48%", "6.5×"
  label: string;             // "parallel throughput", "tool-budget reduction"
  context?: ReactNode;       // optional 1–2 sentence paragraph below
  accentVar?: string;        // e.g. 'var(--skill-qa)' — defaults to brand-indigo
  size?: 'xl' | 'lg';        // default 'xl'
  className?: string;
}

export function HeroMetric({
  value,
  label,
  context,
  accentVar = 'var(--color-brand-indigo)',
  size = 'xl',
  className = '',
}: Props) {
  const valueClasses = size === 'xl'
    ? 'text-[length:var(--text-display-xl)] leading-[0.95]'
    : 'text-[length:var(--text-display-lg)] leading-[1]';

  return (
    <figure
      className={`my-10 max-w-[var(--measure-body)] mx-auto text-center ${className}`}
      aria-label={`${value} ${label}`}
    >
      <div className={`font-serif font-semibold ${valueClasses}`} style={{ color: accentVar }}>
        {value}
      </div>
      <figcaption className="mt-3 font-sans text-sm uppercase tracking-wider text-[var(--color-neutral-500)]">
        {label}
      </figcaption>
      {context && (
        <div className="mt-6 text-base text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          {context}
        </div>
      )}
    </figure>
  );
}
