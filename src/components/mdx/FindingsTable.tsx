export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  domain: string;
  description: string;
}

// Severity dot colors. Critical/high reuse the brand coral (the site's single
// "danger/attention" accent); medium uses amber (matches the T2 tier badge);
// low uses a neutral token. Keeps the table in the site palette rather than
// raw Tailwind red/orange/yellow.
const SEVERITY_COLOR: Record<Finding['severity'], string> = {
  critical: 'bg-[var(--color-brand-coral)]',
  high: 'bg-[var(--color-brand-coral)]/70',
  medium: 'bg-amber-500 dark:bg-amber-400',
  low: 'bg-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-700)]',
};

export function FindingsTable({ findings }: { findings: Finding[] }) {
  return (
    <div className="not-prose my-10 overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-700)] text-left text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
            <th className="py-2">ID</th>
            <th className="py-2">Severity</th>
            <th className="py-2">Domain</th>
            <th className="py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f) => (
            <tr key={f.id} className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
              <td className="py-2 font-mono text-xs">{f.id}</td>
              <td className="py-2">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${SEVERITY_COLOR[f.severity]}`} />
                {f.severity}
              </td>
              <td className="py-2">{f.domain}</td>
              <td className="py-2">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
