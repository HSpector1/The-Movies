# P11 → P12 producer handoff

**[Owner accepted: KEEP for the delivered supported P11 scope](../campaigns/P11-OWNER-ACCEPTANCE-RECEIPT.md).** This is a documentation handoff, not P12 implementation authorization. The [execution log](../campaigns/P11A-EXECUTION-LOG.md) and [45-row register](P11A-DECISION-AND-REQUIREMENT-REGISTER.md) retain the evidence and scope decisions. Conditional, deferred, dependency-blocked and Owner-blocked requirements are not activated by this handoff.

## Accepted contract

| Identity | Delivered value |
|---|---|
| TypeScript product | `7ae36b44d99c505246d17dcc37beba94fa59a18a` |
| Unity product | `3a9a3f488693aa14431a6aa412d7560df8f30a89` |
| Technical documentation predecessor | `e39bcbb1bf6cb13553a3b6c2425773d5f85d873a` |
| Protocol / projection / inner save / outer checkpoint | **4 / 27 / V18 / 1** |
| Schema | `sha256:97940e51e0566bed80231b223e5b7303a45d62db8d698f693e525eb244775211` |
| Generated Unity DTO SHA256 | `ecc9e0b65c493200e39d245d38de2cdad5be1953242ffc1a61a7c53fcb755476` |
| Packaged engine SHA256 | `975fe18d1e235c0f444a7ac9a9f6c413a95c87d0223465a9ec413696737f65bb` |

The preserved candidate is `P11A-Finance-Candidate-7ae36b4-3a9a3f4` on the Desktop. Its generated evidence index and adjacent `.launch-check.json` distinguish original build evidence, bounded reuse and actual copied launch. Documentation successors do not relabel those bytes.

P12 integration must explicitly consume this accepted source pair and its matching projection27 consumer. Campaign/main remain unpromoted; their branch names do not identify the delivered P11 producer. This handoff establishes producer availability, not a tested P12 integration.

## Read-model entry points

The schema owner is [bridge/schema/bridge-schema.ts](../../bridge/schema/bridge-schema.ts). `StudioFinanceProjectionSchema` produces `StudioFinanceProjection { finance: StudioFinanceSnapshot }` inside the atomic `StudioProjectionBundle`. **The received path is `snapshot.finance.finance`**, joined to the enclosing `sessionId`, `stateRevision`, `gameWeek`, `stateDigest` and `schemaId`. `projectStudioProjectionBundle` validates the bundle; `SnapshotBuildContext.finance()` memoizes `financeProjection(state, people)` for that state.

| Producer | Contract to reuse |
|---|---|
| [financeOverview](../../src/core/financeReport.ts) | Literal Cash; payroll, overhead and operational facility Opex; total `weeklyOperatingCost`, `nextScheduledStudioRevenue`, signed `netWeeklyCashflow`, conditional runway, recording boundary, current and last periods. |
| `financeRecordingBoundary`, `recordedFinancePeriod` | `FinancePeriod`: exact inclusive ledger-week range, `coverage`, nullable opening/closing Cash, signed categories and `capitalContributors`. Current week is explicitly “so far”; coverage completeness does not mean the week has ended. |
| `financeHistory` | `FinanceHistory.windows`: 13/52 completed-week `points`, aggregate `period`, category `costSeries`, actual available-window label and `calendarNotice`. At Week0, no completed points and `period:null`. |
| `recordedFinanceEntries` | Internal bounded selector for exact ledger indices/notes/IDs; default 50, maximum 100 rows, `totalEntries`, `offset`, `hasMore`. This is not a new wire query endpoint or an unbounded ledger payload. |
| [financeProjection](../../bridge/finance.ts) | Current `employees`, placed `facilities`, film economics, guarantee/operations basis, attention, `upcoming`, `portfolio`, `history`. |
| [financeUpcoming](../../bridge/finance-upcoming.ts) | `FinanceUpcomingEvent` in 13/52-week windows, maximum 64 rows with explicit remainder. Retains already-open renewal and overdue committed Set dates; publishes aggregate active-run revenue only. |
| [financePortfolio](../../bridge/finance-portfolio.ts) | `FinancePortfolioRow`: canonical `scriptProject` or `production` identity; development/package, production, post/release-ready, in-theaters and completed phases; blocker/decision-first default sort; exact routes. |

`FinanceTimeClass` separates `recordedCash`, `currentRecurringCost`, `knownCommitment` and `currentPaceEstimate`. Do not substitute one for another. Preserve ordered ledger additions and literal finite money values; presentation rounding must not become accounting. Cash may be negative. Guarantees describe existing future payroll and are not subtracted from Cash again.

History coverage uses the cash-ledger checkpoint and `studioHistory.recordingStartedWeek` conservatively; History rows never supply money. Missing/partial history is not zero. Charts require complete coverage for plotted movements/costs and non-null balances; labelled tables may retain partial amounts. Capital contributors use original ledger amount/week/project ID, at most 20 rows plus exact remainder. `historyEventId` is nullable when an exact retained join cannot be established; never reconstruct a purchase from today's blueprint price or a title.

