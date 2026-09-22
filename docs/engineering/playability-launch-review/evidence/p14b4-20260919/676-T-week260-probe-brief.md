# 676-T — parent brief: the §8 :645 week-260 relationship measurement (test-author, AUTHOR ONLY)

Authority: record 675 "Next (bounded)" NEXT675 (1); the P14 plan's B.5 expansion scope (9)
("the measured edge and driver counts on the standard seeds at week 260 and on the endurance
scenario are T4 evidence items"); companion §8 :645 ("every P14 root is measured in the accepted
encoding"); 672-R's outstanding-measurement finding. Owner packet of 2026-09-22, step 1.

Role: harness writer. You author ONE file and hand it back. **You do not run it against the
evidence runner and you do not commit.** The parent owns serial runtime and publication.

## Hard boundaries

- Do NOT change any file under `src/`, `bridge/`, `generated/`, `ui/`, `scripts/`, `tests/`
  (including `tests/fixtures/` and `tests/helpers/`), `package.json` or any config. Zero edits.
- Do NOT change a constant, a cap, an assertion, a refusal string or a historical fixture.
- Do NOT import `vitest`. This is a standalone vite-node script, not a test.
- Do NOT read, copy or touch any save under the Owner's home directory. Campaigns are minted
  in-process from the seeds below through the live engine only.
- No RNG, no wall-clock in any measured value (elapsed milliseconds are reported separately as
  environment, never folded into a measured quantity).
- If something cannot be measured honestly, print it as a named gap. Never substitute a plausible
  number, never swallow an exception. A partial run with a named blocker beats a clean-looking lie.

## The one file to author

`docs/engineering/playability-launch-review/evidence/p14b4-20260919/676-b5-week260-probe.ts`

Precedent for placement, import style and header: `178-first-take-fixture-probe.ts` in this same
folder (relative `../../../../../src/...` imports; run from the repository root with
`node_modules/.bin/vite-node <path>`). Keep it under ~200 lines.

## What the probe measures

Campaigns (the recorded standard set, 654-T-ledger.md §B — four seeds, `p13aGeneratedStudio(seed)`
from `src/harness/p13a/fixtures.ts`, no player action at all, disposable and in-process):

    p13a-core-causal-01   (default)
    seed-b                (seating/outcomes witness seed)
    p13b-s8-bridge-probe-01 (the bridge seed)
    p13-public-commercial-adoption (adoption seed; the 658-W saturation observation's seed)

Run each campaign from its start to **week 260** with the real weekly transition (`tick`, one week
at a time — do NOT use `advanceTo` in one jump; you must observe every intermediate week).
260 is not arbitrary: it is `RELATIONSHIP_DRIFT_RETURN_WEEKS`, so the full drift horizon is inside
the window.

**Read every tier through the real drift-aware owner.** Import `currentTier`, `currentCloseness`,
`RELATIONSHIP_TIERS`, `RELATIONSHIP_RECENT_CAP` and the constants you cite from
`src/core/relationships.ts`. Never re-implement the band arithmetic in the probe.

Per seed, emit:

1. `edges` — `state.relationships.length` at 260.
2. `driversRetained` — Σ `edge.recent.length`; `maxRetainedPerEdge`; how many edges sit AT
   `RELATIONSHIP_RECENT_CAP`.
3. Counters at 260 — Σ `sharedProductions`, `sharedSuccesses`, `sharedFailures`,
   `sharedCancellations`; and `maxSharedProductionsOnOneEdge`.
4. `driversMintedDerived` — Σ over edges of
   `sharedProductions + max(0, sharedProductions - 1) + sharedSuccesses + sharedFailures + sharedCancellations`.
   (`repeatedCollaboration` has no counter but fires exactly once per take from the second onward,
   so it is `sharedProductions - 1`; state that derivation in a comment.)
5. `driversMintedObserved` — an independent week-by-week count: at each week W, for every edge,
   count `edge.recent` entries with `week === W` that were not already counted at an earlier week
   for that edge. Report `driversFolded = driversMintedDerived - driversRetained`. If
   `driversMintedObserved !== driversMintedDerived`, print a LOUD `COUNT-MISMATCH` line with the
   offending edges — that is a real finding, not something to reconcile away. (An edge taking more
   than `RELATIONSHIP_RECENT_CAP` drivers inside one week would undercount the observed figure;
   flag any edge-week with ≥ cap drivers explicitly.)
6. `tierHistogramAt260` — `currentTier(edge, 260)` over all edges, all eight ladder members as
   keys, zeros included.
7. `bandHistogramAt260Stored` — the same histogram computed from the STORED `edge.closeness`
   without drift, so the drift contribution is visible as the difference.
8. `peakTierHistogram` — over the stored `peakTier` field.
9. `everObservedTiers` — for EVERY week W in `[firstWeekAnyEdgeExists .. 260]` and every edge alive
   at W, `currentTier(edge, W)`. Report the set of tiers ever read, and for each tier the first
   week it was read and the `edgeId`/pair that read it. This is the "ever observed" measure and it
   MUST be separate from the final-week histogram.
10. `strained` — did `Strained` (or `Enemies`/`Nemeses`) EVER appear in (9)? If yes: first week,
    edgeId, the pair, the closeness at that week and the driver history. If no: say so plainly and
    report `minClosenessEverObserved` with its week and edge, so the distance to the Strained
    ceiling (44) is on the record.
11. `closeness` extremes at 260 and ever: min/max with week and edge; the week the first edge was
    minted; the week the first `Inseparable` read occurred (if any); the week every edge first
    reached its `peakTier`.
12. Encoded bytes in the project's accepted encoding: `Buffer.byteLength(JSON.stringify(x),'utf8')`
    for (a) `state.relationships` alone, (b) the whole `makeSave(state)` at 260, (c) that same save
    with the `relationships` root emptied — so the root's marginal save cost is exact. Also report
    `gzipSync(..., {level: 9}).length` for the full save both ways (the library's encoding, the
    `legacy-v*-fixtures.ts` convention). Do NOT write any file.
13. `sha256` of the probe file's own bytes (read `import.meta.url`), printed first, so the output
    is bound to the harness that produced it. Also print `process.version`, `process.platform`,
    `process.arch` and the per-seed elapsed milliseconds and total elapsed.
14. A `validateRelationshipsRoot(state)` call on each final state, and `requireRelationshipsRoot`,
    so the measured world is proven lawful rather than assumed.

Output: a compact human table per seed on stdout, then ONE line
`JSON <single-line JSON of the whole result object>` so the parent can archive the structured form.
Exit non-zero on any thrown error; do not catch and continue past a real failure.

## Paper claim to test, stated so the probe can contradict it

672-R finding 1 and record 675 item 1 claim that under the landed constants no naturally minted
edge can reach the Strained band (≤ 44): a low-proximity pair mints at 52, and the worst
per-production cycle is `+RELATIONSHIP_PROXIMITY_LOW + min(sharedProductions-1, REPEAT_CAP)
− RELATIONSHIP_FAILURE_DELTA`, which bottoms at 47 on the second and third shared production and
rises thereafter; drift only moves a sub-baseline value UP. The probe does not assume this. Report
what the four campaigns actually show, including `minClosenessEverObserved`. **A finite run that
observes no Strained does not prove impossibility** — write that sentence in your report and keep
the measured claim and the arithmetic claim separate.

## Your handback

`676-T-report.md` in this folder: the file you wrote, its line count and sha256, the exact command
the parent should run, your runtime forecast, every assumption you made, anything you could not
measure and why, and a one-paragraph statement of what the probe CANNOT establish. State plainly
that you did not run it against the evidence runner and committed nothing.

Forecast under the existing allowance (no new budget): one authored file, no reruns expected.
