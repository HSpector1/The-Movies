# 1344-C5 S10 pre-declarations, revision 2 (after review 1344-D5 and ruling 1344-F4)

Test-author, read-only. Nothing here was executed. The reviewed revision stays intact in `declarations.md` and
`probes/`; this revision and `probes-r2/` replace them.

Sources:
- the repository at 1063ab4f, whose `src` tree (db80ca31) equals the merge tree's;
- the merge tree `/Users/zacheryspector/studio-scratch/1344-merge/tree` at a318722;
- the recorded runs: 1344-I (`1344-save43-broad-core.txt`) and 1338 (`1338-t1-broad-core.txt`).

## Rulings applied

- F4 ruling 1: rows 1-4 are retained 1338 identities. They are attributed, never re-pinned. Part f of rows 1-4 is
  struck, and so is the row 1 reviewer note.
- F4 ruling 2: row 5 is S7. The strip moves; the pin stays.
- F4 ruling 3: row 7 is class ORACLE. The oracle text sits at :607-608.
- F4 ruling 4: row 6 is S10 proper. The probe decides between a re-pin and a premise conflict.
- F4 ruling 8: the sweep lands first, and slice A RED r5 rebases onto it.

## Line references

- Lines are the merge tree's. `p14b4-rival-seating-preference`, `p14b1-trust-chooser` and `p14b5-relationships`
  have no sweep edit at any line cited here. In `p14b5-relationships` the sweep changed only the import at :74 and
  five validator calls at :1049-1175.
- In `bridge-p14b5-relationships` the sweep inserted `withEmptyScreenplayShelving` at :67-76. Every later line moves
  by 10, so the recorded frames :530 and :550 are merged :540 and :560 (D5 check 7).
- The recorded runs used the repository's test bytes. None of the four files changed between ff803032 and HEAD
  (`git log ff803032..HEAD` on them is empty).

## Common attribution base (D5 section 2: holds)

- `git diff --stat ff803032 HEAD -- src bridge generated` lists 18 `src/core` files.
  - Shelving steps 1-5: b6fcf948, ecd63b05, 83e7e76d, 1993fc4d, a988108b.
  - Five new pure modules: `sharedMarket.ts`, `powerRanking.ts`, `corporateCondition.ts`, `studioLoan.ts` and
    `campaignLegacy.ts`. No tick path, export, Bridge file or UI file imports them; only comments in `tuning.ts`
    name them.
  - `tuning.ts` only gains keys. `bridge` and `generated` have the same tree hashes at ff803032 and HEAD.
- With nothing shelved, the readers are the identity:
  - `shelvedScriptIds` (`hollywoodTypes.ts:142-145`);
  - `promises.ts:281-284`, `:414`, `:445`;
  - `opportunityPromises.ts:140-144`;
  - `rivalPromiseProjectCandidates` (`talentMarket.ts:1442-1449`).
- Two live differences remain with nothing shelved. `hollywoodTick.ts:236` re-searches a refusal (a pure call), and
  `:268-274` writes the count. Neither changes a decision before a count reaches 13.
- Decisions change only from a shelving (`:277-281`), the retry (`:286-299`) and the hold (`:302`).
- `convertV42ToV43` (`save.ts:10678-10685`) starts every count at zero on a migrated save.

---

## Row 1. `p14b4-rival-seating-preference.test.ts:498`, seed-b chain digest. Status: DECLARED r2, attribution only

a. Assertion :498, `expect(digest).toBe(CHAIN_DIGESTS[seed])`, leaf :459, case `seed-b`. The pin
   `CHAIN_DIGESTS['seed-b']` (:85, `f9cd2a86…`) does not move (F4 ruling 1). The leaf's other assertions are
   :461-491. The digest is the tuple at :495-496.
b. Chain: `scan('seed-b')` (:248) from `p13aGeneratedStudio('seed-b')`, `SCAN_TICKS` 350 (:58). Rows come from the
   spied `chooseIndustryPackage` calls with `lockScreenplay: true` (`filmDecisions`, :202). The digest covers weeks
   below `WITNESS.week` 211 (:59). Rivals are `studio-bc14baf6-r01..r04`.
