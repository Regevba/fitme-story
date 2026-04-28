// Hardcoded v7.5 Data Integrity Framework content used by both preview pages.
// Source of truth: docs/case-studies/data-integrity-framework-v7.5-case-study.md (FitTracker2).
// This file is throwaway demo data — only exists to render the two presentation
// alternatives so the user can compare. If an alternative is picked, the real
// implementation will read from .md via the content pipeline.

export const v75Meta = {
  title: 'Data Integrity Framework — v7.5',
  version: 'v7.1 → v7.5',
  shipDate: '2026-04-24',
  workType: 'Framework infrastructure',
  dispatchPattern: 'Mostly serial across multiple sessions',
  trigger: 'Google Gemini 2.5 Pro independent audit (2026-04-21)',
  readingTime: '15 min read',
  tldr: 'An independent audit surfaced eight cooperating defenses that now catch broken data at write-time, cycle-time, and readout-time. Seven shipped; one is external-blocked; honest-status labels are the new default.',
} as const;

export const v75KeyNumbers = [
  {
    label: 'Tier recommendations shipped',
    value: '7 of 8',
    tier: 'T1' as const,
  },
  {
    label: 'Auditor check codes',
    value: '8 → 11',
    tier: 'T1' as const,
  },
  {
    label: 'Integrity findings (corpus baseline)',
    value: '0 across 40 features + 46 case studies',
    tier: 'T1' as const,
  },
];

export const v75HonestDisclosures = [
  '`cache_hits[]` populated in 0/40 features — v6.0 schema exists, writer path not exercised. Tracked at issue #140.',
  'Tier 3.2 trend mode awaits 3 scheduled cycle snapshots (~9 days wall-clock); baseline mode usable now.',
  'Tier 3.3 (external replication) cannot be self-executed; remains backlog.',
];

export const v75DeferredItems = [
  {
    title: 'cache_hits writer path',
    ledger: 'issue #140',
    reason: 'v6.0 schema exists; no session writer appends',
  },
  {
    title: 'Tier 3.2 trend mode',
    ledger: '.claude/integrity/snapshots/',
    reason: 'wall-clock — needs 3 scheduled 72h snapshots',
  },
  {
    title: 'Tier 3.3 external replication',
    ledger: 'backlog',
    reason: 'cannot be self-executed; needs independent operator',
  },
];

export const v75KillCriteria = {
  threshold:
    "Any integrity-cycle regression that can't be resolved in-repo triggers an on-demand external audit",
  fired: false,
  evidence: 'None triggered to date',
};

export const v75SuccessMetrics = {
  primary:
    'Integrity cycle findings: 0 across 40 features + 46 case studies (preserved through 20+ commits)',
  secondary: [
    'Schema drift gated at write-time: 0 violations',
    'PR citations gated at write-time: 0 false-resolutions',
    '5 contemporaneous feature logs active (was 0)',
  ],
};

