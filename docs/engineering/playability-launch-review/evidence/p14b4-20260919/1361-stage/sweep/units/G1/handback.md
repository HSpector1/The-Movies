## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch-r2.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. The scientist S9 pins pass for both sequential converters. All other retained patterns and reached equality/strip controls pass. The reader-only Scientist exception remains exactly the F8 ruling; it grants no write or tick permission.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit G1 handback (1361-N)

I edited the 15 files in the plan's G1 table and no others. `patch.diff` is `git diff HEAD -- tests ui`: 819 lines, +245 and -57, on top of H, uncommitted in the tree. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.

## Apply check

    GIT_INDEX_FILE=/tmp/G1-index git -C <repo> read-tree HEAD && GIT_INDEX_FILE=/tmp/G1-index git -C <repo> apply --cached <H>/patch.diff && GIT_INDEX_FILE=/tmp/G1-index git -C <repo> apply --check --cached <G1>/patch.diff; rm -f /tmp/G1-index
    exit 0, no output

`git diff --check` is clean, the 68 hunks balance their brackets, no added line holds a new non-ASCII character, and all 15 files are regular files (no write went through a link).

## What changed (61 of the plan's 67 edit lines)

- `facility-move-demolish`: V45 at the import and :781. `forgedV11` (:869) asserts `p15Rows` empty and `p15Sequence.next === 1`, then strips the roots with `stripP15` (ruling 4). The world comes from `generateWorld`, which holds no industry.
- `p13b-r07-save-v25`: the same S7 guard and strip in `asV25Envelope` (three ticks, no quarter). The sentinel moves 45 to 46 (:274) and the pattern to `/versions 1 through 45 only/` (:275).
- `p14b3-rule-revision`, `p14bf2-acting-discipline`: V45 at the import and each call (3 and 5 lines). Each file carries a literal `withEmptyP15Roots(state, week)` (ruling 3) and the expected side takes it at the input's own tick (:174, :366).
- `p14b4-save-v30-compatibility`: the same helper at :216, and `toBe(45)` at :252.
- `p14b5-relationships`: V45 at the import, :1315, :1364 and :1445 (S1), and :1299 and :1321 (S8, patterns kept). `validateRelationshipsRoot(save.state, 44)` keeps era 44, with a comment. `bytes()` gains the P15 guard and `stripP15` (S10). `FROZEN.postTakeDigestStripped` stays `9702aa68...`.
- `p14b9-save-v42`: S1 on the type import, the typed member and :215. Typed `convertV44ToV45` and `convertV45ToV44` members join the `mods` block. The hand lift (:192) ends with `convertV44ToV45`. Pins move to 45 at :214 and :229, the sentinel range to 1 through 45 at :233. `convertV45ToV44` leads the :223 chain, pattern unchanged.
- `p14c1-materialized-aging`: `liftForTick` ends with `convertV44ToV45` (:178), which serves all 17 ticking rows. `toBe(45)` at :1033.
- `p14c2s-scientist-retirement`: `toBe(45)` at :256, :267, :277 and :356. The reader-only relabel (:325) strips the four roots through `stripP15`, unconditionally, with a comment citing 1361-F8 ruling 1. The state lawfully holds quarters 533, 546 and 559, so no `p15Rows` guard applies.
- `p14d1-rival-shelving`: V45 pins at :187, :994 and :995. The week-93 control (:618) follows ruling 5: no assessment, unfrozen Legacy, `validatePowerRankingArchive` and `validateP15Allocator` pass, then the four roots come out of the candidate. The genuine side keeps its V44 lift. The control names the four keys in the file, not through the helper's list, so a later P15 root fails it until its own check joins (the parent confirmed this).
- The five `p14p4p5-*` files (casting-reservation, cross-owner, delayed-retirement, queued-project-outcome, scenery-capacity): V45 and `toBe(45)` on the `admitted` line, a literal `withEmptyP15Roots`, and the expected side at week 45.

## Type sites cleared

None. The plan gives G1 no type site. The typed `convertV44ToV45` member at `p14b9` is the one new type surface.

## Title renames (4)

Each old identity equals the M2 identity of the row it serves (`rows.json` carries both in full).
- `p13b-r07-save-v25` > P13B-S5-R07 Save V25 (test 5): "an unknown saveVersion 45 is refused, naming the handled range "1 through 44 only" (...)" becomes "an unknown saveVersion 46 is refused, naming the handled range "1 through 45 only" (...)".
- `p14b9-save-v42` > LIVE_SAVE_VERSION and the dispatcher message: "LIVE_SAVE_VERSION is 44" becomes "LIVE_SAVE_VERSION is 45".
- Same describe: "... unknown-version message ("1 through 44")" becomes "... ("1 through 45")".
- `p14d1-rival-shelving` > API decisions this file exercises (...): "save.ts LIVE_SAVE_VERSION is 44, and validateSaveV43/..." becomes "save.ts LIVE_SAVE_VERSION is 45, and validateSaveV43/...".

## Deferred (7), see `deferred.md`

The S9 lines `p14b5` :1400, :1417, :1432, :1453 and `p14c2s` :287, :288 stay unchanged. M2 never reached them, and the plan predicts no pattern moves at p14b5 and a P15 refusal at p14c2s. The pin half of `p14b9:223` stays, with its S4 insert made.

## Where the plan is off

- **`p14c2s:325` (S7, certain) collided with the plan's own S9 note.** `scientistAt('hardIdle', 566)` ticks the week-520 corpus past quarters 533, 546 and 559, so the archive holds three records and ruling 4's guard would have turned the leaf red. The parent ruled (1361-F8 ruling 1) that this reader-only control strips the roots unconditionally, as it already does for `firstTakeSubjects` and `romance`. I applied that.
- The plan counts 67 edit lines. The patch adds 8 helper blocks, 4 `p15-roots` imports, one `validatePowerRankingArchive` import, a typed member at `p14b9` and 1361-N comments. Each follows a ruling or a type need.
- The S7 and S10 classification rows keep their pre-ruling-4 wording (H noted the same). The patch follows ruling 4.

## What I am unsure of

- No M2 message exists past the first failure at most lines. The S5 comparisons (:174, :216, :366, five p14p4p5 files) hold only if the four empty roots at the input's week are the whole difference (P6).
- tsc did not run. The new code mirrors patterns the files already use: a generic `withEmptyP15Roots<T extends object>`, `stripP15(state) as Record<string, unknown> & {...}` at `p14b5:331`, and a named-key destructure at `p14d1`.
- The `p14b5` S8 renames (:1299, :1321) assume `validateSaveV45` reaches the same relationships guard as Save44 (`save.ts:10970`). P5 confirms.
- The 17 `p14c1` rows now tick a Save45 state. A leaf that compares a ticked state byte for byte may meet a quarter record. That reads as S10 or a defect, never an expectation edit.

## Disclosures

- I read the plan, rulings, brief, H's handback and rows, and the classification JSON with python3 and `Read`. I read the M2 logs with `sed -n` only. `g1_rows.py` (session scratchpad) wrote `rows.json`.
- Git in the repository: the temporary-index check only. In the tree: `diff`, `log` and `status`.
- I ran `stat` on the five link entries and the `tests/fixtures` directory. I opened no fixture file and no Owner save.
