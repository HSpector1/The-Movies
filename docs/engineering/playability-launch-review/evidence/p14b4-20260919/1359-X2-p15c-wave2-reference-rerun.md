# 1359-X2: parent re-run of the P15C Wave 2 RED r4 and reference r3

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1359-x2/run-1359-X2.sh`, alone in the heavy lane under
  `HEAVY-LANE-LOCK`, 21:53:56-21:57:30 CDT on 2026-10-01. Node v22.23.2, the session default.
- **Tree.** A fresh scratch tree from repo HEAD 85764cd5. On it, the staged patches only:
  - RED r4 [1359-p15c-wave2-red-r4.patch](1359-stage/1359-p15c-wave2-red-r4.patch) (sha256 8f159ca5…);
  - then reference r3 [1359-p15c-wave2-reference-r3.patch](1359-stage/1359-p15c-wave2-reference-r3.patch)
    (733d1f84…), cumulative over r4, `src` only.
- **Not minted.** The route L captures mint at the last writer below the P15 step, so C2-C4 stay FIXTURE PENDING.
- **Every Vitest command** used `--no-cache` and the verbose and JSON reporters. The tree's `git status` was clean
  afterwards.
- **Outputs** stay in scratch (`/Users/zacheryspector/studio-scratch/1359-x2/`):

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| `x2-red.txt` | 35,764 | 8c2911cd0887846c |
| `x2-red.json` | 58,920 | 2cef5dc8baada619 |
| `x2-red-tsc.txt` | 0 | e3b0c44298fc1c14 |
| `x2-ref.txt` | 23,403 | 89ee76b3a51430b8 |
| `x2-ref.json` | 47,231 | 4f4016929eb43716 |
| `x2-ref-tsc.txt` | 14,496 | c26be721d510d0e6 |

## Results

| Run | Result | Declared (1359-C4) |
|---|---|---|
| RED: `p15c2-campaign-legacy-integration` and `p15c-wave-r-retention` | 35 failed, 9 passed (44); 55.3 s | 35 fail, 2 controls and 7 guards pass |
| RED, root type gate | exit 0, no output | not stated |
| Reference: the same two plus Wave 1's `p15c1-campaign-legacy` | 3 failed, 113 passed (116); 76.0 s | C2-C4 FIXTURE PENDING, every other leaf passes |
| Reference, root type gate | exit 2, 35 errors | 1359-X measured the same 35 |

- **Each leaf matched its declaration.** A script matched every one of the 44 classified leaves by exact name to its
  row in the r4 classification, at RED and at the reference. Every leaf behaved as declared, with 0 mismatches.
  - At RED, each of the 35 failures carries its `expectedFailureToday` message.
  - The two controls and the seven Wave R guards pass at RED.
  - At the reference, every leaf passes except C2-C4, which fail on the FIXTURE PENDING message. Wave 1's 72 leaves
    pass.
- **1359-X's two findings are fixed.**
  - F-1 is fixed: route L is lawful. The control `legacy-control-late-founding-route-lawful` passes at RED (9,095 ms)
    and at the reference (7,823 ms). So do the five route L leaves that 1359-X saw fail.
  - F-2 is fixed: `legacy-adapter-sibling-roots` and `legacy-condition-at-6240` pass at the reference.
- **The RED type gate is clean.** The r4 test files and helpers add no type error.
- **The reference type gate** reports the same 35 errors as 1359-X: the reference's Save44 shape, in two `src` files
  (`save.ts:10498`, `harness/roster-wall/historical-control.ts:33`) and 33 test sites. The reference is not production.
  The production writer owns both.

## Measurements for the budgets (1359-F3 "Budgets")

Single-file runs on a quiet lane. A leaf's time includes any memoized build it pays for as the first caller.

| Budget class (r4 constant) | Leaves | Slowest leaf at RED | Slowest leaf at the reference |
|---|---:|---|---|
| `PROVISIONAL_ROUTE_MS` | 9 | control, 9,095 ms (route build 3,111.5 + 5,563.7) | control, 7,823 ms (route build 2,544.4 + 4,911.4); `legacy-determinism` 4,294 ms |
| `PROVISIONAL_POST_FREEZE_MS` (route plus extension) | 3 | under 2 ms (fails at the missing API) | `legacy-adapter-only-at-boundary`, 13,879 ms; extension `extension520Ms` 13,707.6 |
| `PROVISIONAL_FIXTURE_MS` | 23 | `legacy-control-genuine-save38-6240-lawful`, 10,851 ms | `legacy-migration-empty-root-genuine-save38`, 17,259 ms |
| `PROVISIONAL_GUARD_BUDGET_MS` | 7 | first guard, 51,084 ms (pays the campaign) | first guard, 51,550 ms |

[1359-F4](1359-F4-parent-budgets-from-1359-X2.md) sets the budgets from these numbers.
