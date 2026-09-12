# P15 Evidence Read — Current Accepted Code (592e926): Finance, Cash, Property Values, Contracts and Obligations

**Reader scope:** read-only reconnaissance of the Owner-accepted P12 R05 TypeScript runtime `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`, extracted at `scratchpad/accepted-592e926/` (paths below are relative to that root). Nothing under any git repository was opened; no branch other than the pinned snapshot was inspected; no player profile data was touched.

**Evidence classes used:** every claim below is **CURRENT ACCEPTED CODE** (file:line) or **PROJECT AUTHORITY DOC** (docs in the snapshot or the scratchpad `authority/` copies). No original-game (retail / Prima / manual) evidence is needed for this topic and none is asserted; where a code comment cites an original-game artifact (the set `[finance] annualcost` datum) I flag it as an unverified secondary citation.

**Confidence convention:** HIGH = read directly in code with the cited line; MEDIUM = derived by combining two or more cited facts; LOW = inference beyond what the inspected lines establish.

---

## 0. Headline answer

At 592e926 the studio economy is a **single literal cash balance plus a signed, reconciled ledger**. There is no balance sheet, no book value, no debt, no interest, no land value, no depreciation schedule, and no insolvency state for either the player or rivals. The only things a future net-worth / loan / distress system could *legitimately read* today are:

1. `studio.cash` (literal, may be negative without bound) and the ordered `ledger` that reconciles to it from `INITIAL_CASH` or a migration checkpoint;
2. two forward **inflows** that are already locked: remaining Studio Revenue on active theatrical runs (`pipelineRunRevenue`) and next-week run revenue;
3. two forward **outflows** that are already binding: guaranteed remaining contract compensation (`guaranteedComp` per contract; `guaranteedPayrollRemaining` aggregate on the wire) and recurring weekly burn (payroll + overhead + placed-facility Opex, `weeklyBurn`);
4. per-asset **recoverable cash** on demolition/strike, but only as a *catalog-derived* fraction of today's blueprint capex (50 % facility, 35 % set), never a persisted per-asset purchase price;
5. a display-only `RecoveryPosition` classifier and a display-only `runwayState: 'inRed'`, neither of which the engine consumes;
6. rival `RivalAccount` (opening capital, literal cash, annual category periods), with commitment gating on an `operatingReserve` and **no** consequence for negative cash.

Loans, bankruptcy and structured recovery are explicitly **Owner-blocked** (`P11-REQ-041/042`) and have been rejected at every ruling point since D-12 (D-12.11/12, D-16 R10, D-17B "next charter"). The recap's own copy says so verbatim: "No recovery mechanic (loans/financing) exists in the current rules." (`src/core/studioRunRecap.ts:1003`).

---

## 1. Player cash and ledger

### 1.1 Where cash lives and how it is seeded

| Fact | Citation | Confidence |
|---|---|---|
| `Studio = { cash, standing, activeProductions, releasedFilms }` — cash is the only money field on the studio root | `src/core/types.ts:291-296` | HIGH |
| A fresh world seeds `cash: TUNING.INITIAL_CASH` | `src/core/worldgen.ts:666-671` | HIGH |
| `INITIAL_CASH: 20_000_000` | `src/core/tuning.ts:70` | HIGH |
| Founding recruitment fund `HIRING_FOUNDING_BUDGET: 6_000_000` is a *separate* pool ("NOT cash"), tracked as `founding.budget` / `founding.spentBonus`; founding-draft signing bonuses draw it, not cash | `src/core/tuning.ts:371`; `src/core/types.ts:467-472`; `src/core/actions.ts:2580, 2606-2614` | HIGH |
| `foundStudio` sets `founding: null` and never transfers the unspent fund to cash — the remainder simply lapses | `src/core/actions.ts:1291-1312` (no cash write in the returned state) | MEDIUM |
| The ledger is `LedgerEntry[]` on `GameState` (`ledger` since V3; widened V11/V12/V14); every cash movement after ledger authority began is retained | `src/core/types.ts:345-351, 490-496, 844-848, 1219-1222` | HIGH |
| Ledger kinds (15): `production, boxOffice, payroll, signingBonus, termination, freelancerFee, studioRevenue, overhead, publicity, constructionCapex, facilityOpex, facilityDemolitionRefund, setCapex, setMaintenance, setDemolitionRefund` | `src/core/types.ts:352-396`; labels at `src/core/financeReport.ts:6-15` | HIGH |
| Reconciliation invariant: `studio.cash === INITIAL_CASH + Σ ledger` (native) or `checkpoint.cash + Σ post-checkpoint ledger` (migrated pre-ledger save); asserted, throws otherwise | `src/core/construction.ts:389-433`; checkpoint type `src/core/types.ts:836-839`; `historicalCashLedgerCheckpoint` `src/core/construction.ts:70-80` | HIGH |

### 1.2 How cash changes (every write site)

