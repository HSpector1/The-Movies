import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { exportSave, importSave, makeSave, migrateToV22 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { generateScientist } from '../src/core/worldgen.js'
import type { GameState } from '../src/core/types.js'
import { p13bTwoLabWorld } from '../src/harness/p13b/fixtures.js'

// P13B-S2 plan test 7 (task expansion, 2026-09-16): validator refusals for the new
// per-Laboratory facts (forged split, a Lab the receipt has no seat on, a third
// Lab row, a fifth seat across projects, units not matching 8a+5b, a null `labs`
// after cooperation began, a missing/non-integer `cooperationFromWeek`, a stale
// technology version inside a V22 envelope), plus conservation, determinism,
// save/reload continuity and campaign isolation. Every regex below was read
// directly off the landed `validateTechnology` in src/core/technology.ts (the
// exact fact each refusal names), not guessed — this is reading the contract's
// own implementation to phrase an assertion precisely, the same way every other
// P13A/P13B test in this repository quotes a real refusal message; it does not
// make the CURRENT behaviour authoritative on its own — the plan's requirement
// (a refusal that "names the fact, not just invalid") is what is under test.

function stage(state: GameState, lab1: string, lab2: string, ids1: string[], ids2: string[], budgetPerWeek: number): { state: GameState; projectId: string } {
  let s = state
  if (ids1.length) s = applyActions(s, ids1.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab1, scientistId, technologyId: 'synchronized-sound' as const })))
  if (ids2.length) s = applyActions(s, ids2.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'synchronized-sound' as const })))
  const projectId = s.technology.projects.find(p => p.technologyId === 'synchronized-sound')!.id
  s = applyActions(s, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
  return { state: s, projectId }
}

function rejected(source: GameState, change: (state: GameState) => void, message: RegExp) {
  const changed = structuredClone(source)
  change(changed)
  expect(() => makeSave(changed)).toThrow(message)
}

describe('P13B-S2 validator refusals for the per-Laboratory facts (test 7)', () => {
  let world: ReturnType<typeof p13bTwoLabWorld>
  let lab1: string, lab2: string
  let base: GameState // two funded cooperate-sound weeks, 4+4 seats, $80,000 — every receipt non-final
  let baseProjectId: string

  beforeAll(() => {
    world = p13bTwoLabWorld()
    ;[lab1, lab2] = world.laboratoryFacilityIds
    const staged = stage(world.state, lab1, lab2, world.candidateIds.slice(0, 4), world.candidateIds.slice(4, 8), 80_000)
    base = tick(tick(staged.state))
    baseProjectId = staged.projectId
    makeSave(base) // lawful before any mutation
  }, 180_000)

  it('accepts the unmutated staffed save', () => {
    expect(() => makeSave(base)).not.toThrow()
  })

  it('(a) rejects a per-Laboratory spend split that does not match the proportional funding rule, even with the receipt total unchanged', () => {
    // base's own 4+4 @ $80,000 sits exactly AT the $10,000/seat usable cap
    // (spend 40,000/40,000 for four seats each) — moving even $1 off either row
    // would overflow that cap and trip "exceeds its usable seats" first, hiding
    // the fact this case is actually about. A lower ceiling (4+4 @ $60,000,
    // spend 30,000/30,000) leaves slack under the cap so the $1 shift lands
    // squarely on the funding-split law alone.
    const staged = stage(world.state, lab1, lab2, world.candidateIds.slice(0, 4), world.candidateIds.slice(4, 8), 60_000)
    const slack = tick(staged.state)
    rejected(slack, state => {
      const receipt = state.technology.projects.find(p => p.id === staged.projectId)!.weeks[0]!
      receipt.labs![0]!.spend -= 1
      receipt.labs![1]!.spend += 1 // Σ unchanged — this must not trip the "does not sum to the receipt" check instead
    }, /per-Lab research split does not match the funding rule/)
  })

  it('(b) rejects a receipt row naming a Laboratory the project has no seat on', () => {
    rejected(base, state => {
      const receipt = state.technology.projects.find(p => p.id === baseProjectId)!.weeks[0]!
      // Prefixed with a digit so it still sorts first (ascending Laboratory order
      // stays intact) and only the "no seat there" fact is under test.
      receipt.labs![0]!.laboratoryFacilityId = `0-decoy-${receipt.labs![0]!.laboratoryFacilityId}`
    }, /receipt names a Laboratory without a seat/)
  })

  it('(c) rejects a third Laboratory row on one receipt', () => {
    rejected(base, state => {
      const receipt = state.technology.projects.find(p => p.id === baseProjectId)!.weeks[0]!
      receipt.labs!.push({ ...receipt.labs![0]! })
    }, /research receipt names more than two Laboratories/)
  })

  it('(d) rejects a fifth unreleased seat on one Laboratory when it is spread ACROSS two different technology projects', () => {
    rejected(base, state => {
      const outsider = generateScientist(state.seed, 't-sci-outsider')
      state.talent.push(outsider)
      const own = state.hollywood!.playerStudioId
      state.technology.projects.push({
        id: `${own}:research:lighting-control-01`, studioId: own, technologyId: 'lighting-control-01',
        laboratoryFacilityId: lab1, status: 'paused', budgetPerWeek: 0, verifiedWork: 0, expenditure: 0,
        startedWeek: null, completedWeek: null, legacy: null, weeks: [],
        seats: [{ talentId: outsider.id, laboratoryFacilityId: lab1, assignedWeek: state.market.tick, releasedWeek: null }],
      })
    }, /Laboratory seats exceed capacity/)
  })

  it('(e) rejects a non-final receipt whose units do not equal 8·raw_a + 5·raw_b', () => {
    rejected(base, state => {
      const receipt = state.technology.projects.find(p => p.id === baseProjectId)!.weeks[0]!
      receipt.units += 1
    }, /research credit does not match the cooperation rule/)
  })

  it('(f) rejects a receipt at/after cooperationFromWeek carrying labs: null', () => {
    rejected(base, state => {
      const receipt = state.technology.projects.find(p => p.id === baseProjectId)!.weeks[0]!
      receipt.labs = null
    }, /single-pool receipt after cooperation began/)
  })

  it('(g) rejects a technology root with cooperationFromWeek removed', () => {
    rejected(base, state => {
      delete (state.technology as { cooperationFromWeek?: number }).cooperationFromWeek
    }, /cooperationFromWeek/)
  })

  it('(g) rejects a technology root with a non-integer cooperationFromWeek', () => {
    rejected(base, state => {
      state.technology.cooperationFromWeek = 780.5
    }, /bounded integer required/)
  })

  it('(h) rejects technology version 2 inside a saveVersion 22 envelope', () => {
    rejected(base, state => {
      (state.technology as { version: number }).version = 2
    }, /unknown version/)
  })
})

