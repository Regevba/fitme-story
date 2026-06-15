/**
 * Live Notion source — last-edited freshness for tracked control-room pages.
 *
 * Uses the Notion API with `NOTION_API_KEY`. Page IDs come from
 * `NOTION_TRACKED_PAGE_IDS` (comma-separated). For each page it reads
 * `last_edited_time`; the source's "freshness" is the most recent of them.
 * Fail-soft.
 *
 * SERVER-ONLY.
 */

import { fetchJsonSoft } from './fetch-util';
import { degradedResult, liveResult, type LiveSourceResult } from './types';

export interface NotionLiveData {
  tracked_pages: number;
  most_recent_edit: string | null;
  pages: Array<{ id: string; last_edited_time: string | null }>;
}

const API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

interface RawPage {
  last_edited_time?: string;
}

export async function fetchNotionHealth(): Promise<LiveSourceResult<NotionLiveData>> {
  if (typeof window !== 'undefined') return degradedResult('notion', 'client-context');
  const key = process.env.NOTION_API_KEY;
  if (!key) return degradedResult('notion', 'no_token');

  const idsRaw = process.env.NOTION_TRACKED_PAGE_IDS ?? '';
  const ids = idsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return degradedResult('notion', 'no_page_ids');

  const headers = {
    Authorization: `Bearer ${key}`,
    'Notion-Version': NOTION_VERSION,
  };

  const pages = await Promise.all(
    ids.map(async (id) => {
      const page = await fetchJsonSoft<RawPage>(`${API_BASE}/pages/${id}`, {
        headers,
        next: { revalidate: 900 },
      });
      return { id, last_edited_time: page?.last_edited_time ?? null };
    }),
  );

  const edits = pages.map((p) => p.last_edited_time).filter((t): t is string => !!t);
  if (edits.length === 0) return degradedResult('notion', 'no_pages_resolved');

  const mostRecent = edits.sort().at(-1) ?? null;
  const data: NotionLiveData = {
    tracked_pages: pages.length,
    most_recent_edit: mostRecent,
    pages,
  };
  return liveResult('notion', data, {
    healthy: true,
    alerts: 0,
    fetchedAt: new Date().toISOString(),
  });
}
