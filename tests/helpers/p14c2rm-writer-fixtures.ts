// Independent 880-B fixtures. Public creator/sign/proposal/commission/tick paths;
// no invented retirement authority, employment interval, work date or receipt.
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { retirementRecordFor } from '../../src/core/careerLifecycle.js'
import { activeContract } from '../../src/core/employment.js'
import { submitProposal } from '../../src/core/talentMarket.js'
import { tick } from '../../src/core/tick.js'
import type { Action, GameState } from '../../src/core/types.js'
import { addPerson, admitted, advanceTo, finishingWriter, freshWorld, owner } from './p14c2rm-fixtures.js'

export function originalCommission(writerId: string): Action {
  return { kind: 'commissionOriginalScreenplay', screenplay: {
    writerId, genre: 'crime', shape: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
    promise: { genre: 'crime', intendedSegments: ['adult'], ranges: {
      intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2],
    } },
  } }
}

type GapWriter = { commissioned: GameState; expired: GameState; writerId: string; dueWeek: number }
let gapCache: GapWriter | undefined
/** Writer70 at0 cannot be authored74 (the creator caps70). A real52-week
 * renewal at208 ends260; the hard75 birthday260 announces E312. Commission259
 * therefore yields existing work after genuine expiry D260, while announced. */
export function announcedGapWriter(): GapWriter {
  if (gapCache === undefined) {
    const made = addPerson(freshWorld('c2rm-writer-natural-gap'), 'C2RM Gap Writer', 'writer', 70)
    let state = applyActions(made.state, [{ kind: 'signContract', talentId: made.id, termWeeks: 208 },
      { kind: 'activateScriptDevelopment' }])
    state = advanceTo(state, 201)
    state = submitProposal(state, { talentId: made.id, issuerStudioId: owner(state), termWeeks: 52, premiumTier: 1.25 })
    state = advanceTo(state, 208)
    expect(activeContract(state, made.id), 'D<E premise: real shorter renewal').toMatchObject({ startWeek: 208, endWeekExclusive: 260 })
    state = advanceTo(state, 259)
    expect(retirementRecordFor(state, made.id), 'still employed before hard75 birthday').toBeUndefined()
    const commissioned = admitted(applyActions(state, [originalCommission(made.id)]))
    const dueWeek = commissioned.scriptDevelopment.projects.at(-1)!.dueWeek!
    expect(dueWeek, 'genuine original draft outlasts actual contract').toBeGreaterThan(260)
    const expired = tick(commissioned)
    expect(expired.market.tick).toBe(260)
    expect(activeContract(expired, made.id)).toBeUndefined()
    expect(retirementRecordFor(expired, made.id)).toMatchObject({
      announcedWeek: 260, effectiveWeek: 312, status: 'announced', finishingFromWeek: null,
    })
    expect(expired.hollywood!.employment.find(row => row.terms.talentId === made.id && row.terms.startWeek === 208))
      .toMatchObject({ studioId: owner(expired), endedWeek: 260, terms: { endWeekExclusive: 260 } })
    gapCache = { commissioned, expired, writerId: made.id, dueWeek }
  }
  return structuredClone(gapCache)
}

type PooledWriter = { commissioned: GameState; finishing: GameState; writerId: string; attributedId: string; dueWeek: number }
let pooledCache: PooledWriter | undefined
/** The retiring writer is the SECOND writer, never the attributed writer. */
export function pooledFinishingWriter(): PooledWriter {
  if (pooledCache === undefined) {
    const f = finishingWriter()
    const young = addPerson(f.ready, 'C2RM Attributed Young Writer', 'writer', 40)
    let state = applyActions(young.state, [{ kind: 'signContract', talentId: young.id, termWeeks: 52 },
      originalCommission(young.id)])
    const projectId = state.scriptDevelopment.projects.at(-1)!.id
    state = applyActions(state, [{ kind: 'assignScreenplayWriter', projectId, writerId: f.writerId }])
    const project = state.scriptDevelopment.projects.find(row => row.id === projectId)!
    expect(project.writerIds, 'pool membership is actual public assignment').toEqual([young.id, f.writerId])
    expect(project.writerId).toBe(young.id)
    expect(project.dueWeek, 'pool acceleration must leave real work beyond E').toBeGreaterThan(312)
    const commissioned = admitted(state), finishing = tick(state)
    expect(retirementRecordFor(finishing, f.writerId)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: 312 })
    expect(activeContract(finishing, young.id)).toBeDefined()
    expect(activeContract(finishing, f.writerId)).toBeUndefined()
    pooledCache = { commissioned, finishing, writerId: f.writerId, attributedId: young.id, dueWeek: project.dueWeek! }
  }
  return structuredClone(pooledCache)
}
