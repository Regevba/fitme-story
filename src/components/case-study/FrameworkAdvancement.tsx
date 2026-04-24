'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { ADVANCEMENT_POINTS, GEMINI_AUDIT_DATE, type AdvancementPoint } from '@/lib/framework-advancement-data';

// Multi-line trend chart. Each "line" is one feature's trajectory from start
// (implied via wall minutes) to its ship date. Y axis = wall minutes (a
// normalized advancement proxy because raw CU ranges from ~1 to ~28 and is
// not directly comparable across feature types). Tier labeling distinguishes
// audit-validated T1 data from pre-v6.0 T3 narrative estimates.
//
// Clickable: the chart opens in an enlarged modal overlay for readability on
// larger screens. SVG is vector so the same markup scales cleanly; only the
// surrounding container grows.

const W = 820;
const H = 380;
const MARGIN = { top: 32, right: 24, bottom: 56, left: 56 };
const CHART_W = W - MARGIN.left - MARGIN.right;
const CHART_H = H - MARGIN.top - MARGIN.bottom;

function daysBetween(a: string, b: string): number {
  return (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24);
}

// Inner SVG render — shared between the embedded chart and the enlarged modal
// so both views always show the same markup.
function ChartSvg({ points }: { points: AdvancementPoint[] }) {
  const dates = points.map((p) => p.shipDate).sort();
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  const totalDays = daysBetween(maxDate, minDate);

  const minY = Math.min(...points.map((p) => p.wallMinutes));
  const maxY = Math.max(...points.map((p) => p.wallMinutes));
  const yLogMin = Math.log10(minY);
  const yLogMax = Math.log10(maxY);

  function xFor(date: string): number {
    const d = daysBetween(date, minDate);
    return MARGIN.left + (d / totalDays) * CHART_W;
  }
  function yFor(minutes: number): number {
    const log = Math.log10(minutes);
    const ratio = (log - yLogMin) / (yLogMax - yLogMin);
    return MARGIN.top + (1 - ratio) * CHART_H;
  }

  const t1Points = points
    .filter((p) => p.tier === 'T1')
    .sort((a, b) => a.shipDate.localeCompare(b.shipDate));
  const auditX = xFor(GEMINI_AUDIT_DATE);

  const trendPath = t1Points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.shipDate)} ${yFor(p.wallMinutes)}`)
    .join(' ');

  const yTicks = [60, 120, 240, 360].filter((v) => v >= minY - 10 && v <= maxY + 20);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
      {yTicks.map((v) => (
        <g key={`y-${v}`}>
          <line
            x1={MARGIN.left}
            x2={W - MARGIN.right}
            y1={yFor(v)}
            y2={yFor(v)}
            stroke="var(--color-neutral-200)"
            strokeDasharray="2 4"
          />
          <text
            x={MARGIN.left - 8}
            y={yFor(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="10"
            className="fill-[var(--color-neutral-500)]"
          >
            {v}m
          </text>
        </g>
      ))}

      {points.map((p) => (
        <text
          key={`x-${p.name}`}
          x={xFor(p.shipDate)}
          y={H - MARGIN.bottom + 14}
          textAnchor="middle"
          fontSize="10"
          className="fill-[var(--color-neutral-500)]"
        >
          {p.frameworkVersion}
        </text>
      ))}
      <text
        x={MARGIN.left}
        y={H - 12}
        fontSize="10"
        fontWeight="600"
        className="fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)]"
      >
        framework version →
      </text>
      <text
        x={14}
        y={MARGIN.top + CHART_H / 2}
        transform={`rotate(-90, 14, ${MARGIN.top + CHART_H / 2})`}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        className="fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)]"
      >
        wall clock (min, log)
      </text>

      <line
        x1={auditX}
        x2={auditX}
        y1={MARGIN.top}
        y2={MARGIN.top + CHART_H}
        stroke="var(--color-brand-coral)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <text
        x={auditX + 6}
        y={MARGIN.top + 12}
        fontSize="10"
        fontWeight="600"
        className="fill-[var(--color-brand-coral)]"
      >
        Gemini audit
      </text>

      {t1Points.length > 1 && (
        <path
          d={trendPath}
          fill="none"
          stroke="var(--skill-analytics)"
          strokeWidth="2"
          opacity="0.8"
        />
      )}

      {points.map((p) => {
        const cx = xFor(p.shipDate);
        const cy = yFor(p.wallMinutes);
        const isT1 = p.tier === 'T1';
        return (
          <g key={p.name}>
            <circle
              cx={cx}
              cy={cy}
              r={7}
              fill={isT1 ? 'var(--skill-analytics)' : 'white'}
              stroke={isT1 ? 'var(--skill-analytics)' : 'var(--color-neutral-400)'}
              strokeWidth="1.75"
              strokeDasharray={isT1 ? undefined : '3 3'}
            />
            <text
              x={cx}
              y={cy - 14}
              textAnchor="middle"
              fontSize="11"
              fontWeight={isT1 ? 600 : 400}
              className={
                isT1
                  ? 'fill-[var(--color-neutral-900)] dark:fill-[var(--color-neutral-100)]'
                  : 'fill-[var(--color-neutral-500)]'
              }
            >
              {p.shortLabel}
            </text>
            <text
              x={cx}
              y={cy + 20}
              textAnchor="middle"
              fontSize="9"
              className="fill-[var(--color-neutral-500)]"
            >
              {p.wallMinutes}m · CU {p.cu}
            </text>
          </g>
        );
      })}

      <g transform={`translate(${MARGIN.left}, ${MARGIN.top - 16})`}>
        <circle cx={0} cy={0} r={5} fill="var(--skill-analytics)" />
        <text
          x={10}
          y={3}
          fontSize="10"
          className="fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)]"
        >
          T1 · instrumented (audit-trusted)
        </text>
        <circle
          cx={210}
          cy={0}
          r={5}
          fill="white"
          stroke="var(--color-neutral-400)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <text x={220} y={3} fontSize="10" className="fill-[var(--color-neutral-500)]">
          T3 · narrative estimate (pre-v6.0)
        </text>
      </g>
    </svg>
  );
}

export function FrameworkAdvancement({
  points = ADVANCEMENT_POINTS,
}: {
  points?: AdvancementPoint[];
}) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Escape closes; disable body scroll while modal open; focus close button.
  useEffect(() => {
    if (!expanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  return (
    <>
      <figure
        className="my-10 max-w-[var(--measure-wide)] mx-auto font-sans"
        aria-label="Framework advancement chart — audit-validated feature data points over time"
      >
        <div className="relative group">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Enlarge framework advancement chart"
            className="block w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)] rounded"
          >
            <ChartSvg points={points} />
          </button>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-white/90 dark:bg-[var(--color-neutral-900)]/90 border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-2 py-1 text-[10px] font-sans text-[var(--color-neutral-500)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
          >
            <Maximize2 width={12} height={12} strokeWidth={1.75} />
            click to enlarge
          </span>
        </div>
        <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mx-auto leading-relaxed">
          Framework advancement plotted on the axes the{' '}
          <a href="/trust" className="underline">Gemini audit</a> endorsed: wall clock in
          minutes (Y, log) across framework versions (X). Solid dots = T1 instrumented
          (audit-trusted); dashed outlines = T3 narrative estimates from the pre-v6.0 era
          the audit flagged as unreliable. The trend line connects only T1 points; its
          sparsity is the honest shape of the audit-validated window. Each point is
          labeled with CU (complexity units) for reference. Measurement adoption gap
          tracked at issue #140.{' '}
          <span className="text-[var(--color-neutral-400)]">
            Click the chart to view full-screen.
          </span>
        </figcaption>
      </figure>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="Framework advancement chart (enlarged)"
          >
            <button
              type="button"
              aria-label="Close enlarged chart"
              onClick={() => setExpanded(false)}
              className="absolute inset-0 bg-black/70 dark:bg-black/80 cursor-zoom-out focus:outline-none"
            />
            <motion.div
              className="relative z-10 mx-4 w-full max-w-[1400px] max-h-[92vh] overflow-auto rounded-lg bg-white dark:bg-[var(--color-neutral-900)] p-4 sm:p-8 shadow-2xl"
              initial={reduced ? { scale: 1 } : { scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? { scale: 1 } : { scale: 0.96, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Close enlarged chart"
                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md p-2 text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] hover:bg-[var(--color-neutral-100)] dark:hover:text-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-indigo)]"
              >
                <X width={20} height={20} strokeWidth={1.75} />
              </button>
              <div className="pt-2 pb-4 pr-8">
                <h2 className="font-serif text-xl">
                  Framework advancement — audit-validated window
                </h2>
                <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                  Press <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">Esc</kbd> or click outside to close.
                </p>
              </div>
              <ChartSvg points={points} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
