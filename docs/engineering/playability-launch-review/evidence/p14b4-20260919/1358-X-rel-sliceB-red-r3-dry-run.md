# 1358-X: parent dry run of the slice B RED r3, and the 1358-P producer dry run

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1358-x/run-1348-X6-1358-X.sh`, alone in the heavy lane under
  `HEAVY-LANE-LOCK`, on 2026-10-01. Node v22.23.2, the session default.
  - RED run: 22:09:51.
  - Producer run: 22:12:45.
- **Tree.** The 1348-X6 tree (HEAD 85764cd5, slice A r5 and step 3), then the staged
  [1358-rel-sliceB-red-r3.patch](1358-stage/1358-rel-sliceB-red-r3.patch) (sha256 69f5a673…), commit `slice-b-red-r3`.
- **Files.** The six RED files: `p14b10-competitions-log`, `p14b10-labels`, `p14b10-save-v44`,
  `bridge-p14b10-relationship-labels`, `p14b10-romance` and `p14b5-relationships`. `--no-cache`, with the verbose and
  JSON reporters.
- **Producer.** [1358-P-save43-producer.ts](1358-P-save43-producer.ts) (73f47859…) ran in a separate tree, the
  1344-X method:
  - an archive of 85764cd5 with slice A's step 3;
  - a real, empty `tests/fixtures/p14/`;
  - only `node_modules` linked;
  - the producer at its E path;
  - `vite-node` with `P14_SAVE43_PRODUCER_HEAD` set to the scratch commit.
- **Outputs** stay in scratch (`/Users/zacheryspector/studio-scratch/1358-x/`):

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| `x-red-sliceB.txt` | 101,061 | 512196477fa9201f |
| `x-red-sliceB-tsc.txt` | 2,659 | e7426de07da3b614 |
| `p-dry.txt` | 1,638 | eb6eda8a10086a13 |

## The RED: every count as 1358-C3 declared

| File | Result | Declared |
|---|---|---|
| `p14b10-romance` | 28 failed, 6 passed (34) | 28 fail, 6 pass |
| `bridge-p14b10-relationship-labels` | 9 failed, 3 passed (12) | the 7 non-Mentor failures of r1, plus the 2 Mentor leaves |
| `p14b10-competitions-log` | 4 failed, 2 passed | 4 fail, 2 controls |
| `p14b10-labels` | 12 failed | 12 fail |
| `p14b10-save-v44` | 20 failed | 20 fail |
| `p14b5-relationships` | 3 failed, 48 passed | the title rename passes; the 3 failures are the 1344-F6 row 6 exceptions |
| Total | **76 failed, 59 passed (135)**, 51.6 s | |

- **Romance.** The six passes are the leaves 1358-C3 named:
  - the below-Friends control, which pays the `baseWorld()` build;
  - the third-party leaf, which passes without testing anything (1358-F2 §7);
  - the two ending controls;
  - the `lastEventWeek` side of the drift anchor;
  - the strict-Pick leaf, which is RED at the type gate only.

  Each failure carries the missing API as its cause:
  - `currentRomanceValue is not a function`, or `romanceStatus` the same;
  - `expected 'undefined' to be 'number'` at the guards;
  - the low-proximity leaf's `expected 300 to be 401`, now anchored inside the grace period.
- **The Mentor leaves** reach their own Bridge assertions, as 1358-C2 task 3 predicted:
  - `undefined is not iterable` at :239;
  - `Cannot read properties of undefined (reading 'some')` at :251.

## Type gates

- **Root: exit 2, with exactly the 17 errors 1358-C3 declared.**
  - TS2305 ×10, for the missing exports: 2 in `p14b10-labels`, 8 in the romance import at :86-88.
  - TS2353 ×5, for the typed Picks: (508,90), (526,90), (545,92), (546,91), (557,126).
  - TS2578 ×2, for the unused expect-error directives: (566,7), (568,7).
- **UI and Bridge:** each exits 0. This is the Bridge file's first type check.

## Build times, for the budgets of 1358-F2 §4 and §7

| Build | First caller | Time |
|---|---|---:|
| `baseWorld()` (romance) | the below-Friends control | 14,082 ms |
| `rosterWorld()` (Bridge) | "a Rivals-qualifying edge on a DISCLOSED counterpart" | 5,704 ms |
| `cohortThreeFilms()` (Bridge, Mentor) | the Mentor positive leaf | 40,219 ms |

## The producer fails before it writes anything

- **The error.** `p-dry.txt` shows the run exiting 1 with this message, and `tests/fixtures/p14/genuine-v43-pre-romance/`
  was never created:

  ```
  applyActions: commissionScript rejected — writer "t-wri-05" is not currently studio-contracted
  ```
- **The trace** runs through `requireCommissionableWriter` (`src/core/productionAdmission.ts:255`) and `greenlightCycle`
  (producer :93), called from `runCastingCompetitionRoute` (:130).
- **The cause is in the producer.**
  - `foundStudio(s0, market)` (producer :75-86) signs the writer, director, craft and three actors, mounts a set and
    activates development and casting.
  - `runCastingCompetitionRoute` (:120-131) never calls it. It funds the unfounded world and commissions a screenplay
    from an unsigned writer at once.
- **This is the defect a dry run exists to catch.** The producer had never run (1358-C).
- **The fix goes to the test author,** as [1358-F3](1358-F3-parent-rulings-on-1358-X.md) orders. A second producer dry
  run follows before any recorded mint.
