/**
 * Control-room command registry — UCC task T30.5.
 *
 * Commands shown in the Cmd+K palette. Each command has a stable `id`, a
 * human-readable `label`, an optional `group` (used for visual section
 * headers in the palette + as a search target), and a `run` function that
 * receives the Next.js router so commands can navigate without each call
 * site re-importing it.
 *
 * Three categories of commands ship by default:
 *   - Navigation: jump to one of the 6 control-room views + the public
 *     case studies page.
 *   - Actions: utility operations (clear localStorage view prefs, toggle
 *     dark mode, open the GitHub repo).
 *   - Features: dynamically generated entry per feature in the seed,
 *     pointing at the FT2 state.json on GitHub for raw inspection.
 *
 * Pure data layer — the palette UI lives in
 * `src/components/control-room/CommandPalette.tsx`.
 */

import { trackExternalLink } from './analytics';

export type CommandRunContext = {
  push: (href: string) => void;
};

export interface Command {
  id: string;
  label: string;
  group?: string;
  /** Search-only synonyms — never rendered. */
  keywords?: readonly string[];
  /** Right-aligned hint text (e.g. "↗" for external, "Action" for utility). */
  hint?: string;
  run: (ctx: CommandRunContext) => void;
}

export interface CommandFeature {
  name: string;
  slug: string;
}

const FT2_STATE_URL = (slug: string) =>
  `https://github.com/Regevba/FitTracker2/blob/main/.claude/features/${slug}/state.json`;

const STORAGE_PREFIX = 'control-room:';

function clearViewPrefs(): void {
  if (typeof window === 'undefined') return;
  try {
    const removable: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) removable.push(k);
    }
    for (const k of removable) {
      window.localStorage.removeItem(k);
      window.dispatchEvent(new StorageEvent('storage', { key: k }));
    }
  } catch {
    // Best-effort.
  }
}

function toggleDarkMode(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const next = !root.classList.contains('dark');
  root.classList.toggle('dark', next);
  try {
    window.localStorage.setItem('theme', next ? 'dark' : 'light');
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));
  } catch {
    // Best-effort.
  }
}

function openExternal(href: string, targetId: string): void {
  if (typeof window === 'undefined') return;
  // GA4 dashboard_external_link (UCC T36 Phase 2). Every external command
  // jumps to a github.com URL, so link_type='github' is the consistent value.
  // If future external commands add Linear/Notion/Vercel destinations,
  // accept a `linkType` parameter and pipe it from the Command.
  trackExternalLink({ link_type: 'github', target_id: targetId });
  window.open(href, '_blank', 'noopener,noreferrer');
}

// ────────────────────────────────────────────────────────────────────────────
// Default commands
// ────────────────────────────────────────────────────────────────────────────

const NAV_COMMANDS: readonly Command[] = [
  {
    id: 'nav:overview',
    label: 'Go to Overview',
    group: 'Navigate',
    keywords: ['hero', 'numbers', 'home'],
    run: ({ push }) => push('/control-room'),
  },
  {
    id: 'nav:board',
    label: 'Go to Board',
    group: 'Navigate',
    keywords: ['kanban', 'phase'],
    run: ({ push }) => push('/control-room/board'),
  },
  {
    id: 'nav:table',
    label: 'Go to Table',
    group: 'Navigate',
    keywords: ['list', 'sort', 'search'],
    run: ({ push }) => push('/control-room/table'),
  },
  {
    id: 'nav:tasks',
    label: 'Go to Tasks',
    group: 'Navigate',
    keywords: ['todo', 'in progress', 'ready', 'blocked', 'done'],
    run: ({ push }) => push('/control-room/tasks'),
  },
  {
    id: 'nav:knowledge',
    label: 'Go to Knowledge',
    group: 'Navigate',
    keywords: ['docs', 'guide', 'reference'],
    run: ({ push }) => push('/control-room/knowledge'),
  },
  {
    id: 'nav:framework',
    label: 'Go to Framework Health',
    group: 'Navigate',
    keywords: ['adoption', 'gates', 'tier', 'integrity'],
    run: ({ push }) => push('/control-room/framework'),
  },
  {
    id: 'nav:case-studies',
    label: 'Open Case studies',
    group: 'Navigate',
    keywords: ['showcase', 'stories'],
    hint: '↗',
    run: ({ push }) => push('/case-studies'),
  },
];

const ACTION_COMMANDS: readonly Command[] = [
  {
    id: 'action:reset-view-prefs',
    label: 'Reset all view prefs',
    group: 'Actions',
    keywords: ['clear', 'localstorage', 'sort', 'filter', 'search'],
    hint: 'Action',
    run: () => clearViewPrefs(),
  },
  {
    id: 'action:toggle-dark-mode',
    label: 'Toggle dark mode',
    group: 'Actions',
    keywords: ['theme', 'light', 'night'],
    hint: 'Action',
    run: () => toggleDarkMode(),
  },
  {
    id: 'action:open-github',
    label: 'Open GitHub repo (FitTracker2)',
    group: 'Actions',
    keywords: ['source', 'code', 'repo'],
    hint: '↗',
    run: () => openExternal('https://github.com/Regevba/FitTracker2', 'FitTracker2'),
  },
];

function featureCommands(features: readonly CommandFeature[]): Command[] {
  return features.map((f) => ({
    id: `feature:${f.slug}`,
    label: `Open feature: ${f.name}`,
    group: 'Features',
    keywords: [f.slug],
    hint: '↗',
    run: () => openExternal(FT2_STATE_URL(f.slug), `feature:${f.slug}`),
  }));
}

/**
 * Build the full command list given the dynamic feature seed. Pure — safe
 * to recompute on every render of the palette.
 */
export function buildCommands(features: readonly CommandFeature[] = []): Command[] {
  return [...NAV_COMMANDS, ...ACTION_COMMANDS, ...featureCommands(features)];
}

/**
 * Lowercase substring filter against label + group + keywords. Case-insensitive,
 * keyword-aware. Returns the input list (cloned) when the query is empty.
 */
export function filterCommands(commands: readonly Command[], query: string): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...commands];

  return commands.filter((cmd) => {
    if (cmd.label.toLowerCase().includes(q)) return true;
    if (cmd.group?.toLowerCase().includes(q)) return true;
    if (cmd.keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
    return false;
  });
}
