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

// Routing matches the canonical PM-hub schematics:
//   - .claude/shared/skill-routing.json (FitTracker2)
//   - src/lib/skill-ecosystem.ts (this repo) — phaseOwnership field
//
// Where each outer-ring skill actually fires in the forward lifecycle:
//   - CX         -> P0 Research (reviews, sentiment, NPS ingest)
//   - Marketing  -> P8 Documentation (launch comms, ASO updates)
//   - Ops        -> P9 Learn (incident synthesis; continuous background)
//
// Phase angles (clockwise from top, 36° increments): P0=0°, P1=36°, P8=288°,
// P9=324°. Each anchor sits at its target phase angle so the connector is a
// short radial arrow — no diagonal cross-center lines.
export const FEEDBACK_SOURCES: FeedbackSource[] = [
  {
    id: 'cx',
    label: 'CX',
    description: 'reviews · sentiment · NPS',
    targetPhases: ['P0'],
    skillSlug: 'cx',
    anchorAngleDeg: 0,       // sits over P0 Research
    iconName: 'MessageSquare',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'ASO · campaigns · launch',
    targetPhases: ['P8'],
    skillSlug: 'marketing',
    anchorAngleDeg: 288,     // sits over P8 Documentation
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
];
