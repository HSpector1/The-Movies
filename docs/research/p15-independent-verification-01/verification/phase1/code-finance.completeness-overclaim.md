# Verification memo — `phase1/code-finance.md` (lens: COMPLETENESS & OVERCLAIM)

**Verifier scope:** adversarial re-read of the report against the accepted-code snapshot `592e926` (`scratchpad/accepted-592e926/`), the authority copies in `scratchpad/authority/`, and the original-game technical-artifact register on the Desktop. Read-only throughout; nothing under any git repository was opened; no player profile/campaign data was touched; no branch other than the pinned snapshot was inspected. Paths below are relative to the snapshot root unless prefixed.

**Verdict: VERIFIED WITH CAVEATS.** Every load-bearing claim I spot-checked (18 of them, listed in §1) reproduces at the cited line. The caveats are (a) four places where the report's wording asserts more than its own evidence — most seriously the sentence "Below zero nothing is locked, nothing is refused", and the claim that its persisted-money-field list is "complete"; (b) five prompt items answered thinly or not at all (Film Contribution, provenance/`FinanceTimeClass`, `forecast.ts`, `facilityEffects.ts`, and the second `P11-TO-P12-*` document); and (c) two citation slips. None of the caveats reverses a conclusion; a P15 designer relying on the report's headline would not be misled, but the "every write site" / "complete list" language should be softened.

---

## 1. Spot-checks performed (claim → what I read → result)

| # | Report claim | Where I looked | Result |
|---|---|---|---|
| 1 | `Studio = {cash, standing, activeProductions, releasedFilms}`; `INITIAL_CASH 20_000_000`; worldgen seeds it | `src/core/types.ts:291-296`, `tuning.ts:70`, `worldgen.ts:666-671` | CONFIRMED verbatim |
| 2 | `canAfford` = `cash − amount ≥ 0`, reason text about payroll/overhead running negative | `src/core/employment.ts:71-85` | CONFIRMED verbatim |
| 3 | Payroll/overhead/facility-Opex debited at tick steps 7/7.5/7.6 with no sign check; expiry "No cash effect" | `src/core/tick.ts:912-968` | CONFIRMED; note payroll is gated on `founding === null` only, overhead/Opex on `engaged && founding === null` (see §2.2) |
| 4 | Only sign checks in core = `hollywood.ts:188` and `financeReport.ts:274-275` | own grep `cash\s*(<|<=|>=|>)` across `src/core` | CONFIRMED for *sign* checks. Other cash comparisons exist but are not sign checks: `sets.ts:443, 525` (`cash >= cost` affordability predicates, equivalent to `canAfford`), `hollywoodTick.ts:176` (`cash < operatingReserve`), `studioRunRecap.ts:1025-1034` (timeline analysis) |
| 5 | Save validation only requires a finite number | `src/core/save.ts:1094-1099, 2242` | CONFIRMED |
| 6 | Every cash inflow = run revenue, legacy lump, demolition refund, strike refund | own grep of every `cash +`/`cash: … +` write in `src/core` | CONFIRMED: `tick.ts:630, 749`, `placement.ts:1087`, `sets.ts:615` are the only credits |
| 7 | `guaranteedComp = weeklySalary × remainingWeeks`; termination 0.5 | `employment.ts:172-180`, `tuning.ts:391` | CONFIRMED |
| 8 | `Contract` has exactly six fields | `types.ts:336-343` | CONFIRMED |
| 9 | 15 ledger kinds | `types.ts:352-396` (distinct union members counted) | CONFIRMED (15) |
| 10 | `RecoveryPosition` predicates, constants, verbatim "No recovery mechanic (loans/financing)…" | `studioRunRecap.ts:52-84, 962-1006` | CONFIRMED verbatim, including `severe` predicate at `:1005` |
| 11 | D-16 harness ladder "ANALYSIS ONLY. Never imported by src/core/** or ui/src/**" | `src/harness/d16/states.ts:1-13, 96-103` | CONFIRMED |
| 12 | D-12.11 / amendment / D-12.12 / §24 | `docs/D-12-economy-contract.md:157-169, 21, 243` | CONFIRMED |
| 13 | D-16 R3/R9/R10; lab §9 99.69 %, §11 Tier-3, §14 "$394K" | `docs/D-16-OWNER-RULINGS.md:45, 51, 52`; `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md:98, 145, 172-173, 189-196` | CONFIRMED |
| 14 | D-17B "do not introduce financing, loans, bailouts, restructuring or the failure ladder" | `docs/D-17B-OWNER-RULINGS.md:93` | CONFIRMED verbatim |
| 15 | P11 register rows REQ-003…045 and their states; no row mentions net worth/valuation/book value/depreciation/land value | `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md:102-144`; own grep (0 hits) | CONFIRMED |
| 16 | Rival types, `moveRivalMoney` no sign check, entry endowment assert, weekly unconditional debits, reserve gates, validation accepts any finite cash, no closure token | `hollywoodTypes.ts:47-61`; `hollywood.ts:31-41, 151-188`; `hollywoodTick.ts:51-53, 98, 126, 156, 176, 196-200, 267, 279-282, 295-306`; `hollywoodPolicy.ts:50`; `hollywoodValidation.ts:24-26, 212-226`; own grep for `closed|dormant|bankrupt|insolv|failed|defunct` in `hollywood*.ts` (0 hits) | CONFIRMED |
| 17 | Demolition refund from *today's* blueprint, flat 0.5; strike 0.35; `SET_WEEKLY_MAINTENANCE_COST` unreferenced outside tuning | `placement.ts:1025-1027, 1719-1745`; `tuning.ts:1599-1613, 754, 816`; `sets.ts:151-154, 600-627`; own grep | CONFIRMED. Bonus: the tuning comment at `tuning.ts:749-753` claims the zero is "charged through the ordinary weekly path, and invariant-checked" — that is NOT true at 592e926 (no reference anywhere); the report's conclusion is right and it could have flagged the stale comment |
| 18 | Seam files `ledger.ts`/`theatrical.ts`/`events.ts` named by package/annex do not exist | `ls src/core`; `authority/P15-PACKAGE.md:352, 356, 358`; `P15-BUILDER-ANNEX.md:607, 610` | CONFIRMED — the package does name them and none exists |

