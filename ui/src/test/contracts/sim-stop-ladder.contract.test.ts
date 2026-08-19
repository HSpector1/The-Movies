// ── C2a-M5 CONTRACT SUITE — the ONE stop ladder, and the wrap member ─────────
//
// Written from CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md §4.1 / §4.3 and
// `docs/c2-planning/08A-TIME-MODEL-DOCKET-ADDENDUM.md`, NOT from the
// implementation. If the implementation disagrees with what is pinned here, the
// implementation is wrong.
//
// Governing law exercised by this file:
//
//   • "The mandatory engineering rule (LL EX): the scheduler consumes an
//      EXTRACTED, EXPORTED `simStopFor(before, after): SimStopReason | null`
//      pulled from the inline batch loop … The ladder is never re-implemented in
//      React."                                                          (§4.1)
//   • "`limit` (the 520-week batch guard) is batch-verb-only — the living loop
//      commits one tick at a time and can never raise it."              (§4.1)
//   • "`SimStopReason` gains `wrap` — inserted immediately after
//      `productionDecision`, before `constructionCompleted`. Named required work:
//      a `wrap` arm in `simStopMessage` (today's `default:` prints the 520-week-
//      guard sentence — a G12 violation) …"                          (§4.3-M5)
//   • "Wrap is the authoritative completion of shooting — automatic, not a player
//      command."                                                       (§4.3)
//   • "The ledger is EMPTY on the legacy/headless path … the M0A acceptance
//      corpus stays byte-identical."                                (§5 pin 5/6)
//
// DETERMINISM: no Math.random, no Date.now, no timers, no React. Every world here
// is a real seeded engine world driven through public actions.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyActions,
  beginFounding,
  generateWorld,
} from '../../../../src/core/index.ts'
import type { CastSlot, CreativeRole, GameState } from '../../../../src/core/index.ts'
import {
  advanceToNextEvent,
  advanceWeek,
  newGame,
  simStopDetailFor,
  simStopFor,
} from '../../engine/adapter.ts'
import type { SimStopReason } from '../../engine/adapter.ts'
import { acceptedLotNextEventReceipt } from '../../lot/snapshot/nextEvent.ts'
import type { LotNextEventReceipt } from '../../lot/snapshot/nextEvent.ts'

const ADAPTER_SOURCE = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../engine/adapter.ts'),
  'utf8',
)

// ── a real managed studio, driven only through public actions ────────────────

function foundManagedStudio(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, n: number) => pool.filter((t) => t.role === role).slice(0, n)
  const toSign = [
    ...byRole('actor', 6),
    ...byRole('director', 2),
    ...byRole('writer', 2),
    ...byRole('craft', 2),
  ]
  for (const t of toSign) {
    s = applyActions(s, [{ kind: 'signContract', talentId: t.id, termWeeks: 156 }])
  }
  return applyActions(applyActions(s, [{ kind: 'foundStudio' }]), [
    { kind: 'activateStudioOperations' },
  ])
}

function rosterIds(s: GameState, role: CreativeRole): string[] {
  return s.contracts
    .map((c) => s.talent.find((t) => t.id === c.talentId)!)
    .filter((t) => t.role === role)
    .map((t) => t.id)
}

function greenlight(s: GameState, conceptIndex: number): GameState {
  const concept = s.concepts[conceptIndex]!
  const actors = rosterIds(s, 'actor')
  const cast = { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! } as Record<
    CastSlot,
    string
  >
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
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
        writerId: rosterIds(s, 'writer')[0]!,
        directorId: rosterIds(s, 'director')[0]!,
        cast,
        craftIds: [rosterIds(s, 'craft')[0]!],
        budget: { negative: concept.baseNegativeCost, marketing: 100_000 },
      },
    },
  ])
}

/** Issue whatever shooting commands a week is waiting on — the player's three clicks. */
function driveTakes(state: GameState): GameState {
  let next = state
  for (const workflow of state.operations.workflows) {
    if (workflow.phase !== 'shooting' || workflow.shootingTask === null) continue
    if (workflow.shootingTask.status !== 'unassigned') continue
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )!
    next = applyActions(next, [
      {
        kind: 'assignShootingDirector',
        productionId: production.id,
        directorId: production.directorId,
      },
      { kind: 'clearSceneryLoadIn', productionId: production.id },
      { kind: 'scheduleShootingTake', productionId: production.id },
    ])
  }
  return next
}

type WalkStep = {
  week: number
  reason: SimStopReason | null
  predicate: SimStopReason | null
  message: string | null
  wrapped: { productionId: string; title: string; stageName: string }[]
}

