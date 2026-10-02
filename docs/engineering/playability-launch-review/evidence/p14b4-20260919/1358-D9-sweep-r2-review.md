# 1358-D9: independent review of the Save44 and projection-57 pin sweep, revision r2

**Summary.** I reviewed `E/1358-stage/sweep-r2/1358-sweep-r2.patch` read-only and finished this text on 2026-10-02 at
07:56 CDT.
- **The patch.** Its sha256 is e1f93665bb0c587d4bcb0c2c225dadd7260bb8926979e6236521cadbaf7c832c, the patch F11 names
  for X8. It is byte-equal to `git diff step4 HEAD -- tests ui` in the merge worktree (HEAD 8559440, branch `sweep-x8`).
  It holds 154 test files, +1,039/-676, in 459 hunks. It has no production, fixture or config path, and no new-file,
  delete, rename or mode line.
- **Where it applies.** At repo HEAD e0dfe065 all 154 files carry their `step4` blobs, so the patch applies there as
  text. Repo HEAD's `src` and `bridge` trees (071f9ff3, 9da338c4) equal base 24f631b's, which is 5245072a's source. So
  the patch passes only on top of step 4 r2 (`src` 762d8e09, `bridge` faa227af), the stack X6 and X7t ran.

No edit weakens an assertion. The sentinels, projection pins, roster digests and schema id all match source; I
recomputed each digest and id. Every live chain gains `convertV44ToV43`, and no chain strips `competitions` or `romance`.
Every measured S8 and S9 pin equals its probe message, and every guard Save44 masks keeps an own-era cover that an X7t
probe reaches.

The defects that drive the verdict sit in the record and in one staged cover:
- 25 landed edits (the two S5 drafts and the week-93 lift) have no classification row;
- one renamed live-validator call under a bare `.toThrow()` has no S8 row;
- four S8 rows that 1358-F10 ruling 2 lists have no closing ruling;
- the screenplayShelved receipt guard's only own-era cover stages two shelving values the engine never writes.

Lower findings cover the V41 staging's selection, eleven new comments that cite a wrong line or ruling number, and one
V27 comment.

Verdict: REFINE, items R1 to R4. No finished run has executed the r2 patch. 129 of its 149 core test files have never
run on any sweep tree, and 22 files changed after X7t's tree. X8 decides them (finding 8).

**Method and limits.**
- **Tools.** Read-only git in the merge worktree (`show`, `diff`, `log`, `rev-parse`, `blame`, `grep`, `diff-tree --cc`,
  `patch-id`), plus Python 3 over the patch text, the unit outputs and blobs read through `git show`.
- **The repo.** I ran only `rev-parse` there (blobs of the 154 files and the `src` and `bridge` trees at HEAD). No
  `-p`, no `-S`.
- **Runs.** None. I ran no node, vitest, tsc, tsx, vite-node or npm process.
- **Fixtures and captures.** I read no file under `tests/fixtures`. For check 6 I read three evidence files by exact
  path, with Python gzip and json: `E/1221-p4p5-outgoing-capture/MANIFEST.json`, `director-bound-week52.json.gz` and
  `director-waived-week61.json.gz`.
- **A scope slip.** Two of my searches ran `grep -r` over `tests` with `--include=*.ts` and filtered `tests/fixtures`
  out of the output afterwards. So grep walked any `.ts` files under `tests/fixtures`. I used none of that output, and
  every later search used `git grep` with `':(exclude)tests/fixtures'`.
- **Coverage.** A script checked all 717 classification rows against their unit commits and all 459 hunks against the
  rows. I read 58 rows by hand and traced every S8 and S9 pin to its source line and its probe message.
- **X8.** It runs in parallel, and I read none of its outputs.
- **Writes.** This file and `d9-recompute.py`, both in `S/1358-sweep/review/`. Working copies of my analysis scripts sit
  in the session scratchpad under `/private/tmp`, outside the repo and the worktree.
- **Line numbers.** "HEAD :N" means the merge worktree at 8559440 and "base :N" means `step4`. Source lines are at
  step 4 r2, which the worktree carries.

## Verdict: REFINE

Required before the landing:
- **R1.** Classification rows for the 25 unclassified edits (finding 1).
- **R2.** An S8 row for `p14c2rm-writer-continuation:312` (finding 3).
- **R3.** One parent ruling that closes the S8 rows F10 ruling 2 left open (finding 2).
- **R4.** The receipt cover's two staged shelving values match the engine's writes, or a ruling accepts them
  (finding 4).

R2 and R4 touch test text; R1 and R3 touch only the record. With them in place, and with X8 passing finding 8's items,
the patch can land on step 4 r2. The exact edits are in "Required changes".

## Findings, ranked by severity

### 1. Medium: 25 landed edits carry no classification row

The parent landed three commits that no unit classified:
- **99ced62**, G3's S5 draft. Its patch-id (a0d7e9052bea…) equals G3's ba0a250 and `sweep-r1/g3/s5-draft.patch`. It
  makes 14 edits in 32 code lines: 6 helpers and 8 call sites.
- **a309b54**, G6's S5 draft. Its patch-id (99e0aee38e58…) equals G6's 49bafc6 and `sweep-r1/g6/s5-draft.diff`. It
  makes 10 edits in 20 code lines: 5 helpers and 5 call sites.
- **d8be757**, the week-93 lift of N-0140 at HEAD `p14d1-rival-shelving:560-568` (5 code lines).

The deferred lists still hold the 14 census rows behind these edits:
- `g3/deferred.json` holds 8, each marked "dry run";
- `g6/deferred.json` holds 5, with N-0656 marked "dry run" and four marked "M2";
- `g1/deferred.json` holds N-0140, marked "M2".

