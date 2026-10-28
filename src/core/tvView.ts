// ── P18 Sprint 13 slice B: the one read model of the television root for the client surfaces ──────────
//
// The Bridge (bridge/television.ts) and the browser (ui/src/engine/television.ts) read the season through this module,
// so both say the same thing: the block and units, why it waits, the next milestone, the agreement's E/P/owed, the
// cancellation settlement it would take now, and the distribution window. It also lists the lawful commission choices
// (the properties the player may produce for television, idle contracted people by profession, the operational
// synchronized-dialogue chains). Every choice is only an offer: `tvCommissionPreview` and the action decide. Pure.

import { assignmentRefusal } from './careerLifecycle.js'
import { activeContract, assignmentBlockedTalentIds } from './employment.js'
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
}
const CAPABILITY_LABEL: Record<FacilityCapability, string> = {
  'development-casting': 'Development & Casting', soundstage: 'sound stage', 'set-scenery': 'Scenery Shop', post: 'Post Building', laboratory: 'laboratory',
}

/** Why a live season did no paid work, in the studio's words (each kind its own sentence; no generic fallback). */
export function tvStallText(state: GameState, stall: TvStall): string {
  switch (stall.kind) {
    case 'facility-capacity': return `waiting for a free ${CAPABILITY_LABEL[stall.capability]} slot`
    case 'set-unavailable': return 'waiting for a standing set on the adopted sound stage'
    case 'scenery-load-in': return `the scenery is travelling to the stage (${stall.weeksRemaining} week${stall.weeksRemaining === 1 ? '' : 's'} left)`
    case 'scenery-load-in-withheld': return stall.reason === 'stage-has-no-body' ? 'the scenery trip cannot be derived: the stage has no building' : 'the scenery trip cannot be derived: the Scenery Shop has no building'
    case 'cash': return `cash ${stall.available} after this week's charges is below the ${stall.required} unit cost`
    case 'participant': return `${state.talent.find((t) => t.id === stall.talentId)?.name ?? stall.talentId} is no longer available under contract`
    case 'rights': return `the television rights do not hold (${stall.reason})`
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
      settlePreview: outstanding > 0 && a.settlement?.closureId === null ? { outstanding, payableNow: Math.min(outstanding, cash) } : null,
    }
  })
  return { series: root.series.map((s) => ({ seriesId: s.seriesId, title: s.title, propertyId: s.propertyId, createdWeek: s.createdWeek, seasonIds: [...s.seasonIds] })), seasons }
}

export type TvRosterRole = 'writer' | 'director' | 'actor' | 'craft'
export type TvCommissionChoices = {
  week: number
  /** Each P16 story property the player could commission on, with the live production permission's verdict. */
  properties: { propertyId: string; title: string | null; permitted: boolean; refusal: string | null }[]
  /** Idle, lifecycle-clear people on a player contract covering [C, C + 20), by profession (the admission still decides). */
  people: Record<TvRosterRole, { talentId: string; name: string }[]>
  /** The player's synchronized-dialogue adoptions with a Post chain, and whether the chain is operational now. */
  adoptions: { adoptionId: string; stageFacilityId: string; postFacilityId: string; operational: boolean }[]
}

export function tvCommissionChoices(state: GameState): TvCommissionChoices {
  const week = state.market.tick
  const player = state.hollywood?.playerStudioId
  const people: TvCommissionChoices['people'] = { writer: [], director: [], actor: [], craft: [] }
  if (player === undefined) return { week, properties: [], people, adoptions: [] }
  const final = week + TUNING.TV_FINAL_WEEKS
  const properties = state.rights.properties.map((p) => {
    const permission = tvProductionPermission(state, p.propertyId, week)
    return { propertyId: p.propertyId, title: p.title, permitted: permission.kind === 'permitted', refusal: permission.kind === 'permitted' ? null : permission.reason }
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
    .map((a) => ({ adoptionId: a.id, stageFacilityId: a.stageFacilityId, postFacilityId: a.postFacilityId!, operational: adoptionChainOperational(state, a) }))
  return { week, properties, people, adoptions }
}
