# 1344-M3: the Save43 sweep's recorded broad gates, with attribution

Status: **the 1344-N success line holds on both recorded gates.** Core: 85 failed, which are 1338's 79 retained identities minus the exporter row, plus the seven declared exceptions of 1344-F6. UI: 3 failed, the numpy rows. No environment row and no new identity appeared.

The recorded gates measure the applied Save43 pin sweep (cec3902c, [1344-C5](1344-C5-save43-sweep-handback.md),
review [1344-D4](1344-D4-save43-sweep-review.md)) against the 1344-N success line (1344-N:80-82), read with the seven
declared exceptions of [1344-F6](1344-F6-parent-ruling-declared-exceptions.md) §3.

## How the gates ran

- **Runner.** `/Users/zacheryspector/studio-scratch/1344-gates/run-gates.sh`, launched detached at 20:08:07 CDT on
  2026-10-01, under `caffeinate`. Before the first run it checked:
  - no vitest running;
  - HEAD equal to the fetched remote branch head;
  - clean `src`, `tests`, `ui`, `bridge` and `generated`;
  - free disk of at least 5 GiB;
  - no existing output for either stem;
  - a core list of 433 files.
- **The heavy lane.** The runner held `HEAVY-LANE-LOCK` from start to end. No other test or type-check process ran
  beside the gates. The 1359-C4 author's last single-file run ended at 20:07:01, before the core run started.
- **Order.** Core, then UI, each between the bounded-source guards (`pre`, the recorder, `post`).
- **Node.** v22.23.2, the session's nvm default. 1338, 1343, 1344-M and 1344-M2 ran v20.20.2. The repo pins no
  version (no `.nvmrc`, no `engines`). The section on Node below gives the effect.

## Core

- **Run.** `1344-save43-sweep-broad-core` at HEAD and remote 469a9547: the sweep commit cec3902c plus a HANDOFF.md
  commit.
  - Command: `node_modules/.bin/vitest run --project core` over the 433 files of
    `/Users/zacheryspector/studio-scratch/1344-merge/core-list.txt`. That is 1344-M's 429 files plus
    `p15b1-corporate-condition`, `p15b1-studio-loan`, `p15c1-campaign-legacy` and `p15c-wave-r-retention`.
  - PATH carried the 1345-E `.venv`.
- **Recorder.** Exit code 1 (failing tests).
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
  - Duration 4,718.06 s (20:08:13 to 21:26:53 CDT), against 5,128.59 s for 1338 and 7,611.77 s for 1344-M under load.

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
| GONE | 1 | The `world-first-scenery-load-in-provenance` exporter row, 1338's benign temporary-directory row. |

Two kinds of x3 rows do not appear here:
- **The seven `bridge-supervisor` "Fake Unity" rows.** The file passes 14 of 14 in the repo. This confirms 1320-X:12:
  the rows fail only in scratch trees.
- **The `hygiene` row.** `hygiene.test.ts` passes, after HYGIENE commit 62f14e7.

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
- **Recorder.** Exit code 1 (failing tests).
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha 469a9547 at start and at end, an empty tested diff, no untracked source.
  - Files: [json](1344-save43-sweep-broad-ui.json), [preflight](1344-save43-sweep-broad-ui-preflight.json),
    [postflight](1344-save43-sweep-broad-ui-postflight.json).
- **Raw output.** [1344-save43-sweep-broad-ui.txt](1344-save43-sweep-broad-ui.txt), 211,558 bytes, sha256
  f86972d5909095e66ab54520f09c9c9ccce9bb9046108b1939de3a382788a3c3.
- **Tally.**
  - Files: 1 failed and 203 passed (204).
  - Tests: **3 failed**, 2,689 passed and 5 skipped (2,697).
  - No unhandled error.
  - Duration 738.15 s (21:26:58 to 21:39:17 CDT), against 1,111.31 s for 1343.

### Attribution against 1343

- [1317-I-attribution.py](1317-I-attribution.py), unchanged, gives [1344-I4-ui-failures.json](1344-I4-ui-failures.json).
- [1344-I-compare.py](1344-I-compare.py) against [1343-I](1343-I-failures.json) gives
  [1344-I4-ui-vs1343.json](1344-I4-ui-vs1343.json): **CHANGED 3, GONE 7, NEW 0, SAME 0**, the sets of x3.
  - **CHANGED 3:** the `authored-rgba-export` tool-contract rows 6-8 (:138, :164, :178). They now fail on the missing
    numpy, where 1343 failed them on the missing Pillow ([1345-E](1345-E-pillow-environment-result.md)). numpy stays
    an Owner question.
  - **GONE 7:** the Pillow rows (`authored-stage-a` 4-7 and `authored-rgba-export` current-production 3-5). They pass
    under the `.venv`.

