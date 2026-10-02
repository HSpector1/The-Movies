<!-- 1344-J3: independent review (read-only) of 1344-M3, saved verbatim by the parent -->

# 1344-J3: independent review of 1344-M3

E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. core.txt and ui.txt are `E/1344-save43-sweep-broad-core.txt` and `E/1344-save43-sweep-broad-ui.txt`. Repo HEAD is 85764cd5.

**Method.** I used read-only git, `shasum`, `wc`, `grep` and python3 one-offs that print to stdout. To re-run the archived scripts, I executed their source in memory with the final `json.dump(..., open(out_path, 'x'))` swapped for an in-memory capture, so nothing was written. No vitest, tsc, node, tsx or vite-node ran.

## Verdict: REFINE

The gates and the attribution hold. So does the 1344-N success line, read as 1344-F6 §3 reads it.
- I re-derived all 85 core and 3 UI identities from the raw logs.
- The archived scripts reproduce every committed JSON exactly.

Two statements need correcting before 1344-K cites the record:
- x3's tree does not equal the applied tree "apart from the HYGIENE comments".
- The Node section claims no visible effect, but durations moved.

Neither changes a verdict, and neither needs a re-run.

## Checklist

**1. Run identity: MET WITH EVIDENCE.**
- **Preflights.** For core and UI, `head` = `remote` = 469a9547f1a3….
  - The runner also checked five things: HEAD against FETCH_HEAD, no running vitest, clean source paths, 5 GiB free and no prior outputs. It also checked that the list has 433 lines (`S/1344-gates/run-gates.sh:19-28`).
  - `S/1344-gates/gates.meta` has no STOP line.
- **Recorder JSONs.**
  - `fixedSource: true`.
  - `sourceSha` and `sourceShaAtEnd` are 469a9547….
  - `testedDiffSha256` and its end value are e3b0c442…, the sha256 of empty input.
  - `untrackedSource` is empty at start and at end.
  - Both `.patch` files are 0 bytes.
- **Postflights.** `fixedSource: true` and `allGuardsExact: true`. `sourceInventory`, `index` and `stageEntries` equal their preflight values.
- **Raw files** (`wc -c`, `shasum -a 256`):
  - core.txt: 14,839,339 bytes, 6983b02a…5e17.
  - ui.txt: 211,558 bytes, f86972d5…a3c3.
  - Both match M3:38-39, M3:86-87 and the postflights' `raw` fields.
- **Tallies and times.**
  - Tallies match core.txt:5007-5010 and ui.txt:1293-1296. Neither log has an `Errors` line.
  - Start times match the raw logs (20:08:13 and 21:26:58). End times come from the recorder (see note 6).
- **Core command.** It lists the 433 lines of `S/1344-merge/core-list.txt` in order, with no duplicate. Compared with 1344-M's command, it adds exactly the four files of M3:30-31.

**2. Attribution: MET WITH EVIDENCE.**
- **My own parser.**
  - Over the whole core log (all 85 rows, not a sample), it gives identities and primaries equal to `1344-I3-core-failures.json`.
  - Over the UI log, it gives the 3 rows of `1344-I4-ui-failures.json`.
- **My own diff.**
  - Against `1338-I-failures.json`: SAME 73, CHANGED 5, NEW 7, GONE 1.
  - Against `1343-I-failures.json`: SAME 0, CHANGED 3, NEW 0, GONE 7.
  - Both equal the committed comparisons row for row.
- **Archived scripts.** `1321-I-attribution.py`, `1317-I-attribution.py` and `1344-I-compare.py` reproduce I3, I4, I3-vs1338 and I4-vs1343 exactly. Each script has a single commit: 29273d7f, bc628fc1 and c25da7c6.
- **Failing files.** There are 23: 1338's 21, plus the three F6 files, minus the exporter file.

