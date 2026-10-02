# 1344-D4: independent review of the staged Save43 pin sweep

**Summary.** I reviewed `E/1344-stage/1344-save43-sweep.patch` (sha256 4b461eda…, byte-equal to `git diff 6c54d5e 27b56c2` in `S/1344-merge/tree`), its classification (529 rows, sha256 6f55fca6…) and the C5 handback, read-only. The patch is what C5 says it is: 137 test files, no production, fixture or config path, and it applies at repo HEAD. No assertion weakens. Every regex change is a version number or an anchored measured message, the 7 renamed titles keep their bodies, and the only added `expect` lines tighten the two ORACLE oracles. Live and historical saves split correctly, S3 sentinels move exactly, the S4, S5, S7 and S9 edits match `src/core/save.ts:10622-10704`, the ORACLE rows restate `src/core/talentMarket.ts:1444-1449` from persisted state, and HYGIENE clears both offenders. I found no defect in the patch. The required changes are all in the evidence. The classification has no row for three g1 hunks and misplaces one row. C5 cites X8 one line early and miscounts the two-commit files. C5 also calls X12's guard-order measurement complete, but three leaves the sweep reached still have unmeasured first guards. Verdict: ACCEPT WITH CHANGES. The patch applies as staged.

**Method and limits.** I used read-only git (`show`, `diff`, `log`, `grep`, `rev-parse`, `ls-tree`, `read-tree` into a temp index, `apply --check --cached`) and python3 over patch text, and ran no vitest, tsc, node or npm. A script parsed the patch into 404 hunks and byte-checked all 529 rows against them. I then read 54 rows by hand (rows 0, 11, …, 528, plus 491, 492, 525-527) across 48 files and all 11 groups. "HEAD :N" means merge HEAD 27b56c2 and "base :N" means 6c54d5e. Repo HEAD is af315499, one HANDOFF.md-only commit past the brief's 7f0d15c3 (`git diff --stat 7f0d15c3 af315499`). Since 3a606df4, the repo has no drift in `src`, `tests`, `ui`, `generated` or `bridge`. Base 6c54d5e holds the same `src` tree (db80ca31) and the same `tests` apart from the fixtures link.

## Checklist

**1. Assertion strength: MET WITH EVIDENCE.**
- The patch adds and removes no `.skip`, `.todo`, `.only`, `skipIf` or `fails`. Seven `it(` lines change. Each is a title rename in the same hunk as its body (patch lines 2149-2152, 2252-2255, 2269-2270, 2297-2299, 2900-2902, 2997-2999, 3003-3005).
- Counts, removed then added: `expect(` 327/329, `toThrow` 114/114, `not.toThrow` 19/19, `toBe(` 192/192, `toMatchObject` 0/0. Per hunk the `expect` counts balance except the two ORACLE hunks, which each add `expect(shelved).toEqual(...)` (HEAD `tests/p14b1-trust-chooser.test.ts:612`, `tests/p14b4-cast-class-policy.test.ts:95`).
- There are 455 paired changed lines. In 400 of them only digits change. The other 55 are `convertV43ToV42` prepends, S5 wraps, imports, titles and the two HYGIENE comments. The remaining regex changes are the S8 message (`tests/bridge-runtime-checkpoint.test.ts:436`) and anchored S9 messages, and each is narrower than the regex it replaces.
- The only `saveVersion` early-return guard at HEAD moved with its assertion (`tests/film-chronicle.test.ts:923`). Bare refusals after S1 renames follow a `.not.toThrow()` control on the unmutated envelope (patch lines 2419-2422, 3300-3301), so only the mutation can trip them.

