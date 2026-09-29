# 1351-C3: P15A.2 Wave 1 RED revision -- closing 1351-D's four non-blocking notes

Role: independent test engineer (test-author). Task: small revision to the Power Ranking RED
suite, same scratch tree, closing all four non-blocking notes from
[1351-D](1351-D-p15a2-red-review.md) (ACCEPT verdict on r2, no blocking defects).

## Notes closed

### Note 1: combine the release-tick window edge with an unfinished film at the same boundary

1351-D: "Add one leaf combining the release-tick window edge with an unfinished
(`runEndedByWeek:false`) film at that same boundary, per 1350-A item 2's 'settlement edges tested
separately' phrase -- currently split across two leaves that don't overlap at the boundary tick."

Added `compute-power-ranking-window-edge-w52-unfinished-counts-releases-not-films` (inserted
immediately after `compute-power-ranking-window-edge-release-tick-w52-counts-w53-excluded`, inside
the same `describe` block). A single film at `releaseTick=52` (exactly `W-52` for `W=104`,
`runEndedByWeek:false`):

```
window = [52, 104) at W=104
releaseTick=52 = W-52 -> inside the window -> counts in Releases (releases=1, releasesTenths=25)
runEndedByWeek=false   -> excluded from Films (filmsTenths=0, countedFilmIds=[])
```

Both rules now exercised together at the one tick where they could plausibly interact, closing the
gap the review identified (previously the window-tick edge and the running/settled transition were
each tested, but never at the same boundary tick).

### Note 2: tied-pair ID swap flips presentation order

1351-D: "Add ... a leaf that swaps the IDs of a *tied* pair and confirms ranks stay `1,1` while
presentation order flips -- item 5's second clause is currently only implied by two separate,
non-tied tests."

Added `compute-power-ranking-tied-pair-id-swap-flips-presentation-order` (inserted immediately
after `compute-power-ranking-competition-ranking-1-1-3-and-presentation-order`, before
`compute-power-ranking-id-and-owner-swap-symmetry`). Design note, since the charter clause needed
an operational reading: presentation order among a tie is `studioId` ascending, a property of the
two ID *strings* alone -- so for a fixed pair of ID strings (`'ALPHA'`, `'ZETA'`), the *sequence* of
IDs in `rows` cannot literally "flip" no matter which facts are attached to which ID (`'ALPHA'`
always sorts before `'ZETA'`). What the charter clause actually pins is that **presentation position
tracks the ID label alone, never a hidden identity that persists across a relabelling** -- i.e.
swapping which ID a fact-set is attached to swaps which fact-set appears in the first vs. second
slot, while the rank (1, 1) and the ID-sequence (`['ALPHA','ZETA']`) stay fixed. Built with two
structurally different fact-sets that tie on points, so the swap is observable in real fields, not
just an opaque tied total:

```
LOW:  1 finished film (critic=0, reach=1 -> tenths=50) -> filmsTenths=50;
      that same film also counts as 1 release -> releasesTenths=25. pointsTenths=75.
HIGH: 0 finished films (filmsTenths=0); 3 unfinished releases ->
      releasesTenths = 10*min(3,4)/4*10 = 75. pointsTenths=75.

setupA = buildInput('ALPHA','ZETA')  -- ALPHA=LOW, ZETA=HIGH
setupB = buildInput('ZETA','ALPHA')  -- ZETA=LOW, ALPHA=HIGH  (IDs swapped)
```

Both setups: `rows.map(studioId) === ['ALPHA','ZETA']` (ID-sequence invariant), both rows
`rank===1` (tied at 1,1 in both). But `filmsTenths` at the `'ALPHA'` slot is 50 in setup A and 0 in
setup B (and the reverse at `'ZETA'`) -- the presentation *content* flips while the presentation
*order* (by ID) and the *ranks* do not.

### Note 3: extend the id/owner-swap symmetry loop to `releases`/`countedFilmIds`

1351-D: "`compute-power-ranking-id-and-owner-swap-symmetry`'s per-key loop ... omits
`releases`/`countedFilmIds` from its equality check; low risk, cheap to close."

