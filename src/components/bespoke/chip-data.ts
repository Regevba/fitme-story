export const CHIPS = [
  'Apple M1', 'Apple M1 Pro', 'Apple M1 Max', 'Apple M2', 'Apple M2 Pro', 'Apple M2 Max',
  'Apple M3', 'Apple M3 Pro', 'Apple M3 Max', 'Apple M4', 'Apple M4 Pro', 'Apple M4 Max',
  'Apple M5', 'Apple M5 Pro', 'Apple M5 Max', 'Intel Xeon Gen4', 'AMD EPYC 9004',
] as const;

export const CLOUD_SIGNATURES = [
  'AWS c7g.large', 'AWS m7i.xlarge', 'GCP c3-standard-4', 'GCP n2-standard-4',
  'Azure Dls4 v5', 'Vercel Edge runtime', 'Fly.io shared-cpu-1x',
] as const;

// Affinity score [0–1] per chip × signature (deterministic seed for reproducibility)
export const AFFINITY: number[][] = CHIPS.map((_, i) =>
  CLOUD_SIGNATURES.map((_, j) => {
    const seed = (i * 7 + j * 11) % 100;
    return Number(((seed / 100) * 0.6 + 0.3).toFixed(2));
  }),
);
