'use client';

import * as React from 'react';
import {
  trackDesignSystemSectionView,
  type DesignSystemSection,
} from '@/lib/design-system-analytics';

type Props = {
  sectionId: DesignSystemSection;
  children: React.ReactNode;
  className?: string;
};

const SEEN_SECTIONS: Set<string> = typeof window !== 'undefined' ? new Set() : new Set();

/**
 * Wraps a <section> element with an IntersectionObserver that fires
 * design_system_section_view when the section is meaningfully in view
 * for ≥ 1 second. De-duped per session via SEEN_SECTIONS.
 *
 * Detection: `isIntersecting` is true any time ANY part of the section
 * is in the viewport. We pair it with a 1-second debounce timer to
 * avoid firing on incidental scroll-throughs.
 *
 * Why threshold 0 — for sections taller than the viewport (most Part 2
 * sections on /design-system are 1500-3000px on an 800px laptop viewport),
 * `intersectionRatio` peaks at viewport_height/section_height, which is
 * < 0.5. A 0.5 threshold would never fire for those sections. Bug
 * discovered T28 verification 2026-05-10.
 *
 * No-op on the server. No-op when IntersectionObserver is unavailable.
 */
export function TrackedSection({ sectionId, children, className }: Props) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;
    const node = ref.current;
    if (!node) return;

    // Skip observing if we already counted this section this session
    if (SEEN_SECTIONS.has(sectionId)) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Already counting? Don't restart the debounce
            if (timer) continue;
            timer = setTimeout(() => {
              if (SEEN_SECTIONS.has(sectionId)) return;
              SEEN_SECTIONS.add(sectionId);
              trackDesignSystemSectionView({
                section_id: sectionId,
                is_first_view_in_session: true,
              });
              observer.disconnect();
            }, 1000);
          } else {
            // Section scrolled fully out before debounce — cancel
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
          }
        }
      },
      // threshold 0 → callback fires on ANY visibility change
      { threshold: 0 },
    );

    observer.observe(node);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [sectionId]);

  return (
    <section
      id={sectionId}
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
    >
      {children}
    </section>
  );
}
