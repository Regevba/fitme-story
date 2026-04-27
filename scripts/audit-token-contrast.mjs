#!/usr/bin/env node
// scripts/audit-token-contrast.mjs
//
// Task T16 of the unified-control-center migration. Computes WCAG 2.1
// contrast ratios for every fitme-story token pair the control-room
// route will use (per .claude/features/unified-control-center/token-map.md).
//
// We don't pull in axe-core here because axe operates on rendered DOM —
// we're auditing color values, not page accessibility. WCAG contrast is
// pure math (sRGB linearization + relative luminance), so the script is
// self-contained with no dependencies.
//
// Usage:
//   node scripts/audit-token-contrast.mjs           # text report
//   node scripts/audit-token-contrast.mjs --json    # machine-readable
//
// Exit codes:
//   0 — all pairs pass their declared WCAG target
//   1 — any pair fails its declared target
//
// Targets per WCAG 2.1:
//   AA  normal text (<18pt, <14pt bold) — 4.5 : 1
//   AA  large text (>=18pt or >=14pt bold) + UI / non-text — 3.0 : 1
//   AAA normal text — 7.0 : 1
//
// Each pair declares its target so the audit reflects real usage:
// chip text uses AA-large (3:1), body text uses AA-normal (4.5:1), etc.

const TARGETS = {
  AA_normal: 4.5,
  AA_large: 3.0,
  AAA_normal: 7.0,
};

// ── Color math ──────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [
    parseInt(n.substring(0, 2), 16),
    parseInt(n.substring(2, 4), 16),
    parseInt(n.substring(4, 6), 16),
  ];
}

