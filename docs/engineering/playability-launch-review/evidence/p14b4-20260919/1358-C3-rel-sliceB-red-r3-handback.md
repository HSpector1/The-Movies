# 1358-C3: P14B relationship slice B, RED r3 handback

## Status

DONE, with nothing run. The heavy-lane lock still held, and I started no vitest, tsc, node or tsx process. Every expected result below comes from reading the code. r3 applies the parent's rulings on 1358-C2 (to be recorded as 1358-F2), items 1-6.

## Base and branch heads

- Real repo `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`, HEAD `469a9547f1a3b53b7c9985ec53beaa55e2a65587` at 21:02 and at 21:08 CDT.
- Scratch tree `/Users/zacheryspector/studio-scratch/1358-r2/tree`, branch `main`:
  - `3a52ff1` base, `8a3ce4c` slice-a-red, `b1f9c1e` slice-a, `2024c04` slice-b-r1 and `fc7d2bf` slice-b-r2, all unchanged;
  - new `61bbd6d`, tagged `slice-b-r3`, which is `main`.
- The r3 patch is `git diff slice-a..main`. It touches six files, all tests, with no `tests/fixtures` path. Against r2 it changes four files; `tests/p14b10-labels.test.ts` and the p14b5 rename are unchanged.
- The r2 deliverables stay in place, unchanged.

## Changes per ruling

Line numbers are r3 lines in `tests/p14b10-romance.test.ts` unless a file is named.

1. **Item 1, materialize first.**
   - The header at :57-60 states the ruled order:
     - record any derived ending;
     - read `currentRomanceValue(romance, writeWeek)`;
     - add any gain and clamp to 0..100;
     - set `anchorWeek` to the write week.
   - **(a)** The low-proximity leaf (:341) now stages its anchor at `week - 100`, inside `ROMANCE_GRACE_WEEKS`. Its value assertion reads the named `staged` (:352), and a premise after the behaviour checks `week + 1 - anchor <= ROMANCE_GRACE_WEEKS` (:355).
   - **(b)** The new leaf at :358 (`a write materializes first: …`) stages 50 anchored at `week - 200` and makes a director-lead touch at `week + 1`.
     - Every value is an expression over the named constants, with `span = min(writeWeek - anchor - ROMANCE_GRACE_WEEKS, ROMANCE_DECAY_WEEKS)` = 97.
     - The three orders give: restore-then-gain `50 + 10` = 60; materialize-then-gain `50 - trunc(50 * 97 / 260) + 10` = 42; gain-then-decay `60 - trunc(60 * 97 / 260)` = 38.
     - The leaf asserts the three values differ (a fixture premise), then `min(100, 42)` and `anchorWeek = week + 1`.
     - A guard at :360 stops the NaN that the missing constants would give at RED.
2. **Item 2.** The leaf at :532 is unchanged. Its classification row now cites the ruling instead of my reading.
3. **Item 3.** The guards at :447-448 stand. The row's note cites the ruling.
4. **Item 4, budget.**
   - `baseWorld()` stays memoized and now times its own build with `performance.now()` (:134, :137); `performance` is imported from `node:perf_hooks` at :79, as `tests/p11-finance-history-scale.test.ts:1` does.
   - Past `PROVISIONAL_BASEWORLD_BUDGET_MS = 120_000` (:126) it throws an error named `BaseWorldBudgetExceeded` (:138-142). The comment at :123-125 says 1358-X sets the final number from its measurement.
   - The error is cached (:129) and rethrown at :132, so the build runs once; no later leaf rebuilds after an over-budget build.
   - The five `60_000` timeouts in `tests/p14b10-competitions-log.test.ts` (:196, :208, :222, :230, :243) and the two `180_000` timeouts in `tests/bridge-p14b10-relationship-labels.test.ts` (:240, :252) each carry the one-line 1356-F5 note: "vitest cannot stop a synchronous body, so this timeout is not a budget".
   - The Bridge header at :50-52 no longer calls 180_000 ms a budget.