c. Attribution: uncertain until the probe runs. The mechanism is unchanged from r1:
   - `evaluate()` calls `chooseIndustryPackage` with the same arguments (`hollywoodTick.ts:233`).
   - A shelved screenplay leaves the hot loop (:259) and returns only as a retry row (:290).
   - The hold (:302) delays the next commission.
   - 1338 had already moved this pin for the 969fb459 cause (1332-A). No record measures a seed-b shelving.
d. Gates. The probe writes every gate to `row1.predicates.json`.
   - C1 anchors (D5 C1). The head run reproduces the 1344-I value: `d32e68f685f658666d620bd3faee2841a3af4ac20373e9449ea0851fbb18a100`,
     115 rows, 544 decisions (raw log :117). The old run reproduces the 1338 value:
     `9eeb62f640c8a749e71a0c1d21b917ce5cf708f7ed002ce2470ca0605a48aac8`, 134 rows, 1099 decisions (raw log :29).
   - d1 (P1): at least one seed-b `screenplayShelved` receipt with week below 211. Ws is the earliest.
   - d2 (P2, revised per D5): every such receipt carries `rejections: 13`, and its screenplay's count read 12 in
     the state entering its week. A `chosen === null` row also covers cash-blocked weeks, so the r1 row form is
     dropped.
   - d3 as C3 (P3): sha256 of key-sorted JSON (`stableStringify`, `save.ts:679` at HEAD and :673 at ff803032, the same function) of the plain chain's state
     entering Ws, with `screenplayShelving` deleted from every business, is equal in the head and old trees.
   - d3 as C2 (P4): the old run loads `row1.head.json`. The first differing tuple has a week above Ws, so every
     tuple at or before Ws is equal.
   - d4 (P5): explanatory only (D5 C3). Each moved tuple is classed as a shelved key that stopped, a retry, a
     screenplay the old chain never decided, or drift.
   - d5 (P6): the leaf's :461-491 hold on head (`ok`, `pool === seam`, controls, no admissions).
e. Probe: `probes-r2/s10-row1-seating-seed-b.block.ts.txt`, RUNBOOK step 5 (head, then old).
f. Struck by F4 ruling 1: ~~New pin: `sha(JSON.stringify(stable.map(...)))` over the probe's rows, written only after
   predicates 1-5 pass, with a comment naming Ws, the shelved key and the first moved row.~~ ~~Reviewer note: a
   re-pin makes this leaf pass, so the 1338 identity goes.~~
   - All gates true: the changed primary at :498 is attributed to shelving. The row stays failing, and no test
     changes.
   - A false C1 means the run is not the recorded chain: stop and report.
   - A false P1, P2, P3, P4 or P6 refutes the attribution. The row then returns to the parent unattributed.

---

## Rows 2-4. `bridge-p14b5-relationships.test.ts` family 12. Status: DECLARED r2, attribution only

a. One leaf, `it.each(Object.keys(LEDGER_SEEDS))` at merged :534 (repository :524). `LEDGER_SEEDS` (:149) has four
   seeds; rows 2-4 are three of them (D5 check 7).
   - Row 2, `seed-b`: recorded frame :530:54, merged :540, the settled count. Head received 41 against 48 after
     `rows` passed with 48. 1338 failed later, at :547, on the extension row `talent-market-event-297`.
   - Row 3, `p13-public-commercial-adoption`: :550, merged :560. Head received
     `62c9fd5d2d7887b1b6263a38f9545f2ad77cd3db13a6b4bee03b6782f7c350c5`. 1338 failed at :530 (settled 35 against 36).
   - Row 4, `p13a-core-causal-01`: :550, merged :560. Head received
     `8a4df62fdd64ba26fc6e00e438c47c25749921fcad0e849921a7909f2f8b85f9`. 1338 received
     `4a047502216f05c0d2e972743d9d94be57be056039148499d6fde2750d4ac5a4`.
   - ~~More than one assertion must move~~: moot under F4 ruling 1 (D5 check 6). No pin moves.
