# 1360-D: review of the P15 Wave 2 RED landing plan

An independent, read-only review of four things:
- 1360-F's twelve rulings and ten-step sequence;
- 1360-X and its outputs in `E/1360-stage/x/`;
- the P15C r8 classification;
- `S/1360-land/recorded-p15.sh`.

It checks them against 1360-R and the records 1360-R cites. Written 2026-10-02; clock read at 12:23 CDT with `date`.

**HEAD.** The brief named cfce1f38. While this review ran, the parent landed steps 1 to 3, so it reads 80821447:
- 10b9be41, the 1356 RED (step 1);
- fdc12c41, the recorded RED `1360-p15a2-red-recorded` (step 2);
- e4be3e5c, the 1355 RED with the merged `P15_ROOTS` and the producer (step 3);
- 80821447, HANDOFF.md only.

**Method.**
- No node, vitest, tsc, npm or vite-node ran.
- Git use was `show`, `rev-parse`, `ls-files`, `ls-tree` and `log --oneline`.
- Nothing under `tests/fixtures` was read.
- Four Python helpers sit beside this file; the last section lists them.

**Notation.**
- E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, and S is
  `/Users/zacheryspector/studio-scratch`.
- "1356 patch :N" is line N of the staged RED patch, and "1355-P r3 :N" is a line of the staged producer.
- "1360-F:N" is a line of the E record, and a bare ":N" in finding 3 or 7 is a line of `recorded-p15.sh`.

## Verdict

**PROCEED with steps 4 to 7. HOLD at step 8, the P15C mint, until required items 1 and 2 close.**

- **Step 4 is safe under any save allocation.** The 1355 pins must come from the RED commit on unchanged production
  (1355-A:161). Slice 2a's capture leaf needs the Save44 capture whether or not the other roots join Save45. I found
  nothing that would make the 1355 mint fail or void.
- **Ruling 1 binds first at step 8.** That mint ties P15C's route L captures to a Save45 step, and the ruling's fallback
  does not reach P15C.

## Required before step 8

1. **Give P15C its own fallback in ruling 1, or hold steps 8 to 10 until P15C's gating G-P passes** (finding 1).
2. **State ruling 1's standing condition and its full cost** (finding 2):
   - reserve Save45 for the shared step;
   - say what happens if a production commit must land in the repository first (1357-Q1);
   - name the `recordedFromWeek` cost of holding slice 2a, and bound the wait.

## Findings, ranked

### 1. Ruling 1's fallback does not reach P15C (required item 1)

1360-F:27-29 says a root that misses the shared step "mints its own capture at its own path, and its reading leaves
are re-pinned (1355-F5, declared)". 1355-F5:23-30 declares that for the shared capture's readers only. 1355-C3:14
names them: "both RED 16 capture leaves here and 1356-C's capture leaf". P15C's case differs on three counts:
- its capture path is a constant in the RED's own helper, `CAPTURE_DIRECTORY` (1359 patch :379), and 1359-P refuses
  an existing directory (1359-P r4 :59);
- the RED's re-pin list (1359 patch :852-859) holds no capture re-pin;
- at any later step the committed Save44 captures fail `expect(manifest.saveVersion).toBe(STEP - 1)`
  (1359 patch :299).

Of the three roots, P15C's seat at Save45 is the least certain.
- Its gating G-P must run on the tree its production lands on, after an agent writes a probe branch for the sibling
  roots and a reviewer checks it (1353-F7:64-68).
- Under P15A.1's pressure the margin is thin. The fallback value 48 needs its own record and review (1353-F7:20-26).
- G-P runs again if Owner question 1357-Q1 changes the rival economy (1359-F5:27-28).

Either of two changes closes this.
- **Declare it.** Add the P15C case to ruling 1:
  - a helper edit moves `CAPTURE_DIRECTORY` to a per-step path;
  - 1359-P runs again at the last writer below P15C's step;
  - C2-C4 re-pin;
  - the Save44 directory retires.
