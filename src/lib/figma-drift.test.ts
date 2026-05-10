import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeLocalDrift,
  formatDriftReportMarkdown,
  type FigmaTsxEntry,
} from './figma-drift';
import { DESIGN_SYSTEM_COMPONENTS } from './design-system';

/**
 * Helper: build a "all components mapped" set of FigmaTsxEntry from the
 * manifest's hasFigmaConnect=true entries. Each manifest-mapped component
 * becomes a FigmaTsxEntry with a fake .figma.tsx path matching its
 * githubPath.
 */
function buildEntriesFromManifest(): FigmaTsxEntry[] {
  return DESIGN_SYSTEM_COMPONENTS.filter(c => c.hasFigmaConnect).map((c) => ({
    filePath: c.githubPath.replace(/\.tsx$/, '.figma.tsx'),
    componentName: c.name,
    nodeIds: (c.figmaNodeIds ?? []).map(n => n.nodeId),
    sourceFilePath: c.githubPath,
  }));
}

const ALWAYS_EXISTS = (_path: string) => true;
const NEVER_EXISTS = (_path: string) => false;

test('analyzeLocalDrift — full-parity input produces zero findings', () => {
  const entries = buildEntriesFromManifest();
  const report = analyzeLocalDrift(entries, ALWAYS_EXISTS);
  assert.equal(report.findings.length, 0, 'expected zero findings; got: ' + JSON.stringify(report.findings));
  assert.equal(report.publicParityCoverage, 100);
});

test('analyzeLocalDrift — manifest entry with hasFigmaConnect but no .figma.tsx → MAPPING_INCONSISTENCY fail', () => {
  const entries = buildEntriesFromManifest().slice(1); // drop first mapped entry
  const report = analyzeLocalDrift(entries, ALWAYS_EXISTS);
  const inconsistencies = report.findings.filter(f => f.code === 'MAPPING_INCONSISTENCY');
  assert.ok(inconsistencies.length >= 1, 'expected at least 1 MAPPING_INCONSISTENCY');
  assert.equal(inconsistencies[0].severity, 'fail');
});

test('analyzeLocalDrift — .figma.tsx for unknown component → CODE_ONLY fail', () => {
  const entries: FigmaTsxEntry[] = [
    {
      filePath: 'src/components/GhostComponent.figma.tsx',
      componentName: 'GhostComponent',
      nodeIds: ['99-99'],
      sourceFilePath: 'src/components/GhostComponent.tsx',
    },
    ...buildEntriesFromManifest(),
  ];
  const report = analyzeLocalDrift(entries, ALWAYS_EXISTS);
  const codeOnly = report.findings.filter(f => f.code === 'CODE_ONLY');
  assert.equal(codeOnly.length, 1);
  assert.equal(codeOnly[0].componentName, 'GhostComponent');
  assert.equal(codeOnly[0].severity, 'fail');
});

test('analyzeLocalDrift — .figma.tsx pointing to missing component source → MISSING_COMPONENT_SOURCE fail', () => {
  const entries = buildEntriesFromManifest();
  // Override existence check to return false for one component's source
  const checkPath = entries[0].sourceFilePath;
  const existsCheck = (path: string) => path !== checkPath;
  const report = analyzeLocalDrift(entries, existsCheck);
  const missing = report.findings.filter(f => f.code === 'MISSING_COMPONENT_SOURCE');
  assert.equal(missing.length, 1);
  assert.equal(missing[0].filePath, entries[0].filePath);
  assert.equal(missing[0].severity, 'fail');
});

test('analyzeLocalDrift — empty entries produces MAPPING_INCONSISTENCY for every mapped manifest entry', () => {
  const report = analyzeLocalDrift([], ALWAYS_EXISTS);
  // Every component in manifest with hasFigmaConnect=true should fire
  const expectedCount = DESIGN_SYSTEM_COMPONENTS.filter(c => c.hasFigmaConnect).length;
  const inconsistencies = report.findings.filter(f => f.code === 'MAPPING_INCONSISTENCY');
  assert.equal(inconsistencies.length, expectedCount, `expected ${expectedCount} got ${inconsistencies.length}`);
  assert.equal(report.publicParityCoverage, 100); // metric reads manifest, not findings
});

test('formatDriftReportMarkdown — produces valid markdown with parity numbers', () => {
  const entries = buildEntriesFromManifest();
  const report = analyzeLocalDrift(entries, ALWAYS_EXISTS);
  const md = formatDriftReportMarkdown(report);
  assert.ok(md.includes('### Drift snapshot'));
  assert.ok(md.includes('Public parity'));
  assert.ok(md.includes('100%'));
  assert.ok(md.includes('No drift findings.'));
});
