// Project: Studio economy truth audit — controlled public-action Development Office A/B.
//
// This is deliberately a narrow causal experiment. Every arm uses the browser-facing
// founding, placement, screenplay, greenlight, and production actions. Office II and
// Office III are actual purchases: their capex and facility opex are read back from the
// authoritative ledger. A cell is excluded as data whenever a seed cannot sustain an
// identical package across the three arms; it is never silently dropped.

import {
  NEGATIVE_BUDGET_MULTIPLIERS,
  marketingLevelsFor,
  readyScriptPerceivedStrength,
  resolveShape,
} from '../../src/core/index.js'
import type {
  CreativeRole,
  FilmShape,
  GameState,
  Promise as FilmPromise,
  ReceptionInputs,
  Talent,
} from '../../src/core/index.js'
import {
  advanceWeek,
  commissionScriptAction,
  developmentOfficeUplift,
  findTalent,
  foundManagedStudioAction,
  foundingApplicantCards,
  greenlightScriptProject,
  newGame,
  placeFacilityAction,
  placementQuote,
  productionDecision,
  runProductionCommand,
  runScriptProjectAction,
  scriptProjectsBoard,
  signContractAction,
  studioPlacement,
  studioPool,
  studioRevenueForFilm,
} from '../../ui/src/engine/adapter.js'
import { distribution, pairedEffect, rate } from '../../src/harness/economy-truth-audit/statistics.js'
import type { Distribution, PairedEffect, RateEstimate } from '../../src/harness/economy-truth-audit/statistics.js'

export const OFFICE_SCHEMA_VERSION = 'economy-truth-offices-v1' as const
export const OFFICE_SEED_COUNT = 100

const COMMISSION_WEEK = 20
const FOUNDING_TERM_WEEKS = 208
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 4,
  director: 1,
  writer: 2,
  craft: 1,
}
const OFFICE_II = 'development-office-2'
const OFFICE_III = 'development-office-3'

export type OfficeArmId = 'none' | 'office-2' | 'office-2-plus-3'

export function officeSeed(indexOneBased: number): string {
  if (!Number.isInteger(indexOneBased) || indexOneBased < 1) {
    throw new Error(`economy truth audit: invalid office seed index ${String(indexOneBased)}`)
  }
  return `eta-office-${String(indexOneBased).padStart(3, '0')}`
}

type Outcome<T> = { ok: true; value: T } | { ok: false; reason: string }

type SharedPackage = {
  conceptId: string
  writerId: string
  directorId: string
  cast: { lead: string; antagonist: string; support: string }
  craftIds: string[]
  shape: FilmShape
  promise: FilmPromise
  negative: number
  marketing: number
}

export type OfficeArmCompact = {
  arm: OfficeArmId
  included: boolean
  exclusion: string | null
  commissionWeek: number | null
  rngMatchedAtCommission: boolean | null
  packageMatched: boolean | null
  productionId: string | null
  officeUpliftPoints: number | null
  /** Actual sum of this arm's construction-capex debits. */
  facilityCapex: number | null
  /** Actual sum of this arm's facility-opex debits through the closed theatrical run. */
  facilityOpex: number | null
  directCommitment: number | null
  studioRevenue: number | null
  contribution: number | null
  cashAtCommission: number | null
  finalCash: number | null
  cashDeltaFromCommission: number | null
  releaseWeek: number | null
  closedRunWeek: number | null
}

export type OfficeCellCompact = {
  schemaVersion: typeof OFFICE_SCHEMA_VERSION
  seed: string
  commissionWeek: number
  included: boolean
  exclusion: string | null
  /** No successful cell is admitted unless this is true. */
  rngIdenticalAtCommission: boolean
  package: SharedPackage | null
  none: OfficeArmCompact
  office2: OfficeArmCompact
  office2Plus3: OfficeArmCompact
  /** Per-seed treatment-minus-control values; aggregate statistics preserve these pairings. */
  pairedDeltas: {
    office2VsNone: OfficeSeedDelta | null
    office3MarginalVsOffice2: OfficeSeedDelta | null
  }
}

export type OfficeSeedDelta = {
  left: OfficeArmId
  right: OfficeArmId
  facilityCapex: number
  facilityOpex: number
  studioRevenue: number
  contribution: number
  finalCash: number
  cashDeltaFromCommission: number
  releaseWeek: number
  closedRunWeek: number
}

