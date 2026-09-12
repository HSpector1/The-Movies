# Source-Fidelity Verification — `phase1/code-finance.md` (Current Accepted Code 592e926: Finance, Cash, Property, Contracts)

**Verifier lens:** SOURCE FIDELITY. For each consequential claim I opened the cited file at the cited line (snapshot `scratchpad/accepted-592e926/`), or the cited authority doc line, and checked (a) does the source say that, (b) is the line right, (c) is the evidence tier right. Nothing under any git repository was touched; no branch other than the pinned snapshot was read; no player data was opened.

**Verdict: VERIFIED WITH CAVEATS.** All twelve substantive claims reproduce exactly against the code and docs. The caveats are three off-by-a-few-lines citations in docs, one scope-stretch in how a P11 handoff sentence is generalised, and one place where the code *comment* contradicts the code (the report sided with the code, correctly, but should say so).

Evidence tier note: this topic is CURRENT ACCEPTED CODE + PROJECT AUTHORITY DOC only. The report asserts no retail/original-game mechanic, so the retail vs pre-release vs community distinction does not arise for its claims; the single original-game reference it inherits (the set `annualcost` datum) is correctly flagged UNVERIFIED. I checked that datum anyway (see C12).

---

## Checks (12 claims)

### C1 — Cash is one literal `studio.cash` + a 15-kind reconciled ledger
- **Claimed:** `types.ts:291-296`, `worldgen.ts:666-671`, `tuning.ts:70`, kinds at `types.ts:352-396`, reconciliation `construction.ts:389-433`.
- **Reproduced:** `types.ts:291-296` = `Studio = { cash, standing, activeProductions, releasedFilms }`. `worldgen.ts:667` = `cash: TUNING.INITIAL_CASH`. `tuning.ts:70` = `INITIAL_CASH: 20_000_000`. Kinds: `LedgerKindV10` lists 9 (`production…publicity`), then `constructionCapex`, `facilityOpex`, `facilityDemolitionRefund`, `setCapex`, `setMaintenance`, `setDemolitionRefund` = **15** (`types.ts:352-396`). `construction.ts:395-433` walks the ledger from `TUNING.INITIAL_CASH` or `checkpoint.cash`/`ledgerLength` and asserts `state.studio.cash === ledgerCash` with the two quoted invariant messages.
- **Result: CONFIRMED.** Lines exact. Tier: code, HIGH — correct.

### C2 — `canAfford` gates only voluntary commitments; nothing happens at cash < 0; save accepts any finite number
- **Claimed:** `employment.ts:71-85`; gates at `actions.ts:572-581`, `2629`, `2674`, `2790`, `placement.ts:636`, `sets.ts:467`, `536`; only sign checks `hollywood.ts:188`, `financeReport.ts:274-275`; `save.ts:2242`, `1094-1099`.
- **Reproduced:** `employment.ts:79-85` returns `{ok:true}` iff `cash − amount ≥ 0`, with the exact reason sentence quoted in the report. `actions.ts:574`, `2629`, `2674`, `2790` each call `canAfford` and throw with "(D-12 solvency gate)". `placement.ts:636` = `if (chargedCost > 0 && !canAfford(state, chargedCost).ok) found.add('insufficientFunds')`. `sets.ts:466-468` and `:535-537` return `insufficientFunds`. Independent grep `cash\s*<=?\s*0|cash\s*>=?\s*0|\.cash\s*<` over `src/core` (non-test) hits exactly: `hollywood.ts:188` (`if (account.cash < 0) throw`), `financeReport.ts:275` (`view.cash <= 0 ? 'inRed'`), `hollywoodTick.ts:176` (`cash < operatingReserve` — a reserve gate, not a sign check; the report covers it under §5), and two recap timeline comparisons (`studioRunRecap.ts:1028, 1034`, cash-vs-cash, not sign checks). `save.ts:2242` = `v8Number(studio.cash, "state.studio.cash")`; `save.ts:1094-1099` requires only `Number.isFinite`.
- **Result: CONFIRMED.** Lines exact. The "only sign checks" statement holds for `< 0 / <= 0` tests specifically.

