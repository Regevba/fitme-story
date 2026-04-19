'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { TimelineNode as Node } from '@/lib/timeline';

export function TimelineNode({ node }: { node: Node }) {
  return (
    <motion.div
      layoutId={`timeline-node-${node.id}`}
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className="min-w-[220px] max-w-[260px] shrink-0"
    >
      <Link
        href={node.href}
        className="block group rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4 hover:border-[var(--color-brand-indigo)] hover:shadow-md transition-all"
      >
        <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
          {node.subLabel}
        </div>
        <div className="mt-1 font-serif text-lg leading-tight group-hover:text-[var(--color-brand-indigo)]">
          {node.label}
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-[var(--color-brand-indigo)]">{node.metric.value}</span>
          <span className="text-xs text-[var(--color-neutral-500)] font-sans">{node.metric.label}</span>
        </div>
      </Link>
    </motion.div>
  );
}
