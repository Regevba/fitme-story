import { readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import { getAllCaseStudies } from './content';
import { GLOSSARY } from './glossary';

export type SearchCategory =
  | 'case-study'
  | 'glossary'
  | 'research'
  | 'framework';

/** A heading-scoped slice of an entry, used for deep-linking to the matched section. */
export interface SearchSection {
  /** github-slugger / rehype-slug anchor (no leading '#'). Matches rendered heading ids. */
  anchor: string;
  /** Heading text. */
  heading: string;
  /** Cleaned text of this section (heading + content up to the next heading). */
  body: string;
}

export interface SearchEntry {
  /** Stable identifier — slug or relative path. */
  id: string;
  /** Display title shown in results. */
  title: string;
  /** Short snippet (≤ 280 chars) shown under the title. */
  description: string;
  /** Larger searchable body — used for query matching, not displayed in full. */
  body: string;
  /** Canonical URL on this site (relative path, leading slash). */
  url: string;
  /** Top-level corpus this entry belongs to. */
  category: SearchCategory;
  /** Filterable tags pulled from frontmatter / structure. Lowercased. */
  tags: {
    version?: string;
    work_type?: string;
    era?: string;
    tier?: string;
    persona?: string[];
    glossary_category?: 'hardware-analog' | 'framework' | 'methodology' | 'web';
  };
  /** Heading-scoped sections for deep-linking a body match to the matched anchor. */
  sections?: SearchSection[];
}

const RESEARCH_DIR = path.resolve('content/05-research');
const ARCH_DOCS_DIR = path.resolve('src/data/docs/docs/architecture');
const GITHUB_DOCS_BASE = 'https://github.com/Regevba/FitTracker2/blob/main/docs/architecture';

/**
 * Architecture docs that have a real on-site route. Everything else in the
 * architecture folder links to its GitHub blob URL — the same place the
 * on-site dev-guide page sends readers for the full document — instead of an
 * on-site path that would 404.
 */
const ON_SITE_DOC_ROUTES: Record<string, string> = {
  'dev-guide-v1-to-v7-7.md': '/framework/dev-guide',
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

function stripMdx(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split raw markdown into heading-scoped sections. Anchors are generated with
 * github-slugger using one slugger per document, matching exactly what
 * rehype-slug emits on the rendered page (and GitHub's blob anchors). Fenced
 * code blocks are skipped so a `# comment` inside code isn't treated as a
 * heading.
 */
function extractSections(rawMarkdown: string): SearchSection[] {
  const slugger = new GithubSlugger();
  const collected: Array<{ heading: string; anchor: string; lines: string[] }> = [];
  let inFence = false;
  let current: { heading: string; anchor: string; lines: string[] } | null = null;

  for (const line of rawMarkdown.split('\n')) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inFence = !inFence;
      if (current) current.lines.push(line);
      continue;
    }
    const headingMatch = !inFence ? line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/) : null;
    if (headingMatch) {
      const heading = headingMatch[2].trim();
      current = { heading, anchor: slugger.slug(heading), lines: [] };
      collected.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  return collected.map((s) => ({
    anchor: s.anchor,
    heading: s.heading,
    body: stripMdx(`${s.heading}\n${s.lines.join('\n')}`),
  }));
}

async function loadCaseStudies(): Promise<SearchEntry[]> {
  const all = await getAllCaseStudies();
  return all.map((entry) => {
    const fm = entry.frontmatter;
    const cleanBody = stripMdx(entry.body);
    const tldr = (fm as Record<string, unknown>)['tldr'];
    const description =
      typeof tldr === 'string' && tldr.length > 0
        ? truncate(tldr, 280)
        : truncate(cleanBody, 280);
    return {
      id: fm.slug,
      title: fm.title,
      description,
      body: cleanBody,
      url: `/case-studies/${fm.slug}`,
      category: 'case-study' as const,
      tags: {
        version: fm.timeline_position?.version,
        work_type: (fm as Record<string, unknown>)['work_type'] as string | undefined,
        era: (fm as Record<string, unknown>)['era'] as string | undefined,
        tier: fm.tier,
        persona: fm.persona_emphasis ? Object.keys(fm.persona_emphasis) : undefined,
      },
      sections: extractSections(entry.body),
    };
  });
}

function loadGlossary(): SearchEntry[] {
  return GLOSSARY.map((g) => ({
    id: g.slug,
    title: g.term,
    description: truncate(g.tooltip, 280),
    body: `${g.term} ${(g.aliases ?? []).join(' ')} ${g.tooltip} ${g.full}`,
    url: `/glossary#${g.slug}`,
    category: 'glossary' as const,
    tags: { glossary_category: g.category },
  }));
}

async function loadResearchMdx(): Promise<SearchEntry[]> {
  const fs = await import('node:fs/promises');
  const entries = await fs.readdir(RESEARCH_DIR, { withFileTypes: true });
  const results: SearchEntry[] = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.mdx') || e.name === 'README.mdx') continue;
    const fullPath = path.join(RESEARCH_DIR, e.name);
    const raw = await readFile(fullPath, 'utf8');
    const { data, content } = matter(raw);
    const cleanBody = stripMdx(content);
    const slug = e.name.replace(/\.mdx$/, '');
    const fm = data as Record<string, unknown>;
    const description =
      typeof fm.tldr === 'string'
        ? truncate(fm.tldr, 280)
        : typeof fm.description === 'string'
          ? truncate(fm.description, 280)
          : truncate(cleanBody, 280);
    results.push({
      id: slug,
      title: typeof fm.title === 'string' ? fm.title : slug,
      description,
      body: cleanBody,
      url: `/research#${slug}`,
      category: 'research',
      tags: {},
    });
  }
  return results;
}

/**
 * Index every architecture doc, not just two hardcoded ones. Each doc links to
 * its real on-site route when one exists ({@link ON_SITE_DOC_ROUTES}); the rest
 * link to their GitHub blob URL so a result never points at a 404.
 */
async function loadFrameworkDocs(): Promise<SearchEntry[]> {
  const fs = await import('node:fs/promises');
  let files: string[];
  try {
    files = (await fs.readdir(ARCH_DOCS_DIR)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }

  const results: SearchEntry[] = [];
  for (const file of files.sort()) {
    const raw = await readFile(path.join(ARCH_DOCS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const fm = data as Record<string, unknown>;
    const cleanBody = stripMdx(content);
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title =
      typeof fm.title === 'string'
        ? fm.title
        : titleMatch
          ? titleMatch[1].trim()
          : file.replace(/\.md$/, '');
    const descRaw = typeof fm.description === 'string' ? fm.description : cleanBody;
    results.push({
      id: `architecture/${file}`,
      title,
      description: truncate(descRaw, 280),
      body: cleanBody,
      url: ON_SITE_DOC_ROUTES[file] ?? `${GITHUB_DOCS_BASE}/${file}`,
      category: 'framework',
      tags: {},
      sections: extractSections(content),
    });
  }
  return results;
}

let cachedIndex: SearchEntry[] | null = null;

export async function getSearchIndex(): Promise<SearchEntry[]> {
  if (cachedIndex) return cachedIndex;
  const [caseStudies, research, framework] = await Promise.all([
    loadCaseStudies(),
    loadResearchMdx(),
    loadFrameworkDocs(),
  ]);
  cachedIndex = [...caseStudies, ...loadGlossary(), ...research, ...framework];
  return cachedIndex;
}

export function getSearchIndexFacets(entries: SearchEntry[]): {
  versions: string[];
  categories: SearchCategory[];
  tiers: string[];
  glossaryCategories: string[];
} {
  const versions = new Set<string>();
  const categories = new Set<SearchCategory>();
  const tiers = new Set<string>();
  const glossaryCategories = new Set<string>();

  for (const entry of entries) {
    categories.add(entry.category);
    if (entry.tags.version) versions.add(entry.tags.version);
    if (entry.tags.tier) tiers.add(entry.tags.tier);
    if (entry.tags.glossary_category) glossaryCategories.add(entry.tags.glossary_category);
  }

  const versionSort = (a: string, b: string) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  };

  return {
    versions: Array.from(versions).sort(versionSort),
    categories: Array.from(categories).sort(),
    tiers: Array.from(tiers).sort(),
    glossaryCategories: Array.from(glossaryCategories).sort(),
  };
}
