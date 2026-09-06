# P11A Financial Truth and Code Reconnaissance


**Status:** PROVISIONAL — OBSERVED P08–P10 STACK REFRESH (REVISION 03)
**Review state:** READY FOR CURRENT OPS DOCUMENT REVIEW
**Refresh state:** PROVISIONAL OBSERVED-STACK REFRESH COMPLETE · FINAL ACCEPTED-BASE REFRESH PENDING
**Implementation:** P11 IMPLEMENTATION NOT AUTHORIZED
**Accepted P07 baseline:** TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` · Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` · 4 / 15 / V16 · schema `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`
**Observed P08–P10 WIP snapshot (this revision):** TS product `7b4d8ffebeb0b7978763780420fdc8542df68b5f` (docs tip `a2baa1d9b3ffb2666732dba55823e09cc76c7352`) × Unity `1d304f89a29ffca160129b705d7d627543adfb4d` · 4 / 19 / V18 · schema `sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9` · inspected 2026-09-06 20:16Z–20:30Z · OWNER ACCEPTANCE PENDING · UNSEALED
**Final accepted P08–P10 base:** PENDING
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Revision 02 (immutable):** `90b349a8272f17ad7ea541cdddc777d36c1d861d` · **Hub:** `P11A-READINESS-AND-DEPENDENCY-GATE.md`


## 0. Revision log

| Revision | Change |
|---|---|
| 02 | Reconciled the accepted P07 source with the original P11 findings; recorded the 2026-09-05 local recon snapshot (P08 Wave 2, P09/P10 not begun) |
| 03 | Re-traced facility Opex at the observed pair (STILL PRESENT, now on the wire and the Administration card); recorded observed P08/P09/P10 seams and new ledger kinds; added the seven-field disclosure for every proposed Finance number and the four time classes (§4.0); corrected the cancel rule and the Upcoming public-information rule (§10); listed the precise proposed W0 repairs (§3.3) without implementing them |

## 1. Purpose and evidence boundary

Read-only reconciliation of the accepted P07 source, the original P11 research, and the observed P08–P10 WIP pair. It changes no code, runs no tests, launches nothing, and certifies no unsealed implementation. Every current-state claim names its snapshot; "observed" means read in git at TS `7b4d8ff…` / Unity `1d304f8…` on 2026-09-06 unless stated otherwise.

## 2. Exact sources inspected

### Accepted product authority (unchanged from Revision 02)

`campaign/living-lot-ts@2753e18b…`; `CURRENT-BEST.md`; `docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md`; P06/P07 lessons; `src/core/types.ts`, `employment.ts`, `economyView.ts`, `fixedCostAllocation.ts`, `placement.ts`, `sets.ts`, `tick.ts`.

### P11 product/design authority

`codex/finance-executive-ux-research-11@d6c38546…` — `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md` (§§16, 23, 24, 35, 38 re-read this revision) and `…-BUILDER-ANNEX.md` (C2, C3, D5, M re-read).

### Observed producer stack (Revision 03)

