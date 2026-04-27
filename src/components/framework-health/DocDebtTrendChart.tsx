'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { DocumentationDebt } from '@/lib/framework-health/load-ledgers';

interface Props {
  debt: DocumentationDebt;
}

const FIELD_LABELS: Record<string, string> = {
  date_written: 'Date written',
  work_type: 'Work type',
  dispatch_pattern: 'Dispatch pattern',
  success_metrics: 'Success metrics',
  kill_criteria: 'Kill criteria',
  state_case_study_linkage: 'State ↔ case study',
};

function barColor(percent: number): string {
  if (percent >= 95) return '#10B981'; // green
  if (percent >= 80) return '#F59E0B'; // amber
  return '#EF4444'; // red
}

export function DocDebtTrendChart({ debt }: Props) {
  const { coverage, summary } = debt;

  const data = Object.entries(coverage).map(([key, val]) => ({
    field: FIELD_LABELS[key] ?? key,
    percent: val.percent,
    present: val.present,
    missing: val.missing,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-sans ${
            summary.trend_ready
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              summary.trend_ready ? 'bg-green-500' : 'bg-amber-500'
            }`}
            aria-hidden="true"
          />
          {summary.trend_ready ? 'Trend ready' : 'Trend locked — awaiting 3 cycle snapshots'}
        </span>
        <span className="text-xs text-[var(--color-neutral-500)] font-sans">
          {summary.open_debt_items} open debt item{summary.open_debt_items !== 1 ? 's' : ''} ·{' '}
          {summary.case_studies_scanned} case studies scanned
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-neutral-200)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: 'var(--color-neutral-600)' }}
          />
          <YAxis
            type="category"
            dataKey="field"
            width={120}
            tick={{ fontSize: 11, fill: 'var(--color-neutral-600)' }}
          />
          <Tooltip
            formatter={(value, _name, props) => {
              const numVal = typeof value === 'number' ? value : Number(value);
              const entry = props?.payload as { present?: number; missing?: number } | undefined;
              return [
                `${numVal.toFixed(1)}% (${entry?.present ?? '?'} present, ${entry?.missing ?? '?'} missing)`,
                'Coverage',
              ];
            }}
            contentStyle={{
              fontSize: 12,
              background: 'var(--color-neutral-50)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '6px',
            }}
          />
          <Bar dataKey="percent" radius={[0, 3, 3, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor(entry.percent)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-[var(--color-neutral-500)] mt-2 font-sans">
        Case-study field coverage across {summary.case_studies_scanned} studies. Green ≥ 95%, amber ≥ 80%, red &lt; 80%.
      </p>
    </div>
  );
}
