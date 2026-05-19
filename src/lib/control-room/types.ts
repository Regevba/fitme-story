/**
 * Type definitions for the Control Room data layer.
 *
 * Ported from dashboard/src/scripts/parsers/* (FitTracker2 Astro source) per
 * UCC T31. Inferred from the JS shape — preserves the runtime contract
 * exactly while adding TypeScript safety for downstream consumers.
 *
 * Source-of-truth locations in FitTracker2 (read at build time via the
 * vercel.json clone-FT2 step, see dashboard's controlCenter.js for the
 * full data flow):
 *   - .claude/features/{slug}/state.json          → StateFile
 *   - docs/product/backlog.md                      → Backlog
 *   - docs/product/metrics-framework.md            → Metric[]
 *   - docs/product/PRD.md                          → PRDFeature[]
 *   - docs/master-plan/master-backlog-roadmap.md   → RoadmapTask[]
 *   - .claude/features/{slug}/state.json (tasks)   → Task[]
 *
 * The unified parser merges StateFile + Backlog + PRDFeature + Metric +
 * RoadmapTask + GitHub Issues into a single feature inventory.
 */

// ─────────────────────────────────────────────────────────
// state.json — feature-level state
// ─────────────────────────────────────────────────────────

/**
 * The canonical per-feature state.json shape. Many fields are optional
 * because the schema has evolved across framework versions (v6.0+ added
 * timing/cache_hits/cu_v2; v7.7 added the `feature` ↔ `feature_name`
 * dual-key resilience).
 */
export interface StateFile {
  /** Canonical key (always populated by parseStateFiles via fallback). */
  feature: string;
  /** v7.7+ alternate key. Same value as `feature` after parsing. */
  feature_name?: string;
  current_phase?: string;
  /** Legacy key (pre-canonical-rename); same semantics as current_phase. */
  phase?: string;
  status?: string;
  framework_version?: string;
  work_type?: string;
  work_subtype?: string;
  has_ui?: boolean;
  requires_analytics?: boolean;
  parent_features?: string[];
  scope_summary?: string;
  case_study?: string | { case_study_path?: string; log_path?: string; started_at?: string; monitored_from_day_one?: boolean };
  case_study_required?: boolean;
  case_study_type?: string;
  parent_case_study?: string;
  branch?: string;
  github_issue_number?: number;
  created?: string;
  created_at?: string;
  updated?: string;
  /** Phase metadata (status, started_at, ended_at, etc.). Per-phase keys vary. */
  phases?: Record<string, unknown>;
  /** v6.0+ phase-timing payload. */
  timing?: {
    phases?: Record<string, { started_at?: string; ended_at?: string; duration_minutes?: number; paused_minutes?: number }>;
    session_start?: string;
    session_end?: string | null;
    total_wall_time_minutes?: number;
    [key: string]: unknown;
  };
  /** v6.0+ cache-hit instrumentation array. v7.7's CACHE_HITS_EMPTY_POST_V6 hook gates it. */
  cache_hits?: Array<{ key?: string; layer?: string; ts?: string; [k: string]: unknown }>;
  /** v6.0+ continuous-factor complexity unit. v7.7's CU_V2_INVALID hook validates the schema. */
  cu_v2?: {
    factors?: { complexity?: number; blast_radius?: number; novelty?: number; verification_difficulty?: number };
    total?: number;
    tier_class?: string;
    rationale?: string;
  };
  /** Legacy complexity field. */
  complexity?: unknown;
  /** Per-task list (post-tasks-phase). */
  tasks?: Array<Record<string, unknown>>;
  /** Phase-transition audit trail. */
  transitions?: Array<Record<string, unknown>>;
  /** Pause-protocol annotation (v7.7 freeze pattern). */
  paused?: {
    at: string;
    reason: string;
    resume_signal?: string;
    snapshot?: Record<string, unknown>;
  };
  paused_history?: Array<Record<string, unknown>>;
  /** UCC T43-T54 → v7.7 M4 absorption record. */
  tasks_migrated_to?: Record<string, unknown>;
  /** Catch-all for fields not yet typed. */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────
// backlog.md
// ─────────────────────────────────────────────────────────

export interface BacklogDoneItem {
  name: string;
  ref: string;
  date: string;
  notes: string;
}

export interface BacklogInProgressItem {
  name: string;
  owner: string;
  branch: string;
  status: string;
}

export interface BacklogPlannedItem {
  rice: number;
  task: string;
  phase: string;
  description: string;
}

export interface BacklogItem {
  name: string;
  detail: string;
  done: boolean;
}

export interface Backlog {
  done: BacklogDoneItem[];
  inProgress: BacklogInProgressItem[];
  planned: BacklogPlannedItem[];
  backlog: BacklogItem[];
}

// ─────────────────────────────────────────────────────────
// metrics-framework.md
// ─────────────────────────────────────────────────────────

export interface Metric {
  category: string;
  name: string;
  definition: string;
  target: string;
  instrumentation: string;
  prdSection: string | null;
}

// ─────────────────────────────────────────────────────────
// PRD.md
// ─────────────────────────────────────────────────────────

export interface PRDFeature {
  section: string;
  name: string;
  metrics: string[];
  status: string | null;
}

// ─────────────────────────────────────────────────────────
// master-backlog-roadmap.md (RICE matrix)
// ─────────────────────────────────────────────────────────

export interface RoadmapTask {
  taskNumber: number;
  name: string;
  reach: number;
  impact: number;
  confidence: string;
  effortWeeks: number;
  rice: number;
  priority: string;
}
