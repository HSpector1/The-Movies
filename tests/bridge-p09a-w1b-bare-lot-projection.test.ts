// P09A W1b — what a bare lot says on the wire (design §7.2 / §24 beats 2–5, REQ-008):
//   R1  the first-film journey names the missing capacity and routes to Build while no
//       office is committed; while the office rises it waits for its completion week and
//       routes to time; once operational the ordinary "start a picture" beat returns;
//   R2  the world lists only bodies the property carries (no phantom endowed art);
//   R3  the engine's road rectangles ride the wire with the property;
//   R4  an endowed studio is byte-for-byte what it was on these seams.
import { describe, expect, it } from 'vitest'

import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import {
  applyActions,
  BARE_LOT_ROADS,
  beginFounding,
  contractOffer,
  FOUNDING_MINIMUMS,
  generateWorld,
  LOT_ROADS,
  tick,
} from '../src/core/index.js'
import type { CreativeRole, FoundingRegime, GameState } from '../src/core/index.js'
import { studioLotSnapshot } from '../ui/src/engine/adapter.ts'

function foundMinimum(state: GameState): GameState {
  let next = beginFounding(state)
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants
      .filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, 104) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
  }
  return applyActions(next, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

const founded = (seed: string, regime: FoundingRegime = 'endowed') => foundMinimum(generateWorld(seed, { regime }))

function commitOffice(state: GameState): GameState {
  return applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
}

describe('P09A W1b — the bare lot on the wire', () => {
  it('R1: the journey names the missing capacity, routes to Build, then waits for the office, then starts a picture', () => {
    let state = founded('p09-w1b-journey', 'bare-lot')
    let journey = studioLotSnapshot(state).firstFilmJourney!
    expect(journey.stage).toBe('no-capacity')
    expect(journey.beat).toBe('no-capacity')
    expect(journey.headline).toBe('NO DEVELOPMENT & CASTING CAPACITY')
    expect(journey.next).toEqual({ kind: 'build', label: 'Open Build', site: 'build' })
    expect(journey.waiting).toBeNull()
    expect(journey.whyItMatters).toContain('operational Development & Casting Office')

    state = commitOffice(state)
    journey = studioLotSnapshot(state).firstFilmJourney!
    expect(journey.stage).toBe('no-capacity')
    expect(journey.next).toEqual({ kind: 'advance-week', label: 'Advance the week', site: null })
    expect(journey.waiting).toEqual({ untilWeek: 14, reason: 'Waits until the Development & Casting Office is operational.' })
    expect(journey.whatHappened).toContain('opens on Week 14')

    for (let week = 0; week < 14; week++) state = tick(state)
    journey = studioLotSnapshot(state).firstFilmJourney!
    expect(journey.stage).toBe('no-picture')
    expect(journey.next?.kind).toBe('commission')
    expect(journey.next?.site).toBe('development')
  })

  it('R1b: the bridge offers advanceWeek while the office rises, and never before anything is committed', () => {
    const session = new BridgeSession(founded('p09-w1b-bridge', 'bare-lot'), 'p09-w1b-bridge')
    const kinds = () => session.snapshot().availableIntents.map((option) => option.kind)
    expect(kinds()).not.toContain('advanceWeek')
    const quoted = session.quote({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'q1',
      expectedStateRevision: session.stateRevision, type: 'quotePlacement',
      draft: { verb: 'build', blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } },
    })
    if (!quoted.accepted) throw new Error(quoted.message)
    const committed = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'c1',
      expectedStateRevision: session.stateRevision, type: 'submitIntent', payload: { intentId: quoted.quote.intentId },
    })
    expect(committed.accepted).toBe(true)
    expect(kinds()).toContain('advanceWeek')
    for (let week = 0; week < 14; week++) {
      const advance = session.snapshot().availableIntents.find((option) => option.kind === 'advanceWeek')
      expect(advance, `advanceWeek offered on week ${String(session.gameState.market.tick)}`).toBeDefined()
      const result = session.command({
        protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: `a${String(week)}`,
        expectedStateRevision: session.stateRevision, type: 'submitIntent', payload: { intentId: advance!.intentId },
      })
      expect(result.accepted).toBe(true)
    }
    expect(session.gameState.operations.facilities.map((f) => f.capability)).toEqual(['development-casting'])
    expect(session.snapshot().snapshot.journeyNotices.firstFilmJourney.stage).toBe('no-picture')
  })

  it('R2: the world lists only bodies the property carries', () => {
    const bare = studioLotSnapshot(founded('p09-w1b-bodies', 'bare-lot'))
    expect(bare.buildings.map((b) => b.id).sort()).toEqual(['admin', 'gate'])
    expect(bare.property?.buildings.map((b) => `${b.id}:${b.role}`).sort()).toEqual(['admin:landmark', 'gate:landmark'])
    const withOffice = studioLotSnapshot(commitOffice(founded('p09-w1b-bodies', 'bare-lot')))
    expect(withOffice.buildings.map((b) => b.id).sort()).toEqual(['admin', 'gate', 'placed-1'])
    expect(withOffice.buildings.find((b) => b.id === 'placed-1')?.attentionReason).toBe('0 of 14 weekly advances complete')
    const endowed = studioLotSnapshot(founded('p09-w1b-bodies'))
    expect(endowed.buildings.map((b) => b.id).sort()).toEqual(['admin', 'casting', 'expansion', 'gate', 'post', 'stage-a', 'stage-b', 'theater', 'writers'])
  })

  it('R3: the engine roads ride the wire with the property, per regime', () => {
    const bare = studioLotSnapshot(founded('p09-w1b-roads', 'bare-lot'))
    expect(bare.property?.regime).toBe('bare-lot')
    expect(bare.property?.roads).toEqual(BARE_LOT_ROADS.map((r) => ({ ...r })))
    expect(bare.property?.bounds).toEqual({ width: 42, depth: 27 })
    const endowed = studioLotSnapshot(founded('p09-w1b-roads'))
    expect(endowed.property?.regime).toBe('endowed')
    expect(endowed.property?.roads).toEqual(LOT_ROADS.map((r) => ({ ...r })))
    expect(endowed.property?.bounds).toEqual({ width: 28, depth: 26 })
    // The bridge carries the same rectangles.
    const session = new BridgeSession(founded('p09-w1b-roads', 'bare-lot'), 'p09-w1b-roads')
    expect(session.snapshot().snapshot.lot.property.roads).toEqual(BARE_LOT_ROADS.map((r) => ({ ...r })))
  })

  it('R4: the endowed journey is unchanged (no capacity beat, no build route)', () => {
    const journey = studioLotSnapshot(founded('p09-w1b-endowed')).firstFilmJourney!
    expect(journey.stage).toBe('no-picture')
    expect(journey.next?.kind).toBe('commission')
    expect(journey.next?.site).toBe('development')
  })
})
