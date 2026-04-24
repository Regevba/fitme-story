interface PRNode {
  id: string;
  label: string;          // "m2a"
  title?: string;         // "PR #126"
  base: string | null;    // the parent branch id; null for main
  highlight?: 'ok' | 'wrong' | 'intended';
}

interface Props {
  nodes?: PRNode[];
  nodesJson?: string;
  caption?: string;
}

const HIGHLIGHT_STYLES: Record<NonNullable<PRNode['highlight']>, { bg: string; border: string; fg: string }> = {
  ok:       { bg: '#ECFDF5', border: 'var(--skill-release)',     fg: 'var(--color-neutral-800)' },
  wrong:    { bg: '#FEF2F2', border: 'var(--color-brand-coral)', fg: 'var(--color-brand-coral)' },
  intended: { bg: '#EFF6FF', border: 'var(--color-brand-indigo)',fg: 'var(--color-brand-indigo)' },
};

export function PRStackDiagram({ nodes, nodesJson, caption }: Props) {
  const data: PRNode[] =
    nodes ?? (nodesJson ? (JSON.parse(nodesJson) as PRNode[]) : []);
  if (data.length === 0) return null;

  const byId = new Map(data.map((n) => [n.id, n]));

  return (
    <figure
      className="my-10 max-w-[var(--measure-wide)] mx-auto font-sans"
      aria-label={`Stacked PR diagram with ${data.length} branches`}
    >
      <ul className="space-y-3">
        {data.map((n) => {
          const style = n.highlight ? HIGHLIGHT_STYLES[n.highlight] : null;
          const base = n.base ? byId.get(n.base) : null;
          return (
            <li
              key={n.id}
              className="flex items-center gap-3"
              style={{ paddingLeft: base ? '1.5rem' : 0 }}
            >
              <div
                className="flex-1 rounded-md border px-4 py-3"
                style={{
                  backgroundColor: style ? style.bg : 'var(--color-neutral-50)',
                  borderColor: style ? style.border : 'var(--color-neutral-300)',
                  color: style ? style.fg : 'var(--color-neutral-800)',
                }}
              >
                <div className="flex items-baseline gap-2">
                  <code className="font-mono text-sm font-semibold">{n.label}</code>
                  {n.title && (
                    <span className="text-xs text-[var(--color-neutral-500)]">{n.title}</span>
                  )}
                </div>
                {n.base && (
                  <div className="text-[11px] text-[var(--color-neutral-500)] mt-0.5">
                    base: <code className="font-mono">{n.base}</code>
                  </div>
                )}
              </div>
              {n.highlight === 'wrong' && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-brand-coral)' }}
                  aria-label="Wrong base branch"
                >
                  ⚠ wrong base
                </span>
              )}
              {n.highlight === 'intended' && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-brand-indigo)' }}
                >
                  intended base
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {caption && (
        <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
