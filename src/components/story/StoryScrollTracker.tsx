'use client';

// Fires story_scroll_depth once per narrative section as it scrolls into view
// (dual-audience redesign T6). Sections opt in via data-story-section="<id>".
// IntersectionObserver-based; each section fires at most once per page view.

import { useEffect, useRef, type ReactNode } from 'react';
import { trackStoryScrollDepth } from '@/lib/lens-analytics';

export function StoryScrollTracker({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fired = new Set<string>();
    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-story-section]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.getAttribute('data-story-section');
          if (e.isIntersecting && id && !fired.has(id)) {
            fired.add(id);
            trackStoryScrollDepth(id);
          }
        }
      },
      { threshold: 0.4 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
