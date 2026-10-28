// ── P18 Sprint 12: the natural route to a lawful first-season commission (not a test file) ──────────────
//
// Authority: 1367-stage/p18-prep/P18-FIRST-SEASON-CONTRACT.md (adopted; independent review PROCEED) and decision 19A §3.
// Every fact is written by the engine's own verbs and `tick`: the player's greenlight mints the P16 story property
// (cancelled the same week, so the R1 title stays the player's and nothing occupies capacity), the synchronized-sound
// chain is bought and adopted on the founding stage and Post and ticked to operational, and eleven idle people sign
// 208-week contracts (six for the season, five for a film company that contests the same owners). The one disclosed
// shortcut is P14B.2's cash bootstrap (`fund`, one studioRevenue row), so the route's money still reconciles.
//
// Imports only modules that exist at the predecessor ecbc42c9, and spells the television shapes locally, so every law
// pinned on this route runs RED there by assertion (an unknown action kind is caught and compared), never by a missing
// import. `tvCommissionModule` loads the new module dynamically for the quote and returns null when it is absent.

import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { hiringMarketIds } from '../../src/core/employment.js'
import { stableStringify } from '../../src/core/save.js'
import { adoptionChainOperational } from '../../src/core/technologyAdoption.js'
import { tick } from '../../src/core/tick.js'
import type { Action, CreativeRole, GameState, LedgerEntry } from '../../src/core/types.js'
import { adoptExistingSoundChain, advanceTo, p13aGeneratedStudio } from '../../src/harness/p13a/fixtures.js'
import { fund } from './p14b2-fixtures.js'
import { freshConcept, greenlightAs } from './p17-route.js'

export const SEED = 'p18-sprint12-season-01'
/** Contract §3: the versioned external party. */
export const COMMISSIONER = 'p18-limited-season-commissioner-v1'
export const RULESET = 'tv-limited-season/v1'
/** Contract §4-§5, spelled from the adopted text (never read back from TUNING). */
export const UNITS = { scripts: 3, preparation: 1, rehearsal: 1, shooting: 4, post: 3 } as const
export const BLOCK_ORDER = ['scripts', 'preparation', 'rehearsal', 'shooting', 'post'] as const
export const FIGURES = {
  fee: 600_000, advance: 120_000, scripts: 120_000, pictureLock: 240_000, delivery: 240_000, unitSpend: 25_000,
  dueWeeks: 16, finalWeeks: 20, distributionWeeks: 52, floor: 300_000, quoteWeeks: 20, provision: 120_000,
} as const

export type TvRosterLocal = { writerId: string; directorId: string; cast: { lead: string; antagonist: string; support: string }; craftId: string }
export type CommissionLocal = { seriesTitle: string; propertyId: string; roster: TvRosterLocal; adoptionId: string }
export type TvReservationLocal = { facilityId: string; capability: string; slot: number }
export type TvSeasonLocal = {
  seasonId: string; seriesId: string; workId: string; agreementId: string; producerStudioId: string; propertyId: string
  commissionerId: string; seasonNumber: number; episodes: number; rulesetVersion: string
  productionAuthority: { via: 'title' | 'licence'; licenceId: string | null }; distributionLicenceId: string
  roster: TvRosterLocal; credits: { talentId: string; role: string; contractId: string }[]; adoptionId: string
  commitWeek: number; dueWeek: number; finalWeek: number; status: string
  work: { block: string; creditedUnits: number; blockCredited: number; lastCreditedWeek: number | null; stall: { kind: string } | null; stageHeldSinceWeek: number | null }
  reservations: TvReservationLocal[]; setId: string | null; writerReleasedWeek: number | null
}
export type TvAgreementLocal = {
  agreementId: string; seasonId: string; studioId: string; commissionerId: string; earned: number; received: number
  terms: Record<string, unknown> & { advance: number; unitSpend: number; dueWeek: number; finalWeek: number }
  milestones: { kind: string; week: number; earned: number; paid: number }[]
}
export type TvReceiptLocal = { receiptId: string; kind: string; week: number; seasonId: string; agreementId: string } & Record<string, unknown>
export type TelevisionLocal = {
  version: number; nextId: number
  series: { seriesId: string; title: string; propertyId: string; producerStudioId: string; createdWeek: number; seasonIds: string[] }[]
  seasons: TvSeasonLocal[]; agreements: TvAgreementLocal[]; receipts: TvReceiptLocal[]
}

export type SeasonRoute = {
  /** Operational chain, eleven contracted people, the player's P16 property; week ≥ 428. */
  state: GameState
  /** The same campaign while the chain is still installing (the property exists; no one is signed yet). */
  installing: GameState
  roster: TvRosterLocal
  filmRoster: { directorId: string; cast: { lead: string; antagonist: string; support: string }; craftId: string }
  adoptionId: string
  propertyId: string
}

export const clone = <T>(value: T): T => structuredClone(value)
export const sig = (value: unknown): string => stableStringify(value)
export const player = (state: GameState): string => state.hollywood!.playerStudioId

function sign(state: GameState, role: CreativeRole, taken: ReadonlySet<string>): { state: GameState; id: string } {
  for (let i = 0; i < 80; i++) {
    const id = hiringMarketIds(state, state.market.tick).find((candidate) => !taken.has(candidate) && state.talent.find((p) => p.id === candidate)?.role === role)
    if (id !== undefined) return { state: applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 208 }]), id }
    state = tick(state)
  }
  throw new Error(`p18 route premise: no signable ${role} within 80 weeks`)
}

let cached: SeasonRoute | undefined

