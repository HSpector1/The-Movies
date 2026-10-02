# 1360-D2: recheck of 1360-F2 and recorded-p15-v2.sh

- **Scope.** Read-only, under the same rules as 1360-D. HEAD 6ce916cb; clock read at 12:37 CDT with `date`.
- **Fixtures read.** Outside docs and scripts, I read only the two P15 MANIFEST.json files, through `git show HEAD:`.
- **Line references.** "v2 :N" is a line of `S/1360-land/recorded-p15-v2.sh`.

**Verdict: PROCEED to step 8 once step 7 lands and passes its blob check (1360-F2:61-64).** F2 closes both required
items, and v2 closes finding 3. The five notes in section 5 are low, and none blocks step 8.

## 1. Required item 1: closed by F2 ruling 1

- **The fallback.** 1360-F2:12-17 declares P15C's fallback in four parts:
  - a helper edit moves `CAPTURE_DIRECTORY`;
  - a recorded mint runs again at the last writer below P15C's step;
  - C2-C4 re-pin;
  - the Save44 directory retires.
- **The mechanism works.** 1359-P imports `CAPTURE_DIRECTORY` from that helper (1359-P r4 :40-42), and so does the RED
  (1359 patch :66, :379). One constant therefore moves both the writer and the readers.
- **The producer keeps its sha.** Its bytes do not change, so r4's sha still passes v2 :57.
- **The reason to mint now holds.** The gating G-P runs on a tree that carries P15A.1 Wave 2 (1353-F7:64-65). A hold
  would delay the recorded RED until the sibling productions exist (1360-F2:19-21).

## 2. Required item 2: closed by F2 ruling 2

| Claim | F2 | Source check |
|---|---|---|
| Save45 reserved; no other save step takes 45 | :23-24 | Within authority: 1355-F:40-42; 1357-A:333-335 lets the parent batch P15B |
| No production commit before Save45 | :25-26 | Agrees with 1358-F3:46-47 and 1360-R:260 on "last writer" |
| 1357-Q1 (a) | :27-33 | 1357-F2:84-86: (a) charters "rival cost-cutting and the cause of the filming stall" |
| `recordedFromWeek` cost | :34-37 | 1359-A:273-276 and 1356-A:242-243 say what F2 says |
| A bound on the wait | :38-40 | A named checkpoint: slice 2a's production has passed review and its dry run. The re-pins fall to 1355-F5 and to ruling 1 |

## 3. Finding 3: closed by `recorded-p15-v2.sh`

- **3a, the producer.** v2 :55-57 checks that the producer is in HEAD's tree, equals HEAD, and carries its staged sha.
  The pinned shas equal r3 (5007e231…, v2 :33) and r4 (78c1d105…, v2 :36).
- **3b, the meta.** v2 :77-82 logs the recorder exit, the post exit, the command `exitCode` from `<stem>.json`, and
  the files a mint wrote. Step 4's meta shows all four (`recorded-p15.meta:10-13`).
- **3c, the output directories.** v2 :58 stops on each path in OUT (v2 :33, :36). Those paths equal the producers'
  constants (`p15a1-market-route.ts:499-500`; 1359 patch :379).
- **3d, the pin and the captures.** v2 :59-64 holds the checks.
  - The `red1355` check passed at step 6.
  - Its pin, 410d48a8…, equals the sha256 of HEAD's capture MANIFEST.
- **mint1359.**
  - PRODUCER (v2 :35) is ruling 9's name.
  - PSHA 78c1d105…5186 is r4's.
  - ROUTEDIR (v2 :28) is r4's output directory.
- **red1359.** v2 :63-64 requires the route L MANIFEST in HEAD. The clean check (v2 :44) catches an uncommitted gz.

## 4. Steps 4 to 6, as measured

- **Step 4** ran at 601ea709, a docs-only descendant of e4be3e5c.
  - exitCode 0, fixedSource and allGuardsExact.
  - `cmp-manifest.py` finds 0 differing fields: 13 in the capture MANIFEST and 146 in the pins MANIFEST.
- **Step 5's** pin equals HEAD's capture MANIFEST sha256. The commit also edits the comment above the pin
  (`tests/p15a1-market-integration.test.ts:714`), with no line shift.
- **Step 6** ran at 6ce916cb.
  - 51 failed and 8 passed, with fixedSource and allGuardsExact.
  - Every failing leaf's status and first message equal s6's, apart from two Vite load-error paths.
  - The reporter lists two of the passes, and both are among s6's eight.

## 5. Notes on F2 (low; none blocks step 8)

1. **C3b also reads route L.** Ruling 1 names C2-C4 only. The sibling patch's
   `legacy-migration-before-boundary-siblings-limited` also reads route L through `captureAt`
   (`1359-p15c-wave2-sibling-r2.patch:91-92`); 1359-P r4 :3-4 calls it C3b. It follows the helper edit, but its
   expectations re-pin too.
2. **The 1357-Q1 case (1360-F2:27-33) leaves out two details.**
   - K3's baseline must move with the pins, but ruling 6 fixes G2's control arm to an archive of e4be3e5c
     (1360-F2:67-68).
   - "Retire" must remove the committed directories before either producer can mint again. 1355-P refuses an existing
     pins directory in either mode (1355-P r3 :64-65), and 1359-P refuses its own directory (1359-P r4 :59).
3. **Ruling 4 counts the load-error exceptions** (1360-F2:52-53). Vite names whichever test file loaded the missing
   module first, so the exception should cover any leaf whose first message is a Vite load error, whatever the count.
4. **v2 could enforce ruling 6's step 7 blob check** before `mint1359` and `red1359`. It would check two blobs and one
   file:
   - HEAD's `tests/helpers/p15-roots.ts` is 2f2acc5f…;
   - the integration test is 80694a20…;
   - `tests/helpers/p15c2-route-l.ts` is in HEAD, so a HEAD without the RED stops the script instead of failing the
     mint.
5. **"Production commit" (1360-F2:25) is broader than the condition needs.** A `ui`-only commit moves neither the
   writer nor the routes. Defining the term as a change to `src` would keep unrelated work moving.

Free disk was 5.13 GiB at 12:36 CDT. Below 5 GiB, v2 :45-46 stops before the preflight, so no stem is spent.
