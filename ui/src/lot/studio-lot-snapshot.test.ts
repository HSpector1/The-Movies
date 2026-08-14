// ── Gate D1: studioLotSnapshot selector tests ────────────────────────────────
// Independent tests that the presentation snapshot is a faithful, deterministic,
// non-mutating projection of the authoritative D-12 GameState — and invents nothing
// (no fabricated decision-required, no theatrical payment data). State is built with
// the engine's public surface exactly as the core tests do.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
  TUNING,
} from '../../../src/core/index.ts'
import type {
  CastSlot,
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  GreenlightScriptProjectPayload,
} from '../../../src/core/index.ts'
import {
  exportSaveJson,
  financeCard,
  importSaveJson,
  castingSessionsBoard,
  selectActiveProductions,
  selectCash,
  selectStanding,
  scriptProjectsBoard,
  studioLotSnapshot,
  STUDIO_LOT_BRAND,
} from '../engine/adapter.ts'

// ── engine-level fixtures (mirroring tests/d12-economy.test.ts) ───────────────
function foundStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
// A richer roster with disjoint talent for two concurrent productions (engine enforces
// talent exclusivity, M16): 6 actors, 2 directors, 2 writers, 2 crafts.
function foundStudioRich(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [...byRole('actor', 6), ...byRole('director', 2), ...byRole('writer', 2), ...byRole('craft', 2)]
  for (const t of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}
function foundManagedStudio(seed: string, rich = false): GameState {
  const founded = rich ? foundStudioRich(seed) : foundStudio(seed)
  return applyActions(founded, [{ kind: 'activateStudioOperations' }])
}
function foundManagedScriptStudio(seed: string, rich = false): GameState {
  return applyActions(foundManagedStudio(seed, rich), [
    { kind: 'activateScriptDevelopment' },
  ])
}
function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}
// `slot` selects a disjoint block of talent (3 actors + 1 each of writer/director/craft)
// so two concurrent films never share a person (engine exclusivity). slot 0 works with
// the minimum roster; slot 1 needs foundStudioRich.
function greenlightFilm(s: GameState, conceptIndex: number, slot = 0): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
  const a = slot * 3
  const cast = { lead: actors[a]!, antagonist: actors[a + 1]!, support: actors[a + 2]! } as Record<CastSlot, string>
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
        },
        writerId: rosterIds(s, 'writer')[slot]!,
        directorId: rosterIds(s, 'director')[slot]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[slot]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}
function commissionScript(s: GameState, conceptIndex: number, writerIndex = 0): GameState {
  const concept = s.concepts[conceptIndex]!
  const project: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: rosterIds(s, 'writer')[writerIndex]!,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
  }
  return applyActions(s, [{ kind: 'commissionScript', project }])
}
function greenlightReadyScript(s: GameState, projectId: string): GameState {
  const project = s.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)!
  const concept = s.concepts.find((candidate) => candidate.id === project.conceptId)!
  const actors = rosterIds(s, 'actor')
  const production: GreenlightScriptProjectPayload = {
    projectId,
    directorId: rosterIds(s, 'director')[0]!,
    craftIds: [rosterIds(s, 'craft')[0]!],
    cast: {
      lead: actors[0]!,
      antagonist: actors[1]!,
      support: actors[2]!,
    },
    budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
  }
  return applyActions(s, [{ kind: 'greenlightScriptProject', production }])
}
function productionAndDraftingScript(seed: string): GameState {
  let state = commissionScript(foundManagedScriptStudio(seed, true), 0, 0)
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
  state = greenlightReadyScript(state, 'script-0000')
  return commissionScript(state, 1, 1)
}
function advance(s: GameState, n: number): GameState {
  let out = s
  for (let i = 0; i < n; i++) out = tick(out)
  return out
}
const stage = (snap: ReturnType<typeof studioLotSnapshot>, id: string) => snap.buildings.find((b) => b.id === id)!
const operation = (snap: ReturnType<typeof studioLotSnapshot>, id: string) =>
  snap.productionOperations?.find((candidate) => candidate.productionId === id)!