- TS `wip/p08-p10-autonomous-stack-01-ts@a2baa1d9…` (product `7b4d8ff…`): `src/core/economyView.ts`, `fixedCostAllocation.ts`, `tick.ts` (7.x), `placement.ts` (`weeklyPlacementOperatingCost`, `completeDuePlacements`, `expectedWeeklyOperatingCostAt`, move/demolish/refund), `actions.ts` (`applySignContract`, `applyRenewContract`, `applyReleaseTalent`, facility-history rows), `studioHistory.ts`, `types.ts` (ledger kinds, history events, `CashLedgerCheckpoint`), `save.ts` (`validateSaveV18`, `makeSave`); `bridge/placement.ts`, `setCommission.ts`, `contract.ts`, `people.ts`, `history.ts`, `session.ts` (quote map), `server.ts` (routes), `schema/bridge-schema.ts` (`StudioTreasurySnapshot`, P07 result, placed facility, contract snapshots), `runtime-checkpoint.ts` (`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`); `generated/unity/*`; `scripts/p09-solvency-preflight.mts`; `tests/bridge-p09a-w5-bare-lot-first-film.test.ts`.
- Committed records at the same tip: `docs/campaigns/P08-P10-AUTONOMOUS-STACK-HANDOFF.md` (C0–C10), `P08-P10-CLOSE-GATES-DISPOSITIONS.md`, `P08/P09/P10-TECHNICAL-CHECKPOINT.md`, `docs/engineering/P10-INFORMATION-VISIBILITY-TABLE.md`, `P10-FUTURE-CONSUMER-CONTRACT.md`, `docs/operations/OPS-P08P10-20260905-01-*`.
- Unity `wip/p08-p10-autonomous-stack-01-client@1d304f8…`: `StudioWorkspaceHost.cs`, `StudioFoundingCardHud.cs` (Administration card), `StudioProfileWorkspace.cs`, `StudioRosterWorkspace.cs`, `StudioHistoryWorkspace.cs`, `StudioBuildWorkspace.cs`, `StudioLotGrowthPresentation.cs`, `StudioSelectionManager.cs`, `StudioLocateAction.cs`, the generated DTO.
- Preserved candidate `~/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8/`: `player/build-manifest.json`, `engine/engine.mjs` (hash recomputed), `evidence/P10-Contract-Journey/*` (report + run binding), `evidence/P10-Owner-Profile-Copy/*` (reports), `evidence/P10-Oracle-Sweep/summary.tsv`, `evidence/P10-Compat-Boundary/*` (present, not parsed); `evidence/P09-Build-Journey/` and `evidence/P10-People-Journey/` are empty. Real-input Build/People run reports were read from the active Unity worktree's `Evidence/*-CloseGates/` folders (read-only; nothing modified).

The WIP is **UNSEALED FORWARD EVIDENCE**. The Owner's durable profile was not opened.

## 3. Highest-consequence finding

### 3.1 Facility Opex projection status: **STILL PRESENT** (observed 2026-09-06 at TS `7b4d8ff…`)

`git diff --quiet 2753e18b 7b4d8ff -- src/core/economyView.ts src/core/fixedCostAllocation.ts src/core/employment.ts src/core/sets.ts` reports no change: the four files are byte-identical to the accepted P07 base. The trace:

| Layer | Observed behavior at `7b4d8ff…` | Class |
|---|---|---|
| Authoritative tick | Step 7 payroll (`weeklyPayroll`), 7.5 ordinary overhead (`OVERHEAD_BASE + OVERHEAD_PER_EMPLOYEE × contracts`), 7.6 `weeklyPlacementOperatingCost(state.placement)` for facilities **operational at the start of the advance**; each writes its own signed ledger row (`payroll`, `overhead`, `facilityOpex`) — `src/core/tick.ts` ~985–1020 | SOURCE OBSERVED |
| Construction completion / Opex onset | `commitPlacement` → `status: 'underConstruction'`; `completeDuePlacements` flips to `operational` when `completesWeek <= tick`; first Opex charge lands on the **next** advance after completion (tick comment); `expectedWeeklyOperatingCostAt(placement, ledger, week)` reconstructs the lawful charge for any week including demolished facilities | SOURCE OBSERVED |
| All-time totals / period summary | `financeTotals()` maps `facilityOpex` → overhead bucket (`economyView.ts:470`); `periodSummary()` counts it (`:545`) | SOURCE OBSERVED |
| `weeklyBurn()` | `founding !== null ? 0 : weeklyPayroll + weeklyOverhead` — facility Opex omitted (`economyView.ts:60–63`) | SOURCE OBSERVED |
| `runway()` / `runwayOf()` / `financeView()` | consume `weeklyBurn` (`:115–127`, `:618–632`) | SOURCE OBSERVED |
| `commitmentPreview()`, `prospectiveCycleFixedCost()` (non-founding branch), `postSigningRunway()` | consume `weeklyBurn` (`:159–167`, `:215–223`, `:340–366`) | SOURCE OBSERVED |
| `ledgerFixedCostByWeek()` | ledger `payroll` + `overhead` only (`fixedCostAllocation.ts:131`) — managerial allocator, out of P11A scope by design §38 | SOURCE OBSERVED |
| **Wire** | `StudioTreasurySnapshot { cash, weeklyBurn, weeklyPayroll, netWeeklyCash, runwayWeeks, runwayInfinite }` from `financeView`/`runway` (`ui/src/engine/adapter.ts:2485`, `:4445`) — inherits the omission | SOURCE OBSERVED |
| **Player surface** | Post-founding Administration card rows "Cash / Weekly payroll / Weekly burn / Net weekly / Runway" (`StudioFoundingCardHud.cs` ~1083–1093); HUD direction arrow from `netWeeklyCash` (`StudioLivingTimeHud.cs:136`) | SOURCE OBSERVED |
| Contract activation / renewal / release | `applySignContract` (bonus from the recruitment fund during founding, cash otherwise), `applyRenewContract` → `signingBonus` ledger row, `applyReleaseTalent` → `termination` ledger row (`actions.ts` ~2705–2775); payroll picks up the new/extended contract at the next tick through `weeklyPayroll` | SOURCE OBSERVED |
| Current pace / next-period / runway | all built on the incomplete `weeklyBurn` | SOURCE OBSERVED |