/** Built once per test file (about 440 real ticks); every read is a deep copy. */
export function seasonRoute(): SeasonRoute {
  if (cached === undefined) {
    let state = advanceTo(fund(p13aGeneratedStudio(SEED)), 416)
    // The P16 property: the player's own greenlight mints its R1 story property; cancelling the picture the same week
    // keeps the genuine title history (p16a-mint-hooks) and frees every seat and slot it took.
    const before = new Set(state.rights.properties.map((p) => p.propertyId))
    const greenlit = greenlightAs(state, freshConcept(state))
    const minted = greenlit.state.rights.properties.filter((p) => !before.has(p.propertyId))
    if (minted.length !== 1) throw new Error(`p18 route premise: the greenlight minted ${minted.length} properties`)
    state = applyActions(greenlit.state, [{ kind: 'cancel', productionId: greenlit.productionId }])
    state = adoptExistingSoundChain(applyActions(state, [{ kind: 'purchaseTechnology', technologyId: 'synchronized-sound' }]))
    const adoption = state.technology.adoptions.find((a) => a.studioId === player(state) && a.technologyId === 'synchronized-sound')
    if (adoption === undefined || adoption.postFacilityId === null) throw new Error('p18 route premise: no player sound adoption with a Post facility')
    const installing = clone(state)
    for (let guard = 0; !adoptionChainOperational(state, state.technology.adoptions.find((a) => a.id === adoption.id)!); guard++) {
      if (guard > 40) throw new Error('p18 route premise: the sound chain did not become operational within 40 weeks')
      state = tick(state)
    }
    const taken = new Set<string>()
    const pick = (role: CreativeRole): string => {
      const signed = sign(state, role, taken)
      state = signed.state
      taken.add(signed.id)
      return signed.id
    }
    const roster = { writerId: pick('writer'), directorId: pick('director'), cast: { lead: pick('actor'), antagonist: pick('actor'), support: pick('actor') }, craftId: pick('craft') }
    const filmRoster = { directorId: pick('director'), cast: { lead: pick('actor'), antagonist: pick('actor'), support: pick('actor') }, craftId: pick('craft') }
    cached = { state, installing, roster, filmRoster, adoptionId: adoption.id, propertyId: minted[0]!.propertyId }
  }
  return clone(cached)
}

export function request(route: Pick<SeasonRoute, 'roster' | 'adoptionId' | 'propertyId'>, over: Partial<CommissionLocal> = {}): CommissionLocal {
  return { seriesTitle: 'The Long Night', propertyId: route.propertyId, roster: clone(route.roster), adoptionId: route.adoptionId, ...over }
}

export function commissionAction(commission: CommissionLocal): Action {
  return { kind: 'commissionTvSeason', commission } as unknown as Action
}

/** The commission through the public action, or the refusal text. The input is never written. */
export function attempt(state: GameState, commission: CommissionLocal): { state: GameState; error?: undefined } | { state?: undefined; error: string } {
  try {
    return { state: applyActions(state, [commissionAction(commission)]) }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

/** The lawful commission; its refusal fails the calling test by assertion (RED at the predecessor), never by a throw. */
export function commissioned(route: SeasonRoute, over: Partial<CommissionLocal> = {}): GameState {
  const result = attempt(route.state, request(route, over))
  expect(result.error, 'the lawful commission must be accepted').toBeUndefined()
  return result.state!
}

export function television(state: GameState): TelevisionLocal | undefined {
  return (state as GameState & { television?: TelevisionLocal }).television
}

export function season(state: GameState): TvSeasonLocal {
  const found = television(state)?.seasons[0]
  if (found === undefined) throw new Error('p18: no television season recorded')
  return found
}

export function agreement(state: GameState): TvAgreementLocal {
  const found = television(state)?.agreements[0]
  if (found === undefined) throw new Error('p18: no television agreement recorded')
  return found
}

export function tvRows(state: GameState, kind?: string): LedgerEntry[] {
  return state.ledger.filter((row) => String(row.kind).startsWith('tv') && (kind === undefined || row.kind === kind))
}

export function rosterIds(roster: TvRosterLocal): string[] {
  return [roster.writerId, roster.directorId, roster.cast.lead, roster.cast.antagonist, roster.cast.support, roster.craftId]
}

/** P14B.2's disclosed bootstrap at an exact figure: the cash and one row explaining it, so the money reconciles. */
export function withCash(state: GameState, cash: number): GameState {
  const delta = cash - state.studio.cash
  return { ...state, studio: { ...state.studio, cash }, ledger: [...state.ledger,
    { week: state.market.tick, kind: delta > 0 ? 'studioRevenue' : 'overhead', amount: delta, note: 'P18 fixture disclosed cash set' }] }
}

export function tickUntil(state: GameState, done: (s: GameState) => boolean, maxTicks: number, label: string): GameState {
  for (let i = 0; i < maxTicks && !done(state); i++) state = tick(state)
  if (!done(state)) throw new Error(`p18: ${label} not reached within ${maxTicks} ticks (stall ${JSON.stringify(television(state)?.seasons[0]?.work.stall ?? null)})`)
  return state
}

export type TvQuoteLocal = { weeks: number; cash: number; floor: number; payroll: number; overhead: number; facilityOpex: number; loanInstallments: number; provision: number; required: number; ok: boolean }

/** The new admission module, or null where it does not exist (the predecessor): the caller asserts non-null first. */
export async function tvCommissionModule(): Promise<{ tvAdmissionQuote: (state: GameState, week: number) => TvQuoteLocal } | null> {
  try {
    return (await import('../../src/core/tvCommission.js')) as unknown as { tvAdmissionQuote: (state: GameState, week: number) => TvQuoteLocal }
  } catch {
    return null
  }
}
