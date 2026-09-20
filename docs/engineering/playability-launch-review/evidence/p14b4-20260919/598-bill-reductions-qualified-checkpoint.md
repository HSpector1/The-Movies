# 598 — Qualified checkpoint: replay bill reductions C6 + C7 (579 → 598)

2026-09-21. Claude Code parent. The landed candidate of record 583 was independently reviewed
READ-ONLY by the contract-auditor against the adopted design and the before/after measurement
rows (598-R, verbatim in §3): **KEEP, no demonstrated defect, nothing to fix before commit, ten record-only items**. The module is committed with this record as two
commits (C6, then C7) so a residual can be bisected; nothing else in source changed. No cap,
tariff, refusal, deadline, timeout or metric moved; no test loosened; the stale route stays RED
with `workLimit` (515 §6 / 578 stand); D1, D2 and 515 §6 untouched.

## Chain of authority for this slice

515 §3 (C5–C7 lawful as written; the parallel track) → 576 "Disposition" (C6/C7 first) → 579-A
design note (sim-core READ-ONLY) → 579-B review KEEP with three conditions → 579 adopted brief
(the 576 wording amended; C5 dropped) → 580-T RED (test-author; case 1 facility-order witness
RED on unchanged source; 581 baseline; 582 pre rows) → 583-W ONE sim-core writer (two patches)
→ 584–596 serial fixed-source checks + 597 post rows (parent) → 598-R review → these commits.

## Committed identity

- Commit 1 (C6) `3f993b1dbeccfe0b0219108d86480198c0d9b58c`: `src/core/promiseCapacityOwnerReplay.ts` → SHA256
  `e83a7908f0f64050fe2bd11b4cec351e88ee1cf9b1329d91326a526c9128953b` (2809 lines): the
  `copyLiteral` / `HOLD_COPY` 61 / `FIXED_HOLD_COPY` 79 insertion and the two hold-close sites
  paying `18 + (fixed ? FIXED_HOLD_COPY : HOLD_COPY)`.
- Commit 2 (C7) `21569c7c22f31c39e5caa1927e2a3a2bd09a8978`: → SHA256 `9e97ffed9911af55a1a5ff5e819cf53c17dfc3214bc729cc995ae72cb956ebd5`
  (2809 lines): `uniqueIds` through `sortedOutput`; the doc word at :402.
- Protected patch over base `f6575831` = `03338b48d17d727b4bf9c7374e91a5ba66897ecad30b134c066837e222615b11`
  (= the writer's `583-W-c6-c7.patch`), identical in all of 584–596 and re-verified immediately
  before the commits; the C6 commit is exactly `583-W-c6.patch` (`55c8854542…`) applied to the
  index.
- RED `tests/p14b4-replay-bill-reductions.test.ts` unchanged (`3389cc84…`, installed at 580).
  Parent-verified after the commits: the C6 commit's diff equals `583-W-c6.patch` and the two
  commits' combined diff equals `583-W-c6-c7.patch` byte for byte after the index line; module
  SHA `9e97ffed…`, 2809 lines; working tree clean of source changes.

## Verification (record 583 tables; all fixedSource:true on f6575831 + 03338b48…)

584 RED 5 PASS (RED→GREEN; witness delta 2420) · 585 enumerator 45 · 586 adapter 33 · 587 Ready 17
+ sole stale FAIL (:234, `workLimit`) · 588 Started 28 · 589 root+UI typecheck PASS · 590 adjacent
203 · 591 bridge tsc sole OLD TS2353 · 592 facts 7 · 593 live-P2 110/83 byte-identical to 570/549 ·
594 B1/B2/B3 133/1 (designated test 6)/2 todo · 595 trust 22 · 596 historical saves 137 · 597 four
passive re-measurements (538 probe, 577 probe, 514 stale, 514 first-take) reconciled to the law
with ZERO residual on every row (598-R Q2: 538 scenario 1 −2914 = 2349 + 4 + 561; prepare-only
−2349; Ready prepare −2279; the stale route −2905 = 2279 + 14 + 153 + 459 with the cut in the
same frame at the same request; first-take −2903). 630 focused passes plus the identical 110/83
set; not a whole-suite pass; no Owner-acceptance claim.

## Record-only items carried (598-R Q7; none requires a hunk for KEEP)

1. The :1991 second `sorted` of `admittedReleaseIds` right after `uniqueIds` stays deferred.
2. The annex-lot class: with `facility-development-casting-annex` present every replay call pays
   ≈ +543 on top of the unchanged sort; C7 is a founding-lot saving, not universal.
3. 466's "exactly four `sortedOutput` callers" is historical; the set is five; the 465
   precondition extends to the four `uniqueIds` sites.
4. Measured rows now historical for the landed module: 576 (the 65 rows), 538 (108265 / 32043 /
   18754), the 514/515 frame tables (197631 at the cut). Cite 597; never hand-adjust.
5. Ready-route closes are 153 each (owner-granted rows), Started-route wrap closes 187 each
   (prepare-time fixed rows); re-measurement paper derives which from the row source.
6. The Post exit lies outside the stale route's pre-cut prefix; 579-A's whole-route "−1530" is
   not a pre-cut figure.
7. The S6 class change (`S6-kernel-k2-h4-w1w3` under the author-ASSUMED coverage: kernel
   normalization cut → PROVEN_FRAGILE 198903) is a measured observation, not a certificate; the
   576 bound ("complete sets fit only at now+2") is unchanged.
8. The RED file's comment line cites are +12 stale after the insertion; comments only.
9. The parent's comparison flag `keys equal False` is explained in 583 (fields that lawfully
   moved were inside the row key).
