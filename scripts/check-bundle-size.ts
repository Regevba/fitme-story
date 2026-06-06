/**
 * scripts/check-bundle-size.ts
 *
 * Phase 4.G / T-bundle-size-check. AC-16 — performance contract.
 *
 * After `next build`, computes the gzipped size of JS chunks the
 * `/framework/universe` route loads, and fails if the total exceeds
 * the configured ceiling (default 350 KB compressed).
 *
 * Strategy: rather than parse a specific Next.js manifest (the manifest
 * shape varies across Next.js versions + Turbopack vs Webpack), we
 * combine two robust sources:
 *
 *   1. Route-specific chunks — walk `.next/static/chunks/app/framework/
 *      universe/` recursively; everything in that subtree is loaded
 *      by the `/framework/universe` page entry.
 *   2. Shared root chunks — `.next/build-manifest.json` lists
 *      `rootMainFiles` which every App Router route loads.
 *
 * Both lists are deduped before sizing. Files that don't exist on disk
 * are warned and skipped (handles partial builds gracefully).
 *
 * Why this exists: the 3D Universe is the largest single feature in the
 * fitme-story repo by deferred-bundle size — R3F + Drei + Three.js add
 * ~250-300 KB compressed on their own. A regression that pushed the
 * bundle past Lighthouse-perf-friendly territory would silently
 * degrade the Universe page's Core Web Vitals without showing up in
 * any other gate. This check makes such regressions loud at CI time.
 *
 * The ceiling is `BUNDLE_SIZE_CEILING_KB` (default 350) which can be
 * overridden via `CHECK_BUNDLE_SIZE_CEILING_KB` env var so operators
 * can do one-off relaxations without editing this script.
 *
 * Invocation:
 *   npm run build && npx tsx scripts/check-bundle-size.ts
 *
 * CI: wired into `.github/workflows/bundle-size.yml`.
 *
 * Exit codes:
 *   0 — total deferred bundle ≤ ceiling
 *   1 — ceiling exceeded
 *   2 — `.next/` missing or unreadable; build step probably failed
 */

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const NEXT_DIR = join(REPO_ROOT, '.next');
const BUILD_MANIFEST_PATH = join(NEXT_DIR, 'build-manifest.json');
const APP_BUILD_MANIFEST_PATH = join(NEXT_DIR, 'app-build-manifest.json');
const ROUTE_CHUNK_DIR_REL = 'static/chunks/app/framework/universe';

const DEFAULT_CEILING_KB = 350;
const ceilingKb = Number(process.env.CHECK_BUNDLE_SIZE_CEILING_KB) || DEFAULT_CEILING_KB;
const ceilingBytes = ceilingKb * 1024;

interface BuildManifest {
  rootMainFiles?: string[];
  polyfillFiles?: string[];
  [k: string]: unknown;
}

interface AppBuildManifest {
  pages?: Record<string, string[]>;
  [k: string]: unknown;
}

function fail(msg: string, exitCode: number): never {
  // eslint-disable-next-line no-console
  console.error(`::error title=check-bundle-size::${msg}`);
  process.exit(exitCode);
}

function readManifest<T>(path: string): T | null {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function gzippedSize(absPath: string): number {
  let buf: Buffer;
  try {
    buf = readFileSync(absPath);
  } catch {
    return 0;
  }
  return gzipSync(buf).length;
}

function walkJsFiles(dirAbs: string): string[] {
  // Recursive walk; returns absolute paths to .js files only (skip
  // sourcemaps + non-JS).
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dirAbs);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dirAbs, name);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      out.push(...walkJsFiles(full));
    } else if (s.isFile() && name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function main(): void {
  // Verify the build directory at least exists; everything else is
  // soft-fail with explanation.
  try {
    statSync(NEXT_DIR);
  } catch {
    fail(`.next/ missing at ${NEXT_DIR}. Run \`npm run build\` first.`, 2);
  }

  // ─── Collect candidate chunks ─────────────────────────────────────

  // 1. Route-specific: walk `static/chunks/app/framework/universe/`.
  const routeChunkDirAbs = join(NEXT_DIR, ROUTE_CHUNK_DIR_REL);
  const routeChunks = walkJsFiles(routeChunkDirAbs);

  // 2. Shared root chunks: from build-manifest.json's rootMainFiles.
  const build = readManifest<BuildManifest>(BUILD_MANIFEST_PATH);
  const rootMain = (build?.rootMainFiles ?? []).map((rel) => join(NEXT_DIR, rel));

  // 3. Optional: app-build-manifest.json (older Next.js versions) maps
  //    routes to chunks. If present, include its `/framework/universe/page`
  //    entry. This handles the manifest-present case for completeness.
  const app = readManifest<AppBuildManifest>(APP_BUILD_MANIFEST_PATH);
  const appManifestChunks = (app?.pages?.['/framework/universe/page'] ?? []).map(
    (rel) => join(NEXT_DIR, rel),
  );

  const allChunks = Array.from(new Set([...routeChunks, ...rootMain, ...appManifestChunks]));

  if (allChunks.length === 0) {
    fail(
      `No chunks found for /framework/universe. ` +
        `Expected directory ${routeChunkDirAbs} or build-manifest.json::rootMainFiles. ` +
        `Did \`next build\` complete?`,
      2,
    );
  }

  // ─── Sum gzipped sizes ────────────────────────────────────────────

  let total = 0;
  const perChunk: Array<{ chunk: string; sizeBytes: number }> = [];
  let missingCount = 0;
  for (const chunkAbs of allChunks) {
    const sz = gzippedSize(chunkAbs);
    if (sz === 0) {
      missingCount += 1;
      continue;
    }
    total += sz;
    perChunk.push({ chunk: relative(NEXT_DIR, chunkAbs), sizeBytes: sz });
  }
  perChunk.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const totalKb = (total / 1024).toFixed(1);
  const ceilingHumanKb = ceilingKb.toFixed(0);

  // eslint-disable-next-line no-console
  console.log(`bundle-size: /framework/universe`);
  // eslint-disable-next-line no-console
  console.log(`  route chunks:       ${routeChunks.length}`);
  // eslint-disable-next-line no-console
  console.log(`  shared root chunks: ${rootMain.length}`);
  // eslint-disable-next-line no-console
  console.log(`  total counted:      ${perChunk.length}`);
  if (missingCount > 0) {
    // eslint-disable-next-line no-console
    console.log(`  warn: ${missingCount} listed chunk(s) were missing on disk`);
  }
  // eslint-disable-next-line no-console
  console.log(`  total gzipped:      ${totalKb} KB  (ceiling ${ceilingHumanKb} KB)`);
  // eslint-disable-next-line no-console
  console.log('  top 8 chunks by size:');
  for (const row of perChunk.slice(0, 8)) {
    // eslint-disable-next-line no-console
    console.log(`    ${(row.sizeBytes / 1024).toFixed(1).padStart(7)} KB  ${row.chunk}`);
  }

  if (total > ceilingBytes) {
    fail(
      `Deferred bundle for /framework/universe is ${totalKb} KB gzipped, ` +
        `exceeding the ${ceilingHumanKb} KB ceiling. Consider: ` +
        `(1) deferring more imports via next/dynamic, ` +
        `(2) checking @react-three/drei import paths (huge tree-shake gains), ` +
        `(3) checking three.js + @react-three/fiber for accidental dual imports.`,
      1,
    );
  }

  // eslint-disable-next-line no-console
  console.log(`  ✓ within ceiling.`);
}

main();
