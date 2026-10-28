// ── P18: one season workload: shared capacity and real paid weekly work (contract §4, §5) ──────────────
//
// Twelve counted work units in five blocks (3/1/1/4/3), at most one unit per weekly advance.
// CAPACITY is requested inside the one allocation owner: the season is a typed participant of
// `advanceManagedProductions`' fixed-point sweep, served at its own place in the existing admitted-work order
// (longest waiting first; on an equal wait productions before seasons, then the ordinal law) and retaining every claim
// it already holds. No second allocator runs against the same free slots.
// MONEY is the separate tick step 7.8, after the week's mandatory charges and the loan installment: a unit is credited
// only when the valid people, the live P16 production and distribution permissions, the exact operational sound chain,
// the held capacity and the paid unit cost all exist for that week. Block resources follow the production
// resource-release law: what the next block requires is retained (rehearsal → shooting keeps the stage and its set);
// everything else releases the week the block completes.
//
// TERMINAL BOUNDARY (Sprint 13, contract §6): at the end of the same step, at boundary T = week + 1, a season whose
// twelve units are credited is delivered (the delivery milestone less the late deduction, paid max(0, E − P)) when its
// people and both P16 permissions still hold; otherwise, at T = C + 20, it is cancelled for deadline failure under the
// v1 settlement (tvSettlement.ts). A stall before the deadline never cancels. A delivered season's exclusive window
// [delivered, delivered + 52) ends with a noncash receipt at its end boundary. Pure: no RNG, no clock, no I/O; this
// module never writes `operations.workflows`.

import { lifecycleStatus } from './careerLifecycle.js'
import { activeContract } from './employment.js'
import { facilitySlotKey } from './occupancy.js'
import type { SweepParticipant } from './operations.js'
import { facilityBodyCentre, gridDistance, sceneryLoadInWeeksForDistance } from './sceneryLoadIn.js'
import { bindableSetsOn, heldSetIds, wearSetAtWrap } from './sets.js'
import { adoptionChainOperational } from './technologyAdoption.js'
import { tvDistributionPermission, tvProductionPermission } from './tvCommission.js'
import { appendTvReceipt, liveTvSeason, nextTvBlock, TV_WORK_UNITS_TOTAL, tvBlockDefinition, tvReservedPeople } from './tvReaders.js'
import { cancelTvSeasonIn } from './tvSettlement.js'
import type { TvWorkBlockDefinition } from './tvReaders.js'
import type { TelevisionRoot, TvAgreement, TvMilestoneKind, TvReservation, TvSceneryWithheldReason, TvSeason, TvStall } from './tvTypes.js'
import type { GameState, LedgerEntry, StudioOperations, StudioSet } from './types.js'

function reservationKey(reservation: TvReservation): string {
  return facilitySlotKey(reservation.facilityId, reservation.slot)
}

function replaceSeason(root: TelevisionRoot, season: TvSeason): TelevisionRoot {
  return { ...root, seasons: root.seasons.map((row) => (row.seasonId === season.seasonId ? season : row)) }
}

function agreementFor(root: TelevisionRoot, season: TvSeason): TvAgreement {
  const agreement = root.agreements.find((row) => row.agreementId === season.agreementId)
  if (agreement === undefined) throw new Error(`tv season: season ${season.seasonId} names no agreement ${season.agreementId}`)
  return agreement
}

export const tvWorkComplete = (season: TvSeason): boolean => season.work.creditedUnits >= TV_WORK_UNITS_TOTAL

/**
 * Why the advance from `week` may do no work on this season apart from capacity and cash, or null. Asked live, never
 * from a stored copy: the final boundary, each required person's contract and lifecycle, the producer's and the
 * commissioner's P16 permissions, and the exact operational sound chain once the stage is needed.
 */
