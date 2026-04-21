# fitme-story

Next.js 16 site that narrates the FitMe PM-framework evolution through a timeline, case studies, and interactive diagrams. Source of truth for the shorter narrative versions; full case studies live upstream in [Regevba/FitTracker2/docs/case-studies](https://github.com/Regevba/FitTracker2/tree/main/docs/case-studies).

Production: [fitme-story.vercel.app](https://fitme-story.vercel.app)

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
