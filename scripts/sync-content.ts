import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import simpleGit from 'simple-git';

const SHOWCASE_REPO = 'https://github.com/Regevba/fitme-showcase.git';
const CACHE_DIR = path.resolve('.showcase-cache');
const CONTENT_DIR = path.resolve('content');
const REPORT_PATH = path.resolve('.sync-report.md');

export function extractUpstreamFrontmatter(raw: string) {
  const parsed = matter(raw);
  return { data: parsed.data, content: parsed.content };
}

export function mergeFrontmatter(
  upstream: Record<string, unknown>,
  existingSite: Record<string, unknown>,
  upstreamSha: string,
): Record<string, unknown> {
  return {
    tier: 'unassigned',
    ...existingSite,
    ...upstream,
    upstream_sha: upstreamSha,
  };
}

async function ensureClone(): Promise<string> {
  if (!existsSync(CACHE_DIR)) {
    console.log('Cloning fitme-showcase into .showcase-cache/');
    await simpleGit().clone(SHOWCASE_REPO, CACHE_DIR, ['--depth', '1']);
  } else {
    console.log('Pulling fitme-showcase updates');
    await simpleGit(CACHE_DIR).pull();
  }
  const sha = (await simpleGit(CACHE_DIR).revparse(['HEAD'])).trim();
  return sha;
}

async function walkMarkdown(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) continue; // skip .git, etc.
      files.push(...(await walkMarkdown(full)));
    } else if (entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

async function syncFile(source: string, sha: string): Promise<{ changed: boolean; dest: string }> {
  const raw = await readFile(source, 'utf8');
  const { data: upstream, content } = extractUpstreamFrontmatter(raw);
  const rel = path.relative(CACHE_DIR, source).replace(/\.md$/, '.mdx');
  const dest = path.join(CONTENT_DIR, rel);

  let existingSite: Record<string, unknown> = {};
  if (existsSync(dest)) {
    const existing = matter(await readFile(dest, 'utf8'));
    existingSite = existing.data;
  }

  const merged = mergeFrontmatter(upstream, existingSite, sha);
  const output = matter.stringify(content, merged);

  await mkdir(path.dirname(dest), { recursive: true });
  const prev = existsSync(dest) ? await readFile(dest, 'utf8') : '';
  await writeFile(dest, output);
  return { changed: prev !== output, dest };
}

async function main() {
  const sha = await ensureClone();
  const sources = await walkMarkdown(CACHE_DIR);
  const changes: string[] = [];
  for (const src of sources) {
    const { changed, dest } = await syncFile(src, sha);
    if (changed) changes.push(path.relative(process.cwd(), dest));
  }

  const report = [
    `# Sync report`,
    ``,
    `- Upstream SHA: \`${sha}\``,
    `- Files changed: ${changes.length}`,
    ``,
    ...changes.map((c) => `- ${c}`),
    ``,
  ].join('\n');
  await writeFile(REPORT_PATH, report);
  console.log(report);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
