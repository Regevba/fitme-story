# Extraction Recipe — fitme-story → standalone control-room repo

> The unified-control-center dashboard lives inside fitme-story today as a
> sibling of the public showcase, gated behind basic auth via `src/proxy.ts`.
> It was designed from day one to be **extractable** — once the operator
> dashboard outgrows the showcase site or needs stricter access controls,
> this recipe takes the entire `/control-room` surface out into its own
> Next.js project.

This file is the canonical 7-step playbook for extracting `/control-room/*`
back out of fitme-story into its own repo, should that ever become
necessary (e.g., fitme-story decides to ship dashboard separately,
multi-operator support requires real auth, or the operator wants a
fully separate deployment cadence).

The dashboard was deliberately built with extraction in mind — see PRD
§7 + the ESLint reverse-import gate (`eslint.config.mjs`) that prevents
showcase code from importing dashboard code. As a result, the
extraction is mostly a `git mv` plus an environment-variable migration.

---

## 0. Prerequisites

You will need:

- Push access to `Regevba/fitme-story` (to remove dashboard code post-extraction)
- A new empty GitHub repository (suggested name: `fittracker2-control-room`)
- Vercel team access to create a new project
- The current `FITTRACKER2_DEPLOY_TOKEN` secret value (will be moved, not duplicated)
- The current `DASHBOARD_USER` + `DASHBOARD_PASS` secret values (will be moved, not duplicated)
- The current `PUBLIC_GA_ID` Vercel env var if GA continues for the dashboard
- 1+ hour of uninterrupted attention — extracting a live deploy is hard to roll back gracefully if you lose context mid-stream

Local checkouts:

```bash
git clone https://github.com/Regevba/fitme-story.git
git clone https://github.com/Regevba/fittracker2-control-room.git  # the new empty repo
```

---

## 1. Move route code (`git mv`, preserves history)

Move every file under `src/app/control-room/` from fitme-story into the new
repo. Decide first whether to keep the `/control-room` URL prefix:

- **Keep the prefix** (recommended) — bookmarks, GA4 history, and Vercel
  logs all reference `/control-room/*`. Lower-risk option.
- **Drop the prefix** — `/foo` instead of `/control-room/foo`. Cleaner
  URLs but requires stakeholder communication.

```bash
cd fittracker2-control-room
mkdir -p src/app/control-room
git mv ../fitme-story/src/app/control-room/* src/app/control-room/
```

(If dropping the prefix: `git mv ../fitme-story/src/app/control-room/* src/app/`.)

---

## 2. Move the supporting code