describe('studioLotSnapshot — authoritative, deterministic, invents nothing', () => {
  it('1. a fresh founded studio produces a valid snapshot (all nine buildings)', () => {
    const s = foundStudio('lot-1')
    const snap = studioLotSnapshot(s)
    expect(snap.studioName).toBe(STUDIO_LOT_BRAND)
    expect(snap.week).toBe(s.market.tick)
    expect(snap.buildings).toHaveLength(9)
    expect(snap.sceneSeed).toBe(s.seed)
    expect(snap.activeProductions).toHaveLength(0)
    expect(snap.releasePresence).toBe('none')
  })

  it('2. an imported SaveFileV4 yields the same week / cash / standing', () => {
    const s = advance(greenlightFilm(foundStudio('lot-2'), 0), 3)
    const round = importSaveJson(exportSaveJson(s))
    expect(round.ok).toBe(true)
    if (!round.ok) return
    const a = studioLotSnapshot(s)
    const b = studioLotSnapshot(round.state)
    expect(b.week).toBe(a.week)
    expect(b.cash).toBe(a.cash)
    expect(b.standingValues).toEqual(a.standingValues)
  })

  it('3. lot cash equals the authoritative cash / finance read model (not recomputed)', () => {
    const s = advance(greenlightFilm(foundStudio('lot-3'), 0), 2)
    const snap = studioLotSnapshot(s)
    expect(snap.cash).toBe(selectCash(s))
    expect(snap.cash).toBe(financeCard(s).cash)
  })

  it('4. lot standing equals the authoritative standing read model', () => {
    const s = foundStudio('lot-4')
    const snap = studioLotSnapshot(s)
    const st = selectStanding(s)
    expect(snap.standingValues.awareness).toBe(st.audienceAwareness)
    expect(snap.standingValues.prestige).toBe(st.industryPrestige)
    expect(snap.standingValues.confidence).toBe(st.commercialConfidence)
  })

  it('5. zero productions renders two EMPTY stages', () => {
    const snap = studioLotSnapshot(foundStudio('lot-5'))
    expect(snap.activeProductions).toHaveLength(0)
    expect(stage(snap, 'stage-a').attention).toBe('empty')
    expect(stage(snap, 'stage-b').attention).toBe('empty')
  })

  it('6. one production occupies exactly one stage', () => {
    const snap = studioLotSnapshot(greenlightFilm(foundStudio('lot-6'), 0))
    expect(snap.activeProductions).toHaveLength(1)
    expect(snap.activeProductions[0]!.stageId).toBe('stage-a')
    expect(stage(snap, 'stage-a').attention).toBe('active')
    expect(stage(snap, 'stage-b').attention).toBe('empty')
  })

  it('7. two productions occupy Stage A and Stage B independently', () => {
    let s = foundStudioRich('lot-7')
    s = greenlightFilm(s, 0, 0)
    s = greenlightFilm(s, 1, 1)
    const snap = studioLotSnapshot(s)
    expect(snap.activeProductions).toHaveLength(2)
    const a = snap.activeProductions.find((p) => p.stageId === 'stage-a')!
    const b = snap.activeProductions.find((p) => p.stageId === 'stage-b')!
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
    expect(a.id).not.toBe(b.id)
    expect(stage(snap, 'stage-a').attention).toBe('active')
    expect(stage(snap, 'stage-b').attention).toBe('active')
  })

  it('8. progress + weeks-remaining come from the authoritative production projection', () => {
    const s = advance(greenlightFilm(foundStudio('lot-8'), 0), 3)
    const prod = selectActiveProductions(s)[0]!
    const card = studioLotSnapshot(s).activeProductions[0]!
    expect(card.weeksRemaining).toBe(prod.remainingTicks)
    expect(card.progress01).toBeCloseTo((TUNING.PRODUCTION_TICKS - prod.remainingTicks) / TUNING.PRODUCTION_TICKS, 10)
    expect(card.stageState).toBe('filming')
  })

  it('9. attention is derived from a read model; no production is ever decision-required in D1', () => {
    const s = greenlightFilm(foundStudio('lot-9'), 0)
    const snap = studioLotSnapshot(s)
    // The one authoritative attention (Administration warning) is derived from the finance
    // read model — it appears iff cash + runway indicate financial pressure.
    const fin = financeCard(s)
    const expectWarn =
      s.studio.cash <= 0 || (fin.runway.weeks !== null && !fin.runway.infinite && fin.runway.weeks <= 8)
    expect(stage(snap, 'admin').attention === 'warning').toBe(expectWarn)
    // D1 never fabricates decision-required / ready-for-release for a production.
    for (const b of snap.buildings) expect(b.attention).not.toBe('decision-required')
    for (const p of snap.activeProductions) expect(p.stageState).not.toBe('decision-required')
  })

  it('10. the selector is deterministic (same state → identical snapshot; same seed → identical)', () => {
    const s = advance(greenlightFilm(foundStudio('lot-10'), 0), 2)
    expect(JSON.stringify(studioLotSnapshot(s))).toBe(JSON.stringify(studioLotSnapshot(s)))
    expect(JSON.stringify(studioLotSnapshot(foundStudio('same-seed')))).toBe(
      JSON.stringify(studioLotSnapshot(foundStudio('same-seed'))),
    )
  })

  it('11. the selector does not mutate state', () => {
    const s = greenlightFilm(foundStudio('lot-11'), 0)
    const before = JSON.stringify(s)
    studioLotSnapshot(s)
    expect(JSON.stringify(s)).toBe(before)
  })

  it('12. no financial value is independently recomputed (cash is the read-model value)', () => {
    const s = advance(greenlightFilm(foundStudio('lot-12'), 0), 4)
    const snap = studioLotSnapshot(s)
    // Identity, not approximate — the snapshot forwards the authoritative number.
    expect(snap.cash).toBe(financeCard(s).cash)
    expect(snap.cash).toBe(s.studio.cash)
  })

  it('13. a legacy Expansion Pad carries no invented parcel, project, or capability', () => {
    const snap = studioLotSnapshot(foundStudio('lot-13'))
    const exp = stage(snap, 'expansion')
    expect(exp.attention).toBe('future')
    expect(exp.available).toBe(false)
    expect(exp.attentionReason).toBe('No managed expansion parcel')
    expect(exp.constructionStatus).toBe('legacy')
    expect(exp.constructionProgressText).toBe('No managed expansion parcel')
    expect(exp.constructionProgress01).toBe(0)
  })

  it('13b. projects the managed Annex parcel lifecycle without a lot-owned clock', () => {
    let state = foundManagedStudio('lot-annex-lifecycle')
    let exp = stage(studioLotSnapshot(state), 'expansion')
    expect(exp).toMatchObject({
      available: true,
      attention: 'empty',
      constructionStatus: 'vacant',
      constructionProgress01: 0,
      constructionProgressText: 'Vacant expansion parcel',
    })

    state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
    state = advance(state, 5)
    exp = stage(studioLotSnapshot(state), 'expansion')
    expect(exp).toMatchObject({
      attention: 'active',
      constructionStatus: 'building',
      constructionProgress01: 5 / 13,
      constructionProgressText: '5 of 13 weekly advances complete',
    })

    state = advance(state, 8)
    exp = stage(studioLotSnapshot(state), 'expansion')
    expect(exp).toMatchObject({
      attention: 'positive',
      constructionStatus: 'operational',
      constructionProgress01: 1,
      constructionProgressText: 'Operational since Week 13',
    })
  })

  it('14. release presence does not invent theatrical payment data', () => {
    const s = advance(greenlightFilm(foundStudio('lot-14'), 0), TUNING.PRODUCTION_TICKS + 1)
    const snap = studioLotSnapshot(s)
    expect(s.studio.releasedFilms.length).toBeGreaterThan(0)
    expect(['released', 'now-showing']).toContain(snap.releasePresence)
    // ReleasedCard exposes ONLY display facts — no payment count / revenue / capacity.
    for (const card of snap.releasedFilms) {
      expect(Object.keys(card).sort()).toEqual(['id', 'reception', 'title', 'weeksAgo'])
    }
    // 'now-showing' is grounded in the authoritative active-run count, not invented.
    const nowShowing = financeCard(s).activeRuns > 0
    expect(snap.releasePresence === 'now-showing').toBe(nowShowing)
  })
})