**Reclassification:** STILL PRESENT. Not FIXED, not PARTIALLY FIXED. Verifiable (source is public in the repository).

### 3.2 Why P09's solvency evidence stands

- `scripts/p09-solvency-preflight.mts` (§15A gate) models "capex at commit, opex from completion" explicitly and excludes `payroll/overhead/facilityOpex` from picture spend by kind — it never used `weeklyBurn`. Its VERDICT SOLVENT (modelled floor $6,713,185) is EVIDENCE REPORTED in the P09 checkpoint §5.
- `tests/bridge-p09a-w5-bare-lot-first-film.test.ts` drives the real engine over the wire, asserts `facilityOpex` among the ledger kinds seen, asserts no fixture adjustment rows, and asserts `final.studio.cash === INITIAL_CASH + Σ ledger amounts` (lines 106–110). The reported result (release week 37, floor $8,864,638, final $9,374,658) is a **complete measured cash-ledger journey**.
- Therefore the incomplete summary selector does not invalidate the solvency proof. What it does invalidate is any **displayed** "Weekly burn / Net weekly / Runway" on a lot with operational placed facilities, which the observed Administration card now shows. That is a presentation-truth limitation of the P08–P10 candidate, recorded for Current Ops in the register §4.B; it is not an escalation to the running stack and not a P09 tuning defect.

### 3.3 Precise proposed P11 W0 repairs (proposal only — not implemented, not an instruction to Fable)

1. Add one core selector `weeklyFacilityOperatingCost(state)` = `state.founding === null && engaged ? weeklyPlacementOperatingCost(state.placement) : 0`, mirroring tick 7.6's gate and timing (facilities operational at the start of the next advance).
2. Make `weeklyBurn(state)` = payroll + ordinary overhead + `weeklyFacilityOperatingCost`, preserving the founding-draft zero. This aligns the D-17A/T1 contract comment ("the ACTUAL weekly charge") with the tick; it changes no debit, timing, blueprint cost or tuning.
3. Extend `FinanceView` additively with `weeklyFacilityOperatingCost` and `weeklyOverhead` components so `weeklyOperatingCost` can publish its basis; keep `weeklyPayroll` unchanged.
4. Leave `ledgerFixedCostByWeek()` untouched in W0 (design §38 item 1; register `P11-REQ-035` CONDITIONAL).
5. Tests: selector↔tick↔ledger reconciliation on (a) endowed lot, (b) bare lot with one operational and one rising facility across the completion boundary, (c) demolition boundary via `expectedWeeklyOperatingCostAt`, (d) founding draft = 0; mutation guard that no observation touches state or RNG.
6. Wire: `StudioTreasurySnapshot.weeklyBurn` and `netWeeklyCash` become complete automatically; whether to add a named `weeklyFacilityOperatingCost` field to the treasury snapshot is a W2 additive-schema choice.

Any of the above requires its own authorized scope and independent verification; Current Ops may also choose to block the affected P11 rows instead.

