/**
 * Dashboard data builder — UCC T31 port from
 * dashboard/src/scripts/builders/controlCenter.js (FitTracker2 Astro source).
 *
 * Top-level orchestrator: reads every data source the control-room UI
 * consumes, calls reconcile + GitHub fetch, and returns a single
 * `DashboardData` shape ready for Server Components to render.
 *
 * Read sources (build time):
 *   - src/data/shared/*.json        — synced from .claude/shared/
 *   - src/data/features/*.json      — synced from .claude/features/<feat>/state.json
 *   - src/data/docs/**.md           — synced from FT2 docs/ (4 source markdowns)
 *   - src/data/control-room-seeds/  — committed seeds (features.json, caseStudies.json)
 *
 * SERVER-ONLY: imported only by Server Components / build-time code paths.
 *
 * NOTE on data-source gaps versus FT2 source:
 *  - The FT2 dashboard's `walkFiles(docsRoot)` walked the entire `docs/`
 *    tree for the knowledge hub. The synced snapshot only has 4 source
 *    markdowns, so the knowledge hub will degrade to a smaller set here.
 *    Resolving this is a sync-script extension or a UI decision (T18+).
 *  - The static seeds (`features.json`, `caseStudiesData.json`) are
 *    one-time copies of the FT2 dashboard's static fallback data. They
 *    can be promoted into the synced shared layer later if useful.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { basename, extname, relative, resolve } from 'node:path';

import featuresData from '../../data/control-room-seeds/features.json';
import caseStudiesData from '../../data/control-room-seeds/caseStudies.json';

import { reconcile, type Alert, type ReconcileResult } from './reconcile';
import { fetchIssues, type GitHubIssue } from './github';
import { parseStateFiles } from './parsers/state';
import {
  FITME_STORY_ROOT,
  SNAPSHOT_DOCS_ROOT,
  type StateFile,
} from './types';

// ─────────────────────────────────────────────────────────
// Public navigation constants
// ─────────────────────────────────────────────────────────

export interface PrimaryView {
  id: string;
  label: string;
}

export interface SecondaryWorkspace {
  id: string;
  label: string;
  href: string;
  routeOnly?: boolean;
}

export const PRIMARY_VIEWS: readonly PrimaryView[] = [
  { id: 'control', label: 'Control Room' },
  { id: 'board', label: 'Board' },
  { id: 'table', label: 'Table' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'knowledge', label: 'Knowledge' },
] as const;

export const SECONDARY_WORKSPACES: readonly SecondaryWorkspace[] = [
  { id: 'case-studies', label: 'Case Studies', href: '/case-studies', routeOnly: true },
  { id: 'claude-research', label: 'Claude Research', href: '/?view=claude-research' },
  { id: 'codex-research', label: 'Codex Research', href: '/?view=codex-research' },
  { id: 'figma-handoff', label: 'Figma Handoff', href: '/?view=figma-handoff' },
] as const;

export function isPrimaryView(view: string): boolean {
  return PRIMARY_VIEWS.some((item) => item.id === view);
}

export function isSecondaryWorkspace(view: string): boolean {
  return SECONDARY_WORKSPACES.some((item) => item.id === view);
}

// ─────────────────────────────────────────────────────────
// Constants + paths
// ─────────────────────────────────────────────────────────

const SHARED_DIR = resolve(FITME_STORY_ROOT, 'src/data/shared');
const GITHUB_BLOB_BASE = 'https://github.com/Regevba/FitTracker2/blob/main/';
const README_FIGMA_URL = 'https://www.figma.com/design/0Ai7s3fCFqR5JXDW8JvgmD';

interface DocGroupMeta {
  title: string;
  description: string;
  truthMode: string;
}

const DOC_GROUP_META: Record<string, DocGroupMeta> = {
  root: {
    title: 'Core Docs',
    description: 'Brand, repo-level guidance, and service READMEs that frame the whole project.',
    truthMode: 'repo fallback',
  },
  product: {
    title: 'Product & Planning',
    description: 'PRD, backlog, metrics, and planning references that define what the product should do.',
    truthMode: 'repo fallback',
  },
  'master-plan': {
    title: 'Master Plan',
    description: 'Longer-running planning, reconciliation, and checkpoint docs from major project cycles.',
    truthMode: 'repo fallback',
  },
  'design-system': {
    title: 'Design System & UX',
    description: 'Design-system governance, UX foundations, visual audits, and handoff guidance.',
    truthMode: 'repo fallback',
  },
  skills: {
    title: 'PM Framework & Skills',
    description: 'The PM-flow v4.3 ecosystem, hub/spoke docs, and framework evolution references.',
    truthMode: 'repo fallback',
  },
  'case-studies': {
    title: 'Case Study Docs',
    description: 'Narrative writeups and showcase docs that explain what happened across major cycles.',
    truthMode: 'archive',
  },
  prompts: {
    title: 'Prompts & Automation',
    description: 'Prompt libraries and handoff runners that support repeatable execution.',
    truthMode: 'repo fallback',
  },
  setup: {
    title: 'Setup & Integrations',
    description: 'Activation and environment setup guidance for local and external systems.',
    truthMode: 'repo fallback',
  },
  process: {
    title: 'Process',
    description: 'Lifecycle and operating-process references for the product workflow.',
    truthMode: 'repo fallback',
  },
  archive: {
    title: 'Archive',
    description: 'Older references kept for continuity and historical access.',
    truthMode: 'archive',
  },
};

const SHARED_PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ─────────────────────────────────────────────────────────
// Types — public output shape
// ─────────────────────────────────────────────────────────

export interface StaticFeature {
  name: string;
  slug?: string;
  phase?: string;
  priority?: string | null;
  rice?: number | null;
  category?: string | null;
  shipped?: string | null;
  prd?: string | null;
  sourceBucket?: string;
  source?: string;
  truthMode?: string;
  status?: string;
  sharedPhase?: string;
  painPoint?: string;
  metrics?: unknown;
  // Index signature so this is assignable to reconcile's looser StaticFeature.
  [key: string]: unknown;
}

export interface DocItem {
  id: string;
  title: string;
  preview: string;
  path: string;
  href: string;
  sourceLabel: string;
  truthMode: string;
}

export interface KnowledgeHubGroup {
  id: string;
  title: string;
  description: string;
  truthMode: string;
  docs: DocItem[];
}

export interface FrameworkPulse {
  sourceTruthScore: number;
  authoritativeFeatureCount: number;
  sharedFeatureCount: number;
  queueCount: number;
  queuePreview: Array<{ title: string; priority: string; workType: string; phase: string }>;
  missingInSharedCount: number;
  missingInStaticCount: number;
  statusConflictCount: number;
  totalConflicts: number;
  missingInShared: Array<{ name: string; phase: string; priority: string }>;
  missingInStatic: Array<{ name: string; status: string; phase: string }>;
  highlights: string[];
  conflicts: Array<{ name: string; staticStatus: string; sharedStatus: string }>;
}

export interface CaseStudyItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  workType: string;
  started: string;
  updated: string;
  frameworkVersion: string;
  summary: string;
  whyItMatters: string | null;
  sourceTruthScore: number | null;
  alertCount: number | null;
  routedWorkspacesAdded: number | null;
  knowledgeGroupsExposed: number | null;
  metrics: Record<string, unknown>;
  timeline: Array<Record<string, unknown>>;
  skillsFramework: unknown[];
  successCases: unknown[];
  failureCases: unknown[];
  nextCheckpoints: unknown[];
  artifacts: string[];
  docPath: string | null;
  href: string | null;
  truthMode: string;
}

export interface ResearchWorkspace {
  id: string;
  title: string;
  badge: string;
  summary: string;
  promptStarters: string[];
  workItems: Array<{ title: string; detail: string; href?: string }>;
  linkedItems: Array<{ title: string; detail: string }>;
  requiredDocs: DocItem[];
  truthMode: string;
}

export interface DashboardSourceEntry {
  count: number;
  healthy: boolean;
  alerts: number;
  mode: string;
}

export interface DashboardData {
  features: StaticFeature[];
  alerts: Alert[];
  sources: Record<string, DashboardSourceEntry>;
  frameworkManifest: unknown;
  frameworkPulse: FrameworkPulse;
  documentationDebt: unknown;
  externalSyncStatus: ExternalSyncStatus;
  cleanupCaseStudy: CaseStudyItem | undefined;
  knowledgeHub: {
    summary: { repoDocs: number; sharedDocs: number; externalDocs: number; groups: number; caseStudies: number };
    featuredDocs: DocItem[];
    groups: KnowledgeHubGroup[];
  };
  caseStudyFeed: CaseStudyItem[];
  researchWorkspaces: {
    claudeResearch: ResearchWorkspace;
    codexResearch: ResearchWorkspace;
    figmaHandoff: ResearchWorkspace;
  };
  workspaceMeta: {
    primaryViews: readonly PrimaryView[];
    secondaryWorkspaces: readonly SecondaryWorkspace[];
  };
}

// External-sync-status is a deeply nested JSON; we only narrow the parts the
// builder actually reads/writes.
interface ExternalSyncStatus {
  sources: {
    github: {
      repo_summary: { live_issue_api_connected?: boolean; live_issue_count?: number; working_tree_changes: number; local_branches: number };
      issue_summary?: { total: number; open: number; closed: number; with_phase_labels: number };
      alerts: number;
      healthy: boolean;
      findings: string[];
    };
    notion?: { tracked_pages?: Array<{ title: string; role: string; url: string }>; page_summary?: { tracked_pages: number }; healthy?: boolean; alerts?: number };
    linear?: { tracked_issues?: Array<{ id: string; title: string; status: string; priority: string }>; project?: { name: string; status: string; url: string }; issue_summary?: { total: number }; healthy?: boolean; alerts?: number };
    vercel?: { projects?: Record<string, { name: string; framework: string; live: boolean; url: string }>; deployment_summary?: { recent_deployments_reviewed: number }; healthy?: boolean; alerts?: number; findings?: string[] };
    analytics?: { instrumentation_summary?: { total_metrics: number }; healthy?: boolean; alerts?: number };
  };
  aggregate: { alerts: number; source_truth_score: number };
}

// ─────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────

function readSharedJson(filename: string): unknown {
  return JSON.parse(readFileSync(resolve(SHARED_DIR, filename), 'utf-8'));
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(dir, entry.name);
    if (entry.name === '.DS_Store' || entry.name === '.gitkeep') return [];
    if (entry.isDirectory()) return walkFiles(fullPath);
    return [fullPath];
  });
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function toTitleCase(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function prettyName(value: string): string {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractTitle(content: string, fallbackPath: string): string {
  const heading = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '));

  return heading ? heading.replace(/^#\s+/, '').trim() : prettyName(basename(fallbackPath));
}

function extractPreview(content: string, title: string): string {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== '---')
    .filter((line) => !line.startsWith('!['))
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.replace(/^>\s*/, ''));

  const preview = lines.find((line) => line !== title);
  return preview ? preview.slice(0, 180) : 'Open this document for the full reference.';
}