Further detail:
- **Hunk coverage.** 17 of the 459 hunks hold no classified line: 5 from 99ced62, 10 from a309b54, 1 from d8be757 and
  1 from 8559440 (the parent's 3-line family-10 comment, HEAD `p14b5-relationships:1396-1398`). 99ced62's other lines
  sit in 8 hunks beside classified edits.
- **The rule.** 1358-N "Classes" (:65): "Each edit gets one classification row." 1344-D4 required change 1 asked the
  same of the Save43 sweep's unclassified commit.

### 2. Medium: four S8 rows from 1358-F10 ruling 2 have no closing ruling

F10 ruling 2 lists eight S8 rows and orders: "The follow-up unit then pins each measured message with its `src` line."
- **Pinned.** F2 pinned N-0468 (18 cases), N-0470 and N-0472. N-0474 is G5's read pin, which F2's row confirms, and X7t
  passed the file 64 of 64.
- **Measured, no pin.** H-new-1 (HEAD `p14c3-save-v38:121`, 102 cases) and G5-new-7 (HEAD
  `p14c2rm-writer-continuation:378`, 32 cases) stay unpinned under F2's "rule 3". `parent-notes.md:46` records that
  outcome, and no ruling adopts it.
- **Measured, never pinned or disposed of.**
  - G6-new-4 is at `p14b1-t4-regressions:86` (15 cases) and G6-new-5 at
    `contracts/studio-events.contract.test.ts:221` (24 cases).
  - `parent-notes.md:30` planned their pins. After X6 logged them, neither F1 nor F2 took them, and neither F11 nor the
    parent notes mention them again.
- **Risk.** The gates stay safe: in X6 all 173 cases throw, and none reaches a version check.
  - G6-new-4's cases reach `validateSaveV40` promise, proposal and contract guards.
  - G6-new-5's reach the V12 and V14 unknown-field guards on `seen` and `consumed`.
  - Only the record lacks a disposition.

### 3. Low to medium: a renamed live-validator call under a bare `.toThrow()` has no S8 row

HEAD `p14c2rm-writer-continuation:312` (base :279) reads `expect(() => validateSaveV44(illegal)).toThrow()`.
- **The rule.** G5 renamed the call (N-0478, S1) and filed no S8 row because the legal twin passes at :311. The rule
  still applies:
  - 1358-N:81 says: "A renamed call under a bare `.toThrow()` also takes an S8 row."
  - F10 ruling 2's heading says: "S8 covers every renamed live-validator call under a bare `.toThrow()`."
  - G6-new-4 has the same shape, a legal twin at :84, and got a row.
- **The measurement.** X6 did not probe this site.
- **The reading.** Its input (:306-308) equals N-0468 case 1 as the `it.each` applies it at :235: the same `corrupt`
  (:183-184) on `finishingWriter().finishing` and its writer.
  - So the leaf refuses with X6's case-1 message: "validateSaveV36: talentMarket.cases[25] is a retirementExtension
    case for authored-0000, who holds no retirement record" (`save.ts:10295`).
  - That guard fires ahead of the authority rule the leaf's title describes, the pattern F11's closure findings record
    for N-0468 cases 1 to 3 (F11:66).

### 4. Low to medium: the receipt guard's only own-era cover stages shelving values the engine never writes

F11 ruling 2 made HEAD `p14d1-rival-shelving-save-v43:238-256` the screenplayShelved receipt guard's own-era cover. The
leaf now matches the engine's shelving write (`hollywoodTick.ts:276-281`) in four respects:
- it drops ordinal 6 from `activeScriptOrdinals` (:246);
- its receipt carries `scriptProjectId`;
- its receipt carries the business's costed concept (`b.projects[6]!.conceptId`, :249), as `hollywoodValidation.ts:539`
  requires;
- its receipt carries `rejections` at the threshold.

The shelving state at :247 still differs from the engine's write in two values:
- **retryWeek.** The leaf stages 200. The engine writes `week + HOLLYWOOD_SHELVED_RETRY_WEEKS`, 130 + 26 = 156
  (`hollywoodTick.ts:279`, `tuning.ts:35`).
- **commissionHoldUntilWeek.** The leaf stages 0. The engine writes `week + HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS`,
  130 + 13 = 143 (`hollywoodTick.ts:280`, `tuning.ts:34`).

The validator asks only that the retry week follow the shelving week (`hollywoodValidation.ts:365`) and that the hold be
an integer (:351). So the state validates, and X7t's RECEIPT43[real-concept] probe reached the guard. Check 5 asks staged
covers to write only what the engine writes (F10 ruling 5, F11 ruling 3), and F11 ruling 2 says nothing about these two
values.

Both engine values keep the pin: `convertV43ToV42` refuses on the receipt (`save.ts:10739-10741`) before its business
loop reads the hold (:10742-10746).

### 5. Low: the V41 staging skips two of the release law's tests

HEAD `p14r3-save-v41:396-401` picks the first active rival employee, by ordinal, that passes four of the release law's
tests:
- not seated (`hollywoodTick.ts:180-182`, :187);
- more than the cap left (:187);
- not a Scientist (:184);
- no open promise (:188).

It then makes the law's four writes (:192-196) with production helpers. It skips two tests:
- **Slot retention.** The law releases only people the strategy's slot loop did not retain (`!filled.has(...)`, :184;
  `filled` is built at :132-173).
- **Affordability.** The law skips a release that would leave cash below the operating reserve (:191).

So the comment at :383-385 ("for the first rival employee that law could end") is unproven for X7t's pick:
person-studio-64a16d11-r01-0, a writer, week 110, charge 40,664. F11 ruling 3's premise holds for the write set, but
the selection may release someone the engine would keep. The guard refuses on the receipt alone (`save.ts:10642-10643`),
so the pin holds either way.

### 6. Low: eleven new comments cite a wrong line or ruling number

- **Q03 five lines early (7 comments).** These comments name Q03 at `tests/p14p4p5-opportunities.test.ts` ":331" as
  the V39 cover:
  - `p14c2b-save-v36` :81 and :96;
  - `p14c2rm-writer-continuation:286`;
  - `p14c2s-scientist-retirement:285`;
  - `p14c3-cohort-transition:285`;
  - `p14c3-dual-extensions:177`;
  - `p14c3-offmenu-extensions:234`.

  F2 wrote them against sweep-x6, where Q03's `convertV40ToV39` assertion sat at :331 (8144c0c and 37a1108 both put it
  there). F1's helper (HEAD :70-74) moved it to :336. HEAD :331 now reads
  `const api = futureAPI(); expect(api.validateSaveV44(valid)).toBe(valid)`.
- **F11 rulings by F1's numbering (4 comments).** F1's handback numbers the rulings D13 = 1, D12 = 2, G5-new-6 = 3
  (`f1/handback.md` :50, :68, :77). The published F11 numbers D13 and D12 together as ruling 1 and G5-new-6 as ruling 4.
  In `p14p3-directing-promises`:
  - :102 cites "rulings 1 and 2" where F11 has ruling 1;
  - :744 and :750 cite "ruling 2" (D12) where F11 has ruling 1;
  - :476 cites "ruling 3" (G5-new-6) where F11 has ruling 4.
  - :413 ("ruling 1", D13) matches.