**2. Live versus historical saves: MET WITH EVIDENCE.** I traced 37 sites in 24 files.
- Live sites moved to 43: `p13b-s2-access-identity.test.ts:196`, `p13b-s3-validation.test.ts:159`, `p13a-technology-milestones.test.ts:67-82`, `p13b-s7-announcements.test.ts:87,135`, `p13b-s6-save-v26.test.ts:254`, `p13b-s2-save-v22.test.ts:208`, `p13b-s3-save-v23.test.ts:121`, `p13b-s5-save-v24.test.ts:210`, `p14b9-save-v42.test.ts:204-206`, `p14c2s-scientist-retirement.test.ts:276,338`, `bridge-runtime-checkpoint.test.ts:754`, `bridge-p14a2-market.test.ts:772`, `p14c3-profession-history.test.ts:299-301`, `c2a-m2-sets-save.test.ts:169-172,200`, `p14r3-save-v41.test.ts:211,216,224,342`, `p14p4p5-opportunities.test.ts:361-362`, `tests/helpers/p14c3-fixtures.ts:132-134`, `tests/helpers/p14c2rm-fixtures.ts:21-24`.
- The 8 UI sites read the live writer: `ui/src/session.test.tsx:332,360,387`, `ui/src/saves.test.tsx:126`, `ui/src/engine/d17-save-migration.test.ts:131,155`, `ui/src/engine/film-chronicle-adapter.test.ts:289`, `ui/src/lot/snapshot/v14SetHolderBoundary.test.ts:46`.
- Historical sites kept their era: `p14r3-save-v41.test.ts:253,281-282,323,385,410,425` (genuine V40), `p14b9-save-v42.test.ts:124-126,163` (genuine V41 to V42), `p14c2rm-writer-continuation.test.ts:249-252`, `p14c3-profession-history.test.ts:291`.
- At HEAD, the only `validateSaveV42(` calls left are `p14b9-save-v42.test.ts:125,148`, both on the migrated genuine input. The genuine V42 pre-shelving captures feed only `p14d1-*` files, and the patch touches none of them.

**3. Sentinels (S3): MET WITH EVIDENCE.** All 34 changed sentinel lines in 16 files move 43 to 44 and "through 42" to "through 43". Those regexes match the dispatcher message at `src/core/save.ts:5438`. Three titles still read "43 / 1 through 42" (`p13b-s8-save-v27.test.ts:211`, `p14a1-save-v28.test.ts:252`, `p14b1-save-v29.test.ts:202`). They follow g4's keep-the-title rule (g4 hb:12-16), so no identity moves.

**4. Chains and S9 against production law: MET WITH EVIDENCE.**
- `convertV43ToV42` (`src/core/save.ts:10689-10704`) refuses on a `screenplayShelved` receipt first (:10693-10694). It then checks each business's rejections (:10698), shelved list (:10699) and hold (:10700). Every S4 edit inserts `convertV43ToV42(` at the innermost position. The only HEAD call to `convertV42ToV41` without it, `p14b9-save-v42.test.ts:163`, runs on a genuine V41 round trip.
- Each S9 message equals x2's raw output (`S/1344-merge/x2-core.txt:193653, 197029, 197044, 197059, 197075`, mapped to the four files r2a names) or X12's (`E/1344-stage/x12/guard-p14c3-transitions.txt`), and each regex is anchored. X12's D14 counterfactual fails at `src/core/save.ts:10629` when the prepend is removed (`E/1344-stage/x12/s4-counterfactual-D14.txt`).
- The covering tests exist and reach their guards:
  - `p14p4p5-screenplay-status.test.ts:324` pins the exact V39 message.
  - `p14c3-save-v38.test.ts:484` calls `convertV38ToV37` directly, which runs `assertProfessionHistoryDowngrade` before validating (`src/core/save.ts:10487`).
  - `p14c1-materialized-aging.test.ts:445` refuses on the provenance boundary before any shape check (`src/core/save.ts:9637-9642`).
- 27b56c2 changes two assertions and adds 9 comment lines in one file. Both pins tighten (HEAD `tests/p14c3-transitions.test.ts:175,207`), and the file then passed 35/35 (`E/1344-stage/x12/s9-transitions-verify.txt`).

