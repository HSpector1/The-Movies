# 1361-GP: review checklist for G-P probe r2

You review `1361-GP-probe-r2.ts` before the parent runs it (1361-F ruling 12; 1353-F7:66-68). The author's notes are
`1361-GP-notes.md` in the same directory. Work read-only and run nothing: no node, vitest, tsc, npm, npx, tsx or
vite-node. Read-only git on the repository is fine. Nothing ran, so every check below is a reading check.

Return **PROCEED** or **REVISE**, with findings numbered by the items below. For each finding give the r2 line, the
source line it contradicts, and the fix you propose.

## Files

| Short name | Path |
|---|---|
| r2 | `/Users/zacheryspector/studio-scratch/1361-gp/1361-GP-probe-r2.ts` (sha256 `3d460c22…`) |
| notes | `/Users/zacheryspector/studio-scratch/1361-gp/1361-GP-notes.md` |
| r1 | `E/1359-stage/gp/1359-GP-probe.ts` (sha256 `f0f0c0f6…`) and `E/1359-stage/gp/1359-GP-notes.md` |
| charter | `E/1359-A-p15c-wave2-charter.md` §3.1-§3.2 (:42-84), §5.1 item 6 (:171-172), §9 (:258-267) |
| r4 | `E/1359-stage/1359-p15c-wave2-reference-r4.patch` (law :71-88; adapter :370-404, :462-468, :509-532) |
| law | `src/core/campaignLegacy.ts` at HEAD f3fe97d0 |
| RED | `tests/p15c2-campaign-legacy-integration.test.ts` (shapes :204-239; `expectedDomains` :283-305; A5 :535-560; A7 :576-629; A8 :631-650; B4 :729-751) |
| sibling REDs | `tests/p15a2-power-ranking-archive.test.ts:107-123`; `tests/helpers/p15a1-market-route.ts:42-45` |
| rulings | `E/1361-F-parent-rulings-p15-save45-productions.md` rulings 9, 12, 17, 18; `E/1359-F3-parent-response-to-1359-X.md` :29-33; `E/1359-F5-parent-response-to-1359-X4.md` |
| runs | `E/1359-X4-p15c-gp-probe-results.md`; `E/1353-X4-p15c-gp-v2-probe-results.md` and `E/1353-stage/x4/` |

E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.

## A. Scope of the change

1. `diff -u <r1> <r2>` prints the 13 hunks of notes §2 and nothing else. Confirm that `law`, the F1 constants,
   `runLaw`'s control flow, `adapt`, `outcomeOf`, `holdersOf`, `studioRows`, `retuneCheck`, the route loop, the progress
   lines, the summary lines and the exit code are byte-identical to r1.
2. Trace r2 on a state with no P15 root. `siblingBefore` returns undefined (r2 :86-91), `siblingDomain` returns r1's
   literal rows in r1's key order (r2 :94-95), the spreads at r2 :210 and :219 add no key, and `attempt` returns
   `lawAttempt`'s result with `recordId` `{null, 0}` (r2 :316-318). Pass if the facts, manifest and every r1 report field
   come out as r1's, and the only additions are `recordIdBridge`, `siblings`, one stderr line and the `probe` id.
3. Every JSON key of `E/1353-stage/x4/gp-v2.json` keeps its name and meaning in r2's output.

## B. The refusal (r2 :49-65)

4. `REFUSED_KEYS` holds `campaignLegacy` and `corporateCondition`, and r2 calls the check at week 0 (:391) and at the
   freeze (:403). The reasons hold: G-P gates the production that adds `campaignLegacy` (1359-F5:25-26), and P15B does
   not join Save45 (1361-F ruling 17).
5. `P15_KEYS` still equals the union of the landed `P15_ROOTS` (`tests/helpers/p15-roots.ts:10`) and `P15_SIBLINGS`
   (`tests/helpers/p15c2-legacy.ts:56`).
6. Rule on notes §7 item 1: a present `corporateCondition` stops the probe instead of being read by §3.1 :47 and :59.
   Say whether you accept the stop or want the condition map (r4 :462-468, :521-525).

## C. The row maps (charter §3.1-§3.2)

7. **Ranking rows** (r2 :207-216) against §3.1 :58 and §3.3 A1: `recordId` from the record's `id`, `week` from the
   record, `studioId`, `rank` and `band` from each row, one fact per row. Compare r4 :516-520, RED A7 :584-590, and the
   record and row keys at `tests/p15a2-power-ranking-archive.test.ts:107-123`.
8. **Market assessments** (r2 :217-224) against §3.1 :60 and §3.3 A2: `assessmentId` is `releaseId`; `studioId`; `week`;
   `assessed` true; `underPressure` is `factor < 1`. Compare r4 :526-531, RED A7 :602-608, and the persisted keys at
   `tests/helpers/p15a1-market-route.ts:42-45`.
9. **Domain rows** (r2 :199-205, through :94-102) against §3.2 :79-83 and 1355-F2 item 7: `recordedFromWeek` is the
   root's own; the watermark is the largest `p15DomainSequence` over the records (ranking) or the assessments (market),
   0 if none; the rows keep r1's order. Compare r4 :509-515, RED `expectedDomains` :283-305, and A8 :639-640, :647-649.
