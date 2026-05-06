/**
 * /control-room/knowledge — Knowledge Hub (UCC T23 port).
 *
 * Source: dashboard/src/components/KnowledgeHub.jsx (119 lines). Three Panels:
 *   1. Knowledge summary (4 MetricLists + featured-docs grid)
 *   2. Case Studies (cards w/ status + framework_version + signal/flow MetricLists)
 *   3. Document Index (DocumentGroupCard list)
 *
 * Data sources:
 *   - Case studies: src/data/control-room-seeds/caseStudies.json (real seed,
 *     keyed by name; mapped to KnowledgeHub.jsx caseStudyFeed shape).
 *   - Summary counts: derived at module-load from real seed file inventories
 *     (features/*.json, shared/*.json, caseStudies entries).
 *
 * NOT YET WIRED (deferred):
 *   - knowledgeHub.featuredDocs — no upstream seed exists yet (dashboard
 *     computes this from knowledge-feed.json which fitme-story doesn't sync).
 *   - knowledgeHub.groups (Document Index) — same. Empty state shown for now.
 *   - external_doc_count is a static placeholder (no externalSyncStatus wire).
 *
 * Reuses primitives from T19: Panel, MetricList, DocumentCard, DocumentGroupCard.
 */

import type { Metadata } from 'next';
import {
  Panel,
  MetricList,
  DocumentGroupCard,
  type DocumentGroup,
  type ControlRoomDocument,
} from '@/components/control-room/primitives';
import caseStudiesData from '@/data/control-room-seeds/caseStudies.json';
import featuresData from '@/data/control-room-seeds/features.json';
import { TrackPageView } from '@/components/control-room/TrackPageView';
import { TrackedDocLink } from '@/components/control-room/TrackedDocLink';

export const metadata: Metadata = {
  title: 'Knowledge — Control room',
  robots: { index: false, follow: false },
};

// ────────────────────────────────────────────────────────────────────────────
// Case study mapping (seed shape → KnowledgeHub.jsx caseStudyFeed shape)
// ────────────────────────────────────────────────────────────────────────────

interface SeedCaseStudy {
  id: string;
  title: string;
  status: string;
  framework_version: string;
  summary: string;
  monitoring?: {
    delivery_metrics?: {
      linear_issues_closed?: number;
      notion_pages_updated?: number;
      dashboard_tests_passing?: number;
      dashboard_build_verified?: boolean;
    };
    timeline?: Array<{
      label: string;
      date: string;
      summary: string;
      tests_passing?: number;
      build_verified?: boolean;
    }>;
  };
}

interface CaseStudyCardData {
  id: string;
  title: string;
  status: string;
  frameworkVersion: string;
  summary: string;
  href: string | null;
  metrics: {
    testsPassing: number;
    buildVerified: boolean;
    linearIssuesClosed: number;
    notionPagesUpdated: number;
  };
}

