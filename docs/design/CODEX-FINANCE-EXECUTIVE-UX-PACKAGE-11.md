# PROJECT: STUDIO — PACKAGE 11

# Finance, Accounting & Executive Decision UX

Status: **decision-ready design research; documentation only; no economy retuning**<br>
Research branch: `codex/finance-executive-ux-research-11`<br>
Canonical baseline: `c902a704eb948cc576083d0973c8c23e59937dc1` (`hspector-github/main`)<br>
Relevant sealed/runtime evidence inspected read-only: TypeScript CP9 `44615e5`; Unity CP9 `911e87e6aeed6e185ccf6a8d77aff9ec455b404f`; frozen economy audits `e6c10c3880c8e843004bd2c57833b09b92efa899`, `159fb7a31f0f125843b11607597dcbd6741e7505`, and `07e8ec8a2d929b40217eece16cfb8c66548081cb`<br>
Authority date: 25 August 2026

This package changes no production code, economy law, bridge schema, Unity asset, browser UI, test, save, dependency, or tuning. Package 09's `$20M / $1.5M / 14 weeks / $5.5K weekly / +2 slots` opening envelope remains **prototype tuning only** and is neither validated nor promoted here.

## Evidence notation

- **[FACT — PRIMARY]** directly verified in an official manual or shipped data with stated provenance.
- **[FACT — DEVELOPER-REVIEWED GUIDE]** verified in the Prima Official eGuide, whose acknowledgments credit Lionhead staff Adrian Moore, Ollie Purkiss, Tadhg Kelly, and Tim Spencer with review/content support; the local source register documents that provenance. It controls formula/detail gaps under the Owner's stated source order but remains distinct from the official manual.
- **[FACT — SECONDARY]** directly observed in a contemporary guide or review; never used alone for hidden mechanics.
- **[CODE]** verified in the named Project: Studio source at the canonical baseline.
- **[SEALED]** verified read-only on the supplied sealed TypeScript/Unity pair or another named branch.
- **[FROZEN AUDIT]** a finding already established by the three economy research packages; this package does not reopen it.
- **[INFERENCE]** the narrowest interpretation supported by several facts.
- **[RULING]** the Project: Studio design decision made by this package.

Historical page references use the source's printed page number where available. “Current” means the recorded baseline or explicitly named sealed authority, not an aspiration in a planning document.

---

# 1. Executive decision

Project: Studio should treat finance as an **explainable operating system for decisions**, not as a spreadsheet minigame and not as a decorative cash counter. The player should be able to progress through three intentional depths:

> **Lot heartbeat: Am I okay? → Administration: Why? → Detail: Exactly what moved, is committed, or belongs to this film?**

The lot remains home. Cash and a signed current-pacing pulse remain readable while the player operates the studio. Selecting Administration exposes a compact local financial-health inspector. A future core-authored condition may add at most one financial attention; P11A does not promote the browser's current presentation-only cash bands into authority. **Open Finance** earns a large retained workspace because payroll, obligations, facilities, films, receipts, and history cannot be understood honestly in a tiny memo. Every separately implemented material-decision preview uses one TypeScript-authored consequence language and returns the player to the exact world context.

The present simulation already contains strong accounting truth:

- a literal cash balance and signed permanent ledger;
- exact payroll, ordinary overhead, recurring facility operating cost, and one-time set-repair debits;
- construction capital expenditure and demolition refunds;
- deterministic contract salary, signing-bonus, guaranteed-obligation, renewal, and termination facts;
- direct per-film production/marketing/freelancer commitment rows;
- multi-week Theatrical Gross, locked studio share, Studio Revenue received, Studio Revenue scheduled, and remaining pipeline receipts;
- a deliberately distinct **Film Contribution** basis;
- authoritative affordability and post-commitment cash/runway previews for several current actions; and
- save-safe stable IDs for contracts, productions, runs, facilities, and ledger rows.

It does **not** currently contain a full accounting P&L, an authoritative “good investment” judgment, loans or other interest-bearing debt instruments, investors, taxes, a bankruptcy ending, a future-film revenue forecast, a universal film-overhead allocation, or complete old-save finance history. The UI must not manufacture any of those. This is distinct from current literal Cash being allowed to go negative.

## Binding design laws

1. **Cash is literal.** Do not subtract future obligations into an invented “available cash” or escrow balance. Show obligations beside cash.
2. **Recurring pace is not transaction history.** One-time Greenlight, construction, signing, termination, or publicity movements appear in “What changed,” not in recurring weekly operating cost.
3. **Theatrical Gross is not studio cash.** The public spends Gross; the studio receives its locked share as Studio Revenue over the authoritative run cadence.
4. **Film Contribution is not Net Profit.** Contribution is Studio Revenue minus the film's direct committed cost, before studio payroll and operating costs. It may be projected while receipts remain outstanding and final only when the run settles.
5. **No unexplained aggregate.** Every important finance number exposes its definition, primary drivers, period/basis, and one relevant route or response.
6. **One preview language across the game.** Hiring, renewal, early release, construction, and Greenlight publish compatible consequence fields from TypeScript; Unity never derives cash-after, payroll-after, runway, affordability, or risk.
7. **Affordability is law; prudence is judgment.** The engine may say whether the action is legal. The UI shows consequences and lets the player decide whether it is wise.
8. **Known commitments and uncertainty stay separate.** Forecasts may include scheduled authoritative receipts and obligations. They never invent future hits, market growth, financing, or ungreenlit films.
9. **Financial attention is exception-based and grouped.** Routine weekly loss is visible, not a recurring alarm. A deadline, material change, or legal blocker earns stronger attention only when TypeScript authors the condition.
10. **Administration owns executive finance physically.** The HUD is a heartbeat; the Administration inspector is the local explanation; the retained Finance workspace is the management surface.
11. **History is honest about provenance.** Old saves without recorded movements show `Earlier cash movements not recorded`; no chart reverse-engineers fictional history from current totals.
12. **No tuning by presentation.** Thresholds, risk bands, affordability, cost allocation, and formulas cannot be silently invented in Unity to make a prettier dashboard.

## Truth prerequisite discovered by archaeology

**[FROZEN AUDIT; CODE]** Current tick, ledger, and period summaries correctly charge and report recurring `facilityOpex`. However, `src/core/economyView.ts::weeklyOverhead()`, `weeklyBurn()`, prospective fixed-cost views, and `src/core/fixedCostAllocation.ts::ledgerFixedCostByWeek()` omit that real recurring facility cost. The browser and sealed Unity treasury inherit the resulting understatement. Current `setMaintenance` rows are one-time set-repair cash events; `SET_WEEKLY_MAINTENANCE_COST` is presently zero, so P11 must not pretend sets add a recurring weekly charge.

This package does not repair it. Before P11A labels a figure **Weekly operating cost**, **Net weekly cashflow**, or **Runway**, TypeScript must perform a behavior-neutral read-model truth repair so those selectors reconcile to what the tick and ledger actually debit. Any future all-in managerial fixed-cost allocation must receive the same repair before exposure, but that allocator is not part of P11A. This is not balance tuning: no cost changes, only truthful projection of existing cost.

## One bounded next checkpoint

**P11A — Executive Finance Spine V1**

> Select Administration → read Cash, authoritative recurring Net weekly cashflow, and conditional current-pacing Runway → Open a retained Finance workspace → reconcile the last authoritative week → inspect Payroll, a compact current-contract obligation summary, and Studio Operations → inspect one active/released film's direct commitment, Studio Revenue, and Contribution → preview one construction commitment through a new revision-bound TypeScript construction-preview/intent seam built on current placement law → cancel or commit → Back restores the exact lot context.

P11A does not implement full accounting, loans or other financing instruments, investors, taxes, bankruptcy, balance retuning, film overhead allocation, predictive box office, every historical chart, or every decision preview. Construction is the recommended first preview proof because current placement authority already publishes exact capex, duration, delayed operating-cost consequence, capacity, validity, and affordability. It proves immediate cash, future recurring cost, operational benefit, stale quote, and exact world response in one bounded journey.

No Owner decision is required before P11A. Bankruptcy/failure, external financing, and any future canonical film-overhead allocation remain later product gates.

---

# 2. Scope and non-goals

## 2.1 This package decides

- the three-level finance information hierarchy;
- stable player-facing accounting vocabulary;
- what belongs on the HUD, Administration inspector, Finance workspace, film economics, portfolio, and consequence preview;
- honest recurring cashflow and runway presentation;
- how the player explains last week's cash movement;
- contract, facility, construction, Greenlight, production, and release economics from current authority;
- useful forecast limits and chart choices;
- finance attention, navigation, history, old-save behavior, concurrency, and era safety;
- exact reuse/extension boundaries for TypeScript, bridge, browser, and Unity; and
- one bounded Fable checkpoint.

## 2.2 This package explicitly does not decide

- salaries, starting cash, revenue, studio share, film costs, marketing, construction prices, operating costs, renewal cadence, or any other tuning;
- a solution to the Week-208 renewal wall or wealth/distress polarization;
- loans, investors, equity, bonds, taxes, inflation, acquisition, distribution, unions, agents, or streaming economics;
- an authoritative bankruptcy/game-over law;
- a new ROI, risk, credit, fiscal-year, or “investment quality” formula;
- film-by-film allocation of studio-wide payroll/operations as canonical profit;
- Production, Casting, Development, Construction, Contract, or Release interaction redesign beyond their finance lens;
- Finance implementation; or
- fabricated historical ledger data for migrated saves.

## 2.3 Frozen economy boundary

The Economy Truth Audit, Diagnosis, and Intervention Frontier remain binding evidence. Package 11 accepts their findings—polarized outcomes, the renewal cohort wall, accounting projection gaps, high contribution scaling, and the absence of a safe single tuning intervention—and asks only: **what must the player be shown so existing law is intelligible?**

---

# 3. Original *The Movies* reconstruction

## 3.1 Reconstructed workflow

