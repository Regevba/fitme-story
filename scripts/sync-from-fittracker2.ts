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
  ft2IntegritySnapshots: resolve(FITME_STORY_ROOT, '..', 'FitTracker2', '.claude', 'integrity', 'snapshots'),
  localShared:    resolve(FITME_STORY_ROOT, 'src', 'data', 'shared'),
  localFeatures:  resolve(FITME_STORY_ROOT, 'src', 'data', 'features'),
  localDocs:      resolve(FITME_STORY_ROOT, 'src', 'data', 'docs'),
  localIntegritySnapshots: resolve(FITME_STORY_ROOT, 'src', 'data', 'integrity', 'snapshots'),
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
  /** `.claude/integrity/snapshots/` — 72h cycle history (v7.1+). Optional;
      sync skips silently if the dir doesn't exist (e.g. fresh repo). */
  ft2IntegritySnapshots: string;
  localShared: string;
  localFeatures: string;
  localDocs: string;
  /** `src/data/integrity/snapshots/` — synced sibling of above. */
  localIntegritySnapshots: string;
  freshnessPath: string;
}

interface FreshnessReport {
  syncedAt: string;
  durationMs: number;
  source: string;
  counts: {
    sharedFiles: number;
    featureFiles: number;
    /** Required parser-input markdowns (FT2_DOC_PATHS). */
    docFiles: number;
    /** Optional knowledge-hub markdowns + root READMEs. */
    kbFiles: number;
    /** 72h integrity cycle snapshots (.claude/integrity/snapshots/*.json). */
    integritySnapshotFiles: number;
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

async function syncDashboardData(paths: SyncPaths = DEFAULT_PATHS): Promise<FreshnessReport> {
  const startedAt = Date.now();
  const {
    ft2Root,
    ft2Shared,
    ft2Features,
    ft2IntegritySnapshots,
    localShared,
    localFeatures,
    localDocs,
    localIntegritySnapshots,
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
        counts: { sharedFiles: 0, featureFiles: 0, docFiles: 0, kbFiles: 0, integritySnapshotFiles: 0, bytesTotal: 0 },
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

  const sharedFiles = checked.filter((c) => c.startsWith('shared/')).length;
  const featureFiles = checked.filter((c) => c.startsWith('features/')).length;
  const docFiles = checked.filter((c) => c.startsWith('md/')).length;
  const kbFiles = checked.filter((c) => c.startsWith('kb/')).length;
  const integritySnapshotFiles = checked.filter((c) => c.startsWith('integrity/')).length;

  const report: FreshnessReport = {
    syncedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    source: ft2Root,
    counts: { sharedFiles, featureFiles, docFiles, kbFiles, integritySnapshotFiles, bytesTotal },
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
        `✓ synced FitTracker2 → fitme-story: ${r.counts.sharedFiles} shared + ${r.counts.featureFiles} features + ${r.counts.docFiles} parser docs + ${r.counts.kbFiles} kb docs + ${r.counts.integritySnapshotFiles} integrity snapshots (${(r.counts.bytesTotal / 1024).toFixed(1)} KB) in ${r.durationMs}ms`
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
