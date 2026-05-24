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
  {
    name: 'Framework v7.1 — 72h Integrity Cycle',
    shortLabel: 'v7.1 Integrity',
    shipDate: '2026-04-21',
    frameworkVersion: 'v7.1',
    cu: 1.5,
    wallMinutes: 110,
    tier: 'T3',
    note: '72h state.json audit; advisory baseline 40/45/0. PR #143.',
  },
  {
    name: 'Framework v7.5 — Data Integrity (Gemini-triggered)',
    shortLabel: 'v7.5 Data Integrity',
    shipDate: '2026-04-24',
    frameworkVersion: 'v7.5',
    cu: 2.0,
    wallMinutes: 180,
    tier: 'T3',
    note: '8 cooperating defenses across write-time + cycle-time + readout layers; triggered by 2026-04-21 Gemini 2.5 Pro independent audit.',
  },
  {
    name: 'Framework v7.6 — Mechanical Enforcement',
    shortLabel: 'v7.6 Mechanical',
    shipDate: '2026-04-25',
    frameworkVersion: 'v7.6',
    cu: 1.8,
    wallMinutes: 258,
    tier: 'T1',
    note: '4 silent agent-attention checks → pre-commit failures + 3 recurring CI defenses. PR #141; 7 Class B → A promotions.',
  },
  {
    name: 'Framework v7.7 — Validity Closure',
    shortLabel: 'v7.7 Validity',
    shipDate: '2026-04-27',
    frameworkVersion: 'v7.7',
    cu: 2.0,
    wallMinutes: 220,
    tier: 'T1',
    note: 'A1-A5 + B1-B2 + C1 closure across 2 PRs (#144 + fitme-story #7). 100% state↔case-study linkage; framework reaches 25 gates + 1 advisory.',
  },
  {
    name: 'Framework v7.8 — Bridge (6 advisory mechanisms A-F)',
    shortLabel: 'v7.8 Bridge',
    shipDate: '2026-05-04',
    frameworkVersion: 'v7.8',
    cu: 2.5,
    wallMinutes: 600,
    tier: 'T3',
    note: '6 cooperating advisory mechanisms (Coverage gates + Schema dual-read + Mech-C session attribution + Hook self-audit + Custom merge driver + Membrane status) across 9 PRs #173/#185-189/#193-195. Schema bridges populated on 47/47 features.',
  },
  {
    name: 'Framework v7.8.1 — Branch Isolation + Feature-Closure Completeness',
    shortLabel: 'v7.8.1 Isolation',
    shipDate: '2026-05-07',
    frameworkVersion: 'v7.8.1',
    cu: 2.55,
    wallMinutes: 240,
    tier: 'T1',
    note: 'cu_v2 A_high tier (complexity 0.6 + blast 0.75 + novelty 0.5 + verify 0.7 = 2.55). 3 new write-time gates + 3 cycle-time advisories; first feature shipped via the v7.8 protocol; PR #244 + #245 + #246.',
  },
  {
    name: 'Framework v7.8.3 — Cross-Repo State Sync',
    shortLabel: 'v7.8.3 X-Repo',
    shipDate: '2026-05-11',
    frameworkVersion: 'v7.8.3',
    cu: 2.2,
    wallMinutes: 480,
    tier: 'T3',
    note: '5-phase × 10-PR umbrella across both repos. state_owner enum schema + D-3 unified PR cache + D-1 reverse-sync + Phase 4 cutover.',
  },
  {
    name: 'Framework v7.8.5 — Observability Layer',
    shortLabel: 'v7.8.5 Observed',
    shipDate: '2026-05-13',
    frameworkVersion: 'v7.8.5',
    cu: 1.5,
    wallMinutes: 180,
    tier: 'T3',
    note: 'Observed Patterns Catalog (23 gate + 9 workflow patterns) + W9 branch-drift real-time alert. PR #328 + #341.',
  },
  {
    name: 'Framework v7.8.6 — Cadence Batch',
    shortLabel: 'v7.8.6 Cadence',
    shipDate: '2026-05-15',
    frameworkVersion: 'v7.8.6',
    cu: 1.8,
    wallMinutes: 220,
    tier: 'T3',
    note: 'make integrity-diff + make preflight WORK_TYPE=<> + Phase 0.0 + W1 ssh preflight + weekly Mech A scan. PR #363 (MUST batch) + #365 (nice-to-have batch). 33 mechanical gates + 5 advisories.',
  },
  {
    name: 'Framework v7.9 — Promotion (single-flag flip)',
    shortLabel: 'v7.9 Promotion',
    shipDate: '2026-05-21',
    frameworkVersion: 'v7.9',
    cu: 0.8,
    wallMinutes: 60,
    tier: 'T1',
    note: 'Single-line BRANCH_ISOLATION_ADVISORY_MODE = True → False flip at scripts/check-state-schema.py:132. 3 advisory gates → enforced. All 4 §2.2 promotion criteria met against 14d Mechanism A telemetry. Total framework mechanisms post-promotion: 37 mechanical + 5 advisories. PR #417; Phase E soak 2026-05-21 → 2026-06-04.',
  },
];

export const GEMINI_AUDIT_DATE = '2026-04-21';
