# 1358-L: relationship slice B landing (the competitions log, Professional Rivals, romance, Save44, projection 57)

Status: **CLOSED.** The production ([1358-E](1358-E-rel-sliceB-production-handback.md), revision r2 in
[1358-E2](1358-E2-rel-sliceB-production-r2-handback.md)) landed with the Save44 and projection-57 pin sweep
([1358-N](1358-N-save44-pin-sweep-plan.md), revision r4; handback [1358-C9](1358-C9-sweep-landing-handback.md)).
- The recorded GREEN fails only the three row 6 exceptions.
- [1358-M3](1358-M3-sliceb-recorded-broad-gates.md) reproduces 1348-M's failing sets on both broad gates.
- The type gates and both generator checks pass at the landed HEAD.
- [1358-J3](1358-J3-sliceb-landing-review.md) reviewed the landing.

| Step | Commit | Evidence |
|---|---|---|
| RED r8 tests and the producer r4 hunk (1358-C8; reviews 1358-D, 1358-D2; rulings 1358-F4 to F8), applied with `git apply --index` from the staged patch (sha256 ef7c456a…) | 650e963a | [1358-X4](1358-X4-rel-sliceB-red-r8-run.md): 89 failed, 59 passed of 148 |
| Recorded mint `1358-sliceb-mint` at 650e963a | 4ad8e0f7 | [txt](1358-sliceb-mint.txt), [json](1358-sliceb-mint.json), [patch](1358-sliceb-mint.patch), pre/postflight: exit 0, `fixedSource` and `allGuardsExact` true |
| Recorded RED `1358-sliceb-red-recorded` at 4ad8e0f7 | 5245072a | [txt](1358-sliceb-red-recorded.txt), [json](1358-sliceb-red-recorded.json), [patch](1358-sliceb-red-recorded.patch), pre/postflight: **89 failed, 59 passed** (148), `fixedSource` and `allGuardsExact` true |
| Production steps 1 to 4, r2, one commit each (`land-sliceB-steps.sh`) | 9eb1e66e, 8df1858e, 615adeb2, 83d1030d | Each commit holds its step's increment of the staged cumulative patches (95d5a5d9…, eaa026e2…, 510c361b…, 2004b500…); the 13 files equal the reviewed step 4 blob for blob (1358-J3 check 1) |
| Pin sweep r4, applied with `git apply --index` from [1358-sweep-r4.patch](1358-stage/sweep-r4/1358-sweep-r4.patch) (94f0b476…) | f458680b | 154 test files, +1,058/-679, blob-equal to the reviewed scratch branch `sweep-r4`; [1358-C9](1358-C9-sweep-landing-handback.md) |
| The p57 source manifest | eb1c2512 | [1358-p57-declaration-source-manifest.json](1358-p57-declaration-source-manifest.json), sha256 5d605954… |
| Recorded producer `1358-p57-declaration` at eb1c2512 | 282ad680 | [txt](1358-p57-declaration.txt), [json](1358-p57-declaration.json), pre/postflight: exit 0, `fixedSource` and `allGuardsExact` true; F10 and F11 render to 1dadf88f…71fa4 (420,340 bytes); six fixed positives unchanged |
| F10 and F11 take the recorded values (1358-F9 P4) | 5ac4b738 | `tests/bridge-contract-generator.test.ts:732-733`, with a provenance comment |
| Recorded GREEN `1358-sliceb-green-recorded` at 5ac4b738 | b60db650 | [txt](1358-sliceb-green-recorded.txt), [json](1358-sliceb-green-recorded.json), pre/postflight: **3 failed, 145 passed** (148), the row 6 exceptions; `fixedSource` and `allGuardsExact` true |
| Recorded core gate `1358-sliceb-broad-core` at b60db650 | c5c0a0a6 | [1358-M3](1358-M3-sliceb-recorded-broad-gates.md): 85 failed; against 1348-I SAME 84, CHANGED 1 (C20), NEW 0, GONE 0 |
| Recorded UI gate `1358-sliceb-broad-ui` at c5c0a0a6 | (the closing commit) | [1358-M3](1358-M3-sliceb-recorded-broad-gates.md): 3 failed, the numpy rows; against 1348-I2 CHANGED 3 by the temporary directory alone, NEW 0, GONE 0 |
| Type gates and generator checks at the landed HEAD | (the closing commit) | [1358-L-type-gates.txt](1358-L-type-gates.txt): root, UI and Bridge exit 0 with no error; both generator checks exit 0 |

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


## Between the RED and the landing

- **[1358-X5](1358-X5-rel-sliceB-production-dry-run.md)** (324b8701) ran the four production steps on the landed
  RED. The classified reds fell to 62, 44, 10 and 3 with no mismatch, and both generator checks passed.
- **[1358-M2](1358-M2-rel-sliceB-fallout-measurement.md)** measured the fallout of step 4 r2 on a scratch tree.
  - Core showed 795 NEW rows, each a Save44 or projection-57 pin, a shared helper or an environment row.
  - The four natural routes kept every §7 measure.
  - Its snapshot probe found no `mentorEvidence` throw.
