# P11A Financial Truth and Code Reconnaissance


**Status:** PROVISIONAL — ACTIVE P08–P10 DEPENDENCIES
**Review state:** READY FOR CURRENT OPS PM REVIEW — LOCAL RECON INCORPORATED
**Implementation:** NOT AUTHORIZED FOR IMPLEMENTATION
**Accepted TypeScript base:** `2753e18ba8fb5f65b936c22cde9531646fecc6cd`
**Accepted Unity base:** `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`
**Starting protocol / projection / save:** `4 / 15 / V16`
**Starting schema:** `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Active stack:** `OPS-P08P10-20260905-01`; all active work is **UNSEALED FORWARD EVIDENCE**


## 1. Purpose and evidence boundary

This is a read-only reconciliation of the accepted P07 TypeScript source, the original P11 research, and the active P08–P10 planning/WIP evidence. It changes no code and does not certify unsealed implementation.

The original P11 product law is preserved. Its August code findings are reclassified below against the accepted source instead of being repeated as assumptions.

## 2. Exact sources inspected

### Accepted product authority

- `campaign/living-lot-ts@2753e18ba8fb5f65b936c22cde9531646fecc6cd`
- `CURRENT-BEST.md`
- `docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md`
- `docs/engineering/P06-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`
- `docs/engineering/P07-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`
- `src/core/types.ts`
- `src/core/employment.ts`
- `src/core/economyView.ts`
- `src/core/fixedCostAllocation.ts`
- `src/core/placement.ts`
- `src/core/sets.ts`
- `src/core/tick.ts`

### P11 product/design authority

- `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
- `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md`
- `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11-BUILDER-ANNEX.md`

### Active producer planning / forward evidence

- `docs/p08-p10-autonomous-stack-launch-01@72ca8e797e5185a5dec13ac4c4311e391b8e96e3`
- Current Ops authorization `OPS-P08P10-20260905-01`
- coding-agent local recon snapshot: TS `908879a9c5fa73d2015985834e951db84c69ab8a`; Unity `685f113e480ee18ea242ad8a341e7710523f840f`; validated `2026-09-05T08:25:39Z`
- `docs/operations/OPS-P08P10-20260905-01-CURRENT-OPS-DELTA.md`
- `docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-CURRENT-REFRESH.md`
- `docs/campaigns/P08-P10-AUTONOMOUS-STACK-HANDOFF.md`

The active WIP is **UNSEALED FORWARD EVIDENCE**. Its current symbols may move before acceptance.

The local recon packet is Owner-supplied implementation-adjacent evidence, not accepted campaign authority. It verified private Unity ownership and worktree state read-only; this document does not claim independent reproduction of those local facts.

## 3. Highest-consequence finding

### Facility Opex projection status: STILL PRESENT

The old P11 defect remains present at the accepted P07 source:

| Layer | Current behavior |
|---|---|
| Authoritative tick | Debits payroll, ordinary overhead and operational facility Opex separately; the latter is step 7.6 |
| Signed ledger | Appends `facilityOpex` as its own kind |
| All-time totals | Maps `facilityOpex` into the overhead reporting bucket |
| Period summary | Explicitly counts `facilityOpex` under overhead |
| `weeklyBurn()` | Payroll + ordinary overhead only; facility Opex omitted |
| `runway()` / `financeView()` | Use incomplete `weeklyBurn()` |
| `commitmentPreview()` | Uses incomplete `weeklyBurn()` |
| `prospectiveCycleFixedCost()` | Uses incomplete `weeklyBurn()` outside founding |
| `postSigningRunway()` | Starts from incomplete `weeklyBurn()` |
| `ledgerFixedCostByWeek()` | Reads only `payroll` and `overhead`, omitting `facilityOpex` |

The fix, if still needed after P08–P10, is a **behavior-neutral read-model repair**. It must not change the debit, timing, blueprint cost, starting cash, or any other economy tuning.

### Active P09 implication

P09's Current Ops order requires an ordinary-player solvency proof covering facility Opex and the wait to actual receipts. Any solver or report that uses current `weeklyBurn`, `runway`, `prospectiveCycleFixedCost` or `postSigningRunway` without separately adding operational facility Opex can understate the true recurring burden.

At the recon snapshot, P09 implementation and its solvency proof had **not** begun. Therefore **NO CURRENT OPS ESCALATION** was required. The finding becomes a mandatory P09 entry/final-solvency watch item and a P11 W0 prerequisite, not a reason to interrupt current P08 work.

