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

export const FEEDBACK_SOURCES: FeedbackSource[] = [
  {
    id: 'cx',
    label: 'CX',
    description: 'reviews · sentiment · NPS',
    targetPhases: ['P0'],
    skillSlug: 'cx',
    anchorAngleDeg: 0,
    iconName: 'MessageSquare',
  },
  {
    id: 'ops',
    label: 'Ops',
    description: 'incidents · latency · SLOs',
    targetPhases: ['P1', 'P5'],
    skillSlug: 'ops',
    anchorAngleDeg: 120,
    iconName: 'Activity',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'ASO · campaigns · funnels',
    targetPhases: ['P1'],
    skillSlug: 'marketing',
    anchorAngleDeg: 240,
    iconName: 'Megaphone',
  },
];
