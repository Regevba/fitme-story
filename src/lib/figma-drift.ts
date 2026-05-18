/**
 * Drift detection for the fitme-story design system.
 *
 * Cross-checks 4 sources:
 *   1. The typed manifest (DESIGN_SYSTEM_COMPONENTS in design-system.ts) — what
 *      we DECLARE as the design system
 *   2. .figma.tsx files in src/components/** — what's actually mapped to Figma
 *      via Code Connect
 *   3. The live Figma file (fsjHfFLAHELACZHku8Rfcl) — what frames exist —
 *      OPTIONAL, requires FIGMA_ACCESS_TOKEN
 *   4. Component .tsx files alongside the .figma.tsx mappings — confirms each
 *      mapped component still exists in code
 *
 * Findings:
 *   - manifest_only: in manifest, but no .figma.tsx file exists
 *   - code_only: .figma.tsx file exists, but component not in manifest
 *   - mapping_inconsistency: manifest says hasFigmaConnect but no .figma.tsx,
 *     or vice versa
 *   - missing_component_source: .figma.tsx imports a component file that
 *     doesn't exist on disk
 *   - orphan_figma_nodes: nodes in the Figma file not referenced by any
 *     .figma.tsx (only when FIGMA_ACCESS_TOKEN provided)
 *
 * Used by:
 *   - scripts/figma-drift.mjs (CLI entrypoint)
 *   - tests in src/lib/figma-drift.test.ts
 */

import {
  DESIGN_SYSTEM_COMPONENTS,
  type ComponentManifestEntry,
  FITME_STORY_FIGMA_FILE_KEY,
} from './design-system';

export interface DriftFinding {
  severity: 'warn' | 'fail';
  code:
    | 'MANIFEST_ONLY'
    | 'CODE_ONLY'
    | 'MAPPING_INCONSISTENCY'
    | 'MISSING_COMPONENT_SOURCE'
    | 'ORPHAN_FIGMA_NODE';
  message: string;
  componentName?: string;
  filePath?: string;
  nodeId?: string;
}

export interface FigmaTsxEntry {
  /** Path of the .figma.tsx file relative to repo root. */
  filePath: string;
  /** The component name (parsed from the import statement). */
  componentName: string;
  /** All node IDs referenced via figma.connect() in the file. */
  nodeIds: string[];
  /** The path of the source component file (the import target). */
  sourceFilePath: string;
}

export interface DriftReport {
  generatedAt: string;
  /** SHA of the manifest commit (or null if unavailable). */
  manifestSha?: string | null;
  manifestEntries: number;
  manifestStableEntries: number;
  manifestInternalEntries: number;
  figmaTsxFiles: number;
  figmaTsxNodeReferences: number;
  /** Public parity (excludes Internal status). */
  publicParityCoverage: number;
  /** Total parity (includes Internal). */
  totalParityCoverage: number;
  findings: DriftFinding[];
  /** Stats summary for the README append. */
  summary: {
    totalManifest: number;
    totalMapped: number;
    publicMapped: number;
    publicTotal: number;
    findingsByCode: Record<string, number>;
  };
}

/**
 * Analyze the local drift state — manifest vs filesystem .figma.tsx files vs
 * component sources. Does NOT make any Figma API calls.
 *
 * `figmaTsxEntries` is supplied by the caller after scanning the filesystem
 * (the script in scripts/figma-drift.mjs does the scan + then calls this).
 * Returning the dependency makes the function pure-testable.
 *
 * `componentSourceExists` is a callback that returns whether a path exists on
 * disk. Allows tests to inject a virtual filesystem.
 */