| Movement | Direction | Gated by `canAfford`? | Citation |
|---|---|---|---|
| Greenlight: negative + marketing (+ freelancer fees when engaged) | out, one-time | **Yes** (throws with D-12 reason) | `src/core/actions.ts:572-581` |
| Contract signing / renewal signing bonus (ops phase) | out | **Yes** | `src/core/actions.ts:2629, 2642, 2674, 2687` |
| `releaseTalent` termination cost | out | **No — intentionally ungated** | `src/core/actions.ts:2693-2723`; D-12 §11 amended text `docs/D-12-economy-contract.md:161-163`; D-16 R3 `docs/D-16-OWNER-RULINGS.md:45` |
| Publicity campaign | out | **Yes** | `src/core/actions.ts:2790`; `src/core/publicity.ts:82` |
| Facility placement capex (`quote.cost`, never a caller value) | out | Yes (`insufficientFunds` rejection, ranked last) | `src/core/placement.ts:628-636, 729-739`; `src/core/types.ts:1197` |
| Facility move fee | out (`FACILITY_MOVE_COST = 0`) | via quote | `src/core/placement.ts:1014`; `src/core/tuning.ts:1597` |
| Facility demolition refund | **in** | Not cash-gated (engagement/founding checks only) | `src/core/placement.ts:1025-1027, 1054-1096, 917-945` |
| Set commission capex | out | Yes (`insufficientFunds`) | `src/core/sets.ts:443-467, 506-512` |
| Set repair (`SET_REPAIR_COST: 60_000`) | out | Yes | `src/core/sets.ts:521-537, 566-575`; `src/core/tuning.ts:769` |
| Set strike refund | **in** | Not cash-gated | `src/core/sets.ts:582-590, 600-627` |
| Weekly payroll Σ `round(annualSalary/52)` over active contracts | out, every tick | **No** | `src/core/tick.ts:912-922`; `src/core/employment.ts:183-189` |
| Weekly overhead `OVERHEAD_BASE + OVERHEAD_PER_EMPLOYEE × contracts.length` (engaged + founded) | out, every tick | **No** | `src/core/tick.ts:924-932`; `src/core/tuning.ts:419-420` (15,000 + 1,500) |
| Weekly placed-facility Opex (operational placements at start of advance) | out, every tick | **No** | `src/core/tick.ts:934-953`; `src/core/placement.ts:375-386` |
| Weekly Studio Revenue = `weeklyGross[weekIndex] × studioShare` per active run | in, every tick | n/a | `src/core/tick.ts:743-753`; share `STUDIO_RENTAL_BLENDED: 0.52` `src/core/tuning.ts:413` |
| Legacy single-lump `boxOffice.total` (not engaged) | in | n/a | `src/core/tick.ts:630-637` |
| Contract expiry | none ("No cash effect") | n/a | `src/core/tick.ts:955-968` |
| Queue admission | none ("NOTHING IS HELD WHILE QUEUED … no cash") | revalidated at dequeue | `src/core/productionQueue.ts:12-15` |
| Release commitment | none ("moves no cash") | n/a | `src/core/releaseAuthority.ts:5-10` |

### 1.3 `canAfford` semantics and what happens below zero

- **The gate:** `canAfford(state, amount)` returns `{ok:true}` iff `cash − amount ≥ 0`; otherwise `{ok:false, reason}` with the sentence "Insufficient cash — … New commitments require cash to stay at or above zero (unavoidable weekly payroll and overhead may still run it negative)." `src/core/employment.ts:71-85` (HIGH).
- **Only the immediate transaction is checked**, never future payroll or overhead; the comment says runway is "advisory … never a legality rule" (`src/core/employment.ts:71-76`).
- **Below zero nothing is locked, nothing is refused, no state changes.** The three unconditional weekly debits (§1.2) run regardless of sign; there is no `cash < 0` branch anywhere in `src/core` except (a) the rival entry endowment assertion `src/core/hollywood.ts:188` and (b) the display-only `runwayState: 'inRed'` when `cash ≤ 0` at `src/core/financeReport.ts:274-275` (grep of `cash *< *0|cash *<= *0` across core; HIGH).
- **Save validation only requires a finite number** (`v8Number(studio.cash …)`, `src/core/save.ts:2242, 1094-1099`), so an arbitrarily negative balance serialises and loads (HIGH).
- **Therefore the player can go arbitrarily negative** and stay there: while any contract runs, payroll + overhead keep debiting; the only inflows are Studio Revenue, refunds from demolition/strike, and nothing else. The D-16 lab measured this state as "mechanically absorbing while anyone is employed (weekly self-transition 99.69 %)" (`docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md:98`; PROJECT AUTHORITY, MEDIUM as a current-code claim because it was measured on an older base).
- **Recovery levers that exist in code today** (all legal at negative cash): advance time and collect run revenue; `releaseTalent` (ungated; removes future obligation at 50 % of remaining guarantee, `HIRING_TERMINATION_FRACTION: 0.5`, `src/core/tuning.ts:391`, `src/core/employment.ts:172-180`); let contracts expire; demolish placed facilities (+50 % of blueprint capex); strike sets (+35 % of set capex). Nothing else adds cash.

### 1.4 What P11 actually shipped (register rows, execution state 2026-09-10)

`docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md` (all HIGH — read directly):