/** Walk N weeks one authoritative advance at a time, recording the ladder's answer. */
function walk(state: GameState, weeks: number): { end: GameState; steps: WalkStep[] } {
  let cur = state
  const steps: WalkStep[] = []
  for (let i = 0; i < weeks; i++) {
    cur = driveTakes(cur)
    const step = advanceWeek(cur)
    steps.push({
      week: step.next.market.tick,
      reason: step.stopReason,
      // THE POINT: the exported predicate and the value `advanceWeek` returns are
      // the same ladder consulted on the same pair of states.
      predicate: simStopFor(step.preTick, step.next),
      message: null,
      wrapped: (step.stop?.wrapped ?? []).map((w) => ({
        productionId: w.productionId,
        title: w.title,
        stageName: w.stageName,
      })),
    })
    cur = step.next
  }
  return { end: cur, steps }
}

const WRAP_SEED = 'c2a-m5-stop-ladder'
const HORIZON = 24

function walkedStudio() {
  const founded = greenlight(foundManagedStudio(WRAP_SEED), 0)
  return walk(founded, HORIZON)
}

describe('C2a-M5 §4.1 — the extracted per-tick stop predicate', () => {
  it('is exported and returns the reason for exactly the pair of states it is given', () => {
    expect(typeof simStopFor).toBe('function')
    const { steps } = walkedStudio()
    expect(steps).toHaveLength(HORIZON)
    for (const step of steps) {
      expect(step.predicate, `week ${String(step.week)}`).toBe(step.reason)
    }
  })

  it('NEVER returns `limit` — the 520-week guard belongs to the batch verb alone', () => {
    const { steps } = walkedStudio()
    for (const step of steps) expect(step.reason).not.toBe('limit')
  })

  it('is the SAME ladder the batch verb consults: the batch stops where the walk first does', () => {
    const founded = greenlight(foundManagedStudio(WRAP_SEED), 0)
    // The batch verb, run once from the founded state.
    const batch = advanceToNextEvent(founded)
    // The hand walk, from the identical state, stopping at the first non-null.
    let cur = founded
    let handWeek: number | null = null
    let handReason: SimStopReason | null = null
    for (let i = 0; i < HORIZON; i++) {
      const step = advanceWeek(cur)
      cur = step.next
      if (step.stopReason !== null) {
        handWeek = step.next.market.tick
        handReason = step.stopReason
        break
      }
    }
    expect(handReason).not.toBeNull()
    expect(batch.stopReason).toBe(handReason)
    expect(batch.toWeek).toBe(handWeek)
  })

  it('returns null on a tick that governed nothing (a plain week is not a stop)', () => {
    const { steps } = walkedStudio()
    expect(steps.some((step) => step.reason === null)).toBe(true)
  })
})

