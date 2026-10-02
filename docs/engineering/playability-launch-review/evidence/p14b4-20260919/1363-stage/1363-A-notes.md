# 1363-A notes: sources read, method, and every citation checked

Companion to [1363-A-rival-recovery-amendment-charter.md](1363-A-rival-recovery-amendment-charter.md). Written
2026-10-02. `date` read 13:47:35, 14:09:48, 14:15:50 and 14:31:37 CDT during the work.

## 1. The tree

- **HEAD moved five times during the work,** each time by a docs commit (`git log --oneline 3ebaca24~1..HEAD`):
  - 3ebaca24 at the brief;
  - c6ad14f1, the Owner's second response in 1362-O and the matching DECISIONS.md lines;
  - ec5ca7af, HANDOFF;
  - 2b1ffd6e, 1361-E, 1361-X and 1364-R;
  - 95a4cf06, HANDOFF;
  - 7d582318, 1361-GP-D, 1361-F2, the G-P r2 stage files, and two lines at the head of 1361-F (`git show --stat`).
- **The source never moved.** `git rev-parse` gives `src` 762d8e09 at 1706d844, 3ebaca24 and HEAD, and
  `git log --oneline 1706d844..HEAD -- src` is empty. The charter anchors at 7d582318.
- **`hollywoodTick.ts` is one blob,** 1c9c523d, at b0809602 (1357-R's HEAD), at 469a9547 (1344-V's candidate) and at
  HEAD.
- **The source commits since 1357-R** are slice B's three: 9eb1e66e, 8df1858e and 615adeb2
  (`git log --oneline b0809602..HEAD -- src`). They touched `index.ts`, `relationshipLabels.ts`, `relationships.ts`,
  `save.ts`, `talentMarket.ts` and `types.ts` (`git show --stat`).
  - So 1357-R's `talentMarket.ts` lines were rechecked: :389-401 and :457 hold, and its :1235 is :1238 at HEAD.

## 2. What ran, and what failed

