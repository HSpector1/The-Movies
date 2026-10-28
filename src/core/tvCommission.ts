// ── P18: admission and the one atomic commitment (contract §3, §4, §5) ─────────────────────────────────
//
// Every refusal is decided BEFORE anything moves and names its own cause in a fixed order. `tvCommissionPreview`
// and the action share one admission, so the preview is the whole truth. Acceptance asks P16 for the producer's live
// production permission, has P16's licence producer mint the commissioner's exclusive distribution licence, freezes
// the terms and the credits, pays the recoupable advance once, holds one Development & Casting slot and engages the
// six people. Pure: no RNG, no clock.

import { assignmentBlockedTalentIds, activeContract, economyEngaged, weeklyPayroll } from './employment.js'
import { assignmentRefusal } from './careerLifecycle.js'
import { loanInstallmentDueFor } from './corporateConditionLive.js'
import { sameContractTerms } from './industryEmployment.js'
import { grantCounterpartyLicence, licenceGrantRefusal, type LicenceGrant } from './licence.js'
import { facilitySlotKey, occupiedResourceSlots } from './occupancy.js'
import { expectedWeeklyOperatingCostAt } from './placement.js'
import { permissionFor, type Permission } from './rights.js'
import { adoptionChainOperational } from './technologyAdoption.js'
import { TUNING } from './tuning.js'
import { allocateTvId, appendTvReceipt, liveTvSeason, tvDistributionLicenceEnd, tvOutstanding, tvTermsFor } from './tvReaders.js'

export { allocateTvId, appendTvReceipt, tvDistributionLicenceEnd, tvTermsFor }
import { TV_COMMISSIONER_ID, TV_RULESET_VERSION } from './tvTypes.js'
import type {
  CommissionTvSeasonRequest, TelevisionRoot, TvAgreement, TvAgreementTerms, TvCredit, TvReservation, TvRole, TvSeason, TvSeries,
} from './tvTypes.js'
import type { Contract, CreativeRole, GameState, LedgerEntry } from './types.js'

export type TvAdmissionQuote = {
  weeks: number
  cash: number
  floor: number
  /** Σ over the next twenty advances [C, C+20), week by week, as the tick will charge it (contract §5). */
  payroll: number
  overhead: number
  facilityOpex: number
  loanInstallments: number
  provision: number
  required: number
  ok: boolean
}

/**
 * Contract §5 admission quote, BEFORE the advance or any milestone: the floor (the twelve units' spend) + the full
 * mandatory fixed obligations of the next twenty advances + the cancellation provision. Each week is charged as the tick
 * charges it, from current facts and their scheduled changes: payroll from each contract's exact term (no assumed
 * renewal), overhead from the contracts still held that week, facility operating cost with its scheduled completions,
 * and the scheduled installments of an existing loan (review P18-05). Queued intents, physical plans and research
 * spend are cancellable or pausable without charge, so they are not mandatory (named in NOTES). The season's own
 * resource obligation is the floor; its people are already in payroll, so nothing is counted twice.
 */
export function tvAdmissionQuote(state: GameState, week: number): TvAdmissionQuote {
  const weeks = TUNING.TV_ADMISSION_QUOTE_WEEKS
  const player = state.hollywood?.playerStudioId ?? null
  let payroll = 0
  let overhead = 0
  let facilityOpex = 0
  let loanInstallments = 0
  for (let w = week; w < week + weeks; w++) {
    payroll += weeklyPayroll(state, w)
    overhead += TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.filter((contract) => contract.endWeekExclusive > w).length
    facilityOpex += expectedWeeklyOperatingCostAt(state.placement, state.ledger, w)
    if (player !== null) loanInstallments += loanInstallmentDueFor(state, player, w)
  }
  const floor = TUNING.TV_ADMISSION_CASH_FLOOR
  const provision = TUNING.TV_ADMISSION_CANCELLATION_PROVISION
  const required = floor + payroll + overhead + facilityOpex + loanInstallments + provision
  return { weeks, cash: state.studio.cash, floor, payroll, overhead, facilityOpex, loanInstallments, provision, required, ok: state.studio.cash >= required }
}

const ROSTER_ROLES: readonly (readonly [TvRole, CreativeRole])[] = [
  ['writer', 'writer'], ['director', 'director'], ['lead', 'actor'], ['antagonist', 'actor'], ['support', 'actor'], ['craft', 'craft'],
]