/** Build a DocItem from a synced markdown path (relative to SNAPSHOT_DOCS_ROOT). */
function buildMarkdownDoc(repoRelativePath: string, sourceLabel: string, truthMode = 'repo fallback'): DocItem | null {
  const fullPath = resolve(SNAPSHOT_DOCS_ROOT, repoRelativePath);
  if (!existsSync(fullPath)) return null;
  const content = readFileSync(fullPath, 'utf-8');
  const title = extractTitle(content, repoRelativePath);
  return {
    id: repoRelativePath,
    title,
    preview: extractPreview(content, title),
    path: repoRelativePath,
    href: `${GITHUB_BLOB_BASE}${repoRelativePath}`,
    sourceLabel,
    truthMode,
  };
}

function buildSharedDoc(fullPath: string): DocItem {
  const content = readFileSync(fullPath, 'utf-8');
  const repoRelativePath = relative(SHARED_DIR, fullPath).replace(/\\/g, '/');
  let preview = 'Shared framework data file.';

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const desc = (parsed['description'] ?? parsed['note']) as string | undefined;
    preview = desc ?? `${Object.keys(parsed).length} top-level keys.`;
  } catch {
    preview = 'Shared framework data file.';
  }

  return {
    id: `.claude/shared/${repoRelativePath}`,
    title: prettyName(basename(fullPath)),
    preview: preview.slice(0, 180),
    path: `.claude/shared/${repoRelativePath}`,
    href: `${GITHUB_BLOB_BASE}.claude/shared/${repoRelativePath}`,
    sourceLabel: 'Shared State',
    truthMode: 'shared-layer',
  };
}

