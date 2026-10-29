// ── P18 bounded first season: the typed television records (`tv-limited-season/v1`) ─────────────
//
// Authority: 1367-stage/p18-prep/P18-FIRST-SEASON-CONTRACT.md (adopted under 1342-O ruling 10, independent
// review PROCEED) and decision 19A §3 (the commissioner party and the split R4 uses). One limited series, one
// commissioned six-episode season produced as ONE twelve-unit workload for one external commissioner. Six is
// delivery metadata, never six production clocks.
//
// Sprint 12: commission (preview, accept, refuse) and paid work. Sprint 13 slice 1: delivery with lateness, the
// 52-week distribution window, cancellation (producer, deadline, closure) with the v1 settlement and partial
// repayment, and the explicit settlement action. The terminal facts are optional leaves on the existing records
// (present exactly when the season is delivered or cancelled), so absence and presence of the root mean what they did.
//
// Types only, plus the identity constants the contract names. No behaviour.

import type { DistributiveOmit } from './studioHistory.js'
import type { CastSlot, FacilityCapability } from './types.js'

/** Contract §4: the provisional ruleset every season of this checkpoint is written under. */
export const TV_RULESET_VERSION = 'tv-limited-season/v1' as const
/** Contract §3: the versioned external party. No employees, facilities, rank or balance sheet. */
export const TV_COMMISSIONER_ID = 'p18-limited-season-commissioner-v1' as const
/** Contract §4: the five work blocks, in the only order they may run. */
export const TV_WORK_BLOCK_ORDER = ['scripts', 'preparation', 'rehearsal', 'shooting', 'post'] as const
export type TvWorkBlock = (typeof TV_WORK_BLOCK_ORDER)[number]

/** Contract §5: the television money kinds. Receipts are positive; spend, refund and charge are negative outflows. */
export const TV_LEDGER_KINDS = ['tvAdvance', 'tvMilestonePayment', 'tvProductionSpend', 'tvAdvanceRefund', 'tvCancellationCharge'] as const
export type TvLedgerKind = (typeof TV_LEDGER_KINDS)[number]

export type TvRole = 'writer' | 'director' | 'lead' | 'antagonist' | 'support' | 'craft'

export type TvRoster = {
  writerId: string
  directorId: string
  cast: Record<CastSlot, string>
  craftId: string
}

/**
 * The public `commissionTvSeason` intent (contract §3): an already-existing P16 property, the six-person roster, the
 * operational synchronized-dialogue adoption and the proposed immutable series title. The grant set is not a payload
 * field: the producer's authority is read live from P16 (`permissionFor`) and the commissioner's exclusive licence is
 * issued by P16's licence producer at acceptance. Later seasons of an existing series are not in this slice.
 */
export type CommissionTvSeasonRequest = {
  seriesTitle: string
  propertyId: string
  roster: TvRoster
  adoptionId: string
}

/** Immutable attribution frozen at commitment, each on the exact P12 employment record. */
export type TvCredit = { talentId: string; role: TvRole; contractId: string }

export type TvReservation = { facilityId: string; capability: FacilityCapability; slot: number }

export type TvSceneryWithheldReason = 'stage-has-no-body' | 'scenery-shop-has-no-body'

/** Why a live season did no paid work this advance. Each is a stall, never a cancellation, in this slice. */
export type TvStall =
  | { kind: 'facility-capacity'; capability: FacilityCapability }
  | { kind: 'set-unavailable' }
  | { kind: 'scenery-load-in'; weeksRemaining: number }
  | { kind: 'scenery-load-in-withheld'; reason: TvSceneryWithheldReason }
  | { kind: 'cash'; required: number; available: number }
  | { kind: 'participant'; talentId: string }
  | { kind: 'rights'; reason: string }
  | { kind: 'sound-chain' }
  | { kind: 'final-boundary' }

export type TvSeasonWork = {
  block: TvWorkBlock
  /** 0..12, the counted units credited so far. */
  creditedUnits: number
  /** Units credited inside the current block. */
  blockCredited: number
  /** The boundary week the last unit was credited at. */
  lastCreditedWeek: number | null
  stall: TvStall | null
  /** The week the sound stage was acquired: the scenery load-in's called week. */
  stageHeldSinceWeek: number | null
}

/** The P16 answer that proved the producer's production permission at commitment (`permissionFor`). */
export type TvProductionAuthority = { via: 'title' | 'licence'; licenceId: string | null }

export type TvSeries = {
  seriesId: string
  title: string
  propertyId: string
  producerStudioId: string
  createdWeek: number
  seasonIds: string[]
}

