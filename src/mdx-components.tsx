import type { MDXComponents } from 'mdx/types';
import { MetricsCard } from '@/components/mdx/MetricsCard';
import { Pullquote } from '@/components/mdx/Pullquote';
import { Figure } from '@/components/mdx/Figure';
import { TimelineNav } from '@/components/mdx/TimelineNav';
import { FindingsTable } from '@/components/mdx/FindingsTable';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    MetricsCard,
    Pullquote,
    Figure,
    TimelineNav,
    FindingsTable,
  };
}