type PreparedArm = {
  arm: OfficeArmId
  state: GameState
}

type ReadyArm = PreparedArm & {
  state: GameState
  projectId: string
}

type CompletedArm = {
  arm: OfficeArmId
  state: GameState
  productionId: string
  releaseWeek: number
  closedRunWeek: number
}

function excludedArm(arm: OfficeArmId, reason: string): OfficeArmCompact {
  return {
    arm,
    included: false,
    exclusion: reason,
    commissionWeek: null,
    rngMatchedAtCommission: null,
    packageMatched: null,
    productionId: null,
    officeUpliftPoints: null,
    facilityCapex: null,
    facilityOpex: null,
    directCommitment: null,
    studioRevenue: null,
    contribution: null,
    cashAtCommission: null,
    finalCash: null,
    cashDeltaFromCommission: null,
    releaseWeek: null,
    closedRunWeek: null,
  }
}

function excludedCell(seed: string, reason: string): OfficeCellCompact {
  return {
    schemaVersion: OFFICE_SCHEMA_VERSION,
    seed,
    commissionWeek: COMMISSION_WEEK,
    included: false,
    exclusion: reason,
    rngIdenticalAtCommission: false,
    package: null,
    none: excludedArm('none', reason),
    office2: excludedArm('office-2', reason),
    office2Plus3: excludedArm('office-2-plus-3', reason),
    pairedDeltas: { office2VsNone: null, office3MarginalVsOffice2: null },
  }
}

function foundedStudio(seed: string): Outcome<GameState> {
  let state: GameState
  try {
    state = newGame(seed)
  } catch (error) {
    return { ok: false, reason: `new game failed: ${errorMessage(error)}` }
  }
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    if (selected.length !== FOUNDING_COUNTS[role]) {
      return {
        ok: false,
        reason: `founding roster unavailable: seed has ${String(selected.length)}/${String(FOUNDING_COUNTS[role])} ${role} applicants`,
      }
    }
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, FOUNDING_TERM_WEEKS)
      if (!signed.ok) return { ok: false, reason: `founding ${role} ${card.profile.id} rejected: ${signed.error}` }
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) return { ok: false, reason: `founding studio rejected: ${founded.error}` }
  return { ok: true, value: founded.next }
}

function advance(state: GameState, weeks: number): Outcome<GameState> {
  if (!Number.isInteger(weeks) || weeks < 0) {
    return { ok: false, reason: `invalid advance span ${String(weeks)}` }
  }
  let next = state
  try {
    for (let week = 0; week < weeks; week++) next = advanceWeek(next).next
  } catch (error) {
    return { ok: false, reason: `advance failed: ${errorMessage(error)}` }
  }
  return { ok: true, value: next }
}

/** Place one actual blueprint at the first engine-legal buildable origin. */
function buildAnywhere(state: GameState, blueprintId: string): Outcome<GameState> {
  const view = studioPlacement(state)
  for (const parcel of view.parcels) {
    // `expansion` is an historical migration parcel, not a neutral test site.
    if (parcel.terrain !== 'buildable' || parcel.id === 'expansion') continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId, origin: { gx, gy } }
        if (!placementQuote(state, request).ok) continue
        const committed = placeFacilityAction(state, request)
        if (!committed.ok) {
          return { ok: false, reason: `place ${blueprintId} at ${String(gx)},${String(gy)} rejected: ${committed.error}` }
        }
        return { ok: true, value: committed.next }
      }
    }
  }
  return { ok: false, reason: `no legal public placement for ${blueprintId}` }
}

function officePlacement(state: GameState, blueprintId: string): Outcome<{ completesWeek: number }> {
  const placement = studioPlacement(state).placements.find((candidate) => candidate.blueprintId === blueprintId)
  if (placement === undefined) return { ok: false, reason: `${blueprintId} placement missing after accepted public action` }
  return { ok: true, value: { completesWeek: placement.completesWeek } }
}

