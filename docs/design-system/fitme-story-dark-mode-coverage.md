# fitme-story Dark-Mode Coverage Matrix

**Created:** 2026-05-10
**Last audited:** 2026-05-26 (C10 sync — 3 manifest flips: AuditEventRow + AuditLogPanel + DevicesTable now `darkModeStatus: 'Designed'`)
**Source of truth:** [`src/lib/design-system.ts`](../../src/lib/design-system.ts) → `darkModeStatus` field per component

> Per the v6.0 design-tokens convention + audit A-018 (2026-05-08): every public component must pass WCAG AA contrast (4.5:1 body, 3.0:1 large text) in BOTH Light AND Dark mode. This matrix tracks which components have been intentionally **designed** for Dark mode vs. relying on automatic token swap vs. needing attention.

---

## Status legend

| Status | Symbol | Meaning |
|---|---|---|
| **Designed** | ◐ | Light + Dark have explicit visual treatment. Verified manually (or via per-component preview on `/design-system` Part 2). |
| **AutoDerived** | ◑ | Component composes from tokens that handle Light + Dark via the `html.dark` override block in `globals.css`. No separate Dark frame needed. |
| **NotApplicable** | — | Component is mode-agnostic (e.g., admin-only screens that always render in a fixed theme). |
| **TODO** | ✗ | Needs explicit Dark-mode design work. Currently relies on token swap which may have contrast / legibility gaps. |

---

## Summary (auto-computed from manifest)

- **Total components:** 31
- **Designed:** 21 (68%)
- **AutoDerived:** 6 (19%)
- **NotApplicable:** 0
- **TODO:** 4 (13%)

**Public-component breakdown (excludes Internal):**

- Public total: 17
- Designed: 17 (100%)
- AutoDerived: 0
- TODO: 0

**All 4 remaining TODO entries are Internal control-room components** (FeatureCard, TaskCard, TaskTree, AlertsBanner). The 4 Internal components in the UCC passkey-auth path (AuthPasskeyForm, DevicesTable, AuditEventRow, AuditLogPanel) were verified 2026-05-16 (contrast measurements in the Internal table below) and the manifest flips landed 2026-05-26 (this audit, completing C10 of the UI/UX Master Plan). Per the Internal-deferral policy codified in `src/lib/design-system.ts`, Dark-mode treatment of Internal surfaces follows code-first design — designers don't iterate visually in Figma. The TODO flag here means: contrast spot-check still pending; not a P0 because operator surfaces have a smaller user surface area + are gated behind UCC auth.

---

## Public components — full Dark coverage

All 17 public components have explicit Light + Dark visual treatment:

| Component | Category | Dark Status | Light Figma | Dark Figma | Notes |
|---|---|---|---|---|---|
| Button | primitive | ◐ Designed | 5-4 / 5-6 / 5-8 | (mode swap) | Hover state inherits dark fill; focus ring stays brand-indigo |
| Tag | primitive | ◐ Designed | 5-12 / 5-14 / 5-16 | (mode swap) | tier_t1 emerald accent passes 4.5:1 in both modes |
| CaseStudyCard | primitive | ◐ Designed | 5-52 | (mode swap) | bg-white/70 → dark:bg-neutral-900 transition tested |
| FrameworkVersionCard | primitive | ◐ Designed | 5-59 | (mode swap) | Same pattern as CaseStudyCard |
| SiteHeader | layout | ◐ Designed | 5-74 | (mode swap) | Theme toggle visually visible in both; nav-link contrast verified |
| SiteFooter | layout | ◐ Designed | 5-89 | (mode swap) | Built-by attribution + nav links pass 4.5:1 |
| MobileNav | layout | ◐ Designed | 10-7 | (mode swap) | Drawer bg uses neutral-900 in dark; backdrop opacity tuned |
| SearchInput | layout | ◐ Designed | 5-65 / 5-67 | (mode swap) | Placeholder text contrast verified per A-018 fix |
| HonestDisclosure | callout | ◐ Designed | 5-20 | (mode swap) | Coral accent bar passes contrast on both bg colors |
| TriggerIncident | callout | ◐ Designed | 5-26 | (mode swap) | Same accent pattern |
| MemoryRef | callout | ◐ Designed | 5-32 | (mode swap) | Indigo accent; identical contrast story |
| PredecessorChain | callout | ◐ Designed | 5-38 | (mode swap) | Multi-link layout works in both |
| KillCriterionResolution | callout | ◐ Designed | 5-44 | (mode swap) | Coral kill-resolution accent verified |
| Disclosure | ui-utility | ◑ AutoDerived | 10-13 | (token swap) | Composes neutral-200 borders + neutral-900 fill — derived |
| PersonaBar | persona | ◐ Designed | 11-7 | (mode swap) | Active pill uses brand-indigo (passes contrast in both); inactive border in neutral-300/700 swap |
| PersonaIndicator | persona | ◐ Designed | 11-11 | (mode swap) | Coral border-l-4 + tint background; close button has 44pt min-touch + focus ring |
| PersonaLens | persona | ◐ Designed | 11-15 | (mode swap) | Wrapper component — no visual chrome of its own; inherits child treatment |

**Note on "(mode swap)":** Most fitme-story components don't need a separate Dark-mode Figma frame because the `@theme` tokens + `html.dark` override block in `globals.css` handle the swap atomically. The Light frame IS the design source; Dark rendering is verified inline on the `/design-system` Part 2 showcase route (Light + Dark side-by-side per component card). When a component genuinely needs separate Dark visuals (e.g., a chart with custom strokes that don't map to single-token swaps), we'd capture two distinct Figma node IDs.

