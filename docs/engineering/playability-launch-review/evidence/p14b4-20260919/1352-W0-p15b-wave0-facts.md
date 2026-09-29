<!-- 1352-W0: P15B Wave 0 source reconnaissance by a read-only general-purpose specialist at HEAD 8e8a4e56 (citations re-checked by it at e8caeb90, docs-only moves); saved verbatim by the parent -->

# P15B Wave 0 facts (read-only recon)

Repository `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`, HEAD `8e8a4e56`.
P15 package and annex read at `2a7ff0d9` (cited as `P15:<line>` and `ANNEX:<line>`, line numbers of `git show 2a7ff0d9:<path>`).
Nothing under `tests/fixtures/`, `ui/e2e/`, `ui/public/` was read. No test suite was run. No repository file was changed.

## 0. Authority read

- P15 §3.2: P15B owns warning/distress/recovery assessments, remedy capabilities and transition orchestration; P12 alone commits the registry's active/dormant/closed state (P15:123-137).
- P15 §11 law 5 "Negative cash is not bankruptcy" (P15:393); law 16: every studio transition is an all-owner transaction over P13/P10/P11/P12/P14 receipts (P15:405-406).
- P15 §12.3: `active → warning → distress → recovery → active`, `distress ↘ dormant → recovery`; a single negative-cash week cannot skip to dormancy (P15:460-495, :467). ANNEX C.3 forbids `cash < 0` alone as the warning trigger (ANNEX:117).
- P15 §16: distress needs at least two legitimate recovery routes, each a typed remedy capability family with the same eligibility, conserved cost, timing and effect for player and rivals; "Loans, bailouts, investors, forced sales, or acquisition are not implied" (P15:615-619). Terminal eligibility asymmetric (P15:624).
- P15 §23 recommends a P12 "minimum three active AI rivals" entrant floor (P15:800); §25 parks "debt/equity/investor integration" in P16+ (P15:847).
- ANNEX D.5 / R: P15B stops if P10, P11 or P12 cannot supply a request-bound, digest-verified, ≤100-row chunked participant manifest (ANNEX:288-303, :1123-1125).
- Owner 1342-O ruling 3: player AND rival failure after warnings and meaningful recovery opportunities, "including explicitly contracted interest-bearing loans under the shared rules"; clear notices and a recoverable end-of-run/history record; no automatic bailout, no new undocumented debt product, no loss of historical identities, no deletion of Owner saves; P15 owns distress, closure and the disposal handoff; P16 owns acquisition (`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1342-O-owner-rulings-p14-p18-approved.txt:42-55`). Ruling 4: no minimum active-studio count, no automatic replacement, consolidation permitted (`:57-61`). Ruling 2 keeps 1122-A presentation: rivals expose "public distress stage plus financial-strength band", no private rival balances (`:37-40`; `1122-A-p15-owner-presentation-decisions.md:10-11`). Note: the approved `.txt` still carries the line "DRAFT FOR HOWARD'S APPROVAL" at `:3`; DECISIONS.md records it as approved (`DECISIONS.md:31-39`).
- 1340-O D-1329-1: rival may shelve a Ready, unproduced screenplay; no deletion, refund or promise erasure (`1340-O-owner-rulings-20260929.md:30-44`).
- `docs/engineering/p14-preparation-8ef5246a/CODEX-P13-P15-OWNER-RULINGS.md` §4.1: P15 owns distress, recovery, dormancy, closure and later-entrant behavior through P12's authoritative state (`:287-304`); §4.3 lists player/rival closure asymmetry and later-entry policy as OPEN (`:312-317`). 1342-O rulings 3 and 4 now answer both.
- DECISIONS.md "Economic ruling" forbids financing, loans, bailouts, hard bankruptcy, failure ladder (`DECISIONS.md:73-78`); amended by 1342-O ruling 3 (`DECISIONS.md:80-84`).
- P11→P12 consumer contract: "Negative cash alone is not bankruptcy, and current-pace runway is not a new P15B distress threshold" (`docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:346`); rival cash/reserve/obligations HIDDEN; distress/recovery/closure cause NOT YET AUTHORIZED until P15B defines disclosure (`:185-195`); events `RivalStudioBecameDormant/Recovered/Closed` are P15B producer / P12 commit (`:256-258`).

