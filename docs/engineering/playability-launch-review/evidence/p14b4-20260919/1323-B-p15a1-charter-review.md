# 1323-B: independent review of the P15A.1 Wave 0 reconnaissance and Wave 1 charter

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of [1323-A](1323-A-p15a1-wave0-and-wave1-charter.md) at HEAD 9a85b4ae, persisted verbatim by the parent. Verdict REFINE, three required changes; disposition [1323-F](1323-F-parent-p15a1-charter-adoption.md).

---

# Independent review — Task 1323-B (P15A.1 Wave 0 reconnaissance + Wave 1 pure-law charter)

**Candidate:** `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1323-A-p15a1-wave0-and-wave1-charter.md` at HEAD `9a85b4ae`.
**Mode:** read-only source/document review, no code or test run (none exists yet — this is pre-implementation).
**Scope note:** this is a planning document with no UI/screens (Wave 1 is explicitly "no UI, bridge, rank, or corporate code yet"), so the visual-craft/usability/screen-family checks in my brief are **OUT OF SCOPE — N/A** for this artifact.

---

## 1. Authority: §4.3 open decision vs. Direction A / class-C classification

**PARTIAL — mechanically sufficient, disclosure insufficient.**

What's correctly present (MET WITH EVIDENCE):
- Charter quotes ruling §4.1's exact wording verbatim (`docs/engineering/p14-preparation-8ef5246a/CODEX-P13-P15-OWNER-RULINGS.md:303-304`) and correctly narrows the bullet list to only the four items relevant to P15A.
- RECONCILIATION-02 §7.1 does say the ≈4-week window is Direction A while "shape is tuning"; §2.2's Class-C row literally lists "window taper" as an example, "who acts: charter authors and playtest" — matches the charter's citation exactly.
- RECONCILIATION-02 §9's class-D table (D2, D3, D4a, D11) contains no formula item — matches "no formula item among the remaining Owner choices."
- 1122-A (`.../evidence/p14b4-20260919/1122-A-p15-owner-presentation-decisions.md`) confirms D2/D3/D4a were genuinely answered by the Owner on 2026-09-27 — but explicitly states (line 25) these answers "do not... change... simulation law," so 1122-A cannot be read as touching the formula question at all.
- The charter's own safety valve is real and correctly structured: Wave 1 is pure/unexported/reversible, the annex's Wave 4 Owner playtest keeps KEEP/REVISE/REJECT with the Owner, and there is an explicit stop condition ("If the Owner reads §4.3 as still requiring an explicit formula selection before any code, Wave 1 stops at this record").

What's missing (the defect): the charter never discloses that:
1. RECONCILIATION-02 self-labels its own status line as **"RESEARCH, NOT OWNER AUTHORITY"** and **"NOT implementation-ready preparation"** (p15-reconciliation-02.md:3).
2. Unlike P13 (ruling §2.4, an explicit "P13 Owner-direction amendment" section with dated OWNER-SELECTED PRODUCT DIRECTION labels) and P14 (ruling §3.4, same pattern), **P15's §4 in `CODEX-P13-P15-OWNER-RULINGS.md` has no corresponding amendment** — I read the full document (384 lines) and §4 contains only 4.1/4.2/4.3, unchanged since the original 2026-08-31 approval.
3. RECONCILIATION-02's own supersession table (§2.4, rows 6-17, its authoritative "what old ruling text is superseded" ledger) does **not** include a row for the "exact shared-market formula" line in ruling §4.3 — it only supersedes the closure-asymmetry and post-2040-mode clauses of that same line. Even RECONCILIATION-02 does not claim to have closed the formula question.
4. The ruling document's own governance clause (§8) says later "exploratory prose" (which RECONCILIATION-02 self-identifies as) does not override §4.3 "unless the Owner issues a newer explicit ruling" — and the original P15 package's own §23 explicitly says "P15A.1 is blocked until the Owner... selects the exact bounded shared-market formula/envelope."

The charter's phrase "the later relayed Owner Direction A" reads as ledger-grade authority equivalent to the P13/P14 amendments; it is not. The stop condition is therefore not a contingency backstop — it is, on the current evidence, the *only* thing actually keeping this charter inside authorized bounds, and that should be stated plainly.

