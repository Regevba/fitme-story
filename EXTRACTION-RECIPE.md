# Extraction Recipe — fitme-story → standalone control-room repo

> **Status: skeleton.** Only the **env-var setup** section (T14) is
> filled in. The full 7-step playbook is **T39** of the
> unified-control-center feature. Until T39 lands, sections marked
> "🚧 T39" are placeholders.

This file is the playbook for extracting the `/control-room/*` route
back out of fitme-story into its own repo, should that ever become
necessary (e.g., fitme-story decides to ship dashboard separately,
multi-operator support requires real auth, or the operator wants a
fully separate deployment cadence).

The dashboard was deliberately built with extraction in mind — see PRD
§7.2 "extraction-readiness rule" + the ESLint reverse-import gate
(`eslint.config.mjs`) that prevents showcase code from importing
dashboard code. As a result, the extraction is mostly a `git mv` plus
an environment-variable migration.

## 🚧 T39 — overview & full step list (placeholder)

The 7-step playbook will live here once T39 ships. Skeleton:

1. Spin up new Vercel project + connect to extracted repo.
2. `git mv` the dashboard files (preserves history).
3. Drop the showcase-only files; rebuild minimal Next.js app shell.
4. Re-create environment variables (see § Vercel env-var setup below).
5. Re-create the build command (see § Vercel env-var setup below).
6. Re-deploy + run `verify-blind-switch.sh` against the new URL.
7. Update DNS / fit-tracker2.vercel.app redirect to point at the new project.

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

## 🚧 T39 — additional sections (placeholders)

- Repository structure for the extracted standalone repo
- Component dependency map (which fitme-story shared components the dashboard imports)
- DNS / redirect cutover playbook
- Rollback procedure if the extracted repo has problems
- Cost implications (separate Vercel project = separate billing scope)
- Operator handoff checklist (passwords, PATs, who to add to Vercel team)

## Provenance

- T14 (env-var section) authored: 2026-04-27 by claude_opus_4_7
- Validated against: live Production deploy of fitme-story.vercel.app
- Source for vars: `src/proxy.ts`, `next.config.ts`, `scripts/sync-from-fittracker2.ts`, `vercel.json`
- T39 (full playbook) — TBD
