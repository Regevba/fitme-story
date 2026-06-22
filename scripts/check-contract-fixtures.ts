// scripts/check-contract-fixtures.ts
//
// F-CONTRACT-FIXTURE-SAMPLING — consumer-side contract validation (E-15).
//
// Closes the W16 silent-pass class END-TO-END on the consumer (fitme-story)
// side. The 2026-05-24 incident: FT2's gate_coverage producer emitted
// `timestamp`, the control-room consumer expected `event.ts`, and BOTH repos'
// tests agreed on the wrong shape — so the `/control-room/framework` page threw
// a TypeError in production for 13 days with green CI the whole time.
//
// The cure is to validate the data fitme-story CONSUMES against the producer's
// REAL sampled output, not a hand-authored fixture. This checker is the gate.
//
// Two failure tiers, deliberately asymmetric:
//   • SHAPE  (required_keys present on every record)  → HARD fail (exit 1).
//       A missing required key IS the incident class. Never tolerated.
//   • FRESHNESS (sampled_at within max_age_days)      → tier depends on owner:
//       - producer_repo === 'fitme-story'  → HARD  (we own re-sampling).
//       - producer_repo !== 'fitme-story'  → WARN  (vendored copies of an
//         FT2-produced contract; fitme-story cannot self-re-sample them, the
//         weekly cron re-vendors from synced FT2 output — staleness between
//         syncs is expected, not a build break).
//
// Sources validated:
//   1. Vendored fixtures under src/lib/control-room/__fixtures__/contracts/
//      (each <name>.jsonl + <name>.meta.json) — gate-coverage, audit-log, …
//   2. The LIVE state-json-schema consumer: src/data/features/*.json (the
//      transformed state the control-room actually renders). Validated in
//      place — no separate fixture — because that IS the consumed data.
//
// Usage:  tsx scripts/check-contract-fixtures.ts            (run)
//         npm run contract:check
//
// Exit codes: 0 = all shape checks pass (freshness warnings allowed);
//             1 = at least one HARD failure (shape drift or owned-fixture stale).

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..');
const DEFAULT_CONTRACT_DIR = join(REPO_ROOT, 'src/lib/control-room/__fixtures__/contracts');
const DEFAULT_FEATURES_DIR = join(REPO_ROOT, 'src/data/features');
export const MAX_AGE_DAYS = 7;

export interface Meta {
  contract: string;
  sampled_at: string;
  provenance: string;
  record_count?: number;
  required_keys: string[];
  producer_repo: string;
}

export interface Finding {
  contract: string;
  tier: 'shape' | 'freshness';
  hard: boolean;
  message: string;
}

export interface CheckResult {
  ok: string[];
  findings: Finding[];
}

export function ageDays(sampledAt: string, now: Date): number {
  const t = Date.parse(sampledAt);
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - t) / 86_400_000;
}

function readJsonlRecords(path: string): Record<string, unknown>[] {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as Record<string, unknown>);
}

/** Validate one vendored fixture (<name>.jsonl + <name>.meta.json). */
function checkVendoredFixture(metaPath: string, now: Date, findings: Finding[], ok: string[]): void {
  const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as Meta;
  const jsonlPath = metaPath.replace(/\.meta\.json$/, '.jsonl');
  if (!existsSync(jsonlPath)) {
    findings.push({
      contract: meta.contract,
      tier: 'shape',
      hard: true,
      message: `meta.json present but ${meta.contract}.jsonl is missing`,
    });
    return;
  }

  const records = readJsonlRecords(jsonlPath);
  if (records.length === 0) {
    findings.push({
      contract: meta.contract,
      tier: 'shape',
      hard: true,
      message: `${meta.contract}.jsonl is empty — nothing to validate against`,
    });
    return;
  }

  // SHAPE (HARD): every record must carry every required key.
  const missingByKey = new Map<string, number>();
  for (const rec of records) {
    for (const key of meta.required_keys) {
      if (!(key in rec)) missingByKey.set(key, (missingByKey.get(key) ?? 0) + 1);
    }
  }
  if (missingByKey.size > 0) {
    const detail = [...missingByKey.entries()]
      .map(([k, n]) => `"${k}" (${n}/${records.length} records)`)
      .join(', ');
    findings.push({
      contract: meta.contract,
      tier: 'shape',
      hard: true,
      message:
        `producer drift: required key(s) missing: ${detail}. ` +
        `Re-sample from the canonical producer.`,
    });
  }

  // FRESHNESS: HARD if we own the contract, WARN otherwise.
  const age = ageDays(meta.sampled_at, now);
  if (age > MAX_AGE_DAYS) {
    const ownsIt = meta.producer_repo === 'fitme-story';
    findings.push({
      contract: meta.contract,
      tier: 'freshness',
      hard: ownsIt,
      message:
        `fixture is ${age.toFixed(1)}d old (> ${MAX_AGE_DAYS}d). ` +
        (ownsIt
          ? `fitme-story is the canonical producer — re-run the sampler.`
          : `vendored from ${meta.producer_repo}; the weekly cron re-vendors. ` +
            `(advisory — not a build break.)`),
    });
  }

  if (missingByKey.size === 0 && age <= MAX_AGE_DAYS) {
    ok.push(`${meta.contract}: ${records.length} records, ${age.toFixed(1)}d fresh, shape ✓`);
  } else if (missingByKey.size === 0) {
    ok.push(`${meta.contract}: shape ✓ (freshness flagged separately)`);
  }
}

