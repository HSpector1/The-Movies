# Unit H handback (1361-N)

I edited the 16 files in the brief and no others. `patch.diff` is `git diff production -- tests`: 575 lines, +84 and -58, uncommitted in the tree. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.

## Apply check

    GIT_INDEX_FILE=/tmp/h-index git -C <repo> read-tree HEAD && GIT_INDEX_FILE=/tmp/h-index git -C <repo> apply --check --cached <H>/patch.diff; rm -f /tmp/h-index
    exit 0, no output

Checks that need no run: `git diff --check` is clean, every changed hunk keeps its bracket balance, the added lines hold no non-ASCII character, and all 16 files are regular files (no write went through a link).

## What changed

- `contracts/_v14Contract.ts`: `projectToV13State` throws "V13 twin cannot discard P15 authority" when `p15Rows(state)` finds a row or `p15Sequence.next` is not 1. Otherwise it takes the clone through `stripP15`. Both come from `tests/helpers/p15-roots.ts` (ruling 4). An older-era state has no roots and passes. M2's failure for the 25 leaves was `validateSaveV12: state has unknown field "powerRanking"` (`m2-core.txt:2549`).
- `helpers/p14b2-fixtures.ts`, `p14c2c-fixtures.ts`, `p14c2rm-fixtures.ts`: `validateSaveV44` becomes `validateSaveV45` at the import and each call (4, 2 and 2 lines).
- `helpers/p14c3-genuine-evidence-fixtures.ts`, `p14c3-history-boundary-fixtures.ts`, `p14c3-second-episode-fixtures.ts`: `toBe(44)` becomes `toBe(45)`, and the import and call move to V45 (3 lines each).
- `helpers/p14c3-fixtures.ts`: `envelope38` pins 45 with its label kept (:136). The `saveApi` key type becomes `validateSaveV45` (:66).
- `helpers/p14c2b-fixtures.ts`, `p14c4-fixtures.ts`, `p14c3-canonical-rival-fixtures.ts`: `convertV45ToV44` joins the import and leads the chain (2 lines each).
- `helpers/p14p3-fixtures.ts`: `futureSave` types, checks and calls `validateSaveV45`. `convertV45ToV44` gains a typed member, an existence check and the innermost place in the V39-to-V38 chain.
- `p14c3-admission-boundaries`, `p14c3-profession-episodes`, `p14c3-transition-evidence`: each `saveApi('validateSaveV44')` becomes `saveApi('validateSaveV45')` (1, 3 and 5 lines). Every pattern stays exact, `.toThrow(cause)` at :61 included.
- `p14c3-save-v38.test.ts`: 11 key renames, 4 renames on the `straddles ...` refusals with exact patterns, `toBe(45)` at :58, :59 and :77, and the S5 line. The file carries its own literal `withEmptyP15Roots(state, week)` (ruling 3). :92 applies it to the expected side at `week`. :121 stays bare (ruling 9).

## Type sites cleared (5 sites, 13 errors: 5 root, 4 UI, 4 Bridge)

| Site | Code | Gates | Edit |
|---|---|---|---|
| `p14c2b-fixtures.ts(69,138)` | TS2345 | root, UI, Bridge | chain and import |
| `p14c2c-fixtures.ts(29,3)` | TS2375 | root, UI, Bridge | validator and import |
| `p14c2rm-fixtures.ts(24,3)` | TS2375 | root, UI, Bridge | validator and import |
| `p14c3-canonical-rival-fixtures.ts(198,113)` | TS2345 | root | chain and import |
| `p14c4-fixtures.ts(71,120)` | TS2345 | root, UI, Bridge | chain and import |

The key rename at `p14c3-fixtures.ts:66` makes every remaining `saveApi('validateSaveV44')` a type error. All 24 of them (4 files) are renamed, so the patch adds none.

## Counts

The plan lists 61 edit lines. I edited 60. `p14c3-save-v38:121` is the 61st (deferred). `rows.json` holds 63 entries: the 60 lines, the `p15-roots` import, the `withEmptyP15Roots` helper and one comment at `p14p3-fixtures.ts`. `rowIds` are indexes into `rows[]` of the classification. 390 of H's 391 rows tie to an edit. C20 is the one without an edit (ruling 8). `unmasksRetainedRowIds` holds the 7 retained rows.

## Where the plan is off

- The 25 S7 classification rows still carry the edit wording from before ruling 4 (a per-file test of snapshots, assessments, Legacy and `next`). The patch follows ruling 4. A reviewer who compares rows to patch will see the gap.
- The plan counts one edit line each for `_v14Contract.ts` and the S5 compare. Each needs a second hunk: the `p15-roots` import, and a ten-line helper.

## What I am unsure of

- No M2 message exists at the four chain inserts (`p14c2b:69`, `p14c3-canonical-rival:198`, `p14c4:71`, `p14p3:113`), at the S5 compare (:92) or at the five renamed refusal lines. Each edit follows a type error, a ruling or production code (`save.ts:10980-10995`). `deferred.md` section B lists what each run must show.
- If a must-succeed chain refuses, ruling 2 applies: keep the refusal and pick an input with no recorded quarter. I did not strip anything.
- About 103 cases go through the bare `.toThrow()` at :121. P5 decides which need a pin.
- I added 5 comment lines the plan does not list: 2 at `p14c3-fixtures.ts:66` and 3 at `p14p3-fixtures.ts:113`, in the 1344-N and 1358-N style. Without them those blocks still say Save44 is live. Dropping them changes no behavior.

## Disclosures

- I listed `tests/fixtures` once with `ls` to confirm the links. I opened no fixture file and no Owner save.
- I ran one `git branch -a` in my tree. It sits outside the list of allowed git commands and changes nothing.
- I used python3 only to read the classification JSON and write `rows.json`. The script is `h_rows.py` in the session scratchpad, not in the tree.
- I read the M2 logs with `grep -n` and `sed -n` only.