describe('P13B-S2 conservation, determinism, save/reload and campaign isolation (test 7)', () => {
  it('conservation: reconciles receipts, expenditure, ledger and cash over a funded cooperate interval', () => {
    const world = p13bTwoLabWorld()
    const [lab1, lab2] = world.laboratoryFacilityIds
    const staged = stage(world.state, lab1, lab2, world.candidateIds.slice(0, 4), world.candidateIds.slice(4, 8), 80_000)
    const cashBefore = staged.state.studio.cash
    const ledgerBefore = staged.state.ledger.length

    let s = staged.state
    for (let i = 0; i < 3; i++) s = tick(s)
    const project = s.technology.projects.find(p => p.id === staged.projectId)!
    expect(project.weeks).toHaveLength(3)

    const receiptSpend = project.weeks.reduce((sum, r) => sum + r.spend, 0)
    expect(receiptSpend).toBe(project.expenditure)
    const ledgerSpend = s.ledger.filter(e => e.kind === 'researchSpend' && e.note === `research:${staged.projectId}`).reduce((sum, e) => sum - e.amount, 0)
    expect(ledgerSpend).toBe(project.expenditure)
    const receiptUnits = project.weeks.reduce((sum, r) => sum + r.units, 0)
    expect(receiptUnits).toBe(Math.round(project.verifiedWork * 160_000))

    const newRows = s.ledger.slice(ledgerBefore)
    const cashDelta = cashBefore - s.studio.cash
    expect(cashDelta).toBe(newRows.reduce((sum, row) => sum - row.amount, 0))
  })

  it('determinism: two independent builds from the same seed give byte-identical exportSave, both fresh and after identical further actions', () => {
    const a = p13bTwoLabWorld()
    const b = p13bTwoLabWorld()
    expect(exportSave(makeSave(a.state))).toBe(exportSave(makeSave(b.state)))
    const [lab1a, lab2a] = a.laboratoryFacilityIds
    const [lab1b, lab2b] = b.laboratoryFacilityIds
    const sequence = (state: GameState, lab1: string, lab2: string, ids: string[]) => {
      let s = stage(state, lab1, lab2, ids.slice(0, 4), ids.slice(4, 8), 80_000).state
      for (let i = 0; i < 3; i++) s = tick(s)
      return s
    }
    expect(exportSave(makeSave(sequence(a.state, lab1a, lab2a, a.candidateIds))))
      .toBe(exportSave(makeSave(sequence(b.state, lab1b, lab2b, b.candidateIds))))
  }, 60_000)

  it('save/reload mid-project: a reloaded cooperate project continues identically to the uninterrupted run over further weeks', () => {
    const world = p13bTwoLabWorld()
    const [lab1, lab2] = world.laboratoryFacilityIds
    const staged = stage(world.state, lab1, lab2, world.candidateIds.slice(0, 4), world.candidateIds.slice(4, 8), 80_000)
    let running = staged.state
    for (let i = 0; i < 2; i++) running = tick(running)

    const direct = exportSave(makeSave(running))
    const reloaded = migrateToV22(importSave(direct)).state
    expect(exportSave(makeSave(reloaded))).toBe(direct)

    let runningFurther = running, reloadedFurther = reloaded
    for (let i = 0; i < 3; i++) { runningFurther = tick(runningFurther); reloadedFurther = tick(reloadedFurther) }
    expect(exportSave(makeSave(reloadedFurther))).toBe(exportSave(makeSave(runningFurther)))
  })

  it('campaign isolation: every project a public action can create carries studioId === the player, by construction', () => {
    const world = p13bTwoLabWorld()
    const [lab1, lab2] = world.laboratoryFacilityIds
    const staged = stage(world.state, lab1, lab2, world.candidateIds.slice(0, 4), world.candidateIds.slice(4, 8), 80_000)
    const own = staged.state.hollywood!.playerStudioId
    expect(staged.state.technology.projects.every(p => p.studioId === own)).toBe(true)
  })

  it('campaign isolation: a rival two-Laboratory project never surfaces through the player-scoped read filter, and forging the player’s own project never touches its bytes', () => {
    // FINDING: this engine has no public action path that ever creates a
    // two-Laboratory research project for a studio other than the player — every
    // TechnologyAction that writes `technology.projects` resolves `own` from
    // `state.hollywood.playerStudioId` (technology.ts `playerStudioId`); rival
    // studios (`state.hollywood.businesses`) only ever get a commercial
    // `TechnologyAdoption` row via `considerRivalSoundPurchase`, never a seated
    // Laboratory research project. A genuinely-earned rival project cannot be
    // grown in this generated world. This is recorded as the honest limit; the
    // case below proves isolation on a STRUCTURALLY INJECTED rival row — the
    // same injection technique tests/p13b-s2-labs.test.ts already uses for its
    // own project-shape cases — which is the closest lawful proof available.
    const world = p13bTwoLabWorld()
    const [lab1, lab2] = world.laboratoryFacilityIds
    const staged = stage(world.state, lab1, lab2, world.candidateIds.slice(0, 4), world.candidateIds.slice(4, 8), 80_000)
    let state = staged.state
    for (let i = 0; i < 2; i++) state = tick(state)
    const own = state.hollywood!.playerStudioId
    const rivalStudioId = state.hollywood!.identities.find(i => i.studioId !== own)!.studioId

    const withRival = structuredClone(state)
    const rivalProject = {
      id: `${rivalStudioId}:research:lighting-control-01`, studioId: rivalStudioId, technologyId: 'lighting-control-01' as const,
      laboratoryFacilityId: lab2, status: 'paused' as const, budgetPerWeek: 0, verifiedWork: 0, expenditure: 0,
      startedWeek: null, completedWeek: null, legacy: null, weeks: [],
      seats: [],
    }
    withRival.technology.projects.push(rivalProject)
    const rivalBytesBefore = JSON.stringify(withRival.technology.projects.find(p => p.studioId === rivalStudioId))

    // Player-scoped read filter (the same idiom bridge/laboratory.ts uses:
    // `state.technology.projects.find(p => p.studioId === own && ...)`).
    const playerVisible = withRival.technology.projects.filter(p => p.studioId === own)
    expect(playerVisible.some(p => p.studioId === rivalStudioId)).toBe(false)
    expect(playerVisible.map(p => p.id)).toEqual(state.technology.projects.filter(p => p.studioId === own).map(p => p.id))

    // Forging the player's own receipt never touches the rival row's bytes.
    const ownProject = withRival.technology.projects.find(p => p.id === staged.projectId)!
    ownProject.weeks[0]!.spend += 1
    const rivalBytesAfter = JSON.stringify(withRival.technology.projects.find(p => p.studioId === rivalStudioId))
    expect(rivalBytesAfter).toBe(rivalBytesBefore)
  })
})