- **Hold.** Land step 7, then hold steps 8 to 10 until the gating G-P passes.
  - Under ruling 1 the hold costs nothing. The single writer authors the productions outside the repository and lands
    them together (1360-F:23-24). The repository's Save44 writer therefore does not move before Save45, and a later
    mint comes from the same writer.
  - Until then, the next broad gate shows C2-C4 at FIXTURE PENDING, against r8's post-mint rows.

### 2. Ruling 1 leaves its standing condition and part of its cost unstated (required item 2)

The Save44 mints serve only while Save45 is the next save step and no production commit lands in the repository
before it. Neither producer can mint again over its committed directory (1355-P r3 :64-65; 1359-P r4 :59). Three
records press on that condition, and ruling 1 names none of them.

- **The next free number.** 1357-A:333-335 gives P15B "the next free N". Ruling 1 sends P15B to "the next step"
  (1360-F:25-26), but it does not reserve Save45 against P15B or any other save step.
- **A 1357-Q1 change.** 1359-F5:27-28 reruns G-P on a tree that a 1357-Q1 change has altered. If that change lands in
  the repository before Save45:
  - the captures no longer come from "the last writer of the version immediately below the step" (1355-F:34-36);
  - the 1355 K1, K2 and M0A pins compare routes through weeks 12, 21 and 40 (`s4-1355-mint.txt`) that a shelving or
    rival-cost fix would change. Those pins were taken "at the RED commit on unchanged production" (1355-A:161).

  1358-F3:46-47 ("Slice A has landed and changes no save version") does not settle this. Slice A landed before that
  mint, not after it.
- **The cost of holding slice 2a.**
  - 1359-A:273-276 lands the siblings "as early as their gates allow, since each `recordedFromWeek` limits every
    save's 2040 view".
  - 1356-A:242-243 says P15C "wants this archive early", and 1359-F:50-51 repeats the reason.
  - Slice 2a has passed its gates (1356-A:238-240). Ruling 1 holds it until P15A.1's G2 and P15C's G-P, but names only
    "slice 2a's production does not land alone" as the cost (1360-F:23-24).
  - Every campaign that migrates in the meantime records its archive from a later week.

The parent may amend its own adopted charters, so this concerns the record, not the authority. One paragraph in
1360-F, or a new F-record, closes it:
- reserve Save45 for the shared P15 step;
- bar production commits in the repository until it lands, or rule now on a 1357-Q1 change that must come first;
- name the `recordedFromWeek` cost and bound the wait. For example: if P15A.1 or P15C misses a named point, slice 2a
  lands alone at Save45, and P15A.1 takes the re-pin 1355-F5 already declares.

### 3. `recorded-p15.sh` should close four gaps before a once-only run (recommended before step 4)

None of these voids a run, and each costs a line or two.
- **a. The producer check is index-level.** `git ls-files --error-unmatch` (:44) passes for a staged but uncommitted
  file, and for a modified one.
  - E sits outside every identity the recorder and the guards take (run-bounded-source-c2.mjs:20-23;
    run-bounded-source-guards.py:12, :50-53). Nothing else fixes the producer's bytes.
  - Today they match: HEAD's blob a50f4777, the index entry and the working tree all hash to r3's 5007e231….
  - Add `git cat-file -e "HEAD:$PRODUCER"` and `git diff --quiet HEAD -- "$PRODUCER"`. Then check the sha256 against
    r3 (5007e231…) or r4 (78c1d105…).
- **b. The meta hides the producer's exit code.**
  - The recorder exits 0 whenever `fixedSource` holds (run-bounded-source-c2.mjs:57). The ":57 run exit 0" line
    therefore says nothing about the producer, and a mint has no "Tests" line for :59 to log.
  - Slice B's meta reads the same way (`S/1358-land/recorded.meta:4-5`).
  - Log `exitCode` from `$E/$STEM.json`, and list the files the mint wrote.
- **c. No named stop for the producers' output directories.**
  - recorded.sh:30-31 had one.
  - The clean check at :37 already stops on an untracked leftover: nothing under `tests` is gitignored, and no git
    config hides untracked files.
  - A tracked leftover cannot exist at HEAD. None of 10b9be41, fdc12c41, e4be3e5c and 80821447 touches
    `tests/fixtures`.
  - So this check adds clarity, not safety.
