// ── Office standard conversion (P13B-S4) ─────────────────────────────────────
//
// THE QUESTION THIS MODULE ANSWERS: "what standard of development does this
// building work to right now, and what would raising it cost?"
//
// A STANDARD IS DERIVED, NEVER PERSISTED. Save V23 gains no field for it: a
// conversion is an ordinary P09 installation record on an ordinary body, and the
// standard is read back off those records at evaluation time — the same law
// `facilityEffects.ts` states for every other facility effect. That is what lets
// a save written mid-conversion reload and finish identically, and what keeps a
// forged "standard" impossible to write in the first place.
//
// THE LADDER IS A PRODUCER READ, NOT A PER-BODY OVERRIDE. One body has one
// standard (`developmentStandard`); the studio works to the HIGHEST standard any
// of its operational, non-offline bodies provides (`highestOperationalDevelopment
// Standard`), and nothing stacks. An old separately purchased Development Office
// II keeps being a real, separately charged building with zero shared capacity —
// it simply stops being the thing that decides the standard once something better
// stands.
//
// Pure, deterministic, no RNG, no I/O. Imports TUNING only, so the P09 placement
// authority can depend on it without a cycle.

import { FACILITY_BLUEPRINTS, TUNING } from './tuning.js'
import type { GameState, PlacedFacility, StudioPlacement } from './types.js'

export type DevelopmentStandard = 'I' | 'II' | 'III'

const STANDARD_RANK: Readonly<Record<DevelopmentStandard, number>> = { I: 1, II: 2, III: 3 }

/** The standard a conversion blueprint DELIVERS. The closed conversion vocabulary. */
const CONVERSION_STANDARD: Readonly<Record<string, DevelopmentStandard>> = {
  'office-conversion-ii': 'II',
  'office-conversion-iii': 'III',
}

/**
 * A standalone office BODY's own standard. These are the separately purchased
 * effect-only buildings that predate conversion; they are not conversions and are
 * never taken offline by one.
 */
const BODY_STANDARD: Readonly<Record<string, DevelopmentStandard>> = {
  'development-office-2': 'II',
  'development-office-3': 'III',
}

export function standardRank(standard: DevelopmentStandard): number {
  return STANDARD_RANK[standard]
}

function higher(a: DevelopmentStandard, b: DevelopmentStandard): DevelopmentStandard {
  return STANDARD_RANK[a] >= STANDARD_RANK[b] ? a : b
}

/** The standard this blueprint delivers, or null when it is not a conversion. */
export function conversionStandardOf(blueprintId: string): DevelopmentStandard | null {
  return CONVERSION_STANDARD[blueprintId] ?? null
}

export function isOfficeConversionBlueprint(blueprintId: string): boolean {
  return conversionStandardOf(blueprintId) !== null
}

/** Whether an installation of this blueprint closes its target body while it runs. */
export function blueprintTakesTargetOffline(blueprintId: string): boolean {
  return FACILITY_BLUEPRINTS.some(
    (blueprint) => blueprint.id === blueprintId && blueprint.takesTargetOffline === true,
  )
}

/** The BODY's own authored standard, before any conversion on it is considered. */
function bodyOwnStandard(placement: StudioPlacement, facilityId: string): DevelopmentStandard {
  const body = placement.facilities.find(
    (placed) => placed.installation === undefined && placed.facilityId === facilityId,
  )
  if (body === undefined) return 'I'
  return BODY_STANDARD[body.blueprintId] ?? 'I'
}

/** Every operational conversion standing on one body, in placement-record order. */
function operationalConversionsOn(placement: StudioPlacement, facilityId: string): PlacedFacility[] {
  return placement.facilities.filter(
    (placed) =>
      placed.status === 'operational' &&
      placed.installation?.targetFacilityId === facilityId &&
      isOfficeConversionBlueprint(placed.blueprintId),
  )
}

/**
 * ONE body's development standard: the highest OPERATIONAL conversion standing on
 * it, and otherwise the body's own authored standard. The founding Development &
 * Casting office, a built `development-casting-office`, the Annex and the Hall are
 * all standard I until something converts them.
 */
export function developmentStandard(state: GameState, facilityId: string): DevelopmentStandard {
  let standard = bodyOwnStandard(state.placement, facilityId)
  for (const conversion of operationalConversionsOn(state.placement, facilityId)) {
    standard = higher(standard, CONVERSION_STANDARD[conversion.blueprintId]!)
  }
  return standard
}

/**
 * Whether a body is CLOSED right now because a `takesTargetOffline` installation
 * is under construction inside it. An offline body offers no shared slot, counts
 * in no standard ladder, and charges no standard increment — while its own
 * baseline operating cost continues, because the building still stands.
 */
