# 1348-M: slice A's recorded broad gates, with attribution

Status: **both gates reproduce 1344-M3's failing sets exactly.** Slice A adds no failure, and its broad gates close
([1348-L](1348-L-rel-sliceA-landing.md)).
- Core: 85 failed, the same 85 identities with the same primaries as
  [1344-I3](1344-I3-core-failures.json).
- UI: 3 failed, the three numpy rows of [1344-I4](1344-I4-ui-failures.json).
- Slice A's two new files pass: 20 and 9 tests.

The gates also give the baseline for slice B's Save44 fallout (1358-F7 Next 4).

## How the gates ran

- **Runner.** `/Users/zacheryspector/studio-scratch/1348-gates/run-gates.sh`, launched detached at 00:21:52 CDT on
  2026-10-02 under `caffeinate`. It held `HEAVY-LANE-LOCK` from start to end. Before the first run it checked:
  - no vitest or tsc running;
  - HEAD equal to the fetched remote branch head;
  - clean `src`, `tests`, `ui`, `bridge` and `generated`;
  - free disk of at least 5 GiB;
  - no existing output for either stem, and stems that match the recorder's rule;
  - a core list of 435 files: 1344-M3's 433 plus `p14b10-conflict-evidence` and `p14b10-mentor-label`.
- **Commits.** None during the gates. Files written in E during the run stayed untracked until the runner logged `end`.
- **Order.** Core, then UI. Each run sits between the bounded-source guards: `pre`, then the recorder, then `post`.
- **Node.** v20.20.2, pinned. 1344-M3 ran on v22.23.2.
- **Tree.** HEAD and remote bc2f6007. Its source and tests equal c208d214's, slice A's last production commit
  (`git diff --stat c208d214 bc2f6007` over the source paths prints nothing).

## Core

- **Run.** `1348-slicea-broad-core`: `node_modules/.bin/vitest run --project core` over the 435 files of
  `/Users/zacheryspector/studio-scratch/1348-gates/core-list.txt`, with the 1345-E `.venv` on PATH.
- **Recorder.** The test command exited 1 (failing tests). The recorder and both guard steps exited 0.
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha bc2f6007 at start and at end, an empty tested diff, no untracked source.
  - Files: [json](1348-slicea-broad-core.json), [preflight](1348-slicea-broad-core-preflight.json),
    [postflight](1348-slicea-broad-core-postflight.json), [patch](1348-slicea-broad-core.patch) (empty).
- **Raw output.** [1348-slicea-broad-core.txt](1348-slicea-broad-core.txt), 14,867,005 bytes, sha256
  9facb59b84221929053a0e2a64b5a127a22618dfee676402a090e2ce5e61a066.
- **Tally.**
  - Files: 23 failed and 412 passed (435).
  - Tests: **85 failed**, 4,894 passed, 3 skipped and 11 todo (4,993).
  - No unhandled error.
  - Duration 5,965.21 s (Vitest). The recorder timed the run from 00:21:56.8 to 02:01:24.2 CDT.
- **The 34 added tests.** Every file's test count equals 1344-M3's, with three exceptions:
  - `p14b10-conflict-evidence`, 20 tests, new;
  - `p14b10-mentor-label`, 9 tests, new;
  - `p14b5-relationships`, 46 → 51 tests, from slice A's RED.

  Both new files pass in full.

### Attribution against 1344-I3

- [1321-I-attribution.py](1321-I-attribution.py), unchanged, gives
  [1348-I-core-failures.json](1348-I-core-failures.json): 85 failed cases.
- [1344-I-compare.py](1344-I-compare.py) against [1344-I3](1344-I3-core-failures.json) gives
  [1348-I-core-vs1344I3.json](1348-I-core-vs1344I3.json): **SAME 85, CHANGED 0, NEW 0, GONE 0.**
- The set is therefore 1338's 78 retained identities plus the seven 1344-F6 declared exceptions, as 1344-K lists them.
  The three `p14b5-relationships` row 6 exceptions keep 1344-M3's primary.

## UI

- **Run.** `1348-slicea-broad-ui`: `node_modules/.bin/vitest run --project ui`, with the 1345-E `.venv` on PATH.
- **Recorder.** The test command exited 1. The recorder and both guard steps exited 0.
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha bc2f6007 at start and at end, an empty tested diff, no untracked source.
  - Files: [json](1348-slicea-broad-ui.json), [preflight](1348-slicea-broad-ui-preflight.json),
    [postflight](1348-slicea-broad-ui-postflight.json), [patch](1348-slicea-broad-ui.patch) (empty).
- **Raw output.** [1348-slicea-broad-ui.txt](1348-slicea-broad-ui.txt), 227,968 bytes, sha256
  9a0833f68b55271f51f7d73e8c91d02f4fa4c717f748249839228fa2f7fced29.
- **Tally.**
  - Files: 1 failed and 203 passed (204).
  - Tests: **3 failed**, 2,689 passed and 5 skipped (2,697), the same totals as 1344-M3.
  - No unhandled error.
  - Duration 959.79 s (Vitest). The recorder timed the run from 02:01:28.4 to 02:17:29.7 CDT.

### Attribution against 1344-I4

- [1317-I-attribution.py](1317-I-attribution.py), unchanged, gives
  [1348-I2-ui-failures.json](1348-I2-ui-failures.json): 3 failed cases, `unhandled: []`.
- [1344-I-compare.py](1344-I-compare.py) against [1344-I4](1344-I4-ui-failures.json) gives
  [1348-I2-ui-vs1344I4.json](1348-I2-ui-vs1344I4.json): **CHANGED 3, NEW 0, GONE 0.**
- **CHANGED 3 is the temporary directory.** The three identities are 1344-I4's `authored-rgba-export` tool-contract
  rows 6-8. Each primary is the failed command line, which embeds a random temporary directory: `rgba-export-BN0cU7`
  here and `rgba-export-VCVLGl` in 1344-I4. Apart from that path, the primaries are equal.
- **The cause is unchanged.** The raw output reads "missing dependency (No module named 'numpy')" nine times
  (from :1231). numpy stays an Owner question (1345-E).

### 1344-M2's four intermittent rows

All four pass in this gate.

| Row | This gate |
|---|---|
| `livingTurn.scheduler` "runs 12 consecutive weeks …", 15 s budget | ✓ 14,716 ms |
| `StudioLotScreen` "moves Hollywood keyboard focus …" | ✓ 1,415 ms |
| `WorldFirstLiveWeekAdvance` "returns a real building-origin deep route …" | ✓ 1,594 ms |
| `WorldFirstStudioHome` "carries Lot root through … Talent Hub" | ✓ 1,039 ms |

- The scheduler row passed with 284 ms to spare under its 15 s budget. 1344-M3 read 11,853 ms on Node v22.23.2.
- One pass does not retire an intermittent, so 1344-M2's readings stand.

## Type gates

1348-L records root, UI and Bridge each exiting 0 at c208d214
([1348-L-type-gates.txt](1348-L-type-gates.txt)). The gated tree's source and tests equal c208d214's, so that
result covers it.

## Outcome

- **Slice A's broad gates close.** 1348-L moves to CLOSED.
- **The baseline for slice B** is this pair of sets: core 85 (1344-I3's identities), UI 3 (the numpy rows).
  1358-M2 measures slice B's Save44 and projection-57 fallout against it.