### 1344-M2's four intermittent rows

None fails on the quiet machine:

| Row | This gate |
|---|---|
| `livingTurn.scheduler` "runs 12 consecutive weeks …", 15 s budget | ✓ 11,853 ms |
| `StudioLotScreen` "moves Hollywood keyboard focus …" | ✓ 1,114 ms |
| `WorldFirstLiveWeekAdvance` "returns a real building-origin deep route …" | ✓ 1,397 ms |
| `WorldFirstStudioHome` "carries Lot root through … Talent Hub" | ✓ 840 ms |

One pass does not retire an intermittent, so 1344-M2's readings stand.
- The deep-route row now passes in 3 of 5 runs at HEAD and in 2 of 2 at 6b73e424.
- Whether it failed before shelving stays open, as M2 left it.
- It is not an identity in this gate.

## Against the 1344-N success line

| Clause (1344-N:80-82) | Result |
|---|---|
| Type gates clean | Yes at x3, whose tree equals the applied one (1,192 files; `src` and `generated` identical). The type gates at HEAD run after §7 in the heavy-lane queue, for 1344-K. This record does not claim them. |
| Core identities equal 1338's 79 minus the exporter row | Yes. SAME 73 plus CHANGED 5 make 78, and GONE is the exporter row alone. |
| Same primaries | Yes for all 73 SAME rows. The five CHANGED rows are named in the core table. |
| The seven masked rows restored (1344-N:58) | Yes. C1, C15 ×2 and C3 ×3 are SAME with their 1338 primaries. The C20 row fails at its own assertion again, and its message differs only by the live version it embeds. |
| The four S10 rows attributed | Yes: 1344-X10, kept failing by 1344-F4 ruling 1. |
| Environment rows, attributed separately | None appeared. 1344-M's four load rows and 1344-M2's four intermittent rows all pass. |
| UI equals 1343's 10, environment-adjusted | Yes. The `.venv` clears the 7 Pillow rows, and the 3 numpy rows wait on the Owner. |
| No new identity, as 1344-F6 §3 reads it | Yes. Core NEW is exactly the seven declared exceptions, and UI NEW is empty. |

[1344-M3-check.json](1344-M3-check.json): all ten checks of [1344-M3-check.py](1344-M3-check.py) hold.

## Node

- **What ran.** Both gates ran Node v22.23.2. 1338, 1343, 1344-M and 1344-M2 ran v20.20.2, as their recorder JSON
  shows.
- **Why.** The repo pins no version. The session's nvm default is v22.23.2, and the runner took PATH from the session.
- **Effect.** None that the gates can see:
  - every SAME row's primary equals 1338's, digests and messages included;
  - every CHANGED and NEW row's primary equals x3's;
  - the skip and todo counts equal x3's.
- **Going forward.**
  - The §7 verification pins v20.20.2, because its anchors compare bytes with 1329's outputs. Its log names the
    binary.
  - Later recorded runs pin v20.20.2 too, so the baselines and the runs share one environment.

## Reproduce

From the repo root, with the archived scripts unchanged:

```
python3 E/1321-I-attribution.py E/1344-save43-sweep-broad-core.txt E/1344-I3-core-failures.json
python3 E/1344-I-compare.py E/1344-I3-core-failures.json E/1338-I-failures.json E/1344-I3-core-vs1338.json
python3 E/1317-I-attribution.py E/1344-save43-sweep-broad-ui.txt E/1344-I4-ui-failures.json
python3 E/1344-I-compare.py E/1344-I4-ui-failures.json E/1343-I-failures.json E/1344-I4-ui-vs1343.json
python3 E/1344-M3-check.py E/1344-I3-core-vs1338.json E/1344-I4-ui-vs1343.json E/1344-M3-check.json
```

`1344-M3-check.py` encodes the success line. Its expected sets come from x3 ([1344-X9](1344-X9-save43-sweep-dry-run-x3.md)),
whose tree equals the applied one apart from the HYGIENE comments. Run over x3's own comparisons, it fails on exactly
the 6 scratch-path C17 rows and the 8 scratch-only rows (7 Fake Unity, 1 hygiene), as it should.

## Next

- An independent read-only review, 1344-J3.
- §7 runs next in the heavy lane, then the type gates at HEAD for 1344-K.
