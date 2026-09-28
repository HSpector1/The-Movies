# 1309-F: parent adoption of the pin-sweep review

The parent read [1309-C](1309-C-pin-sweep-handback.md), the staged patch and classification, the parent type check
[1309-X](1309-X-sweep-type-check.txt) and the independent review [1309-D](1309-D-pin-sweep-review.md) (REFINE: four
required changes, one flag) in full. Keep items 1-7 as staged. The revision (1309-C2) makes the changes below as one
cumulative patch; the 1309-C patch stays byte-frozen.

## Adopted from 1309-D

1. **Item 8 swap reverted.** `corePredicateOf` (`bridge/promises.ts:47-58`) builds an opportunity predicate for both
   families left in `NOT_OFFERED_IN_B1`, and `promiseFeasibility` applies that map only to non-opportunity predicates
   (`src/core/promises.ts:553-555`), so no wire-valid draft reaches the "not offered in this slice" refusal. Both
   leaves keep `DIRECTING_COUNT` and follow change 5 below.
2. **`tests/bridge-p14c3-runtime.test.ts:178`:** `convertV38ToV37(saved)` becomes `convertV38ToV37(migrateToV38(saved))`.
3. **Item 3 extended** to the 23 files and about 45 sites 1309-D lists under check 4: a live envelope (`makeSave`,
   `migrateToLive`, a `LIVE_SAVE_VERSION` stamp or a hydrated checkpoint) fed to `validateSaveV40` calls
   `validateSaveV41`, with a co-located `.toBe(40)` save-version pin moved to 41 in the same edit. The author reads each
   site and keeps a genuinely historical call unchanged, with a classification row saying why.
4. **`tests/helpers/p14p3-fixtures.ts` `futureSave()`:** chain, not rename. `validateSaveV39` and `convertV39ToV38`
   each first apply `convertV40ToV39(convertV41ToV40(input))`, keeping the exposed names.
5. The flag: the `tests/bridge-p14b3-promise-command.test.ts:157-166` comment is rewritten to the leaf's new premise;
   1309-A's C18 citation `src/core/talentMarket.ts:493,513` should read `:524` (recorded here; 1309-A stays frozen).

## Parent rulings on the items the review left open

6. **Item 8, retitled to P3 law.**
   - `tests/bridge-p14b1-promises.test.ts` group 4 leaf: since P3 a count-one directing draft is offered. The leaf
     asserts the Bridge quote is `ok: true` (measured: `1302-p4p5-broad-core.txt:15753-15762`, "expected true to be
     false" at `:400`), that its message is not the retired "not offerable: a directing promise is not offered in this
     slice", and that a second identical quote is deep-equal (determinism). No classification literal is pinned;
     the run has not measured one.
   - `tests/bridge-p14b3-promise-command.test.ts` "each material promise field …" leaf: the `engineRefused` variant
     stays a wire-valid draft the engine refuses with ok false. The author picks one refusal reachable through
     `corePredicateOf` from `promiseFeasibility` (`src/core/promises.ts:556-584`), for example a due week past the
     proposal's `startWeek + termWeeks`, and confirms from `bridge/schema/bridge-schema.ts:1823-1868` that the wire
     grammar admits the draft. The expected message is that rule's text with the "not offerable: " prefix the leaf
     already uses. If no such draft exists, stop and report.
7. **Item 8b, same cause, measured.** P3 replaced the refusal text for a legacy count-only `DIRECTING_COUNT` root.
   Two rows 1302-I left UNRESOLVED fail for exactly that reason, and the 1302 raw log records the received text:
   - `tests/p14b4-cancel-causal-proof.test.ts:418` (and the `FAMILY_REFUSAL` constant at `:85`, with its other uses):
     the expected bottleneck becomes "a directing promise needs its explicit directorCount predicate selected"
     (`1302-p4p5-broad-core.txt:66941-66955`).
   - `tests/p14b8-waiver-surface-oracle.test.ts:239` and `:241`: the expected refusal becomes "what remains of the
     contract cannot reasonably carry the substitute — a directing promise needs its explicit directorCount predicate
     selected" (`1302-p4p5-broad-core.txt:67854-67861`), and the `toContain` check names the new clause. The leaf's
     comment keeps 744 §11 A8's point: the substitute is still refused, now by the P3 shape rule.
8. **Item 9, computed from the law, no literals.** `tests/p14b1-trust-chooser.test.ts` test 7 (both leaves) and the
   `tests/p14b4-cast-class-policy.test.ts` natural rival policy leaf derive the expected candidate list inside the
   test from the observed state, restating `authorRivalPromise` (`src/core/talentMarket.ts:1441-1488`, as 1309-D
   check 9 transcribes it: `cast = isProven ? [P1] : [flexible, P1]`; `directingFirst ? [directing, ...cast] :
   [...cast, directing]`; then up to two project and two genre candidates from the issuer's own unproduced
   development projects, genre-first when proven). The observed feasibility reads must equal that list's prefix
   ending at the first REASONABLY_ACHIEVABLE read, which attaches; a list with no such read attaches nothing. The
   witnesses the leaves already name (flexible first, P1 fallback, proven P1, zero attachment) stay, each located by
   scan, not by a pinned week. If a witness no longer occurs within the leaf's existing scan bound, the author says
   so rather than widening the bound.
9. **Item 10 adopted as proposed.** `tests/p14b8-waiver-surface-oracle.test.ts:177` drops the `LIVE_SAVE_VERSION`
   assertion; a comment records that B.8 (744 §6) moved no save law, checked against that slice's own diff; the
   `PROMISE_RULES_VERSION` check on the next line stays.

## Order

1309-C2 (test-author) stages the cumulative revision against HEAD with a classification row per edited line. Parent
scratch type check and dry run of the affected files; 1309-D2 review; 1309-E application together with the 1308
neighbor change (`E/1308-stage/neighbors/bridge-p14b6-relationship-read-models.test.ts`, one cancel before the
line-466 release, checked to apply over the sweep); then the broad core and UI gates.