F10 ruling 7 keeps stale line citations in comments as written. The parent issued it for comments that predate the sweep
(G2's item 4). These eleven are the sweep's own text and are wrong on the tree it lands.

The V39 covers also split: F2's comments name Q03 and `p13b-s3-save-v23:115-117`, while F1's comments and 8559440 name
Q11's `factOnly` assertion. All three reach the V39 guard (X7t F2-Q03 and F1-V39; X6 N-0367 to N-0369), so the split
costs only consistency.

### 7. Low: the V27 masking comment omits the covered arm

The masking comment at HEAD `p13b-s8-save-v27:188-192` says the V27 guard "keeps its own-era coverage in the next
leaf's last assertion".
- **What the cover reaches.** That assertion (:215) reaches `projectHollywoodPreV27`'s receipt arm (`save.ts:8833`).
  X7t logged "on receipt industry-event-188".
- **What the title names.** The :180 title names a nonzero researchCapacity movement, which is the finance arm
  (`save.ts:8848`). F11's closure findings (F11:64) say the finance arm cannot fire on a valid save.
- **The fix.** The comment should name the arm the cover reaches. The second leaf's own comment (:206-210) already names
  the receipt arm correctly.

A note that needs no change: the cover loads all three V26 fixtures (:211-213) without `assertSha256`. The file's other
loads at :171, :219, :232 and :239 skip the check too, and the file pins all three fixtures at :110 and :149. So a
changed fixture still fails a leaf.

### 8. Information: what X8 decides

No finished run has executed the r2 patch.
- **X6.** Its core output (440 files) was lost.
- **X7t.** It ran slice B, 13 files and a 44-line probe on 2ea399c (patch 81cba89c). 22 test files changed after that
  tree.
- **Coverage.** Counting every finished run on any sweep tree, 20 of the patch's 149 core files have run (X6's 19
  probe files, X7t's 13, and slice B's `p14b5-relationships`). The other 129 never have. X6's UI gate ran the 5 UI
  files, and r2 left them unchanged.
- **Type gates.** They passed on X6's and X7t's trees, and no run has checked them on the six commits after 2ea399c.

X8 is the first full run. Within it, these items have no probe and rest on reading alone. Each is an exact pin, a
whole-state comparison or a chain that must succeed, so a wrong reading fails loudly. None strips a field.
- **Pins read from source.** My reading agrees with each:
  - `p14b9-save-v42:186`, the staged V42 counter at the casting-competition guard;
  - `p14b9-save-v42:223`, the log refusal of relationship-edge-24 (it assumes no edge below 24 gains a romance track);
  - `p12-starting-world:55`, makeSaveV18's entrant-authority guard.
- **Comparisons never run.**
  - G3's eight S5 sites (99ced62);
  - N-0656 at `p14p4p5-cross-owner:107`;
  - N-0140 at `p14d1-rival-shelving:568`, where probe 4 counts the candidate's logs and tracks first.
- **Chains that must succeed.**
  - N-0444, `contracts/v14-boundary-guards:63`;
  - N-0449, `p06a-w1-release-authority:406`;
  - N-0573 and N-0575, `save.test` :370 and :419;
  - G3-new-1, `bridge-p14c3-runtime:178`.
- **D13 and D12 builders on the captures.** Probe 4 logs each builder's message.

### 9. Information: P4 is still deferred

HEAD `bridge-contract-generator:726-727` still pins F10 and F11 at `a0f316eb…`, the projection-56 render.
- **The failing leaf.** G2's handback (:99-101) states that "pins exact positive output identities and deterministic
  rerendering" (:632) fails until the recorded producer run lands (1358-F9:47, "P4").
- **Consequence.** X8 will report that leaf as a new failure. The success line cannot hold until P4 lands.

### 10. Information: a closure finding outside the sweep

HEAD `p14d1-rival-shelving-save-v43:168-181` ("rejects two screenplayShelved receipts naming the same screenplay")
pushes two receipts with `conceptId: 'x'` (:174) and expects `/shelv|receipt|duplicate|second/i` (:180).
- **Validation order.** In `hollywoodValidation.ts` the first receipt fails :539 ("screenplayShelved receipt names no
  costed screenplay of its rival") in its own loop pass. The duplicate rule at :549 never sees a second row.
- **Consequence.** By reading, the leaf passes on the concept check. This is the defect F11 found at :251. The Save44
  sweep did not create it, and no run measured it.
- **The retry leaf.** The leaf at :202-212 also stages `conceptId: 'x'`. The business loop's retry check (:365) runs
  first, so that leaf reaches its own rule.

### 11. Information: process notes

- **The week-93 order.** d8be757 lifted the week-93 input at 06:28:05 (commit time), four seconds after X7t applied its
  patch and before any probe counted the candidate's logs and tracks.
  - F10 ruling 9 asked for the probe first. F11 ruling 6 accepts the edit, with X8's probe 4 deciding.
  - The lift cannot hide a track: the candidate side keeps its fields, so the canonical comparison would fail.
- **A history search.** G1's handback (:136) discloses `log -p` in the repo, the partial-clone hazard F10 ruling 10
  records for G2's `log -S`. No ruling mentions G1's.
- **The one reduction.** D12's builder assertions fall from six (three builders on each of two route states at base
  :694-695) to three (one capture), as F11 ruling 1 orders. D13 keeps its six. No other edit lowers an assertion count.

## Checklist (1344-D4's form)

**1. Assertion strength: MET WITH EVIDENCE.**
- **Constructs.** Removed then added, comment lines excluded (the counts match with them included):
  - `expect(` 447/464, `.toThrow(` 126/134, `.not.toThrow` 21/21;
  - `.toBe(` 289/296, `.toEqual(` 25/25, `toMatchObject` 0/0;
  - `toContain` 6/6, `toHaveLength` 2/2.

  No `.skip`, `.todo`, `.only`, `skipIf` or `.fails` appears on either side.
- **The 17 added `expect(` calls** are the new own-era covers and S9 chain pins:
  - `p13b-s8-save-v27` +2, `p14b9-save-v42` +1, `p14c2rm-writer-continuation` +1;
  - `p14c2s-scientist-retirement` +1, `p14p3-directing-promises` +7;
  - `p14p4p5-screenplay-status` +4, `p14r3-save-v41` +1.
- **Positive bare `.toThrow()`** (`.not.toThrow()` excluded). The patch removes nine and adds three.
  - The three added rename a bare call in place: `p14b1-t4-regressions:86`, and `p14c2rm-writer-continuation` :312 and
    :378.
  - The other six became pinned messages: `p14b9-save-v42:223`, and `p14c2rm-writer-continuation` :236 (the `refusal`
    column), :252, :263, :264 and :287.
- **Regex changes.** S3, P1 and G2-new-1 change digits only. Every S9 site moves to an anchored pin on the measured first
  guard, with a masking comment. Each starts from a loose pattern or from an exact pin on a guard Save44 now masks:
  - J7 (`p14c3-cohort-transition`), X5 (`p14c3-dual-extensions`) and O3 (`p14c3-offmenu-extensions`) pinned the Save43
    receipt guard;
  - Q11 (`p14p4p5-screenplay-status`) pinned the V39 guard.
- **Titles.** The 18 changed `it(` lines are the 17 P5 renames and the `it.each` at `p14c2rm-writer-continuation:234`,
  whose title stays.