5. **Item 5, producer.** `1358-P-save43-producer.ts` (delivered) changes one line, :169: the provenance path is now `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1358-P-save43-producer.ts`. `tests/p14b10-save-v44.test.ts:126` names the same path.
6. **Item 6, titles.**
   - The describes at :260 (eligibility), :314 (eligible case) and :500 (drift) now state the ruled seam and API.
   - The third-party leaf's own title (:273) now cites 1358-F §1 instead of "the disputed question". No other slice B title held "Proposed".
   - Fourteen identities moved. Each row records `renameOldIdentity` (the r2 identity) and `renameNewIdentity`. The drift leaf r2 replaced keeps its r1 identity in its note.
7. **Classification** (`1358-rel-sliceB-red-r3-classification.json`): 87 rows (60 fails, 19 not executed, 8 control-passes).
   - One row is new: the materialize-first leaf.
   - 23 rows changed against r2:
     - the 14 renames;
     - the low-proximity leaf's new `redReason`, with r2's open point marked superseded;
     - the :532 requirement;
     - the type-gate positions in five drift rows, moved to r3 lines;
     - notes on the ending leaf, the save-v44 GENUINE leaf, the five timed competitions-log leaves and the two Mentor leaves.
   - The other 63 rows equal r2's.

## What 1358-X must run

Build the tree at real HEAD by the 1327-C method (`ln -sfn`), apply r5, then step3, then `1358-rel-sliceB-red-r3.patch`.

1. `npx vitest run --project core tests/p14b10-romance.test.ts`.
   - Expected: 34 leaves, 28 failed and 6 passed.
   - The first `baseWorld()` caller (:261) builds the world once. I infer 25-32 s from r1's week-400 advance, well under the 120 s self-check. Record the measured build for item 4's final number.

| Line | Leaf | Expected at RED |
|---|---|---|
| :151, :162 | two bindings leaves | fail, as r1 measured |
| :168-:195 | five `currentRomanceValue` leaves | fail, as r1 measured (the 229-week leaf at its guard, :201) |
| :218-:255 | seven `romanceStatus` leaves | fail, as r1 measured |
| :261 | below Friends | **pass** (control) |
| :273 | third party blocks | **pass** (control, vacuous: NaN staged, NaN read back) |
| :290 | romance-partnered-pair-keeps-growing | fail at :292, "expected 'undefined' to be 'number'" |
| :315 | director-lead gain | fail at :324, "expected null not to be null" |
| :330 | lead-antagonist gain | fail at :338, "TypeError: Cannot read properties of null (reading 'value')" |
| :341 | low proximity, anchor inside grace | fail at :353, "expected 300 to be 401" (value 50 passes first) |
| :358 | materialize first | fail at :360, "expected 'undefined' to be 'number'" |
| :381 | shared success gain | fail at :396, the same TypeError |
| :399 | rival pair | fail at :407, the same TypeError |
| :412 | formation | fail at :422, "expected NaN to be undefined" |
| :426 | re-formation | fail at :438, `toEqual`: one bond row received, two expected |
| :443 | ending persisted | fail at :447, "expected 'undefined' to be 'number'" |
| :468 | endedWeek never moved | **pass** (control) |
| :482 | no romance driver at the ending | **pass** (control) |
| :504 | hold while partners | fail at :511, "expected 70 to be 90" |
| :516 | recorded ending, endedWeek side | fail at :520, "expected 50 to be 70", as r1 measured |
| :523 | recorded ending, lastEventWeek side | **pass** (control): 60 |
| :532 | ending computed on read | fail at :533, "expected 'undefined' to be 'function'" |
| :554 | currentTier holds the tier | fail at :560, "expected 'Friends' to be 'Inseparable'" |
| :563 | strict Picks | **pass** at runtime; RED at the type gate |

2. Recommended, for the Mentor re-check: `npx vitest run --project core tests/bridge-p14b10-relationship-labels.test.ts -t "Mentor"`. Expected: 2 failed and 10 skipped, at `:239` ("TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))") and `:251` ("TypeError: Cannot read properties of undefined (reading 'some')"). The 1358-C2 handback gives the evidence that the fixture now completes.