export function analyzeLocalDrift(
  figmaTsxEntries: FigmaTsxEntry[],
  componentSourceExists: (path: string) => boolean,
): DriftReport {
  const findings: DriftFinding[] = [];

  // Build lookup tables
  const manifestByName = new Map<string, ComponentManifestEntry>();
  for (const c of DESIGN_SYSTEM_COMPONENTS) {
    manifestByName.set(c.name, c);
  }

  const figmaTsxByName = new Map<string, FigmaTsxEntry>();
  for (const t of figmaTsxEntries) {
    figmaTsxByName.set(t.componentName, t);
  }

  // Check 1: manifest entries with hasFigmaConnect: true but no .figma.tsx
  for (const entry of DESIGN_SYSTEM_COMPONENTS) {
    if (entry.hasFigmaConnect && !figmaTsxByName.has(entry.name)) {
      findings.push({
        severity: 'fail',
        code: 'MAPPING_INCONSISTENCY',
        message: `Manifest declares hasFigmaConnect=true for "${entry.name}" but no .figma.tsx file found in src/components/**`,
        componentName: entry.name,
      });
    }
    // Reverse: hasFigmaConnect=false but .figma.tsx exists
    if (!entry.hasFigmaConnect && figmaTsxByName.has(entry.name)) {
      findings.push({
        severity: 'warn',
        code: 'MAPPING_INCONSISTENCY',
        message: `Manifest declares hasFigmaConnect=false for "${entry.name}" but a .figma.tsx file exists at ${figmaTsxByName.get(entry.name)?.filePath}. Update manifest.`,
        componentName: entry.name,
        filePath: figmaTsxByName.get(entry.name)?.filePath,
      });
    }
  }

  // Check 2: .figma.tsx files where the component name is not in manifest.
  // Page-level mappings under src/app/** are exempt — pages map Figma frames
  // but are route handlers, not reusable design-system components, so they
  // legitimately do not appear in the manifest.
  for (const tsx of figmaTsxEntries) {
    if (tsx.filePath.startsWith('src/app/')) continue;
    if (!manifestByName.has(tsx.componentName)) {
      findings.push({
        severity: 'fail',
        code: 'CODE_ONLY',
        message: `.figma.tsx file at ${tsx.filePath} maps "${tsx.componentName}" but no manifest entry exists. Add to design-system.ts.`,
        componentName: tsx.componentName,
        filePath: tsx.filePath,
      });
    }
  }

  // Check 3: manifest entries with figmaNodeIds but no .figma.tsx mapping
  for (const entry of DESIGN_SYSTEM_COMPONENTS) {
    if (entry.figmaNodeIds && entry.figmaNodeIds.length > 0 && !figmaTsxByName.has(entry.name)) {
      findings.push({
        severity: 'fail',
        code: 'MANIFEST_ONLY',
        message: `Manifest declares ${entry.figmaNodeIds.length} Figma node IDs for "${entry.name}" but no .figma.tsx file exists.`,
        componentName: entry.name,
      });
    }
  }

  // Check 4: .figma.tsx files where the source component file doesn't exist
  for (const tsx of figmaTsxEntries) {
    if (!componentSourceExists(tsx.sourceFilePath)) {
      findings.push({
        severity: 'fail',
        code: 'MISSING_COMPONENT_SOURCE',
        message: `.figma.tsx file at ${tsx.filePath} imports from ${tsx.sourceFilePath} but that file does not exist on disk.`,
        componentName: tsx.componentName,
        filePath: tsx.filePath,
      });
    }
  }

  // Compute parity
  const totalManifest = DESIGN_SYSTEM_COMPONENTS.length;
  const totalMapped = DESIGN_SYSTEM_COMPONENTS.filter(c => c.hasFigmaConnect).length;
  const publicEntries = DESIGN_SYSTEM_COMPONENTS.filter(c => c.status !== 'Internal');
  const publicMapped = publicEntries.filter(c => c.hasFigmaConnect).length;

  const publicParityCoverage =
    publicEntries.length === 0 ? 0 : Math.round((publicMapped / publicEntries.length) * 100);
  const totalParityCoverage =
    totalManifest === 0 ? 0 : Math.round((totalMapped / totalManifest) * 100);

  const figmaTsxNodeReferences = figmaTsxEntries.reduce((sum, t) => sum + t.nodeIds.length, 0);

  const findingsByCode: Record<string, number> = {};
  for (const f of findings) {
    findingsByCode[f.code] = (findingsByCode[f.code] ?? 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    manifestEntries: totalManifest,
    manifestStableEntries: DESIGN_SYSTEM_COMPONENTS.filter(c => c.status === 'Stable').length,
    manifestInternalEntries: DESIGN_SYSTEM_COMPONENTS.filter(c => c.status === 'Internal').length,
    figmaTsxFiles: figmaTsxEntries.length,
    figmaTsxNodeReferences,
    publicParityCoverage,
    totalParityCoverage,
    findings,
    summary: {
      totalManifest,
      totalMapped,
      publicMapped,
      publicTotal: publicEntries.length,
      findingsByCode,
    },
  };
}

/**
 * Format a drift report as a markdown block suitable for appending to
 * docs/design-system/figma-code-sync-status.md.
 */
export function formatDriftReportMarkdown(report: DriftReport): string {
  const lines: string[] = [];
  lines.push(`### Drift snapshot — ${report.generatedAt}`);
  lines.push('');
  lines.push(`- Manifest entries: ${report.manifestEntries} (${report.manifestStableEntries} Stable + ${report.manifestInternalEntries} Internal)`);
  lines.push(`- .figma.tsx files: ${report.figmaTsxFiles} mapping ${report.figmaTsxNodeReferences} Figma nodes`);
  lines.push(`- **Public parity: ${report.publicParityCoverage}%** (${report.summary.publicMapped} / ${report.summary.publicTotal})`);
  lines.push(`- Total parity: ${report.totalParityCoverage}% (${report.summary.totalMapped} / ${report.summary.totalManifest})`);
  lines.push('');
  if (report.findings.length === 0) {
    lines.push('✓ No drift findings.');
  } else {
    lines.push(`Findings (${report.findings.length}):`);
    for (const f of report.findings) {
      const tag = f.severity === 'fail' ? '🛑' : '⚠️';
      lines.push(`- ${tag} \`${f.code}\` ${f.message}`);
    }
  }
  lines.push('');
  lines.push(`Source manifest: \`src/lib/design-system.ts\` · Figma file: \`${FITME_STORY_FIGMA_FILE_KEY}\``);
  lines.push('');
  return lines.join('\n');
}