function rosterId(request: CommissionTvSeasonRequest, role: TvRole): string {
  switch (role) {
    case 'writer': return request.roster.writerId
    case 'director': return request.roster.directorId
    case 'lead': return request.roster.cast.lead
    case 'antagonist': return request.roster.cast.antagonist
    case 'support': return request.roster.cast.support
    case 'craft': return request.roster.craftId
  }
}

/** The commissioner's licence P16 will mint at acceptance (19A §3). */
export function tvDistributionGrant(state: GameState, propertyId: string, commitWeek: number): LicenceGrant {
  return {
    right: 'R4', subject: { right: 'R1', propertyId }, scope: { use: 'televisionDistribution' }, exclusive: true,
    startWeek: commitWeek, endWeekExclusive: tvDistributionLicenceEnd(commitWeek),
    grantorId: state.hollywood!.playerStudioId, granteeId: TV_COMMISSIONER_ID,
  }
}

/** The producer's live production permission at `week` (contract §3; 19A §3 `televisionProduction`). */
export function tvProductionPermission(state: GameState, propertyId: string, week: number): Permission {
  return permissionFor(state, state.hollywood!.playerStudioId, { right: 'R1', propertyId }, 'R4', { use: 'televisionProduction' }, week)
}

/** The commissioner's live distribution permission at `week` (its exclusive licence, read through P16). */
export function tvDistributionPermission(state: GameState, propertyId: string, week: number): Permission {
  return permissionFor(state, TV_COMMISSIONER_ID, { right: 'R1', propertyId }, 'R4', { use: 'televisionDistribution' }, week)
}

type Admitted = {
  player: string
  commitWeek: number
  productionAuthority: Extract<Permission, { kind: 'permitted' }>
  reservation: TvReservation
  credits: TvCredit[]
}

/** The P12 employment row that records `contract` for the player: the credit's exact contract identity. */
function playerContractId(state: GameState, contract: Contract): string | null {
  const h = state.hollywood!
  return h.employment.find((row) => row.studioId === h.playerStudioId && row.endedWeek === null && sameContractTerms(row.terms, contract))?.contractId ?? null
}

const exactKeys = (value: unknown, keys: readonly string[]): boolean =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join() === [...keys].sort().join()
const nonEmpty = (value: unknown): boolean => typeof value === 'string' && value.length > 0

/** The request is the public payload: exactly its four fields and the six roster ids, refused by name (review should-fix 6). */
function commissionShapeRefusal(request: unknown): string | null {
  if (!exactKeys(request, ['adoptionId', 'propertyId', 'roster', 'seriesTitle'])) return 'the commission must carry exactly seriesTitle, propertyId, roster and adoptionId'
  const r = (request as CommissionTvSeasonRequest).roster
  if (!exactKeys(r, ['cast', 'craftId', 'directorId', 'writerId']) || !exactKeys(r.cast, ['antagonist', 'lead', 'support'])) {
    return 'the roster must name exactly a writer, a director, a lead, an antagonist, a support and a craft lead'
  }
  if (![r.writerId, r.directorId, r.cast.lead, r.cast.antagonist, r.cast.support, r.craftId].every(nonEmpty)) return 'every roster id must be a non-empty string'
  if (!nonEmpty((request as CommissionTvSeasonRequest).adoptionId)) return 'adoption id must be a non-empty string'
  return null
}

