# 1344-M3: the Save43 sweep's recorded broad gates, with attribution

Status: **the 1344-N success line holds on both recorded gates.**
- Core: 85 failed. These are 1338's 79 retained identities minus the exporter row, plus the seven declared exceptions
  of 1344-F6.
- UI: 3 failed, the numpy rows.
- No new environment row and no new identity appeared.

Revision r2 applies the independent review [1344-J3](1344-J3-save43-sweep-gates-attribution-review.md) (REFINE): its two
blocking defects and its eleven notes. No number changed.

The recorded gates measure the applied Save43 pin sweep (cec3902c, [1344-C5](1344-C5-save43-sweep-handback.md),
review [1344-D4](1344-D4-save43-sweep-review.md)) against the 1344-N success line (1344-N:80-82), read with the seven
declared exceptions of [1344-F6](1344-F6-parent-ruling-declared-exceptions.md) §3.

## How the gates ran

- **Runner.** `/Users/zacheryspector/studio-scratch/1344-gates/run-gates.sh`, launched detached at 20:08:07 CDT on
  2026-10-01, under `caffeinate`. Before the first run it checked:
  - no vitest running (checked once, at start);
  - HEAD equal to the fetched remote branch head;
  - clean `src`, `tests`, `ui`, `bridge` and `generated`;
  - free disk of at least 5 GiB;
  - no existing output for either stem;
  - a core list of 433 files.
- **The heavy lane.** The runner held `HEAVY-LANE-LOCK` from start to end. The lock is advisory: agents check it
  before they start a test. Both P15 authors at work during the gates report no run while it was held:
  - the 1359-C4 author's last single-file run ended at 20:07:01 ([1359-C4](1359-C4-p15c-wave2-red-r4-handback.md):13);
  - the 1356-C4 author found the lock held from 20:08:57 and ran nothing
    ([1356-C4](1356-C4-p15a2-wave2-red-r4-handback.md):3, :44).
- **Order.** Core, then UI. Each run sits between the bounded-source guards: `pre`, then the recorder, then `post`.
- **Node.** v22.23.2, the session's nvm default. The [Node](#node) section gives the versions of the baselines and
  the effect.

## Core

- **Run.** `1344-save43-sweep-broad-core` at HEAD and remote 469a9547: the sweep commit cec3902c plus a HANDOFF.md
  commit.
  - Command: `node_modules/.bin/vitest run --project core` over the 433 files of
    `/Users/zacheryspector/studio-scratch/1344-merge/core-list.txt`. That is 1344-M's 429 files plus
    `p15b1-corporate-condition`, `p15b1-studio-loan`, `p15c1-campaign-legacy` and `p15c-wave-r-retention`.
  - PATH carried the 1345-E `.venv`.
- **Recorder.** The test command exited 1 (failing tests). The recorder itself exited 0.
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha 469a9547 at start and at end, an empty tested diff, no untracked source.
  - Files: [json](1344-save43-sweep-broad-core.json), [preflight](1344-save43-sweep-broad-core-preflight.json),
    [postflight](1344-save43-sweep-broad-core-postflight.json).
- **Raw output.** [1344-save43-sweep-broad-core.txt](1344-save43-sweep-broad-core.txt), 14,839,339 bytes, sha256
  6983b02a9574d65040e4f8823682f337819a6fcac6282b247f69e84f2db05e17.
- **Tally.**
  - Files: 23 failed and 410 passed (433).
  - Tests: **85 failed**, 4,860 passed, 3 skipped and 11 todo (4,959).
  - No unhandled error.
  - Duration 4,718.06 s (Vitest). The recorder timed the run from 20:08:12.9 to 21:26:53.4 CDT. For comparison, 1338
    took 5,128.59 s and 1344-M took 7,611.77 s under load.

### Attribution against 1338

- [1321-I-attribution.py](1321-I-attribution.py), unchanged, gives
  [1344-I3-core-failures.json](1344-I3-core-failures.json): 85 failed cases.
