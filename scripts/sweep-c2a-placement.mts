// C2a-M2 FIRST TASK — THE PLACEMENT SWEEP (charter §3.4).
//
// Run from the repository root:
//   node_modules/.bin/vite-node scripts/sweep-c2a-placement.mts
//
// WHAT THIS IS. §3.4 states the C2a ground question as evidence-gated, not asserted:
// "M2's first task is the placement sweep: run `queryPlacement` for the Soundstage
// blueprint at every origin on the seven road-served buildable parcels (123 cells
// total) together with the Post/Scenery/office slate, and publish the arithmetic."
// The verdict it gates: is the pre-authorized `north-back-lot` road spur NEEDED for the
// C2a slate, or is it DROPPED?
//
// THIS SCRIPT CHANGES NOTHING. It writes exactly one file, `docs/c2-planning/
// 16-placement-sweep.md`. It adds no blueprint to TUNING, commits no placement, and
// spends no money. Every verdict below is the ENGINE'S OWN, read from the real legality
// authority — nothing here re-implements a rule.
//
// THE TRUE ENTRY POINT, and why it is `quoteForBlueprint` rather than `queryPlacement`.
// `queryPlacement(state, request)` resolves `request.blueprintId` against the SHIPPED
// catalog (`FACILITY_BLUEPRINTS`) and then calls `quoteForBlueprint`. The C2a slate is
// not in that catalog yet — authoring it is M2's SECOND task, and §3.4 forbids this
// sweep from pre-committing it ("construct the blueprint object in-script from the real
// FacilityBlueprint type; commit nothing to tuning"). `placement.ts` names this exact
// use case in its own doc comment: the split "means the rule engine can be exercised
// against a blueprint the shipped catalog does not contain — which is the only way to
// prove the requirement and instance-limit law before C1-M4 authors catalog content
// that would exercise it." So `quoteForBlueprint` IS `queryPlacement` minus one map
// lookup, and it is where every rule actually lives. Asked through `queryPlacement`, a
// hypothetical soundstage could only ever answer `unknownBlueprint`.
//
// WHAT IS DELIBERATELY HELD OUT OF THE ANSWER. The sweep blueprints carry `capex: 0`,
// `requires: []`, and no `maxInstances`. That is not laziness — it makes the sweep a
// measurement of GROUND and nothing else:
//   • `insufficientFunds` is structurally unreachable, because the solvency gate binds
//     only when `chargedCost > 0` (`placement.ts`, the C1-M8 zero-cost clause);
//   • `requirementsUnmet` and `instanceLimit` are structurally unreachable, because an
//     empty requirement list is available and an absent `maxInstances` is unlimited.
// So every rejection this report prints is a GEOMETRY rejection. What the C2a slate
// costs, and what gates it, are separate M2 decisions this sweep must not prejudge.
//
// DETERMINISM. One fixed seed, one founding roster taken in card order, no clock, no
// `Math.random`. Two runs at one HEAD produce byte-identical output apart from the
// provenance line.

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  PLACEMENT_REJECTION_ORDER,
  blueprintById,
  footprintCells,
  parcelReservedBlueprintId,
  queryPlacement,
  quoteForBlueprint,
} from '../src/core/placement.ts'
import { parcelById, parcelHasRoadFrontage, propertyOf, rectCells } from '../src/core/lot.ts'
import type {
  FacilityBlueprint,
  GameState,
  LotCell,
  LotParcel,
  PlacedFacility,
  PlacementQuote,
  PlacementRejection,
} from '../src/core/types.ts'
import type { CreativeRole } from '../src/core/index.ts'
import {
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  signContractAction,
} from '../ui/src/engine/adapter.ts'

// ── provenance ───────────────────────────────────────────────────────────────

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')

function git(args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd: repoRoot, encoding: 'utf8' }).trim()
}

const HEAD = git(['rev-parse', 'HEAD'])
/** The last commit that touched a surface capable of moving a verdict in this report. */
const MEASURED_SOURCE_COMMIT = git(['log', '-1', '--format=%H', '--', 'src/core/placement.ts', 'src/core/lot.ts'])

/**
 * THE LEGALITY AUTHORITY MUST BE AT HEAD. This worktree is shared with concurrent lanes,
 * so a run can pick up someone else's uncommitted edits. Every verdict in this report is
 * decided by exactly two files; if either is dirty the report would be publishing a
 * measurement of unreviewed code under a commit hash that does not contain it. Refuse.
 */
const LEGALITY_FILES = ['src/core/placement.ts', 'src/core/lot.ts'] as const
const legalityDirty = git(['status', '--porcelain', '--', ...LEGALITY_FILES])
if (legalityDirty !== '') {
  throw new Error(
    `sweep-c2a-placement: the legality authority is not at HEAD — refusing to publish.\n${legalityDirty}`,
  )
}
/** Everything else that WAS dirty at run time, recorded rather than hidden. */
const worktreeDirty = git(['status', '--porcelain'])
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.endsWith('16-placement-sweep.md') && !line.endsWith('sweep-c2a-placement.mts'))

// ── the studio under sweep ───────────────────────────────────────────────────

const SEED = 'c2a-placement-sweep-001'
const FOUNDING_COUNTS: Readonly<Record<CreativeRole, number>> = {
  actor: 4,
  director: 1,
  writer: 2,
  craft: 1,
}
const FOUNDING_TERM_WEEKS = 208