**5. Helpers and pins: MET WITH NOTES.**
- **S5.** All 21 `withEmptyScreenplayShelving` copies give every business `{version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0}` and pass a null `hollywood` through, exactly what `src/core/save.ts:10681-10683` writes (for example `tests/p14c3-save-v38.test.ts:44-48`, `tests/bridge-p14r2r3-prior55.test.ts:138-144`). Nineteen files define their own `withRivalTermination`, so one helper per file beside it meets 1344-N:33-34.
- **S1.** `saveApi` reads its key off the save module (`tests/helpers/p14c3-fixtures.ts:64-66`). f8c48ec renames 24 callers in 4 files, and HEAD holds 24 `saveApi('validateSaveV43')` calls and no V42 key.
- **S6.** The lift at `p14b9-save-v42.test.ts:183` goes through production's `convertV42ToV43`.
- **S7, row 5.** The guard at HEAD `tests/p14b5-relationships.test.ts:297-307` carries every clause of F4:26-30 and runs before the strip at :309. The pin at :159 is unchanged. The one-tick bound matches `src/core/hollywoodTick.ts:268-273`.
- **S7, scientist retirement.** The unguarded delete at `p14c2s-scientist-retirement.test.ts:315` is safe. A shelved screenplay would fail the `not.toThrow` shape control at :328, so the delete cannot hide one.

**6. ORACLE rows: MET WITH EVIDENCE.** Both oracles (`p14b1-trust-chooser.test.ts:607-615`, `p14b4-cast-class-policy.test.ts:90-98`) read the persisted `screenplayShelving.shelved`. Each asserts it equals the unproduced ordinals outside `activeScriptOrdinals`, which is production's rule at `src/core/hollywoodTypes.ts:142-145` (kept sorted on insert, `src/core/hollywoodTick.ts:279`). Each then filters, sorts and slices as `src/core/talentMarket.ts:1446-1448` does. Neither file calls `rivalPromiseProjectCandidates` or `shelvedScriptIds`; the names appear only in comments (:608, :91). Each file has one hunk, from r2c, and no pinned value moves. The new assertions run inside the existing spy, beside its own assertions (`p14b1-trust-chooser.test.ts:654-692`).