- **No runners:** no node, vitest, tsc, npm, npx, tsx, vite-node or python.
- **Git, read-only:**
  - used: `rev-parse`, `show` (blobs, `--stat`, and 7d582318's change to 1361-F), `cat-file -p`, `grep`, `ls-files`
    and `log --oneline`;
  - never used: `status`, `add`, `commit`, `checkout` or `diff`.
- **Shell readers:** `cat`, `sed`, `awk`, `cut`, `head`, `wc`, `ls`, `uptime` and `date`, plus one `mkdir` for this
  directory.
- **Failures:**
  - `timeout` does not exist in this shell (exit 127). Its error text landed in the first `.hv.ts` copy, and a rerun
    of `git cat-file -p` without it replaced the copy.
  - Shell `grep` worked in nine early commands, then hung three times past the 120-second limit and went to the
    background with no output. I stopped two with TaskStop; the third hit its background time limit. awk and
    `git grep` replaced it.
  - One awk pass over several files used `NR` in place of `FNR` and misreported `technologyRival.ts` lines. The
    re-read gives :19, :48, :78 and :86.
- **One search scanned `tests/fixtures`.** A `git grep` for `shelving-natural-route` used the pathspec `tests`, which
  includes `tests/fixtures`. It matched only `tests/p14d1-rival-shelving-natural.test.ts`.
  - I opened no fixture file.
  - The only fixture facts the charter uses are path strings in the loaders: `tests/p14d1-rival-shelving-fixtures.ts:7`
    and `tests/helpers/p15a1-market-route.ts:499-500`.
- **The command history.** To rebuild §3, I read my own tool calls from this session's transcripts under
  `~/.claude/projects/`, read-only.
- **Scratch files.** These held blob copies and that history: `.hv.ts`, `.tm.ts`, `.rr.ts`, `.tr.ts`, `.hsd.ts`,
  `.fc.ts`, `.hp.ts`, `.tu.ts`, `.ht.ts`, `.hw.ts`, `.pl.ts`, `.mm.ts`, `.em.ts`, `.ac.ts` and `.cmds.txt`. All lived
  in this directory, and I deleted them at the end.
- **Limits kept.** No Owner save was touched, and nothing was written outside
  `/Users/zacheryspector/studio-scratch/1363-recovery/`.

## 3. Sources read

**Owner and parent records** (E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`):
- **Read whole:** 1362-O, 1357-R, 1357-F3, 1357-X, 1357-F2, 1357-A, 1357-F, 1357-B, 1344-A, 1344-V, 1344-F6, 1352-A,
  1352-F, 1352-W0, 1340-O, 1342-O, 1361-F (at 3ebaca24), 1361-F2, 1360-F2, 1360-F3 and 1359-F5.
- **Read in part:**
  - 1342-O-approved.txt :1-200;
  - 1344-K: the first 6,000 bytes, its key lines, a listing of its non-path lines, and the `genuineInputs` paths
    (:75-137);
  - 1361-F at 7d582318, :74-140, and that commit's two-line change;
  - 1361-R :1-110, with its capture and pin lines found by keyword;
  - 1361-GP-D: the finding headings and :93-98;
  - 1360-L :1-115;
  - 1359-A: its headings and :258-284;
  - 1353-F6 :70-82;
  - 1359-X4 :4-27, by keyword;
  - 1355-A: its K and pin lines by keyword, :150-281, and :170-176;
  - 1355-C4 :130-160 and :205-222, with keyword lines;
  - 1355-X2, by keyword.

**Repository files:**
- DECISIONS.md :1-130 at 3ebaca24, and :100-150 at HEAD;
- HANDOFF.md :1-88, with its keyword lines.

**Source at HEAD (`src/core/`):**
- **Read whole:** `hollywoodTick.ts` and `hollywoodPolicy.ts`.
- **Read in part:**
  - `hollywood.ts` :1-270, `hollywoodTypes.ts` :40-160, and `hollywoodValidation.ts` :60-139, :225-398 and :534-545;
  - `employment.ts` :60-95 and :195-215;
  - `actions.ts` :1475-1500, :2669-2770, :2975-2985 and :3036-3044;
  - `placement.ts` :1340-1420;
  - `talentMarket.ts` :376-465, :480-509, :690-729, :1105-1140, :1225-1240 and :1380-1409;
  - `rivalResearch.ts` :110-160 and :200-272, and `technologyRival.ts` :15-60;
  - `hollywoodStartingData.ts` :5-13, :35-52 and its template lines, by keyword;
  - `marketingMenu.ts` :1-96;
  - `forecast.ts`, its stream lines by keyword;
  - `tuning.ts` :26-42, :100-141 and :2088-2100, with the named constants' lines by keyword;
  - `save.ts`, the `LIVE_SAVE_VERSION` line.

**Tests at HEAD** (no fixtures):
- **Read whole:** `tests/p14d1-rival-shelving-natural.test.ts` (128 lines).
- **Read in part:**
  - `tests/p14d1-rival-shelving.test.ts`: leaf titles by keyword, :200-312, :436-462 and :550-556;
  - `tests/p14d1-rival-shelving-fixtures.ts`, the loader's lines by keyword;
  - `tests/p15a1-market-integration.test.ts` :1-60, :405-480, :738, :748 and :790-830;
  - `tests/helpers/p15a1-market-route.ts` :1-60, :100-140, :260-400 and :480-510;
  - `tests/p15c2-campaign-legacy-integration.test.ts` :820-885, with keyword lines;
  - `tests/p14b5-relationships.test.ts` :155-170 and :379-420, with the leaf lines;
  - `tests/p14c2c-rival-promises.test.ts` :25, :34, :49 and :60;
  - `tests/p14c3-admission-boundaries.test.ts` :141 and :230.
- **Searches:** `git grep` over `tests/*.test.ts` for `natural-route`, `F10` and `F11`, and over `tests` for
  `shelving-natural-route` (§2).

## 4. The coordinator's two mid-task messages

**The first, at 13:50 CDT (1362-O :238),** relayed items 6 and 7 and the follow-on facts. I checked it against 1362-O
at HEAD:
- Items 6 and 7 match :189-199 word for word, and the routing matches :226-238.
- **Leaf lines.** The message gave the row 6 leaves at :651, :661 and :859, which are 1344-F6's lines (1344-F6 :12-14).
  At HEAD the leaves sit at :656, :666 and :874, so the charter gives both.
- **Premises.** They match 1344-F6:
  - `script-0006` shelved at week 208 on its 13th rejection, with retry week 234 (:15-16);
  - `script-0229` and `script-0230` shelved at week 2612 (:41-42).

**The second, between 14:15 and 14:31 CDT by `date`,** relayed 1361-F2 ruling 5: G-L reruns as part of 1363's
verification.
- Its wording matches 1361-F2 :48-55 at 7d582318.
- It went into charter §6.1 (a route row), §6.7 (the findings list), §6.8 (new) and §8.1 (step 10 and a bound).
- **The same record changes two lines of mine.** Its ruling 3 corrects 1361-F rulings 11 and 13: a G2 Retune sends
  P15A.1 to its own later step, because (a) and (b) cannot land without (c) (1361-F2 :26-38). The charter's
  pressure line (§6.1) and its P15A.1 bound (§8.1) now follow that correction. Neither change alters 1363's design.

## 5. Citation check

Each row gives what the cited line says at HEAD 7d582318, and the charter section that uses it. The `src` tree is
762d8e09. I read every line; none is inferred.

### 5.1 Owner and parent records

| Citation | What it says | Charter |
|---|---|---|
| 1362-O :20-66, :23-46 | the first response's fenced verbatim block; its 1357-Q1 part | header, §1.1, §1.2 |
| 1362-O :26-29 | "distinguish cash being the actual binding constraint…"; "A single unaffordable package…" | §1.2, §7, P6 |
| 1362-O :36-37 | "Keep genuine player/rival failure… Do not guarantee survival or add hidden subsidies." | §1.2, §6.6 |
| 1362-O :40, :46 | "Schedule the recovery amendment at the next dependency-safe checkpoint."; "“Closure due” is not evidence of completed closure." | §1.2, §8.3 |
| 1362-O :70-72 | routing item 1: "It becomes the bounded charter `1363-A`…" | §1.2 |
| 1362-O :79-85 | the checkpoint is the close of the Save45 landing; production waits; captures re-minted into new paths | §8.2 |
| 1362-O :105-108 | row 6 searched one chain in `rivalWorld`'s fixture over post-ticks 197 to 237; the promise rows searched `genuine-v35-c2b-rival-incumbent-cohorts` | §6.1, §9 |
| 1362-O :104-108 | the exact coverage limits | §9 |
| 1362-O :189-199 | items 6 and 7, verbatim | §1.1, §9 |
| 1362-O :196-197 | "Include p15a1-w2-market-01 in recovery measurement" | §1.2, §6.1 |
| 1362-O :198-199 | "Findings remain findings…" | §6.7, §6.8 |
| 1362-O :214-215 | "Do not interrupt active verification or expand this into a new research campaign." | §1.1, §1.2, §6.5 |
| 1362-O :226-232 | routing item 2: replacement fixtures after 1363; 1363-A records the precondition and measures the premises | §9 |
| 1361-F2 :26-38 | ruling 3: on a G2 Retune, P15A.1 takes its own later step | §6.1, §8.1 |
| 1361-F2 :48-55 | ruling 5: G-L reruns after the recovery amendment, on the same seeds and routes, as part of 1363; a trigger routes to retuning and is a finding | header, §6.1, §6.8, §8.1 |
| 1361-GP-D :93-98 | finding 9: the order question, G-P or G-L after 1363-A | §6.8 |
| 1359-A :260-266 | G-P over the recorded seeds' natural routes at 6240; the trigger; G-L "the live root on the same routes" | §6.8 |
| 1359-A :261-262, :262-264, :265-267 | G-P's per-seed readings; the archetype trigger; K3, the cap bound and freeze time | §6.8 |
| 1359-A :282 | P15C's closure includes G-L | §6.8 |
| 1359-X4 :27 | "Seeds. p13a-core-causal-01 and seed-b" | §6.8 |
| 1359-F5 :7-8, :19-23, :24-28 | ruling 1, the reading of "none in any seed"; ruling 3, the retune route; ruling 4, G-P again if 1357-Q1 changes the rival economy | §6.8 |
| 1353-F6 :76-77 | G-P again before P15C production on any tree with P15A.1 production or a 1357-Q1 change | §6.8 |
| 1361-F :78-95 | ruling 11, G2 and the shared market's landing | §6.1 |
| 1361-F :126-127 | ruling 17: "P15B takes the next free step after Save45." | §5 |
| 1361-F :132-139 | ruling 20: the 1358-M2 fallout method and the 1358-N sweep plan | §5 |
| 1340-O :30-45 | D-1329-1, verbatim | header, §1.1 |
| 1340-O :35-36 | "Distinguish economic rejection from temporary staffing, cash or facility blockage. Do not claim the screenplay is impossible forever." | §1.1, §3.3, §3.5, P7, O5 |
| 1340-O :38-40, :42-45 | no deletion, refund or promise erasure; "Respect existing obligations…"; "Choose the consecutive-failure threshold…"; "without forcing the old hiring outcomes or changing tests merely to restore old results" | §1.1, §4.3, §6.6, §7, P6 |
| 1340-O :47-57 | D-1323-1 | §6.6 |
| 1342-O-approved.txt :42-46, :53-55, :59-60 | ruling 3 (failure, no bailout, P15 owns distress); ruling 4 (no minimum count, no replacement) | §1.1, §4.4, §4.6 |
| 1342-O :69-72 | one production writer; one heavy test process at a time | §6 |
| DECISIONS.md :133-136, :138-142 | D-17B: "Do not introduce financing, loans, bailouts, restructuring…"; ruling 3's amendment governs where they conflict | §4.7 |
| 1357-R :13, :93-94 | the stall with 3.4-7.1M above reserve; "No line asks whether the dearer package would be viable." | §3.1 |
| 1357-R :32-33 | the base market values come from a Python port of `rng.ts` | §6.4 |
| 1357-R §2 :70-152; :109-110; :120-128 | why evaluations turn cash-blocked; r04 cash-blocked from 49 and 86; the four frozen screenplays, the frozen counts, the blocked index | §3.1, §3.4, §8.2 |
| 1357-R :140-143, :144-151 | L9, 47 of 53 greenlights forecast a negative margin; awareness falls with nearly every release | §6.4 |
| 1357-R :153-228, :205-210, :228 | §3 and §4; the zero-staff floor 41,500-46,500; "No verb lets a rival cut its fixed cost." | §4, §4.4, §4.7 |
| 1357-R §6-§7 :251-343; :271-292; :314-322; :334-336 | the binding constraint; cycle economics; the timing table; "Any floor with no income ends below zero." | §4, §4.4, §6.4, §6.6 |
| 1357-R :350, :352-355, :358 | levers L3, L5-L8 and L11 | §4, §6.6 |
| 1357-R :368-369 | the viability of r04's `script-0005` dearer packages was not measured | §8.2 |
| 1357-F3 :9-11, :25-27, :45 | the rule and its code; "faithful to the charter… a gap in the chartered law"; shed facilities and release staff | §3.1, §4.7 |
| 1357-F2 §1 :9-37; :57 | why a §4.5 re-tune cannot pass; ruling 1, no value "reaches Flag" | §6.6, §8.3 |
| 1357-F2 :58-60 | ruling 2: Wave 2 waits for a re-probe that reads Proceed or Flag | §5, §8.3 |
| 1357-F2 :69-70 | ruling 4: shedding facilities, and REDUCE_OBLIGATIONS for rivals pulled forward from Wave 3 | §4.6, §4.7 |
| 1357-F2 §4 :78-95; :84-86 | Owner question 1357-Q1; option (a), recommended | header, §1.2 |
| 1357-X :12 | probe 1357-P, sha256 ee1709d8… | §6.1, §8.3 |
| 1357-X :86-87 | closure due falls exactly 25 weeks after distress | §6.3 of these notes |
| 1357-X :122-128 | every distress entry holds fewer than two of {LOAN, RELEASE} | §4.6 |
| 1357-A :59, :85 | a rival's fixed cost is `rivalWeeklyOperatingCost`; rival `terminableContracts` follow R3's terms | §4.6 |
| 1357-A :145-148 | versioned law for values a validator reconciles | §5 |
| 1357-A §6.2 :208-214 | the rival borrows the maximum in distress | §4.6 |
| 1357-A :242, :267, :272-278, :281-282 | closure due settles nothing; the §8 read-out weeks; the thresholds; the live-root arm after GREEN | §6.2, §8.3 |
| 1357-A :333-335 | Wave 2 takes the next free N, may batch, mints the Save(N−1) fixture first | §5 |
| 1352-A §1 :10-31; §4.5 :148-164 | the delegation; the provisional values | §6.6 |
| 1352-A :53 | Wave 3: one termination predicate; rival selection among families | §4.6 |
| 1352-A :66, :96 | "low = c < CORPORATE_WARN_COVER_WEEKS"; "Distress needs eight consecutive negative weeks" | §4.4, §4.6 |
| 1352-A :132, :152, :158 | the loan maximum formula; warn cover 4; `LOAN_MAX_FIXED_COST_WEEKS` 26 | §4.4, §4.6 |
| 1352-F :51, :59 | Lemma B: distress begins at the eighth negative week | §6.3 of these notes |
| 1352-F :86-87 | "Dormancy is superseded, not deferred." | §4.7 |
| 1344-A :57, :61-62 | the `cashBlocked` definition; only `economicRejection` counts | §3.1 |
| 1344-A §3.2-§3.6 :67-104; :75; :80-82; :87; :95-101; :103 | the law's remaining parts; the deferral; the retry; a blocked retry changes nothing; the readers; the player untouched | §1.3, §3.2, §3.5, §3.6, §6.5 |
| 1344-A :123-125, :129-138 | Save43 up and down conversion; §5's three provisional constants, changed only by a tuning amendment | §5, §6.6 |
| 1344-K :75 | `genuineInputs`, with the Save42 rival-stall and week-93 producers and mints below it | §8.2 |
| 1344-V :33-37, :38-40 | the s7 runner; Node v20.20.2 | §6 |
| 1344-V §3 :99; §5 :214-225, :216-221 | the stalled route on p13a; states equal until the first shelving; the four seeds | §6.1, §6.3, §6.5 |
| 1344-V :139-142 | the cash-blocked retry attempts: r01 at 250 and 262, r02 at 234 | §3.5 |
| 1344-V :343-380, :352-355, :359-364, :377-380 | the 154 promise movements (50, 27, 0, 77); X10's week-208 lead; no output names the path | §6.5 |
| 1344-V §6 (b) :393-403 | the player-only control, Oracle and Random at 52 weeks | §6.1 |
| 1344-V :436 | 45 rows open with measured cause: the 42 C8 rows, C1 row 2, UNRESOLVED rows 35 and 41 | §8.2 |
| 1344-V §9: :467-474, :475-477, :484-492, :493-499 | flags 1, 2, 4 and 5 | §3.1, §3.5, §6.1 |
| 1344-V :536-540 | ruling 2: cause established, path unnamed | §6.5 |
| 1344-F6 :12-16 | the row 6 leaves at :651, :661, :859, failing at `rivalWorld()` :397:53; `script-0006` at week 208, retry 234 | §9 |
| 1344-F6 :38-46, :41-44 | promise-148's leaves and premise; `script-0229` and `script-0230` at 2612; SATISFIED with progress 1 under v1 | §9 |
| 1355-C4 :137, :150, :155 | seed -01's base market value; 0 greenlights and 28 shelvings from week 15; week-160 cash | §6.1 |
| 1355-C4 :209-217 | "Seed `-01` never greenlights: a law effect"; -02 and -03 base market values | §4.1, §6.1 |
| 1355-A :168, :174 | K4's scratch method; the read-outs at 520, 1560, 3120, 4680 and 6240 | §6.1, §6.2 |
| 1355-A :205-208 | the retune route under D-1323-1 | §6.6 |
| 1360-F2 :27-33 | ruling 2: a 1357-Q1 change before Save45 retires the captures and the pins | §8.2 |
| 1360-F3 :24-25, :42-45 | both producers refuse an existing output directory; a production commit changes `src/` | §8.1, §8.2 |
| 1360-L :37-38 | the 1355 mint (week-30 capture, K1, K2, M0A); the 1359 mint (route L at 6239 and 6240) | §8.2 |

### 5.2 Source at HEAD (`src/core/`)

| Citation | What it says | Charter |
|---|---|---|
| `hollywoodTick.ts:60-62` | `operatingReserve` = weekly operating cost × `reserveWeeks` | §2 |
| `:102-127`, `:118` | the renewal loop and its reserve check | §2, §4.1, §4.2 |
| `:140-174`, `:148-157`, `:159` | the slot loop; the mint when no person is free; the reserve check | §2, §4.1, §4.2 |
| `:175-197` | R3: `seated` :180-182, `surplus` :183-184, ascending loop :185, seat and cap :187, promise :188, charge :189, reserve :190-191, employment end :192-194, money :195, receipt :196 | §2, §4.2, §4.3 |
| `:201-336`, `:225`, `:226-232`, `:231` | `decide()`; `staffingBlocked`; the evaluation inputs; `cashAvailable` | §2, §3.2, §3.3, §4.1 |
| `:235-236` | the refusal label from `unaffordable>0` | §2, §3.1, §3.2 |
| `:266-268`, `:270-275`, `:272`, `:277-281` | only an economic rejection counts; the deferral; the threshold check; shelving | §2, §3.2 |
| `:286-298` | the retry: due needs no production and a free slot (:286-287, `find`); `evaluate` (:290); viable greenlights (:292-295); a rejection moves `retryWeek` (:296-297) | §2, §3.5 |
| `:301`, `:302`, `:303`, `:320`, `:323`, `:324-327` | commission: index or reserve; hold; writer; team; the longer reserve; the package search | §2, §4.1 |
| `:361`, `:362`, `:363`, `:367`, `:368`, `:369` | sound purchase; `staff()`; Scientist demand; plan admission; research; `decide()` | §4.1, §4.2, §5 |
| `:414-417`, `:430-432`, `:464-472` | run revenue; payroll, overhead, facility opex; released people join the free agents | §2, §4.1, §4.2 |
| `hollywoodPolicy.ts:40-41` | `searchIndustryPackages` returns choice and three counts | §3.2 |
| `:49-62` | shapes × billings × negative choices × the marketing menu; the cash skip at :62 | §2, §3.3 |
| `:61` | the marketing menu comes from `marketingCapacityForInputs(base, true)` | §6.4 of these notes |
| `:65-74` | forecast, contribution, hold, margin, score, viability skip (:73, locked only), `viable++` | §2, §3.2 |
| `:83-85` | `chooseIndustryPackage` returns the search's choice | §3.2 |
| `forecast.ts:11`, `:407` | the forecast draws `stream(seed, 'forecast', productionId)` and never the sim stream (the comment, :11); `const fstream = stream(ctx.seed, 'forecast', ctx.productionId)` (:407) | §2, §3.2 |
| `marketingMenu.ts:87-96` | `marketingCapacityForInputs` reads `forecastCenters` of the package inputs | §6.4 of these notes |
| `tuning.ts:28` | "P12A bounded management policy; economics and reception remain the shared laws." | §4.6 |
| `tuning.ts:30-35` | the shelving constants: threshold 13 (:33), hold 13 (:34), retry 26 (:35), named provisional | §2, §3.5, §3.6, §6.6 |
| `tuning.ts:39-40` | `HOLLYWOOD_NEGATIVE_CHOICES` [0.65, 0.85, 1.05]; `HOLLYWOOD_POLICY_PREFERENCE_COST` 25,000 | §3.3, §6.6, P8 |
| `tuning.ts:139-140` | `AWARENESS_DRIFT_RATE` and `AWARENESS_DRIFT_ANCHOR`, tagged "[D-17B §1]" | §6.6 |
| `tuning.ts:415`, `:485-486` | `HIRING_TERMINATION_CAP_WEEKS` 26; `OVERHEAD_BASE` 15,000 and `OVERHEAD_PER_EMPLOYEE` 1,500 | §2, §4.2 |
| `tuning.ts:1031`, `:1988`, `:2094` | `LOAN_MAX_FIXED_COST_WEEKS` 26; `FACILITY_DEMOLITION_REFUND_FRACTION = 0.5`; `marketValueRange` 20M to 80M | §4.6, §4.7, §6.6 |
| `employment.ts:207-210` | `terminationCost` = weekly salary × min(remaining, 26) | §2, §4.2 |
| `actions.ts:2669-2718`, `:2678-2695`, `:2717` | `applyReleaseTalent`: refusals, no cash gate, promises broken on termination | §2 |
| `hollywoodValidation.ts:62-72` | the era-law flags threaded to `validateHollywood` | §2, §5 |
| `:228` | `exact(b, [...])`, the business keys | §2, §5 |
| `:251-259`, `:294` | termination charged at its end receipt's week; the termination reconciliation | §2, §4.3 |
| `:290-292` | "No rival cancellation policy exists (P13B-S8, OPEN)" | §4.7, P3 |
| `:295` | only `studioRevenue` may be positive | §2, §4.1, §4.4 |
| `:303-304`, `:312-315`, `:316-323` | capacity paid exactly once for the four; payroll and overhead reconcile; facility opex reconciles | §2, §4.3, §4.7 |
| `:344-367`, `:373-376` | shelving validation; "rival facilities differ from their costed configuration" | §2, §4.7, §5 |
| `:536-543`, `:540` | the `screenplayShelved` receipt checks; `integer(r.rejections, 1)` | §2, §5 |
| `rivalResearch.ts:113-123`, `:130-153` | Scientist demand; admission with the reserve gate (:132-135), `researchCapacity` (:150), `laboratoryCommitted` (:151) | §2, §4.2 |
| `rivalResearch.ts:232-255`, `:258-262` | seat idle Scientists and begin projects; active projects run | §4.2 |
| `technologyRival.ts:19-25`, `:48` | `considerRivalSoundPurchase`; the reserve gate | §2, §4.2 |
| `talentMarket.ts:389-401`, `:485-491`, `:698-717` | `affordabilityRefusal`; `withdrawProposal`; `rivalProposalTrigger` | §2, §4.2, §6.5 |
| `talentMarket.ts:1112-1135`, `:1238` | `FreezeDrop`; the settlement's `bonusUnaffordable` | §2, §6.5 |
| `talentMarket.ts:1381-1409`, `:1395` | the rival pass; its trigger check | §2, §4.2 |
| `hollywood.ts:41-52`, `:145-152` | `moveRivalMoney`; `rivalStartingFacilities` | §4.3, §4.7 |
| `placement.ts:1341-1344` | `facilityDemolitionRefund` = capex × 0.5 | §4.7 |
| `hollywoodStartingData.ts:11-36` | nine templates with capital, `negativeScale`, `marketingRatio` and `reserveWeeks` | §6.6, P8 |
| `save.ts:6567` | `export const LIVE_SAVE_VERSION = 44 as const;` | §2 |

### 5.3 Tests at HEAD

| Citation | What it says | Charter |
|---|---|---|
| `tests/p14d1-rival-shelving.test.ts:206-253`, `:228-242` | the counts contract; the independent derivation of 54 (`toBe(54)` at :242) | §3.2, §3.3, §7 |
| `:255-308`, `:438-460` | the two cash-blocked leaves to re-pin | §7 |
| `:553` | `shelving-viable-control` | §8.2 |
| `tests/p14d1-rival-shelving-natural.test.ts:4-6`, `:8-11`, `:25`, `:37-47` | 1344-F Amendment 3 withdraws film and per-year pins; the 27-week worst-case cycle; `liveWeek130`; the route to week 260 | §8.2 |
| `:50-54`, `:56-81`, `:83-94`, `:96-108`, `:110-112`, `:115-127` | the leaves: one shelving, the hold, rows kept, four in 52 weeks, the unpinned measurements, determinism | §8.2 |
| `tests/p14d1-rival-shelving-fixtures.ts:7`, `:92-95` | the loader's path to the genuine V42 week-130 capture; `liveWeek130()` migrates it to live | §8.2 |
| `tests/p15a1-market-integration.test.ts:430`, `:467`, `:738`, `:748`, `:816` | K1, K2, the two capture leaves, M0A | §8.2 |
| `tests/helpers/p15a1-market-route.ts:152`, `:316-340`, `:499` | `MARKET_ROUTE_SEED = 'p15a1-w2-market-03'`; `kRoute()`; `PIN_DIRECTORY` | §8.2 |
| `tests/p15c2-campaign-legacy-integration.test.ts:824-873` | the route L capture readers | §8.2 |
| `tests/p14b5-relationships.test.ts:162-164`, `:381`, `:399`, `:656`, `:666`, `:874` | `FROZEN.rival`; `lifted('rival-current-p1-and-p2')`; the repeat-take check; the three row 6 leaves | §9 |
| `tests/p14c2c-rival-promises.test.ts:25`, `:34`, `:49`, `:60`; `tests/p14c3-admission-boundaries.test.ts:141`, `:230` | the promise-148 premise and leaves | §9 |

## 6. Arithmetic behind the design (inferred; nothing ran)

**6.1 Viability ignores cash.** From `hollywoodPolicy.ts:66-73`:
- the contribution is c = expectedTotal × 0.52 − negative − marketing;
- the hold is h = −weeklyCost × 14;
- the score is s = c + h − |marketing/negative − ratio| × 25,000;
- a locked candidate is skipped when s ≤ h, that is when c − penalty ≤ 0.

Neither `cashAvailable` nor `weeklyCost` survives the comparison. The forecast reads the package inputs and a keyed
stream (`forecast.ts:407`), never cash. So "would this skipped package be viable?" has one answer at any cash level.

**6.2 The payback rule.**
- Take cash C, weekly cost w, a charge X and a weekly saving Δ. Without the release, cash reaches zero after C/w weeks;
  with it, after (C − X)/(w − Δ). The release is no sooner exactly when C·Δ ≥ X·w.
- Worked case, r01-like: C = 1,500,000, w = 100,000, an actor at 12,000 a week (X = 26 × 12,000 = 312,000,
  Δ = 13,500), `reserveWeeks` 13.
  - R3's check passes: C − X = 1,188,000 ≥ 13 × 86,500 = 1,124,500.
  - Zero cash comes after 15.0 weeks without the release and after 13.73 weeks with it, 1.27 weeks earlier.
  - The payback rule refuses: X·w = 31.2e9 > C·Δ = 20.25e9.

**6.3 Late releases and P15B's clock.**
- Distress begins at the eighth consecutive negative week (1352-A :96; 1352-F :51, :59), and closure due falls 25
  weeks after distress begins (1357-X :86-87). So once cash goes negative, the clock runs from that week.
- A loan's principal is 26 weeks of fixed cost (1352-A :132, :158), and 1357-F2 :32 found that a larger loan "only
  delays the same fall while the burn continues".
- So a release that brings forward the first negative week brings closure forward. This is why the trigger fires while
  cash still covers the post-release reserve, and why R3's reserve check stays.

**6.4 Why Part B needs saved state.**
- `staff()` runs before `decide()` each week (`hollywoodTick.ts:362`, `:369`), so last week's decision is unknown when
  `staff()` decides to hire.
- **Recomputing it in `staff()` fails.**
  - After a release, evaluations refuse for staffing before any package search (`hollywoodTick.ts:225`).
  - The marketing menu comes from the package inputs' forecast centers (`hollywoodPolicy.ts:61`;
    `marketingMenu.ts:87-96`). So a package's cost depends on the inputs, and the seated team is among them
    (inferred).
  - A cash-only test therefore cannot see "the rival could not film even with a team".
- **A receipt-derived marker fails.** Take "the latest team-role end was a termination and no team member remains". It
  breaks when R3 cannot release someone (cap, promise or reserve): the rival then still holds a team member, and the
  slot fill re-hires the rest.
- **Natural hysteresis exists only below the reserve.** There, every hire fails its reserve check, but a release there
  can hasten closure (§6.3). A stored `since` is the smallest correct state.

**6.5 Why the trigger reads the commission path.**
- On `p15a1-w2-market-01` every package fails viability (1355-C4 :209-216), so a rule that required every evaluation
  to be a cash refusal would never fire there.
- The commission path's cash refusal (`:301`, `:324-327`) fires when the rival can no longer fund new development.
- The commission reserve is weekly cost × max(`reserveWeeks`, draft weeks + 9) (`:323`). The refusal therefore comes
  while cash still sits about one package above that reserve, so R3's reserve check still allows releases.

**6.6 The natural-route test's four-in-52 bound.**
- `tests/p14d1-rival-shelving-natural.test.ts:8-11` derives a 27-week worst-case re-shelve cycle per studio: hold 13,
  plus the minimum draft week, plus threshold 13.
- A studio holds at most two indexed screenplays (`hollywoodTick.ts:301`). Each index slot needs a new commission after
  the hold, a draft and 13 rejections between shelvings, so each slot shelves at most twice in 52 weeks.
- Part A changes which evaluations count, not the clock, so the bound of four holds (inferred). A retried screenplay
  that turns viable greenlights (`:292-295`) and adds no shelving receipt.

## 7. Alternatives considered and set aside

1. **Part B with no saved state:** rejected by §6.4. It would also leave the release and re-hire loop open.
2. **Entry below the reserve:** R3's reserve check blocks releases there, and a looser check would hasten closure
   (§6.3).
3. **Entry keyed to P15B distress:** Wave 2 is not integrated before 1363 lands (1362-O :79-88), and releases at
   negative cash cannot prevent closure.
4. **A persistence count before entry:** with no production and no run the condition cannot clear, so a count only
   spends fixed cost. It would also need a second stored counter.
5. **Facility disposal in v1:** set aside for the four reasons of charter §4.7, and asked as O1.
6. **A cap that counts long true cash blocks toward shelving:** left open (P7). D-1329-1 may or may not cover it.
7. **Ending retries or pruning shelved lists:** against D-1329-1 (1340-O :36), so it is O5.
8. **Re-minting the P15 captures and K1, K2 and M0A pre-emptively:** that is the before-Save45 path of 1360-F2 ruling 2
   (:27-33). The Owner placed 1363 after Save45 (1362-O :40), so only measured moves are re-minted.

## 8. Findings for the parent

- **1344-A test 11 lives in its own file.** `shelving-natural-route` and test 12 sit in
  `tests/p14d1-rival-shelving-natural.test.ts`, which runs p13a from the genuine Save42 week-130 capture to week 260.
  - It pins law invariants only (:4-6, :110-112), so it likely holds under v2.
  - It is a natural-route reader the fallout must run, and the charter's §8.2 now lists it.
- **`shelving-viable-control`** (p14d1 :553) is the landed natural-route premise most at risk from Part A, through
  r04's cash-blocked weeks 49-86. 1357-R did not measure whether those packages were viable (1357-R :368-369).
- **Line drift:**
  - The row 6 leaves moved from :651, :661 and :859 to :656, :666 and :874, and the repeat-take check from :397 to
    :399.
  - 1357-R's `talentMarket.ts:1235` is :1238.
  - 7d582318 moved every 1361-F line down by two: ruling 17 is now :126-127 and ruling 20 is :132-139.
  - c6ad14f1 moved DECISIONS.md's D-17B block from :103-112 to :127-142. Its "restructuring" line went from :105 to
    :135 (`git show <commit>:DECISIONS.md`).
- **The K route** runs on `p15a1-w2-market-03`, the high-value seed (base market value 64,574,534), to at most week
  160. So K1 and K2 are unlikely to move, but the fallout decides.

## 9. Style

- The charter's prose has no em dashes. The two fenced Owner blocks keep the Owner's em dashes and curly quotes
  verbatim (charter :57 and :73), as do the quotations taken from them.
- Code uses `file:line` at HEAD, and records use `record :line`, as 1357-A does.