| Original behavior | What the player did / saw | Evidence and confidence | What it served | Project: Studio ruling |
|---|---|---|---|---|
| Persistent Cash Balance | The cash balance lived in the main HUD. Clicking it opened Finance. A negative balance prevented most new construction. | Official manual printed pp. 6, 14, 37. **High.** | Spending remained tangible while the lot stayed primary. | **ADOPT** persistent cash and a direct Administration/Finance route. |
| Deeper Finance screen | `F5` opened financial graphs and `F6` opened salaries; the Cash Balance also routed to Finance/Salary. | Official manual printed pp. 14, 37; Prima Finance section. **High.** | Optional investigation beyond the lot pulse. | **ADAPT** into a retained executive workspace, not a separate spreadsheet-first mode. |
| Finance graphs | The manual confirms that `F5` opened Finance graphs. The recovered corpus does not establish a specific Prima “recent earnings” workflow or a complete transaction ledger. | Official manual printed p. 37; local mechanics Bible §28. **High for graphs; unresolved scope/content.** | Let the player investigate beyond the cash pulse. | **ADAPT by inference:** exact ledger-derived period reconciliation first; restrained trends only where recorded data supports them. |
| Tangible capital spending | The player bought named facilities, sets, paths, and ornaments on the lot. Construction and repair were visible. | Manual printed pp. 4, 10–11, 18, 20, 38–39; Prima; local mechanics Bible. **High.** | Money became a physical studio. | **ADOPT** world-visible capital consequence and exact price/affordability. |
| Repair and decay | Damaged buildings became unusable; Builders repaired them. Local callouts linked repair and lot prestige. The sources do not establish this as a generic invisible operating-cost charge. | Manual printed pp. 4, 18, 20; Prima. **High.** | Physical maintenance pressure and lot care. | **ADAPT later** only where authoritative; reject repetitive repair clicking or an opaque sink. |
| Salaries | Stars had adjustable individual salaries. Pay affected happiness/rating, comparison could produce jealousy, and Stars could leave. Ordinary staff had much flatter guide-reported wages. | Manual printed pp. 14–15; Prima salary/Stars/staff sections. **High.** | Make celebrity retention costly and personal. | **ADAPT** into clear contracts/obligations; reject salary jealousy and salary-meter babysitting. |
| Film cost | Release materials exposed a movie cost/filming-cost basis. The player could see what had been spent on making the picture. | Manual printed p. 12; Prima film/release sections. **High for cost visibility; exact cost composition incompletely documented.** | Make film investment material. | **ADOPT** film-attributable direct commitment, with exact modern definitions. |
| Release marketing | The player dragged a finished film into the Production Office Release room and selected a marketing spend. Guidance tied spend to quality and filming cost; test screening could inform the choice. | Manual printed pp. 12–13; Prima Publicity/Release. **High.** | An explicit risk/capital decision at release. | **ADAPT the consequence principle only.** Project: Studio's current marketing timing remains governed by Packages 04/06/07; this historical fact does not authorize moving or duplicating a debit. |
| Earnings over time | A released movie card pulsed with a `$` while it continued earning; it could later be archived. | Manual printed pp. 6–7; Prima. **High for ongoing earnings; exact curve/formula unresolved.** | Visible commercial life after release. | **ADOPT** multi-week receipts, exact current/remaining Studio Revenue, and autonomous collection. |
| Negative-cash pressure | Cash could go negative; most optional new buildings/sets/ornaments then became unavailable. No primary evidence of a hard bankruptcy/receivership ending was recovered. | Manual printed p. 6; Prima; local Bible. **High for soft expansion lock; medium-high negative finding for no hard fail.** | Recoverable pressure rather than abrupt failure. | **ADOPT principle** of precise voluntary-spend gates and recoverability; use current law, not historical exceptions. |
| Studio Rating capital component | Studio Rating was approximately Capital 24%, Movies 24%, Stars 24%, Lot Prestige 14%, Awards 14%; Capital used diminishing returns. It was not a verified full accounting “studio worth.” | Prima printed pp. 45–46; manual qualitative rating components. **High.** | Tie business success into competitive progression. | **LEAVE to Package 08.** Reject calling cash/assets a recovered `Studio Worth`. |
| Financial opacity | The original made purchases and income visible but did not expose a verified studio-share law, full film P&L, overhead allocation, or why every cash change occurred. Guides carried much of the strategy. | Negative finding across manual/Prima/Bible. **High.** | Kept the interface light, at the cost of causality. | **ADAPT** modern explainability without ERP density. |

## 3.2 What was tactile and what was weak

**Still excellent:** visible cash; clicking the financial pulse; buying a physical building or set; salary and marketing as material choices; a movie visibly earning after release; recoverable negative-cash pressure.

**Excellent principle, dated interaction:** a separate Finance screen; salary administration; movie-card earnings icons; graphs without a reconciled “why” layer; drag-to-spend release interaction.

**Opaque even in 2005:** exact film profitability, studio share, fixed operating burden, cash-movement causality, and many financial drivers. Historical sources do not authorize a complete reconstructed film P&L.

**Reject for Project: Studio:** unexplained finance grades, repetitive repair/welfare costs, hidden profitability formulae, tutorial/sandbox values treated as universal balance, or “studio worth” presented as recovered parity.

## 3.3 Base game, tutorial, sandbox, Stunts, and Superstar separation

- **Normal campaign:** an open 1920 timeline with a Staff Office at the start; tutorial help could structure early actions. The exact universal starting-cash constant is not sufficiently secure and is irrelevant to P11 tuning. **High for mode structure; unresolved cash.**
- **Sandbox:** starting year and cash were player-configurable. It is separate evidence and must not establish campaign law. **High.**
- **Stunts & Effects:** **[FACT — PRIMARY]** the official manual establishes that this is an expansion-only production layer with Stunt Performers and specialist content. **[FACT — SECONDARY]** the reconstructed skill/condition/injury/training loop is supported by the local mechanics Bible §§7.4 and 34 and expansion-era guides, not by finance authority. No core P11 accounting law follows from it; importing a parallel upkeep loop is **REJECTED**.
- **Superstar Edition review:** MacInPlay describes persistent “Star-gotchi” upkeep and repetitive manual intervention. This is secondary experiential evidence that consequence can survive while clerical maintenance should not. It is not primary finance authority. **Secondary.**

## 3.4 Historical source register for this package

