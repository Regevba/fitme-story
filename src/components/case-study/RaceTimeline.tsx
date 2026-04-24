interface TimelineEvent {
  t: number;          // ms offset from start
  label: string;      // "write user.name = 'A'"
  detail?: string;    // optional secondary text
}

interface Lane {
  label: string;
  colorVar?: string;
  events: TimelineEvent[];
}

interface Props {
  lanes?: Lane[];
  lanesJson?: string;
  collisionAt?: number;    // ms offset where the race condition resolves
  collisionLabel?: string; // "Last writer wins — silent data loss"
  maxMs?: number;          // total timeline width in ms; defaults to max event time
  caption?: string;
}

export function RaceTimeline({ lanes, lanesJson, collisionAt, collisionLabel, maxMs, caption }: Props) {
  const data: Lane[] =
    lanes ?? (lanesJson ? (JSON.parse(lanesJson) as Lane[]) : []);
  if (data.length === 0) return null;

  const totalMs = maxMs ?? Math.max(...data.flatMap((l) => l.events.map((e) => e.t))) + 100;

  return (
    <figure
      className="my-10 max-w-[var(--measure-wide)] mx-auto font-sans"
      aria-label={`Race timeline across ${data.length} lanes`}
    >
      <div className="space-y-6">
        {data.map((lane) => {
          const accent = lane.colorVar ?? 'var(--color-brand-indigo)';
          return (
            <div key={lane.label}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
                {lane.label}
              </div>
              <div
                className="relative h-16 rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)]"
              >
                {/* Baseline */}
                <div
                  aria-hidden="true"
                  className="absolute left-0 right-0 top-1/2 h-px bg-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-700)]"
                />
                {/* Events */}
                {lane.events.map((ev, i) => {
                  const leftPct = (ev.t / totalMs) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                      style={{ left: `${leftPct}%` }}
                    >
                      <div
                        className="h-3 w-3 rounded-full border-2 border-white dark:border-[var(--color-neutral-900)]"
                        style={{ background: accent }}
                        aria-hidden="true"
                      />
                      <div className="absolute top-5 whitespace-nowrap text-[10px] leading-tight text-center">
                        <span className="text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-200)] font-semibold">
                          {ev.label}
                        </span>
                        {ev.detail && (
                          <span className="block text-[var(--color-neutral-500)]">{ev.detail}</span>
                        )}
                        <span className="block font-mono text-[var(--color-neutral-500)]">t={ev.t}ms</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {collisionAt != null && (
        <div className="mt-10 relative">
          <div
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-[var(--color-brand-coral)]"
            style={{ left: `${(collisionAt / totalMs) * 100}%` }}
            aria-hidden="true"
          />
          <div
            className="absolute -top-3 text-xs font-semibold text-[var(--color-brand-coral)]"
            style={{ left: `calc(${(collisionAt / totalMs) * 100}% + 8px)` }}
          >
            ⚠ {collisionLabel ?? 'Race condition resolves here'}
          </div>
          <div className="h-6" />
        </div>
      )}

      {caption && (
        <figcaption className="mt-6 text-xs text-center text-[var(--color-neutral-500)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
