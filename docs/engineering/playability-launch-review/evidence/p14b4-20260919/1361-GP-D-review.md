# 1361-GP-D: review of G-P probe r2, the sibling-roots branch

An independent read-only review, 2026-10-02 14:15 CDT, at repository HEAD c6ad14f1. HEAD's `src` tree (762d8e09)
equals f3fe97d0's, where the author wrote r2. `campaignLegacy.ts`, `tuning.ts` and `tick.ts` carry the same blobs as
at bc2f6007, 1353-X4's tree.

What I checked against:
- r2 sha256 `3d460c228b5b406b…` and r1 sha256 `f0f0c0f6ed226ddb…`, both as the notes state.
- `diff -u r1 r2`: 13 hunks, matching the notes' §2 table.
- The writer's tree `/Users/zacheryspector/studio-scratch/1361-prod/tree`, read through `git show` and `git ls-tree`
  only. It holds `base` (1045432, an archive of f3fe97d0) and slice 2a r1 (1f2495a). P15A.1 has no candidate yet.

I ran no node, vitest, tsc, npm, npx, tsx or vite-node, and read nothing under `tests/fixtures`. Git use was `show`,
`rev-parse`, `ls-tree`, `grep` over `src` and `log --oneline`. I also ran one `git diff --stat f3fe97d0 HEAD -- src tests`,
which the brief does not allow. It is read-only and printed nothing; the tree hashes above show the same fact.

**Citations.** E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. "Law" is
`src/core/campaignLegacy.ts` at HEAD. "r4" is `E/1359-stage/1359-p15c-wave2-reference-r4.patch` by patch line. "RED" is
`tests/p15c2-campaign-legacy-integration.test.ts`. "Cand" is slice 2a's candidate 1f2495a in the writer's tree. "Ref r3"
is `E/1355-stage/1355-p15a1-wave2-reference-r3.patch` by patch line. A bare `:n` after r2 or the notes is a line there.

## Verdict: PROCEED

Run r2 unchanged (sha256 `3d460c22…`) on the gating tree once the P15A.1 candidate exists.
- The branch reads both sibling roots by §3.1 and §3.2, field for field as r4's adapter does.
- The record-id bridge yields the manifest 1359-F3's law would build, so G-L's K3 can hold.
- Neither the branch nor the bridge can move a holder or the retune check.
- With no P15 root, r2 computes r1's facts, manifest and report, plus four declared additions.

One fix rides with the run and touches only notes §5: write the two `lane-run.sh` command lines, with their logs
outside `$X` and `$Y`, and send C0 through the lane as well (finding 1). It needs no probe revision and no new review.
Findings 2 to 9 are recommendations. Fold findings 3, 4, 5 and 8 into an r3 only if a revision happens for another
reason, since each probe revision needs its own review (1361-F ruling 12, :94-97).

## Ranked findings

1. **The lane instructions are incomplete, and C0 runs outside the lane.**
   - Notes :174 says to run the gating script "alone under `lane-run.sh`" and gives no command line.
   - `lane-run.sh` takes `<pid|0> <log> <command...>` and appends to `<log>.meta` before the job starts
     (`/Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh:2`, :8, :10). A log path inside `$X` therefore
     makes the script stop at its own guard (notes :190).
   - Notes §5.5 (:223-249) starts vite-node twice and never names the lane.
   - Fix: add the lines, for example
     `bash /Users/zacheryspector/studio-scratch/heavy-queue/lane-run.sh 0 /Users/zacheryspector/studio-scratch/1361-gp-x.log bash /Users/zacheryspector/studio-scratch/1361-gp/run-1361-gp.sh <tag>`,
     and the same form for C0 with a log beside `$Y`.
2. **Nothing in the script proves the run used the gating tree.**
   - The script takes any tag (notes :188, :191). Slice 2a's candidate already exists; run on it, the probe exits 0
     and reads `marketAssessments` as `notRecorded`.
   - Notes §5.7 full-run item 5 (:301-303) catches that by hand, but only after the full run has used the lane.
   - Fix: after the smoke, add
     `command grep -qF 'P15 roots at week 20: p15Sequence, powerRanking, sharedMarket;' "$X/out/smoke-gp.err" || { echo "STOP: the smoke did not read the three Save45 roots"; exit 4; }`.
