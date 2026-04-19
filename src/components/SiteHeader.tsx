import Link from 'next/link';

const NAV = [
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/framework', label: 'Framework' },
  { href: '/research', label: 'Research' },
  { href: '/design-system', label: 'Design System' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between font-sans">
        <Link href="/" className="font-semibold tracking-tight">
          fitme<span className="text-[var(--color-brand-indigo)]">·</span>story
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--color-brand-indigo)]">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
