# 1358-D9b: delta check of sweep revision r3 against 1358-D9 and 1358-F12

**Summary.** I checked revision r3 read-only and finished this text on 2026-10-02 at 09:01 CDT.
- **The tree.** Branch `sweep-r3` (HEAD 7e7a065) in the merge worktree adds two commits to D9's sweep-x8 (8559440):
  0bc0a46 (R2, R4 and N1 to N3) and 7e7a065 (F12 ruling 7). Together they change 11 test files, +35/-20.
- **The patch.** `E/1358-stage/sweep-r3/1358-sweep-r3.patch` has sha256
  d2e89b4689f3462994a9651d8662ac7fafee6cd0e7066e49b4e616a09a51d107. It is byte-equal to
  `git diff step4 sweep-r3 -- tests ui`: 154 files, +1,057/-679.
- **Where it applies.** At repo HEAD 97690eeb all 154 files still carry their `step4` blobs, so the patch applies there
  as text. Repo HEAD's `src` and `bridge` trees still equal base 5245072a's, so the patch still needs step 4 r2
  underneath.

r3 closes R2 and R4 exactly, and N1 to N3 cite correctly. F12 ruling 7's edit is type-sound and its reasoning holds.
F12 ruling 8's cause checks out by reading. The parent's 44 classification rows match their commits line for line and
cover every line those six commits add or remove.

One new defect: an r2 comment in the week-93 leaf (`p14d1-rival-shelving:565-567`) now says the opposite of what the
r3 code does. It changes no assertion.

**Verdict: CONFIRMED.** I recommend the one-line comment fix in D9b-N1, which does not block.

**Method and limits.**
- **Tools.** The same as D9: read-only git in the merge worktree, `rev-parse` and `hash-object` (without `-w`) in the
  repo, and Python 3.
- **Runs.** None.
- **Fixtures.** I read one file under `tests/fixtures`, by exact path:
  `tests/fixtures/bridge-contract-union-fixtures.ts`. Every search used `git grep` with
  `':(exclude)tests/fixtures'`.
- **Evidence read.** 1358-F12, the 1358-X8 record and its `core-vs1348I.json`, `core.txt.gz` and `probe-lines.txt`,
  probe 4's patch, X9t's file list and script v2.
- **Not read.** X9t's outputs, which exist under `S/1358-sweep/x9t`.
- **Writes.** This file only.

## The six checks

**1. R2: MET.** `p14c2rm-writer-continuation:313` pins
`/validateSaveV36: talentMarket\.cases\[25\] is a retirementExtension case for authored-0000, who holds no retirement record$/`
under a new comment at :312.
- **The regex.** It is byte-identical to N-0468 case 1's `refusal` (:185). Both cite `save.ts:10295`.
- **The measurement.** It matches X6's measured case-1 message ("validateSaveV37: state is invalid … validateSaveV36:
  talentMarket.cases[25] is a retirementExtension case for authored-0000, who holds no retirement record").
- **The input.** It is unchanged from r2 (:305-311 compare equal). It equals case 1 as the `it.each` applies it: the same
  `corrupt` (:183-184) on `finishingWriter().finishing` and `f.writerId` (:235 against :306-308).
- **A note.** The same regex also matches one other N-0468 case's message. This is F11's closure finding that cases 1 to
  3 refuse at a record-level guard, and it does not touch R2.

**2. R4: MET.** At `p14d1-rival-shelving-save-v43:249-250` the cover writes
`retryWeek: 130 + TUNING_FUTURE.HOLLYWOOD_SHELVED_RETRY_WEEKS` and
`commissionHoldUntilWeek: 130 + TUNING_FUTURE.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS`. Those are 156 and 143, the
engine's own writes (`hollywoodTick.ts:279-280`). The comment at :247-248 cites those lines.
- **The cast stays sound.** The cast at :42 widens `TUNING_FUTURE` to three number keys.
  - `TUNING` is one `as const` object (`tuning.ts:27-1057`), imported through `src/core/index.js` (:21).
  - At step 4 it carries all three keys: `HOLLYWOOD_SHELVE_AFTER_REJECTIONS` 13, `HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS`
    13 and `HOLLYWOOD_SHELVED_RETRY_WEEKS` 26 (:33-35).
  - The double cast through `unknown` type-checks, and every key it declares exists at runtime. A missing key would give
    NaN, which `integer()` would refuse loudly.
- **The pin still holds.** `convertV43ToV42` calls `validateSaveV43` (`save.ts:10736`) and then refuses at the receipt
  guard (:10739-10740).
  - The validator asks only that the retry week follow the shelving week (`hollywoodValidation.ts:365`; 156 > 130) and
    that the hold be an integer (:351).
  - The other reader of the hold, `save.ts:8095`, belongs to the V18-to-V19 lift and is not on this path.
- **Unchanged.** The leaf's other staged fields still match the engine (:246 and :251-252).