## 1. Player cash

**Weekly debits/credits in `tick()`** (`src/core/tick.ts:194`), all on a local `cash` seeded from the post-admission state (`:533`):

| Step | Movement | Site | Gate |
|---|---|---|---|
| research advance | `researchSpend` (player projects only) | `tick.ts:537-539`; `technology.ts:567-572` | spend idles when unaffordable (`technology.ts:289`, via `canAfford` at `technology.ts:150`) |
| 3 release (not engaged) | `boxOffice` lump credit | `tick.ts:672-679` | only when `!engaged` |
| 3.5 run revenue | `studioRevenue` credit per active run | `tick.ts:781-816` | `engaged` |
| rival week | none on player cash | `tick.ts:935` | |
| 7 payroll | `payroll` + `researchPayroll` | `tick.ts:952-966` | `founding === null` only |
| 7.5 overhead | `OVERHEAD_BASE 15,000 + 1,500 × contracts` | `tick.ts:968-977`; `tuning.ts:468-469` | `engaged && founding === null` |
| 7.6 facility opex | Σ operational placements | `tick.ts:979-998`; `placement.ts:401-413` | `engaged && founding === null` |
| 8 expiry | no cash | `tick.ts:1000-1015` | |

Voluntary debits outside the tick: greenlight production+marketing+freelancer fees (`actions.ts:454`), sign/renew bonus (`actions.ts:2589`, `:2649`), publicity (`actions.ts:2783`), placement capex (`placement.ts:927`, `:2441`), set commission/repair (`actions.ts:1555`, `:1573`), technology commitments (`technology.ts:315`, `:476`; `technologyAdoption.ts:253`), P14 proposal bonus (`talentMarket.ts:388-392`), termination (`actions.ts:2669-2717`).

**When player cash goes negative today:** nothing structural happens.
- No guard, clamp, game-over, flag or persisted distress state. `grep` for bankrupt/insolv/dormant/shutdown/gameover/distress in `src/core` finds only comments (`actions.ts:2731-2732`, `tuning.ts:132`, `marketingMenu.ts:9`). NOT FOUND.
- Persisted validity: cash must be finite and equal INITIAL_CASH (or checkpoint) + ordered ledger (`construction.ts:459-464`); sign is unconstrained.
- `canAfford` doc states unavoidable weekly debits "may still push cash below zero" (`employment.ts:73-88`).
- Read models: `financeOverview.runwayState 'inRed'` when `cash <= 0`, label "In the red" (`financeReport.ts:279-285`); lot `cashBand 'in-the-red'` (`ui/src/engine/adapter.ts:6058-6080`, `:7958`); recap `classifyRecovery` returns `healthy | constrained | severe | noNormalProduction | incomplete` (`studioRunRecap.ts:79-84`, `:962-1007`) and pushes the sentence "No recovery mechanic (loans/financing) exists in the current rules." (`studioRunRecap.ts:1003`); recap warnings `standardFilmUnaffordable … contractsOutliveRunway` (`studioRunRecap.ts:248-258`, `:1059-1085`).

