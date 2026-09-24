// ── R3-N4-SIM-20: the three batched N4/N5/N6 read-model deltas ───────────────
//
// Projection 31 adds nothing to the simulation. Three facts that the engine
// already owns stop being re-derivable guesses on the client:
//
//   (a) N4 — `StudioDevelopmentProjectSnapshot.attention`: per-screenplay
//       attention in the SAME closed vocabulary the Casting board publishes,
//       decided by the same order and from the greenlight door's own
//       availability, not from the status label.
//   (b) N5 — `StudioContractOfferSnapshot.affordable` / `.refusalReason`: the
//       D-12.11 solvency answer for THIS term's signing bonus, asked of the same
//       authority the sign door re-asks at commit.
//   (c) N6 — `StudioFinanceSnapshot.attention`: the same three sentences in the
//       same order, now as rows with a stable id and an EXISTING route or null.
//
// The laws under proof: the vocabulary is ONE vocabulary; the money, the terms
// and the sentences are byte-identical to what shipped at projection 30; the
// new fields are projections of existing authorities (never a new gate); and the
// projection-30 identity is registered as a prior checkpoint identity so no
// durable native checkpoint is orphaned by the bump.

import { describe, expect, it } from 'vitest'

import { beginFoundingHistoricalControl as beginFounding } from '../src/core/employment.js'
import {
  applyActions,
  canAfford,
  contractOfferOptions,
  FOUNDING_MINIMUMS,
  generateWorld,
  hiringMarketIds,
  hiringMarketView,
  scriptProjectsReadModel,
  tick,
} from '../src/core/index.js'
import type { Contract, CreativeRole, GameState, Talent } from '../src/core/index.js'
import { TUNING } from '../src/core/tuning.ts'
import { castingProjection } from '../bridge/casting.ts'
import { developmentProjection } from '../bridge/development.ts'
import { financeProjection } from '../bridge/finance.ts'
import { peopleProjection } from '../bridge/people.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession } from '../bridge/session.ts'

const OUTGOING_PROJECTION_30_SCHEMA_ID =
  'sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48'

const RECORD_ATTENTION = ['none', 'ready', 'waiting', 'active', 'decisionRequired', 'blocked']

function definition(name: string): Record<string, unknown> {
  return BRIDGE_SCHEMA.$defs[name as keyof typeof BRIDGE_SCHEMA.$defs] as unknown as Record<string, unknown>
}

function properties(name: string): Record<string, Record<string, unknown>> {
  return definition(name).properties as Record<string, Record<string, unknown>>
}

function contracted(state: GameState, role: CreativeRole): Talent[] {
  const ids = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((talent) => talent.role === role && ids.has(talent.id))
}

