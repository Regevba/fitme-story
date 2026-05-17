# Design build prompt — UCC sign-in Figma mapping

**Feature:** `ucc-sign-in-figma-mapping` (Enhancement on `ucc-passkey-auth`)
**FT2 state.json:** `.claude/features/ucc-sign-in-figma-mapping/state.json` (commit `7af6610`)
**Tasks covered:** T2 + T3 + T4 (Figma frame authoring via `use_figma` MCP)
**Generated:** 2026-05-17 by Claude Opus 4.7

## Target Figma file

- **Name:** "FitMe Story Web — Design System"
- **fileKey:** `fsjHfFLAHELACZHku8Rfcl`
- **Library / tokens:** existing `fitme-story` token variables — `--color-brand-indigo`, `--color-brand-coral`, neutral ladder, type scale (already extracted T18-T19 of `fitme-story-public-enhancements`)
- **Source code reference:** `fitme-story/src/components/control-room/AuthPasskeyForm.tsx` + `fitme-story/src/app/control-room/sign-in/page.tsx` + `fitme-story/src/app/control-room/sign-in/recover/page.tsx`

## Provenance — why this prompt exists

Per the §3.1 form-driven exception clause added to `docs/CONTRIBUTING-design-system.md` 2026-05-17 (commit `dd87bad`), the 2 UCC sign-in pages + `AuthPasskeyForm` component qualify for Figma representation despite living under `control-room/*`. They are form-driven (not data-driven) and shown pre-auth.

The parent `ucc-passkey-auth` feature originally shipped 2026-05-07 with `figma_build_status: "deferred_to_prompt"` and `figma_deferral_reason: "web_dashboard_no_figma_mapping"`. This enhancement closes that deferral.

## Acceptance criteria

When this prompt is fully executed, the following must be true:

1. **3 page frames in the Figma file** at top level under a `/Control-Room/sign-in/` page (or equivalent organizational hierarchy):
   - `Sign-In · Idle`
   - `Sign-In · Pending`
   - `Sign-In · Error`
   - `Sign-In · Recover · Idle`
   - `Sign-In · Recover · Pending`
   - `Sign-In · Recover · Error`
   (6 frames total — 3 states × 2 routes)
2. **1 component in the Figma library:**
   - Name: `AuthPasskeyForm`
   - Variants: `status = idle | pending | success | error | locked` (5) × `mode = authenticate | register` (2) = 10 variants
   - Light + Dark mode pair via Figma variable mode swap (the existing `fitme-story` variables collection should have a Color mode set)
3. **Each frame must use existing fitme-story Figma variables** for color, type, spacing, radius — no raw hex values, no Figma-local styles. If a needed token is missing, surface it for token-pipeline addition before completing the frame.
4. **Frame dimensions:** 360 (mobile) AND 1280 (desktop) widths for each of the 6 page frames. Auto-layout vertical, padding via existing spacing tokens.
5. **Node IDs captured** and pasted back into FT2 `state.json.figma_node_ids` under the structure described in §"State.json contract" below.

## Component spec — `AuthPasskeyForm`

Source: [`src/components/control-room/AuthPasskeyForm.tsx`](../../../src/components/control-room/AuthPasskeyForm.tsx)

### Variants

| status | mode | Primary button label | Secondary content visible |
|---|---|---|---|
| `idle` | `authenticate` | "Unlock with passkey" | Email input (autocomplete="username webauthn"), Fingerprint icon |
| `idle` | `register` | "Register this device" | Fingerprint icon only (no email input — passed via bootstrap token) |
| `pending` | `authenticate` | "Waiting for passkey…" (button disabled) | Animated pulsing Fingerprint icon |
| `pending` | `register` | "Waiting for passkey…" (button disabled) | Animated pulsing Fingerprint icon |
| `success` | `authenticate` | "Signed in" (button disabled, CheckCircle2 icon) | (transition to redirect — frame just shows the success state) |
| `success` | `register` | "Registered" (button disabled, CheckCircle2 icon) | (transition to redirect) |
| `error` | `authenticate` | "Unlock with passkey" (active again) | RED error banner ABOVE button with `role="alert"`, AlertTriangle icon + error text |
| `error` | `register` | "Register this device" (active again) | RED error banner ABOVE button + AlertTriangle + error text |
| `locked` | `authenticate` | "Unlock with passkey" (button DISABLED) | Lock or unsupported-browser warning state |
| `locked` | `register` | "Register this device" (button DISABLED) | "Browser not supported" amber-banner (lines 203-211 of AuthPasskeyForm.tsx) |

### Error reason vocabulary (for `status=error` frames — show one example)

From `ERROR_REASON` map at AuthPasskeyForm.tsx:36-46:

```
user_cancelled    → "Touch ID cancelled."
no_authenticator  → "No passkey found on this device."
attestation_invalid → "Could not register this device — try again."
assertion_invalid → "Authentication failed — try again."
counter_replay    → "Security check failed. Please contact your operator."
unknown_credential → "This passkey is no longer valid. Use the Recover flow."
bootstrap_invalid → "Bootstrap token is invalid, used, or expired."
timeout           → "Sign-in timed out. Try again."
server_error      → "Server error. Please retry."
```

Pick one representative message for the `error` variant frame (suggest `assertion_invalid` for `authenticate`, `bootstrap_invalid` for `register`).

### Colors / tokens used

- Primary button: `var(--color-brand-indigo)` background, `white` text
- Primary button hover: `var(--color-brand-indigo-hover)`
- Error banner: rose-50 light / rose-500/10 dark + rose-300 light / rose-500/40 dark border + rose-900 light / rose-200 dark text
- Locked banner: amber-50 light / amber-500/10 dark + amber-300 light / amber-500/40 dark border
- Focus ring: 2px `var(--color-brand-indigo)` + 2px offset
- Coral-pulse animation (idle, authenticate mode only): see UU1 `globals.css` `@keyframes coral-pulse-cta` — represent visually with a coral glow ring around the button

