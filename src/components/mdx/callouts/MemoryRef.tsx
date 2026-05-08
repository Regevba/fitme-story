import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

// MemoryRef — annotated cross-reference to a prior case study. Used
// inline in prose to give a memory-style pointer with one-line context.
// Closes audit CS-014 + CS-024.
//
// MDX usage:
//   <MemoryRef
//     slug="framework-v7-7-validity-closure"
//     title="v7.7 Validity Closure"
//     note="closed the post-v7.6 silent-pass surface"
//   />
export function MemoryRef({
  slug,
  title,
  note,
}: {
  slug: string;
  title: string;
  note?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1 not-prose font-sans text-sm">
      <Link
        href={`/case-studies/${slug}`}
        className="inline-flex items-center gap-0.5 text-[var(--color-brand-indigo)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:rounded"
      >
        <ChevronRight size={12} aria-hidden="true" />
        <span>{title}</span>
      </Link>
      {note ? (
        <span className="text-[var(--color-neutral-500)] italic">— {note}</span>
      ) : null}
    </span>
  );
}
