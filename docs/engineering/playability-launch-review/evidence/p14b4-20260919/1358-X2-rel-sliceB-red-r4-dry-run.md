# 1358-X2: parent dry run of the slice B RED r4 at HEAD, and the 1358-P producer r4 dry run

[1358-F3](1358-F3-parent-rulings-on-1358-X.md) ordered this run after r4
([1358-C4](1358-C4-rel-sliceB-red-r4-handback.md)). **Every result equals 1358-C4's declaration.** The RED
fails 77 and passes 58 of 135, with each file's split as declared. The root type gate gives exactly the 17 declared
errors. The producer founds the studio, exits 0 and captures week 284.

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1358-x2/run-1358-X2.sh`, alone in the heavy lane under
  `HEAVY-LANE-LOCK` (`lane-run.sh`), on 2026-10-01 from 22:47:08 to 22:50:55 CDT, Node v20.20.2.
- **Tree.** An archive of HEAD b0809602, which carries slice A (1348-L), so no slice A patch was applied.
  - The staged [1358-rel-sliceB-red-r4.patch](1358-stage/1358-rel-sliceB-red-r4.patch) (sha256 d41ea111…) went in
    with `git apply --include='tests/*'`: six test files, 1,564 insertions and 1 deletion (scratch commit 6b1c8f8).
  - The patch also edits the producer at its E path. `docs` is a link in this tree, so that hunk went to the producer
    tree instead (below).
- **Files.** The six RED files ran in one Vitest process, `--project core --no-cache`, with the verbose and JSON
  reporters: `p14b10-competitions-log`, `p14b10-labels`, `p14b10-save-v44`, `bridge-p14b10-relationship-labels`,
  `p14b10-romance` and `p14b5-relationships`.
- **Producer.** A separate tree held:
  - an archive of b0809602;
  - a real, empty `tests/fixtures/p14/`;
  - only `node_modules` linked;
  - the producer at its E path, patched with r4's producer hunk to sha256 04713f73… (equal to the delivered file).

  It ran under `vite-node` with `P14_SAVE43_PRODUCER_HEAD` set to the scratch commit d9794d5.
- **Outputs** stay in scratch (`/Users/zacheryspector/studio-scratch/1358-x2/`):

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| `x2-red-sliceB.txt` | 102,189 | 323baeec7a3f3950 |
| `x2-red-sliceB.json` | 168,915 | f2908cb00888f6b8 |
| `x2-red-sliceB-tsc.txt` | 2,659 | 3cc6aa842450a6e9 |
| `p2-dry.txt` | 427 | ba5f6f966bf2f0cd |
| `x2.log` | 931 | 2aea5b66bf1f972f |

## The RED: every count as 1358-C4 declared

| File | Result | 1358-C4 |
|---|---|---|
| `p14b10-romance` | 29 failed, 5 passed (34) | 29 fail, 5 pass |
| `bridge-p14b10-relationship-labels` | 9 failed, 3 passed (12) | 9 fail, 3 pass |
| `p14b10-competitions-log` | 4 failed, 2 passed | as 1358-X |
| `p14b10-labels` | 12 failed | as 1358-X |
| `p14b10-save-v44` | 20 failed | as 1358-X |
| `p14b5-relationships` | 3 failed, 48 passed | as 1358-X: the three 1344-F6 row 6 exceptions |
| Total | **77 failed, 58 passed (135)**, 62.65 s | |

- **The five romance passes** are the leaves 1358-C4 names:
  - the below-Friends control, which pays the `baseWorld()` build;
  - the two ending controls;
  - the `lastEventWeek` side of the drift anchor;
  - the strict-Pick leaf.
- **The third-party leaf now fails at RED by its guard:** `expected 'undefined' to be 'number'` (1358-F3 item 3).
- **No budget fired.** No failure message names a budget.

## Type gates

- **Root: exit 2, with exactly the 17 errors 1358-C4 declares.** A script compared file, line, column and code, and
  found no extra or missing error:
  - TS2305 ×10: `p14b10-labels` (47,10) and (48,10); romance (89,3), (89,24), (89,48), (89,77), (90,3), (90,27),
    (91,47) and (91,81).
  - TS2353 ×5: romance (514,90), (532,90), (551,92), (552,91) and (563,126).
  - TS2578 ×2: romance (572,7) and (574,7).
- **UI and Bridge:** each exits 0.

## Build times against the 1358-F3 budgets

| Build | First caller | 1358-X (v22) | 1358-X2 (v20) | Budget | Budget ÷ X2 |
|---|---|---:|---:|---:|---:|
| `baseWorld()` | the below-Friends control | 14,082 ms | 22,617 ms | 90,000 ms | 4.0 |
| `rosterWorld()` | "a Rivals-qualifying edge on a DISCLOSED counterpart" | 5,704 ms | 9,867 ms | 45,000 ms | 4.6 |
| `cohortThreeFilms()` | the Mentor positive leaf (build and leaf) | 40,219 ms | 46,539 ms | 240,000 ms | 5.2 |

The pinned Node ran `baseWorld()` 1.6 times slower than v22, where 1358-F3 assumed 1.4.
- **The recorded RED** runs this same six-file shape, so it keeps the 4.0 margin.
- **The broad gate.** 1344-M3's full-suite run timed `p15c-wave-r-retention` at 55.1 s, against 51.5 s in 1359-X2's
  multi-file run. That suggests full-suite load adds little to a multi-file time. The reviewer should still weigh the
  margin (1358-D).

## The producer: exit 0, week 284

- **Facts.** `p2-dry.txt` and the dry-run MANIFEST:
  - `facts.week` 284;
  - `competitionEdges`: (t-act-08, t-act-24), (t-act-08, t-act-20) and (t-act-20, t-act-24), each at
    `sharedCompetitions` 2, the three slate pairs 1358-C4 expects;
  - `shelvingBusinesses`: studio-c64d15fd-r04 with 1 rejection and 0 shelved. This meets the producer's premise,
    `rejections.length > 0 || shelved.length > 0` (producer :146, :156);
  - `firstTakes` 123 and `industryFilms` 130.
- **Files.** It wrote:
  - `genuine-v43-pre-romance-week-284.json.gz` (239,938 bytes; sha256 a731677f…; decoded 2,346,912 bytes,
    1a3866a9…);
  - its `.provenance.json`;
  - `MANIFEST.json` (saveVersion 43, elapsed 6,644 ms).

  These stay in scratch. The recorded mint (1358-P) writes the real ones.
- **Contract expiry.** Week 284 lies past week 208, when the six contracts signed at week 0 end (1358-C4 uncertain
  item 3). The premise still holds. The reviewer judges whether any RED leaf that reads the fixture assumes those
  contracts are live.
- **r4's unordered change.** The producer cancels the second production (:139), as the conflict-evidence route does
  at :288. The run shows the route completes with it. 1358-D rules on it.

## Next

1. Review 1358-D: independent and read-only, on r4, this run and the producer's week-284 capture.
2. The recorded mint 1358-P at the last Save43 writer (HEAD before slice B's production), under a lowercase stem.
3. The recorded RED of r4, then production (Save44).
