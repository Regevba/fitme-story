'use client';

import { ADVANCEMENT_POINTS, GEMINI_AUDIT_DATE, type AdvancementPoint } from '@/lib/framework-advancement-data';

// Multi-line trend chart. Each "line" is one feature's trajectory from start
// (implied via wall minutes) to its ship date. Y axis = wall minutes (a
// normalized advancement proxy because raw CU ranges from ~1 to ~28 and is
// not directly comparable across feature types). Tier labeling distinguishes
// audit-validated T1 data from pre-v6.0 T3 narrative estimates.

const W = 820;
const H = 380;
const MARGIN = { top: 32, right: 24, bottom: 56, left: 56 };
const CHART_W = W - MARGIN.left - MARGIN.right;
const CHART_H = H - MARGIN.top - MARGIN.bottom;

function daysBetween(a: string, b: string): number {
  return (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24);
}

export function FrameworkAdvancement({ points = ADVANCEMENT_POINTS }: { points?: AdvancementPoint[] }) {
  const dates = points.map((p) => p.shipDate).sort();
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  const totalDays = daysBetween(maxDate, minDate);

  // Y is log-scale minutes because the feature span is 54 → 390.
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

  const t1Points = points.filter((p) => p.tier === 'T1').sort((a, b) => a.shipDate.localeCompare(b.shipDate));
  const auditX = xFor(GEMINI_AUDIT_DATE);

  // Build trend-line path through T1 points only (audit-validated segments).
  const trendPath = t1Points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.shipDate)} ${yFor(p.wallMinutes)}`)
    .join(' ');

  // Y-axis ticks at common round numbers within range.
  const yTicks = [60, 120, 240, 360].filter((v) => v >= minY - 10 && v <= maxY + 20);

  return (
    <figure
      className="my-10 max-w-[var(--measure-wide)] mx-auto font-sans"
      aria-label="Framework advancement chart — audit-validated feature data points over time"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
        {/* Y-axis gridlines + labels */}
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

        {/* X-axis date labels — one per version milestone */}
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

        {/* Audit date marker */}
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

        {/* Trend line through T1 points only */}
        {t1Points.length > 1 && (
          <path
            d={trendPath}
            fill="none"
            stroke="var(--skill-analytics)"
            strokeWidth="2"
            opacity="0.8"
          />
        )}

        {/* Data points */}
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

        {/* Legend */}
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top - 16})`}>
          <circle cx={0} cy={0} r={5} fill="var(--skill-analytics)" />
          <text x={10} y={3} fontSize="10" className="fill-[var(--color-neutral-700)] dark:fill-[var(--color-neutral-300)]">
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
      <figcaption className="mt-4 text-xs text-center text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mx-auto leading-relaxed">
        Framework advancement plotted on the axes the{' '}
        <a href="/trust" className="underline">Gemini audit</a> endorsed: wall clock in
        minutes (Y, log) across framework versions (X). Solid dots = T1 instrumented
        (audit-trusted); dashed outlines = T3 narrative estimates from the pre-v6.0 era
        the audit flagged as unreliable. The trend line connects only T1 points; its
        sparsity is the honest shape of the audit-validated window. Each point is
        labeled with CU (complexity units) for reference. Measurement adoption gap
        tracked at issue #140.
      </figcaption>
    </figure>
  );
}