`theatricalGross` is audience box office, not Cash received. `studioRevenueReceived` is paid Studio Revenue; `studioRevenueRemaining` is the published remaining run aggregate. `contribution` subtracts recorded direct commitment from full-run Studio Revenue and excludes studio operating costs: `contributionLabel` distinguishes projected while releasing from final after settlement; it is not a remaining-profit field or studio net profit. Accepted P07 business semantics remain unchanged. Portfolio `commitmentState` distinguishes `uncommitted`, `recorded` and `notRecorded`. Pre-admission projects have no invented production ID or revenue forecast. Legacy bundled production entries do not establish a separate negative/marketing split.

## Existing action owners

[financialConsequence(before, after, later?)](../../bridge/finance-consequence.ts) observes an owning action's discarded successor. `StudioFinancialConsequence` is the nullable `financial` member of placement, contract and casting quotes. It carries Cash before/change/after, recurring cost before/after, payroll change, net cashflow before/after, runway, guarantees, basis/exclusions and nullable `later*` comparisons.

| Quote producer | Existing owner |
|---|---|
| `placementQuoteSnapshot` | `placeFacility`: capital now; unchanged recurring cost until operational onset. `laterBeginsWeek` names completion; first debit is the completion-week → next-week advance. This conditional comparison holds other current facts fixed, not future Cash. |
| `contractQuoteSnapshot` | `renewContract` / `releaseTalent`: the legal preflight successor supplies the envelope. |
| `castingQuoteSnapshot` | `signContract` and `greenlightPicture`, through the existing casting/standalone hiring owners. Queued Greenlight has actual immediate delta 0 and no production yet; existing `totalImmediate` is a package estimate, with `queueNote` revalidation. |

Retain quote session/revision/intent, selected subject/term and owner legality checks. Commit through the existing submitted intent; Finance owns no mutation, RNG advance, clock, Save or affordability rule. Refused/unavailable envelopes may be null.

Read/preview and Cancel commit no domain action, debit or obligation. Immediate Greenlight records production/marketing and applicable freelancer fees; queue admission debits zero and revalidates at production start. Stale session/revision/intent is refused, not silently retried. An identical retained `commandId`/route/envelope replays its original receipt without another action; changed reuse returns `COMMAND_ID_REUSE`.

## Native identity and route contract

`StudioWorkspaceHost.OpenFinance()` opens Administration → Finance. `StudioFinanceRoute { kind, targetId, label }` names destinations, never permission to execute:

| Kind | Exact destination |
|---|---|
| `profile` | `talentId` → `OpenProfile(..., ProfileOrigin.Finance)` |
| `facilityHistory` | Current property `buildingId` → `OpenFacilityHistory` |
| `casting` / `production` | Exact screenplay project → `OpenCasting`; exact production → `OpenProduction(..., true)` |
| `releaseResult` / `filmHistory` | Exact production → `OpenReleaseResult`; `OpenStudioHistory(TabFilms, productionId)`. The Films row ID is the raw `productionId`, not an event ID or title; this owner has no `FilmRowId` transformation. |
| `development` | Finance's retained read-only detail for the exact `development.board.projects[].projectId`; review detail only when `board.review.projectId` matches. Material review remains at Development's owner. |

Recorded capital links separately use `OpenStudioHistory(TabTimeline, EventRowId(historyEventId))`; a current facility's latest History row is not a substitute. Preserve Finance tab, selected subject, filter/sort/page, period/point/category and scroll through Back. Same titles never authorize a join.

Projection 27 also fixes production locations: every present `locationBuildingId` must resolve to actual property. Managed reservations use the placed building, not an absent authored alias such as `writers`. Null is allowed only for the strict lawful no-site cases in `StudioBridgeProtocol.ValidateLocationIdentities`, with no primary target or owned worksite: wrapped waiting, release-ready/committed, or qualifying pre-production resource wait. P12 must retain that guard.

## Persistence and integration limits

[loadBridgeRuntimeCheckpoint](../../bridge/runtime-checkpoint.ts) owns governed outer migration. Current-schema hydration preserves durable identity/replay. Recognized prior protocol 4 schemas—including accepted projection21 and genuine24/25/26—migrate current and explicit saved slots independently through the canonical save chain, then create a new session at revision 0 with an empty journal. Unknown schemas and malformed authority fail closed. Do not rewrite historical headers, extract only the inner save, or conflate current state with the explicit Save slot. A future schema change must register its authentic outgoing identity and regenerate/check the exact consumer; Finance adds no persistence root.

REQ031 remains **IMPLEMENTED-UNPROVEN / PARTIAL**: absolute-week history and real 6240 additional advances to Week 6498, 21 completed films/7007 ledger entries were measured and rendered. Calendar/year/era authority is absent; 52 weeks is not an invented year. REQ034–042 retain their exact register gates: frozen split capture, managerial allocation, risk thresholds, compaction, future revenue channels, utilization, all-in profit, financing and bankruptcy/recovery. Builder employment remains not modeled. Hidden ability/truth, locked weekly theatrical receipt schedules, raw private profiles/checkpoints and transport credentials are not Finance display fields. Hardware gamepad and 200% point-picker usability are not inferred from software input or the tested 100%-selection →200%-retention chart route.