These directories + top-level files are the entire dashboard surface (per
PRD §7.1 — the co-location rule that's enforced by ESLint). Move them all:

```bash
git mv ../fitme-story/src/components/control-room        src/components/control-room
git mv ../fitme-story/src/lib/control-room               src/lib/control-room
git mv ../fitme-story/scripts/sync-from-fittracker2.ts          scripts/sync-from-fittracker2.ts
git mv ../fitme-story/scripts/sync-from-fittracker2.test.ts     scripts/sync-from-fittracker2.test.ts
git mv ../fitme-story/scripts/verify-blind-switch.sh            scripts/verify-blind-switch.sh
git mv ../fitme-story/src/proxy.ts                              src/proxy.ts
git mv ../fitme-story/src/data/control-room-seeds        src/data/control-room-seeds
```

Skip lines that don't apply to your state (e.g., if `src/components/control-room/`
doesn't exist yet because the UI port is incomplete, omit that move).

The synced data snapshot (`src/data/{shared,features,docs}/` and
`src/data/freshness.json`) regenerates on every prebuild — do not copy it.
The new repo's first `npm run prebuild` rebuilds it from FT2.

---

## 3. Copy minimal styling + CSS tokens

The dashboard reuses fitme-story's design tokens via `globals.css`. You have
two choices:

- **Option A (fast, recommended for first extraction):** copy the file
  verbatim. ~250 lines of CSS variables; static reference content.

  ```bash
  cp ../fitme-story/src/app/globals.css src/app/globals.css
  ```

- **Option B (cleaner long-term):** extract only the tokens the dashboard
  uses. Out of scope for first extraction — do this in a follow-up.

---

## 4. Initialize the new Next.js app + merge configs

If the new repo isn't a Next.js app yet:

```bash
npx create-next-app@latest . --typescript --eslint --app --no-tailwind --no-src-dir --import-alias '@/*'
```

Copy these top-level files from fitme-story (they configure the build +
the privacy gate):

```bash
cp ../fitme-story/next.config.ts        next.config.ts
cp ../fitme-story/tsconfig.json         tsconfig.json
cp ../fitme-story/eslint.config.mjs     eslint.config.mjs
cp ../fitme-story/postcss.config.mjs    postcss.config.mjs   # if present
```

**Edit `next.config.ts`** to remove fitme-story-specific configuration
(MDX handling, content collection, redirects, etc.). **Keep** the
`DASHBOARD_BUILD` env-var rewrite to `/404` (Layer 3 of the privacy gate)
and any `webpack.IgnorePlugin` used to drop the dashboard bundle on
`DASHBOARD_BUILD=false` builds.

**Edit `eslint.config.mjs`** to drop the reverse-import rule. The rule
prevents fitme-story showcase code from importing dashboard code; in the
standalone repo there is no showcase to import from.

**Merge dependencies.** From `fitme-story/package.json`, copy these into
the new `package.json`:

- `next`, `react`, `react-dom` (version match)
- `tsx` (devDependency — runs the sync script + tests)
- `@tailwindcss/postcss` + `tailwindcss` (devDependencies if `globals.css`
  uses Tailwind directives)

**Add scripts** to `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "prebuild": "tsx scripts/sync-from-fittracker2.ts",
  "test": "tsx --test 'scripts/*.test.ts' 'src/**/*.test.ts'",
  "verify-blind-switch": "bash scripts/verify-blind-switch.sh"
}
```

---

## 5. Create the new Vercel project + move secrets

In the Vercel dashboard:

1. Create a new project pointing at the new GitHub repo
2. Set framework preset = Next.js, install command = `npm install`,
   build command = `npm run build` (default — the `prebuild` hook fires
   automatically before)
3. Copy fitme-story's `vercel.json` (clones FT2 with the deploy token
   before build):
   ```bash
   cp ../fitme-story/vercel.json vercel.json
   ```
4. Move secrets via the Vercel CLI — see the **Vercel env-var setup (T14 — done)**
   section below for the validated commands. Move these five env vars
   from the fitme-story Vercel project to the new project:
   - `FITTRACKER2_DEPLOY_TOKEN`
   - `DASHBOARD_USER`, `DASHBOARD_PASS`
   - `DASHBOARD_PUBLIC`, `DASHBOARD_BUILD`
   - `PUBLIC_GA_ID` (if GA continues for the dashboard)
5. Trigger the first deploy: `vercel --prod`. Wait for green and verify:
   ```bash
   ./scripts/verify-blind-switch.sh https://<new-project>.vercel.app
   ```
   Expect: `5 passed, 0 failed`.

---

## 6. Decommission the dashboard from fitme-story

Once the new project is verified green at its own URL (e.g.,
`fittracker2-control-room.vercel.app`):

```bash
cd ../fitme-story
git checkout -b chore/decom-control-room

git rm -r src/app/control-room
git rm -r src/components/control-room        # if present
git rm -r src/lib/control-room
git rm scripts/sync-from-fittracker2.ts
git rm scripts/sync-from-fittracker2.test.ts
git rm scripts/verify-blind-switch.sh
git rm src/proxy.ts
git rm -r src/data/{shared,features,docs,control-room-seeds}
git rm src/data/freshness.json
```

Edit fitme-story's `package.json`:

- Remove the `prebuild` script (the sync was control-room-only)
- Remove `verify-blind-switch` script
- Remove `tsx` from devDependencies if no other script uses it
  (`grep -r 'tsx' package.json scripts/` first to confirm)

Edit fitme-story's `next.config.ts` to drop the `DASHBOARD_BUILD` rewrite
and `IgnorePlugin`.

Edit fitme-story's `eslint.config.mjs` to drop the reverse-import rule
(no `*/control-room/*` exists to import from).

Edit fitme-story's `vercel.json` to remove the FT2-clone build command —
fitme-story no longer needs FT2 at build time.

Remove these env vars from the fitme-story Vercel project:

```bash
vercel env rm FITTRACKER2_DEPLOY_TOKEN production
vercel env rm DASHBOARD_USER production
vercel env rm DASHBOARD_PASS production
vercel env rm DASHBOARD_PUBLIC production
vercel env rm DASHBOARD_BUILD production
# PUBLIC_GA_ID: only if dashboard was the sole consumer; fitme-story
# showcase uses NEXT_PUBLIC_GA_ID separately, so check first.
```