function srgbToLinear(c8) {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hexA, hexB) {
  const La = relativeLuminance(hexA);
  const Lb = relativeLuminance(hexB);
  const lighter = Math.max(La, Lb);
  const darker = Math.min(La, Lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Token map — pairs the control-room will render ──────────────────
//
// `target` is the WCAG ratio threshold this usage must clear. Different
// usages have different targets; declare per pair so the audit reflects
// reality (a status icon doesn't need 4.5:1; a paragraph does).
//
// `kind` is metadata for the report grouping.

// Audited pairs reflect what the control-room dashboard ACTUALLY uses
// AFTER the T17 resolutions land (deprecated patterns are documented in
// token-map.md as forbidden and not re-audited here — that would just be
// asserting "this combination still fails," which the docs already say).
//
// All pairs here MUST pass their target. CI exit 1 = broken contract.
const PAIRS = [
  // ── Sanity baselines (showcase-shared tokens used by dashboard too) ─
  { kind: 'sanity', mode: 'light', usage: 'body text',
    fg: '--color-neutral-900', fgHex: '#1C1917',
    bg: '--color-neutral-50',  bgHex: '#FAFAF9',
    target: TARGETS.AA_normal },
  { kind: 'sanity', mode: 'dark', usage: 'body text',
    fg: '--color-neutral-100', fgHex: '#F5F5F4',
    bg: '--color-neutral-900', bgHex: '#1C1917',
    target: TARGETS.AA_normal },
  // Pattern C reroute: dashboard uses neutral-700 (not neutral-500) for
  // muted text to avoid the showcase-wide 4.40:1 issue.
  { kind: 'sanity', mode: 'light', usage: 'muted text (rerouted to neutral-700)',
    fg: '--color-neutral-700', fgHex: '#44403C',
    bg: '--color-neutral-100', bgHex: '#F5F5F4',
    target: TARGETS.AA_normal },

  // ── Brand colors (text/link use) ───────────────────────────────────
  { kind: 'brand', mode: 'light', usage: 'link text',
    fg: '--color-brand-indigo', fgHex: '#4F46E5',
    bg: '--color-neutral-50',   bgHex: '#FAFAF9',
    target: TARGETS.AA_normal },
  { kind: 'brand', mode: 'dark', usage: 'link text',
    fg: '--color-brand-indigo (dark)', fgHex: '#818CF8',
    bg: '--color-neutral-900',         bgHex: '#1C1917',
    target: TARGETS.AA_normal },
  { kind: 'brand', mode: 'dark', usage: 'accent text',
    fg: '--color-brand-coral (dark)', fgHex: '#FDA29B',
    bg: '--color-neutral-900',        bgHex: '#1C1917',
    target: TARGETS.AA_normal },
  // Note: --color-brand-coral as accent text on light is FORBIDDEN per
  // token-map.md Pattern B usage constraint. Reserved for buttons/
  // headlines. Not audited here.

  // ── Status colors (PM phase semantic) ──────────────────────────────
  // Light mode: foreground use → text-grade --cr-*-text-light variants.
  // Dark mode: foreground use → original --skill-* (already passes).
  // Background-fill use (white text on chip): see bg-fill section.
  { kind: 'status-text', mode: 'light', usage: 'phase chip text on neutral-50',
    fg: '--cr-status-implementing-text-light', fgHex: '#0369A1',
    bg: '--color-neutral-50',                  bgHex: '#FAFAF9',
    target: TARGETS.AA_normal },
  { kind: 'status-text', mode: 'light', usage: 'phase chip text on neutral-50',
    fg: '--cr-status-done-text-light', fgHex: '#047857',
    bg: '--color-neutral-50',          bgHex: '#FAFAF9',
    target: TARGETS.AA_normal },
  { kind: 'status-text', mode: 'light', usage: 'phase chip text on neutral-50',
    fg: '--skill-ux (also passes -500)', fgHex: '#D946EF',
    bg: '--color-neutral-50',            bgHex: '#FAFAF9',
    target: TARGETS.AA_large },
  { kind: 'status-text', mode: 'dark', usage: 'phase chip text on neutral-900',
    fg: '--skill-dev', fgHex: '#0EA5E9',
    bg: '--color-neutral-900', bgHex: '#1C1917',
    target: TARGETS.AA_large },
  { kind: 'status-text', mode: 'dark', usage: 'phase chip text on neutral-900',
    fg: '--skill-ux', fgHex: '#D946EF',
    bg: '--color-neutral-900', bgHex: '#1C1917',
    target: TARGETS.AA_large },
  { kind: 'status-text', mode: 'dark', usage: 'phase chip text on neutral-900',
    fg: '--skill-release', fgHex: '#10B981',
    bg: '--color-neutral-900', bgHex: '#1C1917',
    target: TARGETS.AA_large },

  // ── Priority colors (urgency semantic) ─────────────────────────────
  { kind: 'priority-text', mode: 'light', usage: 'priority chip text on neutral-50',
    fg: '--skill-cx (also passes -500)', fgHex: '#F43F5E',
    bg: '--color-neutral-50',            bgHex: '#FAFAF9',
    target: TARGETS.AA_large },
  { kind: 'priority-text', mode: 'light', usage: 'priority chip text on neutral-50',
    fg: '--cr-priority-high-text-light', fgHex: '#B45309',
    bg: '--color-neutral-50',            bgHex: '#FAFAF9',
    target: TARGETS.AA_normal },
  { kind: 'priority-text', mode: 'light', usage: 'priority chip text on neutral-50',
    fg: '--cr-priority-medium-text-light', fgHex: '#92400E',
    bg: '--color-neutral-50',              bgHex: '#FAFAF9',
    target: TARGETS.AA_normal },
  { kind: 'priority-text', mode: 'dark', usage: 'priority chip text on neutral-900',
    fg: '--skill-cx', fgHex: '#F43F5E',
    bg: '--color-neutral-900', bgHex: '#1C1917',
    target: TARGETS.AA_large },
  { kind: 'priority-text', mode: 'dark', usage: 'priority chip text on neutral-900',
    fg: '--skill-research', fgHex: '#F59E0B',
    bg: '--color-neutral-900', bgHex: '#1C1917',
    target: TARGETS.AA_large },

  // ── Background-fill chips (white text on color BG) ─────────────────
  // The lighter -500 colors (sky/emerald/amber) fail when used as a
  // chip background with white text — instead use the -700 variants
  // (same hex as the *-text-light tokens, semantically reused).
  // The deeper -500 colors (rose/fuchsia) already pass white-on-fill.
  { kind: 'bg-fill', mode: 'light', usage: 'white text on filled chip',
    fg: '#FFFFFF', fgHex: '#FFFFFF',
    bg: '--skill-cx (rose, passes at -500)', bgHex: '#F43F5E',
    target: TARGETS.AA_large },
  { kind: 'bg-fill', mode: 'light', usage: 'white text on filled chip',
    fg: '#FFFFFF', fgHex: '#FFFFFF',
    bg: '--skill-ux (fuchsia, passes at -500)', bgHex: '#D946EF',
    target: TARGETS.AA_large },
  { kind: 'bg-fill', mode: 'light', usage: 'white text on filled chip',
    fg: '#FFFFFF', fgHex: '#FFFFFF',
    bg: '--cr-status-implementing-text-light (sky-700, reused as bg)', bgHex: '#0369A1',
    target: TARGETS.AA_large },
  { kind: 'bg-fill', mode: 'light', usage: 'white text on filled chip',
    fg: '#FFFFFF', fgHex: '#FFFFFF',
    bg: '--cr-status-done-text-light (emerald-700, reused as bg)', bgHex: '#047857',
    target: TARGETS.AA_large },
  { kind: 'bg-fill', mode: 'light', usage: 'white text on filled chip',
    fg: '#FFFFFF', fgHex: '#FFFFFF',
    bg: '--cr-priority-high-text-light (amber-700, reused as bg)', bgHex: '#B45309',
    target: TARGETS.AA_large },
  { kind: 'bg-fill', mode: 'light', usage: 'white text on filled chip',
    fg: '#FFFFFF', fgHex: '#FFFFFF',
    bg: '--cr-priority-medium-text-light (amber-800, reused as bg)', bgHex: '#92400E',
    target: TARGETS.AA_large },
];

// ── Run ─────────────────────────────────────────────────────────────
const isJson = process.argv.includes('--json');

const results = PAIRS.map(p => {
  const ratio = contrastRatio(p.fgHex, p.bgHex);
  const passes = ratio >= p.target;
  return { ...p, ratio, passes };
});

const failures = results.filter(r => !r.passes);

if (isJson) {
  console.log(JSON.stringify({
    audited_at: new Date().toISOString(),
    total: results.length,
    passing: results.length - failures.length,
    failing: failures.length,
    results,
  }, null, 2));
} else {
  const colorPass = s => `\x1b[32m${s}\x1b[0m`;
  const colorFail = s => `\x1b[31m${s}\x1b[0m`;
  const colorDim  = s => `\x1b[2m${s}\x1b[0m`;

  // Group by kind for readability.
  const byKind = {};
  for (const r of results) (byKind[r.kind] ||= []).push(r);

  console.log(`\nWCAG 2.1 contrast audit — control-room token map`);
  console.log(`Audited ${results.length} pairs across ${Object.keys(byKind).length} categories.\n`);

  for (const [kind, rows] of Object.entries(byKind)) {
    console.log(`  ${kind}`);
    for (const r of rows) {
      const status = r.passes ? colorPass('PASS') : colorFail('FAIL');
      const ratioStr = r.ratio.toFixed(2).padStart(5);
      const targetStr = r.target.toFixed(1);
      const modeStr = `[${r.mode}]`.padEnd(7);
      console.log(
        `    ${status} ${modeStr} ${ratioStr}:1 ` +
        `(needs ${targetStr}:1) — ${r.fg} on ${r.bg}` +
        colorDim(`  (${r.usage})`)
      );
    }
    console.log('');
  }

  if (failures.length === 0) {
    console.log(colorPass(`✓ all ${results.length} pairs pass their target.\n`));
  } else {
    console.log(colorFail(`✗ ${failures.length} of ${results.length} pairs fail their target.`));
    console.log(`  Resolution path: T17 — either pick a darker/lighter shade in the`);
    console.log(`  fitme-story palette, OR define a one-off --cr-* override scoped to`);
    console.log(`  [data-cr-root] in the dashboard layout CSS. Do NOT modify shared`);
    console.log(`  --color-* or --skill-* tokens (per PRD §6 — no leak into showcase).\n`);
  }
}

process.exit(failures.length > 0 ? 1 : 0);