| Row | Requirement | State |
|---|---|---|
| REQ-003 (l.102) | Cash is literal and distinct from obligations | PROVEN |
| REQ-006/007 (l.105-106) | Complete recurring cost includes facility Opex (`weeklyBurn` previously omitted it) | PROVEN — now `weeklyBurn = payroll + overhead + facilityOpex` `src/core/economyView.ts:69-72` |
| REQ-009 (l.108) | Honest conditional current-pacing runway with finite/positive/steady/in-red/unavailable states | PROVEN — `src/core/financeReport.ts:274-281` |
| REQ-016 (l.115) | Expose guarantees/obligations **without subtracting from Cash** | PROVEN — `bridge/finance.ts:80-81` |
| REQ-022 (l.121) | Affordability is legality; prudence remains player judgment | PROVEN |
| REQ-023 (l.122) | Preserve recoverable negative Cash; do not invent bankruptcy | PROVEN |
| REQ-036 (l.135) | Semantic financial risk/attention thresholds | CONDITIONAL — "no TS thresholds" |
| REQ-040 (l.139) | Canonical all-in film profitability | OWNER-BLOCKED |
| REQ-041 (l.140) | Loans / investors / external financing | **OWNER-BLOCKED, DEFERRED** |
| REQ-042 (l.141) | Bankruptcy / failure / structured recovery | **OWNER-BLOCKED, DEFERRED** ("P15 corporate fate / future finance law") |
| REQ-045 (l.144) | Do not display Available Cash, reserves, or investment-quality advice | ACTIVE SAFEGUARD |

No register row mentions net worth, valuation, book value, depreciation, or land value at all (grep of the register; HIGH).

---

## 2. Facilities, property, sets — is there any book value?

### 2.1 Land

- Every `LotParcel` carries the **literal type** `ownedFromStart: true`; the comment says "There is no land market this milestone: the studio owns its whole lot from week zero" (`src/core/types.ts:864-872`; `src/core/lot.ts:71-74, 102-165`). Roads are "never ownable land" (`src/core/lot.ts:60`). No land price, rent, or value exists anywhere (HIGH).
- The `BlueprintRequirement` vocabulary declares future "land zones with C3 acquisition" kinds that evaluate today as honestly UNMET (`src/core/types.ts:884-897`) — declared vocabulary, not a mechanism (HIGH).

### 2.2 Founding structures (property)

- `PropertyStructure` = `{ id, label, role: 'landmark'|'founding', origin, footprint, providesFacilityIds }` — geometry only, **no money field** (`src/core/types.ts:1277-1287`). Founding bodies "are not builds, have no blueprint, and cost nothing to keep" (`src/core/types.ts:1005-1009`). They own no placement record, so they can never be demolished or refunded (`src/core/placement.ts:923-925`) and pay no Opex (`weeklyPlacementOperatingCost` iterates only `placement.facilities`, `src/core/placement.ts:375-386`) (HIGH).

### 2.3 Placed facilities

- `PlacedFacility = { id, blueprintId, parcelId, origin, cells, facilityId, projectId, status, placedWeek, completesWeek }` — **no persisted purchase price, cost basis, or value** (`src/core/types.ts:1042-1058`) (HIGH).
- The capital cost lives in two places only: (a) the TUNING blueprint (`capex`, `weeklyOperatingCost`, `src/core/types.ts:958-971`), and (b) the `constructionCapex` ledger row correlated by `constructionProjectId` (`src/core/placement.ts:729-735`). The placement invariant requires `entry.amount === -blueprint.capex` (`src/core/placement.ts:1719-1721`), so today the ledger row and the catalog agree by construction — but the *ledger row* is the only persisted purchase price (HIGH).
- **Demolition refund = `round(blueprint.capex × 0.5)`** computed from **today's** blueprint, flat, no age curve ("Deliberately FLAT in V1. An age curve … is future tuning"), applies equally to a half-built site, always strictly less than capex (`src/core/placement.ts:1025-1027`; `src/core/tuning.ts:1599-1613`; invariants `src/core/placement.ts:1729-1745`) (HIGH).
- The P11 finance projection lists each placement with its blueprint `weeklyOperatingCost` and `chargedNextAdvance`, but no value (`bridge/finance.ts:28-38`). P11 handoff law: "never reconstruct a purchase from today's blueprint price or a title" (`docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md:37`) — i.e., a future book-value reader must use the ledger capex row, not the catalog (HIGH).
- The V11 legacy Annex project carries a literal `capex: 780000` (`src/core/types.ts:813-823`) and is excluded from move/demolish until the "C2 Flip" (`src/core/placement.ts:926-930`) (HIGH).

Catalog (all `src/core/tuning.ts`, HIGH): Annex 780,000 / 3,500 wk (l.584, 596); Development Office II 600,000 / 2,500 (l.958-959); III 1,200,000 / 4,000 (l.984-985); Development & Casting Hall 1,400,000 / 6,000 (l.1010-1011); Craft Services Annex 400,000 / 2,000 (l.1037-1038); Standard Soundstage 2,400,000 / 9,000 (l.684, 686); Post Building 1,150,000 / 5,000 (l.697, 699); Scenery Shop 850,000 / 4,000 (l.708, 710); Baseline Development & Casting 1,500,000 / 5,500 (l.729, 731).