**Cash-affordability predicates on the player path:**
- `canAfford(state, amount)`: `cash - amount >= 0` (`employment.ts:81-88`). Callers: `actions.ts:454` greenlight, `:1334` placement quote, `:1555` commissionSet, `:1573` repairSet, `:2589` signContract, `:2649` renewContract, `:2783` publicity; `placement.ts:702`, `:927`, `:2441`, `:2657`; `technology.ts:150` (research context), `:315`, `:476`; `technologyAdoption.ts:253`; `publicity.ts:82`; `talentMarket.ts:391`; read-model wrappers `economyView.ts:151-152`, `:169-170`.
- Set defaults `state.studio.cash >= cost` (`sets.ts:443`, `:525`).
- Physical-plan admission waits on `insufficientFunds` (`physicalPlans.ts:181-185`); queued intents revalidate through the verb and expire (`actions.ts:1711-1760` region, `queueAdmission.ts`).
- Advisory only (not legality): `weeklyBurn`, `runway` (`economyView.ts:70-73`, `:135-137`), `postSigningRunway` (`economyView.ts:350`), recap `affordabilityOf` (`studioRunRecap.ts:953`).
- Not gated by cash: `releaseTalent` termination charge (`actions.ts:2669-2717`, no `canAfford`), `cancel`, `cancelQueuedIntent`, `demolishFacility`, `strikeSet`, `pause/cancelResearch`, `commitPictureToRelease`, plan verbs.

## 2. Rival cash

- Money kinds: `capacity | signing | payroll | overhead | facilityOpex | development | production | marketing | studioRevenue | technologyAdoption | researchSpend | researchCapacity | technologyRestoration | technologyRefund | termination` (`hollywoodTypes.ts:52-60`; roster `hollywood.ts:22-26`).
- Account: `{openingBalance, openingBasis, cash, periods[]}`, periods annual by `floor(week/52)` (`hollywoodTypes.ts:61-73`; `hollywood.ts:35-52`). `moveRivalMoney` rejects only non-finite values; it allows negative cash (`hollywood.ts:41-52`).
- Validation: `cash` has no lower bound (`hollywoodValidation.ts:233`); every movement except `studioRevenue` must be ≤ 0 and `studioRevenue` ≥ 0 (`hollywoodValidation.ts:292`); periods reconcile to cash (`:293-296`); `technologyRestoration/technologyRefund` must be 0, "No rival cancellation policy exists (P13B-S8, OPEN)" (`:287-289`); `development/production/marketing` reconcile to project costs (`:321`).
- Reserve gate: `operatingReserve = rivalWeeklyOperatingCost × policy.reserveWeeks` (`hollywoodTick.ts:59-61`; cost `hollywood.ts:106-111`; `reserveWeeks` 12-20 per template, `hollywoodStartingData.ts:12-36`). Used by: renewal `hollywoodTick.ts:117`, hire `:158`, termination `:190`, greenlight `cashAvailable` `:229`, commission `:254` and `:275-278`, tech purchase `technologyRival.ts:48`, lab plans `rivalResearch.ts:132-135`, P14 proposals `talentMarket.ts:382-399`. Research spend uses plain `cash >= amount` (`technology.ts:164`).
- Unconditional weekly charges: payroll, overhead, facilityOpex (`hollywoodTick.ts:382-384`). Floor burn with zero staff and the four starting facilities: 15,000 + 5,500 + 9,000 + 4,000 + 5,000 = 38,500/week (`tuning.ts:468`, `:837`, `:735`, `:816`, `:805`; facilities `hollywood.ts:145-152`), plus 3,000 per Laboratory and instrument opex (`hollywood.ts:128-142`). Rivals cannot remove facilities.
- Negative rival cash: no guard. Effect is emergent: every reserve gate fails, so the rival stops renewing, hiring, greenlighting, commissioning, buying technology and terminating; contracts expire at `finishHollywoodWeek` (`hollywoodTick.ts:398-407`); runs keep paying (`:362-378`). Only entry refuses negative cash (`hollywood.ts:255`, throws). Whether this occurs in play is NOT measured here.
- Failure/closure/dormancy/exit state or receipt: NOT FOUND. `StudioIdentity` has `enteredWeek`/`recordedFromWeek` and no operating-state or exit field (`hollywoodTypes.ts:6-17`; exact keys `hollywoodValidation.ts:96`). `IndustryReceipt` kinds: `studioEntered, employment, filmAnnounced, filmReleased, filmSettled, technologyAdopted, laboratoryCommitted, laboratoryOperational, instrumentOperational, researchSeatAssigned, researchCompleted` (`hollywoodTypes.ts:108-124`); none is an exit. `retire` hits are talent retirement only (`hollywoodTick.ts:134`, `:208`). Chart rows include every identity with `enteredWeek !== null` (`hollywoodTick.ts:408-415`).
- Rival finance is hidden from the bridge: "Rival finance stays behind the public standings; no money kind is read here" (`bridge/industry.ts:125`).