function prepareArms(seed: string): Outcome<PreparedArm[]> {
  const control = foundedStudio(seed)
  if (!control.ok) return control
  const none = advance(control.value, COMMISSION_WEEK)
  if (!none.ok) return none

  const office2Start = buildAnywhere(control.value, OFFICE_II)
  if (!office2Start.ok) return office2Start
  const office2 = advance(office2Start.value, COMMISSION_WEEK)
  if (!office2.ok) return office2

  const office2ForMarginal = buildAnywhere(control.value, OFFICE_II)
  if (!office2ForMarginal.ok) return office2ForMarginal
  const office2Placement = officePlacement(office2ForMarginal.value, OFFICE_II)
  if (!office2Placement.ok) return office2Placement
  const untilIIIsLegal = advance(
    office2ForMarginal.value,
    office2Placement.value.completesWeek - office2ForMarginal.value.market.tick,
  )
  if (!untilIIIsLegal.ok) return untilIIIsLegal
  const office3Start = buildAnywhere(untilIIIsLegal.value, OFFICE_III)
  if (!office3Start.ok) return office3Start
  const office2Plus3 = advance(office3Start.value, COMMISSION_WEEK - office3Start.value.market.tick)
  if (!office2Plus3.ok) return office2Plus3

  const arms: PreparedArm[] = [
    { arm: 'none', state: none.value },
    { arm: 'office-2', state: office2.value },
    { arm: 'office-2-plus-3', state: office2Plus3.value },
  ]
  for (const arm of arms) {
    if (arm.state.market.tick !== COMMISSION_WEEK) {
      return { ok: false, reason: `${arm.arm} aligned at week ${String(arm.state.market.tick)}, expected ${String(COMMISSION_WEEK)}` }
    }
  }
  return { ok: true, value: arms }
}

function sharedCommissionPayload(state: GameState): Outcome<{ conceptId: string; writerId: string; shape: FilmShape; promise: FilmPromise }> {
  const board = scriptProjectsBoard(state).commission
  const writer = board.writers.find((candidate) => candidate.available && candidate.primaryRole === 'writer')
  const concept = board.concepts[0]
  if (writer === undefined) return { ok: false, reason: 'control arm has no available writer at commission' }
  if (concept === undefined) return { ok: false, reason: 'control arm has no commissionable concept at commission' }
  const shape: FilmShape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' }
  const promise: FilmPromise = {
    genre: concept.genre,
    intendedSegments: ['adult'],
    ranges: {
      intimacy: [-0.65, 0.15],
      tonalWeight: [-0.65, 0.15],
      kineticEnergy: [-0.65, 0.15],
    },
  }
  return { ok: true, value: { conceptId: concept.id, writerId: writer.id, shape, promise } }
}

function commissionAndAccept(arm: PreparedArm, payload: { conceptId: string; writerId: string; shape: FilmShape; promise: FilmPromise }): Outcome<ReadyArm> {
  const commissioned = commissionScriptAction(arm.state, payload)
  if (!commissioned.ok) return { ok: false, reason: `${arm.arm} commission rejected: ${commissioned.error}` }
  const drafted = advance(commissioned.next, 1)
  if (!drafted.ok) return { ok: false, reason: `${arm.arm} draft advance failed: ${drafted.reason}` }
  const project = drafted.value.scriptDevelopment.projects.find(
    (candidate) => candidate.conceptId === payload.conceptId && candidate.writerId === payload.writerId,
  )
  if (project === undefined) return { ok: false, reason: `${arm.arm} commissioned project is missing after draft advance` }
  if (project.assessment === null) return { ok: false, reason: `${arm.arm} commissioned project has no assessment after draft advance` }
  const accepted = runScriptProjectAction(drafted.value, {
    kind: 'acceptScript',
    projectId: project.id,
    label: 'Accept screenplay',
  })
  if (!accepted.ok) return { ok: false, reason: `${arm.arm} accept script rejected: ${accepted.error}` }
  return { ok: true, value: { arm: arm.arm, state: accepted.next, projectId: project.id } }
}

