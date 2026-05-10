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
 * design_system_section_view when the section enters the viewport at
 * ≥ 50% coverage for ≥ 1 second. De-duped per session via SEEN_SECTIONS.
 *
 * No-op on the server. No-op when IntersectionObserver is unavailable
 * (older browsers, JSDOM tests).
 */
export function TrackedSection({ sectionId, children, className }: Props) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;
    const node = ref.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            timer = setTimeout(() => {
              const isFirstViewInSession = !SEEN_SECTIONS.has(sectionId);
              SEEN_SECTIONS.add(sectionId);
              trackDesignSystemSectionView({
                section_id: sectionId,
                is_first_view_in_session: isFirstViewInSession,
              });
              observer.disconnect();
            }, 1000);
          } else if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold: [0.5] },
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