### 2.4 Sets

- `StudioSet = { id, name, blueprintId, mountedOn, setType, status, completesWeek, quality, novelty, condition, genreWeights, priorityGenre }` — **no money field** (`src/core/types.ts:1336-1356`) (HIGH).
- Commission debits `blueprint.capex` (`src/core/sets.ts:506-512`; catalog 150,000–900,000, `src/core/tuning.ts:1350-1562`); strike refunds `round(capex × 0.35)` and the set is retired, never deleted (`src/core/sets.ts:151-154, 600-627`; `SET_DEMOLITION_REFUND_FRACTION: 0.35` `src/core/tuning.ts:816`) (HIGH).
- `SET_WEEKLY_MAINTENANCE_COST: 0` is a "NAMED ZERO" that **no tick path charges** (declared `src/core/tuning.ts:745-754`; no reference outside tuning.ts by grep). The `setMaintenance` ledger kind is used only by the one-time repair action (`src/core/sets.ts:566-575`). The tuning comment cites an original-game set schema (`[finance] annualcost` / `dailyrate` both 0, "TECH-SCHEMA-001") — a secondary technical-artifact citation I did not verify here (HIGH on the code; UNVERIFIED on the original-game claim).
- `condition` (0..100, wears per production) is the only "depreciation-like" number and it depreciates *usability*, not money (`src/core/types.ts:1352`) (HIGH).

### 2.5 The nearest thing to "capital sunk"

`financeTotals(state).construction` nets `constructionCapex + facilityDemolitionRefund + setCapex + setDemolitionRefund` — the comment calls it "NET capital spend — what the studio actually sank into buildings it still has" (`src/core/economyView.ts:455-499`); the recap carries `totalConstruction` (`src/core/studioRunRecap.ts:305-307`). This is a cumulative ledger aggregate, **not** a per-asset book value and not net of any depreciation (HIGH).

### 2.6 Persisted money-bearing asset/liability fields (complete list)

| Valuable today? | Field | file:line | Notes |
|---|---|---|---|
| ASSET (cash) | `studio.cash` | `types.ts:292` | literal; may be negative; reconciles to ledger |
| ASSET (locked future inflow) | `TheatricalRun.weeklyGross[]`, `studioShare`, `weekIndex`, `totalWeeks`, `cumulativeStudioRevenuePaid` | `types.ts:304-316` | remaining = Σ_{w≥weekIndex} gross×share (`economyView.ts:95-110`) |
| ASSET (recoverable, catalog-derived) | `PlacedFacility.blueprintId` + `projectId` (→ capex ledger row) | `types.ts:1042-1058` | refund = 50 % of *today's* blueprint capex; no persisted basis on the record |
| ASSET (recoverable, catalog-derived) | `StudioSet.blueprintId` (+ `status`, `condition`) | `types.ts:1336-1356` | refund = 35 % of catalog capex; condition is usability, not value |
| ASSET (non-monetary) | `PropertyState.parcels[].ownedFromStart: true`, `structures[]` | `types.ts:864-872, 1277-1306` | land and founding plant: no price, no refund, no Opex |
| ASSET (prepaid, sunk) | `Production.budget {negative, marketing}` | `types.ts:225-238` | already debited at greenlight; `filmCommittedCost` re-derives from ledger (`receptionVerdict.ts:117-125`) |
| RECORD (not an asset) | `FilmResult.boxOffice {opening,total}` | `types.ts:241-266` | gross ≠ cash received (`bridge/finance.ts:48-50`) |
| LIABILITY (binding future outflow) | `Contract.annualSalary`, `endWeekExclusive`, `termWeeks`, `startWeek` | `types.ts:336-343` | `guaranteedComp = weeklySalary × remainingWeeks` (`employment.ts:172-175`) |
| LIABILITY (avoidable at 50 %) | termination cost | derived: `employment.ts:178-180` | on the wire per employee (`bridge/finance.ts:25`) |
| LIABILITY (recurring, not accrued) | placed-facility `weeklyOperatingCost`, `OVERHEAD_BASE/PER_EMPLOYEE` | `tuning.ts:419-420`; blueprint `weeklyOperatingCost` | charged weekly while operational/founded; no term, no accrual |
| CHECKPOINT | `cashLedgerCheckpoint {cash, ledgerLength}` | `types.ts:836-839` | migration-only opening balance |
| POOL (not cash) | `founding.budget`, `founding.spentBonus` | `types.ts:467-472` | lapses at `foundStudio` |
| RIVAL ASSET | `RivalAccount.openingBalance`, `cash`, `periods[]` | `hollywoodTypes.ts:56-61` | see §5 |
| RIVAL RECORD | `RivalProjectCosts.development/production/marketing`; `LiveIndustryFilm.directCommitment/studioRevenueReceived` | `hollywoodTypes.ts:69-78, 41-42` | per-project spend and receipts |

---

## 3. Contracts and guaranteed obligations

### 3.1 What is binding