## 4. Financial truth catalogue

### 4.1 Current and recurring facts

| Name | Definition | Source file / symbol | Period / units | Persisted or derived | Public or hidden | Historical coverage | Limitations |
|---|---|---|---|---|---|---|---|
| Cash | Literal `state.studio.cash` now. | `src/core/types.ts::Studio.cash`; action/tick mutations | Instant / whole dollars | Persisted | Public | Complete current state; pre-ledger movement detail may be incomplete | Not net worth, available cash, reserves or profit. |
| Payroll | Sum of weekly salary for contracts active at the authoritative week. | `employment.ts::weeklySalary`, `weeklyPayroll`; tick step 7 | One authoritative week / whole dollars | Derived from persisted contracts; ledgered when charged | Public | Current and recorded payroll rows after ledger boundary | Founding draft is not charged; freelancers are not payroll. |
| Ordinary overhead | Base plus per-contract overhead charged by current law. | `economyView.ts::weeklyOverhead`; tick step 7.5 | One authoritative week / whole dollars | Derived; ledgered as `overhead` when charged | Public | Current and recorded after ledger boundary | Not complete Studio Operations because facility Opex is separate. |
| Facility operating cost | Sum of blueprint Opex for operational placed facilities at start of advance. | `placement.ts::weeklyPlacementOperatingCost`; tick step 7.6 | One authoritative week / whole dollars | Derived; ledgered as `facilityOpex` | Public | Complete for placed facilities represented by current state/ledger | First charge occurs on the advance after completion; omitted by current `weeklyBurn`. |
| Weekly operating cost | Payroll + ordinary overhead + operational facility Opex. | Must compose `weeklyPayroll`, `weeklyOverhead`, `weeklyPlacementOperatingCost` in one core selector | Next authoritative week / whole dollars | Derived | Public | Current only; recorded period derives from ledger | Current accepted selector `weeklyBurn` is incomplete. |
| Next scheduled Studio Revenue | Receipt due from already-active theatrical runs on next tick. | `economyView.ts::expectedWeeklyRunRevenue`; `runNextWeekRevenue` | Next authoritative week / whole dollars | Derived from persisted runs | Public only under accepted P07 projected/paid language | Current active runs only | Not an average forecast or banked cash. |
| Net weekly cashflow | Next scheduled Studio Revenue minus complete Weekly operating cost. | Future complete finance selector; current `financeView.netWeeklyCash` uses incomplete burn | Next authoritative week / whole dollars | Derived | Public | Current commitments only | Not last week’s movement, profit, or long-range forecast. |
| Approx. runway at current pace | Floor of Cash divided by current recurring deficit, with explicit positive/steady/in-red states. | `economyView.ts::runwayOf`/`runway`, after complete recurring basis | Current-pacing estimate / whole weeks | Derived | Public with basis/exclusions | Current only | Not a failure date; current accepted input omits facility Opex. |

### 4.2 One-time movements and obligations

