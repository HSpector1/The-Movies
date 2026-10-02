# 1358-M3: slice B's recorded broad gates, with attribution

Status: **both gates reproduce 1348-M's failing sets.** Slice B and its pin sweep add no failure.
- **Core:** 85 failed. Against [1348-I](1348-I-core-failures.json), 84 are SAME and one, C20, is CHANGED: its primary embeds
  the live save version, now 44 (1358-F9 ruling 7).
- **UI:** 3 failed: the three numpy rgba rows of [1348-I2](1348-I2-ui-failures.json). Their primaries differ only in each
  run's temporary directory.
- **Slice B's five new files** pass in full: 95 tests. `p14b5-relationships` fails only its three 1344-F6 row 6
  exceptions.

[1358-L](1358-L-rel-sliceB-landing.md) closes on these gates.

## How the gates ran

- **Runner.** `/Users/zacheryspector/studio-scratch/1358-land/recorded3.sh core`, then `ui`, each detached under
  `lane-run.sh`, which held `HEAVY-LANE-LOCK` for the whole run. Before each run the script checked:
  - HEAD equal to the fetched remote branch head;
  - clean `src`, `tests`, `ui`, `bridge`, `generated` and `scripts`;
  - free disk of at least 5 GiB;
  - the stem against the recorder's rule;
  - no existing output under the stem's five names;
  - for core, a list of exactly 440 files.
- **Commits.** None during a run or its postflight. The core outputs were committed (c5c0a0a6) between the two gates.
- **Order.** Each run sits between the bounded-source guards: `pre`, then the recorder, then `post`.
- **Node.** v20.20.2, pinned. The 1345-E `.venv` was on PATH.
- **Trees.** Core ran at b60db650. UI ran at c5c0a0a6, which adds only core's outputs under `docs`, so its source equals
  b60db650's.

## Core

- **Run.** `1358-sliceb-broad-core`: `node_modules/.bin/vitest run --project core` over the 440 files of
  [1358-stage/m2/core-list.txt](1358-stage/m2/core-list.txt). The list holds 1348-M's 435 files plus slice B's five new
  files.
  - The six files that 1296-A excludes stay out, because they read Owner-derived or native inputs. 1348-M excluded the
    same six.
- **Recorder.** The test command exited 1 (failing tests). The recorder and both guard steps exited 0.
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha b60db650 at start and at end, an empty tested diff, no untracked source.
  - Files: [json](1358-sliceb-broad-core.json), [preflight](1358-sliceb-broad-core-preflight.json),
    [postflight](1358-sliceb-broad-core-postflight.json), [patch](1358-sliceb-broad-core.patch) (empty).
- **Raw output.** [1358-sliceb-broad-core.txt](1358-sliceb-broad-core.txt), 14,871,472 bytes, sha256
  3f03b422e2881560f39a6c0495cb3ae2adf3e1b440b109219266ae040888deb3.
- **Tally.**
  - Files: 23 failed and 417 passed (440).
  - Tests: **85 failed**, 4,992 passed, 3 skipped and 11 todo (5,091).
  - No unhandled error.
  - Duration 5,839.93 s (Vitest). The recorder timed the run from 09:15:11.0 to 10:52:33.5 CDT on 2026-10-02.
- **The 98 added tests.** Every file's test count equals 1348-M's, with these exceptions:

  | File | 1348-M | 1358-M3 | Why |
  |---|---|---|---|
  | `p14b10-romance` | (new) | 37, all pass | slice B RED |
  | `p14b10-save-v44` | (new) | 25, all pass | slice B RED |
  | `bridge-p14b10-relationship-labels` | (new) | 14, all pass | slice B RED |
  | `p14b10-labels` | (new) | 12, all pass | slice B RED |
  | `p14b10-competitions-log` | (new) | 7, all pass | slice B RED |
  | `p14b5-relationships` | 51, 3 failed | 53, 3 failed | slice B RED |
  | `bridge-runtime-checkpoint` | 71 | 72, all pass | the projection-v56 identity joins the prior-schema roster (census N-0198) |

### Attribution against 1348-I

- [1321-I-attribution.py](1321-I-attribution.py), unchanged, gives
  [1358-I-core-failures.json](1358-I-core-failures.json): 85 failed cases.
