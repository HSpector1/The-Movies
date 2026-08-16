// ── Gate D1: studioLotSnapshot selector tests ────────────────────────────────
// Independent tests that the presentation snapshot is a faithful, deterministic,
// non-mutating projection of the authoritative D-12 GameState — and invents nothing
// (no fabricated decision-required, no theatrical payment data). State is built with
// the engine's public surface exactly as the core tests do.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  advanceManagedProductions,
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
  managedProductionCompanyProjection,
  castingSessionsBoard,
  selectActiveProductions,
  selectCash,
  selectStanding,
  scriptProjectsBoard,
  studioLotSnapshot,
  STUDIO_LOT_BRAND,
} from '../engine/adapter.ts'
import { operationalAnnexWorkContext } from './snapshot/annexWork.ts'

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
function foundOperationalAnnexStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = state.founding!.applicantIds.map((id) =>
    state.talent.find((talent) => talent.id === id)!,
  )
  const byRole = (role: CreativeRole, count: number) =>
    pool.filter((talent) => talent.role === role).slice(0, count)
  const hires = [
    ...byRole('actor', 6),
    ...byRole('director', 2),
    ...byRole('writer', 3),
    ...byRole('craft', 2),
  ]
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 156 },
    ])
  }
  state = applyActions(state, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
    { kind: 'startDevelopmentCastingAnnex' },
  ])
  return advance(state, 13)
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
    expect(studioLotSnapshot(state).annexWork).toBeNull()

    state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
    state = advance(state, 5)
    exp = stage(studioLotSnapshot(state), 'expansion')
    expect(exp).toMatchObject({
      attention: 'active',
      constructionStatus: 'building',
      constructionProgress01: 5 / 13,
      constructionProgressText: '5 of 13 weekly advances complete',
    })
    expect(studioLotSnapshot(state).annexWork).toBeNull()

    state = advance(state, 8)
    exp = stage(studioLotSnapshot(state), 'expansion')
    expect(exp).toMatchObject({
      attention: 'empty',
      attentionReason: 'Available · 0 of 1 slot occupied',
      constructionStatus: 'operational',
      constructionProgress01: 1,
      constructionProgressText: 'Operational since Week 13',
    })
    expect(studioLotSnapshot(state).annexWork).toEqual({
      facilityId: 'facility-development-casting-annex',
      facilityName: 'Development & Casting Annex',
      capability: 'development-casting',
      capacity: 1,
      occupied: 0,
      available: 1,
      slot: 0,
      occupant: null,
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
  it('selects the exact unique Annex row independent of facility order and rejects lookalikes', () => {
    const state = foundOperationalAnnexStudio('lot-annex-identity')
    const reordered: GameState = {
      ...state,
      operations: {
        ...state.operations,
        facilities: [...state.operations.facilities].reverse(),
      },
    }
    expect(studioLotSnapshot(reordered).annexWork).toEqual(studioLotSnapshot(state).annexWork)

    const malformed = [
      state.operations.facilities.filter(
        (facility) => facility.id !== 'facility-development-casting-annex',
      ),
      [
        ...state.operations.facilities,
        { ...state.operations.facilities.at(-1)! },
      ],
      state.operations.facilities.map((facility) =>
        facility.id === 'facility-development-casting-annex'
          ? { ...facility, name: 'Development Annex Lookalike' }
          : facility,
      ),
      state.operations.facilities.map((facility) =>
        facility.id === 'facility-development-casting-annex'
          ? { ...facility, capacity: 2 }
          : facility,
      ),
    ]
    for (const facilities of malformed) {
      expect(() =>
        studioLotSnapshot({
          ...state,
          operations: { ...state.operations, facilities },
        }),
      ).toThrow()
    }
  })

  it('projects exact Annex screenplay and casting occupants from ordinary allocation', () => {
    let scripts = foundOperationalAnnexStudio('lot-annex-script-work')
    scripts = commissionScript(scripts, 0, 0)
    scripts = commissionScript(scripts, 1, 1)
    scripts = commissionScript(scripts, 2, 2)

    let snap = studioLotSnapshot(scripts)
    expect(snap.annexWork).toMatchObject({
      occupied: 1,
      available: 0,
      occupant: {
        owner: 'script',
        ownerId: 'script-0002',
        activity: 'drafting',
        workState: 'working',
        statusLabel: null,
        blocker: null,
      },
    })
    expect(stage(snap, 'expansion')).toMatchObject({
      attention: 'active',
      attentionReason: `Working · ${snap.annexWork?.occupant?.title}`,
    })
    expect(operationalAnnexWorkContext(snap)?.state).toBe('working')

    scripts = tick(scripts)
    scripts = applyActions(scripts, [
      { kind: 'requestScriptRewrite', projectId: 'script-0000' },
      { kind: 'requestScriptRewrite', projectId: 'script-0001' },
      { kind: 'requestScriptRewrite', projectId: 'script-0002' },
    ])
    snap = studioLotSnapshot(scripts)
    expect(snap.annexWork?.occupant).toMatchObject({
      owner: 'script',
      ownerId: 'script-0002',
      activity: 'rewriting',
      workState: 'working',
      statusLabel: null,
      blocker: null,
    })

    let casting = foundOperationalAnnexStudio('lot-annex-casting-work')
    casting = commissionScript(casting, 0, 0)
    casting = tick(casting)
    casting = applyActions(casting, [{ kind: 'acceptScript', projectId: 'script-0000' }])
    casting = commissionScript(casting, 1, 1)
    casting = commissionScript(casting, 2, 2)
    const actors = rosterIds(casting, 'actor')
    casting = applyActions(casting, [
      {
        kind: 'startCastingSession',
        session: {
          projectId: 'script-0000',
          slate: {
            lead: [actors[0]!, actors[1]!],
            antagonist: [actors[0]!, actors[2]!],
            support: [actors[1]!, actors[2]!],
          },
        },
      },
    ])
    snap = studioLotSnapshot(casting)
    expect(snap.annexWork?.occupant).toMatchObject({
      owner: 'casting',
      ownerId: 'casting-0000',
      activity: 'auditioning',
      workState: 'working',
      statusLabel: null,
      blocker: null,
    })
    expect(operationalAnnexWorkContext(snap)?.ownerIntent).toEqual({
      owner: 'casting',
      ownerId: 'casting-0000',
    })
  })

  it('maps exact Annex production reservations to expansion and joins Working/Held Calendar truth', () => {
    let state = foundOperationalAnnexStudio('lot-annex-production-work')
    state = commissionScript(state, 0, 0)
    state = commissionScript(state, 1, 1)
    state = tick(state)
    state = applyActions(state, [
      { kind: 'acceptScript', projectId: 'script-0000' },
      { kind: 'acceptScript', projectId: 'script-0001' },
    ])

    // First picture takes base slot 0. One live draft takes base slot 1, so the
    // second picture is allocated to the exact completed Annex by public actions.
    state = greenlightReadyScript(state, 'script-0000')
    state = commissionScript(state, 2, 2)
    const secondProject = state.scriptDevelopment.projects.find(
      (project) => project.id === 'script-0001',
    )!
    const concept = state.concepts.find((candidate) => candidate.id === secondProject.conceptId)!
    const actors = rosterIds(state, 'actor')
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: {
          projectId: secondProject.id,
          directorId: rosterIds(state, 'director')[1]!,
          craftIds: [rosterIds(state, 'craft')[1]!],
          cast: {
            lead: actors[3]!,
            antagonist: actors[4]!,
            support: actors[5]!,
          },
          budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
        },
      },
    ])

    const annexProductionId = state.studio.activeProductions[1]!.id
    let snap = studioLotSnapshot(state)
    expect(operation(snap, annexProductionId)).toMatchObject({
      phase: 'development',
      locationBuildingId: 'expansion',
      facilityLabel: 'Development & Casting Annex',
    })
    expect(snap.annexWork?.occupant).toMatchObject({
      owner: 'production',
      ownerId: annexProductionId,
      activity: 'development',
      workState: 'working',
      statusLabel: 'On schedule',
      blocker: null,
    })
    expect(stage(snap, 'expansion')).toMatchObject({
      attention: 'active',
      attentionReason: `Working · ${snap.annexWork?.occupant?.title}`,
    })
    expect(operationalAnnexWorkContext(snap)?.ownerIntent).toEqual({
      owner: 'production',
      ownerId: annexProductionId,
    })

    // Advance natively into Pre-production, then use the committed configured
    // capacity seam to place the higher-id picture back in the Annex. This is
    // read-model robustness evidence, never a native SaveFile fixture.
    state = tick(state)
    state = tick(state)
    state = {
      ...state,
      operations: {
        ...state.operations,
        facilities: state.operations.facilities.map((facility) =>
          facility.id === 'facility-development-casting'
            ? { ...facility, capacity: 1 }
            : facility,
        ),
        workflows: state.operations.workflows.map((workflow) =>
          workflow.productionId === annexProductionId
            ? {
                ...workflow,
                reservations: workflow.reservations.map((reservation) => ({
                  ...reservation,
                  facilityId: 'facility-development-casting-annex',
                  slot: 0,
                })),
              }
            : workflow,
        ),
      },
    }

    snap = studioLotSnapshot(state)
    expect(operation(snap, annexProductionId)).toMatchObject({
      phase: 'preProduction',
      locationBuildingId: 'expansion',
      facilityLabel: 'Development & Casting Annex',
    })
    expect(snap.annexWork?.occupant).toMatchObject({
      owner: 'production',
      ownerId: annexProductionId,
      activity: 'preProduction',
      workState: 'working',
      statusLabel: 'On schedule',
      blocker: null,
    })

    const beforeHeld = state.studio.activeProductions.find(
      (production) => production.id === annexProductionId,
    )!.remainingTicks
    const configuredOperations = {
      ...state.operations,
      facilities: state.operations.facilities.filter(
        (facility) => facility.id !== 'facility-soundstage-12',
      ),
    }
    const advanced = advanceManagedProductions(
      configuredOperations,
      state.studio.activeProductions,
      state.market.tick,
    )
    state = {
      ...state,
      operations: advanced.operations,
      studio: { ...state.studio, activeProductions: advanced.productions },
    }

    snap = studioLotSnapshot(state)
    expect(
      state.studio.activeProductions.find((production) => production.id === annexProductionId)!
        .remainingTicks,
    ).toBe(beforeHeld)
    expect(operation(snap, annexProductionId).locationBuildingId).toBe('expansion')
    expect(snap.annexWork?.occupant).toMatchObject({
      owner: 'production',
      ownerId: annexProductionId,
      activity: 'preProduction',
      workState: 'held',
      statusLabel: 'Held for facility capacity',
      blocker: {
        kind: 'facility-capacity',
        headline: 'Rehearsal held for Soundstage',
      },
    })
    expect(stage(snap, 'expansion')).toMatchObject({
      attention: 'warning',
      attentionReason: `Production held · ${snap.annexWork?.occupant?.title}`,
    })
    expect(operationalAnnexWorkContext(snap)?.state).toBe('held')
  })

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

  it('keeps an empty managed studio idle and shows only its OWN employees, never a fabricated one', () => {
    // Tycoon World M1.5: the studio's contracted people are present on a Week-0 managed
    // lot (they were projected only in legacy mode before, so the world showed nobody).
    // Presence is employment truth ONLY: no production, no title, no location claim.
    const state = foundManagedStudio('lot-managed-idle')
    const snap = studioLotSnapshot(state)
    const contracted = new Set(state.contracts.map((contract) => contract.talentId))
    expect(snap.operationsMode).toBe('managed')
    expect(snap.activeProductions).toEqual([])
    expect(snap.productionOperations).toEqual([])
    expect(snap.people.length).toBeGreaterThan(0)
    expect(snap.people.every((person) => contracted.has(person.id))).toBe(true)
    expect(snap.people.every((person) =>
      person.authority === 'studio-roster' &&
      person.productionId === null &&
      person.productionTitle === null,
    )).toBe(true)
    expect(new Set(snap.people.map((person) => person.id)).size).toBe(snap.people.length)
    expect(snap.people.some((person) => person.name === 'Mara Voss')).toBe(false)
    expect(stage(snap, 'stage-a').attention).toBe('empty')
    expect(stage(snap, 'stage-b').attention).toBe('empty')
  })

  it('projects one complete current company in canonical slot order without consulting profession or frozen history', () => {
    let state = greenlightFilm(foundManagedStudio('lot-managed-real-company'), 0)
    const original = state.studio.activeProductions[0]!
    const frozenWriterName = 'Frozen Greenlight Writer'
    state = {
      ...state,
      // Assigned role comes from the production slot, not this career-home role.
      talent: state.talent.map((person) =>
        person.id === original.writerId
          ? { ...person, name: 'Current Writer Name', role: 'actor' }
          : person,
      ),
      studio: {
        ...state.studio,
        activeProductions: state.studio.activeProductions.map((production) =>
          production.id === original.id && production.participants !== undefined
            ? {
                ...production,
                participants: {
                  ...production.participants,
                  writer: { ...production.participants.writer, name: frozenWriterName },
                },
              }
            : production,
        ),
      },
    }
    const production = state.studio.activeProductions[0]!
    const before = JSON.stringify(state)
    const snap = studioLotSnapshot(state)
    const company = operation(snap, production.id).companyMembers
    const expectedSlots = [
      ['writer', production.writerId, 'talent'],
      ['director', production.directorId, 'director'],
      ['lead', production.cast.lead, 'talent'],
      ['antagonist', production.cast.antagonist, 'talent'],
      ['support', production.cast.support, 'talent'],
      ['craft', production.craftIds[0], 'talent'],
    ] as const

    expect(company).toEqual(
      expectedSlots.map(([productionRole, talentId, presentationRole]) => ({
        productionRole,
        slotIndex: 0,
        talentId,
        name: state.talent.find((person) => person.id === talentId)!.name,
        presentationRole,
      })),
    )
    expect(company?.[0]?.name).toBe('Current Writer Name')
    expect(company?.[0]?.name).not.toBe(frozenWriterName)
    expect(company?.every((member) => Object.keys(member).sort().join(',') ===
      'name,presentationRole,productionRole,slotIndex,talentId')).toBe(true)
    expect(snap.people.filter((person) => person.authority === 'active-production')).toEqual(
      company?.map((member) => ({
        id: member.talentId,
        name: member.name,
        role: member.presentationRole,
        authority: 'active-production',
        productionId: production.id,
        productionTitle: operation(snap, production.id).title,
      })),
    )
    expect(JSON.stringify(state)).toBe(before)
  })

  it('projects two same-title companies by exact production ID and ignores all source array order', () => {
    let state = greenlightFilm(foundManagedStudio('lot-managed-two-companies', true), 0, 0)
    state = greenlightFilm(state, 1, 1)
    const sharedTitle = 'The Same Working Title'
    const conceptIds = new Set(state.studio.activeProductions.map((production) => production.conceptId))
    state = {
      ...state,
      concepts: state.concepts.map((concept) =>
        conceptIds.has(concept.id) ? { ...concept, title: sharedTitle } : concept,
      ),
    }

    const expected = studioLotSnapshot(state)
    const reordered = studioLotSnapshot({
      ...state,
      talent: [...state.talent].reverse(),
      studio: {
        ...state.studio,
        activeProductions: [...state.studio.activeProductions].reverse(),
      },
      operations: {
        ...state.operations,
        workflows: [...state.operations.workflows].reverse(),
      },
    })

    const companyView = (snap: ReturnType<typeof studioLotSnapshot>) => ({
      operations: snap.productionOperations?.map((entry) => ({
        productionId: entry.productionId,
        title: entry.title,
        companyMembers: entry.companyMembers,
      })),
      people: snap.people,
    })
    expect(companyView(reordered)).toEqual(companyView(expected))
    expect(reordered.productionOperations?.map((entry) => entry.productionId)).toEqual(
      [...state.studio.activeProductions.map((production) => production.id)].sort(),
    )
    expect(reordered.productionOperations?.every((entry) => entry.title === sharedTitle)).toBe(true)
    expect(reordered.productionOperations?.every((entry) => entry.companyMembers?.length === 6)).toBe(true)
    expect(new Set(reordered.people.map((person) => person.id)).size).toBe(
      reordered.people.length,
    )
    expect(
      reordered.people.filter((person) => person.authority === 'active-production'),
    ).toHaveLength(12)
  })

  it('omits every expanded company atomically and preserves Director/Lead fallback for hostile staffing truth', () => {
    const legalOne = greenlightFilm(foundManagedStudio('lot-managed-company-hostile-one'), 0)
    const legalTwo = greenlightFilm(
      greenlightFilm(foundManagedStudio('lot-managed-company-hostile-two', true), 0, 0),
      1,
      1,
    )
    const oneProduction = legalOne.studio.activeProductions[0]!
    const twoA = legalTwo.studio.activeProductions[0]!
    const twoB = legalTwo.studio.activeProductions[1]!

    const noCraft: GameState = {
      ...legalOne,
      studio: {
        ...legalOne.studio,
        activeProductions: [{ ...oneProduction, craftIds: [] }],
      },
    }
    const extraCraft: GameState = {
      ...legalOne,
      studio: {
        ...legalOne.studio,
        activeProductions: [
          { ...oneProduction, craftIds: [...oneProduction.craftIds, oneProduction.writerId] },
        ],
      },
    }
    const duplicateRole: GameState = {
      ...legalOne,
      studio: {
        ...legalOne.studio,
        activeProductions: [
          {
            ...oneProduction,
            cast: { ...oneProduction.cast, support: oneProduction.cast.lead },
          },
        ],
      },
    }
    const duplicateCurrentTalent: GameState = {
      ...legalOne,
      talent: [
        ...legalOne.talent,
        { ...legalOne.talent.find((person) => person.id === oneProduction.writerId)! },
      ],
    }
    const reusedAcrossPictures: GameState = {
      ...legalTwo,
      studio: {
        ...legalTwo.studio,
        activeProductions: legalTwo.studio.activeProductions.map((production) =>
          production.id === twoB.id
            ? { ...production, cast: { ...production.cast, support: twoA.writerId } }
            : production,
        ),
      },
    }
    const hostileStates = [
      noCraft,
      extraCraft,
      duplicateRole,
      duplicateCurrentTalent,
      reusedAcrossPictures,
    ]
    for (const hostile of hostileStates) {
      const before = JSON.stringify(hostile)
      const snap = studioLotSnapshot(hostile)
      expect(
        snap.productionOperations?.every((entry) => entry.companyMembers === undefined),
      ).toBe(true)
      const fallbackIds = new Set(
        hostile.studio.activeProductions.flatMap((production) => [
          production.directorId,
          production.cast.lead,
        ]),
      )
      // Production presence stays bounded by the safe Director/Lead fallback; the studio's
      // own employees remain present beside it, always as roster and never as a picture.
      const onPicture = snap.people.filter((person) => person.authority === 'active-production')
      expect(onPicture.every((person) => fallbackIds.has(person.id))).toBe(true)
      expect(onPicture.length).toBeLessThanOrEqual(fallbackIds.size)
      expect(snap.people.every((person) =>
        person.authority === 'active-production' ||
        (person.authority === 'studio-roster' &&
          person.productionId === null &&
          person.productionTitle === null),
      )).toBe(true)
      expect(JSON.stringify(hostile)).toBe(before)
    }
  })

  it('rejects a production-plus-screenplay writer collision inside the bounded company proof', () => {
    const legal = productionAndDraftingScript(
      'lot-managed-company-production-script-collision',
    )
    const legalSnapshot = studioLotSnapshot(legal)
    const productionWriter = legal.studio.activeProductions[0]!.writerId
    const draftingProject = legal.scriptDevelopment.projects.at(-1)!
    const collision: GameState = {
      ...legal,
      scriptDevelopment: {
        ...legal.scriptDevelopment,
        projects: legal.scriptDevelopment.projects.map((project) =>
          project.id === draftingProject.id
            ? { ...project, writerId: productionWriter }
            : project,
        ),
      },
    }
    const before = JSON.stringify(collision)

    expect(managedProductionCompanyProjection(
      collision,
      legalSnapshot.productionOperations ?? [],
    )).toBeNull()
    expect(JSON.stringify(collision)).toBe(before)
  })

  it('keeps hostile Director/Lead fallback uniqueness-aware and array-order independent', () => {
    const legalOne = greenlightFilm(
      foundManagedStudio('lot-managed-company-hostile-fallback-duplicate'),
      0,
    )
    const oneProduction = legalOne.studio.activeProductions[0]!
    const duplicateDirector = {
      ...legalOne.talent.find((person) => person.id === oneProduction.directorId)!,
      name: 'Hostile duplicate Director name',
    }
    const duplicateState: GameState = {
      ...legalOne,
      talent: [duplicateDirector, ...legalOne.talent],
    }
    const duplicateReversed: GameState = {
      ...duplicateState,
      talent: [...duplicateState.talent].reverse(),
    }
    const duplicatePeople = studioLotSnapshot(duplicateState).people
    expect(studioLotSnapshot(duplicateReversed).people).toEqual(duplicatePeople)
    expect(
      duplicatePeople
        .filter((person) => person.authority === 'active-production')
        .map((person) => person.id),
    ).toEqual([oneProduction.cast.lead])
    // The duplicated hostile Director identity is ambiguous: it is withheld from roster
    // presence too, never resolved to whichever entry happens to be first.
    expect(duplicatePeople.some((person) => person.id === oneProduction.directorId)).toBe(false)

    const legalTwo = greenlightFilm(
      greenlightFilm(
        foundManagedStudio('lot-managed-company-hostile-fallback-reuse', true),
        0,
        0,
      ),
      1,
      1,
    )
    const first = legalTwo.studio.activeProductions[0]!
    const second = legalTwo.studio.activeProductions[1]!
    const reusedId = first.cast.lead
    const reusedState: GameState = {
      ...legalTwo,
      studio: {
        ...legalTwo.studio,
        activeProductions: legalTwo.studio.activeProductions.map((production) =>
          production.id === second.id
            ? { ...production, directorId: reusedId }
            : production,
        ),
      },
    }
    const reusedReversed: GameState = {
      ...reusedState,
      talent: [...reusedState.talent].reverse(),
      studio: {
        ...reusedState.studio,
        activeProductions: [...reusedState.studio.activeProductions].reverse(),
      },
      operations: {
        ...reusedState.operations,
        workflows: [...reusedState.operations.workflows].reverse(),
      },
    }
    const expectedSafeIds = [first.directorId, second.cast.lead].sort()
    const reusedPeople = studioLotSnapshot(reusedState).people
    expect(studioLotSnapshot(reusedReversed).people).toEqual(reusedPeople)
    expect(
      reusedPeople
        .filter((person) => person.authority === 'active-production')
        .map((person) => person.id)
        .sort(),
    ).toEqual(expectedSafeIds)
    // A talent reused across two pictures is ambiguous: neither production presence nor
    // roster presence may claim them.
    expect(reusedPeople.some((person) => person.id === reusedId)).toBe(false)
  })

  it('does not truncate a third managed picture into an apparently complete company', () => {
    let state = greenlightFilm(
      greenlightFilm(foundManagedStudio('lot-managed-company-overflow', true), 0, 0),
      1,
      1,
    )
    const source = state.studio.activeProductions[0]!
    const overflowId = 'production-overflow'
    state = {
      ...state,
      studio: {
        ...state.studio,
        activeProductions: [
          ...state.studio.activeProductions,
          { ...source, id: overflowId, remainingTicks: 1 },
        ],
      },
      operations: {
        ...state.operations,
        workflows: [
          ...state.operations.workflows,
          {
            productionId: overflowId,
            phase: 'releaseReady',
            reservations: [],
            shootingTask: null,
            blocker: null,
          },
        ],
      },
    }

    const snap = studioLotSnapshot(state)
    expect(snap.productionOperations).toHaveLength(3)
    expect(snap.productionOperations?.every((entry) => entry.companyMembers === undefined)).toBe(true)
    expect(
      snap.people.filter((person) => person.authority === 'active-production').length,
    ).toBeLessThanOrEqual(4)
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
