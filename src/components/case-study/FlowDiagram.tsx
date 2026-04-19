import { ArrowRight } from 'lucide-react';
import { Fragment } from 'react';

interface Node {
  label: string;          // "complexity_scoring"
  sublabel?: string;      // "mechanical · low"
  colorVar?: string;      // defaults to brand-indigo
}

interface Props {
  nodes: Node[];
  caption?: string;
  arrowLabel?: (from: Node, to: Node, index: number) => string | undefined;
  className?: string;
}

export function FlowDiagram({ nodes, caption, arrowLabel, className = '' }: Props) {
  if (nodes.length === 0) return null;

  return (
    <figure
      className={`my-10 max-w-[var(--measure-wide)] mx-auto font-sans ${className}`}
      aria-label={`Flow diagram: ${nodes.map((n) => n.label).join(' → ')}`}
    >
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch gap-3 min-w-min">
          {nodes.map((node, i) => {
            const color = node.colorVar ?? 'var(--color-brand-indigo)';
            const nextArrowLabel = arrowLabel && i < nodes.length - 1 ? arrowLabel(node, nodes[i + 1], i) : undefined;
            return (
              <Fragment key={node.label + i}>
                <div
                  className="min-w-[140px] max-w-[180px] shrink-0 rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-3 bg-white dark:bg-[var(--color-neutral-900)]"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="text-xs font-semibold truncate" style={{ color }}>
                    {node.label}
                  </div>
                  {node.sublabel && (
                    <div className="mt-1 text-[10px] text-[var(--color-neutral-500)]">
                      {node.sublabel}
                    </div>
                  )}
                </div>
                {i < nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center shrink-0 text-[var(--color-neutral-500)] min-w-[44px]">
                    <ArrowRight size={18} aria-hidden />
                    {nextArrowLabel && (
                      <span className="text-[9px] mt-1 text-center max-w-[60px] leading-tight">
                        {nextArrowLabel}
                      </span>
                    )}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)]">{caption}</figcaption>
      )}
    </figure>
  );
}
