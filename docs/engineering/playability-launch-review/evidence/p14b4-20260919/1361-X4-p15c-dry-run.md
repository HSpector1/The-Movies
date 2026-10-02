# 1361-X4: dry run of P15C's production and the sibling test

**The candidate.** The writer's three commits on `p15a1-b-r2`, as [1361-E3](1361-E3-p15c-production-handback.md) hands
them back:

| Tag | Commit |
|---|---|
| `p15c-a-r1` | 2592aea |
| `p15c-b-r1` | 5a3a532 |
| `p15c-c-r1` | f4612bf |

**What the parent checked before the run.**
- **The chain.** Each tag's parent is the one before it, and (a)'s parent is b0b6fb01.
- **The tree.** It is clean on its branch.
- **The patches.** Each staged patch equals `git diff base <tag>` byte for byte.

**Result.**
- **Type gates.** `src` is type-clean on all three gates at every tag.
- **1359.** It passes 86, 98, then all 116 leaves. No leaf that passes at one commit fails at a later one.
- **The other P15 files.** 1356 passes 72 of 72. 1355 fails exactly the 45 declared leaves with their x-r3b messages.
- **Elsewhere.** d16 is unchanged. Both generator checks pass. The sibling patch's five leaves pass at (c) and fail by
  name at `p15a1-b-r2`.

## How it ran

| Item | Value |
|---|---|
| Script | [run-1361-X4-p15c.sh](1361-stage/prod/run-1361-X4-p15c.sh): [run-1361-X.sh](1361-stage/prod/run-1361-X.sh) at (c), (b) and (a) in the writer's tree (checked out at each tag, clean before and after, returned to its branch), then d16 and the sibling run in archive trees |
| Sibling rerun | [run-sibling-v2.sh](1361-stage/sibling/run-sibling-v2.sh), at (c) and at `p15a1-b-r2`, each in an archive tree with `build-tree.sh`'s layout |
| Lane and Node | alone, v20.20.2, 2026-10-02 16:51:23 to 17:15:39 CDT |
| Outputs | [x-pca](1361-stage/x-pca/), [x-pcb](1361-stage/x-pcb/), [x-pcc](1361-stage/x-pcc/) (`p15c.json` sha256 03ebc7ed…), [d16](1361-stage/d16/), [sibling](1361-stage/sibling/) |

## Results

| Check | `p15c-a-r1` | `p15c-b-r1` | `p15c-c-r1` |
|---|---|---|---|
| Root, UI, Bridge type gates: errors in `src/` | 0, 0, 0 | 0, 0, 0 | 0, 0, 0 |
| The same gates: errors in `tests/` (sweep material) | 33, 4, 9 | 33, 4, 9 | 33, 4, 9 |
| 1356 archive and isolation | 71 passed (71) | 71 passed (71) | 71 passed (71) |
| 1356 harness, alone (`campaignMs`; ceiling 300,000) | passed | passed | passed, 80,483 |
| 1355's three files | 14 passed, 45 failed | the same | the same |
| 1359's three files | 86 passed, 30 failed | 98 passed, 18 failed | **116 passed (116)** |
| Both generator checks | exit 0 | exit 0 | exit 0 |

- **1355 at every tag:** exactly the 45 leaves of [1355-leaves-red-at-b-r2.tsv](1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv),
  with the same messages.
- **1359, leaf by leaf:**
  - no leaf that passed at `p15a1-b-r2`, (a) or (b) fails later;
  - at (a), three still-red leaves change their message, the three E3 declares: `legacy-migration-before-boundary`
    ("premise: the state holds no official 2040 Legacy"), `legacy-root-downgrade` and a C6-C12 definition leaf
    (both "does not export a function named 'freezeCampaignLegacyWeek'");
  - at (b), no still-red leaf changes its message.
- **The writer's predictions** were 86, 98 and 116 by reading. The run measured the same counts.
- **The harness at (c)** took 80,483 ms with the freeze and the replay on every save. The archive share is 11.69%,
  and the save is 6,209,534 bytes. Ruling 15's run on the merged tick is this measurement.

## The d16 suite at `p15c-c-r1`

The suite fails 12 of 176: the same 12 leaves, with the same messages, as at `base` and `p15a1-b-r2` (1361-X3,
section 2).

## The sibling test (1361-F ruling 10)

[1361-stage/sibling/](1361-stage/sibling/) holds the classification by an independent test author
(`1361-sibling-classification.json`, `1361-sibling-notes.md`) and the runs.

| Tree | Result |
|---|---|
| `p15c-c-r1` with the patch (blob 6e46149) | 5 passed (5); the slowest leaf took 7,532 ms against `FIXTURE_MS` 120,000, the next 5,854 ms against `ROUTE_MS` 90,000 |
| `p15a1-b-r2` with the patch | 5 failed, each as the classification predicted: four on "does not export a function named 'freezeCampaignLegacyWeek'", C3b on "the state carries no campaignLegacy root" |

- **The first attempt failed on setup.** Inside the X4 script, the run at (c) failed one leaf with ENOENT on
  `docs/…/1052-c3-endurance-A-observer-fixed/authority-6240.json`. That archive tree lacked the evidence directory
  that the helper reads (`tests/helpers/p15c2-legacy.ts:204-211`). Its outputs are kept in
  [v1-c](1361-stage/sibling/v1-c/).
- **The rerun.** `run-sibling-v2.sh` linked the E directory per entry, as `build-tree.sh` does. The other four leaves
  passed in both runs.
- **The run at `p15a1-b-r2` is the file's RED-side baseline.** The sibling test has no recorded RED, so this run is the
  comparison for its five leaves in `1361-p15c-green-recorded` (1361-F ruling 14).

## What follows

- **The review.** The independent implementation review `1361-D3` reads the commits with these results.
- **The fallout.** The Save45 fallout `1361-M2` (1361-F ruling 20) has run in the lane since 17:16 CDT. It covers
  core over 447 files, UI and d16 on the merged candidate, with no test edit.
