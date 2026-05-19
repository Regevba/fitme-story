/**
 * GitHub Issues fetcher for the control-room dashboard.
 *
 * SERVER-ONLY: This module must only run at build time (Next.js Server
 * Components, route handlers, or build scripts). Never import from
 * client-side React components — the GitHub token must never reach the
 * browser bundle.
 *
 * Ported from FitTracker2/dashboard/src/scripts/github.js (T32 of UCC
 * migration plan). TypeScript types added for the issue shape so
 * downstream consumers (builder.ts, reconcile.ts) can stay type-safe.
 */

if (typeof window !== 'undefined') {
  throw new Error('github.ts must not be imported in client-side code');
}

const OWNER = 'Regevba';
const REPO = 'FitTracker2';
const API_BASE = 'https://api.github.com';

/** Subset of fields we care about from the GitHub Issues API response. */
export interface GitHubIssueRaw {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: Array<{ name: string; color: string }>;
  milestone: { title: string } | null;
  assignee: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: unknown; // present on PRs; we filter these out
}

/** Normalized issue shape consumed by reconcile.ts + builder.ts. */
export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: Array<{ name: string; color: string }>;
  milestone: string | null;
  assignee: string | null;
  assigneeAvatar: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  url: string;
  phase: string | null;
  priority: string | null;
  category: string | null;
}

export async function fetchIssues(token?: string): Promise<GitHubIssue[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const issues: GitHubIssueRaw[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE}/repos/${OWNER}/${REPO}/issues?state=all&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
    const batch = (await res.json()) as GitHubIssueRaw[];
    issues.push(...batch.filter((i) => !i.pull_request));
    hasMore = batch.length === 100;
    page++;
  }

  return issues.map((issue) => ({
    number: issue.number,
    title: issue.title,
    state: issue.state,
    labels: issue.labels.map((l) => ({ name: l.name, color: l.color })),
    milestone: issue.milestone?.title ?? null,
    assignee: issue.assignee?.login ?? null,
    assigneeAvatar: issue.assignee?.avatar_url ?? null,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    url: issue.html_url,
    phase: extractLabel(issue.labels, 'phase:'),
    priority: extractLabel(issue.labels, 'priority:'),
    category: extractLabel(issue.labels, 'category:'),
  }));
}

function extractLabel(labels: Array<{ name: string }>, prefix: string): string | null {
  const match = labels.find((l) => l.name.startsWith(prefix));
  return match ? match.name.replace(prefix, '') : null;
}

export async function updateIssueLabels(
  token: string,
  issueNumber: number,
  addLabels: string[],
  removeLabels: string[],
): Promise<void> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  for (const label of removeLabels) {
    await fetch(
      `${API_BASE}/repos/${OWNER}/${REPO}/issues/${issueNumber}/labels/${encodeURIComponent(label)}`,
      { method: 'DELETE', headers },
    );
  }

  if (addLabels.length > 0) {
    await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/issues/${issueNumber}/labels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ labels: addLabels }),
    });
  }
}
