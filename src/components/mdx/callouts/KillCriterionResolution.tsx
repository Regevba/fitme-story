import type { ReactNode } from 'react';
import { Clock, Check, AlertCircle } from 'lucide-react';

// KillCriterionResolution — sister to the SummaryCard's
// KillCriterionBanner. The Banner shows pre-launch / at-launch state
// (will any kill criterion fire?). This component shows the post-T+7d
// outcome (did any fire? what was resolved?). Closes audit CS-014 +
// CS-024 + CS-008 (the slot 26 ucc-passkey-auth case study has
// "Pending — week-1 telemetry gate" as its Resolution; this component
// renders that pattern with status-aware visual treatment).
//
// MDX usage:
//   <KillCriterionResolution
//     status="clear"
//     dueDate="2026-05-15"
//     resolution="0 of 2 kill criteria fired in week 1"
//   />
//
//   <KillCriterionResolution status="pending" dueDate="2026-05-15">
//     The week-1 telemetry gate has not yet fired. Will update at
//     2026-05-15.
//   </KillCriterionResolution>
//
//   <KillCriterionResolution status="fired" dueDate="2026-05-15" resolution="...">
//     The fired kill criterion: registration ceremony failed on 6.2% of
//     attempted devices in week 1, exceeding the 5% threshold. Rolled
//     back to UCC_AUTH_MODE=basic; passkey rollout deferred to v7.9.
//   </KillCriterionResolution>
type Status = 'pending' | 'clear' | 'fired';

interface Theme {
  border: string;
  text: string;
  icon: ReactNode;
  label: string;
}

const THEMES: Record<Status, Theme> = {
  pending: {
    border: 'border-[var(--color-brand-indigo)]',
    text: 'text-[var(--color-brand-indigo)]',
    icon: <Clock size={14} aria-hidden="true" />,
    label: 'Kill criterion resolution — pending',
  },
  clear: {
    border: 'border-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: <Check size={14} aria-hidden="true" />,
    label: 'Kill criterion resolution — clear',
  },
  fired: {
    border: 'border-[var(--color-brand-coral)]',
    text: 'text-[var(--color-brand-coral)]',
    icon: <AlertCircle size={14} aria-hidden="true" />,
    label: 'Kill criterion resolution — fired',
  },
};

export function KillCriterionResolution({
  status,
  dueDate,
  resolution,
  children,
}: {
  status: Status;
  dueDate: string;
  resolution?: string;
  children?: ReactNode;
}) {
  const theme = THEMES[status];
  return (
    <aside
      role="note"
      aria-label={theme.label}
      className={
        'not-prose my-6 rounded-md border-l-4 ' +
        theme.border +
        ' bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] p-5'
      }
    >
      <div className={'flex items-center gap-2 mb-2 ' + theme.text}>
        {theme.icon}
        <span className="font-sans text-xs uppercase tracking-wider font-semibold">
          {theme.label}
        </span>
        <span className="text-[var(--color-neutral-500)] font-sans text-xs">
          · due <time dateTime={dueDate}>{dueDate}</time>
        </span>
      </div>
      {resolution ? (
        <p className="font-sans text-sm leading-relaxed text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-2">
          {resolution}
        </p>
      ) : null}
      {children ? (
        <div className="prose prose-sm dark:prose-invert max-w-none mt-2 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          {children}
        </div>
      ) : null}
    </aside>
  );
}
