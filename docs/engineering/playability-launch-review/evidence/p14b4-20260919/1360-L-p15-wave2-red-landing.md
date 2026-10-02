# 1360-L: the P15 Wave 2 RED landing on the Save44 base (P15A.2 slice 2a, P15A.1 Wave 2, P15C Wave 2)

Status: **CLOSED.** The three Wave 2 REDs and both P15 captures have landed by
[1360-F](1360-F-parent-rulings-p15-wave2-red-landings.md)'s ten-step sequence, amended by
[1360-F2](1360-F2-parent-response-to-1360-D.md) and [1360-F3](1360-F3-parent-response-to-1360-D2.md).
- **The replay.** Every step equals [1360-X](1360-X-p15-wave2-landing-replay.md), the scratch replay of the whole
  sequence, in the sense 1360-F2 ruling 4 defines.
- **The recorded runs.** All five ran with `fixedSource` and `allGuardsExact` true.
- **The reviews.** [1360-D](1360-D-p15-wave2-landing-review.md) reviewed the plan, and
  [1360-D2](1360-D2-p15-wave2-landing-recheck.md) cleared step 8.
- **The type gates** at the landed HEAD equal 1360-X's: root has the six missing-module errors; UI, Bridge and both
  generator checks are clean.

| # | Step | Commit | Evidence |
|---|---|---|---|
| 1 | The 1356 RED r4 (creates `tests/helpers/p15-roots.ts`), from the staged patch (32397525…) | 10b9be41 | four blobs equal the patch's index lines (1360-D) |
| 2 | Recorded RED `1360-p15a2-red-recorded` at 10b9be41, before any mint | fdc12c41 | [txt](1360-p15a2-red-recorded.txt), [json](1360-p15a2-red-recorded.json): **70 failed, 2 passed** (72) |
| 3 | The 1355 RED r4 without its `p15-roots.ts` hunk, line 10 merged to three keys, and the producer r3 at the E root | e4be3e5c | `p15-roots.ts` blob 08fc351c…, 1355's own version; producer sha256 5007e231… |
| 4 | Recorded mint `1360-p15a1-mint` at 601ea709 (source equal to e4be3e5c's) | 6ce916cb | [txt](1360-p15a1-mint.txt), [json](1360-p15a1-mint.json): exit 0; both MANIFESTs equal 1360-X's |
| 5 | The P15A.1 fixtures, the mint's outputs, and `CAPTURE_MANIFEST_SHA256` = 410d48a8… | 6ce916cb | `tests/p15a1-market-integration.test.ts:714-715` |
| 6 | Recorded RED `1360-p15a1-red-recorded` at 6ce916cb | 0240115a | [txt](1360-p15a1-red-recorded.txt), [json](1360-p15a1-red-recorded.json): **51 failed, 8 passed** (59) |
| 7 | The 1359 RED r8 without its `p15-roots.ts` hunk, line 10 merged to four keys, and the producer r4 at the E root | 6ac55a37 | `p15-roots.ts` blob 2f2acc5f…, the integration test 80694a20… (1360-D finding 5) |
| 8 | Recorded mint `1360-p15c-mint` at 6044ad4f (source equal to 6ac55a37's), after 1360-D2's PROCEED | 840cf1c7 | [txt](1360-p15c-mint.txt), [json](1360-p15c-mint.json): exit 0; the MANIFEST equals 1360-X's |
| 9 | The route L captures and the mint's outputs | 840cf1c7 | `tests/fixtures/p15/p15c2-route-l-captures/` |
| 10 | Recorded RED `1360-p15c-red-recorded` at 840cf1c7 | e16b782e | [txt](1360-p15c-red-recorded.txt), [json](1360-p15c-red-recorded.json): **40 failed, 76 passed** (116) |
| | Type gates and generator checks at e16b782e | (the closing commit) | [1360-L-type-gates.txt](1360-L-type-gates.txt) |

## The mints

Both producers ran once, alone in the heavy lane, on Node v20.20.2, under the recorder and the guards
([recorded-p15-v2.sh](1360-stage/land/recorded-p15-v2.sh)). Each wrote only its own output directories. The mints
are deterministic: each MANIFEST matches its 1360-X counterpart field for field, apart from `executionHead`,
`elapsedMs` and `routeMs` ([cmp-manifest.py](1360-stage/d/cmp-manifest.py)).

| Mint | Ran (CDT, 2026-10-02) | Wrote | Against 1360-X |
|---|---|---|---|
| 1355-P r3, `P15A1_CAPTURE_MODE=mint`, HEAD 601ea709 | 12:32:06 to 12:32:12 | `genuine-below-p15-save-step/`: the Save44 capture at week 30 (`fresh-market-week-30.json.gz`, 69,689 bytes, gzip sha256 45377fe4…); `p15a1-market-pins/`: K1 at week 21 (68,293 bytes), K2 at week 12, M0A over 40 weeks | 13 and 146 fields; none differ |
| 1359-P r4, HEAD 6044ad4f | 12:39:15 to 12:39:24 | `p15c2-route-l-captures/`: route L at weeks 6239 (68,078 bytes, 8d82fbc3…) and 6240 (78,045 bytes, 50e79023…), `saveVersion` 44 | 17 fields; none differ |

- **Source equality.** `git diff e4be3e5c 601ea709` and `git diff 6ac55a37 6044ad4f` change no source path; only HANDOFF
  and E records moved. The MANIFESTs' `executionHead` therefore names a commit whose source equals the RED commit's
  (1355-A:161).
- **Raw outputs.**
  - [1360-p15a1-mint.txt](1360-p15a1-mint.txt): 46,012 bytes, sha256 5b0cb2686803ce98d27a03abc90523a80d118b04440eab38730e689a11a5978c.
  - [1360-p15c-mint.txt](1360-p15c-mint.txt): 46,061 bytes, sha256 71b227acfd66a0234f578275d82ace38f58d0860935106431b4477aa489b4a57.

## The recorded REDs

Each ran `node_modules/.bin/vitest run --project core` over its RED's three files. The test command exited 1 (failing
tests). The recorder and both guard steps exited 0, with an empty tested diff and no untracked source.

| Stem | Ran (CDT) | Files | Result | Raw output |
|---|---|---|---|---|
| `1360-p15a2-red-recorded` | 11:57:02 to 11:57:25 (20.55 s) | `p15a2-power-ranking-archive`, `-isolation`, `-harness` | 70 failed, 2 passed (72) | 105,656 bytes, sha256 3956e3b5… |
| `1360-p15a1-red-recorded` | 12:32:53 to 12:33:04 (9.22 s) | `p15a1-market-integration`, `-phases`, `-atomicity` | 51 failed, 8 passed (59) | 104,845 bytes, sha256 aa42e8f4… |
| `1360-p15c-red-recorded` | 12:39:50 to 12:40:44 (52.84 s) | `p15c2-campaign-legacy-integration`, `p15c-wave-r-retention`, `p15c1-campaign-legacy` | 40 failed, 76 passed (116) | 83,519 bytes, sha256 b026b36a… |

[cmp-recorded.py](1360-stage/land/cmp-recorded.py) compares each run with its 1360-X stage, leaf by leaf. The failing
sets are equal, and every first message line is equal, apart from the importing file's path in Vite load errors
(1360-F3 ruling 3).
- **1356 against s2:** 70 of 70.
- **1355 against s6:** 51 of 51.
  - The four pin controls pass: `market-seam-default-exact`, K1, K2 and M0A.
  - Both `market-old-save` capture leaves fail at `expected 44 to be 43`, their classified final reason.
  - No leaf reports FIXTURE PENDING.
- **1359 against s10:** 40 of 40, equal to r8's 40 fail rows.
  - C2-C4 fail by name: "RED: the route L captures are Save44, the live version: the Legacy's save step has not landed
    above them (1359-A §5.2)".

## Type gates at the landed HEAD

[1360-L-type-gates.txt](1360-L-type-gates.txt) ran at e16b782e, from 12:41:28 to 12:43:47 CDT, on Node v20.20.2
([landed-gates.sh](1360-stage/land/landed-gates.sh)).
- **Root** exits 2 with exactly six TS2307 errors, byte-equal to 1360-X s12:
  - four from 1356: two name `powerRankingArchive.js`, two `p15Phases.js`;
  - two from 1355, both naming `p15Phases.js`.
- **The rest are clean.** `ui/tsconfig.json`, `tsconfig.bridge.json`, `check:bridge-contract` and
  `check:bridge-contract:fixtures` all exit 0. The source paths were clean afterwards.

## What the next broad gates inherit

- **New files.** The core list gains the six new test files:
  - `p15a2-power-ranking-archive` and `-isolation`;
  - `p15a1-market-integration`, `-phases` and `-atomicity`;
  - `p15c2-campaign-legacy-integration`.

  The 1356 harness file runs as its own run (1360-F ruling 10). `p15c-wave-r-retention` and `p15c1-campaign-legacy`
  were already on the list; the 1359 RED edited them.
- **Expected NEW identities** are these REDs' failing leaves, as this record lists them, plus one movement measured in
  advance. `rank-root-migration-genuine-below-step-capture` now fails at `expected 44 to be 43`, because the 1355 mint
  exists (1360-X s11).
- **The root type gate** carries the six errors above until the productions add `src/core/p15Phases.ts` and
  `src/core/powerRankingArchive.ts`.

## Open items

1. **The Save45 productions** (1360-F ruling 1; 1360-F2 ruling 2).
   - The single writer authors P15A.2 slice 2a, then P15A.1, then P15C on the Save44 base, and they land together
     behind one Save45 sweep.
   - Save45 stays reserved, and no commit that changes `src/` lands before it (1360-F3 ruling 5).
2. **G2's control** runs on an archive of e4be3e5c, as K3's baseline (1355-F4:41; 1360-F2 ruling 6).
3. **P15C's G-P gate** runs on the tree its production lands on, after the probe gains a branch for the sibling roots
   (1353-F7:64-68). If P15C misses Save45, its fallback re-pins C2-C4, and C3b once the sibling test lands
   (1360-F3 ruling 1).
4. **1356's optional capture sha pin** (`1356 patch :1179-1180`) stays unadopted. The 1355 pin guards the same bytes
   (1360-F ruling 4).
5. **The `fixturePending` flag** means different things in the 1355 and r8 classifications, so a census reads each
   file on its own terms (1360-F2 ruling 6).
6. **P15B** waits on Owner question 1357-Q1.
