// ── P14B.1 test 1: the first-take receipt — appended once at the 5 -> 4
// advance, for a player production and a rival production, never at shooting
// entry, byte-stable across save/load, absent on a V28 fixture ─────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, "## P14B.1 — First Kept Promise
// Core — task expansion", Tests item 1: "1 first-take receipt appended once
// at the 5 -> 4 advance for a player production and for a rival production,
// never at shooting entry, after the S5-R07 setup gate, byte-stable across
// save/load, absent on a V28 fixture." Scope — engine (1): "FirstTakeReceipt
// {eventId, week, productionId, studioId, directorId, cast: {lead,
// antagonist, support[]}} appended at the 5 -> 4 advance inside
// advanceManagedProductions for BOTH callers, once per production (idempotent
// by productionId), into the root's new firstTakes (append-only, in-state
// ordinal); never at shooting entry." §4.2 (companion): "the first take
// completes... the moment filming actually occurs... entry into `shooting`
// (remaining ticks 6 -> 5) is only capacity-gated, while the first shooting
// week's completion (5 -> 4)... runs only when the locked director is
// assigned, the scenery load-in is cleared, the take is scheduled and no
// blocker stands."
//
// RED-FIRST: `src/core/promises.ts` does not exist yet. `firstTakeReceipts`
// is imported from it and CALLED below, so this file fails at module
// resolution before any test body runs (one TS2307, nothing else).
//
// GENUINE V28 FIXTURE (tests/fixtures/p13b/PROVENANCE.md, "V28 addendum —
// the first-Shooting-week fixture (P14B.1-T0, 2026-09-18)"):
// `legacy-v28-shooting-5.json.gz` (week 16, sha256
// `4872e5659c7214b04159d01a97e57261d35b0744bef875c2f37476c5f78f2d82`) — a
// PLAYER production `prod-0008` genuinely in `shooting` at `remainingTicks
// === 5` (director `t-dir-00`, cast `{lead: t-act-07, antagonist: t-act-08,
// support: t-act-10}`), the first Shooting week NOT YET completed, minted
// AFTER the real S5-R07 setup gate cleared (provenance: "setup record
// completed the same tick... admittedWeek: 12, completedWeek: 16").
//
// RIVAL CONSTRUCTION: no committed fixture carries a rival at remainingTicks
// === 5, so it is found by DIRECT SEARCH over the natural chain — never a
// magic week. Measured once by a disposable, uncommitted vite-node probe
// (deleted after use, per this suite's own precedent in
// tests/p14a1-f1-priority-order.test.ts's header): on
// `p13aGeneratedStudio()`'s default seed, rival `studio-aca408ec-r01`'s
// production `studio-aca408ec-r01:film:0` reaches `remainingTicks === 5` at
// week 7 and cleanly advances to 4 on the very next tick with no blocker
// (probed directly: AFTER-ONE-TICK remainingTicks = 4). This file re-derives
// the SAME fact by the SAME search at runtime rather than hardcoding week 7,
// so a reader can see the search, not just its recorded answer.
//
// INTERPRETATIONS NAMED:
//   1. `firstTakeReceipts(state)` reads the whole root array (`state.
//      firstTakes`) — the smallest accessor that lets this file assert
//      "empty before, one entry after, still one entry after a second tick".
//   2. `FirstTakeReceipt.cast.support` is read as an ARRAY containing the
//      production's single `cast.support` id (the plan's own literal
//      `support[]` notation), even though the accepted `Production.cast`
//      type carries exactly one support id per production today (`Record
//      <CastSlot, string>`, never a list) — this file asserts membership
//      (`toContain`) rather than equality so it holds under EITHER a
//      `string` or a `string[]` reading, without silently passing on an
//      undefined field.
//
// PREMISES NOT SATISFIED (T1's own premise for the PLAYER case, corrected at
// T2c per the T2 ruling's "TEST-SIDE premises" note): the shooting-5
// fixture's own shooting task is `unassigned`, not `scheduled` —
// `advanceManagedProductions`'s 5 -> 4 branch (operations.ts ~1653) requires
// `scheduled`, produced only by the player's own `assignShootingDirector` +
// `scheduleShootingTake` actions, and the fixture's world was minted on the
// operations studio (`hollywood: null`), so it carries no studio identity
// for the receipt's own `studioId` field. Ticking the raw fixture forward
// would either throw (`hollywood` null downstream) or never fire the 5 -> 4
// branch at all (the task never scheduled) — neither proves the claim. The
// PLAYER case below is instead built LIVE on an INDUSTRY world
// (`p13aGeneratedStudio()`), through the same S5-R07 setup-gated recipe the
// T0 fixture's own minter used (`src/harness/p14/legacy-v28-fixtures.ts`
// block (d): sign the creative roster, fund, commission and build a
// grand-ballroom Set on `facility-soundstage-07`, greenlight, walk to
// Rehearsal, select the `ballroom-reveal-lighting-01` recipe, tick to
// `remainingTicks === 5`) — then, the part block (d) deliberately stopped
// short of, `assignShootingDirector` and `scheduleShootingTake` before the
// final tick. The shooting-5 fixture itself remains genuine V28 evidence for
// the FIRST `it` below (no `firstTakes` root before migration) and for test
// 8's migration proof (`tests/p14b1-save-v29.test.ts`, unaffected by this
// file) — only the PLAYER take claim moves off it. `hiringMarketIds` is
// walked forward per role (never assumed present at week 0), mirroring
// `signOne`/`signActor` in `tests/p14b1-promises.test.ts` and
// `tests/p14b1-trust-chooser.test.ts` (D-11.14: signing a candidate the
// hiring market does not currently offer is refused).

