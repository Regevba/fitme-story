/**
 * Control-room SourceHealth — TypeScript port of dashboard/src/components/SourceHealth.jsx
 *
 * UCC task T24. Renders a horizontal grid of data-source pills (GitHub, Linear,
 * Notion, etc.) showing health status, count, optional mode badge, and per-source
 * alert count. Used to surface stale or unreachable sync sources at a glance.
 *
 * Server-compatible: pure render, no hooks, no client APIs. Safe to render
 * inside layout.tsx / page.tsx as an RSC.
 *
 * Re-skin per token-map.md: dashboard's bespoke `rounded-card`, `shadow-card`,
 * `bg-[#1A1F2E]` replaced with fitme-story neutrals + standard Tailwind.
 *
 * Source: dashboard/src/components/SourceHealth.jsx (65 lines)
 */

export type SourceKey =
  | 'github'
  | 'static'
  | 'state'
  | 'shared'
  | 'linear'
  | 'notion'
  | 'vercel'
  | 'analytics'
  | 'docs';

export interface SourceStatus {
  count: number;
  healthy?: boolean;
  alerts?: number;
  mode?: string;
}

interface SourceMeta {
  label: string;
  icon: string;
}

const SOURCE_META: Record<SourceKey, SourceMeta> = {
  github: { label: 'GitHub Issues', icon: '●' },
  static: { label: 'Repo Data', icon: '●' },
  state: { label: 'PM State', icon: '●' },
  shared: { label: 'Shared Layer', icon: '●' },
  linear: { label: 'Linear', icon: '●' },
  notion: { label: 'Notion', icon: '○' },
  vercel: { label: 'Vercel', icon: '◍' },
  analytics: { label: 'Analytics', icon: '●' },
  docs: { label: 'Docs Debt', icon: '◌' },
};

export interface SourceHealthProps {
  sources?: Partial<Record<SourceKey, SourceStatus>>;
  lastSync?: string | null;
}

export function SourceHealth({ sources = {}, lastSync = null }: SourceHealthProps) {
  const totalAlerts = Object.values(sources).reduce<number>(
    (sum, s) => sum + (s?.alerts ?? 0),
    0,
  );

  return (
    <div className="rounded-xl bg-white p-4 shadow-md dark:bg-[var(--color-neutral-800)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
          Source Health
        </h3>
        {lastSync ? (
          <span className="text-[10px] text-[var(--color-neutral-500)]">Last sync: {lastSync}</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {(Object.entries(sources) as [SourceKey, SourceStatus | undefined][]).map(([key, src]) => {
          if (!src) return null;
          const meta = SOURCE_META[key] ?? { label: key, icon: '●' };
          const color = src.healthy
            ? 'text-emerald-500'
            : (src.alerts ?? 0) > 0
              ? 'text-amber-500'
              : 'text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-700)]';

          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span className={color}>{meta.icon}</span>
              <span className="text-[var(--color-neutral-500)]">{meta.label}</span>
              <span className="font-mono font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                {src.count}
              </span>
              {src.mode ? (
                <span className="rounded-full bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-neutral-500)] dark:bg-white/[0.08] dark:text-white/55">
                  {src.mode}
                </span>
              ) : null}
              {(src.alerts ?? 0) > 0 ? (
                <span className="text-[10px] text-amber-500">({src.alerts})</span>
              ) : null}
            </div>
          );
        })}
      </div>

      {totalAlerts > 0 ? (
        <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400">
          {totalAlerts} discrepanc{totalAlerts === 1 ? 'y' : 'ies'} detected
        </div>
      ) : null}
    </div>
  );
}
