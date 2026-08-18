// ── C2a-M0 · ONE NAMED UNION PRODUCER ───────────────────────────────────────
//
// CHARTER (r3.2 §3.2, "One named union producer"), quoted:
//
//   "`occupiedResourceSlots(state)` lands at M0, subsuming the enumerated
//    traversals (r3 — THE COUNT IS THE LIST, NOT A NUMBER):
//    `productionOccupiedFacilitySlots` ×2 (scriptDevelopment.ts:75-85,
//    castingSessions.ts:166-174), `scriptOccupiedFacilitySlots` ×2
//    (scriptDevelopment.ts:88-99, castingSessions.ts:176-183),
//    `studioCalendar.facilityViews`, the three invariant walks
//    (operations.ts, scriptDevelopment.ts, castingSessions.ts), and
//    `facilityEngagements` (placement.ts) — nine call sites; THE M0 GATE
//    ASSERTS EVERY ONE IS GONE."
//
// WHY A SOURCE SCAN. Four private copies of "who is holding a slot right now"
// cannot be distinguished behaviourally from one shared producer while every
// copy still agrees. The defect is that they are SEPARATE — the next owner kind
// (a Set, §3.2) has to be remembered in four places or it silently is not
// counted. So the assertion has to be about the code, exactly as the hygiene
// test's scan for the forbidden unseeded-RNG call is. Comments are stripped
// first, so prose ABOUT the retired helpers can neither satisfy nor falsify
// the scan.
//
// NOTE (C2a-M0 integration ruling): this comment deliberately does NOT spell
// the literal needle that tests/hygiene.test.ts greps for. That floor scans
// RAW file contents and excludes only itself, so naming the needle here — even
// in prose — fails it. Reworded rather than adding an exclusion, because an
// exclusion would blind that floor to a REAL offence in this file later.
//
// EXPECTED CONTRACT-FIRST STATE: red until M0's union lands.

import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { applyActions, tick } from '../../src/core/index.js'
import type { GameState } from '../../src/core/index.js'
import {
  auditionSlate,
  availableConceptId,
  availableWriterId,
  commissionPayload,
  greenlightPayload,
  managedStudio,
  repoRoot,
  strippedSource,
  withCash,
} from './_contractFixtures.js'

const UNION = 'occupiedResourceSlots'

/** The five modules §3.2 names as holders of a subsumed traversal. */
const SUBSUMED_CONSUMERS = [
  'src/core/studioCalendar.ts',
  'src/core/operations.ts',
  'src/core/scriptDevelopment.ts',
  'src/core/castingSessions.ts',
  'src/core/placement.ts',
] as const

/** The four hand-copied private helpers §3.2 lists, and where each copy lived. */
const RETIRED_DUPLICATES = [
  { file: 'src/core/scriptDevelopment.ts', symbol: 'productionOccupiedFacilitySlots' },
  { file: 'src/core/castingSessions.ts', symbol: 'productionOccupiedFacilitySlots' },
  { file: 'src/core/scriptDevelopment.ts', symbol: 'scriptOccupiedFacilitySlots' },
  { file: 'src/core/castingSessions.ts', symbol: 'scriptOccupiedFacilitySlots' },
] as const

function coreSources(): string[] {
  return readdirSync(join(repoRoot, 'src', 'core'))
    .filter((entry) => entry.endsWith('.ts'))
    .map((entry) => `src/core/${entry}`)
}

function declaresFunction(source: string, symbol: string): boolean {
  return new RegExp(`function\\s+${symbol}\\s*[(<]`).test(source)
}

/**
 * A studio where all three Development & Casting owners hold a slot in the same
 * week, so "the union names every live holder" is a claim with content.
 */
function contendedStudio(seed: string): { state: GameState; liveSlotKeys: string[] } {
  const commission = (state: GameState): GameState =>
    applyActions(state, [
      {
        kind: 'commissionScript',
        project: commissionPayload(state, availableConceptId(state), availableWriterId(state)),
      },
    ])

  let state = commission(withCash(managedStudio(seed), 50_000_000))
  const first = state.scriptDevelopment.projects[0]!.id

  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId: first }])
  state = applyActions(state, [
    { kind: 'greenlightScriptProject', production: greenlightPayload(state, first) },
  ])
  // A second screenplay starts drafting in the same week the picture is greenlit,
  // so both Development & Casting slots are genuinely spoken for.
  state = commission(state)
  const second = state.scriptDevelopment.projects[1]!.id

  state = tick(state) // the greenlight week does not advance the picture
  state = applyActions(state, [{ kind: 'acceptScript', projectId: second }])
  state = tick(state) // development → preProduction
  state = tick(state) // preProduction → rehearsal: the picture moves to a SOUNDSTAGE

  // With the picture off Development & Casting, an audition and a third
  // screenplay can hold the two slots it vacated — three owner kinds, one week.
  state = applyActions(state, [
    { kind: 'startCastingSession', session: auditionSlate(state, second, 3) },
  ])
  state = commission(state)

  const liveSlotKeys: string[] = []
  for (const workflow of state.operations.workflows) {
    for (const reservation of workflow.reservations) {
      liveSlotKeys.push(`${reservation.facilityId}:${String(reservation.slot)}`)
    }
  }
  for (const project of state.scriptDevelopment.projects) {
    if (project.reservation === null) continue
    liveSlotKeys.push(`${project.reservation.facilityId}:${String(project.reservation.slot)}`)
  }
  for (const session of state.castingSessions.sessions) {
    if (session.reservation === null) continue
    liveSlotKeys.push(`${session.reservation.facilityId}:${String(session.reservation.slot)}`)
  }
  return { state, liveSlotKeys }
}