- **d. `red1355` does not check the pin.**
  - Run one commit early, it would record the interim "FIXTURE PENDING: pin CAPTURE_MANIFEST_SHA256" message
    (1355 patch :1538) instead of the classified final reason.
  - Check that `CAPTURE_MANIFEST_SHA256` holds a 64-hex literal equal to the committed MANIFEST's sha256.
  - For `red1359`, check that the route L MANIFEST is tracked.

### 4. Three 1360-X statements overreach their outputs (low)

- **:48.** It says "1355's two (the missing `powerRankingArchive.ts` and `p15Phases.ts`)". Both 1355 errors name
  `p15Phases.js` (s12-tsc.txt:1-2; `E/1355-stage/x5/new-1355-tsc.txt`). The set of six is right.
- **:52-53.** "Two failing load errors ... are left out" is true of 1355. The 1356 comparison, s2 against s11, leaves
  out 13.
- **:79-80.** It says only "each MANIFEST's `executionHead` and `elapsedMs`" will differ.
  - The capture MANIFEST has no `elapsedMs` (1355-P r3 :161-165).
  - The route L MANIFEST also carries `routeMs`, which moved from 2,145.7 and 4,369.1 ms in X6 to 1,705.3 and
    3,591.1 ms in the replay.
  - Read literally, 1360-F:100's "must match 1360-X" would stop step 9 on `routeMs`. `cmp-manifest.py` compares every
    other field.

### 5. The r8 patch names r7's blob for the integration test (low)

- **The header.** 1359 patch :791 reads `index 0000000..ed43f1b`. That is r7's blob; r8's content hashes to
  80694a20….
  - The same computation reproduces the patch's two helper headers (0606c85, 09de4a5) and HEAD's `p15-roots.ts`
    blob.
  - `git apply` ignores a new file's postimage id, so step 7 still applies, as it did in 1360-X.
- **After step 7,** a blob check should expect:
  - 80694a20… for `tests/p15c2-campaign-legacy-integration.test.ts`;
  - 2f2acc5f… for the four-key `tests/helpers/p15-roots.ts`.
- **r8's two preimages** (1f3e963, 975a94f) equal HEAD's blobs.

### 6. Ruling 2's reason rests on production order (low)

1359 patch :847-851 and 1359-A:273-276 speak of the order in which productions land. Under ruling 1, P15C's
production still precedes P15B's unless 1357-Q1 resolves in time. The "lands first" clause therefore reaches the
`corporateCondition` forgeries in A3, A5, A7, A8 and B4, whatever order the REDs take.

The order 1356, 1355, 1359 stands on 1355-F4 and on ruling 3. The sentence about forged-root leaves can go.

### 7. Operational notes for step 4 (no stem at risk)

- **Disk.** Free disk was 5,270,876 KiB (5.03 GiB) at 12:06 CDT, about 27 MiB above the floor (:38-39).
  - The check stops before the preflight, so it spends no stem.
  - Swap moves free space by about 1 GiB (HANDOFF.md:72), so free some space first.
- **Remote.** FETCH_HEAD reads e4be3e5c, fetched at 11:58. Push 80821447 and any 1360-D commit first, or :36 stops.
- **Execution HEAD.** The mint runs at a docs-only descendant of e4be3e5c, not at the RED commit itself.
  - Both MANIFESTs' `executionHead`, and so the sha the pin takes, will name that descendant.
  - 1360-L should say its source equals e4be3e5c's, since 1355-A:161 says "at the RED commit".
- **Comparing the REDs.** The comparison with 1360-X must ignore the importing-file path inside Vite's load errors.
  That covers two leaves for 1355, and 13 for 1356 after the mint.

### 8. The two classifications use `fixturePending` differently (note)

- **1355** keeps `fixturePending: true` on its six rows and states the post-mint path in `expectedFailureToday`.
- **r8** sets the flag false to describe the recorded state.

