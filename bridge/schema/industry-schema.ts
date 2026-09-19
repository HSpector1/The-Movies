import {StudioBridgeIntentOption} from './intent-schema.ts'
import {array,boolean as bool,enumeration,integer,literal,nullable,number,object,optional,reference,text,type InferSchema,type JsonSchema} from './dsl.ts'
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
const StudioAdoptionRow=object('StudioAdoptionRow',{technologyId:enumeration(TECHNOLOGY_IDS),route:enumeration(['research','purchase']),committedWeek:count(),operationalWeek:nullable(count()),components:array(reference('StudioAdoptionComponent',StudioAdoptionComponent)),equipmentAssetId:nullable(id()),postFacilityId:nullable(id()),cancelledWeek:nullable(count()),replacementLabel:id()})
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
const StudioIndustryStudio=object('StudioIndustryStudio',{studioId:id(),name:id(),mark:id(),color:id(),player:bool(),trustLabel:enumeration(['Reliable','Mixed record','Distrusted']),foundingLabel:id(),entryLabel:id(),recordingNotice:id(),filmCount:count(),authoredFilmCount:count(),liveFilmCount:count(),lanes:array(reference('StudioIndustryLane',StudioIndustryLane))})
const StudioIndustryFilm=object('StudioIndustryFilm',{filmId:id(),studioId:id(),studioName:id(),title:id(),genre:id(),dateLabel:id(),releaseWeek:nullable(count()),historicalYear:nullable(integer({minimum:1800,maximum:1919})),provenance:enumeration(['authored-start/v1','simulation/v1','player-record']),criticScore:score(),audienceScore:score(),openingGross:number({minimum:0}),totalGross:number({minimum:0}),runStatus:enumeration(['settled','inRun','recorded']),businessNotice:id()})
// P14A.3: `caseStatusLine` and `caseRef` carry the PUBLIC world-route case facts of this
// person — the restrained open-case line and the reference that opens that exact case
// (`view:'market'`). Both are null unless the engine holds an OPEN case, and both stay
// figure-free: a rival's tier, salary and bonus remain behind A.1's disclosure and appear
// on no Industry row. The row's own `onPlayerLot` still states where the person is; a
// rival's person is never on the player's lot and no rival lot exists on this wire.
const StudioIndustryPerson=object('StudioIndustryPerson',{talentId:id(),name:id(),roleLabel:id(),employerStudioId:nullable(id()),employerName:nullable(id()),employmentLabel:id(),creditCount:count(),onPlayerLot:bool(),notice:id(),caseStatusLine:nullable(id()),caseRef:nullable(worldCaseRefRef())})
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
const StudioIndustryActivity=object('StudioIndustryActivity',{eventId:id(),week:count(),dateLabel:id(),group:enumeration(['releases','people','studios','announcements']),headline:id(),detail:id(),studioId:nullable(id()),filmId:nullable(id()),talentId:nullable(id()),settlementKind:optional(enumeration(['retained','moved'])),outcomeKind:optional(enumeration(['promiseKept','promiseBroken']))})
const StudioIndustryProject=object('StudioIndustryProject',{productionId:id(),studioId:id(),title:id(),genre:id(),announcedWeek:count(),dateLabel:id(),stageLabel:id(),notice:id()})
const StudioIndustryTendency=object('StudioIndustryTendency',{label:id(),detail:id(),sampleCount:count(),fromLabel:id(),throughLabel:id(),basis:id()})
export const StudioIndustrySummary=object('StudioIndustrySummary',{calendar:reference('StudioCampaignDate',StudioCampaignDate),available:bool(),playerStudioId:nullable(id()),activeStudioCount:count(),notice:id()})
export const StudioIndustryProjection=object('StudioIndustryProjection',{industry:reference('StudioIndustrySummary',StudioIndustrySummary)})
// P14A.2: `view:'market'` opens the Talent Market workspace; `targetId` is the selected
// person's talentId (null for the buckets alone), `page` pages the CLOSED case bucket and
// the OPTIONAL `historyPage` pages the selected person's employer history. `historyPage` is
// optional so every request minted before projection 43 stays valid exactly as it is.
export const StudioIndustryRequest=object('StudioIndustryRequest',{protocolVersion:literal(4),schemaId:id(),sessionId:id(),requestId:id(),expectedStateRevision:count(),type:literal('industryQuery'),view:enumeration(['studios','studio','films','film','person','pulse','history','roster','project','employment','laboratory','plans','office','market']),targetId:nullable(id()),page:count(),pageSize:integer({minimum:1,maximum:50}),lane:enumeration([...INDUSTRY_LANES,...INDUSTRY_FILM_LANES]),period:enumeration(['recent','all','authored','live']),historyPage:optional(count())})
export const StudioIndustryResponse=object('StudioIndustryResponse',{protocolVersion:literal(4),schemaId:id(),snapshotVersion:count(),type:literal('industryPage'),requestId:id(),sessionId:id(),stateRevision:count(),stateDigest:id(),calendar:reference('StudioCampaignDate',StudioCampaignDate),view:enumeration(['studios','studio','films','film','person','pulse','history','roster','project','employment','laboratory','plans','office','market']),targetId:nullable(id()),page:count(),pageSize:integer({minimum:1,maximum:50}),totalRows:count(),pageCount:count(),lane:id(),period:id(),title:id(),notice:id(),studios:array(reference('StudioIndustryStudio',StudioIndustryStudio)),films:array(reference('StudioIndustryFilm',StudioIndustryFilm)),people:array(reference('StudioIndustryPerson',StudioIndustryPerson)),credits:array(reference('StudioIndustryCredit',StudioIndustryCredit)),activities:array(reference('StudioIndustryActivity',StudioIndustryActivity)),projects:array(reference('StudioIndustryProject',StudioIndustryProject)),tendencies:array(reference('StudioIndustryTendency',StudioIndustryTendency)),laboratory:nullable(reference('StudioLaboratoryPage',StudioLaboratoryPage)),plans:nullable(reference('StudioPlansPage',StudioPlansPage)),office:nullable(reference('StudioOfficePage',StudioOfficePage)),market:nullable(marketPageRef())})
export const industryDefinitions={StudioAdoptionComponent,StudioCancellationRestoration,StudioActionQuoteComponent,StudioActionQuote,StudioEquipmentAsset,StudioAdoptionRow,StudioLaboratoryAction,StudioOfficeConversionRow,StudioOfficePage,StudioPlanQuoteComponent,StudioPlanQuote,StudioPlanNext,StudioPlanCommitReceipt,StudioPlanRow,StudioPlansPage,StudioLaboratorySeat,StudioResearchLabRow,StudioResearchReceipt,StudioResearchLabShare,StudioResearchWeek,StudioLaboratoryProject,StudioTechnologyForecast,StudioLaboratoryPage,StudioCampaignDate,StudioIndustryLane,StudioIndustryStudio,StudioIndustryFilm,StudioIndustryPerson,StudioIndustryCredit,StudioIndustryActivity,StudioIndustryProject,StudioIndustryTendency,StudioIndustrySummary,StudioIndustryProjection,StudioIndustryRequest,StudioIndustryResponse}
export type IndustryQuery=InferSchema<typeof StudioIndustryRequest>
export type IndustryPage=InferSchema<typeof StudioIndustryResponse>
export type IndustrySummary=InferSchema<typeof StudioIndustrySummary>
