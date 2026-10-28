// ── P18 Sprint 12: the natural route to a lawful first-season commission (not a test file) ──────────────
//
// Authority: 1367-stage/p18-prep/P18-FIRST-SEASON-CONTRACT.md (adopted; independent review PROCEED) and decision 19A §3.
// Every fact is written by the engine's own verbs and `tick`. Two six-person film crews sign 208-week contracts first,
// because this world's economy is engaged: a greenlight needs exactly one Craft Lead (D-11.13) and contracted or
// freelance people (D-11.12). The first crew's greenlight mints the P16 story property and is cancelled the same week,
// so the R1 title stays the player's and nothing stays seated or occupied. The synchronized-sound chain is then bought,
// adopted on the founding stage and Post and ticked to operational, and six more idle people sign for the season. The
// crews stay idle and contracted for the films that contest the season's owners. The one disclosed shortcut is
// P14B.2's cash bootstrap (`fund`, one row each time: at week 0 and again when the route is built), so the money still
// reconciles.
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
import type { Action, CreativeRole, FilmConcept, FilmShape, GameState, LedgerEntry } from '../../src/core/types.js'
import { adoptExistingSoundChain, advanceTo, p13aGeneratedStudio } from '../../src/harness/p13a/fixtures.js'
import { fund } from './p14b2-fixtures.js'
import { MARKETING_BUDGET_LEVELS } from '../../src/core/grid.js'
import { resolveShape } from '../../src/core/shape.js'
import { freshConcept } from './p17-route.js'

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

/** A film company: a writer, a director, three actors and the one Craft Lead an engaged greenlight requires. */
export type FilmCrew = { writerId: string; directorId: string; cast: { lead: string; antagonist: string; support: string }; craftId: string }

export type SeasonRoute = {
  /** Operational chain, eighteen contracted people (two idle film crews and the season roster), the player's P16 property. */
  state: GameState
  /** The same campaign while the chain is still installing (the property and both crews exist; the roster is unsigned). */
  installing: GameState
  roster: TvRosterLocal
  crews: FilmCrew[]
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

const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }

/** `greenlightPayload`'s shape (tests/helpers/p16-fixtures.ts:89-107) seated with `crew`, its Craft Lead included. */
export function filmPayload(state: GameState, concept: FilmConcept, crew: FilmCrew) {
  return {
    conceptId: concept.id,
    shape: SHAPE,
    promise: { genre: concept.genre, intendedSegments: ['adult' as const],
      ranges: { intimacy: [-1, 1] as [number, number], tonalWeight: [-1, 1] as [number, number], kineticEnergy: [-1, 1] as [number, number] } },
    writerId: crew.writerId,
    directorId: crew.directorId,
    craftIds: [crew.craftId],
    cast: { ...crew.cast },
    budget: { negative: concept.baseNegativeCost * resolveShape(SHAPE).budgetDemandMultiplier * state.era.costScale, marketing: MARKETING_BUDGET_LEVELS[0] },
  }
}

/** The player's legacy greenlight of the next unfounded concept, seated with `crew`. */
export function greenlightWith(state: GameState, crew: FilmCrew): { state: GameState; productionId: string } {
  const next = applyActions(state, [{ kind: 'greenlight', production: filmPayload(state, freshConcept(state), crew) }])
  return { state: next, productionId: next.studio.activeProductions[next.studio.activeProductions.length - 1]!.id }
}

let cached: SeasonRoute | undefined

/** Built once per test file (about 440 real ticks); every read is a deep copy. */
export function seasonRoute(): SeasonRoute {
  if (cached === undefined) {
    let state = advanceTo(fund(p13aGeneratedStudio(SEED)), 416)
    const taken = new Set<string>()
    const pick = (role: CreativeRole): string => {
      const signed = sign(state, role, taken)
      state = signed.state
      taken.add(signed.id)
      return signed.id
    }
    const crew = (): FilmCrew => ({ writerId: pick('writer'), directorId: pick('director'), cast: { lead: pick('actor'), antagonist: pick('actor'), support: pick('actor') }, craftId: pick('craft') })
    const crews = [crew(), crew()]
    // The P16 property: the player's own greenlight mints its R1 story property; cancelling the picture the same week
    // keeps the genuine title history (p16a-mint-hooks) and frees every seat and slot it took.
    const before = new Set(state.rights.properties.map((p) => p.propertyId))
    const greenlit = greenlightWith(state, crews[0]!)
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
    const roster = { writerId: pick('writer'), directorId: pick('director'), cast: { lead: pick('actor'), antagonist: pick('actor'), support: pick('actor') }, craftId: pick('craft') }
    // Eighteen contracts have run payroll since week 416; the disclosed bootstrap again, so cash is never the premise.
    state = fund(state)
    cached = { state, installing, roster, crews, adoptionId: adoption.id, propertyId: minted[0]!.propertyId }
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
