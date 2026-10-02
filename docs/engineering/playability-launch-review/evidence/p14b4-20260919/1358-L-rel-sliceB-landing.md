# 1358-L: relationship slice B landing (the competitions log, Professional Rivals, romance, Save44, projection 57)

Status: **IN PROGRESS.** The RED and its GENUINE capture have landed. The production
([1358-E](1358-E-rel-sliceB-production-handback.md), revision r2 in [1358-E2](1358-E2-rel-sliceB-production-r2-handback.md))
lands together with the Save44 and projection-57 pin sweep, after its dry run (1358-X5), the fallout measurement
(1358-M2) and the sweep plan (1358-N).

| Step | Commit | Evidence |
|---|---|---|
| RED r8 tests and the producer r4 hunk (1358-C8; reviews 1358-D, 1358-D2; rulings 1358-F4 to F8), applied with `git apply --index` from the staged patch (sha256 ef7c456a…) | 650e963a | [1358-X4](1358-X4-rel-sliceB-red-r8-run.md): 89 failed, 59 passed of 148 |
| Recorded mint `1358-sliceb-mint` at 650e963a | 4ad8e0f7 | [txt](1358-sliceb-mint.txt), [json](1358-sliceb-mint.json), [patch](1358-sliceb-mint.patch), pre/postflight: exit 0, `fixedSource` and `allGuardsExact` true |
| Recorded RED `1358-sliceb-red-recorded` at 4ad8e0f7 | (this record) | [txt](1358-sliceb-red-recorded.txt), [json](1358-sliceb-red-recorded.json), [patch](1358-sliceb-red-recorded.patch), pre/postflight: **89 failed, 59 passed** (148), `fixedSource` and `allGuardsExact` true |

## The mint

- **Command.** `node_modules/.bin/vite-node E/1358-P-save43-producer.ts`, with `P14_SAVE43_PRODUCER_HEAD` set to
  650e963a. It ran under the bounded-source recorder and the guards, alone in the heavy lane
  (`/Users/zacheryspector/studio-scratch/1358-land/recorded.sh mint`), on Node v20.20.2, from 02:33:47.1 to
  02:33:57.0 CDT on 2026-10-02.
- **Output.** It wrote `tests/fixtures/p14/genuine-v43-pre-romance/`: `MANIFEST.json`,
  `genuine-v43-pre-romance-week-284.json.gz` (239,938 bytes) and its provenance JSON.
- **Equal to the dry run.** The save's gzip has sha256 a731677fc3cf73bc…, byte-identical to the capture of
  [1358-X2](1358-X2-rel-sliceB-red-r4-dry-run.md), which 1358-X3 and 1358-X4 used. `MANIFEST.json` differs from X2's
  only in `executionHead` (650e963a) and `elapsedMs`.
- **Raw output.** [1358-sliceb-mint.txt](1358-sliceb-mint.txt), 45,816 bytes, sha256
  bf1632d73622f8fa2ce85ea8e7a9431101cbde4df44c8b70ed172c8eab520619.

## The recorded RED

- **Command.** `node_modules/.bin/vitest run --project core` over the six files:
  - `p14b10-competitions-log`, `p14b10-labels` and `p14b10-save-v44`;
  - `bridge-p14b10-relationship-labels` and `p14b10-romance`;
  - `p14b5-relationships`.

  It ran alone in the heavy lane (`recorded.sh red`), on Node v20.20.2, from 02:34:43.5 to 02:35:32.6 CDT.
- **Recorder.** The test command exited 1 (failing tests). The recorder and both guard steps exited 0.
  - `fixedSource: true` and `allGuardsExact: true`.
  - Source sha 4ad8e0f7 at start and end, an empty tested diff, no untracked source.
- **Raw output.** [1358-sliceb-red-recorded.txt](1358-sliceb-red-recorded.txt), 148,350 bytes, sha256
  5cb377659db58dd518d1a29e1a8097f12e2c46e5943ff577301c80e0d32e3f8c.
- **Result.** 6 files failed. Tests: **89 failed, 59 passed** (148), in 47.53 s.
- **Identities.** [1321-I-attribution.py](1321-I-attribution.py) reads 89 failing identities from the raw output.
  They equal 1358-X4's 89 failed leaves exactly: r8's 86 failing classified rows plus the three 1344-F6 row 6
  exceptions in `p14b5-relationships`.
- **The GENUINE leaves** read the minted capture from the repository. As in X3 and X4, they pass their premises and
  fail on the missing Save44 law.

## Next

1. **1358-X5:** the four production step patches (r2) on this RED, run by
   `/Users/zacheryspector/studio-scratch/1358-x5/run-1358-X5.sh`, read against 1358-J's "What the dry run must show".
   Rows 56-58 there are rows 59-61 under r8.
2. **1358-M2:** broad core, UI and the four natural routes on a scratch tree with step 4 r2. It measures the fallout
   against [1348-M](1348-M-rel-sliceA-recorded-broad-gates.md).
3. **1358-N:** the sweep plan from 1358-E's and 1358-J's candidate lists and M2's measurement. Then the sweep, its
   review, the landing of the production steps with the sweep, the recorded GREEN and the broad gates.