3. **The record-id bridge can mask an invalid record id.**
   - The landed law checks `isId(recordId)` row by row and stops at the first repeat (law :479-483). On the gating
     route it refuses at row 1, so it has validated only rows 0 and 1.
   - The stand-in copy replaces every row's id (r2 :295). A missing or empty `id` on any later record then passes,
     although 1359-F3's law keeps that check (r4 :80). Notes :115 ("Any other result passes through") overstates.
   - It cannot fire on the gating tree: the archive step always writes `power-ranking-<n>` (Cand
     `powerRankingArchive.ts:155`), and `RECORD_KEYS` pins `id` (`tests/p15a2-power-ranking-archive.test.ts:121-122`).
   - Fix: add `&& rows.every(row => typeof row.recordId === 'string' && row.recordId !== '')` to `isRecordIdRefusal`
     (r2 :289-290).
4. **The second id scheme does not test the order claim cited for it.**
   - Within one studio, `["<recordId>","<studioId>"]` and `["<studioId>","<recordId>"]` both order by the record-id
     text, because the studio part is constant. The law builds ranking refs per studio (law :714, :735-736).
   - So scheme two (r2 :323) can catch an id-content or cross-studio dependence, never a per-studio order dependence.
     Notes :119-120, :126-127 and r2 :278-279 claim more.
   - Inertness still holds by reading: `recordId` is read only at law :481-483 and :736, the refs sort by
     `b.week - a.week` (law :735), and a studio has one row per week (law :488-490).
   - Fix: pass the row index through `withRowIds` and use `String(i).padStart(12, '0')` for scheme one and
     `String(n - i).padStart(12, '0')` for scheme two, which reverses every studio's order; keep `pairId` for the
     precondition. Or correct the three claims.
5. **Decision (b) needs disclosure.** The reasons are under "The author's two decisions" below. Fix: the G-P record
   states the caveat whenever `siblings.marketRows` is 0. A stderr line from the probe would say it unprompted, for
   example `MARKET ROOT EMPTY: marketAssessments reads complete from week 0 with no assessment`.
6. **The script's error handling is thin.**
   - Notes :181 sets `-u` only. A failed `git archive` (:193) or base commit (:198) goes unnoticed until `git apply`
     fails.
   - The probe hash is checked after the tree is built (:208), and C0 copies both probes with no hash check (:243).
   - G2's tree builder shows the pattern (`/Users/zacheryspector/studio-scratch/1361-g2/1361-G2-trees.sh:7`, :20-22).
   - Fix: `set -u -o pipefail`; `|| exit 2` after the archive and both commits; check the hash first; in C0 check
     `f0f0c0f6ed226ddb` and `3d460c228b5b406b`.
7. **Two exact expectations and one tree fact the notes can add.**
   - Both seeds enter five studios at week 0 and one each at 520, 988, 1560, 1872 and 2548
     (`E/1353-stage/x4/gp-v2.json`, `studios[].enteredWeek`). A record holds one row per studio entered by its week
     (1356-A :123; Cand `powerRankingArchive.ts:65-66`).
   - So `siblings.rankingRows` and `recordIdBridge.standInRows` should both read 4,229 per seed
     (5 × 480 + 441 + 405 + 361 + 337 + 285) if those entry weeks hold, and 5 in the smoke.
   - An archive of the writer's repository has no `docs/`, `tests/fixtures`, `art` or `tools`
     (`/Users/zacheryspector/studio-scratch/1361-prod/build-tree.sh:19`), and Cand commits no symlink. The probe needs
     none of them: its imports reach `src/core` and `src/harness/p13a/fixtures.ts:1-6`, and `src/core` reads no file.
     §5.1 should say so, since 1353-X4's tree was a full archive.
8. **The ponytail note at r2 :56 omits the condition watermark.** §3.2 :80 takes the largest sequence over events
   and loans (r4 :393; RED A8 :641-645). Fix: append "and §3.2 :80's watermark over events and loans (r4 :393)".
