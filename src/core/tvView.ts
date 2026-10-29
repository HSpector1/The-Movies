// ── P18 Sprint 13 slice B: the one read model of the television root for the client surfaces ──────────
//
// The Bridge (bridge/television.ts) and the browser (ui/src/engine/television.ts) read the season through this module,
// so both say the same thing: the block and units, why it waits, the next milestone, the agreement's E/P/owed, the
// cancellation settlement it would take now, and the distribution window. It also lists the lawful commission choices
// (the properties the player may produce for television, idle contracted people by profession, the operational
// synchronized-dialogue chains). Every choice is only an offer: `tvCommissionPreview` and the action decide. Pure.

import { assignmentRefusal } from './careerLifecycle.js'
import { activeContract, assignmentBlockedTalentIds } from './employment.js'
import { isOperatingStudio } from './operatingState.js'
import type { HolderReason } from './rights.js'
import { adoptionChainOperational } from './technologyAdoption.js'
import { tvDistributionAvailable, tvProductionPermission } from './tvCommission.js'
import { TV_WORK_UNITS_TOTAL, tvOutstanding, tvUnitsThrough } from './tvReaders.js'
import type { TvCancellationCause, TvMilestoneKind, TvSeasonStatus, TvSettlement, TvStall, TvWorkBlock } from './tvTypes.js'
import type { FacilityCapability, GameState } from './types.js'
import { TUNING } from './tuning.js'

export const TV_BLOCK_LABEL: Record<TvWorkBlock, string> = {
  scripts: 'Season scripts', preparation: 'Preparation', rehearsal: 'Rehearsal', shooting: 'Shooting', post: 'Post and delivery master',
}
export const TV_MILESTONE_LABEL: Record<TvMilestoneKind, string> = { scripts: 'Scripts milestone', pictureLock: 'Picture lock milestone', delivery: 'Delivery milestone' }
export const TV_CANCELLATION_LABEL: Record<TvCancellationCause, string> = {
  producer: 'cancelled by the studio', deadline: 'cancelled at the final delivery boundary', closure: 'cancelled when the studio closed',
  rights: 'cancelled when the studio lost its rights authority', participant: 'cancelled when a required person was lost',
}
const CAPABILITY_LABEL: Record<FacilityCapability, string> = {
  'development-casting': 'Development & Casting', soundstage: 'sound stage', 'set-scenery': 'Scenery Shop', post: 'Post Building', laboratory: 'laboratory',
}

/**
 * P16's permission reason codes in the studio's words (rights.ts HolderReason and the authority reasons). FIX-S13B-2
 * item 3: `satisfies` the closed union, so a new HolderReason fails tsc until it has its sentence.
 */
const P16_PERMISSION_REASON = {
  noIndustry: 'the living industry is not running', invalidAsOfWeek: 'the week is not a valid one', futureWeek: 'the week has not happened yet',
  unknownSubject: 'the property is not on record', noTitleAtDate: 'no one held the title at that week', ambiguousProvenance: 'the title history is ambiguous',
  missingGenesis: 'the title history has no origin', unresolvedTerminalAuthority: 'the title passed through a closure that has not resolved',
  archived: 'the property is archived', r3RequiresProperty: 'the right needs a property',
} satisfies Record<HolderReason | 'r3RequiresProperty' | 'archived', string>
/** licence.ts licenceGrantRefusal codes (the commissioner's grant at admission); that function returns a plain string. */
const P16_GRANT_REASON: Readonly<Record<string, string>> = {
  exclusiveOverlap: 'an exclusive licence already covers that term', grantorNotHolder: 'your studio does not hold the title',
  notTradeable: 'the title cannot be licensed now', selfGrant: 'a studio cannot license itself', invalidTerm: 'the licence term is not valid',
  r4ConsumerNotLive: 'television licensing is not open', activeProductionEncumbrance: 'a production on the property blocks the grant',
}
/** The voiced P16 codes (the browser's refusal voice reads the same table). Look up with Object.hasOwn only. */
export const P16_REASON_TEXT: Readonly<Record<string, string>> = { ...P16_PERMISSION_REASON, ...P16_GRANT_REASON }

const nameOf = (state: GameState, talentId: string): string => {
  const person = state.talent.find((t) => t.id === talentId)
  if (person === undefined) throw new Error(`tv view: no talent record for ${talentId}`)
  return person.name
}

/**
 * A P16 permission reason voiced (FIX-S13B-1 item 3): the holding studio by name ("your studio" for the player), a lapsed
 * licence, another licence answering, or the code's own sentence. A code with no sentence throws by name, never prints raw.
 */
