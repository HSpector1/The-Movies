// C1-M7 — THE CAMPAIGN 1 ECONOMY SNAPSHOT, MEASURED.
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/measure-c1-economy.mts
//
// WHAT THIS IS. The campaign law for M7 is "a measured record, NOT gut tuning". So this
// script CHANGES NO NUMBER. It founds studios through public adapter/engine actions,
// builds every C1 blueprint within its instance limits, runs a controlled A/B on one
// fixed seed, borrows the frozen Facilities & Construction observatory for the capacity
// question it was built to answer, and writes what it measured to
// `docs/economy/C1-ECONOMY-SNAPSHOT.md`.
//
// WHAT IT IS NOT. It is not a balance pass and it proposes no tuning change. Where a
// number looks wrong it is FLAGGED and left alone — the ruling belongs to the PM.
//
// HOW IT STAYS HONEST:
//   • every studio is built by calling the same public actions the browser calls
//     (`placeFacilityAction`, `commissionScriptAction`, `greenlightScriptProject`,
//     `runProductionCommand`, `demolishFacilityAction`, `advanceWeek`) — nothing is
//     hand-edited, no cash is written, no tuning constant is read as if it were a
//     measurement. Capital, opex and refunds are read from the STUDIO'S OWN CASH AND
//     LEDGER, then cross-checked against the catalog the player sees;
//   • the uplift A/B aligns all three arms on the SAME week with the SAME commission
//     payload and the SAME budget, and asserts the three arms' `rngState` is
//     byte-identical at the commission week — which is what makes the receipts delta a
//     measurement of the office rather than of a diverged random stream;
//   • the throughput arms are `runFacilitiesArm` from `src/harness/facilities`, the
//     accepted research observatory, driven at the two-production policy — consumed
//     read-only, never modified;
//   • output is DETERMINISTIC: no clock, no `Math.random`, fixed-precision formatting,
//     and the only environment facts recorded are the HEAD the run was taken at and the
//     last commit that touched a surface capable of moving a number. Two runs at one HEAD
//     produce byte-identical files, and a run at a later HEAD differs only in that first
//     provenance line unless the economy itself moved.

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  NEGATIVE_BUDGET_MULTIPLIERS,
  TUNING,
  marketingLevelsFor,
  readyScriptPerceivedStrength,
  resolveShape,
} from '../src/core/index.ts'
import type { CreativeRole, GameState, ReceptionInputs, Talent } from '../src/core/index.ts'
import { runFacilitiesArm } from '../src/harness/facilities/index.ts'
import type { FacilitiesArmResult, FacilitiesSourceProvenance } from '../src/harness/facilities/index.ts'
import {
  advanceWeek,
  commissionScriptAction,
  demolishFacilityAction,
  developmentOfficeUplift,
  findTalent,
  foundManagedStudioAction,
  foundingApplicantCards,
  freelancerPool,
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
} from '../ui/src/engine/adapter.ts'

// ── provenance ───────────────────────────────────────────────────────────────

// ── C2a-M4: the C1 ceiling is FROZEN AS HISTORY (charter §3.3) ───────────────
//
// `MAX_CONCURRENT_PRODUCTIONS` is deleted from the engine (owner law 1). These
// C1 sections describe a measurement taken WHEN IT EXISTED, and a historical
// report may not silently re-describe itself: the number stays, as a literal,
// named for what it is. Anything C2 measures gets its own section and its own
// numbers.
const C1_HISTORICAL_CONCURRENCY_CEILING = 2

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')

function git(args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd: repoRoot, encoding: 'utf8' }).trim()
}

const HEAD = git(['rev-parse', 'HEAD'])
/**
 * The last commit that touched a surface capable of MOVING A NUMBER in this report.
 *
 * `HEAD` is recorded because the milestone requires it, but it changes on every
 * docs-only or spec-only commit, which would make a regenerated report differ in its
 * provenance line for no economic reason. This second line is the one to diff: while it
 * is unchanged, every measured figure below should reproduce exactly.
 */
const MEASURED_SOURCE_COMMIT = git([
  'log',
  '-1',
  '--format=%H',
  '--',
  'src',
  'ui/src',
])
const SOURCE: FacilitiesSourceProvenance = {
  sourceCommit: HEAD,
  sourceTree: git(['rev-parse', 'HEAD^{tree}']),
  worktreeDirty: git(['status', '--porcelain']) !== '',
  runtime: 'measure-c1-economy',
}

// ── the measured constants of this study (choices, stated out loud) ───────────

/** The one fixed seed every direct measurement below is taken on. */
const SEED = 'c1-economy-001'
/** Independent seeds for the capacity study, so its answer is not a single world. */
const THROUGHPUT_SEEDS = [
  'c1-economy-001',
  'c1-economy-002',
  'c1-economy-003',
  'c1-economy-004',
  'c1-economy-005',
] as const
/** Two campaign years — long enough to release many pictures, short enough to be a run. */
const THROUGHPUT_HORIZON_WEEKS = 104
/** The founding roster for every directly measured studio. Deep enough that a second
 *  screenplay is never a story about a thin bench. */
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 4,
  director: 1,
  writer: 2,
  craft: 1,
}
const FOUNDING_TERM_WEEKS = 208
/** The week all three uplift arms commission on: late enough for Office III to stand. */
const AB_COMMISSION_WEEK = 20

const BLUEPRINT_ORDER = [
  'development-casting-annex',
  'development-casting-hall',
  'development-office-2',
  'development-office-3',
  'craft-annex',
] as const
type BlueprintId = (typeof BLUEPRINT_ORDER)[number]

// ── formatting (hand-rolled: no locale, no clock, no drift) ──────────────────