## 3. Weekly obligations

| Obligation | Player: charged at | Player: defer/cancel today | Rival: charged at | Rival: defer/cancel today |
|---|---|---|---|---|
| Payroll | `tick.ts:952-966` | terminate (`releaseTalent`, cost `weekly × min(remaining, 26)`, `employment.ts:207-210`; refused in founding, when seated, with an active script assignment, `actions.ts:2676-2696`) or wait for expiry | `hollywoodTick.ts:382` | policy termination of surplus non-Scientists (`:174-196`) or expiry |
| Research payroll | inside payroll, split row `tick.ts:964` | `releaseResearchSeat` / terminate | inside payroll | expiry (`hollywoodTick.ts:428-432` pauses the seat) |
| Overhead | `tick.ts:968-977` | per-employee part only, via termination | `hollywoodTick.ts:383` | same |
| Facility opex | `tick.ts:979-998` | `demolishFacility` (50% capex refund, `placement.ts:1370-1410`, `tuning.ts:1918`; refused while engaged) | `hollywoodTick.ts:384` | NOT FOUND (no rival facility removal) |
| Research spend | `tick.ts:537-539` | `pauseResearch`, `cancelResearch`, `setResearchBudget` (`technology.ts:426-436`); idles when unaffordable | `rivalResearch.ts:261` | idles when unaffordable (`technology.ts:164`); no rival pause/cancel verb |
| Contract guarantees | not a ledger liability; derived `guaranteedComp` (`employment.ts:190`; `bridge/finance-consequence.ts:11`) | termination cap | same terms (`IndustryEmployment`, `hollywoodTypes.ts:74-80`) | termination gate |
| Production / marketing | once at greenlight (`actions.ts:454`) | `cancel` removes the picture, returns screenplay to ready, no refund (`actions.ts:596-634`) | once at greenlight (`hollywoodTick.ts:247`) | NOT FOUND (no rival cancel) |
| Script work | no cash kind; writers on payroll | `cancelQueuedIntent` (free, `actions.ts:1711-1735`) | `development` kind never charged (`hollywoodTick.ts:286` sets 0) | shelving approved, not in `src` (see §4) |
| Physical plans / construction | capex at commit | queued plans reserve nothing (`physicalPlans.ts:8`); `cancelPhysicalPlan`; `cancelInstallation`/`cancelAdoption` with quoted refund (`actions.ts:1400-1417`) | `researchCapacity` at admission (`rivalResearch.ts:150`) | NOT FOUND |
| Technology adoption | at commit | `cancelAdoption` | `technologyRival.ts:54` | NOT FOUND |
| Theatrical runs (receipt) | weekly credit `tick.ts:781-816` | release commit can be withheld (`releaseAuthority.ts:1-20`); defers revenue only | weekly credit `hollywoodTick.ts:362-378` | rivals auto-commit (`:323-325`) |
| P14 proposal bonus | at settlement, `canAfford` | withdraw/decline via market | `talentMarket.ts:1072`, reserve | reserve gate |

## 4. Existing remedy-like actions

