import * as React from 'react';

type ColorSwatchProps = {
  cssVar: string;
  hex: string;
  label: string;
  note?: string;
};

export function ColorSwatch({ cssVar, hex, label, note }: ColorSwatchProps) {
  return (
    <li className="flex gap-3 items-center rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-3">
      <span
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]"
        style={{ backgroundColor: hex }}
      />
      <div className="min-w-0">
        <div className="font-sans text-sm font-semibold truncate">{label}</div>
        <code className="block font-mono text-[11px] text-[var(--color-neutral-500)] truncate">
          {cssVar}
        </code>
        <code className="block font-mono text-[11px] text-[var(--color-neutral-500)]">
          {hex}
        </code>
        {note ? (
          <p className="mt-1 text-[11px] font-sans text-[var(--color-neutral-500)]">
            {note}
          </p>
        ) : null}
      </div>
    </li>
  );
}

type MotionTokenRowProps = {
  cssVar: string;
  value: string;
  label: string;
  note?: string;
};

export function MotionTokenRow({ cssVar, value, label, note }: MotionTokenRowProps) {
  return (
    <li className="flex flex-wrap gap-3 items-baseline divider-row">
      <span className="font-sans font-semibold text-sm w-32 shrink-0">{label}</span>
      <code className="font-mono text-xs text-[var(--color-neutral-500)] w-56 shrink-0 truncate">
        {cssVar}
      </code>
      <code className="font-mono text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        {value}
      </code>
      {note ? (
        <span className="text-xs font-sans text-[var(--color-neutral-500)] basis-full">
          {note}
        </span>
      ) : null}
    </li>
  );
}

type ElevationSwatchProps = {
  cssVar: string;
  lightValue: string;
  darkValue: string;
  level: 1 | 2 | 3 | 4;
  label: string;
  note?: string;
};

export function ElevationSwatch({
  cssVar,
  lightValue,
  darkValue,
  level,
  label,
  note,
}: ElevationSwatchProps) {
  return (
    <li className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div
          className="h-16 rounded bg-[var(--color-neutral-50)] flex items-end justify-end p-2"
          style={{ boxShadow: lightValue }}
          aria-label={`Light-mode preview of ${label}`}
        >
          <span className="text-[10px] font-mono text-[var(--color-neutral-700)]">Light</span>
        </div>
        <div
          className="h-16 rounded bg-[var(--color-neutral-900)] flex items-end justify-end p-2"
          style={{ boxShadow: darkValue }}
          aria-label={`Dark-mode preview of ${label}`}
        >
          <span className="text-[10px] font-mono text-[var(--color-neutral-300)]">Dark</span>
        </div>
      </div>
      <div className="font-sans text-sm font-semibold">
        {label} <span className="text-[var(--color-neutral-500)]">· level {level}</span>
      </div>
      <code className="block font-mono text-[11px] text-[var(--color-neutral-500)] mt-1">
        {cssVar}
      </code>
      {note ? (
        <p className="mt-1 text-[11px] font-sans text-[var(--color-neutral-500)]">{note}</p>
      ) : null}
    </li>
  );
}

type ZIndexLadderRowProps = {
  cssVar: string;
  value: number;
  label: string;
  note?: string;
};

export function ZIndexLadderRow({ cssVar, value, label, note }: ZIndexLadderRowProps) {
  return (
    <li className="flex flex-wrap gap-3 items-baseline divider-row">
      <span className="font-sans font-semibold text-sm w-24 shrink-0">{label}</span>
      <code className="font-mono text-xs text-[var(--color-neutral-500)] w-32 shrink-0 truncate">
        {cssVar}
      </code>
      <code className="font-mono text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] w-16 shrink-0 text-right">
        {value}
      </code>
      {note ? (
        <span className="text-xs font-sans text-[var(--color-neutral-500)] basis-full sm:basis-auto sm:flex-1">
          {note}
        </span>
      ) : null}
    </li>
  );
}
