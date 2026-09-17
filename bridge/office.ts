/** P13B-S4's private player Office read side. The engine's conversion law is the authority. */
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import { economyEngaged } from '../src/core/employment.js'
import {
  blueprintTakesTargetOffline, conversionQuote, conversionStandardOf, developmentBodyFacilityIds,
  developmentStandard, facilityOffline, highestOperationalDevelopmentStandard,
  isOfficeConversionBlueprint, standardRank, type DevelopmentStandard,
} from '../src/core/officeConversion.js'
import { cancellationQuote } from '../src/core/installationCancellation.js'
import { resolvedTargetFacilityId, studioPhysicalPlans, type PhysicalPlanAction } from '../src/core/physicalPlans.js'
import {
  blueprintById, commitFacilityInstallation, queryFacilityInstallation,
  type FacilityInstallationQuote,
} from '../src/core/placement.js'
import type { GameState } from '../src/core/types.js'
import { cancellationDetail, cancellationQuoteRow, isCancellationAction, type CancellationAction } from './cancellation.ts'
import type { AvailableIntent } from './protocol.ts'
import type { IndustryPage } from './schema/industry-schema.ts'

type OfficePage = NonNullable<IndustryPage['office']>
type ActionQuoteRow = NonNullable<OfficePage['actions'][number]['quote']>
type ConversionRow = OfficePage['conversions'][number]
type ConversionBlueprintId = ConversionRow['blueprintId']

/**
 * The IMMEDIATE conversion commit this page offers. P13B-S4 mints no new engine
 * action kind (plan §S4): a conversion goes through P09's own quote/commit pair,
 * exactly as `applyTechnologyAction` commits the Laboratory's instruments. This
 * descriptor is the bridge's request for that pair and nothing else — it names a
 * conversion blueprint and one target body, so no other installation is reachable
 * through it.
 */
export type OfficeConversionCommit = {
  kind: 'commitOfficeConversion'
  blueprintId: ConversionBlueprintId
  targetFacilityId: string
}
// P13B-S6: a running conversion can be STOPPED from this page. `cancelInstallation` is
// an ordinary engine action, so it needs no bridge-authored commit descriptor.
export type OfficeAction = OfficeConversionCommit | PhysicalPlanAction | CancellationAction
export type OfficeActionSpec = {
  id: string
  /** The body this row acts on: the page publishes only its own building's rows. */
  facilityId: string
  action: OfficeAction
  label: string
  detail: string
  enabled: boolean
  disabledReason: string | null
  /** P13B-S6: the engine's own `cancellationQuote` on a `cancel-*` row; null on every conversion verb. */
  quote: ActionQuoteRow | null
}
export type OfficeIntent = { spec: OfficeActionSpec; option: AvailableIntent }

/** The two conversion blueprints, with the row-id suffix each one carries. */
const CONVERSIONS = [
  { blueprintId: 'office-conversion-ii', suffix: 'ii' },
  { blueprintId: 'office-conversion-iii', suffix: 'iii' },
] as const satisfies readonly { blueprintId: ConversionBlueprintId; suffix: string }[]

const money = (value: number) => '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

/**
 * Apply one office row. A refused P09 commit is BYTE-NEUTRAL — it returns the same
 * state — so this raises the engine's own refusal instead of reporting a silent
 * success on an unchanged campaign.
 */
export function applyOfficeAction(state: GameState, action: OfficeAction): GameState {
  if (action.kind !== 'commitOfficeConversion') return applyActions(state, [action])
  const request = { blueprintId: action.blueprintId, targetFacilityId: action.targetFacilityId }
  const quote = queryFacilityInstallation(state, request)
  if (!quote.ok) throw new Error(refusalSentence(state, action.targetFacilityId, quote))
  return commitFacilityInstallation(state, request)
}

/** The body's own placement record, or undefined for the endowed founding office. */
const bodyPlacement = (state: GameState, facilityId: string) =>
  state.placement.facilities.find(placed => placed.installation === undefined && placed.facilityId === facilityId)