import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { hiringMarketIds } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import * as save from '../src/core/save.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/types.js'
// RED-by-design: src/core/promises.ts does not exist. firstTakeReceipts is
// CALLED below.
import { firstTakeReceipts } from '../src/core/promises.js'

type FirstTake = { eventId: string; week: number; productionId: string; studioId: string; directorId: string; cast: { lead: string; antagonist: string; support: readonly string[] | string } }
function takesFor(state: GameState, productionId: string): FirstTake[] {
  return (firstTakeReceipts(state) as readonly FirstTake[]).filter((r) => r.productionId === productionId)
}
function includesSupport(support: readonly string[] | string, expected: string): boolean {
  return Array.isArray(support) ? support.includes(expected) : support === expected
}

const STAGE_7 = 'facility-soundstage-07'

/** One free-agent person of `role`, found by walking the hiring market
 * forward (never assumed present at week 0 — mirrors `signOne`/`signActor`
 * in tests/p14b1-promises.test.ts and tests/p14b1-trust-chooser.test.ts). */
function signOneOfRole(state: GameState, role: 'writer' | 'director' | 'actor' | 'craft', termWeeks = 208): GameState {
  let next = state
  for (let i = 0; i < 60; i++) {
    const candidates = hiringMarketIds(next, next.market.tick)
    const person = candidates.map((id) => next.talent.find((t) => t.id === id)).find((t) => t?.role === role)
    if (person !== undefined) return applyActions(next, [{ kind: 'signContract', talentId: person.id, termWeeks }])
    next = tick(next)
  }
  throw new Error(`fixture premise failed: no free-agent ${role} found within 60 weeks`)
}

function contractedByRole(state: GameState, role: string): readonly { id: string }[] {
  return state.contracts
    .filter((c) => state.talent.find((t) => t.id === c.talentId)?.role === role)
    .map((c) => state.talent.find((t) => t.id === c.talentId)!)
}

/** A cash bootstrap before any production choice is made — the SAME
 * 30,000,000 headroom the T0 fixture's own minter used, not a fact about the
 * picture, its cast or its setup. */
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  if (delta === 0) return state
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, { week: state.market.tick, kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead', amount: delta, note: 'test fixture cash bootstrap' }],
  }
}

/**
 * Builds a PLAYER production on an industry world to `remainingTicks === 5`
 * with its shooting task SCHEDULED — the T0 minter's own recipe
 * (`src/harness/p14/legacy-v28-fixtures.ts` block (d): sign the roster,
 * fund, commission and build a grand-ballroom Set on
 * `facility-soundstage-07`, greenlight, walk to Rehearsal, select
 * `ballroom-reveal-lighting-01`, tick to `remainingTicks === 5`) plus the
 * two actions block (d) deliberately stopped short of, so the 5 -> 4 branch
 * (operations.ts ~1653) can actually fire on the very next tick.
 */
