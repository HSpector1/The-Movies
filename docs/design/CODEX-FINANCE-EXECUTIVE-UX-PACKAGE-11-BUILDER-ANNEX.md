# PROJECT: STUDIO — PACKAGE 11 BUILDER ANNEX

# Finance, Accounting & Executive Decision UX

Status: **implementation-oriented design contract; documentation only**<br>
Research branch: `codex/finance-executive-ux-research-11`<br>
Canonical baseline: `c902a704eb948cc576083d0973c8c23e59937dc1`<br>
Supplied sealed product pair inspected read-only: TypeScript `44615e5`; Unity `911e87e6aeed6e185ccf6a8d77aff9ec455b404f`<br>
Companion report: `docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md`

All amounts shown in wireframes are illustrative placeholders unless explicitly read from an authoritative current quote. The Package 09 `$20M / $1.5M / 14 weeks / $5.5K weekly / +2 slots` envelope remains provisional P09A prototype tuning only.

## Non-negotiable implementation boundary

TypeScript owns every money fact, category, formula, quote, legality rule, forecast, risk state, time transition, RNG outcome, history record, and save. Bridge DTOs carry authored facts and reason codes. Unity/browser render components own layout, formatting, charts, selection, attention rendering, navigation, and submission. Current browser TypeScript adapters do calculate some film-economics read models; P11 treats that duplication as a centralization seam, not permission for Unity or render components to recalculate. No Unity/renderer calculates cash-after, payroll, Studio Revenue, Film Contribution, runway, risk, affordability, or forecast.

Before P11A presents recurring operating cost/runway as complete, repair the **read model only** so existing recurring `facilityOpex` is included. Do not change any economic debit or tuning. Current `setMaintenance` is a one-time repair row; do not turn it into recurring burn.

---

# A. Comparator Reference Atlas

**Evidence boundary:** A1 is an official primary historical manual source. A2–A8 are official publisher/developer feature pages, read directly on 25 August 2026; their descriptions of exposed screens/interactions are comparator facts, while every **COPY PRINCIPLE**, **DO NOT COPY**, and Project: Studio translation below is a P11 design ruling. Promotional pages establish only the feature they visibly/documentedly describe, never hidden formulae or Project: Studio authority.

## A1. *The Movies* — cash pulse and physical finance owner

- **Game/source:** *The Movies* official manual.
- **Exact URL:** [Official manual PDF](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf).
- **Look here:** printed p. 6, **Cash Balance** HUD icon and Finance route; printed pp. 14 and 37, Cash/Finance/Salary and `F5` Finance / `F6` salaries; printed pp. 12–13, Production Office Release/marketing interaction.
- **Exact interaction:** the player remains on the lot, reads cash persistently, opens Finance deliberately, and historically committed release marketing through a physical production-office flow.
- **Inspect visually:** relative prominence of cash versus other HUD chrome; how the movie card signals continuing earnings; how spending remains tied to a world object.
- **COPY PRINCIPLE:** persistent cash, optional depth, tangible spend, movie continues earning over time.
- **DO NOT COPY:** opaque formulae, tiny bubble archaeology, drag-to-amount commitment, or historical prices.
- **Project: Studio translation:** Administration selection → compact financial health → retained Finance; exact consequence preview returns to the lot. Historical release-time marketing does not authorize moving or duplicating current Package 04/06/07 marketing law.

## A2. *Planet Coaster 2* — overview to category breakdown