| Remedy | Player | Rival | Symmetry |
|---|---|---|---|
| Cancel uncommitted plan | `cancelQueuedIntent` free (`actions.ts:1711-1735`); `cancelPhysicalPlan` (`types.ts:2689`) | none | player-only |
| Cancel production | `cancel`, no refund, breaks physically impossible promises (`actions.ts:596-634`) | none | player-only |
| End employment (P14 termination kind) | `releaseTalent`: no cash gate, charge `min(remaining,26)` weeks, breaks open promises to that person (`actions.ts:2669-2717`); ledger kind `termination` (`types.ts:369`) | surplus non-Scientist only, not seated, > 26 weeks left, no open promise from this studio, reserve after charge (`hollywoodTick.ts:174-196`); money kind `termination`; receipt reason `termination` (`hollywoodTypes.ts:111`) | same charge law; eligibility and gates differ |
| Sell/close facilities | `demolishFacility` 50% refund; `strikeSet` 35% refund (`sets.ts:601-625`; `tuning.ts:922`) | none | player-only |
| Pause research | `pauseResearch`/`cancelResearch` (`technology.ts:434-436`) | automatic idle only | partial |
| Delay production | withhold `commitPictureToRelease` (`releaseAuthority.ts:4-15`); no cost saving | none; auto-commit | player-only, not a cost remedy |
| Shelving | n/a | D-1329-1 approved; charter 1344-A/F, RED 1344-C under review (1344-D REFINE); NOT FOUND in `src/core`; Save43 claimed by this slice (`CONTINUATION-STATE.md:12-18`) | rival-only |
| Publicity | "ONE lever rather than a guaranteed rescue", `canAfford` (`actions.ts:2729-2733`, `:2783`) | none | player-only |
| Loans / financing | NOT FOUND (grep `loan|interest|debt|borrow` in `src/core`, `bridge`, `ui/src`) | NOT FOUND | none |

## 5. What a closure must settle, per owner

StudioId = `StudioIdentity.studioId` / `HollywoodState.playerStudioId` (`hollywoodTypes.ts:6-17`, `:136`). Script project ids are per-studio `script-NNNN` (`scriptDevelopment.ts:65-70`) and need `(studioId, scriptProjectId)` keys.

| Domain | Player root / id | Rival root / id |
|---|---|---|
| Productions in progress | `studio.activeProductions: Production[]` (`types.ts:303-308`), `operations.workflows`, `releaseAuthority.commitments` (`release-commitment-<productionId>`), `productionQueue` (ordinal) | `businesses[].productions`, `.operations`, `.releaseAuthority` (`hollywoodTypes.ts:91-107`); productionId `${studioId}:film:N` (`hollywoodTick.ts:233`) |
| Script projects | `scriptDevelopment.projects` | `businesses[].development.projects`, `.activeScriptOrdinals`, cost rows `.projects: RivalProjectCosts` (`hollywoodTypes.ts:81-90`) |
| Promises | `promises: ProfessionalPromise[]` keyed `promiseId`, `issuerStudioId`, outcome `SATISFIED|BROKEN|WAIVED|VOIDED`; `VOIDED` produced only by retirement (`types.ts:2173-2203`; `promises.ts:1043-1051`) | same root, same key |
| Market cases / proposals | `talentMarket.cases` (talentId+contractId, outcome incl. `invalidated`, produced only for early release/retirement `talentMarket.ts:1333`, `:1342`), `.proposals` (digest, `issuerStudioId`), `.receipts` (`types.ts:2034-2124`) | same root |
| Opportunity promises | predicates bound to issuer script project/genre (`opportunityPromises.ts:12-60`, `:136`) | same |
| Employment/contracts | `contracts: Contract[]` (no id, `types.ts:348-355`); mirrored in `hollywood.employment` as `${studio}:contract:${talent}:${start}:player-N` (`industryEmployment.ts:30-32`) | `hollywood.employment` rows `${studioId}:contract:${talentId}:${week}`, `activeEmploymentOrdinals` |
| Research / adoption | `technology.projects/access/adoptions/productions/equipment` with `studioId` (`technologyTypes.ts:130-141`); `physicalPlans` | same roots; plans `${studioId}:plan:N`; adoption `${studioId}:${tech}:adoption:0` |
| Facilities | `placement.facilities`, `operations.facilities`, `construction`, `property`, `sets` | `businesses[].operations.facilities` (abstract) |
| Films / runs in release | `theatricalRuns`, `studio.releasedFilms` (FilmResult.productionId) | `businesses[].runs`, `.activeRunFilmOrdinals`, `hollywood.films` (`LiveIndustryFilm.settledWeek`) |
| Relationships | `relationships: RelationshipEdge[]` person-pair edges, not studio-owned (`types.ts:2264-2287`) | same |
| Receipts / ledgers | `ledger` (append-only), `cashLedgerCheckpoint` | `account.periods`, `hollywood.receipts` (`industry-event-N`), `careerEvents` |
| Chart / history | `studioHistory.rows` (kinds `types.ts:1810-1865`, none for closure or finance), `studioEvents` | `hollywood.chart`/`previousChart` (13-week, `hollywoodTick.ts:408-415`), `firstTakes` (`studioId`), `careerLifecycle`, `talentProvenance` |