describe('studioLotSnapshot — managed Production Operations truth', () => {
  it('projects every phase to its real lot location and never invents a physical stage', () => {
    let state = greenlightFilm(foundManagedStudio('lot-managed-phases'), 0)
    const productionId = state.studio.activeProductions[0]!.id
    const snapshots = new Map<string, ReturnType<typeof studioLotSnapshot>>()
    snapshots.set('development', studioLotSnapshot(state))
    state = tick(state) // greenlight tick: skip
    state = tick(state) // Development → Pre-production
    snapshots.set('preProduction', studioLotSnapshot(state))
    state = tick(state) // Pre-production → Rehearsal
    snapshots.set('rehearsal', studioLotSnapshot(state))
    state = tick(state) // Rehearsal → Shooting
    snapshots.set('shooting', studioLotSnapshot(state))

    state = applyActions(state, [
      {
        kind: 'assignShootingDirector',
        productionId,
        directorId: state.studio.activeProductions[0]!.directorId,
      },
      { kind: 'clearSceneryLoadIn', productionId },
      { kind: 'scheduleShootingTake', productionId },
    ])
    state = tick(state) // scheduled Shooting take completes; still Shooting
    state = tick(state) // Shooting → Post-production
    snapshots.set('postProduction', studioLotSnapshot(state))
    state = tick(state) // second Post-production week
    state = tick(state) // Post-production → Release Ready
    snapshots.set('releaseReady', studioLotSnapshot(state))

    const expectedLocation = {
      development: 'writers',
      preProduction: 'casting',
      rehearsal: 'stage-a',
      shooting: 'stage-a',
      postProduction: 'post',
      releaseReady: 'theater',
    } as const

    for (const [phase, location] of Object.entries(expectedLocation)) {
      const snap = snapshots.get(phase)!
      expect(snap.operationsMode).toBe('managed')
      expect(snap.stageAssignmentAuthority).toBe('engine')
      expect(operation(snap, productionId).phase).toBe(phase)
      expect(operation(snap, productionId).locationBuildingId).toBe(location)
      expect(stage(snap, location).attention).not.toBe('empty')
      const physical = phase === 'rehearsal' || phase === 'shooting'
      expect(snap.activeProductions.map((card) => card.id)).toEqual(physical ? [productionId] : [])
    }
    expect(snapshots.get('rehearsal')!.activeProductions[0]).toMatchObject({
      active: false,
      stageState: 'idle',
    })
    expect(snapshots.get('shooting')!.activeProductions[0]).toMatchObject({
      active: false,
      stageState: 'decision-required',
    })
  })

  it('maps both exact engine soundstage reservations and ignores production-array order', () => {
    let state = foundManagedStudio('lot-managed-two-stages', true)
    state = greenlightFilm(state, 0, 0)
    state = greenlightFilm(state, 1, 1)
    state = tick(state)
    state = tick(state)
    state = tick(state) // both Rehearsal

    const expected = new Map(
      state.operations.workflows.map((workflow) => {
        const facilityId = workflow.reservations.find((reservation) => reservation.capability === 'soundstage')!.facilityId
        return [workflow.productionId, facilityId === 'facility-soundstage-07' ? 'stage-a' : 'stage-b'] as const
      }),
    )
    const reordered: GameState = {
      ...state,
      studio: { ...state.studio, activeProductions: [...state.studio.activeProductions].reverse() },
    }
    const snap = studioLotSnapshot(reordered)
    for (const card of snap.activeProductions) expect(card.stageId).toBe(expected.get(card.id))
    expect(new Set(snap.activeProductions.map((card) => card.stageId))).toEqual(
      new Set(['stage-a', 'stage-b']),
    )
  })

  it('projects the authoritative shooting task, blocker, command, and stage attention', () => {
    let state = greenlightFilm(foundManagedStudio('lot-managed-blocker'), 0)
    state = advance(state, 4)
    const production = state.studio.activeProductions[0]!

    let snap = studioLotSnapshot(state)
    let op = operation(snap, production.id)
    expect(op.taskStatus).toBe('unassigned')
    expect(op.blocker?.kind).toBe('director-dispatch')
    expect(op.currentCommand).toMatchObject({
      kind: 'assignShootingDirector',
      productionId: production.id,
      directorId: production.directorId,
    })
    expect(op.attention).toBe('decision-required')
    expect(stage(snap, op.locationBuildingId).attention).toBe('decision-required')
    expect(snap.activeProductions[0]).toMatchObject({
      active: false,
      stageState: 'decision-required',
    })

    state = applyActions(state, [
      {
        kind: 'assignShootingDirector',
        productionId: production.id,
        directorId: production.directorId,
      },
    ])
    snap = studioLotSnapshot(state)
    op = operation(snap, production.id)
    expect(op.taskStatus).toBe('blocked')
    expect(op.blocker?.kind).toBe('scenery-load-in')
    expect(op.currentCommand).toMatchObject({
      kind: 'clearSceneryLoadIn',
      productionId: production.id,
    })
    expect(stage(snap, op.locationBuildingId).attentionReason).toBe(op.blocker?.headline)
    expect(snap.activeProductions[0]).toMatchObject({
      active: false,
      stageState: 'decision-required',
    })

    state = applyActions(state, [
      { kind: 'clearSceneryLoadIn', productionId: production.id },
    ])
    snap = studioLotSnapshot(state)
    expect(operation(snap, production.id).taskStatus).toBe('ready')
    expect(snap.activeProductions[0]).toMatchObject({
      active: false,
      stageState: 'decision-required',
    })

    state = applyActions(state, [
      { kind: 'scheduleShootingTake', productionId: production.id },
    ])
    snap = studioLotSnapshot(state)
    expect(snap.activeProductions[0]).toMatchObject({ active: true, stageState: 'filming' })
    state = tick(state)
    snap = studioLotSnapshot(state)
    expect(operation(snap, production.id).taskStatus).toBe('completed')
    expect(snap.activeProductions[0]).toMatchObject({ active: true, stageState: 'filming' })
  })

  it('keeps REC off when a completed Shooting phase is held for Post capacity', () => {
    let state = foundManagedStudio('lot-managed-post-capacity', true)
    state = {
      ...state,
      operations: {
        ...state.operations,
        facilities: state.operations.facilities.map((facility) =>
          facility.id === 'facility-post-building' ? { ...facility, capacity: 1 } : facility,
        ),
      },
    }
    state = greenlightFilm(state, 0, 0)
    state = greenlightFilm(state, 1, 1)
    state = advance(state, 4)
    for (const production of state.studio.activeProductions) {
      state = applyActions(state, [
        {
          kind: 'assignShootingDirector',
          productionId: production.id,
          directorId: production.directorId,
        },
        { kind: 'clearSceneryLoadIn', productionId: production.id },
        { kind: 'scheduleShootingTake', productionId: production.id },
      ])
    }
    state = tick(state) // both takes completed; remainingTicks 4
    state = tick(state) // one enters Post; the other retains its stage with a capacity warning

    const held = state.operations.workflows.find(
      (workflow) => workflow.blocker?.kind === 'facility-capacity',
    )!
    const snap = studioLotSnapshot(state)
    const op = operation(snap, held.productionId)
    const card = snap.activeProductions.find((candidate) => candidate.id === held.productionId)!
    expect(op.blocker?.kind).toBe('facility-capacity')
    expect(op.attention).toBe('warning')
    expect(card).toMatchObject({ active: false, stageState: 'idle' })
    expect(stage(snap, card.stageId).attention).toBe('warning')
  })

  it('keeps an empty managed studio idle and never fabricates Mara or roster people', () => {
    const snap = studioLotSnapshot(foundManagedStudio('lot-managed-idle'))
    expect(snap.operationsMode).toBe('managed')
    expect(snap.activeProductions).toEqual([])
    expect(snap.productionOperations).toEqual([])
    expect(snap.people).toEqual([])
    expect(snap.people.some((person) => person.name === 'Mara Voss')).toBe(false)
    expect(stage(snap, 'stage-a').attention).toBe('empty')
    expect(stage(snap, 'stage-b').attention).toBe('empty')
  })

  it('shows only the real active production director and lead in managed mode', () => {
    const state = greenlightFilm(foundManagedStudio('lot-managed-real-people'), 0)
    const production = state.studio.activeProductions[0]!
    const snap = studioLotSnapshot(state)
    expect(new Set(snap.people.map((person) => person.id))).toEqual(
      new Set([production.directorId, production.cast.lead]),
    )
    expect(snap.people.every((person) => person.authority === 'active-production')).toBe(true)
    expect(snap.people.every((person) => person.productionId === production.id)).toBe(true)
    expect(operation(snap, production.id)).toMatchObject({
      directorId: production.directorId,
      leadId: production.cast.lead,
      leadName: state.talent.find((person) => person.id === production.cast.lead)!.name,
    })
  })

  it('labels legacy stage assignment while preserving every pre-operations lot field', () => {
    const snap = studioLotSnapshot(greenlightFilm(foundStudio('lot-legacy-labelled'), 0))
    expect(snap.operationsMode).toBe('legacy')
    expect(snap.stageAssignmentAuthority).toBe('presentation')
    expect(snap.productionOperations?.[0]).toMatchObject({
      phase: 'legacy',
      phaseLabel: 'Legacy production schedule',
      weeksRemaining: 8,
      progress01: 0,
      locationBuildingId: 'stage-a',
      currentCommand: null,
    })
    expect(snap.activeProductions[0]!.stageId).toBe('stage-a')
    expect(stage(snap, 'stage-a').attention).toBe('active')
  })
})

