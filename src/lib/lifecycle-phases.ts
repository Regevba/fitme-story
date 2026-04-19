// Order of phases in the 10-phase PM lifecycle.
export type PhaseId = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9';

export interface Phase {
  id: PhaseId;
  order: number;             // 0..9, used for angle calc in the lifecycle loop
  name: string;              // "Research"
  description: string;       // 1 line
  primarySkillSlug: string;  // owning skill; used for inner-ring color
}

export const PHASES: Phase[] = [
  { id: 'P0', order: 0, name: 'Research', description: 'Understand the problem, audience, market, pain points.', primarySkillSlug: 'research' },
  { id: 'P1', order: 1, name: 'PRD', description: 'Define what we build + how we measure success.', primarySkillSlug: 'pm-workflow' },
  { id: 'P2', order: 2, name: 'Tasks', description: 'Break the PRD into actionable tasks with exit criteria.', primarySkillSlug: 'pm-workflow' },
  { id: 'P3', order: 3, name: 'UX/Design', description: 'Wireframes, specs, visual design, token alignment.', primarySkillSlug: 'design' },
  { id: 'P4', order: 4, name: 'Implement', description: 'Write the code. Frequent commits, TDD where appropriate.', primarySkillSlug: 'dev' },
  { id: 'P5', order: 5, name: 'Test', description: 'Unit, integration, regression, accessibility, security checks.', primarySkillSlug: 'qa' },
  { id: 'P6', order: 6, name: 'Review', description: 'Code review, spec-compliance review, UX review.', primarySkillSlug: 'dev' },
  { id: 'P7', order: 7, name: 'Merge', description: 'Integration, release prep, version bump, changelog.', primarySkillSlug: 'release' },
  { id: 'P8', order: 8, name: 'Docs', description: 'User docs, release notes, case study, analytics handoff.', primarySkillSlug: 'cx' },
  { id: 'P9', order: 9, name: 'Learn', description: 'Post-launch metrics review, feedback synthesis, next-cycle inputs.', primarySkillSlug: 'cx' },
];

export function getPhase(id: PhaseId): Phase {
  const p = PHASES.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown phase: ${id}`);
  return p;
}