### Component-level Figma node IDs to capture

After build, paste back to state.json:

```json
{
  "AuthPasskeyForm_component_root": "<node-id>",
  "AuthPasskeyForm_variant_idle_authenticate_light": "<node-id>",
  "AuthPasskeyForm_variant_idle_authenticate_dark": "<node-id>",
  "AuthPasskeyForm_variant_pending_authenticate_light": "<node-id>",
  ...
}
```

(10 variant IDs × 2 themes = 20 IDs, plus 1 root = 21 total; OR if Figma library supports modes natively, 11 IDs)

## Page frame specs

### Frame 1: `Sign-In · Idle` (route: `/control-room/sign-in`)

Source: [`src/app/control-room/sign-in/page.tsx`](../../../src/app/control-room/sign-in/page.tsx)

**Layout (top-to-bottom):**
1. Page chrome — minimal control-room header (logo only, no operator menu since unauthenticated)
2. Main content card — centered, max-width ~400px on desktop / full-width on mobile
   - H1 heading: "Sign in to control room" (font-serif, type scale L)
   - Sub-paragraph: "Use your registered passkey to unlock the operator dashboard." (font-sans, type scale M)
   - Instance of `AuthPasskeyForm` component (variant: `status=idle, mode=authenticate, light/dark`)
   - Below the form: text link "Don't have a passkey yet? [Recover with bootstrap token →](/control-room/sign-in/recover)"
3. Page footer — minimal

**State variant differences:**
- `Idle` → `AuthPasskeyForm` variant `status=idle, mode=authenticate`
- `Pending` → variant `status=pending, mode=authenticate`
- `Error` → variant `status=error, mode=authenticate` (use `assertion_invalid` error text)

### Frame 2: `Sign-In · Recover · Idle` (route: `/control-room/sign-in/recover`)

Source: [`src/app/control-room/sign-in/recover/page.tsx`](../../../src/app/control-room/sign-in/recover/page.tsx)

**Layout (top-to-bottom):**
1. Page chrome — same as Frame 1
2. Main content card — same structure but different copy
   - H1 heading: "Recover access"
   - Sub-paragraph: "Paste the bootstrap token issued by your operator administrator. Tokens are single-use and expire in 15 minutes."
   - Bootstrap-token input field — `<input type="text" autocomplete="off">` styled with same input tokens as `AuthPasskeyForm`'s email input
   - Instance of `AuthPasskeyForm` component (variant: `status=idle, mode=register`)
3. Page footer — same

**State variant differences:**
- `Idle` → bootstrap-token field empty, `AuthPasskeyForm` variant `status=idle, mode=register`
- `Pending` → bootstrap-token disabled, `AuthPasskeyForm` variant `status=pending, mode=register`
- `Error` → bootstrap-token shown with red border (1px rose-500), `AuthPasskeyForm` variant `status=error, mode=register` (use `bootstrap_invalid` error text)

## State.json contract (post-build)

After build completes, FT2 `state.json.figma_node_ids` should look like:

```json
{
  "figma_node_ids": {
    "auth_passkey_form_component": "<node-id>",
    "sign_in_idle": "<node-id>",
    "sign_in_pending": "<node-id>",
    "sign_in_error": "<node-id>",
    "sign_in_recover_idle": "<node-id>",
    "sign_in_recover_pending": "<node-id>",
    "sign_in_recover_error": "<node-id>"
  },
  "figma_build_status": "completed",
  "figma_file_key": "fsjHfFLAHELACZHku8Rfcl"
}
```

Note: `figma_deferral_reason` field should be DROPPED entirely (no longer applies — work is built, not deferred).

## Execution paths

Pick one:

**A. `/design build ucc-sign-in-figma-mapping`** — canonical PM-workflow path. Loads `figma-use` + `figma-generate-design` skills; iterates `use_figma` MCP calls to build all 6 page frames + 1 component. Auto-populates state.json. ~30-45min wall.

**B. Dedicated Figma session via Figma MCP UI** — open Figma desktop / web, manually build the frames using existing fitme-story tokens. Paste node IDs back to state.json. ~45-60min wall.

**C. Subagent dispatch** — spawn a worker with this prompt + `mcp__claude_ai_Figma__*` tool access. Constrained budget (e.g., 50 tool uses, sonnet). ~30min wall.

**D. Manual + portable** — same as B but the operator does the work outside any Claude session. Node IDs come back later.

For this enhancement, recommend **A** (canonical) or **C** (if session capacity is tight).

## Next tasks after T2-T4 lands

- T5: `src/components/control-room/AuthPasskeyForm.figma.tsx` — Code Connect mapping for the component variants, references the captured node IDs
- T6: `src/app/control-room/sign-in/page.figma.tsx` — page-level Code Connect mapping
- T7: `src/app/control-room/sign-in/recover/page.figma.tsx` — page-level Code Connect mapping
- T8: `src/lib/design-system.ts` — flip AuthPasskeyForm entry from `status: 'Internal'` to `status: 'Stable'`, populate `figmaNodeIds`, set `hasFigmaConnect: true`, `darkModeStatus: 'Designed'`
- T9: FT2 `.claude/features/ucc-passkey-auth/state.json` — update `figma_build_status`, populate `figma_node_ids`, drop `figma_deferral_reason`
- T10: monitor `figma-code-connect-publish.yml` GHA workflow on push — expect success
- T11: append §99 sub-entry to FT2 `docs/case-studies/ucc-passkey-auth-case-study.md`

All blocked on T2-T4 landing first (need the actual node IDs).