export function voicePermissionReason(state: GameState, reason: string): string {
  const studio = (id: string): string => {
    if (id === state.hollywood?.playerStudioId) return 'your studio'
    const name = state.hollywood?.identities.find((x) => x.studioId === id)?.name
    if (name === undefined) throw new Error(`tv view: no studio identity for ${id}`)
    return name
  }
  const held = /^noAuthority:(.+)$/.exec(reason)
  if (held !== null) return `the right is held by ${studio(held[1]!)}`
  if (reason.startsWith('expired:')) return 'the licence it relied on has expired'
  if (reason.startsWith('answered by ')) return 'a licence other than this season\'s answers for the commissioner'
  if (reason.startsWith('holderUnavailable:')) return voicePermissionReason(state, reason.slice('holderUnavailable:'.length))
  // FIX-S13B-2 item 3: own keys only, so `constructor` or `toString` never answers as a reason.
  if (!Object.hasOwn(P16_REASON_TEXT, reason)) throw new Error(`tv view: no voiced sentence for the P16 reason ${reason}`)
  return P16_REASON_TEXT[reason]!
}

/** A season rights stall (`production: <reason>` or `distribution: <reason>`, tvSeason.ts tvWorkGate) voiced. */
function voiceRightsStall(state: GameState, reason: string): string {
  const parts = /^(production|distribution): (.+)$/.exec(reason)
  if (parts === null) throw new Error(`tv view: rights stall reason ${reason} names neither production nor distribution`)
  return `the ${parts[1] === 'production' ? 'producer\'s production' : 'commissioner\'s distribution'} permission does not hold: ${voicePermissionReason(state, parts[2]!)}`
}

/** Why a live season did no paid work, in the studio's words (each kind its own sentence; no generic fallback). */
export function tvStallText(state: GameState, stall: TvStall): string {
  switch (stall.kind) {
    case 'facility-capacity': return `waiting for a free ${CAPABILITY_LABEL[stall.capability]} slot`
    case 'set-unavailable': return 'waiting for a standing set on the adopted sound stage'
    case 'scenery-load-in': return `the scenery is travelling to the stage (${stall.weeksRemaining} week${stall.weeksRemaining === 1 ? '' : 's'} left)`
    case 'scenery-load-in-withheld': return stall.reason === 'stage-has-no-body' ? 'the scenery trip cannot be derived: the stage has no building' : 'the scenery trip cannot be derived: the Scenery Shop has no building'
    case 'cash': return `cash ${stall.available} after this week's charges is below the ${stall.required} unit cost`
    case 'participant': return `${nameOf(state, stall.talentId)} is no longer available under contract`
    case 'rights': return voiceRightsStall(state, stall.reason)
    case 'sound-chain': return 'the synchronized-dialogue chain is not operational'
    case 'final-boundary': return 'the final delivery boundary has passed'
  }
}

export type TvSeasonView = {
  seasonId: string; seriesId: string; seriesTitle: string; propertyId: string; status: TvSeasonStatus
  block: TvWorkBlock; creditedUnits: number; totalUnits: number; stall: string | null
  commitWeek: number; dueWeek: number; finalWeek: number; deliveredWeek: number | null
  cancellation: { week: number; cause: TvCancellationCause } | null
  /** The next milestone a live season earns and the unit that earns it (delivery before any late reduction). */
  nextMilestone: { kind: TvMilestoneKind; afterUnit: number; amount: number } | null
  agreement: { agreementId: string; fee: number; advance: number; earned: number; received: number; unearnedAdvance: number; settlement: TvSettlement | null; outstanding: number }
  distribution: { licenceId: string; availableFromWeek: number | null; availableUntilWeekExclusive: number | null; available: boolean; expired: boolean }
  /** What a cancellation now would freeze and pay (contract §7: refund first, then charge, from nonnegative cash). Live only. */
  cancelPreview: { refundDue: number; refundPaidNow: number; chargeDue: number; chargePaidNow: number; owedAfter: number } | null
  /** The most `settleTvObligations` can pay now (the whole balance or the available cash). Null when nothing is owed or closure-published. */
  settlePreview: { outstanding: number; payableNow: number } | null
}
export type TvView = { series: { seriesId: string; title: string; propertyId: string; createdWeek: number; seasonIds: string[] }[]; seasons: TvSeasonView[] }

const payable = (cash: number): number => Math.floor(Math.max(0, cash))

