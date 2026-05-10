#!/usr/bin/env node
/**
 * scaffold-figma-mapping.mjs — auto-generate web Code Connect template
 * files from a feature's state.json::figma_node_ids block.
 *
 * Reads the synced state.json content from src/data/features/<feature>.json
 * (mirrored from FT2 by scripts/sync-from-fittracker2.ts on prebuild) OR
 * a directly-supplied path. For each Figma node entry, generates a matching
 * .figma.tsx template file alongside the corresponding React component.
 *
 * Coalesces multiple Figma nodes mapping to the same component into ONE
 * .figma.tsx file with multiple figma.connect() calls (one per state
 * variant — e.g., compact + expandable).
 *
 * Idempotent: skips if the .figma.tsx file already exists (use --force
 * to overwrite). Emits a report grouped by status.
 *
 * Usage:
 *   node scripts/scaffold-figma-mapping.mjs <feature-name>
 *   node scripts/scaffold-figma-mapping.mjs <feature-name> --dry-run
 *   node scripts/scaffold-figma-mapping.mjs <feature-name> --force
 *   node scripts/scaffold-figma-mapping.mjs --state path/to/state.json
 *
 * Companion: scripts/scaffold-figma-mapping.py in the FitTracker2 repo
 * does the equivalent for SwiftUI (.figma.swift).
 *
 * Source-of-truth design library (default): FitMe-Story-Web-Design-System
 * file key fsjHfFLAHELACZHku8Rfcl. Override via state.json:
 *   "figma_node_ids": {
 *     "library_file_key": "<key>",
 *     "library_file_name": "<file slug>",
 *     "<node-name>": "<X:Y>",
 *     "code_mapping": {
 *       "<node-name>": "MyComponentName"
 *     }
 *   }
 *
 * Exit codes:
 *   0  All Figma nodes scaffolded or skipped (file exists).
 *   1  Argument parse error or feature/state file not found.
 *   2  At least one Figma node could not be mapped to a React component
 *      (warning emitted; operator must hand-author or add code_mapping).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(REPO_ROOT, 'src', 'components');
const FEATURES_DIR = path.join(REPO_ROOT, 'src', 'data', 'features');

const DEFAULT_LIBRARY_FILE_KEY = 'fsjHfFLAHELACZHku8Rfcl';
const DEFAULT_LIBRARY_FILE_NAME = 'FitMe-Story-Web-Design-System';

const RESERVED_KEYS = new Set([
  'library_file_key',
  'library_file_name',
  'library_file_url',
  'code_mapping',
  'page',
  'section',
  'page_title_section',
]);

const STATE_QUALIFIER_SUFFIXES = [
  '_populated_active',
  '_populated',
  '_empty',
  '_loading',
  '_error',
  '_editor',
  '_states',
  '_banner',
  '_sheet',
  '_screen',
  '_view',
  '_compact',
  '_expanded',
  '_icon',
];

function snakeToPascal(s) {
  return s.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function* candidateComponentNames(nodeKey) {
  const base = snakeToPascal(nodeKey);
  yield base;
  yield base + 'Card';
  yield base + 'View';
  for (const suffix of STATE_QUALIFIER_SUFFIXES) {
    if (nodeKey.endsWith(suffix)) {
      const stripped = nodeKey.slice(0, -suffix.length);
      const strippedBase = snakeToPascal(stripped);
      yield strippedBase;
      yield strippedBase + 'Card';
      yield strippedBase + 'View';
    }
  }
}

function findComponentFile(componentName) {
  // Walk src/components/**/*.tsx and look for `export function <Name>`
  // or `export default function <Name>` matching componentName.
  const exportRegex = new RegExp(
    `^export\\s+(?:default\\s+)?(?:function|const)\\s+${componentName}\\b`
  );
  if (!fs.existsSync(COMPONENTS_DIR)) return null;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (
        entry.name.endsWith('.tsx') &&
        !entry.name.endsWith('.figma.tsx') &&
        !entry.name.endsWith('.test.tsx')
      ) {
        try {
          const lines = fs.readFileSync(full, 'utf8').split('\n');
          for (const line of lines) {
            if (exportRegex.test(line.trim())) return full;
          }
        } catch {
          // ignore unreadable files
        }
      }
    }
    return null;
  }
  return walk(COMPONENTS_DIR);
}