/** The week a conversion currently CLOSING this body reopens it, or null when it is open. */
function offlineUntilWeek(state: GameState, facilityId: string): number | null {
  const closing = state.placement.facilities.find(placed =>
    placed.status === 'underConstruction' &&
    placed.installation?.targetFacilityId === facilityId &&
    blueprintTakesTargetOffline(placed.blueprintId))
  return closing?.completesWeek ?? null
}

/** The body's OWN weekly operating cost. Zero for the endowed founding office: it has no placement to charge. */
function baselineWeeklyOperatingCost(state: GameState, facilityId: string): number {
  const body = bodyPlacement(state, facilityId)
  return body?.status === 'operational' ? blueprintById(body.blueprintId)?.weeklyOperatingCost ?? 0 : 0
}

/**
 * The engine's PRIMARY refusal for this row: `rejections[0]`, in the order
 * `queryFacilityInstallation` itself pushes them. The row also publishes the whole
 * list, so a client never has to guess what the primary one hid — while a conversion
 * RUNS, the blueprint's own row reads `alreadyInstalled` and its sibling reads
 * `targetEngaged`, which is exactly what each one is refused for first.
 *
 * ONE exception, and it is about what is true rather than about ordering: the engine's
 * `alreadyInstalled` check carries no status filter, so it keeps firing long after the
 * conversion COMPLETED. A finished record is not why this row is refused — the standard
 * the building now works to is — so a completed conversion's own row yields to
 * `standardAlreadyMet`. While the record is still under construction, `alreadyInstalled`
 * is the live fact and keeps the primary slot.
 */
function refusalOf(state: GameState, facilityId: string, quote: FacilityInstallationQuote): string | null {
  const running = state.placement.facilities.some(placed =>
    placed.status === 'underConstruction' && placed.blueprintId === quote.blueprintId &&
    placed.installation?.targetFacilityId === facilityId)
  if (quote.rejections[0] === 'alreadyInstalled' && !running && quote.rejections.includes('standardAlreadyMet')) {
    return 'standardAlreadyMet'
  }
  return quote.rejections[0] ?? null
}

/** One sentence for the SAME primary refusal the `refusal` member names; the two never disagree. */
function refusalSentence(state: GameState, facilityId: string, quote: FacilityInstallationQuote): string {
  const until = offlineUntilWeek(state, facilityId)
  const closed = until === null ? '' : ` The building is closed for the work until ${campaignDate(until).label}.`
  switch (refusalOf(state, facilityId, quote)) {
    case 'standardAlreadyMet':
      return 'This building already works to this development standard, so converting it again would buy nothing.'
    case 'alreadyInstalled':
      return `This exact conversion is already committed on this building.${closed}`
    case 'targetEngaged':
      return until !== null
        ? `This building is closed for conversion work until ${campaignDate(until).label}.`
        : 'This building has work in progress. A conversion closes the building, so its slots must be free first.'
    case 'requirementsUnmet':
      return quote.unmetRequirements.map(unmet => unmet.reason).join(' ') || 'This conversion has an unmet requirement.'
    case 'insufficientFunds':
      return `This conversion requires ${money(quote.cost)} available cash.`
    case 'unknownTarget': case 'incompatibleTarget': case 'targetHasNoBody':
      return 'This building is not a Development & Casting body this studio can convert in place.'
    default:
      return 'This conversion is not currently available.'
  }
}

/**
 * The four standards one conversion discloses. `conversionQuote` THROWS on a target
 * that is not a development body of the shared registry — a separately purchased,
 * effect-only Development Office II/III body has no registry row at all (capacity 0
 * never joins it) — so the row falls back to the one standard that is knowable
 * there, the body's own derived standard, and carries the engine's refusal beside it.
 */