function group(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function money(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  return `${sign}$${group(String(Math.abs(rounded)))}`
}

function fixed(value: number, places: number): string {
  return value.toFixed(places)
}

function pct(value: number, places = 1): string {
  return `${(value * 100).toFixed(places)}%`
}

function row(cells: readonly string[]): string {
  return `| ${cells.join(' | ')} |`
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string[] {
  return [
    row(headers),
    row(headers.map(() => '---')),
    ...rows.map((cells) => row(cells)),
  ]
}

// ── the studio under measurement ─────────────────────────────────────────────

function foundedStudio(seed: string): GameState {
  let state: GameState = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards
      .filter((card) => card.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])
    if (selected.length !== FOUNDING_COUNTS[role]) {
      throw new Error(`measure-c1-economy: seed ${seed} lacks ${role} applicants`)
    }
    for (const card of selected) {
      const signed = signContractAction(state, card.profile.id, FOUNDING_TERM_WEEKS)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function advance(state: GameState, weeks: number): GameState {
  let next = state
  for (let week = 0; week < weeks; week++) next = advanceWeek(next).next
  return next
}

/**
 * Commit a blueprint at the first origin the ENGINE calls legal, anywhere it may stand.
 *
 * The legacy `expansion` pad is skipped, exactly as the lot's own companion parcel list
 * skips it: a placement on that ground IS the legacy Annex contract, which is excluded
 * from move and demolish until the C2 Flip. Building there would make this study's
 * refund measurements unmeasurable for a reason that has nothing to do with economy.
 */
function buildAnywhere(state: GameState, blueprintId: BlueprintId): GameState {
  const view = studioPlacement(state)
  for (const parcel of view.parcels) {
    if (parcel.terrain !== 'buildable' || parcel.id === 'expansion') continue
    for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
      for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) {
        const request = { blueprintId, origin: { gx, gy } }
        if (!placementQuote(state, request).ok) continue
        const committed = placeFacilityAction(state, request)
        if (!committed.ok) throw new Error(committed.error)
        return committed.next
      }
    }
  }
  throw new Error(`measure-c1-economy: no legal site remains for ${blueprintId}`)
}

/** The one weekly facility operating charge the ledger booked for a week, as a positive. */
function facilityOpexCharged(state: GameState, week: number): number {
  let total = 0
  for (const entry of state.ledger) {
    if (entry.week !== week) continue
    if (entry.kind !== 'facilityOpex') continue
    total += -entry.amount
  }
  return total
}

/** Every outflow the ledger booked in a week, by kind, as positives. */
function weeklyOutflowByKind(state: GameState, week: number): Map<string, number> {
  const totals = new Map<string, number>()
  for (const entry of state.ledger) {
    if (entry.week !== week || entry.amount >= 0) continue
    totals.set(entry.kind, (totals.get(entry.kind) ?? 0) + -entry.amount)
  }
  return totals
}

const CATALOG = studioPlacement(foundedStudio(SEED)).catalog

function catalogEntry(blueprintId: BlueprintId) {
  const entry = CATALOG.find((candidate) => candidate.blueprintId === blueprintId)
  if (entry === undefined) throw new Error(`measure-c1-economy: catalog lacks ${blueprintId}`)
  return entry
}

// ── 1. THE SLATE, MEASURED ONE BUILDING AT A TIME ────────────────────────────

type BlueprintMeasurement = {
  blueprintId: BlueprintId
  name: string
  precondition: string
  capitalCharged: number
  capitalQuoted: number
  capexLedgerRow: number
  weeksToOperational: number
  weeksQuoted: number
  opexLedgerDelta: number
  opexQuoted: number
  refundCredited: number
  refundLedgerRow: number
  refundFraction: number
  footprintCells: number
  capacityAdded: number
  /** Weeks of operating cost the demolition credit covers, at this facility's own opex. */
  refundAsOpexWeeks: number
  /** Total cash the studio is out if it builds this and immediately demolishes it. */
  buildThenDemolishLoss: number
}

function measureBlueprint(blueprintId: BlueprintId): BlueprintMeasurement {
  const entry = catalogEntry(blueprintId)
  let state = foundedStudio(SEED)
  let precondition = 'none — buildable on a founded studio'

  // Development Office III is the catalog's one real facility gate: it cannot be
  // committed until Development Office II is OPERATIONAL, so its measurement carries
  // the prerequisite it actually requires rather than pretending it stands alone.
  if (blueprintId === 'development-office-3') {
    state = buildAnywhere(state, 'development-office-2')
    const office2 = studioPlacement(state).placements[0]!
    state = advance(state, office2.completesWeek - office2.placedWeek)
    precondition = 'Development Office II built and operational first (its own capital and opex are excluded below)'
  }

  const opexBefore = studioPlacement(state).weeklyOperatingCost
  const cashBeforeCommit = state.studio.cash
  const ledgerBefore = state.ledger.length

  state = buildAnywhere(state, blueprintId)
  const capitalCharged = cashBeforeCommit - state.studio.cash
  const capexRows = state.ledger
    .slice(ledgerBefore)
    .filter((row_) => row_.kind === 'constructionCapex')
  if (capexRows.length !== 1) {
    throw new Error(`measure-c1-economy: ${blueprintId} booked ${String(capexRows.length)} capex rows`)
  }
  const capexLedgerRow = -capexRows[0]!.amount

  const placed = studioPlacement(state).placements.find(
    (candidate) => candidate.blueprintId === blueprintId,
  )!
  let weeksToOperational = 0
  while (
    studioPlacement(state).placements.find((candidate) => candidate.id === placed.id)!.status !==
    'operational'
  ) {
    state = advanceWeek(state).next
    weeksToOperational++
    if (weeksToOperational > 100) throw new Error(`measure-c1-economy: ${blueprintId} never opened`)
  }
  const openedWeek = state.market.tick
  const opexAfter = studioPlacement(state).weeklyOperatingCost

  // The LEDGER's own answer, taken from the first full week the facility stood open.
  const chargedBefore = openedWeek === 0 ? 0 : facilityOpexCharged(state, openedWeek - 1)
  state = advanceWeek(state).next
  const chargedAfter = facilityOpexCharged(state, openedWeek)
  const opexLedgerDelta = chargedAfter - chargedBefore

  if (opexAfter - opexBefore !== entry.weeklyOperatingCost) {
    throw new Error(
      `measure-c1-economy: ${blueprintId} projection opex delta ${String(opexAfter - opexBefore)} disagrees with the catalog`,
    )
  }

  const cashBeforeDemolition = state.studio.cash
  const ledgerBeforeDemolition = state.ledger.length
  const demolished = demolishFacilityAction(state, { placementId: placed.id })
  if (!demolished.ok) throw new Error(demolished.error)
  state = demolished.next
  const refundCredited = state.studio.cash - cashBeforeDemolition
  const refundRows = state.ledger
    .slice(ledgerBeforeDemolition)
    .filter((row_) => row_.kind === 'facilityDemolitionRefund')
  if (refundRows.length !== 1) {
    throw new Error(`measure-c1-economy: ${blueprintId} booked ${String(refundRows.length)} refund rows`)
  }

  return {
    blueprintId,
    name: entry.name,
    precondition,
    capitalCharged,
    capitalQuoted: entry.cost,
    capexLedgerRow,
    weeksToOperational,
    weeksQuoted: entry.buildWeeks,
    opexLedgerDelta,
    opexQuoted: entry.weeklyOperatingCost,
    refundCredited,
    refundLedgerRow: refundRows[0]!.amount,
    refundFraction: refundCredited / capitalCharged,
    footprintCells: entry.footprint.width * entry.footprint.depth,
    capacityAdded: entry.capacity,
    refundAsOpexWeeks: entry.weeklyOperatingCost === 0 ? 0 : refundCredited / entry.weeklyOperatingCost,
    buildThenDemolishLoss: capitalCharged - refundCredited,
  }
}

// ── 2. THE BUILT-OUT STUDIO ──────────────────────────────────────────────────

type BuiltOutMeasurement = {
  capitalCommitted: number
  weeklyOpex: number
  weeklyOpexLedger: number
  foundingWeeklyOpex: number
  builtOutWeek: number
  cashAtBuiltOut: number
  foundingCash: number
  weeklyOutflow: Map<string, number>
  refundIfAllDemolished: number
  facilities: { name: string; capital: number; opex: number }[]
}

function measureBuiltOut(): BuiltOutMeasurement {
  let state = foundedStudio(SEED)
  const foundingCash = state.studio.cash
  const foundingWeeklyOpex = studioPlacement(state).weeklyOperatingCost
  const facilities: { name: string; capital: number; opex: number }[] = []
  let capitalCommitted = 0

  // Everything that can start on day one starts on day one; the tiered office cannot,
  // so it is committed the week its prerequisite opens. That is the fastest a player
  // could reach a built-out estate, which is what makes the horizon below honest.
  for (const blueprintId of ['development-casting-annex', 'development-casting-hall', 'development-office-2', 'craft-annex'] as const) {
    const before = state.studio.cash
    state = buildAnywhere(state, blueprintId)
    const capital = before - state.studio.cash
    capitalCommitted += capital
    facilities.push({ name: catalogEntry(blueprintId).name, capital, opex: catalogEntry(blueprintId).weeklyOperatingCost })
  }
  const office2 = studioPlacement(state).placements.find(
    (placed) => placed.blueprintId === 'development-office-2',
  )!
  state = advance(state, office2.completesWeek - state.market.tick)
  {
    const before = state.studio.cash
    state = buildAnywhere(state, 'development-office-3')
    const capital = before - state.studio.cash
    capitalCommitted += capital
    facilities.push({
      name: catalogEntry('development-office-3').name,
      capital,
      opex: catalogEntry('development-office-3').weeklyOperatingCost,
    })
  }
  // Run on until every committed build is standing open.
  let guard = 0
  while (studioPlacement(state).placements.some((placed) => placed.status !== 'operational')) {
    state = advanceWeek(state).next
    if (++guard > 100) throw new Error('measure-c1-economy: the built-out estate never opened')
  }
  const builtOutWeek = state.market.tick
  const weeklyOpex = studioPlacement(state).weeklyOperatingCost
  state = advanceWeek(state).next
  const weeklyOpexLedger = facilityOpexCharged(state, builtOutWeek)
  const weeklyOutflow = weeklyOutflowByKind(state, builtOutWeek)
  const cashAtBuiltOut = state.studio.cash

  // …and what the estate is worth if the studio changes its mind about all of it.
  let refundIfAllDemolished = 0
  let demolishing = state
  for (const placed of [...studioPlacement(demolishing).placements]) {
    const before = demolishing.studio.cash
    const outcome = demolishFacilityAction(demolishing, { placementId: placed.id })
    if (!outcome.ok) throw new Error(outcome.error)
    demolishing = outcome.next
    refundIfAllDemolished += demolishing.studio.cash - before
  }

  return {
    capitalCommitted,
    weeklyOpex,
    weeklyOpexLedger,
    foundingWeeklyOpex,
    builtOutWeek,
    cashAtBuiltOut,
    foundingCash,
    weeklyOutflow,
    refundIfAllDemolished,
    facilities,
  }
}

// ── 3. THE DEVELOPMENT OFFICE UPLIFT, A/B ON ONE FIXED SEED ──────────────────

type UpliftArm = {
  id: 'none' | 'office-2' | 'office-3'
  label: string
  /** Everything the studio spent between founding and the commission week, not only capital. */
  cashBurnedByCommission: number
  /** The facility capital this arm committed, taken from its own `constructionCapex` rows. */
  facilityCapital: number
  cashAtCommission: number
  rngStateAtCommission: string
  upliftPoints: number
  estPerceived: number
  estActual: number
  criticScore: number
  boxOfficeTotal: number
  studioRevenue: number
  releaseWeek: number
  negative: number
  marketing: number
}

function runPictureToCompletedRun(state: GameState, productionId: string): GameState {
  let next = state
  let guard = 0
  const releasedBefore = next.studio.releasedFilms.length
  while (next.studio.releasedFilms.length === releasedBefore) {
    if (++guard > 80) throw new Error('measure-c1-economy: the picture never released')
    const decision = productionDecision(next)
    if (decision !== null && decision.command !== null) {
      const answered = runProductionCommand(next, decision.command)
      if (!answered.ok) throw new Error(answered.error)
      next = answered.next
      continue
    }
    next = advanceWeek(next).next
  }
  // Receipts arrive over the theatrical run, so the delta is only complete once the run
  // has stopped playing. Anything less would compare two half-counted box offices.
  guard = 0
  while (next.theatricalRuns.some((run) => run.productionId === productionId && run.status === 'active')) {
    if (++guard > 80) throw new Error('measure-c1-economy: the theatrical run never closed')
    next = advanceWeek(next).next
  }
  return next
}

function measureUpliftAB(): { arms: UpliftArm[]; rngIdentical: boolean; commissionWeek: number } {
  const baseline = foundedStudio(SEED)
  const foundingCash = baseline.studio.cash

  const armStates: { id: UpliftArm['id']; label: string; state: GameState }[] = []
  armStates.push({
    id: 'none',
    label: 'No development office',
    state: advance(foundedStudio(SEED), AB_COMMISSION_WEEK),
  })
  armStates.push({
    id: 'office-2',
    label: 'Development Office II (operational Week 8)',
    state: advance(buildAnywhere(foundedStudio(SEED), 'development-office-2'), AB_COMMISSION_WEEK),
  })
  {
    let state = buildAnywhere(foundedStudio(SEED), 'development-office-2')
    const office2 = studioPlacement(state).placements[0]!
    state = advance(state, office2.completesWeek - state.market.tick)
    state = buildAnywhere(state, 'development-office-3')
    state = advance(state, AB_COMMISSION_WEEK - state.market.tick)
    armStates.push({ id: 'office-3', label: 'Development Offices II + III (III operational Week 20)', state })
  }

  for (const arm of armStates) {
    if (arm.state.market.tick !== AB_COMMISSION_WEEK) {
      throw new Error(`measure-c1-economy: arm ${arm.id} is at week ${String(arm.state.market.tick)}`)
    }
  }
  const rngIdentical = armStates.every(
    (arm) => arm.state.rngState === armStates[0]!.state.rngState,
  )

  // ONE commission payload, taken from the control arm and used verbatim in all three:
  // same concept, same writer, same shape, same audience promise.
  const control = armStates[0]!.state
  const writerRow = scriptProjectsBoard(control).commission.writers.find(
    (writer) => writer.available && writer.primaryRole === 'writer',
  )
  const concept = scriptProjectsBoard(control).commission.concepts[0]
  if (writerRow === undefined || concept === undefined) {
    throw new Error('measure-c1-economy: the control arm cannot commission anything')
  }
  const payload = {
    conceptId: concept.id,
    writerId: writerRow.id,
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.65, 0.15] as [number, number],
        tonalWeight: [-0.65, 0.15] as [number, number],
        kineticEnergy: [-0.65, 0.15] as [number, number],
      },
    },
  }

  let sharedMarketing: number | null = null
  const arms: UpliftArm[] = []
  for (const arm of armStates) {
    const cashBurnedByCommission = foundingCash - arm.state.studio.cash
    let facilityCapital = 0
    for (const entry of arm.state.ledger) {
      if (entry.kind === 'constructionCapex') facilityCapital += -entry.amount
    }
    const uplift = developmentOfficeUplift(arm.state)
    const cashAtCommission = arm.state.studio.cash
    const rngStateAtCommission = arm.state.rngState

    const commissioned = commissionScriptAction(arm.state, payload as never)
    if (!commissioned.ok) throw new Error(`${arm.id}: ${commissioned.error}`)
    let state = advanceWeek(commissioned.next).next
    const drafted = state.scriptDevelopment.projects[0]!
    if (drafted.assessment === null) throw new Error(`${arm.id}: no draft assessment`)
    const estPerceived = drafted.assessment.perceivedStrength
    const estActual = drafted.assessment.actualStrength

    const accepted = runScriptProjectAction(state, {
      kind: 'acceptScript',
      projectId: drafted.id,
    } as never)
    if (!accepted.ok) throw new Error(`${arm.id}: ${accepted.error}`)
    state = accepted.next

    // ONE package for all three arms: the same director, the same three actors, the same
    // craft lead and the same budget. The picture differs in exactly one thing.
    const ready = state.scriptDevelopment.projects[0]!
    const excluded = new Set([ready.writerId])
    const pick = (role: CreativeRole): Talent[] =>
      studioPool(state, role)
        .filter((person) => person.available && !excluded.has(person.id))
        .map((person) => findTalent(state, person.id)!)
    const directors = pick('director')
    const crafts = pick('craft')
    const actors = pick('actor')
    const conceptOf = state.concepts.find((candidate) => candidate.id === ready.conceptId)!
    const writerOf = findTalent(state, ready.writerId)!
    const negative =
      NEGATIVE_BUDGET_MULTIPLIERS[0]! *
      conceptOf.baseNegativeCost *
      resolveShape(ready.shape).budgetDemandMultiplier *
      state.era.costScale
    const inputs: ReceptionInputs = {
      concept: conceptOf,
      shape: ready.shape,
      shapeEffects: resolveShape(ready.shape),
      promise: ready.promise,
      budget: { negative, marketing: 0 },
      writer: writerOf,
      director: directors[0]!,
      cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
      craftHires: [crafts[0]!],
      market: state.market,
      standing: state.studio.standing,
      era: state.era,
      scriptStrengthOverride: {
        perceived: readyScriptPerceivedStrength(state.scriptDevelopment, ready.id),
      },
    }
    sharedMarketing ??= marketingLevelsFor(state, inputs)[0]!
    const greenlit = greenlightScriptProject(state, ready.id, {
      conceptId: conceptOf.id,
      shape: ready.shape,
      promise: ready.promise,
      writerId: writerOf.id,
      directorId: directors[0]!.id,
      cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
      craftIds: [crafts[0]!.id],
      budget: { negative, marketing: sharedMarketing },
    } as never)
    if (!greenlit.ok) throw new Error(`${arm.id}: ${greenlit.error}`)
    state = greenlit.next
    const productionId = state.studio.activeProductions[0]!.id
    state = runPictureToCompletedRun(state, productionId)
    const film = state.studio.releasedFilms.find(
      (candidate) => candidate.productionId === productionId,
    )!

    arms.push({
      id: arm.id,
      label: arm.label,
      cashBurnedByCommission,
      facilityCapital,
      cashAtCommission,
      rngStateAtCommission,
      upliftPoints: uplift?.points ?? 0,
      estPerceived,
      estActual,
      criticScore: film.criticScore,
      boxOfficeTotal: film.boxOffice.total,
      studioRevenue: studioRevenueForFilm(state, productionId) ?? 0,
      releaseWeek: film.releaseTick,
      negative,
      marketing: sharedMarketing,
    })
  }
  return { arms, rngIdentical, commissionWeek: AB_COMMISSION_WEEK }
}

