// scripts/sync-from-fittracker2.ts
//
// Pre-build sync script (Pattern 4.b from research.md) for unified-control-center.
//
// Reads dashboard data from the FitTracker2 repo (which lives in a sibling
// directory locally, or is cloned into a sibling directory on Vercel via
// vercel.json buildCommand) and writes it to fitme-story/src/data/ so the
// /control-room/* routes can consume it at next build time.
//
// Local dev workflow:
//   npm run prebuild         # writes src/data/shared/* + src/data/features/*
//   npm run dev              # Next.js reads the synced data
//
// Vercel build workflow:
//   vercel.json buildCommand:
//     git clone --depth=1 https://oauth2:$FITTRACKER2_DEPLOY_TOKEN@github.com/Regevba/FitTracker2.git ../FitTracker2
//     npm run build           # prebuild hook runs this script
//
// On any failure, the script exits non-zero so the build fails fast (better
// than silently shipping stale or missing data — see PRD §14 R-1).

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  statSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRIPT_DIR = new URL('.', import.meta.url).pathname;
const FITME_STORY_ROOT = resolve(SCRIPT_DIR, '..');

// Default paths used when syncDashboardData is called without overrides
// (the production prebuild flow). Tests inject custom paths via the
// SyncPaths argument so they can construct an isolated tmp-dir layout
// without touching the real project tree.
const DEFAULT_PATHS: SyncPaths = {
  ft2Root:        resolve(FITME_STORY_ROOT, '..', 'FitTracker2'),
  ft2Shared:      resolve(FITME_STORY_ROOT, '..', 'FitTracker2', '.claude', 'shared'),
  ft2Features:    resolve(FITME_STORY_ROOT, '..', 'FitTracker2', '.claude', 'features'),
  ft2Logs:        resolve(FITME_STORY_ROOT, '..', 'FitTracker2', '.claude', 'logs'),
  ft2IntegritySnapshots: resolve(FITME_STORY_ROOT, '..', 'FitTracker2', '.claude', 'integrity', 'snapshots'),
  ft2Skills:      resolve(FITME_STORY_ROOT, '..', 'FitTracker2', '.claude', 'skills'),
  localShared:    resolve(FITME_STORY_ROOT, 'src', 'data', 'shared'),
  localFeatures:  resolve(FITME_STORY_ROOT, 'src', 'data', 'features'),
  localLogs:      resolve(FITME_STORY_ROOT, 'src', 'data', 'logs'),
  localDocs:      resolve(FITME_STORY_ROOT, 'src', 'data', 'docs'),
  localIntegritySnapshots: resolve(FITME_STORY_ROOT, 'src', 'data', 'integrity', 'snapshots'),
  localSkills:    resolve(FITME_STORY_ROOT, 'src', 'data', 'skills'),
  localFramework: resolve(FITME_STORY_ROOT, 'src', 'data', 'framework'),
  freshnessPath:  resolve(FITME_STORY_ROOT, 'src', 'data', 'freshness.json'),
};

// Source markdowns the control-room parsers consume. Paths are relative to
// FT2 root and the same relative structure is preserved under src/data/docs/
// so parsers can use a single repoRoot variable that points at either FT2 or
// the synced snapshot.
//
// FT2_DOC_PATHS is REQUIRED (sync fails fast if any are missing — these feed
// the parsers directly). FT2_DOC_TREES + FT2_ROOT_DOCS are OPTIONAL (sync
// includes whatever is present — these feed the knowledge-hub UI surface
// only and gracefully degrade if missing).
const FT2_DOC_PATHS: readonly string[] = [
  'docs/product/backlog.md',
  'docs/product/PRD.md',
  'docs/product/metrics-framework.md',
  'docs/master-plan/master-backlog-roadmap.md',
];

// Directory subtrees walked recursively for knowledge-hub content.
const FT2_DOC_TREES: readonly string[] = [
  'docs',
];

// Root-level files the builder references explicitly via buildMarkdownDoc.
const FT2_ROOT_DOCS: readonly string[] = [
  'README.md',
  'CLAUDE.md',
  'ai-engine/README.md',
  'backend/README.md',
];

const KNOWLEDGE_HUB_EXTENSIONS = new Set(['.md', '.csv']);

