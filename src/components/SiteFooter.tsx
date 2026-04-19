import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 justify-between text-sm font-sans text-[var(--color-neutral-500)]">
        <div>
          <p>
            Built by Regev. <Link href="/about" className="underline">About</Link>.
          </p>
          <p className="mt-2">
            Content: <a className="underline" href="https://github.com/Regevba/fitme-showcase">github.com/Regevba/fitme-showcase</a>
          </p>
          <p className="mt-2">
            <Link href="/trust" className="underline hover:text-[var(--color-brand-indigo)]">
              How this site stays honest →
            </Link>
          </p>
        </div>
        <div>
          <p>© 2026 — content licensed CC-BY-4.0.</p>
        </div>
      </div>
    </footer>
  );
}