function buildScheduledPlayerProduction(): { state: GameState; productionId: string; directorId: string; cast: Record<CastSlot, string> } {
  let state = p13aGeneratedStudio()
  state = signOneOfRole(state, 'writer')
  state = signOneOfRole(state, 'director')
  state = signOneOfRole(state, 'actor')
  state = signOneOfRole(state, 'actor')
  state = signOneOfRole(state, 'actor')
  state = signOneOfRole(state, 'craft')
  state = fundTo(state, 30_000_000)
  const mounted = state.sets.find((s) => s.mountedOn === STAGE_7 && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: STAGE_7 } }])
  for (let week = 0; week < TUNING.SET_BUILD_WEEKS_BAND_HIGH; week++) state = tick(state)

  const concept = state.concepts[0]!
  const actors = contractedByRole(state, 'actor')
  const cast: Record<CastSlot, string> = { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id }
  const directorId = contractedByRole(state, 'director')[0]!.id
  const payload = {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] },
    },
    writerId: contractedByRole(state, 'writer')[0]!.id,
    directorId,
    cast,
    craftIds: [contractedByRole(state, 'craft')[0]!.id],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
  state = applyActions(state, [{ kind: 'greenlight', production: payload }])
  const productionId = state.studio.activeProductions[state.studio.activeProductions.length - 1]!.id
  state = tick(state) // greenlight tick: skip
  state = tick(state) // Development -> Pre-production
  state = tick(state) // Pre-production -> Rehearsal
  const rehearsalWorkflow = state.operations.workflows.find((w) => w.productionId === productionId)
  if (rehearsalWorkflow === undefined) throw new Error('fixture premise failed: no workflow for the greenlit production at rehearsal')
  if (rehearsalWorkflow.phase !== 'rehearsal') {
    throw new Error(`fixture premise failed: phase "${rehearsalWorkflow.phase}" at week ${String(state.market.tick)}, expected rehearsal`)
  }
  state = applyActions(state, [
    { kind: 'setProductionSetupRecipe', productionId, recipeId: 'ballroom-reveal-lighting-01', expectedPlanRevision: rehearsalWorkflow.planRevision },
  ])

  let production = state.studio.activeProductions.find((p) => p.id === productionId)!
  let guard = 0
  while (production.remainingTicks !== 5) {
    state = tick(state)
    production = state.studio.activeProductions.find((p) => p.id === productionId)!
    guard += 1
    if (guard > 40) throw new Error(`fixture premise failed: remainingTicks never reached 5 within ${String(guard)} weeks`)
  }
  const shootingWorkflow = state.operations.workflows.find((w) => w.productionId === productionId)!
  if (shootingWorkflow.phase !== 'shooting' || shootingWorkflow.shootingTask === null) {
    throw new Error('fixture premise failed: not in Shooting with a shooting task at remainingTicks 5')
  }
  if (shootingWorkflow.shootingTask.status !== 'unassigned') {
    throw new Error(`fixture premise failed: shooting task status "${shootingWorkflow.shootingTask.status}", expected unassigned before scheduling`)
  }

  // THE PART BLOCK (d) STOPPED SHORT OF: the player's own actions that make
  // the 5 -> 4 branch reachable (operations.ts ~1653: task.status ===
  // 'scheduled', blocker === null).
  state = applyActions(state, [{ kind: 'assignShootingDirector', productionId, directorId }])
  state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
  const scheduledWorkflow = state.operations.workflows.find((w) => w.productionId === productionId)!
  if (scheduledWorkflow.shootingTask?.status !== 'scheduled' || scheduledWorkflow.blocker !== null) {
    throw new Error(
      `fixture premise failed: shooting task status "${String(scheduledWorkflow.shootingTask?.status)}" / blocker ${JSON.stringify(scheduledWorkflow.blocker)}, expected scheduled with no blocker`,
    )
  }

  return { state, productionId, directorId, cast }
}

const PLAYER_FIXTURE = {
  file: './fixtures/p14/legacy-v28-shooting-5.json.gz',
  sha256: '4872e5659c7214b04159d01a97e57261d35b0744bef875c2f37476c5f78f2d82',
  week: 16,
  productionId: 'prod-0008',
  directorId: 't-dir-00',
  cast: { lead: 't-act-07', antagonist: 't-act-08', support: 't-act-10' },
}

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')