/** The fixed-order admission. A string is the refusal; otherwise the facts the commitment needs. */
export function admitTvCommission(state: GameState, request: CommissionTvSeasonRequest): string | Admitted {
  const shape = commissionShapeRefusal(request)
  if (shape !== null) return shape
  const C = state.market.tick
  const final = C + TUNING.TV_FINAL_WEEKS
  // the studio
  if (state.hollywood === null) return 'the campaign has no player studio identity in the living industry'
  if (!economyEngaged(state)) return 'the studio economy is not engaged: a season needs an entered operating studio'
  if (state.founding !== null) return 'the studio is still in its founding draft'
  if (state.operations.mode !== 'managed') return 'production operations are not managed'
  const player = state.hollywood.playerStudioId
  const live = liveTvSeason(state.television)
  if (live !== null) return `one active season per studio: "${live.seasonId}" is live`
  // Contract §5: no new season while an earlier agreement still owes its advance refund or cancellation charge.
  const arrears = state.television?.agreements.find((a) => tvOutstanding(a) > 0)
  if (arrears !== undefined) return `agreement ${arrears.agreementId} still owes ${tvOutstanding(arrears)} (advance refund, then cancellation charge); a new season waits until it is settled`
  if (typeof request.seriesTitle !== 'string' || request.seriesTitle.trim().length === 0) return 'a new series needs a non-empty title'
  // the grant set (contract §3): the producer's live production permission on the exact P16 property, then the
  // commissioner's exclusive distribution licence as P16's producer would mint it. Title equality joins nothing.
  if (typeof request.propertyId !== 'string' || request.propertyId.length === 0) return 'property id must be a non-empty string'
  const production = tvProductionPermission(state, request.propertyId, C)
  if (production.kind !== 'permitted') return `the producer has no television production authority over ${request.propertyId} at week ${C} (${production.reason})`
  if (production.via === 'licence') {
    const held = state.rights.licences.find((l) => l.id === production.licenceId)
    if (held === undefined || held.endWeekExclusive <= final) return `the production licence ${production.licenceId ?? 'unknown'} does not cover permitted delivery at week ${final}`
  }
  const distribution = licenceGrantRefusal(state, tvDistributionGrant(state, request.propertyId, C), C, { r4ConsumerLive: false, televisionCounterparty: true })
  if (distribution !== null) return `P16 refuses the commissioner's exclusive television distribution licence over ${request.propertyId} for [${C}, ${tvDistributionLicenceEnd(C)}): ${distribution}`
  // the sound chain (contract §3): the player's operational synchronized-dialogue adoption, stage and Post
  const adoption = state.technology.adoptions.find((row) => row.id === request.adoptionId)
  if (adoption === undefined || adoption.studioId !== player || adoption.technologyId !== 'synchronized-sound' || adoption.postFacilityId === null
    || !adoptionChainOperational(state, adoption)) {
    return `"${request.adoptionId}" is not this studio's operational synchronized-dialogue chain (stage, capture and Post)`
  }
  // the six people (contract §4): distinct, real profiles, idle, contracted over [C, C+20), lifecycle-clear
  const ids = ROSTER_ROLES.map(([role]) => rosterId(request, role))
  if (new Set(ids).size !== ids.length) return 'the six roster people must be distinct'
  // The ONE availability union plus every reserved guest week inside the season's window (review P17-06).
  const blocked = assignmentBlockedTalentIds(state, C, final)
  const credits: TvCredit[] = []
  for (const [role, profession] of ROSTER_ROLES) {
    const id = rosterId(request, role)
    const person = state.talent.find((t) => t.id === id)
    if (person === undefined) return `unknown talent "${id}" in the roster`
    if (person.role !== profession) return `"${id}" has no ${profession} profile for the ${role} role (role ${person.role})`
    if (blocked.has(id)) return `"${id}" is already engaged (a production seat, a writing task, a research seat, a reserved guest week or a live season)`
    const contract = activeContract(state, id, C)
    if (contract === undefined) return `"${id}" is not studio-contracted at week ${C}`
    if (contract.endWeekExclusive < final) return `"${id}"'s contract ends at week ${contract.endWeekExclusive} and does not cover the production window [${C}, ${final})`
    const lifecycle = assignmentRefusal(state, id, C, profession, final)
    if (lifecycle !== null) return `"${id}": ${lifecycle}`
    const contractId = playerContractId(state, contract)
    if (contractId === null) return `"${id}" has no recorded P12 employment row for the credit`
    credits.push({ talentId: id, role, contractId })
  }
  // capacity: one free Development & Casting slot now, in the allocation owners' total order; a season is never queued
  const occupied = occupiedResourceSlots(state, { capability: 'development-casting' })
  let reservation: TvReservation | null = null
  for (const facility of [...state.operations.facilities].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    if (facility.capability !== 'development-casting') continue
    for (let slot = 0; slot < facility.capacity && reservation === null; slot++) {
      if (!occupied.has(facilitySlotKey(facility.id, slot))) reservation = { facilityId: facility.id, capability: 'development-casting', slot }
    }
    if (reservation !== null) break
  }
  if (reservation === null) return 'no free development-casting slot for the scripts block this week; a season is never queued'
  // affordability (contract §5): cash after P16 consideration (the disclosed zero) and before the advance
  const quote = tvAdmissionQuote(state, C)
  if (!quote.ok) return `cash ${quote.cash} is below the admission quote ${quote.required} (floor ${quote.floor} + ${quote.weeks} weeks of fixed obligations + provision ${quote.provision}); the advance is not counted`
  return { player, commitWeek: C, productionAuthority: production, reservation, credits }
}

export type TvCommissionPreview = {
  refusal: string | null
  quote: TvAdmissionQuote
  terms: TvAgreementTerms
  commitWeek: number
  /** The commissioner licence's P16 consideration: the disclosed, UNRESOLVED 19A assumption (TUNING). */
  commissionerLicenceConsideration: number
  distributionLicenceEndWeekExclusive: number
}

