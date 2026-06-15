# Contributing to the fitme-story design system

**Created:** 2026-05-10 (fitme-story-website-design-system Bucket F)
**Companion docs:** [`fitme-story-design-architecture.md`](../../FitTracker2/docs/design-system/fitme-story-design-architecture.md) (lives in FT2) · [`fitme-story-dark-mode-coverage.md`](./design-system/fitme-story-dark-mode-coverage.md) · [`figma-code-sync-status.md`](../../FitTracker2/docs/design-system/figma-code-sync-status.md)
**Public summary:** linked from `/design-system` Part 2 footer

> This is the contribution guide for the fitme-story website's design system — components that live in `src/components/**` and the tokens that compose them. The iOS app's design system is documented separately in `FitTracker/DesignSystem/AppComponents.swift` + `docs/design-system/ios-code-connect-workflow.md`.

> ⛔ **Code Connect publishing is DISABLED (2026-06-15).** Figma Code Connect requires an
> Organization/Enterprise plan; this account is **Pro**, so `figma connect publish` cannot run
> (the `figma-code-connect-publish.yml` workflow is a disabled stub). The manifest fields
> `figmaNodeIds` / `hasFigmaConnect` and the `.figma.tsx` mapping files below still document
> **design intent**, but they are **inert** — nothing publishes them to Figma Dev Mode, and the
> referenced Figma file is empty/partial. **Code is the source of truth.** When following §7
> below, you may author the manifest entry + mapping file as documentation, but do not expect a
> live Dev-Mode snippet. Full decision + rebuild plan (FT2 repo):
> `docs/design-system/figma-source-of-truth-plan-2026-06-15.md`.

---

## §1 Decision tree — should I add a new component?

When you're about to write a new component, walk this tree:

```
Need a new visual element on a fitme-story route?
│
├─ Can an existing primitive (Button, Tag, CaseStudyCard,
│  FrameworkVersionCard) be configured to do this?
│  └─ YES → use the primitive. Stop here.
│  └─ NO ↓
│
├─ Is this a one-off visual specific to a single MDX page or route?
│  └─ YES → inline it in the page/MDX file. Stop here.
│       (Don't add a one-off to design-system.ts; it adds noise.)
│  └─ NO ↓
│
├─ Will this be used across 2+ routes / MDX files?
│  └─ NO → reconsider. Maybe inline + revisit if reuse emerges.
│  └─ YES ↓
│
├─ Is this a control-room (operator-only) component?
│  └─ YES ↓ (check §3.1 form-driven exception first)
│  │   │
│  │   ├─ Form-driven + pre-auth surface? (see §3.1 criteria)
│  │   │  └─ YES → status: 'Stable'. Build it like a public component → §2.
│  │   │  └─ NO ↓
│  │   │
│  │   └─ status: 'Internal'. Skip Figma frame creation.
│  │        Add to manifest with figmaNodeIds: null + hasFigmaConnect: false.
│  │        See §3 Internal components.
│  └─ NO ↓ (this is a public component)
│
└─ Build it as a Stable public component → §2 below.
```

---

## §2 Adding a new public component

A public component is one that appears on user-visible routes (homepage, case studies, framework, glossary, design system). Public components SHOULD have full Figma representation.

### Step-by-step

1. **Naming + file location**
   - Primitive (Button-style atomic): `src/components/ui/{ComponentName}.tsx`
   - Layout (header/footer/nav): `src/components/{ComponentName}.tsx`
   - MDX callout: `src/components/mdx/callouts/{ComponentName}.tsx`
   - Persona-related: `src/components/{Persona...}.tsx` at the top level
   - Page-specific bespoke: `src/components/bespoke/{ComponentName}.tsx` (status: Internal — see §3)

2. **Author the component** — keep it server-render-safe by default; add `'use client'` only when needed (event handlers, hooks). Match existing component file structure (named export, type signatures, Tailwind classes only — no inline `style={}` for theming, only for dynamic positioning).

3. **Use semantic tokens**
   - Color: `var(--color-brand-indigo)`, `var(--color-neutral-500)`, etc. — never raw hex
   - Type: `text-[length:var(--text-display-lg)]` — never raw `text-3xl` for hierarchy
   - Measure: `max-w-[var(--measure-body)]` for prose-width content
   - Motion: `transition-[opacity] duration-[var(--motion-duration-fast)]` (Bucket A tokens)
   - Elevation: `shadow-[var(--elevation-2)]` (Bucket A tokens)
   - Z-index: `z-[var(--z-modal)]` (Bucket A tokens)

