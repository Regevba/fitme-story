export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  domain: string;
  description: string;
}

const SEVERITY_COLOR: Record<Finding['severity'], string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400',
};

export function FindingsTable({ findings }: { findings: Finding[] }) {
  return (
    <div className="my-10 overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-[var(--color-neutral-300)] text-left text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
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