## 4. Financial truth catalogue

### 4.0 Time classes and the seven-field disclosure

Every Finance number belongs to exactly one time class:

| Class | Meaning | Source law |
|---|---|---|
| **A. Recorded past cash movement** | A signed ledger row (or a checkpoint boundary) for an exact week | `GameState.ledger`, `CashLedgerCheckpoint` |
| **B. Current recurring operating cost** | The charge the **next** authoritative advance will apply given current state | tick steps 7 / 7.5 / 7.6 selectors |
| **C. Next-period effect of a current commitment** | A first charge/receipt that lands on a later, already-determined advance (facility completion, renewal end week, run remainder) | `completesWeek`, `endWeekExclusive`, run counters |
| **D. Conditional current-pacing estimate** | Arithmetic over B and the next scheduled receipt; never a guarantee | `runwayOf` after repair |

Recommended default time basis (for Current Ops adoption): B is "the debit the next advance will charge given the current tick and current state"; A is an inclusive ledger week range; C names the exact week and says "from the following advance" where the tick law charges one advance later; D is labelled "at current pace" with its basis and exclusions.

For each proposed Finance number: DEFINITION · SOURCE · TIME BASIS · INCLUDED · EXCLUSIONS · HISTORICAL COVERAGE · PUBLIC-INFORMATION BASIS.