10. 579-B's two-`pay` selector preference was not taken; within convention.
Plus, carried unchanged: 574-R's nine items, 553-R items 2–6, the designated
`p14b1-trust-chooser` test 6, the stale route (515 §6), D1/D2/515 §6 (578).

## Next (bounded)

- The parallel track's remaining item is C1 (calculator execution structure; 515 §3: ≈ 8–11k
  gross, diffuse across ≈ 100 sites, bills byte-identical, highest review cost) with the static
  widths of C5 folded in as module-init constants. It is lawful as written but does not close the
  stale route (gap ≈ 28k after C6+C7 by paper) and does not move any certificate bound; the
  parent will open it only as a bounded design note if no Owner ruling (578) arrives first, and
  records here that its value is a cleaner calculator, not a fitting route.
- D1 (537 §3), D2 (538-C §2), 515 §6 stand with the Owner (578); no live wiring, no
  `PROMISE_RULES_VERSION`, Save30 or projection movement follows from this record.

## 3. Verbatim contract-auditor hand-back (598-R)

As returned, unedited.

```text
# 598-R — contract-auditor READ-ONLY review of the landed C6/C7 candidate (replay bill reductions) against 579 §1 and the measured rows

**Status: DONE (review only). Verdict: KEEP.** Land as two commits (C6 from `583-W-c6.patch` via the index, C7 as the remaining working-tree diff). No defect requires a change before commit. Every measured delta reconciles to the 579 §1 law with zero residual; the only bill that rose is the RED's deliberately inverted facility array, the accepted 465/466 class. No file created, edited, run, hashed or diffed; no Git, shell, network or delegation. Tools: Read, Glob, Grep on the worktree, the evidence folder and the named scratchpad files only.

**Model observed:** the harness reports Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools named in the user CLAUDE.md are not exposed in this session; the role allowlist (Read/Glob/Grep) was used as-is.

## Candidate identity as read

- Worktree `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`. HEAD `f65758311c93fac3b126ba88629ee0647461e3c1`, 2809-line `src/core/promiseCapacityOwnerReplay.ts`, SHA `9e97ffed…` and `git diff --numstat 16 4` are the parent's git outputs (I cannot hash or diff). What I verified from bytes: the five sites read (:243-254, :402, :444, :1642, :1668) equal the `+` lines of `583-W-c6-c7.patch` (5 hunks, 12 inserted + 4 replaced lines = 16/4); `583-W-c6.patch` is the 3-hunk subset on the same base blob `8075504`; greps over the module find no other change to any named function (details Q1).
- Every 584–596 capture: `sourceSha f6575831…`, `testedDiffSha256 03338b48…`, `untrackedSource []`, `fixedSource true`. The 597 probes carry the candidate hunks plus the probe file / 514 instrumentation (grep of each `.patch` finds `copyLiteral`, `HOLD_COPY`, `sortedOutput(rows…)` and, for 514, the `payFailure` log): 538 `5b167333…` (untracked `tests/p14b4-capacity-budget-measurement.test.ts`), 577 `fdd897aa…` (untracked `…started-alternative-bill.probe.test.ts`), 514 stale/first-take `fb9c7d6b…` (tracked-file instrumentation, `untrackedSource []`), all `fixedSource true`.
- Pre rows 581/582 sit on HEAD `20f6b8ef…` (docs-only ahead of the 574 source, module `d5f8cb71…` per 580); the 577 pre rows on the 576 source. Source identity across those HEADs is 580's statement, not re-verified here.

## Sources read (line ranges)

- Records: 579 whole (§1–§3, 579-A §2/§3/§4/§7, 579-B Q1–Q9); 580 whole; 583 draft :1-120 (parent's claims, not evidence); 576 :28-75, :130-190; 514 :10-69; 538 :30-51; 176 :20-74, :155-190, :372-393; 465 (direction) :1-80; 466 :84-88 (grep).
- Module: :225-264 (LITERAL tail, the insertion, APPEND, `Work` head), :318-384 (`keySpanBill`, `text`/`equal`/`less` :328-330, `copyCost` :332-340, `token`, `sortBill` :369-384), :380-454 (`sorted` :385-401, doc :402-403, `sortedOutput` :404-434, `find` :435-442, `uniqueIds` :443-449), :1625-1679 (`closeHold` :1629-1649, `addHold` :1650-1661, `closePath` :1662-1674), :1700-1729 (drain: `closeHold` :1710/:1717, `addHold` :1722/:1725), :1980-2004 (`uniqueIds` :1990, `sorted` :1991, `closePath` :1998). Greps: `copyCost\(|sortedOutput\(|uniqueIds\(|sorted\(|copyLiteral|HOLD_COPY`.
- Patches: `583-W-c6-c7.patch` whole (59 lines), `583-W-c6.patch` whole (41); `583-W-report.md` whole; `583-parent-comparisons.txt` whole (220 lines).
- Tests: `tests/p14b4-replay-bill-reductions.test.ts` :180-372; `tests/p14b4-ready-replay-stale-target.test.ts` :215-244.
- Captures: 584 json+txt whole; 581/585–596 txt summary/FAIL/assertion lines and json identity fields (grep); 590/592/593/594 json file lists; 597-post-538 json + `B4_`/summary lines; 597-post-577 json + `B4_BUDGET_576` lines and the `S6-kernel-k2-h4-w1w3` rows (pre 577 :78-79, post :78-79); 597-post-514-stale json; 582-pre/597-post 514 stale/first-take `frameEntry`/`payFailure`/`result` lines; 597-post-538-probe.patch :105-111, :178-184, :218-224, :330-336, :390-396 (`FIXTURE_OPENED`, `opened` = 0 productions); 570 txt summary + nine FAIL/assertion lines by line number; 571 txt :385-404.

## Numbered answers

### 1. Hunks vs the adopted design — MET WITH EVIDENCE. No deviation.

- Insertion :243-254 is 579-A §3 verbatim: the five-line doc comment, `copyLiteral` (`1 + Σ(3 + |key|)`), `HOLD_COPY` with the six `LITERAL.hold` keys and the `// 61` trailer, `FIXED_HOLD_COPY` with `replaceableFrom` last and `// 79`. It sits between the LITERAL `})` (:242) and `// An appended element…` (:255) as adopted. Arithmetic re-derived: Σ|key| 6+8+12+7+4+5 = 42 → 1 + 18 + 42 = 61; + (3+15) = 79; equal to what `copyCost` :332-340 returns for the same own keys.
- Doc :402 reads "The four dense output arrays and the duplicate-identity check use this path."; :403 unchanged.
- `uniqueIds` :444 `const ordered = sortedOutput(rows, keyOf, work)`; the charged adjacent `equal` walk :445-448 and the message `'duplicate consumed identity'` untouched.
- `closeHold` :1642 `work.pay(18 + (found.fixed ? FIXED_HOLD_COPY : HOLD_COPY)) // 14 as before + 4: fixed-flag read and price selector`; `closePath` :1668 `work.pay(18 + (row.fixed ? FIXED_HOLD_COPY : HOLD_COPY))` (no trailer, as the hunk had). Both still pay before the spread (:1643, :1669). 18 = 14 + 4 is the 579-B Q1 ruling; 579-B's two-`pay` form was stated as a preference "within convention", so the single `pay` is not a deviation.
- Nothing outside the five ranges: caller-record `copyCost` sites :689, :1333, :1683, :2618 (×2) still call `work.copyCost`; `sortedOutput(` callers are five (:444, :1817, :1818, :1819, :2765); `sorted(` callers :426 (inside `sortedOutput`), :623, :1922, :1991, :2175 with :1991 (`released = sorted(advanced.admittedReleaseIds…)`) unchanged; `uniqueIds(` call sites :667/:674/:675/:1990 unchanged. Bodies read against the 579-A/579-B citations shifted +12: `Work` :257-357 (`copyCost` :332-340 byte-equal to the 579-A §2 quote, `less` :330), `sortBill` :369-384, `sorted` :385-401, `sortedOutput` :404-434 (identical to the 465 helper text), `find` :435-442, `addHold` :1650-1661, drain :1700-1729, release aftermath :1980-2004. The 465 :60 precondition (dense plain arrays, pure projections) holds at all four `uniqueIds` sites (`row => row.id`, `row => row.productionId`, `id => id`).

### 2. Reserved-step accounting on the receipts — MET WITH EVIDENCE. Zero residual on every row.

Law (579 §1): C7 Started prepare 2275 + 37 + 37 = 2349; Ready prepare 2275 + 2 + 2 = 2279 when the source has no productions/workflows; +2 per frame per plan at :1990 with no admitted release id (+37 with one); C6 153 per non-fixed close, 187 per fixed close.

- 538 scenario 1, all 14 cells: 108265 → 105351 = −2914 = 2349 + 2×2 + 3×187. Kernel totals shift by the same 2914 on every cell (e.g. 112677 → 109763); statuses unchanged. Started prepare-only 32043 → 29694 = −2349. Ready prepare-only 18754 → 16475 = −2279; the fixture is `world().opened`, `FIXTURE_OPENED` in the archived probe reads "0 productions", so n = 0 at :674/:675 is a fixture fact, not an inference. Saturated rows (Ready admission, scenarios 2/3) 200000 → 200000 as 579-B Q5 predicted.
- 580/584 routes: now+2 (3 fixed / 0 non-fixed) 107889 → 104975 = −2914 = 2349 + 4 + 561; now+5 (3/1) 172434 → 169361 = −3073 = 2349 + 10 + 561 + 153. Close counts unchanged (3/0, 3/1).
- 584 witness: original 59177 → 56826 = −2351 = 2349 + 2 (one frame); swapped 59177 → 59246 = +69 = +145 − 37 − 37 − 2; delta 2420 = 145 + 2275. Prefix 145 = 16 + 24 + 10 + 20 + 12 + `less`(28, 22) = 51 + 12.
- 577 k = 1 rows: now+2 −2914 (2349 + 4 + 561), now+3 −2916 (2349 + 6 + 561), now+4 −3071 (2349 + 8 + 561 + 153), now+5 −3073 (2349 + 10 + 561 + 153). Every other row: S2-none −2353/−2359 (2349 + 2·frames, no close); singles w2/w3 at h5 −2920 (2349 + 10 + 561); w2-h3 −2355 and w3-h4 −2357 (no wrap inside); pairs at h3 −2922 (2349 + 2 plans × 3 × 2 + 561), at h4 −2926 (2349 + 16 + 561); S5-k2-h2 −2918 (2349 + 8 + 561); S5-k3-h2 −2922 (2349 + 12 + 561); S6 enumerator controls −2353/−2355/−2357; S6 kernel rows shift by exactly the producer delta (kernel own work unchanged where it completes: 5581/5603). Cut rows Δ 0 (saturated).
- 514 stale route, per phase: prepare −2279 (dimensionsEntry 44454 → 42175); frames 1→2→3 −2281 → −2283 (−2 each at :1990, n = 0); frame 4 entry −2438 = −2283 − 2 − 153 (the frame-3 Development & Casting release, `closeHold` :1710 on `reservationReleased`); commands and frame 5 −2440; frame 6 −2442; frame 7 entry −2903 = −2442 − 2 − 459; frame 8 entry −2905; `payFailure` 197631 → 194726 = −2905, `requested 5765` both, 100 units after `sweepBillDone` in both; result 200000 both. Total 2279 + 7×2 + 153 + 3×153 = 2905, exact.
  - The wrap's three closes on this Ready route are NON-FIXED (459 = 3 × 153, not 561 = 3 × 187). Derivation: the 302 picture is admitted inside the window, so its reservations enter the ledger through `addHold` :1722/:1725 (`fixed: false` :1657) and are closed by `closeHold` :1710/:1717; `prepared.fixed` carries no hold for a picture that did not exist at prepare. The per-phase table distinguishes the two prices unambiguously.
  - The Post exit (−153) is NOT in the pre-cut prefix. The cut lands in frame 8 between the sweep bill and the drain, so the Post `reservationReleased` never executes; the brief's list of terms must not expect it there. 579-A §3's "302 stale route = 10 non-fixed closes → −1530" is whole-route paper; the measured pre-cut C6 share is 4 × 153 = 612.
- 514 first-take route: identical through `sweepBillDone` 6 (−2442); result 182925 → 180022 = −2903 = −2442 − 2 − 459 (the route ends after the frame-6 wrap; no Post exit inside its horizon; no cut).
- Residual not explained by the four terms: none on any row I reconciled (all 22 538 rows, all 65 577 rows via the 43 printed producer rows + 10 kernel rows + 9 cut rows, both 514 routes at every phase line, the three 584 receipts).

### 3. Behaviour neutrality — MET WITH EVIDENCE on the covered routes; the S6 class change is lawful and changes no adopted 576 conclusion (observation).

- 585 enumerator 45 and 586 adapter 33 GREEN (E2/E8 trace/hold byte-equality and relative sums through the Started producer); 587 17 PASS + the designated FAIL; 588 28; 592 7; 594 133/1/2 with test 6's assertion text at the same lines :387-388 as 571; 593 `83 failed | 110 passed (193)`, `Failed Tests 83` at line 221 in both 570 and 593, and the nine FAIL/assertion lines I spot-checked sit at identical line numbers (223, 431, 432, 587, 607, 627, 649, 982, 197877); 538 `attempts-shape-equal True` and unchanged status on all 22 rows; 577 `attempts same True` on all rows; 584 case 1's `toStrictEqual(normalised(...))` (test :284) proves trace, provenance, fixedHolds, omissions and projection identical under the facility swap.
- `S6-kernel-k2-h4-w1w3` assumed: producer 196248 → 193322 (−2926 = 2349 + 16 + 561); pre the kernel saturated at 200000 with own 3676 and omission `normalization work limit` under BOTH coverages (576 :147); post the kernel completes (own 5581, the same as the h4 w2w3 pair's 5581) at 198903 and returns PROVEN_FRAGILE when told the domain is complete; the `supplied` twin completes at 198925 and stays UNCERTIFIED/domainIncomplete. That is the lawful consequence of a 2926-unit lower producer bill under an author-labelled assumed coverage, explicitly "not an enumerator certificate" (576 :188, the row's own `note`). 576's adopted conclusion (:49 and :184, "fits ONLY at now+2"; complete sets at now+3/+4/+5 cut at plan 2) is unchanged: S4-k2/k3/k4 at h3/h4/h5 and pair-w2w3-h5 remain 200000 CUT; only the h3 cut `through` moves from {62, step 3} (7 rows) to {62, step 5} (9 rows). 576 :37 and :147 ("{61,63} … then cut by the kernel's normalization") become historical for the candidate; record-only.

### 4. The disclosed increase class — MET WITH EVIDENCE; bounded as 579-A §3 states; no existing route pays more.

- The swapped array inverts at index 1: `sortedOutput` pays the prefix 145 then the full unchanged `sorted` 2779 = 2924 against 2779 before (+145 on that site; the run nets +69 because :674/:675/:1990 still save 76) and +2420 against the post-C7 original (145 + 2275). This is exactly 465 :65-67 ("Inversion pays all precheck AND full old sort … unsorted routes can be MORE expensive") and 176 §4 :182 ("charged when performed"), which 579 §1 condition 2 adopted for `uniqueIds`. Bound: prefix = 16 + 24 + Σ_{j≤i}(42 + `less` span_j) + 10(i−1) + 12; for the annex at index 5 of six, 543 (579-B Q3), consistent with "≤ ~600 for f = 6".
- No existing test, fixture or evidence route went up: all 538/577/514/580 rows fell or stayed saturated; the RED's `trio()` (:189-211) is `richFoundedStudio` in founding order; 579-B Q3's census of the 15 replay-consuming files stands. The only increase is the RED's own inverted input.

### 5. The stale route and 515 §6 — MET WITH EVIDENCE.

- 597-post-514-stale exit 1: `payFailure` at used 194726, `requested 5765`, frame 8, 100 units after `sweepBillDone`, result 200000, the cut 2905 later than 197631 but in the same frame at the same request. 587: `tests/p14b4-ready-replay-stale-target.test.ts:234` `expected 'workLimit' to be 'commandRefused'`, the same message as 564/574; the test (:230-244) is committed and outside the diff.
- No cap, tariff, refusal, deadline or timeout moved: `Work`, `LITERAL`, `sortBill`, `sorted`, `sortedOutput`, `find`, every bill function and the kernel are outside the patch; `limits.work` 200000 unchanged. No test loosened: the RED's assertions are `Object.keys` equalities, anchored `toThrow`, `toStrictEqual`, `>` on two bills and `≤ 200000` caps (test :239-372); no bill literal (580 case 4).

### 6. Serial coverage sufficiency — MET WITH EVIDENCE; the two 574-era designated failures are the only failures.

- 579 §3 mapped to captures: RED 584 (5 PASS, from 581's 1/4); Ready 587 (six files, `1 failed | 17 passed (18)`); Started 588 (six files, 28); adapter 586 (33); enumerator 585 (45); kernel / hold-order / stable-sort inside 593 (`p14b4-capacity-kernel`, `p14b4-kernel-hold-order-extension`, `p14b4-bounded-stable-sort` are among 593's five fully passing files; the six failing files are the cast-class, save-v30 and two bridge families); sort-owners inside 590 (`p14b4-bounded-sort-owners`); material inside 593 (`p14b4-material-evidence-core`); facts 592 (7, with bounded-employment-lookup); typecheck 589 exit 0; adjacent 590 (17 files, 203); bridge tsc 591 exit 2 with the sole OLD TS2353 at `bridge-p14b4-cast-class.test.ts(364,20)`; live-P2 593 110/83; B1/B2/B3 594 133/1/2 todo; trust 595 22; historical 596 137; the four passive re-measurements 597.
- Failures across 584–596: `stale-target:234` (587) and trust-chooser test 6 (594), plus the pre-existing 83-line live-P2 set (593, identical to 570/549) and the OLD TS2353 (591). Nothing new.
- Gap (minor, presentation): the per-file counts 41/5/7/7/17 named in 579 §3 are not printed as such in the 590/593 summaries I grepped; they are covered by those runs' file-level passes. 583 may cite the per-file vitest lines if it wants the literal numbers.

### 7. Record-only items; nothing to fix before commit.

Fix before commit: NONE.

Carry into 583/598 and the headers:
1. The :1991 second `sorted` of `advanced.admittedReleaseIds` right after `uniqueIds` :1990 stays deferred (579-A §7 item 6).
2. The annex-lot class: once `facility-development-casting-annex` is present, every replay call pays ≈ +543 on top of the unchanged sort; C7 is a founding-lot saving (579 §1 condition 3).
3. 466 :86-87 "exactly four `sortedOutput` callers" is historical; the set is five (:444, :1817, :1818, :1819, :2765); the 465 :60 precondition extends to :667/:674/:675/:1990.
4. Measured rows now historical for the candidate: 576 :34-38, :131-162 (incl. :147), :176-180; 538 :33 (108265 / 32043 / 18754); the 514/515 frame tables (197631 at the cut). Cite 597; never hand-adjust.
5. Ready-route closes are 153 each (owner-granted rows), Started-route wrap closes 187 each (prepare-time fixed rows); re-measurement paper must derive which from the row source, as this review did.
6. The Post exit is outside the stale route's pre-cut prefix (Q2); 579-A §3's whole-route "−1530" is not a pre-cut figure.
7. The S6 class change (Q3) as a measured observation with the "assumed coverage, not a certificate" label.
8. The RED file's comment line cites (:526, :319, :542, :755, :1647, :1706, :1710, :1698, :2723, :2782, :629, :660-663) are now +12 stale. Comments only; not a defect; touch only if the file is edited for another reason.
9. `583-parent-comparisons.txt` :29 prints `keys equal False` for the 577 comparison without saying what it compares (65 rows, 60 unique keys; likely the duplicated `capRaised`/`marginal` scenario names or key order). Every printed row has both a pre and a post value, so it does not affect any conclusion, but 583 :64 ("65 rows, same scenario order") should state the flag's meaning before publication.
10. 579-B's preference for `pay(4)` before reading the flag was not taken; within convention; no action.

### 8. Overall — KEEP.

- Landing as two commits is sound: `583-W-c6.patch` is the 3-hunk subset on the same base blob and, per the writer, applies to the clean index; the remaining working-tree diff is exactly the two C7 hunks. The sequential apply was not exercised (writer's disclosure), so the parent should verify the module SHA `9e97ffed…` / 2809 lines after the second commit and that the two commits' combined diff equals `03338b48…`.
- Qualified engineering checkpoint: yes, on fixed source `f6575831` + `03338b48…`: RED→GREEN, 630 focused passes (45+33+17+28+203+7+133+22+137+5), the 110/83 live-P2 set byte-identical, the two designated failures unchanged, four passive re-measurements with zero residual.
- What it does NOT claim: no cap, tariff, refusal or deadline ruling; no 302 closure (the stale route still cuts with `workLimit`, ≈2.9k later); no Owner acceptance; no certificate (the S6 assumed rows are labelled input); D1, D2 and 515 §6 stand with the Owner (578); C7 is a founding-lot saving, not universal; C5 remains dropped and C1 untouched.

## Defects

None demonstrated. (Items 8 and 9 above are presentation notes, not failures of the candidate or the evidence.)

## Observations and preferences (not defects)

- The single-`pay` selector form (Q1) and the writer's `// 14 as before + 4` trailer only on `closeHold` mirror the adopted hunk exactly; a matching trailer on `closePath` :1668 would help a future reader, but the adopted hunk did not have one and adding it now would breach the frozen candidate.
- The Ready-route 153 vs Started-route 187 distinction (Q2) is the one place a future re-measurement could mis-attribute a residual; item 5 records it.

## Evidence limits

- Read/Glob/Grep only: no hashing, diffing or running. SHA-256 values, `numstat`, "full diff equals the patch" and the snapshot comparison are the parent's git outputs; my verification is byte-reading the five sites against the patch and grepping the named functions.
- 593 byte-identity to 570/549: verified by the identical summary lines and nine FAIL/assertion lines at identical line numbers, not by a full byte comparison (the parent's script claim).
- Per-file counts inside 590/593 were not read individually; the 597 probe patches were grepped for the candidate hunks and the probe/instrumentation, not read whole; 538/577 pre-row values are taken from the parent's comparison tables cross-checked against 576 :34-38/:131-162, 538 :33, 580 §"Pre-writer rows" and the 577/582 `.txt` lines I grepped.
- Route close derivations (Q2) are from the module's call sites and the per-phase deltas, not from an instrumented per-close receipt.
- Nothing here is Owner acceptance, a native playtest or a live-consumer proof.

## Next concrete action

Parent saves this review verbatim as record 598 §3; lands C6 (`git apply --cached 583-W-c6.patch`, commit) then C7 (remaining working-tree diff, commit); verifies the module SHA `9e97ffed…` / 2809 lines and that the two commits' combined diff hashes to `03338b48…`; finalises 583 with items 5, 6, 9 of Q7 (the Ready/Started close prices, the Post exit outside the pre-cut prefix, the `keys equal False` flag explained); records 583/598 and the 581–597 captures; headers; publication with exact-remote verification. No cap/tariff/refusal change, no 302 closure and no Owner acceptance are claimed by this review.
```
