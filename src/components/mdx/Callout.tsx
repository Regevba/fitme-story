import type { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

// Callout — generic indigo/amber/emerald info box for case-study body prose
// that needs neutral emphasis without the specific semantics of the
// callout family (HonestDisclosure / TriggerIncident / MemoryRef /
// PredecessorChain / KillCriterionResolution). Introduced 2026-06-04 for
// the v7.9.1 showcase slots (45/46/47) which authored generic <Callout>
// blocks that had no backing component.
//
// Accepts either `variant` or `type` (the v7.9.1 slots disagreed on the
// prop name; both are normalized here) → info | warning | success.
//
// MDX usage (no inline import — registered globally in mdx-components.tsx):
//   <Callout variant="info">
//     The planned v7.10 GATE_COVERAGE_ZERO meta-check can now be O(1).
//   </Callout>

type CalloutKind = 'info' | 'warning' | 'success';

const KIND_STYLES: Record<
  CalloutKind,
  { accent: string; label: string; Icon: typeof Info }
> = {
  info: {
    accent: 'var(--color-brand-indigo)',
    label: 'Note',
    Icon: Info,
  },
  warning: {
    accent: 'var(--color-brand-coral)',
    label: 'Heads up',
    Icon: AlertTriangle,
  },
  success: {
    accent: 'var(--color-brand-indigo)',
    label: 'Resolved',
    Icon: CheckCircle,
  },
};

export function Callout({
  children,
  variant,
  type,
}: {
  children: ReactNode;
  variant?: CalloutKind;
  type?: CalloutKind;
}) {
  const kind: CalloutKind = variant ?? type ?? 'info';
  const { accent, label, Icon } = KIND_STYLES[kind] ?? KIND_STYLES.info;

  return (
    <aside
      role="note"
      aria-label={label}
      className="not-prose my-6 rounded-md border-l-4 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] p-5 font-sans text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]"
      style={{ borderColor: accent }}
    >
      <div
        className="flex items-center gap-2 mb-2"
        style={{ color: accent }}
      >
        <Icon size={14} aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider font-semibold">
          {label}
        </span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">{children}</div>
    </aside>
  );
}