| Number | Definition | Source (observed) | Time basis | Included | Exclusions | Historical coverage | Public-information basis |
|---|---|---|---|---|---|---|---|
| Cash | literal `state.studio.cash` | `types.ts::Studio.cash`; on the wire as `StudioTreasurySnapshot.cash` | instant | the balance | obligations, reserves, net worth | current state only | already public on the lot HUD |
| Payroll (weekly) | Σ `weeklySalary` of contracts active at the current tick | `employment.ts::weeklyPayroll`; wire `treasury.weeklyPayroll`, per-person `contract.weeklySalary` | B | contracted salaries | founding draft (not charged), freelancer fees, bonuses | ledger `payroll` rows after the recording boundary | public: person contract sheet already shows salary |
| Ordinary overhead (weekly) | `OVERHEAD_BASE + OVERHEAD_PER_EMPLOYEE × contracts` | `economyView.ts::weeklyOverhead`; tick 7.5 | B | base + per-contract | facility Opex | ledger `overhead` rows | public: component of the displayed burn |
| Facility operating cost (weekly) | Σ blueprint `weeklyOperatingCost` of facilities operational at the start of the advance | `placement.ts::weeklyPlacementOperatingCost`; tick 7.6; wire per-facility `StudioPlacedFacilitySnapshot.weeklyOperatingCost` | B (first charge the advance after completion) | operational placed facilities | rising facilities, Sets (weekly Set maintenance tuning is 0), demolished facilities | ledger `facilityOpex` rows; `expectedWeeklyOperatingCostAt` reconstructs any week | public: per-facility Opex is already on the wire and the Build catalogue |
| **Weekly operating cost** | payroll + ordinary overhead + facility operating cost | **missing** as one selector; proposed W0 `weeklyBurn` repair | B | the three recurring components | every one-time movement (capex, Set capex/repair, bonuses, termination, Greenlight, publicity) | current only; recorded periods derive from A | public: composed only of public components |
| Next scheduled Studio Revenue | receipt due on the next advance from active locked runs | `economyView.ts::expectedWeeklyRunRevenue` | C (next advance) | active runs' next-week studio share | unreleased films, averages, forecasts | active runs only | public in aggregate: `netWeeklyCash + weeklyBurn` on the wire equals it |
| Net weekly cashflow | next scheduled Studio Revenue − Weekly operating cost | `financeView.netWeeklyCash` after repair | B/C (next advance) | the two lines above | one-time movements, last week's actuals | current commitments only | public (already on the wire, understated today) |
| Runway at current pace | floor(Cash ÷ recurring deficit); positive/steady/in-red states | `economyView.ts::runwayOf` after repair | D | Cash, net weekly cashflow | any future decision, receipts beyond active runs | current only | public (already on the wire and the Administration card) |
| Last recorded period | opening Cash + Σ signed rows in range = closing Cash | `economyView.ts::periodSummary` over `ledger` | A | every retained ledger row in the inclusive range | rows before the recording boundary | from the checkpoint/ledger boundary onward | public: ledger kinds are typed, no hidden subject |
| Payroll detail | per-contract weekly salary, end week, remaining guarantee | `bridge/people.ts` `BridgePersonContractSnapshot` (`annualSalary`, `weeklySalary`, `endWeekExclusive`, `remainingWeeks`, `guaranteedRemaining`, `terminationCost`) | B + C | active contracts | hidden skills/ceilings (schema-negative tests) | current contracts | public per the P10 visibility table |
| Obligations (compact) | Σ `guaranteedRemaining` across active contracts, shown beside Cash | `employment.ts::guaranteedComp` via `people.ts` | C (through each `endWeekExclusive`) | remaining guaranteed salary | signing bonuses already paid, freelance fees, capex | current contracts | public (same field the Profile shows) |
| Studio Operations detail | ordinary overhead + per-facility Opex with exact facility links | `weeklyOverhead` + `StudioPlacedFacilitySnapshot` rows | B | operational facilities, base/per-contract overhead | payroll, capital | current | public |
| Construction capital spending | immediate build debit at commit | `placement.ts::commitPlacement`; ledger `constructionCapex`; quote `cost`, `cashBefore/After` | A on commit; preview is a pure quote | blueprint capex | Opex, refunds | ledger rows | public (quote already rendered by the Build dock) |
| Facility Opex onset (preview) | `+weeklyOperatingCost/week` from the advance after `completesOnWeek` | `bridge/placement.ts` `placementQuoteSnapshot.weeklyOperatingCost`, `buildWeeks`, `completesOnWeek` | C | the blueprint's Opex | capex, capacity value | n/a | public (already on the quote) |
| Contract action consequence | bonus now / termination now, cash after, guarantee context | `bridge/contract.ts` `contractQuoteSnapshot` (`cost`, `cashBefore/After`, `affordable`, `guaranteedRemaining`, `newEndWeekExclusive`, `consequence`) | A on commit; C for the extended term | the engine's own offer/termination law | payroll delta beyond the offer's weekly salary, morale/reputation | n/a | public (rendered verbatim on the Profile sheet) |
| Theatrical Gross (opening, full-run, paid to date) | audience spend | P07 `boxOfficeOpening`, `boxOfficeGrossTotal`, `grossPaidToDate` | A/C by run status | gross only | studio share | where a `FilmResult` exists | public under P07 |
| Studio Revenue received / scheduled / full-run | locked share credited to date / remaining / total | P07 `studioRevenuePaidToDate`, `studioRevenueTotal` (+ `projected` flag), `runStatus`, `totalWeeks`, `weeksCredited` | A (received) / C (scheduled) | the active run's locked schedule | per-week future amounts (not on the wire) | current and legacy runs with path provenance | received: public; scheduled remainder: public as `total − paidToDate` while `projected`; **per-week future amounts: not public** |
| Direct film commitment | production + marketing + correlated freelancer fees | P07 `committedCost`; ledger rows by `productionId` | A | authored budget paid at Greenlight, freelancer fees | studio payroll/overhead/facility Opex | where correlated rows exist; historic split may be unavailable | public under P07 |
| Film Contribution (projected/final) | full-run Studio Revenue − direct film commitment | P07 `contribution`, `projected`; P11 Finance restates with explicit exclusions | C while projected; A when final | the two lines above | studio-wide costs, Builder economics (`not modeled`) | per result | public under P07; P07 labels untouched |

### 4.1 Ledger kinds observed at `7b4d8ff…`

`LedgerKind` = V10 kinds (`payroll`, `overhead`, `publicity`, `production`, `studioRevenue`, `signingBonus`, `freelancerFee`, `termination`, …) + `constructionCapex` (V11) + `facilityOpex` (V12) + `facilityDemolitionRefund` (V13) + `setCapex`, `setMaintenance`, `setDemolitionRefund`. No new ledger kind was added by P08–P10; renewal reuses `signingBonus`, release reuses `termination`. `CashLedgerCheckpoint` (`types.ts:836`) is unchanged.