Repeat for `preview` + `development` if those environments had them set.

Open the decom PR. Land it after the new project has been live for ≥ 24h
with no regressions.

---

## 7. Set up cross-domain redirect (optional)

If `fitme-story.vercel.app/control-room/*` was a known operator URL,
redirect it to the new project to preserve bookmarks. In fitme-story's
`next.config.ts`:

```ts
async redirects() {
  return [
    {
      source: '/control-room/:path*',
      destination: 'https://fittracker2-control-room.vercel.app/control-room/:path*',
      permanent: true,
    },
  ];
}
```

Land this in the same PR as Step 6's decommission.

---

## Verification

Two checks must pass for the extraction to be considered successful.

### 1. Extracted dashboard builds + privacy gate intact

From the new repo:

```bash
npm install
npm run prebuild       # syncs FT2 data
npm run build          # full Next.js production build
npm run verify-blind-switch http://localhost:3000   # 5 acceptance assertions on layered privacy
```

All three must exit 0.

### 2. Manual-trigger CI workflow (`extraction-recipe-test`)

`.github/workflows/extraction-recipe-test.yml` runs the entire recipe
end-to-end in a scratch directory on demand. Trigger via:

```bash
gh workflow run extraction-recipe-test.yml
```

The workflow:

1. Checks out fitme-story
2. Creates a tmp directory simulating the new dashboard repo
3. Runs steps 1-4 of this recipe via shell commands (file moves + minimal config)
4. Runs `npm install && npm run build` in the tmp directory
5. Runs `verify-blind-switch.sh` against the local build
6. Passes if and only if both succeed

**The CI job is manual-trigger only**, not on every PR — running the
recipe is expensive (full npm install + Next.js build) and the recipe
tracks a separate concern from feature-PR review.

---

## Rollback if the new project deploy fails

If Step 5's first deploy fails:

1. **Don't proceed to Step 6 yet.** The dashboard is still live in
   fitme-story; you have a working fallback.
2. Investigate via `vercel logs <deployment-url>`.
3. Common failures + fixes:
   - **Sync script fails**: `FITTRACKER2_DEPLOY_TOKEN` not set or expired
     → re-add via `vercel env add` (see § Vercel env-var setup below).
   - **`DASHBOARD_BUILD` undefined**: missed in Step 5 → add it
     (set to `"true"`).
   - **`DASHBOARD_PUBLIC` defaults to gated, build can't render**:
     set it to `"true"` for an initial public-mode smoke-test, then
     re-tighten by setting it to `"false"` after the auth gate is verified.
   - **Webpack build fails on missing fitme-story import**: a stray
     import inside `src/lib/control-room/*` referencing
     `@/components/...` (showcase) — refactor to inline or copy the
     missing component. The ESLint rule should have caught this earlier;
     if it slipped through, file a bug.
4. Once green, proceed to Step 6.

If Step 6's decom PR is merged but the new project is later found broken,
the rollback is a `git revert` of the decom PR. The dashboard code is
preserved in fitme-story git history and can be restored.

---

## Architectural invariants this recipe depends on

If any of these break, the recipe needs updating:

1. **Dashboard code lives only under** `src/app/control-room/`,
   `src/components/control-room/`, `src/lib/control-room/`,
   `scripts/sync-from-fittracker2.ts`, `scripts/sync-from-fittracker2.test.ts`,
   `scripts/verify-blind-switch.sh`, `src/proxy.ts`,
   `src/data/control-room-seeds/`. **No dashboard code anywhere else** in
   fitme-story.
2. **No reverse imports**: showcase code (everything outside
   `*/control-room/*`) does not import from any `*/control-room/*` path.
   Enforced by ESLint rule in `eslint.config.mjs`.
3. **The sync snapshot is regenerable**: `src/data/{shared,features,docs}/`
   and `src/data/freshness.json` are produced by `npm run prebuild` and
   should not be edited by hand. Anything hand-edited gets blown away on
   the next prebuild.
4. **The privacy gate is layered**: `src/proxy.ts` (basic auth),
   `app/sitemap.ts` + `app/robots.ts` (crawler exclusion),
   `next.config.ts` (`DASHBOARD_BUILD=false` rewrites to /404). All
   three must move together; `verify-blind-switch.sh` tests all three.
5. **Static seeds (`features.json`, `caseStudies.json`)** live in
   `src/data/control-room-seeds/`. They're committed (no clean sync
   source today). If they get promoted to the synced shared layer in
   the future, this recipe's Step 2 can drop them.

