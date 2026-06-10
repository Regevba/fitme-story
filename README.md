# fitme-story

Next.js 16 site that narrates the FitMe PM-framework evolution through a timeline, case studies, and interactive diagrams. Source of truth for the shorter narrative versions; full case studies live upstream in [Regevba/FitTracker2/docs/case-studies](https://github.com/Regevba/FitTracker2/tree/main/docs/case-studies).

Production: [fitme-story.vercel.app](https://fitme-story.vercel.app)

> **Latest at v7.10 (GATE_COVERAGE_ZERO observability + field-rename closure, shipped 2026-06-10):**
>
> - **Meta-layer observability hardening** (no new product-facing gates). `GATE_COVERAGE_ZERO` gained a **0-candidate mis-wire detector** (a gate in the F17 index with `candidates==checked==skipped==0` runs but never reaches a candidate); three cycle-time checks (`BROKEN_PR_CITATION` / `CASE_STUDY_MISSING_TIER_TAGS` / `PATTERN_SKILL_UNMAPPED`) now emit `mode="cycle"` coverage so the meta-check can watch them. Observed-patterns **#24** codifies the field-rename silent-pass in a READER/INDEX — two fixed (`cu_v2` top-level-vs-legacy `complexity.cu_version`, post-v6 fully-adopted 3→6; `w9.auto_isolate` `ts`-vs-`timestamp`). Plus a **second what-if self-test** across every layer (iOS build + 672 tests, ai-engine 34/34, web 286/289, framework 0 findings) that fixed verify-local dep-skip ergonomics, and **T10** — the AI golden-set eval harness (the FitMe AI is *deterministic*, so a deterministic golden set is a hard PR gate: 24 cases, ai-engine suite 60 pass). Predecessor: v7.9 promotion (3 advisory gates → enforced, shipped 2026-05-21).
>
> **Earlier — v7.9 (Promotion Release — 3 advisory gates → enforced via single-flag flip, shipped 2026-05-21 via [FT2 PR #417](https://github.com/Regevba/FitTracker2/pull/417) `ea53ff4`):**
>
> - **`BRANCH_ISOLATION_VIOLATION` Mode B (infra commit-level) + Mode C (per-state.json mutation) + `FEATURE_CLOSURE_COMPLETENESS` (write-time)** promoted from advisory to enforced after 14-day Mechanism A telemetry calibration (18 + 13 + 13 firings, 0 zero-candidate rows, 0 false positives). All 4 §2.2 promotion criteria met. First real-world Mode C gate fire caught + resolved same-session. **Total framework mechanisms post-promotion: 37 mechanical gates + 5 advisories** (3 promoted). Phase E validation soak 2026-05-21 → 2026-06-04. Reversibility: single-line revert in under 5 min. Honesty ledger entry [FT2-FH-003](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/framework-honesty-ledger.md) codifies the calibration discipline. Source case study: [`docs/case-studies/framework-v7-9-promotion-case-study.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/framework-v7-9-promotion-case-study.md) (live append-only journal; §99 synthesis lands 2026-05-28 post-B2 baseline). Cold-start entrypoint: [`.claude/entrypoints/framework-v7-9.md`](https://github.com/Regevba/FitTracker2/blob/main/.claude/entrypoints/framework-v7-9.md).
> - **`make integrity-diff`** vs 2026-05-14 baseline anchor; **`make preflight WORK_TYPE=<feature|enhancement|fix|chore> [FEATURE=<name>]`** — unified per-work-type entry point writing `.claude/shared/preflight-cache.json` consumed by all 10 skills' `## Shared Data` section. Mandatory Phase 0.0 step in `/pm-workflow`. Weekly Mechanism A gate-coverage zero-drift scan + per-dimension trend nudge (`fully_adopted_post_v6` / `cu_v2` / per-phase) in `framework-status-weekly.yml`. W1 ssh-agent SessionStart preflight (prevents silent sign-hang). Calendar reminders for upcoming MUST-have follow-ups (B1 v7.9 freeze 2026-05-21, B2 post-v7.9 baseline 2026-05-28). New nice-to-have surfaces: weekly dependency audit workflow, daily stale-branch warning, daily PR-babysit sweep. No new enforcement gates — total mechanism count unchanged: **34 mechanical gates + 5 advisories**.
> - [Developer guide (technical, dev-only)](https://fitme-story.vercel.app/framework/dev-guide) — covers 4 enforcement layers, `state.json` schema (incl. v7.8.3 cross-repo `state_owner` enum), phase lifecycle, dispatch model, cache architecture, measurement protocol, v7.8 bridge mechanisms A–F, v7.8.3 cross-repo state-sync release umbrella, v7.8.4 PR_CACHE_STALE auto-refresh, v7.8.5 Observed Patterns Catalog + W9 branch-drift alert, **v7.8.6 unified preflight + integrity-diff + weekly trend scan**. Vendored mirror of [`docs/architecture/dev-guide-v1-to-v7-7.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/architecture/dev-guide-v1-to-v7-7.md) (filename retained for ref-stability; content tracks v7.8.6) on FitTracker2.
> - [Control-room framework dashboard](https://fitme-story.vercel.app/control-room/framework) — live Tier 1.1 adoption trends + documentation-debt coverage + 72h integrity cycle snapshot + v7.8 Mechanism F membrane status + v7.8.3 cross-repo gate-coverage aggregator (FT2 + fitme-story streams).
> - [v7.8.3 cross-repo state-sync case study](https://fitme-story.vercel.app/case-studies/cross-repo-state-sync-impl) — 5-phase release umbrella, 10 PRs across 2 repos in one day, V2 advisory → enforced, 3 v7.9 candidates (F11/F12/F13) surfaced.
> - [Trust page Gemini-audit subroute](https://fitme-story.vercel.app/trust/audits/2026-04-21-gemini) — verbatim audit + appended response section linking case studies, the dev guide, and [Tier 3.3 invitation issue #142](https://github.com/Regevba/FitTracker2/issues/142).

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run validate-content  # MDX frontmatter schema check
npm test             # content + timeline tests
```

The sync pipeline pulls canonical case-study Markdown from the showcase repo and merges it with site-specific frontmatter (`tier`, `timeline_position`, `persona_emphasis`, `hero_component`). Run `npm run sync-content` to refresh.

## Deploy

Production deploys happen automatically on push to `main` via the Vercel Git integration. For a manual deploy:

```bash
vercel --prod
```

## Operations control room (`/control-room`)

The site hosts an operator dashboard at [`/control-room`](https://fitme-story.vercel.app/control-room) alongside the public showcase. It surfaces every framework gate, every cycle snapshot, every measurement-adoption ledger, and the case-study feed. Code lives entirely under `src/{app,components,lib}/control-room/*` plus `scripts/sync-from-fittracker2.ts` plus `src/proxy.ts` plus `src/data/control-room-seeds/` — see [`EXTRACTION-RECIPE.md`](EXTRACTION-RECIPE.md) for the co-location rule and the 7-step playbook for breaking the dashboard out into its own repo.

### Pre-build sync

Before each `next build`, [`scripts/sync-from-fittracker2.ts`](scripts/sync-from-fittracker2.ts) mirrors data from the FitTracker2 repo into `src/data/`:

- `.claude/shared/*.json` → `src/data/shared/`
- `.claude/features/<name>/state.json` → `src/data/features/<name>.json`
- 4 parser-required markdowns (PRD, backlog, metrics, master roadmap) → `src/data/docs/` (`md/` lane, fail-fast on missing)
- ~270 knowledge-hub markdowns from FT2 `docs/` + 4 root READMEs → `src/data/docs/` (`kb/` lane, soft-skip on missing)

Two source modes:

1. **FT2 sibling on disk** (local dev) — clone FitTracker2 alongside fitme-story; `npm run prebuild` reads from there.
2. **Vercel build clones FT2** (production) — `vercel.json` runs `git clone --depth=1 ... ../FitTracker2 && npm run build` using `FITTRACKER2_DEPLOY_TOKEN`.
3. **Committed snapshot fallback** — if FT2 isn't present, the build uses whatever was last committed under `src/data/`. Build still succeeds; `freshness.json` flags the source as stale.

### Blind-switch privacy gate (3 layers)

The dashboard is gated by three independent layers so a single misconfiguration can't expose it:

| Layer | Code | Behavior |
|---|---|---|
| **1 — auth proxy (passkey + basic-auth)** | [`src/proxy.ts`](src/proxy.ts) | Intercepts every request to `/control-room/*`. Behavior controlled by `UCC_AUTH_MODE` env var: `basic` = HTTP basic-auth via `DASHBOARD_USER`/`DASHBOARD_PASS`; `passkey` = iron-session cookie + WebAuthn ceremony, redirect to `/control-room/sign-in` on miss; `both` (current as of 2026-05-16) = accept either, audit-log which path was used. Cutover from `basic` → `both` shipped 2026-05-16; flip to `passkey`-only calendar-gated for 2026-05-28+ (post-v7.9 promotion). Override with `DASHBOARD_PUBLIC=true` to disable ALL auth (local dev only). Full runbook: [`FT2 docs/setup/ucc-passkey-auth-setup-guide.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/setup/ucc-passkey-auth-setup-guide.md). |
| **2 — crawler exclusion** | `app/sitemap.ts`, `app/robots.ts` | `/control-room/*` is excluded from the sitemap and disallowed in robots.txt. Crawlers and link-preview bots can't discover the routes even if the auth gate is up. |
| **3 — build-time strip** | `next.config.ts` | When `DASHBOARD_BUILD=false`, every `/control-room/*` route rewrites to `/404` and the dashboard bundle is dropped via `webpack.IgnorePlugin`. Used for emergency takedowns or for staging environments that should never ship the dashboard at all. |

[`scripts/verify-blind-switch.sh`](scripts/verify-blind-switch.sh) runs 5 acceptance assertions across all three layers against any deploy URL:

```bash
npm run verify-blind-switch                                # against production alias
./scripts/verify-blind-switch.sh https://fitme-story-pr-X.vercel.app    # against a preview URL
```

CI runs it automatically on every PR touching `proxy.ts`, `sitemap.ts`, `robots.ts`, or `next.config.ts` via [`.github/workflows/verify-blind-switch.yml`](.github/workflows/verify-blind-switch.yml).

### Required env vars

See [`EXTRACTION-RECIPE.md`](EXTRACTION-RECIPE.md) `§ Vercel env-var setup` for the validated `vercel env add` recipe. Five vars: `DASHBOARD_PUBLIC`, `DASHBOARD_USER`, `DASHBOARD_PASS`, `DASHBOARD_BUILD`, `FITTRACKER2_DEPLOY_TOKEN`.

## Content model

Case studies live in [content/04-case-studies/](content/04-case-studies). Each MDX declares tier (`flagship` | `standard` | `light` | `appendix`) and optional `timeline_position` + `upstream_path`. The `upstream_path` field points to the canonical long-form case study in the FitTracker2 repo, and the site renders a "Read the full case study on GitHub" CTA at the bottom of every article that sets it.

Three templates render case studies based on tier:

- [FlagshipTemplate.tsx](src/components/case-study/FlagshipTemplate.tsx) — hero-lead layout with persona sidebar
- [StandardTemplate.tsx](src/components/case-study/StandardTemplate.tsx) — standard article layout
- [LightTemplate.tsx](src/components/case-study/LightTemplate.tsx) — minimal layout for appendices & deep-dives

## Home timeline

[src/components/home/Timeline.tsx](src/components/home/Timeline.tsx) renders a three-mode timeline pill:

- **Versions** — 8 framework versions (v2.0 → v7.0)
- **Case studies** — every case study with a `timeline_position`, ordered
- **Features** — curated FitMe product & framework features, each linked to its canonical case study. Defined in the `FEATURES` array in [src/lib/timeline.ts](src/lib/timeline.ts)

## Deployment notes

### 2026-04-21 — Features pill + 3 new case studies + upstream links

- Activated the home-screen **Features** pill (`timeline.ts` `FEATURES` array). It was previously disabled because `buildTimeline('features')` returned `[]`.
- Added three new case studies on framework-learning failure modes:
  - [18-dual-sync-race.mdx](content/04-case-studies/18-dual-sync-race.mdx) — the dual-backend race condition surfaced by the full-system audit
  - [19-stacked-pr-misfire.mdx](content/04-case-studies/19-stacked-pr-misfire.mdx) — when GitHub's "Merged" badge doesn't mean "on main"
  - [20-xctwaiter-abort-retry.mdx](content/04-case-studies/20-xctwaiter-abort-retry.mdx) — first M-series feature where attempt 1 was aborted
- Added a **"Read the full case study on GitHub"** CTA on all 22 curated case studies via the `upstream_path` frontmatter field and a shared [FullCaseStudyLink.tsx](src/components/case-study/FullCaseStudyLink.tsx) component.
- Redesigned the `PhaseTimingChart` hero on the onboarding pilot case study — labels moved out of the bars into a clear legend grid below (fixes overlap on narrow viewports).
- Fixed stale HADF framework-version label on the case-studies index (`v7.0` → `v7.0`) and the matching `v7` reference in the Lego PM-Flow deep-dive.
- Bumped `buildTimeline('cases')` test expectation from 13 → 17 and relaxed the `getByTier('flagship')` count assertion.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs) · [App Router](https://nextjs.org/docs/app)
- [Vercel Deployment](https://nextjs.org/docs/app/building-your-application/deploying) · [Vercel Projects](https://vercel.com/docs/projects)
