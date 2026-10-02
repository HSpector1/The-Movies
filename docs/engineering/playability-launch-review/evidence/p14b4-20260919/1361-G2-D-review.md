# 1361-G2-D: independent review of the G2 probe for P15A.1 Wave 2

Read-only review, 2026-10-02 (CDT), for 1361-F ruling 11. E means
`docs/engineering/playability-launch-review/evidence/p14b4-20260919`. P is `1361-G2-probe.test.ts`, R is
`1361-G2-report.test.ts`, TS is `1361-G2-trees.sh`, RS is `1361-G2-run.sh`, T is
`tests/p15a1-market-integration.test.ts` and H is `tests/helpers/p15a1-market-route.ts`. Line numbers refer to the
reviewed bytes.

## What I reviewed

- **The bytes.** All five files match the notes' table: probe `c92e4b67…` (31,686), report `69ef50da…` (34,649),
  trees `f88224db…` (3,400), runner `cb8c523c…` (3,691), checklist `04a67004…` (12,344).
- **The repository** at HEAD 95a4cf06. Its `src` tree (762d8e09) equals e4be3e5c's and ec5ca7af's, so the notes'
  citations hold.
- **The writer's tree** holds tags `base` and `p15a2-r1` (1f2495a). No `p15a1-*` tag exists yet. `base:src` equals
  e4be3e5c's `src`, so K4 compares slice 2a plus P15A.1 against unchanged production.
- **The authority:** 1355-A §4, §5, §7 and §8; 1355-F4:41; 1355-X4:20-21; 1361-F rulings 11 and 13; 1361-R Part 1.2,
  Q4, Q5 and Q16; the G1 probe, notes and progress file; the landed RED and both helpers; hollywoodTick.ts,
  hollywoodPolicy.ts, promises.ts, tick.ts, relationships.ts and save.ts at e4be3e5c; slice 2a's diff; the r1
  dry-run JSON; vitest 2.1.9's runner, spy and RPC sources in `node_modules`.
- **What ran.** Nothing in the heavy lane. One slip: I ran `node_modules/.bin/vitest --version` once. It printed
  `vitest/2.1.9` under the shell's default Node v22.23.2, ran no test and wrote nothing. I also used `python3` to read
  `S/1361-prod/x/r1/p15a1.json`, plus `sysctl`, `df` and `du`.

## Verdict: HOLD

Four required edits, all in R or RS. The probe's measurement design is sound, and no required item touches P. Once the
four edits land and a diff confirms them, the run can PROCEED when `p15a1-c-r1` exists, after the checks in the last
section.
Make the edits before running TS, because TS copies R into each tree and records its hash (TS:23, :48).

## Required before the run