### C3 — Payroll/overhead/Opex debited unconditionally each tick; `releaseTalent` ungated by design; expiry has no cash effect
- **Claimed:** `tick.ts:912-953`, `actions.ts:2693-2723`, `docs/D-12-economy-contract.md:161-163`, D-16 R3 (`D-16-OWNER-RULINGS.md:45`), `tick.ts:955-968`.
- **Reproduced:** `tick.ts:916-921` payroll (`if (state.founding === null)` only), `:927-932` overhead `OVERHEAD_BASE + OVERHEAD_PER_EMPLOYEE * contracts.length` (`tuning.ts:419-420` = 15_000 / 1_500), `:943-953` `facilityOpex` — none consults cash sign. `applyReleaseTalent` (`actions.ts:2695-2723`) has no `canAfford` call; debits `terminationCost`. `D-12-economy-contract.md:161` says gating it would trap a studio "with no loans and no bankruptcy to resolve the deadlock" and `releaseTalent` "may intentionally drive current cash below zero". `D-16-OWNER-RULINGS.md:45` = "R3 — KEEP UNGATED." `tick.ts:955-959` comment "No cash effect."
- **Result: CONFIRMED.** Lines exact.

### C4 — Only inflows: weekly Studio Revenue (share 0.52), legacy lump, demolition refund 0.5×today's capex, strike refund 0.35×capex; refunds not cash-gated
- **Claimed:** `tick.ts:743-753`, `tuning.ts:413`, `tick.ts:630-637`, `placement.ts:1025-1027`, `tuning.ts:1613`, `sets.ts:151-154, 600-627`, `tuning.ts:816`.
- **Reproduced:** `tick.ts:744-750` `rev = wg * run.studioShare; cash += rev` per active run when `engaged`. `tuning.ts:413` `STUDIO_RENTAL_BLENDED: 0.52`. `tick.ts:630-637` `cash += filmResult.boxOffice.total` on the legacy branch. `placement.ts:1026-1028` `facilityDemolitionRefund(blueprint) = Math.round(blueprint.capex * FACILITY_DEMOLITION_REFUND_FRACTION)`; `tuning.ts:1613` `= 0.5`. `sets.ts:152-154` `setDemolitionRefund = Math.round(blueprint.capex * TUNING.SET_DEMOLITION_REFUND_FRACTION)`; `tuning.ts:816` `0.35`. `strikeSet` (`sets.ts:601-627`) credits cash unconditionally after `strikeSetRefusal` (which has no funds check).
- **Result: CONFIRMED.** Lines exact.

### C5 — No persisted purchase price/value on `PlacedFacility`/`StudioSet`; only the `constructionCapex` ledger row; refund flat, "age curve … future tuning"
- **Claimed:** `types.ts:1042-1058`, `1336-1356`, `placement.ts:729-735`, `:1719`, `tuning.ts:1599-1613`, `economyView.ts:455-499`.
- **Reproduced:** `PlacedFacility` (`types.ts:1044-1058`) fields: id, blueprintId, parcelId, origin, cells, facilityId, projectId ("The `constructionCapex` ledger correlation id"), status, placedWeek, completesWeek — no money field. `StudioSet` (`types.ts:1338-1356`) — no money field. `placement.ts:729-735` writes the `constructionCapex` row with `constructionProjectId: projectId`. `placement.ts:1719` invariant `entry.amount === -blueprint.capex`. `tuning.ts:1600-1612` comment: "Deliberately FLAT in V1. An age curve … is future tuning, not law". `economyView.ts` `construction` bucket comment: "NET capital spend — what the studio actually sank into buildings it still has".
- **Result: CONFIRMED.** Lines exact.

### C6 — Land owned free (`ownedFromStart: true`), founding structures cost nothing / never demolished, `SET_WEEKLY_MAINTENANCE_COST` is a named zero charged nowhere
- **Claimed:** `types.ts:864-872`, `lot.ts:71-74`, `types.ts:1005-1009`, `placement.ts:375-386, 923-925`, `tuning.ts:754`.
- **Reproduced:** `types.ts:864-872` `ownedFromStart: true` with comment "There is no land market this milestone". `lot.ts:60` roads "never ownable land"; `:71-74` "Ten parcels, all owned from the first week". `types.ts:1005-1009` founding bodies "are not builds, have no blueprint, and cost nothing to keep". `placement.ts:923-925` "Founding STRUCTURES … own no placement record, so no placementId can name one". `weeklyPlacementOperatingCost` (`placement.ts:375-386`) iterates only `placement.facilities`. `grep -rn SET_WEEKLY_MAINTENANCE_COST src bridge ui` → **one hit, `tuning.ts:754`** (the declaration); the `setMaintenance` ledger kind is produced only by the repair action (`sets.ts:571`).
- **Result: CONFIRMED — with a note the report should carry.** The tuning comment at `tuning.ts:746-753` asserts the constant is "charged through the ordinary weekly path, and invariant-checked, exactly as FACILITY_MOVE_COST is". That comment is **false at 592e926**: no tick, sets, or placement path references the constant. The report's statement (no code path charges it) is the correct reading of the code, but it should explicitly flag that the source comment contradicts it, since a later reader quoting the comment would reach the opposite conclusion.