| Name | Definition | Source file / symbol | Period / units | Persisted or derived | Public or hidden | Historical coverage | Limitations |
|---|---|---|---|---|---|---|---|
| Construction capital spending | Immediate authoritative facility build debit. | `placement.ts::queryPlacement`/`commitPlacement`; ledger `constructionCapex` | Action week / whole dollars | Quote derived; accepted debit persisted | Public | Recorded after ledger boundary | P09 owns action; P11 only presents consequence. |
| Facility demolition refund | Positive capital recovered when a legal facility is demolished. | `placement.ts`; ledger `facilityDemolitionRefund` | Action week / whole dollars | Derived then persisted on commit | Public | Recorded after kind exists | Not operating revenue or negative expense. |
| Set capital / strike refund | Set build debit or lossy strike credit. | `sets.ts`; ledger `setCapex` / `setDemolitionRefund` | Action week / whole dollars | Persisted | Public | Recorded after V14 authority | Not facility Opex. |
| Set repair | One-time repair debit when repair is ordered. | `sets.ts`; ledger `setMaintenance`; `TUNING.SET_REPAIR_COST` | Action week / whole dollars | Persisted | Public | Recorded after set authority | Current weekly set-maintenance tuning is zero; do not include in recurring cost. |
| Signing bonus | Immediate contract/founding commitment under current source rules. | `employment.ts::contractOffer`; action law; ledger `signingBonus` where cash-funded | Action week / whole dollars | Offer derived; payment persisted | Public | Recorded after ledger boundary | Founding recruitment fund is separate from Cash. |
| Weekly salary | Rounded annual salary divided by 52. | `employment.ts::weeklySalary` | Per week / whole dollars | Derived from persisted contract | Public | Current contract term | Do not confuse with signing bonus or freelancer fee. |
| Remaining guaranteed salary | Weekly salary × remaining active term. | `employment.ts::guaranteedComp`; `economyView.ts::offerObligation` | From current week to contract end / whole dollars | Derived | Public | Current contract only | Obligation, not reserved cash or amount due today. |
| Termination payment | Current-law fraction of remaining guarantee for early release. | `employment.ts::terminationCost`; owning action | Action week / whole dollars | Derived then persisted if action succeeds | Public | Current eligible contract | Current action can take cash negative; do not apply ordinary affordability rule blindly. |
| Production commitment | Authored negative-production spend paid at Greenlight. | `Production.budget.negative`; Greenlight action; ledger `production` | Greenlight / whole dollars | Persisted in live Production; combined ledger row persists | Public | Exact while Production exists; historical split may be unavailable | Not rolling spend-to-date. |
| Marketing commitment | Authored marketing spend paid at Greenlight under current law. | `Production.budget.marketing`; Greenlight action; combined ledger `production` | Greenlight / whole dollars | Persisted in live Production; combined historical row | Public | Split may disappear after Production deletion | P11 must not move marketing to Release. |
| Freelancer fee | One-film fee for noncontracted talent in engaged mode. | `employment.ts::freelancerFee`, `assignmentProjectCost`; ledger `freelancerFee` | Greenlight / whole dollars | Derived then persisted | Public | Recorded by production ID | Direct film cost, not payroll. |
| Publicity purchase | One-time studio-level publicity campaign debit. | Current publicity action; ledger `publicity` | Action week / whole dollars | Persisted | Public | Recorded after D-17B | No production ID; never assign to a film by coincidence. |

### 4.3 Film and theatrical facts

| Name | Definition | Source file / symbol | Period / units | Persisted or derived | Public or hidden | Historical coverage | Limitations |
|---|---|---|---|---|---|---|---|
| Opening theatrical gross | Audience spend in opening result. | `FilmResult.boxOffice.opening`; P07 `boxOfficeOpening` | Release result / whole dollars | Persisted | Public | Complete where FilmResult exists | Gross, not studio cash. |
| Full-run theatrical gross | Locked gross for the theatrical run. | `FilmResult.boxOffice.total`; `TheatricalRun.weeklyGross`; P07 `boxOfficeGrossTotal` | Full run / whole dollars | Persisted | Public as projected while active, final when settled | Complete for current runs; legacy path carries its own provenance | Do not expose internal future truth as settled. |
| Gross paid to date | Cumulative audience gross credited through current run week. | `TheatricalRun.cumulativeGrossPaid`; P07 `grossPaidToDate` | Through current week / whole dollars | Persisted | Public | Active/completed runs | Not studio cash. |
| Studio Revenue received | Cumulative locked studio share actually credited to cash. | `TheatricalRun.cumulativeStudioRevenuePaid`; ledger `studioRevenue`; P07 field | Through current week / whole dollars | Persisted | Public | Active/completed run; legacy lump distinct | Banked cash, not full-run total. |
| Studio Revenue scheduled | Remaining receipts of already-active locked run. | `economyView.ts::runRemainingRevenue`; P07 projected fields | Future locked run weeks / whole dollars | Derived from persisted run | Public under accepted P07 projection law | Active runs only | Not current cash; not general forecast. |
| Full-run Studio Revenue | Locked studio share × full-run gross. | `runView.totalStudioRevenue`; P07 `studioRevenueTotal` | Full run / whole dollars | Derived from persisted run/legacy basis | Public as projected/final according to run status | Current/legacy path-specific | Do not change accepted share or result semantics. |
| Direct film commitment | Production + marketing + correlated freelancer fees for exact production ID. | Core `filmCommittedCost`; ledger by `productionId` | At Greenlight / whole dollars | Derived from retained ledger; split partially persisted | Public | Available where correlated rows exist | Excludes studio payroll and operations. |
| Film Contribution | Full-run Studio Revenue − Direct film commitment. | P07 result projection / centralized future P11 selector | Full run / whole dollars | Derived | Public as projected/final | Depends on current authoritative cost and run facts | Not Net Profit or total studio profitability. |
| P07 result label / ROI | Accepted P07 direct-film business interpretation. | P07 `resultLabel`, `roi`, `projected` | Release/run status | Derived in accepted P07 result projection | Public on accepted P07 surface | Accepted P07 semantics | P11 Finance should not propagate it as all-in studio profit; harmonization is a controlled presentation change. |

