# Record 657 — P14B.5 T1 RED reviewed; T2 writer released with conditions

Status: WRITER RELEASED WITH CONDITIONS (657-B). Source at release: HEAD `9e58ec9d` (T1 RED committed;
producer paths unchanged since `d6c11b9b`). Authority: P14 plan :725-781 (the inserted expansion and
its rulings); record 653; Owner ruling record 600 step 7.

## Inputs

- 654-T RED (three files, 1752 lines): 655 baseline on `8708d6a9` 3 files failed, 37 failed / 35
  passed (GREEN only the frozen-side pins and the ledger controls); 656 typecheck EXIT 2 with exactly
  the 8 expected errors (absent `relationships.js`; four absent V31 save exports; `nemesisOnRoster` not
  a `FreezeDrop` member); controls 15/15, 23/23. Measured R-D5 ledger (`654-T-ledger.md`): four seeds
  × 416 ticks; settlements only at 208 and 416 (cases OPEN at 404); 0 of 96 churn-week survivors carry
  a roster under the D1 predicate at 208; exposed rows 0; settlement / receipts / employment / takes
  digests and `rngState` pinned per seed; `poachingFixture` (reasons :200-201, endedWeek 208) and the
  D3 case pinned as controls.
- 657-B (contract-auditor, READ-ONLY; `657-B-b5-red-review.md`): RELEASE WITH CONDITIONS. Every
  new-behaviour expectation traces to a plan/companion sentence; every current-output value in the
  files is a labelled CANNOT-MOVE or R-VERSION control; no OPEN item (1–3, 11, 15) decided; no frozen
  pin weakened; synthetic constructions lawful under B4 plan :391-393. DEMONSTRATED defects in the
  RED: none.

## Rulings adopted (binding on the writer)

- I1 ACCEPT: the RED's names are the plan's own plus `RELATIONSHIP_TIER_FLOOR` / `RELATIONSHIP_TIERS`
  / `RELATIONSHIP_DRIVER_KINDS`; the seam `advanceRelationshipsWeek(state, { takes: [{studioId,
  production}], releases: FilmResult[] }, week)`; no rename at T2.
- I2 ACCEPT WITH PRECISION: a release or cancel never creates an edge; its driver applies to a pair's
  edge iff the edge exists AND `take.week >= edge.firstSharedWeek` (forced by the invariant
  `sharedSuccesses + sharedFailures <= sharedProductions`); this is the live-seam consequence of
  §5.7/§8, not a decision of OPEN 2.
- I3 ACCEPT (a labelled in-memory `FilmResult` fed to the seam is a lawful synthetic-file variant;
  success basis `criticScore`). I4 ACCEPT: the eight frozen settlement sentences are
  `talentMarket.ts:672-677` (six), :881, :884; the D5 sentence is exactly one new
  `DESCRIPTOR_REASON.relationships` entry with no digit, person id or tier name.
- Conditions C1–C10 (657-B Q5), all checkable at T3: names binding; the I2 precision; spread-preserving
  state construction (key order) so the family-1 stripped digest and family-9 per-key bytes hold;
  validator messages on the `promises.ts:941-960` model, `validateSaveV31` wrapping without dropping
  the inner text; exactly one new reason, no other reason/drop/tie string changes; same-reference
  returns on the empty delta and the no-take cancel; the roster-at-W helper in `talentMarket.ts`
  set-equal to the RED's `rosterAt`, no `relationships.ts → talentMarket.ts` import; worldgen seed +
  historical-control strip land with S1; the test-author's sweep patch lands before the T3 control
  run; typecheck (root + bridge + ui) part of T3 (a residual TS2322 on `FreezeDrop` = family 8 unmet).
- T3 attribution rule: on the four seeds, `poachingFixture` and the D3 case, every digest, `rngState`,
  receipt kind/winner/reasons/dropped and FirstTake is CANNOT-MOVE; the only lawful movements are
  R-ORDER-VALUE (seven-member public order) and R-VERSION (30→31, 47→48, schema id, 35→36, sentinel,
  frozen-builder/helper validator calls); any other movement is a writer defect attributed to the
  first moved receipt, never re-pinned.
- Record-only: plan text "404" → "open at 404, settle at 416"; OPEN 11 dead branch in the RED's
  `d5Band`; OPEN 15 stays open; the `nemesisOnRoster` sentence class and "`pairChemistry` has no
  consumer" are T3 greps; REFINE (test-author, later): bridge :397 substring check, :436 literal 8.

## The writer plan (ONE sim-core writer; five cumulative patches; no commits; no test files)

S1 core (`src/core/relationships.ts` new; `types.ts` roots/`GameStateV31`/`GameState`; `tick.ts`
:1102-1110 one call between `appendFirstTakes` and `advancePromisesWeek`; `actions.ts` :596-599 one
call beside `breakPromisesOnCancel`; typecheck-forced `worldgen.ts` :783-785 and
`historical-control.ts` :23/:25-26/:30/:45-46) → S2 chooser (`talentMarket.ts` :668 order 6→7,
:671-678, :698-702 both seven-member orders, :779-816 `bandsFor` D5 via the roster helper, :999-1010
`FreezeDrop` + `nemesisOnRoster`, :1022-1032 sentence, :1067 check, comment :659-662) → S3 save
(`save.ts` types/union, dispatch +31 with the "1 through 31 only" sentinel, `LIVE_SAVE_VERSION`/
`makeSave`, the 18 downgrade throws, route lines, `migrateToV30` 31 arm, the V31 block; `index.ts`;
`src/harness/d16/*`; `legacy-v28-fixtures.ts` if typecheck demands) → S4 load/runtime
(`bridge/session.ts`, `bridge/runtime-checkpoint.ts` V31 strict import, `campaign-library.ts`,
`ui/src/engine/adapter.ts` → `migrateToV31`) → S5 wire (`bridge-schema.ts` :233 48 and :2320-2324
+`relationships`; `bridge/people.ts` :866-875 +label; `runtime-checkpoint.ts` :59-63 +`projection-v47`
for `sha256:6f6b4880…`; the generator once over its three artifacts). Self-check honesty: S1/S2 are
typecheck-only (the controls cannot be green until the V31 validator exists); first control checkpoint
after S3 (engine 46/46; save-v31 56/57 with only the `LIVE_SAVE_VERSION toBe(30)` sweep pin RED; bridge
6/15; p14b1-promises 15/15; outcomes 23/23); after S5 bridge 12/15 (the rest sweep class) plus the
existing runtime47 :162-170 pins RED (sweep class). Frozen: plan (12) — the promises law/evaluator/
`PROMISE_RULES_VERSION 4`, trust derivation, root validators, `promiseCapacity*` + replay,
`decide()/staff()`/seating, `finishHollywoodWeek`, the settlement order, `authorRivalPromise`,
cap/metric, `TUNING`, every `DROP_SENTENCE` string, every V≤30 validator, every test and fixture, the
cancel proof.

## Next

NEXT657: T2 writer (658-W) → land S1–S5 via commit-tree → record-checks (RED files, typechecks) →
test-author values-only sweep of the test pins (659-T2) → T3 controls with the ledger → T4 full core
vs 636 / full UI vs 643 → 660-R review → qualified-checkpoint record → headers, backlog. Owner items
open unchanged (628 R5 / G-1(A) / G-2; 637; B.5 OPEN 1–3/11/15). Unity/native deferred.
