# S7 measured valuation fold, Sprint 2

Candidate f6c31caab28ee2290a5d9b8ab35a7463bacc9ce5. Root sole runtime lane baseline-a: pre-P16 predecessor Save As leaf 20.111 s passed; candidate 32.36 s timed out; profiled candidate 36.67 s timed out. All retain original 30000 ms; profile overhead is not baseline timing.

Worker CPU.20261025.173033.82704.0.001.cpuprofile sampled 87.784 s including collection. Inclusive unique-per-sample function membership: subjectValueV1 19.947 s, resolveTitles 21.526 s, authenticTitles 2.822 s, scoredFilms 0.331 s, validateEstateJoins 21.523 s, validateSaveV49 31.064 s. Function totals overlap and must not be added. Sampled CPU attribution is not elapsed duration or invocation count.

Samples with any bridge/runtime ancestor: subjectValueV1 15.905 s, resolveTitles 15.696 s, validateEstateJoins 17.601 s, validateSaveV49 24.230 s. Other collection/tick paths: respective 4.043, 5.830, 3.923, 6.834 s. Therefore the duplicate fold affects the actual Save As runtime, not only fixture generation.

The validator resolves titles once before iterating estates, then every lot subject independently repeats the same pure resolution. Lots are generally singleton, so batch-per-lot alone would not remove the measured repeated work.

## Smallest proposed patch (STATIC / UNRUN)

minimal-resolved-reuse.PROPOSED.patch adds an optional resolution input to subjectValueV1 and supplies the existing validation-local resolution. The as-of guard stays first, scoredFilms still recomputes each call, and itemValue is unchanged. No global cache, retained map, omitted validation, historical walker, money calculation, sorting, state mutation or Bridge admission boundary changes.

Equivalence argument: validateEstateJoins computes resolveTitles(state) before its loop, then only reads state throughout that loop. Pure repeated resolution on the identical synchronous state produces the same properties/workLinks and subject ordering. Passing this exact operation-local result changes only redundant computation. The same guard, per-subject itemValue call and per-lot failure checks run in their original order. The remaining risk is API misuse by a future caller supplying a resolution derived from another state; this proposed optional internal-module input must be weighed against the larger batch API/control-flow change. No resolution input is added to core/index.ts exports separately; subjectValueV1 itself is already exported there.

## Existing verification selection

First root should rerun exact original S7 Save As leaf to see whether this measured seam changes acceptance. Then affected complete files: tests/bridge-p13b-s7-disclosure.test.ts; tests/p16a-valuation.test.ts; tests/p16c-estate.test.ts; tests/p16-r2-estate.test.ts; tests/p16-r2-authority.test.ts. Inspect existing file names before scheduling. Preserve the two C-03 missing-premise failures and original budgets. Source-only API widening needs the root/Bridge typecheck checkpoint; no wire/schema change suggests canonical generation itself is unaffected.

No new regression is proposed yet: these existing files already assert the same valuation outputs, mutation purity, joined minimums, hostile reader refusals and real Save As byte equivalence. A new test is justified only if review identifies a concrete stale-resolution invariant that existing cases do not cover.

Root selected the minimal optional-resolution seam. The comment now documents its internal caller constraint. Separate estate-value-freshness-test.PROPOSED.patch adds a direct joined-reader test because existing hostile cases do not explicitly revalidate one state object after a source-score mutation. It first accepts the authentic state, changes an actual lot film score, requires the exact minimum-value refusal with purity, restores the score and requires acceptance again. STATIC/UNRUN; reviewer should assess source context exposure.

Superseding test proposal: the separate freshness patch now extends the existing opening leaf after its already-admitted actual.state. Clone only; no new leaf/replay. It validates the same clone, alters the persisted title of an actual R1 lot, confirms ambiguousProvenance, requires exact held-inventory join refusal and purity, restores the title and accepts again. This distinguishes fresh title resolution across separate validations; the earlier score-only proposal was rejected because scoredFilms is unchanged by the optimization. Existing r2-validator covers isolated title contradiction, while D-join negatives cover money/receipts; neither asserts this same-object joined-reader sequence. STATIC/UNRUN.