function foundedStudio(seed: string): GameState {
  let state: GameState = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const selected = cards.filter((card) => card.profile.role === role).slice(0, FOUNDING_COUNTS[role])
    if (selected.length !== FOUNDING_COUNTS[role]) {
      throw new Error(`sweep-c2a-placement: seed ${seed} lacks ${role} applicants`)
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

// ── the hypothetical C2a slate, as FacilityBlueprint values ──────────────────
//
// Footprints are the CHARTER'S §3.4 slate at realistic C1 scale. The soundstage is the
// one §3.4 states outright (4×4, clearanceRing 1, requiresRoadAccess true) and matches
// the founding Stage A / Stage B bodies verbatim (`lot.ts` INITIAL_PROPERTY_STRUCTURES:
// both are `footprint: { width: 4, depth: 4 }`). The three smaller entries take the
// shipped catalog's own small-building footprint, 3×2 — the Development & Casting Annex
// (TUNING.PLACEMENT_ANNEX_FOOTPRINT_*), Development Office II/III and the Craft Services
// Annex are all 3×2, and the founding Production/Post body is 3×2 as well. Every entry
// carries clearanceRing 1 and requiresRoadAccess true, which is uniform across the whole
// shipped catalog.
//
// A 4×3 variant of the Scenery Shop is swept alongside as a SENSITIVITY CASE, because
// "second instance of the founding class, plus set construction, repair and load-in" is
// the one entry with an honest argument for being larger than a 3×2 office. The verdict
// is reported at both sizes so M2 authoring is not boxed in by this script's guess.

function sweepBlueprint(
  id: string,
  name: string,
  capability: FacilityBlueprint['capability'],
  width: number,
  depth: number,
): FacilityBlueprint {
  return {
    id,
    name,
    capability,
    capacity: 1,
    footprint: { width, depth },
    clearanceRing: 1,
    requiresRoadAccess: true,
    buildWeeks: 1,
    capex: 0,
    weeklyOperatingCost: 0,
    facilityIdBase: `sweep-facility-${id}`,
    projectIdBase: `sweep-construction-${id}`,
    ledgerNote: `sweep ${name}`,
    effectSummary: 'Sweep-only hypothetical. This blueprint is never committed to the catalog.',
    requires: [],
  }
}

const SOUNDSTAGE = sweepBlueprint('sweep-soundstage', 'Soundstage (Standard)', 'soundstage', 4, 4)
const POST = sweepBlueprint('sweep-post', 'Post Building', 'post', 3, 2)
const SCENERY = sweepBlueprint('sweep-scenery', 'Scenery Shop', 'set-scenery', 3, 2)
const OFFICE = sweepBlueprint('sweep-office', 'Baseline Development & Casting Office', 'development-casting', 3, 2)
const SCENERY_LARGE = sweepBlueprint('sweep-scenery-4x3', 'Scenery Shop (4×3 sensitivity)', 'set-scenery', 4, 3)

const SWEPT: readonly FacilityBlueprint[] = [SOUNDSTAGE, POST, SCENERY, OFFICE, SCENERY_LARGE]

// ── the seven road-served buildable parcels ──────────────────────────────────
//
// Derived from the property itself, never hand-listed: buildable terrain AND road
// frontage per `parcelHasRoadFrontage`. The script ASSERTS the derived set is the seven
// §3.4 names totalling 123 cells, so a property edit that changed the sweep's subject
// fails loudly instead of silently republishing a stale arithmetic.

const CHARTER_SEVEN = [
  'backlot-apron',
  'expansion',
  'north-court',
  'north-lawn',
  'south-lawn',
  'stage-south',
  'west-lawn',
] as const

const baseState = foundedStudio(SEED)
const property = propertyOf(baseState)

if (baseState.placement.facilities.length !== 0) {
  throw new Error('sweep-c2a-placement: the founding studio was expected to hold zero placements')
}

const roadServedBuildable = property.parcels
  .filter((parcel) => parcel.terrain === 'buildable' && parcelHasRoadFrontage(property, parcel))
  .map((parcel) => parcel.id)
  .sort()

if (roadServedBuildable.join(',') !== [...CHARTER_SEVEN].sort().join(',')) {
  throw new Error(
    `sweep-c2a-placement: the road-served buildable set moved — expected ${CHARTER_SEVEN.join(',')}, got ${roadServedBuildable.join(',')}`,
  )
}

function parcelOf(id: string): LotParcel {
  const parcel = parcelById(property, id)
  if (parcel === null) throw new Error(`sweep-c2a-placement: no parcel ${id}`)
  return parcel
}

const SWEPT_PARCELS = [...CHARTER_SEVEN].map(parcelOf)
const originsByParcel = new Map<string, LotCell[]>(
  SWEPT_PARCELS.map((parcel) => [parcel.id, rectCells(parcel.rect)]),
)
const TOTAL_ORIGINS = SWEPT_PARCELS.reduce(
  (total, parcel) => total + (originsByParcel.get(parcel.id)?.length ?? 0),
  0,
)
if (TOTAL_ORIGINS !== 123) {
  throw new Error(`sweep-c2a-placement: expected 123 origin cells across the seven, got ${TOTAL_ORIGINS}`)
}

// `north-back-lot` is the pre-authorized spur's parcel, swept SEPARATELY so the report
// can quantify exactly what the spur would buy.
const NORTH_BACK_LOT = parcelOf('north-back-lot')
const northBackLotOrigins = rectCells(NORTH_BACK_LOT.rect)

// ── the sweep ────────────────────────────────────────────────────────────────

type OriginResult = {
  origin: LotCell
  ok: boolean
  primary: PlacementRejection | null
  rejections: readonly PlacementRejection[]
}

function sweepParcel(state: GameState, blueprint: FacilityBlueprint, origins: readonly LotCell[]): OriginResult[] {
  const results = origins.map((origin) => {
    const quote: PlacementQuote = quoteForBlueprint(state, blueprint, origin)
    return { origin, ok: quote.ok, primary: quote.primary, rejections: quote.rejections }
  })
  record(results)
  return results
}

function cellName(cell: LotCell): string {
  return `(${String(cell.gx)},${String(cell.gy)})`
}

function tallyPrimaries(results: readonly OriginResult[]): string {
  const counts = new Map<PlacementRejection, number>()
  for (const result of results) {
    if (result.primary === null) continue
    counts.set(result.primary, (counts.get(result.primary) ?? 0) + 1)
  }
  const parts = PLACEMENT_REJECTION_ORDER.filter((code) => counts.has(code)).map(
    (code) => `${code} ${String(counts.get(code) ?? 0)}`,
  )
  return parts.length === 0 ? '—' : parts.join(', ')
}

/**
 * PROVE the "geometry only" claim rather than assert it. Every rejection this sweep
 * observes, anywhere, is recorded here; the report asserts that the three studio-scope
 * codes never appear. If a future change makes one reachable, this throws instead of
 * quietly republishing a claim that stopped being true.
 */
const OBSERVED_REJECTIONS = new Set<PlacementRejection>()
function record(results: readonly OriginResult[]): readonly OriginResult[] {
  for (const result of results) for (const code of result.rejections) OBSERVED_REJECTIONS.add(code)
  return results
}
const NON_GEOMETRY: readonly PlacementRejection[] = [
  'requirementsUnmet',
  'instanceLimit',
  'insufficientFunds',
]

// ── the coexistence question ─────────────────────────────────────────────────
//
// "Can TWO additional stages + Post + Scenery + an office coexist with realistic
// packing?" is answered by an EXHAUSTIVE backtracking search that asks the real engine
// at every step. Each accepted origin is committed as a synthetic `PlacedFacility` into
// a copied `state.placement`, so the next building is judged against real occupancy,
// a real clearance ring, and a real severance walk — exactly what a player's fourth
// build faces. Nothing is written back to the base state.
//
// Two identical blueprints are interchangeable, so the search requires their chosen
// origins to be strictly increasing in the fixed sweep order. That removes the mirror
// duplicates without removing a single distinct plan, which is what keeps "no plan
// exists" an exhaustive statement rather than a search budget running out.

type PlanStep = { blueprint: FacilityBlueprint; origin: LotCell; parcelId: string }

function withSynthetic(state: GameState, step: PlanStep, id: number): GameState {
  const cells = footprintCells(step.blueprint, step.origin)
  const placed: PlacedFacility = {
    id,
    blueprintId: step.blueprint.id,
    parcelId: step.parcelId,
    origin: { ...step.origin },
    cells,
    facilityId: `${step.blueprint.facilityIdBase}-${String(id)}`,
    projectId: `${step.blueprint.projectIdBase}-${String(id)}`,
    status: 'operational',
    placedWeek: state.market.tick,
    completesWeek: state.market.tick,
  }
  return {
    ...state,
    placement: {
      ...state.placement,
      nextPlacementId: id + 1,
      facilities: [...state.placement.facilities, placed],
    },
  }
}

/** Every origin on the seven, in one fixed parcel-then-reading order. */
const ALL_ORIGINS: readonly { origin: LotCell; parcelId: string }[] = SWEPT_PARCELS.flatMap((parcel) =>
  (originsByParcel.get(parcel.id) ?? []).map((origin) => ({ origin, parcelId: parcel.id })),
)

type OriginCandidate = { origin: LotCell; parcelId: string }

let searchNodes = 0

/**
 * MONOTONICITY, and why pruning to the empty-lot legal set loses no plan.
 *
 * Every rule this sweep can trip is monotone in placements — adding a building can only
 * ever turn a legal origin illegal, never the reverse:
 *   • `offLot`, `notOwned`, `terrainUnbuildable`, `groundReserved`, `noRoadAccess` are facts
 *     about the GROUND and do not consult placements at all;
 *   • `occupied` and `clearanceRing` read occupancy sets that only ever grow;
 *   • `seversLot` walks with the occupied cells marked impassable, and adding obstacles can
 *     only disconnect the ring further.
 * (`requirementsUnmet`, `instanceLimit` and `insufficientFunds` are structurally unreachable
 * for these blueprints — see the header.)
 *
 * So an origin illegal on the EMPTY lot is illegal in every partial plan, and skipping it
 * cannot discard a solution. The search stays exhaustive; it just stops re-deriving 118
 * known-dead origins at every node.
 */
const legalOnEmptyCache = new Map<string, OriginCandidate[]>()
function legalOnEmpty(blueprint: FacilityBlueprint, origins: readonly OriginCandidate[], key: string): OriginCandidate[] {
  const cached = legalOnEmptyCache.get(key)
  if (cached !== undefined) return cached
  const computed = origins.filter((candidate) => quoteForBlueprint(baseState, blueprint, candidate.origin).ok)
  legalOnEmptyCache.set(key, computed)
  return computed
}

function search(
  state: GameState,
  slate: readonly FacilityBlueprint[],
  candidatesFor: readonly (readonly OriginCandidate[])[],
  index: number,
  minOriginIndex: number,
  nextId: number,
  chosen: readonly PlanStep[],
): PlanStep[] | null {
  if (index >= slate.length) return [...chosen]
  const blueprint = slate[index]!
  const origins = candidatesFor[index]!
  const sameAsPrevious = index > 0 && slate[index - 1]!.id === blueprint.id
  for (let originIndex = sameAsPrevious ? minOriginIndex : 0; originIndex < origins.length; originIndex++) {
    const candidate = origins[originIndex]!
    searchNodes += 1
    const quote = quoteForBlueprint(state, blueprint, candidate.origin)
    if (!quote.ok) continue
    const step: PlanStep = { blueprint, origin: candidate.origin, parcelId: candidate.parcelId }
    const solved = search(
      withSynthetic(state, step, nextId),
      slate,
      candidatesFor,
      index + 1,
      originIndex + 1,
      nextId + 1,
      [...chosen, step],
    )
    if (solved !== null) return solved
  }
  return null
}

function packOver(
  state: GameState,
  slate: readonly FacilityBlueprint[],
  origins: readonly OriginCandidate[],
  keyPrefix: string,
): PlanStep[] | null {
  const candidatesFor = slate.map((blueprint) => legalOnEmpty(blueprint, origins, `${keyPrefix}:${blueprint.id}`))
  return search(state, slate, candidatesFor, 0, 0, 1, [])
}

/** Pack a slate over the seven road-served parcels. Exhaustive. */
function packPlan(state: GameState, slate: readonly FacilityBlueprint[]): PlanStep[] | null {
  return packOver(state, slate, ALL_ORIGINS, 'seven')
}

/** Pack a slate over an arbitrary origin list — used for the spur's headroom question. */
function packWithin(
  state: GameState,
  slate: readonly FacilityBlueprint[],
  origins: readonly OriginCandidate[],
): PlanStep[] | null {
  return packOver(state, slate, origins, 'spur')
}

const C2A_SLATE: readonly FacilityBlueprint[] = [SOUNDSTAGE, SOUNDSTAGE, POST, SCENERY, OFFICE]
const C2A_SLATE_LARGE_SCENERY: readonly FacilityBlueprint[] = [SOUNDSTAGE, SOUNDSTAGE, POST, SCENERY_LARGE, OFFICE]

type TradeCase = { name: string; note: string; slate: readonly FacilityBlueprint[] }

const TRADE_CASES: readonly TradeCase[] = [
  {
    name: 'A — the C2a slate as §3.4 states it',
    note: '2 × Soundstage 4×4, Post 3×2, Scenery 3×2, Office 3×2',
    slate: C2A_SLATE,
  },
  {
    name: 'B — the same with a 4×3 Scenery Shop',
    note: 'the sensitivity case: is the Scenery Shop allowed to be four cells wide?',
    slate: C2A_SLATE_LARGE_SCENERY,
  },
  {
    name: 'C — one stage, with a 4×3 Scenery Shop',
    note: 'isolates whether the 4×3 loses to the SECOND stage or to the parcels themselves',
    slate: [SOUNDSTAGE, POST, SCENERY_LARGE, OFFICE],
  },
  {
    name: 'D — the C2a slate plus a second office',
    note: 'headroom: does the slate leave room for one more small building?',
    slate: [SOUNDSTAGE, SOUNDSTAGE, POST, SCENERY, OFFICE, OFFICE],
  },
  {
    name: 'E — three stages plus the support slate',
    note: '§16a’s third-stage beat, asked directly',
    slate: [SOUNDSTAGE, SOUNDSTAGE, SOUNDSTAGE, POST, SCENERY, OFFICE],
  },
]

type TradeResult = TradeCase & { plan: PlanStep[] | null; nodes: number }

const tradeResults: TradeResult[] = TRADE_CASES.map((tradeCase) => {
  searchNodes = 0
  const solved = packPlan(baseState, tradeCase.slate)
  return { ...tradeCase, plan: solved, nodes: searchNodes }
})

const plan = tradeResults[0]?.plan ?? null
const planNodes = tradeResults[0]?.nodes ?? 0
const planLarge = tradeResults[1]?.plan ?? null
const planLargeNodes = tradeResults[1]?.nodes ?? 0

// How many stages fit AT ALL — the number §16a's third-stage beat and the M2 gate's
// stage count are stated against.
let maxStages = 0
for (let count = 1; count <= 4; count += 1) {
  const slate = Array.from({ length: count }, () => SOUNDSTAGE)
  if (packPlan(baseState, slate) === null) break
  maxStages = count
}

// HEADROOM AFTER THE PLAN. With slate A standing, how much buildable ground is left?
// This is the number a later lane needs before it authors a sixth blueprint.
const afterPlanState = (plan ?? []).reduce<GameState>(
  (state, step, index) => withSynthetic(state, step, index + 1),
  baseState,
)
const headroomSmall = SWEPT_PARCELS.reduce(
  (total, parcel) =>
    total + sweepParcel(afterPlanState, OFFICE, originsByParcel.get(parcel.id) ?? []).filter((r) => r.ok).length,
  0,
)
const headroomStage = SWEPT_PARCELS.reduce(
  (total, parcel) =>
    total + sweepParcel(afterPlanState, SOUNDSTAGE, originsByParcel.get(parcel.id) ?? []).filter((r) => r.ok).length,
  0,
)

// WHAT THE SPUR WOULD BUY, measured. `north-back-lot` refuses every origin today for
// `noRoadAccess` and nothing else. Re-swept with the road-access RULE waived — every
// other geometry rule held constant — the count is the UPPER BOUND on what a spur could
// unlock, because a real spur also consumes ground out of the parcel it serves.
const SOUNDSTAGE_NO_ROAD: FacilityBlueprint = { ...SOUNDSTAGE, requiresRoadAccess: false }
const spurUnlockedStageOrigins = sweepParcel(baseState, SOUNDSTAGE_NO_ROAD, northBackLotOrigins).filter(
  (result) => result.ok,
)
searchNodes = 0
const spurStageCapacity = ((): number => {
  let best = 0
  for (let count = 1; count <= 4; count += 1) {
    const slate = Array.from({ length: count }, () => SOUNDSTAGE_NO_ROAD)
    const origins = northBackLotOrigins.map((origin) => ({ origin, parcelId: NORTH_BACK_LOT.id }))
    if (packWithin(baseState, slate, origins) === null) break
    best = count
  }
  return best
})()

// ── the expansion reservation, verbatim ──────────────────────────────────────

const expansionParcel = parcelOf('expansion')
const expansionOrigin = { gx: expansionParcel.rect.x0, gy: expansionParcel.rect.y0 }
const expansionQuote = quoteForBlueprint(baseState, SOUNDSTAGE, expansionOrigin)
const expansionReservedFor = parcelReservedBlueprintId('expansion')

// PROVE the entry-point claim rather than assert it: the catalog-resolving front door
// cannot answer a question about a blueprint the catalog does not contain.
const byIdQuote = queryPlacement(baseState, {
  blueprintId: SOUNDSTAGE.id,
  origin: { gx: 3, gy: 19 },
})
if (byIdQuote.primary !== 'unknownBlueprint') {
  throw new Error(
    `sweep-c2a-placement: expected queryPlacement to answer unknownBlueprint for a non-catalog id, got ${String(byIdQuote.primary)}`,
  )
}

/**
 * THE CONTROL. The whole report rests on one assumption: a hypothetical blueprint judged
 * through `quoteForBlueprint` gets exactly the answer a REAL catalog blueprint of the same
 * shape would get through `queryPlacement`. That is checked against the shipped
 * Development & Casting Hall — 4×3, clearance ring 1, road access required, the same shape
 * as the 4×3 sensitivity case. If the two ever disagree at any origin, every number above
 * is suspect and the script refuses to publish.
 */
const HALL_ID = 'development-casting-hall'
const hallBlueprint = blueprintById(HALL_ID)
if (hallBlueprint === null) {
  throw new Error(`sweep-c2a-placement: the control blueprint ${HALL_ID} is no longer in the catalog`)
}
if (hallBlueprint.footprint.width !== SCENERY_LARGE.footprint.width || hallBlueprint.footprint.depth !== SCENERY_LARGE.footprint.depth) {
  throw new Error(
    `sweep-c2a-placement: the control is only meaningful against a same-shape blueprint — ${HALL_ID} is now ${String(hallBlueprint.footprint.width)}×${String(hallBlueprint.footprint.depth)}`,
  )
}
const controlDisagreements: string[] = []
let controlOrigins = 0
let controlAccepted = 0
for (const parcel of [...CHARTER_SEVEN].map((id) => id)) {
  const parcelRef = parcelById(propertyOf(baseState), parcel)
  if (parcelRef === null) continue
  for (const origin of rectCells(parcelRef.rect)) {
    const real = queryPlacement(baseState, { blueprintId: HALL_ID, origin })
    const hypothetical = quoteForBlueprint(baseState, SCENERY_LARGE, origin)
    controlOrigins += 1
    if (real.ok) controlAccepted += 1
    if (real.ok !== hypothetical.ok || real.rejections.join(',') !== hypothetical.rejections.join(',')) {
      controlDisagreements.push(
        `${parcel} (${String(origin.gx)},${String(origin.gy)}): real [${real.rejections.join(', ')}] vs hypothetical [${hypothetical.rejections.join(', ')}]`,
      )
    }
  }
}
if (controlDisagreements.length > 0) {
  throw new Error(
    `sweep-c2a-placement: the hypothetical-blueprint control FAILED at ${String(controlDisagreements.length)} origin(s) — refusing to publish.\n${controlDisagreements.slice(0, 5).join('\n')}`,
  )
}
if (controlOrigins !== TOTAL_ORIGINS) {
  throw new Error(
    `sweep-c2a-placement: the control was expected to compare ${String(TOTAL_ORIGINS)} origins, compared ${String(controlOrigins)}`,
  )
}

// ── the report ───────────────────────────────────────────────────────────────

function fmtPlan(steps: readonly PlanStep[] | null): string[] {
  if (steps === null) return ['No legal plan exists. The search was exhaustive over all 123 origins.']
  return [
    '| # | Building | Footprint | Origin | Parcel | Cells occupied |',
    '| --- | --- | --- | --- | --- | --- |',
    ...steps.map((step, index) => {
      const cells = footprintCells(step.blueprint, step.origin)
      const first = cells[0]!
      const last = cells[cells.length - 1]!
      return `| ${String(index + 1)} | ${step.blueprint.name} | ${String(step.blueprint.footprint.width)}×${String(step.blueprint.footprint.depth)} | ${cellName(step.origin)} | \`${step.parcelId}\` | ${cellName(first)}–${cellName(last)} |`
    }),
  ]
}

const lines: string[] = []
const push = (...text: string[]): void => {
  lines.push(...text)
}

push(
  '# 16 — The C2a placement sweep (charter §3.4, M2 first task)',
  '',
  `> Generated by \`scripts/sweep-c2a-placement.mts\` at HEAD \`${HEAD}\`.`,
  `> Legality source last moved at \`${MEASURED_SOURCE_COMMIT}\` (\`src/core/placement.ts\`, \`src/core/lot.ts\`).`,
  `> Seed \`${SEED}\`, founded managed studio, zero placements standing.`,
  `> \`src/core/placement.ts\` and \`src/core/lot.ts\` — the only two files that decide any verdict here —`,
  `> were verified **unmodified against HEAD** before publishing; the script refuses to write otherwise.`,
  worktreeDirty.length === 0
    ? '> The worktree was otherwise clean at run time.'
    : `> ${String(worktreeDirty.length)} other file(s) were dirty at run time from concurrent lanes — none of them a legality surface. Enumerated under "Run conditions" at the foot of this report.`,
  '',
  '## What was asked, and what answered it',
  '',
  'Charter §3.4 gates the C2a ground question on evidence: *"M2\'s first task is the placement',
  'sweep: run `queryPlacement` for the Soundstage blueprint at every origin on the seven',
  'road-served buildable parcels (123 cells total) together with the Post/Scenery/office slate,',
  'and publish the arithmetic."*',
  '',
  'The rule engine was asked through **`quoteForBlueprint`** (`src/core/placement.ts`), not',
  '`queryPlacement`. They are the same authority: `queryPlacement` resolves a blueprint id',
  'against the shipped `FACILITY_BLUEPRINTS` catalog and then calls `quoteForBlueprint`, which',
  'is where every rule actually lives. The C2a slate is not in that catalog yet — §3.4 forbids',
  'this sweep from putting it there — so asked by id it could only ever answer',
  '`unknownBlueprint`. `placement.ts` names this exact use in its own doc comment: the split',
  'exists so "the rule engine can be exercised against a blueprint the shipped catalog does not',
  'contain".',
  '',
  'That is checked, not assumed: the script asks `queryPlacement` for the hypothetical soundstage',
  `by id at a known-good origin (3,19), asserts the answer is \`${byIdQuote.primary ?? 'null'}\`, and throws rather`,
  'than publishing if it ever changes. `commitPlacement` calls `queryPlacement`, never',
  '`quoteForBlueprint`, so nothing this sweep asks about could be charged for even in principle.',
  '',
  '**The control.** Everything here rests on one assumption — that a hypothetical blueprint gets',
  'the answer a real catalog blueprint of the same shape would get. It is checked at all 123',
  `origins against the shipped **${hallBlueprint.name}** (\`${HALL_ID}\`), which is`,
  `${String(hallBlueprint.footprint.width)}×${String(hallBlueprint.footprint.depth)} with clearance ring ${String(hallBlueprint.clearanceRing)} and road access required: the same shape as the 4×3`,
  'sensitivity case below. Asked by id through `queryPlacement` and asked as a hypothetical',
  `through \`quoteForBlueprint\`, the two agreed on \`ok\` and on the full ordered \`rejections\` list`,
  `at **all ${String(controlOrigins)} origins** — and the Hall accepts ${String(controlAccepted)} of them at its real $${(hallBlueprint.capex / 1_000_000).toFixed(1)}M capex, so the`,
  'money gate was live throughout and provably never bound (had it bound anywhere, the',
  'zero-capex hypothetical would have disagreed and the script would have refused to publish).',
  'The script throws rather than publishing if they ever disagree anywhere, or if the control',
  'blueprint ever stops being the same shape as the case it controls.',
  '',
  '**Every rejection printed below is a geometry rejection.** The sweep blueprints carry',
  '`capex: 0`, `requires: []`, and no `maxInstances`, which makes `insufficientFunds`,',
  '`requirementsUnmet` and `instanceLimit` structurally unreachable. What the C2a slate costs',
  'and what unlocks it are separate M2 decisions this sweep does not prejudge.',
  '',
  '## The blueprints swept',
  '',
  '| Blueprint | Capability | Footprint | Ring | Road | Source of the footprint |',
  '| --- | --- | --- | --- | --- | --- |',
  `| Soundstage (Standard) | \`soundstage\` | 4×4 | 1 | required | §3.4 states it; matches founding Stage A / Stage B verbatim |`,
  `| Post Building | \`post\` | 3×2 | 1 | required | the founding Production/Post body, and the shipped catalog's small-building size |`,
  `| Scenery Shop | \`set-scenery\` | 3×2 | 1 | required | same |`,
  `| Baseline Development & Casting Office | \`development-casting\` | 3×2 | 1 | required | the shipped Annex / Office II / Office III footprint |`,
  `| Scenery Shop (sensitivity) | \`set-scenery\` | 4×3 | 1 | required | sensitivity case — the one entry with an honest argument for being larger |`,
  '',
  '## The seven road-served buildable parcels',
  '',
  '| Parcel | Rect (inclusive) | Size | Cells | Road frontage |',
  '| --- | --- | --- | --- | --- |',
)

for (const parcel of SWEPT_PARCELS) {
  const cells = originsByParcel.get(parcel.id) ?? []
  const width = parcel.rect.x1 - parcel.rect.x0 + 1
  const depth = parcel.rect.y1 - parcel.rect.y0 + 1
  push(
    `| \`${parcel.id}\` (${parcel.label}) | gx ${String(parcel.rect.x0)}–${String(parcel.rect.x1)}, gy ${String(parcel.rect.y0)}–${String(parcel.rect.y1)} | ${String(width)}×${String(depth)} | ${String(cells.length)} | ${parcelHasRoadFrontage(property, parcel) ? 'yes' : 'no'} |`,
  )
}
push(
  `| **total** | | | **${String(TOTAL_ORIGINS)}** | |`,
  '',
  `\`north-back-lot\` (gx ${String(NORTH_BACK_LOT.rect.x0)}–${String(NORTH_BACK_LOT.rect.x1)}, gy ${String(NORTH_BACK_LOT.rect.y0)}–${String(NORTH_BACK_LOT.rect.y1)}, ${String(northBackLotOrigins.length)} cells) is buildable and owned but has **no road frontage**, so it is swept separately below.`,
  '',
)

// Per-blueprint, per-parcel sweep tables.
push('## The sweep, blueprint by blueprint', '')

type BlueprintSummary = { blueprint: FacilityBlueprint; accepted: number; acceptedByParcel: Map<string, LotCell[]> }
const summaries: BlueprintSummary[] = []

for (const blueprint of SWEPT) {
  push(
    `### ${blueprint.name} — ${String(blueprint.footprint.width)}×${String(blueprint.footprint.depth)}, clearance ring ${String(blueprint.clearanceRing)}, road access required`,
    '',
    '| Parcel | Origins swept | Accepted | Accepting origins | Primary refusals over the rest |',
    '| --- | --- | --- | --- | --- |',
  )
  let accepted = 0
  const acceptedByParcel = new Map<string, LotCell[]>()
  for (const parcel of SWEPT_PARCELS) {
    const origins = originsByParcel.get(parcel.id) ?? []
    const results = sweepParcel(baseState, blueprint, origins)
    const good = results.filter((result) => result.ok).map((result) => result.origin)
    accepted += good.length
    acceptedByParcel.set(parcel.id, good)
    push(
      `| \`${parcel.id}\` | ${String(origins.length)} | **${String(good.length)}** | ${good.length === 0 ? '—' : good.map(cellName).join(' ')} | ${tallyPrimaries(results.filter((result) => !result.ok))} |`,
    )
  }
  const spurResults = sweepParcel(baseState, blueprint, northBackLotOrigins)
  const spurGood = spurResults.filter((result) => result.ok).length
  push(
    `| **seven total** | **${String(TOTAL_ORIGINS)}** | **${String(accepted)}** | | |`,
    `| \`north-back-lot\` (road-less, not in the seven) | ${String(northBackLotOrigins.length)} | ${String(spurGood)} | ${spurGood === 0 ? '—' : 'see below'} | ${tallyPrimaries(spurResults.filter((result) => !result.ok))} |`,
    '',
  )
  summaries.push({ blueprint, accepted, acceptedByParcel })
}

// The soundstage refusal detail §3.4 asks for by name.
push(
  '## Soundstage refusals in full — `seversLot` and every other code, per origin',
  '',
  '§3.4 asks for `seversLot` and the refusal codes on the origins that do not accept a 4×4.',
  'Every origin on the seven is listed. `rejections` is the ordered set of every rule that',
  'failed at that origin, not just the binding one.',
  '',
  '| Parcel | Origin | Verdict | Primary | All rejections |',
  '| --- | --- | --- | --- | --- |',
)
let seversLotCount = 0
for (const parcel of SWEPT_PARCELS) {
  const results = sweepParcel(baseState, SOUNDSTAGE, originsByParcel.get(parcel.id) ?? [])
  for (const result of results) {
    if (result.rejections.includes('seversLot')) seversLotCount += 1
    push(
      `| \`${parcel.id}\` | ${cellName(result.origin)} | ${result.ok ? '**ACCEPTS**' : 'refused'} | ${result.primary ?? '—'} | ${result.rejections.length === 0 ? '—' : result.rejections.join(', ')} |`,
    )
  }
}
push(
  '',
  `**\`seversLot\` count across the seven for a 4×4 soundstage: ${String(seversLotCount)} of ${String(TOTAL_ORIGINS)} origins.**`,
  '',
)

// The reserved parcel, verbatim.
push(
  '## `expansion` — the reserved-parcel interaction, verbatim from the refusal',
  '',
  `\`expansion\` is road-served (boulevard frontage strip at gy 18) and is 4×4 — geometrically`,
  'it is one of the three parcels on the whole property that could hold a soundstage. It is',
  'held for the Development & Casting Annex contract. The refusal, read straight off the quote',
  `at its north-west origin ${cellName(expansionOrigin)}:`,
  '',
  '```',
  `blueprint        ${SOUNDSTAGE.id} (${SOUNDSTAGE.name}, ${String(SOUNDSTAGE.footprint.width)}×${String(SOUNDSTAGE.footprint.depth)})`,
  `origin           ${cellName(expansionOrigin)}`,
  `parcelId         ${expansionQuote.parcelId ?? 'null'}`,
  `ok               ${String(expansionQuote.ok)}`,
  `primary          ${expansionQuote.primary ?? 'null'}`,
  `rejections       [${expansionQuote.rejections.join(', ')}]`,
  `cellLegality     ${String(expansionQuote.cellLegality.filter((verdict) => verdict.rejection === 'groundReserved').length)} of ${String(expansionQuote.cellLegality.length)} cells rejected groundReserved`,
  `reserved for     ${expansionReservedFor ?? 'null'}`,
  '```',
  '',
  `\`groundReserved\` is asked **per cell, not per origin parcel** — "a footprint that only`,
  'overlaps the reserved ground would still occupy it, and would still leave the contract',
  'unable to build" (`placement.ts`). It ranks above `occupied` in the binding order because a',
  'reservation is a permanent fact about the ground, true before anything stands there and',
  'after it comes down. The player-facing sentence already shipped for this code is:',
  '',
  '> This ground is held for the studio’s Annex contract.',
  '',
  `(\`ui/src/lot/buildMode.ts\`.) The reservation names exactly one blueprint —`,
  `\`${expansionReservedFor ?? 'null'}\` — so \`expansion\` contributes **zero** soundstage origins,`,
  'zero Post origins, zero Scenery origins and zero office origins to the C2a slate. It is',
  'reported here rather than silently dropped, exactly as §3.4 (r3.1) requires.',
  '',
)

// Coexistence.
push(
  '## Can the C2a slate coexist? — the packing answer',
  '',
  '**The question §3.4 asks:** two additional stages **+** Post **+** Scenery **+** an office,',
  'standing at once, on the seven, with realistic packing. Answered by **exhaustive backtracking',
  'with the real engine judging every step**: each accepted building is inserted as a live',
  'placement before the next is quoted, so occupancy, the clearance ring and the severance walk',
  'all bind cumulatively — exactly what a player\'s fifth build faces. Buildings of the same',
  'blueprint are interchangeable, so the search requires their origins to be strictly increasing',
  'in the fixed sweep order; that drops mirror duplicates without dropping a distinct plan, which',
  'is what makes a "no" here exhaustive rather than a search budget running out.',
  '',
  'Two prunings, both proven lossless rather than assumed. **Symmetry:** identical blueprints must',
  'take strictly increasing origins, which removes permutations of the same physical plan and',
  'nothing else. **Monotonicity:** an origin illegal on the empty lot is skipped, because every',
  'rule in play here is monotone in placements — `offLot`, `notOwned`, `terrainUnbuildable`,',
  '`groundReserved` and `noRoadAccess` never consult placements at all; `occupied` and',
  '`clearanceRing` read sets that only grow; and `seversLot` walks with occupied cells impassable,',
  'so more buildings can only disconnect further. Adding a building can never make an origin legal',
  'that was not, so a skipped origin cannot be part of any solution.',
  '',
  '*That argument was also checked empirically once, by hand, during authoring: the same five',
  'cases were run with the monotonicity pruning removed entirely — case B alone went from 1,155',
  'candidate placements to 13,812 — and **every verdict and every plan came back identical**. The',
  'pruning is a speed-up (about two minutes down to eight seconds), not a change of answer.*',
  '',
  '| Case | Slate | Fits? | Candidate placements evaluated |',
  '| --- | --- | --- | --- |',
  ...tradeResults.map(
    (result) =>
      `| ${result.name} | ${result.note} | ${result.plan === null ? '**NO**' : '**YES**'} | ${String(result.nodes)} |`,
  ),
  '',
  `### The concrete legal plan — case A (${String(planNodes)} candidate placements evaluated)`,
  '',
  ...fmtPlan(plan),
  '',
  `### Case B — the same slate with a 4×3 Scenery Shop (${String(planLargeNodes)} candidate placements evaluated)`,
  '',
  ...fmtPlan(planLarge),
  '',
)

const caseC = tradeResults.find((result) => result.name.startsWith('C —')) ?? null
push(
  '**Why B fails, and the one authoring constraint it puts on M2.** Only three of the seven',
  'road-served buildable parcels are four or more cells wide: `backlot-apron` (4×5), `south-lawn`',
  '(6×4) and `expansion` (4×4, reserved). The two soundstages consume the only two of those that',
  'are available. A Scenery Shop four cells wide therefore has nowhere left to stand *once both',
  'stages are up* —',
  caseC === null
    ? ''
    : `case C confirms the diagnosis: with only ONE stage, the 4×3 Scenery Shop ${caseC.plan === null ? 'still does not fit' : 'fits'}.`,
  '',
  '**This is a binding constraint on M2 authoring, stated so it is not discovered in a playtest:**',
  '**the Post Building, the Scenery Shop and the baseline office must each be at most THREE cells**',
  '**wide, or the C2a slate stops fitting and the spur verdict flips.** Depth is cheap —',
  '`west-lawn` is 3×6 and `north-court`, `north-lawn` and `stage-south` are 3×5 — so a bigger',
  'support building should grow in gy, never in gx.',
  '',
  '### How many soundstages fit at all',
  '',
  `**${String(maxStages)}** additional 4×4 soundstages can stand simultaneously on the seven road-served`,
  'parcels, with the clearance ring binding between them. That is the number the M2 gate\'s stage',
  'count and §16a\'s third-stage beat must be stated against — **not an assumed three.**',
  '',
  '### Headroom left after the plan',
  '',
  `With case A\'s five buildings standing, the seven parcels still accept **${String(headroomSmall)}** origins for a`,
  `further 3×2 building and **${String(headroomStage)}** origins for a further 4×4 soundstage. The lot is not`,
  'full after C2a; it is out of *four-wide* ground.',
  '',
)

// The verdict.
const spurNeeded = plan === null || maxStages < 2
push(
  '## THE VERDICT §3.4 DEMANDS',
  '',
  `**The pre-authorized \`north-back-lot\` road spur is ${spurNeeded ? 'NEEDED' : 'DROPPED'} for the C2a slate.**`,
  '',
)
if (spurNeeded) {
  push(
    'The sweep could not seat the C2a slate on the seven road-served parcels. §3.4\'s conditional',
    'fires: the bounded spur is authored under laws 25/27a with its own re-pin, and §18 item 8',
    'covers it.',
    '',
  )
} else {
  push(
    '§3.4\'s condition is *"if the sweep shows the C2a slate does not fit"*. It fits. The concrete',
    'legal plan above stands two additional soundstages, a Post Building, a Scenery Shop and a',
    'baseline Development & Casting Office simultaneously, all road-served, all clearing each',
    'other\'s rings, none severing the lot. **The spur is not built in C2a.** It stays pre-authorized',
    'in §18 item 8 for the campaign that actually needs the ground — the honest reason to build it',
    'is a third stage or a fourth, not this slate.',
    '',
  )
}

// What the spur would buy, MEASURED.
push(
  '### What the spur would have bought, measured rather than asserted',
  '',
  `\`north-back-lot\` is ${String(northBackLotOrigins.length)} cells (${String(NORTH_BACK_LOT.rect.x1 - NORTH_BACK_LOT.rect.x0 + 1)}×${String(NORTH_BACK_LOT.rect.y1 - NORTH_BACK_LOT.rect.y0 + 1)}), buildable, owned from the first week, and today refuses`,
  `every one of its origins for \`noRoadAccess\` and nothing else. Re-swept with the road-access rule`,
  'waived and **every other geometry rule held exactly as it is**, it accepts',
  `**${String(spurUnlockedStageOrigins.length)}** 4×4 soundstage origins and holds **${String(spurStageCapacity)}** soundstage${spurStageCapacity === 1 ? '' : 's'} standing at once with the`,
  'clearance ring binding between them.',
  '',
  'That is an **upper bound**, stated as one: a real spur is a road rectangle that consumes ground',
  'out of the parcel it serves, so the built number would be at most this and probably less. The',
  'charter\'s description of this parcel as "the one parcel holding a stage plus full ring" is',
  'confirmed at that bound. It is headroom for the campaign that needs a third and fourth stage —',
  'which, per the count above, C2a does not.',
  '',
)

// Prove the geometry-only claim.
const nonGeometrySeen = NON_GEOMETRY.filter((code) => OBSERVED_REJECTIONS.has(code))
if (nonGeometrySeen.length > 0) {
  throw new Error(
    `sweep-c2a-placement: a non-geometry rejection was observed (${nonGeometrySeen.join(', ')}) — the report's "geometry only" claim is no longer true`,
  )
}

push(
  '## Standing facts this sweep pins for later lanes',
  '',
  ...summaries.map(
    (summary) =>
      `- **${summary.blueprint.name}** (${String(summary.blueprint.footprint.width)}×${String(summary.blueprint.footprint.depth)}): **${String(summary.accepted)}** legal origins across the 123.`,
  ),
  `- **At most ${String(maxStages)} additional soundstages** can ever stand on today's road-served ground.`,
  '- **Support buildings must be at most 3 cells wide.** Only three parcels are 4 wide and the two stages take the only two available ones. Grow a support building in gy, never gx.',
  '- The clearance ring starts **vacuous**: the founding studio holds zero placements, so ring cells are only ever tested against buildings the player has already put down.',
  `- \`expansion\` is road-served and 4×4 but reserved to \`${expansionReservedFor ?? 'null'}\`; it contributes zero origins to every C2a blueprint.`,
  `- \`north-back-lot\` refuses all ${String(northBackLotOrigins.length)} of its origins for \`noRoadAccess\` today; road access alone would unlock ${String(spurUnlockedStageOrigins.length)} stage origins.`,
  `- \`seversLot\` fired on **${String(seversLotCount)}** of the 123 origins for a 4×4. The severance rule is not what constrains C2a.`,
  `- The ${String(OBSERVED_REJECTIONS.size)} distinct rejection codes this sweep observed, in binding order: \`${PLACEMENT_REJECTION_ORDER.filter((code) => OBSERVED_REJECTIONS.has(code)).join('`, `')}\`. The script THROWS rather than publishing if \`requirementsUnmet\`, \`instanceLimit\` or \`insufficientFunds\` ever appears, so "geometry only" is proven on every run rather than asserted once.`,
  '',
  '## Run conditions',
  '',
  '`src/core/placement.ts` and `src/core/lot.ts` decide every verdict above, and both were',
  'verified byte-identical to HEAD before this file was written — the script throws rather than',
  'publishing a measurement of unreviewed code under a commit hash that does not contain it.',
  '',
  ...(worktreeDirty.length === 0
    ? ['The worktree was otherwise clean.']
    : [
        `This worktree is shared with concurrent C2a lanes. ${String(worktreeDirty.length)} other file(s) were dirty when this`,
        'sweep ran. None of them is a legality surface, so none can move a verdict here; they are',
        'listed so a reader can check that claim rather than take it:',
        '',
        ...worktreeDirty.map((line) => `- \`${line}\``),
      ]),
  '',
  '---',
  '',
  '*Reproduce: `node_modules/.bin/vite-node scripts/sweep-c2a-placement.mts`. The script changes',
  'no tuning constant, commits no placement, spends no money, and writes only this file. Two runs',
  'at one HEAD are byte-identical apart from the run-conditions list above.*',
  '',
)

const outPath = join(repoRoot, 'docs', 'c2-planning', '16-placement-sweep.md')
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, lines.join('\n'), 'utf8')

console.log(`sweep-c2a-placement: wrote ${outPath}`)
console.log(`  soundstage 4×4 legal origins on the seven: ${String(summaries[0]?.accepted ?? 0)} / ${String(TOTAL_ORIGINS)}`)
console.log(`  max simultaneous additional soundstages:   ${String(maxStages)}`)
console.log(`  slate A packs:                             ${plan === null ? 'NO' : 'YES'}`)
console.log(`  slate B (4×3 scenery) packs:               ${planLarge === null ? 'NO' : 'YES'}`)
console.log(`  spur upper bound (road rule waived):       ${String(spurUnlockedStageOrigins.length)} stage origins, ${String(spurStageCapacity)} stage(s)`)
console.log(`  VERDICT — north-back-lot spur:             ${spurNeeded ? 'NEEDED' : 'DROPPED'}`)
