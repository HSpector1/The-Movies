// ── P18: leaf readers over the lazy television root (no engine imports) ─────────────────────────────
//
// Kept free of engine imports so employment.ts, occupancy.ts, sets.ts and corporateConditionLive.ts can read the
// root without an import cycle through tvSeason.ts. Every reader accepts an absent root: absence is "no season".

import { TUNING } from './tuning.js'
import { TV_WORK_BLOCK_ORDER } from './tvTypes.js'
import type { TelevisionRoot, TvAgreement, TvAgreementTerms, TvReceipt, TvReceiptDraft, TvSeason, TvWorkBlock } from './tvTypes.js'
import type { FacilityCapability } from './types.js'

export type TvWorkBlockDefinition = { block: TvWorkBlock; units: number; capabilities: readonly FacilityCapability[] }

/** Contract §4 table: counted units and the occupied capabilities of each block, in order. */
export const TV_WORK_BLOCKS: readonly TvWorkBlockDefinition[] = [
  { block: 'scripts', units: TUNING.TV_SCRIPT_UNITS, capabilities: ['development-casting'] },
  { block: 'preparation', units: TUNING.TV_PREPARATION_UNITS, capabilities: ['development-casting'] },
  { block: 'rehearsal', units: TUNING.TV_REHEARSAL_UNITS, capabilities: ['soundstage'] },
  { block: 'shooting', units: TUNING.TV_SHOOTING_UNITS, capabilities: ['soundstage', 'set-scenery'] },
  { block: 'post', units: TUNING.TV_POST_UNITS, capabilities: ['post'] },
]

export const TV_WORK_UNITS_TOTAL = TV_WORK_BLOCKS.reduce((sum, row) => sum + row.units, 0)

export function tvBlockDefinition(block: TvWorkBlock): TvWorkBlockDefinition {
  const found = TV_WORK_BLOCKS.find((row) => row.block === block)
  if (found === undefined) throw new Error(`tv season: unknown work block ${String(block)}`)
  return found
}

export function nextTvBlock(block: TvWorkBlock): TvWorkBlock | null {
  const index = TV_WORK_BLOCK_ORDER.indexOf(block)
  return index >= 0 && index + 1 < TV_WORK_BLOCK_ORDER.length ? TV_WORK_BLOCK_ORDER[index + 1]! : null
}

/** Units credited by every block before `block`, plus `blockCredited`: the one derivation of `creditedUnits`. */
export function tvUnitsThrough(block: TvWorkBlock, blockCredited: number): number {
  let total = 0
  for (const row of TV_WORK_BLOCKS) {
    if (row.block === block) return total + blockCredited
    total += row.units
  }
  throw new Error(`tv season: unknown work block ${String(block)}`)
}

export function liveTvSeason(root: TelevisionRoot | undefined): TvSeason | null {
  return root?.seasons.find((season) => season.status === 'live') ?? null
}

/**
 * The people a live season reserves this week (contract §4): the director, the three cast seats and the craft lead
 * from commitment through delivery or cancellation, and the writer until the scripts block completes. A released
 * writer keeps a permanent credit and no engagement.
 */
export function tvReservedPeople(season: TvSeason): string[] {
  const ids = [season.roster.directorId, season.roster.cast.lead, season.roster.cast.antagonist, season.roster.cast.support, season.roster.craftId]
  if (season.writerReleasedWeek === null) ids.unshift(season.roster.writerId)
  return ids
}

/** Everyone a live season engages: the television arm of the ONE availability union (`busyTalentIds`). */
export function tvEngagedTalentIds(root: TelevisionRoot | undefined): Set<string> {
  const ids = new Set<string>()
  for (const season of root?.seasons ?? []) {
    if (season.status !== 'live') continue
    for (const id of tvReservedPeople(season)) ids.add(id)
  }
  return ids
}