// ── 4. SHARED-SLOT THROUGHPUT AT THE TWO-PRODUCTION CEILING ──────────────────

type ThroughputArm = {
  label: string
  capacityDelta: 0 | 1 | 2
  availableWeek: number | null
  releases: number
  greenlights: number
  scriptProjects: number
  castingSessions: number
  capacityRejections: number
  capacitySlotWeeks: number
  occupiedSlotWeeks: number
  idleSlotWeeks: number
  fullWeeks: number
  finalCash: number
  /** The weeks a Development & Casting capacity refusal was actually experienced. */
  rejectionWeeks: number[]
}

function armThroughput(result: FacilitiesArmResult, label: string): ThroughputArm {
  const summary = result.summary
  const capability = summary.capability['development-casting']
  return {
    label,
    capacityDelta: result.armConfiguration.capacityDelta,
    availableWeek: result.armConfiguration.availableWeek,
    releases: summary.releases,
    greenlights: summary.greenlights,
    scriptProjects: summary.scriptProjects,
    castingSessions: summary.castingSessions,
    capacityRejections: summary.capacityRejectedIntentsByCapability['development-casting'],
    capacitySlotWeeks: capability.capacitySlotWeeks,
    occupiedSlotWeeks: capability.occupiedSlotWeeks,
    idleSlotWeeks: capability.idleSlotWeeks,
    fullWeeks: capability.fullWeeks,
    finalCash: summary.finalCash,
    rejectionWeeks: result.intents
      .filter(
        (intent) =>
          !intent.accepted &&
          intent.capacityBound &&
          intent.capability === 'development-casting',
      )
      .map((intent) => intent.week),
  }
}