- [1344-I-compare.py](1344-I-compare.py) against [1338-I](1338-I-failures.json) gives
  [1344-I3-core-vs1338.json](1344-I3-core-vs1338.json): **SAME 73, CHANGED 5, NEW 7, GONE 1.**

| Set | Rows | Reading |
|---|---:|---|
| SAME | 73 | 1338's retained identities with 1338's primaries. They include the six C17 rows, which carried the scratch path in x3 and carry the repo path here. |
| CHANGED | 5 | The four S10 rows (family 12 ×3; seating, seed-b): [1344-X10](1344-X10-s10-probe-results.md) attributes them to shelving, and 1344-F4 ruling 1 keeps them failing. The C20 row `p14c3-save-v38`: its retained message embeds the live version, now 43. Each primary equals x3's. |
| NEW | 7 | Exactly the 1344-F6 declared exceptions, each with x3's primary: `p14b5-relationships` row 6 ×3 (frame :397:53), `p14c2c-rival-promises` R1-R3 (:25:42) and `p14c3-admission-boundaries` N10 (:141:19). |
| GONE | 1 | The `world-first-scenery-load-in-provenance` exporter row, 1338's benign temporary-directory row. It passes under the 1345-E Pillow `.venv` (core raw :3656; [1345-E](1345-E-pillow-environment-result.md):30-33). |

Two kinds of x3 rows do not appear here:
- **The seven `bridge-supervisor` "Fake Unity" rows.** The file passes 14 of 14 in the repo. This confirms 1320-X:12:
  the rows fail only in scratch trees.
- **The `hygiene` row.** `hygiene.test.ts` passes. The row was real: it failed in the repo until the HYGIENE edit,
  which cec3902c carries (scratch commit 62f14e7 in the merge tree).

### The Wave 1 files ride on this gate

These are the broad gates that 1346-L, 1351-L, 1352-L and 1353-L wait for. Every file passes:

| Landing | Files | Tests |
|---|---|---:|
| P15A.1 Wave 1 (1346-L) | `p15a1-shared-market`, `p15a1-shared-market-harness` | 33 + 2 |
| P15A.2 Wave 1 (1351-L) | `p15a2-power-ranking`, `p15a2-power-ranking-harness` | 46 + 2 |
| P15B Wave 1 (1352-L) | `p15b1-corporate-condition`, `p15b1-studio-loan` | 41 + 11 |
| P15C Wave 1 (1353-L) | `p15c1-campaign-legacy`, `p15c-wave-r-retention` | 72 + 6 |
| Shelving (1344-L) | `p14d1-rival-shelving`, `-save-v43`, `-natural` | 28 + 18 + 5 |

## UI

- **Run.** `1344-save43-sweep-broad-ui` at HEAD and remote 469a9547: `node_modules/.bin/vitest run --project ui`, with
  the 1345-E `.venv` on PATH.
- **Recorder.** The test command exited 1 (failing tests). The recorder itself exited 0.
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha 469a9547 at start and at end, an empty tested diff, no untracked source.
  - Files: [json](1344-save43-sweep-broad-ui.json), [preflight](1344-save43-sweep-broad-ui-preflight.json),
    [postflight](1344-save43-sweep-broad-ui-postflight.json).
- **Raw output.** [1344-save43-sweep-broad-ui.txt](1344-save43-sweep-broad-ui.txt), 211,558 bytes, sha256
  f86972d5909095e66ab54520f09c9c9ccce9bb9046108b1939de3a382788a3c3.
- **Tally.**
  - Files: 1 failed and 203 passed (204).
  - Tests: **3 failed**, 2,689 passed and 5 skipped (2,697).
  - No unhandled error. 1343's one unhandled error does not recur: [1344-I4](1344-I4-ui-failures.json) lists
    `unhandled: []`, after the U3 test-double fix 8b984d12 (1349).
  - Duration 738.15 s (Vitest). The recorder timed the run from 21:26:57.6 to 21:39:17.3 CDT. For comparison, 1343
    took 1,111.31 s.