**Required change 1:** In charter §1, add a sentence disclosing that RECONCILIATION-02 self-labels as "RESEARCH, NOT OWNER AUTHORITY," that no P15-specific amendment exists in `CODEX-P13-P15-OWNER-RULINGS.md` (unlike P13 §2.4 / P14 §3.4), and that RECONCILIATION-02's own §2.4 supersession table does not include a row closing the §4.3 formula line. State that the explicit stop condition is therefore the operative safeguard, not a fallback.

---

## 2. Reconnaissance: the seven Wave-0 facts

All seven verified against source at the cited lines; six are **MET WITH EVIDENCE**, one has a **dangling citation** (fact 7).

| # | Claim | Verification |
|---|---|---|
| 1 | Player release collection at `tick.ts:502` (sort, admission-witness check `:506-519` before reception/RNG/cash); reception is the sole sim-RNG consumer, one critic draw per release ascending id; discoverability isolated stream | Confirmed exactly. `releasing = advanced.filter(...)` at `tick.ts:502`; witness check `:510-520`; `resolveReception(inp, rng, ...)` at `tick.ts:625` (exact line cited); `market: state.market` and `standing: startOfTickStanding` (captured `:528`, before the loop) feed `inp`. **MET WITH EVIDENCE.** |
| 2 | `hollywoodTick.ts:312-392` business loop order; a later business's `decide` reads `forecastHistoryForOwner` over `h.films` at `:237`, including earlier businesses' same-week films; chronology change deferred to Wave 2 | Confirmed. Loop at `hollywoodTick.ts:312-391` runs sound→staff→plans→research→`decide`(`:321`)→`operateStage`→release-commitment→prod-tech→`advanceManagedProductions`, then resolves this business's releases (`:337-360`, `resolveReception` at exact line `:340`), appends to `h.films` (`:349`). Because `h` is threaded across the outer `for (const b of h.businesses)` loop, a *later* business's `decide` call (next iteration, `:237` inside `decide`) sees `h.films` rows appended by *earlier* businesses in the same tick. Confirmed this is a real chronology dependency, not a hypothetical — deferring the batch extraction to Wave 2 "with measured controls" is the right call, and it correctly carries forward the P15A1-RELEASE-SEAM-REVIEW.md qualification #1 ("A common batch is not yet proven to be a behavior-preserving extraction"). **MET WITH EVIDENCE.** |
| 3 | `computeBoxOffice` (`reception.ts:596-706`) fixes `competitionFactor = 1.0` at `:678`, multiplies into `opening` at `:697-703`; `setNoveltyFactor` shows the house pattern of a bounded multiplier defaulting to exactly 1 | Confirmed line-for-line: `const competitionFactor = 1.0` is literally line 678; `opening = baseMarketValue * reachSum * openingReachMult * competitionFactor * economyScale * setNoveltyFactor` spans `:697-703`; comment at `:626-627` states "DEFAULTS TO EXACTLY 1 — a bit-exact IEEE no-op." The "596-706" range precisely brackets the function signature through the `opening` computation (the part relevant to competitionFactor), not the whole function body (which continues to legs/discoverability through ~767) — a deliberately tight, correct citation, not an error. **MET WITH EVIDENCE.** |
| 4 | `MarketState.competingSlate` (`types.ts:293`) is untyped numeric pressure rows, always empty | `types.ts:293` is the exact line; `CompetingRelease = { marketPressure: number }` at `:286`; `worldgen.ts:680` sets `competingSlate: []`; grep across `src/` shows no other writer — only `save.ts` reads/validates it as an array. **MET WITH EVIDENCE.** |
| 5 | `economy.ts:53` fixes each run's weekly schedule at release; pressure must act before the result is frozen, never rescale an existing run | `openTheatricalRun` begins at exactly `economy.ts:53`, builds `weeklyGross = theatricalSchedule(opening, legs)` from the already-computed `opening`/`legs` and returns a fixed `TheatricalRun`. Confirmed any pressure effect must land inside `computeBoxOffice` before this call, never after. **MET WITH EVIDENCE.** |
| 6 | No `phasePrecision` or phase catalogue exists in source | `grep -r "phasePrecision\|phaseCatalogue\|phaseOrdinal\|AuthoritativePhaseOrderCatalogue" src/` → no matches. **MET WITH EVIDENCE.** Also correctly matches RECONCILIATION-02 §2.3 row D17/§7.3: the repo-wide catalogue is not a P15A.1 prerequisite. |
| 7 | Six genres (`types.ts:9`); authored rival anchors make drama and crime ≈40% as busy as romance ("P15 market-window analysis §3") | `types.ts:9` confirmed six-value `Genre` union. The ≈40% figure is **numerically correct but the citation is dangling**: no document named "P15 market-window analysis" exists anywhere in the repo or in the authority list the charter itself declares. I independently recomputed the claim from real source — `hollywoodStartingData.ts:11-36` (9 rival templates, each with 1-2 genre anchors), `hollywood.ts:206` (`affinities[g] = anchors.includes(g) ? 5 : 1`), `hollywoodTick.ts:259-260` (genre picked proportional to affinity/sum) — and averaging the per-genre pick probability across all 9 studios gives drama ≈0.843, crime ≈0.843, romance ≈2.043, i.e. drama/romance = crime/romance ≈ **41.3%**, matching "about 40%." **DEVIATES on citation (cites a non-existent document); MET on substance (independently reproduced from real source).** |