/** Accepts a Set, a Map, or any iterable of string keys — the shape is M0's to pick. */
function keysOf(value: unknown): string[] {
  if (value instanceof Set) return [...value] as string[]
  if (value instanceof Map) return [...value.keys()] as string[]
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'object' && value !== null && Symbol.iterator in value) {
    return [...(value as Iterable<string>)]
  }
  throw new Error(`${UNION}(state) must return a keyed collection of occupied resource slots`)
}

describe('C2a-M0 · §3.2 (A) — the duplicated private helpers are gone', () => {
  it('leaves neither scriptDevelopment.ts nor castingSessions.ts declaring its own copy', () => {
    const offenders = RETIRED_DUPLICATES.filter(({ file, symbol }) =>
      declaresFunction(strippedSource(file), symbol),
    ).map(({ file, symbol }) => `${file} still declares ${symbol}`)
    expect(offenders).toEqual([])
  })

  it('leaves no copy of either helper anywhere else in the core either', () => {
    const offenders: string[] = []
    for (const file of coreSources()) {
      const source = strippedSource(file)
      for (const symbol of ['productionOccupiedFacilitySlots', 'scriptOccupiedFacilitySlots']) {
        if (declaresFunction(source, symbol)) offenders.push(`${file}: ${symbol}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('C2a-M0 · §3.2 (B) — one named union producer, consumed everywhere', () => {
  it('declares occupiedResourceSlots exactly once in the core', () => {
    const declaring = coreSources().filter((file) =>
      declaresFunction(strippedSource(file), UNION),
    )
    expect(declaring, `${UNION} must be declared exactly once`).toHaveLength(1)
    expect(
      new RegExp(`export\\s+function\\s+${UNION}\\s*\\(`).test(strippedSource(declaring[0]!)),
      `${declaring[0] ?? 'the union producer'} must export it`,
    ).toBe(true)
  })

  it('is consumed by every module that used to carry a traversal of its own', () => {
    const notConsuming = SUBSUMED_CONSUMERS.filter(
      (file) => !strippedSource(file).includes(UNION),
    )
    expect(notConsuming, `these still traverse occupancy by hand: ${notConsuming.join(', ')}`).toEqual(
      [],
    )
  })
})

describe('C2a-M0 · §3.2 (C) — the union is the whole truth, not a sample', () => {
  it('names every live facility slot on a studio contending across all three owners', async () => {
    const { state, liveSlotKeys } = contendedStudio('c2a-m0-union-contended')

    // Non-vacuity first: production + screenplay + audition, same week, three
    // different owner kinds.
    expect(
      state.operations.workflows.flatMap((workflow) => workflow.reservations).length,
      'no production reservation is live',
    ).toBeGreaterThan(0)
    expect(
      state.scriptDevelopment.projects.filter((project) => project.reservation !== null).length,
      'no screenplay reservation is live',
    ).toBeGreaterThan(0)
    expect(
      state.castingSessions.sessions.filter((session) => session.reservation !== null).length,
      'no audition reservation is live',
    ).toBeGreaterThan(0)
    expect(liveSlotKeys.length).toBeGreaterThanOrEqual(3)
    expect(new Set(liveSlotKeys).size, 'a legal state never double-books a slot').toBe(
      liveSlotKeys.length,
    )

    const core = (await import('../../src/core/index.js')) as Record<string, unknown>
    const union = core[UNION]
    if (typeof union !== 'function') {
      throw new Error(
        `C2a-M0 (§3.2) contract not met: ${UNION}(state) is not exported from src/core — ` +
          'the enumerated traversals have not been subsumed yet.',
      )
    }
    const produced = keysOf((union as (state: GameState) => unknown)(state))
    for (const key of liveSlotKeys) {
      expect(produced, `${UNION} omitted the live facility slot ${key}`).toContain(key)
    }
  })
})