function mapSharedPhase(phase: string | undefined, status: string | undefined): string {
  if (status === 'shipped' || phase === 'complete') return 'done';
  if (phase === 'implementation') return 'implement';
  if (phase === 'verification') return 'testing';
  if (phase === 'documentation') return 'docs';
  if (phase === 'not_started') return 'backlog';
  return phase ?? 'backlog';
}

interface SeededFeatures {
  shipped: StaticFeature[];
  planned: StaticFeature[];
  backlog: StaticFeature[];
}

function flattenStaticFeatures(): StaticFeature[] {
  const data = featuresData as SeededFeatures;
  return [
    ...data.shipped.map((feature) => ({ ...feature, sourceBucket: 'shipped' })),
    ...data.planned.map((feature) => ({ ...feature, sourceBucket: 'planned' })),
    ...data.backlog.map((feature) => ({ ...feature, sourceBucket: 'backlog' })),
  ];
}

function buildStaticIndex(staticFeatures: StaticFeature[]): Map<string, StaticFeature> {
  const index = new Map<string, StaticFeature>();

  for (const feature of staticFeatures) {
    const keys = new Set([
      normalizeName(feature.name),
      normalizeName(feature.slug ?? feature.name),
    ]);

    for (const key of keys) {
      if (!index.has(key)) index.set(key, feature);
    }
  }

  return index;
}

interface FeatureRegistryEntry {
  name: string;
  id?: string;
  phase?: string;
  status?: string;
  category?: string;
  prd?: string;
  pain_point?: string;
  metrics?: unknown;
}

interface FeatureRegistry {
  features?: FeatureRegistryEntry[];
}

function buildFeatureDataset(featureRegistry: FeatureRegistry): StaticFeature[] {
  const staticFeatures = flattenStaticFeatures();
  const staticIndex = buildStaticIndex(staticFeatures);
  const consumedStatic = new Set<string>();

  const sharedFeatures: StaticFeature[] = (featureRegistry.features ?? []).map((feature) => {
    const match =
      staticIndex.get(normalizeName(feature.name)) ??
      staticIndex.get(normalizeName(feature.id ?? '')) ??
      staticIndex.get(normalizeName((feature.id ?? '').replace(/-/g, ' ')));

    if (match) consumedStatic.add(match.slug ?? match.name);

    return {
      name: feature.name,
      slug: match?.slug ?? feature.id ?? normalizeName(feature.name),
      phase: mapSharedPhase(feature.phase, feature.status),
      priority: match?.priority ?? null,
      rice: match?.rice ?? null,
      category: match?.category ?? feature.category ?? 'uncategorized',
      shipped: feature.status === 'shipped' ? (match?.shipped ?? 'Shared layer') : null,
      prd: feature.prd ?? match?.prd ?? null,
      source: 'shared',
      truthMode: 'shared-layer',
      sourceBucket: 'shared',
      status: feature.status,
      sharedPhase: feature.phase,
      painPoint: feature.pain_point,
      metrics: feature.metrics,
    };
  });

  const staticOnlyFeatures = staticFeatures
    .filter((feature) => !consumedStatic.has(feature.slug ?? feature.name))
    .map((feature) => ({
      ...feature,
      source: 'static',
      truthMode: 'repo fallback',
    }));

  return [...sharedFeatures, ...staticOnlyFeatures].sort((left, right) => {
    const leftPriority = SHARED_PRIORITY_ORDER[left.priority ?? ''] ?? 9;
    const rightPriority = SHARED_PRIORITY_ORDER[right.priority ?? ''] ?? 9;
    return leftPriority - rightPriority || left.name.localeCompare(right.name);
  });
}

interface TaskQueueEntry {
  title: string;
  priority?: string;
  work_type?: string;
  phase?: string;
  note?: string;
}

interface TaskQueue {
  queue?: TaskQueueEntry[];
}

const IN_PROGRESS_PHASES = new Set([
  'research', 'prd', 'tasks', 'ux', 'integration',
  'implement', 'testing', 'review', 'merge', 'docs',
]);