**Required change 2:** Replace the fact-7 citation "(P15 market-window analysis §3)" with the actual source: `src/core/hollywoodStartingData.ts:11-36`, `src/core/hollywood.ts:206`, `src/core/hollywoodTick.ts:259-260`.

---

## 3. Law: `p15a1-market-v1` vs. RECONCILIATION-02 §7.1-7.2 / annex C.1 / D.3

**MET WITH EVIDENCE**, with one wording nit noted (not blocking).

- Lane weights (1.00/0.55/0.55/0.20, hand-off at 0.20 on R+4, 13-week half-life, retired R+26) match RECONCILIATION-02 §7.1 exactly. I independently recomputed `f(P)=1−0.25·(1−e^(−P/2))` at P=1,2,4 → 0.9016/0.8420/0.7838, matching the charter's "about 0.90/0.84/0.78" claims, and confirmed `f(0)=1` exactly and stock at R+25 = 0.0653 ≈ "about 0.065." **MET.**
- One lane per week, continuous hand-off, unclamped stock, per-(studio,genre) clamp on the window term only, canonical `(week, releaseId)` order, no `isPlayer` — all match package law 1/§17 and annex C.1/D.3 verbatim in substance. **MET.**
- Same-week batch member weighting at 1.00, explicit self-exclusion of the subject itself — matches RECONCILIATION-02 §7.2 ("same-week handling is order-independent by construction"). **MET.**
- Ambiguity check requested in the brief — "does a studio's own other same-genre release count against its subject": the formula answers this explicitly and unambiguously. `Wk = Σ window weights of k's active exposures + Σ 1.00 for k's other genre-g batch members (excluding s)` ranges `k` over all studios including the subject's own studio, so yes, a studio's other same-week same-genre release does count toward its own subject's pressure via its own `Wk` term, clamped like everyone else's. Not left to a test-author's guess.
- Exposure activation week, clamp/batch interaction: adequately specified via "nothing activates before the whole batch is assessed" + the half-open `[R, R+4)` window definition.
- Rounding: not addressed, but immaterial for Wave 1 (pure functions, no persistence yet; tests will use approximate-equality assertions). Not a blocking gap.

**Minor clarity note (not a required change):** the "Eligibility" paragraph ("a release is eligible when... it has a genre in the six-genre catalogue") is tautological — `Genre` is a closed six-value union, so every release trivially satisfies this. The real per-subject genre-match rule only becomes clear from the fixture list (`market-different-genre`). Consider rewording so the eligibility paragraph states the per-subject same-genre-contribution rule directly rather than the always-true batch-membership condition.

---

## 4. Deferring reach scaling (c=1), P07 seam, persistence, chronology change, phase identity to Wave 2

**MET WITH EVIDENCE.** This is a lawful split.