function conversionStandards(state: GameState, blueprintId: ConversionBlueprintId, facilityId: string) {
  if (isOfficeConversionBlueprint(blueprintId)) {
    try {
      const quote = conversionQuote(state, blueprintId, facilityId)
      return {
        fromStandard: quote.fromStandard, toStandard: quote.toStandard,
        standardDuringWork: quote.standardDuringWork, standardAfter: quote.standardAfter,
      }
    } catch { /* not a quotable development body; the derived standard below is all there is */ }
  }
  const standard = developmentStandard(state, facilityId)
  return { fromStandard: standard, toStandard: standard, standardDuringWork: standard, standardAfter: standard }
}

/** One conversion row: the engine's live quote, its standards, and its refusal when it has one. */
function conversionRow(state: GameState, facilityId: string, blueprintId: ConversionBlueprintId): ConversionRow {
  const quote = queryFacilityInstallation(state, { blueprintId, targetFacilityId: facilityId })
  return {
    blueprintId, label: blueprintById(blueprintId)?.name ?? blueprintId,
    cost: quote.cost, buildWeeks: quote.buildWeeks, weeklyOperatingCost: quote.weeklyOperatingCost,
    ...conversionStandards(state, blueprintId, facilityId),
    // The whole build closes the body, and only a `takesTargetOffline` blueprint does.
    downtimeWeeks: blueprintTakesTargetOffline(blueprintId) ? quote.buildWeeks : 0,
    available: quote.ok, rejections: [...quote.rejections], refusal: refusalOf(state, facilityId, quote),
    refusalText: quote.ok ? null : refusalSentence(state, facilityId, quote),
  }
}

/** What the studio is buying, in one paragraph: price, downtime, and both standards. */
function convertDetail(state: GameState, facilityId: string, row: ConversionRow): string {
  const baseline = baselineWeeklyOperatingCost(state, facilityId)
  return `${money(row.cost)} for ${String(row.buildWeeks)} weeks of physical work; ready ${campaignDate(state.market.tick + row.buildWeeks).label}. ` +
    `This building is CLOSED for all ${String(row.downtimeWeeks)} weeks: it offers no Development & Casting slots and provides no development standard while the work runs. ` +
    `Your studio works to standard ${row.standardDuringWork} during the work and standard ${row.standardAfter} once it reopens. ` +
    (baseline > 0 ? `Its own ${money(baseline)}/week operating cost continues while it is closed. ` : '') +
    `${money(row.weeklyOperatingCost)}/week standard increment after completion, charged only while the building is open and working to that standard.`
}

/**
 * The standard this body ALREADY reaches without another decision: what it works to
 * now, plus the target of every conversion committed on it in any status and of every
 * queued, held or started plan aimed at it.
 *
 * This is P13B-S3's companion rule stated in the one currency an office has. It
 * subsumes the S3 form — committed or planned work of the SAME blueprint raises the
 * reachable standard to that blueprint's own target — and it also closes the case S3
 * had no vocabulary for: a queued III makes a II companion a false affordance, because
 * a II could only ever hold and then die on `standardAlreadyMet`. A HIGHER standard
 * stays offered while a lower one runs, because chaining is lawful: it holds on
 * `targetEngaged` and then admits, or is reviewed, at the shorter II->III price.
 */
function reachableStandard(state: GameState, own: string, facilityId: string): DevelopmentStandard {
  let standard = developmentStandard(state, facilityId)
  const raise = (candidate: DevelopmentStandard | null) => {
    if (candidate !== null && standardRank(candidate) > standardRank(standard)) standard = candidate
  }
  for (const placed of state.placement.facilities) {
    if (placed.installation?.targetFacilityId === facilityId) raise(conversionStandardOf(placed.blueprintId))
  }
  for (const plan of studioPhysicalPlans(state, own)) {
    if (plan.status !== 'queued' && plan.status !== 'held' && plan.status !== 'started') continue
    if (plan.work.kind !== 'installation' || resolvedTargetFacilityId(state, plan.work) !== facilityId) continue
    raise(conversionStandardOf(plan.work.blueprintId))
  }
  return standard
}