function founded(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole): Talent[] => pool.filter((person) => person.role === role)
  const hires = [
    ...byRole('actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole('director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole('writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole('craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function managed(seed: string): GameState {
  return applyActions(founded(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function commission(state: GameState, conceptIndex: number, writerId: string): GameState {
  const concept = state.concepts[conceptIndex]!
  return applyActions(state, [{
    kind: 'commissionScript',
    project: {
      conceptId: concept.id,
      writerId,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] },
      },
    },
  }])
}

function attentionOf(state: GameState, projectId: string): string {
  const board = developmentProjection(state).board
  if (board === null) throw new Error('test fixture: the Development board is unexpectedly null')
  const project = board.projects.find((entry) => entry.projectId === projectId)
  if (project === undefined) throw new Error(`test fixture: no published project "${projectId}"`)
  return project.attention
}

/**
 * Fixtures for the two money-dependent branches. These are PROJECTION fixtures only:
 * they are handed to the pure read models (`financeProjection`, `castingProjection`),
 * never served, because a hand-set cash figure deliberately does not reconcile with
 * the construction ledger invariant the full snapshot path asserts.
 */
function withCash(state: GameState, cash: number): GameState {
  return { ...state, studio: { ...state.studio, cash } }
}

function withRenewalWindows(state: GameState, count: number): GameState {
  let opened = 0
  const contracts: Contract[] = state.contracts.map((contract) => {
    if (opened >= count) return contract
    opened += 1
    return { ...contract, endWeekExclusive: state.market.tick + TUNING.HIRING_RENEWAL_WINDOW_WEEKS }
  })
  return { ...state, contracts }
}

function attentionRows(state: GameState) {
  return financeProjection(state, peopleProjection(state)).attention
}

describe('R3-N4-SIM-20 — batched N4/N5/N6 read-model deltas (projection 31)', () => {
  it('keeps the outgoing projection-30 identity registered after a later bump', () => {
    // R3-N7-SIM-01 moved the RUNNING identity on to projection 32. The three
    // deltas below are unchanged by that; what this case still owns is the law
    // that the identity this task retired stays accepted forever.
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(50)
    expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-50')
    // A bump that forgets its outgoing identity bricks every durable checkpoint
    // written under it; a bump that keeps the RUNNING identity re-migrates forever.
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(OUTGOING_PROJECTION_30_SCHEMA_ID)).toBe('projection-v30')
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
  })

  it('publishes ONE record-attention vocabulary for Development and Casting', () => {
    const development = properties('StudioDevelopmentProjectSnapshot').attention
    const casting = properties('StudioCastingProjectSnapshot').attention
    expect(development.enum).toEqual(RECORD_ATTENTION)
    // Order is contract data: the two surfaces must not drift apart by a value or an index.
    expect(development.enum).toEqual(casting.enum)
    expect(definition('StudioDevelopmentProjectSnapshot').required).toContain('attention')
    expect(definition('StudioDevelopmentProjectSnapshot').additionalProperties).toBe(false)
  })

  it('publishes affordability beside every contract term and a finance attention row DTO', () => {
    const offer = properties('StudioContractOfferSnapshot')
    expect(offer.affordable).toEqual({ type: 'boolean' })
    expect(offer.refusalReason).toEqual({ anyOf: [{ type: 'string' }, { type: 'null' }] })
    expect(definition('StudioContractOfferSnapshot').required).toEqual(
      expect.arrayContaining(['affordable', 'refusalReason']),
    )

    expect((properties('StudioFinanceSnapshot').attention as { items: unknown }).items)
      .toEqual({ $ref: '#/$defs/StudioFinanceAttention' })
    const row = properties('StudioFinanceAttention')
    expect(Object.keys(row).sort()).toEqual(['id', 'message', 'route'])
    expect(row.route).toEqual({ anyOf: [{ $ref: '#/$defs/StudioFinanceRoute' }, { type: 'null' }] })
    expect(definition('StudioFinanceAttention').additionalProperties).toBe(false)
    // The delta mints NO new route kind — Finance-internal destinations stay null.
    expect((properties('StudioFinanceRoute').kind as { enum: string[] }).enum).toEqual([
      'profile', 'facilityHistory', 'casting', 'production', 'releaseResult', 'filmHistory', 'development',
    ])
  })

  it('N4: per-screenplay attention follows the lifecycle and the greenlight door, not the status label', () => {
    let state = managed('r3n4-development-attention')
    const writer = contracted(state, 'writer')[0]!.id

    state = commission(state, 0, writer)
    expect(attentionOf(state, 'script-0000')).toBe('active')

    state = tick(state)
    expect(attentionOf(state, 'script-0000')).toBe('decisionRequired')

    const rewriting = applyActions(state, [{ kind: 'requestScriptRewrite', projectId: 'script-0000' }])
    expect(attentionOf(rewriting, 'script-0000')).toBe('active')

    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
    expect(attentionOf(state, 'script-0000')).toBe('ready')

    // Every Development & Casting slot busy: the greenlight is legal and QUEUES.
    const secondWriterId = hiringMarketIds(state)
      .map((id) => state.talent.find((talent) => talent.id === id)!)
      .find((talent) => talent.role === 'writer')!.id
    let full = commission(state, 1, writer)
    full = applyActions(full, [{ kind: 'signContract', talentId: secondWriterId, termWeeks: 104 }])
    full = commission(full, 2, secondWriterId)
    const readyPackage = scriptProjectsReadModel(full).packages
      .find((entry) => entry.projectId === 'script-0000')!
    expect(readyPackage.availability.blockers.map((blocker) => blocker.kind)).toEqual(['facility-capacity'])
    expect(readyPackage.availability.willQueueGreenlightIntent).toBe(true)
    expect(attentionOf(full, 'script-0000')).toBe('waiting')

    // In production: the screenplay record itself needs nothing.
    state = applyActions(state, [{
      kind: 'greenlightScriptProject',
      production: {
        projectId: 'script-0000',
        directorId: contracted(state, 'director')[0]!.id,
        craftIds: [contracted(state, 'craft')[0]!.id],
        cast: {
          lead: contracted(state, 'actor')[0]!.id,
          antagonist: contracted(state, 'actor')[1]!.id,
          support: contracted(state, 'actor')[2]!.id,
        },
        budget: { negative: state.concepts[0]!.baseNegativeCost, marketing: 0 },
      },
    }])
    expect(attentionOf(state, 'script-0000')).toBe('none')

    // A second screenplay that cannot be staffed while the first shoots is blocked,
    // NOT waiting: only a facility-capacity blocker queues.
    state = commission(state, 1, writer)
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0001' }])
    const blocked = scriptProjectsReadModel(state).packages
      .find((entry) => entry.projectId === 'script-0001')!
    expect(blocked.availability.blockers.length).toBeGreaterThan(0)
    expect(blocked.availability.willQueueGreenlightIntent).toBe(false)
    expect(attentionOf(state, 'script-0001')).toBe('blocked')
  })

  it('N4: every published screenplay attention agrees with the greenlight door and is a pure projection', () => {
    let state = managed('r3n4-development-agreement')
    const writer = contracted(state, 'writer')[0]!.id
    state = tick(commission(state, 0, writer))
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    const before = JSON.stringify(state)
    const board = developmentProjection(state).board!
    expect(JSON.stringify(state)).toBe(before)
    expect(developmentProjection(state)).toEqual(developmentProjection(state))

    const packages = new Map(
      scriptProjectsReadModel(state).packages.map((entry) => [entry.projectId, entry] as const),
    )
    for (const project of board.projects) {
      expect(RECORD_ATTENTION).toContain(project.attention)
      if (project.status !== 'ready') continue
      const availability = packages.get(project.projectId)!.availability
      expect(project.attention).toBe(
        availability.blockers.length === 0
          ? 'ready'
          : availability.willQueueGreenlightIntent
            ? 'waiting'
            : 'blocked',
      )
    }
  })

  it('N5: every published term carries the D-12 answer and no term, price or count changed', () => {
    const state = managed('r3n4-offer-affordability')
    const board = castingProjection(state).board!
    expect(board.hiringCandidates.length).toBeGreaterThan(0)

    for (const candidate of board.hiringCandidates) {
      const engineOffers = contractOfferOptions(state, candidate.talentId)
      // Affordability never adds, removes or reorders a published term.
      expect(candidate.offers.map((offer) => offer.termWeeks))
        .toEqual([...TUNING.CONTRACT_TERM_OPTIONS])
      expect(candidate.offers.map((offer) => offer.signingBonus))
        .toEqual(engineOffers.map((offer) => offer.signingBonus))
      expect(candidate.offers.map((offer) => offer.annualSalary))
        .toEqual(engineOffers.map((offer) => offer.annualSalary))
      for (const offer of candidate.offers) {
        expect(offer.affordable).toBe(canAfford(state, offer.signingBonus).ok)
        expect(offer.refusalReason === null).toBe(offer.affordable)
      }
    }
  })

  it('N5: an unaffordable term publishes the engine’s own reason and names the exact bonus', () => {
    const state = managed('r3n4-offer-refusal')
    const cheapest = Math.min(
      ...hiringMarketView(state).flatMap((view) => view.offers.map((offer) => offer.signingBonus)),
    )
    expect(cheapest).toBeGreaterThan(0)
    const broke = withCash(state, cheapest - 1)

    const board = castingProjection(broke).board!
    const refused = board.hiringCandidates.flatMap((candidate) =>
      candidate.offers.filter((offer) => !offer.affordable),
    )
    expect(refused.length).toBeGreaterThan(0)
    for (const offer of refused) {
      expect(canAfford(broke, offer.signingBonus).ok).toBe(false)
      expect(offer.refusalReason).toContain(offer.signingBonus.toLocaleString('en-US'))
      // The sentence carries the ENGINE's own D-12 wording, not a bridge paraphrase.
      expect(offer.refusalReason).toContain('New commitments require cash to stay at or above zero')
    }
    // Solvency is a refusal, not a censor: the same terms stay published.
    expect(board.hiringCandidates.map((candidate) => candidate.offers.length))
      .toEqual(castingProjection(state).board!.hiringCandidates.map((candidate) => candidate.offers.length))
  })

  it('N6: finance attention keeps its three sentences and its order, and routes only where a route exists', () => {
    const state = managed('r3n4-finance-attention')
    expect(attentionRows(state)).toEqual([])

    const red = attentionRows(withCash(state, -1))
    expect(red).toEqual([{
      id: 'cash-in-red',
      message: 'Cash is in the red. Current receipts and existing obligations remain visible; voluntary decisions follow their own affordability rules.',
      route: null,
    }])

    const oneRenewal = attentionRows(withRenewalWindows(state, 1))
    expect(oneRenewal).toHaveLength(1)
    expect(oneRenewal[0]!.id).toBe('contract-renewals')
    expect(oneRenewal[0]!.message).toBe('1 employee contract(s) are in their renewal window. Review Payroll.')
    expect(oneRenewal[0]!.route).toEqual({
      kind: 'profile',
      targetId: withRenewalWindows(state, 1).contracts[0]!.talentId,
      label: 'Open Profile',
    })

    // Several open windows have no single destination — the row must not pick one.
    const manyRenewals = attentionRows(withRenewalWindows(state, 3))
    expect(manyRenewals).toHaveLength(1)
    expect(manyRenewals[0]!.message).toBe('3 employee contract(s) are in their renewal window. Review Payroll.')
    expect(manyRenewals[0]!.route).toBeNull()

    const both = attentionRows(withRenewalWindows(withCash(state, -1), 2))
    expect(both.map((row) => row.id)).toEqual(['cash-in-red', 'contract-renewals'])
  })

  it('serves the whole bundle under the regenerated schema with the new fields present', () => {
    let state = managed('r3n4-served-bundle')
    state = tick(commission(state, 0, contracted(state, 'writer')[0]!.id))
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])

    const response = new BridgeSession(state, 'r3n4-bundle').snapshot()
    expect(() => parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, response)).not.toThrow()
    expect(response.snapshotVersion).toBe(50)

    const development = response.snapshot.development.development.board!
    expect(development.projects.length).toBeGreaterThan(0)
    expect(development.projects.every((project) => RECORD_ATTENTION.includes(project.attention))).toBe(true)
    const offers = response.snapshot.casting.casting.board!.hiringCandidates.flatMap((c) => c.offers)
    expect(offers.length).toBeGreaterThan(0)
    expect(offers.every((offer) => typeof offer.affordable === 'boolean')).toBe(true)
    expect(offers.every((offer) => offer.refusalReason === null || offer.refusalReason.length > 0)).toBe(true)
    expect(Array.isArray(response.snapshot.finance.finance.attention)).toBe(true)
  })
})