Each file is consistent with itself. A closure census should not count the flag across the two.

## Question by question

### 1. Ruling 1

**Authority: within it.**
- 1355-F:40-42 lets the parent share one step "when their productions are ready together". It names P15A.1, P15A.2
  and P15B, and "all three" (quoted at 1360-F:16) meant those three.
- 1359-A:277-278 and 1359-F:50-51 admit P15C on the same terms.
- Ruling 1 keeps readiness as its gate (1360-F:27-28).

**Validity of the Save44 mints for all three readers: yes, if Save45 is the shared step.** Each RED reads STEP from
`LIVE_SAVE_VERSION` (1356 patch :478; 1355 patch :891; 1359 patch :69). Each asserts STEP - 1 on the MANIFEST and on
every imported capture:

| Reader | MANIFEST check | Imported-capture check |
|---|---|---|
| 1356 | patch :1188 | patch :1199 |
| 1355 | patch :1542 | patch :1546 |
| 1359 | patch :299 | patch :309 |

The deeper assertions also hold at a shared step.
- **The migrations add only root keys.** That holds for slice 2a, for P15A.1 (1355-A:133-135) and for P15C
  (1359-A:185-188), and all four keys sit in the merged `P15_ROOTS`.
- **So the readers strip them.** 1356's "nothing else moves" (1356 patch :1204) and the K-pin key sets
  (1355-P r3 :78-88) both strip the merged list.
- **C2 and C5** compare added keys (1359 patch :859).
- **P15B's step** also adds loan movements (1357-A:155-156). That is a re-pin 1356 already declares
  (1356 patch :348-350).

**Contradictions.**
- **1355-F4:8-10** orders productions. Landing together keeps slice 2a's commits first, and R2's "second production
  fixes the refusal order" still applies.
- **1355-F5:23-30** asks for one shared step, which ruling 1 supplies.
- **HANDOFF.md at cb49fd02, line 47,** planned slice 2a alone at Save45. That was the parent's own plan, not a ruling.
- **1357-A:332-335** lets P15B land the fixed cost itself (F3) and lets the parent batch it. The unreserved "next free
  N" is finding 2.
- **1356-A:242-243 and 1359-A:273-276**: ruling 1 departs from them without naming the cost (finding 2).

**Fallbacks.**
- They are right for 1355 and 1356.
- They miss P15C (finding 1).
- They can be softer for P15A.1. G2 gates only commit (c) (1355-A:265-267), so a G2 failure need not move P15A.1's
  root off Save45.

### 2. Rulings 2 to 12

| Ruling | Finding | Evidence |
|---|---|---|
| 2, order | Sound; its forged-root reason is finding 6 | The producer imports the RED's helpers (1355-P r3 :38-42), so the mint follows the RED commit |
| 3, 1356 before the mint | Sound, and done | Step 2 gave 70 failed and 2 passed at 10b9be41, with the declared pre-mint message (`E/1360-p15a2-red-recorded.txt:60-61`; 1356 classification :165-167). s11 measured the post-mint change in advance |
| 4, sha pin | Sound | 1355 patch :1529 holds the one `= null` literal, and :1540 compares it. Leaving 1356's optional pin (1356 patch :1179-1180) to the closure decides what 1356-C:46-47 left open |
| 5, measure first | Sound, and done | The slice B precedent is 1358-F4:75-76 |
| 6, dry runs | Sound | House practice: 1358-F3:15 ordered a producer dry run before the recorded mint |
| 7, vite-node | Sound | `S/1358-land/recorded.sh:38-39`; run-1360-X.sh:63, :86 |
| 8, failed mint | Sound | 1355-P r3 writes only after every check (:143-168). Only an I/O failure partway through the writes could leave a partial set, which is remote at 5 GiB free |
| 9, producer at the E root | Sound, and done for 1355 | Blob a50f4777 at HEAD equals the index and the working tree (sha256 5007e231…, r3). No 1359-P file sits at the E root yet |
| 10, harness inside the RED | An open override of 1356-F2:40 and 1356 patch :69-70, with a stated reason | 1356-X3:27: 751 ms at RED. Step 2 matched s2 |
| 11, `p15-roots.ts` | Sound, and done | e4be3e5c holds blob 08fc351c…, 1355's own, because the merged list equals 1355's list. Step 7 should give 2f2acc5f… |
| 12, Save43 texts | Sound | 1356-X4:25-26; 1359-X6:35-40. "Two cases are measured otherwise" (1360-F:77) means "two cases rest on measurement" |

