/**
 * Live Linear source — issue counts by status for the FitTracker Roadmap.
 *
 * Uses the Linear GraphQL API with `LINEAR_API_KEY`. Counts issues by their
 * workflow-state type (backlog / unstarted / started / completed / canceled).
 * Fail-soft.
 *
 * SERVER-ONLY.
 */

import { fetchJsonSoft } from './fetch-util';
import { degradedResult, liveResult, type LiveSourceResult } from './types';

export interface LinearLiveData {
  team: string;
  total: number;
  backlog: number;
  todo: number;
  in_progress: number;
  done: number;
  canceled: number;
}

const TEAM_KEY = 'FIT';
const ENDPOINT = 'https://api.linear.app/graphql';

const QUERY = `query ControlRoomIssueCounts($teamKey: String!) {
  issues(first: 250, filter: { team: { key: { eq: $teamKey } } }) {
    nodes { state { type } }
  }
}`;

interface RawIssuesResponse {
  data?: { issues?: { nodes?: Array<{ state?: { type?: string } }> } };
}

export async function fetchLinearHealth(): Promise<LiveSourceResult<LinearLiveData>> {
  if (typeof window !== 'undefined') return degradedResult('linear', 'client-context');
  const key = process.env.LINEAR_API_KEY;
  if (!key) return degradedResult('linear', 'no_token');

  const json = await fetchJsonSoft<RawIssuesResponse>(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { teamKey: TEAM_KEY } }),
    next: { revalidate: 600 },
  });

  const nodes = json?.data?.issues?.nodes;
  if (!nodes) return degradedResult('linear', 'no_data');

  const counts = { backlog: 0, todo: 0, in_progress: 0, done: 0, canceled: 0 };
  for (const n of nodes) {
    switch (n.state?.type) {
      case 'backlog': counts.backlog += 1; break;
      case 'unstarted': counts.todo += 1; break;
      case 'started': counts.in_progress += 1; break;
      case 'completed': counts.done += 1; break;
      case 'canceled': counts.canceled += 1; break;
    }
  }
  const total = counts.backlog + counts.todo + counts.in_progress + counts.done + counts.canceled;
  const data: LinearLiveData = { team: TEAM_KEY, total, ...counts };
  return liveResult('linear', data, {
    healthy: true,
    alerts: 0,
    fetchedAt: new Date().toISOString(),
  });
}