10. **Absent and late roots.** An absent root gives `{null, 0}` and no fact key (§3.2 :83; RED A7 :614-616). A root
    recorded from the boundary or later reads as absent (§5.1 item 6; r4 :384-389; RED A7 :624-627). The law reads an
    absent fact array as `notRecorded` (law :458, :475, :496, :531).
11. **`corporateCondition` stays on the absent path:** r1's literal row (r2 :204), no `conditionEvents`, `closedWeek`
    null (r2 :167). Confirm the law then reads the domain, the resilience lens and `resilient-survivor` `notRecorded`
    (law :531, :687-690) and that `retuneCheck` keeps `resilient-survivor` exempt (r2 :466-474).
12. **Never read** (§3.1 :62-66). The sibling reads touch only the fields in items 7-9, `p15DomainSequence`,
    `recordedFromWeek`, and `p15Sequence.next` for the report (r2 :412). No cash, cost, revenue, loan or career money.

## D. The record-id rule and its bridge (r2 :270-331)

13. The regex at r2 :282 matches the landed message exactly: `fail(at, 'repeats a record id')` with
    `at = rankingSnapshots[${i}]` (law :480, :482) through `fail` (law :222-224). It cannot match r4's
    `repeats a (recordId, studioId) pair` message (r4 :84).
14. `isRecordIdRefusal` (r2 :286-291) requires the named row to exist and every (`recordId`, `studioId`) pair to be
    distinct. A repeated pair must stay a `lawRefusal`.
15. **Inertness argument.** `recordId` is read only at law :481-483 and :736 (`grep -n recordId src/core/campaignLegacy.ts`);
    ranking refs sort by week alone (law :735); one studio has one row per week (law :488-490); r4's law hunk (:71-88)
    changes nothing else in `readFacts`. Pass if you agree that the stand-in run plus the map-back yields the manifest
    1359-F3's law would build.
16. **Map-back completeness** (r2 :299-314): it covers archetype `qualifying` and `contrary` and lens `refs`, the only
    places a manifest carries refs (law :179-189), and it throws on an unmapped `powerRanking` ref.
17. **Second scheme** (r2 :323-328): its ids sort in a different order from the first scheme's, and the comparison uses
    `stableStringify` of both mapped manifests.
18. **Timing:** `lawMs` is the first scheme's law call alone (r2 :329), matching r1's rule that `lawMs` is the one call
    that returned the manifest.
19. **Composition with F1.** `readFacts` reads films before ranking rows (law :336, :474), so the first call refuses F1;
    both F1 calls pass through the record-id bridge; `runLaw`'s F1 inertness check compares mapped manifests (r2 :347-350);
    both refusal returns carry `recordId` (r2 :338-339, :346).
20. **Holders cannot move through the branch.** No archetype reads `rankingOf` or `marketOf` (law :585-703; reads only at
    :714-717 and the lenses :731-746), and no archetype's `limitedBy` list names `powerRanking` or `marketAssessments`.

## E. The state the adapter reads

21. r2 feeds the adapter `tick()`'s result at 6240 (r2 :391-403). Check that this is the freeze's input on the gating
    tree: the ranking record wraps the tick's last expression and the freeze wraps it in turn (1361-F ruling 9;
    1356-A §4 :76-89), with no condition step (ruling 17). If the candidate's `tick.ts` exists when you review, read
    its tail.
22. The roots reach the route: worldgen seeds them (1356-A §5 :135; 1355-A §3.5 :137) and `p13aGeneratedStudio` keeps
    them, since `initializeHollywood` spreads the state (`src/core/hollywood.ts:180`).

## F. Output and run instructions

23. `siblings` (r2 :412-419) and the two new stderr lines (r2 :420-422, :424-428) report what notes §5.7 says they do.
24. Notes §5.4: the tree is an archive of the candidate after P15A.1, (c) only if G2 passed; the v2 values go in as
    1353-X4's patch (`E/1353-stage/x4/1353-X4-tree-edits.patch`) with the four values checked; the probe hash is
    checked; the seeds are `p13a-core-causal-01` and `seed-b`; the smoke precedes the full run.
25. Notes §5.6 takes its runtime basis from 1353-X4's measured run (`E/1353-stage/x4/runs.meta`, `gp-v2.err`), and
    §5.7's expectations follow from the code: `recordIdBridge`, 480 ranking records, and
    `p15SequenceNext - 1 = rankingRecords + marketRows = powerRanking watermark`.
26. Notes §6 lists what the candidate must settle. Add anything missing.

## G. Types (vite-node strips types without checking them)

27. Read the new code for strict-TypeScript errors: the `in` narrowing in `attempt`, the spread of the union type
    `Bridged`, tuple inference in `new Map(rows.map(...))` (r2 :296), `LegacyRankingSnapshotFact['band']`, the
    conditional spreads into `LegacyFacts`, and the optional-chain narrowing at r2 :416. A type error does not stop the
    run, but report it.
