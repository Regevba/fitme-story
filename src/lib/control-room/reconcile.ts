/**
 * Cross-source reconciliation engine — UCC T31 port from
 * dashboard/src/scripts/reconcile.js (FitTracker2 Astro source).
 *
 * Compares features across all data sources (GitHub Issues, static repo data,
 * and state.json files) and generates typed alerts for the dashboard.
 *
 * SERVER-ONLY: This module runs at build time only. Never import from
 * client-side React components.
 */

import type { GitHubIssue } from './github';
import type { StateFile } from './types';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export type AlertSeverity = 'red' | 'amber' | 'blue' | 'info';
export type AlertType = 'missing' | 'conflict' | 'duplicate' | 'stale_task' | 'skill_overload';

export interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  feature: string;
  source: 'github' | 'static' | 'state' | 'both';
}

export interface SourceStatus {
  count: number;
  healthy: boolean;
  alerts: number;
}

export interface ReconcileResult {
  alerts: Alert[];
  sources: {
    github: SourceStatus;
    static: SourceStatus;
    state: SourceStatus;
  };
}

/** Minimal static-feature shape consumed by reconcile. */
export interface StaticFeature {
  name: string;
  phase?: string;
  [key: string]: unknown;
}

export interface ReconcileInput {
  githubIssues?: GitHubIssue[];
  staticFeatures?: StaticFeature[];
  stateFiles?: StateFile[];
}

// ─────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array<number>(n).fill(0)]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ─────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────

export function reconcile({
  githubIssues = [],
  staticFeatures = [],
  stateFiles = [],
}: ReconcileInput): ReconcileResult {
  const alerts: Alert[] = [];
  const sources: ReconcileResult['sources'] = {
    github: { count: githubIssues.length, healthy: true, alerts: 0 },
    static: { count: staticFeatures.length, healthy: true, alerts: 0 },
    state: { count: stateFiles.length, healthy: true, alerts: 0 },
  };

  const ghNames = new Set(githubIssues.map((i) => normalize(i.title)));
  const staticNames = new Set(staticFeatures.map((f) => normalize(f.name)));

  // Only check GitHub ↔ repo alignment when GitHub issues are available (GITHUB_TOKEN at build time)
  if (githubIssues.length > 0) {
    // Features in static data but not in GitHub
    for (const feature of staticFeatures) {
      const norm = normalize(feature.name);
      if (!ghNames.has(norm)) {
        alerts.push({
          type: 'missing',
          severity: 'amber',
          message: `"${feature.name}" exists in repo data but has no GitHub Issue`,
          feature: feature.name,
          source: 'github',
        });
        sources.github.alerts++;
      }
    }

    // Features in GitHub but not in static data
    for (const issue of githubIssues) {
      const norm = normalize(issue.title);
      if (!staticNames.has(norm)) {
        alerts.push({
          type: 'missing',
          severity: 'info',
          message: `GitHub Issue #${issue.number} "${issue.title}" not found in repo data files`,
          feature: issue.title,
          source: 'static',
        });
        sources.static.alerts++;
      }
    }

    // State files without GitHub Issues
    for (const state of stateFiles) {
      const norm = normalize(state.feature ?? '');
      if (!ghNames.has(norm)) {
        alerts.push({
          type: 'missing',
          severity: 'amber',
          message: `PM workflow "${state.feature}" (phase: ${state.current_phase}) has no GitHub Issue`,
          feature: state.feature ?? '',
          source: 'github',
        });
        sources.github.alerts++;
      }
    }
  }

  // Phase/status conflicts between GitHub and state files
  for (const state of stateFiles) {
    const matchingIssue = githubIssues.find((i) => normalize(i.title) === normalize(state.feature ?? ''));
    if (matchingIssue && matchingIssue.phase) {
      const ghPhase = matchingIssue.phase;
      const stPhase = state.current_phase;
      if (ghPhase !== stPhase) {
        alerts.push({
          type: 'conflict',
          severity: 'red',
          message: `"${state.feature}": GitHub says "${ghPhase}" but state.json says "${stPhase}"`,
          feature: state.feature ?? '',
          source: 'both',
        });
      }
    }
  }

  // Duplicate detection (fuzzy match)
  const allNames = [...new Set([...staticFeatures.map((f) => f.name), ...githubIssues.map((i) => i.title)])];
  for (let i = 0; i < allNames.length; i++) {
    for (let j = i + 1; j < allNames.length; j++) {
      const na = normalize(allNames[i]);
      const nb = normalize(allNames[j]);
      if (na !== nb && levenshtein(na, nb) <= 3 && na.length > 5) {
        alerts.push({
          type: 'duplicate',
          severity: 'blue',
          message: `Possible duplicate: "${allNames[i]}" and "${allNames[j]}"`,
          feature: allNames[i],
          source: 'both',
        });
      }
    }
  }

  // Status conflicts (static says done but GitHub issue is open)
  for (const feature of staticFeatures.filter((f) => f.phase === 'done')) {
    const matchingIssue = githubIssues.find((i) => normalize(i.title) === normalize(feature.name));
    if (matchingIssue && matchingIssue.state === 'open') {
      alerts.push({
        type: 'conflict',
        severity: 'red',
        message: `"${feature.name}" is marked Done in repo but GitHub Issue #${matchingIssue.number} is still open`,
        feature: feature.name,
        source: 'both',
      });
    }
  }

  // Task-level alerts (for v2 state files with tasks[] arrays)
  for (const state of stateFiles) {
    const tasks = state.tasks;
    if (!tasks || !Array.isArray(tasks)) continue;

    // Stale task: in_progress longer than 2x effort estimate
    for (const task of tasks) {
      const t = task as Record<string, unknown>;
      if (t['status'] === 'in_progress' && t['started_at'] && t['effort_days']) {
        const started = new Date(t['started_at'] as string);
        const now = new Date();
        const daysSinceStart = (now.getTime() - started.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceStart > (t['effort_days'] as number) * 2) {
          alerts.push({
            type: 'stale_task',
            severity: 'amber',
            message: `"${state.feature}" task ${t['id']} "${t['title']}" has been in progress for ${Math.round(daysSinceStart)}d (estimate: ${t['effort_days']}d)`,
            feature: state.feature ?? '',
            source: 'state',
          });
          sources.state.alerts++;
        }
      }
    }

    // Skill overload: more than 5 tasks assigned to a single skill
    const skillCounts: Record<string, number> = {};
    for (const task of tasks.filter((t) => {
      const tt = t as Record<string, unknown>;
      return tt['status'] === 'in_progress' || tt['status'] === 'ready';
    })) {
      const tt = task as Record<string, unknown>;
      const skill = (tt['skill'] as string | undefined) ?? (tt['assigned_skill'] as string | undefined) ?? 'dev';
      skillCounts[skill] = (skillCounts[skill] ?? 0) + 1;
    }
    for (const [skill, count] of Object.entries(skillCounts)) {
      if (count > 5) {
        alerts.push({
          type: 'skill_overload',
          severity: 'amber',
          message: `"${state.feature}": skill /${skill} has ${count} active tasks (consider redistributing)`,
          feature: state.feature ?? '',
          source: 'state',
        });
        sources.state.alerts++;
      }
    }
  }

  sources.github.healthy = sources.github.alerts === 0;
  sources.static.healthy = sources.static.alerts === 0;
  sources.state.healthy = sources.state.alerts === 0;

  return { alerts, sources };
}
