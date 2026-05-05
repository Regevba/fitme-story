# fitme-story

Next.js 16 site that narrates the FitMe PM-framework evolution through a timeline, case studies, and interactive diagrams. Source of truth for the shorter narrative versions; full case studies live upstream in [Regevba/FitTracker2/docs/case-studies](https://github.com/Regevba/FitTracker2/tree/main/docs/case-studies).

Production: [fitme-story.vercel.app](https://fitme-story.vercel.app)

> **Latest at v7.6 (Mechanical Enforcement, shipped 2026-04-25):**
>
> - [Case study (Light template)](https://fitme-story.vercel.app/case-studies/mechanical-enforcement-v7-6) — outlier-flagged, summary card, 7 Class B → A promotions, 5 documented Class B gaps, honest tooling attribution.
> - [Developer guide (technical, dev-only)](https://fitme-story.vercel.app/framework/dev-guide) — 745 lines covering 4 enforcement layers, `state.json` schema, phase lifecycle, dispatch model, cache architecture, measurement protocol, 12 integrity check codes, 3 operational walkthroughs. Vendored mirror of [`docs/architecture/dev-guide-v1-to-v7-6.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/architecture/dev-guide-v1-to-v7-6.md) on FitTracker2.
> - [Trust page Gemini-audit subroute](https://fitme-story.vercel.app/trust/audits/2026-04-21-gemini) — verbatim audit + appended response section linking the case study, the dev guide, and [Tier 3.3 invitation issue #142](https://github.com/Regevba/FitTracker2/issues/142).

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
| **1 — basic-auth proxy** | [`src/proxy.ts`](src/proxy.ts) | Intercepts every request to `/control-room/*`. Requires `DASHBOARD_USER` + `DASHBOARD_PASS` env vars; rejects unauthenticated requests with HTTP 401. Override with `DASHBOARD_PUBLIC=true` to disable auth (e.g., for a temporary public-mode demo). |
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