3. Root type gate, `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Expected exit 2 with exactly 17 errors, if HEAD plus slice A is clean:

```
tests/p14b10-labels.test.ts(47,10) (48,10): TS2305 RIVALS_SAME_SLOT_COMPETITIONS, professionalRivalsEvidence
tests/p14b10-romance.test.ts(86,3) (86,24) (86,48) (86,77): TS2305 ROMANCE_DECAY_WEEKS, ROMANCE_EXIT_THRESHOLD, ROMANCE_FORMATION_THRESHOLD, ROMANCE_GRACE_WEEKS
tests/p14b10-romance.test.ts(87,3) (87,27): TS2305 ROMANCE_PROXIMITY_GAIN, ROMANCE_SUCCESS_GAIN
tests/p14b10-romance.test.ts(88,47) (88,81): TS2305 currentRomanceValue, romanceStatus
tests/p14b10-romance.test.ts(508,90) (526,90) (545,92) (546,91): TS2353 'romance' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek">'
tests/p14b10-romance.test.ts(557,126): TS2353 'romance' does not exist in type 'Pick<RelationshipEdge, "closeness" | "lastEventWeek" | "sharedCompetitions">'
tests/p14b10-romance.test.ts(566,7) (568,7): TS2578 Unused '@ts-expect-error' directive.
```

4. Bridge type gate, `node_modules/.bin/tsc -p tsconfig.bridge.json`. Expected exit 0. This is the first type check of the Bridge file, because `tsconfig.json:24` excludes it from the root gate.

5. Producer dry run, with `1358-P-save43-producer.ts` placed in E itself, in a tree without symlinked roots, and `P14_SAVE43_PRODUCER_HEAD` set to that tree's HEAD.
   - Expected: exit 0, writing `MANIFEST.json`, `genuine-v43-pre-romance-week-<N>.json.gz` and its `.provenance.json` under `tests/fixtures/p14/genuine-v43-pre-romance/`.
   - `facts.competitionEdges` should show the slate pairs (a,b), (b,c), (a,c) at `sharedCompetitions` 2. Reading cannot give N, which is at most 400.
   - `provenance.producer` names the E path.

## Hashes (sha256)

- `1358-rel-sliceB-red-r3.patch`: `69f5a6733483ac05311a3ad5f47096b0c059168e3cf7a0afc62d5974124beb90` (106,800 bytes)
- `1358-rel-sliceB-red-r3-classification.json`: `e8d2eac04527b15c6185339a3933bbc069258aa41f32355f70ae4cb2076df5c9` (81,921 bytes)
- `1358-P-save43-producer.ts`: `73f478597862c9da3edba0b3fb5e89a96b3693f106cc7b7fd2dd63232ea6f0d0` (12,727 bytes; the staged original was `bd49373d…`)
- This handback's hash is in the final report.
- r2 files, unchanged: patch `e153d5e8…`, classification `15f3e337…`, handback `f2e66dfe…`.

## Apply check at the real HEAD (read-only, temporary index)

```
GIT_INDEX_FILE=/Users/zacheryspector/studio-scratch/1358-r2/apply-check-r3.index git -C <repo> read-tree HEAD
cat <E>/1348-stage/1348-rel-sliceA-red-r5.patch <E>/1348-stage/1348-rel-sliceA-production-step3.patch \
    /Users/zacheryspector/studio-scratch/1358-r2/1358-rel-sliceB-red-r3.patch \
  | GIT_INDEX_FILE=… git -C <repo> apply --check --cached -v        # exit 0 at 469a9547
rm -f /Users/zacheryspector/studio-scratch/1358-r2/apply-check-r3.index
```

- r5 and step3 show the same offsets as before; r3 checks with no offset.
- The single stream is needed because `git apply` resets its same-path table per input file, and r3's p14b5 hunk sits on lines r5 adds.
- The temporary index is deleted. The real index hash (`68c50f41…`) and mtime are unchanged, and no object file in the common git dir is newer than 20:25.

## Outside the brief

1. **`rosterWorld()` has the same budget problem `baseWorld()` had.** In `tests/bridge-p14b10-relationship-labels.test.ts:92-113`, the first caller pays the build inside the default 5 s timeout. r1 measured 13.5 s for that leaf group. Item 4 named only `baseWorld()`, so I did not self-time it; the same three-line check would apply.
2. **The vacuous control remains.** The third-party leaf (:273) still passes vacuously at RED; it becomes meaningful at GREEN. I left it.
