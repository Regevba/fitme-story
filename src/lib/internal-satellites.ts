import type { PhaseId } from './lifecycle-phases';

// Internal-artifact satellites — distinct from FEEDBACK_SOURCES.
//
// Where FEEDBACK_SOURCES (CX, Ops, Marketing) represent EXTERNAL observation
// of the shipped product, INTERNAL_SATELLITES are off-cycle artifacts that
// flow bidirectionally between phases (PRDs, QA reports, runbooks). They
// are not part of the public lifecycle path; they are produced and consumed
// by the team during the build process itself.
//
// Visual treatment differs:
//   - Feedback pills:  skill-tinted icon + colored border, single-direction
//                      fan-out + return arrows
//   - Internal moons:  muted neutral border, dashed bidirectional connectors
//                      to multiple upstream phases (no arrowheads)

export type InternalSatelliteId = 'docs';

export interface InternalSatellite {
  id: InternalSatelliteId;
  label: string;            // "Docs"
  description: string;      // "internal artifacts — PRDs, QA reports, runbooks"
  // Phases that produce + consume this artifact. Connectors render as plain
  // dashed lines (no arrows) since the flow is bidirectional.
  connectedPhases: PhaseId[];
  anchorAngleDeg: number;   // position on outer ring: 0 = top (12 o'clock), clockwise
  iconName: 'FileText';
}

export const INTERNAL_SATELLITES: InternalSatellite[] = [
  {
    id: 'docs',
    label: 'Docs',
    description: 'internal artifacts — PRDs, QA reports, runbooks',
    connectedPhases: ['P1', 'P2', 'P3', 'P5'],
    anchorAngleDeg: 54,     // upper-right, between P1 PRD (36°) and P2 Tasks (72°)
    iconName: 'FileText',
  },
];