- Annex J's Wave 1 list ("one definition/version; one genre and bounded release window; active exposure/decay reducer; frozen same-week batch, aggregate/self-exclusion law, atomic assessment/reason production; ownership/ID-swap symmetry... no UI, bridge, rank, or corporate code yet") names none of reach scaling, P07 integration, persistence, or phase identity. Annex J's Wave 2 explicitly owns "additive root/save generation/migration; P12 player+rival fixture integration; P07 one-time prospective consequence seam." So the charter's split tracks the annex's own wave boundaries exactly.
- Reach scaling is independently confirmed Class C in RECONCILIATION-02 §2.3 row D1 ("taper, stock and reach scaling are tuning"), and the charter's `c=1` with a named seam function returning 1 mirrors the accepted house pattern (`setNoveltyFactor` defaulting to exactly 1, `reception.ts:626-628`).
- Phase identity: correctly deferred, and correctly *carried forward* into the Wave 2 handoff list at charter §5 ("domain-local phase identity" is explicitly named there), satisfying P15A1-RELEASE-SEAM-REVIEW.md's qualification #2 ("Retain the domain-local phase identity requirement... The notes' local ordering work should carry that requirement into the charter"). Correctly reasoned: Wave 1 has no `GameState` mutation and no persisted events, so there is nothing to tag with `phaseOrdinal` yet.
- Persistence and the chronology change are likewise correctly deferred and correctly named at §5's Wave 2 handoff, matching the seam review's qualification #1 and the ordering inventory's dependency list.

---

## 5. Wave 1 tests: fixture sufficiency and the 6,240-week pure harness

**MET WITH EVIDENCE on fixture selection; PARTIAL on harness specification.**

- The charter's eight named fixtures (`market-one-player-one-rival`, `market-owner-swap`, `market-id-swap`, `market-order-reversal`, `market-same-week-batch`, `market-different-genre`, `market-decay-boundaries`, `market-large-batch-linear-storage`) are precisely the subset of annex K.1's 24 minimum fixtures that require no persistence, save, replay, P07 integration, or disclosure — every other K.1 fixture (`market-batch-manifest-corrupt`, `market-second-p07-failure`, `market-batch-save-replay`, `market-cancel-before-release`, `market-old-save`, `market-phase-catalogue-upgrade`, etc.) is correctly left for Wave 2's integration fixtures. This is a disciplined, correct scoping, not an arbitrary trim.
- The added law-level assertions (factor bounds, `f(0)=1` exactly, per-studio clamp, reasons ≤5) are appropriate supplements beyond the named fixtures.
- Hostile-fixture numbers (64 studios, 512-release batch) match annex L.3 exactly. The normal-fixture numbers (nine rivals, ~2 releases/year) sensibly use the actual current rival count (verified = 9 in `hollywoodStartingData.ts`) rather than the package's stale 16-studio research hypothetical — a defensible adaptation to current runtime reality.
- Gap: the charter's harness clause "asserts bounded active set, O(active + due) work per week and determinism across two runs" states complexity/bound properties that are not directly assertable as a unit-test statement. "Determinism across two runs" is fine (compare two runs byte-for-byte). But "O(active+due) work per week" and "bounded active set" need an operational proxy to be RED-able — e.g., a structural/step-count bound, or the two-size scaling comparison annex L.5 uses ("persisted batch identity bytes grow linearly across the 32- and 512-release fixtures," invariant 11). Annex L.5 itself explicitly warns "No acceptance threshold is invented here" — so under-specifying an exact number is fine, but under-specifying *how the property is measured at all* leaves the test-author guessing.

**Required change 3:** In charter §4, specify the operational form of the "O(active + due) work per week" and "bounded active set" assertions for the pure 6,240-week harness (e.g., a structural/step-count bound, or a two-batch-size scaling comparison per annex L.5 invariant 11) rather than an unqualified complexity claim, so RED can be authored deterministically without inventing a wall-clock threshold.

---

## Check-by-check summary