export function tvWorkGate(state: GameState, season: TvSeason, week: number): TvStall | null {
  if (week >= season.finalWeek) return { kind: 'final-boundary' }
  for (const talentId of tvReservedPeople(season)) {
    if (activeContract(state, talentId, week) === undefined || lifecycleStatus(state, talentId) === 'retired') return { kind: 'participant', talentId }
  }
  const production = tvProductionPermission(state, season.propertyId, week)
  if (production.kind !== 'permitted') return { kind: 'rights', reason: `production: ${production.reason}` }
  const distribution = tvDistributionPermission(state, season.propertyId, week)
  if (distribution.kind !== 'permitted' || distribution.licenceId !== season.distributionLicenceId) {
    return { kind: 'rights', reason: `distribution: ${distribution.kind === 'permitted' ? `answered by ${String(distribution.licenceId)}` : distribution.reason}` }
  }
  if (season.work.block !== 'scripts' && season.work.block !== 'preparation') {
    const adoption = state.technology.adoptions.find((row) => row.id === season.adoptionId)
    if (adoption === undefined || !adoptionChainOperational(state, adoption)) return { kind: 'sound-chain' }
  }
  return null
}

export type TvAllocationContext = {
  operations: StudioOperations
  sets: readonly StudioSet[]
  /** Every other owner's bare `facilityId:slot` keys; the season's own are excluded. */
  occupied: ReadonlySet<string>
  stageFacilityId: string
  postFacilityId: string
}

export type TvSweepOutcome = { reservations: TvReservation[]; setId: string | null }

/**
 * Acquire what `block` requires, retaining what the season already holds, in the allocation owners' total order
 * (facility id, then slot). The sound chain is exact: a stage must be the adoption's stage and Post its Post. Rehearsal
 * acquires the stage+set composite atomically; shooting retains both and adds a scenery crew.
 */
export function allocateTvBlock(season: TvSeason, block: TvWorkBlockDefinition, context: TvAllocationContext): ({ ok: true } & TvSweepOutcome) | { ok: false; stall: TvStall } {
  const occupied = new Set(context.occupied)
  const facilities = [...context.operations.facilities]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .filter((facility) => facility.capability === 'soundstage' ? facility.id === context.stageFacilityId
      : facility.capability === 'post' ? facility.id === context.postFacilityId : true)
  let setId = season.setId
  const needsStage = block.capabilities.includes('soundstage')
  const retainingStage = season.reservations.some((reservation) => reservation.capability === 'soundstage')
  if (needsStage && !retainingStage) {
    const stage = facilities.find((facility) => facility.capability === 'soundstage')
    const free = stage === undefined ? -1 : [...Array(stage.capacity).keys()].find((slot) => !occupied.has(facilitySlotKey(stage.id, slot))) ?? -1
    if (stage === undefined || free < 0) return { ok: false, stall: { kind: 'facility-capacity', capability: 'soundstage' } }
    // ponytail: TV-held sets are invisible to heldSetIds(operations), which productions read; safe while every
    // soundstage has one slot (the slot holder is the set's only tenant). Feed tvSeasonHoldingSet into the production
    // binding if a stage ever carries two slots.
    const candidates = bindableSetsOn(context.sets, stage.id, heldSetIds(context.operations))
    if (candidates.length === 0) return { ok: false, stall: { kind: 'set-unavailable' } }
    setId = candidates[0]!.id
  }
  const reservations: TvReservation[] = []
  for (const capability of block.capabilities) {
    const retained = season.reservations.find((reservation) => reservation.capability === capability)
    if (retained !== undefined) {
      reservations.push(retained)
      continue
    }
    let allocated: TvReservation | null = null
    for (const facility of facilities) {
      if (facility.capability !== capability) continue
      for (let slot = 0; slot < facility.capacity && allocated === null; slot++) {
        if (!occupied.has(facilitySlotKey(facility.id, slot))) allocated = { facilityId: facility.id, capability, slot }
      }
      if (allocated !== null) break
    }
    if (allocated === null) return { ok: false, stall: { kind: 'facility-capacity', capability } }
    occupied.add(reservationKey(allocated))
    reservations.push(allocated)
  }
  return { ok: true, reservations, setId }
}

