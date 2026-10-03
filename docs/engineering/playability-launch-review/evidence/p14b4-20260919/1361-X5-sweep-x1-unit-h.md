# 1361-X5: sweep dry run x1, unit H on the merged candidate

**The tree.** x1 measures the Save45 sweep's helpers unit H on top of the merged candidate. The tree is an archive of HEAD
dc84faf0 with these committed in order:
- the production through `p15c-c-r1`;
- the sibling patch r2;
- the hygiene comment patch (1361-F7 ruling 1);
- H's `patch.diff` (sha256 aa5729fc…, [units/H](1361-stage/sweep/units/H/)).

**Script.** [run-sweep-x.sh](1361-stage/sweep/run-sweep-x.sh) ran alone in the lane on Node v20.20.2, from 11:01:47 CDT on
2026-10-03. The core list holds 448 files: 1361-M2's 447 plus the sibling file.

## Results so far

| Check | 1361-M2 (no sweep) | x1 (H) |
|---|---|---|
| Type gates: errors in `tests/` (root, UI, Bridge) | 33, 4, 9 | **28, 0, 5**; the UI gate exits 0 |
| Type gates: errors in `src/` | 0, 0, 0 | 0, 0, 0 |
| Generator checks | exit 0 | exit 0 |
| Core | 938 failed, 4,272 passed (5,260) | **614 failed, 4,601 passed (5,265)**, 11:04:42-12:38:27 |
| Core against 1358-I | SAME 71, CHANGED 14, NEW 854 | **SAME 78, CHANGED 7, NEW 530**, GONE 0 |
| P15 files failing | the 45 declared | the 45 declared |

- **H clears 324 rows.** That is 324 of M2's NEW and CHANGED rows. No row fails at x1 that did not fail in M2.
- **The type gates lose exactly H's 5 sites,** 13 errors: 5 root, 4 UI and 4 Bridge.
- **SAME rises by 7.** The 7 retained identities H unmasks fail again with their 1358-I messages, as the plan predicted.
- **Still to do:** a row-by-row check of H's acceptance. Each of H's other rows passes or moves to a site another unit
  owns. x2 measures all units together and supersedes this check.
- **UI and d16** were still running at the time of writing. Their results land in `S/1361-sweep/x1/x.meta`.

Parsed rows: `S/1361-sweep/x1/attr/x1-core-vs1358I.json`.

## What follows

**x2** measures every unit together (H, G1, G2, G3, G4a, G4b, G5). It is queued behind x1 in the lane:
`run-sweep-x.sh x2 …`, with outputs in `S/1361-sweep/x2/`. After x2 come the follow-ups for the deferred and measured
lines in each unit's `deferred.md`, then x3, then the sweep's independent review.