function controlledPackage(ready: ReadyArm): Outcome<SharedPackage> {
  const project = ready.state.scriptDevelopment.projects.find((candidate) => candidate.id === ready.projectId)
  if (project === undefined) return { ok: false, reason: 'control arm ready screenplay is missing' }
  const concept = ready.state.concepts.find((candidate) => candidate.id === project.conceptId)
  const writer = findTalent(ready.state, project.writerId)
  if (concept === undefined) return { ok: false, reason: 'control arm screenplay concept is missing' }
  if (writer === undefined) return { ok: false, reason: 'control arm screenplay writer is missing' }

  const excluded = new Set([project.writerId])
  const picks = (role: CreativeRole): Talent[] =>
    studioPool(ready.state, role)
      .filter((person) => person.available && !excluded.has(person.id))
      .map((person) => findTalent(ready.state, person.id))
      .filter((person): person is Talent => person !== undefined)
  const directors = picks('director')
  const actors = picks('actor')
  const crafts = picks('craft')
  if (directors.length < 1) return { ok: false, reason: 'control arm lacks one available contracted director' }
  if (actors.length < 3) return { ok: false, reason: `control arm lacks three available contracted actors (${String(actors.length)})` }
  if (crafts.length < 1) return { ok: false, reason: 'control arm lacks one available contracted craft lead' }

  const negative =
    NEGATIVE_BUDGET_MULTIPLIERS[0]! *
    concept.baseNegativeCost *
    resolveShape(project.shape).budgetDemandMultiplier *
    ready.state.era.costScale
  const inputs: ReceptionInputs = {
    concept,
    shape: project.shape,
    shapeEffects: resolveShape(project.shape),
    promise: project.promise,
    budget: { negative, marketing: 0 },
    writer,
    director: directors[0]!,
    cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
    craftHires: [crafts[0]!],
    market: ready.state.market,
    standing: ready.state.studio.standing,
    era: ready.state.era,
    scriptStrengthOverride: {
      perceived: readyScriptPerceivedStrength(ready.state.scriptDevelopment, ready.projectId),
    },
  }
  const marketing = marketingLevelsFor(ready.state, inputs)[0]
  if (marketing === undefined) return { ok: false, reason: 'control arm has no public marketing level for the controlled package' }
  return {
    ok: true,
    value: {
      conceptId: concept.id,
      writerId: project.writerId,
      directorId: directors[0]!.id,
      cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
      craftIds: [crafts[0]!.id],
      shape: project.shape,
      promise: project.promise,
      negative,
      marketing,
    },
  }
}

function samePackageArm(state: GameState, projectId: string, pkg: SharedPackage): string | null {
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)
  if (project === undefined) return 'ready screenplay missing before controlled greenlight'
  if (project.conceptId !== pkg.conceptId) return `concept differs (${project.conceptId} !== ${pkg.conceptId})`
  if (project.writerId !== pkg.writerId) return `writer differs (${project.writerId} !== ${pkg.writerId})`
  if (JSON.stringify(project.shape) !== JSON.stringify(pkg.shape)) return 'screenplay shape differs'
  if (JSON.stringify(project.promise) !== JSON.stringify(pkg.promise)) return 'screenplay promise differs'
  for (const id of [pkg.directorId, pkg.cast.lead, pkg.cast.antagonist, pkg.cast.support, ...pkg.craftIds]) {
    const candidate = studioPool(state, findTalent(state, id)?.role ?? 'actor').find((person) => person.id === id)
    if (candidate === undefined || !candidate.available) return `controlled talent ${id} is unavailable`
  }
  return null
}

function greenlightAndClose(ready: ReadyArm, pkg: SharedPackage): Outcome<CompletedArm> {
  const mismatch = samePackageArm(ready.state, ready.projectId, pkg)
  if (mismatch !== null) return { ok: false, reason: `${ready.arm} cannot use controlled package: ${mismatch}` }
  const greenlit = greenlightScriptProject(ready.state, ready.projectId, {
    conceptId: pkg.conceptId,
    shape: pkg.shape,
    promise: pkg.promise,
    writerId: pkg.writerId,
    directorId: pkg.directorId,
    cast: pkg.cast,
    craftIds: pkg.craftIds,
    budget: { negative: pkg.negative, marketing: pkg.marketing },
  })
  if (!greenlit.ok) return { ok: false, reason: `${ready.arm} controlled greenlight rejected: ${greenlit.error}` }
  const production = greenlit.next.studio.activeProductions.find(
    (candidate) => candidate.writerId === pkg.writerId && candidate.conceptId === pkg.conceptId,
  )
  if (production === undefined) return { ok: false, reason: `${ready.arm} greenlight did not create the controlled production` }
  return runPictureToCompletedRun(ready.arm, greenlit.next, production.id)
}