**3. NEW dispositions: MET WITH EVIDENCE.** Core NEW is exactly the seven F6 identities, and UI NEW is empty.
- **Row 6.**
  - The leaves sit at `tests/p14b5-relationships.test.ts:651`, `:661` and `:859`.
  - The raw frames are `rivalWorld …:397:53`, then `:653:46` or `:860:42`.
  - The primary is `expected [] to deeply equal [ 'studio-aca408ec-r01:film:6' ]`, as F6:13-14 quotes.
- **R1-R3 and N10.**
  - R1-R3 (`:34`, `:49`, `:60`) fail in `beforeRivalCutoff` at `:25:42`, the premise line that F6:40 quotes.
  - N10 (`:230`) fails in `assertOutcomeDispatch` at `:141:19`.
  - The raw diff shows `"outcome": "SATISFIED"` and `"progress": 1`, as F6:41-43 states.
- Every NEW primary and frame equals x3's (`1344-X9-core-failures.json`). No NEW row lacks evidence.

**4. CHANGED and masked rows: MET WITH EVIDENCE.**
- **S10 rows.** The gate's received values equal X10's head anchors in `E/1344-stage/s10/out/`:
  - seating seed-b: `d32e68f6…` (row1 `C1_head_anchor`);
  - family 12 `p13-public-commercial-adoption`: `62c9fd5d…`;
  - family 12 `p13a-core-causal-01`: `8a4df62f…`;
  - family 12 seed-b: 48 rows and 41 settled ("length of 48 but got 41").

  Every gate in those predicate files passes (X10:19-22).
- **C20 (`p14c3-save-v38`).**
  - Its primary differs from 1338's in one character: index 62 changes from `42` to `43`.
  - In the diff body, the expected string is identical.
  - The 1,697,372-character received string equals 1338's once I remove the version digit and four empty `screenplayShelving` objects.
- **Masked rows.**
  - C1, C15 ×2 and C3 ×3 are SAME, with 1338's primaries and frames.
  - In 1344-M, each stopped at `validateSaveV42: expected version 42` or `expected 43 to be 42`.
  - For C20, see note 2.

**5. x3 rows absent from the gate: MET WITH EVIDENCE.**
- `bridge-supervisor` passes 14 of 14 (core.txt:1182), and each of x3's seven "Fake Unity" leaves shows ✓ (core.txt:1183-1190).
- `hygiene` passes 1 of 1 (core.txt:3726).
- The six C17 rows are SAME and carry the repo path. No gate primary contains `/studio-scratch/`.
- 1344-M's four load rows also pass:
  - `bridge-p13b-s7-disclosure`, 22 of 22 (core.txt:1059);
  - `bridge-runtime-worker`, 8 of 8 (core.txt:2791);
  - `bridge-supervisor` and `hygiene`, as above.

**6. Wave 1 table: MET WITH EVIDENCE.** All eleven files pass with M3's counts (core.txt:6, 372, 373, 552, 905, 2664, 2846, 2973, 3400, 3512, 3551). Each count equals its landing's GREEN raw:
- 1346: 33 + 2 = 35;
- 1351: 46 + 2, within its 83;
- 1352: 41 + 11 = 52;
- 1353: 72 + 6 = 78;
- 1344-L: 28 + 18 + 5 = 51.

**7. UI: PARTIAL.**
- **CHANGED 3.**
  - The rgba-export tool-contract rows 6-8 fail at `:138:7`, `:164:9` and `:178:7` on `No module named 'numpy'`.
  - In 1343, they failed at the Pillow probe `:119:5`. The 1343 raw holds 30 occurrences of `No module named 'PIL'`; ui.txt holds none.
