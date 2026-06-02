/**
 * Build the prebuilt MiniSearch index consumed by the ⌘K search palette.
 *
 * Reuses the same getSearchIndex() corpus the server-rendered /search page
 * uses, builds a MiniSearch index with the shared options, and serializes it
 * to public/search-index.json. The client lazy-fetches this on first ⌘K and
 * runs instant fuzzy/prefix search entirely in the browser.
 *
 * Runs in `prebuild` after the FitTracker2 content sync so the index reflects
 * the freshly-synced case studies, glossary, research, and framework docs.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { getSearchIndex } from '../src/lib/search-index';
import {
  MINISEARCH_OPTIONS,
  type StoredDoc,
} from '../src/lib/search-palette-config';

interface IndexedDoc extends StoredDoc {
  docId: number;
  body: string;
  tagText: string;
}

async function main(): Promise<void> {
  const entries = await getSearchIndex();

  const docs: IndexedDoc[] = entries.map((e, i) => ({
    docId: i,
    title: e.title,
    description: e.description,
    body: e.body,
    tagText: [
      e.tags.version,
      e.tags.work_type,
      e.tags.era,
      e.tags.tier,
      e.tags.glossary_category,
      ...(e.tags.persona ?? []),
    ]
      .filter(Boolean)
      .join(' '),
    url: e.url,
    category: e.category,
    version: e.tags.version ?? null,
    tier: e.tags.tier ?? null,
  }));

  const mini = new MiniSearch(MINISEARCH_OPTIONS);
  mini.addAll(docs);

  const outDir = path.resolve('public');
  await mkdir(outDir, { recursive: true });
  const payload = JSON.stringify({ index: mini.toJSON(), count: entries.length });
  await writeFile(path.join(outDir, 'search-index.json'), payload, 'utf8');

  console.log(
    `[build-search-index] wrote public/search-index.json — ${entries.length} docs, ${(
      payload.length / 1024
    ).toFixed(0)} KB`,
  );
}

main().catch((err) => {
  console.error('[build-search-index] failed:', err);
  process.exit(1);
});