export type TvSweepRequest = {
  seasonId: string
  participant: SweepParticipant
  /** The cause of the last refused attempt in this sweep, read after it when no outcome came back. */
  failure: { stall: TvStall | null }
  /** The non-capacity gate of this week; a gated season keeps what it holds and takes nothing new. */
  gate: TvStall | null
}

/** The live season's place in the admitted-work order: weeks waited beyond its credited units. */
export function tvWaitWeeks(season: TvSeason, week: number): number {
  return Math.max(0, week - season.commitWeek - season.work.creditedUnits)
}

/**
 * The live season as a typed participant of the week's one allocation sweep, or null when it requests nothing (no live
 * season, work complete, not managed). A gated season still participates so its held slots stay visible to every
 * production from the first round; it acquires nothing.
 */
export function tvSweepRequest(state: GameState, week: number): TvSweepRequest | null {
  const season = liveTvSeason(state.television)
  if (season === null || tvWorkComplete(season) || state.founding !== null || state.operations.mode !== 'managed') return null
  const adoption = state.technology.adoptions.find((row) => row.id === season.adoptionId)
  if (adoption === undefined || adoption.postFacilityId === null) throw new Error(`tv season: live season "${season.seasonId}" names no sound adoption "${season.adoptionId}"`)
  const held = new Set(season.reservations.map(reservationKey))
  const gate = tvWorkGate(state, season, week)
  const failure: TvSweepRequest['failure'] = { stall: null }
  const block = tvBlockDefinition(season.work.block)
  const participant: SweepParticipant = {
    id: season.seasonId,
    kind: 'tvSeason',
    waitWeeks: tvWaitWeeks(season, week),
    held,
    attempt: (occupiedByOthers, operations, sets) => {
      if (gate !== null) return { held, result: { reservations: season.reservations, setId: season.setId } satisfies TvSweepOutcome }
      const allocation = allocateTvBlock(season, block, { operations, sets, occupied: occupiedByOthers, stageFacilityId: adoption.stageFacilityId, postFacilityId: adoption.postFacilityId! })
      if (!allocation.ok) {
        failure.stall = allocation.stall
        return null
      }
      return { held: new Set(allocation.reservations.map(reservationKey)), result: { reservations: allocation.reservations, setId: allocation.setId } satisfies TvSweepOutcome }
    },
  }
  return { seasonId: season.seasonId, participant, failure, gate }
}

/** Write the sweep's answer onto the season: what it now holds, or why it waits. */
export function applyTvSweep(root: TelevisionRoot, request: TvSweepRequest, outcome: TvSweepOutcome | undefined, week: number): TelevisionRoot {
  const season = root.seasons.find((row) => row.seasonId === request.seasonId)
  if (season === undefined) throw new Error(`tv season: sweep names unknown season ${request.seasonId}`)
  if (request.gate !== null) return replaceSeason(root, { ...season, work: { ...season.work, stall: request.gate } })
  if (outcome === undefined) return replaceSeason(root, { ...season, work: { ...season.work, stall: request.failure.stall } })
  const acquiredStage = outcome.reservations.some((r) => r.capability === 'soundstage') && !season.reservations.some((r) => r.capability === 'soundstage')
  return replaceSeason(root, {
    ...season,
    reservations: outcome.reservations,
    setId: outcome.setId,
    work: { ...season.work, stall: null, stageHeldSinceWeek: acquiredStage ? week : season.work.stageHeldSinceWeek },
  })
}

/**
 * Weeks the scenery still has to travel from the shop to the stage (0 when it is there), or why the trip cannot be
 * derived. The film law withholds an underivable trip and never guesses (`sceneryLoadIn.ts`); the season waits too.
 */
