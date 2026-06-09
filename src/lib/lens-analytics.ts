// Site-wide lens analytics. Mirrors the emit() guard pattern in
// src/lib/control-room/analytics.ts: SSR guard + window.gtag guard. There is no
// explicit consent gate — GA opt-in is via NEXT_PUBLIC_GA_ID and gtag silently
// no-ops when GA is absent or blocked. Event names follow the screen-prefix
// taxonomy (home_/story_/case_study_ are screen-scoped; nav_ is cross-page).

import type { Lens, LensOrNull } from './lens';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

function emit(event: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as GtagWindow;
  if (typeof w.gtag !== 'function') return;
  w.gtag('event', event, params);
}

/** First/explicit lens choice in the home chooser. Primary-metric numerator. */
export function trackHomeLensSelect(lens: Lens): void {
  emit('home_lens_select', { lens });
}

/** Header lens toggle used on any page. */
export function trackNavLensSwitch(from: LensOrNull, to: Lens): void {
  emit('nav_lens_switch', { from_lens: from ?? 'none', to_lens: to });
}

/** A /story narrative section enters the viewport. */
export function trackStoryScrollDepth(section: string): void {
  emit('story_scroll_depth', { section });
}

/** Case-study era accordion toggled open/closed. */
export function trackCaseStudyEraExpand(era: string, expanded: boolean): void {
  emit('case_study_era_expand', { era, expanded });
}

/** A case study opened from the index. */
export function trackCaseStudyOpen(slug: string, era: string, lens: LensOrNull): void {
  emit('case_study_open', { slug, era, lens: lens ?? 'none' });
}