### 4.2–4.4 One-time movements, film facts, history facts

The Revision 02 tables remain accurate at the observed snapshot and are not repeated; the only additions are recorded in 4.1 and in §6 (history kinds). Set repair remains one-time (`setMaintenance`, `TUNING.SET_REPAIR_COST`), not recurring.

## 5. Accepted P07 wording versus original P11 terminology

Unchanged from Revision 02: preserve P07 `Profit` / `Loss` / `Break-even` and `Projected …` labels on the P07 result surface; P11 Finance uses Film Contribution with explicit scope; join films by `productionId`; title resolves from the current concept; `Not recorded` where absent; result route through `OpenReleaseResult(resultId)`.

Recommended terminology default (for Current Ops adoption): Finance says **Weekly operating cost** (not "burn") for the complete recurring figure; the existing wire field name `weeklyBurn` is retained until an additive W2 field publishes the complete basis; **Studio Revenue** ≠ **Theatrical Gross**; **Film Contribution** ≠ profit; **Runway at current pace** carries "at current pace" in the label.

## 6. P08–P10 dependency reconciliation (observed)

### P08 — `src/core/studioHistory.ts`, `bridge/history.ts`, save V17 chain

P11 consumes: the recording boundary (`migratedStudioHistory(currentWeek)`, `notRecordedNotice`), exact film/person/facility rows (`subjectKind`, `subjectId`, `filmId`, `personId`, `buildingId`), `historyRecorded` / `resultAvailable` per film. P11 must not duplicate `studioHistory`, receipts, significance, or a timeline. Observed kinds: `studioFounded`, `standingChanged`, `standingDriftFolded`, `filmReleased`, `theatricalRunCompleted`, `facilityCommitted/Completed/Demolished/Moved`. **No finance milestone rows exist**; a "major financial milestone link" (Revision 02 §4.4) has no producer and stays a link-only expectation.

### P09 — `src/core/placement.ts`, `bridge/placement.ts`, `bridge/setCommission.ts`

P11 consumes the placement quote verbatim (fields in §4.0), the digest-bound `placeFacility` / `commissionSet` intents, `StudioPlacedFacilitySnapshot` (status, `placedWeek`, `completesWeek`, `weeksRemaining`, `weeklyOperatingCost`), `facilityId`/`placementId` identity and `buildingId = placed-<placementId>`. Move/demolish/refund exist in core (`moveFacility`, `demolishFacility`, `facilityDemolitionRefund`, ledger `facilityDemolitionRefund`) and now write history rows, but are **not on the wire** ("Move/demolish are P09-R4 and are refused until then", `bridge-schema.ts` ~1372; `canDemolish` flag only). P11 must not create placement legality, a second quote, a second site lifecycle, or a facility registry.

### P10 — `bridge/people.ts`, `bridge/contract.ts`

P11 consumes profiles/roster/attention (public fields per `P10-INFORMATION-VISIBILITY-TABLE.md`), the contract snapshot, and the contract quote family: intent kinds **`renewContract`** and **`releaseTalent`** (release is present under that identifier; `releaseContract` / `terminateContract` do not exist and their absence proves nothing). Hiring uses `signContract` through `bridge/casting.ts`. P11 must not create person identity, hidden disclosure, contract legality, employment state or career facts.

## 7. New persistence recommendation

Unchanged: **no new simulation-history save root and no P11 save-version increase by default.** Nothing observed at `7b4d8ff…` reveals a missing durable fact for the core. The observed additive roots (`studioHistory` V17, `foundingRegime` V18) are producers, not Finance state.

## 8. P11A projection recommendation

Unchanged in shape (Annex C2): one closed Finance read model beside `StudioTreasurySnapshot`, not raw ledger history inside every lot snapshot; deep history through a bounded query/page. Observed precedent: the Talent section rides its own additive bundle section (C5), which is the pattern to follow.

## 9. Current unknowns that must remain placeholders

