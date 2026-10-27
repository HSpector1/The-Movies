# Independent postflight: consumers-remainder — 2026-10-27, 10:16–10:19 CDT

Independent read-only audit (Sonnet auditor, briefed by the coordinator) of the remainder of the coherent v9 consumer checkpoint: the five files that lacked a complete summary in the interrupted coherent-consumers attempt, then the previously unrun Bridge typecheck. Launched after the Owner paused the foreign Godot session.

## Binding and preflight
- SELECTION head `16aa35da7286c55cedbc52a83ddb605dc58b30ec` equals the experimental HEAD; tree clean; `git diff --name-only 63a63abe HEAD` lists only HANDOFF.md, so gameplay source is unchanged 63a63abe.
- 1,658 of 1,658 source/input manifest entries match (same key set as coherent-consumers, rehashed at bind). All six preflight pins match. Preflight: launchAllowed true, heavyLOCAL empty, free 7,659,576 KiB (floor 3,670,016), AC power, lane absent. Context: load average 9.27 and swap 8,195 MB used at preflight.

## Execution
- Lane meta: start 10:16:31 CDT, end exit 1 at 10:18:41 CDT. Children: consumers-remainder exit 1 (vitest 81.49 s), bridge-types exit 0 (10:17:56–10:18:41). CHECKPOINT exit 1 is caused only by the inherited failures below.
- Owned lane PID 28347 absent afterwards; no vitest/tsc running; HEAVY-LANE-LOCK absent. Freeze released.

## Results (functional)
- 26 tests: 23 passed, 3 failed. Files: p14c3-promise-digest-continuity 8/8, p15b4-studio-closure-save 8/8, p16-continued-work-cancel 3/3, p16-retained-drafting-continuation 4/4, p14c2c-rival-promises 0/3.
- Bridge types (`tsc -p tsconfig.bridge.json --noEmit`) exit 0 on this source.
- The three failures (p14c2c R1, R2, R3) are in the recorded Oct 25 baseline (wave3-scripts/baseline-core-failures.txt lines 136–138) and their first failure line is byte-identical to the baseline JSON (`AssertionError: expected { …(17) } to match object { outcome: null, progress: +0 }`; received outcome SATISFIED, progress 1). Inherited, not introduced by v9. Only the first line was compared.

## Timing (unchanged 5,000 ms budget)
Twelve leaves exceed 5,000 ms; nine of them pass. Exact durations (ms): p14c2c R1 16295.637, R2 14667.818, R3 12562.065 (failed); p14c3 genuine207 continuation 9748.595; retained-drafting default retention 9055.386; retained-drafting full reader 7376.032; p14c3 preretirement207 6414.898; retained-drafting explicit writers 6146.021; p14c3 retired208 5825.948; p15b4 closure-root-migration-empty 5798.483; p14c3 runtime-current208 5571.368; p15b4 claims-loan-and-estate 5271.649. Functional pass is not timing qualification.

## Exclusivity (sampled, not proven continuous)
Launch and post host scans contain no Godot. The foreign evidence directory shows its last launch at 14:35:08Z, 41 minutes before the window, and none during or after it. A 10-second poll for a Godot process during the run recorded no sighting (8 visible polls; its END-line counter had a shell integer bug and is not evidence). This is the first attempt in the Sprint 8 obligations series with no foreign engine observed by any sample, but samples do not prove continuous exclusivity.

## Claims
Together with coherent-consumers (eight complete summaries, 124 passing, overlap start unknown) this gives functional consumer coverage of all thirteen selected files and a Bridge typecheck pass on gameplay 63a63abe. It is not an exclusive-gate claim for the earlier eight files, not timing qualification, and not a P16 technical predecessor. Private host inventories remain local.