export type TvSeason = {
  seasonId: string
  seriesId: string
  workId: string
  agreementId: string
  producerStudioId: string
  propertyId: string
  commissionerId: string
  seasonNumber: number
  episodes: number
  rulesetVersion: string
  productionAuthority: TvProductionAuthority
  /** The commissioner's exclusive R4 `televisionDistribution` licence P16 minted at acceptance. */
  distributionLicenceId: string
  roster: TvRoster
  credits: TvCredit[]
  adoptionId: string
  commitWeek: number
  dueWeek: number
  finalWeek: number
  /** Live until the delivery boundary or a cancellation (contract §6-§7); terminal states are permanent. */
  status: TvSeasonStatus
  work: TvSeasonWork
  reservations: TvReservation[]
  /** The set bound with the stage at rehearsal; survives as the record of what was shot on. */
  setId: string | null
  writerReleasedWeek: number | null
  /** Present exactly when delivered: the boundary T the master was accepted at (contract §6). */
  deliveredWeek?: number
  /** Present exactly when cancelled. */
  cancellation?: TvCancellation
}

export type TvSeasonStatus = 'live' | 'delivered' | 'cancelled'
/** Contract §7 causes this slice implements. Automatic cancellation on grant loss or unrecoverable person loss is
 * contract-required (§4, §7) and not implemented in this slice (NOTES-S13A-FIX1); absorption is not wired either. */
/** 'rights' and 'participant' are the tick's automatic cancellations on authority loss (contract §4, §7). */
export type TvCancellationCause = 'producer' | 'deadline' | 'closure' | 'rights' | 'participant'
export type TvCancellation = { week: number; cause: TvCancellationCause }

/**
 * Contract §5/§7 settlement, frozen at the cancellation boundary: U0 = P − E (refundDue) and K (chargeDue), what has
 * been paid of each (refund first, then charge), and the P15 closure the obligations were published to (null while
 * the studio operates). Outstanding = (refundDue − refundPaid) + (chargeDue − chargePaid).
 */
export type TvSettlement = { week: number; refundDue: number; refundPaid: number; chargeDue: number; chargePaid: number; closureId: string | null }

export type TvMilestoneKind = 'scripts' | 'pictureLock' | 'delivery'

/** Contract §5, frozen at acceptance so a later tuning change never rewrites an agreement. */
export type TvAgreementTerms = {
  fee: number
  advance: number
  milestones: Record<TvMilestoneKind, number>
  unitSpend: number
  dueWeek: number
  finalWeek: number
  lateDeductionPerWeek: number
  lateDeductionMax: number
  cancellationCharge: number
  distributionWeeks: number
}

export type TvMilestoneRecord = { kind: TvMilestoneKind; week: number; earned: number; paid: number }

export type TvAgreement = {
  agreementId: string
  seasonId: string
  studioId: string
  commissionerId: string
  rulesetVersion: string
  terms: TvAgreementTerms
  /** E: cumulative earned fee, a noncash fact. */
  earned: number
  /** P: gross commissioning cash actually received, the advance included. */
  received: number
  milestones: TvMilestoneRecord[]
  /** Present exactly when the season is cancelled. */
  settlement?: TvSettlement
}

/** Who wrote a settlement payment: the cancellation transaction itself, or a later `settleTvObligations` action. */
export type TvPaymentSource = 'cancellation' | 'settlement'

type TvReceiptBase = { receiptId: string; week: number; seasonId: string; agreementId: string }
export type TvReceipt = TvReceiptBase & (
  | { kind: 'commissioned'; seriesId: string; distributionLicenceId: string }
  | { kind: 'advancePaid'; amount: number }
  | { kind: 'unitCredited'; block: TvWorkBlock; creditedUnits: number; amount: number }
  | { kind: 'blockCompleted'; block: TvWorkBlock }
  | { kind: 'writerReleased'; talentId: string }
  | { kind: 'milestoneEarned'; milestone: TvMilestoneKind; amount: number }
  | { kind: 'milestonePaid'; milestone: TvMilestoneKind; amount: number }
  // Sprint 13 slice 1 (contract §5-§7). Noncash: delivered, the late reduction, distribution expiry, cancelled.
  | { kind: 'delivered'; lateWeeks: number }
  | { kind: 'deliveryReduction'; amount: number }
  | { kind: 'distributionExpired' }
  | { kind: 'cancelled'; cause: TvCancellationCause; refundDue: number; chargeDue: number }
  // Cash, each carried by exactly one ledger row (tvAdvanceRefund / tvCancellationCharge).
  | { kind: 'advanceRefundPaid'; amount: number; source: TvPaymentSource }
  | { kind: 'cancellationChargePaid'; amount: number; source: TvPaymentSource }
)
export type TvReceiptKind = TvReceipt['kind']
/** One receipt before the allocator names it: each variant keeps its own fields (a plain Omit would collapse the union). */
export type TvReceiptDraft = DistributiveOmit<TvReceipt, 'receiptId'>

/** The lazy P18 root: absent until the first commission, never emptied (no row is ever deleted). */
export type TelevisionRoot = {
  version: 1
  /** The one P18 allocator: every series, season, work, agreement and receipt id takes `next++`. */
  nextId: number
  series: TvSeries[]
  seasons: TvSeason[]
  agreements: TvAgreement[]
  receipts: TvReceipt[]
}
