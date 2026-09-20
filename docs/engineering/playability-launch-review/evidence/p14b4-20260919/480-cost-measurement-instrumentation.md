# 480 — Temporary cost-measurement instrumentation

2026-09-20. **SOURCE FROZEN; temporary source-write ownership yielded.** This is
the removable diagnostic authorized by 479, not a production optimization or an
accepted cost reduction. Native sim-core instructions were followed.

## Exact scope and pins

- Published base: `32d04de361ae41534bf7e69345a8e061f8cbad4c`.
- Sole changed source: `src/core/promiseCapacityOwnerReplay.ts`.
- Original 466/restoration SHA256:
  `956a0245872f02e625c93a41cc2cc2033c4279129b85e100f315045d4d4f8ca4`.
- Frozen instrumented SHA256:
  `10804e2fa42d84196dd5886ae3db509041e5ada6059de54237d8267309a6936e`.
- Unchanged kernel pin supplied by parent:
  `1faa6fcac443dac046bd97fa3e27c61bada80c7297f8e69ea4ebcff76d899332`.

No tests, kernel, actual owners, caps, timeouts, validators, package/configuration,
versions or other production files were edited. No runtime, tests, typechecks,
probes, Git, network or delegation were performed. Checks here are static source
reads and source hashing only; parent owns actual neutrality checks and patch
archival. This handback is the only additional authored file.

## Temporary patch inventory

1. A diagnostic-only `Cost480Observer` is attached to each `Work`. Its counters,
   Maps, arrays, exact-reference shadow storage and logging are **unmetered
   observer overhead**, not proposed free production work. Invocation numbering
   is diagnostic only. There is no per-payment stack capture.
2. `Work.pay` retains its original units, comparison, increment, saturation and
   throw. After a successful increment it records count/units; before an original
   failing saturation it records the unpaid request and remaining gap. An optional
   diagnostic tag defaults to `direct`, keeping every untagged charge visible.
   Initial work records both requested input and actual clamped initial usage.
3. Existing scalar, argument, text/order/equality, shallow-copy-discovery and token
   payments gain labels only. Selected bulk payments gain explicit reserve tags.
   No returned bill value, original calculator expression or payment order changes.
   Nested calculator payments remain independent of the enclosing bulk label.
4. Context labels surround existing preparation, admission/identity, commands,
   dimension discovery, frame background/arrival/collectors/sweep-bill/sweep,
   event draining, reconciliation, release bookkeeping and final-output work.
   They restore the previous context on normal return; a cut retains its failing
   context. No actual call is wrapped with a retry or omitted.
5. `dimensionRecordFacts` keeps its original signature, shared table, scan order,
   mode detection, cold discovery and atomic upgrade/append. Diagnostic roles
   are assigned at its ten existing call-site classes. The observer snapshots a
   role hint, compares the original record reference, counts historical visits
   only **after** original `pay(6)` succeeds, and observes original missing-mode
   flags. The original returned entry reference is published into shadow storage
   only at the three successful returns: hot, completed upgrade, appended cold.
   No production lookup is bypassed and no production hint exists.
6. After successful preparation, the actual `DimensionCell` is registered even
   if no fact call is subsequently reached. This charges no actual work but makes
   the prospective model count construction **31 per cell**, not once globally.
   Shadow cells use exact reference identity and remain separate between
   invocations; siblings observe their genuine shared cell.
7. Final result/error paths flush one compact `B4_COST_480` JSON summary. Original
   results and exceptions are retained. Only diagnostic output failure is caught
   inside `flush`; it cannot replace a producer result. No engine record, hint
   object, GameState, company data or opaque generic value is serialized.

The late optional `cell.records.length` entry scalar was not added after source
freeze. Observed paid visits, completed/cold outcomes and cell ordinals are
available; no unsupported table-length measurement is claimed.

## Attribution and data interpretation

Successful-charge rows carry context index, category, successful count and units.
Contexts give public plan trace key, week, phase and site. Categories include
`calc.arguments`, fixed calculator helpers, `string.*`, `copy.discovery`,
`token.*`, `facts.scan`, `facts.discovery`, explicit `reserve.*`, and residual
`direct`. Thus direct work is retained, not silently omitted.

Selected reserve labels cover sorting, commands, arrival, geometry, release
refusal/commitment, technology/setup collectors, sweep, release Set novelty,
release-authority pruning/filtering, persisted identity, allocation, freelancer
market, initial admission and script linking. Labels
`reserve.sweepAndObservation` and `reserve.technologyCollectorAndFacts` explicitly
remain mixed; these are prepaid units, not measured owner CPU time.

Every flush reports the nonthrowing reconciliation:

`actualInitial + successfulUnits + saturationGap === finalUsed`.

The failing request is recorded separately and is **not** included in successful
units. A failed payment sets actual usage to the cap as before; the remaining
gap accounts for that saturation. Repeated zero-unit payments still increment
successful-count, and no payment-count bound is inferred from the work cap.

Fact rows contain context/cell/role, exact-reference hint hit, successfully paid
historical visits, cold/upgrade/modeComplete outcome, entry/exit usage, requested
modes and original missing-mode flags. Aggregates retain calls, completions,
hits/misses, paid visits, visits on hits and completed outcomes. A cut during a
fact call is reported separately in `pending` with its successfully paid prefix;
it does not become a completion or publish a hint. `consistencyFailures` reports
unexpected role, overlap, shadow-entry or completed-mode mismatches without
changing producer control flow.

The ten role labels are operations root, technology root, production, workflow,
bindings, reservation, task, setup, Set and technology row. Original production
and root copy-only requests stay copy-only; reservation requests stay string-only;
other rows retain their actual modes. Cross-role aliases still resolve through
the unchanged shared entry and original upgrade logic.

`shadowModel.deltaObservedPrefix` is only the prospective 479 expression:

`31*cells + 4R + 8O + 40C + 6D + 12M - 6Vhit`.

R/O/C include reached partial calls; D counts completed calls; M counts every
completed hint miss, including existing-table hits; Vhit counts only successfully
paid visits on exact-reference shadow hits. The model is not an implemented
tariff or a fit claim. Changed production charges could move a cut, so this
observed prefix cannot certify an unexecuted suffix.

## Static checks, limits and parent next actions

Static review covered the complete observer/Work changes, all fact return modes,
ten role sites, tagged bulk expressions, context restoration, branch catches,
output sites and final flushes. Original owner calls, numeric reserve expressions
and actual scans remain present. No executed neutrality, compilation or numerical
sufficiency claim is made.

Parent 481 should reconcile the complete actual diff against original 466 and
review attribution/shadow neutrality. Then run the two original files serially
under the existing fixed-source harness, with no cap or timeout change. Known
baselines are first-take producer completion at 196468 followed by the unchanged
kernel initial-scan cut, and stale producer cut at 199998/request673 before the
Post3 owner. Require unchanged numeric outcomes, `reconciles: true` and zero
observer consistency failures before interpreting totals; a missing summary or
new failure is a diagnostic-integrity issue, not optimization evidence.

After both processes close, parent archives the temporary patch/raw summaries,
restores the exact original-466 source hash above, verifies original kernel/test
pins and records 484. No hint, new cache or other production optimization is
authorized or adopted by this measurement patch.