### C7 — Only binding future obligation is guaranteed salary; `guaranteedPayrollRemaining` "not subtracted from Cash"; termination = 50 %; `Contract` has six fields
- **Claimed:** `employment.ts:172-175`, `bridge/finance.ts:80-81`, `tuning.ts:391`, `types.ts:336-343`.
- **Reproduced:** `employment.ts:172-175` `guaranteedComp = weeklySalary(annualSalary) × max(0, endWeekExclusive − week)`; `:178-180` `terminationCost = iround(HIRING_TERMINATION_FRACTION × guaranteedComp)`. `bridge/finance.ts:80-81` `guaranteedPayrollRemaining: employees.reduce(...)` and `obligationsBasis:'… are not subtracted from Cash. …'`. `tuning.ts:391` `HIRING_TERMINATION_FRACTION: 0.5`. `types.ts:338-343` `Contract` = talentId, annualSalary, signingBonus, startWeek, endWeekExclusive, termWeeks (six).
- **Result: CONFIRMED.** Lines exact.

### C8 — Production/marketing prepaid at greenlight; queue holds no cash; release commitment moves no cash
- **Claimed:** `actions.ts:572-581`, `D-12 §24 :243`, `productionQueue.ts:12-15`, `releaseAuthority.ts:5-10`.
- **Reproduced:** `actions.ts:578` `cash = state.studio.cash - productionCost - freelancerFees` at greenlight; `D-12-economy-contract.md:243` lists "per-tick production spend" among deferred non-goals. `productionQueue.ts:12-14` "NOTHING IS HELD WHILE QUEUED … no cash". `releaseAuthority.ts:8` "committing advances no time, consumes no RNG, moves no cash".
- **Result: CONFIRMED.** Lines exact.

### C9 — Runway/obligation selectors: `runwayOf` is the one rule; `weeklyBurn` includes Opex; preview floors at 0; `offerObligation`; `financeUpcoming` has no receipts; `financeUpcoming` :15 quote; Σ guaranteedComp at `finance-consequence.ts:10`
- **Reproduced:** `economyView.ts:124-129` `runwayOf` = "THE ONE runway rule"; `:69-72` `weeklyBurn = weeklyPayroll + weeklyOverhead + weeklyFacilityOperatingCost`; `:175` and `:375` `runwayOf(Math.max(0, cashAfter), …)`; `:307-327` `OfferObligation {weeklySalary, guaranteedComp, signingBonus, total}`. `bridge/finance-upcoming.ts:15` = "/** Only already-committed dates. No future receipt schedule crosses this boundary. */". `bridge/finance-consequence.ts:10` `guarantees = s.contracts.reduce(sum + guaranteedComp(c, s.market.tick))`.
- **Result: CONFIRMED.** Lines exact. The "derivable Σ guaranteedComp" statement is correctly labelled MEDIUM (derivation).

### C10 — `RecoveryPosition` predicates, thresholds, non-TUNING constants, `:1003` verbatim sentence; sim never reads it
- **Claimed:** `studioRunRecap.ts:79-84`, `:52-76`, `:962-1006`, `:902-903`, `:1003`.
- **Reproduced:** `:79-84` the five-member union. `:52` header "documented recap conventions (not engine invariants)"; `BREAKEVEN_ABS = 25_000` (`:58`), `BREAKEVEN_FRACTION = 0.01` (`:59`), `TYPICAL_RECENT_WINDOW = 3` (`:68`), `STANDARD_NEG_MULT`/`STANDARD_DEMAND = 1.0` (`:71-72`), `HEAVY_LOSS_FRACTION = 0.25` (`:74`). `classifyRecovery` (`:962-1006`): incomplete (`:973-978`), `noNormalProduction` when `!cheapestOk` (`:986-990`), `healthy` when `standardOk && typicalOk && waitingHelps` (`:991-994`), `severe = !standardOk && !hasActiveRevenue && !waitingHelps && runwayWeeks != null` else `constrained` (`:1005-1006`). `:1003` contains verbatim "No recovery mechanic (loans/financing) exists in the current rules." `RecoveryPosition` consumers outside the recap: `src/core/index.ts:995` (re-export) and `ui/src/engine/adapter.ts:7957` (display).
- **Result: CONFIRMED.** One line slip: the report cites `:902-903` for `contractsOutliveRunway`; the predicate is computed at `:908` (`:902-903` is `typicalRecent`). Cosmetic.

