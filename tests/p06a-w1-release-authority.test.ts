// ── P06A W1 — Release Authority (charter W1; frozen design = recon r2 §6) ────
//
// The Package 06 laws under test, stated once:
//   L1  `releaseReady` (tick 1) HOLDS until an explicit exact-ID commitment —
//       in the managed arm AND the legacy arm (which invents no workflow).
//   L2  Committing advances no time, consumes no RNG, moves no cash, creates
//       no result — it persists one canonical-order row + one permanent event.
//   L3  Only committed ready pictures enter the next week's ID-sorted batch;
//       click order changes nothing the batch can see.
//   L4  Duplicate/stale/orphan/malformed commitment state fails CLOSED.
//   L5  Every pre-P06 save imports UNCOMMITTED; V16 round-trips commitments.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  nextStudioDecision,
  assertStudioOperationsInvariants,
  commitPictureToReleaseRefusal,
  exportSave,
  generateWorld,
  importSave,
  initialManagedStudioConstruction,
  initialManagedStudioOperations,
  initialManagedStudioPlacement,
  makeSave,
  makeSaveV15,
  migrateToV15,
  migrateToV18,
  mintReleaseCommitmentId,
  stableStringify,
  tick,
  validateSaveV18,
} from '../src/core/index.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/index.js'

// ── fixtures (the operations.test.ts vocabulary, minimally copied) ───────────

function assignment(state: GameState, offset = 0) {
  // Founded worlds must staff from CONTRACTED talent (D-11.12); raw worlds
  // staff from the whole population — the operations.test.ts rule, kept exact.
  const population =
    state.contracts.length > 0
      ? state.contracts.map((c) => state.talent.find((t) => t.id === c.talentId)!)
      : state.talent
  const byRole = (role: string) => population.filter((t) => t.role === role)
  const actors = byRole('actor')
  return {
    writerId: byRole('writer')[offset]!.id,
    directorId: byRole('director')[offset]!.id,
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole('craft')[offset]!.id],
  }
}

function productionPayload(state: GameState, offset = 0) {
  const concept = state.concepts[offset]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    ...assignment(state, offset),
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function managedWorld(seed: string): GameState {
  const world = generateWorld(seed)
  return {
    ...world,
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
  }
}

function greenlit(state: GameState, offset = 0): GameState {
  return applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, offset) }])
}

/** Drive one managed greenlit picture to `releaseReady` (tick 1). */
function toReleaseReady(seed: string): GameState {
  let state = greenlit(managedWorld(seed))
  state = tick(state) // greenlight week: skip (startTick >= currentTick)
  state = tick(state) // 8 → 7 Pre-production
  state = tick(state) // 7 → 6 Rehearsal
  state = tick(state) // 6 → 5 Shooting (awaits the scheduled take)
  const production = state.studio.activeProductions[0]!
  state = applyActions(state, [
    { kind: 'assignShootingDirector', productionId: production.id, directorId: production.directorId },
    { kind: 'clearSceneryLoadIn', productionId: production.id },
    { kind: 'scheduleShootingTake', productionId: production.id },
  ])
  state = tick(state) // 5 → 4 (take completes)
  state = tick(state) // 4 → 3 Post-production
  state = tick(state) // 3 → 2 Post-production
  state = tick(state) // 2 → 1 Release Ready
  expect(state.studio.activeProductions[0]!.remainingTicks).toBe(1)
  expect(state.operations.workflows[0]!.phase).toBe('releaseReady')
  return state
}

const commit = (state: GameState, productionId: string): GameState =>
  applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])

