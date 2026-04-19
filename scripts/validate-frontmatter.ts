import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { FrontmatterSchema } from '../src/lib/content-schema';

async function walkMdx(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walkMdx(full)));
    else if (e.name.endsWith('.mdx')) files.push(full);
  }
  return files;
}

async function main() {
  const files = await walkMdx('content');
  let failed = 0;
  for (const f of files) {
    const raw = await readFile(f, 'utf8');
    const { data } = matter(raw);
    const result = FrontmatterSchema.safeParse(data);
    if (!result.success) {
      failed++;
      console.error(`❌ ${path.relative(process.cwd(), f)}`);
      console.error(result.error.issues.map((i) => `   ${i.path.join('.')}: ${i.message}`).join('\n'));
    }
  }
  if (failed > 0) process.exit(1);
  console.log(`✅ All ${files.length} MDX files pass schema validation.`);
}

main();
