export type LucideIconName =
  | 'Smartphone'
  | 'RefreshCw'
  | 'ShieldCheck'
  | 'Compass';

export interface OriginBeat {
  title: string;
  body: string;
  visual:
    | { kind: 'metric'; value: string; label: string }
    | { kind: 'lucide'; icon: LucideIconName };
}

export const ORIGIN_BEATS: OriginBeat[] = [
  {
    title: 'This started as a personal project.',
    body: "I wanted a faster, simpler way to track my own fitness and wellbeing — and to keep that data private, on-device, and mine. What grew out of it was bigger than the app.",
    visual: { kind: 'lucide', icon: 'Smartphone' },
  },
  {
    title: 'Building the app kept surfacing the same planning mistakes.',
    body: "Missed edge cases. Skipped research. Ship-first-measure-later. I was fast and wrong, a lot.",
    visual: { kind: 'lucide', icon: 'RefreshCw' },
  },
  {
    title: 'Privacy-first, on-device, owned by the user.',
    body: "Every byte of health data stays local unless the user explicitly shares it. No cloud AI round-trips. Analysis happens on-device when possible, by design.",
    visual: { kind: 'lucide', icon: 'ShieldCheck' },
  },
  {
    title: 'So I built /pm-workflow — one command, nine phases.',
    body: "Research → PRD → Tasks → UX → Implement → Test → Review → Merge → Docs. The workflow enforced what I wouldn't.",
    visual: { kind: 'metric', value: '9', label: 'phases' },
  },
  {
    title: 'Then the workflow itself started evolving.',
    body: "Each feature ran through it. Each run exposed gaps. The framework grew to close them: caches, evals, dispatch intelligence, measurement.",
    visual: { kind: 'metric', value: '8', label: 'framework versions' },
  },
  {
    title: 'By V7.0 it was measuring itself and routing to hardware-aware models.',
    body: "Phase timing instrumented. Cache hit rates tracked. Chip-affinity maps for model selection. The tool had learned to profile its own work.",
    visual: { kind: 'metric', value: '17', label: 'chip profiles' },
  },
  {
    title: '16 features shipped. All documented. All honest — even the failures.',
    body: "185 audit findings, 12 critical, published in a public showcase repo. No triumphant narrative without the regressions.",
    visual: { kind: 'metric', value: '185', label: 'audit findings' },
  },
  {
    title: 'This site is the guided tour. The timeline is below.',
    body: '↓',
    visual: { kind: 'lucide', icon: 'Compass' },
  },
];