## 6. Persistence

- `LIVE_SAVE_VERSION = 42` (`save.ts:6553`); `makeSave` stamps V42 (`save.ts:6556-6558`); `GameState = GameStateV42 = GameStateV41` (`types.ts:2297`, `:2523-2529`).
- Pattern: `validateSaveVNN` checks its own root at era NN, then delegates to `validateSaveV(NN-1)` with a down-projected state (`save.ts:10565-10573`); `convertV(NN-1)ToVNN` is an additive lift with "no behavioral backfill" (`:10575-10582`); `convertVNNToV(NN-1)` is lossless-only and refuses by name (`:10584-10592`; rival example `:10537-10550`); `migrateToVNN` chains (`:10594-10597`).
- Bridge `PROJECTION_VERSION = 56` (`bridge/schema/bridge-schema.ts:283`; JSON schema `project-studio-bridge.schema.json:18026`); its comment ties 56 to the Save41 boundary (`bridge-schema.ts:281-282`); Save42 did not bump it.
- Player finance roots: `studio.cash` (`types.ts:303-308`), `ledger` (`types.ts:407-437`, V12 `:1389-1392`), `cashLedgerCheckpoint` (`types.ts:954-966`), `contracts` (`:534-539`), `theatricalRuns` (`:543-545`), `economyEngagedEver` (`:564-566`). Rival/business roots: `GameState.hollywood` (V19, `types.ts:1906`) → `HollywoodState.businesses[].account` (`hollywoodTypes.ts:129-148`), validated in `validateHollywood` (`hollywoodValidation.ts:69`).
- Player has no `RivalBusiness`; its finance is `studio.cash + ledger`. Two finance models exist.
- End-of-run / archive / lifetime / Legacy root: NOT FOUND. `studioRunRecap` is a derived read model (`studioRunRecap.ts:558`) consumed only by `ui/src/screens/StudioRunRecap.tsx` and `ui/src/engine/adapter.ts`; the bridge does not carry it. Scheduler phase catalogue (`phaseId/phaseOrdinal/phaseOrderVersion`, P15:669-673): NOT FOUND in `src/core`.

## 7. UI/bridge surfaces that report cash trouble

- `src/core/financeReport.ts:279-285` `runwayState` / `runwayLabel` ('In the red').
- `bridge/finance.ts:109-111` attention row `cash-in-red`; schema `StudioFinanceAttention` (`bridge-schema.ts:3247`, `:3297`), `runwayState` enum (`:3302`).
- `bridge/finance-consequence.ts:11-21` runway and guarantees before/after.
- `bridge/session.ts:505-507`, `:594`, `:661`, `:701` founding runway.
- `ui/src/screens/Dashboard.tsx:500-501`, `:532` Runway metric.
- `ui/src/screens/StudioRunRecap.tsx:19-20`, `:100-134`, `:245` recovery labels and warnings.
- `ui/src/screens/HiringMarket.tsx:348-381` offer runway before/after.
- `ui/src/engine/adapter.ts:6058-6080`, `:7958` `LOT_CASH_BAND_THRESHOLDS`, `lotCashBand`; `ui/src/lot/snapshot/StudioLotSnapshot.ts:67`, `:682`, `:1165-1166`.
- Studio operating-state / distress DTO (ANNEX E.4 `IndustryStudioStatusDto`): NOT FOUND.

