# 1359-X3: dry run of the P15C producer r4 (1359-P) at HEAD

[1359-D4](1359-D4-p15c-wave2-red-r4-r5-confirmation.md) open item C4 ND5 noted that producer r4 had never run. This
run executes it once in scratch. It is not the mint. **Exit 0: route L reaches weeks 6239 and 6240 through the
migration-origin founding, and both captures validate as Save43.**

## How it ran

- **Script.** [run-p15-producer-dry-runs.sh](1359-stage/run-p15-producer-dry-runs.sh), alone in the heavy lane under
  `HEAVY-LANE-LOCK`, on 2026-10-01 from 22:59:12 to 22:59:39 CDT for both producers, Node v20.20.2. Its log is
  [p15-producer-dry-runs-log.txt](1359-stage/p15-producer-dry-runs-log.txt).
- **Tree.** An archive of HEAD 26566be8, whose `src` equals b0809602's. It held:
  - the staged [RED r5](1359-stage/1359-p15c-wave2-red-r5.patch), applied with `--include='tests/*'` (scratch commit
    455e5b6);
  - a real, empty `tests/fixtures/p15/`;
  - only `node_modules` linked;
  - the producer at its E path, byte-equal to the staged
    [1359-P-p15c2-route-l-producer-r4.ts](1359-stage/1359-P-p15c2-route-l-producer-r4.ts) (sha256 78c1d105…).
- **Command.** `P15C2_PRODUCER_HEAD=<scratch HEAD> vite-node <E>/1359-P-p15c2-route-l-producer.ts`.

## Result

- **Output** ([1359-X3-producer-output.txt](1359-stage/1359-X3-producer-output.txt)): weeks 6239 and 6240,
  `saveVersion` 43. Route times: 2,278 ms headless to 6188, then 4,924 ms from 6188 to 6241. Elapsed 7,706 ms.
- **The dry-run MANIFEST** ([1359-X3-dry-run-MANIFEST.json](1359-stage/1359-X3-dry-run-MANIFEST.json)):
  - seed `1359-legacy-late-founding-01`;
  - the route as 1359-F3 describes it;
  - `route-l-week-6239`: 68,024 bytes gzip, 565,288 decoded;
  - `route-l-week-6240`: 77,999 bytes gzip, 659,328 decoded.
- **Captures.** These stay in scratch. The tree's `git status` shows only the new `tests/fixtures/`.

## For the mint

The mint runs under the recorder at the last writer below the Legacy's save step, at a HEAD carrying the RED
(the producer header). Slice B takes Save44, so the captures will then be Save44 or later. Their bytes will differ
from this dry run's. The producer asserts its premises and writes nothing on a failure.