- Local reconstruction authority: `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` §§19, 21, 28, 30–31, and 34; `/Users/bruce/Desktop/big swing art/THE-MOVIES-2005-SOURCE-REGISTER.md` tiers **Official Primary** and **Developer-Reviewed Guide**; original formula/facility/employment artifacts and their per-fact provenance; and direct Owner gameplay captures catalogued by the register. The source register confirms the GameSpot walkthrough and IGN Wiki were read in full during the original-game reconstruction; for P11 they serve only as secondary behavioral cross-checks and do not establish hidden accounting law.
- [Official *The Movies* manual](https://cdn.steamstatic.com/steam/apps/7900/manuals/manual_english.pdf), printed pp. 6–7, 12–15, 18, 20, 37–39.
- [Prima Official eGuide](https://archive.org/details/The_Movies_Prima_Official_eGuide), Finance, Salary, Staff, Publicity, Release, and Studio Rating sections.
- [GameSpot, *The Movies* Walkthrough](https://www.gamespot.com/articles/the-movies-walkthrough/1100-6140049/) and [IGN Wiki, *The Movies*](https://www.ign.com/wikis/the-movies), secondary gap checks only.
- [*Stunts & Effects* manual](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/7910/manuals/The_Movies_Stunts_Effects_Manual.pdf?t=1447351041), expansion boundary.
- [MacInPlay, *The Movies: Superstar Edition* review](https://macinplay.de/spiele-tests/macintosh-games/the-movies-superstar-edition/), secondary later-package experience.

---

# 4. Modern comparator findings

The comparator is chosen per problem. No one game supplies Project: Studio's complete financial grammar. All comparator descriptions below were verified directly in official publisher/developer pages on 25 August 2026; they establish the documented screen/interaction only. Every copy/do-not-copy/translation statement is a P11 ruling. *Cities: Skylines II* and *Victoria 3* are included outside the likely-comparator list because their official pages give unusually exact evidence for executive breakdown and temporary-versus-recurring deficit classification. They contribute narrow principles beside *The Movies*, *Planet Coaster 2*, and the personnel/obligation comparators; they are not genre templates.

| Financial problem | *The Movies* | Best modern comparator | Project: Studio ruling |
|---|---|---|---|
| HUD health | Persistent cash icon | *Cities: Skylines II* Economy Panel hierarchy | Cash plus signed weekly pace; no full dashboard on the lot. |
| Weekly cashflow | Recent Finance graphs | *Victoria 3* temporary-versus-structural deficit explanation | Separate one-time capital/project events from recurring operations. |
| Payroll | Salary screen | *Football Manager* “Balancing the books” | Grouped payroll → role/person drill-down, with commitment dates. |
| Contracts | Individual Star salary | Madden Franchise contract restructuring | Current/future consequence shown before explicit commitment; reject cap/dead-money law. |
| Facilities | Tangible build prices | *Planet Coaster 2* financial management | Overview → operating category → exact facility; retain lot ownership. |
| Construction | Physical placement/purchase | *F1 Manager* starting budget/facility capability; Package 09 authority | Pair capex, future recurring cost, completion, and capacity; no fake ROI. |
| Film budget | Filming cost | *Football Manager* committed-spend clarity | Distinguish authorized direct commitment, immediate debit, and studio-wide payroll. |
| Greenlight | No equivalent modern decision preview | Madden before/after commitment pattern | One TypeScript preview: cash now/after, direct spend, recurring delta, runway basis, capacity. |
| Production spending | Movie card cost | *Victoria 3* temporary investment deficit distinction | Current law is prepaid direct commitment; do not invent spend-to-date or over-budget. |
| Release revenue | Pulsing earning card | Package 07 authoritative model; *Cities: Skylines II* drill-down lesson | Gross → Studio Revenue received/scheduled → Contribution. |
| Film contribution | Opaque movie success/cost | No comparator better than Project: Studio's current authored distinction | Preserve the exact term; never call it Net Profit. |
| Portfolio | Movie cards | *Football Manager* future committed-spend grouping | Compact phase/commitment/receipts/contribution table joined by stable film ID. |
| Forecast | Finance graphs | *Football Manager* future commitments | Known flows only; uncertain new films explicitly absent. |
| Affordability | Negative-cash construction lock | Madden consequence sheet | `Can commit` is authoritative law; prudence stays a player judgment. |
| Low-cash attention | Negative-cash state | *Football Manager* amount/deadline/remedy warning | A future TypeScript-authored grouped actionable condition, not weekly loss spam; P11A shows facts only. |
| Financial history | Graphs | *Cities: Skylines II* source breakdown + *Victoria 3* temporary/fixed-deficit classification | Recorded ledger reconciliation first; Project: Studio's own typed events may annotate charts only when they answer a question. |

## 4.1 Comparator rulings

### *Planet Coaster 2* — financial management

[Official Deep Dive: Mastering Management](https://www.planetcoaster.com/en-US/news/2024-09-25/deep-dive-mastering-management), section **Financial Management**, image **Financial Management Graphs**.

- **COPY PRINCIPLE:** start with cash/health, then let income and cost groups expand into operational causes.
- **DO NOT COPY:** park heatmaps, loans, guest-service categories, or a dense city/park dashboard.
- **Translation:** Finance top summary → Payroll / Studio Operations / Films / Capital → exact person, facility, or film, always with Locate where a live subject exists.

### *Football Manager* — commitments and corrective warnings

[Official feature: Smarter Transfers, Squad Building and Finance](https://www.footballmanager.com/features/smarter-transfers-squad-building-and-finance), section **Balancing the books**, image **Negative Transfer Budget**.

- **COPY PRINCIPLE:** make future committed spending clearer; name the amount/problem, deadline, and concrete remedy instead of hiding spend in “Other.” The article separately documents an administration news item with net-debt/P&L/income/expenditure information and improved future-transfer committed-spend calculations; it does not establish one combined screen.
- **DO NOT COPY:** transfer/wage-budget dual currencies, board takeovers, financial regulations, loans/interest-bearing liabilities, or football terminology.
- **Translation:** upcoming contract cohorts and known obligations sit beside exact dates; once TypeScript authors severity, a grouped financial attention links to the relevant roster, contract, film, or facility.

### Madden Franchise — before/after contract consequence

[Official Madden NFL 24 Franchise Mode](https://www.ea.com/able/news/madden-24-franchise-mode), section **Contract Restructuring**.

- **COPY PRINCIPLE:** a material contract action shows immediate benefit and future-year consequence before confirmation. Inspect the pre-confirmation current/future effect presentation; the article does not establish a particular column or sheet layout.
- **DO NOT COPY:** salary-cap, dead-money, restructuring, or league-year mechanics.
- **Translation:** every separately implemented financial-preview family uses the same current cash → immediate movement → recurring delta → obligation → current-pacing runway language; P11A proves construction only.

### College Football 27 — budget tied to calendar context

[Official College Football 27 Dynasty](https://www.ea.com/games/ea-sports-college-football/college-football-27/news/college-football-27-dynasty), **Dynasty Blueprint → Dynasty Points** and **Managing Your Blueprint Throughout the Year**; inspect the Program Overview, budget-allocation, and preseason/in-season/offseason timeline image captions (currently rendered near images 19–21).

- **COPY PRINCIPLE:** show grouped allocation/commitment with the calendar windows in which it matters.
- **DO NOT COPY:** Dynasty Points, annual use-it-or-lose-it allocation, or treating future obligations as reserved cash.
- **Translation:** a future Finance `Upcoming` lists known renewal windows, construction completion, and scheduled receipts without subtracting them from Cash. Operating-cost onset joins only after TypeScript publishes the dedicated event; P11A does not infer it from calendar prose.

### *Cities: Skylines II* — executive to forensic breakdown

[Official Economy & Production feature](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/economy-production), section **Economy Panel**, Budget image.

- **COPY PRINCIPLE:** Revenue, Expenses, and balance are legible at a glance; each section explains its origin on demand.
- **DO NOT COPY:** taxation, loans, production chains, or city-scale category density.
- **Translation:** signed current-period movement reconciles to category totals; selecting a category exposes exact authored ledger families, not arbitrary “Other.”

### *Victoria 3* — explain a deficit before coloring it bad

[Official Dev Diary #61: Data Visualization](https://www.paradoxinteractive.com/games/victoria-3/news/victoria-3-dev-diary-61-data-visualization), **Income** discussion.

- **COPY PRINCIPLE:** distinguish a temporary construction/investment deficit from an unhealthy recurring deficit. The source documents that classification; Project: Studio's named-event annotation is the P11 translation, not copied evidence.
- **DO NOT COPY:** grand-strategy density, UI-only health judgment, or color-only meaning.
- **Translation:** a $1.5M construction purchase appears as a named one-time Capital movement; Weekly operating cost remains a separate pace. A negative week is not automatically a crisis.

### *F1 Manager* — capability beside investment

[Official F1 Manager 2024 Create a Team](https://www.f1manager.com/features/new/erstelle-ein-team-erschaffe-eine-legende), sections **Choosing Team Origins** and **Managing Your Custom Team**.

- **COPY PRINCIPLE:** capital, facility level/capability, and team readiness belong in one executive choice context.
- **DO NOT COPY:** sponsors, preset origin packages, or motorsport performance abstractions.
- **Translation:** a construction preview pairs capital/duration/operating change with the exact capacity that becomes available.

---

# 5. Current Project: Studio financial authority

## 5.1 Authoritative accounting chain

```text
TypeScript action/tick
    ↓ signed LedgerEntry (week, kind, amount, optional stable subject ID)
cash balance + contracts + facilities + productions + theatrical runs
    ↓ pure selectors/read models
cash / period summary / obligations / quotes / run receipts / film contribution
    ↓ bridge projection with revision + opaque intent
Unity presentation and input only
```

The ledger uses whole-dollar signed entries. Positive values increase cash; negative values decrease it. `financeTotals()` reconciles the entire retained ledger. `periodSummary()` reconciles an exact week window. This should remain the primary answer to “where did money go?”

## 5.2 Current authority map

| Authority | Current truth | Product implication |
|---|---|---|
| `GameState.studio.cash` | Literal cash balance; unavoidable weekly charges may take it negative. | Display as Cash, never “available cash” or net worth. |
| `GameState.ledger` / `LedgerKind` | Signed rows for Studio Revenue, legacy box-office lump, production, payroll, ordinary overhead, bonuses, freelancer fees, termination, publicity, construction/set capex/refunds, facility Opex, and set maintenance. | Exact cash-change explanation is already derivable for recorded history. |
| `financeTotals()` | Whole-ledger categories and net reconciliation. Recurring facility Opex and one-time set repair correctly enter the overhead reporting bucket; refunds net against capital. | Reuse for all-time recorded totals, but do not call net capital spend an expense P&L without period context. |
| `periodSummary()` | Exact categories for an inclusive week range; releases/run completions counted. | Reuse for last week and recent-period reconciliation; split `otherCash` in deep detail. |
| `weeklyPayroll()` / `weeklySalary()` | Current active contracted payroll and exact weekly salary basis. | Reuse; group by real creative roles only. |
| `guaranteedComp()` / `terminationCost()` / renewal quote | Exact current contractual obligation and action consequence. | Reuse in Finance lens; Person Profile retains human lens. |
| `weeklyOverhead()` / `weeklyBurn()` | Base/per-contract ordinary overhead + payroll; currently omit existing recurring facility Opex. | **MISSING COMPLETE PROJECTION.** Repair read model before P11A claims total recurring cost. Do not add one-time set repair to recurring burn. |
| `expectedWeeklyRunRevenue()` | Next authoritative tick's Studio Revenue across already-active runs. | Name basis precisely; it is not an average forecast. |
| `pipelineRunRevenue()` / `RunView` | Remaining and total Studio Revenue for all active runs, with locked share and run week. | Reuse for expected receipts and film/run detail. |
| `runway()` | `floor(cash / (burn - next-week active-run revenue))`; null/infinite if revenue ≥ burn. Current commitments only. | Reuse after cost truth repair; label as current-pacing approximation, not a cash exhaustion date. |
| `commitmentPreview()` | Immediate commitment, cash before/after, authoritative affordability, unchanged recurring burn, post-runway. | Reuse as prototype of universal preview; extend action-specific fields. |
| `offerObligation()` / `postSigningRunway()` | Weekly salary, guarantee, bonus, total; signing/renewal cash and burn effect. | Reuse; ensure facility/set recurring truth joins the common basis. |
| `src/core/placement.ts::queryPlacement()` / `studioPlacementView()`, the browser adapter's `placementQuote()`, and facility catalog | Exact cost, duration/completion, operating cost, capacity, parcel/footprint legality and reasons, affordability. | Reuse core placement truth; extend the Finance projection with cash-after and operational-onset consequence. |
| `Production.budget` | `negative` plus `marketing`; debited together at Greenlight. | Player label: authorized production negative/marketing where the split remains frozen; not a rolling budget. |
| per-production ledger | `production` + engaged `freelancerFee` rows produce current direct film commitment. Contracted salaries remain studio payroll. | Reuse as film direct cost; never add payroll silently. |
| `FilmResult` + `TheatricalRun` | Gross, locked share, paid/scheduled Studio Revenue, run state. | Reuse Package 07 distinctions exactly. |
| browser `filmCommittedCost()` / `runProjection()` / `releaseScorecard()` | The TypeScript UI adapter computes contribution correctly, but duplicates core/recap cost logic and labels some values Profit/Loss and ROI. | **CENTRALIZE projection and REPLACE labels:** Projected/Final Film Contribution; renderers consume it and never recompute. |
| fixed-cost allocation | Read-only managerial equal allocation of ledger `payroll` + `overhead` over declared film occupancy. Currently omits recurring `facilityOpex`. | Leave out of headline Film Contribution. After repair, optional “allocated studio operating cost” remains a named managerial lens, never canonical film profit. One-time repairs remain period events unless a separately declared allocation basis includes them. |
| sealed `treasuryOf()` | CP9 bridge publishes cash, weekly burn, net weekly cash, runway weeks/infinite from current finance card. | Reuse bridge grammar; extend schema only from complete selectors. |
| sealed Unity `StudioLivingTimeHud` | Renders cash and signed `/wk` pulse verbatim. | Reuse heartbeat and presentation ownership; no math, no hard-coded era copy. |

## 5.3 Missing authority/read models

The frozen Economy Diagnosis provides a concrete one-Annex witness of the projection gap. Under that measured state, the current read model reported `$15,000/week` while the tick charged `$18,500/week`; it reported `1,267` weeks of runway where the complete existing-cost basis produced `1,027`; and a 14-week cycle view omitted `$49,000` of facility Opex. These figures are diagnostic evidence from the frozen audit, not balance recommendations or permanent tuning authority.

Required before or within P11A:

1. **Complete recurring-cost projection** that reconciles payroll + ordinary overhead + operational facility Opex to the next authoritative tick. Current one-time set repair is excluded.
2. **Complete recurring-net/runway selectors** built from that projection, not client arithmetic.
3. **Typed cash-movement breakdown** that exposes bonus/freelancer/termination separately instead of only `otherCash` at deep detail.
4. **Finance workspace projection** keyed by stable contract, facility, production, run, and ledger IDs with explicit provenance/missing-history states.
5. **Shared `FinancialConsequencePreview` read model** with quote/revision identity, universal fields, action-specific consequence, and authoritative refusal.
6. **Durable direct-cost breakdown where exact split is promised after production deletion.** Current ledger production row combines negative and marketing. Do not reconstruct the split later unless it was frozen.

Follow-up rather than P11A blockers:

- known-flow calendar projection across future weeks;
- recorded annual finance summaries;
- optional, repaired managerial fixed-cost allocation;
- TypeScript-authored financial attention/risk state if the Owner later wants qualitative labels or alert severity. Current browser cash bands remain presentation only.

---

# 6. Accounting nomenclature

| TypeScript truth / concept | Player-facing term | Exact definition | Must not be confused with |
|---|---|---|---|
| `studio.cash` | **Cash** | Literal studio cash now. | Net worth, reserved cash, future obligations, or profit. |
| `FilmResult.boxOffice.total` / run gross | **Theatrical Gross** | Audience/public spend attributed to the film's authoritative theatrical run. | Money deposited to studio cash. |
| gross × locked run share | **Studio Revenue** | The studio's authoritative share of Gross; label **Received** versus **Scheduled**. | Gross, contribution, or net profit. |
| positive ledger inflows | **Revenue** | Studio cash inflow in the selected recorded period; show legacy lump provenance separately when relevant. | Gross or forecast audience spend. |
| negative ledger movement | **Expense / Cash outflow** | A recorded debit in a named period. | Future obligation not yet paid. |
| active-contract weekly debits | **Payroll** | Recurring salary charged for current active contracts. | Signing bonus, freelancer fee, termination, or total guarantee. |
| base/per-person overhead + placed-facility Opex | **Studio Operations** | Recurring non-payroll cost of keeping the current studio operating. | Capital cost, one-time set repair, or film direct commitment. |
| facility/set Opex component | **Operating cost** | A facility/set's authoritative recurring charge while operational. | Purchase/construction price. |
| construction/set capex; refunds separately signed | **Capital spending / Capital recovered** | Cash spent to build physical capacity, or cash credited when authoritative demolition returns value. | Studio Operations, net worth, or ROI. |
| production ledger + correlated freelancer fees | **Direct film commitment** | Immediate film-attributable cost debited at Greenlight under current law. | Studio payroll, remaining spend, or final total business cost. |
| `Production.budget.negative + marketing` | **Production commitment / Marketing commitment** | The two authored funding choices combined in the production ledger. Preserve the split only where frozen. | A weekly burn or forecast final cost. |
| future salary/guarantee facts | **Obligation** | Authoritative scheduled contractual amount not yet paid. | Cash already spent or reserved cash. |
| all complete recurring weekly outflows | **Weekly operating cost** | Next-tick recurring payroll + Studio Operations. Preferred player label over ambiguous `Weekly Burn`. | One-time construction, set repair, Greenlight, publicity, bonus, termination, or revenue. |
| next active-run Studio Revenue − Weekly operating cost | **Net weekly cashflow** | Signed current-pacing recurring result for the next authoritative week. | Last week's actual cash change, accounting profit, or a long-run average. |
| current cash / current-pacing deficit | **Approx. runway at current weekly pace** | Whole weeks until cash would be exhausted if the published current-pacing recurring basis continued. | Exact failure date, forecast, or guarantee. |
| full-run Studio Revenue − direct film commitment | **Film Contribution** | Film-attributable commercial return before studio-wide payroll and operations. Projected until scheduled revenue is fully paid. | Net Profit, operating profit, or cash received today. |
| voluntary action amount | **Immediate commitment** | Cash debit/credit applied if the action succeeds now. | Full contractual obligation or recurring delta. |
| authored proposed spend | **Budget** | A chosen authorization/funding envelope only where TypeScript actually models it. | Actual cost, remaining cost, or cash. |
| demolition/other positive reversal | **Refund / capital recovered** | Authoritative cash credit. | Negative expense hidden inside an opaque total. |
| remaining scheduled contract compensation | **Guaranteed salary obligation** | Weekly salary × remaining authoritative term, plus separately disclosed bonus where applicable. | Cash reserved or severance automatically due in all cases. |

**Ruling:** the words **Profit**, **Net Profit**, and **ROI** are absent from the ordinary film surface until authority includes every cost the label promises. Existing adapter copy that says `Projected profit/loss` or ROI while calculating Contribution must be replaced in a future presentation pass.

---

# 7. HUD financial health

## 7.1 Level 1 contract

The HUD is a heartbeat, not Finance:

```text
$18.7M   ↓ $92K / week
```

or, when current recurring receipts exceed current recurring costs:

```text
$18.7M   ↑ $41K / week
```

The exact figures are TypeScript-authored and formatted by a shared monetary presentation layer. The sign, arrow, and text all convey direction; color is redundant. Hover/focus states define `Cash` and `Net weekly cashflow` and say that one-time movements are excluded.

## 7.2 Runway on the HUD

Runway is **conditional**, not compulsory persistent chrome. Show it when:

- Administration is selected;
- a material consequence preview changes it;
- an authoritative financial-attention rule says it matters; or
- the player explicitly expands the finance pulse.

Do not permanently display `203 weeks runway` in a healthy cashflow-positive studio. Do not show `∞`. Use `Cashflow positive at current pace`. A negative-cash studio uses `In the red`; it does not display negative weeks.

## 7.3 What remains absent

No Gross, Contribution, obligations, pie chart, financial grade, risk color, “available cash,” or forecast curve belongs on the base HUD. Clicking the pulse selects/opens Administration Finance without moving the camera.

---

# 8. Cash

Cash answers only **“what is in the studio treasury now?”**

- It may be positive, zero, or negative under current law.
- Future salary guarantees and scheduled receipts do not alter it until the authoritative tick/action posts the ledger entry.
- A consequence preview may show `Cash now` and `Cash after this action`; both come from TypeScript.
- Do not add `Available Cash`, `Reserved Cash`, or `Cash after all obligations` unless future authority creates a real reservation mechanism.
- Finance should place **Known obligations** and **Scheduled Studio Revenue** near Cash so the player understands exposure without falsifying the balance.

When cash changes, a restrained HUD receipt may show the signed movement once. It never replaces the reconciled period breakdown and never forces a modal.

---

# 9. Weekly burn / surplus

## 9.1 Player-facing ruling

Use **Weekly operating cost** for recurring outflows and **Net weekly cashflow** for the signed next-week pace:

```text
Payroll                         -$72K
Studio Operations              -$18K
Weekly operating cost          -$90K
Next scheduled Studio Revenue  +$57K
Net weekly cashflow            -$33K
```

One-time construction, Greenlight, publicity, signing bonus, freelancer fee, and termination do not enter this recurring number. They appear in `This Week` and the relevant decision preview.

## 9.2 Basis disclosure

The label or info line must state:

> Next authoritative week · current contracts, operational property, and already-active theatrical runs only.

If the projected value changes because a run ends next week, the next snapshot changes with it. The UI must not smooth or average it invisibly.

## 9.3 Current mismatch

Canonical `weeklyBurn()` currently omits recurring facility Opex even though the tick charges it. Until the selector is repaired, existing burn/runway figures are explicitly incomplete and must not become P11A executive truth. Current set repair remains a one-time cash event and does not enter this selector.

---

# 10. Runway

## 10.1 Exact valid meaning

After the recurring-cost truth repair, TypeScript owns:

```text
deficit = Weekly operating cost − next-week scheduled Studio Revenue
runway = floor(Cash / deficit), only when deficit > 0 and Cash > 0
```

Player label:

> **Approx. runway at current weekly pace**

This is a **pace diagnostic**, not a forecasted insolvency date. Active theatrical receipts are scheduled and can change each week; a new film, contract, construction, or release is not assumed.

## 10.2 Display states

| Authoritative situation | Display | Explanation |
|---|---|---|
| Recurring revenue ≥ recurring cost | `Cashflow positive at current pace` | No numerical infinity. |
| Recurring deficit, positive cash | `Approx. 23 weeks` | Tooltip names current basis and exclusions. |
| Near-zero deficit | `Cashflow steady at current pace` | Avoid an absurd huge number caused by rounding noise; this state/epsilon is TypeScript-authored. |
| Cash ≤ 0 | `In the red` | A recovery state, not `-4 weeks`. |
| History/projection unavailable | `Not available` + reason | Never `0 weeks` as a placeholder. |

## 10.3 Decision preview runway

A preview uses the exact same selector over authoritative post-action facts. Construction should distinguish:

- **After purchase now:** immediate cash change; current recurring cost unchanged while the site is not operational.
- **When operational:** facility operating-cost delta begins; named projected recurring pace/runway if TypeScript publishes it.

Do not collapse those two moments.

---

# 11. Why cash changed

This is the most important explanatory layer.

## 11.1 “This Week” card

```text
THIS WEEK · Week 74

Opening Cash                         $19.06M
Studio Revenue                         +$57K
Payroll                                -$72K
Studio Operations                      -$18K
Film commitments                      -$140K
Capital spending                     -$1.50M
Contract / freelance / termination      -$11K
Net cash movement                    -$1.684M
Closing Cash                         $17.376M
```

Every line is signed, period-scoped, and reconciles exactly:

```text
Opening Cash + Net cash movement = Closing Cash
```

Zero categories may be omitted, but the reconciliation never changes. Selecting a category reveals exact rows and linked subjects. `Other cash` is not an acceptable Level-3 label; signing bonuses, freelancer fees, and termination must be distinguishable.

## 11.2 Cause annotations

Material non-recurring movements receive short authored annotations:

- `Development & Casting Office commissioned`
- `<title> Greenlit`
- `<person> signing bonus`
- `<title> Studio Revenue · Week 2 of 6`

Annotations state event identity, not inferred judgment. `Major investment` or `cost spike` requires a TypeScript-authored significance state if used.

## 11.3 Navigation

Where the row has a stable live subject:

- film row → Film Economics;
- salary/contract row → exact Person Profile contract section;
- facility Opex/capital row → exact facility/site inspector and optional Locate;
- release receipt → exact film/run/Chronicle record.

Historical rows whose subject no longer exists still open a durable read-only record. Locate is disabled with a reason; IDs are never guessed.

---

# 12. Ledger/history

## 12.1 Durable ledger ruling

The signed TypeScript ledger remains the canonical recorded cash-movement history. Finance adds views, not a second accounting store.

| View | Source | Retention |
|---|---|---|
| Current/last week | exact ledger rows + period summary | Derive. |
| Recent 13/52 weeks | exact recorded ledger, grouped by week/category | Derive; cache only as implementation detail. |
| Year/era summary | recorded ledger or future compact yearly aggregate | Summarize when scale requires. |
| Individual cash event | ledger row + stable subject reference | Persist only when already authoritative/material. |
| UI-expanded state/chart choices | presentation state | Discard or save only as ordinary UI context, never finance truth. |
| Pre-ledger old-save history | unavailable | State `Earlier cash movements not recorded`; never fabricate. |

## 12.2 Ledger workspace behavior

Default is a category-reconciled period, not raw transaction rows. `View entries` opens a filterable list with Week, Category, Subject, Amount, and Source/Provenance. The default period is rolling recent weeks rather than a modern corporate fiscal quarter. A future year view can follow the campaign calendar without requiring a 1948 accounting aesthetic.

## 12.3 No mandatory bookkeeping

The player never categorizes, approves, or “collects” ledger rows. No manual archive or close-the-books action exists. Finance is observation and decision support.

---

# 13. Payroll

## 13.1 Executive hierarchy

```text
PAYROLL                         $87K / week
12 active contracts

Actors                         $34K
Directors                      $18K
Writers                        $13K
Production / Craft             $22K
```

Only real authoritative professions appear. Selecting a group opens a restrained list:

| Person | Profession | Weekly salary | Contract ends | Current work | Decision / status |
|---|---|---:|---|---|---|

The default is not a salary spreadsheet. Name, portrait, profession, weekly salary, contract end, current work, and at most one authoritative decision/status are enough. More Details exposes annual salary, signing event, current remaining guaranteed obligation, and historical contract facts where retained.

## 13.2 Accounting rules

- `weeklySalary = round(annualSalary / 52)` is TypeScript authority.
- Payroll includes active contracted people charged for the selected authoritative week.
- A contracted person continues to cost payroll whether assigned or idle; idleness is an operational opportunity-cost fact, not a different salary.
- Freelancer fees are one-time film direct costs, not payroll.
- Signing bonuses and termination payments are one-time contract movements, not payroll.
- Founding recruitment fund is a separate authoritative founding resource; it must not be presented as Cash or silently mixed into post-founding payroll history.
- Current Stage/extras/decorative people without authoritative contracts never appear as payroll rows.

## 13.3 Decision support

Finance may sort or filter by role, salary, contract horizon, or current assignment. It may show `Idle contract cost` as a neutral fact if assignment truth is exact. It may not label a person `wasteful`, recommend firing them, or invent payroll efficiency.

The Person Profile remains owner of the human contract. Finance deep-links to that exact profile and returns to the same Finance filter/scroll position.

---

# 14. Contract obligations

Finance answers **“what has the studio promised financially?”**

## 14.1 Obligation summary

```text
CONTRACT OBLIGATIONS
Weekly payroll                         $87K
Remaining guaranteed salary          $4.2M
Signing bonuses due now                   $0
Renewals entering legal window       3 people · Week 208
```

`Remaining guaranteed salary` is not deducted from Cash. It is an obligation based on current contracts and current week. The UI names its basis and does not imply every dollar is immediately due.

## 14.2 Per-contract row

- person identity and profession;
- weekly and annual salary;
- current term and end week/date;
- remaining weeks;
- remaining guaranteed salary;
- current renewal eligibility and exact current quote, if legal;
- current termination quote, if legal;
- assignment blocker or current production where relevant; and
- **Open Contract** / **Locate Person**, never a finance-side duplicate negotiation flow.

## 14.3 Upcoming cohorts

Group people who share a future renewal/expiry horizon. The Week-208 renewal wall is not retuned here, but the player should see the cohort early enough to plan. Early visibility is not early legal authority: a row may say `Renewal opens in 18 weeks`; the action remains disabled until TypeScript's current 12-week window.

## 14.4 Early release

Current early release is a material exception: TypeScript calculates termination cost, does not apply the ordinary solvency gate, and may take cash negative. The preview must say so plainly:

```text
Immediate termination payment       -$640K
Cash after                           -$112K
Weekly payroll after                 -$8K / week
Remaining guarantee extinguished     $1.28M
Warning: this payment can put the studio in the red.
```

These figures are examples of hierarchy, not tuning authority. Assigned-project blockers and exact legal consequences come from current action law.

---

# 15. Facility economics

Every facility finance view answers four separate questions:

1. What did/could it cost to build?
2. What recurring operating cost begins when it becomes operational?
3. What exact capacity/capability does it provide?
4. Is a live decision or blocker attached to it?

```text
DEVELOPMENT & CASTING OFFICE
Capital cost                    $1.5M       [prototype example]
Construction                    14 weeks    [prototype example]
Operating cost                  $5.5K/week  [prototype example]
Capacity                        +2 slots    [prototype example]
Status                          Under construction · 9 weeks
```

The Package 09 prototype values remain explicitly provisional. The UI reads the active catalog/quote; it never hard-codes them.

## 15.1 Finance workspace lens

The Facilities subsection lists only financially useful columns: Facility, State, operating cost, capacity/capability, and any authoritative decision/blocker. Capital history appears in detail, including refunds, but current `construction` totals are **net capital committed/recovered**, not a depreciation schedule or asset valuation.

## 15.2 Utilization and ROI

Do not show utilization, cost per slot, break-even, or ROI unless TypeScript defines both numerator and denominator honestly. A facility can be operational and strategically valuable even when idle for a week. Finance may state its current authoritative capacity/reservation state without translating that into a financial score.

## 15.3 Current presentation defect

The newer lot Build surfaces already show weekly running cost. The retained `StudioConstructionView` does not expose it, and `ui/src/screens/StudioDevelopment.tsx` currently contains both stale claims: `No second payment or weekly facility charge is due` and construction `never becomes ... recurring burn`. Both contradict current facility Opex law and must be replaced when that surface is touched. This package changes nothing.

The source comments around `setMaintenance`/`SET_WEEKLY_MAINTENANCE_COST` use broader “maintenance” language, but the current producer in `src/core/sets.ts` creates a debit only when the player repairs a Set and the weekly constant is zero. P11 follows executed law: one-time set repair, not recurring set cost. A future nonzero weekly Set charge would require a separately named projection/ruling.

---

# 16. Construction consequence

Package 09 owns Build interaction and placement law. Package 11 owns the reusable financial preview inside its confirmation.

## 16.1 Before commit

```text
BUILD DEVELOPMENT & CASTING OFFICE

Immediate
Capital commitment                 -$1.5M
Cash now                           $20.0M
Cash after                         $18.5M

When operational · Week 15
Studio Operations                  +$5.5K/week
Approx. runway then                [TypeScript projection]
Capacity                           +2 Development/Casting slots

Construction time                  14 weeks
Placement                          Valid

[Back]                    [Commit Construction]
```

The exact quote must include blueprint, footprint/parcel, current cash, cost, duration/completion, Opex onset, capacity, and legality. Current placement authority has no rotation field; rotation remains Package 09 future scope and must not appear in P11A. TypeScript supplies `cashAfter` and any post-operation runway. Unity must not combine `placementQuote.cost` with treasury fields.

## 16.2 Two time horizons

Construction has an immediate capital event and a later operating event. The preview therefore must not say the weekly delta starts today when the current tick begins charging only after the facility becomes operational. `Cash after purchase` and `Operating cost when complete` are different rows.

## 16.3 Current seam and required P11A protection

Current browser `commitPlacement()` re-queries placement law and returns the unchanged state when the current request is invalid. However, `PlacementQuote` has no quote identity or state revision, the generic browser action is not an idempotent bridge command, and the supplied bridge does not expose generic `placeFacility` as an available intent. P11A must not claim those protections already exist.

For the P11A Unity-facing proof:

- compose `queryPlacement()` / the generic placement view with the repaired Finance selectors in TypeScript;
- add an explicit construction-preview/intent seam carrying expected state revision and stable request/intent identity;
- submit revalidates price, placement, affordability, reservation, and state;
- stale submission fails closed, with no local cash/site mutation or completion animation;
- preserve blueprint/ghost context where still meaningful and publish exactly what changed; and
- define duplicate-command behavior explicitly so one accepted intent can create at most one debit/site.

If Package 09 supplies that seam first, P11A reuses it. Otherwise it is a named P11A prerequisite, not a Unity workaround.

---

# 17. Film budget

## 17.1 What “budget” means today

Current `Production.budget` contains `negative` and `marketing`. In the engaged economy, Greenlight debits those plus any correlated freelancer fees immediately. Contracted talent salaries remain recurring studio payroll. Development, rewrite, and Post do not currently create separate film cash debits.

Therefore the honest forward terms are:

- **Production commitment** — the authored negative;
- **Marketing commitment** — the authored marketing amount;
- **Freelancer fees** — exact one-film engagement fees;
- **Direct film commitment** — their paid total;
- **Studio payroll** — recurring studio cost, shown in the studio lens rather than silently assigned to the film.

## 17.2 Cost lifecycle

| Moment | What is known | What is committed/paid | What remains unknown |
|---|---|---|---|
| Package/Greenlight preview | proposed negative, marketing, freelancer fees, immediate total, current cash/after, capacity | Nothing until explicit confirm | commercial return; future studio-wide operating context |
| Greenlight accepted | locked Production budget/participants; correlated ledger rows | full direct film commitment is debited immediately | final result and Studio Revenue |
| Production active | direct commitment paid; production state/capacity | no rolling weekly film spend under current law | result; no authored “over budget” state |
| Release/run | Gross/result and locked run schedule; Studio Revenue received/scheduled | receipts arrive by authoritative weeks | remaining receipts while active |
| Run complete | full Gross, full Studio Revenue, direct commitment | all run receipts settled | no film-attributable fixed-overhead profit law |

## 17.3 Durable split limitation

The live `Production` retains `negative` and `marketing`, but the durable `production` ledger row merges them and `FilmResult` does not freeze the split. Once the live Production is gone, the exact historic negative/marketing split may be unrecoverable. The UI must then show the verified **Direct film commitment** total and mark sub-lines unavailable. If a future Chronicle promises the split, TypeScript must freeze it at Greenlight; Unity must never reverse-engineer it.

## 17.4 Terms rejected

- `Spend to date` — misleading because current direct commitment is prepaid, not progressively spent.
- `Remaining production spend` — not modeled.
- `Over budget` — no authoritative baseline-versus-actual law.
- `All-in budget` — false if it silently absorbs studio payroll/operations.
- `Talent salaries committed now` — stale current Assembly copy for contracted talent; only freelancer fees are immediate film costs in engaged mode.

---

# 18. Greenlight financial preview

Package 04 remains owner of the package, roles, validity, and Greenlight experience. Its finance region should present:

```text
FINANCIAL COMMITMENT

Production commitment              -$X
Marketing commitment               -$Y
Freelancer fees                     -$Z
Immediate direct commitment         -$Q

Cash now                            $A
Cash after                          $B
Weekly operating cost after         $C/week  (unchanged today, if true)
Approx. runway after                D weeks

Known capacity occupied             [authoritative production/stage facts]
Commercial return                   Unknown until release
```

## 18.1 Separation of known cost and uncertain return

Any player-safe commercial forecast remains a separate assessment with its own uncertainty/provenance. It may not be netted against Cash or labeled a receivable. Greenlight does not show fake predicted box office merely to make the preview feel complete.

## 18.2 Contracted versus freelance talent

Contracted talent belongs to existing studio payroll. The Greenlight preview may show `Studio payroll already committed: $N/week` as context and `Freelancer fees paid now: $Z`, but it must not charge contracted salary again or claim all salaries are paid at Greenlight.

## 18.3 Confirmation

The irreversible action is explicit: `Greenlight <title>`. It revalidates current session/package/cash/state revision in TypeScript. A refusal names the narrowest exact reason. Inspecting, comparing, or opening Finance never mutates the package.

---

# 19. Active production finance

The Finance lens for an active film should be deliberately modest:

```text
NIGHT HARBOR · SHOOTING

Direct film commitment paid         $Q
  Production + marketing            $P  [split only while authoritative]
  Freelancer fees                   $F

Studio payroll                      $87K/week  [context; not allocated to film]
Current production location         Stage 7
Commercial return                   Not yet known
```

Current authority does not support spend-to-date, committed remaining, weekly production debit, contingency, over-budget, or expected final cost. Do not invent them.

A future managerial fixed-cost lens may show **allocated studio operating cost over declared occupancy**, only after the facility-Opex omission is repaired. It must name the equal-sharing/concurrency convention and remain visually subordinate to Direct Film Commitment and Contribution. It never mutates FilmResult and never becomes “true film profit.”

Production blockers remain Package 05 operational facts. Finance may show only a real monetary consequence or route, not duplicate the Production workspace.

---

# 20. Release economics

Package 07's distinctions are binding:

Historical base-game marketing was selected at Release. Project: Studio's current marketing/commitment timing remains governed by Packages 04, 06, and 07. Nothing in P11 moves, repeats, or adds a Release-time debit; Finance only explains whichever authoritative action actually posted the cash movement.

```text
Theatrical Gross
    × locked studio share
= Full-run Studio Revenue

Studio Revenue received + Studio Revenue scheduled
= Full-run Studio Revenue

Full-run Studio Revenue − Direct film commitment
= Film Contribution
```

## 20.1 Active run hierarchy

- **Theatrical Gross:** full authoritative audience spend.
- **Studio share:** the locked run rate/model; provenance visible under More Details.
- **Studio Revenue received:** cash already credited by ledger.
- **Next scheduled receipt:** next authoritative week.
- **Studio Revenue scheduled:** remaining locked receipts.
- **Direct film commitment:** current exact per-production ledger total.
- **Projected Film Contribution:** full-run Studio Revenue minus direct commitment while any receipts remain.

## 20.2 Completed run hierarchy

When all scheduled receipts settle, remove `Projected` and show **Final Film Contribution**. Do not say `Net Profit`, and do not imply the entire Studio Revenue arrived at release. Legacy one-lump films display their stored/provenance-specific path honestly.

## 20.3 Current copy correction

`ui/src/engine/adapter.ts::runProjection()` and `releaseScorecard()` currently calculate Contribution but emit `Projected profit/loss`, `Profit/Loss`, and ROI-oriented labels. A future presentation pass should retain the math and replace those labels. Package 11 does not alter it.

There is also an active-run basis mismatch: `runProjection()` / `releaseScorecard()` use **full-run Studio Revenue** for projected Contribution, while `src/core/studioRunRecap.ts` currently uses paid-to-date revenue for an active run and the browser recap labels it `Net film contribution`. P11A Film Economics must consume one centralized full-run projected Contribution selector and must not reuse the paid-to-date recap line under the same name. Paid-to-date cash remains visible separately as Studio Revenue received.

---

# 21. Film-level P&L

## 21.1 Ruling: call it Film Economics, not P&L

The ordinary player-facing surface is **Film Economics** because current authority cannot produce a complete accounting profit statement.

```text
FILM ECONOMICS · NIGHT HARBOR

DIRECT COST
Direct film commitment               $4.2M
  Production + marketing             $3.5M  [when retained]
  Freelancer fees                    $0.7M

COMMERCIAL RETURN
Theatrical Gross                     $15.0M
Studio Revenue received               $4.1M
Studio Revenue scheduled              $3.7M
Full-run Studio Revenue               $7.8M

FILM CONTRIBUTION
Projected Film Contribution           +$3.6M
Before studio payroll and operations
```

Values are illustrative only.

## 21.2 What is excluded

- current studio payroll;
- ordinary overhead;
- facility Opex;
- idle-period cost;
- unallocated support cost;
- capital spending;
- any tax, distribution expense, interest, or financing that does not exist;
- development/Post costs not separately ledgered; and
- unrecorded legacy cost detail.

The exclusion line is always visible near Contribution, not buried in a tooltip.

## 21.3 Optional managerial view

After the fixed-cost read-model repair, a More Details section may show:

```text
Allocated studio operating cost      $R
Declared basis: actual recorded recurring studio costs,
shared equally among films occupying the studio each week;
idle cost remains unallocated.

Studio-economic result (managerial)  $S
```

This is a named management convention, not audited film profit. It is absent from P11A unless already repaired and reconciled across all current recurring costs.

## 21.4 No fake accounting precision

If an older record lacks direct commitment or split provenance, show `Not recorded for this film`. Do not allocate current totals backward. Do not divide studio operating cost by current films and pretend the result was historically paid by one title.

---

# 22. Portfolio

## 22.1 Purpose

The portfolio answers **“where is my capital tied up, and which films are returning it?”** It is not the Production Board or Film Chronicle.

## 22.2 Default table

| Film | Phase | Direct commitment | Studio Revenue | Film Contribution | Decision / next event |
|---|---|---:|---:|---:|---|
| *Night Harbor* | Shooting | Paid $4.2M | Not known | Not known | — |
| *Laughing Moon* | In theaters · W2/6 | Paid $3.1M | $1.4M received · $2.0M scheduled | Projected +$0.3M | Receipt next week |
| *Red Line* | Completed | Paid $5.0M | $3.8M final | Final -$1.2M | — |

Default sorting is **an unresolved authoritative decision or blocker first, then pipeline phase/time**, not biggest number. Filters: Development/Package, Production, Post/Release Ready, In Theaters, Completed. The first two phases may not have a direct commitment yet and must show `Not committed`, not `$0`.

## 22.3 Scale and navigation

- One row per stable production/film ID.
- Multiple active films remain isolated; no title string joins.
- Selecting a row opens Film Economics in place.
- `Open Production`, `Open Release Result`, or `Open Chronicle` appears according to authoritative phase.
- `Locate` targets a live physical owner only; historical films do not fabricate a lot location.
- User filter, sort, selected film, and scroll position survive drill-down and Back.

## 22.4 Rejected columns

No default critic score, audience score, cast, every cost subline, break-even, ROI, allocated overhead, or predicted box office. Those belong in Film Result/Autopsy or More Details. Do not create a 25-column spreadsheet.

---

# 23. Forecast

## 23.1 Honest forecast boundary

Finance may forecast only **known authoritative flows and dates**:

- current recurring payroll and Studio Operations;
- current contract terms, guarantees, renewal-window openings, and expiries;
- already-committed construction completion and facility-Opex onset;
- already-active theatrical-run receipts from the locked schedule;
- current exact cash and accepted commitments; and
- other specifically scheduled ledger-authoritative facts.

It may not forecast:

- success of unproduced or unreleased films;
- future contracts the player has not signed;
- automatic renewal;
- audience demand, market growth, competition, inflation, taxes, or financing;
- borrowing capacity or investor rescue;
- a Greenlight return using hidden actual quality; or
- any “best/worst investment” score.

## 23.2 Recommended follow-up surface

This is not required in P11A. It becomes legal only when a TypeScript known-flow projection explicitly publishes each event; current `studioCalendar()` does not publish facility-Opex onset.

Use a compact **Known upcoming** list before a speculative line chart:

```text
KNOWN UPCOMING
Week 75   Laughing Moon Studio Revenue      +$620K
Week 81   Development Office operational    +$5.5K/week
Week 197  3 renewal windows open             Review contracts
Week 209  3 current contracts expire         If not renewed
```

Contract expiries are facts; renewal costs are current quotes, not guaranteed future debits. Facility Opex onset follows current completion law. A label states: `Does not include new films or uncommitted decisions.`

## 23.3 Forecast period

Use rolling `13 weeks` by default and `52 weeks` as an explicit switch once the projection exists. This matches weekly simulation and avoids imposing a modern corporate fiscal year. A future calendar-year/era report can coexist for history.

---

# 24. Decision Preview Contract

## 24.1 One authoritative language

Every **implemented financial-preview family** uses one TypeScript-authored envelope. P11A implements the construction family only; Hiring, Renewal, employee release, and Greenlight retain their current owner workflows until separately scoped. The conceptual envelope—not a production-code prescription—is:

```text
FinancialConsequencePreview
  subject/action identity
  quote identity + expected state revision + generated week
  legality + exact refusal reason
  immediate cash movement
  cash now / cash after
  recurring weekly delta and effective week
  weekly operating cost / net weekly cashflow after
  current-pacing runway after
  guaranteed/scheduled obligation where applicable
  capability/capacity/assignment consequence where applicable
  uncertainty/exclusions
```

Fields absent for an action are omitted—not shown as zero. Currency, sign, period, and effective timing use a shared formatter.

## 24.2 Action-specific content

| Action | Immediate | Recurring | Obligation | Operational / uncertainty |
|---|---|---|---|---|
| Hire | signing bonus; cash after | weekly salary + real per-seat/base cost; payroll/net/runway after | guaranteed salary + bonus total | role/availability; founding fund separately where applicable |
| Renew | signing bonus; cash after | salary delta; payroll/net/runway after; no false new-seat overhead | replacement term/guarantee | exact legal window/current quote |
| Release employee | termination payment; may make cash negative | weekly payroll relief from effective point | remaining guarantee extinguished per current law | assignment blocker; explicit irreversibility |
| Construct | capital cost; cash after | Opex delta **when operational** | none unless authority adds one | duration/completion, capacity, placement validity |
| Greenlight | negative + marketing + freelancer fees; cash after | normally unchanged recurring cost under current law; contextual existing payroll | no new contracted guarantee unless a separate contract action occurs | capacity occupied; commercial return unknown |
| Final Rewrite/publicity/future land | only if current authority exposes a real cost | only if real | only if real | no decorative finance box for cost-free actions |

## 24.3 Interaction contract

1. Opening or editing a preview never mutates state.
2. Any material parameter change requests a fresh authoritative preview.
3. Confirm button names the exact action.
4. Submit carries the current opaque intent/quote and expected revision.
5. TypeScript revalidates legality, affordability, identity, and current state.
6. Stale/mismatched action fails closed and returns a fresh preview with `What changed`.
7. Unity never preplays cash, construction, contract, or production success.
8. Accepted action returns one authoritative receipt and world acknowledgment.

---

# 25. Affordability

## 25.1 Two separate questions

**Can afford now** is TypeScript law: the current voluntary commitment passes the exact solvency gate. **Financially prudent** is the player's judgment after seeing consequences.

The UI may say:

```text
Can commit now
Leaves $2.1M cash
Current recurring pace after purchase: [authoritative current value]
Week M, when operational: operating cost becomes $185K/week
Approx. 11 weeks at that future operational pace
```

It may not say `Good investment`, `Too risky`, `Recommended`, or `Bad ROI` unless a future TypeScript assessment explicitly authors those judgments and their drivers.

## 25.2 Refusal

An insufficient-cash refusal shows:

- exact required immediate amount;
- exact cash now;
- exact shortfall;
- why the action cannot proceed;
- the narrowest safe route, if one exists (`Open Finance`, `Review films`, `Review contracts`); and
- no disabled-button-only mystery.

The action remains blocked even if Unity's cached preview looked affordable. Early contract release is an explicit current-law exception and must not be forced through the ordinary gate.

## 25.3 Negative cash

Negative cash does not imply automatic bankruptcy. Show the current legal state, known receipts, recurring cost, and exact unavailable voluntary actions. Do not invent a loan prompt, rescue package, or countdown.

---

# 26. Financial risk

Canonical TypeScript does not currently publish a stable financial-health classifier. The browser adapter has presentation-derived cash bands (`in-red`, `tight`, `flush`) based on cash/runway thresholds; those are not simulation authority and should not silently become enterprise risk law.

## 26.1 P11 ruling

- P11A shows facts: Cash, Net weekly cashflow, current-pacing Runway, known obligations, and exact blockers.
- It does not display an invented `Healthy / Tight / Critical` score.
- Sign, icon, text, and trend communicate state without color-only semantics.
- If a future qualitative risk state is desired, TypeScript must publish its thresholds, basis, drivers, effective week, and actionable response. The state changes presentation/attention only unless separate gameplay law authorizes more.

## 26.2 Negative is not automatically bad

A negative cash-movement week caused by an intentional construction purchase is not the same as structurally negative weekly cashflow. Finance shows both:

```text
This week: -$1.68M   (includes $1.50M construction)
Current recurring pace: -$33K/week
```

This is the most useful translation from *Victoria 3*: classify a temporary investment separately from recurring fundamentals, then let Project: Studio's own typed ledger explain the named cause.

---

# 27. Financial attention

| State | Level | Surface | Player-safe explanation | Action |
|---|---|---|---|---|
| Routine weekly cash movement | **INFO** | HUD pulse; Finance `This Week` | Exact signed movement; no alert | Open Finance optionally |
| Scheduled release receipt posts | **INFO** | film/Theater pulse; grouped period summary | Title, received amount, run week | Open Film Economics |
| One-time capital spend posts | **INFO** | site receipt; period annotation | Facility, amount, construction state | Locate site |
| Recurring cashflow becomes negative | **INFO** by default; **ATTENTION** only under authored materiality law | Administration badge / HUD finance pulse | exact cost/revenue change | Open Finance |
| Current cash enters negative | **ATTENTION** | Administration + HUD, no camera move | cash, current pace, known receipts, blocked voluntary commitments | Open Finance |
| Contract cohort approaching legal decision | **ATTENTION**, then **DECISION** when legal window opens | Administration/Calendar/Roster grouped item | number of people, date, current obligation | Review Contracts |
| Current quote materially changes while open | **DECISION** | consequence sheet | exact old/new field and reason | Review refreshed preview |
| Insufficient funds on commit | **BLOCKING** | action-local refusal + Administration route | requirement, cash, shortfall | Back / Open Finance |
| Assigned employee cannot be released | **BLOCKING** | contract action | exact production/screenplay binding | Locate exact assignment |
| Large upcoming obligation | **ATTENTION** only if TypeScript authors threshold | Finance `Upcoming` and Admin | amount, date, subject | Review exact contracts |
| Film Contribution negative/final | **INFO** | Film Result/Portfolio | direct return and exclusions | Open Film Autopsy; no finance alarm |

## 27.1 Attention laws

- Repeated conditions group into one item (`3 contracts require decisions`), not one alert per employee.
- INFO never pauses time.
- Merely opening Finance never pauses time.
- A preview/confirmation follows the governing Package's existing time law; Unity starts no second clock.
- Alerts never move the camera. `Locate` is explicit.
- An attention disappears when authoritative state resolves elsewhere.
- No `YOU LOST MONEY THIS WEEK` spam.

---

# 28. Administration / Finance ownership

## 28.1 World-native route

```text
Notice finance pulse / future core-authored Administration attention
    ↓ single-click Administration
Administration inspector
    Cash
    Net weekly cashflow
    conditional Runway
    top cost/revenue driver
    future grouped attention when core authority exists
    [Open Finance]
```

Administration is the physical owner of executive finance. It does not own film creative decisions, contract human detail, or facility operation. It links to those owners. P11A adds no financial-attention classifier: literal Cash and cashflow remain visible facts, while existing contract decisions remain owned by their current Calendar/Roster routes. A later core projection may publish a grouped condition/severity; until then no attention slot appears.

## 28.2 Local inspector behavior

Selected Administration locally answers:

- current Cash;
- whether current recurring pace is positive/negative/steady;
- conditional current-pacing Runway;
- largest recorded movement in the most recently resolved week, where available;
- `Open Finance`; and
- `Back`/selection behavior from Package 02.

No more than three major figures appear in P11A. No empty alert slot is shown. It is not a miniature P&L.

## 28.3 Retained workspace route

`Open Finance` retains Administration selection, camera, zoom, prior route, and lot state. The workspace occupies approximately 62–68% of a wide display, leaving 32–38% of the lot visible. On narrow displays it becomes full screen while preserving the same retained context. Opening it never focuses or moves the camera.

## 28.4 Cross-domain routes

- Payroll row → exact person/contract.
- Facility cost → exact building/site.
- Film row → exact Film Economics/Production/Chronicle state.
- Receipt → exact theatrical run/Theater presentation where live.
- Construction completion → exact site/facility.

`Back` returns to the prior Finance filter/selection, then another Back returns to the exact Administration/lot context. `Locate` is an explicit separate action.

---

# 29. Finance workspace

## 29.1 Primary layout

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ ‹ Back   ADMINISTRATION / FINANCE          Week 74     [Recorded basis] │
├─────────────────────────────────────────────────────────────────────────┤
│ CASH                 NET WEEKLY                 RUNWAY                  │
│ $17.38M              ↓ $33K / week              Approx. 526 weeks      │
│                      current recurring pace     at current pace        │
├─────────────────────────────────────────────────────────────────────────┤
│ Overview   Costs   Obligations   Films   Upcoming   History            │
├───────────────────────────────┬─────────────────────────────────────────┤
│ THIS WEEK                     │ ATTENTION / CONTEXT                     │
│ + Studio Revenue       $57K   │ 3 renewals open in 8 weeks             │
│ - Payroll               72K   │ [Review Contracts]                     │
│ - Studio Operations     18K   │                                         │
│ - Capital             1.50M   │ KNOWN UPCOMING                          │
│ Net movement         -1.53M   │ next receipt / completion / date       │
│ [View entries]                │                                         │
├───────────────────────────────┴─────────────────────────────────────────┤
│ restrained trend / selected detailed section                           │
└─────────────────────────────────────────────────────────────────────────┘
```

Values above are illustrative only.

## 29.2 Information hierarchy

1. **Sticky identity/header:** Back, Administration/Finance, current week/period, provenance state.
2. **Health strip:** Cash 32–40 px; signed Net weekly 24–28 px; conditional Runway 20–24 px.
3. **Primary navigation:** six named sections maximum. No endless nested tabs. P11A may expose only Overview, Costs, and Films; the full Obligations/Upcoming/History routes remain staged.
4. **This Week:** exact reconciled cash movement above the fold.
5. **Future Attention/Upcoming:** grouped core-authored decisions and known dates, never speculative advice; not required in P11A.
6. **Selected detail:** category/film/contract/facility list with links and More Details.

Body copy targets 16–18 px at normal desktop scale; labels 13–14 px minimum with strong contrast; important signed values never depend on color. No giant paragraphs, dense tooltip-only definitions, or small white memo aesthetic.

## 29.3 Section responsibilities

- **Overview:** health, this week, and top recurring drivers. Future core-authored attention/known upcoming may extend it.
- **Costs:** Payroll, Studio Operations, capital, film commitments, contract events/publicity by period.
- **Obligations:** current guarantees, renewal/expiry cohorts, exact contract links.
- **Films:** portfolio and Film Economics.
- **Upcoming — FOLLOW-UP:** known receipts, expiries/windows, construction completion, and a separately authored facility-Opex-onset event. Current `studioCalendar()` does not publish Opex onset, so P11A does not show it as a calendar fact.
- **History:** recorded period comparison, charts, ledger entries, missing-history disclosures.

## 29.4 Empty and missing states

- No active films: `No film capital currently committed` with retained completed/history access.
- No active theatrical runs: `No scheduled Studio Revenue from active runs`.
- No contracts: `No active payroll`.
- Old save history gap: show current truth and `Recorded history begins Week N`.
- A missing optional direct-cost split does not collapse the entire Film Economics record.

---

# 30. Charts

Only three chart families earn space.

| Chart | Question answered | Data/basis | Ruling |
|---|---|---|---|
| Cash balance + signed weekly movement | `Are we trending toward or away from safety, and what caused the step?` | recorded ledger/cash checkpoints; 13/52-week switch; annotations for material named events | **BUILD FOLLOW-UP.** Useful after accurate history projection. |
| Cost composition over time | `Which recurring/capital/film category changed?` | payroll, Studio Operations, direct film commitments, capital, publicity, explicit contract events | **BUILD FOLLOW-UP.** Stacked bars/lines with selectable category and exact totals. |
| Film Contribution comparison | `Which completed/releasing films returned direct committed capital?` | full-run/scheduled Studio Revenue and direct commitment | **FOLLOW-UP, not P11A.** Label projected/final; no Profit/ROI. |

Rejected:

- pie charts without a period/change question;
- cash gauges or speedometers;
- generic “financial health” score;
- ROI scatterplots from incomplete costs;
- unauthored forecast curves;
- a 120-year weekly line as default;
- red/green-only charts; and
- chart duplication of a two-number comparison.

Every chart supports keyboard focus, textual summary, exact point values, and the same filter period as the surrounding workspace.

---

# 31. Long-term financial history

## 31.1 Retention doctrine

| Fact | Persist / derive / summarize / discard | Authority | Reason |
|---|---|---|---|
| Current cash | Persist | Game state | Core simulation truth. |
| Signed cash ledger | Persist under current save law | TypeScript ledger | Exact recorded reconciliation and provenance. |
| Weekly category totals | Derive from ledger | `periodSummary()`/future complete projection | Avoid duplicate truth. |
| 13/52-week chart series | Derive/cache | ledger + cash checkpoints | Presentation performance, not new authority. |
| Yearly revenue/payroll/operations/capital/direct-film totals | Summarize or derive | typed ledger categories | 120-year executive history. |
| Film contribution | Derive from durable film/run/ledger facts; persist missing split if future UI requires it | TypeScript | Film Chronicle/portfolio. |
| Peak/lowest cash | Derive from complete recorded history; otherwise `Not recorded` | ledger/checkpoint | Avoid false old-save records. |
| Major financial milestone | Persist only through Package 08 significance/event authority | Studio History | A studio-saving hit or major investment may matter; routine weeks do not. |
| Workspace filters/charts | Discard or ordinary local UI state | presentation | Not finance history. |
| Per-week explanatory prose | Discard/regenerate from typed rows | presentation | Prevent save bloat and fabricated causality. |

## 31.2 1920–2040 scale

A 120-year campaign should default to rolling weeks for executive work and years/eras for historical comparison. The raw ledger may remain implementation authority, but a future save-compaction campaign may summarize closed years while preserving reconciliation checkpoints, per-film durable economics, major contract/capital events, and Studio History milestones. P11 does not implement compaction.

---

# 32. Distress / bankruptcy boundary

## 32.1 Current law

- Voluntary immediate commitments ordinarily require sufficient cash.
- Unavoidable weekly payroll/overhead/facility Opex may take cash negative.
- Current early-release termination can also take cash negative.
- Negative cash is a recoverable operating state; existing active-run receipts may continue.
- There is no authoritative bankruptcy, receivership, loan, bailout, forced sale, or game-over state.

## 32.2 P11 presentation

When cash is negative, Administration says:

```text
IN THE RED
Cash                              -$112K
Net weekly cashflow               +$41K/week
Next scheduled Studio Revenue     +$190K · next week
Voluntary commitments may be unavailable.
```

or the real negative pace/known facts. It never promises recovery if the schedule does not support it. Finance reveals current obligations and legitimate current actions without inventing a recovery mechanic.

## 32.3 Future Owner gate

Whether Project: Studio ultimately has failure, emergency capital, restructuring, or a recoverable distress campaign is a genuine future Owner decision. It is not required for P11A and must not be implied by current UI.

---

# 33. Capital/financing boundary

No current authority exists for loans, credit facilities, interest-bearing debt instruments, investors, equity, bonds, interest, tax, acquisition, or public markets. P11 therefore:

- shows only studio Cash, capital spending/recovery, current costs, obligations, and receipts;
- reserves extensible category space for future typed financing flows without naming them now;
- rejects a disabled `Loans` tab or fake credit score; and
- makes external financing a separate future product/Owner decision, not an implementation seam to fill opportunistically.

The original's recoverable negative-cash state is historical evidence, not permission to invent modern financing.

---

# 34. Multi-film concurrency

All finance read models and routes must assume multiple simultaneous films:

- several screenplay/package projects with no direct commitment yet;
- multiple productions occupying physical capacity;
- several Post/release-ready films;
- multiple active theatrical runs crediting independently in one tick; and
- completed historical films.

## 34.1 Isolation contract

- Join costs and receipts by immutable `productionId`, never title or list position.
- Sum every active run for studio-level next receipt/pipeline totals.
- Preserve each run's own locked studio share/model/version.
- A ledger row without a film ID remains studio-level; never allocate it by coincidence.
- A Publicity row currently has no production ID and therefore remains studio-level, not attached to a film.
- Portfolio filtering/sorting does not change any simulation order.
- Current physical facility capacity/queue remains Production authority; Finance only reports it.

## 34.2 Concurrent fixed-cost caveat

Any optional studio-cost allocation must name how shared weekly costs are divided among concurrent occupants and must preserve idle cost separately. It remains a management convention. The ordinary Film Contribution view avoids this controversy entirely.

---

# 35. Save/migration

## 35.1 Current-state restoration

After save/load, reconnect, process restart, or engine outage, the Finance UI must restore authoritative:

- current Cash;
- active contracts and obligations;
- facilities/sites and Opex state;
- active productions and direct commitment provenance;
- theatrical runs, received/scheduled Studio Revenue, and locked share;
- ledger/checkpoint history that the save actually contains; and
- selected Administration/Finance/film/person context where presentation state can safely restore it.

No animation replays a payment, construction commit, or receipt as if newly generated.

## 35.2 Old saves

- Preserve migrated cash, ledger, placement IDs, production IDs, run IDs, and current schema migrations.
- Do not reinterpret pre-ledger totals as itemized historical entries.
- Display `Recorded history begins Week N` or `Earlier cash movements not recorded`.
- A legacy one-lump `boxOffice` row remains visibly distinct from a current multi-week Studio Revenue run where detail matters.
- Missing historic budget split or participant link yields a local `Not recorded`, not a broken record.
- Never rewrite `INITIAL_PROPERTY` or mature historical saves as sparse-start finance history.

## 35.3 Stale/reconnect action safety

All previews are disposable projections. After reconnect, the client requests current state and quote. A cached preview cannot commit. Duplicate submission cannot create duplicate cash/ledger rows.

---

# 36. Era safety

The accounting grammar survives 1920→2040 because it describes business facts rather than one era's paperwork:

- Cash, Payroll, Studio Operations, Capital, Direct Film Commitment, Studio Revenue, Contribution, and Obligations remain stable concepts.
- Money/date formatting comes from authoritative campaign/locale presentation, not hard-coded 1948 copy.
- Finance visual treatment may evolve from ledgers/ledgers books to terminals and future interfaces without changing the data contract.
- A future release channel adds a typed revenue category and provenance; it does not overload `Theatrical Gross`.
- Contract/facility/revenue category taxonomies are extensible, but absent systems are not pre-populated in the UI.

Do not design inflation, unions, agents, tax regimes, television, home video, streaming, or future 2040 financing here. The workspace must not assume any one of them.

---

# 37. Adopt / Adapt / Reject

| Concept | Ruling | Why / translation |
|---|---|---|
| Persistent visible cash | **ADOPT** | Original tactile strength; exact literal cash. |
| Click cash / select Administration for depth | **ADOPT / ADAPT** | Physical owner plus retained modern workspace. |
| Tangible construction/film/contract spend | **ADOPT** | Money produces visible studio/business consequence. |
| Recent finance trend | **ADAPT** | Reconciled ledger first; chart second. |
| Salary screen | **ADAPT** | Payroll and obligation overview with exact Person links, not salary babysitting. |
| Original release marketing choice | **ADAPT principle only** | Explicit TypeScript consequence and uncertainty; current Package 04/06/07 timing remains binding and no debit moves or duplicates. |
| Pulsing movie income | **ADOPT principle** | World/HUD acknowledgment plus exact received/scheduled Studio Revenue. |
| Soft negative-cash pressure | **ADAPT** | Current recoverable state and precise voluntary-spend gates; no invented historical exceptions. |
| Overview → breakdown dashboard | **ADOPT** | *Planet Coaster 2* / *Cities II* hierarchy with Studio-specific categories. |
| Temporary vs recurring deficit distinction | **ADOPT** | One-time capital/film events never pollute weekly pace. |
| Amount + deadline + remedy warning | **ADOPT** | Grouped exact contract/finance attention. |
| Before/after commitment | **ADOPT** | Shared TypeScript preview across actions. |
| Known future obligations/calendar | **ADAPT** | Dates and scheduled facts only; no reserved cash fiction. |
| “Weekly Burn” as universal label | **REPLACE** | Use Weekly operating cost and Net weekly cashflow with exact basis. |
| Current incomplete burn/runway projection | **REPLACE projection** | Include recurring facility Opex; no tuning change. |
| Film `Profit/Loss` and ROI labels on Contribution math | **REPLACE labels** | Preserve Film Contribution and exclusions. |
| Complete film P&L today | **REJECT** | No full attributable overhead/cost authority. |
| Allocated fixed-cost headline | **REJECT headline / FOLLOW-UP detail** | Managerial convention only, after complete recurring-cost reconciliation. |
| `Available cash` / reserves | **REJECT** | Not modeled. |
| UI-calculated runway/cash-after/payroll/risk | **REJECT** | TypeScript-only authority. |
| Unexplained health grade/risk color | **REJECT** | Facts first; future classifier requires authored thresholds/drivers. |
| Fake ROI/payback on facilities | **REJECT** | Return cannot be attributed honestly. |
| Spreadsheet-first Finance | **REJECT** | Progressive depth and lot retention. |
| Constant cash-loss alerts | **REJECT** | Routine information is not attention. |
| Forecasting future hits/market | **REJECT** | Uncertain/unmodeled. |
| Loans/investors/taxes/bankruptcy | **DEFER OWNER GATE** | No current authority; no P11 scope. |
| Rolling 13/52-week history | **ADAPT** | Useful weekly executive horizon; longer yearly summaries later. |

---

# 38. REQUIRED NEXT / FOLLOW-UP / LATER / DO NOT DO

## REQUIRED NEXT — P11A prerequisites and slice

1. Repair the recurring finance read model so `weekly operating cost`, `net weekly cashflow`, and runway include actual operational facility Opex. Add selector/ledger reconciliation tests. Do not expose or repair the optional per-film fixed-cost allocator in P11A; that remains follow-up.
2. Publish a typed Finance projection from TypeScript with Cash, complete recurring components, Net weekly cashflow, conditional Runway, exact last-period movement, P11A payroll and compact current-guarantee summaries, film detail, and missing-history provenance. Full obligation-calendar/upcoming/attention projections remain follow-up.
3. Extend the bridge/schema/generated DTO from those selectors; preserve revision/opaque-intent law.
4. Build the Administration compact inspector and retained Finance shell.
5. Build exact `This Week` reconciliation and Payroll/Studio Operations drill-down.
6. Reuse Package 07 film authority for one Film Economics/portfolio detail; replace Profit/ROI copy with Contribution language.
7. Prove the shared consequence contract with one Package 09 construction quote, including immediate capex, delayed Opex onset, capacity, refusal, exact Back, and the new revision-bound construction-preview/intent seam described in §16.3.
8. Add adversarial tests for one/multiple operational facilities, completion onset, demolition, active run revenue, negative/positive/near-zero pace, old-save history gaps, multi-film isolation, stale quote, and duplicate submit.

## FOLLOW-UP

- complete known-flow calendar across contracts, receipts, and facility operating onset;
- 13/52-week cash/cost charts and yearly summaries;
- consequence previews for hire, renewal, early release, and Greenlight using the same contract;
- full Finance portfolio with all pipeline filters;
- durable Greenlight cost split if the product wants exact historic negative/marketing lines;
- optional, clearly named managerial studio-cost allocation after reconciliation repair;
- semantic financial attention if TypeScript authors materiality thresholds.

## LATER

- long-horizon finance compaction/checkpoints;
- era/revenue-channel extensions;
- genuine facility utilization/productivity economics;
- a full authoritative film profitability basis, if the Owner chooses overhead allocation;
- external financing, distress recovery, or failure policy only after Owner research/ruling;
- rival/market financial comparison only with real rival authority.

## DO NOT DO

- do not retune any economy value or solve the Week-208 wall here;
- do not call Film Contribution Profit, Net Profit, or ROI;
- do not mix Gross with Studio Revenue or scheduled receipts with cash received;
- do not subtract future obligations into an invented cash balance;
- do not put one-time purchases in recurring weekly operating cost;
- do not fabricate spend-to-date, remaining film budget, over-budget state, historical split, or old-save ledger;
- do not calculate finance, risk, or affordability in Unity;
- do not add loans, investors, taxes, bankruptcy, or financial rescue;
- do not add a giant global spreadsheet or dense tiny memo;
- do not use presentation-only cash bands as gameplay authority;
- do not auto-pause or move the camera for ordinary finance events; and
- do not rebuild Package 03/04/06/07/09/10 interactions.

## Owner decisions

**None are required before P11A.**

Later, separate Owner decisions are genuinely required for:

1. whether the mature game has an ultimate bankruptcy/failure or structured recovery law;
2. whether loans/investors/other external financing ever exist; and
3. whether studio-wide payroll/operations are ever allocated into a canonical film-profit measure.

Until then, current recoverable negative cash, no external financing, and Film Contribution before studio-wide costs remain binding.