export function tvCommissionPreview(state: GameState, request: CommissionTvSeasonRequest): TvCommissionPreview {
  const C = state.market.tick
  const admitted = admitTvCommission(state, request)
  return { refusal: typeof admitted === 'string' ? admitted : null, quote: tvAdmissionQuote(state, C), terms: tvTermsFor(C), commitWeek: C,
    commissionerLicenceConsideration: TUNING.TV_COMMISSIONER_LICENCE_CONSIDERATION, distributionLicenceEndWeekExclusive: tvDistributionLicenceEnd(C) }
}

/** The one atomic commitment. Throws the admission refusal before any write. */
export function commissionTvSeason(state: GameState, request: CommissionTvSeasonRequest): GameState {
  const admitted = admitTvCommission(state, request)
  if (typeof admitted === 'string') throw new Error(`applyActions: commissionTvSeason rejected — ${admitted}`)
  const C = admitted.commitWeek
  const terms = tvTermsFor(C)
  // P16 issues the commissioner's licence first (refusing loudly, by the law admission already asked).
  const granted = grantCounterpartyLicence(state, tvDistributionGrant(state, request.propertyId, C), C, TUNING.TV_COMMISSIONER_LICENCE_CONSIDERATION)
  let root: TelevisionRoot = state.television ?? { version: 1, nextId: 1, series: [], seasons: [], agreements: [], receipts: [] }
  const ids: string[] = []
  for (const prefix of ['tv-series', 'tv-season', 'tv-work', 'tv-agreement']) {
    const allocated = allocateTvId(root, prefix)
    root = allocated.root
    ids.push(allocated.id)
  }
  const [seriesId, seasonId, workId, agreementId] = ids as [string, string, string, string]
  const series: TvSeries = { seriesId, title: request.seriesTitle, propertyId: request.propertyId, producerStudioId: admitted.player, createdWeek: C, seasonIds: [seasonId] }
  const season: TvSeason = {
    seasonId, seriesId, workId, agreementId,
    producerStudioId: admitted.player,
    propertyId: request.propertyId,
    commissionerId: TV_COMMISSIONER_ID,
    seasonNumber: 1,
    episodes: TUNING.TV_SEASON_EPISODES,
    rulesetVersion: TV_RULESET_VERSION,
    productionAuthority: { via: admitted.productionAuthority.via, licenceId: admitted.productionAuthority.licenceId },
    distributionLicenceId: granted.licence.id,
    // Built from the six ids alone, so no extra payload key reaches the persisted season.
    roster: { writerId: request.roster.writerId, directorId: request.roster.directorId,
      cast: { lead: request.roster.cast.lead, antagonist: request.roster.cast.antagonist, support: request.roster.cast.support }, craftId: request.roster.craftId },
    credits: admitted.credits,
    adoptionId: request.adoptionId,
    commitWeek: C,
    dueWeek: terms.dueWeek,
    finalWeek: terms.finalWeek,
    status: 'live',
    work: { block: 'scripts', creditedUnits: 0, blockCredited: 0, lastCreditedWeek: null, stall: null, stageHeldSinceWeek: null },
    reservations: [admitted.reservation],
    setId: null,
    writerReleasedWeek: null,
  }
  const agreement: TvAgreement = {
    agreementId, seasonId, studioId: admitted.player, commissionerId: TV_COMMISSIONER_ID, rulesetVersion: TV_RULESET_VERSION, terms,
    earned: 0, received: terms.advance, milestones: [],
  }
  root = { ...root, series: [...root.series, series], seasons: [...root.seasons, season], agreements: [...root.agreements, agreement] }
  root = appendTvReceipt(root, { kind: 'commissioned', week: C, seasonId, agreementId, seriesId, distributionLicenceId: granted.licence.id }).root
  const advance = appendTvReceipt(root, { kind: 'advancePaid', week: C, seasonId, agreementId, amount: terms.advance })
  // The advance is cash received with an unearned obligation (U = A − E), never earned revenue (contract §5).
  const row: LedgerEntry = { week: C, kind: 'tvAdvance', amount: terms.advance, note: advance.receiptId }
  return {
    ...granted.state,
    television: advance.root,
    studio: { ...granted.state.studio, cash: granted.state.studio.cash + terms.advance },
    ledger: [...granted.state.ledger, row],
  }
}

/** U = max(0, A − E): the gross unearned advance of a live agreement (contract §5). */
export function tvUnearnedAdvance(agreement: TvAgreement): number {
  return Math.max(0, agreement.terms.advance - agreement.earned)
}