/**
 * Every office decision this studio can reach, with the ENGINE's own refusal text on
 * the rows it would not accept — the same dry run the Laboratory and Plans pages use.
 * Cached per immutable state, exactly as `laboratoryActionSpecs` is.
 */
const quotes = new WeakMap<GameState, readonly OfficeActionSpec[]>()
export function officeActionSpecs(state: GameState): readonly OfficeActionSpec[] {
  const prior = quotes.get(state)
  if (prior) return prior
  const specs: OfficeActionSpec[] = []
  if (!state.hollywood || state.founding !== null || !economyEngaged(state)) return specs
  const own = state.hollywood.playerStudioId
  function add(id: string, facilityId: string, action: OfficeAction, label: string, detail: string, refusal: string | null = null, quote: ActionQuoteRow | null = null) {
    let disabledReason = refusal
    // P13B-S6: a cancel row is priced and refused by `cancellationQuote` alone (see
    // bridge/laboratory.ts's own note) — its detail already states the money.
    if (disabledReason === null && !isCancellationAction(action)) {
      try {
        const next = applyOfficeAction(state, action)
        if (next === state) throw new Error('This decision is not currently available.')
        const paid = state.studio.cash - next.studio.cash
        detail += ` ${money(paid)} charged now. Cash after this decision: ${money(next.studio.cash)}.`
      } catch (error) { disabledReason = (error as Error).message }
    }
    specs.push({ id, facilityId, action, label, detail, enabled: disabledReason === null, disabledReason, quote })
  }
  for (const facilityId of developmentBodyFacilityIds(state)) {
    for (const conversion of CONVERSIONS) {
      const row = conversionRow(state, facilityId, conversion.blueprintId)
      // A facility id ALREADY contains hyphens: the suffix is appended, never parsed back out.
      // The immediate row is ALWAYS published and is disabled by the engine's own dry
      // run alone — no bridge-authored refusal, so nothing here can withhold a decision
      // the engine would accept.
      add(`office-convert-${facilityId}-${conversion.suffix}`, facilityId,
        { kind: 'commitOfficeConversion', blueprintId: conversion.blueprintId, targetFacilityId: facilityId },
        `Convert to ${row.label.replace(' Conversion', '')}`,
        convertDetail(state, facilityId, row))
      // A plan reserves nothing, so a building busy today can still be planned and the
      // engine re-quotes and decides at the weekly boundary. Only a companion the body
      // already reaches is withheld.
      // The BLUEPRINT's own target standard, which the fallback row above cannot carry.
      if (standardRank(conversionStandardOf(conversion.blueprintId)!) <= standardRank(reachableStandard(state, own, facilityId))) continue
      add(`plan-queue-office-convert-${facilityId}-${conversion.suffix}`, facilityId,
        { kind: 'queuePhysicalPlan', work: { kind: 'installation', blueprintId: conversion.blueprintId, target: { facilityId } },
          dependsOn: [], approvedMaximumDebit: row.cost, admission: 'reviewChangedQuote' },
        `Queue ${row.label.toLowerCase()}`,
        `Add this conversion to the studio's physical plans at the quoted ${money(row.cost)}: ${String(row.buildWeeks)} weeks of physical work ` +
        `with the building closed throughout, then ${money(row.weeklyOperatingCost)}/week while it works to standard ${row.toStandard}. ` +
        'Nothing is reserved until the plan starts — no cash, capacity or engagement moves while it waits — and the plan is quoted again at each weekly boundary. ' +
        `${money(row.cost)} is the approved ceiling; a changed quote is held for your review.`)
    }
    // P13B-S6: one cancel row per installation still RUNNING on this body. The ENGINE
    // decides which: `cancellationQuote` refuses a completed record, an already-cancelled
    // one and a restoration job, so this page never has to restate any of those three laws
    // — which is also why a restoration, the one installation the player cannot stop,
    // publishes no row here even while it is closing the building.
    for (const placed of state.placement.facilities) {
      if (placed.installation?.targetFacilityId !== facilityId) continue
      const quote = cancellationQuote(state, { projectId: placed.projectId })
      if (!quote.ok) continue
      const row = cancellationQuoteRow(state, { projectId: placed.projectId })
      add(`cancel-${placed.projectId}`, facilityId, { kind: 'cancelInstallation', projectId: placed.projectId },
        `Cancel ${(blueprintById(placed.blueprintId)?.name ?? placed.blueprintId).toLowerCase()}`,
        cancellationDetail(state, row) +
        ' This building keeps the development standard it worked to before the conversion was committed.',
        quote.refusal, row)
    }
  }
  quotes.set(state, specs)
  return specs
}