### C11 — D-16 harness `insolvent` rung is analysis-only, never imported by core/ui
- **Claimed:** `src/harness/d16/states.ts:1-13, 96-103`.
- **Reproduced:** `states.ts:2` "ANALYSIS ONLY. Never imported by src/core/** or ui/src/**." `:9-13` the ladder; `:98` `if (cash < 0) label = 'insolvent'`. Independent grep for `import … harness` in `src/core` and `ui/src/engine` (non-test): **no hits**. Grep `insolven|bankrupt|foreclos` in `src/core` (non-test): **no hits**.
- **Result: CONFIRMED.** Lines exact.

### C12 — Owner rulings reject loans/bailouts/bankruptcy at every point (D-12.11/12, D-16 R9/R10, lab §14, D-17B, publicity comment); loans were considered (A13/A14) then deferred; P11 register rows
- **Claimed:** `D-12-economy-contract.md:157, 169, 21, 243`; `D-16-OWNER-RULINGS.md:51, 52`; `D-16-ECONOMY-RECOVERY-DECISION-LAB.md:98, 145, 172-173, 189-196`; `D-17B-OWNER-RULINGS.md:87-99 / :93`; `actions.ts:2735-2740`; register `:135-144`; `P15-PACKAGE.md:349` (seam files); roadmap `:165-167, 699-702`.
- **Reproduced:** `D-12 :157` ends "**No loans / emergency financing.**"; `:169` "no forced bankruptcy or game-over … do not introduce premature money sinks (acquisitions/facilities/financing/debt/taxes/awards)"; `:21` and `:243` list loans/debt/investors/taxes as non-goals. `D-16 rulings :51` R9 "useful but not sufficient in distress"; `:52` R10 "KEEP THE STUDIO, LOSE CONTROL … No D-17 implementation of loans, credit lines, co-financing, distribution advances, … bailouts, … hard bankruptcy, or a forced restructuring ladder." Lab `:145` "one financing mechanic at most — Co-Financed Picture or Distribution Advance (blueprints in A13)"; `:172-173` A14 ladder incl. "The Backer"; `:189-196` §14 "No loans / no credit line now … ~$394K — a correct and useless answer", "No hard game-over / bankruptcy / receivership". `D-17B :93` "do not introduce financing, loans, bailouts, restructuring or the failure ladder." `actions.ts:2738-2740` "ONE lever rather than a guaranteed rescue (§8). It is NOT a bailout". Register rows `:135` REQ-036 CONDITIONAL "no TS thresholds", `:140` REQ-041 OWNER-BLOCKED/DEFERRED, `:141` REQ-042 OWNER-BLOCKED "P15 corporate fate / future finance law", `:144` REQ-045 ACTIVE SAFEGUARD; grep `net worth|valuation|book value|depreciat|land value` in the register → no hits. Roadmap `:165-167` and `:699-702` as quoted; rulings §5 at `:147-151` parks "valuation".
- **Result: CONFIRMED — with two citation slips.** (i) The 99.69 % self-transition sentence is at lab **line 100**, not `:98` (`:98` is the "### Failure states (A7)" heading). (ii) The seam-file names (`ledger.ts`, `theatrical.ts`, `events.ts`) are at **`P15-PACKAGE.md:352, 356, 358`**, not `:349` (`:349` is the "singleton studio and cash" row, which the report cites correctly for its second correction). Annex `:610` is correct (`:607` also names `theatrical.ts`). All eight named seam files confirmed absent by `find` over `src`, `bridge`, `ui`.