export function tvSceneryLoadIn(state: Pick<GameState, 'placement' | 'property'>, season: TvSeason, week: number): number | TvSceneryWithheldReason {
  const stage = season.reservations.find((reservation) => reservation.capability === 'soundstage')
  const scenery = season.reservations.find((reservation) => reservation.capability === 'set-scenery')
  const called = season.work.stageHeldSinceWeek
  if (stage === undefined || scenery === undefined || called === null) return 0
  const to = facilityBodyCentre(state, stage.facilityId)
  if (to === null) return 'stage-has-no-body'
  const from = facilityBodyCentre(state, scenery.facilityId)
  if (from === null) return 'scenery-shop-has-no-body'
  return Math.max(0, sceneryLoadInWeeksForDistance(gridDistance(from, to)) - (week - called))
}

export type TelevisionAdvance = { television: TelevisionRoot | undefined; cash: number; ledger: LedgerEntry[]; sets: readonly StudioSet[] }

/**
 * Tick step 7.8, the MONEY step for the advance `week` → `week` + 1: at most one valid paid work unit for the live
 * season on the capacity the week's one sweep granted it, then the block's completion: the scripts and picture-lock
 * milestones (earned E, paid max(0, E − P)), the writer's release, set wear at the end of shooting, and the release of
 * every resource the next block does not require; then the terminal boundary (delivery or the deadline cancellation)
 * and the distribution-window expiry. `cash` is what is left after the week's mandatory charges, so "available cash"
 * is literal (contract §5). It allocates nothing.
 */
export function advanceTelevisionWeek(state: GameState, facts: { cash: number; sets: readonly StudioSet[] }, week: number): TelevisionAdvance {
  if (state.television === undefined || state.founding !== null || state.operations.mode !== 'managed') return { television: state.television, cash: facts.cash, ledger: [], sets: facts.sets }
  const worked = workTelevisionWeek(state, facts, week)
  const resolved = resolveTelevisionBoundary(state, worked, week)
  return { ...resolved, television: expireTvDistribution(resolved.television!, week + 1) }
}

/**
 * Contract §6 at boundary T = week + 1, after the week's unit: lawful delivery first; if the season is still live at
 * its final boundary, cancel it for deadline failure, paying U0 then K from the cash left after this advance's charges.
 */
function resolveTelevisionBoundary(state: GameState, worked: TelevisionAdvance, week: number): TelevisionAdvance {
  const boundary = week + 1
  const season = liveTvSeason(worked.television)
  if (worked.television === undefined || season === null) return worked
  // FIX-S13A-1 item 1: the deadline resolves AT C + 20, so a season still live past it is a broken record (the save
  // validator refuses one at or past its final week); never write a cancellation at a boundary the contract has no rule for.
  if (boundary > season.finalWeek) throw new Error(`tv season: live season ${season.seasonId} reached boundary ${boundary}, past its final boundary ${season.finalWeek}`)
  if (tvWorkComplete(season)) {
    const refusal = tvDeliveryRefusal(state, season, week)
    if (refusal === null) return deliverTvSeason(worked, season, boundary, week)
    if (boundary < season.finalWeek) return { ...worked, television: replaceSeason(worked.television, { ...season, work: { ...season.work, stall: refusal } }) }
  }
  if (boundary < season.finalWeek) return worked
  const cancelled = cancelTvSeasonIn(worked.television, season.seasonId, { week: boundary, cause: 'deadline', ledgerWeek: week, cash: worked.cash, closureId: null })
  return { ...worked, television: cancelled.television, cash: cancelled.cash, ledger: [...worked.ledger, ...cancelled.ledger] }
}

/**
 * Why a season with twelve credited units cannot be accepted at the end of the advance from `week`, or null: the same
 * live people and P16 permission checks as a work unit (contract §7 "before each work unit and delivery"). The sound
 * chain is a work requirement, not a delivery one, and the final boundary is the caller's.
 */
export function tvDeliveryRefusal(state: GameState, season: TvSeason, week: number): TvStall | null {
  const gate = tvWorkGate(state, season, week)
  return gate === null || gate.kind === 'sound-chain' ? null : gate
}

/**
 * Accept the master at boundary T (contract §5-§6): the delivery milestone earned is the frozen 240,000 less
 * min(max, perWeek × max(0, T − due)), recorded on its own noncash receipt when positive, and paid max(0, E − P).
 * The status change releases the five company members; every reservation went back at the last block's completion.
 */