### 4.4 History and reconciliation facts

| Name | Definition | Source file / symbol | Period / units | Persisted or derived | Public or hidden | Historical coverage | Limitations |
|---|---|---|---|---|---|---|---|
| Signed ledger entry | One authoritative cash movement with week, kind, amount and allowed subject correlation. | `GameState.ledger`; `LedgerEntry` | Exact action/tick week / whole dollars | Persisted | Public through bounded projection | Complete only from ledger/checkpoint recording boundary | Notes are not a universal historical title or event contract. |
| This Week / period summary | Exact signed category aggregation for inclusive week range. | `economyView.ts::periodSummary` | Inclusive week range / whole dollars | Derived | Public | Only retained ledger rows in range | Current `otherCash` must be split in deep detail. |
| All-time finance totals | Whole retained-ledger totals by category. | `economyView.ts::financeTotals` | Recorded lifetime / whole dollars | Derived | Public in detail, not default dashboard | Ledger boundary onward | Construction bucket is net capital committed/recovered, not asset value. |
| Cash-ledger checkpoint | Migration-only starting cash and ledger position for pre-ledger saves. | `CashLedgerCheckpoint`; save validation | Migration boundary | Persisted only when needed | Public as provenance, not a transaction | Establishes complete reconciliation from checkpoint onward | Never fabricate balancing transaction or itemized past. |
| Finance history coverage | The earliest week/position for which exact movement detail is recorded. | Cash-ledger checkpoint + ledger + final P08 history boundary where relevant | Recorded boundary | Derived/persisted provenance | Public | Exact after boundary | Do not imply every surviving ledger equals entire studio lifetime. |
| Major financial milestone link | P08-owned sparse historical interpretation referencing finance source IDs. | Final P08 `studioHistory` seam after acceptance | Event week | Persisted by P08 if significant | Public | Forward-recorded only | P11 links to it; P11 does not create a second history ledger. |

## 5. Accepted P07 wording versus original P11 terminology

The P11 research predates accepted P07. The two packages now differ in one important presentation area:

| Topic | Accepted P07 | Original P11 recommendation | P11 launch treatment |
|---|---|---|---|
| Business summary | P07 wire contains `contribution`, `roi`, `projected`, and a TS-authored `resultLabel` using projected/final Profit/Loss/Break-even language on the accepted direct-film basis | P11 Finance may introduce **Direct Film Commitment** and **Projected/Final Film Contribution** for its own explicit accounting scope | Preserve accepted P07 `Profit` / `Loss` / `Break-even` labels on the P07 result surface. P11 must not make relabeling that surface a hidden prerequisite. Any harmonization is a separate Current Ops/Owner-facing regression scope. |
| Active full-run values | Public as projected while active; paid-to-date remains separate | Same principle | Reuse exactly; no settled wording before run completion |
| Historical title | Resolved from current concept by `conceptId`; not frozen on FilmResult | P11 originally assumed stable film identity and exact links | Join by production/result ID. Never treat current title lookup as a frozen historical title fact. |
| Participants/forecast | Optional where captured | P11 wants deep links/film detail where authoritative | Local `Not recorded` when absent; no backfill |
| Result route | FILM HISTORY lives inside Release Result workspace; no always-visible history entrance was shipped by P07 | P11 expects Finance deep link to film history/result | Use the final accepted P08/P10 route after refresh. Unknown exact-ID selection may not be treated as successful fallback. |

## 6. P08–P10 dependency reconciliation

### P08

P11 should consume:

- the final authoritative Studio History recording boundary;
- sparse significant financial-event references where P08 actually records them;
- Administration/History navigation and exact film/person/facility links;
- old-save `Not recorded` semantics.

P11 must not duplicate:

- `studioHistory` rows;
- Standing change receipts;
- significance classification;
- a second historical timeline.