/** The live season that engages `talentId`, or null. */
export function tvSeasonEngaging(root: TelevisionRoot | undefined, talentId: string): TvSeason | null {
  for (const season of root?.seasons ?? []) {
    if (season.status === 'live' && tvReservedPeople(season).includes(talentId)) return season
  }
  return null
}

/** The bare `facilityId:slot` keys live seasons hold: the allocators' vocabulary. */
export function televisionOccupiedFacilitySlots(root: TelevisionRoot | undefined): Set<string> {
  const held = new Set<string>()
  for (const season of root?.seasons ?? []) {
    if (season.status !== 'live') continue
    for (const reservation of season.reservations) held.add(`${reservation.facilityId}:${String(reservation.slot)}`)
  }
  return held
}

/** A set is held by a season exactly while the season holds the stage it stands on (the 6c release law). */
export function tvSeasonHoldingSet(root: TelevisionRoot | undefined, setId: string): string | null {
  for (const season of root?.seasons ?? []) {
    if (season.status !== 'live' || season.setId !== setId) continue
    if (season.reservations.some((reservation) => reservation.capability === 'soundstage')) return season.seasonId
  }
  return null
}

/** Contract §5, frozen onto the agreement at acceptance. */
export function tvTermsFor(commitWeek: number): TvAgreementTerms {
  return {
    fee: TUNING.TV_SEASON_FEE,
    advance: TUNING.TV_SEASON_ADVANCE,
    milestones: { scripts: TUNING.TV_MILESTONE_SCRIPTS, pictureLock: TUNING.TV_MILESTONE_PICTURE_LOCK, delivery: TUNING.TV_MILESTONE_DELIVERY },
    unitSpend: TUNING.TV_UNIT_SPEND,
    dueWeek: commitWeek + TUNING.TV_DUE_WEEKS,
    finalWeek: commitWeek + TUNING.TV_FINAL_WEEKS,
    lateDeductionPerWeek: TUNING.TV_LATE_DEDUCTION_PER_WEEK,
    lateDeductionMax: TUNING.TV_LATE_DEDUCTION_MAX,
    cancellationCharge: TUNING.TV_CANCELLATION_CHARGE,
    distributionWeeks: TUNING.TV_DISTRIBUTION_WEEKS,
  }
}

/** One id from the P18 allocator (moved here from tvCommission.ts so the settlement and closure paths stay leaf-only). */
export function allocateTvId(root: TelevisionRoot, prefix: string): { root: TelevisionRoot; id: string } {
  return { root: { ...root, nextId: root.nextId + 1 }, id: `${prefix}-${String(root.nextId)}` }
}

/** Append one receipt with the next id. */
export function appendTvReceipt(root: TelevisionRoot, receipt: TvReceiptDraft): { root: TelevisionRoot; receiptId: string } {
  const allocated = allocateTvId(root, 'tv-receipt')
  return { root: { ...allocated.root, receipts: [...allocated.root.receipts, { ...receipt, receiptId: allocated.id } as TvReceipt] }, receiptId: allocated.id }
}

/** Contract §7: what a cancelled agreement still owes (advance refund, then cancellation charge); 0 while live or delivered. */
export function tvOutstanding(agreement: TvAgreement): number {
  const s = agreement.settlement
  return s === undefined ? 0 : (s.refundDue - s.refundPaid) + (s.chargeDue - s.chargePaid)
}

/** Contract §6: the commissioner's exclusive availability window [deliveredWeek, deliveredWeek + 52), half-open. */
export function tvDistributionAvailable(season: TvSeason, terms: TvAgreementTerms, week: number): boolean {
  return season.status === 'delivered' && season.deliveredWeek !== undefined && season.deliveredWeek <= week && week < season.deliveredWeek + terms.distributionWeeks
}

/** The commissioner's licence term: the whole possible availability interval [C, C + 20 + 52) (contract §3). */
export function tvDistributionLicenceEnd(commitWeek: number): number {
  return commitWeek + TUNING.TV_FINAL_WEEKS + TUNING.TV_DISTRIBUTION_WEEKS
}