interface SyncPaths {
  ft2Root: string;
  ft2Shared: string;
  ft2Features: string;
  /** `.claude/logs/` — Tier 2.2 contemporaneous feature logs (v7.5+).
      Optional; sync skips silently if the dir doesn't exist. Added 2026-05-09
      Phase C (cross-repo state sync) per spec
      `docs/superpowers/specs/2026-05-09-cross-repo-state-sync.md`. */
  ft2Logs: string;
  /** `.claude/integrity/snapshots/` — 72h cycle history (v7.1+). Optional;
      sync skips silently if the dir doesn't exist (e.g. fresh repo). */
  ft2IntegritySnapshots: string;
  /** `.claude/skills/` — 12 project-owned skill packages (v7.8.5+). Each
      `{name}/SKILL.md` has a YAML frontmatter (name, description,
      last_updated, framework_version, status, adapters_used) that the
      /control-room/skills page renders. P1.2 follow-up — see
      docs/skills/skills-review-2026-05-13.md §5. */
  ft2Skills: string;
  localShared: string;
  localFeatures: string;
  /** `src/data/logs/` — synced sibling of `ft2Logs`. Phase C. */
  localLogs: string;
  localDocs: string;
  /** `src/data/integrity/snapshots/` — synced sibling of above. */
  localIntegritySnapshots: string;
  /** `src/data/skills/manifest.json` — parsed SKILL.md frontmatter manifest.
      P1.2 runtime-sync follow-up; replaces the static SKILL_MANIFEST in
      src/app/control-room/skills/page.tsx. */
  localSkills: string;
  /** `src/data/framework/` — build-time aggregates derived from FT2 state.json
      tree. Phase G (2026-06-05) starts the directory with the OQ-2 locked
      `feature-roster.json` aggregator per 3D Universe PRD §Data Contracts.
      Read by Act VI monument renderer at build time. */
  localFramework: string;
  freshnessPath: string;
}

interface FreshnessReport {
  syncedAt: string;
  durationMs: number;
  source: string;
  counts: {
    sharedFiles: number;
    featureFiles: number;
    /** Tier 2.2 contemporaneous feature logs (.claude/logs/*.log.json).
        Phase C addition — see spec 2026-05-09-cross-repo-state-sync.md. */
    logFiles: number;
    /** Required parser-input markdowns (FT2_DOC_PATHS). */
    docFiles: number;
    /** Optional knowledge-hub markdowns + root READMEs. */
    kbFiles: number;
    /** 72h integrity cycle snapshots (.claude/integrity/snapshots/*.json). */
    integritySnapshotFiles: number;
    /** Project-owned SKILL.md files parsed into skills/manifest.json
        (P1.2 runtime-sync follow-up). */
    skillFiles: number;
    bytesTotal: number;
  };
  checkedFiles: string[];
}