function toCardData(seed: SeedCaseStudy): CaseStudyCardData {
  const dm = seed.monitoring?.delivery_metrics ?? {};
  const lastTimeline = seed.monitoring?.timeline?.slice(-1)[0];
  return {
    id: seed.id,
    title: seed.title,
    status: seed.status,
    frameworkVersion: seed.framework_version,
    summary: seed.summary,
    href: null,
    metrics: {
      testsPassing: dm.dashboard_tests_passing ?? lastTimeline?.tests_passing ?? 0,
      buildVerified: dm.dashboard_build_verified ?? lastTimeline?.build_verified ?? false,
      linearIssuesClosed: dm.linear_issues_closed ?? 0,
      notionPagesUpdated: dm.notion_pages_updated ?? 0,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Summary counts (derived from real seed inventories)
// ────────────────────────────────────────────────────────────────────────────

interface FeaturesSeedFile {
  shipped: unknown[];
  planned: unknown[];
  backlog: unknown[];
}

const features = featuresData as unknown as FeaturesSeedFile;
const cases = caseStudiesData as unknown as Record<string, SeedCaseStudy>;
const caseStudyFeed: CaseStudyCardData[] = Object.values(cases).map(toCardData);

const summary = {
  repoDocs:
    (features.shipped?.length ?? 0) +
    (features.planned?.length ?? 0) +
    (features.backlog?.length ?? 0),
  sharedDocs: 35, // matches sync-from-fittracker2 prebuild log "35 shared"
  externalDocs: 0, // TODO(T24+): wire from external-sync-status.json
  groups: 0, // TODO(T24+): wire from knowledge-feed.json equivalent
  caseStudies: caseStudyFeed.length,
};

// Featured docs + document groups deferred (no upstream seed yet)
const featuredDocs: ControlRoomDocument[] = [];
const groups: DocumentGroup[] = [];

// ────────────────────────────────────────────────────────────────────────────
// CaseStudyCard (KnowledgeHub.jsx lines 65-101)
// ────────────────────────────────────────────────────────────────────────────

function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudyCardData }) {
  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold text-slate-950 dark:text-white">
          {caseStudy.title}
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-white/72">
          {caseStudy.status}
        </span>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-400/15 dark:text-sky-100">
          v{caseStudy.frameworkVersion}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/62">
        {caseStudy.summary}
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <MetricList
          title="Signal"
          items={[
            { label: 'Tests', value: caseStudy.metrics.testsPassing },
            { label: 'Build', value: caseStudy.metrics.buildVerified ? 'Verified' : 'Pending' },
          ]}
          dark
        />
        <MetricList
          title="Flow"
          items={[
            { label: 'Linear closed', value: caseStudy.metrics.linearIssuesClosed },
            { label: 'Notion updates', value: caseStudy.metrics.notionPagesUpdated },
          ]}
          dark
        />
      </div>
    </>
  );

  const baseClass =
    'rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-900/5 transition-colors hover:border-slate-300 dark:border-white/8 dark:bg-white/[0.03] dark:shadow-none dark:hover:border-white/15';

  if (caseStudy.href) {
    return (
      <TrackedDocLink
        key={caseStudy.id}
        href={caseStudy.href}
        docPath={caseStudy.id}
        docGroup="case-studies"
        className={baseClass}
      >
        {inner}
      </TrackedDocLink>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function ControlRoomKnowledgePage() {
  return (
    <article className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      {/* GA4: dashboard_load + dashboard_sync_warning_shown (UCC T36) */}
      <TrackPageView route="knowledge" />

      <div className="space-y-6">
        {/* ───── Knowledge summary ───── */}
        <Panel
          eyebrow="Knowledge"
          title="Read the current system from one canonical surface"
          description="This tab brings together repo docs, PM framework files, synced external references, and tracked case studies so the control center stays grounded in the actual source material."
        >
          <div className="grid gap-3 md:grid-cols-4">
            <MetricList
              title="Repo docs"
              items={[
                { label: 'Tracked features', value: summary.repoDocs },
                { label: 'Groups', value: summary.groups },
              ]}
              dark
            />
            <MetricList
              title="Shared layer"
              items={[
                { label: 'Framework files', value: summary.sharedDocs },
                { label: 'Authority', value: 'Shared' },
              ]}
              dark
            />
            <MetricList
              title="External refs"
              items={[
                { label: 'Synced references', value: summary.externalDocs },
                { label: 'State', value: 'Live' },
              ]}
              dark
            />
            <MetricList
              title="Case studies"
              items={[
                { label: 'Tracked cases', value: summary.caseStudies },
                { label: 'Access', value: 'Knowledge + page' },
              ]}
              dark
            />
          </div>

          <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-white/8 dark:bg-white/[0.03]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-white/38">
              Featured references
            </div>
            <div className="mt-3">
              {featuredDocs.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-white/55">
                  No featured references yet — wiring deferred to a follow-up PR.
                </p>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {/* DocumentCard map intentionally elided — featuredDocs is empty for now */}
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* ───── Case Studies ───── */}
        <Panel
          eyebrow="Case Studies"
          title="Tracked operational narratives"
          description="Case studies now live as a first-class knowledge source inside the dashboard and as a dedicated page for focused reading."
        >
          {caseStudyFeed.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-white/55">No case studies tracked yet.</p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {caseStudyFeed.map((cs) => (
                <CaseStudyCard key={cs.id} caseStudy={cs} />
              ))}
            </div>
          )}
        </Panel>

        {/* ───── Document Index ───── */}
        <Panel
          eyebrow="Document Index"
          title="Browse by source and category"
          description="Each group is labeled by truth mode so archive material stays available without being mistaken for the current operating picture."
        >
          {groups.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-white/55">
              Document index seed not yet wired — deferred to a follow-up PR.
            </p>
          ) : (
            <div className="grid gap-4">
              {groups.map((group) => (
                <DocumentGroupCard key={group.title} group={group} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <p className="mt-10 font-sans text-xs text-[var(--color-neutral-400)]">
        UCC migration in progress (T23 shipped {new Date().toISOString().slice(0, 10)}). Source:
        dashboard/src/components/KnowledgeHub.jsx. Featured references + Document Index seed
        wiring deferred &mdash; fitme-story doesn&rsquo;t yet sync the dashboard&rsquo;s knowledge-feed equivalent.
      </p>
    </article>
  );
}