b. Chain: `runLedger(seed, rel)` (:259-300), `p13aGeneratedStudio(seed)` from genesis, 416 ticks, one row per
   settled, declined or expired market receipt. `settlementDigest` (:255) hashes
   `[eventId, kind, week, talentId, studioId, reasons, dropped]` of each.
c. Attribution: Y for the mechanism; per seed, the probe must find the shelving.
   - `p13a-core-causal-01`: r01 shelves `script-0006` at week 93 (1344-E §5 item 4; 1344-F3), before the churn at 208.
   - Seed-b and `p13-public-commercial-adoption`: no shelving on record.
   - Paths from a shelving to a settlement are unchanged from r1:
     1. project and genre candidates (`talentMarket.ts:1442-1449`, `:1474`);
     2. the feasibility tuple `shelvedScripts` (`promises.ts:445`);
     3. cash, standing and employment after the hold.
d. Gates, per seed. The probe writes them to `ledger.<seed>.predicates.json`.
   - C1 anchors (D5 C1). Each run reproduces the counts its recorded run passed and the value it received at its
     first failure:

     | Seed | Head (1344-I) | Old (1338) |
     |---|---|---|
     | seed-b | rows 48, settled 41 | rows 48, settled 48, declined 0, expired 0; :547 unexpected `[{talent-market-event-297, extension sentence}]` |
     | p13-public | rows 48, settled 36, declined 12, expired 0; settlement `62c9fd5d…` | rows 48, settled 35 |
     | p13a | rows 40, settled 16, declined 8, expired 16; settlement `8a4df62f…` | same counts; settlement `4a047502…` |

   - d1, d2 and C2 (P1): a `screenplayShelved` receipt exists at Ws, and the first difference between the trees
     lies after Ws. The comparison covers the verbatim settlement receipts (with `studioId` on declined and expired
     receipts) and the verbatim rows (with `subjectStudioId`, survivors and `band`), per D5. The old run loads the
     head dump and asserts it.
   - C3 (P3): the plain chain's state entering Ws is equal in both trees (`stableStringify`, `screenplayShelving`
     deleted). The head chain carries no shelving receipt at that state.
   - d3 (E): explanatory only (D5 C3). Each moved settlement is listed with the proposals for that person in both
     trees and the issuers' shelvings before it.
   - d4 (P4): the probe evaluates the leaf's law lines on head, merged :543, :545, :546-551, :552, :555-557, :558
     and :565. It never runs a re-pinned leaf. `rel !== null` is asserted, because :235 swallows an import failure.
     At :557 a lone unexpected sentence passes only when it is seed-b's extension row and d6 holds.
   - d5 (P5): `state.rngState` is equal in both trees. The 416-week rng was never observed at 1338 or 1344-I, so
     the old tree is the reference, not the pin.
   - d6 (P6): seed-b's extension row keeps its person, winner, week and sentence. Its event id moves by exactly the
     change in the number of market receipts before it.
e. Probe: `probes-r2/s10-rows2-4-ledger.block.ts.txt`, RUNBOOK step 6 (head, then old). The head run dumps
   `settlementRows(state)`, the rows and every market receipt verbatim.
f. Struck by F4 ruling 1: ~~New pins: the counts from the probe's rows; `settlement`, `receipts`, `employment` and
   `takes` recomputed by the leaf's own expressions, written only after 1-6 pass.~~
   - All gates true: the changed primary is attributed to shelving, and the row stays failing.
   - A false C1 stops that seed.
   - Any other false gate refutes that seed's attribution, and the row returns to the parent unattributed.
   - `p13b-s8-bridge-probe-01` stays SAME at :530 with its 1338 cause. It is not S10, and the probe does not run
     it.

---

## Row 5. `p14b5-relationships.test.ts:596`. Status: DECLARED, class S7 (F4 ruling 2)