### C13 — Rival finance: types, single mutator, entry debits, unconditional weekly debits, no termination, reserve gating, finite-only validation, no closure token, R05 :118
- **Claimed:** `hollywoodTypes.ts:47-61`; `hollywood.ts:31-41, 151-188`; `hollywoodStartingData.ts:11-36`; `hollywoodTick.ts:267, 279-282, 295-306, 51-53, 98, 126, 156, 176, 196-200`; `hollywoodPolicy.ts:50`; `hollywoodValidation.ts:24-26, 212`; R05 `:118`.
- **Reproduced:** `hollywoodTypes.ts:47-48` nine `RivalMoneyKind`s; `:56-61` `RivalAccount {openingBalance, openingBasis:'before-capacity-and-signing', cash, periods}`. `hollywood.ts:31-41` `moveRivalMoney` throws only on non-finite, `account.cash += amount`, no sign test. `:151-152` `cash: template.capital`; `:159-161` `'capacity'` debit of four capex constants; `:181` `'signing'` per role; `:188` the only `< 0` assertion. Starting capital: 20M (Silver Current) … 38M (Bright Meridian); `reserveWeeks` values 12, 13, 15, 16, 18, 20. `hollywoodTick.ts:267` studioRevenue credit; `:279-281` payroll/overhead/facilityOpex via `moveRivalMoney` with no cash test; `:296-304` expiry marks `endedWeek` and appends a receipt, no money. Gates: `:51-53` `operatingReserve = rivalWeeklyOperatingCost × reserveWeeks`; `:98` and `:126` `cash − signingBonus < reserveAfterOffer → continue`; `:156` `cashAvailable: cash − operatingReserve`; `:176` `cash < operatingReserve → return`; `:197-200` `reserve = weeklyCost × max(reserveWeeks, draftWeeks + PRODUCTION_TICKS + 1)`; `hollywoodPolicy.ts:50` `if (negative+marketing > options.cashAvailable) continue`. `hollywoodValidation.ts:24-26` `number()` = finite within bounds; `:212` `number(b.account.openingBalance,0); number(b.account.cash)` (no lower bound on cash); `:221-226` period reconciliation. Grep `closed|dormant|bankrupt|insolv` in `hollywood*.ts` → no hits. `terminationCost` is imported by `hollywoodValidation.ts:5` only to cross-check the **player's** `termination` ledger row (`:395`) — not a rival cost. R05 `:118` sentence reproduced verbatim.
- **Result: CONFIRMED.** Lines exact.

### C14 — Founding recruitment fund lapses at `foundStudio`
- **Claimed:** `tuning.ts:371`, `types.ts:467-472`, `actions.ts:2580, 2606-2614, 1291-1312` (MEDIUM).
- **Reproduced:** `HIRING_FOUNDING_BUDGET: 6_000_000 // recruitment fund (signing-bonus pool; NOT cash)`; founding signing draws `founding.spentBonus` (`actions.ts:2606-2614`); `applyFoundStudio` returns `{ ...state, founding: null, studioHistory }` with no cash write (`:1291-1313`).
- **Result: CONFIRMED.** The report's MEDIUM (argument from absence) is the right tier.

### C15 — "never reconstruct a purchase from today's blueprint price" as a law binding future book-value readers
- **Claimed:** `docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md:37`.
- **Reproduced:** line 37 ends "`historyEventId` is nullable when an exact retained join cannot be established; never reconstruct a purchase from today's blueprint price or a title." The sentence exists at the cited line.
- **Result: CONFIRMED text; SCOPE OVERSTATED.** In context the sentence governs the P11 finance **History / capital-contributor rows** (join to `historyEventId`), i.e., a read-model rule for one display. The report promotes it to a general "P11 handoff law" that "any future book-value reader must" obey. That is a reasonable design inference but not what the line establishes; it should be tiered MEDIUM (inference) rather than HIGH, and the report's own observation that the live demolition refund is computed from today's blueprint (`placement.ts:1026`) shows the rule is not applied engine-wide.

---

## Additional observations (not fidelity faults of the report)

1. **Original-game datum behind the named zero.** The report left `tuning.ts:746-753`'s claim (set `annualcost`/`dailyrate` = 0, "TECH-SCHEMA-001") UNVERIFIED. I checked `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/schema_fields.csv:2` (TECH-SCHEMA-001: `purchasecost=44444, annualcost=0, dailyrate=0`) and the register §7 (`THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md:46-48`): the source is `employeemod.zip`'s `global.ini` / `facility_*.ini` — a **community mod package**, so this is TECHNICAL-ARTIFACT / COMMUNITY tier, not retail-official. Note also register line 49: the same schema carries `availableindebt=1` on core facilities, "a legible design signal that a minimum viable studio remains buildable even in debt" — i.e. the original's data schema implies a debt state existed. Relevant to P15's distress design, outside this report's code-only scope.
2. **Stale code comment.** `tuning.ts:750-753` says `SET_WEEKLY_MAINTENANCE_COST` is "charged through the ordinary weekly path"; nothing references it. The report's code reading is right; a one-line flag would prevent future misquotation.

---

## Citation error table

| # | Report says | Actual | Severity |
|---|---|---|---|
| 1 | D-16 lab `:98` for "99.69 %" | `:100` | cosmetic |
| 2 | `P15-PACKAGE.md:349` names `ledger.ts`/`theatrical.ts`/`events.ts` | `:352, :356, :358` (`:349` = singleton studio row) | cosmetic |
| 3 | `studioRunRecap.ts:902-903` for `contractsOutliveRunway` | `:908` | cosmetic |
| 4 | Handoff `:37` generalised as binding law for all book-value readers, HIGH | sentence is scoped to History/capital-contributor rows; should be MEDIUM inference | tiering |

No claim was refuted. No line-level code citation was wrong.
