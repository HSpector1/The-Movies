# 1355-X3: dry run of the P15A.1 producer r3 (1355-P) at HEAD

The P15A.1 Wave 2 producer r3 had never run. This run executes it once in scratch, in mint mode. It is not the mint.
**Exit 0: the pins and the shared capture below the P15 step are written, and r3's proof holds.** That proof reloads
the saved bytes and finds the paired in-flight picture released within the 26 natural ticks RED 16 leaf 2 runs.

## How it ran

- **Script.** [run-p15-producer-dry-runs.sh](1359-stage/run-p15-producer-dry-runs.sh), shared with
  [1359-X3](1359-X3-p15c-producer-r4-dry-run.md). It ran alone in the heavy lane on 2026-10-01 from 22:59:12 to
  22:59:39 CDT, Node v20.20.2.
- **Tree.** An archive of HEAD 26566be8, whose `src` equals b0809602's. It held:
  - the staged [RED r4](1355-stage/1355-p15a1-wave2-red-r4.patch), applied with `--include='tests/*'` (scratch
    commit 53bcc81);
  - a real, empty `tests/fixtures/p15/`;
  - only `node_modules` linked;
  - the producer at its E path, byte-equal to the staged
    [1355-P-p15a1-market-producer-r3.ts](1355-stage/1355-P-p15a1-market-producer-r3.ts) (sha256 5007e231…).
- **Command.** `P15A1_PRODUCER_HEAD=<scratch HEAD> P15A1_CAPTURE_MODE=mint vite-node <E>/1355-P-p15a1-market-producer.ts`.

## Result

- **Output** ([1355-X3-producer-output.txt](1355-stage/1355-X3-producer-output.txt)):
  - K1 at week 21, with `committed` null;
  - K2 at week 12;
  - M0A over 40 weeks;
  - the capture at week 30, with recent release `studio-315405e1-r01:film:0` and in-flight production
    `studio-315405e1-r03:film:2` (horror);
  - elapsed 3,872 ms.
- **Pins.** [1355-X3-dry-run-pins-MANIFEST.json](1355-stage/1355-X3-dry-run-pins-MANIFEST.json) holds:
  - Save43;
  - seeds `p15a1-w2-market-03` (market), `p15a1-w2-market-02` (rival) and `p15a1-w2-m0a-01` (M0A);
  - the reception digests;
  - the K1 file `k1-post-tick-week-21.json.gz` (68,219 bytes).
- **Shared capture.** [1355-X3-dry-run-capture-MANIFEST.json](1355-stage/1355-X3-dry-run-capture-MANIFEST.json):
  `fresh-market-week-30.json.gz` (69,635 bytes) on seed `p15a1-w2-market-02`, Save43.
- **Files.** All stay in scratch. The tree's `git status` shows only the new `tests/fixtures/`.

## For the mint

- **Order.** The pins are "minted at the RED commit on unchanged production" (1355-A §4). The shared capture is
  minted once at the last writer below the P15 step (1355-F Amendment 3), which 1356-C also reads.
- **Save version.** Slice B takes Save44, so the real capture will be Save44 or later. Its bytes and possibly its
  week will differ from this dry run's. The producer asserts its premises and writes nothing on a failure.