### Attribution against 1343

- [1317-I-attribution.py](1317-I-attribution.py), unchanged, gives [1344-I4-ui-failures.json](1344-I4-ui-failures.json).
- [1344-I-compare.py](1344-I-compare.py) against [1343-I](1343-I-failures.json) gives
  [1344-I4-ui-vs1343.json](1344-I4-ui-vs1343.json): **CHANGED 3, GONE 7, NEW 0, SAME 0**, the sets of x3.
  - **CHANGED 3:** the `authored-rgba-export` tool-contract rows 6-8 (:138, :164, :178). They now fail on the missing
    numpy, where 1343 failed them on the missing Pillow ([1345-E](1345-E-pillow-environment-result.md)). These are
    environment failures already on record, and numpy stays an Owner question.
  - **GONE 7:** the Pillow rows (`authored-stage-a` 4-7 and `authored-rgba-export` current-production 3-5). They pass
    under the `.venv`.

### 1344-M2's four intermittent rows

None fails in this gate. For a timing row, the gate cannot separate the quiet machine from the Node change (see
[Node](#node)).

| Row | This gate |
|---|---|
| `livingTurn.scheduler` "runs 12 consecutive weeks …", 15 s budget | ✓ 11,853 ms |
| `StudioLotScreen` "moves Hollywood keyboard focus …" | ✓ 1,114 ms |
| `WorldFirstLiveWeekAdvance` "returns a real building-origin deep route …" | ✓ 1,397 ms |
| `WorldFirstStudioHome` "carries Lot root through … Talent Hub" | ✓ 840 ms |

One pass does not retire an intermittent, so 1344-M2's readings stand.
- **The deep-route row's history.**
  - 1344-M2's four runs at 644b9038 (Node v20.20.2) passed 2 of 4.
  - This gate at 469a9547 (Node v22.23.2) passed 1 of 1.
  - The two runs at 6b73e424 passed 2 of 2.
- Whether the deep-route row failed before shelving stays open, as M2 left it.
- It is not an identity in this gate.

## Against the 1344-N success line

| Clause (1344-N:80-82) | Result |
|---|---|
| Type gates clean | Yes. At HEAD 85764cd5, run after the gates, root, UI and Bridge each exit 0 ([1344-M3-type-gates-HEAD.txt](1344-M3-type-gates-HEAD.txt)). The tree is the gated tree plus docs. The x3 dry run was also clean. The applied tree differs from x3's in three test files, none of which changes a type: two HYGIENE comment edits, and the S9 commit's two regex literals and comments in `p14c3-transitions`. |
| Core identities equal 1338's 79 minus the exporter row | Yes. SAME 73 plus CHANGED 5 make 78, and GONE is the exporter row alone. |
| Same primaries | Yes for all 73 SAME rows. The core table names the five CHANGED rows. |
| The seven masked rows restored (1344-N:58) | Yes. C1, C15 ×2 and C3 ×3 are SAME with their 1338 primaries. The C20 row fails at its own assertion, as it already did in 1344-M (`:93:49`), and its message differs from 1338's only by the live version it embeds. 1344-N:58 groups it with the masked rows. |
| The four S10 rows attributed | Yes: 1344-X10, kept failing by 1344-F4 ruling 1. |
| Environment rows, attributed separately | No new environment row. The 3 numpy rows are environment failures already on record (1345-E). 1344-M's four load rows and 1344-M2's four intermittent rows pass; for these timing rows the gate cannot separate the quiet machine from the Node change. |
| UI equals 1343's 10, environment-adjusted | Yes. The `.venv` clears the 7 Pillow rows, and the 3 numpy rows wait on the Owner. |
| No new identity, as 1344-F6 §3 reads it | Yes. Core NEW is exactly the seven declared exceptions, and UI NEW is empty. |

[1344-M3-check.json](1344-M3-check.json): all ten checks of [1344-M3-check.py](1344-M3-check.py) hold.

## Node

- **What ran.** Both gates ran Node v22.23.2.
  - The baselines ran v20.20.2: 1338, 1343, 1344-M and 1344-M2, as their recorder JSON shows. So did the recorded runs
    of 1346, 1351 and 1352.
  - The 1353 recorded RED and GREEN runs, from 2026-09-30T18:19Z, already ran v22.23.2.
  - x3 recorded no version.
- **Why.** The repo pins no version (no `.nvmrc`, no `engines`). The session's nvm default is v22.23.2, and the runner
  took PATH from the session.
- **Identities and primaries: no change.** 1344-J3 item 9 gives three pieces of evidence across versions:
  - the 73 SAME primaries equal 1338's byte for byte, and 1338 ran v20.20.2;
  - the C20 received payload equals 1338's apart from the version digit and four empty `screenplayShelving` objects;
  - the GONE row and the UI rows behave as 1345-E measured them before the switch.
- **Durations: they moved** (1344-J3 item 9).
  - The 51 slow UI leaves of [1343-I-slow-leaves.tsv](1343-I-slow-leaves.tsv) ran at a median 0.75 of their 1343
    durations. The 16 synchronous bodies among them ran at 0.67.
  - The slowest `m5-determinism` leaf went from 300,268 ms to 133,531 ms.
  - The livingTurn 12-week leaf went from 16,195 ms to 11,853 ms, against its 15 s budget.
  - The gate cannot separate the Node version from the quiet machine.
- **Consequence.**
  - The success line needs no re-run (1344-J3 item 9).
  - A UI re-run under v20.20.2 would become necessary only if a closure called the M2 intermittent rows or the 1344-M
    load rows resolved. 1344-K does not.
- **Going forward.**
  - The §7 verification pinned v20.20.2, because its anchors compare bytes with 1329's outputs. Its log names the
    binary.
  - Later recorded runs pin v20.20.2 too, so the baselines and the runs share one environment.

## Reproduce

From the repo root, with the archived scripts unchanged. Each script refuses an existing output, so the outputs go to
a temporary directory and are compared with the committed files:

```
E=docs/engineering/playability-launch-review/evidence/p14b4-20260919; T=$(mktemp -d)
python3 $E/1321-I-attribution.py $E/1344-save43-sweep-broad-core.txt $T/core.json && cmp $T/core.json $E/1344-I3-core-failures.json
python3 $E/1344-I-compare.py $E/1344-I3-core-failures.json $E/1338-I-failures.json $T/cv.json && cmp $T/cv.json $E/1344-I3-core-vs1338.json
python3 $E/1317-I-attribution.py $E/1344-save43-sweep-broad-ui.txt $T/ui.json && cmp $T/ui.json $E/1344-I4-ui-failures.json
python3 $E/1344-I-compare.py $E/1344-I4-ui-failures.json $E/1343-I-failures.json $T/uv.json && cmp $T/uv.json $E/1344-I4-ui-vs1343.json
python3 $E/1344-M3-check.py $E/1344-I3-core-vs1338.json $E/1344-I4-ui-vs1343.json $T/check.json && cmp $T/check.json $E/1344-M3-check.json
```

`1344-M3-check.py` encodes the success line. Its expected sets come from x3
([1344-X9](1344-X9-save43-sweep-dry-run-x3.md)). The applied tree differs from x3's in the three test files named
above, and `p14c3-transitions` passes in both, so the sets stand. Run over x3's own comparisons, the checker fails on
exactly these rows, as it should:
- the 6 C17 rows that carry the scratch path;
- the 7 scratch-only Fake Unity rows;
- the hygiene row that the HYGIENE edit fixed.

## Next

- Confirmation of this revision: 1344-J4.
- 1344-K, after the §7 report (1344-V).
