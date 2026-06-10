import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import { Mail, FileText, Lock } from 'lucide-react';

// lucide-react dropped its brand glyphs, so GitHub + LinkedIn ship as small
// inline SVGs (official simple-icons paths, currentColor) alongside the
// lucide line icons used for the rest of the Connect column.
function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

interface FooterLink {
  href: string;
  label: string;
  gated?: boolean;
}

// Primary site surfaces — the destinations a reader is most likely to explore.
const EXPLORE: FooterLink[] = [
  { href: '/pm-flow', label: 'PM Flow' },
  { href: '/framework', label: 'Framework' },
  { href: '/design-system', label: 'Design System' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/story', label: 'Story' },
  { href: '/research', label: 'Research' },
  { href: '/timeline', label: 'Timeline' },
];

// Supporting + meta pages.
const REFERENCE: FooterLink[] = [
  { href: '/about', label: 'About' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/trust', label: 'How this site stays honest' },
  { href: '/control-room', label: 'Control Center', gated: true },
];

interface ConnectLink {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** External (new tab) vs. a same-tab mailto/download. */
  external?: boolean;
  download?: boolean;
}

const CONNECT: ConnectLink[] = [
  { href: 'mailto:Regev.ba@gmail.com', label: 'Email', icon: Mail },
  { href: 'https://www.linkedin.com/in/regev-barak/', label: 'LinkedIn', icon: LinkedinIcon, external: true },
  { href: '/resume.pdf', label: 'Résumé', icon: FileText, download: true },
  { href: 'https://github.com/Regevba', label: 'GitHub', icon: GithubIcon, external: true },
];

const headingClass =
  'text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-200)]';
const linkClass =
  'text-[var(--color-neutral-500)] transition-colors hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:rounded';

function LinkColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <nav aria-label={heading}>
      <h2 className={headingClass}>{heading}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={`inline-flex items-center gap-1.5 ${linkClass}`}>
              {link.label}
              {link.gated && <Lock className="h-3 w-3" aria-label="auth-gated" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-12 font-sans">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-[var(--color-neutral-900)] transition-colors hover:text-[var(--color-brand-indigo)] dark:text-[var(--color-neutral-50)]"
            >
              fitme<span className="text-[var(--color-brand-indigo)]">·</span>story
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[var(--color-neutral-500)]">
              How a PM flow became a framework and grew up alongside a fitness app.
            </p>
            <p className="mt-4 text-sm text-[var(--color-neutral-500)]">
              Built by{' '}
              <Link href="/about" className={linkClass}>
                Regev Barak
              </Link>
              .
            </p>
          </div>

          {/* Explore */}
          <LinkColumn heading="Explore" links={EXPLORE} />

          {/* Reference */}
          <LinkColumn heading="Reference" links={REFERENCE} />

          {/* Connect */}
          <nav aria-label="Connect">
            <h2 className={headingClass}>Connect</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CONNECT.map(({ href, label, icon: Icon, external, download }) => (
                <li key={href}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    {...(download ? { download: true } : {})}
                    className={`inline-flex items-center gap-2 ${linkClass}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--color-neutral-200)] pt-6 text-xs text-[var(--color-neutral-500)] sm:flex-row sm:items-center sm:justify-between dark:border-[var(--color-neutral-800)]">
          <p>© 2026 fitme·story</p>
          <p>
            Content licensed{' '}
            <a
              href="https://github.com/Regevba/fitme-showcase"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              CC-BY-4.0
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