Additional confirmations: `foundStudio` returns `{...state, founding: null, studioHistory}` with no cash write (`actions.ts:1291-1312`); `releaseTalent` has no `canAfford` (`actions.ts:2694-2723`); `financeUpcoming` line 15 verbatim; `bridge/finance.ts:80-81` `guaranteedPayrollRemaining` + `obligationsBasis`; `bridge/finance-consequence.ts:10` sums `guaranteedComp`; `commitmentPreview` floors post-commitment cash at 0 (`economyView.ts:176`); the ledger reconciliation invariant is a runtime assertion (reached from `tick.ts:208` and `actions.ts:1325/1411/1496` via `assertStudioPlacementInvariants` → `assertStudioConstructionInvariants`, and from `save.ts:3784`), so "asserted, throws otherwise" is accurate.

---

## 2. Where the report asserts more than its evidence supports (OVERCLAIM)

### 2.1 "Below zero nothing is locked, nothing is refused, no state changes" (§1.3, third bullet) — WORDING OVERCLAIM
The report's own §1.3 first bullet and the D-16 lab it cites (`docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md:98`: "`canAfford` refuses every voluntary action at cash<0") establish the opposite: at negative cash **every** positive voluntary commitment is refused, because `after = cash − amount < 0` for any `amount > 0` (`employment.ts:79-81`). D-12.12 says the same: negative cash "simply blocks new voluntary spending" (`docs/D-12-economy-contract.md:169`). What the report means — and what its structured summary correctly says with the word "else" — is that no *additional* consequence fires. The sentence as written is false. **Corrected statement:** "At cash < 0 every voluntary immediate commitment with a positive cost is refused by `canAfford` (greenlight, signing/renewal, publicity, placement, set commission/repair); zero-cost mutations still pass (`placement.ts:636` guards `chargedCost > 0`); nothing else changes — no lock, event, flag, or state transition."

### 2.2 "debited unconditionally every tick" (summary bullet 3; §1.2 "No") — MINOR OVERCLAIM
`tick.ts:917` gates payroll on `state.founding === null`; `tick.ts:927, 941` gate overhead and facility Opex on `engaged && state.founding === null`. "Unconditionally" is true only with respect to the cash sign. The §1.2 table row for overhead does say "(engaged + founded)", so this is a summary-compression slip, not an evidence error. **Corrected statement:** "debited every tick regardless of the cash balance, once the studio is founded (payroll) and the economy is engaged (overhead, Opex)."