function buildFrameworkPulse(
  authoritativeFeatures: StaticFeature[],
  featureRegistry: FeatureRegistry,
  taskQueue: TaskQueue,
): FrameworkPulse {
  const staticFeatures = flattenStaticFeatures();
  const sharedFeatures = featureRegistry.features ?? [];
  const staticMap = new Map(staticFeatures.map((f) => [normalizeName(f.name), f]));
  const sharedMap = new Map(sharedFeatures.map((f) => [normalizeName(f.name), f]));

  const missingInShared = staticFeatures.filter((f) => !sharedMap.has(normalizeName(f.name)));
  const missingInStatic = sharedFeatures.filter((f) => !staticMap.has(normalizeName(f.name)));
  const statusConflicts: Array<{ name: string; staticStatus: string; sharedStatus: string }> = [];

  for (const [key, staticFeature] of staticMap) {
    const sharedFeature = sharedMap.get(key);
    if (!sharedFeature) continue;

    const staticStatus =
      staticFeature.phase === 'done'
        ? 'shipped'
        : IN_PROGRESS_PHASES.has(staticFeature.phase ?? '')
          ? 'in_progress'
          : 'planned';
    const sharedStatus = sharedFeature.status ?? 'planned';
    if (staticStatus !== sharedStatus) {
      statusConflicts.push({ name: staticFeature.name, staticStatus, sharedStatus });
    }
  }

  const matchedCount = [...staticMap.keys()].filter((key) => sharedMap.has(key)).length;
  const totalChecks = matchedCount + missingInShared.length + missingInStatic.length;
  const totalConflicts = missingInShared.length + missingInStatic.length + statusConflicts.length;
  const sourceTruthScore = Math.max(
    0,
    Math.round(((totalChecks - totalConflicts) / Math.max(1, totalChecks)) * 100),
  );

  return {
    sourceTruthScore,
    authoritativeFeatureCount: authoritativeFeatures.length,
    sharedFeatureCount: sharedFeatures.length,
    queueCount: taskQueue.queue?.length ?? 0,
    queuePreview: (taskQueue.queue ?? []).slice(0, 4).map((item) => ({
      title: item.title,
      priority: item.priority ?? 'unscored',
      workType: item.work_type ?? 'unspecified',
      phase: item.phase ?? 'not_started',
    })),
    missingInSharedCount: missingInShared.length,
    missingInStaticCount: missingInStatic.length,
    statusConflictCount: statusConflicts.length,
    totalConflicts,
    missingInShared: missingInShared.slice(0, 5).map((f) => ({
      name: f.name,
      phase: f.phase ?? 'backlog',
      priority: f.priority ?? 'none',
    })),
    missingInStatic: missingInStatic.slice(0, 5).map((f) => ({
      name: f.name,
      status: f.status ?? 'planned',
      phase: f.phase ?? 'not_started',
    })),
    highlights: [
      `${sharedFeatures.length} shared-layer features tracked`,
      `${taskQueue.queue?.length ?? 0} queued tasks in priority queue`,
      `${missingInShared.length} repo-fallback items still missing from shared state`,
      `${missingInStatic.length} shared-layer items still missing from dashboard fallback data`,
      `${statusConflicts.length} status conflicts between repo fallback data and the shared feature registry`,
    ],
    conflicts: statusConflicts.slice(0, 4),
  };
}

function findCaseStudyDoc(caseId: string): string | null {
  // The full case-studies/ tree isn't in the snapshot. Returning null
  // signals "no doc match found" so the case-study feed falls back to
  // artifacts[] for the doc path.
  const caseStudiesDir = resolve(SNAPSHOT_DOCS_ROOT, 'docs/case-studies');
  if (!existsSync(caseStudiesDir)) return null;
  try {
    const files = readdirSync(caseStudiesDir);
    const slug = caseId.replace(/-\d{4}-\d{2}$/, '');
    return files.find((file) => file.includes(slug) && file.endsWith('.md')) ?? null;
  } catch {
    return null;
  }
}

interface CaseStudyMonitoring {
  cases: Array<{
    case_id: string;
    title: string;
    status: string;
    work_type: string;
    started_at: string;
    updated_at: string;
    framework_version: string;
    artifacts?: string[];
    snapshots: Array<{ label: string; timestamp: string; summary?: string; metrics: { tests_passing: unknown; build_verified: unknown } }>;
    process_metrics: Record<string, unknown>;
    quality_metrics: Record<string, unknown>;
    success_cases?: unknown[];
    failure_cases?: unknown[];
    next_checkpoints?: unknown[];
  }>;
}

interface CaseStudyNarrative {
  id: string;
  summary?: string;
  why_it_matters?: string;
  monitoring?: { source_truth_score?: number; alert_count?: number; routed_workspaces_added?: number; knowledge_groups_exposed?: number };
  skills_framework?: unknown[];
}

