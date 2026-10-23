// Stabilization 2026-10-22, audit findings L-19 (SAVE-01) and SAVE-07.
//
// L-19: every frozen era strips the studio-event kinds it introduced before delegating to its
// predecessor (V16 `releaseCommitted`, V25 the four setup kinds) and re-checks only their shape,
// so a stripped row escaped the laws the V14 validator applies to every other row: seq strictly
// ascending, seq below nextSeq, week not in the future, and a windowed (Tier W) row inside the
// retention window. The engine cannot produce such a row; a hostile import can, and the Bridge
// relies on seq uniqueness. The live validator now applies the laws once over the unstripped log.
//
// SAVE-07: the V8 plain-JSON walker ran only on the V8 roots the frozen chain handed down, so a
// NaN in a later root passed validation and became `null` on reload. The live validator now walks
// the whole state for non-finite numbers.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { FOUNDING_MINIMUMS, beginFounding } from '../src/core/index.js'
import { exportSave, importSave, makeSave, validateSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/types.js'
import { advance, operationsStudio, productionPayload, withCash } from './contracts/_contractFixtures.js'

type LiveSave = ReturnType<typeof makeSave>

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
/** The ordinary setup route (tests/p13b-r07-timeline.test.ts) on a studio old enough that a week
 * outside the retention window is still a non-negative week: the log holds the three setup rows. */
function setupWorld(seed: string): GameState {
  // The cash identity adjustment comes AFTER the advance: thirty idle weeks of payroll and
  // overhead drain the studio below the picture's commitment (the D-12 solvency gate).
  let state = withCash(advance(withCash(operationsStudio(seed), 5_000_000), TUNING.STUDIO_EVENT_WINDOW_WEEKS + 4), 5_000_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  state = tick(state); state = tick(state); state = tick(state)
  const productionId = state.studio.activeProductions[0]!.id
  state = applyActions(state, [{ kind: 'setProductionSetupRecipe', productionId, recipeId: 'ordinary-interior-01', expectedPlanRevision: 0 }])
  return tick(tick(state))
}

let committedSave: LiveSave | null = null
/** The committed world's live save, built once for every describe that reads it. */
function committedSaveOnce(): LiveSave {
  committedSave ??= makeSave(committedWorld('stabilization-l19'))
  return committedSave
}

/** The forged file: one row replaced, byte-round-tripped the way an import arrives. */
function forgeRow(save: LiveSave, index: number, change: (row: Record<string, unknown>) => Record<string, unknown>): unknown {
  const rows = save.state.studioEvents.rows.map((row, i) => (i === index ? change({ ...row }) : row))
  return JSON.parse(JSON.stringify({ ...save, state: { ...save.state, studioEvents: { ...save.state.studioEvents, rows } } }))
}
const label = (index: number) => `^validateSaveP15B: state\\.studioEvents\\.rows\\[${String(index)}\\]`

describe('L-19: the sequence laws cover every studio-event row, stripped kinds included', () => {
  describe('a Tier D row the V16 era strips (releaseCommitted)', () => {
    let save: LiveSave
    let index: number
    beforeAll(() => {
      save = committedSaveOnce()
      index = save.state.studioEvents.rows.findIndex((row) => row.kind === 'releaseCommitted')
    }, 120_000)

    it('premise: the committed world holds the row at the lawful edges (this week, the last seq) and round-trips', () => {
      expect(index).toBeGreaterThan(0)
      const row = save.state.studioEvents.rows[index]!
      expect(row.week).toBe(save.state.market.tick)
      expect(row.seq).toBe(save.state.studioEvents.nextSeq - 1)
      expect(() => validateSave(JSON.parse(exportSave(save)))).not.toThrow()
      expect(() => importSave(exportSave(save))).not.toThrow()
    })

    it('refuses the row when its seq is at nextSeq', () => {
      const forged = forgeRow(save, index, (row) => ({ ...row, seq: save.state.studioEvents.nextSeq }))
      expect(() => validateSave(forged)).toThrow(new RegExp(`${label(index)}\\.seq is at or above nextSeq`))
    })

    it('refuses the row when its seq rewinds to its predecessor', () => {
      const forged = forgeRow(save, index, (row) => ({ ...row, seq: save.state.studioEvents.rows[index - 1]!.seq }))
      expect(() => validateSave(forged)).toThrow(new RegExp(`${label(index)}\\.seq must be strictly ascending$`))
    })

    it('refuses the row when it is dated in the future', () => {
      const forged = forgeRow(save, index, (row) => ({ ...row, week: save.state.market.tick + 1 }))
      expect(() => validateSave(forged)).toThrow(new RegExp(`${label(index)}\\.week is in the future$`))
    })
  })

  describe('a Tier W row the V25 era strips (setupUnitCredited)', () => {
    let save: LiveSave
    let index: number
    beforeAll(() => {
      save = makeSave(setupWorld('stabilization-l19-setup'))
      index = save.state.studioEvents.rows.findIndex((row) => row.kind === 'setupUnitCredited')
    }, 120_000)

    it('premise: the route wrote the setup rows inside the window, and the file round-trips', () => {
      expect(index).toBeGreaterThan(0)
      expect(save.state.studioEvents.rows.map((row) => row.kind)).toEqual(expect.arrayContaining(['setupAdmitted', 'setupUnitCredited', 'setupCompleted']))
      expect(save.state.market.tick).toBeGreaterThanOrEqual(TUNING.STUDIO_EVENT_WINDOW_WEEKS)
      expect(() => importSave(exportSave(save))).not.toThrow()
    })

    it('refuses the row when its seq is at nextSeq', () => {
      const forged = forgeRow(save, index, (row) => ({ ...row, seq: save.state.studioEvents.nextSeq }))
      expect(() => validateSave(forged)).toThrow(new RegExp(`${label(index)}\\.seq is at or above nextSeq`))
    })

    it('admits the row at the oldest kept week (the window is inclusive of that edge)', () => {
      const forged = forgeRow(save, index, (row) => ({ ...row, week: save.state.market.tick - (TUNING.STUDIO_EVENT_WINDOW_WEEKS - 1) }))
      expect(() => validateSave(forged)).not.toThrow()
    })

    it('refuses the row when it is dated outside the retention window the tick would have compacted', () => {
      const forged = forgeRow(save, index, (row) => ({ ...row, week: save.state.market.tick - TUNING.STUDIO_EVENT_WINDOW_WEEKS }))
      expect(() => validateSave(forged)).toThrow(new RegExp(`${label(index)}\\.week is outside the ${String(TUNING.STUDIO_EVENT_WINDOW_WEEKS)}-week retention window`))
    })
  })
})

describe('SAVE-07: the live validator refuses a non-finite number anywhere in the state', () => {
  // A numeric leaf of the committed world's live save that no named validator checks: a probe that
  // nulled every numeric leaf in turn and ran the chain found this one admitted (stabilization
  // 2026-10-22). The audited class, a folded standing row's numbers (studioHistory.ts), is the same
  // hole on a world old enough to fold. A NaN here became `null` on reload; the walk names it.
  const LEAF = '.studioHistory.rows[1].facts.anchor'
  const parts = LEAF.replace(/\[(\d+)\]/g, '.$1').split('.').filter((part) => part !== '')
  const parent = (root: unknown) => parts.slice(0, -1).reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], root) as Record<string, unknown>

  it(`a NaN at ${LEAF} is refused by name instead of becoming null on reload`, () => {
    const forged = JSON.parse(JSON.stringify(committedSaveOnce())) as LiveSave
    const holder = parent(forged.state)
    const key = parts[parts.length - 1]!
    expect(Number.isFinite(holder[key])).toBe(true)
    holder[key] = Number.NaN
    expect(() => validateSave(forged)).toThrow(/^validateSaveP15B: state\.studioHistory\.rows\[1\]\.facts\.anchor contains a non-finite number \(NaN\)$/)
  }, 120_000)
})