- [1344-I-compare.py](1344-I-compare.py) against [1348-I](1348-I-core-failures.json) gives
  [1358-I-core-vs1348I.json](1358-I-core-vs1348I.json): **SAME 84, CHANGED 1, NEW 0, GONE 0.**
- **The CHANGED row is C20,** `p14c3-save-v38` "exposes matching strict38 conversion, validation and current migration
  over a genuine37 save", at :105:49. Its primary reads:
  - 1358: "expected '{"broadcastCache":[],"saveVersion":44…' to be '{"broadcastCache":[],"saveVersion":38…'";
  - 1348: the same, with 43 in place of 44.

  The leaf compares the live migration with the strict Save38 conversion, so the live version appears in its primary.
  1358-F9 ruling 7 kept the row as a retained identity (census N-0042).
- **The other 84** fail again with their 1348 primaries. They include:
  - the three row 6 exceptions;
  - D07 and D18;
  - the ledger-seed chain digests at `bridge-p14b5-relationships:544` and :564;
  - the `p13a-scientist-foundation` and `p14b4-rival-seating-preference` rows that 1358-C9 lists.

### What the core gate shows beyond the tally

- **The F10 and F11 pins hold.** `bridge-contract-generator` passes all 31 tests, including the P4 leaf at
  1dadf88f… (5ac4b738) and G2's identity pin at 74826ef4….
- **The scratch artifacts of 1358-X8 do not occur here.**
  - `bridge-supervisor` passes 14 of 14; its seven "Fake Unity" rows were a scratch-tree process artifact.
  - The six `r3n1-stale-schedule-take-02*` rows keep 1348's primaries, because the repo path is the same.
- **The week-93 control passes.** `p14d1-rival-shelving` passes 28 of 28 (1358-F12 ruling 7).

## UI

- **Run.** `1358-sliceb-broad-ui`: `node_modules/.bin/vitest run --project ui`, with the 1345-E `.venv` on PATH.
- **Recorder.** The test command exited 1. The recorder and both guard steps exited 0.
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha c5c0a0a6 at start and at end, an empty tested diff, no untracked source.
  - Files: [json](1358-sliceb-broad-ui.json), [preflight](1358-sliceb-broad-ui-preflight.json),
    [postflight](1358-sliceb-broad-ui-postflight.json), [patch](1358-sliceb-broad-ui.patch) (empty).
- **Raw output.** [1358-sliceb-broad-ui.txt](1358-sliceb-broad-ui.txt), 219,881 bytes, sha256
  cd392d9fb57c83a0642cb4fc3407101d7d011479d5bff633de24fdef3a1951a8.
- **Tally.**
  - Files: 1 failed and 203 passed (204).
  - Tests: **3 failed**, 2,689 passed and 5 skipped (2,697).
  - No unhandled error.
  - Duration 869.66 s (Vitest). The recorder timed the run from 10:55:16.9 to 11:09:48.4 CDT.
- **Test counts.** Every file's test count equals 1348-M's (204 files, 2,697 tests). The sweep edited five UI test
  files and added no test.

### Attribution against 1348-I2

- [1317-I-attribution.py](1317-I-attribution.py) gives [1358-I2-ui-failures.json](1358-I2-ui-failures.json): 3 failed
  cases.
- [1344-I-compare.py](1344-I-compare.py) against [1348-I2](1348-I2-ui-failures.json) gives
  [1358-I2-ui-vs1348I2.json](1358-I2-ui-vs1348I2.json): **CHANGED 3, NEW 0, GONE 0.**
- **The three rows** are the rgba-export tool contract's leaves 6, 7 and 8 in `ui/src/lot/authored-rgba-export.test.ts`,
  which need numpy (1345-E).
  - Each primary names the temporary directory its run created.
  - With that directory normalized, each primary equals 1348-I2's. 1348-M recorded the same difference against
    1344-I4.

## What the gates close

- The 1358-N success line holds on recorded runs:
  - core identities equal 1348-I's 85, with C20 CHANGED by the version digit;
  - UI equals 1348-I2;
  - no new identity.
- The type gates and both generator checks at the landed HEAD are in
  [1358-L-type-gates.txt](1358-L-type-gates.txt) (1358-J3 R2).
- With 1358-C9's classification and dispositions and 1358-J3's review, [1358-L](1358-L-rel-sliceB-landing.md) closes.