/**
 * Validate the LIVE state-json-schema consumer: src/data/features/*.json.
 * Required keys per the FT2 contract manifest: {current_phase, framework_version}
 * — the truly-universal subset (identity field is non-invariant). HARD.
 */
function checkLiveStateFeatures(featuresDir: string, findings: Finding[], ok: string[]): void {
  const CONTRACT = 'state-json-schema';
  const REQUIRED = ['current_phase', 'framework_version'];
  if (!existsSync(featuresDir)) {
    findings.push({
      contract: CONTRACT,
      tier: 'shape',
      hard: true,
      message: `consumer dir ${featuresDir} missing — sync did not run?`,
    });
    return;
  }
  const files = readdirSync(featuresDir).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    findings.push({
      contract: CONTRACT,
      tier: 'shape',
      hard: true,
      message: `no feature JSON in src/data/features — sync produced nothing`,
    });
    return;
  }
  const offenders: string[] = [];
  for (const f of files) {
    const d = JSON.parse(readFileSync(join(featuresDir, f), 'utf8')) as Record<string, unknown>;
    const missing = REQUIRED.filter((k) => !(k in d));
    if (missing.length > 0) offenders.push(`${f} (missing ${missing.join(', ')})`);
  }
  if (offenders.length > 0) {
    findings.push({
      contract: CONTRACT,
      tier: 'shape',
      hard: true,
      message:
        `consumer drift: ${offenders.length}/${files.length} feature files ` +
        `missing required key(s). First: ${offenders.slice(0, 3).join('; ')}`,
    });
  } else {
    ok.push(`${CONTRACT}: ${files.length} live feature files, all carry {${REQUIRED.join(', ')}} ✓`);
  }
}

/** Pure, testable entry point. Defaults to the repo's real dirs + now(). */
export function runChecks(opts: {
  contractDir?: string;
  featuresDir?: string;
  now?: Date;
} = {}): CheckResult {
  const contractDir = opts.contractDir ?? DEFAULT_CONTRACT_DIR;
  const featuresDir = opts.featuresDir ?? DEFAULT_FEATURES_DIR;
  const now = opts.now ?? new Date();
  const findings: Finding[] = [];
  const ok: string[] = [];

  if (existsSync(contractDir)) {
    for (const f of readdirSync(contractDir).filter((n) => n.endsWith('.meta.json'))) {
      checkVendoredFixture(join(contractDir, f), now, findings, ok);
    }
  }
  checkLiveStateFeatures(featuresDir, findings, ok);

  return { ok, findings };
}

function main(): number {
  const { ok, findings } = runChecks();

  console.log('Consumer-side contract-fixture check (fitme-story, E-15):');
  for (const line of ok) console.log(`  ✓ ${line}`);
  for (const fnd of findings) {
    const mark = fnd.hard ? '✗' : '·';
    const label = fnd.hard ? 'FAIL' : 'warn';
    console.log(`  ${mark} ${fnd.contract} [${fnd.tier}/${label}]: ${fnd.message}`);
  }

  const hardFails = findings.filter((f) => f.hard);
  const warns = findings.filter((f) => !f.hard);
  console.log(
    `\n${ok.length} ok · ${hardFails.length} hard-fail · ${warns.length} warn` +
      (hardFails.length === 0 ? '  → PASS' : '  → FAIL'),
  );
  return hardFails.length === 0 ? 0 : 1;
}

// Only run the CLI (and exit) when invoked directly, not when imported by tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