1. **K rows must read Defect** (the parent's answer 4). R files every K1-K5 failure, and a K4 run that did not
   finish, under `Retune`. The overall verdict then reads Retune (R:379) and points at a tuning amendment. Change:
   - R:20: add `'Defect'` to `Band`. R:320: add `Defect: 'D'` to `LETTER`.
   - `'Retune'` becomes `'Defect'` at R:236 (K1, K2), R:243 and R:262 (K3 per seed), R:268 (K3 overall: both the
     test and the result), R:277 and R:290 (K4) and R:312 (K5). The evidence prefixes `defect:` and
     `defect or setup:` can stay.
   - R:379-381: test Defect first (Defect, Retune, incomplete, Flag, Proceed) and keep Defect rows in `reasons`. A
     Defect makes that candidate's threshold rows untrustworthy, so it outranks Retune.
   - Text: the R:6-7 comment, notes :336 (choice 17) and :376, checklist I.6.
2. **"New streak" must not depend on where a read-out cuts the control's streak.** R:105 and R:111 clip stall
   intervals to the scope, and R:168-169 test a candidate streak against the control's clipped streaks of 52 weeks
   or more.
   - Example: the control's rival freezes for good at week 1530, the candidate's at 1490. At read-out 1560 the
     candidate holds [1490, 1560), 70 weeks, and the control [1530, 1560), 30 weeks. The code finds a new streak and
     the 1560 row reads Retune. At 3120 the two streaks overlap and the row clears.
   - Every cumulative read-out gates, so this artifact sets the verdict. p13a's rivals freeze one after another
     (1357-R summary item 2), and pressure moves freezes earlier, so a straddle near a read-out is plausible.
   - Fix: test overlap against the control's whole-run streaks,
     `(ctrl.rivals[studioId]?.stall ?? []).filter(([a, b]) => b - a >= STREAK_WEEKS)`, keeping the candidate's
     streak clipped to the scope. "Stops for good" already uses whole-run weeks for the candidate. Otherwise the
     parent rules the clipped reading deliberate.
3. **Exactly +10% lands in the wrong band.** `increaseOf` (R:150) returns c/k − 1. For c/k = 11/10 the double is
   0.10000000000000009, above the literal 0.1. R:178 then reads Retune where the table says Flag (stall), and R:181
   reads Flag where it says Proceed (below zero). The +25% edge is exact, since 5/4 is dyadic. Both counts are
   integers, so compare `10 * c > 11 * k` and `4 * c > 5 * k`, and keep `increase` for printing.
4. **The report must confirm the RED JSON's tag.** K1 and K2 rest only on `RED_JSON`, and nothing ties it to the
   frozen (c). `run-1361-X.sh` writes `x/<label>/run.meta`, whose first line names the tag and short sha (r1:
   `start at p15a2-r1 1f2495a`). RS `report()` (RS:42-51) or `pinControl` (R:228-237) should read that line and
   refuse unless the short sha is a prefix of the candidate's `treeHead`. A dry-run JSON from an earlier (c) revision
   would otherwise pass K1 and K2 without a word.

## Recommended

5. **Forward every argument in the decide spies** (P:206-221). The mocks pass exactly four and three arguments. If
   P15A.1 added a parameter to any of the three functions, the spies would drop it on the candidate and K4 trees
   only, and K4 would report a production Defect that the probe caused. `(...args)` costs nothing;
   `tickAtFactorOne` already uses rest arguments (P:463).
6. **An absent K4 directory should read notRun** (R:337-348). Today a report run before the K4 stage reads K4 as
   failed. Read Defect only when the directory exists and holds an incomplete or failed run.
7. **Cross-checks in R:** `k4.run.treeHead === cand.run.treeHead`; control `liveSaveVersion` 44 and candidates 45;
   `k3.savedVersion === 44`; and the era-guard leaf passed in `RED_JSON`, the unedited contrast to K4's expected
   failure.
8. **Print the route beside the verdict** (R:399). Proceed or Flag keeps (c). Retune goes to a tuning amendment, then
   G1 and G2 (1355-A:205-206), and ruling 13 lands the rest. Defect goes to a production fix and a new G2. Incomplete
   reruns what is missing. A root share over 2% routes to a storage fix, not tuning (1355-A:196), and R:183 labels it
   Retune.
9. **Memory fallback.** The machine has 8 GB of RAM (`hw.memsize` 8589934592) and 5.7 GB free on a volume 94% full.
   The notes' fallback `--max-old-space-size=8192` (notes :229-231) exceeds physical memory and would swap onto that
   disk. Cap it near 5 GB. The progress lines already print `heapUsed` (P:242-243).
10. **Trees script details.** TS:43 drops whole files from the call-site grep, which also hides a cross-module call
    from hollywoodPolicy.ts to `promisedCastMasks`. None exists today (hollywoodPolicy.ts:1-8 imports nothing from
    promises.ts), and excluding only the definition lines and hollywoodPolicy.ts:84 closes the gap. TS:32 and :35
    should pass `encoding='utf-8'`: tuning.ts:1014 carries non-ASCII characters, and a non-UTF-8 locale would stop
    the edit (visibly).
11. **Outputs.** If p13a's K3 runs to 6240 it adds 5,721 lines per candidate run, so the digest files reach about 80
    to 90 MB, not 65. Keep them in scratch and commit their sha256 with the report. R:415 should print the lowest
    genre's release count beside its mean, since a genre with one or two films can set that row.

## The parent's four answers against the code

| Answer | Code | Result |
|---|---|---|
| 1. Stops for good: the candidate's last filming week precedes the control's by 52 weeks or more; the literal reading prints | R:170-177: `candidateLast` over the whole run, `controlFilmsAt` the control's last within the scope; the band uses `>= 52` (R:177-178); the literal list prints (R:196, :420) | Matches. At 6240 both sides use whole-run weeks; earlier read-outs apply the same test to the prefix |
| 2. Only cumulative figures at 520, 1560, 3120, 4680 and 6240 decide | R:374-378 gate on `r.cumulative.gated` and the K rows; windows are computed (R:362) and kept in JSON | Matches |
| 3. An increase from zero reads Retune, with counts shown | R:150 returns null; R:178 and :181 read Retune; R:417 and :421 print both counts and "up from 0" | Matches |
| 4. A K failure, or a K4 run that does not finish, reads Defect | R reads Retune | Fails: required item 1 |

## The eight checks

1. **Rows.** Every §5 G2 item and threshold row maps to code (A1). Numerators and denominators are right: the factor
   rows read the candidate's assessments in the scope; industry gross sums `boxOffice.total` at release over every
   studio, candidate over control; the stall and below-zero rows sum rivals and compare with the control's sums; root
   share divides `stableStringify(sharedMarket)` bytes by the canonical save's bytes at the read-out. The faults sit
   in band logic: items 2 and 3.
2. **The decide spies.**
   - The classification matches hollywoodTick.ts:225-236 exactly.
   - `follow()` (P:198-204) is sound. Evaluations run one at a time and each opens with its own `promisedCastMasks`
     call (:220). The commission search (:324) passes `lockScreenplay: false`, and P:214 skips it.
     `chooseIndustryPackage` calls `searchIndustryPackages` inside hollywoodPolicy.ts (:84); no spy sees that
     same-module call, so the order guard holds.
   - Viable equals filmAnnounced by the code: a viable result always reaches `greenlight()` (:265, :292-295),
     `greenlight()` appends exactly one filmAnnounced receipt (:257), and no other src/core line writes that kind.
3. **The digests.** `token()` (P:156-172) reproduces `stableStringify` (save.ts:689-715) for every
   JSON-representable value, `-0` and array holes included, so equal digests mean equal canonical text.
   `keyDigests` strips with each tree's own `stripP15`: three keys at e4be3e5c, four in the writer's tree. The
   control state carries none of them and the candidate carries `p15Sequence`, `powerRanking` and `sharedMarket`
   (GameStateV45 at p15a2-r1, plus P15A.1's root), so the stripped key sets match. P:256 audits the memo against a
   fresh one at every read-out.
4. **K3.**
   - The control's own Save44 export at 520, migrated by the candidate, is the charter's cold start. Slice 2a's
     `convertV44ToV45` adds empty roots at the tick (save.ts:10958-10962 at p15a2-r1), so no pre-migration release
     becomes an exposure, and at 520 both seeds still release, so the ramp is exercised.
   - The test is right. Digests must match from 520 through the pressured week's pre-state, and the post-state must
     differ (R:246-256). The factor-1 twin must equal the control's post-state (R:251, :257). Every path where the
     pressured state and its twin differ must lie in K1's chain for the pressured films (P:441-443, R:259).
   - The twin is sound. Factor 1 is bit-exact (RED 1), the batch and the root still run, and `forcedSeamCalls`
     (R:258) proves the spy reached the seam. The twin equals the control by digest, so pressured-minus-twin paths
     are pressured-minus-control paths in canonical text.
5. **K4.** The edit matches 1355-A:168. The one-line diff (TS:37-38), `roleOf` (P:144-148), the all-factors-one check
   (R:282) and the frame check together suffice. The era-guard expectation is right: T:705 compares `canon`
   strings, `canon` sorts keys, and chai truncates each string at 40 characters (chai/lib/chai/config.js:49), which
   still leaves `{"SHARED_MARKET_FACTOR_MAX_PENALTY":0…` in the message.
6. **K5, K1 and K2.** K5 runs two vitest processes and compares the digests of every week, the K3 files, the
   read-out save hashes and the untimed rows (R:298-317). K1 and K2 come from `S/1361-prod/x/<label>/p15a1.json`,
   which `run-1361-X.sh <frozen (c) tag> <label>` writes (run-1361-X.sh:22, :30, :34) with the tree at that tag. At r1
   that JSON holds exactly two "(K1)" and two "(K2)" leaves, all in T. Provenance: required item 4.
7. **The trees and the runner.**
   - Each tree is right for G2: archives of the right shas; only `node_modules` linked; `tests/fixtures` left out.
     Leaving fixtures out is safe: no G2 file reads them, T's module scope and era-guard leaf read none (T:47-155,
     :688-707), and `tests/p14d1-rival-shelving-fixtures.ts` builds URLs at module scope but reads only inside
     functions (:23, :29; reads at :35, :41, :64, :69).
   - No file in the run imports `bridge-contract-union-fixtures.ts`, so no copy is needed. Nothing is written under
     a link, given `--no-cache`.
   - Each stage is one vitest process under the lane lock; smoke runs six in sequence.
   - Run time of 40 to 55 minutes is plausible from G1's 82 s and 352 s plus the digest cost. Memory: item 9. Disk:
     item 11.
8. **What could make the verdict wrong:** items 1 to 4. I found nothing that would void the run.

## Checklist

**A. Scope**
- **A1 pass.** Gross P:350-366, R:121, :162, :202-206. Reserve and zero P:339-340, R:112, :180-181, :207. Player
  P:261, R:208. Stall P:335-336, R:105-111, :167-179. Shelvings P:312, R:113. Retries P:321-323, R:453. Longest
  no-greenlight R:85-95, :114. Last filming P:343-347, R:115. Decide by kind P:194-236, :316-330, R:454. Root and save
  bytes P:262-263, R:182-183, :212. Tick time P:292, R:124-129. Factor rows R:134-145, :190-194. Gross ratio R:195.
  K rows R:227-317. No row is missing.
- **A2 pass.** Route P:269; one tick a week P:287-291; read-outs P:123, :488; seeds RS:12. Seed-b runs as
  `p13aGeneratedStudio('seed-b')` (1355-X4:20-21; ruling 11).
- **A3 pass.** Control TS:15, :26; candidate TS:16, :27; K4 TS:28-38. The archive paths cover every import of P, R and
  T. `src/core` reads no file and imports nothing outside `src`.
- **A4 pass.** e4be3e5c's `LIVE_SAVE_VERSION` is 44 (save.ts:6567). The control writes its K3 save with
  `exportCurrentState` (P:391-394), and R:254 checks that the version rose. An exact `=== 44`: item 7.
- **A5 pass.** P writes under `PROBE_OUT` only (P:243, :276, :393, :429, :499, :513, :518); R under its `out`
  (R:393-394, :466); TS under `run/`; RS under `run/out`. `lane-run.sh`'s lock sits outside `run/` by design.
- **A6 pass.** See check 7.

**B. The probe's measurements**
- **B1 pass.** W is the pre-tick week (P:289); a read-out at R covers W < R (P:295, :387). Receipts and releases must
  carry W (P:308, :353). First takes carry W + 1 (tick.ts:1134-1143), and P stores W. G1 uses the same rule
  (1355-G1-probe.ts:243).
- **B2 pass.** Same fields as H:101-115 and 1355-A:118-120. Authored films are skipped by provenance (P:363), as in
  G1 item 11.
- **B3 pass.** The names match `PERSISTED_ROW_KEYS` (H:42-45) and `MarketAssessment` (sharedMarket.ts:62-74).
- **B4 pass.** The active-index reading matches the 1357-R stall: two index screenplays cash-blocked for good.
  Shelved screenplays sit outside the index (hollywoodTypes.ts:140-145) and return only through a retry.
- **B5 pass.** P:340 reproduces 1357-P (:65-71, :108-110, :161): the post-tick state, at the produced week's cost.
- **B6 pass.** Only hollywoodTick.ts:257 and :281 write those kinds at e4be3e5c.
- **B7 pass** on items 1 to 5 (check 2). Item 6 passes with the narrow blind spot of item 10, and item 5 hardens
  item 1.
- **B8 pass.** save.ts:6571-6576, :6594-6596; P:254, :261, :263.
- **B9 pass.** The rules match save.ts:689-715. Writes copy first at hollywoodTick.ts:45, :121-123, :351-352, :411,
  :422, and P:256 catches any stale memo at read-outs.
- **B10 pass.** `mockClear` resets tinyspy's calls and results (@vitest/spy dist/index.js:69-70). The memo holds
  strings under weak keys. Per-week growth is limited to rows, intervals and `tickMs`.

**C. K1 to K5**
- **C1 pass.** K1 and K2 are RED 10 and 11 (1355-A:244), pinned at the RED commit: the MANIFEST reads record 1355-P,
  saveVersion 44, K1 week 21 with nothing committed, K2 week 12. The G2 trees carry no fixtures, so reading the leaves
  from the frozen tag's dry run is the faithful route.
- **C2 pass.**
  - (1) The JSON round trip keeps canonical text. A load sorts keys, and the code already pins order where float
    sums depend on it (hollywoodTick.ts:37-41). A K3 mismatch before the pressured week while K4 stays clean would
    point at save and replay, not at P15A.1.
  - (2) P:438. (3) Yes on both counts.
  - (4) Yes: the twin equals the control by digest.
  - (5) R:247-261 hold the five clauses, and R:268-269 the one-seed rule. Relationships read only `criticScore`
    (relationships.ts:462-469), which the factor never moves, so K1's path list fits K3's natural weeks.
- **C3 pass on substance, fail on label.** Not failing the whole report on an unfinished K4 run is right, but the
  band must read Defect (item 1).
- **C4 pass.**

**D. Bands and the verdict**
- **D1.** Pass for the floor rows: I agree with 0.95 in Proceed and 0.90 in Flag. Fail at exactly +10% on the two
  increase rows (item 3).
- **D2 pass** after item 1.
- **D3 pass.** stats.ts:41-52 is type 7, and ties go to the earlier genre (R:142), as in G1 item 6.
- **D4 pass.** Matches the parent's answer 1.

**E. Scripts**
- **E1 pass.** TS:7, :14, :20-22, :29-38, :41-46. TS:38 counts only `<` and `>` lines, so an `Only in` line would slip
  through, which cannot happen when both trees come from one archive.
- **E2 pass** except item 4. Node pin RS:13; refusal RS:17; smoke RS:55-60; the era-guard stage accepts exit 1 and
  requires the JSON (RS:32-40); `lane-run.sh:24` passes the environment to the command, so `RED_JSON` arrives.
- **E3 pass.** No arrays and no `${var,,}`.
- **E4 pass** with items 9 and 11. G1 took 82 s and 352 s; 1357-X:132 took 91.5 s and 362.5 s. The control tree also
  runs slice B's relationship step, which G1's Save43 tree did not, so G1's times are a floor.

**F. Determinism and side effects**
- **F1 pass.** No `Math.random` or `Date`. `performance.now` feeds only the four timing fields and progress lines.
- **F2 pass.** The spies return the originals' results unchanged (P:209, :215, :220); P:468-473 restores the twin's
  spy; P:521 restores the rest.
- **F3 pass.** P:516-519; R:34-35.

**G. Type-check by reading**
- **G1 pass** at e4be3e5c and p15a2-r1. Every cited export exists. T, both helpers and `_fixtures.ts` are the same
  blobs in both trees, apart from T's `CAPTURE_MANIFEST_SHA256` pin. P15A.1's additions remain unknown.
- **G2 pass.** I found no strict-mode error by reading.
- **G3 pass.** R:16 is `import type`.

**H. Before the run**
- **H1 pass at p15a2-r1.** worldgen.ts:820 spreads `initialP15Roots(0)`. P15A.1 must add `sharedMarket` there
  (save.ts:10877-10879).
- **H2 pass at p15a2-r1.** `LIVE_SAVE_VERSION` is 45; `migrateToLive` calls `migrateToV45` (save.ts:10224,
  :10975-10978). Recheck at (c).
- **H3 question** until (c) exists.
- **H4 question** until (c) exists. TS:41-46 and P:198-204, :233-234 stop the run on a changed call order.
- **H5 pass at p15a2-r1.** tuning.ts:1014 holds the line once.
- **H6 pass at p15a2-r1.** Four keys.
- **H7 open.** Item 4.

**I. Choices**
- I.1, I.3, I.4 and I.6: the parent has ruled; the code matches all but I.6 (item 1).
- I.2: accept the active-index stall (B4).
- I.5: accept one save per seed at week 520 (check 4).

## Before the run, once p15a1-c-r1 exists

1. Apply items 1 to 4, and any recommended items, before TS runs. Update the notes' sha256 table.
2. `git -C S/1361-prod/tree diff p15a2-r1 p15a1-c-r1 -- src/core/hollywoodTick.ts src/core/tick.ts`:
   - `decide()` (hollywoodTick.ts:201-337) is unchanged.
   - Both release sites pass the factor inside the inputs to `resolveReception` (hollywoodTick.ts:388, tick.ts:625).
   - No forecast, chooser or package input carries `competitionFactor` (1355-A:76-79).
3. `initialP15Roots` returns `sharedMarket: {version: 1, recordedFromWeek: week, assessments: []}`.
4. The validator's v1 law reads the live `TUNING`. Otherwise K4's batch (penalty 0) and validator disagree, and K4's
   first read-out stops on a validator refusal.
5. Run `run-1361-X.sh p15a1-c-r1 <label>` first. Its `p15a1.json` should show the four K leaves and the era-guard
   leaf passed. Use it as `RED_JSON`.
6. Run smoke first. Then check `runs.meta`, the start lines (Save44, Save45 and one probe sha256) and `heapUsed`.
7. If a probe stage prints one passed test but exits 1 on a `[vitest-worker]: Timeout calling` unhandled error, its
   outputs stand: check `complete` in `g2-run.json`. The worker's RPC calls time out after 60 s
   (vitest/dist/chunks/rpc.C3q9uwRX.js:62), and the 1356 harness's 81.7 s synchronous body did not trip it, so I
   expect no such error.