// =============================================================================
// Long-form narrative body — JSX rendering of the existing v7.5 case study
// (transcribed from data-integrity-framework-v7.5-case-study.md sections 1–9).
// Used by Alternative A inline; collapsed under disclosure in Alternative B.
// =============================================================================
export function LongFormBody() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">
      <h2>1. Why This Case Study Exists</h2>
      <p>
        The v7.1 Integrity Cycle (2026-04-21) shipped self-observation: a 72h
        GitHub Actions job that audits every <code>state.json</code> for drift.
        The same week the cycle shipped, a different kind of audit was delivered
        — Google Gemini 2.5 Pro, a model from a different vendor with no
        production hand in the project, reviewed the project&apos;s entire
        case-study corpus and meta-analyses as an independent check.
      </p>
      <p>The audit&apos;s central finding was a bifurcation:</p>
      <ul>
        <li>
          <strong>Methodologically strong:</strong> the project documents its
          process rigorously, including failures and regressions
        </li>
        <li>
          <strong>Empirically weak:</strong> pre-v6.0 quantitative claims were
          estimates and narrative inference; cache-hit rates were 0%
          instrumented; the whole dataset came from a single practitioner which
          couldn&apos;t separate framework improvement from individual learning
        </li>
      </ul>
      <p>
        Gemini&apos;s remediation list contained 9 concrete Tier 1/2/3
        recommendations. Reading them with fresh eyes after the 2026-04-21 ship
        surfaced the uncomfortable observation:{' '}
        <strong>
          the project had shipped extensive measurement infrastructure without a
          measurement of its own measurement adoption
        </strong>
        . The v7.1 integrity cycle audited <em>state drift</em> but not{' '}
        <em>instrumentation adoption</em>. Data flowed through the corpus
        without gates validating the data at its source.
      </p>
      <p>
        v7.5 closes that loop. It is the Data Integrity Framework: eight
        cooperating defenses that catch broken data at write-time, cycle-time,
        and readout-time, and that make the gaps visible in machine-readable
        ledgers rather than narrative hedges.
      </p>

      <h2>2. The Gemini Audit — Inputs, Process, and a Learning-Loop Discovery</h2>
      <h3>2.1 The audit input</h3>
      <p>Gemini was given:</p>
      <ul>
        <li>
          The internal structural meta-analysis (
          <code>docs/case-studies/meta-analysis/meta-analysis-2026-04-21.md</code>
          ) — 41 case-study files audited for structural integrity (PR citations,
          state.json schema, dispatch declaration, etc.)
        </li>
        <li>
          The 24 showcase narrative case studies (
          <code>fitme-story/04-case-studies/</code>)
        </li>
        <li>Two earlier velocity-focused meta-analyses (2026-04-16)</li>
      </ul>

      <h3>2.2 The discovery: a false positive Gemini propagated</h3>
      <p>
        The internal structural meta-analysis had flagged three PR citations as
        &quot;non-existent&quot;: <code>#51</code>, <code>#69</code>,{' '}
        <code>#70</code>. Gemini, given the meta-analysis as evidence, repeated
        the finding in its own output with the correct meta-evaluation
        (&quot;demonstrating factual errors in the evidence cited weakens the
        original claims&quot;).
      </p>
      <p>
        <strong>
          Same-day verification showed all three were real GitHub issues
        </strong>
        , not PRs. The meta-analysis&apos;s regex was too permissive (matched
        bare <code>#NNN</code>). Gemini had no mechanism to re-run the{' '}
        <code>gh pr view</code> queries and so inherited the flaw.
      </p>
      <p>This discovery became the seed of v7.5&apos;s policy:</p>
      <ol>
        <li>
          <strong>Publish verbatim, append corrections.</strong> Both the
          internal meta-analysis and the audit archive retain the original
          flawed finding alongside the same-day correction.
        </li>
        <li>
          <strong>Narrow regex by construction.</strong> The Auditor Agent&apos;s{' '}
          <code>BROKEN_PR_CITATION</code> check that shipped as part of v7.5
          uses a tighter <code>PR #N|pull/N</code> regex.
        </li>
      </ol>
      <p>
        The policy — and the regex it inspired — protect against exactly the
        class of bug that seeded the policy. That reflexive structure is
        characteristic of the v7.5 work.
      </p>

      <h2>3. The Eight Defenses of v7.5</h2>
      <p>
        Each Tier recommendation from Gemini&apos;s list maps to one defense.
        Six are shipped, two are structurally complete but gated on external
        factors, one requires an independent operator.
      </p>

      <h3>3.1 Tier 1.1 — Measurement adoption, made auditable</h3>
      <p>
        <strong>Before:</strong> &quot;Partial — v6.0 measurement protocols
        shipped; system-wide adoption unclear.&quot;
      </p>
      <p>
        <strong>After (v7.5):</strong> <code>make measurement-adoption</code>{' '}
        produces <code>.claude/shared/measurement-adoption.json</code> — a
        per-feature × per-dimension coverage table. Status becomes{' '}
        <strong>&quot;Partial, measured with known delta.&quot;</strong>
      </p>
      <p>
        The ledger exposed a finding that the narrative &quot;partial&quot;
        label had obscured:{' '}
        <strong>
          <code>cache_hits</code> is populated in 0 of 40 features
        </strong>
        . The v6.0 protocol defined the data structure but no session writer
        actually appends cache-hit data.
      </p>

      <h3>3.2 Tier 1.2 — PR-as-source-of-truth, at both write-time and cycle-time</h3>
      <p>
        <code>scripts/check-state-schema.py</code> was extended to verify{' '}
        <code>phases.merge.pr_number</code> via <code>gh pr view</code> on every
        staged <code>state.json</code> commit. The pre-commit hook now fires
        this check before a feature can record a PR that does not resolve.
      </p>

      <h3>3.3 Tier 1.3 — Schema enforcement on write</h3>
      <p>
        <code>SCHEMA_DRIFT</code> (legacy <code>phase</code> key instead of
        canonical <code>current_phase</code>) is rejected by{' '}
        <code>.githooks/pre-commit</code>. <code>make install-hooks</code> sets{' '}
        <code>core.hooksPath</code> — idempotent. Two legacy violators (
        <code>hadf-infrastructure</code>, <code>meta-analysis-audit</code>) were
        migrated in the same commit that shipped the hook.
      </p>

      <h3>3.4 Tier 2.1 — Runtime smoke gates</h3>
      <p>
        <code>scripts/runtime-smoke-gate.py</code> +{' '}
        <code>make runtime-smoke PROFILE=&lt;id&gt; MODE=&lt;local|staging&gt;</code>{' '}
        runs XCUITest smoke profiles against Staging and reports secret-safe
        status. Five profiles shipped. The remaining step is a 7-step
        real-provider manual checklist driven by a human on a simulator.
      </p>

      <h3>3.5 Tier 2.2 — Contemporaneous logging (pilot active)</h3>
      <p>
        <code>scripts/append-feature-log.py</code> writes append-only events to{' '}
        <code>.claude/logs/&lt;feature&gt;.log.json</code>. Hardened on
        2026-04-23 to reject silent backdating. Five active logs at v7.5 ship.
      </p>

      <h3>3.6 Tier 2.3 — Data quality tiers (shipped)</h3>
      <p>
        T1/T2/T3 labels (Instrumented / Declared / Narrative) must be applied to
        every quantitative metric in a case study, PRD, or meta-analysis. The
        case-study template header requires the convention.
      </p>

      <h3>3.7 Tier 3.1 — Independent Auditor Agent (shipped + hardened)</h3>
      <p>
        11 check codes (added <code>SCHEMA_DRIFT</code>,{' '}
        <code>BROKEN_PR_CITATION</code>, <code>PR_NUMBER_UNRESOLVED</code>) +
        2026-04-23 workflow hardening (<code>set -o pipefail</code>,{' '}
        <code>snapshot_context</code> metadata, narrow regression detection).
      </p>

      <h3>3.8 Tier 3.2 — Documentation-debt dashboard (baseline)</h3>
      <p>
        <code>make documentation-debt</code> produces{' '}
        <code>.claude/shared/documentation-debt.json</code> — 7 open debt items
        across 6 coverage dimensions. Trend mode requires 3 scheduled 72h cycle
        snapshots with the v7.5-compatible <code>counts_for_trend</code>{' '}
        metadata.
      </p>

      <h2>4. What Earned the Bump from v7.1 to v7.5</h2>
      <p>
        v7.1 shipped the first wall-clock-triggered framework capability (72h
        integrity cycle). v7.5 compounds that foundation with seven new
        capabilities that together form a coherent &quot;data integrity
        framework&quot;. The version jump from v7.1 → v7.5 skips v7.2, v7.3,
        v7.4. That&apos;s intentional: these eight capabilities are not
        independent — they compose a single data-integrity surface.
      </p>

      <table>
        <thead>
          <tr>
            <th>Capability</th>
            <th>v7.1</th>
            <th>v7.5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>state.json schema enforced</td>
            <td>Post-hoc (cycle)</td>
            <td>Pre-commit hook + cycle</td>
          </tr>
          <tr>
            <td>PR citations validated</td>
            <td>Post-hoc (cycle)</td>
            <td>Pre-commit hook + cycle</td>
          </tr>
          <tr>
            <td>Auditor Agent check codes</td>
            <td>8</td>
            <td>11</td>
          </tr>
          <tr>
            <td>Runtime verification</td>
            <td>None</td>
            <td>5 smoke profiles + staging harness</td>
          </tr>
          <tr>
            <td>Feature logs</td>
            <td>None</td>
            <td>5 active (pilot)</td>
          </tr>
          <tr>
            <td>Data provenance</td>
            <td>Implicit</td>
            <td>T1/T2/T3 labels mandatory</td>
          </tr>
          <tr>
            <td>Docs-debt dashboard</td>
            <td>None</td>
            <td>Baseline ledger published</td>
          </tr>
          <tr>
            <td>Measurement adoption ledger</td>
            <td>None</td>
            <td>Published with honest delta</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Lessons</h2>
      <h3>5.1 An independent audit that propagates an error from its input is still valuable</h3>
      <p>
        Gemini inherited a false positive from the structural meta-analysis it
        was given. Discovering and correcting the false positive same-day
        generated more insight than a clean audit would have — it proved the
        &quot;publish verbatim, append corrections&quot; policy works in
        practice, inspired the narrow-regex Auditor Agent check, and made the
        internal meta-analysis&apos;s precision gap visible.
      </p>
      <h3>5.2 &quot;Partial&quot; is a lossy label; make it a ledger</h3>
      <p>
        Gemini&apos;s Tier 1.1 status was &quot;partial.&quot; That word does
        very little work. <code>make measurement-adoption</code> converts the
        same state into a per-feature × per-dimension coverage table with an
        explicit <code>cache_hits: 0/40</code> row.
      </p>
      <h3>5.3 Write-time gates + cycle-time gates are complementary</h3>
      <p>
        Pre-commit hooks catch bad data before it lands. The 72h cycle catches
        drift that accumulates around the gates. Neither alone is sufficient.
      </p>
      <h3>5.4 The framework audits itself now, and audits the audits</h3>
      <p>
        Before v7.5: the framework measured features. After v7.5: the framework
        measures its own measurement, the integrity of its own documentation,
        the validity of its own references, and the integrity of its own
        schema.
      </p>
      <h3>5.5 Honest-status labels avoid the one bug the audit actually caught</h3>
      <p>
        The Gemini audit&apos;s biggest real finding wasn&apos;t broken PRs or
        schema drift — it was that the project had rounded &quot;partial&quot;
        up to &quot;shipped&quot; on Tier 1.1 at the 2026-04-21 ship.
        v7.5&apos;s final invariant: if a capability is partial, pilot,
        groundwork, or backlog-blocked, say so.
      </p>
    </div>
  );
}
