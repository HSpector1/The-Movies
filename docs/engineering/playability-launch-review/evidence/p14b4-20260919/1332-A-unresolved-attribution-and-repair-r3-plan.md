# 1332-A: attribution of the ten UNRESOLVED core rows, and retained-defect repair R3

Repair R2 closed with 82 failing core identities ([1327-K](1327-K-parent-retained-r2-closure.json)). Ten of them carry
cluster `UNRESOLVED` in [1330-I-failures.json](1330-I-failures.json): no earlier attribution named their cause (1302-I
"What remains unresolved"). The parent measured each one after the 1330/1331 gates. This record states the causes and
plans a test-only repair for the three whose cause is test-side.

## Method

A scratch tree at HEAD 58c89932 (the 1330 test bytes; `tests/fixtures`, `docs`, `node_modules`, `art` and `tools`
linked read-only), with `src` and `generated` swapped per commit by `git archive <commit> src generated`
([runner](1332-measure/probes/bisU-run.sh.txt), [batch 1](1332-measure/probes/bisU-batch1.sh.txt),
[batch 2](1332-measure/probes/batch2.sh.txt)). Commits: 6e63f4c8 (the 1100 source), 75d70e18, 969fb459, 993e6b01 (the
1302 source) and 1b675f75 (= HEAD `src` tree 347cfcce). Per-run Vitest JSON and logs are in
[1332-measure/runs](1332-measure/runs); [bisect-summary.txt](1332-measure/bisect-summary.txt) lists the target rows'
status per commit. The ledger probe runs in a second scratch tree with its own probe
([zz-ledger-reasons](1332-measure/probes/zz-ledger-reasons.test.ts.txt)); output
[ledger-reasons.jsonl](1332-measure/runs/ledger-reasons.jsonl). No recorded run; the repository tree was not touched.

## Attribution

| Row | Cause | First moving commit |
| --- | --- | --- |
| `bridge-p14b5-relationships` family 12, four seeds (`:530` ×2, `:547`, `:550`) | natural chain: week-208 and week-416 settlements move | 969fb459 |
| `p14b4-rival-seating-preference` `:483`, `:498`, `:622` | natural chain: film decisions on `p13a-core-causal-01` and `seed-b` | 969fb459 |
| `p14c3-promise-digest-continuity` `:194` | natural premise on a one-tick genuine207 world | 969fb459 |
| `bridge-p14b2-checkpoint` `:65` | expected migration shape misses two additive fields | Save40 / Save41 lifts |
| `p14b5-relationships` `:546` | digest strip-list misses two additive fields | Save40 / Save41 lifts |