describe('studioLotSnapshot — Script Projects V1 Writers Room attention', () => {
  it('maps managed idle to empty while preserving the legacy Development cue', () => {
    const managed = studioLotSnapshot(foundManagedScriptStudio('lot-scripts-idle'))
    expect(stage(managed, 'writers')).toMatchObject({
      attention: 'empty',
      attentionReason: 'Writers Room idle',
    })

    const legacy = studioLotSnapshot(foundManagedStudio('lot-scripts-legacy'))
    expect(stage(legacy, 'writers')).toMatchObject({
      attention: 'active',
      attentionReason: 'Assemble a film to get started.',
    })
  })

  it('maps active drafting to active with the core screenplay headline', () => {
    const state = commissionScript(foundManagedScriptStudio('lot-scripts-active'), 0)
    const cue = scriptProjectsBoard(state).lotAttention
    expect(cue.kind).toBe('active-work')

    expect(stage(studioLotSnapshot(state), 'writers')).toMatchObject({
      attention: 'active',
      attentionReason: cue.headline,
    })
  })

  it('maps shared-capacity constraint to warning ahead of production Development', () => {
    const state = productionAndDraftingScript('lot-scripts-capacity')
    const productionId = state.studio.activeProductions[0]!.id
    const cue = scriptProjectsBoard(state).lotAttention
    const snap = studioLotSnapshot(state)

    expect(operation(snap, productionId)).toMatchObject({
      phase: 'development',
      locationBuildingId: 'writers',
      attention: 'active',
    })
    expect(cue.kind).toBe('capacity-constraint')
    expect(stage(snap, 'writers')).toMatchObject({
      attention: 'warning',
      attentionReason: cue.headline,
    })
  })

  it('maps review then Ready ahead of the same production Development cue', () => {
    let state = tick(productionAndDraftingScript('lot-scripts-review-ready'))
    const productionId = state.studio.activeProductions[0]!.id
    let cue = scriptProjectsBoard(state).lotAttention
    let snap = studioLotSnapshot(state)

    expect(operation(snap, productionId)).toMatchObject({
      phase: 'development',
      locationBuildingId: 'writers',
      attention: 'active',
    })
    expect(cue.kind).toBe('review-required')
    expect(stage(snap, 'writers')).toMatchObject({
      attention: 'decision-required',
      attentionReason: cue.headline,
    })

    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0001' }])
    cue = scriptProjectsBoard(state).lotAttention
    snap = studioLotSnapshot(state)
    expect(cue.kind).toBe('ready-script')
    expect(stage(snap, 'writers')).toMatchObject({
      attention: 'positive',
      attentionReason: cue.headline,
    })
  })
})

