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
  localShared:    resolve(FITME_STORY_ROOT, 'src', 'data', 'shared'),
  localFeatures:  resolve(FITME_STORY_ROOT, 'src', 'data', 'features'),
  freshnessPath:  resolve(FITME_STORY_ROOT, 'src', 'data', 'freshness.json'),
};

interface SyncPaths {
  ft2Root: string;
  ft2Shared: string;
  ft2Features: string;
  localShared: string;
  localFeatures: string;
  freshnessPath: string;
}

interface FreshnessReport {
  syncedAt: string;
  durationMs: number;
  source: string;
  counts: {
    sharedFiles: number;
    featureFiles: number;
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

async function syncDashboardData(paths: SyncPaths = DEFAULT_PATHS): Promise<FreshnessReport> {
  const startedAt = Date.now();
  const { ft2Root, ft2Shared, ft2Features, localShared, localFeatures, freshnessPath } = paths;

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
        counts: { sharedFiles: 0, featureFiles: 0, bytesTotal: 0 },
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
  mkdirSync(localShared, { recursive: true });
  mkdirSync(localFeatures, { recursive: true });

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

  const sharedFiles = checked.filter((c) => c.startsWith('shared/')).length;
  const featureFiles = checked.filter((c) => c.startsWith('features/')).length;

  const report: FreshnessReport = {
    syncedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    source: ft2Root,
    counts: { sharedFiles, featureFiles, bytesTotal },
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
        `✓ synced FitTracker2 → fitme-story: ${r.counts.sharedFiles} shared + ${r.counts.featureFiles} features (${(r.counts.bytesTotal / 1024).toFixed(1)} KB) in ${r.durationMs}ms`
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
