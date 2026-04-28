/**
 * GitHub Issues fetcher — UCC T32 port from
 * dashboard/src/scripts/github.js (FitTracker2 Astro source).
 *
 * Hits the public GitHub Issues API at build time, paginates, and projects
 * the response into the wire shape the dashboard renders. A `phase:`,
 * `priority:`, and `category:` label triplet is extracted from each issue's
 * labels[].
 *
 * SERVER-ONLY: imported by builder.ts (build-time Server Component).
 * Importing on the client would leak the GITHUB_TOKEN, so we guard it.
 */

if (typeof window !== 'undefined') {
  throw new Error('github.ts must not be imported in client-side code');
}

const OWNER = 'Regevba';
const REPO = 'FitTracker2';
const API_BASE = 'https://api.github.com';

export interface GitHubLabel {
  name: string;
  color: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  labels: GitHubLabel[];
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

interface RawGitHubLabel {
  name: string;
  color: string;
}

interface RawGitHubIssue {
  number: number;
  title: string;
  state: string;
  labels: RawGitHubLabel[];
  milestone: { title: string } | null;
  assignee: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: unknown;
}

function extractLabel(labels: GitHubLabel[], prefix: string): string | null {
  const match = labels.find((l) => l.name.startsWith(prefix));
  return match ? match.name.replace(prefix, '') : null;
}

export async function fetchIssues(token?: string): Promise<GitHubIssue[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const issues: RawGitHubIssue[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE}/repos/${OWNER}/${REPO}/issues?state=all&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
    const batch = (await res.json()) as RawGitHubIssue[];
    issues.push(...batch.filter((i) => !i.pull_request));
    hasMore = batch.length === 100;
    page++;
  }

  return issues.map((issue) => {
    const labels = issue.labels.map((l) => ({ name: l.name, color: l.color }));
    return {
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels,
      milestone: issue.milestone?.title ?? null,
      assignee: issue.assignee?.login ?? null,
      assigneeAvatar: issue.assignee?.avatar_url ?? null,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at,
      url: issue.html_url,
      phase: extractLabel(labels, 'phase:'),
      priority: extractLabel(labels, 'priority:'),
      category: extractLabel(labels, 'category:'),
    };
  });
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
