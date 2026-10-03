## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. All three type gates pass and there is no new G2 failure. Reached equality and migration assertions pass. The standing bridge-p14b2-trust fixture failure still prevents its later assertion from running; R8 remains a retained failure.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit G2 handback (1361-N)

I edited the 25 Bridge test files in the plan's G2 table and no others. `patch.diff` is `git diff HEAD -- tests ui`: 925 lines, +163 and -92, uncommitted in the tree, on top of H. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.

## Apply check

    GIT_INDEX_FILE=/tmp/G2-index git -C <repo> read-tree HEAD && GIT_INDEX_FILE=/tmp/G2-index git -C <repo> apply --cached <H>/patch.diff && GIT_INDEX_FILE=/tmp/G2-index git -C <repo> apply --check --cached <G2>/patch.diff; rm -f /tmp/G2-index
    exit 0, no output

Checks that need no run: `git diff HEAD --check` is clean. Every changed line keeps its paren, bracket and brace balance. No `validateSaveV44` or `toBe(44)` remains in the 25 files. The diff holds no mode change, and all 25 files are regular files (no write went through a link).

## What changed

The plan lists 92 edit lines (S1 32, S2 51, S5 9). I edited all 92 and added 8 lines it does not list (7 helpers and 1 comment). `rows.json` holds 100 entries. Its `rowIds` and `typeRowIds` cover all 144 rows (139 core, 5 type).

- **S2, 51 lines.** `toBe(44)` becomes `toBe(45)`. Labels and trailing comments stay (`bridge-p14b8-waiver-surface:817` keeps 'P3: each historical slot reaches actual live Save39'). `bridge-runtime-checkpoint:439` keeps its regex pin and takes the measured message, `/canonical V45 save bytes exactly/` (`bridge/runtime-checkpoint.ts:505`, `m2-core.txt:6995`). `:785` serves 45 `it.each` rows. `bridge-process-restart` :797 and :799 serve the rethrow at :897.
- **S1, 32 lines.** `validateSaveV44` becomes `validateSaveV45` at 11 imports and 21 calls in 11 files. `bridge-p14p3-directing-promises:81` and `bridge-p14p4p5-opportunities:72` take both edits on one line (counted under S2).
- **S5, 9 compares in 7 files.** Each file carries its own literal `withEmptyP15Roots(state, week)` (ruling 3), 10 lines in H's wording, beside its other era helpers. The compare wraps the existing chain as `withEmptyP15Roots(<chain>, <week>)`. The week comes from the input state's own `market.tick`: `week` at `bridge-p14c2rm-runtime:61`, `bridge-p14c2s-scientist-runtime:141` and `bridge-p14c3-promise-digest-continuity:164`; `save.state.market.tick` at `bridge-p14p3-directing-promises:140`; `previous.state.market.tick` at p14p3:376, `bridge-p14p4p5-opportunities:519` and `bridge-p14r2r3-prior55:201`; `old.state.market.tick` at p14p4p5:99. Every compared state is migrated and never ticked.
- **`bridge-p14b2-checkpoint:93`** carries S2 and S5 on one line. The stamp becomes 45, and the helper applies to the input spread, `{ ...withEmptyP15Roots(source.state, source.state.market.tick as number), relationships: [], ... }`. The plan's one line stays one line. The result equals the outer wrap under `toEqual`. A comment line above it records the move, because the line above says "Save44 stamps 44".

## Type sites cleared (5 sites, 5 errors, Bridge gate only)

| Site | Code | Edit |
|---|---|---|
| `bridge-p14b2-trust(470,79)` | TS2379 | :468 rename, import :24 |
| `bridge-p14p3-directing-promises(378,12)` | TS2379 | :374 rename, import :27 |
| `bridge-p14p4p5-opportunities(520,77)` | TS2379 | :518 rename |
| `bridge-p14p4p5-opportunities(525,17)` | TS2379 | :523 rename |
| `bridge-p14p4p5-opportunities(526,17)` | TS2379 | :524 rename, import :20 serves all three |

Each error comes from `validateSaveV44(...).state` (the message names `GameStateV40`) entering a helper that takes the live `GameState`. After the rename, `.state` is the V45 state. The edit follows the error text in `m2-tsc.txt:122-130`; the gate itself needs a run.

## Title renames

None. The plan's T list holds no G2 file.

## Where the plan is off

- It counts one edit line per S5 compare. Each of the 7 files also needs its helper (10 lines), and `bridge-p14b2-checkpoint` takes one comment line. H found the same gap. The patch adds 8 blocks that the line count omits.

## What I am unsure of

- 8 of the 9 S5 compares have no M2 row, because an S1 or S2 failure stops each test first. `bridge-p14c3-promise-digest-continuity` has one: M2's first differing key is `campaignLegacy` (`m2-core.txt:6581`). I took the form from ruling 3 and the value from `convertV44ToV45` (`save.ts:10980-10984`). Probe P6 must show equality and each root at the input week.
- `bridge-p14c3-runtime:178` passes the V45 `saved` to `migrateToV38`, which routes through `convertV45ToV44` (`save.ts:10588`). Both slots come from a checkpoint load at weeks 208 and 207 with no tick, so I expect empty roots and success. The plan lists no S4 or S9 site here. P4 should confirm.
- `bridge-p14b2-trust:424` is edited, but its test calls `rivalFixture`, which fails with the standing 1358-I primary at `helpers/p14b2-fixtures.ts:264`. The line cannot run until that row passes.
- The two retained identities in my files (the `bridge-p14b2-trust` "ignores real withdrawn unbound drafts" row and R8 in `bridge-p14c3-runtime`) get no edit (ruling 8). `deferred.md` section C records what each must show after H.

## Deferred

0 planned lines. The 9 "measure" lines are edited (section B of `deferred.md` lists what each run must show).

## Disclosures

- One added line holds a non-ASCII character: the em dash in the unchanged trailing comment of `bridge-p13b-r07-setup:587`. The other 162 added lines are ASCII.
- I used python3 to read the classification JSON, to apply the edits with an exact-text assertion on every line, and to write `rows.json`. The scripts (`g2_edit.py`, `g2_rows.py`) sit in the session scratchpad, not in the tree.
- I read the M2 logs with `grep -n` and `sed -n` only. I opened no fixture file and no Owner save.
- In the repository I ran only the apply check's `read-tree` and `apply`. In the tree I ran `diff`, `status` and `log`.