a. Assertion :596, `expect(sha(bytes(after))).toBe(FROZEN.postTakeDigestStripped)`. The pin (`9702aa68…`, :152)
   does not move. `bytes()` (:256-300) gains the strip of `screenplayShelving`, with the F4 ruling 2 guard before
   it. D5 confirmed that `bytes()` has one caller, :596.
b. Chain: `takeWorld()` (:309-326) runs the genuine V30 save at week 60 (`V30_PINS`, :116), migrated to live, then
   two actions and ONE tick.
c. Attribution: Save43's new key on every business, plus at most a count of 1 from the one tick. No shelving is
   possible in one tick.
d. The guard clauses of F4 ruling 2, and the stripped digest equal to `9702aa68…`.
e. Probe: `probes-r2/s10-row5-take-digest.test.ts.txt`, byte-identical to the reviewed r1 probe. RUNBOOK step 1
   supersedes its header comment, which names the swept file.
f. No pin moves. A stripped digest other than `9702aa68…` refutes the attribution, and the row returns to the
   parent.

---

## Row 6. `p14b5-relationships.test.ts:372`, three leaves. Status: DECLARED r2, S10 (F4 ruling 4)

a. Assertion :372, `expect(newTakes.map((t) => t.productionId)).toEqual([FROZEN.rival.repeatTake])`, inside
   `rivalWorld()` (:352-384). Three leaves use it: :626 and :636 (family 2) and :834 (family 5).
   - The values that may move are `FROZEN.rival.repeatTake` and `repeatTakeWeek` (:154-155), two fields of one
     premise.
   - `firstTake`, `firstTakeWeek` and `firstReleaseWeek` stay, and so does the guard.
   - The guard (:357-358) allows 41 ticks from 196, so a repeat take can land by post-tick 237. r1 said 40 ticks and
     236; R6a corrects that.
b. Chain: `lifted('rival-current-p1-and-p2')`, the genuine V30 save at week 196, migrated with empty shelving.
   Studio `studio-aca408ec-r01`.
c. Attribution: Y, predicted from source.
   - Counts start at 196. r01's `script-0006` and `script-0011` take economic rejections through processed week 207.
   - At 208 ordinal 6 is evaluated first and shelves on its 13th rejection (`retryWeek` 234, hold until 221).
     `script-0011` then greenlights `film:11`.
   - The old chain greenlit `film:6` at 217 (take at post-tick 222). Now no `film:6` take can land before the
     retry week.
d. Gates (the probe writes them to `row6.json`):
   - R1 (d1): r01's first shelving is `script-0006` at processed week 208 with `rejections: 13`.
   - R2 (d2): r01's ordinal-6 count reads 1..12 after processed weeks 196-207, with no r01 production then.
   - R3 (d3, R6c): `filmAnnounced` for `film:11` at 208, its take alone at post-tick 213, and `filmReleased` in
     processed week 216 with `film:11` the only film at post-tick 217.
   - R4 (d4 and d5, R6c): recorded per week and checked at post-tick 222 (`shelved` = `[{ordinal: 6, week: 208,
     retryWeek: 234}]`, hold 221). Over processed weeks 208-220, `development.projects.length` holds at its week-207
     value. No `filmAnnounced` for `film:6` comes before 234.
   - R5 (d6): no take other than `film:11` in post-tick weeks 197-221, including 217, which the leaf leaves
     unchecked. Other studios' shelvings up to 221 are reported.