- **The narrowing guard.** `film-chronicle:923` moved with :911 and :922, so the leaf cannot return early.
- **Changed checks.** D13's and D12's implicit "the V40 projection succeeds" became explicit refusal pins (F11 ruling 1).
- **Hygiene.** No added line holds a tab, a trailing space or `Math.random`. The two em dashes on added lines sit in
  unchanged text (`bridge-p13b-r07-setup:587`, `p13b-s7-announcements:86`).

**2. Live versus historical: MET WITH EVIDENCE.**
- **The sample.** I read 43 S1 and S2 rows in context, from all seven r1 groups and the UI (list below). Each input is
  one of:
  - a `makeSave` or `migrateToLive` output;
  - a live-version stamp on a live state (`p14c4-save-v35:277` uses `LIVE_SAVE_VERSION`; `p14c3-queued-writing-proof:28`
    writes 44);
  - a hydrated checkpoint slot (`bridge-runtime-checkpoint` :272 and :785, `bridge-process-restart:797`);
  - a parsed export of a live save (`bridge-p13b-r07-setup:587`; `ui/src/session.test.tsx` :332 and :387);
  - a helper that wraps one of these. `acceptedEvidence`, `acceptBoundary` and the `admitted` helpers check live saves,
    and `envelope38` (`helpers/p14c3-fixtures:134-136`) calls `makeSave` and asserts version 44.
- **Keeps.** Every `validateSaveV43` reference, `toBe(43)` and `saveVersion = 43` stamp left in `tests` and `ui/src` does
  one of two things:
  - it reads a V43 envelope: `p14d1-rival-shelving-save-v43` :57-58, :76, :124, :139-216, :229, :243 and :262, and
    `p14b10-save-v44:151`, slice B's genuine V43;
  - it checks that a frozen function exists or declares its type: `p14d1-rival-shelving-save-v43` :35-36 and :47, and
    `p14d1-rival-shelving:189`.
- **Era 44.** `validateRelationshipsRoot(<live>, 42)` moved to 44 at all five sites, each on a live-era root:
  `p14b5-relationships:1305`, and `p14b5-t-failure-tuning` :117, :123, :433 and :489. At :433 the root is the live
  engine state with relabeled failure deltas.

**3. Sentinels (S3): MET WITH EVIDENCE.**
- **The rows.** 31 S3 rows on 31 lines in 16 files: the plan's 30 (1358-N:98) plus G5-new-1, a comment.
  - Each code row changes digits only. Stamps move 44 to 45, and "1 through 43" moves to "1 through 44".
  - Ten P5 titles that name the sentinel change the same digits.
  - G5-new-1 rewrites its comment and cites `save.ts:5443-5445`.
- **The message.** Every changed regex matches the dispatcher's message, "validateSave: unknown saveVersion 45 (this
  build handles versions 1 through 44 only)" (`save.ts:5444-5446`). Stamp 44 now dispatches to `validateSaveV44`
  (:5443). `d17a-adv-migration:274` and `d17b-save-v7:163` are in (N-0337, N-0339).
- **save.test.ts:288** keeps its pre-existing bare `.toThrow()`. Its input (`wellFormedSave()` stamped 45) is an
  object, and `validateSave` checks nothing else before the version dispatch (`save.ts:5395-5446`), so only the
  dispatcher can throw there.

**4. Chains (S4): MET WITH EVIDENCE.**
- **Inserts.** `convertV44ToV43` sits innermost in every chain that starts from a live save.
  - The only post-image `convertV43ToV42(` calls without it take V43 envelopes (`p14d1-rival-shelving-save-v43` :223,
    :235, :256 and :268).
  - Every other occurrence is a type member, an existence check or a comment.
  - Calls that enter below V43 start from genuine historical saves, or go through `futureSave()` and `futureAPI()`,
    which carry the step.
- **The four helper chains.** `p14c2b-fixtures:69`, `p14c4-fixtures:71`, `p14c3-canonical-rival-fixtures:198` and
  `p14p3-fixtures:113`.
- **Typed APIs.** Each gains the member and its existence check:
  - `p14p3-fixtures` :83 and :94;
  - `p14p4p5-opportunities` :37 and :92 (G5-new-4);
  - `p14b9-save-v42:175-177`.
- **No chain strips (1358-F9 ruling 2).** Across all added lines, the only removal of `competitions` or `romance` is the
  planned S7 reader-only relabel at `p14c2s-scientist-retirement:316-317`, inside the :314-318 loop. It runs under a
  whole-envelope `.not.toThrow()` control (:346). Every other write sets the empty fields in one of two places:
  - on a staged or minted edge (S6);
  - on the expected side of a comparison (S5).
- **Merges.** The five merge commits (80ec691, 3c7b83a, 8144c0c, 2ea399c, 90225e2) print nothing under
  `git diff-tree --cc`, so no merge added content of its own.

