import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function TimelineNav({
  prev,
  next,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <nav className="mt-16 pt-8 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] flex justify-between font-sans text-sm gap-4">
      {prev ? (
        <Link href={prev.href} className="group flex items-start gap-2 hover:text-[var(--color-brand-indigo)]">
          <ArrowLeft size={16} className="mt-0.5 shrink-0" />
          <span>
            <span className="block text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">Previous</span>
            <span className="block mt-1">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="group flex items-start gap-2 text-right hover:text-[var(--color-brand-indigo)]">
          <span>
            <span className="block text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">Next</span>
            <span className="block mt-1">{next.label}</span>
          </span>
          <ArrowRight size={16} className="mt-0.5 shrink-0" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