function buildCaseStudyFeed(caseStudyMonitoring: CaseStudyMonitoring): CaseStudyItem[] {
  const seeds = caseStudiesData as Record<string, CaseStudyNarrative | undefined>;
  const narrativeMap: Record<string, CaseStudyNarrative> = {};
  if (seeds.cleanupControlRoom) narrativeMap[seeds.cleanupControlRoom.id] = seeds.cleanupControlRoom;
  if (seeds.controlCenterAlignment) narrativeMap[seeds.controlCenterAlignment.id] = seeds.controlCenterAlignment;

  return caseStudyMonitoring.cases
    .map((caseItem) => {
      const narrative = narrativeMap[caseItem.case_id] ?? ({} as CaseStudyNarrative);
      const artifacts = Array.isArray(caseItem.artifacts) ? caseItem.artifacts : [];
      const artifactDoc = artifacts.find((item) => item.startsWith('docs/case-studies/')) ?? null;
      const fallbackDoc = artifactDoc ? null : findCaseStudyDoc(caseItem.case_id);
      const docPath = artifactDoc ?? (fallbackDoc ? `docs/case-studies/${fallbackDoc}` : null);
      const latestSnapshot = caseItem.snapshots[caseItem.snapshots.length - 1];

      const m = caseItem.process_metrics;
      const q = caseItem.quality_metrics;

      return {
        id: caseItem.case_id,
        slug: caseItem.case_id,
        title: caseItem.title,
        status: toTitleCase(caseItem.status),
        workType: caseItem.work_type,
        started: caseItem.started_at.slice(0, 10),
        updated: caseItem.updated_at.slice(0, 10),
        frameworkVersion: caseItem.framework_version,
        summary: narrative.summary ?? latestSnapshot?.summary ?? 'Tracked PM-flow case study.',
        whyItMatters: narrative.why_it_matters ?? null,
        sourceTruthScore: narrative.monitoring?.source_truth_score ?? null,
        alertCount: narrative.monitoring?.alert_count ?? null,
        routedWorkspacesAdded: narrative.monitoring?.routed_workspaces_added ?? null,
        knowledgeGroupsExposed: narrative.monitoring?.knowledge_groups_exposed ?? null,
        metrics: {
          linearIssuesClosed: m['linear_issues_closed'],
          linearIssuesCreated: m['linear_issues_created'],
          notionPagesCreated: m['notion_pages_created'],
          notionPagesUpdated: m['notion_pages_updated'],
          repoFilesAdded: m['repo_files_added'],
          repoFilesUpdated: m['repo_files_updated'],
          testsPassing: m['tests_passing'],
          buildVerified: m['build_verified'],
          criticalFindings: q['critical_findings'],
          highFindings: q['high_findings'],
          mediumFindings: q['medium_findings'],
        },
        timeline: caseItem.snapshots.map((snapshot) => ({
          label: snapshot.label,
          date: snapshot.timestamp.slice(0, 10),
          summary: snapshot.summary,
          testsPassing: snapshot.metrics.tests_passing,
          buildVerified: snapshot.metrics.build_verified,
        })),
        skillsFramework: narrative.skills_framework ?? [],
        successCases: caseItem.success_cases ?? [],
        failureCases: caseItem.failure_cases ?? [],
        nextCheckpoints: caseItem.next_checkpoints ?? [],
        artifacts,
        docPath,
        href: docPath ? `${GITHUB_BLOB_BASE}${docPath}` : null,
        truthMode: 'shared-layer',
      };
    })
    .sort((left, right) => right.started.localeCompare(left.started));
}

function buildCleanupCaseStudy(caseStudyFeed: CaseStudyItem[]): CaseStudyItem | undefined {
  return caseStudyFeed.find((caseStudy) => caseStudy.id === 'cleanup-control-room-2026-04');
}

