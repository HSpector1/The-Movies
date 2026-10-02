# 1344-X11: parent runs of the row 6 re-witness probe r3 and the promise-row probe r3

## How they ran

- **Queue.** `/Users/zacheryspector/studio-scratch/heavy-queue/run-queue.sh` started both probes after dry run x3
  ended at 19:01:00 CDT on 2026-10-01, one vitest process at a time. The queue log up to the next step is
  [1344-X11-queue.log](1344-X11-queue.log).
- **Tree.** The scratch merge tree at 6935ea5, which x3 measured ([1344-X9](1344-X9-save43-sweep-dry-run-x3.md)).
  Both `merge-head.txt` files record it. Every preflight check in both runbooks passed:
  - the status read `?? dist/` alone;
  - `HEAD:src` was db80ca31;
  - row 6 also checked `HEAD:generated` (8b0ab810) and `tests/p14b5-relationships.test.ts` (unchanged since 6935ea5);
  - the promise runbook also checked that its chain files had not moved since x2;
  - no probe copy was present.
  After each run the probe copies were gone and the status read `?? dist/` again.
- **Reviews before the runs.** [1344-D7](1344-D7-promise-rows-and-row6-declarations-review.md) accepted the row 6
  declaration as written (D7:10). [1344-D9](1344-D9-promise-rows-r3-confirmation.md) confirmed the promise-row
  revision 3 (D9:5), after [1344-D8](1344-D8-promise-rows-r2-confirmation.md) asked for one re-witness per test file.
- **Runbooks.** Row 6: [row6-r3/RUNBOOK.md](1344-stage/s10/row6-r3/RUNBOOK.md), checks transcribed with STOP into the
  queue. Promises: [promises-r2d/RUNBOOK-r3.md](1344-stage/s10/promises-r2d/RUNBOOK-r3.md), extracted verbatim. Its
  old tree takes `src` and `generated` from ff803032 (src tree 347cfcce) and everything else from 6935ea5.

## Results

### Row 6 (`p14b5-relationships`, three leaves; declaration [row6-r3/declaration.md](1344-stage/s10/row6-r3/declaration.md))

Run 19:01:27 to 19:01:33: exit 0, 1 passed and 46 skipped.

| Field | Recorded | Declared (part c) |
|---|---|---|
| Gates | all 8 true: G1_start_196, G2_fixed_fields_in_file, G3_weeks_197_237, G4_take_week_is_post, G5_first_take_213, G6_release_217, A0_anchor_recorded_chain, P_SIM_rule_equals_leaf | every gate true |
| Witness | NONE | NONE |
| Reason | P3_NOT_ALONE_IN_ITS_WEEK | P3 |
| First take after 213 | post-tick 229: r01's `studio-aca408ec-r01:film:12`, and in the same week r02's `studio-aca408ec-r02:film:14` | the same |

Record: [row6-r3.json](1344-stage/s10/row6-r3/out/row6-r3.json) (sha256 d85f4b5c…) and its log.

### Promise rows 8-11 (declaration [declarations-promises-r3.md](1344-stage/s10/promises-r2d/declarations-promises-r3.md))

Head run 19:01:33 to 19:02:00, then the old tree and its run until 19:02:31. Each run: exit 0, 1 passed and 3
skipped.

| Field | Recorded | Declared |
|---|---|---|
| Gates, head run | 5 of 5 true: C1_head_anchor, P1_d1_r01_shelving_before_take, P2_d2_thirteen_rejections, P4_d3_take_via_commission_or_retry, P5_head_half | every gate true |
| Gates, after the old run | 7 of 7 true: the above with P5 completed as P5_d4_stall_without_shelving, plus C1_old_anchor and P3_C2_C3_first_divergence_at_Ws_plus_1 | every gate true |
| Outcome | rows 8-10 PREMISE_CONFLICT; row 11 PREMISE_CONFLICT; last open post-tick 2635 | PREMISE_CONFLICT for both |
| Re-witness, rows 8-10 (`p14c2c-rival-promises`) | NONE: 0 candidates, no first, 0 errors, `scanMatchesTicks` true | NONE |
| Re-witness, row 11 (`p14c3-admission-boundaries`) | NONE: 0 candidates, no first, 0 errors | NONE |
| Predictions | 10 of 10 true, among them shelving week 2612, the hold to 2625, the retry at 2638, the commission path, and the first divergence at post-tick 2613 in `hollywood` alone | all ten |

Records in [promises-r2d/out-r3](1344-stage/s10/promises-r2d/out-r3): `promises.rewitness.json` (sha256 5b9715e1…),
`promises.predicates.json` (sha256 aa3e1f07…), both run logs and both state records.

## Consequences

- **Row 6.** No lawful witness exists in the fixture inside the leaf's guard (post-ticks 197 to 237). 1344-F5 A3 applies: no test edit, and
  the three leaves stay failing with their X10 attribution as a declared exception.
- **Rows 8-11.** The attribution holds (every gate true), and neither test file has a lawful witness. The declaration
  leaves the extension of 1344-F5 Part A to these rows to the parent (its "Open for the parent" item 2).
  [1344-F6](1344-F6-parent-ruling-declared-exceptions.md) rules on it.
- With the hygiene commit (62f14e7, X9's correction), every NEW identity of x3 now has a disposition: 7 scratch rows,
  1 fixed row and 7 declared exceptions.