| Obligation | Binding? | Where the number comes from | Confidence |
|---|---|---|---|
| Payroll through `endWeekExclusive` | **Yes** — debited weekly, ungated (`tick.ts:912-922`); expiry is automatic and free (`tick.ts:955-968`) | `guaranteedComp(contract, week)` `employment.ts:172-175`; aggregate `guaranteedPayrollRemaining` `bridge/finance.ts:80`; before/after on every quote `bridge/finance-consequence.ts:10-16` | HIGH |
| Weekly overhead and facility Opex | **Yes, while founded/engaged/operational** — no contractual term; can only be reduced by releasing people (overhead per employee) or demolishing (Opex) | `economyView.ts:43-53, 69-72` | HIGH |
| Production commitments (negative + marketing + freelancer fees) | **Already paid** at greenlight; no future outflow; no per-tick production spend (D-12 §24 lists "per-tick production spend" as deferred, `docs/D-12-economy-contract.md:243`) | `actions.ts:572-581`; `filmCommittedCost` | HIGH |
| Marketing commitments | Part of the greenlight lump; no separate later spend | same | HIGH |
| Queued intents | **Not binding** — hold no cash, revalidated at dequeue | `productionQueue.ts:12-15` | HIGH |
| Release commitments | **Not monetary** — "moves no cash" | `releaseAuthority.ts:5-10` | HIGH |
| Signing bonus | paid once at signing (D-11.5); no deferred instalment | `types.ts:339` | HIGH |
| Contract "guarantees" beyond salary (buyouts, clauses, legal consequences) | **Do not exist** — `Contract` has exactly six fields | `types.ts:336-343` | HIGH |

### 3.2 Existing runway / obligation numbers a distress system could read

- `weeklyBurn(state)` — the actual-charge basis (0 during a founding draft), `src/core/economyView.ts:69-72`.
- `runway(state)` = `⌊cash / (burn − nextWeekRunRevenue)⌋`, infinite when net-positive; the ONE rule is `runwayOf` at `src/core/economyView.ts:118-135`; D-12 §16 fixes it as "CURRENT COMMITMENTS ONLY" (`docs/D-12-economy-contract.md:178`).
- `commitmentPreview` / `postSigningRunway` — post-commitment runway with the balance floored at 0 (`src/core/economyView.ts:165-184, 349-380`).
- `offerObligation` — `weeklySalary`, `guaranteedComp`, `signingBonus`, `total` for an offer (`src/core/economyView.ts:307-327`).
- `financeOverview` — `runwayState ∈ {'inRed','positive','steady','finite','unavailable'}` (`src/core/financeReport.ts:268-295`); `treasuryOf` on the wire carries `cash, weeklyBurn, weeklyPayroll, netWeeklyCash, runwayWeeks, runwayInfinite` (`bridge/session.ts:652-662`).
- `financeUpcoming` — dated *known commitments only*: facility completion / first Opex week, contract renewal window / expiry, set completion; explicitly "No future receipt schedule crosses this boundary" (`bridge/finance-upcoming.ts:9-12, 15, 53-56`).
- `fixedCostAllocation` — retrospective managerial spread of ledger payroll + overhead across films with a to-the-dollar reconciliation invariant; "the sim never reads it" (`src/core/fixedCostAllocation.ts:1-45`). Note its header still defines fixed cost as `payroll|overhead` only (`:19-20`), so facility Opex is *not* in the allocated basis — consistent with `P11-REQ-035` remaining CONDITIONAL ("`ledgerFixedCostByWeek` omits facility Opex", register l.134) (HIGH).

There is **no** "total committed obligations" selector today. A future one could be assembled entirely from existing pure helpers: `Σ guaranteedComp(c, tick)` over active contracts (already computed at `bridge/finance-consequence.ts:10`) + nothing else, because production and marketing are prepaid and Opex has no term (MEDIUM — derivation).

---

## 4. Existing distress-like signals and what the Owner ruled

### 4.1 `RecoveryPosition` — the exact predicates

`src/core/studioRunRecap.ts:79-84` defines `RecoveryPosition = 'healthy' | 'constrained' | 'severe' | 'noNormalProduction' | 'incomplete'`. `classifyRecovery` (`:962-1006`) evaluates, in order:

1. **`incomplete`** — no released films, or no cheapest package computable (`:973-978`).
2. **`noNormalProduction`** — the *cheapest greenlightable package* (cheapest concept, lowest budget, minimum marketing, deterministic team) fails the same `canAfford` gate the greenlight uses (`:986-990`; parity via `affordabilityOf` → `commitmentPreview`, `:950-958`).
3. **`healthy`** — `standardOk && typicalOk && waitingHelps`, where `standard` = default budget grid × neutral demand for the cheapest concept, `typicalRecent` = median committed cost of the last `TYPICAL_RECENT_WINDOW = 3` releases (`:67-68`), and `waitingHelps ≡ netWeeklyCash ≥ 0` (`:991-994`).
4. Otherwise **`severe`** iff `!standardOk && !hasActiveRevenue && !waitingHelps && runwayWeeks != null`, else **`constrained`** (`:1005-1006`).