- **The pin sweep, revisions r1 to r4.**
  - 1358-N planned it. Seven author units (H, G1 to G6) and two follow-up units (F1, F2) wrote it.
  - The parent ruled on it in 1358-F9 to 1358-F12.
  - Dry runs: 1358-X6, X7t, X8 (the first full core run) and X9t.
  - Reviews: [1358-D9](1358-D9-sweep-r2-review.md) returned REFINE, and [1358-D9b](1358-D9b-sweep-r3-delta.md)
    CONFIRMED r3. r4 adds D9b's one comment fix.

## The landing

- **No recorded run was active during any commit.** 1358-J3 check 7 compares each commit time with the run windows in
  `recorded3.meta`.
- **The production steps.** `/Users/zacheryspector/studio-scratch/1358-land/land-sliceB-steps.sh` reversed each
  cumulative patch and applied the next. It committed `src`, `bridge` and `generated` only, then checked the 13 files
  against tag `step4` of the planner's scratch repo and pushed. Its log is `land-steps.meta`.
- **The sweep** came from the staged r4 patch. Before the commit, the parent checked every staged blob against
  `sweep-r4`.
- **The manifest** pins the producer's 17 inputs at f458680b, plus the producer and its tsconfig.
  - Step 4 moved four of those inputs before the manifest existed: `bridge-schema.ts`, the schema JSON, the generated
    C# and the contract manifest. The manifest pins their step-4 bytes.
  - It also pins `tests/bridge-contract-generator.test.ts` at f458680b's bytes (54,320, a97b19ba…). 5ac4b738 then
    moved that file to take the measured F10 and F11 values, as the 1328 manifest's file moved after its run.
  - The pin records the source the producer measured. It is not drift (1358-J3 finding 9).
- **The producer run.** A first attempt under `recorded2.sh` stopped before its preflight. Its check for existing
  outputs globbed `1358-p57-declaration-*` and matched the producer's own committed files. No recorded attempt began.
  `recorded3.sh` checks the five exact names that the recorder and guards write, and it ran the producer, the GREEN and
  both gates.
- **F10 and F11** take the recorded output. 1358-X9t's failing leaf had shown the same F10 value before the run, and the
  pins do not come from it (1358-J3 check 5).

## The recorded GREEN

- **Command.** `vitest run --project core` over the six files of the recorded RED, on Node v20.20.2. The recorder timed it from
  09:12:50.2 to 09:13:54.0 CDT.
- **Recorder.** The test command exited 1. The recorder and both guard steps exited 0. `fixedSource` and
  `allGuardsExact` are true at 5ac4b738.
- **Result.** 3 failed, 145 passed (148). The three failures are the 1344-F6 row 6 exceptions in `p14b5-relationships`
  (family 2, two leaves; family 5, one leaf). Each was also a failure of the recorded RED, and every other RED leaf
  passes.

## Type gates at the landed HEAD ([1358-L-type-gates.txt](1358-L-type-gates.txt))

`/Users/zacheryspector/studio-scratch/1358-land/landed-gates.sh` ran alone in the heavy lane after the UI gate's
postflight. It used HEAD c5c0a0a6, whose source is the landed tree, on Node v20.20.2, from 11:10:21 to 11:12:13 CDT.
- The root, UI and Bridge type gates each exit 0, with no error.
- `check:bridge-contract` and `check:bridge-contract:fixtures` each exit 0.
- The source paths stayed clean.

These are 1358-N's first two success lines, on the landed tree (1358-J3 R2).

## Review

[1358-J3](1358-J3-sliceb-landing-review.md) reviewed the nine landing commits, the scripts and the C9 draft, read-only.
- **Verdict: REFINE.** The landing itself met all nine checks, and the four required items were records:
  - C9's dispositions for N-0007 and N-0027;
  - the type gates at the landed HEAD;
  - C9's census wording;
  - this record.
- **What the parent did.**
  - Verified J3's claims against HEAD and corrected C9, along with recommendations N1 to N4.
  - Ran the gates (`landed-gates.sh`).
  - Brought this record up to the landing, committing it only after the UI gate's postflight.

## Status: CLOSED

- **Broad gates.** [1358-M3](1358-M3-sliceb-recorded-broad-gates.md) reproduces 1348-M's failing sets. C20's primary
  moves by the version digit, and slice B adds no failure.
- **The three row 6 leaves** stay failing as 1344-F6 declared exceptions.
- **Carried forward.** The closure findings in 1358-C9 carry forward without an edit. The Owner item on slice B's
  provisional copy (1358-F7 ruling 7) stands.
- **Next.** The P15 Wave 2 REDs rebase onto the Save44 base:
  - P15C RED r8 moves `BASE_LIVE_SAVE_VERSION` to 44 (1359-F6 ruling 5);
  - dry runs on Save43 and Save44 (1355-X5, 1356-X4, 1359-X6), with the two producers;
  - then their mints and recorded REDs;
  - the P15 reference patches retarget to Save45.