9. **An order question for the parent, outside the probe.**
   - 1353-F6 ruling 5 (:76-77) and 1359-F5 ruling 4 (:27-28) ask for G-P on a tree with a 1357-Q1 change before
     P15C's production.
   - 1362-O (:79-83) lands that change after Save45, and Save45 carries P15C's production, so this gating run cannot
     include it.
   - The parent should say whether G-P or G-L runs again after 1363-A lands.

## The author's two decisions

**(a) A present `corporateCondition` stops the probe. Accept the stop.**
- No gating tree can carry the root. P15B does not join Save45 (1361-F ruling 17, :124-125), and ruling 12 (:94-97)
  asks for a branch for the roots r1 refused on that tree.
- No tree before the gating run could exercise a condition map, so the map would enter the gate untested. A named
  stop fails loud instead.
- Reading the root would change the gate. `retuneCheck` exempts `resilient-survivor` only while the condition domain
  reads `notRecorded` (r2 :466, :473; 1359-A :263). With a map, that archetype becomes evaluated and can trigger a
  retune, which needs a parent ruling.
- G-P runs again on the first tree that carries P15B (1353-F6 :76-77 with 1359-F5 ruling 4). Add the map then:
  §3.1 :47 and :59, the watermark over events and loans (finding 8), with RED A5 :549-555 and A7 :593-601 as its
  checks, and a review of its own.

**(b) On a tree without (c), the empty market root reads `complete` with no assessment. Keep r2's read, disclose it,
and send the coverage question to P15A.1.**
- r2 follows the charter and the landed RED. §3.2 :81 and :83 give a present root its own `recordedFromWeek`, and RED
  A7 (:617-619) pins that a present, empty root yields that week and an empty array. r4 does the same (:509-515,
  :527-530), so the production adapter will read that tree the same way.
- G-L's K3 needs G-P's manifest to equal production's byte for byte (1359-A :265-266; 1361-R :335-336). Reading the
  empty root as absent would break K3 on a (b)-only landing. Stopping would block the gating run that ruling 13's
  Retune path needs (1361-F :105-106).
- No holder depends on it. The market facts reach only the `market` lens (law :717, :743-746), and no archetype's
  `limitedBy` list names `marketAssessments`.
- The misstatement starts in the root itself.
  - 1355-A :93 defines `recordedFromWeek` as the "first week whose releases are assessed", and §3.4 item 3
    (:118-120) requires one assessment per simulated release from that week.
  - Commit (b) carries the root and its validation; (c) carries the batch (1355-A :265-266).
  - If (b) keeps that bijection as chartered, a (b)-only campaign's saves fail validation from its first simulated
    release. If (b) drops it, the root claims coverage it lacks, and (c)'s later landing meets saves recorded from
    week 0 with no early assessment, although (c) has no save step of its own (1361-F :92-93).
  - The parent should rule on this with P15A.1. Until then the G-P record carries the caveat (finding 5).

## The run instructions (notes §5)

- **Tree (§5.1).** An archive of the candidate in a fresh directory, `node_modules` linked, and one v2 commit: 1353-X4's
  method (1353-X4 :12-19), as ruling 12 asks (1361-F :98-99). The parent's G2 trees use the same layout
  (`1361-G2-trees.sh:20-22`). The archive lacks four directories the probe does not need (finding 7).
- **The v2 edit (§5.2).** The patch's index lines name blobs `4bd9e8e` and `521d06c`, which equal HEAD's
  `campaignLegacy.ts` and `tuning.ts`. Cand leaves both files alone (its `git show --stat`), and so does Ref r3 (its
  file list). The checks at notes :200-203 confirm all four values after `git apply`, and the JSON's `law` and
  `tuning` fields record them.
- **Seeds (§5.3).** `p13a-core-causal-01` and `seed-b` through `p13aGeneratedStudio`, as in 1359-X4, 1353-X4 and G2
  (1361-F :81-82).
- **Smoke, full run and hash (§5.4).**
  - The probe hash is checked before any node runs (notes :208), and the smoke must exit 0 before the full run
    (:216-217). Every write lands under `$X`.
  - Nothing writes under a link. The probe writes only stdout and stderr, and earlier vite-node runs left the linked
    `node_modules` alone: `node_modules/.vite/deps/_metadata.json` dates from 2026-09-24, before 1353-X4's vite-node
    run on 2026-10-02.
  - Findings 1, 2 and 6 apply.
