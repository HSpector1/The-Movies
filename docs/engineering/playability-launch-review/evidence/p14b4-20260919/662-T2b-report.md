# 662-T2b report — P14B.5 values-only test sweep, continued (test-author; HEAD 2ef914ad; Git read-only; no commits)

STATUS: DONE. Worktree /Users/zacheryspector/The-Movies-headless-program, HEAD 2ef914ad (candidate 040651b4 + evidence 659-661).
Inherited working tree verified before any edit: `git diff HEAD --binary -- tests ui | shasum -a 256` = e2c8f631494de194f19ab97a712fa80cec3c2d52ec8ff1b5d81d2fa082b9f4e0 (the parent's 662-T2-partial.patch prefix). Nothing reverted wholesale.
Final patch: scratchpad/662-T2b.patch = `git diff HEAD --binary -- tests ui`, sha256 8ed90a186de286880df51f86af10cf82dff49b484566e0935c0db2aa101b288d, 258032 bytes, 121 files (628+/528-), tests/ and ui/ only.
Files I edited beyond the first agent's tree: tests/bridge-p14b5-relationships.test.ts (two hunks), tests/p14b5-relationships.test.ts (one hunk). No production, fixture, helper, generated artifact or timeout touched by me.

## A0. Audit of the blanket sweep (65 non-precedent lines read; 19 boundary files read hunk by hunk)

Method. (1) Every removed line of the 121-file diff was matched against the 600-T2 per-line move table (the 29->30 precedent): a removed line equal to a line 600-T2 moved TO is the same LIVE site one version later. 174 removed lines did not match; 65 of them are in blanket files, 109 in the hand-edited boundary files. (2) The 65 blanket non-matches were read individually: one-past sentinels (31->32, "1 through 30"->"1 through 31": construction-save-v11, contracts/v14-boundary-guards, d17a-adv-migration, d17b-save-v7, p13b-r07-save-v25, p13b-s2-save-v22, p13b-s3-save-v23, p13b-s5-save-v24, p13b-s6-save-v26, p13b-s8-save-v27, p14a1-save-v28, property-state-v13, script-projects-save-v9), import lines and titles/comments, and live-envelope pins on `makeSave`/bridge `saveJson`/legacy-fixture-lifted-to-live output (bridge-p14a2-market :772/:784/:794, p13b-s6-save-v26 :133/:254, p13b-s8-finance :63/:159, p13b-s1-save-v21 :102, p14b1-t4-regressions :74 hand-built live envelope validated by the live validator, p14b4-cancel-causal-proof :270, p14b4-rival-seating-preference :93, the eight UI pins). (3) Frozen-corpus readers: `grep -rl genuine-v30 tests ui` = only the three RED files; every remaining `validateSaveV30(`/`migrateToV30(` call in tests/ is in those three files or tests/p14b4-save-v30-compatibility.test.ts, all reading a genuine V30 envelope or pinning the V29->V30 / V31->V30 boundary. No genuine-v29/v28 reader was touched (the sed had no V29/V28 rule). (4) The four priorityOrder arrays were checked against companion §2.1.7 :120 (P14-PREPARATION-COMPANION.md), not against talentMarket.ts: unproven = opportunity, compensation, relationships, term, trust, standing, incumbency; proven = compensation, term, trust, relationships, incumbency, standing, opportunity. Both match.

Result: every moved literal/call is a LIVE builder, route, pin, sentinel, projection/schema identity, hand-built live literal gaining `relationships: []`, or the companion order (R-VERSION / R-ORDER-VALUE). Frozen-validator moves found: NONE. Reversals: NONE needed.

Boundary files (hand edits verified; each "662-T2 (P14B.5, R-VERSION)" comment matches its hunk):

| file | what moved | invariant kept |
|---|---|---|
| tests/_historicalCurrent.ts | migrateToV31 route, SaveFileV31, saveVersion 31, lift gains `relationships: []` | the pre-V19 lift writes what convertV30ToV31 writes (empty root) |
| tests/bridge-contract-generator.test.ts | projectionVersion 48, schema id 00c0075b… (twice), F10/F11 declaration hashes UNCHANGED (recomputed once, 662-T2-gen-hash.log) | identity read from the checked-in manifest at 040651b4, never from the test itself |
| tests/bridge-p06-checkpoint-recovery.test.ts | SaveFileV31, saveVersion 31, `relationships` destructured and pinned `[]` | V16->live preservation compared field by field, not against the migration's own output |
| tests/bridge-p14b2-checkpoint.test.ts | migrateToV31, governed slot = source + version tag + empty root | genuine45 slot bytes unchanged; runtime writes exactly `exportSave(migrateToV31(...))` |
| tests/bridge-p14b4-cast-class.test.ts | migrateToV31 lift after `validateSaveV29` (KEPT), `save.state` = old.state + empty root, validateSaveV31 on live envelopes, seven-member orders :410-411, GameStateV30 -> GameState types | frozen V29 admission first; orders = companion :120 |
| tests/bridge-p14b4-runtime47-compatibility.test.ts | `validateSaveV29` KEPT; migrateToV31 as the expected live lift; PROJECTION 48 / LIVE 31; +outgoing-47 id (36) | expected list still literal, sorted, not derived from the registry |
| tests/bridge-p14b5-relationships.test.ts | frozen describe re-expressed (48 / 00c0075b… / 31 / 36 ids / prior path once); `validateSaveV30` KEPT at :262 and :357 for the genuine corpus; family 11 wire pins | see A1 and B |
| tests/bridge-runtime-checkpoint.test.ts | hydrated saveVersion 31 (x11), "canonical V31 save bytes", +outgoing-47 id | prior-id list literal |
| tests/c2a-m2-sets-save.test.ts | validateSaveV31 on live envelopes; two hand-built live literals gain `relationships: []` | forge cases unchanged |
| tests/cash-ledger-checkpoint-v11.test.ts | validateSaveV31 on live envelopes; one hand-built literal gains the root | refusal texts unchanged |
| tests/p14b1-save-v29.test.ts | LIVE_SAVE_VERSION 31; sentinel 32/"1 through 31"; reader types widened to `GameState \| GameStateV29` | every validateSaveV29/migrateToV29 site untouched (V28->V29 boundary) |
| tests/p14b3-rule-revision.test.ts | live half of the byte pin: migrateToV31 governed = raw + tag + empty root; `makeSave({...reloaded.state, relationships: []})` reproduces it | V29 half (validateSaveV29, migrateToV29, byte-identical) untouched |
| tests/p14b4-cast-class-outcomes.test.ts | `live()` pins 31; `oldBound()` lifts the V29 fixture through migrateToV31 (empty root only); validateSaveV31 on live output | validateSaveV29 admission kept |
| tests/p14b4-material-evidence-core.test.ts | migrateToV31 after `validateSaveV29` (KEPT); migrated.state = old.state + empty root; Envelope/GameState types; staging clones the lifted state | frozen admission before governed migration |
| tests/p14b4-save-v30-compatibility.test.ts | ONLY `makeSave(migrated.state) toEqual(migrated)` re-expressed as lift + makeSave equality; LIVE 31 | validateSaveV30 / migrateToV30 / convertV30ToV29 boundary sites all KEPT |
| tests/p14b5-relationships.test.ts | `validateSaveV30` KEPT at :144 (genuine corpus); migrateToV30 downgrade pins :984/:991 KEPT; f6Base premise and family-5 loop (B) | see B |
| tests/p14b5-save-v31.test.ts | one pin: LIVE_SAVE_VERSION 31 plus `V30_AUTHORITY.saveVersion` 30 added | all 20 validateSaveV30/migrateToV30 frozen sites KEPT |
| tests/p14bf2-acting-discipline.test.ts | live half of the byte pin as in rule-revision; validateSaveV31 on live envelopes | V29 half untouched |
| tests/save.test.ts | SaveFileV31 types; hand-built state gains the root; sentinel 32/"1 through 31" | V14/V15 boundary cases unchanged |

Four more hand-edited files from the 657-B sweep list (not in either list file): tests/contracts/_v14Contract.ts (V13 twin strips `relationships` behind the same never-discard-authority guard as firstTakes/promises), tests/p14a1-f1-priority-order.test.ts :86/:91, tests/p14b1-trust-chooser.test.ts :172-173, tests/p14b4-cast-class-policy.test.ts :30-31 (companion orders). tests/helpers/p14b2-fixtures.ts :7/:122/:210/:225 validateSaveV31 (frozen-builder/helper class).

Per-file class tally (generated from the final diff): scratchpad/662-T2b-audit-table.md (121 rows).

## A1. Typecheck

tests/bridge-p14b5-relationships.test.ts :353-357: `importSave(actualBytes)` returns the SaveFile union; added the runtime47 :201 guard `if (actual.saveVersion !== 31) throw new Error('slot did not reach the live Save31')` after the RED's own `expect(actual.saveVersion).toBe(LIVE_SAVE_VERSION)`, narrowing to the V31 member. Re-run on the FINAL bytes (after every edit below): `npm run typecheck` EXIT 0 (662-T2b-typecheck.log); `npm run typecheck:bridge` EXIT 0 (662-T2b-typecheck-bridge.log).

## B. RED-side amendments (none decides OPEN 1-3/11/15; none weakens a frozen pin)

Already applied by the first agent, verified against the file's own helpers and the module:
1. tests/p14b5-relationships.test.ts f6Base (:351 old): `edges(state) toEqual []` -> the player filed no first take; `rosterAt(state, playerId, subject, 208)` holds offCycle; no edge whose pair intersects that roster; `findEdge(subject, offCycle)` undefined. Every downstream family-6 assertion unchanged.
2. tests/p14b5-relationships.test.ts family 5 re-tick loop: scoped to `seatPairs({directorId: FROZEN.directorId, cast: FROZEN.cast})` (the six player pairs) comparing `findEdge(again)` to `findEdge(after)`.
3. tests/bridge-p14b5-relationships.test.ts leak loop: every probe in key form (`"closeness":` … `"relationships":`); REFINE (a) the `String(closeness) + '"'` substring probe dropped in favour of the `"closeness":` key probe; REFINE (b) literal 8 -> `rel.RELATIONSHIP_RECENT_CAP` (exported by src/core/relationships.ts, re-exported at index.ts :1468).

Two further RED-side premises I amended (each an unmeasured premise in a case that never ran past the old :351 premise; 654-T ledger §E marks the treated branches "RED until T2"):
4. tests/p14b5-relationships.test.ts f6Base, the committed-at-W probe actor. Failure on first run: `AssertionError: F6 premise: the free actor was taken before the 208 pass; never forge a row` at :851 (`hiringMarketIds(preMarket208, 208).includes(base.free)` false). Cause: TUNING.HIRING_MARKET_ROTATION_WEEKS = 13 and 208 = 16 x 13, so the hiring market resamples between 207 (epoch 15) and 208 (epoch 16); the actor picked from the 207 listing is not in the 208 listing. `src/core/employment.ts` is untouched by 658-W (last change ad35a81d). Amendment: pick the actor from the 207 listing that is ALSO in `hiringMarketIds(state, 208)`; the :851 guard on the real pre-market 208 input stays. New text: `const listedAt208 = new Set(hiringMarketIds(state, F6.W))` and `.find((t) => t?.role === 'actor' && listedAt208.has(t.id) && ![...].includes(t.id))`.
5. tests/bridge-p14b5-relationships.test.ts :414 (control branch). Failure: `expected [] to deeply equal ["this person could not separate 2 equally ranked proposals."]`. Cause: `caseDisclosure` (talentMarket.ts :512, blame d49cc274 2026-09-18, pre-B.5, no settlement line in the 658-W S2 diff) publishes `settlementReasons` from the latest SETTLED receipt only; a DECLINED case shows `[]` on the wire while the tie sentence lives on the receipt (:412-413 hold). Amendment: `controlWire` equals `[...marketModule.caseDisclosure(controlState, F6.subject, base.playerId).settlementReasons]` (the bridge-p14a2-market :479 device), equals `[]`, and carries no non-FROZEN sentence. The treated branch's verbatim D5 sentence pin and all key-form leak probes are unchanged.

## C. CANNOT-MOVE residue: EMPTY

Measured green on the final bytes: family 12 four seed ledgers (settlement/receipts/employment/takes digests, rngState, row counts, bands all 1) and the poachingFixture control (bridge RED 15/15); the D3 case in tests/p14b1-trust-chooser.test.ts (13 passed, 2 todo); tests/p14b4-cast-class-outcomes.test.ts 23/23; tests/p14b1-promises.test.ts 15/15; chain digests in family 1/9 of the engine RED (46/46). No digest, receipt, rngState or FirstTake assertion was re-pinned.

## Checks run (one process at a time, never --watch; logs in the scratchpad)

| check | result | log |
|---|---|---|
| npm run typecheck (final bytes) | EXIT 0 | 662-T2b-typecheck.log |
| npm run typecheck:bridge (final bytes) | EXIT 0 | 662-T2b-typecheck-bridge.log |
| tests/p14b5-relationships.test.ts | 46/46 (first run 45/46, item B4) | 662-T2b-red-engine.log |
| tests/p14b5-save-v31.test.ts | 57/57 | 662-T2b-red-save.log |
| tests/bridge-p14b5-relationships.test.ts | 15/15 (first run 14/15, item B5) | 662-T2b-red-bridge.log |
| tests/p14b1-promises.test.ts | 15/15 | 662-T2b-p14b1-promises.log |
| tests/p14b4-cast-class-outcomes.test.ts | 23/23 | 662-T2b-outcomes.log |
| p14b2-fixtures consumers (15 .test.ts from 662-T2-p14b2-consumers.txt, one command) | 14 files passed, 283 passed / 2 todo; 1 failed: tests/p14b4-cast-class-capacity-evaluator5.test.ts :239 `expected 'FRAGILE' to be 'IMPOSSIBLE'` | 662-T2b-p14b2-consumers.log |
| tests/bridge-p14b4-runtime47-compatibility.test.ts | 6/6 | 662-T2b-runtime47.log |
| four priorityOrder files (p14a1-f1, p14b1-trust-chooser, bridge-p14b4-cast-class, p14b4-cast-class-policy) | 4 files, 50 passed / 3 todo | 662-T2b-priority-order.log |
| ui project: d17-save-migration, film-chronicle-adapter, v14SetHolderBoundary, saves.test.tsx, session.test.tsx (--minWorkers=1 --maxWorkers=1) | 5 files, 45/45 | 662-T2b-ui.log |

The evaluator5 failure is inherited: same file, same line :239, same text in the 636 baseline (636-cancel-full-core.txt :1580/:2631/:2637); the file is unchanged by the sweep; 600-T2 §0 lists it "by law (evaluator 5)".

## Frozen calls deliberately left

`validateSaveV30`: bridge-p14b5-relationships :262 and :357 (genuine projection-47 slots ARE V30 bytes); p14b5-relationships :144; p14b5-save-v31 :107/:165/:199/:214/:287/:307; p14b4-save-v30-compatibility :131/:334/:344/:352/:363. `migrateToV30`: p14b5-relationships :984/:991 (downgrade refusal / empty-root downgrade); p14b5-save-v31 :163/:192/:197/:204/:262/:268/:273/:278; p14b4-save-v30-compatibility :128/:309/:319. `validateSaveV29`/`migrateToV29`: bridge-p14b4-cast-class :57/:396; bridge-p14b4-runtime47-compatibility :191; p14b4-material-evidence-core :59; p14b4-cast-class-outcomes (fixture admission); p14b1-save-v29 (all); p14b3-rule-revision :74/:107; p14bf2-acting-discipline :281/:302. No genuine-v29/v28/v30 corpus is validated by anything but its own frozen validator.

## Evidence limits

Full core and full UI not run (parent's). vitest does not typecheck; both tsc runs are on the final bytes. The p14b2-consumers list's provenance/MANIFEST JSONs are not runnable and were not "run". Family-6 amendment B4 changes WHICH actor the committed-at-W probe signs (the first actor listed in both epochs); the probe's law assertions (startWeek === W off the roster -> decline by tie; startWeek 207 -> settled with one new sentence) are now measured green for the first time. Nothing native, nothing Owner-accepted; Git untouched (diff/status/log/blame only).

## Next concrete action

Parent reviews B4/B5 as RED-side amendments (record them beside 658-W items 1-3), applies 662-T2b.patch via the index, then the T3 control run with the ledger and T4 full core vs 636 / full UI vs 643.