export function tvView(state: GameState): TvView {
  const root = state.television
  if (root === undefined) return { series: [], seasons: [] }
  const week = state.market.tick
  const operating = state.hollywood !== null && isOperatingStudio(state, state.hollywood.playerStudioId)
  const seasons = root.seasons.map((s): TvSeasonView => {
    const a = root.agreements.find((row) => row.agreementId === s.agreementId)
    if (a === undefined) throw new Error(`tv view: season ${s.seasonId} names no agreement ${s.agreementId}`)
    const series = root.series.find((row) => row.seriesId === s.seriesId)
    if (series === undefined) throw new Error(`tv view: season ${s.seasonId} names no series ${s.seriesId}`)
    const units = s.work.creditedUnits
    const live = s.status === 'live'
    const nextMilestone = !live ? null
      : units < tvUnitsThrough('preparation', 0) ? { kind: 'scripts' as const, afterUnit: tvUnitsThrough('preparation', 0), amount: a.terms.milestones.scripts }
        : units < tvUnitsThrough('post', 0) ? { kind: 'pictureLock' as const, afterUnit: tvUnitsThrough('post', 0), amount: a.terms.milestones.pictureLock }
          : { kind: 'delivery' as const, afterUnit: TV_WORK_UNITS_TOTAL, amount: a.terms.milestones.delivery }
    const cash = payable(state.studio.cash)
    const refundDue = a.received - a.earned
    const refundPaidNow = Math.min(refundDue, cash)
    const chargePaidNow = Math.min(a.terms.cancellationCharge, cash - refundPaidNow)
    const outstanding = tvOutstanding(a)
    const from = s.deliveredWeek ?? null
    return {
      seasonId: s.seasonId, seriesId: s.seriesId, seriesTitle: series.title, propertyId: s.propertyId, status: s.status,
      block: s.work.block, creditedUnits: units, totalUnits: TV_WORK_UNITS_TOTAL, stall: live && s.work.stall !== null ? tvStallText(state, s.work.stall) : null,
      commitWeek: s.commitWeek, dueWeek: s.dueWeek, finalWeek: s.finalWeek, deliveredWeek: from,
      cancellation: s.cancellation === undefined ? null : { week: s.cancellation.week, cause: s.cancellation.cause },
      nextMilestone,
      agreement: { agreementId: a.agreementId, fee: a.terms.fee, advance: a.terms.advance, earned: a.earned, received: a.received,
        unearnedAdvance: live ? refundDue : 0, settlement: a.settlement === undefined ? null : { ...a.settlement }, outstanding },
      distribution: { licenceId: s.distributionLicenceId, availableFromWeek: from, availableUntilWeekExclusive: from === null ? null : from + a.terms.distributionWeeks,
        available: tvDistributionAvailable(state, s, a.terms, week), expired: from !== null && week >= from + a.terms.distributionWeeks },
      cancelPreview: live ? { refundDue, refundPaidNow, chargeDue: a.terms.cancellationCharge, chargePaidNow, owedAfter: refundDue + a.terms.cancellationCharge - refundPaidNow - chargePaidNow } : null,
      // FIX-S13B-1 item 5: a closed player is read-only history; nothing is offered to settle.
      settlePreview: operating && outstanding > 0 && a.settlement?.closureId === null ? { outstanding, payableNow: Math.min(outstanding, cash) } : null,
    }
  })
  return { series: root.series.map((s) => ({ seriesId: s.seriesId, title: s.title, propertyId: s.propertyId, createdWeek: s.createdWeek, seasonIds: [...s.seasonIds] })), seasons }
}

export type TvRosterRole = 'writer' | 'director' | 'actor' | 'craft'
export type TvCommissionChoices = {
  week: number
  /** Each P16 story property the player could commission on, with the live production permission's verdict. */
  properties: { propertyId: string; title: string | null; permitted: boolean; /** Voiced (never a raw P16 code); null when permitted. */ refusal: string | null }[]
  /** Idle, lifecycle-clear people on a player contract covering [C, C + 20), by profession (the admission still decides). */
  people: Record<TvRosterRole, { talentId: string; name: string }[]>
  /** The player's synchronized-dialogue adoptions with a Post chain, and whether the chain is operational now. */
  adoptions: { adoptionId: string; stageFacilityId: string; postFacilityId: string; stageName: string; postName: string; operational: boolean }[]
}

function facilityName(state: GameState, facilityId: string): string {
  const facility = state.operations.facilities.find((f) => f.id === facilityId)
  if (facility === undefined) throw new Error(`tv view: no facility record for ${facilityId}`)
  return facility.name
}

export function tvCommissionChoices(state: GameState): TvCommissionChoices {
  const week = state.market.tick
  const player = state.hollywood?.playerStudioId
  const people: TvCommissionChoices['people'] = { writer: [], director: [], actor: [], craft: [] }
  if (player === undefined) return { week, properties: [], people, adoptions: [] }
  const final = week + TUNING.TV_FINAL_WEEKS
  const properties = state.rights.properties.map((p) => {
    const permission = tvProductionPermission(state, p.propertyId, week)
    return { propertyId: p.propertyId, title: p.title, permitted: permission.kind === 'permitted', refusal: permission.kind === 'permitted' ? null : voicePermissionReason(state, permission.reason) }
  }).filter((p) => p.permitted || state.rights.properties.find((x) => x.propertyId === p.propertyId)?.creatorStudioId === player)
  const blocked = assignmentBlockedTalentIds(state, week, final)
  for (const person of state.talent) {
    const role = person.role
    if (blocked.has(person.id) || role === 'scientist') continue
    const live = activeContract(state, person.id, week)
    if (live === undefined || live.endWeekExclusive < final || assignmentRefusal(state, person.id, week, role, final) !== null) continue
    people[role].push({ talentId: person.id, name: person.name })
  }
  const adoptions = state.technology.adoptions
    .filter((a) => a.studioId === player && a.technologyId === 'synchronized-sound' && a.postFacilityId !== null)
    .map((a) => ({ adoptionId: a.id, stageFacilityId: a.stageFacilityId, postFacilityId: a.postFacilityId!,
      stageName: facilityName(state, a.stageFacilityId), postName: facilityName(state, a.postFacilityId!), operational: adoptionChainOperational(state, a) }))
  return { week, properties, people, adoptions }
}