The sequence table holds one stale item. Step 7 lists "r8's revised classification", but that file is already
committed at cfce1f38 (blob 5a4652ac…).

### 3. 1360-X

**The script follows 1360-F's sequence.**
- **The roots edit** (run-1360-X.sh:44-52) asserts that file line 10 starts with the declaration and rewrites only
  that line. The join keeps the trailing newline.
- **Both later applies** exclude `tests/helpers/p15-roots.ts` (:57, :80).
- **The sha pin** (:66-75) replaces the one `= null` literal and asserts exactly one match.
- **The producers** run from the tree's E as real files (:59, :82), with HEAD set and mint mode where it applies (:63,
  :86).
- **The base** is cb49fd02, which is docs-only over 1706d844.
- **The flags.** `--no-cache` and the JSON reporter (:37) cannot change an outcome.

**The outputs support every claim.**
- **Counts:** run-meta.txt:2, :6, :9 and :10.
- **Pass sets:**
  - s6's eight passes are exactly the eight `control: true` rows of the 1355 classification;
  - s2's two passes are 1356's controls;
  - s10's 76 passes equal r8's pass rows.
- **1355, X5 (55/4) against s6 (51/8):**
  - the four pin controls go from FIXTURE PENDING to passed;
  - both capture leaves go to `AssertionError: expected 44 to be 43 // Object.is equality`;
  - two load errors differ only by importing file.
- **1356, s2 against s11:** one leaf moves to the same assertion, and 13 load errors differ only by importing file.
- **1359, X6 against s10:** only C2-C4 move.
- **Type gate:** s12 is exactly X5's two errors plus X4's four. X6 has none.
- **Bytes:** with `executionHead`, `elapsedMs` and `routeMs` set aside, `cmp-manifest.py` finds no differing field in
  the capture, pins and route L MANIFESTs (13, 146 and 17 fields).

### 4. The r8 classification

- **Only C2-C4 changed.** `cmp-classification.py` finds the same 116 rows in the same order.
  - Only rows 20, 22 and 23 differ, each in five fields: `atRed`, `firstMessageAtRed`, `fixturePending`,
    `expectedFailureToday` and `redBasis`.
  - A line diff looks large only because r8 re-indents the file.
- **The rows match the replay.**
  - `check-r8-vs-s10.py` finds no mismatch in status or first message over all 116 rows.
  - r7 against s10 mismatches exactly C2-C4.
  - C2-C4's `firstMessageAtRed` equals s10's first line byte for byte, `§` included.
- **`fixturePending: false` is right for the recorded RED.**
  - At step 10 the captures exist, and C2-C4 fail by name on the version (1359 patch :296-298).
  - `expectedFailureToday` keeps the pre-mint text for the RED commit.
  - Row 21, C2's genuine Save38 sibling, reads a different capture and rightly did not change.

### 5. `recorded-p15.sh`

- **Stems.** The script uses the five 1360-F names (1360-F:88-96), lowercase, all matching the recorder's rule. Only
  `1360-p15a2-red-recorded` has outputs.
- **Commands.**
  - The RED modes follow recorded3.sh:55-58.
  - The mint modes follow the slice B mint, recorded.sh:38-39, and add `P15A1_CAPTURE_MODE=mint`
    (1355-P r3 :61-63).
  - 1359-P takes no mode variable (1359-P r4 :56-59).
- **File lists.** They equal run-1360-X.sh:38-40 and 1360-F steps 2, 6 and 10.
- **PATH.** `.venv/bin` holds no `node` or `git`. `node` and vite-node's `env node` therefore resolve to v20.20.2, as
  step 2's record shows.