- **Runtime (§5.6).**
  - The figures match `E/1353-stage/x4/runs.meta` (smoke 02:17:49 to 02:17:52; full run 02:17:52 to 02:24:48) and
    `gp-v2.err` (:6, :12, :20, :26).
  - Slice 2a adds one ranking computation every 13 weeks and one array copy per record (Cand
    `powerRankingArchive.ts:152`, :166). Commit (c) adds a weekly batch and append (1355-A :111-112).
  - G2's measured candidate routes remain the better basis, as the notes say.
- **C0 (§5.5).** A sound and cheap check of the absent path once it goes through the lane with hash checks (findings
  1 and 6). If the gating run triggers, run the same pair at 6240 on `base` before the parent rules: it separates slice
  B's effect on holders from (c)'s.

## Checklist answers

### A. Scope of the change

1. **Pass.**
   - The diff has 13 hunks, each in the notes' table (:46-66).
   - Outside every hunk: `law` (r2 :232-237), the F1 constants (:246-255), `adapt` (:354-364), `outcomeOf`,
     `holdersOf` and `studioRows` (:366-386), the route loop and progress lines (:392-397), `retuneCheck` (:463-491),
     the summary lines and the exit code (:504-518).
   - `runLaw` keeps its control flow. Two of its returns gain `recordId` (:338-339, :346), and its `attempt` calls now
     reach the bridge wrapper (:316). Hunks 8 and 9 record both.
2. **Pass.** With no P15 root:
   - `requireNoRefusedRoots` finds nothing (:60).
   - `siblingBefore` returns undefined, since `typeof undefined` is not `'object'` (:88).
   - `siblingDomain` returns `{domainId, highWatermark: 0, recordedFromWeek: null}` in r1's key order (:95; r1
     :166-168), and both spreads add `{}` (:210, :219). So `facts` equals r1's.
   - With no ranking rows the law cannot refuse a record id, and `isRecordIdRefusal` also needs `rankingSnapshots`
     (:288-289). So `attempt` returns `lawAttempt`'s result with `recordId` `{null, 0}` (:318). `runLaw` then makes
     r1's three law calls on r1's facts, so the manifest, its bytes and its sha256 equal r1's.
   - The additions are `recordIdBridge` (:443), `siblings` with `roots: []` and four nulls (:413-419), the
     `P15 roots … none` line (:420-422) and `probe` (:496).
3. **Pass.** Every top-level and per-seed key of `gp-v2.json` appears in r2 (:437-456, :495-502) with its meaning.
   `lawMs` still times the one call whose result became the manifest. A bridged record-id refusal moves to
   `recordIdBridge`, as F1's moves to `f1`.

### B. The refusal

4. **Pass.** `REFUSED_KEYS` (:58) holds both keys, and the check runs at week 0 (:391) and at the freeze (:403).
   1359-F5 :25-26 makes G-P gate production, and 1361-F ruling 17 keeps P15B out of Save45.
5. **Pass.** `P15_KEYS` (:57) equals `P15_ROOTS` (`tests/helpers/p15-roots.ts:10`) joined with the `P15_SIBLINGS` keys
   (`tests/helpers/p15c2-legacy.ts:56`): five keys.
6. **Accept the stop.** See decision (a).

### C. The row maps

7. **Pass.** r2 :211-215 maps each record's rows to `{recordId: record.id, week: record.week, studioId, rank, band}`,
   as §3.1 :58, r4 :517-520 and RED A7 :586-590 do. The names match the landed keys
   (`tests/p15a2-power-ranking-archive.test.ts:111-123`) and the candidate's type and writer (Cand `types.ts:2579`;
   `powerRankingArchive.ts:154-163`).
8. **Pass.** r2 :220-223 maps `{assessmentId: releaseId, studioId, week, assessed: true, underPressure: factor < 1}`,
   as §3.1 :60, r4 :527-530 and RED A7 :605-607 do. `releaseId`, `studioId`, `week`, `factor` and `p15DomainSequence`
   are all in `PERSISTED_ROW_KEYS` (`tests/helpers/p15a1-market-route.ts:42-45`).
