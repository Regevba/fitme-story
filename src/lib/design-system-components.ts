export interface DesignSystemComponent {
  name: string;
  purpose: string;
  whereUsed: string;
}

export const DESIGN_SYSTEM_COMPONENTS: DesignSystemComponent[] = [
  { name: 'AppButton', purpose: 'Primary / secondary / tertiary CTA with loading + disabled variants.', whereUsed: 'Every screen with an action.' },
  { name: 'AppCard', purpose: 'Surface container for content groups. Rounded 20pt, subtle elevation.', whereUsed: 'Home tiles, training plan, stats.' },
  { name: 'AppSheet', purpose: 'Modal sheet with drag handle + safe-area padding.', whereUsed: 'Meal entry, AI intelligence, settings edit.' },
  { name: 'AppTextField', purpose: 'Text input with label, helper, error, and consistent focus ring.', whereUsed: 'Profile, goals, goal entry.' },
  { name: 'AppSelect', purpose: 'Picker with inline label and chevron affordance.', whereUsed: 'Units, intensity, training plan type.' },
  { name: 'AppSegmentedControl', purpose: 'Two-to-four option toggle for scoped filters (day / week / month).', whereUsed: 'Stats period selector, training mode.' },
  { name: 'AppMetricTile', purpose: 'Large number + label + optional trend arrow.', whereUsed: 'Home dashboard, stats hub.' },
  { name: 'AppChip', purpose: 'Compact filter or tag with selected state.', whereUsed: 'Nutrition filters, goal tags.' },
  { name: 'AppProgressBar', purpose: 'Linear progress with accent color + accessibility label.', whereUsed: 'Readiness, workout progress.' },
  { name: 'AppToast', purpose: 'Transient bottom-sheet feedback for completed actions.', whereUsed: 'Meal logged, workout saved, sync complete.' },
  { name: 'AppListRow', purpose: 'Settings-style row with leading icon, label, and trailing control.', whereUsed: 'Settings, account, consent screens.' },
  { name: 'AppEmptyState', purpose: 'Illustrated placeholder with action, not a dead end.', whereUsed: 'No meals yet, no plan, no history.' },
  { name: 'AppSectionHeader', purpose: 'Consistent header pattern for grouped content with optional action.', whereUsed: 'Home sections, stats categories.' },
];