1. **Ledger (4).** A probe over the 16 production commits from 6e63f4c8 to 1b675f75
   ([probe](1332-measure/probes/zz-ledger-probe.test.ts.txt), [output](1332-measure/runs/ledger-16-commits.jsonl))
   reproduces every frozen control through 75d70e18. The controls first move at 969fb459, with row totals and
   `rngState` unchanged; p13b-s8's settlement digest moves once more at ef38cf9a with the same rows. The reasons probe at 75d70e18 and 969fb459 shows the week-208
   winners reshuffle on all four seeds (p13b-s8: 48 settled becomes 43 settled and 5 declined on "this person could not
   separate 2 equally ranked proposals."; p13-public: 36/12 becomes 35/13). Every sentence at 969fb459 is a frozen
   descriptor, the tie fallback, a no-seat or funding drop, or the extension sentence; no D5 relationship sentence
   appears. On `seed-b` the admitted extension row moves from `talent-market-event-296` to `-297`.
2. **Seating preference (3).** At 6e63f4c8 and 75d70e18, `:483` and `:498` pass, and `:622` passes its week-202
   witness and fails later at `:643` (`reauthorOffer`, the HEAD test's live-version literal against the older source).
   At 969fb459 all three fail with the HEAD primaries, together with the C8 positive seam witness. This is the
   1329-A finding: r01 no longer wins the week-208 cases that made a held screenplay viable.
3. **Promise-digest continuity (1).** The leaf ticks the genuine V37 week-207 save once and requires the twelve
   historical subjects of the recorded parity defect to hold week-208 receipts. Receipt facts
   ([75d70e18](1332-measure/runs/digest-facts-75d70e18.log), [969fb459](1332-measure/runs/digest-facts-969fb459.log),
   [HEAD](1332-measure/runs/digest-facts-58c89932.log)): at 75d70e18 all twelve are bound at 208 with week-208
   receipts. From 969fb459 on, ten are. `promise-3` (issuer r02, beneficiary `person-studio-de11f27b-r01-1`) is not
   bound: its case `talent-market-event-143` declines at 208, "this person could not separate 2 equally ranked
   proposals.". `promise-26` (issuer r01, beneficiary `person-studio-de11f27b-r03-1`) is not bound either: case
   `talent-market-event-155` settles with r03, "their studio standing ranked higher" and "they are the current
   employer". Before 969fb459, r01 won that case with "they offered an opportunity". Both keep `contractId` null and
   their week-196 receipts. The proposals are fixed in the save (authored at 196 under the old law); only the week-208
   settlement ranking moved, which is the P3 preference law (a Director's preferred opportunity is directing).
4. **Checkpoint (1).** `bridge-p14b2-checkpoint.test.ts:65` compares `exportSave(migrateToLive(importSave(slot)))`
   with the source envelope plus the additions each governed lift makes, named step by step in the file. The 1330
   diff shows two unnamed additions (raw lines 6121-6125, and 6250, 6716, 7182, 7644): the root `firstTakeSubjects` written by `convertV39ToV40`
   (`src/core/save.ts:10497`: `{ version: 1, cutoverOrdinal: old.state.firstTakes.length, facts: [] }`) and a zero
   `termination` movement on every rival account period, written by `convertV40ToV41` (`save.ts:10526-10533`).
5. **Relationships seam digest (1).** `p14b5-relationships.test.ts:546` pins
   `sha(bytes(after)) === FROZEN.postTakeDigestStripped` (9702aa68…). `bytes()` strips `relationships`,
   `careerLifecycle`, `supersededByPromiseId` and case `variant`, the additive fields of earlier lifts. A
   counterfactual copy of the file ([mk-cf.py](1332-measure/probes/mk-cf.py)) that also strips `firstTakeSubjects`
   and every rival period's `termination` movement passes the whole leaf, and reproduces the frozen digest exactly
   ([result](1332-measure/runs/cf-58c89932.json)). At `after`, the root is
   `{ version: 1, cutoverOrdinal: 24, facts: [{ eventId: 'first-take-event-24', conceptId: 'c-00', genre: 'comedy',
   scriptProjectId: null }] }`: one fact, for the leaf's own take. Every `termination` movement is 0
   ([log](1332-measure/runs/cf-verbose-58c89932.log)).

Rows 1 and 2 (seven identities) move with C8 on long natural runs, and a shelving rule would move them again. They wait
on Owner decision D-1329-1 together with C8 and are not repaired here. Their causes are no longer unresolved. The cause
of row 3 is the week-208 settlement ranking on fixed proposals over one tick, not the rival stall, so it is repaired
here. Rows 4 and 5 are schema maintenance.

## Repair R3: rules

1. Tests only. No production, fixture payload or config change. Three files: `tests/bridge-p14b2-checkpoint.test.ts`,
   `tests/p14b5-relationships.test.ts`, `tests/p14c3-promise-digest-continuity.test.ts`.
2. **Checkpoint `:65`.** The expected object names both lifts in the file's own R-VERSION comment style. Its values come
   from the source envelope and the lift code:
   - `firstTakeSubjects: { version: 1, cutoverOrdinal: <source firstTakes length>, facts: [] }`;
   - `termination: 0` added to the movements of every period of every `hollywood.businesses[].account.periods[]`.

   The received values (`cutoverOrdinal` 5, four `termination` keys) are cross-checks, never sources. Both slots
   (`currentSaveJson`, `savedSaveJson`) keep the same expression.
3. **Seam digest `:546`.** `bytes()` also strips `firstTakeSubjects` and each rival period's `termination`
   movement. It keeps the file's guard-before-strip convention (the `extensionUsed` guard):
   - throw if any stripped `termination` movement is non-zero;
   - throw unless every stripped `firstTakeSubjects` fact names a take present in `state.firstTakes`, which stays in
     the digest.

   `FROZEN.postTakeDigestStripped` is unchanged; the comment cites this record's counterfactual. Every other leaf of the
   file that calls `bytes()` must still pass. The author runs the whole file and names them.
4. **Digest continuity `:194`: pre-declared attribution.**
   - The only assertion that may move is the per-subject `toMatchObject({ week: 208, rulesVersion: 4 })`.
   - The replacement derives each subject's expectation from the tick's own receipts. A receipt re-issued at 208
     comes from the week-208 settlement binding the promise; otherwise the subject keeps its week-207 receipt unchanged.
     `commitWinningPromise` writes `contractId` and the attached receipt on binding (`src/core/talentMarket.ts:1237-1248`); the author confirms the line and asserts rulesVersion 4 on both paths.
   - The derived set of unbound subjects must equal exactly `promise-3` and `promise-26`, with the receipt facts in
     Attribution 3: case event ids, kinds, winning studio, the reason sentences verbatim, `contractId` null, and
     receipt week 196.
   - Any other subject, fact or sentence that differs stops the author on this leaf, who reports it.
   - The leaf's requirements stay whole: `recordedAffectedIds()` still returns the twelve historical ids; all twelve
     receipts are equal between `direct` and `resumed`; whole-world bytes are equal; the historical bytes are unchanged.
5. No assertion is weakened, removed or skipped. `FROZEN` pins, `CHECKPOINT` digests and the twelve-subject selection
   stay.
6. A leaf that passes after the repair must pass for its stated reason; the author names the assertion that now runs.
7. The seven D-1329-1 rows, and every other retained row, stay untouched.

## Deliverables and order

This plan gets an independent review (1332-B). The test-author then stages the change in a scratch tree at the reviewed
HEAD, by the 1327-C method, with these deliverables:
- `1332-stage/1332-retained-r3.patch`, cumulative against HEAD;
- a classification JSON (one row per edit: file, line, old, new, row, cause);
- the handback 1332-C, checked with a temporary index.

Then the parent's scratch dry run (type gates, touched files, full core), independent review, application and the
recorded broad core and UI gates. Expected result: three identities gone against 1330 and none new.
