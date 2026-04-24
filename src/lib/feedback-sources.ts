import type { PhaseId } from './lifecycle-phases';
import type { SkillSlug } from './skill-ecosystem';

export type FeedbackSourceId = 'cx' | 'ops' | 'marketing';

export interface FeedbackSource {
  id: FeedbackSourceId;
  label: string;              // "CX"
  description: string;        // "reviews · sentiment · NPS"
  targetPhases: PhaseId[];    // where its feedback re-enters the forward cycle
  skillSlug: SkillSlug;       // for color + linking to skill docs
  anchorAngleDeg: number;     // position on outer ring: 0 = top (12 o'clock), clockwise
  iconName: 'MessageSquare' | 'Activity' | 'Megaphone';
}

// Each anchor sits at the SAME angle as its primary target phase so the
// radial connector becomes a tiny arrow — no diagonal cross-center lines.
// Phase angles (clockwise from top): P0=0°, P1=36°, P5=180°.
//
// targetPhases[0] is the PRIMARY (visible connector); additional entries are
// semantic only — surfaced in the description + aria-label, not drawn.
export const FEEDBACK_SOURCES: FeedbackSource[] = [
  {
    id: 'cx',
    label: 'CX',
    description: 'reviews · sentiment · NPS',
    targetPhases: ['P0'],
    skillSlug: 'cx',
    anchorAngleDeg: 0,     // sits over P0 Research
    iconName: 'MessageSquare',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'ASO · campaigns · funnels',
    targetPhases: ['P1'],
    skillSlug: 'marketing',
    anchorAngleDeg: 36,    // sits over P1 PRD
    iconName: 'Megaphone',
  },
  {
    id: 'ops',
    label: 'Ops',
    description: 'incidents · latency · SLOs · informs PRD + Test',
    targetPhases: ['P5', 'P1'],  // P5 primary connector; P1 semantic only
    skillSlug: 'ops',
    anchorAngleDeg: 180,   // sits over P5 Test
    iconName: 'Activity',
  },
];