describe('C2a-M5 §4.3 — the wrap member', () => {
  it('is declared immediately after `productionDecision` and before `constructionCompleted`', () => {
    // The charter states the POSITION, to the member. Pinned against the source
    // itself because declaration order is not observable at runtime.
    const union = ADAPTER_SOURCE.slice(
      ADAPTER_SOURCE.indexOf('export type SimStopReason ='),
      ADAPTER_SOURCE.indexOf("| 'limit'"),
    )
    const members = [...union.matchAll(/\|\s*'([a-zA-Z]+)'/g)].map((m) => m[1])
    const at = members.indexOf('wrap')
    expect(at).toBeGreaterThan(0)
    expect(members[at - 1]).toBe('productionDecision')
    expect(members[at + 1]).toBe('constructionCompleted')
  })

  it('fires automatically — no player command wraps a picture', () => {
    const { steps } = walkedStudio()
    const wrapSteps = steps.filter((step) => step.reason === 'wrap')
    expect(wrapSteps.length).toBeGreaterThanOrEqual(1)
    // Every command `driveTakes` issues is a SHOOTING command; none of them is a
    // wrap, and the wrap week is a week the walk asked for nothing at all.
    const first = wrapSteps[0]!
    expect(first.wrapped).toHaveLength(1)
    expect(first.wrapped[0]!.title.length).toBeGreaterThan(0)
    expect(first.wrapped[0]!.stageName.length).toBeGreaterThan(0)
  })

  it('names the picture and the stage from the engine’s own Tier-D row', () => {
    const founded = greenlight(foundManagedStudio(WRAP_SEED), 0)
    let cur = founded
    let wrapPair: { before: GameState; after: GameState } | null = null
    for (let i = 0; i < HORIZON && wrapPair === null; i++) {
      cur = driveTakes(cur)
      const step = advanceWeek(cur)
      if (step.stopReason === 'wrap') wrapPair = { before: step.preTick, after: step.next }
      cur = step.next
    }
    expect(wrapPair).not.toBeNull()
    const detail = simStopDetailFor(wrapPair!.before, wrapPair!.after)!
    expect(detail.reason).toBe('wrap')
    const row = wrapPair!.after.studioEvents.rows.filter(
      (r) => r.kind === 'wrapped' && r.seq >= wrapPair!.before.studioEvents.nextSeq,
    )
    expect(row).toHaveLength(detail.wrapped.length)
    for (const wrapped of detail.wrapped) {
      const source = row.find(
        (r) => r.kind === 'wrapped' && r.productionId === wrapped.productionId,
      )
      expect(source).toBeDefined()
      expect(wrapped.stageFacilityId).toBe(
        source!.kind === 'wrapped' ? source!.stageFacilityId : null,
      )
      const facility = wrapPair!.after.operations.facilities.find(
        (f) => f.id === wrapped.stageFacilityId,
      )
      // §3.1: the ENGINE's name is the single spoken authority. Nothing is invented.
      expect(wrapped.stageName).toBe(facility!.name)
      // `00F` — filmmaking voice: a title, never an id.
      expect(wrapped.title).not.toBe(wrapped.productionId)
    }
  })

  it('speaks filmmaking, and NEVER the 520-week-guard sentence (the G12 defect)', () => {
    // The batch verb owns `stopMessage`, and the wrap arm is what stops a wrap
    // from falling into `default:` — which is what printed the guard sentence.
    const founded = greenlight(foundManagedStudio(WRAP_SEED), 0)
    let cur = founded
    let wrapMessage: string | null = null
    let wrapTitle = ''
    for (let i = 0; i < HORIZON && wrapMessage === null; i++) {
      cur = driveTakes(cur)
      const result = advanceToNextEvent(cur)
      if (result.stopReason === 'wrap') {
        wrapMessage = result.stopMessage
        wrapTitle = result.wrapped[0]?.title ?? ''
      }
      cur = result.next
    }
    expect(wrapMessage).not.toBeNull()
    expect(wrapMessage).toContain('principal photography wraps on')
    expect(wrapTitle.length).toBeGreaterThan(0)
    expect(wrapMessage).toContain(wrapTitle)
    expect(wrapMessage).not.toContain('safety guard')
    expect(wrapMessage).not.toContain('520')
    // No engine vocabulary reaches the player (`00F`, the tycoon floor).
    for (const banned of ['remainingTicks', 'workflow', 'reservation', 'facility-', 'prod-']) {
      expect(wrapMessage!.includes(banned), `stop message must not say "${banned}"`).toBe(false)
    }
  })
})

describe('C2a-M5 §4.3 — the LOT can mint an exact wrap receipt', () => {
  it('mints one, and it points at the stage the picture wrapped on', () => {
    const founded = greenlight(foundManagedStudio(WRAP_SEED), 0)
    let cur = founded
    let receipt: LotNextEventReceipt | null = null
    for (let i = 0; i < HORIZON && receipt === null; i++) {
      cur = driveTakes(cur)
      const before = cur
      const result = advanceToNextEvent(cur)
      if (result.stopReason === 'wrap') {
        receipt = acceptedLotNextEventReceipt(before, result)
      }
      cur = result.next
    }
    // The three named surfaces, proven together: EXACT_STOP_REASONS admitted the
    // reason, `targetFor` produced a target, and the closed receipt validator
    // accepted the pair.
    expect(receipt, 'a wrap must be able to mint an exact lot receipt').not.toBeNull()
    expect(receipt!.stopReason).toBe('wrap')
    expect(receipt!.target.kind).toBe('wrap')
    if (receipt!.target.kind !== 'wrap') return
    expect(receipt!.target.stageName.length).toBeGreaterThan(0)
    expect(receipt!.target.title.length).toBeGreaterThan(0)
    expect(receipt!.target.buildingId.length).toBeGreaterThan(0)
    // And the sentence beside it is the filmmaking one, not the guard sentence.
    expect(receipt!.stopMessage).toContain('principal photography wraps on')
  })
})

describe('C2a-M5 §5 — the legacy path is silent', () => {
  it('a legacy world never produces a wrap stop (the ledger is empty there)', () => {
    let cur: GameState = newGame('c2a-m5-legacy-silence')
    expect(cur.operations.mode).not.toBe('managed')
    for (let i = 0; i < 40; i++) {
      const step = advanceWeek(cur)
      expect(step.stopReason).not.toBe('wrap')
      expect(step.stop?.wrapped ?? []).toHaveLength(0)
      expect(step.next.studioEvents.rows).toHaveLength(0)
      cur = step.next
    }
  })
})
