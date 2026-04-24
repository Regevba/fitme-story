interface FunnelTier {
  label: string;
  count: number;
  colorVar?: string;
}

interface Props {
  tiers?: FunnelTier[];
  tiersJson?: string;
  caption?: string;
}

export function AuditFunnel({ tiers, tiersJson, caption }: Props) {
  const data: FunnelTier[] =
    tiers ?? (tiersJson ? (JSON.parse(tiersJson) as FunnelTier[]) : []);
  if (data.length === 0) return null;

  const max = Math.max(...data.map((t) => t.count));

  return (
    <figure
      className="my-10 max-w-[var(--measure-wide)] mx-auto font-sans"
      aria-label={`Audit funnel: ${data.map((t) => `${t.count} ${t.label}`).join(' → ')}`}
    >
      <ol className="space-y-3">
        {data.map((tier, i) => {
          const widthPct = Math.max(12, (tier.count / max) * 100);
          const accent = tier.colorVar ?? 'var(--color-brand-indigo)';
          return (
            <li key={tier.label} className="flex items-center gap-4">
              <div className="flex-1">
                <div
                  className="relative h-12 rounded-md overflow-hidden border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]"
                  style={{ background: 'var(--color-neutral-50)' }}
                >
                  <div
                    className="h-full flex items-center justify-center text-white font-semibold tabular-nums"
                    style={{
                      width: `${widthPct}%`,
                      background: accent,
                      marginLeft: `${(100 - widthPct) / 2}%`,
                    }}
                  >
                    {tier.count}
                  </div>
                </div>
              </div>
              <div className="w-36 shrink-0 text-sm">
                <div className="font-semibold text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-200)]">
                  {tier.label}
                </div>
                {i < data.length - 1 && (
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    ↓ {data[i + 1].label.toLowerCase()}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {caption && (
        <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
