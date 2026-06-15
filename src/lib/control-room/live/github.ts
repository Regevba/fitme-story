/**
 * Live GitHub source — request-time health for the control-room overview.
 *
 * Reuses the build-time `fetchIssues()` (../github.ts) but wraps it fail-soft:
 * counts open/closed issues + open PRs for Regevba/FitTracker2. Token from
 * `GITHUB_TOKEN` (optional — the public API works unauthenticated but is
 * heavily rate-limited, so an absent token degrades gracefully).
 *
 * SERVER-ONLY.
 */

import { fetchIssues } from '../github';
import { fetchJsonSoft } from './fetch-util';
import { degradedResult, liveResult, type LiveSourceResult } from './types';

export interface GitHubLiveData {
  total_issues: number;
  open_issues: number;
  closed_issues: number;
  open_prs: number;
  with_phase_labels: number;
}

const OWNER = 'Regevba';
const REPO = 'FitTracker2';

export async function fetchGitHubHealth(): Promise<LiveSourceResult<GitHubLiveData>> {
  if (typeof window !== 'undefined') {
    return degradedResult('github', 'client-context');
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token) return degradedResult('github', 'no_token');

  try {
    const issues = await fetchIssues(token);
    const open = issues.filter((i) => i.state === 'open');
    const closed = issues.filter((i) => i.state === 'closed');
    const withPhase = issues.filter((i) => i.phase).length;

    // Open PR count (fetchIssues filters PRs out, so query separately, fail-soft).
    const prs = await fetchJsonSoft<unknown[]>(
      `https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=open&per_page=100`,
      {
        headers: { Accept: 'application/vnd.github.v3+json', Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      },
    );
    const openPrs = Array.isArray(prs) ? prs.length : 0;

    const data: GitHubLiveData = {
      total_issues: issues.length,
      open_issues: open.length,
      closed_issues: closed.length,
      open_prs: openPrs,
      with_phase_labels: withPhase,
    };
    return liveResult('github', data, {
      healthy: true,
      alerts: 0,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return degradedResult('github', (err as Error).message);
  }
}
