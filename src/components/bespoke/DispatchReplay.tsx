'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, ArrowRight } from 'lucide-react';
import { FLOORS } from './blueprint-data';
import { TRACES, type FloorState, type Trace, type TraceBeat } from './dispatch-traces';

const AUTOPLAY_MS = 2500;

type Props = {
  traceId?: string;             // default: first trace
  allowTraceSwitch?: boolean;   // default: true
};

function Floor({
  floor,
  state,
}: {
  floor: (typeof FLOORS)[number];
  state: FloorState;
}) {
  const reduced = useReducedMotion();
  const isFiring = state === 'firing';
  const isDormant = state === 'dormant';
  const isDone = state === 'done';

  const opacity = isDormant ? 0.35 : 1;
  const glow = isFiring ? `0 0 0 2px ${floor.accent}, 0 0 24px ${floor.accent}55` : 'none';

  return (
    <motion.li
      animate={reduced ? { opacity } : { opacity, boxShadow: glow, scale: isFiring ? 1.015 : 1 }}
      transition={{ duration: reduced ? 0 : 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-5 bg-white dark:bg-[var(--color-neutral-900)] transition-colors"
      style={{
        borderLeft: `6px solid ${floor.accent}`,
        backgroundColor: isFiring ? `${floor.accent}18` : undefined,
      }}
    >
      <div className="flex items-baseline gap-4 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">Floor {floor.level}</span>
        <span className="font-serif text-xl">{floor.name}</span>
        <span className="text-sm text-[var(--color-neutral-500)]">{floor.sub}</span>
        <span className="ml-auto text-xs font-sans uppercase tracking-wider">
          {isFiring && <span className="text-[var(--color-brand-coral)]">▸ executing</span>}
          {isDone && <span className="text-[var(--color-neutral-500)]">✓ done</span>}
          {isDormant && <span className="text-[var(--color-neutral-500)]">— dormant —</span>}
        </span>
      </div>
    </motion.li>
  );
}

export function DispatchReplay({ traceId, allowTraceSwitch = true }: Props) {
  const reduced = useReducedMotion();
  const initial = TRACES.find((t) => t.id === traceId) ?? TRACES[0];
  const [trace, setTrace] = useState<Trace>(initial);
  const [beatIndex, setBeatIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const beatRefs = useRef<(HTMLElement | null)[]>([]);
  const beat: TraceBeat = trace.beats[beatIndex];

  // Reset when trace changes
  useEffect(() => {
    setBeatIndex(0);
    setPlaying(false);
  }, [trace.id]);

  // Auto-play interval
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setBeatIndex((i) => {
        const next = i + 1;
        if (next >= trace.beats.length) {
          setPlaying(false);
          return trace.beats.length - 1;
        }
        return next;
      });
    }, reduced ? 800 : AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing, trace.beats.length, reduced]);

  // Scroll-driven: as each beat anchor enters view, sync beatIndex (unless user is auto-playing)
  useEffect(() => {
    if (playing) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => Number(e.target.getAttribute('data-beat') ?? -1))
          .filter((n) => n >= 0);
        if (visible.length > 0) {
          const closest = Math.min(...visible);
          setBeatIndex(closest);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 },
    );
    beatRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [trace.id, playing]);

  const floorOrdered = [...FLOORS]; // 6 → 1 as authored; render bottom-up via flex-col-reverse

  const jumpToBeat = useCallback(
    (i: number) => {
      setBeatIndex(i);
      setPlaying(false);
      beatRefs.current[i]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    },
    [reduced],
  );

  return (
    <div className="my-12 max-w-5xl mx-auto font-sans" aria-label={`Dispatch replay — ${trace.title}`}>
      {/* Trace switcher + autoplay pill */}
      <div className="sticky top-4 z-20 mb-8 flex items-center justify-between gap-4 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] rounded-full border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-4 py-2 shadow-sm">
        {allowTraceSwitch && TRACES.length > 1 ? (
          <div className="flex gap-1 text-sm">
            {TRACES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTrace(t)}
                aria-pressed={t.id === trace.id}
                className={`px-3 py-2 min-h-[44px] rounded-full transition-colors ${
                  t.id === trace.id
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]'
                }`}
              >
                {t.id === 'sprint-i' ? 'Sprint I' : 'fitme-story'}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sm text-[var(--color-neutral-500)]">{trace.title}</span>
        )}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause auto-play' : 'Auto-play'}
          className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-full bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          <span>{playing ? 'Pause' : 'Auto-play'}</span>
        </button>
      </div>

      {/* Title row */}
      <header className="mb-6">
        <h3 className="font-serif text-2xl leading-tight">{trace.title}</h3>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{trace.subtitle}</p>
      </header>

      <div className="grid md:grid-cols-[1fr_18rem] gap-8">
        {/* Floors (sticky) */}
        <div className="md:sticky md:top-28 self-start">
          <ol className="flex flex-col-reverse gap-px">
            {floorOrdered.map((f) => (
              <Floor key={f.level} floor={f} state={beat.floorStates[f.level] ?? 'idle'} />
            ))}
          </ol>
        </div>

        {/* Beat stack — scroll-driven */}
        <div>
          <ol className="space-y-4">
            {trace.beats.map((b, i) => {
              const isCurrent = i === beatIndex;
              return (
                <li
                  key={b.id}
                  ref={(el) => {
                    beatRefs.current[i] = el;
                  }}
                  data-beat={i}
                  className={`rounded-lg border p-4 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'border-[var(--color-brand-coral)] bg-[color-mix(in_srgb,var(--color-brand-coral)_6%,transparent)]'
                      : 'border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]'
                  }`}
                  onClick={() => jumpToBeat(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      jumpToBeat(i);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
                      Beat {i + 1} of {trace.beats.length}
                    </span>
                    {isCurrent && <span className="text-xs text-[var(--color-brand-coral)] font-medium">playing</span>}
                  </div>
                  <h4 className="mt-1 font-serif text-base leading-tight">{b.title}</h4>
                  <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">{b.narrative}</p>
                  {b.metrics && (
                    <ul className="mt-3 flex flex-wrap gap-3 text-xs">
                      {b.metrics.map((m, mi) => (
                        <li key={mi} className="px-2 py-1 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">
                          <span className="font-semibold">{m.value}</span>
                          <span className="text-[var(--color-neutral-500)] ml-1">{m.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {b.flow && b.flow.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs text-[var(--color-neutral-500)]">
                      {b.flow.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2">
                          <span>Floor {f.from}</span>
                          <ArrowRight size={12} />
                          <span>Floor {f.to}</span>
                          <span className="italic">— {f.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-6 text-sm">
            <a href={trace.sourceRef.href} className="underline hover:text-[var(--color-brand-indigo)]">
              {trace.sourceRef.label}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