- **The five names** (:41-43) are exactly what the recorder writes (run-bounded-source-c2.mjs:13-14) and what the
  guards write (run-bounded-source-guards.py:60, :67). They carry recorded3.sh's fix for the v2 glob
  (recorded3.sh:2-3).
- **The producer check** (:44) is index-level only (finding 3a).
- **Check order.**
  - Every check runs before the guards' pre step (:46), so a failed check stops without spending the stem.
  - `git status` at :37 also refreshes the index before the guards digest it (guards :54), as the precedents do.
- **Against recorded.sh's mint mode.** recorded.sh:30-33 also stopped on an existing capture and on a missing RED file.
  recorded-p15.sh trades the RED check for the producer check, which arrives in the same commit (ruling 9). It drops
  the capture check (finding 3c).

### 6. What could fail or void a mint

**The producers' guards.**
- **HEAD pins.** The producers compare against `git rev-parse HEAD` (1355-P r3 :58-60; 1359-P r4 :56-58). The script
  sets the variable after its remote check (:50, :53).
- **Output refusals** (1355-P r3 :64-65; 1359-P r4 :59). `tests/fixtures/p15` did not exist when 1360-X started
  (run-1360-X.sh:32 passed at 11:50), and no commit since touches `tests/fixtures`.
- **Unchanged-production probes** (1355-P r3 :68-69; 1359-P r4 :61-62) pass until a P15 production lands.
- **Route premises** are deterministic. The replay wrote the same capture and pin data as both Save44 dry runs.

**Source identity.**
- The recorder and the guards both exclude `tests/fixtures/` (run-bounded-source-c2.mjs:22; guards :14-15). The files
  a mint writes therefore leave `fixedSource` and the inventory alone.
- Slice B's mint wrote under `tests/fixtures/p14` the same way and closed exact (`S/1358-land/recorded.log:2-3`).
- The guards' manual pins match no 1355, 1359 or 1360 file.

**What the producers read.** Neither mint reads a fixture or anything in E.
- 1355-P reads `tests/helpers/p15a1-market-route.ts`, which imports only `tests/_fixtures.ts` and `src`. It also reads
  `tests/helpers/p15-roots.ts`. Its output directories sit at `p15a1-market-route.ts:499-500`.
- 1359-P reads `tests/helpers/p15c2-route-l.ts`, which imports only `src`.
- The 1359 RED, not its producer, reads E's Save38 capture (1359 patch :251-258).

**The E-root path.** Five `..` steps reach the repository root (1355-P r3 :44; 1359-P r4 :44). E sits outside every
source identity, so only HEAD's tree fixes the producer's bytes (finding 3a).

**Disk and remote:** finding 7.

### Steps 1 to 3 as landed

- **10b9be41.** Its four blobs equal the 1356 patch's index lines (b852c0be, d3503ce6, 1a1c4144, a8cae3b0).
- **e4be3e5c.**
  - Its five test blobs equal the 1355 patch's index lines, with `p15-roots.ts` at 08fc351c.
  - The producer is r3, byte for byte.
- **fdc12c41.**
  - 70 failed and 2 passed, with `fixedSource` and `allGuardsExact`.
  - `sourceSha` is 10b9be41 at the start and the end.
  - Node v20.20.2.

### Outside the landing

1355-F4:41 makes G2's rerun at the RED commit the baseline for K3, and 1360-F's sequence does not list it. G2 runs
"the control at the RED commit" in scratch (1355-A:181), so an archive of e4be3e5c serves later. The production plan
should carry it.

## Helpers (S/1360-land/review/)

- `cmp-classification.py` compares two classifications row by row and field by field.
- `leaves.py` lists or diffs the leaves of vitest JSON reports, as status and first message line.
- `check-r8-vs-s10.py` checks every classification row against a vitest JSON report.
- `cmp-manifest.py` compares two producer MANIFESTs, ignoring `executionHead`, `elapsedMs` and `routeMs`. It exits 1
  on any difference. Run it at steps 5 and 9 against the 1360-X MANIFESTs.