function normalizeNodeId(raw) {
  return String(raw).replace(/:/g, '-');
}

function figmaUrlFor(fileKey, fileName, nodeId) {
  return `https://www.figma.com/design/${fileKey}/${fileName}?node-id=${nodeId}`;
}

function stateQualifierSuffix(nodeKey) {
  const m = nodeKey.match(/_(populated_active|populated|empty|loading|error|editor|compact|expanded|icon)$/);
  return m ? '_' + snakeToPascal(m[1]) : '';
}

function fileTemplate(componentName, importPath, connections) {
  const FIGMA_BASE = `'https://www.figma.com/design/${connections[0].fileKey}/${connections[0].fileName}'`;
  const connectCalls = connections
    .map(
      (c) =>
        `figma.connect(${componentName}, \`\${FIGMA_BASE}?node-id=${c.nodeId}\`, {\n` +
        `  example: () => <${componentName} />,\n` +
        `});`
    )
    .join('\n\n');
  return (
    `// Figma Code Connect template — auto-scaffolded by\n` +
    `// scripts/scaffold-figma-mapping.mjs. Operator may adjust each\n` +
    `// example to render a more realistic preview.\n` +
    `\n` +
    `// @ts-expect-error - figma module is provided at parse time by @figma/code-connect\n` +
    `import figma from '@figma/code-connect';\n` +
    `import { ${componentName} } from '${importPath}';\n` +
    `\n` +
    `const FIGMA_BASE = ${FIGMA_BASE};\n` +
    `\n` +
    `${connectCalls}\n`
  );
}

function reportRow(status, nodeKey, nodeId, target = '') {
  const badge = {
    scaffolded: '✓',
    skipped: '·',
    unmapped: '!',
    'skipped-reserved': '·',
  }[status] ?? '?';
  const label = {
    scaffolded: 'wrote',
    skipped: 'exists',
    unmapped: 'no component found',
    'skipped-reserved': 'reserved key',
  }[status] ?? status;
  return `  ${badge} ${nodeKey.padEnd(35)} ${nodeId.padEnd(10)} ${label.padEnd(20)} ${target}`;
}

function parseArgs(argv) {
  const args = { feature: null, state: null, dryRun: false, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--state') args.state = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(__doc__());
      process.exit(0);
    } else if (!a.startsWith('--') && !args.feature) args.feature = a;
  }
  return args;
}

function __doc__() {
  return `Usage:
  node scripts/scaffold-figma-mapping.mjs <feature-name>
  node scripts/scaffold-figma-mapping.mjs <feature-name> --dry-run
  node scripts/scaffold-figma-mapping.mjs <feature-name> --force
  node scripts/scaffold-figma-mapping.mjs --state path/to/state.json
`;
}

