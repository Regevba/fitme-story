export function Pullquote({ children, cite }: { children: React.ReactNode; cite?: string }) {
  return (
    <blockquote className="my-10 border-l-4 border-[var(--color-brand-coral)] pl-6 italic font-serif text-2xl leading-tight text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-200)]">
      {children}
      {cite ? <cite className="block not-italic text-sm font-sans mt-3 text-[var(--color-neutral-500)]">— {cite}</cite> : null}
    </blockquote>
  );
}
