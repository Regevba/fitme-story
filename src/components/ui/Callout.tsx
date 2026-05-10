import * as React from 'react';
import { Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

export type CalloutVariant = 'info' | 'warn' | 'success' | 'danger';

export interface CalloutProps {
  /** Semantic variant — drives accent color, icon, default a11y label. */
  variant?: CalloutVariant;
  /** Optional eyebrow title (renders above the body in the accent color). */
  title?: string;
  /** Override the default a11y label. Defaults to the title or variant name. */
  ariaLabel?: string;
  /** Hide the variant icon (e.g., when title alone is sufficient). */
  hideIcon?: boolean;
  /** Body content. */
  children: React.ReactNode;
  /** Additional className for one-off layout overrides. */
  className?: string;
}

const accentClasses: Record<CalloutVariant, string> = {
  info: 'border-[var(--color-brand-indigo)] text-[var(--color-brand-indigo)]',
  warn: 'border-[var(--skill-research)] text-[var(--skill-research)]',
  success: 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300',
  danger: 'border-[var(--color-brand-coral)] text-[var(--color-brand-coral)]',
};

const variantIcons: Record<CalloutVariant, React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  info: Info,
  warn: AlertTriangle,
  success: CheckCircle,
  danger: AlertOctagon,
};

const variantLabels: Record<CalloutVariant, string> = {
  info: 'Information',
  warn: 'Warning',
  success: 'Success',
  danger: 'Important',
};

/**
 * Generic semantic callout for non-MDX surfaces — info / warn / success /
 * danger variants with left-border accent + tinted background + optional
 * eyebrow title.
 *
 * For case-study MDX bodies, use the specialized callouts in
 * src/components/mdx/callouts/ (HonestDisclosure, TriggerIncident,
 * MemoryRef, PredecessorChain, KillCriterionResolution) — those carry
 * fixed semantic meaning + Code Connect mappings.
 *
 * Closes BHF-2 from DS lens audit 2026-05-10 — replaces inline
 * rounded-{md,lg} border + bg-neutral-50 + manual heading patterns
 * across /trust, /research, /pm-flow.
 */
export function Callout({
  variant = 'info',
  title,
  ariaLabel,
  hideIcon = false,
  children,
  className = '',
}: CalloutProps) {
  const Icon = variantIcons[variant];
  const label = ariaLabel ?? title ?? variantLabels[variant];

  return (
    <aside
      role="note"
      aria-label={label}
      className={`not-prose my-6 rounded-md border-l-4 ${accentClasses[variant].split(' ')[0]} bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] p-5 font-sans text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] ${className}`.trim()}
    >
      {(title || !hideIcon) && (
        <div
          className={`flex items-center gap-2 mb-2 ${accentClasses[variant].split(' ').slice(1).join(' ')}`}
        >
          {!hideIcon && <Icon size={14} aria-hidden={true} />}
          {title && (
            <span className="text-xs uppercase tracking-wider font-semibold">
              {title}
            </span>
          )}
        </div>
      )}
      {children}
    </aside>
  );
}