function copyJsonFile(srcPath: string, dstPath: string): { bytes: number } {
  const raw = readFileSync(srcPath, 'utf8');
  // Validate JSON parses (fail fast if upstream wrote a corrupt file).
  try {
    JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON at ${srcPath}: ${(err as Error).message}`);
  }
  mkdirSync(resolve(dstPath, '..'), { recursive: true });
  writeFileSync(dstPath, raw);
  return { bytes: Buffer.byteLength(raw, 'utf8') };
}

function copyTextFile(srcPath: string, dstPath: string): { bytes: number } {
  const raw = readFileSync(srcPath, 'utf8');
  mkdirSync(resolve(dstPath, '..'), { recursive: true });
  writeFileSync(dstPath, raw);
  return { bytes: Buffer.byteLength(raw, 'utf8') };
}

// ────────────────────────────────────────────────────────────────────────────
// Skills manifest sync (P1.2 follow-up to fitme-story PR #110)
//
// Parses every FT2 `.claude/skills/{name}/SKILL.md` YAML frontmatter and
// writes a single `src/data/skills/manifest.json` for the /control-room/skills
// page. Replaces the static SKILL_MANIFEST that was hand-synced at v7.8.5+S
// sweep ship time. Soft-fail on missing FT2 dir (fresh repo / cross-repo
// asymmetry per v7.8.2 spec).
// ────────────────────────────────────────────────────────────────────────────

type SkillStatus = 'active' | 'stable' | 'planned' | 'deprecated';

interface SkillRow {
  name: string;
  description: string;
  status: SkillStatus | '';
  lastUpdated: string;
  frameworkVersion: string;
  adaptersUsed: string[];
  loc: number;
}

interface SkillsManifest {
  syncedAt: string;
  source: string;
  skills: SkillRow[];
}

const PLACEHOLDER_SKILL_DIRS = new Set(['_template', '_shared', '_project']);

function parseSkillFrontmatter(raw: string): Record<string, string> {
  const lines = raw.split('\n');
  if (lines.length === 0 || lines[0].trim() !== '---') return {};
  const fm: Record<string, string> = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') break;
    const colon = lines[i].indexOf(':');
    if (colon < 0) continue;
    const key = lines[i].slice(0, colon).trim();
    let val = lines[i].slice(colon + 1).trim();
    if (val.length >= 2) {
      const first = val[0];
      const last = val[val.length - 1];
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        val = val.slice(1, -1);
      }
    }
    fm[key] = val;
  }
  return fm;
}

function parseInlineList(raw: string): string[] {
  if (!raw) return [];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    return raw
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
}

function isSkillStatus(s: string): s is SkillStatus {
  return s === 'active' || s === 'stable' || s === 'planned' || s === 'deprecated';
}

function syncSkillsManifest(
  ft2Skills: string,
  localSkills: string,
): { fileCount: number; bytes: number; checked: string[] } {
  const checked: string[] = [];
  if (!existsSync(ft2Skills)) {
    return { fileCount: 0, bytes: 0, checked };
  }
  if (existsSync(localSkills)) rmSync(localSkills, { recursive: true, force: true });
  mkdirSync(localSkills, { recursive: true });

  const skills: SkillRow[] = [];
  let bytesTotal = 0;

  for (const entry of readdirSync(ft2Skills, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (PLACEHOLDER_SKILL_DIRS.has(entry.name)) continue;
    const skillMd = join(ft2Skills, entry.name, 'SKILL.md');
    if (!existsSync(skillMd)) continue;

    const raw = readFileSync(skillMd, 'utf8');
    const fm = parseSkillFrontmatter(raw);
    const status = fm.status ?? '';
    const row: SkillRow = {
      name: fm.name ?? entry.name,
      description: fm.description ?? '',
      status: isSkillStatus(status) ? status : '',
      lastUpdated: fm.last_updated ?? '',
      frameworkVersion: fm.framework_version ?? '',
      adaptersUsed: parseInlineList(fm.adapters_used ?? ''),
      loc: raw.split('\n').length,
    };
    skills.push(row);
    bytesTotal += Buffer.byteLength(raw, 'utf8');
    checked.push(`skills/${entry.name}/SKILL.md`);
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  const manifest: SkillsManifest = {
    syncedAt: new Date().toISOString(),
    source: ft2Skills,
    skills,
  };

  const manifestPath = join(localSkills, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  checked.push('skills/manifest.json');

  return { fileCount: skills.length, bytes: bytesTotal, checked };
}

/**
 * Recursively walk a directory and yield every file path.
 * Skips .DS_Store and .gitkeep noise that the macOS filesystem leaves around.
 */
function walkDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.DS_Store' || entry.name === '.gitkeep') return [];
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walkDir(full) : [full];
  });
}

/**
 * Phase F (2026-05-26): invoke FT2's `scripts/membrane-status.py --format=json`
 * at prebuild time and emit the parsed result to `<localShared>/membrane-status.json`.
 *
 * Required by the Framework Health dashboard's `MembraneStatusPanel`. Without this,
 * the panel falls back to "Membrane status unavailable" on Vercel because the
 * serverless runtime doesn't have Python, the FT2 repo, or filesystem access to
 * execFile the script at request time.
 *
 * Soft-fail strategy: if the script is missing OR Python is missing OR the script
 * errors OR the output isn't valid JSON, write an empty placeholder so the loader
 * + panel can render a graceful empty state.
 */
function syncMembraneStatus(
  ft2Root: string,
  localShared: string,
): { wrote: boolean; bytes: number; checked: string[]; error?: string } {
  const checked: string[] = [];
  const script = join(ft2Root, 'scripts', 'membrane-status.py');
  const dst = join(localShared, 'membrane-status.json');

  if (!existsSync(script)) {
    // Script not on disk (fresh repo, or v7.8 not yet merged). Leave any
    // prior synced file in place; reporter records skip reason.
    return { wrote: false, bytes: 0, checked, error: 'script_missing' };
  }

  try {
    const stdout = execFileSync('python3', [script, '--format=json'], {
      cwd: ft2Root,
      timeout: 15_000,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8',
      // Inherit stderr so prebuild logs surface any Python errors; stdout
      // is the JSON we capture.
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    // Defensive parse — if the script crashed mid-output or wrote non-JSON,
    // we'd rather write nothing than corrupt the panel's loader.
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    if (
      typeof parsed.feature_count !== 'number' ||
      !Array.isArray(parsed.features)
    ) {
      return { wrote: false, bytes: 0, checked, error: 'invalid_shape' };
    }
    const out = JSON.stringify(parsed, null, 2) + '\n';
    writeFileSync(dst, out, 'utf8');
    checked.push('shared/membrane-status.json');
    return { wrote: true, bytes: Buffer.byteLength(out, 'utf8'), checked };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { wrote: false, bytes: 0, checked, error: `exec_failed: ${msg}` };
  }
}

/**
 * Phase G (2026-06-05) — T-aggregator: build `src/data/framework/feature-roster.json`
 * by aggregating FT2 state.json files per the OQ-2 locked contract in
 * 3D Universe PRD §Data Contracts → `feature-roster.json aggregator contract
 * (OQ-2 closure, locked 2026-06-04)`.
 *
 * Schema (locked):
 *   { schema_version: '1.0.0', generated_at: 'YYYY-MM-DDTHH:MM:SSZ', entries: [
 *     { slug, status, framework_version, current_phase, case_study,
 *       parent_feature, state_owner, isolation_opt_out, has_brainstorm } ] }
 *
 * Sort key: `slug` (ASCII codepoint, alphabetical). Array order is stable
 * across runs so consumers can detect deltas via field-by-field diff.
 *
 * Privacy: allow-list filter — any field NOT in the FeatureRosterEntry type
 * below is silently dropped. cache_hits / per_phase_timing / wall_time_seconds
 * / cu_v2 / tasks / phases / timing / success_metrics / kill_criteria / etc
 * are dropped by design. New top-level state.json fields require explicit
 * opt-in in this function.
 *
 * Failure mode: a single corrupted state.json is logged to stderr but does
 * NOT abort the build (degraded-graceful — feature roster surfaces 95/96
 * monuments rather than 0).
 */
type FeatureRosterStatus = 'paused' | 'in_progress' | 'complete' | 'cancelled' | 'unknown';
interface FeatureRosterEntry {
  slug: string;
  status: FeatureRosterStatus;
  framework_version: string | null;
  current_phase: string;
  case_study: string | null;
  parent_feature: string | null;
  state_owner: 'ft2' | 'fitme-story' | null;
  isolation_opt_out: boolean;
  has_brainstorm: boolean;
}
interface FeatureRosterFile {
  schema_version: '1.0.0';
  generated_at: string;
  entries: FeatureRosterEntry[];
}

function deriveFeatureStatus(currentPhase: unknown): FeatureRosterStatus {
  if (typeof currentPhase !== 'string') return 'unknown';
  if (currentPhase === 'complete') return 'complete';
  if (currentPhase === 'cancelled' || currentPhase === 'canceled') return 'cancelled';
  if (currentPhase === 'paused') return 'paused';
  // Any other recognized phase (research, prd, tasks_phase, ux_or_integration,
  // implementation, testing, review, merge, docs) is treated as in_progress.
  return 'in_progress';
}

export function aggregateFeatureRoster(
  ft2Features: string,
  localFramework: string,
): { wrote: boolean; bytes: number; checked: string[]; entries: number; error?: string } {
  const checked: string[] = [];
  if (!existsSync(ft2Features)) {
    return { wrote: false, bytes: 0, checked, entries: 0, error: 'ft2_features_missing' };
  }
  const dstDir = localFramework;
  if (!existsSync(dstDir)) mkdirSync(dstDir, { recursive: true });
  const dst = join(dstDir, 'feature-roster.json');

  const entries: FeatureRosterEntry[] = [];
  const featureDirs = readdirSync(ft2Features).sort();
  for (const dirName of featureDirs) {
    const stateJsonPath = join(ft2Features, dirName, 'state.json');
    if (!existsSync(stateJsonPath)) continue;
    try {
      const raw = readFileSync(stateJsonPath, 'utf8');
      const s = JSON.parse(raw) as Record<string, unknown>;
      const stateOwner = s.state_owner;
      entries.push({
        slug: typeof s.feature_name === 'string' ? s.feature_name : dirName,
        status: deriveFeatureStatus(s.current_phase),
        framework_version: typeof s.framework_version === 'string' ? s.framework_version : null,
        current_phase: typeof s.current_phase === 'string' ? s.current_phase : 'unknown',
        case_study: typeof s.case_study === 'string' ? s.case_study : null,
        parent_feature: typeof s.parent_feature === 'string' ? s.parent_feature : null,
        state_owner:
          stateOwner === 'ft2' || stateOwner === 'fitme-story' ? stateOwner : null,
        isolation_opt_out: s.isolation_opt_out === true,
        has_brainstorm: Boolean(
          s.brainstorm &&
            typeof s.brainstorm === 'object' &&
            Object.keys(s.brainstorm as Record<string, unknown>).length > 0,
        ),
      });
    } catch (err) {
      console.warn(
        `feature-roster: skipped ${dirName}/state.json (${err instanceof Error ? err.message : err})`,
      );
    }
  }
  // Stable alphabetical sort by slug (ASCII codepoint, locked contract).
  entries.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  const file: FeatureRosterFile = {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    entries,
  };
  const out = JSON.stringify(file, null, 2) + '\n';
  writeFileSync(dst, out, 'utf8');
  checked.push('framework/feature-roster.json');
  return {
    wrote: true,
    bytes: Buffer.byteLength(out, 'utf8'),
    checked,
    entries: entries.length,
  };
}

/**
 * Phase G.2 (2026-06-05) — pure-copy mirrors for the 3D Universe build-time
 * data inputs. Each function mirrors one FT2 source file into the
 * `src/data/framework/` tree following the same allow-list discipline as
 * `aggregateFeatureRoster` — no transformation, no field-drop, no
 * `generated_at` wrapper. The contents are passed through verbatim because
 * downstream consumers (Act III/IV/V/VI scene components + the planned
 * snapshot loader at T-snapshot-loader) treat these as authoritative.
 *
 * Each function is soft-fail: missing source file logs a warning + returns
 * `{ wrote: false, error }` so the prebuild does not abort. This is the
 * same posture as `syncMembraneStatus` (Phase F).
 */
export function mirrorVersionsJson(
  ft2Root: string,
  localFramework: string,
): { wrote: boolean; bytes: number; checked: string[]; error?: string } {
  return mirrorJsonFile({
    src: join(ft2Root, 'docs', 'framework', 'versions.json'),
    dstDir: localFramework,
    dstName: 'versions.json',
    checkedKey: 'framework/versions.json',
  });
}

export function mirrorMeasurementAdoption(
  ft2Shared: string,
  localFramework: string,
): { wrote: boolean; bytes: number; checked: string[]; error?: string } {
  return mirrorJsonFile({
    src: join(ft2Shared, 'measurement-adoption.json'),
    dstDir: localFramework,
    dstName: 'adoption-snapshot.json',
    checkedKey: 'framework/adoption-snapshot.json',
  });
}

export function mirrorPatternSkillMap(
  ft2Shared: string,
  localFramework: string,
): { wrote: boolean; bytes: number; checked: string[]; error?: string } {
  return mirrorJsonFile({
    src: join(ft2Shared, 'pattern-skill-map.json'),
    dstDir: localFramework,
    dstName: 'pattern-skill-map.json',
    checkedKey: 'framework/pattern-skill-map.json',
  });
}

/** Internal helper backing the 3 mirrors above. JSON-validates the source
 * before copying so a corrupted upstream produces a clean error rather than
 * shipping invalid JSON to the public site. */
function mirrorJsonFile(opts: {
  src: string;
  dstDir: string;
  dstName: string;
  checkedKey: string;
}): { wrote: boolean; bytes: number; checked: string[]; error?: string } {
  const checked: string[] = [];
  if (!existsSync(opts.src)) {
    return { wrote: false, bytes: 0, checked, error: `source_missing: ${opts.src}` };
  }
  if (!existsSync(opts.dstDir)) mkdirSync(opts.dstDir, { recursive: true });
  const dst = join(opts.dstDir, opts.dstName);
  try {
    const raw = readFileSync(opts.src, 'utf8');
    JSON.parse(raw); // validate parses
    writeFileSync(dst, raw, 'utf8');
    checked.push(opts.checkedKey);
    return { wrote: true, bytes: Buffer.byteLength(raw, 'utf8'), checked };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { wrote: false, bytes: 0, checked, error: `parse_or_io_failed: ${msg}` };
  }
}

async function syncDashboardData(paths: SyncPaths = DEFAULT_PATHS): Promise<FreshnessReport> {
  const startedAt = Date.now();
  const {
    ft2Root,
    ft2Shared,
    ft2Features,
    ft2Logs,
    ft2IntegritySnapshots,
    ft2Skills,
    localShared,
    localFeatures,
    localLogs,
    localDocs,
    localIntegritySnapshots,
    localSkills,
    localFramework,
    freshnessPath,
  } = paths;

  if (!existsSync(ft2Root)) {
    // Option A fallback: when FT2 isn't on disk (e.g. Vercel builders, fresh
    // clones without the FT2 sibling), fall back to the committed snapshot in
    // src/data/. The build can still succeed; the snapshot will simply be
    // whatever was last committed by `npm run prebuild` locally. Switching to
    // Option B (vercel.json buildCommand clones FT2) or Option C (signed
    // freshness contract) removes the manual commit step.
    if (existsSync(localShared) && existsSync(localFeatures)) {
      const fallbackReport: FreshnessReport = {
        syncedAt: new Date(0).toISOString(),
        durationMs: 0,
        source: 'committed-snapshot (FT2 not present at build time)',
        counts: { sharedFiles: 0, featureFiles: 0, logFiles: 0, docFiles: 0, kbFiles: 0, integritySnapshotFiles: 0, skillFiles: 0, bytesTotal: 0 },
        checkedFiles: [],
      };
      // Don't overwrite an existing freshness.json — preserve the
      // last-known-good local sync timestamp for dashboard display.
      if (!existsSync(freshnessPath)) {
        writeFileSync(freshnessPath, JSON.stringify(fallbackReport, null, 2) + '\n');
      }
      console.log(
        `⚠ FT2 not present at ${ft2Root}; using committed snapshot in src/data/ (Option A fallback).`
      );
      return fallbackReport;
    }
    throw new Error(
      `FitTracker2 repo not found at ${ft2Root} AND no committed snapshot in src/data/. Locally: ensure FitTracker2 is cloned as a sibling of fitme-story. Vercel: configure vercel.json buildCommand to clone FitTracker2 first, OR commit src/data/ snapshot (Option A).`
    );
  }
  if (!existsSync(ft2Shared)) {
    throw new Error(`FT2 shared dir missing: ${ft2Shared}`);
  }
  if (!existsSync(ft2Features)) {
    throw new Error(`FT2 features dir missing: ${ft2Features}`);
  }

  // Wipe + recreate target dirs to avoid stale leftovers when files are removed upstream.
  if (existsSync(localShared)) rmSync(localShared, { recursive: true, force: true });
  if (existsSync(localFeatures)) rmSync(localFeatures, { recursive: true, force: true });
  if (existsSync(localDocs)) rmSync(localDocs, { recursive: true, force: true });
  if (existsSync(localIntegritySnapshots)) rmSync(localIntegritySnapshots, { recursive: true, force: true });
  mkdirSync(localShared, { recursive: true });
  mkdirSync(localFeatures, { recursive: true });
  mkdirSync(localDocs, { recursive: true });
  mkdirSync(localIntegritySnapshots, { recursive: true });

  let bytesTotal = 0;
  const checked: string[] = [];

  // Sync .claude/shared/*.json (top-level; recurse into immediate subdirs).
  for (const entry of readdirSync(ft2Shared)) {
    const src = join(ft2Shared, entry);
    const stat = statSync(src);
    if (stat.isFile() && entry.endsWith('.json')) {
      const { bytes } = copyJsonFile(src, join(localShared, entry));
      bytesTotal += bytes;
      checked.push(`shared/${entry}`);
    } else if (stat.isDirectory()) {
      // One level of subdir nesting (e.g. shared/hadf/*.json)
      for (const sub of readdirSync(src)) {
        if (sub.endsWith('.json')) {
          const subSrc = join(src, sub);
          const subDst = join(localShared, entry, sub);
          const { bytes } = copyJsonFile(subSrc, subDst);
          bytesTotal += bytes;
          checked.push(`shared/${entry}/${sub}`);
        }
      }
    }
  }

  // Sync per-feature state.json — one file per feature directory.
  for (const feature of readdirSync(ft2Features)) {
    const featureDir = join(ft2Features, feature);
    if (!statSync(featureDir).isDirectory()) continue;
    const stateSrc = join(featureDir, 'state.json');
    if (!existsSync(stateSrc)) continue;
    const stateDst = join(localFeatures, `${feature}.json`);
    const { bytes } = copyJsonFile(stateSrc, stateDst);
    bytesTotal += bytes;
    checked.push(`features/${feature}.json`);
  }

  // Phase A: REQUIRED parser inputs. These four markdowns feed the
  // control-room parsers directly; sync fails fast if any are missing.
  // Tracked under the `md/` lane in checkedFiles.
  for (const docPath of FT2_DOC_PATHS) {
    const docSrc = resolve(ft2Root, docPath);
    if (!existsSync(docSrc)) {
      throw new Error(`FT2 doc missing: ${docSrc}`);
    }
    const docDst = join(localDocs, docPath);
    const { bytes } = copyTextFile(docSrc, docDst);
    bytesTotal += bytes;
    checked.push(`md/${docPath}`);
  }

  // Phase B: OPTIONAL knowledge-hub content. Walks each configured tree
  // recursively and copies every .md / .csv file. Files duplicated from
  // Phase A are skipped (already copied + already counted under `md/`).
  // Tracked under the `kb/` lane in checkedFiles to keep parser input
  // counts clean.
  const phaseAPathSet = new Set(FT2_DOC_PATHS);
  for (const tree of FT2_DOC_TREES) {
    const treeRoot = resolve(ft2Root, tree);
    for (const fullPath of walkDir(treeRoot)) {
      const ext = fullPath.slice(fullPath.lastIndexOf('.'));
      if (!KNOWLEDGE_HUB_EXTENSIONS.has(ext)) continue;
      const relPath = fullPath.slice(ft2Root.length + 1);
      if (phaseAPathSet.has(relPath)) continue;
      const docDst = join(localDocs, relPath);
      const { bytes } = copyTextFile(fullPath, docDst);
      bytesTotal += bytes;
      checked.push(`kb/${relPath}`);
    }
  }

  // Phase C: OPTIONAL root-level files the builder references explicitly
  // (buildMarkdownDoc('README.md', ...) etc.). Soft-fail on missing.
  for (const rootPath of FT2_ROOT_DOCS) {
    const docSrc = resolve(ft2Root, rootPath);
    if (!existsSync(docSrc)) continue;
    const docDst = join(localDocs, rootPath);
    const { bytes } = copyTextFile(docSrc, docDst);
    bytesTotal += bytes;
    checked.push(`kb/${rootPath}`);
  }

  // Phase C-1 (2026-05-09): Tier 2.2 contemporaneous feature logs
  // (.claude/logs/*.log.json). Forward-only sync per cross-repo-state-sync
  // spec — FT2 is the canonical writer (scripts/append-feature-log.py runs
  // from FT2 cwd); fitme-story consumes for control-room display.
  // Soft-fail on missing dir (fresh repo).
  if (existsSync(ft2Logs)) {
    for (const entry of readdirSync(ft2Logs)) {
      // Only sync per-feature .log.json files. Skip:
      // - gate-coverage.jsonl: FT2's mirrored as gate-coverage-ft2.jsonl per v7.8.3 spec §4.1
      //   (control-room aggregator reads both); fitme-story's stays per-repo (no sync).
      //   Reverses the Phase C original spec §3 exclusion.
      // - _session-*.events.jsonl (Mechanism C; per-cwd, not synced)
      if (!entry.endsWith('.log.json')) continue;
      if (entry.startsWith('_')) continue;
      const src = join(ft2Logs, entry);
      const dst = join(localLogs, entry);
      const { bytes } = copyJsonFile(src, dst);
      bytesTotal += bytes;
      checked.push(`logs/${entry}`);
    }
  }

  // v7.8.3 §4.1: forward-sync FT2's gate-coverage.jsonl as gate-coverage-ft2.jsonl
  // (renamed -ft2 suffix to disambiguate from fitme-story's own local
  // .claude/logs/gate-coverage.jsonl). Control-room aggregator (Phase 1 C-4)
  // reads both files at build time. Reverses the original Phase C spec §3
  // explicit exclusion.
  const ft2GateCoverage = join(ft2Logs, 'gate-coverage.jsonl');
  if (existsSync(ft2GateCoverage)) {
    // Derive parent of localIntegritySnapshots (= src/data/integrity/) so the
    // file lands at src/data/integrity/gate-coverage-ft2.jsonl.
    const localIntegrityDir = resolve(localIntegritySnapshots, '..');
    const dst = join(localIntegrityDir, 'gate-coverage-ft2.jsonl');
    const { bytes } = copyTextFile(ft2GateCoverage, dst);
    bytesTotal += bytes;
    checked.push('integrity/gate-coverage-ft2.jsonl');
  }

  // Phase D: OPTIONAL 72h integrity-cycle snapshots
  // (.claude/integrity/snapshots/*.json). Required by the Framework Health
  // dashboard's CycleSnapshotPanel; without this sync, the panel renders
  // "No snapshots yet" on Vercel because the FT2 source tree isn't on disk
  // at framework page render time. Soft-fail on missing dir (fresh repo).
  if (existsSync(ft2IntegritySnapshots)) {
    for (const entry of readdirSync(ft2IntegritySnapshots)) {
      if (!entry.endsWith('.json')) continue;
      const src = join(ft2IntegritySnapshots, entry);
      const dst = join(localIntegritySnapshots, entry);
      const { bytes } = copyJsonFile(src, dst);
      bytesTotal += bytes;
      checked.push(`integrity/${entry}`);
    }
  }

  // Phase E (2026-05-14): parse FT2 .claude/skills/{name}/SKILL.md frontmatter
  // into src/data/skills/manifest.json for the /control-room/skills page
  // (P1.2 runtime-sync follow-up to fitme-story PR #110). Soft-fail on
  // missing dir.
  const skillsSync = syncSkillsManifest(ft2Skills, localSkills);
  bytesTotal += skillsSync.bytes;
  checked.push(...skillsSync.checked);

  // Phase F (2026-05-26): invoke FT2's scripts/membrane-status.py and emit
  // src/data/shared/membrane-status.json so the MembraneStatusPanel can
  // render from a static JSON file rather than execFile-ing Python at
  // request time (which doesn't work in Vercel's serverless runtime).
  // Soft-fail: missing script / missing python / invalid shape just skips.
  const membraneSync = syncMembraneStatus(ft2Root, localShared);
  bytesTotal += membraneSync.bytes;
  checked.push(...membraneSync.checked);
  if (membraneSync.error) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sync] membrane-status emission skipped: ${membraneSync.error}`,
    );
  }

  // Phase G (2026-06-05) — T-aggregator: emit
  // src/data/framework/feature-roster.json per the OQ-2 locked contract
  // from 3D Universe PRD §Data Contracts. Read at build time by Act VI
  // monument renderer. Degraded-graceful — a single corrupted state.json
  // logs to stderr but does not abort the build.
  const featureRosterSync = aggregateFeatureRoster(ft2Features, localFramework);
  bytesTotal += featureRosterSync.bytes;
  checked.push(...featureRosterSync.checked);
  if (featureRosterSync.error) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sync] feature-roster emission skipped: ${featureRosterSync.error}`,
    );
  }

  // Phase G.2 (2026-06-05) — pure-copy mirrors for the 3D Universe's 3
  // remaining build-time data inputs:
  //   - versions.json        (Act I-VI timeline + per-version counts)
  //   - adoption-snapshot.json (Act V adoption bars)
  //   - pattern-skill-map.json (Act III chamber annotations + Act IV hover)
  // Each is soft-fail; missing source logs a warning + continues.
  for (const mirrorResult of [
    mirrorVersionsJson(ft2Root, localFramework),
    mirrorMeasurementAdoption(ft2Shared, localFramework),
    mirrorPatternSkillMap(ft2Shared, localFramework),
  ]) {
    bytesTotal += mirrorResult.bytes;
    checked.push(...mirrorResult.checked);
    if (mirrorResult.error) {
      // eslint-disable-next-line no-console
      console.warn(`[sync] framework mirror skipped: ${mirrorResult.error}`);
    }
  }

  const sharedFiles = checked.filter((c) => c.startsWith('shared/')).length;
  const featureFiles = checked.filter((c) => c.startsWith('features/')).length;
  const logFiles = checked.filter((c) => c.startsWith('logs/')).length;
  const docFiles = checked.filter((c) => c.startsWith('md/')).length;
  const kbFiles = checked.filter((c) => c.startsWith('kb/')).length;
  const integritySnapshotFiles = checked.filter((c) => c.startsWith('integrity/')).length;
  const skillFiles = skillsSync.fileCount;

  const report: FreshnessReport = {
    syncedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    source: ft2Root,
    counts: { sharedFiles, featureFiles, logFiles, docFiles, kbFiles, integritySnapshotFiles, skillFiles, bytesTotal },
    checkedFiles: checked,
  };

  writeFileSync(freshnessPath, JSON.stringify(report, null, 2) + '\n');
  return report;
}

// Run when invoked directly (not when imported by a test).
if (import.meta.url === `file://${process.argv[1]}`) {
  syncDashboardData()
    .then((r) => {
      console.log(
        `✓ synced FitTracker2 → fitme-story: ${r.counts.sharedFiles} shared + ${r.counts.featureFiles} features + ${r.counts.logFiles} feature logs + ${r.counts.docFiles} parser docs + ${r.counts.kbFiles} kb docs + ${r.counts.integritySnapshotFiles} integrity snapshots + ${r.counts.skillFiles} skills (${(r.counts.bytesTotal / 1024).toFixed(1)} KB) in ${r.durationMs}ms`
      );
      console.log(`  freshness: ${DEFAULT_PATHS.freshnessPath}`);
    })
    .catch((err) => {
      console.error('✗ sync failed:', err.message);
      process.exit(1);
    });
}

export { syncDashboardData, DEFAULT_PATHS };
export type { SyncPaths };
export type { FreshnessReport };
