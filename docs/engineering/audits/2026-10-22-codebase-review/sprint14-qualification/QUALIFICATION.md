# Sprint 14 integrated qualification record — p18-season-20261028 (item 1 compiled read-only by Sonnet from the r13 gate, 2026-10-28 14:05 CDT; items 2–4 filled by the coordinator from the Sprint 14 lane runs, 14:35 CDT; the final gate full-tree-r4 on e115be4b is RUNNING and its classification is appended when it ends)


## 0. Basis

- **Gate:** full-tree-r13 ran at 85c09bc6 (p18-season-20261028). The report files are named `core-including-bridge.json` (the brief's "core.json") and `ui.json` under `/Users/zacheryspector/studio-scratch/p18-sprint13-20261028/full-tree-r13/`.
- **Candidate is later than the gate:** the candidate is now bd65e801. The commits after the gate are the one-hook ui fix (FIX-4, ebfdf2ca), FIX-5 (tests only), and the Sprint 14 witness commits 0cf00e40 and bd65e801. The gate predates all of them, and no r13 case covers the witnesses.
- **Core is unchanged since the gate:** RESULTS.md for Sprint 13 says "core untouched" for FIX-4. The later ui evidence is `ui-r23`, a full ui rerun with NEW 0 against r13 (COMPARE-ui-r23-vs-r13.txt).
- **Totals from the JSON:**
  - Core: 563 files, 6175 cases, 6058 passed, 103 failed, 3 skipped, 11 todo.
  - UI: 211 files, 2756 cases, 2747 passed, 4 failed, 5 skipped.
  - Both match AUDIT.md.
- **Compare classes** (COMPARE-core.txt, COMPARE-ui.txt, AUDIT.md):
  - Core: NEW 1, INHERITED-SAME 94, INHERITED-CHANGED 2, MISSING-INPUT 6, BASELINE-NOT-REPRODUCED 3, OVER-BUDGET-PASS 764.
  - UI: NEW 2, INHERITED-SAME 2.
- **How I grouped cases:** by file name, with titles checked, and the group counts below come from the JSON.
  - Groups overlap. For example, p15c2 sits in migration and long campaign, and p18-* sits in conservation and interactions.
  - Do not add the group counts together.
  - "Over 5 s" means a passed case with duration over 5000 ms.
- **Skipped and todo are not obligation evidence.**
  - Relevant core skips: `p14r3-rival-release` x2. Both are "stop rule, leaf not written": the route was not judged reachable in a bounded tick count.
  - The todo `p14b4-rival-seating-preference` says "a second bound root lies beyond the 350-tick bound".
  - The other core todos are p14a1/p14b/p14c recorded coverage limits.
  - The 5 ui skips are the audio mute contract.

---

## 1. Migration (and save/load)

**(a) Contract lines**
- P18 §8 (:119-121): old saves migrate with an empty TV root and no fabricated records; new kinds refuse below their era; lossless downgrade only when every new fact is representable.
- P18 §9 (:135): genuine predecessor migration; strict new-era kinds; isolated downgrade guards; save/load midway, blocked, late, cancelled, part-paid, distributing and expired.
- P17 §6 (:100, :106): no-guest identity; persistence.
- P16 contract (:119): empty migration lawful, no lossy downgrade, deterministic save/load.
- Remainder plan (:58): save/load and genuine predecessor fixtures.
- BLOCKERS.md:7-47: historical-composition gaps.
- SAVE.md:35 SAVE-11 and the 8 MiB UI import ceiling.

**(b) Existing cases (r13)**
- **Version-step and chain files:** 50 files, 820 cases, 819 passed, 1 failed (`p14c3-save-v38`), slowest 27.6 s (`p14b4-save-v30-compatibility`), 51 over 5 s.
  - `p17-save-step` 7/7 passed, slowest 2.0 s. This includes "a genuine week-53 Save45 migrates to Save50 with exactly the state m…", "down to Save49 and back is the version alone, byte for byte" and "a recorded franchise refuses every downgrade and every frozen builder by name".
  - `p18-save-step` 9/9 passed, slowest 5.75 s. This includes the genuine week-53 Save45 to Save51 case (1.8 s), "no season: … lossless downgrade", "a commissioned season … round-trips byte for byte, at commitment and after paid work", "refuses every downgrade", and "the validator refuses forged television authority" (5.75 s).
  - `p16a-save-v46` 15/15, `p16-estate-observed-migration` 4/4, `p16-r03-observed-migration` 2/2.
  - `p14d2-save46-migration` 111/111, `p1364-late-founding` 60/60, `migration` 23/23, `v14-migration.contract` 30/30.
  - `save-masked-downgrade-own-era` 4/4, `cash-ledger-checkpoint-v11` 10/10.
  - Version-pin failure: `p14c3-save-v38` "exposes matching strict38 conversion, validation and current migration over a genuine37 save" fails with saveVersion 51 where 38 is pinned. Class INHERITED-SAME.
- **Bridge checkpoint and prior-projection group:** 13 files, 189 cases, 169 passed, 20 failed. Slowest 73.1 s (`bridge-p13-campaign-isolation`, failed).
  - `bridge-runtime-checkpoint` 93/93 passed, slowest 27.4 s. It includes the outgoing67 capture "keeps both live Save51 slots byte for byte".
  - `bridge-owner-ux-projection20-migration`: 4 of 10 failed. Three are INHERITED-SAME (51 vs 38). One is INHERITED-CHANGED ("expected 68 to be 53"; 67 at r9).
  - `bridge-p06-checkpoint-recovery`: 2 of 11 failed, INHERITED-SAME (saveVersion 51 expected, found the old shape).
  - The other 14 failures are load timeouts, listed in the §8 table. This includes the one NEW row, `bridge-p13b-s3-save-as` (21.1 s against 20 s; 18 s alone at `alone-r17`).
- **P15 legacy root:** 10 files, 150 cases, 149 passed, 1 failed.
  - The failure is `p15c2` `legacy-root-downgrade`: 204,259 ms against a 120,000 ms budget. Class INHERITED-CHANGED (209,905 ms at r9).
  - Passing cases include `legacy-migration-empty-root`, `legacy-migration-empty-root-genuine-save38` (42.6 s), `legacy-migration-before-boundary`, and `legacy-migration-past-boundary` (plus its genuine-save38 variant).
  - Also passing: the `p15b-legacy-*` files (constructed debits) and the validate/round-trip leaves.

**(c) What the measurement does not cover**
- No Save48 to Save51 save at week 6240 exists in any test. The genuine long fixtures are Save38 and Save45 (SAVE-11).
  - The P18 and P17 steps are exercised from a week-53 Save45 and from small natural worlds only.
- BLOCKERS.md:7-47 gaps, as the inventory states them: player ended-manifest, fund and ranking-quarter Save47 to 46, shared-market assessment and quarter Save45 to 44, and direct Save45-step assertions. The version-pin rows are the only red.
- P18 §9 save states "late" and "distributing/expired": covered by the record round-trips and the validator in `p18-delivery`/`p18-save-step`, not by a save taken at those states in a long world.
- The 8 MiB UI import ceiling, save growth at Save51, and cross-engine portability are not measured by any r13 case.
  - Portability: a Node-built save was refused by the browser import because the sharedMarket factor did not reconcile (inventory §3). It stays ACCEPTANCE OPEN.

**(d) MEASURED WITH NAMED INHERITED FAILURES.** The red rows are version-pin drift, load timeouts, the p15c2 budget overrun and one load-shaped NEW timeout. The long-world Save48-51 migration gap is NOT MEASURED BY ANY TEST.

---

## 2. Conservation and reconciliation

**(a) Contract lines**
- P18 §7 (:99-113):
  - Money invariant `P - R = E + advanceRefundUnpaid`, with `K = cancellationChargePaid + cancellationChargeUnpaid`.
  - U0 is paid first, then K.
  - No queue-jump over P15 closure claims, and cumulative repayments linked so P18 and P15 never both pay the same obligation.
  - Earned fee stays E.
- P18 §9 Money group (advance is not earned fee; refund then K ordering; no double count; no film freelance charge).
- Remainder plan (:58): work/money/capacity conservation.
- 1367-G: P15's closed claim union integrates licence, cameo and TV obligations, and none bypasses estate priority.
- P16 contract (:113-121).

**(b) Existing cases**
- **26 files, 225 cases, 225 passed.** Slowest 32.7 s (`p13b-s5-conservation` determinism leaf), 19 over 5 s.
- **P18 money** (`p18-commission` 17, `p18-delivery` 17, `p18-work` 12, `p18-save-step` 9, `bridge-p18-season` 6; all passed):
  - "the advance is recoupable cash, never earned revenue" (cash rises by exactly 120,000 on one `tvAdvance` row).
  - "settleTvObligations pays U0 first, then K from the rest; the remainder is owed" (14.9 s).
  - "a part-paid cancellation settles across the refund/charge split, round-trips, and the replay refuses a reordered, doubled or excess payment" (7.5 s).
  - "deadline failure at C+20 with cash" (3.8 s) and "without cash" (0.8 s).
  - "closure handoff cancels the live season at the closure week, pays nothing, publishes U0 and K with the closure id".
  - "the natural closure route" (FIX-S13A-1).
  - "the cash reconciles with the television rows as recorded (P18-01)".
  - Every unit is one real 25,000 `tvProductionSpend` row.
  - Bridge: "settles a part-paid cancellation through settleTvObligations, the refund before the charge" (16.1 s) and "a closed player with obligations owed … gets no settle verb".
- **P16/P15 money:**
  - `p16-r2-validator` 15, `stabilization-p16-money-refusal` 12, `p16-finance-presentation` 2, `bridge-p16-absorption-finance` 2.
  - `p13b-s5-conservation` 3 (cash conservation across a sound and a lighting adoption, 20.1 s).
  - `d17a-adv-reconciliation` 14 (sum of per-film allocation plus idle equals the ledger payroll and overhead, to the dollar), `cash-ledger-checkpoint-v11` 10.
  - `p11-finance-history-scale` (6,240-advance real ledger, 11.6 s).
  - `stabilization-l03-payroll-ledger` 2.
  - Every makeSave reconciles cash and ledger (inventory §2).

**(c) Not covered**
- No case for P18 §7 closure/transfer beyond closure itself.
  - Healthy absorption invoking disclosed nonassignment cancellation, an estate hire not extinguishing claims or reviving the agreement, and linked P15/P18 repayments across an estate window are untested.
  - No `p18-*` or `bridge-p18-season` test references absorption, nonassignment or estate (grep of the test files).
- "Same economics for a rival" (P18 §9 Money) is untested. Rival seasons are out of scope and ACCEPTANCE OPEN.
- No conservation check over a long Save51 world holding rights, continuations and TV together. The long conservation case (`p11-finance-history-scale`) runs a bare studio on `makeSaveV18`.
- The ENTRY item-2 per-advance sweep (no double booking or double engagement, one spend row per unit, reconciliation on each advance) is a Sprint 14 witness (W4), not an r13 case.

**(d) MEASURED.** The unit-level money identities all pass with no failures. The closure/transfer clause and the long-world composition are NOT MEASURED BY ANY TEST.

---

## 3. Deterministic replay

**(a) Contract lines**
- P17 §6 (:106): persistence and deterministic replay.
- P18 §9 (:135): "deterministic replay and shared allocation order with no double spend/person/slot".
- Remainder plan (:58): deterministic replay.
- P12A register GOV-005/006: 6,240-week replay.
- P16 contract (:119): deterministic save/load.

**(b) Existing cases**
- **Engine and legacy replay group:** 15 files, 108 cases, 108 passed. Slowest 68.6 s (`bridge-runtime-session`), 21 over 5 s.
  - `replay.test` 15/15: two full-year runs with the same seed give a byte-identical `exportSave` (Oracle and Random agents), the same with `develop:true`, and two resumes of a converted V2 are byte-identical.
  - `contracts/determinism-floor.contract` 3/3: "same seed, same actions, same bytes".
  - `c2a-m3-determinism-and-guards` 8, `presence-determinism` 4, `rng` 17, `tick` §15.7 determinism cases.
  - `p14d1-rival-shelving-natural`: "two runs of the natural route are byte-identical exportSave(makeSave)" (12.0 s, 130 weeks).
  - `p13b-s5-conservation`: same action sequence from the same state gives byte-identical saves (32.7 s).
  - `p15c2` `legacy-determinism` (3.9 s) and `legacy-validate-replay` (6.8 s).
  - `p15a1-shared-market-harness` and `p15a2-power-ranking-harness`: pure 6,240-week harnesses with determinism leaves.
  - `bridge-process-restart` 8 (exact HTTP replay after SIGKILL, up to 38.5 s), `bridge-runtime-worker`, `bridge-runtime-session`.
- **Many P16/P17/P18 leaves end in "save and replay" or "round-trips byte for byte"** (for example `p17-p16-rights` same-week release, 0.6 s). These replay a recorded route. None compares two runs from the same seed and the same actions.
- **Failures:** `bridge-runtime-checkpoint-prepared-reuse` "preserves live authority on failed Save and replays the exact successful receipt after later changes and restart" (24.4 s against 20 s, INHERITED-SAME load timeout; passes alone per earlier alone runs). `p13a-scientist-foundation` has 3 digest-pin failures on people/concept/market/era/RNG regressions (INHERITED-SAME).
- **Allocation order:** `p18-work` "the exported sweep serves the film before the season on an equal wait, and the longer wait first otherwise (FIX-3)" passed. "films are served before a season on equal waits" is a pinned policy constant marked ACCEPTANCE OPEN.

**(c) Not covered**
- No same-seed, same-actions byte comparison on a P17 or P18 route. A grep of the test files found no such pair in `tests/p17-*`, `tests/p18-*` or `bridge-p18-season`. The nearest, `p17-cameo-seam`'s "absent is byte-identical", is a no-guest identity against the predecessor path, not a replay pair. This is the ENTRY item-2 gap (P17 §6 :106, P18 §9 :135).
- No 6,240-week replay on a live Save49-51 world. The 6,240-week replays are pure harnesses or earlier-era routes; the p14d1 natural replay is 130 weeks.
- Shared allocation order with no double spend, person or slot is pinned only for the film-versus-season sweep tie-break, not as a per-advance sweep.

**(d) PARTIALLY MEASURED.** Engine, legacy and earlier-route byte identity is measured, with one named load timeout and 3 digest pins. P17 and P18 same-seed identity is NOT MEASURED BY ANY TEST at r13.

**Sprint 14 adds (measured):** `tests/s14-season-route-witnesses.test.ts` W1 and `tests/s14-franchise-season-witnesses.test.ts` W1 (commits 0cf00e40 → bd65e801 FIX-W1 → e115be4b FIX-W2; runs s14-r1, s14-r3, s14-r5): two independent builds from the same seed and the same action list export byte-identical saves on the P18 season route (at commitment, after N advances with films contesting the season's owners, and at the terminal boundary, both runs agreeing on the terminal status) and on the P17 continuation-with-guest route (at the guest-booking greenlight, after the booked work week and at release). Same-seed one-action CONTROLs differ at the later point and agree at the earlier one (the review found the first seed-string controls vacuous; replaced). W4 adds the per-advance allocation sweep with real contention (season stalled on capacity or a set, or a film on the adopted stage during rehearsal/shooting): no slot booked twice, film and writing people disjoint from season people through the readers, every save reconciling, exactly one 25,000 spend row per credited unit. The harness adds route-level determinism on five natural seeds (default and deferred arms byte-identical at 520 and 1040; in-process rebuild digests equal). Class after Sprint 14: MEASURED on the P17 and P18 routes and the natural seeds (the 6,240-week replay on a live Save51 world remains a same-process digest check, not a two-process rebuild).

---

## 4. Long campaign (6240+, post-2040, save growth)

**(a) Contract lines**
- Remainder plan :58 and :40: G-L save validation at seed-b weeks 6240 and 8791, and post-2040 release.
- P15B Wave 4 :99-103: one `endOfRun` before, at and after 6240.
- P17 charter :31-35 cases (5) and (6): bounded long route/economy and save growth. "A paper case or code-only unit test cannot establish integrated runtime balance."
- 1367-K/1368-C/1368-O: post-2040 player-release cost accepted at Save45 (624 s; makeSave 4.2 to 2.8 s; seed-b 8791 at 41.3 MB). Not measured at Save49-51.
- P12A PERF-001/009 and PRF-004.

**(b) Existing cases**
- **18 files, 297 cases, 295 passed, 1 failed, 1 todo.** Slowest is the failed `legacy-root-downgrade` at 204.3 s. 39 over 5 s.
  - `p15c2-campaign-legacy-integration` 37 leaves. The header says "No natural campaign in a test reaches week 6240 from a fresh founding".
    - The fixtures are the genuine Save38 6240 capture of the 1052 active endurance run (122 releases) and natural route L (late founding at 6188, ticked to 6241).
    - Passing leaves include `legacy-tick-freezes-once-at-6240` (0.2 s), `legacy-control-genuine-save38-6240-lawful` (24.1 s), `legacy-control-late-founding-route-lawful` (11.8 s), `legacy-adapter-only-at-boundary` (13.7 s), `legacy-migration-empty-root-genuine-save38` (42.6 s) and `legacy-validate-refs-sibling-added-after-fr…` (24.4 s).
  - `p15c2-campaign-legacy-sibling` 5/5, `p15c1-campaign-legacy` 72/72, `p15b-legacy-v3` 8 (slowest 60.6 s), `p15b-legacy-terminal-regression` 11 (6239/6240/6241 cutoffs, 24.8 s), `p15b-legacy-official-order` 1 (17.1 s), `p15b-legacy-atomic` 6.
  - `p11-finance-history-scale`: 6,240 ticks of a bare week-count stress trajectory on `makeSaveV18`; no rights, continuations or TV (11.6 s).
  - `bridge-p11-ready`: "21-film/6240-advance public diagnostic" (10.1 s). `p16a-valuation` routeL6240 (twelve pre-origin films).
  - `p15a1-shared-market-harness` and `p15a2-power-ranking-harness`: pure 6,240-week harnesses.
  - `p14d2-rival-facility-disposal` natural observation to week 520 (10.6 s). `p14c4-cohorts` week-1040 corpus (11.3 s).
- **Failure and budget:** `legacy-root-downgrade` 204,259 ms against 120,000 ms in the gate; 105,639 ms alone at 85c09bc6 (`alone-r16`, passes); 86,772 ms alone at 31fdb366 (`alone-r13`).

**(c) Not covered**
- A natural campaign through 6240+ on the Save49-51 era with rights, continuations and TV present. This is plan :58/:40 and ENTRY item 3. The genuine long fixtures are Save38/Save45, and the p15c2 header says no test reaches 6240 from a fresh founding.
- Whether a release happens after week 312, and post-2040 behaviour on Save51. The 520-week seed-b trial already failed controller qualification at Save45 (zero releases in 312..519, 1367-K).
- makeSave/validate time and save size at Save51. The only figures are the Save45 ones (1368-C).
- The ENTRY item-3 comparison with Save45 (1367-K, 1368-C) has no r13 side.
- The 11 `src/harness/**` tests, the 1052 driver, the `scripts/captures/*` and `measure-*` harnesses, G-L and the post-release harnesses are not in the core include (inventory §2).

**(d) PARTIALLY MEASURED.** Boundary, freeze and legacy-root behaviour is measured on genuine Save38/45 and constructed fixtures, with one named budget failure. The natural Save49-51 campaign through 6240+ is NOT MEASURED BY ANY TEST.

**Sprint 14 adds (measured, lane harness-r2 on 9a9e56a8 = 0cf00e40 + scripts; AUDIT CLEAN WITH NOTES):** (i) the 1367-K seed-b operated 312 trial re-pointed at Save51 does not qualify, as at Save45: 16 films by week 156 and none after, zero releases in 312–519, every renewal refused as underMarketCase, 14 replacement hires, cash −1.30 M at 520 (no controller fix applied, rule 3). (ii) The Save45 natural route (p13aGeneratedStudio + one tick per week, no player production action) closes the player at week 1366 on every seed (cash 12.2 M → 4.4 M → −0.49 M, seed-independent) and Save48's tick refuses further advances, so 6240 is unreachable by plain ticking on Save51 — a finding, not a defect. (iii) The closure-deferred arm (engine option deferPlayerClosure; player closed-by-condition, no money moves; not survival evidence) reaches 6240 and 8791: seed-b save 45.9 MB at 6240 and 60.4 MB at 8791 (Save45: 41.3 MB at 8791); makeSave/validate medians 85.2 s / 34.3 s at 6240 and 146.6 s / 74.3 s at 8791 (Save45: 5.7 s and 10.9 s per pair) — about 21× on a swap-pressured host, isolated calls, not a Bridge-step budget; one 89.3 s tick in the 5720–6240 interval (the Legacy boundary suspected, not attributed); Legacy frozen once at 6240 with one official hash through 8791; rights root 3,312 properties / 6,861 title events; franchises, cameos and television roots never created on these routes. p13a and p15a1 to 6240: saves 5.7 MB and 4.1 MB, probes under 0.6 s. (iv) Player release after 312 or 2040 on Save51: structurally zero on these routes; the operated trial produced none; the 1368-C delayed-player route is Save45-pinned and out of scope — STILL NOT MEASURED. Class after Sprint 14: MEASURED for the world past 6240 under the deferred arm with a performance finding for the Owner; the natural operating player through 6240 remains NOT MEASURED (no admissible natural controller).

---

## 5. Rival recovery and closure

**(a) Contract lines**
- 1363-A :47-49 (no guaranteed survival, no hidden subsidies).
- 1363-A §6 :470-500 (routes and seeds p13a-core-causal-01, seed-b, p15a1-w2-market-01; 520- and 6,240-week), :607 ("a measured behaviour is a finding"), §6.8 (G-L rerun).
- Remainder plan :28-30 (rival recovery measured, never guaranteed).
- P15B Wave 4 :99-103 and P18 §9 Closure/transfer (closure cancels and releases once; no queue jump).
- OWNER-ASSIGNMENT :90/:100 (constructed quote evidence is not natural close proof).
- Natural C-08 stays OPEN.

**(b) Existing cases**
- **53 files, 506 cases, 504 passed, 2 skipped, 0 failed.** Slowest 61.9 s (`p14d2-rival-cost-cutting` B2 replacement positive control), 64 over 5 s.
  - `p14d2-rival-cost-cutting` 52: B1 entry conditions, B3/B4 release arithmetic and binding exclusions, B2 restrictions (market case 39.8 s, adoption block 25.2 s).
  - `p14d2-binding-cash` 9, `p14d2-a8-binding-cash` 2, `p14d2-rival-cost-cutting-adapter` 2.
  - `p14d2-rival-facility-disposal` 24: "admitted synthetic policy-state controls over genuine plant", plus the 520-week natural observation (10.6 s). That observation passes either with refunds or with the console record `ZERO_REFUNDS: natural positive disposal integration not demonstrated`.
  - `p14d1-rival-shelving` 29, `-natural` 5 (130 to 260 on p13a-core-causal-01), `-save-v43` 18.
  - `p15b1-corporate-condition` 41, `p15b1-studio-loan` 11, `p15b2-corporate-condition-live` 16, `p15b3-remedy-parity` 6.
  - `p15b4-studio-closure` 20, including `closure-genuine-unfunded-route-closes` (9.5 s) and `estate-run-receipts-claims-and-archival` (5.9 s).
  - `stabilization-l05-closed-rival-claims` 3, `p16-estate-*` / `p16c-estate` / `p16-r2-estate`, `p16-absorption-*`, `p16-rival-buyer-*`, `p14r3-rival-release` (2 skipped).
- **Inherited natural-route premise failures that bear on rival natural routes** (§8): `p14b4-rival-seating-preference` 17 ("UNEXECUTED natural premise"), `p14c2c-rival-promises` 3, `p14c3-canonical-rival-history` 2, `bridge-p14b2-trust` 5 ("no natural rival-only promise outcome by 240"), `p14p3-directing-promises` 2.

**(c) Not covered**
- No case asserts that a rival resumes production, or that its cash or recurring costs recover, after cost-cutting entry. A grep of `p14d1-*`, `p14d2-*`, `p15b*` and `stabilization-l05` found no resume or recover assertion.
- The one natural recovery-adjacent case (`p14d2` Part C, to week 520, p13a-core-causal-01) is an observation that passes with zero refunds.
- The 1363-A §6 routes are not run: seed-b and p15a1-w2-market-01 at 520 and 6,240 weeks. The 1363-V kit is stale and was never run on final source (only a type pass at 6c60c26a is on record).
- Closure and estate mechanics run on constructed or transaction-fixture routes (`closure-disposes-an-open-market-case`, p16 estate files). Natural C-08 stays OPEN.
- Closure on a Save49-51 world with TV obligations, and rival seasons and rival guest booking, are ACCEPTANCE OPEN.

**(d) PARTIALLY MEASURED.** Rival closure, estate and cost-cutting mechanics are measured and pass. Natural rival recovery and resumed production are NOT MEASURED BY ANY TEST, and the inherited premise failures show several natural rival routes no longer reach their premises.

**Sprint 14 adds (measured, harness-r2 rival stage and the campaign rival summaries; 1363-A §6 routes on the landed tree only — the charter's attribution arms and controls (a), (e), (f), (g) need historical trees and were not run):** no rival that entered cost-cutting ever greenlit again, on any route, and every entrant closed: p13a-core-causal-01 9 of 9 (first entries 86–2811, each 2 episodes, 1 loan, last greenlight before entry, closure 50–120 weeks after entry); seed-b the four founding rivals (entries 387–583; closures 442–676) while the five replacements founded at 525–2553 never entered cost-cutting and released 485–829 films each, stable at 8791; p15a1-w2-market-01 9 of 9 entered and closed, eight of them with ZERO releases over 6,240 weeks (they commission but never greenlight); p13-public-commercial-adoption 3 of 5 entered and closed by 520, p13b-s8-bridge-probe-01 none entered. The only post-entry action anywhere is a hire. A measured non-recovery is a finding under §6 :607; whether it is the intended 'no guaranteed survival' balance or a defect in the recovery path is the Owner's reading. Class after Sprint 14: MEASURED (non-recovery) on the §6 routes; attribution NOT MEASURED.

---

## 6. Cross-system interactions

**(a) Contract lines**
- P18 §9: occupancy conflicts in both directions (film to TV and TV to film), writer freed only after scripts, no double spend, person or slot; §8: no film R/M/F/Awards/Standing/promise effects.
- P17 §6 :107: integrated player and rival films with 0/1/2 guests (natural).
- P17 charter (5)/(6) and 1367-G union.
- P18 §9 :139: natural route bounded to 72 advances; "failure to find an admissible natural setup is a finding".
- ENTRY item 2 (§8 no-pollution in one world holding a franchise with a guest and a live season; estate or R1 sale during a live season; a season on a continuation-linked property).

**(b) Existing cases**
- **36 files, 285 cases, 285 passed.** Slowest 21.8 s (`bridge-p16-rights-parity`), 29 over 5 s.
  - `p18-commission` 17, including "shared capacity and availability through the film owners": the season holds one Development & Casting slot under the occupancy owner, a film greenlit after the commission never takes the season's slot, and an absorption quote never seats a target picture on the season's slot.
  - `p18-work` 12, including capacity through the same owners as films: stage and Post are the adopted chain, the set cannot be struck, a season person cannot be released early, and a film is served before the season on an equal wait.
  - `p18-delivery` 17, `p18-save-step` 9, `bridge-p18-season` 6.
  - `p17-p16-rights` 15, `p17-cameo-booking` 19 (a reserved week blocks a whole-film seat; a freelance booking is disclosed to a new employer; closure cancels the unperformed booking once), `p17-cameo-law` 14, `p17-cameo-seam` 7, `p17-continuation-*` 37.
  - `bridge-p17-continuation-greenlight` 3, `bridge-p17-featured-appearances` 5, `p14a1-release-busy-set` 11 (busy-set release refusal).
  - `p16-continued-work-*`, `p16-absorption-*` and `bridge-p16-rights-parity` 9 (P16 absorption and rights on the shared owners).
- **ui:** `ui/src/screens/p18-season-ui` 9/9 passed. The 4 ui failures are in the §8 table; none is on the P18 surface.

**(c) Not covered**
- §8 no-pollution in a world that holds a franchise with a guest and a live season (ENTRY item 2): no r13 case.
- Film, rights, continuation and TV composed in one world: none.
- An estate or R1 sale during a live season: `p18-commission` refuses a commission after the player sold the R1 title, but nothing sells during a live season.
- A season on a continuation-linked property: none. RESULTS.md notes the natural P18 route ends near week 440, before the week-1872 guest unlock.
- Integrated natural player and rival films with 0/1/2 guests (P17 §6 :107): by title, the cameo cases are unit-level bookings, cancellations and closure, not an integrated run.
- Rival seasons and rival guest booking: ACCEPTANCE OPEN.

**(d) PARTIALLY MEASURED.** The pairwise interaction files are all green. One-world composition (franchise, guest and live season together) is NOT MEASURED BY ANY TEST at r13.

**Sprint 14 adds (measured):** W2 — in one natural world holding a franchise (released direct sequel) with a featured guest and a live season commissioned on the franchise's own story property (P16 admitted it; the cash record shows the natural world affords the sound chain, the adoption and the admission quote: 10,562,272 available against 2,990,340 required, no cash row), the franchise root (Recognition, Momentum, Fatigue), released films and Standing, the five Standing and film history row kinds, promises, and the guest's booking, career events and first takes are byte-identical to the same world without the season after every advance to the season's end; the season credited work and moved its own cash (non-vacuous); no Awards source exists (static premise). W3 — an R1 title sale to a permitted rival mid-season (MEASUREMENT, Owner items named): every advance stalls on rights/noAuthority with nothing credited or spent; the C+20 deadline cancels once with refund and charge paid; the commissioner's licence survives the sale and the cancellation. Accepted departure: the continuation-linked season runs on the P17 cameo world (the P18 route ends near week 440, before the week-1872 guest unlock). Class after Sprint 14: MEASURED for the one-world composition; rival seasons, rival guests and the natural 0/1/2-guest integrated run remain NOT MEASURED (ACCEPTANCE OPEN).

---

## 7. Classification summary

| Obligation | Class |
|---|---|
| Migration | MEASURED WITH NAMED INHERITED FAILURES (long-world Save48-51 migration: NOT MEASURED) |
| Conservation | MEASURED (closure/transfer clause and long composition: NOT MEASURED) |
| Deterministic replay | PARTIALLY MEASURED (P17/P18 same-seed identity: NOT MEASURED) |
| Long campaign | PARTIALLY MEASURED (natural Save49-51 through 6240+: NOT MEASURED) |
| Rival recovery/closure | PARTIALLY MEASURED (natural recovery: NOT MEASURED) |
| Interactions | PARTIALLY MEASURED (pairwise green; one-world composition: NOT MEASURED) |

---

## 8. Named inherited failures (r13 core, 103 failed; classes from COMPARE-core.txt and AUDIT.md)

| File (failed/cases in file) | Class and count | Obligation | Recorded cause |
|---|---|---|---|
| `bridge-owner-ux-projection20-migration` (4/10) | INHERITED-SAME 3, INHERITED-CHANGED 1 | Migration | Save51 version drift in pins ("expected 51 to be 38" x3); the changed row is "expected 68 to be 53" (67 at r9) |
| `bridge-p06-checkpoint-recovery` (2/11) | INHERITED-SAME 2 | Migration | Save51 version drift; recovered envelope no longer equals the pinned `saveVersion: 51` shape |
| `p14c3-save-v38` (1/47) | INHERITED-SAME 1 | Migration | Version drift (51 for 38) |
| `p15c2-campaign-legacy-integration` `legacy-root-downgrade` (1/37) | INHERITED-CHANGED 1 | Migration and long campaign | Budget overrun under gate load: 204,259 ms against 120,000 ms (209,905 at r9). Alone: 105,639 ms (`alone-r16`) and 86,772 ms (`alone-r13`), both pass |
| `bridge-p12-campaign-library` (11/13) | INHERITED-SAME 11 | Migration (save/load) | Load timeouts: 9 at 5,000 ms, 2 at 20,000 ms. Pass alone |
| `bridge-p13-campaign-isolation` (1/1) | INHERITED-SAME 1 | Migration (save/load) | Load timeout at 60,000 ms (73.1 s). Passes alone |
| `bridge-p14c3-runtime` (1/8) | INHERITED-SAME 1 | Migration (save/load) | Load timeout at 5,000 ms (9.0 s). Passes alone |
| `bridge-runtime-checkpoint-prepared-reuse` (1/21) | INHERITED-SAME 1 | Replay (journal receipt) | Load timeout at 20,000 ms (24.4 s). Passes alone |
| `bridge-p13b-s3-save-as` (1/1) | NEW 1 | Migration (save path) | Timeout at 20,000 ms (21.1 s; 15.5 s at r9). Passed alone at 18 s (`alone-r17`), recorded as load. Not inherited, listed for completeness |
| `p13a-scientist-foundation` (3/6) | INHERITED-SAME 3 | Replay (digest pins) | Digest pins for people, concepts, market, era and RNG regressions no longer match |
| `p14b4-rival-seating-preference` (17/22) | INHERITED-SAME 17 | Rival and long campaign (natural route) | "UNEXECUTED natural premise: no rival film decision on 'seed-b' within 350 ticks holds >= 2 pool members" |
| `p14b1-t4-regressions` (15/34) | INHERITED-SAME 15 | Natural route | "fixture: no multi-beneficiary promise outcome from a shared real take within 230 weeks" |
| `p14b4-cast-class-outcomes` (9/23) | INHERITED-SAME 9 | Natural route | "UNEXECUTED natural rival prerequisites absent by 350" |
| `bridge-p14b2-trust` (8/22) and `p14b2-fixture-preconditions` (2/5) | INHERITED-SAME 10 | Rival natural route | "no natural rival-only promise outcome by 240" (5 and 1); week 208 where 52 expected (3 and 1) |
| `bridge-p14b5-relationships` (5/15) and `p14b5-relationships` (3/53) | INHERITED-SAME 8 | Natural route | Week 208 against 52; row counts 18 against 40 and 47 against 48; missing `studio-aca408ec-r01:film:6` row |
| `p14c2c-rival-promises` (3/3) | INHERITED-SAME 3 | Rival natural route | Premise drift: outcome not `null`/progress 0 |
| `p14p3-directing-promises` (2/20) | INHERITED-SAME 2 | Rival natural route | "the same fixed rival really wins the later focus case" no longer holds |
| `p14c3-canonical-rival-history` (2/6) | INHERITED-SAME 2 | Rival natural route | "L passive work premise ended without an obligation" |
| `bridge-p14c2rm-retirement` (2/21) | INHERITED-SAME 2 | Natural route | "freeze premise: counterpart stays lawfully disclosed" (`endWeekExclusive: 416` not found) |
| `p14c3-admission-boundaries` (1/10) | INHERITED-SAME 1 | Natural route | Rival promise premise drift (outcome not `null`) |
| `p14b1-trust-chooser` (1/13) | INHERITED-SAME 1 | Natural route | Chooser winner 'compensation' where 'opportunity' expected |
| `p14b4-cast-class-capacity-evaluator5` (1/2) | INHERITED-SAME 1 | Natural route | 'FRAGILE' where 'IMPOSSIBLE' expected |
| `r3n1-stale-schedule-take-02`, `-02p31`, `-02p32` (2 each) | MISSING-INPUT 6 | None of the six obligations (bridge stale-route refusal evidence) | ENOENT on untracked `evidence/Playability-Interaction-01/fixtures/r3n1-dense-02*/…checkpoint.json`; unrecoverable here |

- **Sums:** INHERITED-SAME 94 (14 load timeouts, 71 natural-route, 3 digest pins, 6 version drift); INHERITED-CHANGED 2; NEW 1; MISSING-INPUT 6.
- **BASELINE-NOT-REPRODUCED 3** now pass: the held-title seller case (4.5 s) and the two scenery provenance cases (`art/` was materialized).
- **UI:**
  - NEW 2:
    - `StudioLotScreen` focus case (toHaveFocus, 1.4 s). It failed alone at `alone-r17`, was bisected to slice A, and was fixed in the later one-hook ui commit (ebfdf2ca; 65/65 x3). `ui-r23` shows it BASELINE-NOT-REPRODUCED (it now passes).
    - `WorldFirstStudioHome` topbar-focus (30 s timeout, 33.4 s; 28.5 s at r9). Passes alone.
  - INHERITED-SAME 2:
    - `WorldFirstLotNativeNextEventApp` cash-stop (30 s timeout, 39.5 s).
    - `WorldFirstStudioHome` building-focus (30 s timeout, 34.9 s).

---

## 9. Timing limits (carried unchanged)

- **Over-budget passes:** 764 core cases passed in over 5,000 ms (matches the JSON), max 709.2 s.
  - Of these, 38 cases are over 60 s (including failed ones). The slowest are `bridge` 709 s, `bridge-p14p4p5-opportunities` 604 s, `bridge-p09a-w5-bare-lot-first-film` 573 s, `roster-wall-summary` 307 s, `bridge` 221 s, `acceptance-corpus` 183 s and 158 s, `bridge-p14p3-directing-promises` 167 s, 113 s and 102 s, `c2a-m4-g101-throughput` 153.6 s, `p14c3-deferred-transition-chain` 152 s.
  - Over 60 s with an obligation tie: `p15c2` `legacy-root-downgrade` 204 s (failed), `bridge-p13-campaign-isolation` 73 s (failed, 60 s timeout), `p15b-legacy-v3` 60.6 s.
  - ui: 45 cases over 5 s, max 39.5 s (a failure). The ui compare shows OVER-BUDGET-PASS 0.
- **Timeouts:** core 15 (5,000 ms x10, 20,000 ms x4 including the NEW save-as, 60,000 ms x1). ui 3 (all 30,000 ms).
- **Core stage:** 7,286 s (r9 6,453 s), ui 942 s. Host load at r13: loadLOCAL 9.09 against 4.65 at r9; swap 8,407 M of 9,216 M used.
- **Alone measurements:**
  - `p15c2` `legacy-root-downgrade`: 105,639 ms of 120,000 ms at 85c09bc6; 86,772 ms at 31fdb366; 204,259 ms under gate load.
  - `WorldFirstLotNativeNextEventApp`: slowest case 30,013 ms alone at 85c09bc6 (passes, at the limit, "timing not qualified"; 29,125 ms at 31fdb366).
  - `WorldFirstStudioHome`: 16,370 ms alone at 85c09bc6 (12,678 ms at 31fdb366); 33,433 ms for the topbar case in the gate.
  - `bridge-p13b-s3-save-as`: 18 s alone against 21.1 s in the gate.
  - The 14 core load timeouts passed alone in earlier alone runs. They were not re-run at r13, per the inventory's reuse rule.
- **Not in the gate:** Playwright and the harnesses listed in §4(c).
- **Unchanged ACCEPTANCE OPEN items:** the P18 list (p18-sprint12/RESULTS.md), the P17 tag list, natural C-08, native/Unity unrun, cross-engine save portability, and Owner-pending policies (including the equal-wait film-first policy constant).

Files read: `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/audits/2026-10-22-codebase-review/sprint14-qualification/{ENTRY,INVENTORY,RESULTS}.md`, the r13 `AUDIT.md`, `COMPARE-core.txt`, `COMPARE-ui.txt` and `COMPARE-ui-r23-vs-r13.txt`, and p18-sprint12/p18-sprint13 `RESULTS.md`. I also read `/Users/zacheryspector/studio-scratch/p18-prep/P18-FIRST-SEASON-CONTRACT.md` §7-§9, grepped `/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt/tests`, and parsed the r13 JSON files. No file was edited and no tsc, vitest or npm was run.