/** A SAVE-LEGAL managed world: really founded, economy-engaged, operations on. */
function foundedManagedWorld(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((t) => t.id === id)!,
  )
  const byRole = (role: string) => applicants.filter((t) => t.role === role)
  const hires = [
    ...byRole('actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole('director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole('writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole('craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [{ kind: 'activateStudioOperations' }])
}

/**
 * Drive the founded world's first greenlight to `releaseReady` (tick 1) the way
 * a player does: apply exactly the production-operation decisions the engine
 * publishes, then advance — no hand-scripted choreography.
 */
function foundedToReleaseReady(seed: string): GameState {
  let state = greenlit(foundedManagedWorld(seed))
  for (let week = 0; week < 20; week++) {
    for (let guard = 0; guard < 8; guard++) {
      const decision = nextStudioDecision(state)
      if (decision === null || decision.kind !== 'productionOperation') break
      state = applyActions(state, [decision.command])
    }
    if (state.studio.activeProductions[0]!.remainingTicks === 1) return state
    state = tick(state)
  }
  throw new Error('foundedToReleaseReady: never reached releaseReady in 20 weeks')
}

// ── L1: the hold ─────────────────────────────────────────────────────────────

describe('P06A W1 — Release Ready holds until the explicit commitment', () => {
  it('holds an uncommitted managed picture at tick 1 across many weeks while the world advances', () => {
    let state = toReleaseReady('p06a-hold-managed')
    const id = state.studio.activeProductions[0]!.id
    const weekBefore = state.market.tick
    for (let i = 0; i < 4; i++) {
      state = tick(state)
      assertStudioOperationsInvariants(state.operations, state.studio.activeProductions)
      expect(state.studio.activeProductions[0]!.remainingTicks).toBe(1)
      expect(state.operations.workflows[0]!.phase).toBe('releaseReady')
      expect(state.operations.workflows[0]!.reservations).toEqual([])
      expect(state.studio.releasedFilms).toEqual([])
      expect(state.theatricalRuns).toEqual([])
    }
    expect(state.market.tick).toBe(weekBefore + 4) // the ONE clock kept moving
    // …and the held picture still releases exactly once after the commitment.
    state = commit(state, id)
    state = tick(state)
    expect(state.studio.activeProductions).toEqual([])
    expect(state.studio.releasedFilms).toHaveLength(1)
    expect(state.studio.releasedFilms[0]!.productionId).toBe(id)
    expect(state.releaseAuthority.commitments).toEqual([]) // pruned atomically
  })

  it('holds an uncommitted LEGACY picture at tick 1 without inventing a workflow', () => {
    let state = greenlit(generateWorld('p06a-hold-legacy')) // legacy operations mode
    expect(state.operations.mode).toBe('legacy')
    for (let i = 0; i < 8; i++) state = tick(state) // skip week + 8→1
    const id = state.studio.activeProductions[0]!.id
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(1)
    for (let i = 0; i < 3; i++) {
      state = tick(state)
      expect(state.studio.activeProductions[0]!.remainingTicks).toBe(1)
      expect(state.operations.workflows).toEqual([]) // no workflow invented
      expect(state.studio.releasedFilms).toEqual([])
    }
    state = commit(state, id)
    state = tick(state)
    expect(state.studio.activeProductions).toEqual([])
    expect(state.studio.releasedFilms.map((f) => f.productionId)).toEqual([id])
  })
})

// ── L2: the commitment itself ────────────────────────────────────────────────

describe('P06A W1 — committing advances nothing', () => {
  it('changes ONLY the authority root and the event log', () => {
    const before = toReleaseReady('p06a-commit-pure')
    const id = before.studio.activeProductions[0]!.id
    const after = commit(before, id)

    expect(after.market.tick).toBe(before.market.tick)
    expect(after.rngState).toBe(before.rngState)
    expect(after.studio.cash).toBe(before.studio.cash)
    expect(after.ledger).toEqual(before.ledger)
    expect(after.studio.releasedFilms).toEqual(before.studio.releasedFilms)
    expect(after.theatricalRuns).toEqual(before.theatricalRuns)
    expect(after.operations).toEqual(before.operations)
    expect(after.studio.activeProductions).toEqual(before.studio.activeProductions)

    expect(after.releaseAuthority.commitments).toEqual([
      {
        productionId: id,
        commitmentId: mintReleaseCommitmentId(id),
        committedAtWeek: before.market.tick,
      },
    ])
    const commitRows = after.studioEvents.rows.filter((r) => r.kind === 'releaseCommitted')
    expect(commitRows).toHaveLength(1)
    expect(commitRows[0]).toMatchObject({ kind: 'releaseCommitted', productionId: id })

    // Everything else byte-identical: strip the two changed roots and compare.
    const strip = (s: GameState) => {
      const { releaseAuthority: _a, studioEvents: _e, ...rest } = s
      return rest
    }
    expect(stableStringify(strip(after))).toBe(stableStringify(strip(before)))
  })

  it('refuses a duplicate, naming the existing commitment', () => {
    const ready = toReleaseReady('p06a-commit-dup')
    const id = ready.studio.activeProductions[0]!.id
    const committed = commit(ready, id)
    expect(() => commit(committed, id)).toThrow(
      new RegExp(`already committed to release .*${mintReleaseCommitmentId(id)}`),
    )
    // The shared refusal law says the same thing without throwing.
    expect(commitPictureToReleaseRefusal(committed, id)).toMatch(/already committed/)
  })

  it('refuses an unknown production and a not-yet-ready production', () => {
    const ready = toReleaseReady('p06a-commit-illegal')
    expect(() => commit(ready, 'prod-9999')).toThrow(/no active production "prod-9999"/)
    let early = greenlit(managedWorld('p06a-commit-early'))
    early = tick(early)
    expect(early.studio.activeProductions[0]!.remainingTicks).toBe(8)
    expect(() => commit(early, early.studio.activeProductions[0]!.id)).toThrow(
      /not Release Ready — 8 authoritative week\(s\) remain/,
    )
  })
})

// ── L3: committed-only batch + click-order independence ──────────────────────

describe('P06A W1 — the batch admits committed pictures only, in ID order', () => {
  /** Two managed pictures at Release Ready in one world. */
  function twoReady(seed: string): GameState {
    let state = greenlit(greenlit(managedWorld(seed)), 1)
    state = tick(state)
    state = tick(state)
    state = tick(state)
    state = tick(state)
    const actions = state.studio.activeProductions.flatMap((production) => [
      {
        kind: 'assignShootingDirector' as const,
        productionId: production.id,
        directorId: production.directorId,
      },
      { kind: 'clearSceneryLoadIn' as const, productionId: production.id },
      { kind: 'scheduleShootingTake' as const, productionId: production.id },
    ])
    state = applyActions(state, actions)
    state = tick(state)
    state = tick(state)
    state = tick(state)
    state = tick(state)
    for (const production of state.studio.activeProductions) {
      expect(production.remainingTicks).toBe(1)
    }
    expect(state.studio.activeProductions).toHaveLength(2)
    return state
  }

  it('releases the committed picture and holds the uncommitted sibling', () => {
    let state = twoReady('p06a-partial-commit')
    const [a, b] = state.studio.activeProductions.map((p) => p.id) as [string, string]
    state = commit(state, a)
    state = tick(state)
    expect(state.studio.releasedFilms.map((f) => f.productionId)).toEqual([a])
    expect(state.studio.activeProductions.map((p) => p.id)).toEqual([b])
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(1)
    expect(state.releaseAuthority.commitments).toEqual([]) // a's row pruned; b never had one
  })

  it('click order changes nothing the batch, RNG, economy or history can see', () => {
    const base = twoReady('p06a-click-order')
    const [a, b] = base.studio.activeProductions.map((p) => p.id) as [string, string]

    const abTick = tick(commit(commit(base, a), b))
    const baTick = tick(commit(commit(base, b), a))

    // Identical release batch in ascending-id order, identical RNG/economy.
    expect(abTick.studio.releasedFilms.map((f) => f.productionId)).toEqual([a, b].sort())
    expect(stableStringify(abTick.studio.releasedFilms)).toBe(
      stableStringify(baTick.studio.releasedFilms),
    )
    expect(abTick.rngState).toBe(baTick.rngState)
    expect(abTick.studio.cash).toBe(baTick.studio.cash)
    expect(stableStringify(abTick.ledger)).toBe(stableStringify(baTick.ledger))
    expect(stableStringify(abTick.theatricalRuns)).toBe(stableStringify(baTick.theatricalRuns))

    // The WHOLE state agrees except the truthful command-order history: the two
    // `releaseCommitted` rows carry the click order (that is honesty, not law).
    const stripEvents = (s: GameState) => {
      const { studioEvents: _e, ...rest } = s
      return rest
    }
    expect(stableStringify(stripEvents(abTick))).toBe(stableStringify(stripEvents(baTick)))
    const rowsOf = (s: GameState) =>
      s.studioEvents.rows
        .filter((r) => r.kind === 'releaseCommitted')
        .map((r) => `${r.kind}:${(r as { productionId: string }).productionId}`)
        .sort()
    expect(rowsOf(abTick)).toEqual(rowsOf(baTick))
  })

  it('serializes commitments in canonical id order regardless of click order', () => {
    const base = twoReady('p06a-canonical-order')
    const [a, b] = base.studio.activeProductions.map((p) => p.id) as [string, string]
    const ba = commit(commit(base, b), a)
    expect(ba.releaseAuthority.commitments.map((r) => r.productionId)).toEqual([a, b].sort())
  })
})

// ── L4: forged state fails closed ────────────────────────────────────────────

describe('P06A W1 — malformed release authority fails closed at the tick boundary', () => {
  it('refuses an orphan commitment row', () => {
    const ready = toReleaseReady('p06a-forge-orphan')
    const forged: GameState = {
      ...ready,
      releaseAuthority: {
        commitments: [
          {
            productionId: 'prod-9999',
            commitmentId: mintReleaseCommitmentId('prod-9999'),
            committedAtWeek: ready.market.tick,
          },
        ],
      },
    }
    expect(() => tick(forged)).toThrow(/orphan — no such active production/)
  })

  it('refuses a commitment on a non-ready production', () => {
    let state = greenlit(managedWorld('p06a-forge-early'))
    state = tick(state)
    const id = state.studio.activeProductions[0]!.id
    const forged: GameState = {
      ...state,
      releaseAuthority: {
        commitments: [
          { productionId: id, commitmentId: mintReleaseCommitmentId(id), committedAtWeek: 0 },
        ],
      },
    }
    expect(() => tick(forged)).toThrow(/is at remainingTicks 8, not 1/)
  })

  it('refuses a foreign commitment identity and out-of-order rows', () => {
    const ready = toReleaseReady('p06a-forge-identity')
    const id = ready.studio.activeProductions[0]!.id
    const foreign: GameState = {
      ...ready,
      releaseAuthority: {
        commitments: [{ productionId: id, commitmentId: 'hand-rolled-7', committedAtWeek: 1 }],
      },
    }
    expect(() => tick(foreign)).toThrow(/foreign identity/)
  })
})

// ── L5: save migration and round-trip ────────────────────────────────────────

describe('P06A W1 — save law', () => {
  it('imports a pre-P06 Release Ready save as UNCOMMITTED (holds until committed)', () => {
    const ready = foundedToReleaseReady('p06a-migrate-ready')
    // Build the frozen V15 envelope this world would have carried before P06.
    const { releaseAuthority: _drop, ...v15State } = ready
    const v15 = makeSaveV15(v15State)
    expect(v15.saveVersion).toBe(15)

    const live = migrateToV18(v15)
    expect(live.saveVersion).toBe(18)
    expect(live.state.releaseAuthority).toEqual({ commitments: [] })

    // The migrated world HOLDS — the legacy auto-release does not survive import.
    const held = tick(live.state)
    expect(held.studio.activeProductions[0]!.remainingTicks).toBe(1)
    expect(held.studio.releasedFilms).toEqual([])
  })

  it('round-trips a committed V16 save byte-exactly and refuses downgrades', () => {
    const ready = foundedToReleaseReady('p06a-roundtrip')
    const committed = commit(ready, ready.studio.activeProductions[0]!.id)
    const save = makeSave(committed)
    expect(save.saveVersion).toBe(18)

    const reimported = migrateToV18(importSave(exportSave(save)))
    expect(stableStringify(reimported)).toBe(stableStringify(save))
    expect(reimported.state.releaseAuthority.commitments).toHaveLength(1)

    expect(() => migrateToV15(save)).toThrow(/cannot downgrade SaveFileV18/)
  })

  it('validateSaveV18 rejects forged authority at the save boundary', () => {
    const ready = foundedToReleaseReady('p06a-save-forge')
    const id = ready.studio.activeProductions[0]!.id
    const good = makeSave(commit(ready, id))

    const orphan = JSON.parse(exportSave(good)) as {
      state: { releaseAuthority: { commitments: { productionId: string }[] } }
    }
    orphan.state.releaseAuthority.commitments[0]!.productionId = 'prod-9999'
    expect(() => validateSaveV18(orphan)).toThrow(/foreign identity|orphan/)

    const extraKey = JSON.parse(exportSave(good)) as {
      state: { releaseAuthority: Record<string, unknown> }
    }
    extraKey.state.releaseAuthority.surprise = true
    expect(() => validateSaveV18(extraKey)).toThrow(/unknown field .surprise./)
  })
})
