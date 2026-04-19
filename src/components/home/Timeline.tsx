'use client';

import { useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { TimelineNode } from './TimelineNode';
import type { TimelineMode, TimelineNode as Node } from '@/lib/timeline';

const MODES: { value: TimelineMode; label: string }[] = [
  { value: 'versions', label: 'Versions' },
  { value: 'cases', label: 'Case studies' },
  { value: 'features', label: 'Features' },
];

export function Timeline({ timelines }: { timelines: Record<TimelineMode, Node[]> }) {
  const [mode, setMode] = useState<TimelineMode>('versions');
  const nodes = timelines[mode];

  return (
    <section className="py-16" aria-label="Framework timeline">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="font-serif text-3xl">The timeline</h2>
          <div className="flex gap-1 font-sans text-sm border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] rounded-full p-1">
            {MODES.map((m) => {
              const disabled = timelines[m.value].length === 0;
              return (
                <button
                  key={m.value}
                  onClick={() => !disabled && setMode(m.value)}
                  aria-pressed={mode === m.value}
                  disabled={disabled}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    mode === m.value
                      ? 'bg-[var(--color-brand-indigo)] text-white'
                      : disabled
                      ? 'text-[var(--color-neutral-300)] cursor-not-allowed'
                      : 'hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
        <LayoutGroup>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-min">
              {nodes.map((node) => (
                <TimelineNode key={node.id} node={node} />
              ))}
            </div>
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