/**
 * One Development & Casting building's standard page. Player-safe by construction:
 * `developmentBodyFacilityIds` reads this studio's own registry and placement alone,
 * so a rival's facility id resolves to nothing and the caller rejects the request.
 */
export function officePage(state: GameState, facilityId: string | null, intents: readonly OfficeIntent[], page: number, pageSize: number): {
  office: OfficePage; totalRows: number; pageCount: number
} {
  if (!state.hollywood || state.founding !== null) throw new Error('This campaign has no studio Development & Casting building.')
  if (facilityId === null || !developmentBodyFacilityIds(state).includes(facilityId)) {
    throw new Error('That exact Development & Casting building is absent from this campaign.')
  }
  const own = state.hollywood.playerStudioId
  const body = bodyPlacement(state, facilityId)
  const registry = state.operations.facilities.find(facility => facility.id === facilityId)
  const actions = officeActionSpecs(state).filter(spec => spec.facilityId === facilityId)
  const pageCount = Math.ceil(actions.length / pageSize)
  if (page > 0 && page >= pageCount) throw new Error('That office action page is outside this snapshot. Return to the first page.')
  const enabled = new Map(intents.map(intent => [intent.spec.id, intent.option]))
  return { totalRows: actions.length, pageCount, office: {
    facilityId,
    title: registry?.name ?? blueprintById(body?.blueprintId ?? '')?.name ?? facilityId,
    // Null exactly on the endowed founding office, which is a property structure with
    // no placement record — naming a blueprint there would claim a building the studio
    // never bought, and a weekly charge it never pays.
    blueprintId: body?.blueprintId ?? null,
    standard: developmentStandard(state, facilityId),
    highestOperationalStandard: highestOperationalDevelopmentStandard(state),
    offline: facilityOffline(state, facilityId),
    offlineUntilWeek: offlineUntilWeek(state, facilityId),
    // The registry's own live capacity, which the engine already sets to 0 while a
    // conversion closes this body. Never a blueprint number the closure would contradict.
    capacity: registry?.capacity ?? 0,
    baselineWeeklyOperatingCost: baselineWeeklyOperatingCost(state, facilityId),
    conversions: CONVERSIONS.map(conversion => conversionRow(state, facilityId, conversion.blueprintId)),
    // This studio's own waiting or started plans aimed at this exact body, in admission order.
    planIds: studioPhysicalPlans(state, own).filter(plan =>
      (plan.status === 'queued' || plan.status === 'held' || plan.status === 'started') &&
      resolvedTargetFacilityId(state, plan.work) === facilityId).map(plan => plan.id),
    actions: actions.slice(page * pageSize, (page + 1) * pageSize).map(spec => ({
      id: spec.id, label: spec.label, detail: spec.detail,
      enabled: spec.enabled && enabled.has(spec.id),
      disabledReason: spec.disabledReason ?? (enabled.has(spec.id) ? null : 'Refresh this building to review the current decision.'),
      intent: enabled.get(spec.id) ?? null,
      // P13B-S5/S6: the shared action row's quote. An office conversion never carries one;
      // a P13B-S6 `cancel-*` row carries the engine's own cancellation quote.
      quote: spec.quote,
    })),
  } }
}