### 2.3 "How cash changes (every write site)" (§1.2 heading) and "gated Yes" for greenlight — INCOMPLETE ENUMERATION
The table omits the second greenlight branch at `actions.ts:584-597`: when `economyEngaged(state)` is false (the D-1 / headless-corpus regime), greenlight debits `productionCost + Σ per-film salaries` with **no** `canAfford` call (the gate at `:572` sits inside `if (economyEngaged(state))` at `:522`). Every "gated by `canAfford`" claim in the report is therefore engaged-regime-only. This does not affect a native player campaign (engagement is a persisted, monotonic fact set at first signing, `actions.ts:2617-2618`; `employment.ts:66-67`), so the practical conclusion stands — but a table headed "every write site" should list it, and a future P15 reader touching the non-engaged path needs to know the gate is regime-conditional.

### 2.4 "Persisted money-bearing asset/liability fields (complete list)" (§2.6) and "No facility, set, or property record carries a persisted purchase price" (summary bullet 5) — OVERCLAIM
Three persisted money-bearing fields are missing from a table the report labels complete:
- `Production.forecastSnapshot: Forecast` (`types.ts:237`) carrying `expectedOpening` / `expectedTotal` in gross dollars (`types.ts:1912-1917`), and the frozen `FilmResult.forecast?` (`types.ts:263`). These are the only forward-looking *receipt estimates* persisted for a film in flight — exactly the kind of number a valuation reader would be tempted to use, and `forecast.ts` was named in the prompt.
- `Talent.salary: number` (`types.ts:115`, "per production; now from salaryCurve"), which the legacy D-1 greenlight branch debits (`actions.ts:586-589`).
- `ConstructionProject.capex: 780000` (`types.ts:813-823`; canonical `ANNEX_CAPEX` invariant at `construction.ts:231, 245`) on `state.construction.projects[]` — a persisted purchase price on a facility record. The report itself notes the literal in §2.3, so summary bullet 5 and the §6 row "Book value / persisted purchase price per asset — ABSENT" are contradicted by the report's own body for the V11 Annex. **Corrected statement:** "No *placed facility* or *set* record carries a persisted price; the sole record-level purchase price is the V11 legacy Annex `ConstructionProject.capex` literal, which is excluded from move/demolish until the C2 Flip."
Also absent: `TheatricalRun.cumulativeGrossPaid` (report lists `cumulativeStudioRevenuePaid` only) and the rival `RivalMoneyKind 'development'`, which is declared and validated (`hollywoodTypes.ts:48`; `hollywoodValidation.ts:242`) but **never moved** by any code path (own grep: no `moveRivalMoney(…,'development',…)`) — a rival-side "named zero" analogous to `SET_WEEKLY_MAINTENANCE_COST` that the report should have listed beside it.

### 2.5 "`financeUpcoming` lists only dated known commitments" (summary bullet 9) — SLIGHT UNDERSTATEMENT
True for the dated rows, but the same producer also publishes the aggregates `nextAdvanceStudioRevenue` and `remainingStudioRevenue: pipelineRunRevenue(state)` (`bridge/finance-upcoming.ts:52-53`; register REQ-029 l.128 "aggregate next-week and remaining projected Studio Revenue"). The report's headline item 2 does credit `pipelineRunRevenue`, so this is a bullet-level imprecision only.