Reason strings include "You cannot wait for current contracts to expire: they end after the cash would run out under current fixed costs" (`contractsOutliveRunway`, `:902-903, 1001-1002`) and the load-bearing sentence "**No recovery mechanic (loans/financing) exists in the current rules.**" (`:1003`).

Constants referenced: `BREAKEVEN_ABS = 25_000`, `BREAKEVEN_FRACTION = 0.01`, `HEAVY_LOSS_FRACTION = 0.25`, `STANDARD_NEG_MULT = 1.0`, `STANDARD_DEMAND = 1.0` (`:52-76`). None are in `TUNING`; they are "documented recap conventions (not engine invariants)" (`:52`). Nothing in `src/core` consumes `recovery` — it is a recap read model (HIGH).

The D-16 harness has a separate five-rung ladder `insolvent (cash<0) → noProduction → bareMinOnly → constrained (post-standard runway < 26 wk) → healthy`, but it is "ANALYSIS ONLY. Never imported by src/core/** or ui/src/**" (`src/harness/d16/states.ts:1-13, 96-103`) (HIGH). `insolvent` therefore exists as a word in analysis code only.

### 4.2 Owner rulings on recovery, bailouts, loans

| Ruling | Text (paraphrased ≤40 words) | Citation | Confidence |
|---|---|---|---|
| D-12.11 | one `canAfford` gate on voluntary commitments; unavoidable debits may push cash below zero; "**No loans / emergency financing.**" | `docs/D-12-economy-contract.md:157` | HIGH |
| D-12.11 amendment | `releaseTalent` deliberately ungated because it removes a future obligation; gating it would trap a poor studio "with no loans and no bankruptcy to resolve the deadlock" | `docs/D-12-economy-contract.md:161-163` | HIGH |
| D-12.12 | no forced bankruptcy or game-over; negative cash blocks only voluntary spending; low-budget films are the natural recovery tool; do not add money sinks (facilities/financing/debt/taxes) prematurely | `docs/D-12-economy-contract.md:169` | HIGH |
| D-12 §24 non-goals | loans/debt/investors/taxes; acquisitions; per-tick production spend | `docs/D-12-economy-contract.md:21, 243` | HIGH |
| D-16 R9 | the publicity action must be "useful but not sufficient in distress" — no guaranteed recovery, no permanent death spiral | `docs/D-16-OWNER-RULINGS.md:51` | HIGH |
| D-16 R10 | "**KEEP THE STUDIO, LOSE CONTROL.**" All A14 failure rulings and the co-financing question DEFERRED; no D-17 loans, credit lines, co-financing, distribution advances, investors, bailouts, passive revenue, hard bankruptcy, or forced restructuring ladder | `docs/D-16-OWNER-RULINGS.md:52` | HIGH |
| D-16 lab §14 | explicit non-recommendations: no loans/credit line now ("an honestly-collateralized line prices at ~$394K — a correct and useless answer"); no hard game-over / receivership | `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md:189-196` | HIGH |
| D-16 lab §11 | Tier-3 "one financing mechanic at most" (Co-Financed Picture *or* Distribution Advance) only after positive marginal film EV; the A14 soft-failure ladder ("The Backer" refusable rescue priced in future gross share; player-executed restructuring; optional acquisition exit) was *proposed*, then deferred by R10 | `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md:145, 172-173` | HIGH |
| D-17B "one lever" | publicity "is NOT a bailout — it costs real cash a distressed studio may not have, and `canAfford` refuses" — one lever rather than a guaranteed rescue | `src/core/actions.ts:2735-2740` (code comment citing §8) | HIGH |
| D-17B next charter | investigate the week-208 roster wall and a size-scaling cash sink, "**do not introduce financing, loans, bailouts, restructuring or the failure ladder**"; instrument first | `docs/D-17B-OWNER-RULINGS.md:87-99` | HIGH |
| P11 register | REQ-041 financing and REQ-042 bankruptcy/recovery OWNER-BLOCKED; REQ-045 no "Available Cash"/reserve display | `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md:140-144` | HIGH |

**Were loans ever considered?** Yes — the D-16 lab designed and priced them (A13 blueprints; the $394K collateralised-line figure) and proposed a soft-failure ladder (A14); the Owner deferred every one of them (R10) and D-17B repeated the prohibition. No accepted document has since reopened the question; P13–P15 rulings park "valuation … debt/equity/investor integration if separately approved" in P16+ (`authority/P13-P15-LONG-RANGE-ROADMAP.md:699-702`; `authority/P13-P15-OWNER-RULINGS.md §5`) (HIGH).

---

## 5. Rival finance (P12A, `hollywood` root)

