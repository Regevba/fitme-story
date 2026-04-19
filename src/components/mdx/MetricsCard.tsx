export interface Metric {
  value: string;
  label: string;
}

export function MetricsCard({
  metrics,
  variant = 'pinned',
}: {
  metrics: Metric[];
  variant?: 'pinned' | 'sidebar';
}) {
  const containerCls =
    variant === 'pinned'
      ? 'md:sticky md:top-24 my-8 p-4 rounded-lg bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]'
      : 'my-8 p-4 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]';
  return (
    <aside className={containerCls} aria-label="Key metrics">
      <ul className="space-y-3 font-sans">
        {metrics.map((m, i) => (
          <li key={i}>
            <div className="text-2xl font-semibold text-[var(--color-brand-indigo)]">{m.value}</div>
            <div className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">{m.label}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
