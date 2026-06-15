/**
 * Live-source aggregator for the control-room overview.
 *
 * Runs every `live/<source>.ts` probe concurrently via `Promise.allSettled`
 * so one slow or failing source never blocks the others (or the render). Each
 * probe is already fail-soft; the `allSettled` wrapper is belt-and-suspenders
 * against an unexpected throw — a rejected probe becomes a `degradedResult`.
 *
 * Returns a keyed map the page merges over the synced `external-sync-status`
 * snapshot: present + non-degraded → render live (mode 'live'); otherwise the
 * caller keeps the snapshot slice (mode 'snapshot').
 *
 * SERVER-ONLY.
 */

import { fetchGitHubHealth, type GitHubLiveData } from './github';
import { fetchVercelHealth, type VercelLiveData } from './vercel';
import { fetchLinearHealth, type LinearLiveData } from './linear';
import { fetchNotionHealth, type NotionLiveData } from './notion';
import { fetchSupabaseHealth, type SupabaseLiveData } from './supabase';
import { fetchGa4Health, type Ga4LiveData } from './ga4';
import { degradedResult, type LiveSourceResult } from './types';

export interface LiveSources {
  github: LiveSourceResult<GitHubLiveData>;
  vercel: LiveSourceResult<VercelLiveData>;
  linear: LiveSourceResult<LinearLiveData>;
  notion: LiveSourceResult<NotionLiveData>;
  supabase: LiveSourceResult<SupabaseLiveData>;
  ga4: LiveSourceResult<Ga4LiveData>;
}

async function settle<T>(
  source: string,
  p: Promise<LiveSourceResult<T>>,
): Promise<LiveSourceResult<T>> {
  try {
    return await p;
  } catch (err) {
    // A probe should never throw (they're fail-soft), but guarantee it here.
    return degradedResult<T>(source, `unexpected:${(err as Error).message}`);
  }
}

/** Probe all external sources concurrently. Never throws. */
export async function gatherLiveSources(): Promise<LiveSources> {
  const [github, vercel, linear, notion, supabase, ga4] = await Promise.all([
    settle('github', fetchGitHubHealth()),
    settle('vercel', fetchVercelHealth()),
    settle('linear', fetchLinearHealth()),
    settle('notion', fetchNotionHealth()),
    settle('supabase', fetchSupabaseHealth()),
    settle('ga4', fetchGa4Health()),
  ]);
  return { github, vercel, linear, notion, supabase, ga4 };
}

/** True when at least one source returned live (non-degraded) data. */
export function anyLive(sources: LiveSources): boolean {
  return Object.values(sources).some((s) => !s.degraded);
}