---

## Internal components — TODO list

8 control-room components have a TODO flag for explicit dark-mode contrast verification. Path forward:

| Component | Category | Status | Resolution |
|---|---|---|---|
| FeatureCard | control-room | ✗ TODO | Spot-check on `/control-room/features` in dark mode; verify status badges + phase labels pass 4.5:1 |
| TaskCard | control-room | ✗ TODO | Same as FeatureCard but for tasks list |
| TaskTree | control-room | ✗ TODO | Nested-row hover states + indent guides; verify hover contrast in dark |
| AlertsBanner | control-room | ✗ TODO | Severity colors (P0 coral / P1 amber / P2 neutral) — verify amber legibility on dark bg |
| AuditEventRow | control-room | ✓ Verified (2026-05-16) | Timestamp `text-neutral-500 dark:text-white/50` ≈ 9.5:1 ✓; actor `text-neutral-700 dark:text-white/70` ≈ 13.4:1 ✓; 5 status chips each carry explicit `dark:bg-{color}-500/20 dark:text-{color}-200` overrides ≈ 9–11:1 ✓ |
| AuditLogPanel | control-room | ✓ Verified (2026-05-16) | Error banner `bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200` ≈ 11.5:1 ✓; severity-level `text-rose-700 dark:text-rose-300` ≈ 8.7:1 ✓; pagination controls inherit `text-neutral-*` chain handled by `html.dark` token swap |
| AuthPasskeyForm | control-room | ✓ Verified (2026-05-16) | Input field `bg-white dark:bg-white/5` + `text-neutral-900 dark:text-white` ≈ 14:1 ✓; focus ring `ring-brand-indigo` (dark token `#818CF8` on `#1C1917` ≈ 4.7:1) ✓ for UI threshold (3:1); error-state coral banner `bg-rose-50 dark:bg-rose-500/10 text-rose-200` ≈ 11.5:1 ✓; warning amber banner `dark:bg-amber-500/10 dark:text-amber-200` similar |
| DevicesTable | control-room | ✓ Verified (2026-05-16) | Row striping `bg-neutral-50 dark:bg-white/5` ✓; code blocks `bg-neutral-100 dark:bg-white/8` ✓; status pill `dark:bg-white/8 dark:text-white` ✓; destructive coral pill `bg-rose-500 text-white` ≈ 3.6:1 ✓ for UI button (3:1); inline-revoke link `text-rose-600 dark:text-rose-400` ≈ 5.5:1 ✓ |

**Internal components NOT flagged TODO:**

- `TrackedDocLink` (◑ AutoDerived) — composes plain `<a>` with text-token color; mode swap handles it
- `ThemeToggle` (◐ Designed) — explicitly mode-aware by definition; verified in both
- 4 bespoke (BlueprintOverlay, ChipAffinityMap, DispatchReplay, PhaseTimingChart) — all ◑ AutoDerived; SVG illustrations whose stroke colors come from `currentColor` and inherit

### Why control-room Dark contrast isn't a P0

- Control-room is auth-gated (UCC passkey); user surface area is operator-only
- Most operator activity happens in light mode at desk monitors during work hours
- Contrast issues, if surfaced, would be P1 (legibility) not P0 (illegible) — text remains readable, just not maximally crisp
- Resolution work belongs to Bucket H (post-feature site audit per user directive 2026-05-10) where every route gets reviewed under the now-completed design system lens

---

## Contrast verification reference

For tokens that drive component colors:

| Token | Light value | Dark value | Light contrast on neutral-50 | Dark contrast on neutral-900 |
|---|---|---|---|---|
| `--color-neutral-500` | `#5C5754` | `#A8A29E` | 4.83:1 (AA pass) | 7.2:1 (AAA pass) |
| `--color-neutral-700` | `#44403C` | `#D6D3D1` | 9.2:1 (AAA pass) | 12.7:1 (AAA pass) |
| `--color-brand-indigo` | `#4F46E5` | `#818CF8` | 5.8:1 on white | 4.7:1 on neutral-900 |
| `--color-brand-coral` | `#F97066` | `#FDA29B` | 3.8:1 (AA Large) | 5.2:1 (AA Body) |

Source: `fitme-story-design-system` audit synthesis 2026-05-08 + audits A-002 + A-018 (lib/design-system-heritage.ts).

---

## Audit cadence

- **First audit:** 2026-05-10 (this doc, generated as part of fitme-story-website-design-system Bucket E)
- **Trigger for re-audit:** Any token color change in `globals.css`, OR any new public component added
- **Tracked in:** `src/lib/design-system.ts` (manifest is source of truth — this doc is a readable surfacing of the manifest)

When the matrix needs to update:

1. Update `darkModeStatus` field in `src/lib/design-system.ts` for the affected component
2. Re-audit the component visually (Light + Dark side-by-side on `/design-system` Part 2)
3. Regenerate this doc (currently manual; could automate via `npm run dark-mode-audit` if value justifies)

---

## Cross-references

- Manifest source: [`src/lib/design-system.ts`](../../src/lib/design-system.ts)
- Heritage data (audit A-002, A-018): [`src/lib/design-system-heritage.ts`](../../src/lib/design-system-heritage.ts)
- Showcase route surfacing this data inline: [`src/app/design-system/page.tsx`](../../src/app/design-system/page.tsx) §2.5 Dark-mode parity
- Internal-deferral policy: see comment block above the Internal components in `src/lib/design-system.ts`
- Drift detection (does NOT alarm on Dark TODO; that's a per-component review, not a code/manifest mismatch): [`src/lib/figma-drift.ts`](../../src/lib/figma-drift.ts)