**7. Classification integrity: MET WITH NOTES.**
- **Scripted check.** 421 rows match a removed line and an added patch line verbatim. All 108 others have explanations: 95 `notVerbatim` rows (abbreviations, helper descriptions, the six rewritten-line pairs), rows [7], [9] and [25] (multi-line rows whose first line is context), and r2a's rows (old text from a318722).
- **Hand check.** Every one of the 54 rows sits at HEAD. Line numbers follow each unit's commit: g2's `p14c3-profession-history` rows use base lines (HEAD +7 below r2a's comment), and the g5 and r2b `c2a-m2-sets-save` rows use a318722 lines (HEAD minus 1).
- **Counts.** C5's figures hold: 316 exact, 118 moved, 95 notVerbatim, and the group and class counts sum to 529. All ten unit commits equal their `patch.diff` line sets and name its sha256 prefix.
- **File coverage** holds both ways (137 of 137, no row names an unchanged file).
- **Hunk coverage** has gaps. Three of 404 hunks, all from g1 (eb8d902), have no row:
  - the S5 helper at `tests/bridge-p14c2s-scientist-runtime.test.ts:31-37`;
  - the S5 helper at `tests/bridge-p14c3-promise-digest-continuity.test.ts:90-96`;
  - the `futureAPI()` asserts at `tests/p14p4p5-opportunities.test.ts:83-84` (base :73). Row [91] covers only the type at :33.
  1344-N:17 gives each edit a row.
- **Row [153]** names `p14c2s-scientist-retirement.test.ts:324`, but the edit sits at :310-315.
- **C5:224** says 15 files carry two commits. Per-file `git log 6c54d5e..27b56c2` gives 16, because 27b56c2 added `p14c3-transitions`. The "11 without rewrites" figure holds.

**8. Open items: MET WITH NOTES.**
- Every item in the 10 handbacks and deferred.json files has a C5 row (items 1-57). r2b's deferred.json is empty.
- I checked 28 rows against their sources (items 1, 2, 4-10, 14, 17, 23-31, 33, 35, 39, 41, 43, 45, 46, 50, 51, 53), and every disposition matches. X9-cmp rows [9], [10], [12], [16], [68], [81]-[83], [85] and [86] read as cited. The SAME counts of 8, 2, 2 and 15 hold, and each def:N lands on the named entry.
- X8 gained a line at :50-51 at 19:30:02, after C5's last write at 19:29:47. As a result, C5's X8 citations from :50 on point one line early.

**9. S10 and the declared exceptions: MET WITH EVIDENCE.**
- **Rows 1-4 and the promise rows are untouched.** The patch leaves `p14b4-rival-seating-preference` and `p14c2c-rival-promises` alone. `bridge-p14b5-relationships` changes only base :64, :373 and :460, nowhere near :529-550. `p14c3-admission-boundaries` changes only the helper call at :23, which unmasked N10.
- **The probes support F4 ruling 1.** Every gate in rows 1-4 passes (`E/1344-stage/s10/out/*.predicates.json`), and the head anchors equal x3's received values (X9-cmp rows [9], [10], [12], [68]).
- **Row 6 is untouched.** No `p14b5-relationships` hunk falls in base :360-380.
- **F6 §1 matches its evidence.** `row6-r3/declaration.md:19-21` and `row6-r3/out/row6-r3.json` give reason P3, with two takes at post-tick 229. The lines F6 quotes hold at HEAD (`tests/p14b5-relationships.test.ts:397,400,651,661,859`).
- **F6 §2 matches** `promises-r2d/out-r3/promises.rewitness.json`: 0 candidates and 0 errors under both rules.
- Both probes ran at 6935ea5 (`merge-head.txt`), and neither later commit touches these files.

**10. HYGIENE: MET WITH EVIDENCE.** 62f14e7 rewrites two comment lines, `tests/p14d1-rival-shelving-natural.test.ts:120` and `tests/p15b1-corporate-condition.test.ts:742`. At repo HEAD, `git grep Math.random -- src tests ':!tests/fixtures'` finds those two lines plus `tests/hygiene.test.ts`, which the scan skips as SELF (:37). With the patch applied, no offender remains.

**11. Patch hygiene: MET WITH EVIDENCE.**
- The 137 paths are 132 under `tests/` (11 in `tests/helpers/`) and 5 under `ui/src/`.
- No path is in `src`, `generated`, `tests/fixtures`, a config or a tsconfig.
- The patch has no new-file, delete, rename or mode line.
- Under a temp index read from af315499, `git apply --check --cached` exits 0 (137 files, +822/-512). The temp index is deleted.

**12. Anything else: MET WITH NOTES.**
- **Three unmeasured first guards.** The sweep reached or rewired three leaves whose refusal check a shelving message also satisfies. Each runs on a ticked natural live save whose chain crosses `convertV43ToV42`. All three pass at x3 (no X9-cmp row), but no run identified which guard refused:
  - `p14c2s-scientist-retirement.test.ts:279-280` checks `/Scientist|scientist|downgrade/` at week 566. The S2 edit at :276 unmasked them, and their chain enters `convertV43ToV42` at `src/core/save.ts:10357` and :10123.
  - `p14c2rm-writer-continuation.test.ts:254` uses a bare `toThrow()` at natural week 312 (`tests/helpers/p14c2rm-fixtures.ts:127-147`) after g1's S4 prepend.
  - `p13b-s8-save-v27.test.ts:188` checks `/cannot downgrade/i` at natural week 20, unmasked by :187. The leaf at :195 runs the same input and passed before the sweep.
- If a shelving guard fires first, each leaf passes on that guard, as X12 found for `p14c2b-save-v36` (C5 item 39). C5:242 says X12 measured "all six alternation sites", but these three lie outside that set. Which guard fires is UNVERIFIED.
- Reading source cleared two other sites. `p12-starting-world.test.ts:52` runs on a fresh founding world with no tick. `p14b9-save-v42.test.ts:207` lifts and greenlights with no tick, so `convertV43ToV42` passes and the casting guard refuses.
- X12 §3 says no test reaches the V37 guard on genuine pre-V38 input. In fact `p14c3-save-v38.test.ts:484` reaches it by direct call on the genuine V37 corpus `PRE207` (`tests/helpers/p14c3-fixtures.ts:74`; r2a hb:15). The 27b56c2 comment claims only :207, so it stands.

## Required changes

1. **Classification: add three g1 rows** (commit eb8d902). Append them after rows[528] so that C5's row indexes hold.
   - (a) `tests/bridge-p14c2s-scientist-runtime.test.ts`, line 33, class S5. Old: "(added helper after withSharedCompetitions, base :30)". New: "function withEmptyScreenplayShelving<T extends { hollywood: GameStateV36['hollywood'] }>(state: T): T {...}" (:31-37).
   - (b) `tests/bridge-p14c3-promise-digest-continuity.test.ts`, line 92, class S5. Old: "(added helper after withFirstTakeSubjects, base :89)". New: "function withEmptyScreenplayShelving<T extends WithRivalBusinesses>(state: T): T {...}" (:90-96).
   - (c) `tests/p14p4p5-opportunities.test.ts`, line 83, class S1/S4. Old: `assert.equal(typeof api.validateSaveV42, 'function', 'new public strict41 reader after actual version assertion')`. New: the same assert on `validateSaveV43` with "strict42", plus the added :84 `assert.equal(typeof api.convertV43ToV42, 'function', 'new public guarded live→42 conversion')`.
   - Why: 1344-N:17 requires a row for every edit. These hunks have none (check 7).
2. **Classification rows[153]:** line 324 becomes 315. Why: the edit sits at HEAD :310-315 (check 5).
3. **C5 counts that follow change 1:**
   - C5:28 and C5:79: "529" becomes "532".
   - C5:30: "493" becomes "496".
   - C5:45: g1 rows "78" become "81".
   - C5:67: S5 "42" becomes "44".
   - C5:74: S1/S4 "3" becomes "4".
4. **C5 X8 citations** (why: X8's added line at :50-51, check 8):
   - C5:92: "X8:80" becomes "X8:81".
   - C5:107: "X8:69" becomes "X8:70".
   - C5:133: "X8:64-66" becomes "X8:65-67".
   - C5:134: "X8:56-59" becomes "X8:57-60".
   - C5:139 and C5:149: "X8:53-55" becomes "X8:54-56".
   - C5:150: "X8:59" becomes "X8:60".
   - C5:162: "X8:60" becomes "X8:61".
   - C5:180: "X8:45-50" becomes "X8:45-51".
   - C5:237: "X8:42-66" becomes "X8:42-67".
5. **C5:224:** "15 files carry edits from two commits" becomes "16 files carry edits from two commits". Why: 27b56c2 (check 7).
6. **C5 open items:** add item 58 and reword C5:242. Why: C5's guard-order claim is incomplete (check 12).
   - Item 58: "Unmeasured first guard at `p14c2s-scientist-retirement:279-280`, `p14c2rm-writer-continuation:254`, `p13b-s8-save-v27:188` | 1344-D4 check 12 | Measure with the X12 logging copy before 1344-K. A leaf a shelving guard masks takes the S9 form, or joins item 39 as a 1344-K finding."
   - C5:242: "X12 measured all six alternation sites: items 39, 43 and 56." becomes "X12 measured six alternation sites (items 39, 43, 56). Item 58 lists three leaves no run measured."

**Not required.**
- r2c's header comments (C5 item 52, `p14b1-trust-chooser.test.ts:586-589`) can stay, because the ORACLE comment at :607-610 corrects them.
- The title "LIVE_SAVE_VERSION === 42" at `p14r3-save-v41.test.ts:210` sits over a `toBe(43)` body.
- Row [12] does not mention that the 1309-X3 comment at `tests/helpers/p14c3-fixtures.ts:58` lost its "(42)".

## Verdict: ACCEPT WITH CHANGES

The patch is sound and applies as staged at repo HEAD. Changes 1-6 correct the classification and the handback before the recorded gates run. Change 6's measurement does not block application. All three leaves pass whichever guard fires, so the gates' identity sets do not move.