- **GONE 7.** These rows pass: `authored-stage-a` 17 of 17 (ui.txt:1016) and `authored-rgba-export` 5 of 8 (ui.txt:1132-1143). This matches 1345-E:26-45.
- **Intermittent rows.** All four pass with M3's durations: 1,114 ms (ui.txt:78), 11,853 ms (:604), 840 ms (:638) and 1,397 ms (:700).
- **Deep route (M3:117).**
  - The counts match M2:55 plus this gate: 2 of 4, plus 1 of 1, and 2 of 2 at 6b73e424.
  - "At HEAD" pools two sources and two Node versions. M2's four runs were at 644b9038; the recorded one ran v20.20.2. This gate ran at 469a9547 on v22.23.2.
  - `git diff --stat 644b9038 469a9547 -- src` shows `campaignLegacy.ts` +805 and `tuning.ts` +22.

**8. Checker: MET WITH EVIDENCE.**
- **What it encodes.** It reads F6 §3 at the identity level.
  - It takes x3's NEW rows in the three F6 files as the seven exceptions and asserts there are seven (check.py:17, :24-25).
  - It requires core NEW to equal that set (:41-42).
  - The remaining checks:
    - GONE is the exporter row;
    - SAME plus CHANGED is x3's 78;
    - CHANGED is x3's five non-scratch rows, with x3's primaries;
    - the UI sets equal x3's.
- **Reproduction.**
  - Executed in memory, it reproduces `1344-M3-check.json` exactly, and all ten checks hold.
  - Over x3's own comparisons, it fails on the 6 C17 rows and on 8 more (7 `bridge-supervisor` and 1 `hygiene`), as M3:163-164 says.
- **Limits.**
  - It reads "the hygiene row must pass" (F6:56) as "does not fail".
  - It checks neither the NEW primaries nor the numpy cause. I checked those by hand under items 3, 5 and 7.
  - Its docstring premise (check.py:3) is defect 1.

**9. Node: PARTIAL.**
- **What M3 states.** The recorder `node` fields read v20.20.2 for 1338, 1343, 1344-M and 1344-M2, and v22.23.2 for both gates. M3:22-23 and :136-140 say this plainly.
- **What M3 omits.**
  - The 1353 RED and GREEN runs, whose counts M3's Wave 1 table cites, ran v22.23.2 (from 2026-09-30T18:19Z).
  - x3's Node version is unrecorded: `S/1344-merge/x3.meta` and `run-dry-run.sh` capture none. x3 ran after the switch to v22.
- **"No row moved" holds for identities and primaries.** Three facts show this across Node versions:
  - the 73 SAME primaries equal 1338's (v20) byte for byte;
  - the C20 received payload equals 1338's apart from the Save43 additions (item 4);
  - the GONE row and the UI rows behave as 1345-E measured them before the switch.
- **Two of the three supports in M3:142-144 are not evidence across versions.** x3 most likely ran v22. Skip and todo counts come from static `it.skip` and `it.todo` declarations.
- **M3:141, "Effect. None that the gates can see", is wrong for timing.**
  - The 51 slow UI leaves of `1343-I-slow-leaves.tsv` ran at a median 0.75× of their 1343 durations. The 16 synchronous bodies ran at a median 0.67×.
  - m5-determinism went from 300,268 ms to 133,531 ms.
  - livingTurn 12-week took 11,853 ms, against 16,195 ms in 1343 (tsv:9), on a 15 s budget.
  - The gate cannot separate the Node version from machine state.
- **A re-run under v20.20.2 is not necessary for the success line.**
  - Every failing identity either matches the v20 baseline or has an attribution outside Node, with its own evidence.
  - A logic change caused only by Node would surface as an unexplained NEW or CHANGED row among 4,959 tests heavy with byte and digest pins. None does.
  - Speed is the only effect of Node the gates show. It touches only timing-budget rows. The success line treats those as environment rows, and M3:116 keeps M2's readings open.
  - A v20.20.2 UI re-run (about 12-19 minutes) becomes necessary only if 1344-K calls the M2 intermittent rows or the 1344-M load rows resolved.

**10. Overclaims, numbers, baselines, wording: PARTIAL.**
- The numbers check out, apart from the end-time pairing (note 6).
- I found no em or en dash, and one passive ("are named", M3:127).
- The overclaims and mislabels are defects 1-2 and notes 1-5.