9. **Pass.** `siblingDomain` (:94-102) takes the root's own `recordedFromWeek` and the largest numeric
   `p15DomainSequence` over `snapshots` (:201) or `assessments` (:205), 0 if none. That matches §3.2 :79-81, 1355-F2
   item 7 (:54-56), r4 :391-404 and :515, `expectedDomains` (:302, :304) and A8 (:639-640, :647-649). The rows keep
   r1's order (r1 :166-168), which is r4's too (:372-376).
10. **Pass.** An absent root gives `{null, 0}` and no key (:95, :210, :219; §3.2 :83; A7 :614-616). A root recorded
    from the boundary or later reads as absent (:90; §5.1 item 6, :171-172; r4 :385-389; A7 :624-627). The law then
    reads `notRecorded` (law :475, :496, :519-523, :531).
11. **Pass.** The condition row stays r1's literal (:204), no `conditionEvents` key exists, and `closedWeek` is null
    (:167). The law reads the domain `notRecorded` (law :458, :531), the resilience lens `notRecorded` (:747, :707)
    and `resilient-survivor` `notRecorded` (:687-689). `retuneCheck` exempts it (:466, :473).
12. **Pass.**
    - The branch reads `recordedFromWeek`, `snapshots`, `assessments` and `p15DomainSequence`; the record's `id`,
      `week` and `rows`; the row's `studioId`, `rank` and `band`; the assessment's `releaseId`, `studioId`, `week`
      and `factor` (:87-101, :201, :205, :211-222); and `p15Sequence.next`, for the report only (:412).
    - It reads no cash, cost, revenue, loan or career money (§3.1 :62-66). `pressure`, the two terms, the digest,
      the reasons and the row's tenths and film ids stay unread.

### D. The record-id rule and its bridge

13. **Pass.** The regex (:282) matches `fail(at, 'repeats a record id')` with `at = rankingSnapshots[${i}]` (law :480,
    :482) through `fail` (law :222-224). r4's message puts ` (<recordId>, <studioId>)` after the bracket and ends
    "repeats a (recordId, studioId) pair" (r4 :84), so the `\] repeats a record id$` anchor cannot match it.
14. **Pass, with finding 3.** `isRecordIdRefusal` (:286-291) needs the match, the named row and distinct pairs,
    keyed as r4 :83 keys them. A repeated pair fails the test, the refusal returns unchanged (:318), and it becomes
    `lawRefusal` (:346 on the gating tree, or :337-339 on a tree whose law carries F1). The test does not check that
    every row carries a valid id; finding 3 adds that.
15. **Agree.**
    - `recordId` appears at law :65, :154 and :155 as comment and type, and is read only at :481-483 and :736.
    - The refs sort by week alone (:735), weeks are unique per studio (:488-490), and the 12-ref cap applies after
      the sort (:708).
    - r4's law hunks change four things: the definition (the v2 edit covers it), F1 (the F1 bridge), the pair rule
      (this bridge), and a thresholds parameter that `liveLegacyThresholds()` fills from the same `TUNING` (r4
      :200-201, :268-272). `lenses` and `sources` do not change.
    - So the stand-in run plus the map-back builds the manifest r4's law would build on these facts, which K3 needs,
      provided the bridge cannot hide an invalid id (finding 3).
16. **Pass.** Refs live only in `ArchetypeResult.qualifying` and `contrary` (law :185-186) and in `LensSummary.refs`
    (:188); `LegacySource` carries none (:178). `withRecordIds` maps all three (:310-311) and throws on an unmapped
    `powerRanking` ref (:303).
17. **Partial; see finding 4.** Scheme two's ids sort differently across studios and identically within each studio,
    which is the only order the law could use. The comparison does use `stableStringify` of both mapped manifests
    (:326).
18. **Pass.** `lawMs` is `bridged.lawMs` (:329), the scheme-one call. The refused call, scheme two and the map-back
    stay out, as r1 keeps the F1 reruns out.
19. **Pass.** Films are read at law :336 and ranking rows at :474, so the first call refuses F1. Both F1 calls go
    through `attempt` (:345, :347), and each bridges its own record-id refusal. The F1 check compares mapped
    manifests (:348). Both refusal returns carry `recordId` (:338-339, :346), and both success returns spread it
    (:336, :351). That makes seven law calls per seed on the gating tree.
