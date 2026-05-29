// Lighthouse-CI config — Linear FIT-193 (PERF-1→6 bucket, 2026-05-29).
//
// Advisory v1: every assertion is `warn`, so the lighthouse-ci workflow
// surfaces perf / a11y / best-practices / seo regressions for review WITHOUT
// blocking a merge while budgets calibrate. Promote individual assertions to
// `error` once a stable baseline is observed across a few preview deploys.
//
// Runs against Vercel preview deploys (see .github/workflows/lighthouse-ci.yml),
// mirroring verify-blind-switch.yml's `deployment_status` idiom — no Next.js
// build happens in CI; we probe the real deploy.

// Vercel SSO (ssoProtection: all_except_custom_domains) gates every preview
// URL. Without this header Lighthouse hits the SSO challenge page instead of
// the app and every score is meaningless. Same secret verify-blind-switch.yml
// uses; injected via the workflow step env. May be undefined locally — then
// no header is sent (fine for a custom-domain / production run).
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: bypass
        ? { extraHeaders: JSON.stringify({ 'x-vercel-protection-bypass': bypass }) }
        : {},
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      // Keep reports private — the probed URLs carry the SSO-bypass context, so
      // do NOT use temporary-public-storage. The workflow uploads ./.lighthouseci
      // as a private GitHub artifact instead.
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
