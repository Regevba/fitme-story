'use client';

import { Fragment, useState } from 'react';
import { CHIPS, CLOUD_SIGNATURES, AFFINITY } from './chip-data';

function heatColor(score: number): string {
  const h = Math.round(240 - score * 240);
  return `hsl(${h}, 70%, ${60 - score * 25}%)`;
}

export function ChipAffinityMap() {
  const [hover, setHover] = useState<{ chip: number; sig: number } | null>(null);

  return (
    <div className="my-12 overflow-x-auto font-sans text-xs" aria-label="Chip-to-cloud affinity map">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `12rem repeat(${CLOUD_SIGNATURES.length}, 6rem)` }}>
        <div />
        {CLOUD_SIGNATURES.map((sig) => (
          <div key={sig} className="p-2 text-center font-medium">{sig}</div>
        ))}
        {CHIPS.map((chip, i) => (
          <Fragment key={chip}>
            <div className="p-2 font-medium flex items-center">{chip}</div>
            {CLOUD_SIGNATURES.map((_, j) => {
              const score = AFFINITY[i][j];
              const isHover = hover?.chip === i && hover?.sig === j;
              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  onMouseEnter={() => setHover({ chip: i, sig: j })}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover({ chip: i, sig: j })}
                  onBlur={() => setHover(null)}
                  className={`rounded p-2 text-center transition-transform ${isHover ? 'scale-110 ring-2 ring-[var(--color-brand-indigo)]' : ''}`}
                  style={{ backgroundColor: heatColor(score), color: score > 0.7 ? 'white' : 'black' }}
                  aria-label={`${CHIPS[i]} × ${CLOUD_SIGNATURES[j]}: affinity ${score}`}
                >
                  {score}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
      {hover && (
        <div className="mt-4 p-3 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">
          <strong>{CHIPS[hover.chip]}</strong> × <em>{CLOUD_SIGNATURES[hover.sig]}</em> — affinity score <strong>{AFFINITY[hover.chip][hover.sig]}</strong>
        </div>
      )}
    </div>
  );
}
