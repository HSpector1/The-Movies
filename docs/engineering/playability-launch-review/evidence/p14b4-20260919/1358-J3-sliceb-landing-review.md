# 1358-J3: independent review of the relationship slice B landing (9eb1e66e to b60db650)

**Scope.** I reviewed the nine landing commits 9eb1e66e to b60db650 on `wip/headless-program-20260916-ts`, the
landing scripts and logs in `S/1358-land/`, and the parent's untracked draft `E/1358-C9-sweep-landing-handback.md`
(sha256 e0e66493…, mtime 09:20). I finished this text on 2026-10-02 at 09:46 CDT. The recorded core gate
`1358-sliceb-broad-core` was still running at b60db650 (`S/1358-land/recorded3.meta:13-15`). I did not wait for it,
for the UI gate or for 1358-M3.

E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`; S = `/Users/zacheryspector/studio-scratch`.

**Verdict: REFINE.** The landing itself holds. Every commit carries exactly what its record says, both recorded runs
are exact, the F10 and F11 pins take the recorded producer output, and no commit fell inside a run window. The
defects sit in the records. C9 states two dispositions that its evidence does not support, and its census sentence
miscounts edits. 1358-L is still the 02:36 text. No record yet shows the type gates and generator checks that
1358-N's success list requires of the landed tree.

**Required before 1358-L closes.**
- **R1.** Correct C9's dispositions for N-0007 and N-0027 (finding 1).
- **R2.** Put 1358-N's type-gate and generator success lines on the landed tree (finding 2).
- **R3.** Correct C9's census sentence and its "No edit" wording (finding 3).
- **R4.** Bring 1358-L up to the landing, and commit C9, the merged classification and 1358-L only after the UI
  gate's postflight (finding 4).

**Recommended, not required.** N1 to N6, in findings 5 to 10.

## Findings, ranked by severity

### 1. Medium: C9's dispositions for N-0007 and N-0027 claim what the evidence does not show

C9:55 says of N-0007 (`tests/helpers/p14c2b-fixtures.ts:69`, `liveEnvelopeV36`): "The chain gains `convertV44ToV43`
(S4) and succeeds on its callers' live states", with the evidence "X8: the callers pass". C9:56 gives N-0027
(`tests/helpers/p14c4-fixtures.ts:71`) "As N-0007", with "X8".

- **N-0007.** One file calls the helper, `tests/p14c2b-save-v36.test.ts`, at three sites
  (`E/1358-stage/sweep-r1/h/handback.md:90-91`). At b60db650 the chain succeeds only at :64.
  - At :83 and :98 the chain refuses inside the helper. Those leaves pin the refusal,
    `/^migrateToV43: cannot downgrade or discard the romance of relationship-edge-0$/`, and their comments (:74-82,
    :91-97) say that convertV44ToV43 "refuse[s] first inside liveEnvelopeV36".
  - X6's probe measured that message at both sites (`1358-stage/sweep-r1/x6-probe-parsed.json`, ids G4-new-3 and
    G4-new-4). F2's classification rows file them as S9 at :83 and :98.
  - X8 passes the file (14 tests), which confirms those two pins. So "succeeds on its callers' live states" is false
    for two of the three call sites.
- **N-0027.** The helper has no caller in `tests` or `ui/src` at b60db650 (grep, fixtures excluded). H recorded the
  same: "No test calls the `liveEnvelope` of `tests/helpers/p14c4-fixtures.ts`, so the chain at :71 never runs. Only
  the type gates exercise it" (`h/handback.md:92-93`; `h/deferred.json`, row N-0027). X8's core run therefore cannot
  show this chain succeeding. X8's type gates, exit 0 (`1358-stage/sweep-r2/x8/run-meta.txt:3`), are the evidence.
- **The rulings.** The census row ordered "if convertV44ToV43 refuses, stop and report for a ruling"
  (`1358-stage/n/census.json`, N-0007 `edit`), as 1358-F9 ruling 2 does (`1358-F9:13-16`). The refusal reached its
  rulings through G4-new-3 and G4-new-4 (1358-F10 ruling 3; 1358-F11 closure findings). C9 should cite them. No test
  changes.
- **Fix (R1).**
  - N-0007: "No S9 edit. Only `p14c2b-save-v36` calls the helper. The chain succeeds at :64 (X8: the file passes). At
    :83 and :98 it meets convertV44ToV43's romance refusal first, which those leaves pin (G4-new-3 and G4-new-4; X6
    probe; 1358-F10 ruling 3, 1358-F11)."
  - N-0027: "No S9 edit. No test calls the helper, so the chain never runs. Its S4 insert (N-0026) type-checks (X8
    type gates)."

### 2. Medium: no record shows 1358-N's type-gate and generator success lines on the landed tree

1358-N's success list opens with "the root, UI and Bridge type gates exit 0; both generator checks pass"
(`1358-N:358-360`). The landing runs only the producer, the GREEN, core and UI (`S/1358-land/recorded3.sh:4-10`;
`1358-F12:64-69`). The last type gates and generator checks ran in 1358-X9t, on a scratch archive with r3
(`1358-X9t:29-30`). 1348-L recorded its type gates at the landed commit before it closed
(`1348-L-rel-sliceA-landing.md:38-40`, `1348-L-type-gates.txt`).
- By reading, X9t's result carries over. r4 changes one comment (`git diff 7e7a065 4e36a25`, +2/-1), 5ac4b738 changes
  six comment lines and two string literals, and production is blob-equal to step 4 (check 1).
- **Fix (R2).** Run the three type gates and both generator checks at the landed HEAD after the UI gate's postflight
  and record them, as 1348-L did. Or state in 1358-L that X9t's results stand for the landed tree, with the two deltas
  above as the reason.

### 3. Low: C9's census sentence miscounts edits, and "No edit" hides sibling edits

- **"29 carry no edit" (C9:51).**
  - Two of the 29, N-0150 and N-0151, carry 5ac4b738's edit, as C9:81-82 says.
  - Three of the 656 census rows with a classification row record no edit: N-0042 (F2, class `S10 (C20 retained)`),
    N-0093 and N-0094 (G1, S6). Each of their rows has identical `old` and `new` text.
  - 1358-F12 ruling 6 and 1358-D9 N5 both count "27 no-edit census rows" (`1358-F12:40`, `1358-D9:705-706`).
  - Suggested text: "29 carry no classification row: 27 take no edit, and N-0150 and N-0151 take 5ac4b738's edit
    outside the sweep."
- **"No edit" on edited lines.** At ten of the other 28 sites, the line carries an edit under a sibling census row.
  C9 says so only for N-0007 (C9:55, "No S9 edit … (S4)").
  - S4 inserts: N-0027 (N-0026), N-0444 (N-0443), N-0449 (N-0448), N-0542 (N-0541), N-0573 (N-0572), N-0575
    (N-0574), N-0498 (N-0497), N-0522 (N-0521) and N-0524 (N-0523).
  - An S1 rename: N-0096 (N-0095, `p14b5-relationships:1299` now calls `validateSaveV44`).
  - Suggested fix: write "No S9 edit" ("No S8 edit" for N-0096), or add one sentence above the table saying that
    "No edit" means none for the row's own class.

### 4. Low: 1358-L still reads as at 02:36, and the records must wait for the UI gate

`E/1358-L-rel-sliceB-landing.md` is the 5245072a text (blob 7f6bfb93, on disk and at b60db650).
- Its status (:3-6) says the production "lands together with" the sweep after X5, M2 and N. All three finished, and
  both landed at 9eb1e66e to f458680b.
- Its table (:8-12) stops at the recorded RED. It lacks the nine landing commits, the two recorded runs, the type
  gates and the broad gates.
- Its "Next" (:48-56) still lists X5, M2 and N.
- C9, the merged classification (`1358-stage/sweep-r4/1358-sweep-classification-merged.json`) and the updated 1358-L
  are all uncommitted. 1358-N:299 forbids a commit or `git add` during a recorded run or its postflight. Core is
  running and UI follows it.
- **Fix (R4).** Add the landing rows, the gate results and a closing status, as `1348-L-rel-sliceA-landing.md:42-52`
  does. Commit the three files after the UI gate's postflight ends.

### 5. Low: C9 omits HEAD lines for eight moved rows, and two S8 lines are r2's

C9's table promises "census line (HEAD line)" (C9:53). Four rows give one: N-0070 :544, N-0071 :564, N-0092 :238 and
N-0198 :766, all correct. Eight more moved and show only the census line:

| Census | Census line | Line at b60db650 |
|---|---|---|
| N-0096 | `p14b5-relationships:1297` | :1299 |
| N-0101 | `p14b5-relationships:1394` | :1400 |
| N-0102 | `p14b5-relationships:1411` | :1417 |
| N-0103 | `p14b5-relationships:1426` | :1432 |
| N-0105 | `p14b5-relationships:1447` | :1453 |
| N-0150 | `bridge-contract-generator:724` | :732 |
| N-0151 | `bridge-contract-generator:725` | :733 |
| N-0542 | `p14p4p5-opportunities:326` | :335 |

The S8 section cites G5-new-7 at `p14c2rm-writer-continuation:378` (C9:94) and 1358-D9 R2's site at :312 (C9:97).
Those are r2 lines. At b60db650 the bare call sits at :379, and R2's pin at :313 under its comment at :312
(`1358-D9b:36-38`). (N1)

### 6. Low: C9's class summary leaves out the S10 row

C9:43-44 lists twelve classes and says "The rest are S9 rows, their covers and comments." The rest is 58 rows: 29 S9,
13 S9 covers and S9 comments, 15 comments, and one `S10 (C20 retained)` row, N-0042 (F2, `p14c3-save-v38:105`). The
listed counts are exact once S5 includes `S5 (helper)` and S8 includes `S8 (column)`. (N2)

### 7. Low: C9's history-search note cites 1358-F10 ruling 10 for G1

C9:124-125 says "G1's `log -p` and G2's `log -S` ran in the partial clone and fetched objects (1358-F10 ruling 10)".
F10 ruling 10 (`1358-F10:66-68`) records only G2's `git log -S`. G1 disclosed its `log -p` in its own handback
(`1358-stage/sweep-r1/g1/handback.md:136`), which reports no fetch, and `1358-D9:258-259` notes that no ruling
mentions it. Cite G1's handback and D9 finding 11, and keep "fetched objects" for G2 alone. (N3)

### 8. Low: two closure findings drift from their sources

- Closure finding 5 (C9:109-111) says the duplicate-receipt leaf "passes on the concept check". 1358-D9 found that "by
  reading" (`1358-D9:247`), and no run has measured it. Keep the qualifier.
- Closure finding 8 (C9:116) uses D9b's words ("names only the shelving strip", `1358-D9b:189-190`) but cites D9,
  whose note concerns the unnamed `convertV43ToV44` lift (`1358-D9:711-712`). Cite both. (N4)

### 9. Information: the manifest pins a test file that 5ac4b738 then moved

The manifest pins `tests/bridge-contract-generator.test.ts` at f458680b's bytes (54,320, a97b19ba…). 5ac4b738 moves the
file (blob 59765b04 to e13d435d). The 1328 manifest pinned the same file the same way
(`E/1328-p56-declaration-source-manifest.json`). The pin records the source the producer measured, and HEAD's file
differs from it by 5ac4b738's edit. 1358-L should say so, so that a later reader does not take it for drift.
Production step 4 moved four other pinned inputs before the manifest existed: `bridge/schema/bridge-schema.ts`, the
schema JSON, the generated C# and the contract manifest. The manifest pins their step-4 bytes. (N5)

### 10. Information: smaller record notes

- C9:22 links `1358-M3-sliceb-recorded-broad-gates.md`, which does not exist yet. (N6)
- No log in `S/1358-land/` records the sweep apply (f458680b) or the manifest write (eb1c2512). Git itself is the
  evidence (checks 2 and 3), and it suffices.
- `recorded3.sh:5` and :27 still print `recorded2.sh` in their usage text. Cosmetic.

## The nine checks

### 1. Production: MET

- **Reference.** `S/1358-n/tree` carries two tags: `base` (24f631b) and `step4` (8e02a44). With no `step1` to
  `step3`, I compared each commit with its cumulative staged patch (`j3_check_steps.py`).
- **Patches.** Their sha256 prefixes are 95d5a5d9, eaa026e2, 510c361b and 2004b500, as `land-sliceB-steps.sh:19`
  checks.
- **Increments.** For k = 1 to 4, `git diff 65515b66 <step k> -- src bridge generated` equals
  `1358-rel-sliceB-production-step<k>-r2.patch` byte for byte once `index` lines drop. Each cumulative state equals
  its patch, so each commit holds exactly its step's increment: 4, 3, 4 and 6 files, as `land-steps.meta:2-5` logs.
- **No test, UI or script path.** `git diff --name-only 65515b66 <step>` lists nothing outside `src`, `bridge` and
  `generated` for any step. The `tests`, `ui` and `scripts` trees and `package.json` stay 935679ea, 484ac163, 0ccf7cec
  and 4f6123b0 through 83d1030d.
- **Final files.** All 13 files at 83d1030d are blob-equal to `step4`, to `land-steps.meta:6-18` and to 1358-E2's
  post-image table. The trees equal step 4's: `src` 762d8e09, `bridge` faa227af, `generated` 9ff54168. At 65515b66 the
  three trees equal the scratch `base` (071f9ff3, 9da338c4, 8b0ab810).

### 2. The sweep: MET

- f458680b changes 154 files, the same set as `1358-sweep-r4.patch` (sha256 94f0b476…), +1,058/-679. 149 sit under
  `tests/` (138 test files and 11 helpers under `tests/helpers`) and 5 under `ui/src/`. None sits under
  `tests/fixtures`. The patch holds no new-file, delete, rename or mode line.
- `git diff 83d1030d f458680b` equals the patch once `index` lines drop (`j3_check_sweep.py`).
- All 154 blobs equal `sweep-r4:<file>` (4e36a25) in `S/1358-sweep/merge`. The whole `tests` tree (fixtures skipped,
  481 entries) and `ui/src` (356 entries) equal `sweep-r4`'s.
- The r3 patch equals `git diff step4 sweep-r3 -- tests ui`, and the r4 patch equals
  `git diff step4 sweep-r4 -- tests ui`. `git diff 7e7a065 4e36a25` is one hunk at
  `tests/p14d1-rival-shelving.test.ts:567`, +2/-1: the D9b N1 comment and nothing else.
- At f458680b, `tests/bridge-contract-generator.test.ts:726-727` still pin F10 and F11 at a0f316eb….

### 3. The manifest: MET WITH NOTES (finding 9)

- `git show eb1c2512:E/1358-p57-declaration-source-manifest.json` has sha256 5d605954a93c6f6a…13a2. The disk copy
  and eb1c2512's message agree.
- Its 17 inputs equal the producer's `inputPaths` (`E/1358-p57-declaration-measurement.ts:32-40` at eb1c2512), in
  order.
- Bytes and sha256 recompute through `git show eb1c2512:<path>` for the 16 inputs outside `tests/fixtures`, the
  producer (9,488 bytes, a1ca7859…) and its tsconfig (180 bytes, ce0560bc…) (`j3_check_manifest.py`).
- **The fixtures input.** I did not read `tests/fixtures/bridge-contract-union-fixtures.ts`. `git cat-file -s` gives
  10,210 bytes, the pinned size. The producer asserted its bytes and sha256 against the manifest before and after
  measuring (`:51-60`, `:115`) and printed 0689507d… in `inputsSha256`, the pinned value.
- **Inputs that moved.** Step 4 (83d1030d) moved four inputs before the manifest existed. The sweep (f458680b) moved
  `tests/bridge-contract-generator.test.ts`, and 5ac4b738 moved it again after the run. No other pinned input changed
  from eb1c2512 to b60db650.

### 4. The producer run: MET

- **Recorder and guards.** `E/1358-p57-declaration.json` records exit 0, `fixedSource` true, `sourceSha` and
  `sourceShaAtEnd` eb1c2512, an empty tested diff and no untracked source. The pre- and postflight record head
  eb1c2512, index sha256 e1ffcae8… both times, exit 0 and `allGuardsExact` true. `recorded3.log:1-3` and
  `recorded3.meta:1-6` agree.
- **Output.** The producer JSON in `E/1358-p57-declaration.txt` shows:
  - F10 and F11 both at 1dadf88fb7230405a6232fff3a37e3aee9014718200dfdb8baf4ff385ab71fa4, 420,340 bytes, deterministic,
    `matchesPrior` false;
  - F01, F02, F03, F04, F09 and F12 equal to their priors, which equal the test's pins at eb1c2512 and appear in
    `E/1328-p56-declaration-measurement.txt`;
  - `renders` 16, Node v20.20.2, `sourceManifestSha256` 5d605954…, `source.head` eb1c2512 and `producerSha256`
    a1ca7859…, the manifest's pin.
- **Committed outputs.** The five files at 282ad680 equal the disk copies. The `.txt`, `.json` and `.patch` match the
  postflight's sha256s (531cd684…, cec1646a… and the empty hash).
- **The producer.** Its blob is 126f1174 at b17e8ac2 and at b60db650, and `git log` on its path lists only b17e8ac2.

### 5. F10 and F11 (5ac4b738): MET

- **The diff.** `git diff 282ad680 5ac4b738` touches one file: six comment lines added at :725-730 and the two values
  at :732-733. F12 (:734) stays 78d68a2d….
- **The values.** Both pins equal the producer output.
- **The comment.** Each fact checks against the record: the 1358 producer; the recorded run `1358-p57-declaration`
  on eb1c2512; manifest 5d605954…; prior measurement 1328, projection 56; exit 0, `fixedSource` true and
  `allGuardsExact` true; all eight positives rendered twice (16 renders); both current bodies 420,340 bytes at
  1dadf88f…; the six fixed bodies, F12 included, unchanged.
- **Judgement: measurement-derived.**
  - The producer was committed at b17e8ac2 (03:34:50), five hours before 1358-X9t ran (08:48:55 to 08:59:56,
    `1358-X9t:15`). It holds no projection-57 value. Its only F10 and F11 constants are the projection-56 priors, and
    it asserts that the new render differs from them (`:111`).
  - The run is recorded and exact, on the manifest-pinned source.
  - The outputs landed at 282ad680 (09:12:34) before the pins at 5ac4b738 (09:12:35).
  - F11's value cannot have come from a failure. X9t's leaf stops at F10, "so F11's render goes unreported here"
    (`1358-X9t:60`).
  - The F10 value appeared before the run twice: in 1358-J finding 10, from the checked-in C# (`1358-J:177`), and in
    X9t's failing leaf. Both agree with the recorded output as cross-checks.

### 6. The GREEN: MET

- **Recorder and guards.** `E/1358-sliceb-green-recorded.json` records exit 1, `fixedSource` true, and `sourceSha`
  and `sourceShaAtEnd` 5ac4b738. The pre- and postflight record head 5ac4b738, index 9514f739… both times and
  `allGuardsExact` true. The raw output reads "Tests 3 failed | 145 passed (148)" and "Test Files 1 failed | 5 passed
  (6)".
- **The failures.** All three sit in `tests/p14b5-relationships.test.ts`: two family 2 leaves and one family 5 leaf.
  Each fails in `rivalWorld` at :399:53 with "expected [] to deeply equal [ 'studio-aca408ec-r01:film:6' ]". These are
  1344-F6 row 6's three declared exceptions (`1344-F6-parent-ruling-declared-exceptions.md:12-15`, then at :397:53),
  and all three are 1348-I identities (`1348-I-core-failures.json`).
- **Against the RED.** Each GREEN failure title equals one of the 89 `FAIL` lines in
  `E/1358-sliceb-red-recorded.txt`. Of the six files, the sweep changed only `p14b5-relationships` (+18/-12), and it
  renamed no title there.
- **Committed outputs.** The five files at b60db650 equal the disk copies and the postflight's sha256s.

### 7. No commit or `git add` during a recorded run or its postflight: MET

| Commit | Committed (CDT) | Against the run windows in `recorded3.meta` |
|---|---|---|
| 9eb1e66e, 8df1858e, 615adeb2, 83d1030d | 09:09:42 to 09:09:43 | before the producer (09:11:37) |
| f458680b | 09:10:13 | before the producer |
| eb1c2512 | 09:10:51 | before the producer, and before `recorded2.sh`'s stopped attempt (09:10:58 to 09:11:00, no preflight; `recorded2.meta:1-2`) |
| 282ad680 | 09:12:34 | 45 s after the producer's end (09:11:49) |
| 5ac4b738 | 09:12:35 | 10 s before the GREEN's start (09:12:45) |
| b60db650 | 09:14:23 | 27 s after the GREEN's end (09:13:56), 44 s before core's start (09:15:07) |

- The worktree reflog lists only these commits in that span.
- At 09:46 the worktree index and the branch ref still carried mtime 09:14:23, so nothing has written either since
  core started.
- The parent wrote C9 (09:20) and the merged classification (09:18) during core. Both sit under `docs`, outside the
  guards' `sourcePaths`, and nothing added them.

### 8. 1358-C9: MET WITH NOTES (findings 1, 3 and 5 to 8)

- **Counts.** The merged file holds 762 rows: H 63, G1 83, G2 59, G3 104, G4 120, G5 115, G6 104, F1 22, F2 47 and
  parent 45. Each unit's rows equal its staged `classification.json` in order. The first 44 parent rows equal the
  committed `1358-classification-parent.json` (blob 7c2debec), which 1358-D9b checked. The file's `counts` block
  matches its rows (`j3_check_classification.py`).
- **The 45th row.** D9b-N1, commit 4e36a25, `tests/p14d1-rival-shelving.test.ts:567`, class `comment`. Its `new`
  text sits at :567-568 in 4e36a25 and its `old` text at :567 in 7e7a065. The commit adds two lines and removes one,
  and the row covers all three.
- **Census arithmetic.** The census holds 685 ids. 656 appear in a row id, and the other 29 equal both the file's
  `withoutClassificationRow` list and C9's table. Each table row's class and census line match `census.json`.
- **The 29 dispositions against their evidence.**
  - N-0101 to N-0105: X6 logged the shelving refusal for studio-aca408ec-r01 (1, 4, 1 and 1 cases), and the GREEN
    passes the leaves. Supported.
  - N-0367 to N-0369 and N-0450: X6 logged the V39 message. Supported.
  - N-0498 and N-0522: X6 logged the studio-de11f27b-r04 refusal (3 and 1 cases). N-0524: X6 logged the V37 message.
    Supported.
  - N-0096: X6 logged 20 `validateSaveV44` messages, each matching its case's pattern. Supported.
  - N-0454 and N-0455: 1358-F10 ruling 6 (`1358-F10:49`). Supported.
  - N-0444, N-0449, N-0573 and N-0575: X8 passes the files (36, 14 and 10 tests), and each chain runs outside an
    `expect`, so a refusal would fail them. Supported.
  - N-0542: X7t and X8 pass the file (10 tests). Supported.
  - N-0070, N-0071, N-0354 and N-0640: X8 lists their identities as SAME at :544, :564, :32 and :498. Supported.
  - N-0092: `bytes()` drops `relationships` (b60db650 :316), and the digest leaf (:616) passes in the GREEN.
    Supported.
  - N-0198: X8 passes the file (72 tests) and prints the projection-v56 identity as passed. Supported.
  - N-0150 and N-0151: 5ac4b738 and the producer output. Supported.
  - N-0007 and N-0027: not supported (finding 1).
- **S8 rows with no pin.** X6 logged 102, 32, 15 and 24 cases (173), and none is a version check.
- **Closure findings.** Findings 1 to 4, 6 and 7 match 1358-F11, F12, D9 and D9b. The cited source lines check at
  b60db650: `save.ts:10647`, :8848 and :8833; `hollywoodValidation.ts:539` and :549; `tuning.ts:33-35`. Findings 5
  and 8 drift (finding 8 above).

### 9. Anything else: MET WITH NOTES (findings 2 and 4)

No rule is broken, and no landing commit message contradicts git. Two record items stand between matching gates and
closure: 1358-N's type-gate and generator lines for the landed tree (R2), and 1358-L's update (R4). The rest checks:
- The 440-file core list (`1358-stage/m2/core-list.txt`) holds all 138 swept core test files and slice B's five new
  files. The UI gate covers the five swept UI files.
- All four stems in `recorded3.sh` match `^[0-9]{3,4}[a-z0-9-]*$`.
- `recorded3.sh` (mtime 09:11:28) predates its first run (09:11:37). No landing script changed while it ran.
- The 1,066 lines that f458680b and 5ac4b738 add under `tests` and `ui/src` hold no `Math.random`, tab, trailing
  space, `.skip`, `.only`, `.todo`, `.fails` or `skipIf`. Their two em dashes sit in unchanged text on moved lines, as
  1358-D9 found.

## Method and limits

- **Git in the repo.** `show <commit>:<path>`, `show --stat`, `diff <A> <B>`, `rev-parse`, `ls-tree`, `cat-file -s`,
  and `log --format` without `-p`. I read the worktree reflog and stat'ed the index and the branch ref. Nothing wrote
  to the repo.
- **Git in the scratch repos.** `tag -l`, `log --format`, `diff <A> <B>`, `show`, `rev-parse` and `ls-tree`.
- **No lazy fetch.** The object store still holds 34 packs, none newer than 09:20.
- **Python 3** for hashes and parsing. The helpers sit beside this file: `j3_check_steps.py`, `j3_check_sweep.py`,
  `j3_check_manifest.py`, `j3_check_classification.py` and `j3_head_lines.py`.
- **grep** over the working tree's `tests` and `ui/src`, with `--exclude-dir=fixtures`, to find the helpers' callers.
  The working tree matches b60db650 in source paths: core's preflight found them clean (`recorded3.sh:33`), and every
  disk blob I hashed equals HEAD's.
- **No processes.** No node, vitest, tsc, vite-node, npx or npm.
- **Private data.** I read nothing under `tests/fixtures` and touched no Owner save. The union-fixtures pin rests on
  `cat-file -s` and on the producer's own runtime assertion.
- **Limits.**
  - The default vitest reporter prints failing titles and slow passing ones, so I compared failures only.
  - C9's dispositions cite X6 (r1), X7t and X8 (r2) on scratch archives. I checked them against those records, and
    against the landed tree where the GREEN or the file text covers the leaf.
  - Core had not ended, UI had not begun, and I did not read 1358-M3.
  - Writes: this file and the five helpers, all in `S/1358-land/review/`.