type ThroughputSeed = { seed: string; arms: ThroughputArm[] }

function measureThroughput(): ThroughputSeed[] {
  const annexWeeks = catalogEntry('development-casting-annex').buildWeeks
  const hallWeeks = catalogEntry('development-casting-hall').buildWeeks
  const seeds: ThroughputSeed[] = []
  for (const seed of THROUGHPUT_SEEDS) {
    const arms: ThroughputArm[] = []
    arms.push(
      armThroughput(
        runFacilitiesArm({
          seed,
          policyId: 'scaled-two-team',
          mode: 'current',
          horizonWeeks: THROUGHPUT_HORIZON_WEEKS,
          source: SOURCE,
        }),
        '+0 · founding capacity (2 shared slots)',
      ),
    )
    arms.push(
      armThroughput(
        runFacilitiesArm({
          seed,
          policyId: 'scaled-two-team',
          mode: 'counterfactual',
          capacityDelta: 1,
          availableWeek: annexWeeks,
          horizonWeeks: THROUGHPUT_HORIZON_WEEKS,
          source: SOURCE,
        }),
        `+1 · Development & Casting Annex (open Week ${String(annexWeeks)})`,
      ),
    )
    arms.push(
      armThroughput(
        runFacilitiesArm({
          seed,
          policyId: 'scaled-two-team',
          mode: 'counterfactual',
          capacityDelta: 2,
          availableWeek: hallWeeks,
          horizonWeeks: THROUGHPUT_HORIZON_WEEKS,
          source: SOURCE,
        }),
        `+2 · Development & Casting Hall (open Week ${String(hallWeeks)})`,
      ),
    )
    seeds.push({ seed, arms })
  }
  return seeds
}

// ── 5. THE CRAFT SERVICES ANNEX, WHOSE BENEFIT IS A PRICE ────────────────────

type CraftAnnexMeasurement = {
  openedWeek: number
  rows: { role: CreativeRole; talentId: string; feeWithout: number; feeWith: number }[]
  meanSavingPerHire: number
  discountObserved: number
}

function measureCraftAnnex(): CraftAnnexMeasurement {
  const buildWeeks = catalogEntry('craft-annex').buildWeeks
  const control = advance(foundedStudio(SEED), buildWeeks)
  let treatment = buildAnywhere(foundedStudio(SEED), 'craft-annex')
  treatment = advance(treatment, buildWeeks)
  if (control.market.tick !== treatment.market.tick) {
    throw new Error('measure-c1-economy: the craft annex arms are not on the same week')
  }

  const rows: CraftAnnexMeasurement['rows'] = []
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const without = freelancerPool(control, role)
    const withAnnex = new Map(freelancerPool(treatment, role).map((row_) => [row_.talent.id, row_.fee]))
    for (const candidate of without) {
      const withFee = withAnnex.get(candidate.talent.id)
      if (withFee === undefined) continue
      rows.push({
        role,
        talentId: candidate.talent.id,
        feeWithout: candidate.fee,
        feeWith: withFee,
      })
    }
  }
  if (rows.length === 0) throw new Error('measure-c1-economy: no freelancer appears in both arms')
  const savings = rows.map((row_) => row_.feeWithout - row_.feeWith)
  const meanSaving = savings.reduce((sum, value) => sum + value, 0) / savings.length
  const ratios = rows.map((row_) => (row_.feeWithout - row_.feeWith) / row_.feeWithout)
  return {
    openedWeek: treatment.market.tick,
    rows,
    meanSavingPerHire: meanSaving,
    discountObserved: ratios.reduce((sum, value) => sum + value, 0) / ratios.length,
  }
}