function runPictureToCompletedRun(arm: OfficeArmId, state: GameState, productionId: string): Outcome<CompletedArm> {
  let next = state
  let guard = 0
  const releasedBefore = next.studio.releasedFilms.length
  while (next.studio.releasedFilms.length === releasedBefore) {
    if (++guard > 120) return { ok: false, reason: `${arm} production did not release within 120 weekly advances` }
    const decision = productionDecision(next)
    if (decision !== null && decision.command !== null) {
      const answered = runProductionCommand(next, decision.command)
      if (!answered.ok) return { ok: false, reason: `${arm} production command rejected: ${answered.error}` }
      next = answered.next
    } else {
      const advanced = advance(next, 1)
      if (!advanced.ok) return { ok: false, reason: `${arm} release advance failed: ${advanced.reason}` }
      next = advanced.value
    }
  }
  const film = next.studio.releasedFilms.find((candidate) => candidate.productionId === productionId)
  if (film === undefined) return { ok: false, reason: `${arm} released a different production before the controlled production` }
  guard = 0
  while (next.theatricalRuns.some((run) => run.productionId === productionId && run.status === 'active')) {
    if (++guard > 120) return { ok: false, reason: `${arm} theatrical run did not close within 120 weekly advances` }
    const advanced = advance(next, 1)
    if (!advanced.ok) return { ok: false, reason: `${arm} theatrical advance failed: ${advanced.reason}` }
    next = advanced.value
  }
  return {
    ok: true,
    value: {
      arm,
      state: next,
      productionId,
      releaseWeek: film.releaseTick,
      closedRunWeek: next.market.tick,
    },
  }
}

function spentByKind(state: GameState, kind: 'constructionCapex' | 'facilityOpex'): number {
  return state.ledger
    .filter((entry) => entry.kind === kind && entry.amount < 0)
    .reduce((total, entry) => total - entry.amount, 0)
}

