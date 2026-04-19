'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const NAV = [
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/framework', label: 'Framework' },
  { href: '/research', label: 'Research' },
  { href: '/design-system', label: 'Design System' },
  { href: '/about', label: 'About' },
];

const STORAGE_KEY = 'fitme-story-theme';

export function SiteHeader() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefers);
    document.documentElement.classList.toggle('dark', shouldBeDark);
    setDark(shouldBeDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  return (
    <header className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between font-sans">
        <Link href="/" className="font-semibold tracking-tight inline-flex items-center min-h-[44px]">
          fitme<span className="text-[var(--color-brand-indigo)]">·</span>story
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center min-h-[44px] hover:text-[var(--color-brand-indigo)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