describe('P14B.1 test 1: the first-take receipt', () => {
  it('absent on the raw V28 fixture (no firstTakes root exists before migration)', () => {
    const json = load(PLAYER_FIXTURE.file)
    expect(createHash('sha256').update(json).digest('hex')).toBe(PLAYER_FIXTURE.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: Record<string, unknown> }
    expect(parsed.saveVersion).toBe(28)
    expect(parsed.state.firstTakes).toBeUndefined()
  })

  it('PLAYER: never at shooting entry (empty at remainingTicks 5, shooting task unassigned then scheduled through the real actions, still empty after scheduling); appended exactly once at the 5 -> 4 advance; idempotent on a later tick; byte-stable across save/load', () => {
    const { state: scheduled, productionId, directorId, cast } = buildScheduledPlayerProduction()
    const week = scheduled.market.tick

    // Scheduling is not completion: the take has not fired yet.
    expect(takesFor(scheduled, productionId)).toEqual([])

    const afterFirstWeek = tick(scheduled)
    const advancedProduction = afterFirstWeek.studio.activeProductions.find((p) => p.id === productionId)
    expect(advancedProduction?.remainingTicks).toBe(4) // the natural 5 -> 4 advance

    const takes = takesFor(afterFirstWeek, productionId)
    expect(takes.length).toBe(1)
    const take = takes[0]!
    expect(take.week).toBe(week + 1)
    expect(take.studioId).toBe(afterFirstWeek.hollywood!.playerStudioId)
    expect(take.directorId).toBe(directorId)
    expect(take.cast.lead).toBe(cast.lead)
    expect(take.cast.antagonist).toBe(cast.antagonist)
    expect(includesSupport(take.cast.support, cast.support)).toBe(true)

    // idempotent: a second natural tick does not duplicate the receipt.
    const afterSecondWeek = tick(afterFirstWeek)
    expect(takesFor(afterSecondWeek, productionId).length).toBe(1)

    // byte-stable across save/load.
    // AMENDED (P14B.5 live-version sweep, 2026-09-22): the envelope moved 29 ->
    // 31 and the validator with it. The claim is unchanged — this receipt
    // survives a real save/load byte-for-byte — but the state being round-
    // tripped is a LIVE state, and a live state now carries the V31
    // `relationships` root, which `validateSaveV29`'s frozen chain refuses as an
    // unknown field. Projecting DOWN is not available here: the first take
    // asserted above mints shared-work bonds (asserted on the next line), and
    // `convertV31ToV30` refuses any world that holds an edge. So the round trip
    // runs at the LIVE version, exactly as
    // tests/p14b4-cast-class-outcomes.test.ts:355 does.
    // AMENDED AGAIN (735-T, P14B.7 live-version sweep, 2026-09-23): the envelope
    // moved 31 -> 32 and the validator with it, same reasoning one step further.
    // AMENDED AGAIN (776 S9/S10, P14C.2a live-version sweep): the envelope moved
    // 33 -> 34 and the validator with it, same reasoning one step further.
    expect(afterFirstWeek.relationships.length).toBeGreaterThan(0)
    const envelope = { saveVersion: save.LIVE_SAVE_VERSION, seed: afterFirstWeek.seed, state: afterFirstWeek, broadcastCache: afterFirstWeek.broadcastItems }
    const roundTripped = save.validateSaveV35(JSON.parse(JSON.stringify(envelope)))
    // Filtered by productionId, exactly like `takes` above: an industry
    // world's `firstTakes` root also carries every rival's own first takes
    // (unlike the V28-fixture's isolated operations-only world), so the
    // whole-root comparison this file's earlier V28-fixture version used
    // would compare against rival receipts that were never part of the
    // claim.
    expect(JSON.stringify(takesFor(roundTripped.state, productionId))).toBe(JSON.stringify(takes))
  })

  it('RIVAL: the same receipt is appended once at the 5 -> 4 advance for a rival production found by direct search over the natural chain (never a magic week)', () => {
    let state = p13aGeneratedStudio()
    let found: { studioId: string; productionId: string; directorId: string; cast: { lead: string; antagonist: string; support: string } } | undefined
    for (let week = 0; week < 60 && found === undefined; week++) {
      for (const business of state.hollywood!.businesses) {
        const hit = business.productions.find((p) => p.remainingTicks === 5)
        if (hit !== undefined) {
          found = { studioId: business.studioId, productionId: hit.id, directorId: hit.directorId, cast: hit.cast as { lead: string; antagonist: string; support: string } }
          break
        }
      }
      if (found === undefined) state = tick(state)
    }
    if (found === undefined) throw new Error('search premise failed: no rival production reached remainingTicks === 5 within 60 weeks on the default seed')

    expect(takesFor(state, found.productionId)).toEqual([]) // not yet completed

    const advanced = tick(state)
    const business = advanced.hollywood!.businesses.find((b) => b.studioId === found!.studioId)!
    const production = business.productions.find((p) => p.id === found!.productionId)
    expect(production?.remainingTicks).toBe(4)

    const takes = takesFor(advanced, found.productionId)
    expect(takes.length).toBe(1)
    const take = takes[0]!
    expect(take.studioId).toBe(found.studioId)
    expect(take.directorId).toBe(found.directorId)
    expect(take.cast.lead).toBe(found.cast.lead)
    expect(take.cast.antagonist).toBe(found.cast.antagonist)
    expect(includesSupport(take.cast.support, found.cast.support)).toBe(true)

    const again = tick(advanced)
    expect(takesFor(again, found.productionId).length).toBe(1) // idempotent
  })
})
