import {StudioBridgeIntentOption} from './intent-schema.ts'
import {array,boolean as bool,enumeration,integer,literal,nullable,number,object,optional,reference,text,union,type InferSchema,type JsonSchema} from './dsl.ts'
// P14A.2: `StudioMarketPage` is DEFINED in bridge-schema.ts, beside the other market DTOs.
// That module imports THIS one, so the workspace page is referenced here by NAME alone —
// the import below is type-only and erased at runtime, which keeps the two schema modules
// acyclic while both definitions land in the one shared `$defs` map.
import type {BridgeMarketPage,BridgeWorldCaseRef} from './bridge-schema.ts'
const marketPageRef=()=>reference('StudioMarketPage',{} as JsonSchema<BridgeMarketPage>)
// P14A.3: `StudioWorldCaseRef` is DEFINED in bridge-schema.ts beside the rest of the world
// route, and is referenced here by NAME alone for the same acyclic reason as the workspace
// page above — both definitions still land in the one shared `$defs` map.
const worldCaseRefRef=()=>reference('StudioWorldCaseRef',{} as JsonSchema<BridgeWorldCaseRef>)
const id=()=>text({minLength:1}),count=()=>integer({minimum:0}),score=()=>number({minimum:0,maximum:100})
const TECHNOLOGY_IDS=['synchronized-sound','lighting-control-01'] as const
const ADOPTION_COMPONENT_KINDS=['access','equipment','site','installation','capture','post'] as const
export const INDUSTRY_LANES=['audienceAwareness','industryPrestige','commercialConfidence','output'] as const
export const INDUSTRY_FILM_LANES=['recent','critics','audience','opening','total'] as const
// ── P13B-S5: what one adoption costs, and what one committed adoption IS (projection 37) ──
// One priced line of an adoption, the engine's own `TechnologyAdoptionComponent` verbatim:
// a `physical` line mirrors the target P09 blueprint's authored installation component
// one-to-one, and an `existing` line names work or equipment this studio already owns and is
// therefore never charged for twice. `placementId` names the committed P09 placement once it
// exists; a pre-commit quote leaves it null. No line is ever negative.
const StudioAdoptionComponent=object('StudioAdoptionComponent',{kind:enumeration(ADOPTION_COMPONENT_KINDS),label:id(),cost:count(),weeks:nullable(count()),source:enumeration(['commercial','first-prototype','later-inventor','existing','physical']),placementId:nullable(count()),equipmentAssetId:nullable(id())})
// ── P13B-S6: what cancelling one committed installation pays back (projection 39) ──
// The restoration this cancellation owes on its own target body: the blueprint's own id,
// its capex and the sum of its authored component weeks. Null exactly when no site work
// had begun, so nothing was torn up and nothing has to be put right.
const StudioCancellationRestoration=object('StudioCancellationRestoration',{blueprintId:id(),cost:count(),weeks:count()})
// ONE priced line of ONE action-row quote. Its shared members are the ones both verbs
// price — a labelled scope at a cost over a number of weeks — and each verb's own members
// are OPTIONAL and present only on that verb's rows, never defaulted:
//   * an `adopt-*` line adds the engine's `TechnologyAdoptionComponent` members
//     (`source`, `placementId`, `equipmentAssetId`): a `physical` line mirrors the target
//     P09 blueprint's authored installation component one-to-one, and an `existing` line
//     names work or equipment this studio already owns and is never charged for twice;
//   * a `cancel-*` line adds the engine's `CancellationComponent` members
//     (`status`, `paid`, `refunded`): what this component has actually cost so far and
//     what comes back.
// `kind` is the SAME six-value taxonomy on both, derived from the authored label by S5's
// own classifier, and is NULL for an authored label that classifier has no mapping for
// (an Office conversion's single component) — the gap is disclosed, never defaulted, and
// the engine's receipt itself stays label-only.
//
// This is ONE object rather than a discriminated union of two because the two quotes share
// no const/enum member the C# generator could discriminate on (CF08), and adding one to
// the adoption arm would change a wire shape projection 37 already published.
const StudioActionQuoteComponent=object('StudioActionQuoteComponent',{kind:nullable(enumeration(ADOPTION_COMPONENT_KINDS)),label:id(),cost:count(),weeks:nullable(count()),source:optional(enumeration(['commercial','first-prototype','later-inventor','existing','physical'])),placementId:optional(nullable(count())),equipmentAssetId:optional(nullable(id())),status:optional(enumeration(['completed','inProgress','unstarted'])),paid:optional(count()),refunded:optional(count())})
// The engine's own quote for ONE action row, minus its `ok` flag (and, for a cancellation,
// its `projectIds`): `adoptionQuote` on every `adopt-*` row, `cancellationQuote` on every
// `cancel-*` row, null on every other row. `rejections` is the engine's whole refusal list
// in its own push order and `refusal` is `rejections[0]`, its primary — the same P13B-S4
// disclosure the row's `disabledReason` carries. A REFUSED adoption is still quoted, with
// an empty `components` and a `total` of 0.
//
// The verb-specific members are OPTIONAL and appear only on that verb's own rows: `total`,
// `reusedPostFacilityId` and `reusedEquipmentAssetId` on an `adopt-*` row; `refund` (the
// exact amount of the ONE `constructionRefund` ledger row a commit writes) and
// `restoration` on a `cancel-*` row. Nothing is defaulted into the other verb's members.
const StudioActionQuote=object('StudioActionQuote',{components:array(reference('StudioActionQuoteComponent',StudioActionQuoteComponent)),rejections:array(id()),refusal:nullable(id()),total:optional(count()),reusedPostFacilityId:optional(nullable(id())),reusedEquipmentAssetId:optional(nullable(id())),refund:optional(count()),restoration:optional(nullable(reference('StudioCancellationRestoration',StudioCancellationRestoration)))})
// P13B-S6: one equipment set this studio owns, the engine's own `TechnologyEquipmentAsset`
// minus its `studioId` (the same convention `StudioAdoptionRow` already applies — a private
// page publishes this studio's rows alone). `holderAdoptionId` is null exactly while no live
// adoption holds the set: cancelling lets go of it, and the next adoption of the same
// technology reuses it at $0.
const StudioEquipmentAsset=object('StudioEquipmentAsset',{id:id(),technologyId:enumeration(TECHNOLOGY_IDS),acquiredWeek:count(),source:enumeration(['first-prototype','later-inventor','commercial']),cost:count(),holderAdoptionId:nullable(id())})
// One COMMITTED adoption of this studio's own. `postFacilityId` is null exactly when this
// technology has no Post component at all (lighting); `operationalWeek` is null until this
// adoption's own physical work has finished.
const StudioAdoptionRow=object('StudioAdoptionRow',{technologyId:enumeration(TECHNOLOGY_IDS),route:enumeration(['research','purchase','acquired']),committedWeek:count(),operationalWeek:nullable(count()),components:array(reference('StudioAdoptionComponent',StudioAdoptionComponent)),equipmentAssetId:nullable(id()),postFacilityId:nullable(id()),cancelledWeek:nullable(count()),replacementLabel:id()})
// P13B-S7: what a commercial purchase of this technology REPLACES, authored catalogue
// text verbatim (`replacementDescriptor`). Present on the `purchase-<technologyId>` and
// `adopt-*` rows alone and absent — never defaulted, never empty — on every other row,
// including the `wait-*` rows (waiting buys nothing and so replaces nothing) and every
// Plans/Office row that reuses this shape.
const StudioLaboratoryAction=object('StudioLaboratoryAction',{id:id(),label:id(),detail:text(),enabled:bool(),disabledReason:nullable(id()),intent:nullable(reference('StudioBridgeIntentOption',StudioBridgeIntentOption)),quote:nullable(reference('StudioActionQuote',StudioActionQuote)),replacementLabel:optional(id())})
// P13B-S1b: the S1 seat facts as data beside the existing labels. Additive only.
const StudioLaboratorySeat=object('StudioLaboratorySeat',{talentId:id(),name:id(),laboratoryFacilityId:id(),assignedWeek:count(),releasedWeek:nullable(count()),employed:bool()})
// P13B-S2: one Laboratory's own part of a stored worked week — its seats, its share of the charge, its raw output over 1/20,000.
const StudioResearchLabRow=object('StudioResearchLabRow',{laboratoryFacilityId:id(),seatTalentIds:array(id()),spend:count(),rawUnits:count()})
// `units` is the project credit over 1/160,000; `labs` is null exactly when the stored receipt has none (a single-pool week written before cooperation began).
const StudioResearchReceipt=object('StudioResearchReceipt',{week:count(),seatTalentIds:array(id()),spend:count(),units:integer({minimum:1}),labs:nullable(array(reference('StudioResearchLabRow',StudioResearchLabRow)))})
// The same per-Laboratory facts for the CURRENT quoted week; `seats` replaces the stored row's named ids.
const StudioResearchLabShare=object('StudioResearchLabShare',{laboratoryFacilityId:id(),seats:count(),spend:count(),rawUnits:count()})
const StudioResearchWeek=object('StudioResearchWeek',{ceiling:count(),usable:count(),seats:count(),output:number({minimum:0}),units:count(),labs:array(reference('StudioResearchLabShare',StudioResearchLabShare))})
// P13B-S2: one research project this Laboratory body carries — homed here or holding a seat row here.
const StudioLaboratoryProject=object('StudioLaboratoryProject',{projectId:id(),technologyId:enumeration(['synchronized-sound','lighting-control-01']),technologyLabel:id(),status:enumeration(['active','paused','cancelled','completed']),homeLaboratoryFacilityId:id(),laboratoryFacilityIds:array(id()),verifiedWork:number({minimum:0}),work:count(),budgetPerWeek:count(),progressLabel:id(),bottleneckLabel:id(),estimateLabel:id(),cooperationLabel:id(),seats:array(reference('StudioLaboratorySeat',StudioLaboratorySeat)),receipts:array(reference('StudioResearchReceipt',StudioResearchReceipt)),weekly:reference('StudioResearchWeek',StudioResearchWeek)})
// ── P13B-S7: public milestone disclosure of commercial availability (projection 40) ──
// One row per catalogue technology, derived on read from the catalogue entry and the
// campaign week ALONE (`technologyForecast`) — no rival project, seat, spend, receipt or
// adoption can reach it, and two campaigns at the same week publish byte-identical rows.
// Before the public announcement the row is a two-bound WINDOW and the exact commercial
// week is withheld (`exactLabel`/`announcedWeek` null); from the announcement week on the
// row is EXACT and the window labels are null. A technology whose window is degenerate —
// its commercial week was already public — is exact at every week, including week 0.
const StudioTechnologyForecast=object('StudioTechnologyForecast',{technologyId:enumeration(TECHNOLOGY_IDS),name:id(),kind:enumeration(['window','exact']),windowFromLabel:nullable(id()),windowToLabel:nullable(id()),exactLabel:nullable(id()),announcedWeek:nullable(count()),basis:id()})
const StudioLaboratoryPage=object('StudioLaboratoryPage',{buildingId:id(),title:id(),statusLabel:id(),seatLabel:id(),scientistId:nullable(id()),scientistLabel:id(),budgetLabel:id(),bottleneckLabel:id(),estimateLabel:id(),progressLabel:id(),provenanceLabel:id(),commercialLabel:id(),installationLabel:id(),actions:array(reference('StudioLaboratoryAction',StudioLaboratoryAction)),seats:array(reference('StudioLaboratorySeat',StudioLaboratorySeat)),receipts:array(reference('StudioResearchReceipt',StudioResearchReceipt)),weekly:reference('StudioResearchWeek',StudioResearchWeek),projects:array(reference('StudioLaboratoryProject',StudioLaboratoryProject)),adoptions:array(reference('StudioAdoptionRow',StudioAdoptionRow)),equipment:array(reference('StudioEquipmentAsset',StudioEquipmentAsset)),forecast:array(reference('StudioTechnologyForecast',StudioTechnologyForecast))})
// ── P13B-S3: the studio's persistent physical plans (projection 35) ──────────
// A plan RESERVES NOTHING until it starts; every number below is the engine's own.
const StudioPlanQuoteComponent=object('StudioPlanQuoteComponent',{label:id(),cost:count(),weeks:count()})
// The frozen scope-and-price facts of one P09 quote. The completion week is deliberately absent: it moves every week and is neither scope nor price, so the fingerprint is stable while nothing real has changed.
const StudioPlanQuote=object('StudioPlanQuote',{fingerprint:id(),cost:count(),buildWeeks:count(),weeklyOperatingCost:count(),components:array(reference('StudioPlanQuoteComponent',StudioPlanQuoteComponent))})
// The engine's own decision for the NEXT admission boundary. Null on a started or cancelled row: a terminal plan has no next boundary, and publishing a wait there would be a lie.
const StudioPlanNext=object('StudioPlanNext',{outcome:enumeration(['admit','wait','hold']),reason:nullable(text())})
const StudioPlanCommitReceipt=object('StudioPlanCommitReceipt',{week:count(),fingerprint:id(),cost:count()})
const StudioPlanRow=object('StudioPlanRow',{planId:id(),ordinal:count(),status:enumeration(['queued','held','blocked','started','cancelled']),statusLabel:id(),reason:nullable(text()),queuedWeek:count(),statusWeek:count(),workKind:enumeration(['placement','installation']),blueprintId:id(),workLabel:id(),targetFacilityId:nullable(id()),targetPlanId:nullable(id()),dependsOn:array(id()),approvedMaximumDebit:count(),earliestStartWeek:count(),admission:enumeration(['reviewChangedQuote','automatic']),approvedQuote:reference('StudioPlanQuote',StudioPlanQuote),pendingQuote:nullable(reference('StudioPlanQuote',StudioPlanQuote)),next:nullable(reference('StudioPlanNext',StudioPlanNext)),startedPlacementId:nullable(count()),commitReceipt:nullable(reference('StudioPlanCommitReceipt',StudioPlanCommitReceipt))})
// Rows in admission (ordinal) order; the player studio's plans only. Actions reuse the Laboratory action row.
const StudioPlansPage=object('StudioPlansPage',{title:id(),notice:id(),rows:array(reference('StudioPlanRow',StudioPlanRow)),actions:array(reference('StudioLaboratoryAction',StudioLaboratoryAction))})
// ── P13B-S4: one Development & Casting building's standard, and what raising it costs (projection 36) ──
// A conversion is an ordinary P09 installation that CLOSES its body while it runs. Every number here is
// the engine's own live quote (`queryFacilityInstallation`), and the standards are the conversion
// authority's own. A REFUSED row is still published with the engine's refusal member and one sentence,
// because a client that hides the row cannot say why the building is already good enough.
// `rejections` is the engine's WHOLE refusal list in its own push order and `refusal` is
// `rejections[0]`, its primary: while a conversion runs, the running blueprint's own row
// reads `alreadyInstalled` and the sibling row reads `targetEngaged`. `refusalText` is one
// sentence for that same primary refusal, so the name and the sentence never disagree.
const DEVELOPMENT_STANDARDS=['I','II','III'] as const
const StudioOfficeConversionRow=object('StudioOfficeConversionRow',{blueprintId:enumeration(['office-conversion-ii','office-conversion-iii']),label:id(),cost:count(),buildWeeks:count(),weeklyOperatingCost:count(),fromStandard:enumeration(DEVELOPMENT_STANDARDS),toStandard:enumeration(DEVELOPMENT_STANDARDS),standardDuringWork:enumeration(DEVELOPMENT_STANDARDS),standardAfter:enumeration(DEVELOPMENT_STANDARDS),downtimeWeeks:count(),available:bool(),rejections:array(id()),refusal:nullable(id()),refusalText:nullable(text())})
// `blueprintId` is null exactly when this body has no placement record — the endowed founding office is
// a property STRUCTURE, and naming the buildable office blueprint there would claim a building (and a
// weekly charge) the studio never bought. `baselineWeeklyOperatingCost` is 0 for the same reason.
// Row ids append `-ii`/`-iii` to a facility id that ALREADY contains hyphens: never split one on '-'.
const StudioOfficePage=object('StudioOfficePage',{facilityId:id(),title:id(),blueprintId:nullable(id()),standard:enumeration(DEVELOPMENT_STANDARDS),highestOperationalStandard:enumeration(DEVELOPMENT_STANDARDS),offline:bool(),offlineUntilWeek:nullable(count()),capacity:count(),baselineWeeklyOperatingCost:count(),conversions:array(reference('StudioOfficeConversionRow',StudioOfficeConversionRow)),planIds:array(id()),actions:array(reference('StudioLaboratoryAction',StudioLaboratoryAction))})
const StudioCampaignDate=object('StudioCampaignDate',{policy:literal('campaign-calendar-1920-52/v1'),absoluteWeek:count(),year:integer({minimum:1920}),weekOfYear:integer({minimum:1,maximum:52}),label:id()})
const StudioIndustryLane=object('StudioIndustryLane',{key:enumeration(INDUSTRY_LANES),label:id(),meaning:id(),value:number(),rank:integer({minimum:1}),priorRank:nullable(integer({minimum:1})),movement:enumeration(['new','unavailable','up','down','unchanged']),movementLabel:id(),snapshotWeek:count(),snapshotLabel:id(),priorWeek:nullable(count())})
const StudioIndustryStudio=object('StudioIndustryStudio',{studioId:id(),name:id(),mark:id(),color:id(),player:bool(),trustLabel:enumeration(['Reliable','Mixed record','Distrusted']),foundingLabel:id(),entryLabel:id(),conditionLabel:id(),recordingNotice:id(),filmCount:count(),authoredFilmCount:count(),liveFilmCount:count(),lanes:array(reference('StudioIndustryLane',StudioIndustryLane))})
const StudioIndustryFilm=object('StudioIndustryFilm',{filmId:id(),studioId:id(),studioName:id(),title:id(),genre:id(),dateLabel:id(),releaseWeek:nullable(count()),historicalYear:nullable(integer({minimum:1800,maximum:1919})),provenance:enumeration(['authored-start/v1','simulation/v1','player-record']),criticScore:score(),audienceScore:score(),openingGross:number({minimum:0}),totalGross:number({minimum:0}),runStatus:enumeration(['settled','inRun','recorded']),businessNotice:id()})
// P14A.3: `caseStatusLine` and `caseRef` carry the PUBLIC world-route case facts of this
// person — the restrained open-case line and the reference that opens that exact case
// (`view:'market'`). Both are null unless the engine holds an OPEN case, and both stay
// figure-free: a rival's tier, salary and bonus remain behind A.1's disclosure and appear
// on no Industry row. The row's own `onPlayerLot` still states where the person is; a
// rival's person is never on the player's lot and no rival lot exists on this wire.
const StudioIndustryPerson=object('StudioIndustryPerson',{careerStatus:enumeration(['working','awaitingTransition','pendingReconciliation','retired']),careerLine:id(),professionRetiredWeek:nullable(count()),industryRetiredWeek:nullable(count()),lastProfessionChangeWeek:nullable(count()),lifecycleStatus:enumeration(['active','announced','finishing_commitments','retired']),lifecycleLine:id(),retiredWeek:nullable(count()),talentId:id(),name:id(),roleLabel:id(),employerStudioId:nullable(id()),employerName:nullable(id()),employmentLabel:id(),creditCount:count(),onPlayerLot:bool(),notice:id(),caseStatusLine:nullable(id()),caseRef:nullable(worldCaseRefRef())})
const StudioIndustryCredit=object('StudioIndustryCredit',{talentId:id(),name:id(),role:id(),employerStudioId:nullable(id()),employerName:nullable(id())})
// P13B-S7: `studioId` is NULLABLE. Every receipt-derived row still names the studio whose
// receipt it is; a DERIVED public milestone row (the technology announcement) is minted by
// the campaign clock, which owns no studio, and is therefore excluded from every per-studio
// History filter by construction — null never matches a studio id.
// P14A.2: `settlementKind` is carried by the ONE folded Pulse row a talent-market
// settlement writes — `retained` (the person stayed with the same employer) or `moved`
// (a new one) — in place of the two separate P12 employment rows. It is OPTIONAL and
// ABSENT on every other activity row, including the unfolded employment rows the
// per-person Employment route still publishes. No figure is ever carried by the fold.
// P14B.2: outcomeKind is present only on an exact promise-outcome receipt row.
const StudioIndustryActivity=object('StudioIndustryActivity',{eventId:id(),week:count(),dateLabel:id(),group:enumeration(['releases','people','studios','announcements']),headline:id(),detail:id(),studioId:nullable(id()),filmId:nullable(id()),talentId:nullable(id()),settlementKind:optional(enumeration(['retained','moved'])),outcomeKind:optional(enumeration(['promiseKept','promiseBroken'])),careerKind:optional(enumeration(['professionChanged','industryRetired']))})
const StudioIndustryProject=object('StudioIndustryProject',{productionId:id(),studioId:id(),title:id(),genre:id(),announcedWeek:count(),dateLabel:id(),stageLabel:id(),notice:id()})
const StudioIndustryTendency=object('StudioIndustryTendency',{label:id(),detail:id(),sampleCount:count(),fromLabel:id(),throughLabel:id(),basis:id()})
export const StudioIndustrySummary=object('StudioIndustrySummary',{calendar:reference('StudioCampaignDate',StudioCampaignDate),available:bool(),playerStudioId:nullable(id()),activeStudioCount:count(),notice:id()})
export const StudioIndustryProjection=object('StudioIndustryProjection',{industry:reference('StudioIndustrySummary',StudioIndustrySummary)})
// P14A.2: `view:'market'` opens the Talent Market workspace; `targetId` is the selected
// person's talentId (null for the buckets alone), `page` pages the CLOSED case bucket and
// the OPTIONAL `historyPage` pages the selected person's employer history. `historyPage` is
// optional so every request minted before projection 43 stays valid exactly as it is.
const StudioPowerRankingFilm=object('StudioPowerRankingFilm',{filmId:id(),title:id(),criticScore:score(),scoreTenths:count()})
const StudioPowerRankingRow=object('StudioPowerRankingRow',{studioId:id(),name:id(),player:bool(),ranked:bool(),rank:nullable(integer({minimum:1})),rankLabel:id(),priorRank:nullable(integer({minimum:1})),movement:enumeration(['new','unavailable','up','down','unchanged']),movementLabel:id(),filmsTenths:count(),films:array(reference('StudioPowerRankingFilm',StudioPowerRankingFilm)),filmsLine:nullable(id()),releases:count(),releasesTenths:count(),pointsTenths:count(),pointsLabel:id(),honors:literal('notRecorded'),band:enumeration(['inTheRed','strained','stable','thriving']),bandLabel:id(),distressStage:enumeration(['notRecorded','stable','warning','distress','recovery','closed'])})
const StudioPowerRankingPage=object('StudioPowerRankingPage',{snapshotId:id(),priorSnapshotId:nullable(id()),week:count(),dateLabel:id(),definitionVersion:enumeration(['power-ranking/v1','power-ranking/v2','power-ranking/v3']),windowLabel:id(),available:bool(),availabilityLine:nullable(id()),firstRankedLabel:nullable(id()),recordingNotice:nullable(id()),rankedCount:count(),cohortCount:count(),rows:array(reference('StudioPowerRankingRow',StudioPowerRankingRow))})
const StudioPaidReportStudioTarget=object('StudioPaidReportStudioTarget',{kind:literal('studio'),studioId:id()})
const StudioPaidReportLotTarget=object('StudioPaidReportLotTarget',{kind:literal('estateLot'),estateId:id(),lotId:id()})
const StudioPaidReportTarget=union('StudioPaidReportTarget',[
 reference('StudioPaidReportStudioTarget',StudioPaidReportStudioTarget),
 reference('StudioPaidReportLotTarget',StudioPaidReportLotTarget),
] as const)
const StudioPaidReportProperty=object('StudioPaidReportProperty',{right:literal('R1'),propertyId:id()})
const StudioPaidReportFilm=object('StudioPaidReportFilm',{right:literal('R2'),filmId:id()})
const StudioPaidReportSubject=union('StudioPaidReportSubject',[
 reference('StudioPaidReportProperty',StudioPaidReportProperty),
 reference('StudioPaidReportFilm',StudioPaidReportFilm),
] as const)
const StudioPaidReportReceipt=object('StudioPaidReportReceipt',{
 id:id(),week:count(),recipientId:id(),target:reference('StudioPaidReportTarget',StudioPaidReportTarget),targetLabel:id(),
 scope:array(enumeration(['rights','employment','liabilities'] as const)),fee:count(),transactionId:id(),staleFromWeek:count(),
 quoteAgePolicyVersion:nullable(integer({minimum:0,maximum:1})),fresh:bool(),freshnessLine:id(),
})
const StudioPaidReportRight=object('StudioPaidReportRight',{subject:reference('StudioPaidReportSubject',StudioPaidReportSubject),value:nullable(number()),encumbrances:array(id())})
const StudioPaidReportEmployment=object('StudioPaidReportEmployment',{contractId:id(),talentId:id(),annualSalary:number(),startWeek:count(),endWeekExclusive:count(),exitCost:number()})
const StudioPaidReportLiabilities=object('StudioPaidReportLiabilities',{stage:id(),hasOutstandingLoan:bool(),weeklyFixedCost:number(),cash:number()})
const StudioPaidReportBody=object('StudioPaidReportBody',{
 rights:array(reference('StudioPaidReportRight',StudioPaidReportRight)),
 employment:nullable(array(reference('StudioPaidReportEmployment',StudioPaidReportEmployment))),
 liabilities:nullable(reference('StudioPaidReportLiabilities',StudioPaidReportLiabilities)),
})
const StudioPaidReportDetail=object('StudioPaidReportDetail',{
 receipt:reference('StudioPaidReportReceipt',StudioPaidReportReceipt),body:reference('StudioPaidReportBody',StudioPaidReportBody),
})
const StudioPaidReportsPage=object('StudioPaidReportsPage',{
 title:id(),notice:id(),receipts:array(reference('StudioPaidReportReceipt',StudioPaidReportReceipt)),selectedReport:nullable(reference('StudioPaidReportDetail',StudioPaidReportDetail)),
})
// ── P17: the read-only franchise view (projection 65) ──
// One row per StoryProperty in the landed franchise root, read through the core's own readers
// (src/core/continuation*.ts): the typed lineage, Recognition and Fatigue now, each continuity's Momentum and band,
// reboot legality and the continuation choices the core's quote admits for the player studio this week. A choice is
// the quote's verdict only: the greenlight still checks the concept it carries (P16 same-concept and link law).
const CONTINUATION_TYPES=['directSequel','prequel','remake','reboot','spinOff'] as const
const FRANCHISE_BRANCH_KINDS=['main','reboot','spinoff'] as const
const CONTINUATION_BANDS=['new','active','activeAgain','cooling','dormant','revivalCandidate'] as const
const StudioFranchiseBranch=object('StudioFranchiseBranch',{branchId:id(),kind:enumeration(FRANCHISE_BRANCH_KINDS),subPropertyId:nullable(id()),openedAtWeek:count(),lastReleaseWeek:nullable(count()),momentum:number(),band:enumeration(CONTINUATION_BANDS)})
// P17 slice B (projection 66): what the core RECORDS about a released installment. The franchise root keeps the meters
// after every release but no per-release Recognition/Momentum/Fatigue change, so none is published; the film's Industry
// row (critic score, opening, and total as cumulative paid gross while the run is active, final after), whether it holds
// the property's Recognition peak and its `activeAgain` milestone are recorded facts. `expectedTotal` is the player's own
// locked forecast and null for every other studio's film (Industry carries no rival's private inputs).
const StudioFranchiseReleaseOutcome=object('StudioFranchiseReleaseOutcome',{releasedWeek:count(),criticScore:number(),openingGross:number(),totalGross:number(),expectedTotal:nullable(number()),propertyPeak:bool(),activeAgain:bool()})
// A guest the release credited: the completed booking and the career record the core attached to it.
const StudioFranchiseCreditedGuest=object('StudioFranchiseCreditedGuest',{bookingId:id(),talentId:id(),name:id(),workWeek:count(),fee:number(),starPowerBefore:number(),starPowerAfter:number(),starPowerDelta:number()})
const StudioFranchiseInstallment=object('StudioFranchiseInstallment',{productionId:id(),parentProductionId:nullable(id()),type:enumeration([...CONTINUATION_TYPES,'origin']),branchId:id(),greenlitWeek:nullable(count()),studioId:nullable(id()),releasedWeek:nullable(count()),outcome:nullable(reference('StudioFranchiseReleaseOutcome',StudioFranchiseReleaseOutcome)),guests:array(reference('StudioFranchiseCreditedGuest',StudioFranchiseCreditedGuest))})
const StudioFranchiseSubProperty=object('StudioFranchiseSubProperty',{subPropertyId:id(),kind:enumeration(['character','organization','location','concept']),mintedAtProductionId:id(),mintedWeek:count(),recognition:number(),fatigue:number(),promotedToStoryPropertyId:nullable(id())})
const StudioFranchiseChoice=object('StudioFranchiseChoice',{type:enumeration(CONTINUATION_TYPES),predecessorProductionId:id(),subPropertyId:nullable(id()),branchId:nullable(id()),branchKind:enumeration(FRANCHISE_BRANCH_KINDS),use:enumeration(['sequel','remake','spinoff']),recognition:number(),momentum:number(),fatigue:number(),inheritedAwareness01:number(),band:enumeration(CONTINUATION_BANDS)})
const StudioFranchiseProperty=object('StudioFranchiseProperty',{storyPropertyId:id(),franchiseId:id(),mintedWeek:count(),recognition:number(),fatigue:number(),branches:array(reference('StudioFranchiseBranch',StudioFranchiseBranch)),installments:array(reference('StudioFranchiseInstallment',StudioFranchiseInstallment)),subProperties:array(reference('StudioFranchiseSubProperty',StudioFranchiseSubProperty)),rebootLegal:bool(),rebootRefusal:nullable(id()),choices:array(reference('StudioFranchiseChoice',StudioFranchiseChoice))})
const StudioFranchisesPage=object('StudioFranchisesPage',{title:id(),notice:id(),properties:array(reference('StudioFranchiseProperty',StudioFranchiseProperty))})
// ── P17 Shape A: featured appearances (projection 66) ──
// The guests a greenlight this week could book, every verdict the core quote's (cameoQuote) for each lawful work week
// (week+1 … week+PRODUCTION_TICKS), and the player's own bookings with the cancel intent while one is unperformed.
const CAMEO_BASIS=['employee','freelance'] as const
const StudioFeaturedGuestWeek=object('StudioFeaturedGuestWeek',{workWeek:count(),standardShooting:bool(),ok:bool(),basis:nullable(enumeration(CAMEO_BASIS)),refusal:nullable(id()),readinessRisk:nullable(id()),disclosures:array(id())})
const StudioFeaturedGuestRow=object('StudioFeaturedGuestRow',{talentId:id(),name:id(),profession:enumeration(['writer','director','actor','craft','scientist']),fame:number(),fee:nullable(number()),retained:nullable(number()),refundable:nullable(number()),weeks:array(reference('StudioFeaturedGuestWeek',StudioFeaturedGuestWeek))})
const StudioFeaturedBookingRow=object('StudioFeaturedBookingRow',{bookingId:id(),productionId:id(),productionTitle:id(),talentId:id(),name:id(),profession:enumeration(['writer','director','actor','craft','scientist']),basis:enumeration(CAMEO_BASIS),workWeek:count(),bookedWeek:count(),fee:number(),retained:number(),status:enumeration(['reserved','completed','cancelled']),completedWeek:nullable(count()),cancelledWeek:nullable(count()),cancelReason:nullable(enumeration(['explicit','missedWork','productionCancelled','employmentExit','rightsLoss'])),refund:nullable(number()),releasedWeek:nullable(count()),starPowerDelta:nullable(number()),cancelIntent:nullable(reference('StudioBridgeIntentOption',StudioBridgeIntentOption))})
const StudioFeaturedAppearancesPage=object('StudioFeaturedAppearancesPage',{title:id(),notice:id(),greenlightWeek:count(),capacity:count(),nominalShootingWeeks:array(count()),guests:array(reference('StudioFeaturedGuestRow',StudioFeaturedGuestRow)),bookings:array(reference('StudioFeaturedBookingRow',StudioFeaturedBookingRow))})
// ── P18 Sprint 13 slice B: the player's television seasons (projection 68) ──
// The core read model (src/core/tvView.ts) verbatim: the block and units, why a live season waits, the next milestone,
// the agreement's earned/received/owed and settlement, the distribution window, what a cancellation now would pay, and
// the cancel and settle intents while they apply. Only the player studio produces seasons; nothing here is a rival's.
const TV_BLOCKS=['scripts','preparation','rehearsal','shooting','post'] as const
const StudioTelevisionSeries=object('StudioTelevisionSeries',{seriesId:id(),title:text(),propertyId:id(),createdWeek:count(),seasonIds:array(id())})
export const StudioTelevisionCancellation=object('StudioTelevisionCancellation',{week:count(),cause:enumeration(['producer','deadline','closure','rights','participant'])})
const StudioTelevisionMilestone=object('StudioTelevisionMilestone',{kind:enumeration(['scripts','pictureLock','delivery']),afterUnit:count(),amount:number()})
export const StudioTelevisionSettlement=object('StudioTelevisionSettlement',{week:count(),refundDue:number(),refundPaid:number(),chargeDue:number(),chargePaid:number(),closureId:nullable(id())})
const StudioTelevisionAgreement=object('StudioTelevisionAgreement',{agreementId:id(),fee:number(),advance:number(),earned:number(),received:number(),unearnedAdvance:number(),settlement:nullable(reference('StudioTelevisionSettlement',StudioTelevisionSettlement)),outstanding:number()})
const StudioTelevisionDistribution=object('StudioTelevisionDistribution',{licenceId:id(),availableFromWeek:nullable(count()),availableUntilWeekExclusive:nullable(count()),available:bool(),expired:bool()})
const StudioTelevisionCancelPreview=object('StudioTelevisionCancelPreview',{refundDue:number(),refundPaidNow:number(),chargeDue:number(),chargePaidNow:number(),owedAfter:number()})
const StudioTelevisionSettlePreview=object('StudioTelevisionSettlePreview',{outstanding:number(),payableNow:number()})
const StudioTelevisionSeasonRow=object('StudioTelevisionSeasonRow',{seasonId:id(),seriesId:id(),seriesTitle:text(),propertyId:id(),status:enumeration(['live','delivered','cancelled']),block:enumeration(TV_BLOCKS),blockLabel:id(),creditedUnits:count(),totalUnits:count(),stall:nullable(id()),commitWeek:count(),dueWeek:count(),finalWeek:count(),deliveredWeek:nullable(count()),cancellation:nullable(reference('StudioTelevisionCancellation',StudioTelevisionCancellation)),nextMilestone:nullable(reference('StudioTelevisionMilestone',StudioTelevisionMilestone)),agreement:reference('StudioTelevisionAgreement',StudioTelevisionAgreement),distribution:reference('StudioTelevisionDistribution',StudioTelevisionDistribution),cancelPreview:nullable(reference('StudioTelevisionCancelPreview',StudioTelevisionCancelPreview)),settlePreview:nullable(reference('StudioTelevisionSettlePreview',StudioTelevisionSettlePreview)),cancelIntent:nullable(reference('StudioBridgeIntentOption',StudioBridgeIntentOption)),settleIntent:nullable(reference('StudioBridgeIntentOption',StudioBridgeIntentOption))})
const StudioTelevisionPage=object('StudioTelevisionPage',{title:id(),notice:id(),week:count(),series:array(reference('StudioTelevisionSeries',StudioTelevisionSeries)),seasons:array(reference('StudioTelevisionSeasonRow',StudioTelevisionSeasonRow))})
// ── ASTRA Sprint 27 (projection 71): the Rights desk and the estates on the Bridge ──
// Every row is the core's own read model (src/core/rightsDesk.ts rightsDeskView): what the player holds with its sale law,
// encumbrance, holdback, valuation and licences, what is offered to and by the player with the close law, the licences
// the player holds, the operating counterparties, the open estates with the player's sealed bid and the bid law, and the
// closed estates with each lot's disposition, the player's bid outcome and the closure's P15 claims. Every refusal is the
// core's own token at the current week; the quote families (bridge-schema.ts) and the row intents revalidate at commit.
const StudioRightSubjectProperty=object('StudioRightSubjectProperty',{right:literal('R1'),propertyId:id()})
const StudioRightSubjectFilm=object('StudioRightSubjectFilm',{right:literal('R2'),filmId:id()})
export const StudioRightSubject=union('StudioRightSubject',[reference('StudioRightSubjectProperty',StudioRightSubjectProperty),reference('StudioRightSubjectFilm',StudioRightSubjectFilm)] as const)
const RIGHTS_ENCUMBRANCES=['activeProduction','activeRun'] as const
// A licence in force over a subject: the grantor, the grantee, the use the core recorded, exclusivity and the end week.
export const StudioRightsSubjectLicence=object('StudioRightsSubjectLicence',{licenceId:id(),right:enumeration(['R3','R4']),grantorId:id(),grantorName:id(),granteeId:id(),granteeName:id(),use:id(),exclusive:bool(),startWeek:count(),endWeekExclusive:count()})
const StudioRightsTitleRow=object('StudioRightsTitleRow',{subject:reference('StudioRightSubject',StudioRightSubject),title:nullable(text()),saleRefusal:nullable(text()),encumbrance:nullable(enumeration(RIGHTS_ENCUMBRANCES)),resaleHoldback:bool(),value:nullable(number()),licencesOut:array(reference('StudioRightsSubjectLicence',StudioRightsSubjectLicence)),liveSeasonIds:array(id())})
const StudioRightsTitleInstrument=object('StudioRightsTitleInstrument',{kind:literal('title'),subject:reference('StudioRightSubject',StudioRightSubject)})
const StudioRightsLicenceInstrument=object('StudioRightsLicenceInstrument',{kind:literal('licence'),right:enumeration(['R3','R4']),subject:reference('StudioRightSubject',StudioRightSubject),use:id(),exclusive:bool(),startWeek:count(),endWeekExclusive:count()})
const StudioRightsInstrument=union('StudioRightsInstrument',[reference('StudioRightsTitleInstrument',StudioRightsTitleInstrument),reference('StudioRightsLicenceInstrument',StudioRightsLicenceInstrument)] as const)
// `saleReviewRequired`: accepting this offer sells a title the player holds, so the acceptance is reached only through the
// quoteRightsOffer family (decision B disclosure first) and no one-gesture accept intent is published for it.
const StudioRightsOfferRow=object('StudioRightsOfferRow',{offerId:id(),week:count(),offerorId:id(),offerorName:id(),counterpartyId:id(),counterpartyName:id(),role:enumeration(['offeror','counterparty']),direction:enumeration(['buy','sell']),instrument:reference('StudioRightsInstrument',StudioRightsInstrument),subjectTitle:nullable(text()),price:number(),expiresWeek:count(),status:enumeration(['open','accepted','rejected','expired','withdrawn']),resolvedWeek:nullable(count()),transactionId:nullable(id()),refusal:nullable(text()),closing:nullable(text()),saleReviewRequired:bool(),acceptIntent:nullable(reference('StudioBridgeIntentOption',StudioBridgeIntentOption)),rejectIntent:nullable(reference('StudioBridgeIntentOption',StudioBridgeIntentOption)),withdrawIntent:nullable(reference('StudioBridgeIntentOption',StudioBridgeIntentOption))})
const StudioRightsCounterparty=object('StudioRightsCounterparty',{studioId:id(),name:id()})
const StudioRightsPage=object('StudioRightsPage',{title:id(),notice:id(),week:count(),studioId:id(),permitted:nullable(text()),spendable:number(),reserve:number(),titles:array(reference('StudioRightsTitleRow',StudioRightsTitleRow)),offers:array(reference('StudioRightsOfferRow',StudioRightsOfferRow)),licencesIn:array(reference('StudioRightsSubjectLicence',StudioRightsSubjectLicence)),counterparties:array(reference('StudioRightsCounterparty',StudioRightsCounterparty))})
const StudioEstateLotSubject=object('StudioEstateLotSubject',{subject:reference('StudioRightSubject',StudioRightSubject),title:nullable(text())})
const StudioEstateMyBid=object('StudioEstateMyBid',{bidId:id(),amount:number(),week:count(),status:enumeration(['sealed','won','lost','disqualified']),disqualification:nullable(text())})
const StudioEstateSale=object('StudioEstateSale',{amount:number(),buyerId:id(),buyerName:id()})
// An open lot carries the bid law (`bidRefusal` at the minimum) and the player's sealed bid; a closed estate's lot carries
// its disposition: sold (the sale) or archived, and the player's bid outcome with the ceremony's own reason.
const StudioEstateLotRow=object('StudioEstateLotRow',{lotId:id(),subjects:array(reference('StudioEstateLotSubject',StudioEstateLotSubject)),minimumBid:number(),encumbrances:array(id()),status:enumeration(['open','sold','archived']),myBid:nullable(reference('StudioEstateMyBid',StudioEstateMyBid)),bidRefusal:nullable(text()),sale:nullable(reference('StudioEstateSale',StudioEstateSale))})
const StudioEstateClaimRow=object('StudioEstateClaimRow',{kind:enumeration(['employment','tvRefund','tvCharge']),count:count(),paid:number(),unpaid:number()})
const StudioEstateRow=object('StudioEstateRow',{estateId:id(),studioId:id(),name:id(),closureWeek:count(),opensWeek:count(),closesWeek:count(),closedWeek:nullable(count()),lots:array(reference('StudioEstateLotRow',StudioEstateLotRow)),claims:array(reference('StudioEstateClaimRow',StudioEstateClaimRow))})
const StudioEstatesPage=object('StudioEstatesPage',{title:id(),notice:id(),week:count(),permitted:nullable(text()),spendable:number(),reserve:number(),estates:array(reference('StudioEstateRow',StudioEstateRow))})
export const StudioIndustryRequest=object('StudioIndustryRequest',{protocolVersion:literal(4),schemaId:id(),sessionId:id(),requestId:id(),expectedStateRevision:count(),type:literal('industryQuery'),view:enumeration(['studios','studio','films','film','person','pulse','history','roster','project','employment','laboratory','plans','office','market','alumni','powerRanking','diligence','franchises','featuredAppearances','television','rights','estates']),targetId:nullable(id()),page:count(),pageSize:integer({minimum:1,maximum:50}),lane:enumeration([...INDUSTRY_LANES,...INDUSTRY_FILM_LANES]),period:enumeration(['recent','all','authored','live']),historyPage:optional(count())})
export const StudioIndustryResponse=object('StudioIndustryResponse',{protocolVersion:literal(4),schemaId:id(),snapshotVersion:count(),type:literal('industryPage'),requestId:id(),sessionId:id(),stateRevision:count(),stateDigest:id(),calendar:reference('StudioCampaignDate',StudioCampaignDate),view:enumeration(['studios','studio','films','film','person','pulse','history','roster','project','employment','laboratory','plans','office','market','alumni','powerRanking','diligence','franchises','featuredAppearances','television','rights','estates']),targetId:nullable(id()),page:count(),pageSize:integer({minimum:1,maximum:50}),totalRows:count(),pageCount:count(),lane:id(),period:id(),title:id(),notice:id(),studios:array(reference('StudioIndustryStudio',StudioIndustryStudio)),films:array(reference('StudioIndustryFilm',StudioIndustryFilm)),people:array(reference('StudioIndustryPerson',StudioIndustryPerson)),credits:array(reference('StudioIndustryCredit',StudioIndustryCredit)),activities:array(reference('StudioIndustryActivity',StudioIndustryActivity)),projects:array(reference('StudioIndustryProject',StudioIndustryProject)),tendencies:array(reference('StudioIndustryTendency',StudioIndustryTendency)),laboratory:nullable(reference('StudioLaboratoryPage',StudioLaboratoryPage)),plans:nullable(reference('StudioPlansPage',StudioPlansPage)),office:nullable(reference('StudioOfficePage',StudioOfficePage)),market:nullable(marketPageRef()),powerRanking:nullable(reference('StudioPowerRankingPage',StudioPowerRankingPage)),diligence:nullable(reference('StudioPaidReportsPage',StudioPaidReportsPage)),franchises:nullable(reference('StudioFranchisesPage',StudioFranchisesPage)),featuredAppearances:nullable(reference('StudioFeaturedAppearancesPage',StudioFeaturedAppearancesPage)),television:nullable(reference('StudioTelevisionPage',StudioTelevisionPage)),rights:nullable(reference('StudioRightsPage',StudioRightsPage)),estates:nullable(reference('StudioEstatesPage',StudioEstatesPage))})
export const industryDefinitions={StudioRightSubjectProperty,StudioRightSubjectFilm,StudioRightSubject,StudioRightsSubjectLicence,StudioRightsTitleRow,StudioRightsTitleInstrument,StudioRightsLicenceInstrument,StudioRightsInstrument,StudioRightsOfferRow,StudioRightsCounterparty,StudioRightsPage,StudioEstateLotSubject,StudioEstateMyBid,StudioEstateSale,StudioEstateLotRow,StudioEstateClaimRow,StudioEstateRow,StudioEstatesPage,StudioTelevisionSeries,StudioTelevisionCancellation,StudioTelevisionMilestone,StudioTelevisionSettlement,StudioTelevisionAgreement,StudioTelevisionDistribution,StudioTelevisionCancelPreview,StudioTelevisionSettlePreview,StudioTelevisionSeasonRow,StudioTelevisionPage,StudioFranchiseReleaseOutcome,StudioFranchiseCreditedGuest,StudioFeaturedGuestWeek,StudioFeaturedGuestRow,StudioFeaturedBookingRow,StudioFeaturedAppearancesPage,StudioFranchiseBranch,StudioFranchiseInstallment,StudioFranchiseSubProperty,StudioFranchiseChoice,StudioFranchiseProperty,StudioFranchisesPage,StudioPaidReportStudioTarget,StudioPaidReportLotTarget,StudioPaidReportTarget,StudioPaidReportProperty,StudioPaidReportFilm,StudioPaidReportSubject,StudioPaidReportReceipt,StudioPaidReportRight,StudioPaidReportEmployment,StudioPaidReportLiabilities,StudioPaidReportBody,StudioPaidReportDetail,StudioPaidReportsPage,StudioPowerRankingFilm,StudioPowerRankingRow,StudioPowerRankingPage,StudioAdoptionComponent,StudioCancellationRestoration,StudioActionQuoteComponent,StudioActionQuote,StudioEquipmentAsset,StudioAdoptionRow,StudioLaboratoryAction,StudioOfficeConversionRow,StudioOfficePage,StudioPlanQuoteComponent,StudioPlanQuote,StudioPlanNext,StudioPlanCommitReceipt,StudioPlanRow,StudioPlansPage,StudioLaboratorySeat,StudioResearchLabRow,StudioResearchReceipt,StudioResearchLabShare,StudioResearchWeek,StudioLaboratoryProject,StudioTechnologyForecast,StudioLaboratoryPage,StudioCampaignDate,StudioIndustryLane,StudioIndustryStudio,StudioIndustryFilm,StudioIndustryPerson,StudioIndustryCredit,StudioIndustryActivity,StudioIndustryProject,StudioIndustryTendency,StudioIndustrySummary,StudioIndustryProjection,StudioIndustryRequest,StudioIndustryResponse}
export type IndustryQuery=InferSchema<typeof StudioIndustryRequest>
export type IndustryPage=InferSchema<typeof StudioIndustryResponse>
export type IndustrySummary=InferSchema<typeof StudioIndustrySummary>

export type PowerRankingPage=InferSchema<typeof StudioPowerRankingPage>

export type PaidReportsPage=InferSchema<typeof StudioPaidReportsPage>

export type FranchisesPage=InferSchema<typeof StudioFranchisesPage>
export type FeaturedAppearancesPage=InferSchema<typeof StudioFeaturedAppearancesPage>
export type TelevisionPage=InferSchema<typeof StudioTelevisionPage>
export type RightsPage=InferSchema<typeof StudioRightsPage>
export type EstatesPage=InferSchema<typeof StudioEstatesPage>
export type BridgeRightSubject=InferSchema<typeof StudioRightSubject>
export type BridgeRightsSubjectLicence=InferSchema<typeof StudioRightsSubjectLicence>
