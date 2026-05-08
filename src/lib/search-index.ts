import { readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllCaseStudies } from './content';
import { GLOSSARY } from './glossary';

export type SearchCategory =
  | 'case-study'
  | 'glossary'
  | 'research'
  | 'framework';

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
}

const RESEARCH_DIR = path.resolve('content/05-research');
const DOCS_DIR = path.resolve('src/data/docs');

const DEV_GUIDE_REL_PATH = 'docs/architecture/dev-guide-v1-to-v7-7.md';
const LIFECYCLE_CATALOG_REL_PATH = 'docs/architecture/feature-lifecycle-event-catalog.md';

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

async function loadFrameworkDoc(
  relPath: string,
  url: string,
  fallbackTitle: string,
): Promise<SearchEntry | null> {
  const fullPath = path.join(DOCS_DIR, relPath);
  try {
    const raw = await readFile(fullPath, 'utf8');
    const { data, content } = matter(raw);
    const cleanBody = stripMdx(content);
    const fm = data as Record<string, unknown>;
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title =
      typeof fm.title === 'string'
        ? fm.title
        : titleMatch
          ? titleMatch[1].trim()
          : fallbackTitle;
    const descRaw =
      typeof fm.description === 'string'
        ? fm.description
        : cleanBody;
    return {
      id: relPath,
      title,
      description: truncate(descRaw, 280),
      body: cleanBody,
      url,
      category: 'framework',
      tags: {},
    };
  } catch {
    return null;
  }
}

async function loadFrameworkDocs(): Promise<SearchEntry[]> {
  const results: SearchEntry[] = [];
  const devGuide = await loadFrameworkDoc(
    DEV_GUIDE_REL_PATH,
    '/framework/dev-guide',
    'Framework Dev Guide',
  );
  if (devGuide) results.push(devGuide);

  const lifecycleCatalog = await loadFrameworkDoc(
    LIFECYCLE_CATALOG_REL_PATH,
    '/framework/dev-guide#lifecycle-event-catalog',
    'Feature Lifecycle Event Catalog',
  );
  if (lifecycleCatalog) results.push(lifecycleCatalog);

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
