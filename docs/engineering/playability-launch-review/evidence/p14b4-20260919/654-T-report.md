# 654-T — P14B.5 T1 RED report (test-author)

STATUS: DONE (RED installed and measured; nothing under src/, bridge/, generated/, ui/, tests/fixtures/ or any existing test touched).

## Identity
- Worktree /Users/zacheryspector/The-Movies-headless-program. Task HEAD 74bd325b (clean at start). The parent's docs-only
  header commit 8708d6a9 landed during authoring; `git diff --stat 74bd325b..8708d6a9 -- src bridge generated ui scripts
  package.json 'tests/*.ts' tests/helpers tests/fixtures` is EMPTY, so every measurement and pin holds at both.
- `git status --short` after the work: exactly three untracked files (below). Git was read-only throughout.
- Files written (names per the expansion's Tests paragraph):
  - /Users/zacheryspector/The-Movies-headless-program/tests/p14b5-relationships.test.ts (986 lines; sha256 9484c846fef649200107dde913e9f165eef40a1eb3735209e9e34883845be6b4) — families 1–8, 10 and the family-9 one-edge refusal.
  - /Users/zacheryspector/The-Movies-headless-program/tests/p14b5-save-v31.test.ts (308 lines; sha256 183705ede8a2f755ed13ab31baf23a7323a622faa56c9c79b34030aca7ec0e94) — family 9 only.
  - /Users/zacheryspector/The-Movies-headless-program/tests/bridge-p14b5-relationships.test.ts (458 lines; sha256 cca1237b1758f976da7ce26e86f222c10927db0997d591875c86c33752627d83) — families 11–12.
- Evidence: /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/
  654-T.patch (git diff --no-index per file, concatenated; sha256 45631d1eeeedff2bc916097b0c9d712eb6ec81da22c38b6158f43e8244dcfe2d),
  654-T-ledger.md (sha256 dfa0bb3611c6732f10e0b5c406d6c710919f6730b4707b875b59d4bbdb7f7647), 654-T-ledger-raw.json,
  654-T-typecheck.log, 654-T-red.log, 654-T-controls.log; probes probe-ledger.ts, probe-f1.ts, probe-release2.ts,
  probe-offcycle.ts, probe-bridge.ts, f6.probe.test.ts (+ vitest.probe.config.ts).
- Tooling: node v20.20.2, vitest v2.1.9, tsc (repo-local). One test process at a time, no --watch, no full suite.

## Checks run (each once)
1. `npm run typecheck` → EXIT 2 (`tsc --noEmit` stops the chain; the ui project did not run). Exactly 8 errors, all in the
   two typechecked new files (tests/bridge* is excluded by the root tsconfig): 1× TS2307 `../src/core/relationships.js`
   absent (p14b5-relationships :86); 6× TS2724 missing save exports `migrateToV31`/`validateSaveV31` (relationships :73)
   and `convertV30ToV31`/`convertV31ToV30`/`migrateToV31`/`validateSaveV31` (save-v31 :28-30); 1× TS2322
   `'nemesisOnRoster'` not assignable to `FreezeDrop` (relationships :907 — the family-8 enumerated-member pin).
   Not EXIT 0: the RED files ARE inside the root tsconfig include; the expansion's own T1 check line expects exactly the
   new module errors. Log: 654-T-typecheck.log.
2. `node_modules/.bin/vitest run --project core tests/p14b5-relationships.test.ts tests/p14b5-save-v31.test.ts
   tests/bridge-p14b5-relationships.test.ts --minWorkers=1 --maxWorkers=1` → EXIT 1; Test Files 3 failed (3);
   Tests 37 failed | 35 passed (72). Log: 654-T-red.log.
   - p14b5-relationships.test.ts: 0 collected — "Failed to load url ../src/core/relationships.js" (module-resolution RED,
     the B.1 precedent). Every family 1–8/10 case is RED at import.
   - p14b5-save-v31.test.ts: 57 tests, 26 GREEN / 31 RED. GREEN = the frozen side only: `LIVE_SAVE_VERSION` 30, the
     sentinel law (`LIVE_SAVE_VERSION + 1` refused "1 through 30 only"), the ten genuine V30 cases (pins, provenance,
     `validateSaveV30` first, byte-stable export, V29 downgrade law), the nine V29 cases → V30 byte-identical, the four
     legacy V28 files → V29/V30, the projection-47 checkpoint's two embedded V30 saves. RED = every family-9 case:
     5× "expected 'undefined' to be 'function'" (existence assertions), 26× `TypeError: migrateToV31 is not a function`
     (the ten V30 lifts, the older-routes case, nine V29 + four V28 lifts, the two checkpoint slots, the V31 envelope
     boundary).
   - bridge-p14b5-relationships.test.ts: 15 tests, 9 GREEN / 6 RED. GREEN = the four frozen-side pins (projection 47,
     SCHEMA_ID sha256:6f6b4880…, `LIVE_SAVE_VERSION` 30, exactly the 35 prior ids with projection-v46 at the head and 47
     NOT registered; the checkpoint loads as CURRENT with no migration; the generator artifacts equal the running
     identity; the `line` on current-p1 and the six-member value parsing) and the five family-12 ledger controls (four
     seeds + poachingFixture). RED = the six family-11 cases: wire enum 6 vs 7 members; `PROJECTION_VERSION` 47 not > 47;
     `migrateToV31` undefined (×2 checkpoint slots); `preferences.priorityOrder` 6 vs 7; the D5-sentence/leak case
     rejects on the dynamic import ("RED: src/core/relationships.ts does not exist yet").
   No premise error, no timeout, no unexpected failure class (15 distinct error lines cover the 37 failures).
3. `node_modules/.bin/vitest run --project core tests/p14b1-promises.test.ts tests/p14b4-cast-class-outcomes.test.ts
   --minWorkers=1 --maxWorkers=1` → EXIT 0; 15/15 and 23/23 (unchanged). Log: 654-T-controls.log.

## Families — sentence, construction, expected vs observed, stop line
(plan = P14-HEADLESS-PLAN.md "P14B.5 — First Shared-Work Bond Core — task expansion"; companion = P14-PREPARATION-COMPANION.md)

1. EDGE MINTING (plan scope (2)/(2a); companion §5.4 :439, §5.7 :487, §8 :644). Route: genuine-v30-first-take-at-five →
   migrateToV31 → assignShootingDirector + scheduleShootingTake → one tick (measured: first-take-event-24 at 61).
   Expected: exactly six edges in the receipt's seat order with `RELATIONSHIP_BASELINE + proximity`, week 61 everywhere,
   canonical keys, ordinal edgeIds; replay byte-identical; re-tick leaves the six untouched and mints only from that
   week's delta; the seam idempotent on the same delta; rngState byte-equal (pinned "2598418427,508725886,1318803286,
   3129010527") and the stripped post-tick digest 6403ac2b… (CANNOT-MOVE); guard order empty-delta → root guard →
   hollywood null; a person seated twice refused; legacy-v28-shooting-5 (hollywood null) keeps the root empty.
   Observed: file fails to load (module absent). Stop line: 654-T-red.log "Failed to load url ../src/core/relationships.js".
2. CANONICAL KEY / REPETITION (scope (2a); :442). Route: genuine-v30-rival-current-p1-and-p2 (196) → the natural rival chain
   (measured: r01 film:11 take @213, film:6 take @222). Expected: six edges at 213 (Q3: the 45 pre-migration takes mint
   none); at 222 each repeated pair is ONE edge, sharedProductions 2, `recent` ends [sharedProduction, repeatedCollaboration
   min(1, REPEAT_CAP)], closeness = drift(prev) + weight + accelerator; a < b. Observed/stop: module absent.
3. DRIFT ON READ / FOLD (scope (3), (9); §5.5 :467-468). Route: staged validator-admitted edges; independent drift oracle
   (the plan formula); a dormant write through the seam with a real FilmResult (criticScore set to the success edge).
   Expected: unchanged through GRACE, then toward the baseline by the formula from either side, never past, returned at
   GRACE + RETURN; tier never moves away from Acquaintances; a read touches nothing; the write materialises drift then
   applies the delta; `recent` folds by count at RELATIONSHIP_RECENT_CAP with counters exact. Observed/stop: module absent.
4. TIER RULE (scope (3)-(4); §5.3 :423-433; 647-B D2). Expected: RULES_VERSION 1, eight members, byte-equal output;
   Enemies/Nemeses bands read Strained without a conflict record; FAILURE_DELTA > PROXIMITY_LOW by name; a flop nets a
   low-proximity pair below the baseline; a staged Acquaintances-floor pair reads Strained and pairChemistry sign −1 after
   a flop; Enemies/Nemeses never read on any minted edge. Observed/stop: module absent.
5. RELEASE / CANCEL (scope (2b)-(2c); 647-B R1). Route: the genuine picture committed at 64 (Release Ready), released at 65
   with releaseTick 64 (criticScore 50.74 measured; the RED branches on the success/failure edges at runtime); the rival
   film:11 release @217 (cs 44.1); `cancel` of prod-0052 with the take (promise-0 stays SATISFIED, take not un-taken) and
   without the take (relationships empty; promise-0 stays OPEN under the frozen law — measured). Expected: the selected
   driver on all six pairs once, week = state.market.tick = releaseTick + 1, rngState pinned "3273107727,1382938971,
   2227203681,3129010529"; idempotent on re-tick and on seam replay; a release whose take predates every edge mints
   nothing (interpretation I2); cancelledAfterFirstTake −CANCEL_DELTA at the action week, sharedCancellations 1, helper
   idempotent and a no-op without a take. Observed/stop: module absent.
6. D5 IN THE CHOOSER (scope (5); companion :116, :120; 647-B D1/R7). Route: the B.2 T3 controlled staging on
   p13-public-commercial-adoption under D1 — MEASURED control: declined "this person could not separate 2 equally ranked
   proposals." (every landed band ties between player and r01; ledger §E). Expected treated branches: CloseFriends edge
   with the off-cycle player row (60→216) → player settles, reasons = [the D5 sentence] only, no digit/person/tier in it,
   dropped unchanged; drifted below CloseFriends → decline; counterpart closed AT W (0→208) → decline; counterpart
   signed inside the 208 pass (startWeek === W) → decline, the same counterpart signed at 207 → settles; an Enemies-band
   (Strained-by-rule) counterpart → decline (`enemies here` never read). Observed/stop: module absent.
7. PUBLIC ORDER (scope (5); companion :120). Expected: seven-member companion orders for both archetypes;
   publicPreferredTerm unchanged. Observed/stop: module absent (the file). The bridge file's family-11 case shows the
   value RED directly: "expected ['opportunity','compensation',…(4)] to deeply equal […(5)]".
8. RESERVATION / CHEMISTRY (scope (6)-(7); §5.6 :476, :482). Expected: pairChemistry {null,0,[]} without an edge, symmetric
   in argument order, sign +1 Colleagues+, 0 at Acquaintances, −1 Strained and below, no digit in reasons; `nemesisOnRoster`
   a FreezeDrop member (type pin → TS2322 today); the leak extension lives in the bridge file (needs DTOs). Observed/stop:
   module absent; TS2322 at relationships :907.
9. SAVE V31 (scope (10)). Expected: every genuine V30 case → migrateToV31 with `relationships: []`, every other root
   byte-identical per key, validateSaveV31/validateSave/loadSave/importSave/makeSave agree, convertV31ToV30 and
   migrateToV30 reproduce the raw bytes; the older routes behave as from V30; V29 and V28 corpora reach V31 through
   their frozen chains; both checkpoint slots lift; the V30 validator is never taught the root. Observed: 31 RED
   ("migrateToV31 is not a function" / existence). The one-edge refusal ("cannot downgrade SaveFileV31 or discard the
   relationship record", every older migrateToVn refused, lossless when empty) sits in the synthetic file (record 653 (4)).
10. ROOT VALIDATOR (scope (10)). Expected refusals: missing root, non-ordinal edgeId, duplicate pair, non-canonical key,
   unknown person, firstSharedWeek > lastEventWeek, week outside [recordingStartedWeek, market.tick], driver week after
   lastEventWeek, recent over cap, peakTier outside the catalogue, closeness out of range/non-integer, inconsistent
   counters, unknown kind / empty ref / non-integer delta, an extra key — each named in the message. Observed/stop:
   module absent.
11. BRIDGE (plan "Scope — bridge"). Expected RED-by-value: enum gains `relationships`; SCHEMA_ID off 6f6b4880… and
   PROJECTION_VERSION > 47 with 47 registered as projection-v47 (36 ids); checkpoint takes the prior path with both
   slots = exportSave(migrateToV31(…)); seven-member `preferences.priorityOrder` with the `line` unchanged ("Prefers
   terms of 1 year · Weighs the opportunity offered first, then compensation") on current-p1 t-act-09; the D5 sentence
   verbatim in settlementReasons on the family-6 world for every viewer; no closeness/edgeId/recent/peakTier/
   relationship-edge- on marketCaseProjection/peopleProjection/marketPage. Observed: the six RED lines above.
   The generator `--check` is not run by the test (a process spawn); artifact/identity sync is pinned instead.
12. NATURAL CHAINS — see the ledger summary. GREEN today as controls.

## Ledger summary (654-T-ledger.md; installed as family 12)
- Seeds: p13a-core-causal-01 (default), seed-b, p13b-s8-bridge-probe-01 (the bridge seed, plain campaign),
  p13-public-commercial-adoption (adoption); 416 ticks each on unchanged source.
- Settlements sit ONLY at the synchronized churns 208 and 416 (the plan's "404" is the second-cycle case-OPEN week).
  Rows: 40 / 48 / 48 / 48 (settled/declined/expired 16/8/16, 48/0/0, 48/0/0, 36/12/0).
- D1 FINDING, measured: at 208 NO churn-week survivor has a non-empty roster under the predicate on any seed (0 of 96
  rows) — the corrected prediction (churn receipts NOT exposed) holds. At 416 the only rows active under the predicate
  are r01's four `replacement` rows 265→473 (`*-r01-supply-265-6..9`, research-supply staff) on three seeds (15/10/6
  rows have such a survivor); none shares a first take with any subject.
- EXPOSED rows: 0 on every seed. Off-cycle settlements: none on these plain campaigns. Therefore the four settlement
  digests (706e54c6…, f9622a87…, f8b0d3a7…, c034f2fb…), the receipts/employment/takes digests and rngState per seed
  MUST NOT MOVE at T2; a moved digest at T3 is a defect to attribute, never a re-pin. After T2 the same routine
  recomputes every survivor's D5 band from the engine's tiers and asserts the R2 receipt rule on every settlement.
- poachingFixture: reasons :200-201 and endedWeek 208 hold; under D1 r04's roster is empty at 208 and the player's
  holds only the writer signed at 196, who shares no take with the subject → predicted NOT to move (installed control).
- The D3 controlled case (trust-chooser :305): both rosters empty at 208 under D1 (r04 closed AT W; the player's only
  row ended at 52) → premise survives; no re-expression.

## Fixture findings
- T0 corpus: all ten V30 cases and the projection-47 checkpoint match MANIFEST/provenance byte-for-byte; every V30
  file lacks a `relationships` key (as it must). The fixture worlds are player-acted campaigns, so their 208 churn is
  NOT the plain-seed ledger's; family 2/5's rival weeks (213/217/222/226) are pinned as premises from a measurement on
  the fixture world itself (ledger §C).
- The player picture needs the explicit `commitPictureToRelease` at Release Ready (64) before it releases (65); no
  automatic release exists — the RED uses the real action.
- criticScore of the one genuine player release is 50.74; whether it is a success, a flop or between is decided by
  the hypothesis constants at T2 — the RED branches on them and additionally exercises the flop through the seam with
  the real FilmResult's criticScore varied (interpretation I3, named in the file header).

## Interpretations the parent may rule on (all named in the file headers; none is a refusal)
- I1 names: `RELATIONSHIP_TIER_FLOOR` (record keyed by tier, Nemeses 0) for "the seven tier edges as named constants";
  `RELATIONSHIP_TIERS` / `RELATIONSHIP_DRIVER_KINDS` as the runtime catalogues. The seam signature pinned is
  `advanceRelationshipsWeek(state, { takes: [{ studioId, production }], releases: FilmResult[] }, week)`;
  `recordCancelledAfterFirstTake(state, playerStudioId, production)`; `pairChemistry(state, a, b, week)`;
  `currentCloseness/currentTier(edge, week)`; `validateRelationshipsRoot(rawState)`; `projectRelationshipsPreV31(rawState)`;
  `driverGain(state, a, b, delta)`; `requireRelationshipsRoot(state)`. T2 may rename with the ruling recorded.
- I2: a release whose take predates every edge (pre-migration take) mints nothing.
- I4: the D5 sentence is identified as the one settled reason outside the eight frozen sentences (class pinned, not prose).
- The V31/48 literals are not asserted; the frozen pins (30 / 47 / 6f6b4880… / 35 ids / checkpoint-as-current) are
  labelled R-VERSION and are the test-author's own sweep items after T2.

## Evidence limits
- No native/Unity, no UI run; typecheck:bridge not run (T3 item); the generator was not run; the ui typecheck did not
  execute because the core tsc failed first.
- The four-seed ledger covers 416 weeks of plain campaigns; player-acted campaigns (the fixtures, retention/history/
  rival fixtures) are pre-declared by rule, not measured, except the facts in ledger §C–E.
- Whether Strained or Close Friends is ever READ on the standard seeds is a T4 measurement, not a pin here.
- The family-6 treated branches, every engine family and family 11 are unexecuted by construction (RED); their
  expectations are law-derived and cross-checked by independent oracles, not by any output.

## Next concrete action
Parent: record-check baseline on unchanged source (sourceSha, the three file hashes above, testedDiffSha256 of 654-T.patch),
then 653-B review of the RED against the inserted expansion, then T2 (one sim-core writer). Test-author's later items:
the R-VERSION/R-ORDER-VALUE sweep of test pins after the production patch lands (this file set included: the frozen
describes), never before.
