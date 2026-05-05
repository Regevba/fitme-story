'use client';

/**
 * Control-room CommandPalette — UCC task T30.5.
 *
 * Linear-style global command palette. Cmd+K (Mac) / Ctrl+K (Windows)
 * toggles a modal overlay with a search input + filtered command list.
 * Arrow up/down moves the selection; Enter executes the highlighted
 * command; Escape closes. Click on the backdrop or any command also
 * closes after running.
 *
 * Mounted once in the control-room layout; runs everywhere under
 * /control-room/* and /case-studies if added there in a follow-up.
 *
 * Hand-rolled (no `cmdk` / `kbar` dep) to keep fitme-story lean — same
 * convention as Wave 1 component ports. Uses a portal-free fixed-position
 * overlay with `inert`-equivalent z-index stacking.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  buildCommands,
  filterCommands,
  type Command,
  type CommandFeature,
} from '@/lib/control-room/commands';

const HOTKEY = 'k';
const MAX_VISIBLE = 50;

export interface CommandPaletteProps {
  /** Dynamic feature seed; passed by the server layout from features.json. */
  features?: readonly CommandFeature[];
}

export function CommandPalette({ features = [] }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allCommands = useMemo(() => buildCommands(features), [features]);
  const filtered = useMemo(
    () => filterCommands(allCommands, query).slice(0, MAX_VISIBLE),
    [allCommands, query],
  );

  // Reset selection in the event handler that mutated `query` — avoids the
  // React 19 `react-hooks/set-state-in-effect` rule.
  const onQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  // Auto-focus search when opened.
  useEffect(() => {
    if (open) {
      // Defer to ensure the input is mounted.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll selected item into view.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector<HTMLElement>(
      `[data-cmd-index="${selectedIndex}"]`,
    );
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const runCommand = useCallback(
    (cmd: Command) => {
      cmd.run({ push: (href) => router.push(href) });
      close();
    },
    [router, close],
  );

  // Global hotkey: Cmd/Ctrl+K toggles. Also handles Escape when open is
  // managed elsewhere (defensive). Listener is mounted on document so it
  // works even when focus is in the input.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isHotkey =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === HOTKEY && !e.altKey;
      if (isHotkey) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      // Escape handled at the modal level (see onKeyDown below).
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Modal keyboard nav.
  const onModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd) runCommand(cmd);
      return;
    }
  };

  if (!open) return null;

  // Group consecutive commands by their `group` for visual section headers.
  const groupedRows: Array<{ kind: 'header'; group: string } | { kind: 'cmd'; cmd: Command; flatIndex: number }> = [];
  let lastGroup = '';
  filtered.forEach((cmd, idx) => {
    const group = cmd.group ?? 'Other';
    if (group !== lastGroup) {
      groupedRows.push({ kind: 'header', group });
      lastGroup = group;
    }
    groupedRows.push({ kind: 'cmd', cmd, flatIndex: idx });
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-[15vh] backdrop-blur-sm"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onModalKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-neutral-200)] bg-white shadow-2xl dark:border-[var(--color-neutral-800)] dark:bg-[var(--color-neutral-900)]"
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-neutral-100)] px-4 py-3 dark:border-[var(--color-neutral-800)]">
          <span className="font-mono text-xs text-[var(--color-neutral-400)]" aria-hidden="true">
            ⌘K
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search views, actions, features…"
            className="flex-1 bg-transparent font-sans text-sm text-[var(--color-neutral-900)] outline-none placeholder:text-[var(--color-neutral-400)] dark:text-[var(--color-neutral-100)]"
            aria-label="Command search"
            aria-controls="command-palette-list"
            aria-activedescendant={
              filtered[selectedIndex] ? `command-${filtered[selectedIndex].id}` : undefined
            }
          />
          <button
            type="button"
            onClick={close}
            className="rounded font-mono text-[10px] text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] dark:hover:text-[var(--color-neutral-200)]"
            aria-label="Close command palette"
          >
            ESC
          </button>
        </div>

        <div
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          aria-label="Commands"
          className="max-h-[50vh] overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center font-sans text-sm text-[var(--color-neutral-400)]">
              No commands match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            groupedRows.map((row, i) => {
              if (row.kind === 'header') {
                return (
                  <div
                    key={`header-${row.group}-${i}`}
                    className="border-t border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-4 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] first:border-t-0 dark:border-[var(--color-neutral-800)] dark:bg-white/[0.02] dark:text-[var(--color-neutral-400)]"
                  >
                    {row.group}
                  </div>
                );
              }
              const isSelected = row.flatIndex === selectedIndex;
              return (
                <button
                  type="button"
                  key={row.cmd.id}
                  id={`command-${row.cmd.id}`}
                  role="option"
                  aria-selected={isSelected}
                  data-cmd-index={row.flatIndex}
                  onClick={() => runCommand(row.cmd)}
                  onMouseEnter={() => setSelectedIndex(row.flatIndex)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left font-sans text-sm transition-colors ${
                    isSelected
                      ? 'bg-[var(--color-brand-indigo)]/10 text-[var(--color-brand-indigo)]'
                      : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] dark:text-[var(--color-neutral-200)] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="truncate">{row.cmd.label}</span>
                  {row.cmd.hint ? (
                    <span className="ml-3 shrink-0 font-mono text-[10px] text-[var(--color-neutral-400)]">
                      {row.cmd.hint}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-4 py-2 dark:border-[var(--color-neutral-800)] dark:bg-white/[0.02]">
          <span className="font-mono text-[10px] text-[var(--color-neutral-400)]">
            {filtered.length} {filtered.length === 1 ? 'command' : 'commands'}
          </span>
          <span className="font-mono text-[10px] text-[var(--color-neutral-400)]">
            ↑↓ navigate · ↵ select · esc close
          </span>
        </div>
      </div>
    </div>
  );
}