function buildKnowledgeHub(externalSyncStatus: ExternalSyncStatus, caseStudyFeed: CaseStudyItem[]) {
  const docsRoot = resolve(SNAPSHOT_DOCS_ROOT, 'docs');
  const docFiles = walkFiles(docsRoot).filter((file) => ['.md', '.csv'].includes(extname(file)));
  const groupedRepoDocs = new Map<string, DocItem[]>();

  // Core README docs — only include the ones we have in snapshot.
  const rootDocCandidates: Array<[string, string, string]> = [
    ['README.md', 'Core', 'repo fallback'],
    ['CLAUDE.md', 'Core', 'repo fallback'],
    ['ai-engine/README.md', 'Core', 'repo fallback'],
    ['backend/README.md', 'Core', 'repo fallback'],
  ];
  const rootDocs = rootDocCandidates
    .map(([path, label, mode]) => buildMarkdownDoc(path, label, mode))
    .filter((doc): doc is DocItem => doc !== null);
  if (rootDocs.length > 0) groupedRepoDocs.set('root', rootDocs);

  for (const fullPath of docFiles) {
    const repoRelativePath = relative(SNAPSHOT_DOCS_ROOT, fullPath).replace(/\\/g, '/');
    const segments = repoRelativePath.split('/');
    const groupKey = segments[1] ?? 'archive'; // segments[0] is "docs"
    const groupId = DOC_GROUP_META[groupKey] ? groupKey : 'archive';
    const doc = buildMarkdownDoc(repoRelativePath, 'Repo Docs', DOC_GROUP_META[groupId].truthMode);
    if (!doc) continue;
    const docs = groupedRepoDocs.get(groupId) ?? [];
    docs.push(doc);
    groupedRepoDocs.set(groupId, docs);
  }

  const sharedDocs = walkFiles(SHARED_DIR)
    .filter((file) => extname(file) === '.json')
    .map(buildSharedDoc)
    .sort((a, b) => a.title.localeCompare(b.title));

  const trackedNotion = externalSyncStatus.sources.notion?.tracked_pages ?? [];
  const trackedLinearIssues = externalSyncStatus.sources.linear?.tracked_issues ?? [];
  const linearProject = externalSyncStatus.sources.linear?.project;
  const vercelProjects = externalSyncStatus.sources.vercel?.projects ?? {};

  const externalDocs: DocItem[] = [
    ...trackedNotion.map((page) => ({
      id: `notion-${page.title}`,
      title: page.title,
      preview: page.role,
      path: 'Notion',
      href: page.url,
      sourceLabel: 'Notion',
      truthMode: 'live',
    })),
    ...(linearProject
      ? [{
          id: 'linear-project',
          title: linearProject.name,
          preview: `Linear project · ${linearProject.status}`,
          path: 'Linear',
          href: linearProject.url,
          sourceLabel: 'Linear',
          truthMode: 'live',
        }]
      : []),
    ...trackedLinearIssues.map((issue) => ({
      id: issue.id,
      title: `${issue.id} — ${issue.title}`,
      preview: `${issue.status} · ${issue.priority} priority`,
      path: 'Linear',
      href: `https://linear.app/fitme-project/issue/${issue.id.toLowerCase()}/${normalizeName(issue.title)}`,
      sourceLabel: 'Linear',
      truthMode: 'live',
    })),
    ...Object.values(vercelProjects).map((project) => ({
      id: `vercel-${project.name}`,
      title: `${project.name} Vercel Project`,
      preview: `${project.framework} · ${project.live ? 'canonical' : 'cleanup debt'} project`,
      path: 'Vercel',
      href: project.url,
      sourceLabel: 'Vercel',
      truthMode: 'live',
    })),
  ];

  const featuredCandidates = [
    'README.md',
    'docs/product/PRD.md',
    'docs/product/backlog.md',
    'docs/master-plan/master-backlog-roadmap.md',
    'docs/skills/README.md',
    '.claude/shared/framework-manifest.json',
    '.claude/shared/external-sync-status.json',
  ];

  const repoAndSharedDocs = [...groupedRepoDocs.values()].flat().concat(sharedDocs);
  const featuredDocs = featuredCandidates
    .map((path) => repoAndSharedDocs.find((doc) => doc.path === path))
    .filter((doc): doc is DocItem => doc !== undefined);

  const groups: KnowledgeHubGroup[] = [
    ...Object.entries(DOC_GROUP_META)
      .filter(([groupId]) => groupedRepoDocs.has(groupId))
      .map(([groupId, meta]) => ({
        id: groupId,
        title: meta.title,
        description: meta.description,
        truthMode: meta.truthMode,
        docs: (groupedRepoDocs.get(groupId) ?? []).sort((a, b) => a.title.localeCompare(b.title)),
      })),
    {
      id: 'tracked-case-studies',
      title: 'Case Studies',
      description: 'Tracked operational and feature case studies built from shared PM monitoring and linked narrative docs.',
      truthMode: 'shared-layer',
      docs: caseStudyFeed.map((caseStudy) => ({
        id: caseStudy.id,
        title: caseStudy.title,
        preview: caseStudy.summary,
        path: caseStudy.docPath ?? caseStudy.id,
        href: caseStudy.href ?? '/case-studies',
        sourceLabel: 'Case Study',
        truthMode: 'shared-layer',
      })),
    },
    {
      id: 'shared-state',
      title: 'Shared State & Framework Data',
      description: 'Canonical JSON files that power the PM-flow framework, control room, and maintenance monitoring.',
      truthMode: 'shared-layer',
      docs: sharedDocs,
    },
    {
      id: 'external',
      title: 'Synced External Sources',
      description: 'Linked Notion, Linear, and Vercel references that the control room is already syncing against.',
      truthMode: 'live',
      docs: externalDocs,
    },
  ];

  return {
    summary: {
      repoDocs: [...groupedRepoDocs.values()].flat().length,
      sharedDocs: sharedDocs.length,
      externalDocs: externalDocs.length,
      groups: groups.length,
      caseStudies: caseStudyFeed.length,
    },
    featuredDocs,
    groups,
  };
}

function buildExternalSyncStatus(
  baseStatus: ExternalSyncStatus,
  githubIssues: GitHubIssue[],
): ExternalSyncStatus {
  // structuredClone is widely available in Node ≥17; clone so we don't
  // mutate the synced JSON under SHARED_DIR.
  const status = structuredClone(baseStatus);

  if (githubIssues.length > 0) {
    const openIssues = githubIssues.filter((issue) => issue.state === 'open');
    const closedIssues = githubIssues.filter((issue) => issue.state === 'closed');
    const issuesWithPhase = githubIssues.filter((issue) => issue.phase).length;
    const githubSource = status.sources.github;

    githubSource.repo_summary.live_issue_api_connected = true;
    githubSource.repo_summary.live_issue_count = githubIssues.length;
    githubSource.issue_summary = {
      total: githubIssues.length,
      open: openIssues.length,
      closed: closedIssues.length,
      with_phase_labels: issuesWithPhase,
    };
    githubSource.alerts = githubSource.repo_summary.working_tree_changes > 0 ? 1 : 0;
    githubSource.healthy = githubSource.repo_summary.working_tree_changes === 0;
    githubSource.findings = [
      'The canonical repo is on main and aligned with origin/main, which keeps repo truth stable.',
      githubSource.repo_summary.working_tree_changes > 0
        ? 'The working tree on main is intentionally dirty with active framework and dashboard cleanup changes, so local state still needs a deliberate commit or branch cut.'
        : 'The working tree is currently clean, so repo truth and deployment truth are easier to compare.',
      `GitHub issue hydration is live at build time: ${githubIssues.length} issues were fetched, ${openIssues.length} remain open, and ${issuesWithPhase} carry phase labels.`,
    ];
    status.aggregate.alerts = Object.values(status.sources).reduce(
      (sum: number, source) => sum + ((source as { alerts?: number }).alerts ?? 0),
      0,
    );
    status.aggregate.source_truth_score = Math.min(100, status.aggregate.source_truth_score + 4);
  }

  return status;
}