## 8. RNG

- Stateful sim stream: `RngStream.deserialize(state.rngState)` (`tick.ts:231`), advanced only by the player's release critic draw (`tick.ts:625`).
- Derived stateless streams `stream(seed, purpose, key) = fromSeed(seed::purpose::key)` (`rng.ts:204-206`); purposes are a closed union (`rng.ts:34-67`).
- In the weekly path: `discovery-v1` keyed productionId (`tick.ts:623`; `hollywoodTick.ts:340`); `develop` `${productionId}:${talentId}` (`releaseCareers.ts:36`); `hollywood-v1` keys `${studioId}:package:${ordinal}` (`hollywoodTick.ts:258`), `${productionId}:reception` (`:340`), `identity` (`hollywood.ts:155`); `forecast` productionId (`forecast.ts:407`, via `hollywoodTick.ts:236`); `hiring` `offer-${talentId}` (`employment.ts:294`); `worldgen` on seed `${seed}:industry-person/v1:${id}` (`worldgen.ts:560`), `p13-scientist-profile/v1:${id}` (`:571`), `p14c4-cohort-age/v1:${personId}` (`careerLifecycle.ts:356`).
- A deterministic distress evaluation needs no RNG. If one is needed, a new versioned purpose added to `RngPurpose`, keyed per P15 §18.3 (version, week, subject, purpose; P15:683-687), perturbs no existing draw. It must not read `state.rngState`.

## 9. P15B prerequisites vs owner modules today

| Prerequisite (source) | Owner module today | Contract present? |
|---|---|---|
| P10 person/contract participant manifest, request-bound, ≤100-row chunks (ANNEX:288-294, :1123) | `employment.ts`, `industryEmployment.ts`, `aging.ts`, `careerLifecycle.ts`, `professionHistory.ts` | NOT FOUND |
| P11 finance settlement/initialization receipt or chunked manifest (P15:488-495; ANNEX:296-303) | player ledger in `types.ts` + `economy.ts`, `economyView.ts`, `financeReport.ts`, `fixedCostAllocation.ts`; rival `hollywood.ts::moveRivalMoney`. `src/core/ledger.ts` cited by P15:356 and ANNEX:610: does NOT exist | NOT FOUND; no persisted obligations root (obligations derived, `economyView.ts:308-330`) |
| P12 registry operating state active/dormant/closed + project/capacity/roster/employer/exclusivity/interval receipt (P15:123-126; ANNEX:309-316) | `hollywood.ts`, `hollywoodTick.ts`, `hollywoodTypes.ts`, `hollywoodValidation.ts`, `industryEmployment.ts`, `releaseAuthority.ts` | NOT FOUND (no operating-state field) |
| P13 research/adoption disposition (ANNEX:781-782) | `technology.ts`, `technologyAdoption.ts`, `installationCancellation.ts`, `physicalPlans.ts`, `rivalResearch.ts`, `technologyRival.ts` | player cancel verbs exist; rival cancellation NOT FOUND (`hollywoodValidation.ts:287-289`) |
| P14 case/proposal/promise/commitment disposition (ANNEX:783-784) | `talentMarket.ts`, `promises.ts`, `opportunityPromises.ts`, `careerLifecycle.ts`, `relationships.ts` | NOT FOUND as closure disposition; nearest: `VOIDED`, `invalidated` |
| Atomic all-owner candidate coordinator (ANNEX:648) | none | NOT FOUND |
| Phase catalogue for P15 events (P15:669-673) | none | NOT FOUND |
| P15A.1 landed first (ANNEX:712-718; `HEADLESS-PROGRESS.md:196`) | none in `src` (no `sharedMarket`/`powerRanking`/`corporateFate`) | NOT FOUND; RED 1346-C staging |
| P07/P08/P09 consumed facts | `reception.ts`, `economy.ts`, `releaseAuthority.ts`; `standing.ts`, `studioHistory.ts`; `placement.ts`, `construction.ts` | present |