Edited the existing leaf (the one leaf this revision changes in place, per the coordinator's
explicit instruction). `releases` was trivial to add (a plain number, no identity dependency).
`countedFilmIds` needed one real fix first: the leaf's `filmsFor(id, f)` helper built filmIds as
`` `${id}-main` ``/`` `${id}-relN` `` -- embedding the *owner's* studioId string into the filmId
itself. After an ID swap, the same fact-set's counted film would carry a *different* literal filmId
string (e.g. `'A-main'` vs `'B-main'`) even though it represents the same underlying facts, so a
direct `toEqual` on `countedFilmIds` would have failed for a reason unrelated to the property being
tested. Fixed by keying filmId off a **fact-set-fixed label** (`'FACTSA'`/`'FACTSB'`) instead of the
owner id, while `studioId` (actual ownership) still correctly follows the swap. This makes
`countedFilmIds` genuinely comparable across the swap via `Set` equality (order-insensitive, matching
this suite's convention elsewhere). The loop now reads:

```
for (const key of ['ranked','rank','filmsTenths','releases','releasesTenths','pointsTenths','band'])
  ...
expect(new Set(rowASwapped.countedFilmIds)).toEqual(new Set(rowBOriginal.countedFilmIds))
expect(new Set(rowBSwapped.countedFilmIds)).toEqual(new Set(rowAOriginal.countedFilmIds))
```

### Note 4: tighten classification row 19's citation

1351-D: "Classification JSON row 19's requirement text quotes 1350-A item 5 in full without
flagging that the tied-ID-swap sub-clause isn't literally exercised by that leaf -- tighten the
citation or add the leaf."

Both done: the new leaf from note 2 exercises the sub-clause directly, and row 19
(`compute-power-ranking-competition-ranking-1-1-3-and-presentation-order`) in
`1351-stage/1351-p15a2-red-r3-classification.json` now explicitly states it covers only item 5's
first half (1-1-3 and unswapped tie presentation order) and cites the sibling
`compute-power-ranking-tied-pair-id-swap-flips-presentation-order` leaf for the second half, instead
of quoting the full item-5 text without qualification.

## Every other leaf unchanged

Confirmed by diff: only `tests/p15a2-power-ranking.test.ts` changed (93 insertions, 5 deletions --
the 5 deletions are exactly the lines of the pre-existing `id-and-owner-swap-symmetry` leaf's
`filmsFor` signature and comparison loop replaced for note 3, nothing else touched anywhere in the
file). `tests/p15a2-power-ranking-harness.test.ts` is byte-identical across r1/r2/r3 (confirmed by
diffing the patch hunk for that file across all three patches: identical in each).

## RED run

Command (same as prior records, from the scratch tree):

```
node_modules/.bin/vitest run --project core tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts
```

Result: **2 test files failed, 33 tests failed, 1 passed (34 total).** The two new leaves fail for
the exact module-load reason, guaranteed by construction (both call `await loadPowerRanking()` as
their first statement, same pattern as every other leaf):

```
p15a2 power ranking: window edges and the running-film rule > compute-power-ranking-window-edge-w52-unfinished-counts-releases-not-films
  -> Error: Failed to load url ../src/core/powerRanking.js (resolved id: ../src/core/powerRanking.js) in <importer>. Does the file exist?
p15a2 power ranking: ranking, symmetry, determinism > compute-power-ranking-tied-pair-id-swap-flips-presentation-order
  -> Error: Failed to load url ../src/core/powerRanking.js (resolved id: ../src/core/powerRanking.js) in <importer>. Does the file exist?
```

The edited `compute-power-ranking-id-and-owner-swap-symmetry` leaf also still fails for the same
module-load reason (unchanged status; its new/extended assertions never execute at RED, same as
before the edit -- `await loadPowerRanking()` throws before them).

Every other leaf's status is unchanged from r2: 29 of the 32 prior leaves still fail for their
original stated reasons (28 module-load, 1 genuine `TUNING` value mismatch), and
`compute-power-ranking-standing-independence-no-standing-field-in-type` still passes as the same
documented `control-passes` case (a different `describe` block, untouched by this revision).

Full per-leaf mapping for all 34 leaves is in `1351-stage/1351-p15a2-red-r3-classification.json`
(r2's 32 rows, unmodified except rows 19 and 20's tightened/extended requirement text per notes 3
and 4, plus the 2 new rows inserted at their actual file positions).

## Type gate

Command: `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Exit code 2, exactly the same two errors
as r1/r2, no new errors from the three touched/added leaves:

```
tests/p15a2-power-ranking-harness.test.ts(19,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
tests/p15a2-power-ranking.test.ts(31,24): error TS2307: Cannot find module '../src/core/powerRanking.js' or its corresponding type declarations.
```

## Patch verification

`git diff <base>..HEAD -- tests/p15a2-power-ranking.test.ts tests/p15a2-power-ranking-harness.test.ts`
in the scratch tree (base = the scratch tree's own root commit, content-identical to the real repo's
`c01b3d7919692946323cc6d487ed5d0eb24ec01f`) is the full diff for both files, written to
`1351-stage/1351-p15a2-red-r3.patch` (supersedes r2's patch as the complete artifact). Verified it
applies cleanly to the real repo's actual BASE via a scratch index (never the real repo's index):

```
BASE=c01b3d7919692946323cc6d487ed5d0eb24ec01f
SCRATCH_INDEX=$(mktemp)
GIT_INDEX_FILE=$SCRATCH_INDEX git read-tree $BASE
GIT_INDEX_FILE=$SCRATCH_INDEX git apply --cached --check 1351-stage/1351-p15a2-red-r3.patch
# APPLY-CHECK-EXIT=0
rm -f "$SCRATCH_INDEX"
```

Exit code 0.

## Base/HEAD

Real-repo HEAD at the end of this revision: `c69151a220bd7f5f60c59c0e5745186a22bec16b`.
`git diff --stat c01b3d79..c69151a2 -- src bridge ui tests` is empty (zero drift, re-verified).
`git status --short` shows only my own two untracked r3 artifacts
(`1351-stage/1351-p15a2-red-r3.patch`, `1351-stage/1351-p15a2-red-r3-classification.json`) plus this
file once written; my earlier r1/r2 handback files (`1351-C-p15a2-red-handback.md`,
`1351-C2-p15a2-red-rounding-pin.md`, and the r1/r2 patch/classification files) are no longer shown
as untracked -- they were committed by a parent/coordinator process in the interim (visible in the
commit log as part of `1d4275c0` and `8cc3ba86`), not edited or re-touched by me.

## Summary

- Added 2 leaves to `tests/p15a2-power-ranking.test.ts` (now 32 leaves; harness file unchanged at 2
  leaves; 34 total) and edited 1 existing leaf in place (`compute-power-ranking-id-and-owner-swap-symmetry`,
  per note 3's explicit instruction). Every other leaf byte-for-byte unchanged from r2.
- RED status: both new leaves, and the edited leaf, fail for the module-load reason, guaranteed by
  construction. Suite totals: 33/34 failed, 1 passed (the same pre-existing, documented
  `control-passes` leaf).
- Type gate: exactly the same 2 `TS2307` errors as r1/r2, no new errors.
- All four 1351-D non-blocking notes closed: note 1 (combined window-edge+unfinished leaf), note 2
  (tied-pair ID-swap leaf), note 3 (extended comparison loop, fixed the filmId-embeds-owner-id
  precondition that would have made the extension meaningless), note 4 (tightened row 19's citation
  to point at the new leaf for item 5's second clause).
- Handback artifacts: `1351-stage/1351-p15a2-red-r3.patch` (full diff vs BASE, both files, applies
  cleanly via a scratch index, verified), `1351-stage/1351-p15a2-red-r3-classification.json` (34
  rows), this file. r1's and r2's own patch/classification files are left in place, unmodified, as
  the historical record of those revisions.
