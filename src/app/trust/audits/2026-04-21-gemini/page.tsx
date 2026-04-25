import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Independent audit — Google Gemini 2.5 Pro (2026-04-21)',
  description:
    'Full text of the independent audit performed by Google Gemini 2.5 Pro on 2026-04-21 covering 65 case studies and two internal meta-analyses.',
};

const GITHUB_ISSUE_URL = 'https://github.com/Regevba/FitTracker2/issues/138';
const ARCHIVE_URL =
  'https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/meta-analysis/independent-audit-2026-04-21-gemini.md';

export default function GeminiAudit20260421Page() {
  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <nav className="mb-8 text-sm">
        <Link href="/trust" className="underline">
          ← Back to /trust
        </Link>
      </nav>

      <header className="mb-10">
        <p className="text-sm uppercase tracking-wide text-[var(--color-neutral-500)]">
          Independent audit
        </p>
        <h1 className="mt-2 font-serif text-[length:var(--text-display-lg)]">
          Google Gemini 2.5 Pro — 2026-04-21
        </h1>
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-semibold">Auditor:</dt>
            <dd>Google Gemini 2.5 Pro</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Audit date:</dt>
            <dd>2026-04-21</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Corpus:</dt>
            <dd>24 showcase + 41 main-repo case studies + 3 internal meta-analyses</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Independence:</dt>
            <dd>Different model family, different vendor, artifact-only access</dd>
          </div>
        </dl>

        <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-semibold">
            Correction (same-day): the &ldquo;3 broken PR citations&rdquo; finding was a
            false positive.
          </p>
          <p className="mt-2">
            Gemini was supplied a meta-analysis that had flagged #51, #69, #70 as
            non-existent PRs. Same-day verification shows all three are real{' '}
            <strong>GitHub issues</strong>, not PRs. The structural meta-analysis used a
            liberal <code>#\d+</code> regex and conflated issue citations with PR
            citations; Gemini faithfully repeated the error because it was given the
            flawed meta-analysis as input. See §10 below for the full correction.{' '}
            <a href={GITHUB_ISSUE_URL} className="underline">
              Issue #138
            </a>{' '}
            has been closed with the full explanation. The original Gemini text in
            §§ 1–9 below is preserved unchanged — this site publishes audits verbatim
            and appends corrections rather than silently editing.
          </p>
        </div>

        <p className="mt-6 text-sm">
          <a href={ARCHIVE_URL} className="underline">
            Full audit source ({`independent-audit-2026-04-21-gemini.md`})
          </a>
        </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">
        <h2>1. The prompt used</h2>
        <p>
          The following instructions were given to Gemini verbatim, twice (once for the
          case-by-case and initial meta-analysis review, once for the second-layer
          meta-analysis review):
        </p>
        <blockquote>
          <p>
            You are an independent, skeptical validator of a set of case studies and
            associated meta-analysis. You must stay neutral, evidence-based, and avoid
            inventing facts.
          </p>
          <p>
            I have provided: (1) a dossier prepared by Claude that summarizes each case
            study, the framework and principles, metrics and methodology, per-case
            evidence, cross-case meta-analysis, and data-quality/validation gaps;
            (2) additional meta-analysis files or text I created on the entire dataset.
          </p>
          <p>
            <strong>Your task:</strong> (1) validate each case study independently;
            (2) validate the meta-analysis (full dataset, consistent definitions,
            reasonable statistics, justified conclusions); (3) cross-check Claude&apos;s
            dossier against the meta-analysis.
          </p>
          <p>
            <strong>Output structure:</strong> executive summary; case-by-case
            validation notes; meta-analysis evaluation (methodology, justification, gaps);
            overall verdict (well-supported vs weak; additional checks).
          </p>
          <p>
            <strong>Rules:</strong> skeptical but fair (challenge claims, not the author);
            specific and evidence-based; do not invent data or interpretations; state
            explicitly when unclear; neutral and professional tone.
          </p>
        </blockquote>

        <h2>2. Executive summary</h2>
        <blockquote>
          <p>
            The dossier presents a comprehensive and unusually transparent summary of a
            longitudinal dataset tracking an AI-assisted PM framework. The evidence&apos;s
            overall strength is mixed and can be clearly bifurcated:
          </p>
          <p>
            <strong>Methodologically Strong:</strong> The project&apos;s commitment to
            documenting its process, including its failures, regressions, and measurement
            gaps, is its greatest strength. The evolution of the measurement framework
            from estimated (pre-v6.0) to instrumented (post-v6.0) is well-documented. The
            internal arithmetic of the primary metric (min/CU) appears consistent based
            on the provided formulas and examples.
          </p>
          <p>
            <strong>Empirically Weak:</strong> The majority of the quantitative
            performance claims, especially those pre-dating framework v6.0, are based on
            estimates, narrative inference, and proxies with disclosed, significant error
            margins. The dataset is from a single practitioner, making it impossible to
            disentangle framework improvements from individual learning. The most
            significant validation efforts (the S13 audit and the D3 analysis) are
            flagged as potentially self-referential.
          </p>
          <p>
            <strong>Conclusion:</strong> The dataset is highly reliable as a qualitative
            record of a methodology&apos;s evolution and a case study in rigorous
            self-assessment. It is unreliable for making precise, predictive quantitative
            claims about AI-assisted development velocity. The dossier itself does an
            excellent job of highlighting these limitations, and my validation largely
            confirms its own stated caveats.
          </p>
        </blockquote>

        <h2>3. Case-by-case validation notes</h2>
        <p>
          Gemini&apos;s strength rating and issue notes for each case study. Ratings are
          Gemini&apos;s verbatim classification, not the site curator&apos;s.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Case</th>
                <th>Strength</th>
                <th>Issues &amp; gaps</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>S01</td>
                <td>Onboarding Pilot</td>
                <td>Weak</td>
                <td>
                  15.2 min/CU baseline arithmetically consistent but a single retroactive
                  data point based on estimated wall time. Fragile anchor for trend.
                </td>
              </tr>
              <tr>
                <td>S02</td>
                <td>6 Refactors</td>
                <td>Moderate</td>
                <td>
                  6.5x speedup is plausible. Home v2 outlier exclusion is significant.
                  Practitioner learning vs framework improvement is unresolved.
                </td>
              </tr>
              <tr>
                <td>S03</td>
                <td>Eval-Driven Dev</td>
                <td>Moderate</td>
                <td>
                  100% pass rate supported. Eval coverage density not normalized — pass
                  rate could be on a trivial subset of logic.
                </td>
              </tr>
              <tr>
                <td>S04</td>
                <td>User Profile</td>
                <td>Weak</td>
                <td>
                  &ldquo;Highest recorded velocity&rdquo; claim used a proxy metric
                  (files/hour), not min/CU. CU derived later.
                </td>
              </tr>
              <tr>
                <td>S05</td>
                <td>SoC-on-Software</td>
                <td>Weak</td>
                <td>
                  63% overhead reduction based on pre-v6.0 token proxy. Before/after
                  figures may not be comparable. Precision not supported by measurement
                  quality.
                </td>
              </tr>
              <tr>
                <td>S06</td>
                <td>Auth Flow</td>
                <td>Moderate</td>
                <td>
                  2.1 min/CU sound. Unplanned work not captured in CU denominator —
                  weakness in pre-v2 CU model.
                </td>
              </tr>
              <tr>
                <td>S07</td>
                <td>AI Engine Arch</td>
                <td>Weak</td>
                <td>
                  45% cache hit rate invalidated by S11/S13 disclosures. &ldquo;0
                  regressions&rdquo; only supported by existing test suite; no new tests
                  added.
                </td>
              </tr>
              <tr>
                <td>S08</td>
                <td>Parallel Stress Test</td>
                <td>Moderate</td>
                <td>
                  1.23 min/CU internally consistent. Conflict-free outcome was
                  &ldquo;partially luck-dependent&rdquo;; 52% of dispatches blocked.
                </td>
              </tr>
              <tr>
                <td>S09</td>
                <td>Dispatch Intelligence</td>
                <td>Weak</td>
                <td>
                  80% accuracy claim based on 4/5 tasks — not statistically significant.
                  Two critical bugs caught by manual review gate.
                </td>
              </tr>
              <tr>
                <td>S10</td>
                <td>Parallel Write Safety</td>
                <td>Very Weak</td>
                <td>&ldquo;No runtime stress test yet.&rdquo; Proposal, not validation.</td>
              </tr>
              <tr>
                <td>S11</td>
                <td>Framework Measurement v6</td>
                <td>Strong</td>
                <td>
                  Honest disclosure invalidating prior cache-hit-rate claims. New baseline
                  for data quality.
                </td>
              </tr>
              <tr>
                <td>S12</td>
                <td>V7.0 HADF</td>
                <td>Moderate</td>
                <td>
                  Shipped disabled (<code>enabled=false</code>). 5 open questions on
                  real-world performance. Design claims, not validated effect.
                </td>
              </tr>
              <tr>
                <td>S13</td>
                <td>Full-System Audit</td>
                <td>Strong (as hypotheses)</td>
                <td>
                  Zero-coverage greps consistent. 78.9% of findings are unverified
                  &ldquo;framework-only assertions.&rdquo; Validates limits of
                  self-assessment, not code quality.
                </td>
              </tr>
              <tr>
                <td>S14–S24</td>
                <td>Deep dives</td>
                <td>Moderate–Strong</td>
                <td>
                  S15, S22, S23 strong on runtime gap vs static analysis. S20 provides the
                  only replication-style result. Honest &ldquo;shipped-without-a-door&rdquo;
                  reporting lends credibility.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>4. Meta-analysis evaluation</h2>
        <h3>4.1 Methodology</h3>
        <blockquote>
          <p>
            <strong>Use of Full Dataset:</strong> The analysis uses the full dataset,
            correctly identifying and justifying the exclusion of one outlier (Home v2).
            It also correctly includes and discusses regressions (Training v2, Readiness
            v2), which avoids cherry-picking.
          </p>
          <p>
            <strong>Consistency:</strong> There is a major inconsistency in data quality
            between pre- and post-v6.0 measurements. The meta-analysis acknowledges this,
            but any trendline drawn across this boundary (like the power-law fit) is
            inherently suspect.
          </p>
          <p>
            <strong>Reasoning/Statistics:</strong> The power-law fit on N=12 data points
            is a significant over-extrapolation. R²=0.82–0.87 with small N and estimated
            inputs makes this fit illustrative at best, not predictive. The
            serial/parallel decomposition is a sound analytical technique.
          </p>
        </blockquote>

        <h3>4.2 Conclusion justification</h3>
        <blockquote>
          <p>
            The primary conclusion — that velocity improved over time — is directionally
            supported. The magnitude (12.4×) is built on a baseline with high uncertainty
            and a peak from a &ldquo;luck-dependent&rdquo; stress test. The serial-velocity
            plateau hypothesis (4–5 min/CU) is reasonable but remains weak on such a small
            N. The dossier&apos;s own framing —{' '}
            <em>
              &ldquo;validation value hinges less on accepting individual velocity numbers
              and more on whether the methodology, arithmetic, and caveats hold up&rdquo;
            </em>{' '}
            — is sound.
          </p>
        </blockquote>

        <h3>4.3 Gaps and risks</h3>
        <blockquote>
          <p>
            <strong>Confirmation bias</strong> is the most significant risk: the entire
            dataset — code, framework, case studies, audit, and validation document (D3) —
            was generated by the same entity.
          </p>
          <p>
            <strong>Provenance of D3</strong> (<code>meta-analysis-validation.md</code>)
            is unconfirmed. Without confirmation of its independence, it must be treated
            as a rigorous internal review, not an external audit.
          </p>
          <p>
            <strong>CU model may have been fitted post-hoc</strong> to the data. If the
            model was tuned to make the trend look good, the entire quantitative analysis
            is compromised.
          </p>
        </blockquote>

        <h2>5. Overall validation verdict</h2>
        <h3>Well-supported</h3>
        <ul>
          <li>Process documentation — iterative improvement, measurement, self-correction</li>
          <li>Internal arithmetic — CU formula and min/CU recalculable from inputs</li>
          <li>
            Methodological flaw disclosures — S11, S13, S22 honest failure reporting is
            the most credible part of the dataset
          </li>
          <li>Post-v6.0 instrumentation — more trustworthy due to deterministic tooling</li>
        </ul>

        <h3>Weak or uncertain</h3>
        <ul>
          <li>
            Pre-v6.0 quantitative claims — velocity numbers, cache-hit rates, token counts
            are directional estimates only. 15.2 min/CU baseline particularly uncertain.
          </li>
          <li>
            Causality of speedup — cannot rule out learning effects with a single
            practitioner
          </li>
          <li>
            Predictive power — power-law fit has little to no predictive validity on this
            sample
          </li>
          <li>
            Runtime correctness — almost no validated evidence. &ldquo;Shipped-without-a-door&rdquo;
            cases (S22, S23) are strong evidence against assuming runtime correctness from
            static analysis.
          </li>
        </ul>

        <h3>Additional checks Gemini recommends</h3>
        <ul>
          <li>
            <strong>Provenance of D3</strong> — clarify identity and independence of the
            validation-document reviewer
          </li>
          <li>
            <strong>CU model timing</strong> — confirm whether CU weights were defined
            before or after data collection
          </li>
          <li>
            <strong>Minimal external replication</strong> — even one case study run by a
            separate independent entity would check self-referential bias
          </li>
          <li>
            <strong>Runtime spot-checks</strong> — smoke tests on features flagged as
            problematic (e.g., Push Notifications S22)
          </li>
          <li>
            <strong>Re-fit the trend with post-v6.0 data only</strong> as it becomes
            available
          </li>
        </ul>

        <h2>6. Second-layer review — Gemini&apos;s evaluation of the structural meta-analysis</h2>
        <p>
          A follow-up turn supplied Gemini with <code>meta-analysis-2026-04-21.md</code>{' '}
          (the structural audit of 41 main-repo case-study files) and asked for evaluation
          as an additional evidence layer.
        </p>

        <h3>What is new</h3>
        <blockquote>
          <p>
            Focus on structural integrity, not performance. Larger corpus (41 source files
            vs 24 showcase files). Mechanical verifiable checks (word counts, schema
            checks, <code>gh pr view</code> calls). Key new findings: 6 stub files that
            are near-duplicates; 3 cited PR numbers that do not exist on GitHub; 63.4% of
            cases don&apos;t state their dispatch pattern; <code>state.json</code> schema
            inconsistencies; 38 of 39 dated files written in a three-week April 2026
            window.
          </p>
        </blockquote>

        <h3>Consistency with case studies and the dossier</h3>
        <blockquote>
          <p>
            Full dataset used. Identification and separate treatment of the 6 stub files
            is a methodologically sound way to avoid skewing results. Transparent about
            its own limitations (&ldquo;extraction is lexical&rdquo;). Scope mismatch with
            the dossier is explained: dossier uses a curated subset (24 showcase files),
            this analysis uses the larger messier source corpus (41 files). The PR check
            finds that PR #51 (cited in S01&apos;s source) and PRs #69, #70 (cited in
            S19&apos;s source) are non-existent — directly weakens those specific
            case-study claims. The 95%-in-three-weeks finding reframes the corpus from
            &ldquo;lab notebooks&rdquo; to &ldquo;historical reconstructions.&rdquo;
          </p>
        </blockquote>

        <h3>Final judgment on the second meta-analysis</h3>
        <blockquote>
          <p>
            This second meta-analysis{' '}
            <strong>
              significantly strengthens the overall validation process while
              simultaneously weakening the blind acceptance of the original claims.
            </strong>
          </p>
          <p>
            <strong>It strengthens the validation by</strong> providing a new, objective,
            reproducible layer based on structural integrity; moving the conversation from
            &ldquo;are the conclusions logical?&rdquo; to &ldquo;is the underlying data
            reliable?&rdquo;; discovering concrete data quality issues; and giving a
            clearer picture of the documentation&apos;s retroactive nature.
          </p>
          <p>
            <strong>It weakens the claims by</strong> demonstrating factual errors in the
            evidence cited for at least two case studies (S01, S19); revealing that the
            documentation process is less systematic than the polished showcase files
            suggest; and confirming that governance metrics (like kill criteria) are not
            consistently documented even in the source files.
          </p>
          <p>
            Overall confidence in any specific quantitative claim from a pre-v6.0 case
            study should now be considered <strong>low</strong> until specific
            evidentiary pointers (like PR numbers) have been manually verified. Confidence
            in the project&apos;s commitment to eventual transparency remains high — this
            audit itself is part of the provided evidence.
          </p>
        </blockquote>

        <h2>7. Gemini&apos;s remediation recommendations — Tier 1/2/3</h2>

        <h3>Tier 1 — Foundational instrumentation &amp; tooling</h3>
        <ol>
          <li>
            <strong>Automate all time and event-based metrics.</strong> Instrument the PM
            framework itself; duration = <code>timestamp_exit − timestamp_enter</code>.
          </li>
          <li>
            <strong>Integrate directly with sources of truth.</strong> Use the GitHub API
            to link feature IDs to PR IDs and status. Prevents data integrity errors like
            the non-existent PRs.
          </li>
          <li>
            <strong>Enforce schema on write.</strong> Pre-commit hook or CI check that
            validates all <code>state.json</code> files.
          </li>
        </ol>

        <h3>Tier 2 — Process &amp; workflow improvements</h3>
        <ol start={4}>
          <li>
            <strong>Gated phase transitions with verifiable evidence.</strong>{' '}
            <code>Implement → Test</code> requires linked PR + CI green;{' '}
            <code>Review → Merge</code> requires basic runtime smoke test.
          </li>
          <li>
            <strong>Shift from retroactive case studies to contemporaneous logs.</strong>{' '}
            Primary artifact becomes a structured append-only log.
          </li>
          <li>
            <strong>Mandate explicit data quality tiers.</strong> Label every metric as{' '}
            <strong>Tier 1 (Instrumented)</strong> / <strong>Tier 2 (Declared)</strong> /{' '}
            <strong>Tier 3 (Narrative)</strong>.
          </li>
        </ol>

        <h3>Tier 3 — Governance &amp; verification</h3>
        <ol start={7}>
          <li>
            <strong>Introduce an independent Auditor Agent.</strong> A separate automated
            process that runs the checks from the second meta-analysis on a cadence.
          </li>
          <li>
            <strong>Define and track documentation debt.</strong> Auditor Agent tracks
            metrics like kill-criteria and dispatch-pattern compliance on a dashboard.
          </li>
        </ol>

        <h3>External (not self-executable)</h3>
        <ol start={9}>
          <li>
            <strong>Minimal external replication.</strong> A single case study run and
            documented by a separate independent entity would check self-referential bias.
          </li>
        </ol>

        <h2>8. How this audit is being acted on</h2>
        <p>
          <strong>Transparent accounting rather than concealment.</strong> The three PR
          citations Gemini flagged (#51, #69, #70) are tracked in GitHub issue{' '}
          <a href={GITHUB_ISSUE_URL}>#138</a> for root-cause investigation (typo, deleted
          PR, or misremembered number). The audit is being published before that
          investigation concludes; corrections will be appended here and in the cited
          case studies as they land.
        </p>

        <p>
          <strong>Improvement backlog.</strong> Gemini&apos;s Tier 1/2/3 recommendations
          have been prioritized by ROI × reversibility — items 1–3 below are single-hour
          tasks, 4–5 are multi-session process changes:
        </p>
        <ol>
          <li>
            Independent Auditor Agent (extends the 72h integrity cycle v7.1) — Tier 3.1
          </li>
          <li>
            <code>state.json</code> schema enforcement on write — Tier 1.3
          </li>
          <li>Data quality tiers in all reports — Tier 2.3</li>
          <li>PR-link verification on phase transition — Tier 1.2 subset</li>
          <li>
            Contemporaneous logging replacing retroactive case studies — Tier 2.2
          </li>
        </ol>
        <p>
          Already shipped going forward: Tier 1.1 (automated time metrics, framework v6.0,
          2026-04-16). Items that cannot be done solo (Tier 3.3 — external replication)
          remain open.
        </p>

        <h2>9. What this audit does NOT do</h2>
        <ul>
          <li>
            It does not re-verify CU arithmetic, velocity numbers, or cache-hit
            percentages. Out of scope for the structural review.
          </li>
          <li>
            It does not investigate the root cause of the 3 non-existent PR citations —
            only that they don&apos;t resolve.
          </li>
          <li>
            It does not validate runtime correctness of any shipped feature — only the
            documentation of that shipping.
          </li>
          <li>
            It does not constitute external replication. Gemini reviewed artifacts
            provided in a prompt; it did not run the framework on an independent task.
          </li>
        </ul>

        <h2>10. Corrections (appended 2026-04-21 after initial publication)</h2>
        <p>
          <strong>
            The &ldquo;three PR citations don&apos;t resolve&rdquo; finding is wrong.
          </strong>{' '}
          Gemini correctly flagged it based on what it was told, but the underlying claim
          came from a false positive in the structural meta-analysis Gemini was supplied
          with.
        </p>

        <h3>What actually exists</h3>
        <p>All three numbers are real GitHub issues, not PRs:</p>
        <ul>
          <li>
            <a href="https://github.com/Regevba/FitTracker2/issues/51">Issue #51</a>{' '}
            &ldquo;Onboarding Flow&rdquo; (CLOSED) — cited in{' '}
            <code>pm-workflow-showcase-onboarding.md</code> as{' '}
            <code>regevba/fittracker2#51</code>
          </li>
          <li>
            <a href="https://github.com/Regevba/FitTracker2/issues/69">Issue #69</a>{' '}
            &ldquo;Rest Day — Positive Experience Redesign&rdquo; (OPEN) — cited in{' '}
            <code>training-plan-v2-case-study.md</code> as <code>issue #69</code>
          </li>
          <li>
            <a href="https://github.com/Regevba/FitTracker2/issues/70">Issue #70</a>{' '}
            &ldquo;Advanced Data Fusion + AI Exercise Recommendations&rdquo; (OPEN) —
            cited in <code>training-plan-v2-case-study.md</code> as <code>issue #70</code>
          </li>
        </ul>
        <p>
          <code>gh issue view</code> confirms all three resolve. No case-study correction
          is needed for the citations themselves.
        </p>

        <h3>Who was wrong, and what this means</h3>
        <ul>
          <li>
            <strong>Claude&apos;s structural meta-analysis was the source of the error.</strong>{' '}
            Its mechanical PR extraction used a liberal <code>#\d+</code> regex and
            checked every match against <code>gh pr list</code>, conflating issue
            citations with PR citations.
          </li>
          <li>
            <strong>Gemini&apos;s audit faithfully reproduced the error</strong> because
            the flawed meta-analysis was fed to it as input. Gemini did not independently
            re-run the <code>gh pr view</code> queries — it cited the meta-analysis&apos;s
            finding as evidence.
          </li>
          <li>
            <strong>Gemini&apos;s meta-evaluation was still correct in form:</strong>{' '}
            &ldquo;demonstrating factual errors in the evidence cited for at least two
            case studies (S01, S19) weakens the original claims.&rdquo; If the finding
            had been real, that critique would stand. Because the finding itself was
            flawed, the actual weakness is in the meta-analysis&apos;s precision —
            something Gemini could not have detected without re-running the queries.
          </li>
        </ul>

        <h3>What was actually verified vs. what wasn&apos;t</h3>
        <p>
          Gemini&apos;s other structural findings — <code>state.json</code> schema drift,
          the audit-v2-gN stub cluster, the dispatch-pattern gap, the
          95%-in-three-weeks observation, the showcase ↔ main-repo mapping — were{' '}
          <strong>not re-verified</strong> by the author. Those findings propagate from
          the meta-analysis with the same epistemic status: they could be correct, or they
          could contain similar precision gaps. The Auditor Agent (below) is the forward
          defense.
        </p>

        <h3>Tooling response</h3>
        <p>
          The Auditor Agent extension shipped in{' '}
          <code>scripts/integrity-check.py</code> (2026-04-21) uses a tighter regex
          requiring <code>PR</code> or <code>pull/</code> context. Running this check
          against the same corpus produces <strong>zero</strong>{' '}
          <code>BROKEN_PR_CITATION</code> findings on the original case studies. This is
          how the false positive surfaced: cross-checking the new Auditor Agent&apos;s
          output against the original meta-analysis revealed the discrepancy.
        </p>

        <h3>Policy precedent</h3>
        <p>
          This correction was <strong>appended</strong>, not substituted for the original
          text. Sections 1–9 above still contain the original statement.{' '}
          <a href={GITHUB_ISSUE_URL}>Issue #138</a> is closed with a full explanation, not
          deleted. Every subsequent audit will follow the same pattern: the initial
          finding stays visible, the correction appears as a time-stamped append, and the
          chain of reasoning is preserved for future reviewers (human or AI) to retrace.
        </p>

        <hr />

        <h2>11. How we responded — v7.5 (policy) + v7.6 (mechanical)</h2>
        <p>
          The 9 Tier 1/2/3 recommendations in §7 were addressed in two waves. The
          response is published here as appended commentary, not as silent edits to
          §§ 1–10.
        </p>

        <h3>v7.5 — policy response (shipped 2026-04-24)</h3>
        <p>
          v7.5 turned the audit's recommendations into <strong>eight cooperating
          defenses</strong> spanning write-time gates (pre-commit hooks for{' '}
          <code>SCHEMA_DRIFT</code> and <code>PR_NUMBER_UNRESOLVED</code>),
          cycle-time enforcement (the 72h Auditor Agent extended from 8 to 11 check
          codes), runtime smoke gates (5 profiles including{' '}
          <code>sign_in_surface</code>), contemporaneous logging (5 active feature
          logs), data-quality tiers (T1 / T2 / T3 convention codified in CLAUDE.md),
          a documentation-debt dashboard, and a measurement-adoption ledger. 7 of
          Gemini's 9 Tier items shipped fully or effectively, 2 shipped as
          partial/pilot with measured known deltas, and 1 (Tier 3.3 — external
          replication) was deferred as external-blocked. Full narrative:{' '}
          <a href="https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/data-integrity-framework-v7.5-case-study.md">
            data-integrity-framework-v7.5-case-study.md
          </a>
          .
        </p>

        <h3>v7.6 — mechanical response (shipped 2026-04-25)</h3>
        <p>
          v7.5 was a complete <em>policy</em> answer, but most of its new defenses
          were Class B — they relied on the agent remembering to invoke them. v7.6 is
          the <em>mechanical</em> layer that promotes 7 silent agent-attention checks
          to Class A enforcement and explicitly documents the 5 gaps that{' '}
          <strong>cannot</strong> be promoted (because pretending we could mechanize
          them would itself be a lie).
        </p>
        <ul>
          <li>
            <strong>4 new write-time pre-commit check codes:</strong>{' '}
            <code>PHASE_TRANSITION_NO_LOG</code>,{' '}
            <code>PHASE_TRANSITION_NO_TIMING</code>,{' '}
            <code>BROKEN_PR_CITATION</code> (write-time, narrow regex), and{' '}
            <code>CASE_STUDY_MISSING_TIER_TAGS</code> (forward-only, dates ≥
            2026-04-21). Every commit now passes through these checks before it can
            land.
          </li>
          <li>
            <strong>Per-PR review bot:</strong> a new{' '}
            <code>pm-framework/pr-integrity</code> commit status that fails when a PR
            introduces NEW findings vs main. Sticky comment updates in place; status
            check available for branch protection.
          </li>
          <li>
            <strong>Weekly framework-status cron:</strong> Mondays 05:00 UTC,
            snapshots the measurement-adoption history (dedup-by-date) and opens a
            regression issue when <code>fully_adopted</code> or{' '}
            <code>any_adopted</code> decreases.
          </li>
          <li>
            <strong>5 explicit Class B gaps documented:</strong>{' '}
            <a href="https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/meta-analysis/unclosable-gaps.md">
              unclosable-gaps.md
            </a>{' '}
            enumerates each gap with a 4-section format (technical reason,
            observability, human action, tracking). The gaps are: <code>cache_hits[]</code>{' '}
            writer-path adoption (issue #140), <code>cu_v2</code> factor magnitude
            correctness, T1/T2/T3 tag correctness (presence promoted to Class A;
            correctness stays B), Tier 2.1 real-provider auth, and Tier 3.3 external
            replication.
          </li>
        </ul>

        <h3>Outlier framing — read this before quoting numbers</h3>
        <p>
          The v7.6 case study is itself an outlier in the corpus. It shipped in a
          single ~6-hour working session on 2026-04-25; the data is dogfooded (the
          author of the framework wrote the data and reads it); and the v6.0
          measurement protocol the case study uses was applied retroactively (v6.0
          shipped 2026-04-16; most prior features have empty <code>cache_hits[]</code>{' '}
          arrays not because no hits occurred but because no logger was wired). The
          case study labels these limits explicitly and applies them to the
          published numbers — the 3.33 min/CU velocity is a dogfooded micro-benchmark,
          not a generalizable framework-velocity claim. The fair test of v7.6's
          success will be downstream organic feature work over the next 6+ weeks. See
          §§ 10–11 of the upstream for the full data analysis with outlier caveat.
        </p>

        <h3>Detailed mechanical answer (links)</h3>
        <ul>
          <li>
            v7.6 case study (full Dev-style narrative, comprehensive CU + workload
            analysis, Codex tooling attribution, outlier limitations):{' '}
            <a href="https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/mechanical-enforcement-v7-6-case-study.md">
              mechanical-enforcement-v7-6-case-study.md
            </a>
          </li>
          <li>
            v7.5 case study (eight cooperating defenses):{' '}
            <a href="https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/data-integrity-framework-v7.5-case-study.md">
              data-integrity-framework-v7.5-case-study.md
            </a>
          </li>
          <li>
            Class B gap inventory:{' '}
            <a href="https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/meta-analysis/unclosable-gaps.md">
              unclosable-gaps.md
            </a>
          </li>
          <li>
            Per-PR review bot workflow:{' '}
            <a href="https://github.com/Regevba/FitTracker2/blob/main/.github/workflows/pr-integrity-check.yml">
              .github/workflows/pr-integrity-check.yml
            </a>
          </li>
          <li>
            Weekly framework-status cron:{' '}
            <a href="https://github.com/Regevba/FitTracker2/blob/main/.github/workflows/framework-status-weekly.yml">
              .github/workflows/framework-status-weekly.yml
            </a>
          </li>
          <li>
            Showcase MDX:{' '}
            <a href="/case-studies/mechanical-enforcement-v7-6">
              fitme-story / case-studies / mechanical-enforcement-v7-6
            </a>
          </li>
        </ul>

        <p>
          Tier 3.3 — the public invitation for an external operator to run the
          framework on an unrelated product — is the explicit final v7.6 deliverable
          and was filed on 2026-04-25 as{' '}
          <a href="https://github.com/Regevba/FitTracker2/issues/142">issue #142</a>{' '}
          (pinned, labels: <code>tier-3-3</code>, <code>external-replication</code>,{' '}
          <code>help wanted</code>). Until an external case study lands in{' '}
          <code>docs/case-studies/external/</code>, the framework's own measurements
          remain self-referential by definition; the v7.6 publication is the framework
          honestly admitting where its own evidence runs out.
        </p>

        <p>
          Two surfaces complete the audit response on this site:
        </p>
        <ul>
          <li>
            <a href="/case-studies/mechanical-enforcement-v7-6">
              Case study (Light template) — fitme-story / case-studies / mechanical-enforcement-v7-6
            </a>{' '}
            — outlier-flagged, summary card, 7 promotions, 5 Class B gaps,
            cooperating-defenses recap, honest tooling attribution.
          </li>
          <li>
            <a href="/framework/dev-guide">
              Developer guide (technical, dev-only) — fitme-story / framework / dev-guide
            </a>{' '}
            — 4 enforcement layers, <code>state.json</code> schema, phase lifecycle,
            dispatch model, cache architecture, measurement protocol, 12 integrity
            check codes, 3 operational walkthroughs, compressed v1.0 → v7.6 timeline.
            Mirrors the canonical{' '}
            <a href="https://github.com/Regevba/FitTracker2/blob/main/docs/architecture/dev-guide-v1-to-v7-6.md">
              docs/architecture/dev-guide-v1-to-v7-6.md
            </a>{' '}
            on GitHub.
          </li>
        </ul>

        <hr />

        <p className="text-sm text-[var(--color-neutral-500)]">
          Full audit source archived at{' '}
          <a href={ARCHIVE_URL}>
            FitTracker2/docs/case-studies/meta-analysis/independent-audit-2026-04-21-gemini.md
          </a>
          . This page reproduces that archive verbatim plus published date. Any future
          edits will be appended (not silently rewritten); diff will be visible in the
          archive&apos;s git history.
        </p>
      </div>
    </article>
  );
}
