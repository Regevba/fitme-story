// Audit-relevant advancement points — each labeled with its data-quality tier
// per the CLAUDE.md T1/T2/T3 convention. Only T1 points are connected by the
// trend line; T3 points are rendered as context with a dashed outline so
// readers can see exactly where the audit-validated window begins.
//
// Source citations:
//   - T1 data: .claude/features/<name>/state.json (measured phase timings)
//   - T3 data: case-study narrative estimates; Gemini flagged pre-v6.0
//     quantitative claims as unreliable

export type DataTier = 'T1' | 'T2' | 'T3';

export interface AdvancementPoint {
  name: string;               // "Measurement v6.0"
  shortLabel: string;         // "v6 Measurement"
  shipDate: string;           // "2026-04-16"
  frameworkVersion: string;   // "v6.0"
  cu: number;                 // complexity units
  wallMinutes: number;        // measured wall clock
  tier: DataTier;
  note?: string;
}

export const ADVANCEMENT_POINTS: AdvancementPoint[] = [
  {
    name: 'Onboarding Pilot',
    shortLabel: 'Onboarding',
    shipDate: '2026-04-07',
    frameworkVersion: 'v2.0',
    cu: 5.5,
    wallMinutes: 390,
    tier: 'T3',
    note: 'Narrative estimate — no phase-timing instrumentation existed.',
  },
  {
    name: 'Framework Evolution — 6 refactors',
    shortLabel: '6 refactors',
    shipDate: '2026-04-11',
    frameworkVersion: 'v4.3',
    cu: 6.0,
    wallMinutes: 95,
    tier: 'T3',
    note: 'Narrative estimate from commit spans; pre-v6.0 measurement.',
  },
  {
    name: 'User Profile (greenfield)',
    shortLabel: 'User Profile',
    shipDate: '2026-04-13',
    frameworkVersion: 'v4.4',
    cu: 3.5,
    wallMinutes: 120,
    tier: 'T3',
    note: 'Narrative estimate — pre-v6.0, commit-timestamp approximation.',
  },
  {
    name: 'Parallel Stress Test',
    shortLabel: 'Parallel 4x',
    shipDate: '2026-04-15',
    frameworkVersion: 'v5.1',
    cu: 4.0,
    wallMinutes: 54,
    tier: 'T3',
    note: 'Wall time narrative-derived; parallel dispatch unknown-share.',
  },
  {
    name: 'Measurement v6.0',
    shortLabel: 'Measurement v6',
    shipDate: '2026-04-16',
    frameworkVersion: 'v6.0',
    cu: 28.0,
    wallMinutes: 90,
    tier: 'T1',
    note: 'First self-instrumented feature. 3.21 min/CU — 3rd best all-time.',
  },
  {
    name: 'V7.0 HADF',
    shortLabel: 'V7.0 HADF',
    shipDate: '2026-04-20',
    frameworkVersion: 'v7.0',
    cu: 1.2,
    wallMinutes: 120,
    tier: 'T1',
    note: 'CU = base 1.0 + first-of-kind 0.2. Phase timing in state.json.',
  },
  {
    name: 'Meta-Analysis Audit',
    shortLabel: 'Audit v7.0',
    shipDate: '2026-04-21',
    frameworkVersion: 'v7.0',
    cu: 1.7,
    wallMinutes: 130,
    tier: 'T1',
    note: 'CU = base + first-of-kind + cross-feature + arch-novelty.',
  },
];

export const GEMINI_AUDIT_DATE = '2026-04-21';