- final accepted P08–P10 identities; whether the frozen pair survives acceptance unchanged;
- final P09-R4 move/demolish wire route (absent today);
- final bridge query versus bundle decision for deep history;
- final Unity Finance workspace host and focus owner (no Finance workspace exists; `StudioWorkspaceHost` is the observed host);
- final private Owner-profile migration on the accepted base;
- whether Current Ops repairs the treasury understatement inside the P08–P10 cycle or leaves it to P11 W0.

## 10. Corrections to the two draft ambiguities

### 10.1 Cancel

**Rule:** Cancel submits no committed domain action and creates no debit, site, employment change, or obligation.

Observed mechanics: previews are `POST /quote` responses; the session keeps a cap-16 `pendingQuotes` map keyed by minted `intentId`, digest-bound to the quoting state, cleared on any accepted command or load, never journaled (`bridge/session.ts` ~143–160, ~1205–1222, `capPendingQuotes`). There is no cancel route and no cancel command (`bridge/server.ts` routes: `/health`, `/contract`, `/session`, `/snapshot`, `/command`, `/quote`, `/save`, `/load`). A legitimate read-only quote request therefore **may already have occurred** when the player cancels; the temporary quote entry is session bookkeeping, not durable gameplay state. Proof must distinguish: revision unchanged, cash unchanged, ledger length unchanged, no placement/contract mutation, save bytes unchanged — and must **not** reject ordinary preview traffic as a cancellation failure. The real-input contract journey records exactly this ("CANCEL state-neutral, revision 0 → 0").

### 10.2 Upcoming

**Rule:** list only dates and amounts that are both player-public and authoritatively committed, with exact source and public-field evidence. A locked internal theatrical schedule is not automatically public; Finance must not leak future receipts because it can read them in memory.

| Candidate row | Public field evidence at `7b4d8ff…` | Disposition |
|---|---|---|
| Facility opens Week N; +$X/week operating cost from the following advance | `StudioPlacedFacilitySnapshot.completesWeek`, `.weeklyOperatingCost` | ALLOWED |
| Renewal window opens Week N / contract ends Week N (person) | `BridgePersonContractSnapshot.endWeekExclusive`, `renewalOpen`, `renewalLine`; `actions.renewReason` names the opening week | ALLOWED (facts only; renewal cost is a current quote, not a future debit) |
| Next-week Studio Revenue from active runs (aggregate) | derivable from wire `netWeeklyCash + weeklyBurn`; P07 `projected` flag | ALLOWED as an aggregate next-advance figure, labelled projected |
| Remaining scheduled Studio Revenue for an active run (total) | P07 `studioRevenueTotal − studioRevenuePaidToDate`, `totalWeeks − weeksCredited`, `projected` | ALLOWED as "remaining, projected", with the remaining week count |
| Per-week future receipt amounts for an active run | not on the wire; internal `TheatricalRun` schedule only | **BLOCKED** — recommend a separate disclosure decision; do not expose silently |
| Set completion Week N | `StudioSetSnapshot.completesWeek` | ALLOWED (no recurring cost; weekly Set maintenance tuning is 0) |
| Unproduced/unreleased film receipts, unsigned contracts, automatic renewals | no producer | NEVER |

Recommended default (Current Ops adoption): implement Upcoming with the ALLOWED rows only; carry the label "Does not include new films or uncommitted decisions"; treat per-week receipt rows as a later disclosure decision (register §4.E).

## 11. Read-only conclusion

- Facility Opex omission: **STILL PRESENT** at TS `7b4d8ff…`; reaches the wire treasury snapshot and the Administration card; P09 solvency evidence unaffected (complete ledger journey); P11 W0 repair proposed in §3.3, not implemented.
- Producer seams for construction, Set, renewal, release, hire, profile, roster, history and facility rows are **observed and reusable**; move/demolish/refund and per-week receipt schedules are **missing on the wire**.
- Cancel and Upcoming rules corrected (§10).
- New P11 save root: **NOT RECOMMENDED by default**.
- Production code changed: **NONE**.

FINAL ACCEPTED-BASE CHANGED-PATH REFRESH REQUIRED BEFORE ANY P11 IMPLEMENTATION ORDER