## Facts that constrain the charter

- Negative cash is already a legal persisted state for both player (`construction.ts:459-464`) and rivals (`hollywoodValidation.ts:233`); a distress law adds meaning, not validity.
- Player and rivals run two finance models (`studio.cash + ledger` vs `RivalAccount` periods); symmetric predicates must read an adapter over both.
- Rival validator forces every non-revenue movement ≤ 0 (`hollywoodValidation.ts:292`); a loan inflow needs a new money kind, a validator change and a save bump. The player ledger likewise needs a new kind inside the cash-equality invariant.
- Rivals have a fixed floor burn (38,500/week plus labs) with no facility disposal, cancellation or pause verb; player-rival remedy symmetry does not exist today (§4).
- Player termination has no cash gate; rival termination requires reserve and no open promise (`actions.ts:2669-2717` vs `hollywoodTick.ts:182-190`).
- No studio operating-state field, exit receipt, or closure disposition exists anywhere; P12-side commit seam is new work in the `hollywood*` modules.
- Chart rows and `technology` validators include every entered studio (`hollywoodTick.ts:409`; `technology.ts:635`); a closed studio stays in both unless the law says otherwise.
- LIVE save is 42, projection 56; Save43 is claimed by rival shelving, and P15A.1/relationship slices are queued ahead in one-writer order (`CONTINUATION-STATE.md:17-23`).
- Headless M0A byte-identity depends on `economyEngaged`/`founding` gates (`tick.ts:542`, `:958`, `:971`, `:987`); any distress step must be gated the same way.
- Rival cash, reserve and obligations are HIDDEN (P11→P12 `:185-195`; `bridge/industry.ts:125`); only a public distress stage and financial-strength band are Owner-selected for display (1122-A).
- The P11→P12 contract rules out current-pace runway as a P15B distress threshold (`:346`).
- 1342-O ruling 4 supersedes the P15 §23 "minimum three active AI rivals" floor (P15:800); ruling 3 supersedes the P15 player-no-terminal asymmetry (P15:471-474, :624).

## Gaps the charter must decide

- Exact warning/distress/recovery/dormancy predicates, thresholds and durations (P15 forbids cash < 0 alone and runway alone).
- Which package owns the loan product (P11 finance vs P15B remedy), its terms, interest law, eligibility, and how it avoids being an "undocumented debt product" or "automatic bailout".
- The minimum two remedy families per P15 §16 that are symmetric, given rivals today lack disposal, cancellation and pause verbs.
- Whether P12-owned `StudioIdentity` gains the operating-state field, or a separate P12 registry root, and which save version carries it.
- Player terminal law: what "fail" means for the player (closure vs dormancy), what the "recoverable end-of-run/history record" persists, and whether play continues.
- Disposal handoff content for P16: which assets (facilities, films, screenplays, contracts) persist unowned, archived or pending, with no acquisition inside P15.
- Closure dispositions for open promises (new outcome vs `VOIDED`/`BROKEN`), open market cases/proposals, active productions, runs in release and research.
- Whether the full P15 all-owner chunked-manifest law (≤100-row chunks) applies at current scale or is right-sized; ANNEX R makes its absence a stop condition.
- Public disclosure for rival distress stage and financial-strength band bands, without leaking private balances.
- Notice tiers and cadence for player warning/distress (P15 §21) and where they surface (lot, finance attention, recap).
- Migration policy: `recordedFromWeek` for distress history, no retroactive distress on old saves, downgrade refusals.
- Sequencing against shelving (Save43), P15A.1 and relationship slices, and whether P15B waits for P15A.1 per ANNEX J.