| Fact | Citation | Confidence |
|---|---|---|
| `RivalMoneyKind = 'capacity'|'signing'|'payroll'|'overhead'|'facilityOpex'|'development'|'production'|'marketing'|'studioRevenue'`; `RivalFinancePeriod {fromWeek, throughWeek, opening, closing, movements}`; `RivalAccount {openingBalance, openingBasis:'before-capacity-and-signing', cash, periods[]}` | `src/core/hollywoodTypes.ts:47-61` | HIGH |
| `moveRivalMoney(account, kind, amount, week)` is the single mutator: throws only on non-finite; opens a new period each 52-week block; `account.cash += amount` with **no sign check** | `src/core/hollywood.ts:31-41` | HIGH |
| Entry: `cash = template.capital` (20M–38M by studio, `src/core/hollywoodStartingData.ts:11-36`); debits `'capacity'` = baseline dev-casting + standard stage + scenery shop + post capex, then per-role `'signing'` bonuses; asserts `cash ≥ 0` **only at entry** | `src/core/hollywood.ts:151-152, 159-161, 177, 188` | HIGH |
| Weekly, unconditional, every rival: `studioRevenue` per active run; `payroll` Σ weekly salaries; `overhead` `OVERHEAD_BASE + PER_EMPLOYEE × n`; `facilityOpex` = `rivalCapacityOpex` (catalog Opex by capability) | `src/core/hollywoodTick.ts:267, 279-282`; `src/core/hollywood.ts:81-95` | HIGH |
| Contract expiry for rivals: employment row ended, receipt appended, **no money** (no termination cost anywhere in rival code) | `src/core/hollywoodTick.ts:295-306` | HIGH |
| Gates (the only consequence of low cash): `operatingReserve = rivalWeeklyOperatingCost × policy.reserveWeeks` (12–20 wk). Renewal/replacement signing requires `cash − bonus ≥ reserveAfterOffer`; greenlight package chooser gets `cashAvailable = cash − reserve` and skips any `negative + marketing > cashAvailable`; a new commission requires `cash ≥ reserve` and prices `reserve = weeklyCost × max(reserveWeeks, draftWeeks + PRODUCTION_TICKS + 1)` | `src/core/hollywoodTick.ts:51-53, 98, 126, 156, 176, 196-200`; `src/core/hollywoodPolicy.ts:50` | HIGH |
| Validation accepts any finite `account.cash` (no lower bound); `openingBalance ≥ 0`; periods must reconcile opening + Σ movements = closing = cash | `src/core/hollywoodValidation.ts:24-26, 212-226` | HIGH |
| No code path marks a rival dormant/closed/failed; no `closed|dormant|bankrupt|insolv` token in `hollywood*.ts` (grep) | `src/core/hollywood*.ts` | HIGH |
| Public projection hides cash and terms: "future receipts, costs and studio revenue remain private"; "Contract terms are kept private in Industry" | `bridge/industry.ts:1, 50, 176`; P12A `UX-011` (register l.144), `SAF-014` (l.238) | HIGH |

**Confirmed:** a rival can run negative forever. Once `cash < operatingReserve` it stops signing, commissioning and greenlighting; payroll/overhead/Opex keep debiting until contracts expire (4-year `HOLLYWOOD_CONTRACT_WEEKS` terms; expiry is free); active runs still pay revenue. Nothing removes it from the industry, and the R05 acceptance says so: "Businesses can succeed or struggle financially without this checkpoint claiming to implement bankruptcy/acquisition systems" (`docs/engineering/P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md:118`) (HIGH).

