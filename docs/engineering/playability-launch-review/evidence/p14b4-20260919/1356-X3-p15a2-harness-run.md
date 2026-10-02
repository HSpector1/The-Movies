# 1356-X3: parent run of the P15A.2 slice 2a harness file, RED r4 and reference

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1356-x3/run-1356-X3.sh`, alone in the heavy lane under
  `HEAVY-LANE-LOCK`, 21:57:38-21:59:27 CDT on 2026-10-01. Node v22.23.2, the session default.
- **Tree.** A fresh scratch tree from repo HEAD 85764cd5. On it, the staged patches only:
  - RED r4 [1356-p15a2-wave2-red-r4.patch](1356-stage/1356-p15a2-wave2-red-r4.patch) (sha256 32397525…);
  - then the unchanged reference [1356-p15a2-wave2-reference.patch](1356-stage/1356-p15a2-wave2-reference.patch)
    (83cb2a59…).
- **File.** `tests/p15a2-power-ranking-archive-harness.test.ts` alone, as 1356-F5 orders. `--no-cache`, verbose and
  JSON reporters. The tree's `git status` was clean afterwards.
- **Outputs** stay in scratch (`/Users/zacheryspector/studio-scratch/1356-x3/`):

| File | Bytes | sha256 (first 16) |
|---|---:|---|
| `x3-red.txt` | 1,453 | 6378645fbe33d99e |
| `x3-red.json` | 2,253 | 7edc29de21f852e3 |
| `x3-red-tsc.txt` | 631 | 78076659ed94f9cb |
| `x3-ref.txt` | 844 | 70f025794b885c6a |
| `x3-ref.json` | 996 | a2468b14159caef5 |

## Results

| Run | Result | Declared (1356-C4) |
|---|---|---|
| RED | `rank-bounded-harness` fails in 751 ms: `RED: the state at week 13 has no top-level powerRanking root (1356-A §5)`, at `archiveOf` (harness :37) | the week-13 `archiveOf` error |
| Reference | passes in 58,028 ms | passes, with campaign, makeSave and validate summing to at most 300,000 ms |
| RED, root type gate | exit 2, 4 errors | not stated |

**The ceiling now fires.** At the reference, the proof line reads:
- 6,240 weeks, 480 records, archive 725,757 bytes, save 6,163,996 bytes, archive share 11.77 percent;
- `campaignMs` 56,892, `makeSaveMs` 528 and `validateSaveMs` 290, a sum of 57,710 ms against `CEILING_MS` 300,000.

The in-loop check and the sum assertion ran, and neither tripped. 1356-F5 D-1 is met: the harness times itself, and a
breach would fail by name.

**The RED type gate.** All four errors are TS2307 imports of the two modules production adds:
- `../src/core/powerRankingArchive.js` (archive-isolation :66, archive :85);
- `../src/core/p15Phases.js` (archive :97, :348).

They are RED at the type level by design, the convention of 1348-C5 and 1358-C. Production removes them. The harness
file adds no type error.