### 2.6 Citation slips
- §7 last bullet cites "`P15-PACKAGE.md:167` (roadmap)" for "P15B cannot infer debt, valuation, insolvency…". The sentence is at `authority/P13-P15-LONG-RANGE-ROADMAP.md:167`; `P15-PACKAGE.md:167` is an unrelated bullet. The parenthetical "(roadmap)" shows the author knew; the path is wrong.
- §4.2 attributes the "ONE lever rather than a guaranteed rescue … NOT a bailout" language to the code comment `actions.ts:2735-2740` "citing §8". The primary Owner-language source is `docs/D-17B-OWNER-AUTHORIZATION.md:58-61` (§8: "A distressed studio should be able to use publicity as ONE recovery lever, not a guaranteed rescue"). The prompt asked what the *Owner* ruled; the report should cite the ruling document, not only the comment that paraphrases it. (The "NOT a bailout" sentence is the engineer's comment, not Owner text — the report presents it as a D-17B row without making that distinction.)

### 2.7 Original-game citation left unverified when it was verifiable
The report flags the `SET_WEEKLY_MAINTENANCE_COST` comment's original-game claim (`[finance] annualcost`/`dailyrate` = 0, TECH-SCHEMA-001) as UNVERIFIED. It is checkable locally: `~/Desktop/big swing art/THE-MOVIES-2005-TECHNICAL-ARTIFACTS/schema_fields.csv:2` (`TECH-SCHEMA-001`, example "purchasecost=44444, annualcost=0, dailyrate=0", "annualcost/dailyrate are 0 in every example found this pass", confidence VERY HIGH) and the register at `THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md:46-48`. Evidence class: **TECHNICAL ARTIFACT recovered from community mod packages (`employeemod.zip` .ini files)** — it establishes the schema and the observed zero values, not a retail-manual mechanic; the tuning comment's "0 IN EVERY EXAMPLE RECOVERED" matches the register's wording. Confidence MEDIUM that retail sets had no recurring cash upkeep; HIGH that the code comment faithfully cites the register.

---

## 3. What the prompt asked that the report did not answer, or answered thinly (COMPLETENESS)

| Prompt item | Report coverage | Gap |
|---|---|---|
| P11 finance semantics: "Studio Revenue, **Contribution**, obligations, affordability, **provenance**" | Studio Revenue, obligations, affordability: thorough. Contribution: only the recap's `FilmContributionClass` constants. Provenance: only the migration checkpoint | **Contribution is never defined.** P11 law: `contribution` = full-run Studio Revenue − recorded direct commitment, *excluding* studio operating costs (`docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md:39-40`; register REQ-005 l.104 "Film Contribution is distinct from Net Profit", REQ-017 l.116). **Provenance is never named:** the four-class `FinanceTimeClass` (`recordedCash` / `currentRecurringCost` / `knownCommitment` / `currentPaceEstimate`, "Do not substitute one for another", handoff l.36; consumer contract l.153) is the P11 rule a net-worth reader would most need — it forbids mixing a recorded balance with a pace estimate — and the report's §3.2 mentions `timeClass` values only in passing |
| "`P11-TO-P12-*`" (glob) | Only `P11-TO-P12-PRODUCER-HANDOFF.md` cited | `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` is uncited. It carries the strongest single statements for this topic: §6.1 minimum handoff list (l.130-147); "**AUD-008 REPAIRED at accepted TS.** `economyView.ts:weeklyBurn` includes `weeklyFacilityOperatingCost`" (l.146 — the authoritative support for the report's §7 "QUALIFIED" of roadmap §5.3); item 12 "no invisible cash reset, rescue top-up, free staffing, free capacity, or result-driven balancing entry" (l.174); "P12A does not implement closure or recovery. It preserves the causal financial state and receipts that later P15B behavior may assess" (l.176); and the visibility table rows "Exact rival cash and reserve target — HIDDEN" (l.188) and "Distress/recovery/closure cause — NOT YET AUTHORIZED until P15B" (l.195) |
| "`P11A-*`" (glob) | Only the register cited | `P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md:134` lists "loans, investors, taxes, interest, equity, debt or credit score; bankruptcy, bailout or mandatory failure ending" as P11 non-goals, and `P11A-READINESS-AND-DEPENDENCY-GATE.md:182` repeats it; `P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md:129` classifies cash as "obligations, reserves, net worth" NOT-INCLUDED. These corroborate; omitting them weakens the "what P11 actually shipped vs planned" answer |
| `forecast.ts` (item 3) | Not mentioned | See §2.4 — the persisted `forecastSnapshot` is a money-bearing estimate. The prompt also asked whether it holds any binding obligation; the honest answer ("no — an estimate computed at greenlight from greenlight-available inputs, `forecast.ts:1-18`, never a commitment") should have been stated |
| `facilityEffects.ts` (item 2) | Not mentioned | Inspected: header `facilityEffects.ts:1-8` — effects read from operational placements; no money content. The report should say it was inspected and carries nothing money-bearing rather than silently skipping a named file |
| "one lever not a rescue" (item 4) | Cited from a code comment | Primary source is `docs/D-17B-OWNER-AUTHORIZATION.md:58-61` — see §2.6 |
| Open uncertainty #3 (unspent recruitment fund "no ruling found") | — | Under-researched: D-11.2 text at `docs/rev4-open-questions.md:1563-1568` states the fund is "a dedicated signing-bonus pool, separate from operating cash … cash stays at `INITIAL_CASH`", which is the design basis for the pool never joining cash; the D-16 lab measured $5,857,978 of it left unspent in a real run (`docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md:110`). "Lapse" is still not stated explicitly anywhere I read, so the uncertainty is real but narrower than the report says |

### 3.1 Skipped counter-evidence / alternative sources
- The technical-artifact register the report declined to open also records `availableindebt=1` on the original game's core-loop facilities (`THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md:47`: "a minimum viable studio remains buildable even in debt"). For a topic whose output feeds a distress/loan design, that is the one piece of original-game evidence that the 2005 retail game *did* have a debt-aware construction gate — TECHNICAL ARTIFACT / community-mod class, MEDIUM confidence, not a retail-manual mechanic. The report's scoping ("no original-game evidence is needed for this topic") is defensible, but a reader deciding whether to model debt at all would want this pointer. **No inspected source establishes** how retail debt actually behaved (interest, limits); the manual/Prima extractions were not part of this verification.
- No web research was performed by the author or by me; none is required for a code-truth topic.

---

## 4. Claims that are strong and fully supported (no action)

- Single literal `studio.cash` + 15-kind reconciled ledger; runtime invariant; finite-only save validation; arbitrary negative reachable.
- Exactly four cash-credit sites in core; no other inflow.
- `releaseTalent` intentionally ungated (code + D-12 amendment + D-16 R3).
- Prepaid production/marketing; queue holds no cash; release commitment moves no cash; `Contract` six fields; `guaranteedComp` law; `guaranteedPayrollRemaining` on the wire and "not subtracted from Cash".
- Land `ownedFromStart: true`; founding structures cost nothing and cannot be demolished; `PlacedFacility`/`StudioSet` carry no money field; flat 0.5/0.35 refunds from today's catalog; `constructionCapex` row is the only per-placement purchase record; P11 handoff "never reconstruct a purchase from today's blueprint price" (handoff l.37, verified verbatim).
- `RecoveryPosition` predicates and thresholds; display-only; harness `insolvent` isolated.
- Owner rulings chain (D-12.11/12, D-16 R9/R10, lab §14, D-17B, P11 REQ-041/042/045, P13–P15 §5 parking) — every line reproduces.
- Rival account facts, single mutator, entry-only endowment assert, unconditional weekly debits, reserve-only gating, no closure state, no termination path, R05 l.118 verbatim.
- Package corrections (§7): the named seam files do not exist; the `hollywood` root exists and is accepted; `weeklyBurn` includes Opex (independently confirmed by consumer contract l.146, which the report should cite).

---

## 5. Recommended edits (surgical)

1. §1.3 bullet 3 → replace with the corrected sentence in §2.1.
2. §1.2 → add a row for the non-engaged D-1 greenlight branch (`actions.ts:584-597`, ungated) and retitle the gating column "gated by `canAfford` (engaged regime)".
3. §2.6 → drop "complete"; add `Production.forecastSnapshot` / `FilmResult.forecast?` (ESTIMATE, not asset), `Talent.salary`, `ConstructionProject.capex` (V11 Annex only), `TheatricalRun.cumulativeGrossPaid`; add rival `'development'` as a never-moved kind in §5.
4. Summary bullet 5 / §6 row → qualify "no record carries a persisted purchase price" with the Annex exception.
5. §1.4 / §3.2 → add Contribution definition (handoff l.39-40) and `FinanceTimeClass` provenance rule (handoff l.36; consumer contract l.153); cite consumer contract l.146, l.174, l.176, l.188, l.195.
6. §4.2 → add `docs/D-17B-OWNER-AUTHORIZATION.md:58-61` as the Owner source for "one lever"; mark the "NOT a bailout" sentence as engineer commentary.
7. §7 last bullet → fix path to `P13-P15-LONG-RANGE-ROADMAP.md:167`.
8. §8 item 4 → replace with the verified TECH-SCHEMA-001 citation and evidence class from §2.7 above; optionally note `availableindebt=1`.
9. §2.4 → note that the `tuning.ts:749-753` comment claiming the set-maintenance zero is "charged through the ordinary weekly path" is stale at 592e926.