**3. N1, N2 and N3: MET.**
- **N1.** The V41 staging comment (`p14r3-save-v41:382-389`) cites the release law at `hollywoodTick.ts:180-197`, which is
  the law's code. It names the seat, cap, Scientist and open-promise tests it applies and the slot-retention and
  operating-reserve tests it skips. It says the guard refuses on the receipt alone (`save.ts:10642-10643`, the
  termination-receipt arm). All accurate.
- **N2.** The seven Q03 comments now cite :336, where Q03's `convertV40ToV39` assertion sits on `sweep-r3`. The four F11
  citations in `p14p3-directing-promises` now use the published numbers: :102, :744 and :750 cite ruling 1 (D13 and D12),
  and :476 cites ruling 4 (G5-new-6). No `Q03 (:331)`, "F11 ruling 2", "F11 ruling 3" or "F11 rulings 1 and 2" remains in
  `tests`.
- **N3.** The V27 masking comment (`p13b-s8-save-v27:188-193`) names the covered receipt arm (`save.ts:8833`) and the
  finance arm (:8848), which cannot fire on a valid save, citing F11's closure findings. Both lines throw the arms named.

**4. F12 ruling 7: the reasoning holds, and the edit is type-sound.** The edit at `p14d1-rival-shelving:610-617` does
two things. It asserts that every candidate edge has an empty `competitions` log (:616). It then compares
`canon(strip(withoutSliceB(state)))` with `canon(strip(genuineState))` (:617), where `withoutSliceB` (:615) sets every
candidate edge to `competitions: []` and `romance: null`. Only the candidate is normalized, and the genuine side stays
as production lifted it.
- **The measurement.** X8's probe 4 logged 24 edges, 0 log rows and 15 romance tracks, with `equalNormalized: true`.
  - Probe 4 normalized both sides with the same map.
  - `convertV43ToV44` applies exactly that map to every genuine edge (`save.ts:10779`), so normalizing the genuine side
    changes nothing. The measured equality carries over to r3's one-sided form.
- **Why I accept it.** The leaf compares the current engine's week-93 state with a genuine Save42 world. The older engine
  ran no romance law, so the genuine input cannot hold tracks, and equality on that field is impossible by construction.
  - What the edit takes out is narrow. The log is asserted empty, never normalized silently, so the edit erases only the
    romance values. Every other field, including each edge's tier, drivers and history, must still match byte for byte.
  - So any side effect of the romance law on other state (RNG, events, other edge fields) would still fail the leaf.
  - This is the treatment the Save43 sweep gave its own root through `strip`.
  - F9 ruling 2 forbids stripping to make a projection chain pass ("refuse rather than strip a current root"). No
    projection chain runs here.
  - Slice B's own romance and labels tests and M2's route comparison measure the tracks themselves.
- **Type soundness by reading.**
  - `GameState` is `GameStateV44`, whose `relationships` is a required `readonly RelationshipEdge[]` (`types.ts:2311`).
  - `RelationshipEdge` declares `competitions: readonly RelationshipCompetition[]` (:2303) and
    `romance: RomanceTrack | null` (:2305).
  - So `e.competitions.length` is valid, and the redundant `?? []` leaves the type unchanged.
  - `{ ...e, competitions: [], romance: null }` stays assignable to `RelationshipEdge`, so `strip(s: GameState)` (:572)
    accepts the result.
  - `withoutSliceB` builds new objects and mutates nothing, so the forward search from `state` (:629 on) still starts
    from the true candidate.
  - X9t's script v2 runs the three type gates (`run-1358-sweep-dry-v2.sh:41`).
- **The new defect.** See D9b-N1: the r2 comment at :565-567 now contradicts this edit.

**5. F12 ruling 8: VERIFIED BY READING.**
- **The relative import.** `tests/fixtures/bridge-contract-union-fixtures.ts` (repo HEAD blob 1da36cbf, equal to the
  file I read) imports `BRIDGE_SCHEMA` from `'../../bridge/schema/bridge-schema.ts'` (:1). Its other import (:2) is
  type-only.
  - F10 (`F10_CURRENT_QUOTE_UNIONS`, :226-229) and F11 (:230-233) both take `schema: BRIDGE_SCHEMA`, the whole current
    schema. This settles G2's open item 3.
- **The artifact.** Neither `vitest.config.ts` nor `vitest.workspace.ts` sets `resolve` or `preserveSymlinks`, so Vite
  resolves a module by its real path.
  - With `tests/fixtures` linked to the repo, the import resolved to the repo's `bridge/schema`.
  - The repo's `bridge` tree at HEAD 97690eeb is 9da338c4, the base tree. Step 4's is faa227af.
  - That matches X8's NEW primary: the rendered C# names `349b2d3e…` beside `ProjectionVersion = 57`.
  - It also explains why X8's P4 leaf passed while proving nothing.