function deliverTvSeason(worked: TelevisionAdvance, season: TvSeason, boundary: number, week: number): TelevisionAdvance {
  // FIX-S13A-1 item 7: the twelfth unit's block completion released every slot; a slot still held here is a broken record.
  if (season.reservations.length > 0) throw new Error(`tv season: season ${season.seasonId} reached delivery still holding ${season.reservations.length} slot(s)`)
  let root = worked.television!
  const agreement = agreementFor(root, season)
  const terms = agreement.terms
  const lateWeeks = Math.max(0, boundary - terms.dueWeek)
  const reduction = Math.min(terms.lateDeductionMax, terms.lateDeductionPerWeek * lateWeeks)
  const base = { week: boundary, seasonId: season.seasonId, agreementId: agreement.agreementId }
  root = appendTvReceipt(root, { ...base, kind: 'delivered', lateWeeks }).root
  if (reduction > 0) root = appendTvReceipt(root, { ...base, kind: 'deliveryReduction', amount: reduction }).root
  const ledger = [...worked.ledger]
  let cash = worked.cash
  root = earnMilestone(root, season, 'delivery', terms.milestones.delivery - reduction, boundary, week, ledger, (amount) => { cash += amount })
  root = replaceSeason(root, { ...season, status: 'delivered', deliveredWeek: boundary, work: { ...season.work, stall: null } })
  return { ...worked, television: root, cash, ledger }
}

/** Contract §6: the exclusive window ends at delivered + 52; a noncash receipt marks it, nothing is paid or reversed. */
export function expireTvDistribution(root: TelevisionRoot, boundary: number): TelevisionRoot {
  let next = root
  for (const season of root.seasons) {
    if (season.status !== 'delivered') continue
    // FIX-S13A-1 item 8: a delivered season without its delivered week is a broken record, never skipped.
    if (season.deliveredWeek === undefined) throw new Error(`tv distribution: delivered season ${season.seasonId} carries no deliveredWeek`)
    if (boundary !== season.deliveredWeek + agreementFor(root, season).terms.distributionWeeks) continue
    if (next.receipts.some((r) => r.kind === 'distributionExpired' && r.seasonId === season.seasonId)) continue
    next = appendTvReceipt(next, { kind: 'distributionExpired', week: boundary, seasonId: season.seasonId, agreementId: season.agreementId }).root
  }
  return next
}