---

## Vercel env-var setup (T14 — done)

The control-room route requires **5 environment variables** on the Vercel
project. Three control the blind-switch (PRD §6), one provides
basic-auth credentials, and one provides the FitTracker2 read token for
the pre-build sync (PRD §6.3, Pattern 4.b Option B).

### Required env vars

| Name | Required for | Type | Default if absent | Set on |
|---|---|---|---|---|
| `DASHBOARD_PUBLIC` | Layer 1 (proxy.ts) | `"true"` or anything else | `"false"` (treats as gated) | Production + Preview + Development |
| `DASHBOARD_USER` | Layer 1 (proxy.ts) basic-auth username | string | (build fails closed: rejects all requests when DASHBOARD_PUBLIC ≠ "true") | Production + Preview + Development |
| `DASHBOARD_PASS` | Layer 1 (proxy.ts) basic-auth password | sensitive string | (build fails closed) | Production + Preview + Development |
| `DASHBOARD_BUILD` | Layer 3 (next.config.ts) — set `"false"` to rewrite `/control-room/*` to `/404` | `"true"` or anything else | `"true"` (dashboard included) | Production + Preview + Development |
| `FITTRACKER2_DEPLOY_TOKEN` | Pattern 4.b Option B — used by `vercel.json buildCommand` to clone FitTracker2 at build time | sensitive (`github_pat_*`) | (build falls back to Option A — committed `src/data/` snapshot; see § fallback) | Production (minimum); Preview + Development optional |

### How to set them

#### Step 1 — Generate `FITTRACKER2_DEPLOY_TOKEN`

A **fine-grained GitHub PAT** scoped to `Regevba/FitTracker2` Contents
read-only. Other tokens cause unnecessary blast-radius if leaked.

1. https://github.com/settings/personal-access-tokens/new
2. Configure:
   - **Token name:** `vercel-fitme-story-ft2-readonly`
   - **Expiration:** 90 days (calendar reminder for rotation)
   - **Resource owner:** `Regevba`
   - **Repository access:** "Only select repositories" → `FitTracker2`
   - **Repository permissions:** `Contents: Read-only`
     (Metadata: Read-only is auto-added)
3. Generate token → copy `github_pat_*` immediately
4. Stage the token securely on your local machine:
   ```zsh
   read -s "?GitHub PAT: " p && echo -n "$p" > /tmp/.ftpat && chmod 600 /tmp/.ftpat && unset p && echo "saved"
   ```

#### Step 2 — Generate `DASHBOARD_PASS`

