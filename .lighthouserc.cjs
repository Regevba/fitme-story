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

// Probe target: 'preview' (default — CI deployment_status flow) or
// 'production' (operator-triggered via workflow_dispatch). Vercel preview
// deploys auto-emit `X-Robots-Tag: noindex` to prevent preview-URL indexing
// — correct + desirable, but Lighthouse's `is-crawlable` audit scores 0
// for any noindex response, dragging the SEO category from ~1.0 down to
// ~0.63. The audit is suppressed on preview runs to expose the real SEO
// signal underneath. Production runs (no bypass header, no noindex) keep
// it enforced.
const isProductionTarget = process.env.LIGHTHOUSE_TARGET === 'production';

const assertions = {
  'categories:performance': ['warn', { minScore: 0.8 }],
  'categories:accessibility': ['warn', { minScore: 0.9 }],
  'categories:best-practices': ['warn', { minScore: 0.9 }],
  'categories:seo': ['warn', { minScore: 0.9 }],
};

if (!isProductionTarget) {
  // Preview deploys: suppress the is-crawlable audit. It returns score=0
  // because Vercel adds `X-Robots-Tag: noindex` to preview URLs by design
  // (preview content must never be indexed). Including this audit in the
  // SEO category score makes the warning fire on every preview regardless
  // of actual SEO health, drowning out real regressions. Production runs
  // re-enable it implicitly (set LIGHTHOUSE_TARGET=production).
  //
  // The other SEO audits (robots-txt, image-alt, structured-data) remain
  // active and feed into the category score.
  assertions['is-crawlable'] = 'off';
}

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: bypass
        ? { extraHeaders: JSON.stringify({ 'x-vercel-protection-bypass': bypass }) }
        : {},
    },
    assert: { assertions },
    upload: {
      // Keep reports private — the probed URLs carry the SSO-bypass context, so
      // do NOT use temporary-public-storage. The workflow uploads ./.lighthouseci
      // as a private GitHub artifact instead.
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