function buildResearchWorkspaces(
  taskQueue: TaskQueue,
  featureRegistry: FeatureRegistry,
  externalSyncStatus: ExternalSyncStatus,
): DashboardData['researchWorkspaces'] {
  const queue = taskQueue.queue ?? [];
  const trackedIssues = externalSyncStatus.sources.linear?.tracked_issues ?? [];
  const researchQueue = queue.filter((item) => item.phase === 'research');
  const verificationQueue = queue.filter(
    (item) => item.phase === 'verification' || item.priority === 'critical',
  );

  return {
    claudeResearch: {
      id: 'claude-research',
      title: 'Claude Research Console',
      badge: 'Workflow Surface',
      summary: 'Drive PM-flow research, backlog synthesis, UX framing, and spec preparation from one research-first workspace.',
      promptStarters: [
        'Summarize the current research chapter and identify the missing decisions before PRD approval.',
        'Compare repo truth, Notion context, and Linear scope for the active feature.',
        'Extract the key risks, success metrics, and open questions from the latest PRD and roadmap docs.',
      ],
      workItems: researchQueue.map((item) => ({
        title: item.title,
        detail: `${toTitleCase(item.priority ?? 'unscored')} priority · ${toTitleCase(item.work_type ?? 'unspecified')} · ${item.note ?? ''}`,
      })),
      linkedItems: trackedIssues
        .filter((issue) => ['FIT-23', 'FIT-24', 'FIT-25', 'FIT-17'].includes(issue.id))
        .map((issue) => ({
          title: `${issue.id} — ${issue.title}`,
          detail: `${issue.status} · ${issue.priority} priority`,
        })),
      requiredDocs: [
        buildMarkdownDoc('docs/skills/pm-workflow.md', 'PM Hub', 'repo fallback'),
        buildMarkdownDoc('docs/product/backlog.md', 'Backlog', 'repo fallback'),
        buildMarkdownDoc('docs/master-plan/master-backlog-roadmap.md', 'Master Plan', 'repo fallback'),
      ].filter((doc): doc is DocItem => doc !== null),
      truthMode: 'shared-layer',
    },
    codexResearch: {
      id: 'codex-research',
      title: 'Codex Research Console',
      badge: 'Implementation Surface',
      summary: 'Focus implementation-oriented follow-ups, verification targets, and architecture cleanup without losing the PM-flow context.',
      promptStarters: [
        'Review the highest-risk implementation gap and produce the shortest safe verification path.',
        'Compare current shared-layer priorities with repo code reality and propose the next execution checkpoint.',
        'Map runtime or dependency risk to the exact code paths and verification artifacts that would close it.',
      ],
      workItems: verificationQueue.map((item) => ({
        title: item.title,
        detail: `${toTitleCase(item.priority ?? 'unscored')} priority · ${toTitleCase(item.phase ?? 'not_started')} phase · ${item.note ?? ''}`,
      })),
      linkedItems: [
        ...trackedIssues
          .filter((issue) => ['FIT-6', 'FIT-21', 'FIT-22'].includes(issue.id))
          .map((issue) => ({
            title: `${issue.id} — ${issue.title}`,
            detail: `${issue.status} · ${issue.priority} priority`,
          })),
        ...((externalSyncStatus.sources.vercel?.findings ?? []).slice(0, 2).map((item: string) => ({
          title: item,
          detail: 'Vercel / observability finding',
        }))),
      ],
      requiredDocs: [
        buildMarkdownDoc('docs/setup/auth-runtime-verification-playbook.md', 'Setup', 'repo fallback'),
        buildMarkdownDoc('docs/product/prd/18.6-authentication.md', 'PRD', 'repo fallback'),
        buildMarkdownDoc('README.md', 'Core', 'repo fallback'),
      ].filter((doc): doc is DocItem => doc !== null),
      truthMode: 'shared-layer',
    },
    figmaHandoff: {
      id: 'figma-handoff',
      title: 'Figma Handoff Lab',
      badge: 'Design Workflow',
      summary: 'Stage design review, screen handoff, and Figma follow-up work with truthful linked references instead of a fake embedded editor.',
      promptStarters: [
        'Prepare a handoff checklist for the next screen refresh, including screenshots, docs, and required design-system checks.',
        'Summarize the design debt that should move into Figma after code verification is complete.',
        'List the repo docs and nodes that should be reviewed before a Figma sync run.',
      ],
      workItems: [
        {
          title: 'Primary design file',
          detail: `FitMe Design System Library · ${README_FIGMA_URL}`,
          href: README_FIGMA_URL,
        },
        {
          title: 'Comprehensive revision plan',
          detail: 'Cross-surface code + Figma revision backlog for auth, home, nutrition, stats, and training.',
          href: `${GITHUB_BLOB_BASE}docs/design-system/comprehensive-revision-plan.md`,
        },
        {
          title: 'Design revision spec',
          detail: 'Repo-native visual revision spec tied to the live Figma file.',
          href: `${GITHUB_BLOB_BASE}docs/design-system/design-revision-spec.md`,
        },
      ],
      linkedItems: [
        {
          title: 'Connection status',
          detail: 'Figma handoff is represented as a workflow surface. Live embedded editing is intentionally not part of this pass.',
        },
        {
          title: 'Current readiness',
          detail: 'The design file and handoff docs are connected. Executable Figma sync remains the next evolution step.',
        },
      ],
      requiredDocs: [
        buildMarkdownDoc('docs/skills/design.md', 'Skill', 'repo fallback'),
        buildMarkdownDoc('docs/design-system/ux-foundations.md', 'UX', 'repo fallback'),
        buildMarkdownDoc('docs/master-plan/master-backlog-roadmap.md', 'Master Plan', 'repo fallback'),
      ].filter((doc): doc is DocItem => doc !== null),
      truthMode: 'repo fallback',
    },
  };
}

interface DocumentationDebt {
  summary: { case_studies_scanned: number; open_debt_items: number };
}

