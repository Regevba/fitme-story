/**
 * Live Vercel source — latest deployment state for the fitme-story project.
 *
 * Uses the Vercel REST API (`/v6/deployments`) with `VERCEL_API_TOKEN`.
 * `VERCEL_PROJECT_ID` + `VERCEL_TEAM_ID` default to the known fitme-story ids
 * but are env-overridable. Fail-soft.
 *
 * SERVER-ONLY.
 */

import { fetchJsonSoft } from './fetch-util';
import { degradedResult, liveResult, type LiveSourceResult } from './types';

export interface VercelLiveData {
  project: string;
  latest_state: string; // READY | ERROR | BUILDING | QUEUED | CANCELED
  latest_target: string | null;
  latest_url: string | null;
  latest_commit: string | null;
  created_at: number | null;
}

const DEFAULT_PROJECT_ID = 'prj_poCIThWeTrYTMtarke0OxEu7CZMB';
const DEFAULT_TEAM_ID = 'team_nWTAev1JObeqXiUVrCNFN2j7';

interface RawDeployment {
  state?: string;
  readyState?: string;
  target?: string | null;
  url?: string | null;
  created?: number;
  meta?: { githubCommitMessage?: string };
}

export async function fetchVercelHealth(): Promise<LiveSourceResult<VercelLiveData>> {
  if (typeof window !== 'undefined') return degradedResult('vercel', 'client-context');
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return degradedResult('vercel', 'no_token');

  const projectId = process.env.VERCEL_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID ?? DEFAULT_TEAM_ID;
  const url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=1`;

  const json = await fetchJsonSoft<{ deployments?: RawDeployment[] }>(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 120 },
  });
  const latest = json?.deployments?.[0];
  if (!latest) return degradedResult('vercel', 'no_deployments');

  const state = latest.state ?? latest.readyState ?? 'UNKNOWN';
  const data: VercelLiveData = {
    project: 'fitme-story',
    latest_state: state,
    latest_target: latest.target ?? null,
    latest_url: latest.url ? `https://${latest.url}` : null,
    latest_commit: latest.meta?.githubCommitMessage?.split('\n')[0] ?? null,
    created_at: latest.created ?? null,
  };
  const healthy = state === 'READY';
  return liveResult('vercel', data, {
    healthy,
    alerts: healthy ? 0 : 1,
    fetchedAt: new Date().toISOString(),
  });
}