/** The paid unit of the advance `week` → `week` + 1 (Sprint 12's step body, unchanged). */
function workTelevisionWeek(state: GameState, facts: { cash: number; sets: readonly StudioSet[] }, week: number): TelevisionAdvance {
  const boundary = week + 1
  let root = state.television
  let cash = facts.cash
  let sets = facts.sets
  const ledger: LedgerEntry[] = []
  const season = liveTvSeason(root)
  const done = (): TelevisionAdvance => ({ television: root, cash, ledger, sets })
  if (root === undefined || season === null || tvWorkComplete(season) || state.founding !== null || state.operations.mode !== 'managed') return done()
  const stall = (cause: TvStall): TelevisionAdvance => {
    root = replaceSeason(root!, { ...season, work: { ...season.work, stall: cause } })
    return done()
  }
  // The sweep already recorded a gate or a capacity stall; a season holding everything re-asks the gate here, after
  // this week's own actions and charges, so a person or a right lost since the sweep still stops the unit.
  const gate = tvWorkGate(state, season, week)
  if (gate !== null) return stall(gate)
  const block = tvBlockDefinition(season.work.block)
  const missing = block.capabilities.find((capability) => !season.reservations.some((reservation) => reservation.capability === capability))
  if (missing !== undefined) return season.work.stall !== null ? done() : stall({ kind: 'facility-capacity', capability: missing })
  if (season.work.block === 'shooting') {
    const loadIn = tvSceneryLoadIn(state, season, week)
    if (typeof loadIn === 'string') return stall({ kind: 'scenery-load-in-withheld', reason: loadIn })
    if (loadIn > 0) return stall({ kind: 'scenery-load-in', weeksRemaining: loadIn })
  }
  const agreement = agreementFor(root, season)
  if (cash < agreement.terms.unitSpend) return stall({ kind: 'cash', required: agreement.terms.unitSpend, available: cash })
  // The real expense and the unit, atomically: one receipt, one ledger row carrying its id.
  const creditedUnits = season.work.creditedUnits + 1
  const blockCredited = season.work.blockCredited + 1
  let working: TvSeason = { ...season, work: { ...season.work, creditedUnits, blockCredited, lastCreditedWeek: boundary, stall: null } }
  const unit = appendTvReceipt(root, { kind: 'unitCredited', week: boundary, seasonId: season.seasonId, agreementId: agreement.agreementId, block: season.work.block, creditedUnits, amount: agreement.terms.unitSpend })
  root = unit.root
  cash -= agreement.terms.unitSpend
  ledger.push({ week, kind: 'tvProductionSpend', amount: -agreement.terms.unitSpend, note: unit.receiptId })
  if (blockCredited === block.units) {
    root = appendTvReceipt(root, { kind: 'blockCompleted', week: boundary, seasonId: season.seasonId, agreementId: agreement.agreementId, block: season.work.block }).root
    if (season.work.block === 'scripts') {
      root = earnMilestone(root, working, 'scripts', agreement.terms.milestones.scripts, boundary, week, ledger, (amount) => { cash += amount })
      working = { ...working, writerReleasedWeek: boundary }
      root = appendTvReceipt(root, { kind: 'writerReleased', week: boundary, seasonId: season.seasonId, agreementId: agreement.agreementId, talentId: season.roster.writerId }).root
    } else if (season.work.block === 'shooting') {
      root = earnMilestone(root, working, 'pictureLock', agreement.terms.milestones.pictureLock, boundary, week, ledger, (amount) => { cash += amount })
      sets = wearSetAtWrap(sets, working.setId)
    }
    const next = nextTvBlock(season.work.block)
    // The last block keeps its block name with every unit credited; delivery needs no capacity, so every slot goes
    // back to the pool now and the five company members stay engaged until the boundary resolution below.
    const retained = next === null ? [] : tvBlockDefinition(next).capabilities
    working = {
      ...working,
      reservations: working.reservations.filter((reservation) => retained.includes(reservation.capability)),
      work: next === null ? working.work : { ...working.work, block: next, blockCredited: 0 },
    }
  }
  root = replaceSeason(root, working)
  return done()
}

/** Earn a milestone at boundary T and pay max(0, E_new − P) in the advance week (contract §5). */
function earnMilestone(root: TelevisionRoot, season: TvSeason, kind: TvMilestoneKind, amount: number, boundary: number, week: number,
  ledger: LedgerEntry[], credit: (amount: number) => void): TelevisionRoot {
  const agreement = agreementFor(root, season)
  const earned = agreement.earned + amount
  const pay = Math.max(0, earned - agreement.received)
  let next: TelevisionRoot = { ...root, agreements: root.agreements.map((row) => row.agreementId === agreement.agreementId
    ? { ...agreement, earned, received: agreement.received + pay, milestones: [...agreement.milestones, { kind, week: boundary, earned: amount, paid: pay }] }
    : row) }
  next = appendTvReceipt(next, { kind: 'milestoneEarned', week: boundary, seasonId: season.seasonId, agreementId: agreement.agreementId, milestone: kind, amount }).root
  if (pay > 0) {
    const paid = appendTvReceipt(next, { kind: 'milestonePaid', week: boundary, seasonId: season.seasonId, agreementId: agreement.agreementId, milestone: kind, amount: pay })
    next = paid.root
    ledger.push({ week, kind: 'tvMilestonePayment', amount: pay, note: paid.receiptId })
    credit(pay)
  }
  return next
}