- **Game/source:** *Planet Coaster 2*, official management deep dive.
- **Exact URL:** [Deep Dive: Mastering Management](https://www.planetcoaster.com/en-US/news/2024-09-25/deep-dive-mastering-management).
- **Look here:** section **Financial Management** and image **Financial Management Graphs**.
- **Exact interaction:** finance opens at park-level cash/value/income/cost groups; graphs and categories support deeper inspection.
- **Inspect visually:** top summary scale, category grouping, relationship between numerical summary and trend graph.
- **COPY PRINCIPLE:** progressive executive hierarchy and grouped costs.
- **DO NOT COPY:** park loans, heatmaps, guest metrics, or dashboard density.
- **Project: Studio translation:** Cash / Net weekly / Runway → Payroll / Studio Operations / Films / Capital → exact person/facility/film.

## A3. *Football Manager* — commitments and actionable warning

- **Game/source:** *Football Manager*, official feature article.
- **Exact URL:** [Smarter Transfers, Squad Building and Finance](https://www.footballmanager.com/features/smarter-transfers-squad-building-and-finance).
- **Look here:** section **Balancing the books**, image **Negative Transfer Budget**; text on improved future committed-spend calculations and clearer income/expenditure categories.
- **Exact interaction:** the article separately documents an administration news item with net-debt/P&L/income/expenditure information and improved future-transfer committed-spend calculations; it does not establish one combined surface.
- **Inspect visually:** amount-first warning hierarchy and the separately documented commitment/category clarity; do not infer one consolidated screen.
- **COPY PRINCIPLE:** amount + deadline + subject + remedy; future commitments clearly distinct from current cash.
- **DO NOT COPY:** transfer/wage-budget dual currencies, FFP, board action, loans/interest-bearing liabilities, football contracts, or automatic advice.
- **Project: Studio translation:** renewal cohort/known obligation → exact date and amount → filtered Contracts/Person route; `Other cash` breaks into typed rows.

## A4. Madden Franchise — immediate versus future contract consequence

- **Game/source:** Madden NFL 24, official Franchise deep dive.
- **Exact URL:** [Madden NFL 24 Franchise Mode](https://www.ea.com/able/news/madden-24-franchise-mode).
- **Look here:** section **Contract Restructuring**.
- **Exact interaction:** before confirmation, the action exposes the current-year effect and future-year cost increase.
- **Inspect visually:** the pre-confirmation current-cap effect and future-year increase presentation; do not infer columns or a specific sheet layout from the article.
- **COPY PRINCIPLE:** material decisions show both present and future effects before commitment.
- **DO NOT COPY:** salary cap, dead money, league-year accounting, restructure action, or “cap space” vocabulary.
- **Project: Studio translation:** Cash now/after + recurring delta/effective week + guarantee/obligation + current-pacing runway, all from one TypeScript preview.

## A5. College Football 27 — budget and calendar context

- **Game/source:** College Football 27, official Dynasty deep dive.
- **Exact URL:** [College Football 27 Dynasty](https://www.ea.com/games/ea-sports-college-football/college-football-27/news/college-football-27-dynasty).
- **Look here:** **Dynasty Blueprint → Dynasty Points** and **Managing Your Blueprint Throughout the Year**; Program Overview, budget-allocation, and preseason/in-season/offseason timeline image captions (currently near images 19–21).
- **Exact interaction:** budget allocation is presented beside the calendar phases in which choices become available/relevant.
- **Inspect visually:** large total versus grouped allocations, calendar-linked decision windows, contextual rather than constant alerts.
- **COPY PRINCIPLE:** known obligations and action windows need dates and grouped context.
- **DO NOT COPY:** Dynasty Points, annual allocation, use-it-or-lose-it rules, or treating an allocation as Cash.
- **Project: Studio translation:** a future Finance `Upcoming` may list theatrical receipts, renewal-window opening, and expiry from current authoritative calendar facts. Facility-Opex onset joins that list only after TypeScript explicitly publishes it; P11A shows the construction preview's operational-onset rule without inventing a calendar event.

## A6. *Cities: Skylines II* — balance → source

- **Game/source:** *Cities: Skylines II*, official Economy & Production feature.
- **Exact URL:** [Economy & Production](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/economy-production).
- **Look here:** section **Economy Panel** and Budget image.
- **Exact interaction:** Revenue, Expenses, and monthly balance sit at the top; each group exposes source and explanation.
- **Inspect visually:** Budget tab's Revenue, Expenses, current Monthly Balance, and right-side descriptions of where highlighted revenue/expenses originate.
- **COPY PRINCIPLE:** every balance has a drillable source and exact period.
- **DO NOT COPY:** taxation, loans, production chains, city-service categories, or city-sim density.
- **Project: Studio translation:** reconciled opening cash + typed movement = closing cash; exact ledger entries live one layer deeper.

## A7. *Victoria 3* — temporary versus structural deficit

- **Game/source:** *Victoria 3*, official developer diary.
- **Exact URL:** [Dev Diary #61: Data Visualization](https://www.paradoxinteractive.com/games/victoria-3/news/victoria-3-dev-diary-61-data-visualization).
- **Look here:** **Income** discussion and historical trend markers.
- **Exact interaction:** a temporary construction-driven deficit is classified differently from an unhealthy fixed deficit. The source also discusses reserve trend markers; it does not document event-cause annotations on the income chart.
- **Inspect visually:** neutral versus unhealthy deficit treatment and the separation between temporary construction and fixed fundamentals.
- **COPY PRINCIPLE:** classify temporary investment separately from recurring health. Project: Studio's typed named-event annotation is the translation, not copied evidence.
- **DO NOT COPY:** grand-strategy density, UI-only risk threshold, or color-only good/bad semantics.
- **Project: Studio translation:** Construction/Greenlight appear in `This Week`; they do not inflate Weekly operating cost. Net weekly cashflow remains independently legible.

## A8. *F1 Manager 2024* — investment paired with capability

- **Game/source:** *F1 Manager 2024*, official Create a Team feature.
- **Exact URL:** [Create a Team, Create a Legacy](https://www.f1manager.com/features/new/erstelle-ein-team-erschaffe-eine-legende).
- **Look here:** sections **Choosing Team Origins** and **Managing Your Custom Team**.
- **Exact interaction:** budget and facility/team capability are evaluated together at setup and management.
- **Inspect visually:** starting budget, car/facility levels, and staff context co-located in setup/management. The page does not establish a consequence-confirmation sheet.
- **COPY PRINCIPLE:** show what operational bottleneck an investment solves.
- **DO NOT COPY:** sponsorship, preset origin packages, race-performance scoring, or financing.
- **Project: Studio translation:** construction preview pairs capex/duration/future Opex with exact slot/capability gain and physical site.

## Atlas synthesis

The smallest useful reference set for Fable is A1, A3, A4, A6, and A7. A2 teaches hierarchy, A5 teaches calendar context, and A8 reinforces capability beside cost. None authorizes a loan, risk score, P&L term, or formula for Project: Studio.

---

# B. Existing-System Reuse Map

| Financial need | Exact current Project: Studio path/component/data | Reuse / Extend / Replace / Leave Alone | Why |
|---|---|---|---|
| Literal cash | `src/core/types.ts` — `Studio.cash`; `src/core/worldgen.ts` initial state | **REUSE** | Sole cash authority; signed ledger mutations reconcile to it after migration checkpoint. |
| Ledger vocabulary | `src/core/types.ts` — `LedgerKind`, `LedgerEntry`; `src/core/actions.ts`; `src/core/tick.ts` | **REUSE** | Exhaustive typed rows, stable week, signed amount, optional production correlation. |
| Whole-history totals | `src/core/economyView.ts::financeTotals()` / `FinanceTotals` | **REUSE / relabel** | Exhaustive current kinds; `construction` is net capex/refund and `overhead` contains heterogeneous operating/repair rows. |
| Period cash movement | `src/core/economyView.ts::periodSummary()` / `PeriodSummary` | **REUSE / EXTEND** | Exact window reconciliation; expose `signingBonus`, `freelancerFee`, and `termination` rather than only `otherCash` for forensics. |
| Weekly payroll | `src/core/employment.ts::weeklySalary()`, `weeklyPayroll()` | **REUSE** | Same active-contract basis tick charges. |
| Ordinary overhead | `src/core/economyView.ts::weeklyOverhead()`; tick ordinary-overhead step | **REUSE as component** | Correct base/per-contract component, not complete Studio Operations. |
| Recurring facility Opex | `src/core/placement.ts::weeklyPlacementOperatingCost()`; `src/core/tick.ts` facility-Opex step | **REUSE / PROJECT** | Correct engine debit exists; missing from headline burn/read models. |
| Set repair | `src/core/sets.ts` repair producer; ledger kind `setMaintenance`; `SET_WEEKLY_MAINTENANCE_COST = 0` in `src/core/tuning.ts` | **LEAVE ALONE / name executed law correctly** | One-time repair event today, not recurring weekly set maintenance. Some source comments call it maintenance/weekly; the producer and zero tuning are controlling evidence. |
| Weekly operating cost | `src/core/economyView.ts::weeklyBurn()` | **REPLACE selector composition** | Presently payroll + ordinary overhead only; must include facility Opex without changing debit/tuning. |
| Net weekly cashflow | `src/core/economyView.ts::financeView()` | **EXTEND after repair** | Current next-run-revenue minus incomplete burn; preserve next-week/current-commitments basis. |
| Runway | `src/core/economyView.ts::runway()`, `runwayOf()` | **REUSE rule / repair inputs / adapt label** | Exact current-commitments selector; use complete recurring costs and player-safe states. |
| Greenlight cash preview | `src/core/economyView.ts::commitmentPreview()` | **REUSE / EXTEND** | Current cash/after/affordability/post-runway; prototype for shared consequence contract. |
| Offer obligation | `src/core/economyView.ts::offerObligation()` | **REUSE** | Weekly salary, guaranteed salary, signing bonus, total. |
| Signing/renewal runway | `src/core/economyView.ts::postSigningRunway()` | **REUSE rule / repair recurring basis** | Correct seat/renewal distinction; must compose with complete Studio Operations. |
| Contract law | `src/core/employment.ts`; `src/core/actions.ts` signing/renew/release actions | **REUSE** | Exact salary, guarantee, term, bonus, renewal window, termination, legality. |
| Contract calendar | `src/core/studioCalendar.ts` staffing horizon/renewal/expiry events | **REUSE / EXTEND Finance lens** | Dates and groups already exist; do not duplicate Profile/Roster. |
| Construction quote | `src/core/placement.ts` quote/commit/demolish and blueprint catalog | **REUSE / EXTEND projection** | Exact capex, weeks, completion, Opex, capacity, validity, affordability. Add cash-after/future pace via finance selector. |
| Legacy Annex construction overview | `src/core/placement.ts::StudioConstructionView`; `ui/src/screens/StudioDevelopment.tsx` | **REPLACE stale copy / EXTEND data** | View omits Opex; UI separately says `No second payment or weekly facility charge is due` and construction `never becomes ... recurring burn`. Both contradict current tick law. |
| Generic placement view | `src/core/placement.ts::queryPlacement()` / `studioPlacementView()` | **REUSE as P11A base / EXTEND with Finance composition** | Publishes generic placement cost/Opex/capacity/legality, but not cash-after/runway or a revision-bound command. Prefer this over extending Annex-only truth. |
| Build presentation | `ui/src/lot/buildMode.ts`; `ui/src/lot/buildingInspector.ts` | **REUSE** | Newer surfaces already expose capital, build clock, weekly running cost, capacity, and cash. |
| Demolition/refund | `src/core/placement.ts` / `src/core/sets.ts`; ledger refund kinds | **REUSE** | Exact legality and recovered-capital credit. Keep refunds signed and named. |
| Move cost | `src/core/placement.ts`; current `FACILITY_MOVE_COST = 0` | **LEAVE ALONE / future guard** | Current zero cost is safe. Any future nonzero cost needs a ledger row before Finance can reconcile it. |
| Production budget | `src/core/types.ts::Budget`, `Production.budget`; `src/core/actions.ts` Greenlight | **REUSE** | Negative + marketing lock and immediate debit. |
| Film direct commitment | `ui/src/engine/adapter.ts::filmCommittedCost()`; `src/core/studioRunRecap.ts` local equivalent | **REUSE / centralize read model later** | Exact production + freelancer ledger rows by `productionId`; avoid two copies long term. |
| Forecast package salary basis | `ui/src/engine/adapter.ts::assignmentProjectCost()`, `salarySum()`; `src/core/filmPackage.ts` | **REUSE** | Engaged contracted cost 0, freelancer exact fee, legacy salary path. Current copy—not formula—is stale. |
| Greenlight UI copy | `ui/src/screens/Assembly.tsx` | **REPLACE copy** | “budget and salaries now” is false for engaged contracted talent. |
| Theatrical schedule/share | `src/core/economy.ts`; `src/core/types.ts::TheatricalRun` | **LEAVE ALONE / REUSE** | Locked six-week schedule, share, version, paid counters; no tuning changes. |
| Run projection | `src/core/economyView.ts::runView()`, `activeRunViews()` | **REUSE** | Exact gross/revenue received/next/remaining/full-run fields. |
| Film result | `src/core/types.ts::FilmResult`; `ui/src/engine/adapter.ts::releaseScorecard()` | **REUSE facts / CENTRALIZE / REPLACE labels** | Adapter Contribution math is correct but duplicates read-model authority; Profit/Loss/ROI wording overclaims. |
| Active-run recap contribution | `src/core/studioRunRecap.ts`; `ui/src/screens/StudioRunRecap.tsx` | **DO NOT REUSE AS PROJECTED CONTRIBUTION** | Current recap uses paid-to-date Studio Revenue for active runs while `runProjection()` uses full-run Revenue. P11A must publish one centralized full-run projected value and keep paid-to-date cash separate. |
| Film Economics components | `ui/src/components/FilmPackageSummary.tsx`; `ui/src/screens/ReleaseResult.tsx`; `ui/src/screens/Autopsy.tsx`; `ui/src/screens/FilmRecord.tsx` | **REUSE hierarchy selectively / unify language** | Several screens already explain Studio Revenue/contribution/fixed-cost distinction, but copy varies. |
| Managerial fixed-cost allocation | `src/core/fixedCostAllocation.ts`; `src/core/studioRunRecap.ts` | **LEAVE ALONE until repaired / EXTEND later** | Reconciles payroll+ordinary overhead by occupancy but omits facility Opex; not canonical Film Profit. |
| Dashboard finance | `ui/src/screens/Dashboard.tsx` | **REUSE evidence / REPLACE destination** | Existing finance card and film tables are useful prototypes but not lot-retained Administration-owned workspace; burn basis incomplete. |
| Weekly summary | `ui/src/screens/WeeklySummary.tsx` | **REUSE logic/content** | Accurate period summary basis; adapt into Finance `This Week` without forcing a modal. |
| Browser cash readout | `ui/src/presentation/CashReadout.tsx` | **REUSE formatting/pulse** | Cash heartbeat; no deeper truth. |
| Administration inspector | `ui/src/lot/buildingInspector.ts`; `ui/src/lot/StudioLotScreen.tsx` | **EXTEND / REPLACE generic route** | Currently cash/standing/publicity-heavy; deep route opens generic Dashboard. |
| Studio Roster/payroll | `ui/src/screens/StudioRoster.tsx`; Package 10 Profile/Roster contract | **REUSE / link** | Finance lens aggregates; Person Profile owns contract detail/actions. |
| Lot snapshot finance | `ui/src/engine/adapter.ts::studioLotSnapshot()`; `ui/src/lot/snapshot/StudioLotSnapshot.ts` | **REUSE facts carefully** | Contains cash and presentation cash bands; bands are not TypeScript risk authority. |
| Finance risk bands | `ui/src/engine/adapter.ts` cash-band classification | **LEAVE ALONE for current presentation / DO NOT PROMOTE** | UI thresholds cannot become P11 risk law. |
| Bridge treasury (sealed CP9) | `bridge/session.ts::treasuryOf()` at `44615e5`; `bridge/schema/bridge-schema.ts::StudioTreasurySnapshot` | **REUSE / EXTEND after truth repair** | Publishes cash, burn, net, runway verbatim; current burn input incomplete. |
| Existing bridge stale law | `bridge/session.ts` available intents / state revision; bridge rejection schema | **REUSE pattern / EXTEND** | Existing intents use current revision/rejection, but generic `placeFacility` is not an available bridge intent and `PlacementQuote` has no quote ID/revision. P11A construction needs a new explicit seam. |
| Canonical projection bundle | `bridge/schema/bridge-schema.ts`; `bridge/schema/runtime.ts` | **EXTEND** | Canonical main projection lacks a dedicated deep Finance projection. |
| Generated Unity DTO | Unity workspace `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` at sealed Unity commit | **REGENERATE only after schema change** | Wire artifact, never finance authority. |
| Unity HUD | Unity workspace `Assets/Studio/Runtime/Presentation/StudioLivingTimeHud.cs` at sealed Unity commit | **REUSE / EXTEND presentation** | Already renders authoritative cash/signed `/wk`; no math. Remove/avoid fixed-era copy when touched. |
| Unity compact HUD | Unity workspace `Assets/Studio/Runtime/Presentation/StudioHud.cs` | **LEAVE ALONE / link selection receipt** | Not a finance surface. |
| Unity founding consequence | Unity workspace `Assets/Studio/Runtime/Presentation/StudioFoundingCardHud.cs` | **REUSE interaction principle** | Current offer consequence proves TypeScript-authored obligation/payroll/runway presentation; do not duplicate its formula. |
| Save/migrations | `src/core/save.ts` V1–V14 migration/ledger validation | **LEAVE ALONE / REUSE provenance** | Preserve current state and recorded ledger; no invented old history. |
| Separate studio events | `src/core/types.ts` Studio event log; Package 08 history law | **LEAVE ALONE** | Operational history is not a second cash ledger. Link only significant authored milestones. |
| Frozen economy reports | branches/SHAs named in report | **REUSE findings / DO NOT RETUNE** | Facility-Opex witness and balance diagnosis are evidence, not authority to alter values. |

---

# C. Finance Projection Map

## C1. Existing selectors/projections

| Need | Existing selector/projection | Publishes | Completeness for P11 | Builder ruling |
|---|---|---|---|---|
| Cash | `studio.cash` | literal current cash | **Complete** | Reuse verbatim. |
| Whole-ledger totals | `financeTotals()` | signed category totals + net | **Complete for current kinds; coarse labels** | Reuse; disclose net capital/refund and split deep `other` facts. |
| Period movement | `periodSummary(from,to)` | exact signed category totals, releases, completions | **Complete reconciliation; coarse contract bucket** | Reuse and extend deep breakdown. |
| Payroll now | `weeklyPayroll()` / `payrollSummary()` | current weekly contract cost | **Complete** | Reuse. |
| Ordinary overhead | `weeklyOverhead()` | base + per-contract overhead | **Complete component only** | Rename component; do not call complete operations. |
| Facility Opex now | `weeklyPlacementOperatingCost()` | operational placement weekly cost | **Complete engine component** | Add named finance selector/projection. |
| Weekly operating cost | `weeklyBurn()` | payroll + ordinary overhead | **Incomplete** | Repair to include facility Opex. |
| Next run receipt | `expectedWeeklyRunRevenue()` | sum next authoritative Studio Revenue | **Complete** | Reuse with exact label. |
| Remaining run receipts | `pipelineRunRevenue()` | sum remaining active-run Studio Revenue | **Complete** | Reuse. |
| Net weekly | `financeView().netWeeklyCash` | next receipt − incomplete burn | **Incomplete** | Repair input. |
| Runway | `runway()` | weeks/null, infinite, signed net | **Rule complete; basis incomplete** | Repair burn input; presentation state mapping in TypeScript/DTO. |
| Generic immediate commit | `commitmentPreview(state,amount)` | amount, before/after, affordability, post burn/runway | **Greenlight-oriented partial** | Generalize compatible preview envelope, do not discard selector. |
| Founding runway | `foundingRunwayPreview()` | post-founding payroll/ordinary overhead basis | **Incomplete once property Opex applies** | Compose with exact operational property state/effective timing. |
| Offer obligation | `offerObligation()` | weekly, guarantee, bonus, total | **Complete** | Reuse. |
| Signing/renewal consequence | `postSigningRunway()` | before/after runway, burn/cash after | **Partial due facility Opex** | Repair common basis; add legal/quote identity externally. |
| Contract horizon | Studio Calendar + employment selectors | renewal/expiry dates, salary, guarantee | **Complete current facts** | Project into Finance `Upcoming`. |
| Construction quote | `queryPlacement()` / placement quote/catalog | capex, Opex, weeks, completion, capacity, validity, affordability | **Complete economic/placement facts; no identity/revision/rotation** | Compose with cash-after/current/future pace and a new revision-bound construction intent in TS. |
| Construction retained view | `StudioConstructionView` | capex/time/cash/status/capacity | **Missing Opex** | Extend; replace false copy. |
| Run detail | `runView()` | gross total/paid; Studio Revenue paid/next/remaining/full | **Complete** | Reuse. |
| Film direct commitment | `filmCommittedCost()` | correlated production+freelancer rows | **Complete total when ledger provenance exists** | Centralize into core projection; explicit legacy/missing state. |
| Live budget split | `Production.budget` | negative, marketing | **Complete while live** | Freeze only if durable UI promises split. |
| Released budget split | `FilmResult` / ledger | combined production row | **Missing** | Show total or add future frozen fact; never infer. |
| Contribution | browser adapter run/release scorecards; core recap | adapter full-run Revenue − commitment; recap may use paid-to-date active Revenue | **Duplicated and inconsistent active basis; labels wrong** | Centralize Projected/Final Film Contribution from full-run Revenue; preserve paid-to-date as received cash only. |
| Allocated fixed cost | `allocateFixedCosts()` / recap | payroll+ordinary overhead distributed across occupancy | **Incomplete facility Opex; managerial only** | Repair before optional detail; keep out of Contribution. |
| Known calendar | `studioCalendar()` | receipts, construction, renewals, expiries | **Useful partial** | Build rolling known-flow projection later. |
| Sealed bridge pulse | `StudioTreasurySnapshot` | cash/burn/net/runway | **Shape useful; values inherit defect** | Extend after read-model repair. |
| Browser lot cash band | adapter snapshot | coarse presentational state | **Not authority** | Do not expose as risk law. |

## C2. Required P11A projection contract

TypeScript should publish a versioned, read-only Finance workspace projection with:

```text
FinanceProjection
  asOfWeek / recordedThroughWeek / stateRevision
  health
    cash
    weeklyPayroll
    weeklyStudioOperations
      ordinaryOverhead
      facilityOperatingCost
    weeklyOperatingCost
    nextScheduledStudioRevenue
    netWeeklyCashflow
    runwayState + runwayWeeks + exact basis/exclusions
  lastPeriod
    openingCash / closingCash / net
    typed categories with stable subject references
  payrollSummary
  obligationSummary
  filmRows
  historyAvailability
```

This is the **P11A** contract, not an instruction to duplicate every existing selector in a new state root. It may compose existing pure selectors. `obligationSummary` is a compact aggregate of current guaranteed contract facts, not the deferred obligation calendar or a renewal workflow. The projection must carry explicit `unavailable`/`legacy`/`notRecorded` provenance rather than zeros. `upcomingKnownEvents` and `financialAttention[]` are follow-up fields: current Calendar lacks facility-Opex onset and current cash bands are browser presentation only.

## C3. Required `FinancialConsequencePreview`

This is the common envelope for each **separately implemented** preview family. P11A implements construction only. Hiring, Renewal, employee release, and Greenlight retain their existing owning-package workflows until separately scoped; the tables below define compatibility, not simultaneous implementation authorization.

Universal envelope for every separately implemented family:

- preview/intent ID;
- generated week and state revision;
- action kind and stable subject IDs;
- legal/blocked/stale state and reason code/text;
- immediate signed cash movement;
- cash before/after;
- recurring delta and effective week, if any;
- weekly operating cost/net/runway after, if meaningful;
- known obligation, if any;
- operational consequence, if any;
- exclusions/uncertainty; and
- explicit action label.

The bridge conveys the projection; generated Unity DTOs mirror it; Unity renders and submits only its current opaque intent. Current generic placement has no such bridge intent or quote revision, so P11A must add that seam explicitly (or reuse it if Package 09 lands it first). No prose is parsed into rules.

---

# D. Finance Workspace Anatomy

## D1. Wide-screen allocation

```text
LOT RETAINED 34%                         FINANCE WORKSPACE 66%
┌──────────────────────┬───────────────────────────────────────────────────┐
│                      │ ‹ Back  ADMINISTRATION / FINANCE    Week 74      │
│  selected Admin      ├───────────────────────────────────────────────────┤
│  remains highlighted │ CASH           NET WEEKLY       RUNWAY           │
│                      │ $17.38M        ↓ $33K/week      ~526 weeks        │
│  camera unchanged    ├───────────────────────────────────────────────────┤
│                      │ Overview Costs Obligations Films Upcoming History │
│                      ├─────────────────────────┬─────────────────────────┤
│                      │ THIS WEEK               │ ATTENTION / UPCOMING    │
│                      │ exact reconciliation    │ grouped and actionable  │
│                      ├─────────────────────────┴─────────────────────────┤
│                      │ selected section / drill-down                    │
└──────────────────────┴───────────────────────────────────────────────────┘
```

- Workspace uses approximately 62–68% of a wide display.
- The retained lot is not an interactive sliver: Administration identity/highlight and camera context remain legible.
- At narrow widths, Finance becomes full screen; Back still restores exact lot context.
- Opening, switching tabs, receiving a weekly update, and closing cause no automatic camera motion.

## D2. Sticky header

1. **Back** — returns to exact origin; restores prior modal/workspace if Finance was a nested route.
2. **Owner identity** — Administration / Finance, never a global disembodied “Dashboard.”
3. **As-of period** — `Week 74 · recorded through Week 73` where current tick has not yet been charged.
4. **Provenance chip** — `Complete recorded history`, `History begins Week 52`, or `Legacy finance detail limited`.
5. Optional global actions: `Locate Administration`; no camera travel until explicitly selected.

## D3. Financial health strip

| Element | Content | Type hierarchy | Interaction |
|---|---|---|---|
| Cash | exact literal amount | 32–40 px, strongest | opens Cash Movement detail |
| Net weekly cashflow | signed next-week pace + basis label | 24–28 px | opens recurring components |
| Runway | conditional authored state/weeks | 20–24 px | opens basis/exclusions; absent or phrase when positive |

Never show an unexplained risk grade. Direction uses arrow + sign + text; color is redundant.

## D4. Overview above the fold

Left: exact `This Week` reconciliation. Right in P11A: compact recurring-cost context and the active-film capital summary. A future core-authored financial-attention/known-flow projection may occupy this region; P11A does not reuse browser cash bands or invent facility-Opex calendar events. Avoid displaying every all-time total before the current problem.

## D5. Navigation sections

### Overview

- health strip;
- last authoritative period;
- top recurring drivers;
- future grouped attention/known upcoming only after core projection exists.

### Costs

- Payroll;
- ordinary overhead;
- facility operating costs;
- one-time set repairs in the selected period;
- film direct commitments;
- capital spending/recovered;
- signing/freelancer/termination/publicity.

### Obligations

- current weekly payroll;
- remaining guarantees;
- renewal and expiry cohorts;
- current quote links, never auto-renew.

### Films

- compact portfolio;
- selected Film Economics;
- exact active-run receipts.

### Upcoming — FOLLOW-UP, not P11A

- already-locked receipts;
- accepted construction completion;
- facility Opex onset only after a dedicated TypeScript event is added (current Calendar does not publish it);
- contract windows/expiries;
- explicit exclusions.

### History

- rolling 13/52-week period;
- exact category totals;
- optional approved charts;
- raw entries on demand;
- missing-history boundary.

## D6. Typography and density

- Body text 16–18 px at reference desktop scale.
- Table labels 14–16 px; metadata no smaller than 13 px.
- Primary signed amounts align by decimal/units and include +/−.
- Row height supports portrait/icon only where identity is useful; finance categories need not become cards.
- No information exists only in hover; focus/click exposes the same definition.
- Tooltips explain basis/exclusions in two to four lines, never encode rules.

## D7. Live update contract

If time advances while Finance is open:

- state revision and as-of week update atomically;
- selected subject stays selected if it still exists;
- table/filter/scroll stay stable;
- changed values use restrained one-cycle emphasis;
- no replayed receipt animation or forced tab switch;
- a now-stale preview moves to `Needs refresh`, disables commit, and requests a new authoritative quote.

---

# E. Film Economics Anatomy

## E1. Header

```text
NIGHT HARBOR                         IN THEATERS · WEEK 2 OF 6
[Open Film Result] [Open Production/Chronicle] [Locate Theater when valid]
```

Use stable production ID behind the title. Phase badge is TypeScript-authored. The route available depends on current phase.

## E2. Cost block

1. **Direct film commitment** — largest cost headline.
2. Production + marketing combined total if only combined provenance survives.
3. Separate `Production commitment`, `Marketing commitment`, and `Freelancer fees` only where frozen facts exist.
4. `Paid at Greenlight` timing label.
5. Explicit exclusion: `Studio payroll and operations are shown separately and are not included.`

Do not show `Remaining budget`, `Spend to date`, or `Over budget` under current law.

## E3. Return block

1. **Theatrical Gross** — audience spend.
2. **Locked studio share/model** under More Details.
3. **Studio Revenue received** — already credited cash.
4. **Next scheduled Studio Revenue** and week.
5. **Studio Revenue scheduled** — remaining locked receipts.
6. **Full-run Studio Revenue** — received + scheduled.

## E4. Outcome block

```text
PROJECTED FILM CONTRIBUTION      +$3.6M
Full-run Studio Revenue − Direct film commitment
Before studio payroll and operations
```

Change to `FINAL FILM CONTRIBUTION` only after the run has settled. Use `Positive`, `Negative`, or no prose; never `Profitable` unless the label is explicitly `Contribution positive`.

## E5. More Details

- release tick/date;
- run model/version and locked share;
- gross paid versus scheduled where applicable;
- exact correlated ledger rows;
- legacy/current provenance;
- missing-record explanations;
- optional repaired managerial allocation, clearly subordinate.

## E6. Phase states

| Phase | Cost | Revenue | Contribution label |
|---|---|---|---|
| Development/Package | `Not committed` | `Not known` | absent |
| Production/Post/Release Ready | `Direct commitment paid` | `Not yet known` | absent |
| In Theaters | commitment exact | received + scheduled | **Projected Film Contribution** |
| Run complete | commitment exact | final Studio Revenue | **Final Film Contribution** |
| Legacy/missing cost | `Not recorded` | exact available revenue with provenance | unavailable, never guessed |

---

# F. Portfolio Anatomy

## F1. Default columns

1. **Film** — title + optional small identity art; stable ID internally.
2. **Phase** — current authored phase or completed release date.
3. **Direct commitment** — `Not committed`, `Paid $X`, or `Not recorded`.
4. **Studio Revenue** — `Not known`, received/scheduled pair, or final.
5. **Film Contribution** — projected/final/unavailable.
6. **Decision / next event** — at most one authoritative status/action.

Recommended wide layout is six columns; narrow layout converts each row to a two-line card with primary values aligned. No 20-column financial table.

## F2. Filters and sort

- Filter: All active, Development/Package, Production, Post/Release Ready, In Theaters, Completed.
- Default sort: unresolved authoritative decision or blocker → pipeline phase/time → title.
- Optional sort: largest direct commitment, scheduled Studio Revenue, projected/final Contribution.
- Search by title.
- Retain filter, sort, selected row, and scroll across detail/Back.

## F3. Row actions

- single click selects row and opens summary detail;
- `Open Film Economics` opens detailed panel;
- `Open Production`, `Open Result`, `Open Chronicle` use authoritative phase;
- `Locate` exists only for a current physical owner (Stage/Post/Theater) and never infers from title;
- no row action commits release, production, or budget.

## F4. Empty/missing/multi-film states

- No films: explain that film capital appears here after a package is committed; route to nothing automatically.
- Several same-title films: IDs and release dates keep rows distinct.
- Multiple runs: received/scheduled totals sum at studio level but rows retain independent shares/schedules.
- Missing historic direct cost: show `Not recorded`; do not drop the film.
- A stale deleted/unavailable live target retains historical Film Economics but disables Locate.

---

# G. Financial Consequence Preview Anatomy

This anatomy is a shared design language, not a mandate to build all families in P11A. P11A proves G1 + G5 construction only.

## G1. Universal hierarchy

```text
ACTION IDENTITY
Subject · Current quote as of Week N

IMMEDIATE
Cash movement                       -$X
Cash now                             $A
Cash after                           $B

ONGOING / EFFECTIVE DATE
Weekly recurring change              +$C/week · begins Week M
Weekly operating cost after           $D/week
Net weekly cashflow after              ±$E/week
Approx. runway after                  F weeks / positive at current pace

OBLIGATION / OPERATION
action-specific exact facts

WHAT IS UNKNOWN / EXCLUDED
short honest statement

[Back]                         [Explicit action name]
```

Universal rows are omitted when not applicable, never filled with misleading zero. Immediate and future sections never share an unlabeled total.

## G2. Hiring preview

Required:

- exact person/offer/term;
- signing bonus now and cash after;
- weekly salary;
- real weekly recurring delta, including only authored seat/base effect;
- payroll after, net weekly after, runway after;
- guaranteed salary and total obligation;
- founding recruitment-fund source when founding, clearly separate from Cash;
- availability/role consequence link; and
- authoritative affordability/refusal.

Do not add predicted career return, contract “value,” or salary recommendation.

## G3. Renewal preview

Required:

- current contract versus proposed term/weekly salary;
- signing bonus and cash after;
- weekly salary delta, not a false additional employee cost;
- replacement guarantee/total obligation;
- new end week/date;
- post-payroll/net/runway;
- exact legal window/current quote/revision; and
- explicit `Renew <name>` confirmation.

## G4. Early-release preview

Required:

- exact termination payment;
- cash after, including negative result;
- weekly payroll relief/effective week;
- current remaining guarantee and what current action extinguishes;
- active screenplay/production blocker and Locate;
- warning that current law can take cash negative; and
- explicit irreversible action.

Do not imply severance, morale, reputation, or future hiring consequences absent from authority.

## G5. Construction preview

Required:

- exact blueprint/site/footprint;
- capital cost and cash after;
- build duration/completion week;
- Opex delta with **operational effective week**;
- current versus operational future pace/runway when TypeScript supplies both;
- capacity/capability;
- placement legality and exact reason;
- quote/revision; and
- explicit `Commit Construction`.

Do not call future operating cost due immediately. Do not compute after-values in Unity.

## G6. Greenlight preview

Required:

- title/package identity;
- production negative, marketing, freelancer fees;
- direct immediate total, cash after;
- recurring studio cost after (normally unchanged under current law); existing contracted payroll as context, not charged again;
- post-runway current-pacing basis;
- capacity/assignment consequence from Package 04/05;
- return explicitly uncertain; and
- explicit `Greenlight <title>`.

Do not say `budget and salaries now` for contracted staff. Do not net a forecast against the debit.

## G7. Release commitment preview

Package 06 owns the Release action. Finance shows a cost only if current authority actually charges one. Current release authorization itself must not receive a decorative `$0` finance panel. If publicity/marketing is a separate real action, show its exact typed cost and owner; do not duplicate a Greenlight commitment.

## G8. Stale preview state

```text
THIS QUOTE CHANGED
Cash changed since this preview.
Old cash after: $2.10M
Current cash after: $1.62M
[Review current consequence]
```

Only exact changed fields appear. Confirm is disabled until refresh. No client-side retry mutation, no generic `Something went wrong`, and no duplicate debit.

---

# H. Cash Movement Anatomy

## H1. Summary block

Required fields:

- period identity (`Week 74` or inclusive weeks);
- opening cash;
- typed signed category lines;
- net cash movement;
- closing cash;
- reconciliation status/provenance.

Formula rendered as help text:

> Opening Cash + Net cash movement = Closing Cash.

## H2. Category order

1. Studio Revenue;
2. legacy box-office receipts where relevant/provenance-specific;
3. Payroll;
4. Studio Operations — ordinary overhead + facility Opex;
5. Film commitments;
6. Publicity;
7. Capital spending / recovered;
8. Signing bonuses;
9. Freelancer fees;
10. Termination payments;
11. One-time set repair;
12. future new kinds only after typed inclusion.

Zero rows may collapse. Positive refunds/revenue retain positive sign. One-time set repair may currently reside in the technical overhead reporting bucket but receives a distinct player-facing deep row when provenance is available.

## H3. Drill-down row

| Week | Category | Subject | Amount | State/provenance | Route |
|---|---|---|---:|---|---|

Subject comes from stable IDs or recorded authoritative description. If a current ledger row lacks a durable subject ID, show the exact typed category and `Studio-wide`; never guess a film/facility/person.

## H4. Recent history

- rolling 13/52-week controls;
- summary grouped by week/category;
- exact selected-week reconciliation;
- annotations only from typed events/IDs;
- old-save gap state;
- no manual entry, recategorization, or delete.

---

# I. Financial Attention Matrix

This matrix specifies the target severity grammar. P11A adds **no new finance-attention classifier**: it renders INFO facts and current action-local decisions/blockers only. Any row that depends on materiality, `cash <= 0` escalation, or grouped Finance attention is FOLLOW-UP until TypeScript publishes its condition, severity, and reason. Existing browser cash bands are never promoted into this table as authority.

| Authoritative state | Level | Surface | Copy/facts | Action |
|---|---|---|---|---|
| Routine positive/negative weekly movement | **INFO** | HUD signed pulse; Finance Overview | exact signed amount and period | Open Finance optionally |
| Active-run receipt posts | **INFO** | Theater/film pulse; `This Week` | title, Studio Revenue amount, week of run | Open Film Economics |
| Construction capex posts | **INFO** | site receipt; `This Week` annotation | facility/site and exact debit | Locate construction site |
| Facility begins Opex | **INFO** | facility completion receipt + next Finance update | exact recurring delta/effective week | Open Facility / Finance |
| Recurring net changes sign | **INFO** normally; **ATTENTION** only under authored materiality rule | Administration/HUD | old/new signed pace and primary published driver | Open Finance |
| Cash ≤ 0 | **FOLLOW-UP ATTENTION; INFO in P11A** | HUD + Administration; no modal/camera | Cash, recurring pace, known next receipt, current gate consequence | Open Finance |
| Current quote unaffordable | **BLOCKING** | action-local preview | required, cash, shortfall, exact reason | Back / Open Finance |
| Quote/state changed before commit | **DECISION** | open preview | exact changed field(s) | Refresh/review |
| Renewal cohort future | **FOLLOW-UP ATTENTION; current Calendar fact** | Admin, Finance Upcoming, Calendar | count, window-open date, weekly/guaranteed exposure | Review Contracts |
| Renewal legal now | **DECISION** | grouped Administration/Finance/Roster item | people, deadline, exact current quotes | Review cohort |
| Contract expiry processed | **INFO** or **ATTENTION** if staffing blocker results | period summary / roster | person, ended contract, resulting exact availability/blocker | Open Person/affected workflow |
| Early release can make cash negative | **DECISION** | consequence preview | payment, cash after, weekly relief, assignment consequence | Explicit release / Back |
| Known large obligation | **FOLLOW-UP ATTENTION** only if TypeScript authors materiality | Finance Upcoming | amount, date, subject, basis | Open exact obligation |
| Greenlight accepted | **INFO** | package/production receipt + period row | direct commitment and cash after | Open Production/Finance |
| Greenlight insufficient cash | **BLOCKING** | Greenlight consequence sheet | shortfall and exact gate | Back / Open Finance |
| Film Contribution projected positive/negative | **INFO** | Film Economics/Portfolio | projected contribution + remaining receipts | Open Film Result |
| Film Contribution final | **INFO**; emotional significance remains Package 07 | Film Result/Finance Portfolio | final contribution and exclusions | Open Film Autopsy |
| No active run / no receipt pipeline | no attention | Finance empty state | factual empty state | none |
| Missing old-save history | no attention | History provenance | recorded start boundary | none |

## Attention implementation law

- TypeScript publishes condition/reason/severity if severity affects UI behavior.
- Group repeated subjects into one item with count and filter route.
- INFO never pauses. Finance opening never pauses. No finance state moves camera.
- Resolved conditions disappear at the next accepted snapshot, even if resolved from another surface.
- Unity does not escalate based on color, numerical thresholds, or prose.

---

# J. Finance History Retention Matrix

| Fact | Persist / Derive / Summarize / Discard | Authority | Why |
|---|---|---|---|
| Current cash | **Persist** | `GameState.studio.cash` | Core truth. |
| Signed ledger row | **Persist** under current save contract | `GameState.ledger` | Exact cash provenance/reconciliation. |
| Ledger migration checkpoint | **Persist** | save migration | Preserves opaque pre-ledger net without invented detail. |
| Weekly movement category totals | **Derive** | ledger + `periodSummary()` | Avoid duplicate accounting state. |
| Opening/closing cash per week | **Derive where complete; summarize/checkpoint later** | ledger/checkpoint | Exact chart/reconciliation. |
| Current recurring payroll | **Derive** | active contracts | Changes with term/state; no duplicate snapshot. |
| Historical payroll paid | **Derive** | payroll ledger rows | Exact period fact; per-person allocation only if recorded. |
| Current ordinary overhead/facility Opex | **Derive** | current contracts/operational placements | Current pace. |
| Historical Studio Operations | **Derive** | overhead + facilityOpex rows; one-time repair separated in deep view | Exact recorded period cost. |
| Contract current guarantee | **Derive** | contract + current week | Avoid stale stored totals. |
| Major contract event | **Persist via contract/ledger/career authority when already present** | TypeScript | Durable obligation/career provenance. |
| Construction capex/refund | **Persist** | ledger + placement history | Material physical capital event. |
| Facility asset value/depreciation | **Discard / absent** | no authority | Do not invent balance sheet. |
| Film direct commitment total | **Derive** | correlated production/freelancer rows | Canonical direct cost where provenance exists. |
| Production vs marketing historic split | **Persist in future if promised; otherwise unavailable** | future frozen Greenlight fact | Current combined row cannot reconstruct it. |
| Theatrical Gross | **Persist** | `FilmResult`/run | Durable audience result. |
| Studio Revenue received/scheduled | **Derive** | locked run/counters/ledger | Exact commercial cash lifecycle. |
| Film Contribution | **Derive** | Studio Revenue − direct commitment | Avoid separate mutable truth. |
| Managerial allocated fixed cost | **Derive** | recorded recurring-cost ledger + declared occupancy | Convention can be recomputed and basis named. |
| 13/52-week chart | **Derive/cache** | recorded facts | Presentation only. |
| Yearly finance summary | **Summarize later** | typed ledger categories | 120-year scale/performance. |
| Highest/lowest cash | **Derive only across complete history** | cash history/checkpoints | No false legacy record. |
| Significant financial milestone | **Persist only if Package 08 authors significance** | Studio History | Avoid logging routine finance noise. |
| Forecast snapshot | **Discard after stale; persist only if another package explicitly freezes it** | preview projection | Preview is not a transaction/fact. |
| Workspace filter/sort/scroll | **Presentation state only** | client | Context restoration, not finance authority. |
| Generated prose/reason sentence | **Discard/regenerate from typed facts** | client localization | Prevent stale causality/save bloat. |
| Pre-ledger invented itemization | **Discard / forbidden** | none | Old-save honesty. |

---

# K. Edge / State Matrix

| State / edge | Authoritative truth | Finance presentation | Legal action / fail-closed rule | PASS evidence |
|---|---|---|---|---|
| Cash positive | exact literal cash | ordinary cash amount; no inferred health grade | current legal actions from TypeScript | value equals snapshot; no reserve subtraction |
| Cash positive but potentially “low” | no core low-cash classifier exists | show Cash, recurring pace, Runway, and exact obligations without a `Low` badge | current legal actions only | no client-authored threshold or color escalation |
| Cash exactly zero | literal zero | `$0 Cash`; recurring pace separately | affordability governs each action | no `Debt` label or negative runway |
| Cash negative | literal negative; no bankruptcy | `In the red`, known pace/receipts, gates | unavoidable time may continue; voluntary actions current law | no loan/game-over invented |
| Positive weekly cashflow | next active-run revenue exceeds complete recurring cost | `↑ $X/week · current pace`; `Cashflow positive at current pace` | none | no `∞`, no long-term guarantee |
| Negative weekly cashflow | complete recurring cost exceeds next receipt | `↓ $X/week`; approximate runway if cash positive | none by default | one-time purchases excluded |
| Near-zero weekly pace | TypeScript epsilon/state | `Cashflow steady at current pace` | none | no absurd multi-million-week runway |
| No active runs | next receipt zero | recurring cost and net are identical signed outflow | none | no scheduled revenue invented |
| Insufficient funds | authoritative solvency gate rejects | exact cost/cash/shortfall/reason | commit disabled/rejected; state unchanged | no client debit or optimistic animation |
| Large one-time construction purchase | capex ledger row; facility not yet operational | `This Week` capital event; recurring pace unchanged until completion | construction/site persists if accepted | no capex inside weekly operating cost |
| Construction becomes operational | tick completion then Opex begins next advance per current law | completion world receipt; Opex effective week named | facility capability appears authoritatively | no early Opex charge/presentation |
| Construction quote stale | **required P11A seam:** submitted preview carries expected state revision/intent identity; current generic quote does not | `Quote changed`, exact refreshed fields | must review current quote; no auto-submit | new command contract proves one debit/site maximum |
| New employee signing | bonus now, salary/seat cost recurring, guarantee | immediate/recurring/obligation sections | exact offer and affordability | founding fund separated from cash |
| Renewal | bonus now, replacement salary/term | before/after salary delta and guarantee | only current legal window/quote | no false new-seat overhead |
| Contract near expiry but renewal not legal | exact future window | upcoming date; no active Renew | route to contract only | early visibility ≠ early action |
| Contract expired | final payroll charged then contract inactive | period cash remains; future payroll removes it | current employment law | no retroactive refund |
| Early release obligation | termination payment; may overdraw | irreversible warning, cash after, payroll relief | exact assignment blocker/current law | no ordinary afford gate imposed |
| Development active | no separate development debit today | portfolio phase; no invented spend-to-date | Package 03 actions | `$0` not misread as free total lifecycle |
| Production active | direct commitment prepaid | paid commitment; studio payroll context; revenue unknown | Package 05 actions | no over-budget/remaining spend |
| Post active | no separate Post debit today | same direct commitment; no fake Post line | Package 06 actions | no fabricated edit cost |
| One film releasing | locked run pays weekly | Gross, received, next, scheduled, projected Contribution | autonomous tick | Gross never shown as cash received |
| Multiple films releasing | each run has own ID/share/schedule | independent rows; studio totals sum all | autonomous tick | no cross-film receipt/cost contamination |
| Scheduled revenue outstanding | run active with remaining schedule | received + scheduled + next week | time advances authority | contribution marked Projected |
| Run ends | final receipt posted/status complete | final Studio Revenue/Contribution | history route | `Projected` removed exactly then |
| Contribution negative | Studio Revenue < direct commitment | `Final/Projected Film Contribution -$X`; exclusions | Film Autopsy route | never `Net loss`/bankruptcy alert |
| Contribution positive | Studio Revenue > direct commitment | `+Film Contribution`; exclusions | Film Autopsy route | never full Profit claim |
| Missing production/marketing split | only combined row retained | direct total; sub-lines `Not recorded` | none | no reconstruction from tuning |
| Legacy one-lump box office | legacy run/provenance | explicit legacy receipt/full-gross model | none | no forced current share/schedule |
| Publicity studio-level row | no production ID | Studio-wide publicity period cost | exact Publicity route if available | not attached to nearest film |
| Set repair | one-time `setMaintenance` row | exact period repair event; not recurring | current set action | not included in weekly burn |
| Multiple active productions | stable IDs and physical capacity | portfolio isolation; aggregate capital only by sum | Package 05/operations | no global cap invented |
| No active productions | empty portfolio phase | helpful empty state, historic films retained | none | no fake zero-cost film |
| Old save without full ledger history | migrated cash/checkpoint/current facts | `Recorded history begins…`; current truth available | none | no fabricated prior chart |
| Old film without direct-cost provenance | FilmResult exists, ledger correlation absent | result/revenue retained; cost/contribution unavailable | none | row remains accessible |
| Save/load during construction | site/quote/cash/ledger saved | site and current Finance truth restore | new preview required for mutation | no replayed purchase |
| Save/load during theatrical run | run counters/schedule saved | exact received/next/remaining restore | tick authority | no duplicate receipt |
| Reconnect while Finance open | snapshot revision advances | selection retained if valid; values atomically refresh | cached previews stale | no partial mixed-revision screen |
| Result arrives while another workspace open | authoritative snapshot/event | grouped non-blocking pulse; current work retained | explicit open result | no forced modal/camera |
| Selected film removed from active state | durable result/history may remain | selected route transitions to historical state or exact unavailable | no guessed replacement | stable ID or clear loss state |
| Selected facility demolished | authoritative removal/refund | Finance period retains row; live Locate disabled | Back preserves context | no targeting recycled ID |
| Duplicate construction commit | **required P11A seam:** command identity/replay rule; current browser placement has no generic bridge idempotency | one receipt; refreshed current state | replay rejected or returns prior accepted result without a second mutation | new command contract proves one ledger row/site maximum |
| Unknown future ledger kind | compile/schema exhaustiveness | no silent `Other` fallback | projection fails build until mapped | category/provenance explicit |

---

# L. Golden UX Journeys

These are product journeys, not test-framework prescriptions. Each PASS criterion requires the visible result and authoritative state to agree.

## L1. Glance at financial health

1. Operate on the lot at normal management zoom.
2. Read Cash and the signed `/week` pulse without opening a panel.
3. Hover/focus for the basis.

**PASS:** Cash equals TypeScript; signed pace equals complete current recurring projection; one-time activity is excluded; positive/negative meaning is redundant beyond color; no spreadsheet or camera motion appears.

## L2. Select Administration

1. Single-click Administration.
2. Keep camera and zoom fixed.
3. Read local Cash, Net weekly cashflow, and conditional Runway.

**PASS:** Administration remains selected/highlighted; no generic memo is required; no more than three major figures appear; no presentation-only risk/attention badge is promoted; all values come from one snapshot revision.

## L3. Open Finance from the lot

1. Activate `Open Finance` from Administration.
2. Retain the lot and selected building.

**PASS:** retained workspace opens at Overview; Administration/camera/route survive; no automatic time pause or camera travel; Back origin is recorded.

## L4. Understand why weekly cash changed

1. Read `This Week` opening Cash.
2. Inspect typed signed category rows.
3. Confirm net movement and closing Cash.
4. Expand one category.

**PASS:** opening + net = closing exactly; all ledger kinds in the period have an explicit home; set repair is one-time; no opaque unexplained balance remains.

## L5. Distinguish capital purchase from recurring loss

1. Complete a week containing a large construction commitment.
2. Open Finance.
3. Compare `This Week` and current recurring pace.

**PASS:** capital debit appears as named one-time movement; Weekly operating cost is not inflated by capex; future facility Opex is named with its operational effective week.

## L6. Inspect payroll

1. Open Costs → Payroll.
2. Review role-group totals.
3. Select a person.
4. Open their exact contract.

**PASS:** role groups sum to current weekly payroll; freelancer fees/bonuses/terminations are absent from payroll; Profile opens exact person and Back restores Payroll filter/scroll.

## L7. Inspect contract commitments

1. Open Obligations.
2. Read weekly payroll, remaining guarantees, and renewal/expiry cohorts.
3. Select a cohort then a person.

**PASS:** obligations are not subtracted from Cash; dates match contract/calendar authority; a future window is visible but cannot be acted on early; no duplicate contract math exists in client.

## L8. Inspect an active film cost

1. Open Films.
2. Select a currently shooting film.
3. Read direct commitment and current studio-payroll context.

**PASS:** direct commitment matches correlated production/freelancer ledger rows; no spend-to-date, remaining budget, over-budget, or unknown return is fabricated; contracted salary is not charged again.

## L9. Inspect a released film's economics

1. Select an active theatrical run.
2. Read Gross, locked Studio Revenue received/next/scheduled, and Projected Contribution.
3. Open More Details.

**PASS:** Gross never equals Cash by implication; received + scheduled = full-run Studio Revenue; Contribution = Studio Revenue − direct commitment; `Projected` remains until final receipt; exclusion line is visible.

## L10. Compare two films

1. Sort Portfolio by Film Contribution.
2. Compare one completed and one active-run film.
3. Open and Back between them.

**PASS:** completed row says Final, active row says Projected; stable IDs prevent cross-wiring; same definitions/columns align; filter/sort/scroll survive; no Profit/ROI label appears.

## L11. Preview construction

1. From Package 09 Build mode choose a legal facility site.
2. Open/expand its consequence sheet.
3. Read capex, Cash after, duration, future Opex/effective week, Runway basis, and capacity.
4. Cancel.

**PASS:** cancel mutates nothing; immediate and operational moments are separate; every after-value comes from current TypeScript preview; exact lot ghost/context remains.

## L12. Preview a talent signing

1. Select an available authoritative candidate and offer.
2. Read signing bonus, Cash after, salary, total guarantee, payroll/runway after.
3. Cancel.

**PASS:** founding fund is separate if founding; operating signing uses Cash; new-seat recurring effect is exact; cancel creates no contract/ledger row; no career-return score is shown.

## L13. Preview renewal

1. Open a legally renewable person's current contract.
2. Compare current versus proposed salary/term.
3. Read bonus, salary delta, replacement obligation, cash/payroll/runway after.
4. Back out.

**PASS:** renewal does not add a false new employee overhead; quote/current week match; no contract or bonus row is created on cancel; Finance context can be restored.

## L14. Preview Greenlight

1. Complete Package 04 package requirements.
2. Open Greenlight review.
3. Read production, marketing, freelancer, cash-after, recurring context, and uncertainty.

**PASS:** contracted salaries remain studio payroll, not immediate film cost; return is not netted or guaranteed; direct total matches action law; explicit title-named confirmation remains unpressed.

## L15. Insufficient-cash refusal

1. Open a currently unaffordable material action.
2. Inspect the consequence sheet.
3. Attempt commit if the UI allows authoritative submission testing.

**PASS:** exact requirement/cash/shortfall/reason appear; state remains unchanged; no optimistic animation/receipt; `Open Finance` is available without camera hijack; no loan prompt is invented.

## L16. Stale quote failure

1. Open the P11A revision-bound construction consequence preview.
2. Advance/change authoritative state elsewhere so cash/legality changes.
3. Submit the old preview.

**PASS:** the newly added expected-revision/intent law rejects it; exact changed fields appear in a refreshed preview; no duplicate debit/action/world change; user parameters/context are retained where still valid. This is acceptance evidence for the P11A seam, not a claim about current generic placement.

## L17. Locate relevant film/person/building

1. From a Payroll, Film, or Facility finance row choose `Locate`.
2. Observe explicit camera focus.
3. Use Back.

**PASS:** exact stable subject is targeted; historical/off-lot subject disables Locate with reason; no automatic Locate occurs on selection; Back restores Finance selection/filter/scroll and previous camera when defined by Package 02.

## L18. Exact Back to lot

1. Enter Finance from selected Administration.
2. Navigate Costs → Payroll → Person contract, then Back twice to Finance.
3. Close Finance.

**PASS:** each Back restores the exact prior layer; lot returns with Administration selected, camera/zoom unchanged, no surprise Focus, and live time state preserved.

## L19. Save/reconnect during Finance

1. Open Finance with an active production, construction site, and theatrical run.
2. Save, restart/reconnect, and reload.
3. Reopen Finance.

**PASS:** cash/ledger/contracts/site/run counters reconcile; no payment/commit animation replays; selected context restores only if valid; every old preview is discarded and must refresh.

## L20. Multi-film portfolio

1. Maintain two active productions and two active theatrical runs.
2. Open Films and inspect each row.
3. Advance one authoritative week.

**PASS:** every run credits independently; studio totals equal the sum; each cost/receipt remains on the correct production ID; sorting does not change simulation order; no one-film assumption appears.

## L21. Old save without historical finance

1. Load a migrated save whose earlier cash movement is checkpointed but not itemized.
2. Open History and a historical Film record.

**PASS:** current Cash and current obligations remain exact; Finance names the recorded-history boundary; unavailable budget splits say `Not recorded`; no invented chart/ledger/profit appears.

## L22. Runway edge states

1. Exercise negative cashflow, positive cashflow, near-zero pace, and negative cash fixtures.
2. Inspect HUD, Administration, Finance, and a consequence preview.

**PASS:** one TypeScript state maps consistently everywhere; positive says `Cashflow positive at current pace`, near-zero says steady, negative cash says `In the red`, and no client displays infinity/negative weeks or performs its own arithmetic.

---

# M. Fable Implementation Map

## REUSE

- Literal Cash, signed ledger kinds/rows, current tick ordering, and V14 save/migration law.
- `financeTotals()` and `periodSummary()` as the recorded reconciliation foundation.
- `weeklyPayroll()`, `weeklySalary()`, `guaranteedComp()`, current renewal/termination/action law.
- `offerObligation()`, `postSigningRunway()`, and `commitmentPreview()` as selector precedents.
- `queryPlacement()` / `studioPlacementView()` plus the blueprint catalog for capex, duration, completion, Opex, capacity, validity, and affordability.
- locked theatrical-run schedule/share/counters and `runView()` received/next/remaining/full revenue.
- direct Film Contribution formula and Package 07 Gross/Studio Revenue/Contribution terminology.
- Package 02 Notice → Select → local understand → retained workspace → exact Back/Locate grammar.
- sealed bridge state-revision/opaque-intent/rejection pattern.
- sealed Unity cash/signed-weekly HUD presentation behavior, not its current incomplete input.

## BUILD NEXT

**P11A — Executive Finance Spine V1**, bounded to:

1. behavior-neutral recurring-cost projection repair for facility Opex;
2. typed Finance projection and bridge/DTO extension;
3. Administration compact inspector: Cash, Net weekly, and conditional Runway; no new attention classifier;
4. retained Finance shell with exact context restoration;
5. `This Week` reconciled movement;
6. Payroll, compact current contract obligations, and Studio Operations overview/drill-down;
7. one Film Economics detail using Direct Commitment / received/scheduled Studio Revenue / Contribution;
8. one Finance-composed consequence preview built from `queryPlacement()` / `studioPlacementView()`, plus a new revision-bound construction bridge intent (or the exact Package 09 seam if it lands first);
9. stale/refusal/duplicate-submit tests for that new seam, plus multi-film/old-save/finance edge-state tests; and
10. no production/economy tuning.

P11A stops before full accounting/history/chart implementation and before other decision-preview families.

## EXTEND

- `weeklyBurn()`/`FinanceView` with a named recurring facility-Opex component and complete totals.
- fixed-cost allocation only after the same repair; retain managerial/noncanonical status.
- `PeriodSummary`/deep cash movement so signing, freelancer, termination, and one-time repair are not opaque `Other`.
- retained construction view to expose current Opex and remove false “no recurring charge” copy.
- bridge finance projection from pure TypeScript selectors.
- Film result/portfolio copy to use Projected/Final Film Contribution instead of Profit/ROI.
- Studio Calendar into a known-flow `Upcoming` Finance lens.
- future consequence previews for hire, renewal, release employee, and Greenlight using the same envelope.
- durable Greenlight cost split only if Film Chronicle/Finance product requires it.

## DO NOT REBUILD

- economy tick, ledger, cash, theatrical schedule/share, contract, affordability, placement, or save law;
- Development, Casting, Production, Post, Release, Film Autopsy, Construction, or Person Profile workflows;
- Unity-side finance math or prose parsing;
- a second financial clock, ledger, cash balance, production cost, or contribution calculation;
- Package 07's public-result information architecture beyond finance links;
- Package 10's contract/profile/hiring experience; or
- Package 09's placement legality and world construction experience.

## DEFER

- full 13/52-week charts and yearly summaries;
- comprehensive known-flow calendar;
- repaired optional managerial fixed-cost attribution in Film Economics;
- full multi-film portfolio polish;
- risk classifier/materiality thresholds;
- canonical film-profit/overhead allocation;
- ledger compaction/120-year archive architecture;
- loans, credit facilities, investors, taxes, insolvency/recovery/failure;
- inflation, unions, agents, distribution, television/streaming finance, and era-specific business models.

## OWNER DECISIONS REQUIRED

**None before P11A.**

Future gated decisions—not P11A blockers—are:

1. ultimate bankruptcy/failure/recovery policy;
2. whether any external financing system exists; and
3. whether studio-wide costs ever become a canonical film-profit allocation rather than an explicitly managerial view.

The safe defaults until those rulings are: recoverable negative cash, no external financing, and Film Contribution before studio payroll/operations.