function buildDashboardSources(
  reconcileResult: ReconcileResult,
  externalSyncStatus: ExternalSyncStatus,
  frameworkPulse: FrameworkPulse,
  githubIssues: GitHubIssue[],
  documentationDebt: DocumentationDebt,
): Record<string, DashboardSourceEntry> {
  const { sources } = reconcileResult;

  return {
    github: githubIssues.length > 0
      ? {
          count: sources.github.count,
          healthy: sources.github.healthy,
          alerts: sources.github.alerts,
          mode: 'live',
        }
      : {
          count: externalSyncStatus.sources.github.repo_summary.local_branches,
          healthy: externalSyncStatus.sources.github.healthy,
          alerts: externalSyncStatus.sources.github.alerts,
          mode: 'repo fallback',
        },
    static: {
      count: sources.static.count,
      healthy: sources.static.healthy,
      alerts: sources.static.alerts,
      mode: 'repo fallback',
    },
    state: {
      count: sources.state.count,
      healthy: sources.state.healthy,
      alerts: sources.state.alerts,
      mode: 'repo fallback',
    },
    shared: {
      count: frameworkPulse.sharedFeatureCount,
      healthy: frameworkPulse.totalConflicts === 0,
      alerts: frameworkPulse.totalConflicts,
      mode: 'shared-layer',
    },
    linear: {
      count: externalSyncStatus.sources.linear?.issue_summary?.total ?? 0,
      healthy: externalSyncStatus.sources.linear?.healthy ?? true,
      alerts: externalSyncStatus.sources.linear?.alerts ?? 0,
      mode: 'live',
    },
    notion: {
      count: externalSyncStatus.sources.notion?.page_summary?.tracked_pages ?? 0,
      healthy: externalSyncStatus.sources.notion?.healthy ?? true,
      alerts: externalSyncStatus.sources.notion?.alerts ?? 0,
      mode: 'live',
    },
    analytics: {
      count: externalSyncStatus.sources.analytics?.instrumentation_summary?.total_metrics ?? 0,
      healthy: externalSyncStatus.sources.analytics?.healthy ?? true,
      alerts: externalSyncStatus.sources.analytics?.alerts ?? 0,
      mode: 'live',
    },
    vercel: {
      count: externalSyncStatus.sources.vercel?.deployment_summary?.recent_deployments_reviewed ?? 0,
      healthy: externalSyncStatus.sources.vercel?.healthy ?? true,
      alerts: externalSyncStatus.sources.vercel?.alerts ?? 0,
      mode: 'live',
    },
    docs: {
      count: documentationDebt.summary.case_studies_scanned,
      healthy: documentationDebt.summary.open_debt_items === 0,
      alerts: documentationDebt.summary.open_debt_items,
      mode: 'shared-layer',
    },
    archive: {
      count: 1,
      healthy: true,
      alerts: 0,
      mode: 'archive',
    },
  };
}

// ─────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────

export interface BuildDashboardDataOptions {
  /** Optional GitHub PAT — if provided, fetches live Issues at build time. */
  token?: string;
}

/**
 * Build the full dashboard data shape from synced snapshots + (optional)
 * live GitHub Issues. Called at build time by Server Components.
 */
export async function buildDashboardData(
  { token }: BuildDashboardDataOptions = {},
): Promise<DashboardData> {
  const frameworkManifest = readSharedJson('framework-manifest.json');
  const baseExternalSyncStatus = readSharedJson('external-sync-status.json') as ExternalSyncStatus;
  const caseStudyMonitoring = readSharedJson('case-study-monitoring.json') as CaseStudyMonitoring;
  const documentationDebt = readSharedJson('documentation-debt.json') as DocumentationDebt;
  const featureRegistry = readSharedJson('feature-registry.json') as FeatureRegistry;
  const taskQueue = readSharedJson('task-queue.json') as TaskQueue;

  const authoritativeFeatures = buildFeatureDataset(featureRegistry);
  const caseStudyFeed = buildCaseStudyFeed(caseStudyMonitoring);
  const cleanupCaseStudy = buildCleanupCaseStudy(caseStudyFeed);

  let githubIssues: GitHubIssue[] = [];
  try {
    if (token) githubIssues = await fetchIssues(token);
  } catch (error) {
    console.warn('GitHub API unavailable:', (error as Error).message);
  }

  const externalSyncStatus = buildExternalSyncStatus(baseExternalSyncStatus, githubIssues);
  const knowledgeHub = buildKnowledgeHub(externalSyncStatus, caseStudyFeed);
  const frameworkPulse = buildFrameworkPulse(authoritativeFeatures, featureRegistry, taskQueue);
  const researchWorkspaces = buildResearchWorkspaces(taskQueue, featureRegistry, externalSyncStatus);

  let stateFiles: StateFile[] = [];
  try {
    stateFiles = parseStateFiles();
  } catch {
    stateFiles = [];
  }

  const reconcileResult = reconcile({
    githubIssues,
    staticFeatures: authoritativeFeatures,
    stateFiles,
  });

  return {
    features: authoritativeFeatures,
    alerts: reconcileResult.alerts,
    sources: buildDashboardSources(
      reconcileResult,
      externalSyncStatus,
      frameworkPulse,
      githubIssues,
      documentationDebt,
    ),
    frameworkManifest,
    frameworkPulse,
    documentationDebt,
    externalSyncStatus,
    cleanupCaseStudy,
    knowledgeHub,
    caseStudyFeed,
    researchWorkspaces,
    workspaceMeta: {
      primaryViews: PRIMARY_VIEWS,
      secondaryWorkspaces: SECONDARY_WORKSPACES,
    },
  };
}

// statSync is imported but unused in this file currently — referenced for
// future sync-status checks (kept to mirror the FT2 source for diff parity).
void statSync;
