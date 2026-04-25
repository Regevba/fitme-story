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

// All three feedback skills fan out FROM P8 Release (the public ship moment)
// and feed back IN to early-cycle phases (P0 Research / P9 Learn). The
// post-release arc — between P8 (288°) and P0 (0°/360°) — is the
// "observation zone" where shipped product meets real users + production.
//
// Each anchor has a primary feedback target (where its observations land in
// the next iteration's forward path):
//   - CX         -> P0 Research  (reviews, sentiment, NPS feed new research)
//   - Marketing  -> P0 Research  (ASO, campaigns, funnels feed prioritization)
//   - Ops        -> P9 Learn     (incidents, latency, SLOs feed synthesis)
//
// All three also carry an outward "ship signal" connector FROM P8 Release —
// rendered separately by the LifecycleLoop component, not on this data type.
//
// Anchors are clustered post-release at 296°, 324°, 352° (24° apart) so they
// sit visually between P8 Release and P0 Research, reinforcing the
// "after release, observe, return to research" narrative.
export const FEEDBACK_SOURCES: FeedbackSource[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'ASO · campaigns · launch funnels',
    targetPhases: ['P0'],
    skillSlug: 'marketing',
    anchorAngleDeg: 296,     // post-release, just past P8
    iconName: 'Megaphone',
  },
  {
    id: 'ops',
    label: 'Ops',
    description: 'incidents · latency · SLOs · always-on',
    targetPhases: ['P9'],
    skillSlug: 'ops',
    anchorAngleDeg: 324,     // sits over P9 Learn
    iconName: 'Activity',
  },
  {
    id: 'cx',
    label: 'CX',
    description: 'reviews · sentiment · NPS',
    targetPhases: ['P0'],
    skillSlug: 'cx',
    anchorAngleDeg: 352,     // just before P0, reinforces loop closure
    iconName: 'MessageSquare',
  },
];
