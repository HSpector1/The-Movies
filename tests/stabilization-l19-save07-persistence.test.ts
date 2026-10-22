// Stabilization 2026-10-22, audit findings L-19 (SAVE-01) and SAVE-07.
//
// L-19: every frozen era strips the studio-event kinds it introduced before delegating to its
// predecessor (V16 `releaseCommitted`, V25 the four setup kinds) and re-checks only their shape,
// so a stripped row escaped the sequence law the V14 validator applies to every other row: seq
// strictly ascending, seq < nextSeq, week not in the future. The engine cannot produce such a
// row; a hostile import can, and the Bridge relies on seq uniqueness. The live validator now
// applies the law once over the unstripped log.
//
// SAVE-07: the V8 plain-JSON walker ran only on the V8 roots the frozen chain handed down, so a
// NaN in a later root passed validation and became `null` on reload. The live validator now
// walks the whole state.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { FOUNDING_MINIMUMS, beginFounding } from '../src/core/index.js'
import { exportSave, importSave, makeSave, validateSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

function assignment(state: GameState) {
  const roster = state.contracts.map((contract) => state.talent.find((t) => t.id === contract.talentId)!)
  const byRole = (role: string) => roster.filter((t) => t.role === role)
  const actors = byRole('actor')
  return {
    writerId: byRole('writer')[0]!.id, directorId: byRole('director')[0]!.id,
    cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id } satisfies Record<CastSlot, string>,
    craftIds: [byRole('craft')[0]!.id],
  }
}
/** A founded, economy-engaged operations studio (tests/construction-core.test.ts recipe): the
 * V8 save law refuses managed roots on an unfounded world, so the P06A route runs on this one. */
function foundedOperationsStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const byRole = (role: string) => applicants.filter((t) => t.role === role)
  const hires = [
    ...byRole('actor').slice(0, FOUNDING_MINIMUMS.actor), ...byRole('director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole('writer').slice(0, 1), ...byRole('craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [{ kind: 'activateStudioOperations' }])
}
/** The P06A route (tests/construction-core.test.ts): one picture committed to release, so the log holds a `releaseCommitted` row. */
function committedWorld(seed: string): GameState {
  const world = foundedOperationsStudio(seed)
  const concept = world.concepts[0]!
  let state = applyActions(world, [{ kind: 'greenlight', production: {
    conceptId: concept.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
    ...assignment(world), budget: { negative: concept.baseNegativeCost, marketing: 0 },
  } }])
  state = tick(state); state = tick(state); state = tick(state); state = tick(state)
  const production = state.studio.activeProductions[0]!
  state = applyActions(state, [
    { kind: 'assignShootingDirector', productionId: production.id, directorId: production.directorId },
    { kind: 'scheduleShootingTake', productionId: production.id },
  ])
  state = tick(state); state = tick(state); state = tick(state); state = tick(state)
  return applyActions(state, [{ kind: 'commitPictureToRelease', productionId: production.id }])
}

describe('L-19: the sequence law covers every studio-event row, stripped kinds included', () => {
  const save = makeSave(committedWorld('stabilization-l19'))
  const index = save.state.studioEvents.rows.findIndex((row) => row.kind === 'releaseCommitted')
  const forge = (change: (row: Record<string, unknown>) => Record<string, unknown>) => {
    const rows = save.state.studioEvents.rows.map((row, i) => (i === index ? change({ ...row }) : row))
    return JSON.parse(JSON.stringify({ ...save, state: { ...save.state, studioEvents: { ...save.state.studioEvents, rows } } }))
  }

  it('premise: the committed world holds a releaseCommitted row and round-trips', () => {
    expect(index).toBeGreaterThanOrEqual(0)
    expect(() => validateSave(JSON.parse(exportSave(save)))).not.toThrow()
    expect(() => importSave(exportSave(save))).not.toThrow()
  })

  it('refuses a stripped row whose seq is at or above nextSeq', () => {
    const forged = forge((row) => ({ ...row, seq: save.state.studioEvents.nextSeq }))
    expect(() => validateSave(forged)).toThrow(/studioEvents\.rows\[\d+\]\.seq is at or above nextSeq/)
  })

  it('refuses a stripped row whose seq rewinds below its predecessor', () => {
    if (index === 0) return // the committed row is first: nothing precedes it to rewind below
    const forged = forge((row) => ({ ...row, seq: (save.state.studioEvents.rows[index - 1]!.seq) }))
    expect(() => validateSave(forged)).toThrow(/studioEvents\.rows\[\d+\]\.seq must be strictly ascending/)
  })

  it('refuses a stripped row dated in the future', () => {
    const forged = forge((row) => ({ ...row, week: save.state.market.tick + 1 }))
    expect(() => validateSave(forged)).toThrow(/studioEvents\.rows\[\d+\]\.week is in the future/)
  })
})

describe('SAVE-07: the live validator refuses a non-finite number anywhere in the state', () => {
  it('a NaN in a post-V8 root is refused instead of becoming null on reload', () => {
    const state = p13aGeneratedStudio('stabilization-save07')
    const forged = { ...state, hollywood: state.hollywood === null ? null : { ...state.hollywood, nextReceipt: Number.NaN } } as GameState
    expect(() => makeSave(forged)).toThrow(/contains a non-finite number/)
  })
})
