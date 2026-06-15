/**
 * Live Supabase source — reachability of the canonical project.
 *
 * Probes the GoTrue health endpoint (`/auth/v1/health`) at `SUPABASE_URL`
 * with the `apikey` header (`SUPABASE_SERVICE_ROLE_KEY` or
 * `SUPABASE_ANON_KEY`). A response (even non-200) means the host is up; only a
 * network/timeout failure marks it unhealthy. Fail-soft.
 *
 * SERVER-ONLY.
 */

import { fetchJsonSoft, probeReachable } from './fetch-util';
import { degradedResult, liveResult, type LiveSourceResult } from './types';

export interface SupabaseLiveData {
  project_url: string;
  reachable: boolean;
  health: string | null; // GoTrue version string when available
}

interface RawHealth {
  version?: string;
  name?: string;
}

export async function fetchSupabaseHealth(): Promise<LiveSourceResult<SupabaseLiveData>> {
  if (typeof window !== 'undefined') return degradedResult('supabase', 'client-context');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url) return degradedResult('supabase', 'no_url');
  if (!key) return degradedResult('supabase', 'no_key');

  const healthUrl = `${url.replace(/\/$/, '')}/auth/v1/health`;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const health = await fetchJsonSoft<RawHealth>(healthUrl, { headers, next: { revalidate: 120 } });
  const reachable = health !== null ? true : await probeReachable(healthUrl, { headers });
  if (!reachable) return degradedResult('supabase', 'unreachable');

  const data: SupabaseLiveData = {
    project_url: url,
    reachable: true,
    health: health?.version ?? health?.name ?? null,
  };
  return liveResult('supabase', data, {
    healthy: true,
    alerts: 0,
    fetchedAt: new Date().toISOString(),
  });
}
