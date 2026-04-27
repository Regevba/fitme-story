'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AdoptionSnapshot } from '@/lib/framework-health/load-ledgers';

interface Props {
  snapshots: AdoptionSnapshot[];
}

interface ChartPoint {
  date: string;
  timing_wall_time: number;
  per_phase_timing: number;
  cache_hits: number;
  cu_v2: number;
}

const SERIES = [
  { key: 'timing_wall_time', label: 'Wall time', color: '#4F46E5' },
  { key: 'per_phase_timing', label: 'Per-phase timing', color: '#8B5CF6' },
  { key: 'cache_hits', label: 'Cache hits', color: '#F59E0B' },
  { key: 'cu_v2', label: 'CU v2', color: '#10B981' },
] as const;

function formatDate(iso: string): string {
  // "2026-04-25" → "Apr 25"
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function AdoptionTrendChart({ snapshots }: Props) {
  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg border border-dashed border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] text-sm text-[var(--color-neutral-500)]">
        No adoption history snapshots yet — trend unlocks after 3+ daily snapshots.
      </div>
    );
  }

  const data: ChartPoint[] = snapshots.map((s) => ({
    date: formatDate(s.date),
    timing_wall_time: s.dimension_coverage.timing_wall_time.post_v6_percent,
    per_phase_timing: s.dimension_coverage.per_phase_timing.post_v6_percent,
    cache_hits: s.dimension_coverage.cache_hits.post_v6_percent,
    cu_v2: s.dimension_coverage.cu_v2.post_v6_percent,
  }));

  const trendReady = snapshots.length >= 3;

  return (
    <div>
      {!trendReady && (
        <p className="text-xs text-[var(--color-neutral-500)] mb-3">
          {snapshots.length} of 3 snapshots collected — trend line visible but not yet statistically meaningful.
        </p>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--color-neutral-600)' }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12, fill: 'var(--color-neutral-600)' }}
            width={45}
          />
          <Tooltip
            formatter={(value, name) => {
              const numVal = typeof value === 'number' ? value : Number(value);
              const s = SERIES.find((s) => s.key === name);
              return [`${numVal.toFixed(1)}%`, s?.label ?? String(name)];
            }}
            contentStyle={{
              fontSize: 12,
              background: 'var(--color-neutral-50)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '6px',
            }}
          />
          <Legend
            formatter={(value) => {
              const s = SERIES.find((s) => s.key === value);
              return s?.label ?? value;
            }}
            wrapperStyle={{ fontSize: 12 }}
          />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-[var(--color-neutral-500)] mt-2">
        Post-v6 adoption % (features shipped after 2026-04-16). 4 measurement dimensions tracked per feature.
      </p>
    </div>
  );
}
