import { SHARED_DATA_FILES } from '@/lib/shared-data-layer';
import { getSkill } from '@/lib/skill-ecosystem';
import type { SkillSlug } from '@/lib/skill-ecosystem';

function SkillDot({ slug }: { slug: SkillSlug }) {
  const s = getSkill(slug);
  return (
    <span
      className="inline-block w-3 h-3 rounded-full"
      style={{ backgroundColor: s.accent }}
      title={s.displayName}
      aria-label={s.displayName}
    />
  );
}

export function SharedDataTiles() {
  return (
    <div
      className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-label="Shared data layer — 15 JSON files the skills read and write"
    >
      {SHARED_DATA_FILES.map((file) => (
        <div
          key={file.filename}
          className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4 bg-white dark:bg-[var(--color-neutral-900)]"
        >
          <div className="font-mono text-sm font-semibold mb-1 text-[var(--color-brand-indigo)]">{file.filename}</div>
          <p className="text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-3">
            {file.oneLiner}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-500)] font-sans w-14">read by</span>
              <span className="flex gap-1 flex-wrap">
                {file.readBy.map((s) => (
                  <SkillDot key={s} slug={s} />
                ))}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-[var(--color-neutral-500)] font-sans w-14">writes</span>
              <span className="flex gap-1 flex-wrap">
                {file.writtenBy.map((s) => (
                  <SkillDot key={s} slug={s} />
                ))}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
