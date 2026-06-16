/**
 * Live GA4 source — recent active-user summary.
 *
 * The GA4 Data API requires a service-account JWT (google-auth-library), which
 * is a heavier runtime dependency than PR A wants to add. So this module reads
 * a pre-computed summary JSON from `GA4_SUMMARY_URL` (a small endpoint / Vercel
 * Blob that an FT2-side GA4 cron writes — property 531124395). Shape:
 *   { property_id, generated_at, active_users_7d: { "YYYYMMDD": number, ... } }
 * Fail-soft; degrades when the env var or payload is absent.
 *
 * Follow-up (PR B / operator): wire the GA4 Data API `runReport` directly with
 * `GA4_SA_KEY_JSON` if true request-time querying is preferred over the cron
 * summary. The envelope returned here is identical either way.
 *
 * SERVER-ONLY.
 */

import { fetchJsonSoft } from './fetch-util';
import { degradedResult, liveResult, type LiveSourceResult } from './types';

export interface Ga4LiveData {
  property_id: string | null;
  generated_at: string | null;
  active_users_7d: Record<string, number>;
  total_7d: number;
}

interface RawSummary {
  property_id?: string;
  generated_at?: string;
  active_users_7d?: Record<string, number>;
}

export async function fetchGa4Health(): Promise<LiveSourceResult<Ga4LiveData>> {
  if (typeof window !== 'undefined') return degradedResult('ga4', 'client-context');
  const summaryUrl = process.env.GA4_SUMMARY_URL;
  if (!summaryUrl) return degradedResult('ga4', 'no_summary_url');

  const json = await fetchJsonSoft<RawSummary>(summaryUrl, { next: { revalidate: 600 } });
  if (!json || !json.active_users_7d) return degradedResult('ga4', 'no_data');

  const series = json.active_users_7d;
  const total = Object.values(series).reduce((sum, n) => sum + (Number(n) || 0), 0);
  const data: Ga4LiveData = {
    property_id: json.property_id ?? process.env.GA4_PROPERTY_ID ?? null,
    generated_at: json.generated_at ?? null,
    active_users_7d: series,
    total_7d: total,
  };
  return liveResult('ga4', data, {
    healthy: true,
    alerts: 0,
    fetchedAt: new Date().toISOString(),
  });
}