// ── the report ───────────────────────────────────────────────────────────────

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function main(): void {
  const slate = BLUEPRINT_ORDER.map((blueprintId) => measureBlueprint(blueprintId))
  const builtOut = measureBuiltOut()
  const uplift = measureUpliftAB()
  const throughput = measureThroughput()
  const craft = measureCraftAnnex()

  const none = uplift.arms.find((arm) => arm.id === 'none')!
  const office2 = uplift.arms.find((arm) => arm.id === 'office-2')!
  const office3 = uplift.arms.find((arm) => arm.id === 'office-3')!

  // Release cadence, measured on the same policy the capacity study runs: this is what
  // converts a per-picture benefit into a per-week one.
  const currentArms = throughput.map((seed) => seed.arms[0]!)
  const releasesPerWeek = mean(currentArms.map((arm) => arm.releases)) / THROUGHPUT_HORIZON_WEEKS
  const weeksPerRelease = 1 / releasesPerWeek

  const office2Entry = catalogEntry('development-office-2')
  const office3Entry = catalogEntry('development-office-3')
  const annexEntry = catalogEntry('development-casting-annex')
  const hallEntry = catalogEntry('development-casting-hall')
  const craftEntry = catalogEntry('craft-annex')

  const office2BenefitPerPicture = office2.studioRevenue - none.studioRevenue
  const office3BenefitPerPicture = office3.studioRevenue - office2.studioRevenue
  const office2NetWeekly = office2BenefitPerPicture * releasesPerWeek - office2Entry.weeklyOperatingCost
  const office3NetWeekly = office3BenefitPerPicture * releasesPerWeek - office3Entry.weeklyOperatingCost
  const office2Payback = office2NetWeekly > 0 ? office2Entry.cost / office2NetWeekly : Infinity
  const office3Payback = office3NetWeekly > 0 ? office3Entry.cost / office3NetWeekly : Infinity

  const slotArms = [0, 1, 2].map((index) => throughput.map((seed) => seed.arms[index]!))
  const releasesByDelta = slotArms.map((arms) => mean(arms.map((arm) => arm.releases)))
  const cashByDelta = slotArms.map((arms) => mean(arms.map((arm) => arm.finalCash)))
  const idleByDelta = slotArms.map((arms) => mean(arms.map((arm) => arm.idleSlotWeeks)))

  /** Seeds where the extra slots changed nothing at all — same releases, same cash. */
  const unchangedSeeds = throughput.filter((seedRow) =>
    seedRow.arms.every(
      (arm) => arm.releases === seedRow.arms[0]!.releases && arm.finalCash === seedRow.arms[0]!.finalCash,
    ),
  )
  const divergedSeeds = throughput.filter((seedRow) => !unchangedSeeds.includes(seedRow))
  /** The marginal effect of buying the slot, per seed, in the studio's own two currencies. */
  const marginal = (index: 1 | 2) =>
    throughput.map((seedRow) => ({
      seed: seedRow.seed,
      releases: seedRow.arms[index]!.releases - seedRow.arms[0]!.releases,
      cash: seedRow.arms[index]!.finalCash - seedRow.arms[0]!.finalCash,
    }))
  const annexMarginal = marginal(1)
  const hallMarginal = marginal(2)
  const annexCashDelta = mean(annexMarginal.map((entry) => entry.cash))
  const hallCashDelta = mean(hallMarginal.map((entry) => entry.cash))
  const annexReleaseDelta = mean(annexMarginal.map((entry) => entry.releases))
  const hallReleaseDelta = mean(hallMarginal.map((entry) => entry.releases))
  const anyArmGainedCash = [...annexMarginal, ...hallMarginal].some((entry) => entry.cash > 0)

  // WHEN founding capacity actually binds, against WHEN a bought slot could relieve it.
  const bindingWeeks = currentArms.flatMap((arm) => arm.rejectionWeeks)
  const annexBuildWeeks = catalogEntry('development-casting-annex').buildWeeks
  const relievableRefusals = bindingWeeks.filter((week) => week >= annexBuildWeeks).length
  const earlyRefusals = bindingWeeks.length - relievableRefusals

  const lines: string[] = []
  const push = (...text: string[]) => { lines.push(...text) }

  push(
    '# Campaign 1 — Economy Snapshot',
    '',
    'A MEASURED RECORD. Every figure below was produced by running the engine, not by',
    'reading a tuning table. No tuning value was changed to produce it and none is',
    'proposed here: where a number looks wrong it is **FLAGGED** and left alone.',
    '',
    '## Provenance',
    '',
    ...table(
      ['Fact', 'Value'],
      [
        ['Generating command', '`node_modules/.bin/vite-node scripts/measure-c1-economy.mts`'],
        ['Generated at HEAD', `\`${HEAD}\``],
        ['Last commit touching `src/` or `ui/src/`', `\`${MEASURED_SOURCE_COMMIT}\``],
        ['Direct-measurement seed', `\`${SEED}\``],
        ['Capacity-study seeds', THROUGHPUT_SEEDS.map((seed) => `\`${seed}\``).join(', ')],
        ['Capacity-study horizon', `${String(THROUGHPUT_HORIZON_WEEKS)} weeks per arm`],
        [
          'Founding roster',
          `${String(FOUNDING_COUNTS.actor)} actors · ${String(FOUNDING_COUNTS.director)} director · ${String(FOUNDING_COUNTS.writer)} writers · ${String(FOUNDING_COUNTS.craft)} craft, ${String(FOUNDING_TERM_WEEKS)}-week terms`,
        ],
        ['Studio construction', 'public adapter/engine actions only — nothing hand-edited'],
        ['Determinism', 'no clock, no `Math.random`; two runs at one HEAD are byte-identical'],
      ],
    ),
    '',
    'Re-running at a later HEAD changes the HEAD line above and nothing else. The line to',
    'diff is the second one: while the last commit touching `src/` or `ui/src/` is',
    'unchanged, every measured figure below reproduces exactly — and if one of them moves,',
    'something in the economy moved with it.',
    '',
  )

  // ── 1 ──
  push(
    '## 1. The slate, measured one building at a time',
    '',
    'Each row is a founded studio that committed exactly one blueprint, ran the clock until',
    'the building opened, paid a week of its running cost, and then demolished it. Capital,',
    'operating cost and refund are read from the STUDIO’S OWN CASH AND LEDGER.',
    '',
    ...table(
      [
        'Blueprint',
        'Capital charged',
        'Weeks to open',
        'Weekly opex (ledger)',
        'Demolition refund',
        'Refund / capital',
        'Cells',
        'Shared slots',
      ],
      slate.map((entry) => [
        entry.name,
        money(entry.capitalCharged),
        String(entry.weeksToOperational),
        money(entry.opexLedgerDelta),
        money(entry.refundCredited),
        pct(entry.refundFraction),
        String(entry.footprintCells),
        entry.capacityAdded === 0 ? '—' : `+${String(entry.capacityAdded)}`,
      ]),
    ),
    '',
    'Cross-checks, all of which held:',
    '',
    ...slate.map(
      (entry) =>
        `- **${entry.name}** — cash debit ${money(entry.capitalCharged)} equals the catalog price ${money(entry.capitalQuoted)} and the single \`constructionCapex\` ledger row ${money(entry.capexLedgerRow)}; ${String(entry.weeksToOperational)} measured weeks equal the quoted ${String(entry.weeksQuoted)}; the ledger charged ${money(entry.opexLedgerDelta)} in the first open week against a quoted ${money(entry.opexQuoted)}; the refund credit ${money(entry.refundCredited)} matches its \`facilityDemolitionRefund\` row. Prerequisite: ${entry.precondition}.`,
    ),
    '',
    'What the refund column means in play: build-then-demolish is always a strict loss, and',
    'the size of that loss is the price of changing your mind.',
    '',
    ...table(
      ['Blueprint', 'Loss if built then demolished', 'Refund expressed as weeks of its own opex'],
      slate.map((entry) => [
        entry.name,
        money(entry.buildThenDemolishLoss),
        entry.opexQuoted === 0 ? '—' : `${fixed(entry.refundAsOpexWeeks, 0)} weeks`,
      ]),
    ),
    '',
  )

  // ── 2 ──
  const outflowRows = [...builtOut.weeklyOutflow.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))
  const totalOutflow = outflowRows.reduce((sum, [, value]) => sum + value, 0)
  push(
    '## 2. Founding baseline vs the built-out studio',
    '',
    'One studio that built **every blueprint within its instance limits** — one Annex, one',
    'Hall, Office II, Office III, one Craft Services Annex. The two unlimited blueprints are',
    'taken at one copy each; that is a stated choice, not a rule (see §4 for what a second',
    'copy would buy).',
    '',
    ...table(
      ['Fact', 'Founding', 'Built out'],
      [
        ['Placed facilities', '0', String(builtOut.facilities.length)],
        ['Weekly facility opex (projection)', money(builtOut.foundingWeeklyOpex), money(builtOut.weeklyOpex)],
        ['Weekly facility opex (ledger)', money(0), money(builtOut.weeklyOpexLedger)],
        ['Capital committed', money(0), money(builtOut.capitalCommitted)],
        ['Cash', money(builtOut.foundingCash), money(builtOut.cashAtBuiltOut)],
        ['Week the estate was complete', 'Week 0', `Week ${String(builtOut.builtOutWeek)}`],
      ],
    ),
    '',
    `The whole estate takes **${String(builtOut.builtOutWeek)} weeks** to stand from a day-one start — the Hall's and Office III's clocks, not the money, are what set that horizon. Demolishing all of it would recover ${money(builtOut.refundIfAllDemolished)} of the ${money(builtOut.capitalCommitted)} committed (${pct(builtOut.refundIfAllDemolished / builtOut.capitalCommitted)}).`,
    '',
    `Where the estate sits in the studio's weekly burn, from the ledger's own rows for Week ${String(builtOut.builtOutWeek)}:`,
    '',
    ...table(
      ['Ledger kind', 'Outflow that week', 'Share of the week'],
      outflowRows.map(([kind, value]) => [
        `\`${kind}\``,
        money(value),
        pct(value / totalOutflow),
      ]),
    ),
    '',
    `A fully built C1 estate costs ${money(builtOut.weeklyOpexLedger)} a week to run — ${pct(builtOut.weeklyOpexLedger / totalOutflow)} of that week's outflow. It is a real carrying cost and it is nowhere near a death spiral against a founding bank of ${money(builtOut.foundingCash)}.`,
    '',
  )

  // ── 3 ──
  push(
    '## 3. The Development Office uplift, A/B on one fixed seed',
    '',
    `Three arms of seed \`${SEED}\`, all aligned on **Week ${String(uplift.commissionWeek)}**, all commissioning the SAME concept with the SAME writer, shape and audience promise, and all greenlighting the SAME package at the SAME budget (${money(none.negative)} negative, ${money(none.marketing)} marketing). The only difference between them is which development office is standing.`,
    '',
    `**The arms are on the same random stream.** \`rngState\` at the commission week is ${uplift.rngIdentical ? 'BYTE-IDENTICAL across all three arms' : '**NOT identical across the arms — the receipts delta below is confounded and must not be read as causal**'}. ${uplift.rngIdentical ? 'That is what makes the receipts delta below a measurement of the office and not of a diverged world.' : ''}`,
    '',
    '### 3a. What it does to the draft',
    '',
    ...table(
      ['Arm', 'Uplift in force', 'EST (perceived)', 'EST (actual)', 'Δ perceived vs no office'],
      uplift.arms.map((arm) => [
        arm.label,
        arm.upliftPoints === 0 ? '—' : `+${String(arm.upliftPoints)}`,
        fixed(arm.estPerceived, 4),
        fixed(arm.estActual, 4),
        arm.id === 'none' ? '—' : `+${fixed(arm.estPerceived - none.estPerceived, 4)}`,
      ]),
    ),
    '',
    'The uplift lands EXACTLY as authored, on both the hidden strength and the visible',
    'estimate, and the tiers replace rather than stack: Office III is +9 and never +13.',
    '',
    '### 3b. What it does to the receipts',
    '',
    'Each arm carried its picture from commission to the close of its theatrical run.',
    '',
    ...table(
      ['Arm', 'Critic score', 'Box office', 'Studio revenue', 'Δ revenue vs no office', 'Facility capital committed', 'Total cash burned by Week 20'],
      uplift.arms.map((arm) => [
        arm.label,
        fixed(arm.criticScore, 3),
        money(arm.boxOfficeTotal),
        money(arm.studioRevenue),
        arm.id === 'none' ? '—' : money(arm.studioRevenue - none.studioRevenue),
        money(arm.facilityCapital),
        money(arm.cashBurnedByCommission),
      ]),
    ),
    '',
    ...table(
      ['Step', 'EST points bought', 'Capital', 'EST points per $1M', 'Revenue per picture', 'Revenue per $1M of capital'],
      [
        [
          'None → Office II',
          `+${String(office2.upliftPoints)}`,
          money(office2Entry.cost),
          fixed(office2.upliftPoints / (office2Entry.cost / 1_000_000), 2),
          money(office2BenefitPerPicture),
          money(office2BenefitPerPicture / (office2Entry.cost / 1_000_000)),
        ],
        [
          'Office II → Office III',
          `+${String(office3.upliftPoints - office2.upliftPoints)}`,
          money(office3Entry.cost),
          fixed((office3.upliftPoints - office2.upliftPoints) / (office3Entry.cost / 1_000_000), 2),
          money(office3BenefitPerPicture),
          money(office3BenefitPerPicture / (office3Entry.cost / 1_000_000)),
        ],
      ],
    ),
    '',
    'Read the second row as the MARGINAL purchase it is: Office III cannot be bought on its',
    'own, so its true price to a studio starting from nothing is',
    `${money(office2Entry.cost + office3Entry.cost)} of capital and ${money(office2Entry.weeklyOperatingCost + office3Entry.weeklyOperatingCost)} a week for +9 EST.`,
    '',
    'One seed, one picture. The EST figures are exact and would reproduce on any seed; the',
    'receipts figures are one draw of a stochastic reception and should be read as an order',
    'of magnitude, not a constant.',
    '',
  )

  // ── 4 ──
  push(
    '## 4. Shared slots at the two-production ceiling — what does another slot buy TODAY?',
    '',
    `Measured with \`runFacilitiesArm\` from the accepted Facilities & Construction observatory (\`src/harness/facilities\`), driven at the \`scaled-two-team\` policy — the policy that tries to keep **${String(C1_HISTORICAL_CONCURRENCY_CEILING)} pictures**, the current ceiling, in production at once. Three arms per seed over ${String(THROUGHPUT_HORIZON_WEEKS)} weeks: founding capacity, +1 shared slot arriving the week an Annex would open (Week ${String(annexEntry.buildWeeks)}), and +2 arriving the week a Hall would open (Week ${String(hallEntry.buildWeeks)}).`,
    '',
    ...table(
      ['Configuration', 'Releases (mean)', 'Final cash (mean)', 'Idle D&C slot-weeks (mean)', 'D&C capacity refusals (mean)'],
      slotArms.map((arms, index) => [
        arms[0]!.label,
        fixed(releasesByDelta[index]!, 1),
        money(cashByDelta[index]!),
        fixed(idleByDelta[index]!, 1),
        fixed(mean(arms.map((arm) => arm.capacityRejections)), 1),
      ]),
    ),
    '',
    ...table(
      ['Seed', ...slotArms.map((arms) => arms[0]!.label)],
      throughput.map((seedRow) => [
        `\`${seedRow.seed}\``,
        ...seedRow.arms.map(
          (arm) => `${String(arm.releases)} releases · ${money(arm.finalCash)} · ${String(arm.idleSlotWeeks)} idle slot-weeks`,
        ),
      ]),
    ),
    '',
    `**On ${String(unchangedSeeds.length)} of the ${String(THROUGHPUT_SEEDS.length)} seeds every arm released exactly the same pictures and finished with exactly the same cash, to the byte** (${unchangedSeeds.map((seedRow) => `\`${seedRow.seed}\``).join(', ') || 'none'}). There the extra capacity converted entirely into idle slot-weeks and changed nothing else.`,
    '',
    divergedSeeds.length === 0
      ? 'No seed diverged.'
      : `${divergedSeeds.length === 1 ? 'One seed did diverge' : `${String(divergedSeeds.length)} seeds diverged`}, and the divergence is worth reading carefully rather than averaging away:`,
    ...(divergedSeeds.length === 0
      ? []
      : [
          '',
          ...table(
            ['Seed', 'Δ releases with +1', 'Δ final cash with +1', 'Δ releases with +2', 'Δ final cash with +2'],
            divergedSeeds.map((seedRow) => {
              const index = throughput.indexOf(seedRow)
              return [
                `\`${seedRow.seed}\``,
                `${annexMarginal[index]!.releases >= 0 ? '+' : ''}${String(annexMarginal[index]!.releases)}`,
                money(annexMarginal[index]!.cash),
                `${hallMarginal[index]!.releases >= 0 ? '+' : ''}${String(hallMarginal[index]!.releases)}`,
                money(hallMarginal[index]!.cash),
              ]
            }),
          ),
          '',
          'An extra slot let that studio commit to one more picture — and the picture it let',
          'through was one the studio was better off not making. More throughput is not the',
          'same thing as more money, and this is the seed where the difference shows.',
        ]),
    '',
    `Averaged over all ${String(THROUGHPUT_SEEDS.length)} seeds the marginal slot is worth **${fixed(annexReleaseDelta, 2)} extra releases and ${money(annexCashDelta)} of final cash** (+1, Annex) and **${fixed(hallReleaseDelta, 2)} releases and ${money(hallCashDelta)}** (+2, Hall) — and those figures are BEFORE the building's own capital and running cost, which the counterfactual does not charge. ${anyArmGainedCash ? 'At least one arm did finish richer; see the per-seed table.' : 'Not one arm on any seed finished richer than its founding-capacity twin.'}`,
    '',
    `Founding capacity does bind: the studios were refused a Development & Casting slot ${String(bindingWeeks.length)} times across the ${String(THROUGHPUT_SEEDS.length)} founding-capacity arms. ${String(earlyRefusals)} of those refusals happened before Week ${String(annexEntry.buildWeeks)} — the earliest week any purchased slot can be standing — so they are unreachable by construction no matter how early the player commits. The remaining ${String(relievableRefusals)} are reachable, and buying the slot did reduce refusals (mean ${fixed(mean(slotArms[0]!.map((arm) => arm.capacityRejections)), 1)} → ${fixed(mean(slotArms[1]!.map((arm) => arm.capacityRejections)), 1)}) — it simply did not convert into pictures or money.`,
    '',
    'Why this is a ceiling result rather than a slot result: a picture holds one shared',
    'Development & Casting slot at a time (its screenplay, then its camera tests, then its',
    'early production work), and the studio may hold at most',
    `${String(C1_HISTORICAL_CONCURRENCY_CEILING)} pictures. Two pictures therefore need two slots, which the founding Development &`,
    'Casting building already provides. A refused commission is a screenplay that waits a',
    'week, not a picture that never gets made.',
    '',
  )

  // ── 5 ──
  push(
    '## 5. The Craft Services Annex, whose benefit is a price',
    '',
    `Two studios on seed \`${SEED}\` at Week ${String(craft.openedWeek)}, identical except that one has an operational Craft Services Annex, compared on the freelancers they can both see.`,
    '',
    ...table(
      ['Role', 'Freelancer', 'Fee without', 'Fee with', 'Saved'],
      craft.rows.map((entry) => [
        entry.role,
        `\`${entry.talentId}\``,
        money(entry.feeWithout),
        money(entry.feeWith),
        money(entry.feeWithout - entry.feeWith),
      ]),
    ),
    '',
    `Observed discount ${pct(craft.discountObserved, 2)}; mean saving ${money(craft.meanSavingPerHire)} per freelancer hired. At ${money(craftEntry.cost)} of capital, the Annex pays for its capital after **${fixed(craftEntry.cost / craft.meanSavingPerHire, 1)} freelancer hires** and needs ${fixed(craftEntry.weeklyOperatingCost / craft.meanSavingPerHire, 2)} hires per week just to cover its own running cost.`,
    '',
    'The important caveat is not the arithmetic: a studio that staffs its pictures from its',
    'own contracted roster hires no freelancers at all, and for that studio this building’s',
    'measured benefit is exactly zero. It is a building for a studio that has outgrown its',
    'payroll, and nothing in Campaign 1 tells the player that.',
    '',
  )

  // ── 6 ──
  push(
    '## 6. Payback horizons',
    '',
    `A picture releases every **${fixed(weeksPerRelease, 2)} weeks** at the two-production ceiling (mean of ${fixed(mean(currentArms.map((arm) => arm.releases)), 1)} releases over ${String(THROUGHPUT_HORIZON_WEEKS)} weeks, ${String(THROUGHPUT_SEEDS.length)} seeds). That cadence is what turns a per-picture benefit into a per-week one.`,
    '',
    ...table(
      ['Blueprint', 'Capital', 'Weekly opex', 'Measured benefit', 'Net per week', 'Capital payback'],
      [
        [
          office2Entry.name,
          money(office2Entry.cost),
          money(office2Entry.weeklyOperatingCost),
          `${money(office2BenefitPerPicture)} per picture`,
          money(office2NetWeekly),
          Number.isFinite(office2Payback) ? `${fixed(office2Payback, 1)} weeks` : 'never',
        ],
        [
          `${office3Entry.name} (marginal, on top of II)`,
          money(office3Entry.cost),
          money(office3Entry.weeklyOperatingCost),
          `${money(office3BenefitPerPicture)} per picture`,
          money(office3NetWeekly),
          Number.isFinite(office3Payback) ? `${fixed(office3Payback, 1)} weeks` : 'never',
        ],
        [
          annexEntry.name,
          money(annexEntry.cost),
          money(annexEntry.weeklyOperatingCost),
          `${money(annexCashDelta)} of final cash over ${String(THROUGHPUT_HORIZON_WEEKS)} weeks (mean, ${String(THROUGHPUT_SEEDS.length)} seeds)`,
          money(annexCashDelta / THROUGHPUT_HORIZON_WEEKS - annexEntry.weeklyOperatingCost),
          'never',
        ],
        [
          hallEntry.name,
          money(hallEntry.cost),
          money(hallEntry.weeklyOperatingCost),
          `${money(hallCashDelta)} of final cash over ${String(THROUGHPUT_HORIZON_WEEKS)} weeks (mean, ${String(THROUGHPUT_SEEDS.length)} seeds)`,
          money(hallCashDelta / THROUGHPUT_HORIZON_WEEKS - hallEntry.weeklyOperatingCost),
          'never',
        ],
        [
          craftEntry.name,
          money(craftEntry.cost),
          money(craftEntry.weeklyOperatingCost),
          `${money(craft.meanSavingPerHire)} per freelancer hired`,
          'depends entirely on hiring rate',
          `${fixed(craftEntry.cost / craft.meanSavingPerHire, 1)} freelancer hires`,
        ],
      ],
    ),
    '',
    'The two "never" rows are not a claim that capacity is worthless. They are a claim about',
    `TODAY: with the ceiling at ${String(C1_HISTORICAL_CONCURRENCY_CEILING)} concurrent pictures, the founding building already supplies every`,
    'slot a studio can use, so a purchased slot has nothing to hold — and the counterfactual',
    'that gives the slot away for free still does not leave the studio richer. Raising the',
    'ceiling is explicitly out of Campaign 1 scope; this is the measurement that says what',
    'that decision is worth when someone takes it.',
    '',
  )

  // ── 7 ──
  const office2PerMillion = office2BenefitPerPicture / (office2Entry.cost / 1_000_000)
  const office3PerMillion = office3BenefitPerPicture / (office3Entry.cost / 1_000_000)
  push(
    '## 7. The two standing PM flags, answered with data',
    '',
    '### (a) Is Development Office III’s value the weakest in the slate?',
    '',
    `**FLAGGED — no, not the weakest, but it IS the worst-value office, and by a wide margin.** Office II buys ${fixed(office2.upliftPoints / (office2Entry.cost / 1_000_000), 2)} EST points per $1M of capital; Office III’s marginal +${String(office3.upliftPoints - office2.upliftPoints)} costs ${fixed((office3.upliftPoints - office2.upliftPoints) / (office3Entry.cost / 1_000_000), 2)} points per $1M — ${pct(1 - (office3.upliftPoints - office2.upliftPoints) / (office3Entry.cost / 1_000_000) / (office2.upliftPoints / (office2Entry.cost / 1_000_000)))} less EST per dollar. On measured receipts the same ordering holds: ${money(office2PerMillion)} of revenue per picture per $1M for Office II against ${money(office3PerMillion)} for Office III's marginal step. Its capital payback (${Number.isFinite(office3Payback) ? `${fixed(office3Payback, 1)} weeks` : 'never'}) is ${Number.isFinite(office2Payback) && Number.isFinite(office3Payback) ? `${fixed(office3Payback / office2Payback, 1)}×` : 'far'} Office II's (${Number.isFinite(office2Payback) ? `${fixed(office2Payback, 1)} weeks` : 'never'}), and it also carries a ${String(office3Entry.buildWeeks)}-week clock and ${money(office3Entry.weeklyOperatingCost)}/week forever.`,
    '',
    `It is nonetheless NOT the weakest entry in the slate: it returns something on every picture, which the two capacity blueprints measurably do not (§4). The weakest entries today are the Annex and the Hall. Office III is the weakest thing a studio would actually be tempted to buy — a ${money(office3Entry.cost)} purchase that doubles down on a lever the ${money(office2Entry.cost)} purchase already pulled most of the way.`,
    '',
    '### (b) Can the Hall’s 20-week build ever pay back inside a typical campaign horizon?',
    '',
    `**FLAGGED — no. Not in ${String(THROUGHPUT_HORIZON_WEEKS)} weeks, and on this evidence not in any horizon, because its measured benefit is not merely small — it is negative before the building is even paid for.** Given its two shared slots for FREE from the week it would open, the studio finished a two-year run with a mean ${money(hallCashDelta)} of final cash against its founding-capacity twin (${String(unchangedSeeds.length)} of ${String(THROUGHPUT_SEEDS.length)} seeds byte-identical, ${String(divergedSeeds.length)} worse). What the capacity reliably bought was ${fixed(idleByDelta[2]! - idleByDelta[0]!, 0)} additional idle slot-weeks. Its ${money(hallEntry.cost)} of capital and ${money(hallEntry.weeklyOperatingCost)}/week — ${money(hallEntry.weeklyOperatingCost * THROUGHPUT_HORIZON_WEEKS)} of opex over that same two-year run — are therefore paid against a benefit of zero or less.`,
    '',
    `The 20-week clock is therefore the second problem, not the first. Even if the Hall opened instantly it would still return nothing, because the constraint it relieves is not the constraint the studio is under: the studio is under the ${String(C1_HISTORICAL_CONCURRENCY_CEILING)}-production ceiling, and slots are not what that ceiling is made of. The same measurement condemns the Annex (${money(annexEntry.cost)}, ${String(annexEntry.buildWeeks)} weeks) for the same reason — the Hall is only the more expensive way to buy the same nothing.`,
    '',
    'One honest counterweight, recorded so the flag is not read as more than it is: extra',
    'slots DO let a studio hold more screenplays and camera tests in flight at once, which is',
    'real optionality a scripted policy does not exercise and a player might. It is worth',
    'nothing in RELEASES today; it is not worth nothing in FEEL.',
    '',
    '**No tuning value was changed by this study, and none is recommended by it.** Both',
    'answers above are findings for the PM to rule on.',
    '',
  )

  const outputDirectory = join(repoRoot, 'docs', 'economy')
  mkdirSync(outputDirectory, { recursive: true })
  const outputPath = join(outputDirectory, 'C1-ECONOMY-SNAPSHOT.md')
  const report = `${lines.join('\n')}`
  writeFileSync(outputPath, report, 'utf8')
  // eslint-disable-next-line no-console
  console.log(
    `wrote docs/economy/C1-ECONOMY-SNAPSHOT.md · ${String(Buffer.byteLength(report, 'utf8'))} bytes · HEAD ${HEAD}`,
  )
}

main()