- **No other test imports from `tests/fixtures`.** `git grep` over `tests` (fixtures excluded) and `ui/src` finds one
  module import from `tests/fixtures`: `tests/bridge-contract-generator.test.ts:17`, of this module.
  - The other hit, at `p14b9-save-v42:47`, is a comment.
  - No test or UI file imports from the other linked directories (`docs`, `tools`, `art`).
  - The variable dynamic imports point into `src`: `tests/contracts/_contractFixtures.ts:104` and
    `tests/contracts/_v14Contract.ts:255`.
- **Script v2.** It builds `tests/fixtures` as a real directory of links and copies this one module as a real file
  (`run-1358-sweep-dry-v2.sh:31-35`). So the copy resolves to the tree's step-4 schema.

**6. R1: MET (all 44 rows checked by script, 20 read by hand).**
- **By script.** Every row's `new` text sits as a block at its stated line in its commit and at the same line on
  `sweep-r3`, and its `old` text sits in the commit's parent. 44 of 44 pass.
- **Coverage.** Every non-blank line the six commits add or remove falls under a row:
  - 99ced62: 44 added and 8 removed;
  - a309b54: 31 and 5;
  - d8be757: 8 and 2;
  - 8559440: 3 and 2;
  - 0bc0a46: 27 and 19;
  - 7e7a065: 8 and 1.

  Nothing is uncovered.
- **The census rows.** The 14 census rows carry their ids: the eight G3 call sites (N-0272, N-0280, N-0282, N-0292,
  N-0296, N-0301, N-0307, N-0317), the five G6 call sites (N-0652, N-0656, N-0659, N-0668, N-0677) and N-0140 (three rows,
  across d8be757 and 7e7a065).
- **Helpers.** Six G3 and five G6 helper rows.
- **Statuses.**
  - The G3 and G6 rows read "measured (1358-X8: passes)". X8's per-file results confirm it: each of the eleven files
    passed in full.
  - N-0140's d8be757 rows record probe 4's counts.
  - The r3 rows read "measured in 1358-X9t", which names the deciding run. I did not read X9t's outputs.
- **By hand.** Rows 0, 1, 6, 8, 12, 13, 14, 17, 22, 24, 25, 26, 27, 30, 31, 36, 37, 40, 42 and 43. Each id, class, line
  and note matches the edit.

**Hygiene and strength of the r3 delta.**
- `expect(` goes from 2 to 3 (the log assertion), and `.toBe(` from 1 to 2.
- A bare `.toThrow()` goes from 1 to 0, and a pinned `.toThrow(/` from 0 to 1.
- No added line holds a tab, a trailing space, an em dash, `Math.random`, `.skip`, `.only`, `.todo`, `.fails` or `skipIf`.

## X8 against D9's finding 8

X8 ran r2 and settles what D9 left to it.
- **Totals.** Core shows 94 failures, all attributed: 78 SAME, 7 CHANGED and 9 NEW. The type gates exit 0, and UI equals
  1348-I2.
- **Passed.** These files passed in full:
  - `p14b9-save-v42`, which covers the :186 and :223 pins;
  - `p12-starting-world`, which covers :55;
  - G3's six bridge files and the five G6 p14p4p5 files;
  - `contracts/v14-boundary-guards`, `p06a-w1-release-authority` and `save.test`.
- **G3-new-1** (`bridge-p14c3-runtime:178`) sits inside the "R2 opens53/Save38…" leaf (from :158), which passed. That
  file's one failure is R8's retained timeout (SAME).
- **D13 and D12.** Both pass, and probe 4 logs each builder's refusal: "cannot downgrade or discard an explicit Director
  promise predicate".
- **Still open.** Only the week-93 control failed among D9's items, and r3 settles it. r3 leaves every other finding 8
  file unchanged except for comments, so those results stand.

## Recommended, not required

- **D9b-N1.** Reword the r2 comment at `p14d1-rival-shelving:565-567`.
  - It reads: "The control holds only while the week-93 candidate holds no log row and no romance track."
  - Since 7e7a065 the candidate holds 15 tracks and the control normalizes them, so the sentence is false.
  - A replacement: "The control asserts the candidate holds no log row and sets its romance tracks to the lift's null
    below (1358-F12 ruling 7)."
  - It changes no assertion.

## Observations (no change required)

- **A count in F12.** F12's "Next" says X9t runs "r3's twelve changed files and the generator test". r3 changes eleven
  files, and `x9t-list.txt` holds twelve entries counting the generator test. The list is right.
- **A stale doc comment.** The comment above the cast (`p14d1-rival-shelving-save-v43:40-41`) still calls bare `TUNING`
  access a TS2339 "until tuning.ts adds it". At step 4 `tuning.ts` carries all three keys, so the cast is redundant and
  harmless. The comment predates the sweep.
- **The leaf's title.** The week-93 title (:553) still names only the shelving strip. D9 listed it under "Not required",
  and that stands.
