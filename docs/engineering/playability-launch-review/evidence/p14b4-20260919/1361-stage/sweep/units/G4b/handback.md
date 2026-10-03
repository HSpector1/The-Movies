## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch-r2.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. All eight revised S9 sites pass, including the sequential/loop calls that x2 did not reach. The other two retained pins also pass. D07 and D18 remain the two known rival-winner fixture failures. The termination receipt control covers its own guard; the separate movement-only leaf does not independently prove a movement downgrade guard.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit G4b handback (1361-N)

I edited the 8 files in the dispatch and no others. `patch.diff` is `git diff HEAD -- tests ui`: 513 lines, +104 and -54, on top of H, uncommitted in the tree. I ran no node, vitest, tsc, npm, npx, tsx or vite-node.

## Apply check

    GIT_INDEX_FILE=/tmp/G4b-index git -C <repo> read-tree HEAD && ... apply --cached <H>/patch.diff && ... apply --check --cached <G4b>/patch.diff; rm -f /tmp/G4b-index
    exit 0, no output

`git diff --check` is clean, no added line holds a non-ASCII character, every changed line keeps the bracket balance of the line it replaces (every inserted line balances alone), and all 8 files are regular files (no write went through a link).

## What changed (56 of the plan's 62 lines edited; 10 S9 pins deferred)

- `p14c3-promise-digest-continuity`: `convertV45ToV44` joins the import (:14) and leads the V37 chain (:279).
- `p14c3-queued-writing-proof`: import, stamp and three calls move to V45 (:11, :28, :62, :135, :160). :135 keeps `/intentRulesVersion must be 1/`.
- `p14c3-transitions`: import (:8). `convertV45ToV44` leads both S9 chains (:175, :207). Both pins stay.
- `p14p3-directing-promises`: `toBe(45)` at :370, :443, :468, :1153, :1193. `convertV45ToV44` leads the chains at :417 and :747; the pins at :418 and :748 stay. `invalid` is `typeof bound40` (:425, S6). The D14 compare (:440) takes `withEmptyP15Roots(..., old.save.state.market.tick)` and a 10-line literal helper (ruling 3). The file imports `saves` and `core` as namespaces, so no import line moves.
- `p14p4p5-opportunities`: `FutureAPI` gains `validateSaveV45` and `convertV45ToV44`, with their existence checks (:34-37, :91-92). Pins and calls move to 45 and V45 at :330, :331, :344, :350, :371, :391, :405, :744, :752, :974. `convertV45ToV44` leads the chains at :335, :386, :406 and :827. The Q04 compare (:382) takes `withEmptyP15Roots(..., old.state.market.tick)` and its own helper.
- `p14p4p5-screenplay-status`: `toBe(45)` and `validateSaveV45` (:65). `convertV45ToV44` leads the chain at :320; the :328 message stays.
- `p14r3-save-v41`: the import swaps `validateSaveV44` for `validateSaveV45` and adds `convertV45ToV44`. Pins at :213, :218, :227, :345 and calls at :226, :344 move to 45 and V45. `convertV45ToV44` leads the chain at :381; the pin stays. Stale titles stay (census KEEP).
- `save.test`: import and both chains (:35, :370, :419). The bare `.toThrow()` at :289 takes stamp 46 and `/unknown saveVersion 46/`. The V15 leaf takes stamp 46 and `/versions 1 through 45 only/` (:455, :456).

## Type sites cleared (8 of 8, root gate only)

- TS2345, `convertV45ToV44` innermost: `p14c3-promise-digest-continuity` (279,135); `p14p3-directing-promises` (417,106) and (747,108); `p14p4p5-opportunities` (827,128); `p14p4p5-screenplay-status` (320,119); `save.test` (370,136) and (419,136).
- TS2375, S6: `p14p3-directing-promises` (425,13). `invalid` takes the type of the frozen V40 state next to it, which the line above already passes to the same builders.

## Title rename (1)

OLD: tests/save.test.ts > P04A §2.5 [em dash] SaveFileV15 identity-bearing queue expiry > rejects an unknown saveVersion 45 with the updated range, and rejects downgrading V15 to V14 (stale number corrected post-C.2b)
NEW: the same identity with "saveVersion 46". It serves M2 row 839, and `rows.json` holds both strings in full.

## Deferred (10), see `deferred.md`

M2 measured no first guard at any G4b site, so I pinned none. The S9 pins at `p14c3-transitions` :175 and :207, `p14p3` :387, :418, :482, :740, :748, `p14p4p5-opportunities` :827, `p14p4p5-screenplay-status` :328 and `p14r3-save-v41` :381 stay unchanged. Seven have their S4 insert; three call `futureSave()`, which H already leads. By source reading, the P15 refusal will probably fail six leaves at x2 until the follow-up pins them. Two pins (:207, :328) should hold.

## Where the plan is off

- Rows 739 and 774 carry an H pin and the old innermost converter as their "measured" text. Neither measures a first guard.
- The plan leaves :175 and :207 as "unknown". By source reading :175 meets the P15 refusal (`chosen()` ticks to week 208) and :207 does not (`scientistBoundary()` is migrated, then ticks 670 to 671).
- The plan counts one edit line per S5 compare. Two files also need a 10-line helper, as H, G1 and G2 found.
- `p14p3-directing-promises`, `p14p4p5-opportunities` and `p14p4p5-screenplay-status` import `saves` or `core` as namespaces, so the plan's "add it to the import" does not apply to them.
- The plan names no own-era cover for the V42 shelving guard (:175) or the V37 transition guard (:207).

## What I am unsure of

- `tsc` did not run. `withEmptyP15Roots` copies H's form. The S6 type rests on `hollywood` being `HollywoodState | null` at every era from V19 (`types.ts:1906`).
- `p14p3` :378 and :730 pass a relabelled V45 save, four roots included, to `validateSaveV38`. They sit outside the census. I expect the promise-shape cause to fire before the exact-key check, as it did with `firstTakeSubjects` and `screenplayShelving` present. A run confirms.
- The new existence-check label uses ASCII `->` where its neighbours use a Unicode arrow, to keep the patch ASCII.
- I added 34 comment lines the plan does not list: 6 are helper headers, 23 are 1361-N notes at the S4 inserts and the S6 type, 5 are ledger and S5 lines. Dropping them changes no behavior.

## Disclosures

- python3 read the classification JSON and wrote `rows.json`; `g4b_rows.py` is in the session scratchpad, not the tree. I also rewrote my own comment blocks once with a python text replace.
- I read the M2 logs with `/usr/bin/grep -n` and `/usr/bin/sed -n`. I ran `ls -la` on `tests/fixtures` once and opened no fixture file or Owner save. I scanned no docs/ tree.
- I read 1361-F7 and 1361-F8. F8 rulings 1 and 2 govern G1 lines (`p14c2s:325`, `p14d1:618`); no G4b line applies them.
- In the repository I ran only the apply check. In the tree I ran `diff`, `status` and `log`.
- The lean-ctx tools were not exposed in this session; I used Read, Bash and Edit.