describe('studioLotSnapshot — Casting Sessions V1 attention', () => {
  it('lets an active pre-production operation own Casting when casting has no cue', () => {
    let state = foundManagedScriptStudio('lot-casting-operation-fallback')
    state = applyActions(state, [{ kind: 'activateCastingSessions' }])
    state = commissionScript(state, 0)
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: 'script-0000' }])
    state = greenlightReadyScript(state, 'script-0000')
    state = tick(state) // greenlight tick: skip
    state = tick(state) // Development → Pre-production at Casting

    const productionId = state.studio.activeProductions[0]!.id
    const snap = studioLotSnapshot(state)
    const cue = operation(snap, productionId)
    expect(cue).toMatchObject({
      phase: 'preProduction',
      locationBuildingId: 'casting',
      attention: 'active',
    })
    expect(stage(snap, 'casting')).toMatchObject({
      attention: 'active',
      attentionReason: `${cue.title} — ${cue.phaseLabel}`,
    })
  })

  it('does not label an actor-blocked Ready screenplay positive over pre-production', () => {
    let state = foundManagedScriptStudio('lot-casting-actor-blocked', true)
    state = applyActions(state, [{ kind: 'activateCastingSessions' }])
    state = commissionScript(state, 0, 0)
    state = commissionScript(state, 1, 1)
    state = tick(state)
    state = applyActions(state, [
      { kind: 'acceptScript', projectId: 'script-0000' },
      { kind: 'acceptScript', projectId: 'script-0001' },
    ])
    state = greenlightReadyScript(state, 'script-0000')
    state = tick(state) // greenlight tick: skip
    state = tick(state) // Development → Pre-production at Casting

    const production = state.studio.activeProductions[0]!
    const busyActors = new Set(Object.values(production.cast))
    const keepPrimaryActors = new Set(
      state.talent
        .filter((talent) => talent.role === 'actor' && !busyActors.has(talent.id))
        .slice(0, 2)
        .map((talent) => talent.id),
    )
    state = {
      ...state,
      talent: state.talent.map((talent) =>
        talent.role === 'actor' && !keepPrimaryActors.has(talent.id)
          ? { ...talent, role: 'director' }
          : talent,
      ),
    }

    const ready = castingSessionsBoard(state).sections.readyToPlan[0]!
    expect(ready.legalActions.map((action) => action.kind)).not.toContain('planAuditions')
    expect(ready.blockers).toContainEqual(
      expect.stringContaining('At least three currently available primary Actors'),
    )
    const snap = studioLotSnapshot(state)
    const cue = operation(snap, production.id)
    expect(cue).toMatchObject({ phase: 'preProduction', locationBuildingId: 'casting' })
    expect(stage(snap, 'casting')).toMatchObject({
      attention: cue.attention,
      attentionReason: `${cue.title} — ${cue.phaseLabel}`,
    })
  })
})