function compactArm(
  arm: OfficeArmId,
  prepared: PreparedArm,
  completed: CompletedArm,
  packageMatched: boolean,
  rngMatchedAtCommission: boolean,
  pkg: SharedPackage,
): Outcome<OfficeArmCompact> {
  const revenue = studioRevenueForFilm(completed.state, completed.productionId)
  if (revenue === null) return { ok: false, reason: `${arm} completed production has no theatrical Studio Revenue record` }
  const uplift = developmentOfficeUplift(prepared.state)
  const facilityCapex = spentByKind(completed.state, 'constructionCapex')
  const facilityOpex = spentByKind(completed.state, 'facilityOpex')
  const directCommitment = pkg.negative + pkg.marketing
  return {
    ok: true,
    value: {
      arm,
      included: true,
      exclusion: null,
      commissionWeek: prepared.state.market.tick,
      rngMatchedAtCommission,
      packageMatched,
      productionId: completed.productionId,
      officeUpliftPoints: uplift?.points ?? 0,
      facilityCapex,
      facilityOpex,
      directCommitment,
      studioRevenue: revenue,
      contribution: revenue - directCommitment,
      cashAtCommission: prepared.state.studio.cash,
      finalCash: completed.state.studio.cash,
      cashDeltaFromCommission: completed.state.studio.cash - prepared.state.studio.cash,
      releaseWeek: completed.releaseWeek,
      closedRunWeek: completed.closedRunWeek,
    },
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function seedDelta(left: OfficeArmCompact, right: OfficeArmCompact): OfficeSeedDelta | null {
  const values = [
    left.facilityCapex,
    left.facilityOpex,
    left.studioRevenue,
    left.contribution,
    left.finalCash,
    left.cashDeltaFromCommission,
    left.releaseWeek,
    left.closedRunWeek,
    right.facilityCapex,
    right.facilityOpex,
    right.studioRevenue,
    right.contribution,
    right.finalCash,
    right.cashDeltaFromCommission,
    right.releaseWeek,
    right.closedRunWeek,
  ]
  if (values.some((value) => value === null)) return null
  return {
    left: left.arm,
    right: right.arm,
    facilityCapex: left.facilityCapex! - right.facilityCapex!,
    facilityOpex: left.facilityOpex! - right.facilityOpex!,
    studioRevenue: left.studioRevenue! - right.studioRevenue!,
    contribution: left.contribution! - right.contribution!,
    finalCash: left.finalCash! - right.finalCash!,
    cashDeltaFromCommission: left.cashDeltaFromCommission! - right.cashDeltaFromCommission!,
    releaseWeek: left.releaseWeek! - right.releaseWeek!,
    closedRunWeek: left.closedRunWeek! - right.closedRunWeek!,
  }
}

/**
 * Run one seed-major public-action Office experiment.
 *
 * A failed controllability condition becomes one explicitly excluded cell. It does not
 * poison the other 99 seeds and it cannot accidentally enter paired statistics.
 */
export function runOfficeCell(seed: string): OfficeCellCompact {
  try {
    const prepared = prepareArms(seed)
    if (!prepared.ok) return excludedCell(seed, prepared.reason)
    const [none, office2, office2Plus3] = prepared.value
    if (none === undefined || office2 === undefined || office2Plus3 === undefined) {
      return excludedCell(seed, 'internal arm construction failure')
    }

    const rngIdenticalAtCommission = prepared.value.every(
      (arm) => arm.state.rngState === none.state.rngState,
    )
    if (!rngIdenticalAtCommission) {
      return excludedCell(seed, 'rngState differs across public-action arms at the aligned commission week')
    }
    const payload = sharedCommissionPayload(none.state)
    if (!payload.ok) return excludedCell(seed, payload.reason)

    const readyNone = commissionAndAccept(none, payload.value)
    const readyOffice2 = commissionAndAccept(office2, payload.value)
    const readyOffice2Plus3 = commissionAndAccept(office2Plus3, payload.value)
    for (const ready of [readyNone, readyOffice2, readyOffice2Plus3]) {
      if (!ready.ok) return excludedCell(seed, ready.reason)
    }
    if (!readyNone.ok || !readyOffice2.ok || !readyOffice2Plus3.ok) {
      return excludedCell(seed, 'internal screenplay preparation failure')
    }

    const pkg = controlledPackage(readyNone.value)
    if (!pkg.ok) return excludedCell(seed, pkg.reason)
    const completedNone = greenlightAndClose(readyNone.value, pkg.value)
    const completedOffice2 = greenlightAndClose(readyOffice2.value, pkg.value)
    const completedOffice2Plus3 = greenlightAndClose(readyOffice2Plus3.value, pkg.value)
    for (const completed of [completedNone, completedOffice2, completedOffice2Plus3]) {
      if (!completed.ok) return excludedCell(seed, completed.reason)
    }
    if (!completedNone.ok || !completedOffice2.ok || !completedOffice2Plus3.ok) {
      return excludedCell(seed, 'internal production completion failure')
    }

    const compactNone = compactArm('none', none, completedNone.value, true, true, pkg.value)
    const compactOffice2 = compactArm('office-2', office2, completedOffice2.value, true, true, pkg.value)
    const compactOffice2Plus3 = compactArm(
      'office-2-plus-3',
      office2Plus3,
      completedOffice2Plus3.value,
      true,
      true,
      pkg.value,
    )
    for (const compact of [compactNone, compactOffice2, compactOffice2Plus3]) {
      if (!compact.ok) return excludedCell(seed, compact.reason)
    }
    if (!compactNone.ok || !compactOffice2.ok || !compactOffice2Plus3.ok) {
      return excludedCell(seed, 'internal compact-result failure')
    }
    return {
      schemaVersion: OFFICE_SCHEMA_VERSION,
      seed,
      commissionWeek: COMMISSION_WEEK,
      included: true,
      exclusion: null,
      rngIdenticalAtCommission,
      package: pkg.value,
      none: compactNone.value,
      office2: compactOffice2.value,
      office2Plus3: compactOffice2Plus3.value,
      pairedDeltas: {
        office2VsNone: seedDelta(compactOffice2.value, compactNone.value),
        office3MarginalVsOffice2: seedDelta(compactOffice2Plus3.value, compactOffice2.value),
      },
    }
  } catch (error) {
    return excludedCell(seed, `unexpected public-action experiment failure: ${errorMessage(error)}`)
  }
}

type IncludedOfficeCell = OfficeCellCompact & {
  included: true
  package: SharedPackage
  none: OfficeArmCompact & { included: true }
  office2: OfficeArmCompact & { included: true }
  office2Plus3: OfficeArmCompact & { included: true }
}

function isIncluded(cell: OfficeCellCompact): cell is IncludedOfficeCell {
  return cell.included && cell.package !== null && cell.none.included && cell.office2.included && cell.office2Plus3.included
}

function column(
  cells: readonly IncludedOfficeCell[],
  select: (arm: OfficeArmCompact) => number | null,
  arm: 'none' | 'office2' | 'office2Plus3',
): Map<string, number> {
  const values = new Map<string, number>()
  for (const cell of cells) {
    const value = select(cell[arm])
    if (value === null) continue
    values.set(cell.seed, value)
  }
  return values
}

function comparison(
  cells: readonly IncludedOfficeCell[],
  left: 'office2' | 'office2Plus3',
  right: 'none' | 'office2',
  leftName: string,
  rightName: string,
): OfficeComparisonAggregate {
  const effect = (select: (arm: OfficeArmCompact) => number | null): PairedEffect =>
    pairedEffect(leftName, rightName, column(cells, select, left), column(cells, select, right))
  const releaseTiming = cells.filter(
    (cell) => cell[left].releaseWeek !== null && cell[right].releaseWeek !== null,
  )
  const closedRunTiming = cells.filter(
    (cell) => cell[left].closedRunWeek !== null && cell[right].closedRunWeek !== null,
  )
  return {
    interpretation: left === 'office2'
      ? 'actual Office II purchase versus no office; paired seed delta is Office II minus no office'
      : 'actual marginal Office III purchase on top of Office II; paired seed delta is Office II+III minus Office II',
    comparableSeeds: cells.length,
    facilityCapex: effect((arm) => arm.facilityCapex),
    facilityOpex: effect((arm) => arm.facilityOpex),
    studioRevenue: effect((arm) => arm.studioRevenue),
    contribution: effect((arm) => arm.contribution),
    finalCash: effect((arm) => arm.finalCash),
    cashDeltaFromCommission: effect((arm) => arm.cashDeltaFromCommission),
    releaseWeek: effect((arm) => arm.releaseWeek),
    closedRunWeek: effect((arm) => arm.closedRunWeek),
    sameReleaseWeek: rate(
      releaseTiming.filter((cell) => cell[left].releaseWeek === cell[right].releaseWeek).length,
      releaseTiming.length,
    ),
    sameClosedRunWeek: rate(
      closedRunTiming.filter((cell) => cell[left].closedRunWeek === cell[right].closedRunWeek).length,
      closedRunTiming.length,
    ),
    exemplars: {
      studioRevenue: pairedDeltaExemplars(cells, left, right, (arm) => arm.studioRevenue),
      finalCash: pairedDeltaExemplars(cells, left, right, (arm) => arm.finalCash),
      cashDeltaFromCommission: pairedDeltaExemplars(cells, left, right, (arm) => arm.cashDeltaFromCommission),
    },
  }
}

export type OfficePairedDeltaExemplar = {
  /** Lexically first seed wins an exact-delta tie, making report examples stable. */
  seed: string
  left: number
  right: number
  delta: number
}

export type OfficePairedDeltaExemplars = {
  min: OfficePairedDeltaExemplar | null
  max: OfficePairedDeltaExemplar | null
}

function pairedDeltaExemplars(
  cells: readonly IncludedOfficeCell[],
  left: 'office2' | 'office2Plus3',
  right: 'none' | 'office2',
  select: (arm: OfficeArmCompact) => number | null,
): OfficePairedDeltaExemplars {
  const rows = cells.flatMap((cell) => {
    const leftValue = select(cell[left])
    const rightValue = select(cell[right])
    return leftValue === null || rightValue === null
      ? []
      : [{ seed: cell.seed, left: leftValue, right: rightValue, delta: leftValue - rightValue }]
  })
  if (rows.length === 0) return { min: null, max: null }
  const ordered = [...rows].sort((a, b) => a.delta - b.delta || a.seed.localeCompare(b.seed))
  return { min: ordered[0]!, max: ordered[ordered.length - 1]! }
}

export type OfficeComparisonAggregate = {
  interpretation: string
  comparableSeeds: number
  facilityCapex: PairedEffect
  facilityOpex: PairedEffect
  studioRevenue: PairedEffect
  contribution: PairedEffect
  finalCash: PairedEffect
  cashDeltaFromCommission: PairedEffect
  releaseWeek: PairedEffect
  closedRunWeek: PairedEffect
  sameReleaseWeek: RateEstimate
  sameClosedRunWeek: RateEstimate
  /** Exact reproducible seed examples for report claims; no sample is silently selected. */
  exemplars: {
    studioRevenue: OfficePairedDeltaExemplars
    finalCash: OfficePairedDeltaExemplars
    cashDeltaFromCommission: OfficePairedDeltaExemplars
  }
}

export type OfficeAggregate = {
  schemaVersion: typeof OFFICE_SCHEMA_VERSION
  experiment: {
    identity: 'ETA-OFFICES-100x3-v1'
    evidenceClass: 'controlled public-action Office II / marginal Office III causal A/B'
    requestedSeedCount: number
    commissionWeek: number
    officeIIIInterpretation: 'marginal Office III effect equals Office II+III minus Office II'
  }
  validation: {
    submittedCells: number
    uniqueSeeds: number
    includedCells: number
    excludedCells: number
    exclusions: Array<{ seed: string; reason: string }>
    duplicateSeeds: string[]
  }
  arms: {
    none: OfficeArmSummary
    office2: OfficeArmSummary
    office2Plus3: OfficeArmSummary
  }
  effects: {
    office2VsNone: OfficeComparisonAggregate
    office3MarginalVsOffice2: OfficeComparisonAggregate
  }
}

export type OfficeArmSummary = {
  facilityCapex: Distribution
  facilityOpex: Distribution
  directCommitment: Distribution
  studioRevenue: Distribution
  contribution: Distribution
  cashAtCommission: Distribution
  finalCash: Distribution
  cashDeltaFromCommission: Distribution
  releaseWeek: Distribution
  closedRunWeek: Distribution
  officeUpliftPoints: Distribution
}

function summarizeArm(cells: readonly IncludedOfficeCell[], arm: 'none' | 'office2' | 'office2Plus3'): OfficeArmSummary {
  const rows = cells.map((cell) => cell[arm])
  const values = (select: (row: OfficeArmCompact) => number | null): number[] =>
    rows.flatMap((row) => {
      const value = select(row)
      return value === null ? [] : [value]
    })
  return {
    facilityCapex: distribution(values((row) => row.facilityCapex)),
    facilityOpex: distribution(values((row) => row.facilityOpex)),
    directCommitment: distribution(values((row) => row.directCommitment)),
    studioRevenue: distribution(values((row) => row.studioRevenue)),
    contribution: distribution(values((row) => row.contribution)),
    cashAtCommission: distribution(values((row) => row.cashAtCommission)),
    finalCash: distribution(values((row) => row.finalCash)),
    cashDeltaFromCommission: distribution(values((row) => row.cashDeltaFromCommission)),
    releaseWeek: distribution(values((row) => row.releaseWeek)),
    closedRunWeek: distribution(values((row) => row.closedRunWeek)),
    officeUpliftPoints: distribution(values((row) => row.officeUpliftPoints)),
  }
}

/** Aggregate cells without concealing exclusions or pairing uncomparable seeds. */
export function aggregateOffices(cells: readonly OfficeCellCompact[]): OfficeAggregate {
  const counts = new Map<string, number>()
  for (const cell of cells) counts.set(cell.seed, (counts.get(cell.seed) ?? 0) + 1)
  const duplicateSeeds = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([seed]) => seed)
    .sort()
  const included = cells.filter(isIncluded)
  const exclusions = cells
    .filter((cell) => !cell.included)
    .map((cell) => ({ seed: cell.seed, reason: cell.exclusion ?? 'excluded without a stated reason' }))
    .sort((left, right) => left.seed.localeCompare(right.seed))
  return {
    schemaVersion: OFFICE_SCHEMA_VERSION,
    experiment: {
      identity: 'ETA-OFFICES-100x3-v1',
      evidenceClass: 'controlled public-action Office II / marginal Office III causal A/B',
      requestedSeedCount: OFFICE_SEED_COUNT,
      commissionWeek: COMMISSION_WEEK,
      officeIIIInterpretation: 'marginal Office III effect equals Office II+III minus Office II',
    },
    validation: {
      submittedCells: cells.length,
      uniqueSeeds: counts.size,
      includedCells: included.length,
      excludedCells: exclusions.length,
      exclusions,
      duplicateSeeds,
    },
    arms: {
      none: summarizeArm(included, 'none'),
      office2: summarizeArm(included, 'office2'),
      office2Plus3: summarizeArm(included, 'office2Plus3'),
    },
    effects: {
      office2VsNone: comparison(included, 'office2', 'none', 'office-2', 'none'),
      office3MarginalVsOffice2: comparison(included, 'office2Plus3', 'office2', 'office-2-plus-3', 'office-2'),
    },
  }
}