## Blocking defects

1. **x3's tree does not equal the applied tree "apart from the HYGIENE comments"** (M3:125, M3:162-163; check.py:3 and HANDOFF.md:57 repeat the claim).
   - **History.** The applied patch is the merge tree's 6c54d5e..27b56c2 (C5:19, C5:25-28). x3 ran at 6935ea5 (X9:5). Two commits came after it: 62f14e7 (HYGIENE) and 27b56c2.
   - **What 27b56c2 changes.** It replaces two `toThrow` regexes in `tests/p14c3-transitions.test.ts` with anchored measured messages (HEAD :175 and :207; D4:30; X12:41-48).
   - **Tree comparison.** I ran `git ls-tree` on 469a9547 and on `S/1344-merge/tree`:
     - `tests` plus `ui`, without fixtures, hold 1,192 files;
     - those files equal 27b56c2;
     - they differ from 6935ea5 in three files: the two HYGIENE files and p14c3-transitions;
     - `src`, `generated` and `bridge` equal both trees.

     The "1,192 files" equality in cec3902c's message describes 27b56c2.
   - **Fix.** State that the type gates ran clean at x3, and that the applied tree differs from x3 in three test files: two comment edits, and two regex literals plus comments. None of these changes a type, and the type gates at HEAD remain pending.
   - The checker's expected sets stand: the transitions file passes in both trees (X9:70; core.txt:2691).
2. **The Node section overclaims** (M3:141-144).
   - Replace "Effect. None that the gates can see" with what the gates show: no identity or primary moved (with item 9's evidence across versions), but durations did move (item 9's figures).
   - Drop the x3 and skip/todo supports, or mark them as same-version.
   - Name the 1353 runs on v22.23.2.
   - M3:107 and M3:130 should then say that, for timing rows, the gate cannot separate the quiet lane from the Node change.

## Non-blocking notes

1. **M3:117.** Name the commits and Node versions behind "3 of 5 runs at HEAD": 2 of 4 at 644b9038 and 1 of 1 at 469a9547.
2. **M3:128.** The C20 row never left its own assertion. 1344-M already failed it there, at `:93:49`, with the same message as now, and 1344-M:45 files it as a byte pin. The word "again" comes from 1344-N:58's grouping.
3. **M3:164** calls the hygiene row "scratch-only". X9:52 and X9:77-86 show it is real: it failed in the repo until HYGIENE.
4. **M3:58** should say why the exporter row is GONE. It passes under the 1345-E Pillow `.venv` (core.txt:3656; 1345-E:30-33), and 1345-E:50-51 asks every attribution to name that change.
5. **M3:3 and :130** say no environment row appeared. The three numpy rows are environment failures (1345-E:44), so "no new environment row" is the accurate wording.
6. **M3:44 and :92** pair the raw start with the recorder's `end`. From the raw alone (start plus duration), the end times are 21:26:51 and 21:39:16.
7. **M3:33 and :81.** "Recorder. Exit code 1" is the child's `exitCode`. The recorder process itself exited 0 (`gates.meta`: "run exit 0").
8. **M3:19-20 cites nothing.**
   - 1359-C4:13 gives the 20:07:01 last run.
   - 1356-C4:3 and :44 report the lock held from 20:08:57 and no run.
   - The runner checks `pgrep vitest` only once, at start, and the lock is advisory.
9. **M3:63** cites 62f14e7, a scratch commit. In the repo, `git cat-file -t 62f14e7` returns "Not a valid object name". HYGIENE is part of cec3902c there.
10. **Reproduce block (M3:154-160).** M3 never defines E, and every script opens its output with mode `'x'`, so the commands fail on the committed files. Send outputs to a scratch path and compare them.
11. **1343's unhandled error.** It did not recur (I4 `unhandled: []`). One line naming the U3 change 8b984d12 would complete the UI comparison.