Use your password manager to generate a 30+ character random string.
Save it to your password manager FIRST (you cannot recover it from
Vercel afterwards — it's stored encrypted). Then stage it for upload:

```zsh
read -s "?Dashboard password: " p && echo -n "$p" > /tmp/.dashpass && chmod 600 /tmp/.dashpass && unset p && echo "saved"
```

#### Step 3 — Set the non-secret vars

```bash
cd <fitme-story-root>

# Set on Production + Development (Preview see § Vercel CLI quirks below)
for env in production development; do
  echo "false" | vercel env add DASHBOARD_PUBLIC "$env" --scope <team-scope>
  echo "regev"  | vercel env add DASHBOARD_USER  "$env" --scope <team-scope>
  echo "true"  | vercel env add DASHBOARD_BUILD "$env" --scope <team-scope>
done
```

#### Step 4 — Set the secrets

```bash
# Production (the only one that matters for live deploys)
cat /tmp/.dashpass | vercel env add DASHBOARD_PASS production --sensitive --scope <team-scope>
cat /tmp/.ftpat   | vercel env add FITTRACKER2_DEPLOY_TOKEN production --sensitive --scope <team-scope>

# Securely delete the temp files
rm -P /tmp/.dashpass /tmp/.ftpat
```

#### Step 5 — Add the build command

In `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "git clone --depth=1 --quiet https://oauth2:$FITTRACKER2_DEPLOY_TOKEN@github.com/Regevba/FitTracker2.git ../FitTracker2 && npm run build"
}
```

#### Step 6 — Verify

```bash
vercel deploy --prod --yes --scope <team-scope>
# Expect build logs to contain: ✓ synced FitTracker2 → fitme-story: 33 shared + 43 features
./scripts/verify-blind-switch.sh https://<project>.vercel.app
# Expect: 5 passed, 0 failed
```

### Vercel CLI quirks (worth knowing)

Setting env vars on `Preview` and `Development` environments fails with
the CLI used during T14 (`vercel@51.6.1`) when the project has Custom
Environments configured. The error is:

```json
{
  "status": "action_required",
  "reason": "git_branch_required",
  "message": "Add NAME to which Git branch for Preview? ..."
}
```

Even passing `--yes --value VALUE` per the CLI's own hint reproduces the
same prompt. **Workaround for now:** set Production only via CLI; if
Preview/Dev coverage is needed, set them via the Vercel dashboard UI.
Production is what live deploys read, so the dashboard works fine
without Preview/Dev coverage.

This may be fixed in a later CLI version; re-test before assuming the
workaround is still needed.

A second known quirk (T2-baseline-prep session, 2026-04-28): piping the
value via `printf` or `echo` can save with a trailing newline (`echo`)
or as an empty string (some `printf` versions). Type the value
interactively at the prompt to be safe; verify with `vercel env pull`.

### Fallback: Pattern 4.b Option A (committed snapshot)

If `FITTRACKER2_DEPLOY_TOKEN` is missing, expired, or GitHub is down at
build time, `scripts/sync-from-fittracker2.ts` gracefully falls back to
the committed `src/data/{shared,features}/` snapshot. The build still
succeeds; `freshness.json` simply shows the timestamp of the last
local `npm run prebuild && git commit -am 'refresh snapshot'`.

To refresh the snapshot manually:

```bash
cd <fitme-story-root>
npm run prebuild
git add src/data/ && git commit -m "chore: refresh dashboard data snapshot"
git push
```

This is also the path you'd use if you wanted to remove the
`vercel.json buildCommand` entirely (Option B → Option A migration) —
just delete `vercel.json` and start refreshing the snapshot manually
before each deploy.

### Rotation cadence

`FITTRACKER2_DEPLOY_TOKEN` expires every 90 days (per the PAT setup
above). Rotation playbook:

1. Generate a new PAT with the same name + permissions (Step 1 above)
2. Stage it: `read -s "?GitHub PAT: " p && ...` (Step 1.4 above)
3. Replace the Vercel value:
   ```bash
   vercel env rm FITTRACKER2_DEPLOY_TOKEN production --yes --scope <team-scope>
   cat /tmp/.ftpat | vercel env add FITTRACKER2_DEPLOY_TOKEN production --sensitive --scope <team-scope>
   rm -P /tmp/.ftpat
   ```
4. Trigger a redeploy: `vercel deploy --prod --yes --scope <team-scope>`
5. Revoke the OLD PAT at https://github.com/settings/personal-access-tokens
6. Schedule a calendar reminder for 80 days from new generation

A scheduled remote agent (`Rotate FITTRACKER2_DEPLOY_TOKEN reminder`)
fires 10 days before expiry and opens a GitHub issue with these steps —
see `.claude/features/unified-control-center/state.json` for the
trigger ID.

`DASHBOARD_PASS` doesn't expire automatically. Rotate when:

- Anyone other than the operator has seen it
- After leaving a job / changing roles
- On a quarterly hygiene cadence if you want belt-and-suspenders

---

## References

- Architecture decision: `.claude/features/unified-control-center/prd.md` §7
- Privacy gate: `scripts/verify-blind-switch.sh`, `src/proxy.ts`, `next.config.ts`
- Sync script: `scripts/sync-from-fittracker2.ts`
- Reverse-import rule: `eslint.config.mjs`
- Tracked as task **T39** in `.claude/features/unified-control-center/state.json`. Manual-trigger CI workflow `verify-blind-switch.yml` is **T12** (already shipped at `.github/workflows/verify-blind-switch.yml`); the `extraction-recipe-test` workflow is a separate follow-up if and when the recipe is exercised.

## Provenance

- T14 (env-var section) authored 2026-04-27 by claude_opus_4_7
- T39 (full 7-step playbook + verification + invariants) authored 2026-04-30 by claude_opus_4_7
- T14 validated against: live Production deploy of fitme-story.vercel.app (passing 5/5 verify-blind-switch.sh assertions as of session 2026-04-28)
- T39 validated by: code review against `src/proxy.ts`, `next.config.ts`, `eslint.config.mjs`, `vercel.json`, `package.json`, `scripts/sync-from-fittracker2.ts`. Recipe **not yet end-to-end exercised** in a live extraction; first run will surface any drift.