export function facilityOffline(state: GameState, facilityId: string): boolean {
  return placementOffline(state.placement, facilityId)
}

/** The placement-root form, for the authority that owns the registry and the opex. */
export function placementOffline(placement: StudioPlacement, facilityId: string): boolean {
  return placement.facilities.some(
    (placed) =>
      placed.status === 'underConstruction' &&
      placed.installation?.targetFacilityId === facilityId &&
      blueprintTakesTargetOffline(placed.blueprintId),
  )
}

/** Every body id a `takesTargetOffline` installation is CURRENTLY closing. */
export function offlineFacilityIds(placement: StudioPlacement): Set<string> {
  const ids = new Set<string>()
  for (const placed of placement.facilities) {
    if (placed.status !== 'underConstruction') continue
    const targetFacilityId = placed.installation?.targetFacilityId
    if (targetFacilityId === undefined) continue
    if (blueprintTakesTargetOffline(placed.blueprintId)) ids.add(targetFacilityId)
  }
  return ids
}

/** Every body id any conversion has ever been committed against, in any status. */
export function conversionTargetFacilityIds(placement: StudioPlacement): Set<string> {
  const ids = new Set<string>()
  for (const placed of placement.facilities) {
    const targetFacilityId = placed.installation?.targetFacilityId
    if (targetFacilityId === undefined) continue
    if (blueprintTakesTargetOffline(placed.blueprintId)) ids.add(targetFacilityId)
  }
  return ids
}

/**
 * Whether THIS operational conversion row is the one that actually charges its
 * weekly increment: only while its body is open, and only for the body's CURRENT
 * standard. A II conversion superseded by an operational III charges nothing —
 * the studio pays for one standard, the one it is working to, never a ladder of
 * every standard it ever passed through.
 */
export function conversionIncrementCharges(placement: StudioPlacement, placed: PlacedFacility): boolean {
  const targetFacilityId = placed.installation?.targetFacilityId
  if (conversionStandardOf(placed.blueprintId) === null || targetFacilityId === undefined) return true
  return chargesIncrement(
    placed,
    placementOffline(placement, targetFacilityId),
    operationalConversionsOn(placement, targetFacilityId),
  )
}

/**
 * The same law asked of a PAST week, for the historical opex reconciliation. A
 * conversion's own record carries both dates it needs, so a week is answered from
 * the placement record alone — no second store, exactly as the demolition history
 * reconstructs a facility's life from its two ledger rows.
 */
export function conversionIncrementChargedAtWeek(
  placement: StudioPlacement,
  placed: PlacedFacility,
  week: number,
): boolean {
  const targetFacilityId = placed.installation?.targetFacilityId
  if (conversionStandardOf(placed.blueprintId) === null || targetFacilityId === undefined) return true
  const onBody = placement.facilities.filter(
    (candidate) => candidate.installation?.targetFacilityId === targetFacilityId,
  )
  const closed = onBody.some(
    (candidate) =>
      blueprintTakesTargetOffline(candidate.blueprintId) &&
      candidate.placedWeek <= week &&
      week < candidate.completesWeek,
  )
  const standing = onBody.filter(
    (candidate) => candidate.completesWeek <= week && isOfficeConversionBlueprint(candidate.blueprintId),
  )
  return chargesIncrement(placed, closed, standing)
}

/** ONE ordering rule: an open body pays for its CURRENT standard and no other. */
function chargesIncrement(
  placed: PlacedFacility,
  bodyClosed: boolean,
  standingConversions: readonly PlacedFacility[],
): boolean {
  if (bodyClosed) return false
  const standard = CONVERSION_STANDARD[placed.blueprintId]!
  for (const other of standingConversions) {
    if (other.id === placed.id) continue
    const otherStandard = CONVERSION_STANDARD[other.blueprintId]!
    if (STANDARD_RANK[otherStandard] > STANDARD_RANK[standard]) return false
    // A forged tie (two conversions of one standard on one body) is refused by the
    // save validator; charge exactly one of them regardless, so no path can
    // double-charge a standard the studio bought once.
    if (STANDARD_RANK[otherStandard] === STANDARD_RANK[standard] && other.id < placed.id) return false
  }
  return true
}

/** Every development body this studio owns: registry bodies plus effect-only offices. */
export function developmentBodyFacilityIds(state: GameState): string[] {
  const ids: string[] = []
  for (const facility of state.operations.facilities) {
    if (facility.capability === 'development-casting') ids.push(facility.id)
  }
  for (const placed of state.placement.facilities) {
    if (placed.installation !== undefined) continue
    if (placed.status !== 'operational') continue
    if (BODY_STANDARD[placed.blueprintId] === undefined) continue
    if (!ids.includes(placed.facilityId)) ids.push(placed.facilityId)
  }
  return ids
}