| Check | Verdict |
|---|---|
| §4.1 quote fidelity | MET WITH EVIDENCE |
| §4.3 handling — mechanics (reversible, playtest gate, stop condition) | MET WITH EVIDENCE |
| §4.3 handling — disclosure of authority chain (RECONCILIATION-02 self-label; no P15 ruling amendment) | **PARTIAL — Required change 1** |
| Wave-0 facts 1, 2, 3, 4, 5, 6 | MET WITH EVIDENCE (all six, exact line citations confirmed) |
| Wave-0 fact 7 — numeric claim | MET (independently reproduced) |
| Wave-0 fact 7 — citation | **DEVIATES — Required change 2** |
| v1 law definition vs. RECONCILIATION-02 §7.1-7.2 / annex C.1/D.3 | MET WITH EVIDENCE |
| Self-exclusion / studio's-own-release ambiguity | MET (explicit, not ambiguous) |
| Eligibility paragraph wording | minor clarity nit, not blocking |
| Wave-1/Wave-2 split lawfulness (annex J) | MET WITH EVIDENCE |
| Fixture selection vs. annex K.1 | MET WITH EVIDENCE |
| Hostile/normal fixture numbers | MET WITH EVIDENCE |
| 6,240-week harness specification | **PARTIAL — Required change 3** |
| Visual craft / screen coverage | OUT OF SCOPE (no screens in this artifact) |

---

## Required changes (exact)

1. Charter §1: disclose that RECONCILIATION-02 self-labels "RESEARCH, NOT OWNER AUTHORITY" / "NOT implementation-ready preparation," that no P15-specific amendment exists in `CODEX-P13-P15-OWNER-RULINGS.md` (unlike §2.4 for P13 and §3.4 for P14), and that RECONCILIATION-02's own §2.4 supersession table does not close the §4.3 formula line. State the stop condition as the operative safeguard, not a contingency.
2. Charter §2 fact 7: replace the "(P15 market-window analysis §3)" citation with `src/core/hollywoodStartingData.ts:11-36`, `src/core/hollywood.ts:206`, `src/core/hollywoodTick.ts:259-260`.
3. Charter §4: specify an operational/assertable form for "bounded active set" and "O(active + due) work per week" in the pure 6,240-week harness (structural bound or two-size scaling comparison), not an unqualified complexity claim.

---

## Verdict: REFINE

The reconnaissance is exceptionally well-evidenced — every Wave-0 source claim I checked landed on the exact cited line, including one very precise chronology finding (fact 2) that correctly identifies a real, non-obvious behavior dependency and correctly defers it rather than papering over it. The Wave 1 law faithfully implements RECONCILIATION-02's taper/stock/clamp specification (independently re-derived the numeric examples), the annex Wave 1/Wave 2 split is followed correctly, and the fixture list is a disciplined, correctly-scoped subset of the annex's own minimum set. None of the three required changes touches the law or the fixtures themselves — all three are textual: disclose a thinner-than-implied authority chain, fix one dangling citation, and tighten one under-specified harness assertion. This is preservable work with a real but narrow-scope gap in candor about §4.3, not a defect in the pure law being proposed.

---

## Evidence limits

- No code or test exists yet for this charter (confirmed: it precedes RED-staging in its own §5 Order); nothing was run.
- RECONCILIATION-02 and the P15 package/annex are git-history-only; I read them from the parent-supplied scratchpad byte copies (`p15-reconciliation-02.md`, `p15-package.md`, `p15-annex.md`) — I did not independently verify those scratchpad copies against `git show` myself (no git access), so their fidelity to the cited commits rests on the parent's stated byte-copy provenance.
- I did not read the "P15 market-window analysis" document because it does not appear to exist in the repository (see Required change 2); the ≈40% figure was verified instead by independent recomputation from live source.

## Paths referenced

- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1323-A-p15a1-wave0-and-wave1-charter.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/p14-preparation-8ef5246a/CODEX-P13-P15-OWNER-RULINGS.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1122-A-p15-owner-presentation-decisions.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/P15A1-RELEASE-SEAM-NOTES.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/P15A1-RELEASE-SEAM-REVIEW.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/P15A1-ORDERING-INVENTORY.md`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts` (480-720)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywoodTick.ts` (180-392)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/reception.ts` (590-780)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts` (9, 283-294)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/economy.ts` (1-80)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/forecast.ts` (440-487)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywood.ts` (204-208)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywoodStartingData.ts` (1-45)
- `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/p15-package.md`
- `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/p15-annex.md`
- `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/p15-reconciliation-02.md`
