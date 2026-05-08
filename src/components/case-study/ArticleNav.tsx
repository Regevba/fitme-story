'use client';

import { useEffect, useState } from 'react';

type Heading = { id: string; text: string; level: 2 | 3 };

// Sticky article navigator that fills the empty 280px <aside> slot in
// Standard + Flagship templates. Closes audit S1 (single highest-leverage
// architectural move from the 2026-05-08 audit) which bundles:
// - CS-001 (no in-page TOC)
// - CS-010 (active-section tracking)
// - CS-013 (sub-TOC for multi-h2 articles)
// - R-001 (no TOC on case-study pages)
// - R-002 (no scroll progress)
// - A-020 (empty landmark with label = noise)
//
// Headings are scraped from the rendered DOM after hydration. The
// quick-wins PR added rehype-slug to compileMDX so every h2/h3 carries
// id="…", making client-side TOC construction reliable.
export function ArticleNav() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;
    const elements = article.querySelectorAll('h2[id], h3[id]');
    const items: Heading[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent?.trim() ?? '',
      level: el.tagName === 'H2' ? 2 : 3,
    }));
    setHeadings(items);
  }, []);

  // IntersectionObserver tracks which section the reader is currently in.
  // rootMargin pushes the active line down ~100px from the top so the
  // active item changes when a heading crosses the upper third of the
  // viewport, not at the very top edge.
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-100px 0px -66% 0px' },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  // Reading-progress bar — tracks scroll position against the article's
  // own bounding box (not the full document) so the bar reaches 100% at
  // the article end, not the page end.
  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(1);
        return;
      }
      const seen = -rect.top;
      setProgress(Math.max(0, Math.min(1, seen / total)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Article navigation"
      className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto font-sans text-sm space-y-4"
    >
      <div className="h-1 rounded-full bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] overflow-hidden">
        <div
          className="h-full bg-[var(--color-brand-indigo)] transition-all duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
          aria-hidden="true"
        />
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
          On this page
        </div>
        <ul className="space-y-1.5">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                <a
                  href={`#${h.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={
                    'block hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:rounded ' +
                    (isActive
                      ? 'text-[var(--color-brand-indigo)] font-medium border-l-2 border-[var(--color-brand-indigo)] pl-2 -ml-[10px]'
                      : 'text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]')
                  }
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
