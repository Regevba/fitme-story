/**
 * Presenter — merge live source probes over the synced `external-sync-status`
 * snapshot into render-ready rows for the overview Source-Health panel.
 *
 * Rule: a non-degraded live probe wins (mode 'live'); otherwise the row is
 * built from the snapshot slice (mode 'snapshot'). This keeps the panel useful
 * with zero tokens (it shows the last synced truth) and upgrades each row to
 * live independently as tokens are added.
 *
 * Pure + isomorphic-safe (no fs / no env) so it is unit-testable in isolation.
 */

import type { LiveSources } from './gather';

export interface SourceHealthRow {
  key: 'github' | 'vercel' | 'linear' | 'notion' | 'supabase' | 'ga4';
  label: string;
  mode: 'live' | 'snapshot';
  healthy: boolean;
  headline: string;
  detail: string;
  fetchedAt: string | null;
}

/** Loose shape of the synced external-sync-status.json (only fields we read). */
export interface SnapshotShape {
  updated?: string;
  sources?: {
    github?: { repo_summary?: { current_branch?: string; working_tree_changes?: number; open_prs_ft2?: number }; issue_summary?: { total?: number } };
    linear?: { issue_summary?: { total?: number; done?: number; in_progress?: number; todo?: number; backlog?: number } };
    notion?: { page_summary?: { tracked_pages?: number; roadmap_last_updated?: string } };
    vercel?: { live_probe_2026_06_15?: { latest_production_state?: string } };
    analytics?: { runtime_health?: { ga4_active_users_last_probe?: { as_of?: string } } };
  };
}

const num = (n: number | undefined, fallback = '—'): string =>
  typeof n === 'number' ? String(n) : fallback;

export function buildSourceHealthRows(
  snapshot: SnapshotShape,
  live: LiveSources,
): SourceHealthRow[] {
  const s = snapshot.sources ?? {};
  const rows: SourceHealthRow[] = [];

  // GitHub
  if (!live.github.degraded && live.github.data) {
    const d = live.github.data;
    rows.push({
      key: 'github', label: 'GitHub', mode: 'live', healthy: live.github.healthy,
      headline: `${d.open_issues} open / ${d.total_issues} issues · ${d.open_prs} open PRs`,
      detail: `${d.with_phase_labels} carry phase labels`,
      fetchedAt: live.github.fetchedAt,
    });
  } else {
    const g = s.github;
    rows.push({
      key: 'github', label: 'GitHub', mode: 'snapshot', healthy: true,
      headline: `${num(g?.repo_summary?.open_prs_ft2)} open PRs · ${num(g?.issue_summary?.total)} issues`,
      detail: `branch ${g?.repo_summary?.current_branch ?? '—'} · ${num(g?.repo_summary?.working_tree_changes, '0')} tree changes`,
      fetchedAt: null,
    });
  }

  // Vercel
  if (!live.vercel.degraded && live.vercel.data) {
    const d = live.vercel.data;
    rows.push({
      key: 'vercel', label: 'Vercel', mode: 'live', healthy: live.vercel.healthy,
      headline: `latest deploy ${d.latest_state}${d.latest_target ? ` (${d.latest_target})` : ''}`,
      detail: d.latest_commit ?? d.latest_url ?? 'fitme-story',
      fetchedAt: live.vercel.fetchedAt,
    });
  } else {
    rows.push({
      key: 'vercel', label: 'Vercel', mode: 'snapshot', healthy: true,
      headline: `latest deploy ${s.vercel?.live_probe_2026_06_15?.latest_production_state ?? '—'}`,
      detail: 'fitme-story (snapshot)', fetchedAt: null,
    });
  }

  // Linear
  if (!live.linear.degraded && live.linear.data) {
    const d = live.linear.data;
    rows.push({
      key: 'linear', label: 'Linear', mode: 'live', healthy: live.linear.healthy,
      headline: `${d.total} issues · ${d.done} done · ${d.in_progress} in progress`,
      detail: `${d.todo} todo · ${d.backlog} backlog`, fetchedAt: live.linear.fetchedAt,
    });
  } else {
    const l = s.linear?.issue_summary;
    rows.push({
      key: 'linear', label: 'Linear', mode: 'snapshot', healthy: true,
      headline: `${num(l?.total)} issues · ${num(l?.done)} done · ${num(l?.in_progress)} in progress`,
      detail: `${num(l?.todo)} todo · ${num(l?.backlog)} backlog`, fetchedAt: null,
    });
  }

  // Notion
  if (!live.notion.degraded && live.notion.data) {
    const d = live.notion.data;
    rows.push({
      key: 'notion', label: 'Notion', mode: 'live', healthy: live.notion.healthy,
      headline: `${d.tracked_pages} tracked pages`,
      detail: d.most_recent_edit ? `last edit ${d.most_recent_edit.slice(0, 10)}` : 'no edits',
      fetchedAt: live.notion.fetchedAt,
    });
  } else {
    const n = s.notion?.page_summary;
    rows.push({
      key: 'notion', label: 'Notion', mode: 'snapshot', healthy: true,
      headline: `${num(n?.tracked_pages)} tracked pages`,
      detail: n?.roadmap_last_updated ? `roadmap ${n.roadmap_last_updated.slice(0, 10)}` : 'snapshot',
      fetchedAt: null,
    });
  }

  // Supabase
  if (!live.supabase.degraded && live.supabase.data) {
    rows.push({
      key: 'supabase', label: 'Supabase', mode: 'live', healthy: live.supabase.healthy,
      headline: 'reachable', detail: live.supabase.data.health ?? 'auth health OK',
      fetchedAt: live.supabase.fetchedAt,
    });
  } else {
    rows.push({
      key: 'supabase', label: 'Supabase', mode: 'snapshot', healthy: true,
      headline: 'configured', detail: 'snapshot (no live probe)', fetchedAt: null,
    });
  }

  // GA4
  if (!live.ga4.degraded && live.ga4.data) {
    const d = live.ga4.data;
    rows.push({
      key: 'ga4', label: 'GA4', mode: 'live', healthy: live.ga4.healthy,
      headline: `${d.total_7d} active users (7d)`,
      detail: d.generated_at ? `as of ${d.generated_at.slice(0, 10)}` : 'live',
      fetchedAt: live.ga4.fetchedAt,
    });
  } else {
    rows.push({
      key: 'ga4', label: 'GA4', mode: 'snapshot', healthy: true,
      headline: 'analytics flowing',
      detail: s.analytics?.runtime_health?.ga4_active_users_last_probe?.as_of
        ? `probe ${s.analytics.runtime_health.ga4_active_users_last_probe.as_of}`
        : 'snapshot', fetchedAt: null,
    });
  }

  return rows;
}