At the local recon snapshot TS `908879a9c5fa73d2015985834e951db84c69ab8a` × Unity `685f113e480ee18ea242ad8a341e7710523f840f`, P08 had committed Wave 2: forward-recorded `studioHistory`, exact Standing receipts, Save V17, Projection 16, synchronized generated consumer and deterministic retention/folding. Unity Wave 3 work was actively owned and dirty, so the recon agent did not run tests or launch Unity. All of this remains unsealed.

### P09

P11 should consume:

- final `quotePlacement` / `quoteSet` envelope and opaque intent/revision identity;
- exact blueprint, site, footprint, cost, completion, operational Opex onset and capacity;
- placement/facility/project IDs;
- move/demolition/refund decisions;
- actual facility owner/Locate routes.

P11 must not create:

- placement legality;
- a second construction quote;
- a second site lifecycle;
- a duplicate facility registry.

### P10

P11 should consume:

- exact public person/profile/roster routes;
- current active contract and salary truth;
- current work/availability;
- grouped contract attention and quote families only where the final stack actually implements them.

P11 must not create:

- person identity;
- hidden skill/potential disclosure;
- contract legality;
- employment state;
- career facts.

## 7. New persistence recommendation

**Default recommendation: P11A should require no new simulation-history save root and no save-version increase.** It should derive current and recorded Finance views from:

- literal cash;
- retained signed ledger/checkpoint;
- contracts;
- placement/facility state;
- Production and FilmResult;
- TheatricalRun;
- final P08 historical references.

A save bump becomes justified only if Current Ops explicitly accepts a new durable fact that does not exist, such as:

- a frozen historic negative/marketing split after Production deletion;
- a new authoritative known-flow event;
- a genuinely persisted finance summary needed for measured scale;
- a material action receipt not already owned by P09/P10.

UI filters, chart state, expanded rows and `seen` flags are not finance simulation truth.

## 7.1 Local recon conclusions that bind the launch plan

1. **No second Finance persistence root:** P11A core remains derivable from Cash, ledger/checkpoint, contracts, placement, runs/results and final P08 context.
2. **P08 is contextual, not accounting authority:** its current Studio History rows do not provide comprehensive ledger-row identity or a complete cash history.
3. **P09 owns construction truth:** P11 composes cash and recurring consequences around the final quote but does not own footprint, legality, duration, commit, idempotence or receipt.
4. **P10 routes are pending:** accepted contract arithmetic can be reused, but general Profile/Roster/attention/deep-link authority must be refreshed after P10.
5. **Builder economics are absent:** they are `not modeled`, not zero.
6. **Accepted P07 labels survive:** P11 Finance may use Film Contribution; P07 result labels are not silently rewritten.

## 8. P11A projection recommendation

After the active stack, extend the existing projection with one closed Finance read model rather than embedding raw ledger history into the atomic lot snapshot.

Conceptually it needs:

- `asOfWeek` and history coverage;
- Cash;
- recurring components and complete operating total;
- next scheduled active-run receipt;
- Net weekly cashflow;
- Runway state;
- last recorded period reconciliation;
- compact Payroll / Studio Operations / obligations summaries;
- bounded exact-entry drill-down or query route;
- selected Film Economics;
- exact IDs and route capabilities;
- consequence-preview reference to the owning P09/P10 action.

Exact schema fields, paging strategy, projection number and query boundary require final changed-path reconnaissance.

## 9. Current unknowns that must remain placeholders

- final P08 history types, compaction and world route;
- final P09 quote/intent and Opex-onset fields;
- final P10 contract IDs, obligation views and Profile route;
- final bridge query versus bundle decision;
- final Unity workspace host and focus owner;
- final save/schema/projection/protocol versions;
- final private Owner-profile migration behavior;
- final P09 solvency result using complete facility Opex.

## 10. Read-only conclusion

- Facility Opex omission: **STILL PRESENT at accepted P07 source and recon snapshot**; no current P08 interruption, mandatory P09 solvency/P11 W0 guard.
- Set repair: **one-time**, not recurring.
- P11A recommendation: **CONFIRMED**, but construction preview must reuse final P09 authority.
- New P11 save root: **NOT RECOMMENDED by default**.
- P08 history remains context, not accounting history; P09/P10 final routes remain placeholders.
- Accepted P07 result labels remain unchanged by P11 planning.
- Production code changed: **NONE**.

POST-P08–P10 OWNER-ACCEPTED CHANGED-PATH REFRESH REQUIRED