**Player/rival asymmetries a symmetric P15B would have to reconcile (MEDIUM — derived):** rivals hold an explicit cash *reserve* before committing (the player's `canAfford` floor is 0, and `P11-REQ-045` forbids showing a reserve); rivals pay no termination cost and cannot release early; rivals pay catalog Opex on abstract capacity (`rivalCapacityOpex`) rather than on placements; rival capital is per-studio (20M–38M) versus the player's 20M + 6M recruitment fund.

---

## 6. What does NOT exist at 592e926

| Concept | Status | Evidence |
|---|---|---|
| Loans, credit lines, interest, debt of any kind | ABSENT; Owner-blocked | grep `loan|debt|interest|borrow|lender|mortgage|creditor` in `src/core` → only comments (`actions.ts:2739`, `studioRunRecap.ts:1003`); `P11-REQ-041` |
| Bankruptcy, insolvency, receivership, game-over, closure, dormancy (player or rival) | ABSENT; Owner-blocked | grep `insolven|bankrupt|foreclos` in `src/core` → none; harness-only label in `src/harness/d16/states.ts`; `P11-REQ-042`; `SAF-008` |
| Net worth / valuation / balance sheet | ABSENT | no such selector; no register row; P16+ parking (`P13-P15-OWNER-RULINGS.md §5`) |
| Book value / persisted purchase price per asset | ABSENT | `PlacedFacility` and `StudioSet` carry no cost; only the ledger capex row |
| Depreciation schedule | ABSENT — flat refund fractions 0.5 / 0.35 only; "age curve … future tuning" | `tuning.ts:1599-1613, 812-816` |
| Land value, land market, rent | ABSENT | `ownedFromStart: true` literal type |
| Opex on founding plant | ABSENT ("cost nothing to keep") | `types.ts:1005-1009` |
| Set weekly maintenance | ABSENT (named zero, uncharged) | `tuning.ts:754`; no consumer |
| Accrued / scheduled future production or marketing outflows | ABSENT (prepaid) | `actions.ts:572-581` |
| Contract guarantees beyond salary (buyouts, clauses) | ABSENT | `types.ts:336-343` |
| Semantic financial risk thresholds in TypeScript | ABSENT (`P11-REQ-036` CONDITIONAL) | register l.135 |
| Reserve / "Available Cash" display | FORBIDDEN (`P11-REQ-045`) | register l.144 |
| `src/core/ledger.ts`, `theatrical.ts`, `events.ts`, `sharedMarket.ts`, `corporateFate.ts`, `powerRanking.ts`, `studioLegacy.ts`, `industryEvents.ts` | ABSENT files | `find` over the snapshot |

---

## 7. Corrections to the prior P15 research (package + annex, written against 7811377)

- **CORRECTED** — `P15-PACKAGE.md:349` / annex `:610` name `src/core/ledger.ts`, `src/core/theatrical.ts`, `src/core/events.ts` as existing seams. None exists at 592e926. The ledger is a type family in `types.ts:352-465` written by `tick.ts`/`actions.ts`/`placement.ts`/`sets.ts`; theatrical-run law is `economy.ts:53-92` + `tick.ts:743-775`; event roots are `studioEvents.ts` and `studioHistory.ts`.
- **CORRECTED** — `P15-PACKAGE.md:349` "singleton studio and cash … P12 common studio identity must exist before P15": at 592e926 the `hollywood` root (`GameStateV19`, `types.ts:1689`) with `StudioIdentity`, `RivalBusiness`, `RivalAccount` already exists and is Owner-accepted; the dependency is satisfied.
- **QUALIFIED** — roadmap `§5.3` (l.167): "P11's incomplete runway selectors cannot become distress authority without an accepted behavior-neutral read-model repair." At 592e926 `P11-REQ-006/007/009` are PROVEN and `weeklyBurn` includes facility Opex (`economyView.ts:69-72`). The runway is now complete on its stated basis; it remains a *display* selector, not authority, by law (`employment.ts:73-76`).
- **CONFIRMED** — "Negative cash is currently recoverable and does not mean bankruptcy" (roadmap l.165; annex C.3 "cash `< 0` alone" forbidden shortcut). No code consequence exists at `cash < 0`.
- **CONFIRMED** — "Loans, bailouts, investors, forced sales, or acquisition are not implied" (`P15-PACKAGE.md:619`); none exists and all are Owner-blocked.
- **QUALIFIED** — `P15-PACKAGE.md:608-613` lists P11 truth as "scheduled receipts and unavoidable obligations; payroll and facility operating costs; active project commitments; contract guarantees and legal consequences". Scheduled receipts (`pipelineRunRevenue`), unavoidable weekly costs, and salary guarantees exist. "Active project commitments" carry **no future outflow** (prepaid at greenlight), and "legal consequences" beyond a 50 % termination cost do not exist.
- **QUALIFIED** — "P12 already permits rival failure while the player has no mandatory hard-bankruptcy game-over" (`P15-PACKAGE.md:93-94, 625`). In code, "rival failure" is only *commitment starvation below `operatingReserve`*; there is no failure state, event, or transition. The permission is documentary (R05 l.118), not a mechanism.
- **CONFIRMED** — annex `C.3` "P15 directly mutating/mirroring registry state" is forbidden and there is no registry mutation surface today: `StudioIdentity` has no operating-status field beyond `enteredWeek`/`recordedFromWeek` (`hollywoodTypes.ts:6-17`).
- **CONFIRMED** — `P15-PACKAGE.md:397` "Rivals cannot receive secret cash": the only rival inflow is `studioRevenue` via `moveRivalMoney` (`hollywoodTick.ts:267`); validation reconciles every period (`hollywoodValidation.ts:221-226`).
- **QUALIFIED** — `P15-PACKAGE.md:167` (roadmap) "P15B cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger": confirmed for debt/valuation/acquisition; note the ledger *does* let a future reader compute per-asset purchase price from `constructionCapex` rows (`placement.ts:1719-1721`), which is the only lawful basis under the P11 handoff rule against reconstructing from "today's blueprint price" (`P11-TO-P12-PRODUCER-HANDOFF.md:37`).

---

## 8. Open uncertainties

1. Whether the D-16 measurements (absorbing insolvency, 99.69 % self-transition, week-208 cliff) still hold numerically at 592e926 — they were taken on `main @ 33eb33a` before D-17A/B, P09 facilities, and P12; the *mechanisms* they describe are unchanged, the numbers are not re-verified.
2. `fixedCostAllocation.ts` header (`:19-20`) still defines the allocated fixed cost as payroll + overhead only; whether the Owner intends facility Opex to join that basis is the open `P11-REQ-035`/`REQ-040` question, not settled here.
3. Whether the unspent founding recruitment fund lapsing at `foundStudio` is intended law or an unexamined default — no ruling found in the inspected docs.
4. The original-game claim behind `SET_WEEKLY_MAINTENANCE_COST: 0` (set schema `annualcost`/`dailyrate` = 0, "TECH-SCHEMA-001") was not verified against the technical artifact register in this read.
5. The bridge schema (`bridge/schema/project-studio-bridge.schema.json`) exposes `guaranteedRemaining` / `totalObligation`; I did not audit whether any Unity-side consumer sums or re-derives them (P11-REQ-044 says no client math; not re-verified).