**5. S9 forms against production law: MET WITH NOTES (findings 4 to 7).**
- **Source lines.** Every source line the new comments cite matches step 4 r2:
  - `save.ts` :10789 (log refusal) and :10790 (romance refusal), in `convertV44ToV43` (:10785-10794);
  - `save.ts` :10739-10740 (receipt guard) and :10600-10602 (V39 guard);
  - `save.ts` :10642-10643 (V41 receipt arm) and :10647 (V41 movement arm);
  - `save.ts` :10449-10454 (Scientist guard), :10382-10388 (V36 extension guard) and :8945-8956 (V27 guard);
  - `save.ts:10696`, with `relationships.ts:847-849`;
  - `relationships.ts:537` (the greenlight's log row);
  - `save.ts` :6181-6196, :6191 and :6194, with `professionHistory.ts:67` (makeSaveV18);
  - `hollywoodValidation.ts` :294 and :539;
  - `convertV43ToV44` at `save.ts:10776`.

  The ruling numbers in four comments are wrong (finding 6).
- **S8 source lines.** These all match:
  - `scriptDevelopment.ts` :811 (prefix), :919, :932, :980, :984, :996, :1020, :1113 and :1118;
  - `save.ts` :3371, :3526, :3532, :3655 (prefix) and :10295;
  - `professionHistory.ts:270`.
- **Measured messages.** 33 anchored pins sit on added code lines.
  - 29 equal a measured probe message (X6 or X7t).
  - The four unprobed pins are `p12-starting-world:55` and `p14b9-save-v42` :186 and :223 (finding 8), plus
    `p14c2rm-writer-continuation:264`, which X7t's 64-of-64 run of the file confirms.
  - The 18 N-0468 `refusal` regexes match their X6 case messages.
- **Covers.** Each masking comment names a cover that exists and reaches its guard:

  | Masked guard | Cover (HEAD) | Measured by |
  |---|---|---|
  | V39 | `p14p4p5-screenplay-status` Q11 `factOnly` (:330-341); `p14p4p5-opportunities` Q03 (:336); `p13b-s3-save-v23:115-117` | X7t F1-V39 and F2-Q03; X6 N-0367 to N-0369 |
  | screenplayShelved receipt | `p14d1-rival-shelving-save-v43:256` | X7t F2-RECEIPT43[real-concept] |
  | V36 extension, case branch | `p14c2rm-writer-continuation:278` | X7t F2-EXT36 |
  | Scientist | `p14c2s-scientist-retirement:291` | X7t F2-SCI37 |
  | V27 receipt arm | `p13b-s8-save-v27:215` | X7t F1-V27 |
  | V41 receipt arm | `p14r3-save-v41:409` | X7t F1-V41 |
  | casting competition | `p14b9-save-v42:186` | read only |

  No comment in `tests` names the masked `p14p4p5-screenplay-status:324` or the "week 48 take" capture any more. Four
  did at `step4`: F2's F11-4 to F11-6 rewrote three, and 8559440 rewrote `p14b5-relationships:1391`. This closes F1's
  open item 3, which F1 wrote on its own branch before those edits landed.
- **Own-era inputs.**
  - **V39:** the genuine week-110 Save40 capture, downgraded once. Its two sha256 pins equal `p14r3-save-v41:150-151`.
    Lawful.
  - **V36 extension:** the genuine V37 pair's commissioned311 save, which holds authored-0000's open
    retirementExtension case, through production's `convertV37ToV36`. Lawful.
  - **Scientist:** the genuine V37 week-670 capture (`scientistRaw()`). Lawful.
  - **V27:** genuine V26 fixtures through production's `migrateToV27`, then one call of the engine's own
    `admitRivalPlans` (`rivalResearch.ts:200-209`). Engine writes only, per F11 ruling 3.
  - **V41:** the genuine week-110 capture through `convertV40ToV41`, then the release law's four writes. The selection
    skips two of the law's tests (finding 5).
  - **Receipt:** genuine week-130 V42 bytes relabeled 43, with the shelving state set by hand. Two values differ from
    the engine's writes (finding 4).
  - **Casting competition** (`p14b9-save-v42:182-186`, F10 ruling 5):
    - the staging writes the counter without the `castingCompetitionLost` driver that an engine competition also writes;
    - the era-42 validator admits it (`relationships.ts:734`), and `assertRelationshipsAtV31` refuses on the counter
      alone (:848);
    - the parent has already ruled this, so I note it only for completeness.

**6. D13 and D12: MET WITH EVIDENCE.**
- **The loader.** `directorCapture40` (HEAD `p14p3-directing-promises:102-114`) pins MANIFEST.json and each capture's
  gzip and raw sha256, using the values Q04 uses (`p14p4p5-opportunities` :353, :358 and :366).
  - It validates with `validateSaveV39` and asserts identity and the `exportSave` round trip.
  - It returns `convertV39ToV40(old).state`. Nothing is stripped.
- **The captures.**
  - My recomputation reproduces all five hashes (see "Digest recomputations").
  - Both captures are Save39, and no edge holds a `romance` or `competitions` key. Both carry all six transition-root
    fields, and every promise predicate is `directorCount`.
  - director-bound-week52 holds promise-0 open; director-waived-week61 holds promise-0 WAIVED and promise-1 open.
- **Builder assertions.** Unchanged: `toThrow(/director|promise|predicate/i)` at :424 and :756, and the pre-existing bare
  `.toThrow()` on the `hollywood: null` variant at :426.
- **By reading, each builder refuses at `assertNoDirectorPromises`** (`save.ts:10556-10559`).
  - `convertV39ToV40` lifts with `facts: []` (:10595), so `convertV40ToV39` inside `assertFrozenBuilderRetainsHollywood`
    (:6183-6185) passes.
  - The transition-root check (:6187, `professionHistory.ts:10`) then runs the Director check, which matches any
    `directorCount` promise whatever its outcome (:10557).
  - Probe 4 logs the builders' messages in X8.
- **The live chains.** The S9 pins at :417-418 and :747-748 equal X7t's D13 and D12 probe lines.
- **D12's builder loop** runs once, on the capture (F11 ruling 1).

**7. S5: MET WITH NOTES (finding 8).**
- **Helpers.** Every `withEmptyCompetitionsAndRomance` maps the expected side's own edges and sets `competitions: []`
  and `romance: null`. None touches the migrated side, so a log row or a track there still fails. The sites, as
  "helper (call)":
  - F2: `p14c3-save-v38:51-53` (:92).
  - F1: `p14p3-directing-promises:88-90` (D14 :440) and `p14p4p5-opportunities:72-74` (Q04 :382).
  - G3 draft (each helper span includes its type line where it has one):
    - `bridge-p14c2rm-runtime:51-54` (:61);
    - `bridge-p14c2s-scientist-runtime:40-42` (:141);
    - `bridge-p14c3-promise-digest-continuity:99-102` (:164);
    - `bridge-p14p3-directing-promises:73-76` (:140, :376);
    - `bridge-p14p4p5-opportunities:63-66` (:99, :519);
    - `bridge-p14r2r3-prior55:148-152` (:201).
  - G6 draft:
    - `p14p4p5-casting-reservation:45-47` (:209);
    - `p14p4p5-cross-owner:44-46` (:107);
    - `p14p4p5-delayed-retirement:47-49` (:189);
    - `p14p4p5-queued-project-outcome:47-49` (:186);
    - `p14p4p5-scenery-capacity:43-45` (:202).
- **Lifts.** Three sites lift through production's `convertV43ToV44`: `p14b9-save-v42:192`,
  `p14c1-materialized-aging:178`, and the week-93 control at `p14d1-rival-shelving:568`.
- **Measured equal.**
  - X7t: F2-N-0041 on four captures, F1-Q04 on six and F1-D14 on six, with no log row and no track.
  - M2 (:68-70): the four p14p4p5 comparisons differ by exactly the two empty fields on all 24 edges.
- **Unmeasured.** G3's eight sites, N-0656 and N-0140; X8 decides them.

**8. Helper and roster pins (P1, P2): MET WITH EVIDENCE.**
- **Schema id.** The new id, sha256:74826ef4…1253, equals three things:
  - the step-4 manifest (`generated/unity/project-studio-bridge.contract-manifest.json:8`);
  - the C# header (`StudioBridgeDtos.Generated.cs` :3 and :20);
  - my recomputation.

  It appears at `bridge-contract-generator` :571 and :574 and at `bridge-p14b5-relationships:385`.
- **Older-roster digests.** Both recompute exactly by the pins' stated method, and each method first reproduces its base
  pin (see "Digest recomputations").
- **OUTGOING_56.** Its value, 349b2d3e…fcec1, equals the base schema identity and the step-4 roster's projection-v56
  key.
  - Four files declare it: `bridge-p14b5-relationships:92`, `bridge-p14b4-runtime47-compatibility:52`,
    `bridge-p14b6-relationship-read-models:102` and `bridge-runtime-checkpoint:210`.
  - Five full-roster lists use it: `bridge-p14b5-relationships` :388 and :437, `runtime47` :212, `read-models` :796,
    and `bridge-runtime-checkpoint:998`.
  - The last list sorts it between `2c377b6f…` and `510f08e4…` and equals the 45 step-4 keys.
- **Sizes.** The roster size is 45 at `bridge-p14b8-waiver-surface:788` and `bridge-p14b6-relationship-read-models:799`.
  The older length is 44 at `bridge-p14r2r3-prior55:182` and `bridge-p14p4p5-opportunities:511`.
- **P1.** All 75 rows move 56 to 57 and nothing else, though N-0285's line also carries N-0286's S2 move of 43 to 44.
  - Apart from P4's two deferred pins (finding 9), no projection-56 pin remains.
  - Six comments still name projection 56: `bridge-contract-generator` :561 and :720 (P4's provenance),
    `bridge-p14b5-relationships` :382 and :384, `bridge-p14r2r3-prior55:12` and `bridge-runtime-checkpoint:208`.
- **P3.** The key list at `bridge-p14b6-relationship-read-models:407` equals `StudioRelationshipRow`'s eight keys, sorted
  (`bridge/schema/bridge-schema.ts:2800-2815`).
- **P4.** Deferred (finding 9).

**9. Titles (P5): MET WITH EVIDENCE.**
- **The renames.** The patch renames 17 titles: G1 5, G3 1, G4 10 and G5 1. Each handback records old and new, and the
  texts match the patch.
- **Retained identities.** No renamed title, old or new, matches one of 1348-I's 85 core identities or 1348-I2's 3 UI
  identities. No file with a renamed title holds any of them.
- **Left alone.** The titles that still name 43 or 56 fall into two groups:
  - historical: the V43 migration, funded weeks and the exact49/56 filters;
  - ruled: the prior55 "current56" describe, under F10 ruling 7.

**10. Classification integrity: NOT MET (findings 1 and 3).** Apart from the gaps, the rows are exact.
- **Counts.** The script read all 717 rows: H 63, G1 83, G2 59, G3 104, G4 120, G5 115, G6 104, F1 22 and F2 47. G3,
  G5, G6 and F2 state their counts, and each matches. G3's 104 objects carry 103 rows.
- **New text.** Every row's `new` text sits at its stated line in its unit's commit: 717 of 717.
- **Old text.** It sits in the unit's base for 695 rows. The other 22 carry old text the notes explain:
  - descriptive text: N-0263's new constant and F2's 18 N-0468 refusal rows;
  - F2's round-1 text: F11-4 to F11-6.
- **Line numbers.** They follow each unit's commit, as 1344-D4 found for Save43:
  - 606 rows sit on the same HEAD line;
  - 99 moved with later commits in their file;
  - F1 or F2 rows replaced 12 G5 rows.
- **One edit in substance.** F2's N-0468 rows cover the 18 refusal lines and the column. The 15 `corrupt` lines that
  the column reshaped, and the `it.each` signature at :234, ride with them without rows of their own.
- **Patches.** Each staged `patch.diff` equals its branch: H 8b2e33e6, G1 9b4104a6, G2 5dd89ed6, G3 ec9efbec, G4
  e4af1e3e, G5 47b9322c, G6 f49c8210, F1 cfca2f8b and F2 79be0202. r1's patch equals `step4..8144c0c` (cbc8ee00), and
  X7t's equals `step4..2ea399c` (81cba89c).
- **The hand check.** All 58 rows (list below) match file, line, old text, new text and class.
- **Census coverage.** 43 of the 685 census rows have no classification row:
  - 14 edited S5 rows (finding 1);
  - 2 P4 rows (finding 9);
  - 27 no-edit outcomes: 20 S9, 5 S10, N-0096 (S8) and N-0198 (P2).

  The record holds the 27 outcomes only across X6, X7t, F10, F11 and `parent-notes.md`.

**11. The handbacks' open items: MET WITH NOTES (finding 2 stays open).**
- **H.**
  - N-0041: F10 ruling 1, F2's helper and X7t.
  - H-new-1: finding 2.
  - H-new-2 and H-new-3 are `p14p3-directing-promises` :361 and :438, the same sites as G5-new-5 and G5-new-6: F1's
    pins.
- **G1.**
  - N-0101 to N-0105 and N-0096: X6 shows the Save43 shelving refusal and the own-field guards unchanged.
  - N-0140: F11 ruling 6, with probe 4.
  - G1-new-1: F2's pins at `p14c2s-scientist-retirement` :287-288.
- **G2.**
  - The label of G2-new-1: F10 ruling 7.
  - The object-store disclosure: F10 ruling 10.
  - The F10 schema source: X8's run of the generator test decides it.
  - The stale citation at `bridge-runtime-checkpoint:435`: F10 ruling 7.
  - P4: finding 9.
- **G3.**
  - The prior55 title: F10 ruling 7.
  - Who measures S5: F10 ruling 1 and F11 ruling 7.
  - The draft's form: it landed as 99ced62.
  - G3-new-1: X8.
- **G4.**
  - G4-new-1 to G4-new-4: F1's and F2's pins after X6.
  - N-0367 to N-0369: X6 logged the V39 message, so no edit.
- **G5.**
  - N-0454 and N-0455: dropped (F10 ruling 6).
  - G5-new-7: finding 2.
  - The probe-only S9 sites: X6, then F1's and F2's pins.
  - The p12 pin: F10 ruling 8, and X8 runs it.
  - The S9 cover chain: F1, F2 and 8559440.
- **G6.**
  - The S5 draft: F11 ruling 7.
  - N-0656: X8.
  - G6-new-4 and G6-new-5: open (finding 2).
  - G6-new-1 to G6-new-3: F10 ruling 7.
- **F1.**
  - D12's builder placement follows F11 ruling 1. F1 invites another placement, and I see no reason for one.
  - The staged inputs: F11 ruling 3, with findings 4 and 5.
  - The stale cover pointers: closed (check 5).
  - The pre-existing findings: F11's closure findings (:64).
- **F2.**
  - The V39 cover naming: finding 6.
  - The extensionUsed branch: F11 closure (:65).
  - The N-0468 observations: F11 closure (:66).
- **Never raised.** `p14c2rm-writer-continuation:312` (finding 3) and the F11 ruling numbers (finding 6).

## Rows sampled (58 by hand; lines are each unit's commit)

Systematic, every 17th row of the 717 (indexes 0, 17, …, 714; 43 rows):
- **H:** N-0001 S1 `helpers/p14b2-fixtures:7`; N-0017 S2 `helpers/p14c3-genuine-evidence-fixtures:17`; N-0032 S1
  `helpers/p14p3-fixtures:112`; N-0051 S1 `p14c3-save-v38:410`.
- **G1:** N-0066 S2 `bridge-p14b5-relationships:387`; N-0082 S6 `bridge-p14b6-relationship-read-models:293`; N-0100 S1
  `p14b5-relationships:1364`; N-0119 S2 `p14b9-save-v42:214`; N-0136 P5 `p14d1-rival-shelving-save-v43:82`.
- **G2:** N-0156 P1 `bridge-p10a-w0-people-projection:322`; N-0173 P1 `bridge-p13b-s5-adoption:252`; N-0200 P2
  `bridge-runtime-checkpoint:210`; N-0206 P1 `bridge:167`.
- **G3:** N-0223 S2 `bridge-p14a2-market:809`; N-0240 P1 `bridge-p14b2-trust:140`; N-0257 S1
  `bridge-p14b4-cast-class:25`; N-0274 S2 `bridge-p14c2rm-runtime:96`; N-0294 P1 `bridge-p14p3-directing-promises:358`;
  N-0314 P2 `bridge-p14r2r3-prior55:175`.
- **G4:** N-0332 S3 `construction-save-v11:554`; N-0349 S1 `p09a-w0-founding-regime:151`; N-0370 S2
  `p13b-s3-save-v23:121`; N-0387 S2 `p13b-s8-save-v27:187`; N-0404 S1 `p14c2b-save-v36:130`; N-0421 S1
  `property-state-v13:65`; N-0438 S2 `ui/src/saves.test.tsx:126`.
- **G5:** N-0459 S1 `p08a-w0-studio-history:465`; N-0480 S1 `p14c3-canonical-rival-history:10`; N-0500 S1
  `p14c3-profession-history:280`; N-0517 S1 `p14c3-queued-writing-proof:62`; N-0539 S2 `p14p4p5-opportunities:325`;
  N-0559 S4 `p14p4p5-screenplay-status:320`.
- **G6:** N-0579 S1 `c2a-m2-sets-save:32`; N-0594 S1 `construction-core:497`; N-0611 S1 `legacy-parcel-ground:49`;
  N-0628 S1 `p14b3-reservations:201`; N-0646 S1 `p14bf2-acting-discipline:418`; N-0665 S1
  `p14p4p5-grouped-witness:71`; N-0684 S1 `p14p4p5-writer-resources:50`.
- **F1:** N-0533 S9 `p14p3-directing-promises:756`.
- **F2:** F2-new-3 S9 cover `p14c2s-scientist-retirement:15`; N-0468[13] S8 `p14c2rm-writer-continuation:217`; F11-4
  S9 comment `p14c3-cohort-transition:287`.

Targeted at less obvious live inputs (indexes 15, 20, 75, 159, 182, 190, 197, 236, 331, 332, 333, 399, 426, 428 and
492; 15 rows):
- **H:** N-0015 S2 `helpers/p14c3-fixtures:136`; N-0020 S2 `helpers/p14c3-history-boundary-fixtures:26`.
- **G1:** N-0074 S1 `bridge-p14b6-d2-withheld-employment-claim:86`.
- **G2:** N-0162 S2 `bridge-p13b-r07-setup:587`; N-0185 S2 `bridge-process-restart:797`; N-0192 S2
  `bridge-runtime-checkpoint:272`; N-0199 S2 `bridge-runtime-checkpoint:785`.
- **G3:** N-0238 S2 `bridge-p14b2-checkpoint:93`.
- **G4:** N-0340, N-0341 and N-0342 S2 `film-chronicle` :911, :922 and :923; N-0412 S1 `p14c4-save-v35:277`; N-0439
  and N-0441 S2 `ui/src/session.test.tsx` :332 and :387.
- **G5:** N-0516 S2 `p14c3-queued-writing-proof:28`.

43 of the 58 rows are S1 or S2 (check 2). A script also matched every anchored pin the patch adds against the probe
messages (check 5).

## Digest recomputations

`S/1358-sweep/review/d9-recompute.py` reproduces all three groups below. It reads the worktree through `git show` and
the 1221 captures by exact path.

**Schema identity.**
- **Method.** I took the sha256 of the key-sorted compact JSON of `bridge/schema/project-studio-bridge.schema.json`,
  using Python `json.dumps(sort_keys=True, separators=(',', ':'), ensure_ascii=False)`.
  - This mirrors `schemaIdentity` (`bridge/schema/canonical.ts:22-24`) over `canonicalJson` (:3-16).
  - The schema holds no float, so number formatting agrees with JavaScript's.
- **Base 24f631b (402,347 bytes, file sha256 8b9ba657…).** The identity is
  sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1. It equals the base manifest and
  `OUTGOING_56`.
- **Step 4 (403,927 bytes, file sha256 032d261c…).** The identity is
  sha256:74826ef419bfa816647b3de156de3e24fb50327879e207c844c1e1a12b9c1253. It equals the step-4 manifest, the C# header
  and the three test pins.

**Older-roster digests.**
- **Method.** The pins state it at `bridge-p14p4p5-opportunities:499-508`:
  - parse the literal pairs of `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` in `bridge/runtime-checkpoint.ts`;
  - resolve its three named constants (`ACCEPTED_P12_SCHEMA_ID`, `R05_NATIVE_FOUNDING_SCHEMA_ID`,
    `PREVIOUS_BRIDGE_RUNTIME_PROTOCOL_4_SCHEMA_ID`);
  - drop OLD_SCHEMA and sort by key;
  - take the sha256 of `json.dumps(older, separators=(',', ':'))`.

| Pin | OLD_SCHEMA | Base: length, digest | Step 4: length, digest |
|---|---|---|---|
| `bridge-p14r2r3-prior55:183` | 2c377b6f… (projection-v55) | 43, 11ec9999e052d8e6ce6dbdbb08060d57ad3a7dbb45335182c85806c4d88e4e51 (the base pin) | 44, d25c64254ac090a8470cc43b2f02740e149b6f29f75966ba4d2d1684b26654a6 (the patch's pin) |
| `bridge-p14p4p5-opportunities:512` | 9c5bba3f… (projection-v54) | 43, f62253f540a1b498e953cfb22b9558ca70131a14ef4754352457e75d0f6c13da (the base pin) | 44, afae82e478438adcd177592fca60fc283c0e73bdc5eefc1101a8115de28cce58 (the patch's pin) |

- **The roster.** It holds 44 entries at base and 45 at step 4. The one change adds
  `[sha256:349b2d3ec0614f2c9a6c481888e826651c230c6bcc9c84b2b13a82b566bfcec1, 'projection-v56']`; no key leaves and no
  label changes.

**The 1221 capture pins (check 6).**

| File | sha256 |
|---|---|
| MANIFEST.json | 02115df5d6e7d4c33284b9a439a7c79601e1b2e807f4fa96c20149f5c84186f3 |
| director-bound-week52, gzip | b894a85ffad37378f93dc8a8e83bad926ab7a1bb857dd76e9b9926b520fec6e1 |
| director-bound-week52, raw | eae34cd10d457ad551028f3d0a160a55a74d5153b73653b257dc89a4338b040b |
| director-waived-week61, gzip | 95ca93ba0a0f16b1c11ad34960a9617217685a681e8ad27ebf896e75f1debb0e |
| director-waived-week61, raw | ad25e44bde2ec18bef17a37a252de4ee9323dd0d7b50dbdaf424be50a5d9abce |

All five equal the loader's pins and Q04's.
- **The manifest.** It records `schema.saveVersion` 39, `schema.projectionVersion` 54 and `schema.schemaId`
  9c5bba3f… (projection-v54).
- **The captures.** They stand at ticks 52 and 61, with 24 and 30 edges, none keyed.

## Required changes

1. **R1, classification (finding 1).** Append rows after each file's last row, so existing indexes hold. Give each row's
   status its deciding run: M2 for the four G6 comparisons it measured, and X8 for the rest.
   - **(a) 99ced62.** Eight S5 call-site rows:
     - N-0272, `bridge-p14c2rm-runtime:61`;
     - N-0280, `bridge-p14c2s-scientist-runtime:141`;
     - N-0282, `bridge-p14c3-promise-digest-continuity:164`;
     - N-0292 and N-0296, `bridge-p14p3-directing-promises` :140 and :376;
     - N-0301 and N-0307, `bridge-p14p4p5-opportunities` :99 and :519;
     - N-0317, `bridge-p14r2r3-prior55:201`.

     Six S5 helper rows:
     - `bridge-p14c2rm-runtime:51-54`;
     - `bridge-p14c2s-scientist-runtime:40-42`;
     - `bridge-p14c3-promise-digest-continuity:99-102`;
     - `bridge-p14p3-directing-promises:73-76`;
     - `bridge-p14p4p5-opportunities:63-66`;
     - `bridge-p14r2r3-prior55:148-152`.
   - **(b) a309b54.** Five S5 call-site rows:
     - N-0652, `p14p4p5-casting-reservation:209`;
     - N-0656, `p14p4p5-cross-owner:107`;
     - N-0659, `p14p4p5-delayed-retirement:189`;
     - N-0668, `p14p4p5-queued-project-outcome:186`;
     - N-0677, `p14p4p5-scenery-capacity:202`.

     Five S5 helper rows, in the same files: :45-47, :44-46, :47-49, :47-49 and :43-45.
   - **(c) d8be757.** N-0140, S5, `p14d1-rival-shelving:560-568`, decided by probe 4.
   - **(d) 8559440.** One comment row, `p14b5-relationships:1396-1398`. Optional.
   - **(e)** Mark the 14 census rows closed wherever the landing record keeps the deferred lists.
2. **R2, `p14c2rm-writer-continuation:312` (finding 3).** Add an S8 row, then do one of two things:
   - pin `/validateSaveV36: talentMarket\.cases\[25\] is a retirementExtension case for authored-0000, who holds no retirement record$/`
     with a `// save.ts:10295` note, the N-0468[01] pin on the identical input;
   - record the site under R3's disposition.
3. **R3, one parent ruling on F10 ruling 2's S8 rows (finding 2).** Either adopt "measured, no pin" or order the pins.
   - The ruling covers H-new-1, G5-new-7, G6-new-4 and G6-new-5, plus R2's site if it stays unpinned.
   - To adopt "measured, no pin", cite X6's 173 cases, none a version refusal.
4. **R4, the receipt cover's shelving values (finding 4).** At `p14d1-rival-shelving-save-v43:247`, write the engine's
   values:
   - `retryWeek: 130 + TUNING.HOLLYWOOD_SHELVED_RETRY_WEEKS` (156);
   - `commissionHoldUntilWeek: 130 + TUNING.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS` (143).

   `TUNING` is already imported (:42 casts it), and step 4's `TUNING` carries both keys. Alternatively, the parent rules
   the hand-set values acceptable, and the comment at :251-255 says the validator admits the shelved entry and hold,
   which the engine does not write. Either way the pin at :256 holds.

## Recommended, not required

- **N1 (finding 5).** Reword `p14r3-save-v41:383-385` to say the staging applies the release law's seat, cap,
  Scientist and promise tests and skips its slot-retention and reserve tests. Adding the reserve test is cheap:
  - `operatingReserve` is `rivalWeeklyOperatingCost(b, h, week) * b.policy.reserveWeeks` (`hollywoodTick.ts:60-62`);
  - `rivalWeeklyOperatingCost` is exported from `src/core/hollywood.ts:106`.

  Slot retention would need the strategy's slot loop, so the comment is the practical fix.
- **N2 (finding 6).** Fix the citations:
  - change ":331" to ":336" in the seven comments;
  - renumber the four F11 citations in `p14p3-directing-promises` (:102, :476, :744 and :750) to the published rulings.

  Or extend F10 ruling 7 to them explicitly.
- **N3 (finding 7).** Have `p13b-s8-save-v27:188-192` name the arms:
  - the receipt arm (`save.ts:8833`) as the covered arm;
  - the finance arm (`save.ts:8848`) as unreachable on a valid save.
- **N4 (finding 10).** Carry the duplicate-receipt leaf (`p14d1-rival-shelving-save-v43:168-181`) to the 1358 closure
  as a finding outside the sweep.
- **N5 (check 10).** Give the landing handback one disposition table for the 27 no-edit census rows, the way 1344-C5
  numbers its open items.

## Not required

- `save.test.ts:288` keeps a bare `.toThrow()` on the sentinel. Only the dispatcher can throw there (check 3).
- The week-93 title (`p14d1-rival-shelving:553`) still says "migrated by convertV42ToV43", while the body also lifts
  through `convertV43ToV44`. P5 does not cover that wording.
- Pre-existing trailing comments that name old versions on moved lines can stay, as 1344-D4 left the
  "LIVE_SAVE_VERSION === 42" title over a `toBe(43)` body. Two examples:
  - `ui/src/saves.test.tsx:126` ("current C.3 writer: SaveFileV38.");
  - `p13b-s8-save-v27:186` ("LIVE_SAVE_VERSION is 28").
- D12's capture holds an open promise-1 beside the WAIVED promise-0, so the leaf cannot show that the WAIVED promise
  alone blocks the builders. `assertNoDirectorPromises` ignores outcome (`save.ts:10557`), so the WAIVED promise alone
  would refuse too.
