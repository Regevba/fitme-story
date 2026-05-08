import type { ReactNode } from 'react';
import { Calendar } from 'lucide-react';

// TriggerIncident — for the recurring "Incident N — DATE" narrative
// pattern (slot 25 has Incident 1 + Incident 2; slots 22/23 carry
// analogous trigger narratives). Closes audit CS-014 + CS-024.
//
// MDX usage:
//   <TriggerIncident
//     date="2026-04-30"
//     title="Incident 1 — HADF Phase 2 plist drift"
//     failureModes={['cwd-mismatch', 'launchd race', 'mid-flight isolation']}
//   >
//     The launchd plist anchored to the canonical repo path; relative
//     writes resolved against the wrong tree. Required mid-flight
//     isolation + restart + remerge.
//   </TriggerIncident>
export function TriggerIncident({
  date,
  title,
  failureModes,
  children,
}: {
  date: string;
  title: string;
  failureModes?: string[];
  children: ReactNode;
}) {
  return (
    <aside
      role="note"
      aria-label={`Trigger incident: ${title}`}
      className="not-prose my-6 rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] p-6"
    >
      <div className="flex items-center gap-2 mb-3 text-[var(--color-brand-indigo)] font-sans text-xs uppercase tracking-wider font-semibold">
        <Calendar size={14} aria-hidden="true" />
        <time dateTime={date}>{date}</time>
        <span className="text-[var(--color-neutral-500)]">·</span>
        <span>Trigger incident</span>
      </div>
      <h3 className="font-serif text-xl mt-1 mb-2 text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
        {title}
      </h3>
      {failureModes && failureModes.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5 font-sans text-xs">
          {failureModes.map((mode) => (
            <span
              key={mode}
              className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-900)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] font-mono"
            >
              {mode}
            </span>
          ))}
        </div>
      ) : null}
      <div className="prose prose-sm dark:prose-invert max-w-none mt-2 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        {children}
      </div>
    </aside>
  );
}
