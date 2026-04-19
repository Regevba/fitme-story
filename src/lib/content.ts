import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { FrontmatterSchema, type Frontmatter } from './content-schema';

export interface ContentEntry {
  frontmatter: Frontmatter;
  body: string;
  readingTimeMin: number;
  filePath: string;
}

const CASE_STUDIES_DIR = path.resolve('content/04-case-studies');

async function readContent(dir: string): Promise<ContentEntry[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: ContentEntry[] = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.mdx')) continue;
    if (e.name === 'README.mdx') continue; // README is not a case study
    const full = path.join(dir, e.name);
    const raw = await readFile(full, 'utf8');
    const { data, content } = matter(raw);
    const fm = FrontmatterSchema.parse(data);
    out.push({
      frontmatter: fm,
      body: content,
      readingTimeMin: Math.ceil(readingTime(content).minutes),
      filePath: full,
    });
  }
  return out;
}

export async function getAllCaseStudies(): Promise<ContentEntry[]> {
  const all = await readContent(CASE_STUDIES_DIR);
  return all.sort((a, b) => {
    const aOrder = a.frontmatter.timeline_position?.order ?? 999;
    const bOrder = b.frontmatter.timeline_position?.order ?? 999;
    return aOrder - bOrder;
  });
}

export async function getCaseStudyBySlug(slug: string): Promise<ContentEntry | null> {
  const all = await getAllCaseStudies();
  return all.find((c) => c.frontmatter.slug === slug) ?? null;
}

export async function getByTier(tier: Frontmatter['tier']): Promise<ContentEntry[]> {
  const all = await getAllCaseStudies();
  return all.filter((c) => c.frontmatter.tier === tier);
}