4. **Dark-mode treatment**
   - Default to mode-swap (use semantic tokens; the `html.dark` override in `globals.css` flips them)
   - When you need explicit Dark adjustments: `dark:bg-[var(--color-neutral-900)]` etc.
   - Verify visually on `/design-system` Part 2 — the showcase renders Light + Dark side-by-side per component card

5. **Accessibility**
   - 44pt min-touch target on interactive elements (matches iOS app discipline)
   - Visible focus ring: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]`
   - WCAG AA contrast (4.5:1 body, 3.0:1 large) — test against `--color-neutral-50` (light bg) and `--color-neutral-900` (dark bg)
   - ARIA labels on icon-only buttons; landmarks (`<nav>`, `<main>`, `<aside>`) where appropriate
   - Reduced-motion respected via the global `@media (prefers-reduced-motion: reduce)` block in `globals.css`

6. **Add manifest entry** in `src/lib/design-system.ts`:

   ```ts
   {
     name: 'YourComponent',
     githubPath: 'src/components/{path}/YourComponent.tsx',
     purpose: 'One-line description (< 80 chars).',
     whereUsed: 'Where in the site it appears.',
     category: 'primitive' | 'layout' | 'callout' | 'ui-utility' | 'persona' | 'control-room' | 'bespoke',
     status: 'Stable' | 'Experimental' | 'Deprecated' | 'Internal',
     figmaNodeIds: [{ variant: 'default', nodeId: 'X-Y' }] | null,
     hasFigmaConnect: true | false,
     darkModeStatus: 'Designed' | 'AutoDerived' | 'NotApplicable' | 'TODO',
     codeSnippet: `import { YourComponent } from '@/components/...';\n\n<YourComponent />`,
   },
   ```

7. **Author Figma frame + Code Connect mapping**
   - Use Figma MCP (`mcp__claude_ai_Figma__use_figma`) to create a frame on the Components page (file `fsjHfFLAHELACZHku8Rfcl`)
   - Convert frame → COMPONENT (Code Connect requires COMPONENT or COMPONENT_SET)
   - Capture the resulting node ID (e.g., `12-7`)
   - Add a `.figma.tsx` mapping file alongside the component:

     ```tsx
     // @ts-expect-error - figma module is provided at parse time by @figma/code-connect
     import figma from '@figma/code-connect';
     import { YourComponent } from './YourComponent';

     figma.connect(
       YourComponent,
       'https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System?node-id=12-7',
       {
         example: () => <YourComponent />,
       },
     );
     ```

   - Update the manifest entry's `figmaNodeIds` + set `hasFigmaConnect: true`

8. **Add showcase preview (optional, but encouraged)**
   - In `src/components/design-system/VariantGrid.tsx`, add a pre-baked variant renderer
   - In `src/app/design-system/page.tsx`, add to `COMPONENT_PREVIEWS` map so the showcase renders the live component

9. **Verify locally**
   - `npm run figma-drift` — should report 0 findings (your new component is in manifest + has matching `.figma.tsx`)
   - `npm run build` — should pass
   - Visit `/design-system` on a local dev server — your component should appear under its category section with Light + Dark previews

10. **Commit + PR**
    - PR title: `feat(design-system): add YourComponent + Figma mapping`
    - PR description must reference the Figma node ID (per CLAUDE.md "Synced" definition)
    - Tag the PR with `design-system` + `component` labels

---

## §3 Internal components — different rules

Internal components (control-room, bespoke illustrations) follow code-first design.

**You SHOULD:**
- Add a manifest entry with `status: 'Internal'`
- Set `figmaNodeIds: null` and `hasFigmaConnect: false` — explicitly opt out of Figma representation
- Set `darkModeStatus` honestly (`Designed` / `AutoDerived` / `TODO`)

**You should NOT:**
- Spend time designing a Figma frame for an Internal component. The drift detection script (`figma-drift`) excludes Internal from the public-parity calculation precisely so this work doesn't inflate metrics
- Block on designer review for Internal-component visual changes — code review covers these

**Why:** Internal surfaces serve operator-only / behind-auth routes. They are heavily data-driven (TaskTree, AuditLogPanel, DevicesTable) — designing them in Figma without realistic data fixtures produces low-fidelity stubs that mislead more than help. The React implementation IS the design source of truth; designers iterate by reading the code + browser dev tools.

### §3.1 Form-driven exception (added 2026-05-17)

A narrow exception to §3: a control-room component MAY have full Figma representation when **both** criteria hold:

1. **Form-driven, not data-driven.** The component renders a static set of inputs + buttons + a finite enumerable set of error/success states. No tables, lists, dynamic counts, or other "needs realistic data fixtures" UI.
2. **Shown to unauthenticated or pre-session users.** The component lives behind no real session yet (the user is trying to acquire one). Examples: sign-in, sign-up, recovery, password-reset.

**Both criteria must hold.** A control-room form that consumes dynamic data (e.g., a revoke-confirmation dialog that lists existing devices) does NOT qualify.

**Qualifying components (initial list, 2026-05-17):**

| Component | Path | Why qualifying |
|---|---|---|
| `AuthPasskeyForm` | `src/components/control-room/AuthPasskeyForm.tsx` | Email input + WebAuthn button + 8 known error states (`ERROR_REASON` map at AuthPasskeyForm.tsx:36-46). Shown pre-auth. |
| `/control-room/sign-in` (page) | `src/app/control-room/sign-in/page.tsx` | Wraps `AuthPasskeyForm` in `mode=authenticate`. Pre-auth. |
| `/control-room/sign-in/recover` (page) | `src/app/control-room/sign-in/recover/page.tsx` | Bootstrap-token paste + `AuthPasskeyForm` in `mode=register`. Pre-auth. |

**Components that stay Internal under §3 (do NOT qualify):**

- `TaskTree`, `FeatureCard`, `TaskCard` — heavily data-driven; list dynamic counts
- `AlertsBanner` — content depends on `framework-health.json` derived state
- `AuditEventRow`, `AuditLogPanel` — render dynamic audit-log entries
- `DevicesTable` — lists registered devices (data-driven); revoke confirmation depends on which device row

**Manifest contract under the §3.1 exception:**

For a component that qualifies under §3.1, the manifest entry MUST be:

- `status: 'Stable'` (not `'Internal'`)
- `figmaNodeIds: { component_root: "<node-id>", variant_idle: "<node-id>", ... }` populated
- `hasFigmaConnect: true`
- `darkModeStatus: 'Designed'` — the Figma frame defines the dark-mode appearance
- `.figma.tsx` Code Connect file required at the same path-stem as the component

**Drift detection:** `figma-drift` SHOULD include §3.1-qualifying components in its public-parity calculation (they DO have Figma frames; drift IS meaningful for them). The Internal allowlist exempts the rest of `control-room/*` from the calculation, NOT §3.1-qualifying components.

**Why this exception exists:**

Pre-auth surfaces are effectively public-feeling — they're often the first impression of the operator dashboard, and they accept hostile traffic (failed sign-in attempts). The §3 "no realistic data fixtures" concern doesn't apply to a screen whose entire UI is an email input + a button + 8 enumerable error states. The cost of designing them in Figma is bounded (no fixture-shopping needed); the value is full design-review on the screens that shape first impressions.

**How to apply:**

Before flipping a control-room component from `Internal` to `Stable` via §3.1, confirm BOTH criteria above. If criterion 1 ("form-driven, not data-driven") is borderline — the component renders ANY dynamic content beyond static text + known-enumerable states — default to keeping it Internal under §3. The exception is narrowly scoped on purpose.

**Provenance:** added as part of the `ucc-sign-in-figma-mapping` enhancement on `ucc-passkey-auth`. See `.claude/features/ucc-sign-in-figma-mapping/state.json` (FT2) for the task breakdown that introduced this clause.

---

## §4 Status transitions

A component's `status` field reflects its maturity. Transitions:

| From | To | Trigger |
|---|---|---|
| (new) | Experimental | Just-shipped public component; in trial |
| Experimental | Stable | After 30 days in production with no API change OR after 2+ consumers added |
| Stable | Deprecated | Replacement landed; removal date set in component header comment |
| Deprecated | (deleted) | After grace period (typically 30 days) once all consumers migrated |
| Internal | Stable | Component promoted out of operator-only into public surfaces (rare) |

**Don't use Experimental as a hedge for half-baked work.** If something isn't ready, don't ship it. Experimental is for genuinely novel API patterns where you expect feedback.

---

## §5 Migration / deprecation without breaking case-study MDX

Case studies in `content/04-case-studies/` import callout components directly via MDX. Breaking changes need care.

When deprecating a callout component:

1. Add `status: 'Deprecated'` in manifest + a header comment in the component file with the planned removal date
2. Author the replacement component as a separate file
3. Update existing case-study MDX files in the same PR — find/replace the import + tag name. Do NOT leave stale imports
4. Ship the deprecation + migration in ONE PR (atomic) — half-migrated state is the failure mode
5. After 30 days with no regressions, delete the deprecated component file + manifest entry

When deprecating a primitive (Button/Tag/CaseStudyCard/FrameworkVersionCard):

- These have higher blast radius. Run `git grep -l "ComponentName" src/` to find every consumer
- Migrate incrementally if needed; landing the deprecation gradually across multiple PRs is acceptable IF the manifest still has both entries (old marked Deprecated, new marked Stable)
- Final removal PR deletes the old component + its `.figma.tsx` + its manifest entry in one atomic change

---

## §6 Token additions

When you need a new design token (color, type size, motion duration, elevation level, z-index tier):

1. Add to `globals.css` `@theme` block — both Light value AND Dark override if they differ
2. Add to `src/lib/design-tokens.ts` (typed export — used by the `/design-system` showcase to render swatches)
3. Add to Figma library variables collection (file `fsjHfFLAHELACZHku8Rfcl`, "FitMe Tokens" collection) via Figma MCP — set scope to `ALL_SCOPES` to match existing pattern OR specific scope if the token type narrows naturally
4. Update the `/design-system` Part 2 page if a new section is needed for the new token category
5. Document the rationale in the commit message — what existing token couldn't be reused, why this addition

---

## §7 Drift detection — what `figma-drift` checks

Run `npm run figma-drift` to see your changes against the source of truth. Findings:

| Code | Severity | What it means |
|---|---|---|
| `MAPPING_INCONSISTENCY` | fail | Manifest says `hasFigmaConnect: true` but no `.figma.tsx` file exists (or vice versa) |
| `MANIFEST_ONLY` | fail | Manifest declares Figma node IDs for a component but no `.figma.tsx` mapping file exists |
| `CODE_ONLY` | fail | A `.figma.tsx` file maps a component name not in the manifest |
| `MISSING_COMPONENT_SOURCE` | fail | A `.figma.tsx` imports a component path that doesn't exist on disk |
| `ORPHAN_FIGMA_NODE` | warn | (Reserved for future Figma-API check.) |

Per-PR auto-run: `.github/workflows/figma-drift-weekly.yml` runs on PRs that touch the manifest or any `.figma.tsx` file.

---

## §8 Quick checklist (for your PR description)

- [ ] Component file lives in the right `src/components/...` location (per §2.1)
- [ ] Uses semantic tokens only (no raw hex / no raw `text-3xl` for hierarchy)
- [ ] Dark-mode tested visually on `/design-system` Part 2 (Light + Dark side-by-side)
- [ ] WCAG AA contrast verified
- [ ] 44pt min-touch on interactive elements
- [ ] Manifest entry added in `src/lib/design-system.ts` with all fields populated
- [ ] If public: Figma frame created, `.figma.tsx` mapping authored, `hasFigmaConnect: true`
- [ ] If Internal: `figmaNodeIds: null`, `hasFigmaConnect: false`, no Figma work expected
- [ ] `npm run figma-drift` reports 0 findings
- [ ] `npm run build` passes
- [ ] PR description references Figma node ID(s)

---

## §9 Quick links

- Manifest: [`src/lib/design-system.ts`](../src/lib/design-system.ts)
- Heritage: [`src/lib/design-system-heritage.ts`](../src/lib/design-system-heritage.ts)
- Tokens: [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts) + [`src/app/globals.css`](../src/app/globals.css)
- Showcase route: `src/app/design-system/page.tsx` (live at <https://fitme-story.vercel.app/design-system>)
- Drift script: [`scripts/figma-drift.mjs`](../scripts/figma-drift.mjs)
- Figma file: [`fsjHfFLAHELACZHku8Rfcl`](https://www.figma.com/design/fsjHfFLAHELACZHku8Rfcl/FitMe-Story-Web-Design-System)
