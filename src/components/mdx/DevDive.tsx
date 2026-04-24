import { Wrench } from 'lucide-react';

export function DevDive({ children }: { children: React.ReactNode }) {
  return (
    <aside
      role="note"
      aria-label="Developer deep-dive"
      className="not-prose my-8 rounded-md border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] p-5 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
        <Wrench aria-hidden="true" width={14} height={14} strokeWidth={1.75} />
        Developer deep-dive
      </div>
      <div className="mt-3 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        {children}
      </div>
    </aside>
  );
}