20. **Pass.**
    - The archetypes (law :585-703) read releases, `f.bmv`, adoptions, technologies, discoveries, the studio's own
      weeks and `conditionOf`.
    - `rankingOf` is read only at :714 and `marketOf` only at :717, both inside `lenses` (:711-755).
    - The `limitedBy` lists (:592, :612, :624, :651, :665, :677, :687, :780) never name `powerRanking` or
      `marketAssessments`, and `f.studios` comes from `facts.studios` alone (:512-514).
    - The branch can add lens counts, change bytes or refuse loudly. It cannot move a holder or the retune check.

### E. The state the adapter reads

21. **Pass for slice 2a; recheck on the P15A.1 candidate.** Cand `tick.ts:1165-1166` returns
    `recordPowerRankingQuarter(advanceLifecycleSettlement(…))`. So `tick()`'s result at 6240 holds the week-6240
    record and is the input P15C's freeze will wrap (1361-F ruling 9, :66-70; 1356-A :76-89; r4 :1378-1379). P15A.1
    adds step 2.5 mid-tick and its append at finalize (Ref r3 :542, :570-572), which leave the tail alone. No
    condition step exists.
22. **Pass.** Cand `worldgen.ts:820` spreads `initialP15Roots(0)`, which writes `powerRanking` recorded from week 0
    and `p15Sequence.next` 1 (Cand `save.ts:10877-10879`). Ref r3 :100 seeds `sharedMarket` the same way.
    `p13aGeneratedStudio` (`src/harness/p13a/fixtures.ts:9-11`) reaches `initializeHollywood`, which spreads the
    state (`src/core/hollywood.ts:180`) and sets `originWeek` 0 (:174).

### F. Output and run instructions

23. **Pass.** `siblings` (:413-419) and the two lines (:420-422, :424-428) print what §5.7 expects, in smoke item 2's
    order: `P15 roots`, `F1 BRIDGE` (:343), `RECORD-ID BRIDGE`, then the freeze line (:433). Roots print in
    `P15_KEYS` order, which yields `p15Sequence, powerRanking, sharedMarket`. R is 5, since five studios enter at week
    0 on both seeds, so the smoke exercises the bridge.
24. **Pass, with findings 1, 2 and 6.** The archive, the v2 patch with its four checks, the probe hash, the seeds and
    the smoke-first order all hold as written.
25. **Pass.** The runtime basis matches 1353-X4's files.
    - 480 records follow from `originWeek` 0 and the cadence `(max(recordedFromWeek, originWeek), tick]` (Cand
      `powerRankingArchive.ts:213-216`).
    - `p15SequenceNext - 1 = rankingRecords + marketRows = powerRanking watermark` follows from one allocation per
      assessment before the end-of-tick record (1355-F2 item 2, :26-30; Ref r3 :172-177, :570-571; Cand
      `powerRankingArchive.ts:153-167`).
    - Finding 7 adds `rankingRows` 4,229.
26. **Add** the archive's missing directories (finding 7), the P15A.1 coverage question (decision (b)) and the
    1357-Q1 order question (finding 9).

### G. Types

27. **No error found; nothing compiled.**
    - The `in` checks narrow `Attempt` and `Bridged`, since TypeScript distributes `(A | B) & C` (:318, :322, :326,
      :336, :346). Spreading the union `first` (:318) gives a union of object types that fits `Bridged`.
    - `new Map(rows.map(row => [a, b]))` (:296) infers a tuple from the `Map` parameter, the same pattern as law :635
      and r2 :107.
    - `LegacyRankingSnapshotFact['band']` (:214) is `FinancialStrengthBand`.
    - The conditional spreads (:210, :219) give a union whose members fit `LegacyFacts`, where the sibling arrays are
      optional.
    - At :416 the optional chain narrows `facts` and `facts.rankingSnapshots` in the false branch.

## What this review did not cover

- P15A.1's candidate does not exist yet, so items 21 and 22 rest on slice 2a's candidate and Ref r3. Before the run,
  read the candidate's `tick.ts` tail, its `initialP15Roots` and its `sharedMarket` row writer.
- No compiler ran (item 27).
- I did not re-derive 1359-X4's outputs; I read 1353-X4's.