function highestStandardExcluding(state: GameState, exceptFacilityId: string | null): DevelopmentStandard {
  let standard: DevelopmentStandard = 'I'
  for (const facilityId of developmentBodyFacilityIds(state)) {
    if (facilityId === exceptFacilityId) continue
    if (facilityOffline(state, facilityId)) continue
    standard = higher(standard, developmentStandard(state, facilityId))
  }
  return standard
}

/**
 * THE PRODUCER RULE: the standard the studio works to this week — the highest any
 * open, operational body provides. Nothing stacks; taking the sole high-standard
 * body offline drops it, which is exactly what a conversion quote discloses before
 * the studio commits to one.
 */
export function highestOperationalDevelopmentStandard(state: GameState): DevelopmentStandard {
  return highestStandardExcluding(state, null)
}

export type ConversionQuote = {
  cost: number
  buildWeeks: number
  fromStandard: DevelopmentStandard
  toStandard: DevelopmentStandard
  /** What the STUDIO works to while this body is closed — the disclosed downtime cost. */
  standardDuringWork: DevelopmentStandard
  /** What the studio works to once it reopens. */
  standardAfter: DevelopmentStandard
}

function conversionPrice(
  toStandard: DevelopmentStandard,
  fromStandard: DevelopmentStandard,
): { cost: number; buildWeeks: number } {
  if (toStandard === 'II') {
    return { cost: TUNING.OFFICE_CONVERSION_II_CAPEX, buildWeeks: TUNING.OFFICE_CONVERSION_II_BUILD_WEEKS }
  }
  // III is the one SOURCE-DEPENDENT price: shorter and cheaper from a body already
  // at II, and quoted directly from I without ever pricing an obsolete II purchase.
  return fromStandard === 'II'
    ? { cost: TUNING.OFFICE_CONVERSION_III_FROM_II_CAPEX, buildWeeks: TUNING.OFFICE_CONVERSION_III_FROM_II_BUILD_WEEKS }
    : { cost: TUNING.OFFICE_CONVERSION_III_FROM_I_CAPEX, buildWeeks: TUNING.OFFICE_CONVERSION_III_FROM_I_BUILD_WEEKS }
}

/**
 * Every (cost, buildWeeks) pair this conversion blueprint may LAWFULLY have been
 * committed at, or null for a blueprint that is not a conversion.
 *
 * A conversion is the one P09 job whose price and duration depend on the standard
 * its body started from, and that source is not persisted — it is history. So the
 * save boundary proves the committed pair against the AUTHORED set rather than
 * against a single number: a record outside this table was never quoted by this
 * engine, which is exactly the forgery the old `=== blueprint.capex` law caught.
 */
export function lawfulConversionCommitments(
  blueprintId: string,
): readonly { cost: number; buildWeeks: number }[] | null {
  const toStandard = conversionStandardOf(blueprintId)
  if (toStandard === null) return null
  if (toStandard === 'II') return [conversionPrice('II', 'I')]
  return [conversionPrice('III', 'I'), conversionPrice('III', 'II')]
}

/**
 * The complete conversion disclosure for one body: what it costs, how long it
 * takes, what the body is and becomes, and what the studio works to meanwhile.
 *
 * THROWS rather than guessing on a blueprint that is not a conversion or a target
 * that is not a development body — the caller that can refuse (`queryFacility
 * Installation`) refuses; nothing here invents a quote for work that cannot exist.
 */
export function conversionQuote(
  state: GameState,
  blueprintId: string,
  targetFacilityId: string,
): ConversionQuote {
  const toStandard = conversionStandardOf(blueprintId)
  if (toStandard === null) {
    throw new Error(`officeConversion: "${blueprintId}" is not an Office conversion`)
  }
  const target = state.operations.facilities.find((facility) => facility.id === targetFacilityId)
  if (target === undefined || target.capability !== 'development-casting') {
    throw new Error(`officeConversion: "${targetFacilityId}" is not a development body of this studio`)
  }
  const fromStandard = developmentStandard(state, targetFacilityId)
  const standardDuringWork = highestStandardExcluding(state, targetFacilityId)
  return {
    ...conversionPrice(toStandard, fromStandard),
    fromStandard,
    toStandard,
    standardDuringWork,
    standardAfter: higher(standardDuringWork, toStandard),
  }
}