e. Probe: `probes-r2/s10-row6-rival-chain.block.ts.txt`, RUNBOOK step 2.
f. The outcome is decided on the leaf's own terms (R6b), recorded and never asserted.
   - The probe takes the FIRST take after post-tick 213. It must be r01's, alone in its week, not in week 217, at
     post-tick 237 or earlier, and share a seat pair with `film:11` (the leaf's :641-642 test).
   - `REPIN`: the author writes its `productionId` and week into `FROZEN.rival.repeatTake` and `repeatTakeWeek`,
     from the probe's verified receipts.
   - `PREMISE_CONFLICT`: the three leaves return to the parent. Nothing widens, and choosing a different witness is
     a test-design change with its own review.
   - r1's "expected outcome: none" is withdrawn. A commission after the hold at 221 could land a take by 237 (D5),
     so the probe decides.
   - Refuted if R1-R5 fail.
   - Interaction: slice A RED r5 rebases over this edit (F4 ruling 8).

---

## Row 7. `p14b1-trust-chooser.test.ts:683`, two leaves. Status: DECLARED r2, class ORACLE (F4 ruling 3)

a. Assertion :683, `expect(draft).toEqual(expectedAuthoringDraft(proposal, observed.candidates[index]!))`, inside the
   spy of `scanNaturalRivalAuthoring` (:633-712), used by the leaves at :761 and :802.
   - No pinned value moves.
   - The ORACLE edit is in `expectedRivalCandidates` (:590-620), at :607-608:
     `development.projects.filter(status !== 'produced').sort(by id).slice(0, 2)`. r1 cited :604-605; D5 corrected
     it.
b. Chain: `p13aGeneratedStudio()` (seed `p13a-core-causal-01`), up to 220 ticks, every rival authoring read.
c. Attribution: Y.
   - Production builds the set with `rivalPromiseProjectCandidates` (`talentMarket.ts:1442-1449`), which filters
     through `shelvedScriptIds` (`hollywoodTypes.ts:142-145`).
   - `authorRivalPromise` uses that set for project and genre candidates (`:1474`).
   - r01 shelves `script-0006` at week 93, and rivals author at 196.
d. Facts:
   1. Reworded per D5. At the first failing read (week Wa, issuer I), the expected read names a screenplay S that is
      in I's `screenplayShelving.shelved` at Wa, or S's genre. A receipt outlives a retry, so receipts are not used.
   2. With the oracle edit alone, the observed sequence equals the oracle's.
   3. Both leaves pass.
e. Probe: two patches, applied by RUNBOOK step 3 to NEW-named copies.
   - `probes-r2/s10-row7-runA.diff` wraps the existing assertion in `try { … } catch (e) { console.log(…); throw e }`.
     A `JSON.stringify` comparison would flag every read, because production spreads the attachment before the
     issuer fields (`talentMarket.ts:1486-1491`) and the oracle does not (:625-630).
   - `probes-r2/s10-row7-runB.diff` is the ORACLE edit.
f. The edit is Run B's hunk at :606-608. It reads the persisted `screenplayShelving.shelved` ordinals and checks each
   is unproduced and outside `activeScriptOrdinals`. It never calls production. Classification row: class `ORACLE`,
   source lines `talentMarket.ts:1442-1449` and `hollywoodTypes.ts:142-145`. Refuted if Run A's `d1` is false or Run B
   still fails at :683.

---

## Summary

| Row | Assertion | Class | Attributed | Gates | Probe (RUNBOOK step) |
|---|---|---|---|---:|---|
| 1 | seating :498 | retained, attribution only | uncertain until P1 | 7 + 1 explanatory | s10-row1 (5) |
| 2 | family 12 seed-b :530 (merged :540) | retained, attribution only | uncertain until P1 | 7 + 1 explanatory | s10-rows2-4 (6) |
| 3 | family 12 p13-public :550 (merged :560) | retained, attribution only | uncertain until P1 | 7 + 1 explanatory | s10-rows2-4 (6) |
| 4 | family 12 p13a :550 (merged :560) | retained, attribution only | Y on record (week 93) | 7 + 1 explanatory | s10-rows2-4 (6) |
| 5 | p14b5 :596 | S7 | Y to the Save43 key | 1 | s10-row5 (1) |
| 6 | p14b5 :372 | S10 | Y, predicted | 5 + outcome | s10-row6 (2) |
| 7 | trust-chooser :683 | ORACLE (:607-608) | Y | 3 | s10-row7 Run A, Run B (3) |

## Changes from D5

| D5 item | Fixed by | Where |
|---|---|---|
| C1, no anchor | Each run must reproduce its recorded value before any comparison | Row 1 `S10_ROW1_ANCHOR` and `C1_*` gates; ledger `S10_LEDGER_ANCHOR` and `C1_*` gates; rows 1 and 2-4 part d |
| C2, unread old dump, no offline script | The old run loads the head dump and asserts that the first differing row's week exceeds Ws | Row 1 `P4_C2_first_moved_row_after_Ws`; ledger `P1_d1_d2_C2_first_moved_row_after_Ws`; RUNBOOK steps 5-6 (head, then old) |
| C3, rows 1-3 | The plain chain is ticked to Ws in both trees and compared as sha256 of `stableStringify` with `screenplayShelving` deleted, per 1344-F3 ruling 4 and 1344-X6. Row 4 runs the same check | `s10StateHash` in both probes; `P3_C3_state_equal_at_Ws`; row 1 d4 and rows 2-4 d3 are now explanatory only |
| Row 1 d2 | The receipt's `rejections: 13` plus the weekly count of 12 entering Ws replace the `chosen === null` row form | Row 1 probe `P2_d2_thirteen_rejections`; row 1 part d |
| Rows 2-4 dump | `settlementRows(state)`, the rows and every market receipt are dumped verbatim; the first-difference scan compares the verbatim receipts and rows | Ledger probe `S10Dump`, `s10FirstDiff`; rows 2-4 part d |
| Rows 2-4 d4 | The probe evaluates the law lines (merged :543-558, :565), never a re-pinned leaf; `rel !== null` is asserted | Ledger `s10LawLines`, `P4_d4_law_lines_head`, the `rel === null` throw |
| R6a | 41 ticks, post-tick 237 | Row 6 probe loop `guard <= 40`; row 6 part a |
| R6b | The first take after 213, then r01, alone in its week, not 217, by 237, sharing a pair (:641-642) | Row 6 probe `outcome`; row 6 part f |
| R6c | Shelving and `development.projects.length` recorded per week; asserts at post-tick 222 and over processed weeks 208-220; `filmReleased` at 216, seen at post-tick 217; d6 | Row 6 probe R3, R4, R5; row 6 part d |
| Row 7 Run A | `try { expect(...) } catch (e) { console.log(...); throw e }` around the existing assertion; d1 worded "S is in `shelved` at Wa" | `probes-r2/s10-row7-runA.diff`; row 7 part d |
| Section 3 path rules | Outputs only under `s10/out/` (`s10Out` throws otherwise); probes run from NEW-named copies `tests/zz-s10-*.test.ts` that are deleted after each run, with the merge tree back to `?? dist/`; the old tree comes from an exact script | Every r2 probe; `probes-r2/RUNBOOK.md`; `probes-r2/build-old-tree.sh` |
| Check 1 (F4 ruling 1) | Part f of rows 1-4 and the row 1 reviewer note struck | Rows 1 and 2-4 part f |
| Check 4 (F4 ruling 3) | Row 7 classed ORACLE at :607-608 with the two source citations | Row 7 parts a and f |

## Citation corrections (r1 errors, found while revising)

- Seating file:
  - `CHAIN_DIGESTS` is at :85, not :96.
  - `SCAN_TICKS` :58, not :56.
  - `scan` :248, not :258.
  - `filmDecisions` :202, not :219.
  - The tuple is at :495-496, not :492-493.
- `p14b5-relationships`:
  - `rivalWorld` is at :352-384, not :348-383.
  - The guard is at :357-358, not :355.
  - `V30_PINS` :116, not :128.
  - `bytes()` :256-300, not :250-299.
- `rivalPromiseProjectCandidates` spans `talentMarket.ts:1442-1449`. r1 cited :1444, its signature line.
- The common base's count-write range is `hollywoodTick.ts:268-274`, as D5 states.

## Open for the parent

1. RUNBOOK step 0 assumes the probes run between x2 and x3 (F4 Process; D5 section 3).
2. P1 decides rows 1-3 from this probe run. No record shows a shelving on seed-b or `p13-public-commercial-adoption`.
3. If row 6 returns `REPIN`, the author writes two `FROZEN.rival` fields and nothing else. If it returns
   `PREMISE_CONFLICT`, the three leaves go back to the parent.
