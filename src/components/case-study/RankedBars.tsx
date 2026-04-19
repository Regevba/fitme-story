'use client';

interface BarItem {
  label: string;        // "Critical", "High", "Medium", "Low"
  value: number;        // e.g. 12, 49, 74, 50
  colorVar?: string;    // optional, defaults to brand-indigo
  valueSuffix?: string; // optional, e.g. " findings" or "%"
}

interface Props {
  // Object-form prop (for programmatic use)
  items?: BarItem[];
  // JSON string prop (for MDX inline use — RSC-safe primitive)
  itemsJson?: string;
  title?: string;
  caption?: string;
  className?: string;
}

export function RankedBars({ items: itemsProp, itemsJson, title, caption, className = '' }: Props) {
  const items: BarItem[] = itemsProp ?? (itemsJson ? JSON.parse(itemsJson) : []);
  if (items.length === 0) return null;
  const max = Math.max(...items.map((i) => i.value));
  const sorted = [...items].sort((a, b) => b.value - a.value);

  return (
    <figure
      className={`my-10 max-w-[var(--measure-body)] mx-auto font-sans ${className}`}
      aria-label={title ?? `Ranked bars, ${items.length} items`}
    >
      {title && (
        <div className="mb-4 text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
          {title}
        </div>
      )}
      <ul className="space-y-2">
        {sorted.map((item) => {
          const pct = max === 0 ? 0 : (item.value / max) * 100;
          const color = item.colorVar ?? 'var(--color-brand-indigo)';
          return (
            <li
              key={item.label}
              className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3 text-xs"
              role="img"
              aria-label={`${item.label}: ${item.value}${item.valueSuffix ?? ''}`}
            >
              <span className="truncate">{item.label}</span>
              <span className="h-5 rounded-sm bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] overflow-hidden">
                <span
                  className="block h-full rounded-sm"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </span>
              <span className="text-right font-semibold text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                {item.value}
                {item.valueSuffix && <span className="text-[var(--color-neutral-500)] ml-1">{item.valueSuffix}</span>}
              </span>
            </li>
          );
        })}
      </ul>
      {caption && (
        <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">{caption}</figcaption>
      )}
    </figure>
  );
}