function main() {
  const args = parseArgs(process.argv);
  let statePath;
  if (args.state) {
    statePath = path.isAbsolute(args.state)
      ? args.state
      : path.resolve(REPO_ROOT, args.state);
  } else if (args.feature) {
    statePath = path.join(FEATURES_DIR, `${args.feature}.json`);
  } else {
    console.error('ERROR: pass <feature-name> or --state <path>');
    return 1;
  }
  if (!fs.existsSync(statePath)) {
    console.error(`ERROR: state file not found at ${statePath}`);
    return 1;
  }
  let state;
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (e) {
    console.error(`ERROR: cannot parse ${statePath}: ${e.message}`);
    return 1;
  }

  const figmaNodeIds = state.figma_node_ids ?? {};
  if (Object.keys(figmaNodeIds).length === 0) {
    console.log(`NOTE: no figma_node_ids in ${statePath}; nothing to scaffold`);
    return 0;
  }

  const fileKey = figmaNodeIds.library_file_key ?? DEFAULT_LIBRARY_FILE_KEY;
  const fileName = figmaNodeIds.library_file_name ?? DEFAULT_LIBRARY_FILE_NAME;
  const codeMapping = figmaNodeIds.code_mapping ?? {};

  const rows = [];
  /** @type {Map<string, {componentName: string, importPath: string, connections: any[]}>} */
  const coalesced = new Map();
  let unmappedCount = 0;

  for (const [nodeKey, nodeValue] of Object.entries(figmaNodeIds)) {
    if (RESERVED_KEYS.has(nodeKey) || typeof nodeValue !== 'string') {
      rows.push(['skipped-reserved', nodeKey, String(nodeValue || ''), '']);
      continue;
    }
    const nodeId = normalizeNodeId(nodeValue);

    let componentName = codeMapping[nodeKey] ?? null;
    let componentFile = null;
    if (componentName) {
      componentFile = findComponentFile(componentName);
    } else {
      for (const candidate of candidateComponentNames(nodeKey)) {
        const found = findComponentFile(candidate);
        if (found) {
          componentFile = found;
          componentName = candidate;
          break;
        }
      }
    }

    if (!componentFile || !componentName) {
      rows.push(['unmapped', nodeKey, nodeId, '']);
      unmappedCount++;
      continue;
    }

    const outPath = path.join(
      path.dirname(componentFile),
      `${componentName}.figma.tsx`
    );
    const target = path.relative(REPO_ROOT, outPath);
    const dirRel = path.relative(path.dirname(outPath), componentFile)
      .replace(/\.tsx$/, '');
    const importPath = './' + path.basename(componentFile, '.tsx');
    const suffix = stateQualifierSuffix(nodeKey);

    if (!coalesced.has(outPath)) {
      coalesced.set(outPath, { componentName, importPath, connections: [] });
    }
    coalesced.get(outPath).connections.push({
      suffix,
      nodeId,
      fileKey,
      fileName,
    });
    rows.push(['scaffolded', nodeKey, nodeId, target]);
  }

  let written = 0;
  let skippedExisting = 0;
  for (const [outPath, { componentName, importPath, connections }] of coalesced) {
    if (fs.existsSync(outPath) && !args.force) {
      const target = path.relative(REPO_ROOT, outPath);
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === 'scaffolded' && rows[i][3] === target) {
          rows[i] = ['skipped', rows[i][1], rows[i][2], target];
          skippedExisting++;
        }
      }
      continue;
    }
    if (!args.dryRun) {
      fs.writeFileSync(outPath, fileTemplate(componentName, importPath, connections));
    }
    written++;
  }

  console.log(`\nFeature: ${args.feature ?? '(--state)'}`);
  console.log(`State:   ${path.relative(REPO_ROOT, statePath)}`);
  console.log(`Library: ${fileName} (key ${fileKey.slice(0, 8)}…)`);
  if (args.dryRun) console.log('Mode:    --dry-run (no files written)');
  console.log(`\n${rows.length} entries:`);
  for (const [status, nodeKey, nodeId, target] of rows) {
    console.log(reportRow(status, nodeKey, nodeId, target));
  }
  const counts = {};
  for (const [status] of rows) counts[status] = (counts[status] ?? 0) + 1;
  console.log(
    '\nSummary: ' +
      Object.entries(counts).sort().map(([s, c]) => `${c} ${s}`).join(', ')
  );
  console.log(`Files: ${written} written, ${skippedExisting} skipped (already exist; use --force)`);

  if (unmappedCount) {
    console.log(
      `\nWARNING: ${unmappedCount} Figma node(s) could not be mapped to a` +
        ` React component. Either hand-author the .figma.tsx files for these` +
        ` OR add a \`code_mapping\` block to state.json::figma_node_ids — see` +
        ' script header for example.'
    );
    return 2;
  }
  return 0;
}

process.exit(main());
