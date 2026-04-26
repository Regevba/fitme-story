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
const FT2_ROOT = resolve(FITME_STORY_ROOT, '..', 'FitTracker2');
const FT2_SHARED = resolve(FT2_ROOT, '.claude', 'shared');
const FT2_FEATURES = resolve(FT2_ROOT, '.claude', 'features');
const LOCAL_SHARED = resolve(FITME_STORY_ROOT, 'src', 'data', 'shared');
const LOCAL_FEATURES = resolve(FITME_STORY_ROOT, 'src', 'data', 'features');
const FRESHNESS_PATH = resolve(FITME_STORY_ROOT, 'src', 'data', 'freshness.json');

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

async function syncDashboardData(): Promise<FreshnessReport> {
  const startedAt = Date.now();

  if (!existsSync(FT2_ROOT)) {
    throw new Error(
      `FitTracker2 repo not found at ${FT2_ROOT}. Locally: ensure FitTracker2 is cloned as a sibling of fitme-story. Vercel: configure vercel.json buildCommand to clone FitTracker2 first.`
    );
  }
  if (!existsSync(FT2_SHARED)) {
    throw new Error(`FT2 shared dir missing: ${FT2_SHARED}`);
  }
  if (!existsSync(FT2_FEATURES)) {
    throw new Error(`FT2 features dir missing: ${FT2_FEATURES}`);
  }

  // Wipe + recreate target dirs to avoid stale leftovers when files are removed upstream.
  if (existsSync(LOCAL_SHARED)) rmSync(LOCAL_SHARED, { recursive: true, force: true });
  if (existsSync(LOCAL_FEATURES)) rmSync(LOCAL_FEATURES, { recursive: true, force: true });
  mkdirSync(LOCAL_SHARED, { recursive: true });
  mkdirSync(LOCAL_FEATURES, { recursive: true });

  let bytesTotal = 0;
  const checked: string[] = [];

  // Sync .claude/shared/*.json (top-level; recurse into immediate subdirs).
  for (const entry of readdirSync(FT2_SHARED)) {
    const src = join(FT2_SHARED, entry);
    const stat = statSync(src);
    if (stat.isFile() && entry.endsWith('.json')) {
      const { bytes } = copyJsonFile(src, join(LOCAL_SHARED, entry));
      bytesTotal += bytes;
      checked.push(`shared/${entry}`);
    } else if (stat.isDirectory()) {
      // One level of subdir nesting (e.g. shared/hadf/*.json)
      for (const sub of readdirSync(src)) {
        if (sub.endsWith('.json')) {
          const subSrc = join(src, sub);
          const subDst = join(LOCAL_SHARED, entry, sub);
          const { bytes } = copyJsonFile(subSrc, subDst);
          bytesTotal += bytes;
          checked.push(`shared/${entry}/${sub}`);
        }
      }
    }
  }

  // Sync per-feature state.json — one file per feature directory.
  for (const feature of readdirSync(FT2_FEATURES)) {
    const featureDir = join(FT2_FEATURES, feature);
    if (!statSync(featureDir).isDirectory()) continue;
    const stateSrc = join(featureDir, 'state.json');
    if (!existsSync(stateSrc)) continue;
    const stateDst = join(LOCAL_FEATURES, `${feature}.json`);
    const { bytes } = copyJsonFile(stateSrc, stateDst);
    bytesTotal += bytes;
    checked.push(`features/${feature}.json`);
  }

  const sharedFiles = checked.filter((c) => c.startsWith('shared/')).length;
  const featureFiles = checked.filter((c) => c.startsWith('features/')).length;

  const report: FreshnessReport = {
    syncedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    source: FT2_ROOT,
    counts: { sharedFiles, featureFiles, bytesTotal },
    checkedFiles: checked,
  };

  writeFileSync(FRESHNESS_PATH, JSON.stringify(report, null, 2) + '\n');
  return report;
}

// Run when invoked directly (not when imported by a test).
if (import.meta.url === `file://${process.argv[1]}`) {
  syncDashboardData()
    .then((r) => {
      console.log(
        `✓ synced FitTracker2 → fitme-story: ${r.counts.sharedFiles} shared + ${r.counts.featureFiles} features (${(r.counts.bytesTotal / 1024).toFixed(1)} KB) in ${r.durationMs}ms`
      );
      console.log(`  freshness: ${FRESHNESS_PATH}`);
    })
    .catch((err) => {
      console.error('✗ sync failed:', err.message);
      process.exit(1);
    });
}

export { syncDashboardData };
export type { FreshnessReport };
