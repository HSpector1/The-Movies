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
// PREMISES NOT SATISFIED:
//   - "After the S5-R07 setup gate" is not independently re-verified by this
//     file: `advanceManagedProductions`'s own control flow (read at T1,
//     operations.ts ~1650-1654) makes the `remainingTicks === 5` branch
//     unreachable for a production that has not already cleared the setup
//     hold at `remainingTicks === 6`, so any production this file observes
//     at 5 has already cleared it by construction; the T0 fixture's own
//     provenance additionally records the real setup completion for the
//     player case.

import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { tick } from '../src/core/tick.js'
import * as save from '../src/core/save.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/promises.ts does not exist. firstTakeReceipts is
// CALLED below.
import { firstTakeReceipts } from '../src/core/promises.js'

type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
type SaveModuleWithV29 = typeof save & {
  migrateToV29: (envelope: unknown) => Envelope
  validateSaveV29: (envelope: unknown) => unknown
}
const withV29 = save as SaveModuleWithV29

type FirstTake = { eventId: string; week: number; productionId: string; studioId: string; directorId: string; cast: { lead: string; antagonist: string; support: readonly string[] | string } }
function takesFor(state: GameState, productionId: string): FirstTake[] {
  return (firstTakeReceipts(state) as readonly FirstTake[]).filter((r) => r.productionId === productionId)
}
function includesSupport(support: readonly string[] | string, expected: string): boolean {
  return Array.isArray(support) ? support.includes(expected) : support === expected
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

  it('PLAYER: never at shooting entry (empty at remainingTicks 5, three weeks into Shooting on the genuine fixture); appended exactly once at the 5 -> 4 advance; idempotent on a later tick; byte-stable across save/load', () => {
    const json = load(PLAYER_FIXTURE.file)
    const migrated = withV29.migrateToV29(JSON.parse(json))
    expect(migrated.state.market.tick).toBe(PLAYER_FIXTURE.week)
    const production = migrated.state.studio.activeProductions.find((p) => p.id === PLAYER_FIXTURE.productionId)
    if (production === undefined) throw new Error('fixture premise failed: prod-0008 not found in activeProductions')
    expect(production.remainingTicks).toBe(5)

    expect(takesFor(migrated.state, PLAYER_FIXTURE.productionId)).toEqual([]) // not yet completed its first take

    const afterFirstWeek = tick(migrated.state)
    const advancedProduction = afterFirstWeek.studio.activeProductions.find((p) => p.id === PLAYER_FIXTURE.productionId)
    expect(advancedProduction?.remainingTicks).toBe(4) // the natural 5 -> 4 advance

    const takes = takesFor(afterFirstWeek, PLAYER_FIXTURE.productionId)
    expect(takes.length).toBe(1)
    const take = takes[0]!
    expect(take.week).toBe(PLAYER_FIXTURE.week + 1)
    expect(take.studioId).toBe(afterFirstWeek.hollywood!.playerStudioId)
    expect(take.directorId).toBe(PLAYER_FIXTURE.directorId)
    expect(take.cast.lead).toBe(PLAYER_FIXTURE.cast.lead)
    expect(take.cast.antagonist).toBe(PLAYER_FIXTURE.cast.antagonist)
    expect(includesSupport(take.cast.support, PLAYER_FIXTURE.cast.support)).toBe(true)

    // idempotent: a second natural tick does not duplicate the receipt.
    const afterSecondWeek = tick(afterFirstWeek)
    expect(takesFor(afterSecondWeek, PLAYER_FIXTURE.productionId).length).toBe(1)

    // byte-stable across save/load.
    const envelope = { saveVersion: 29, seed: afterFirstWeek.seed, state: afterFirstWeek, broadcastCache: afterFirstWeek.broadcastItems }
    const roundTripped = withV29.validateSaveV29(JSON.parse(JSON.stringify(envelope))) as Envelope
    expect(JSON.stringify(firstTakeReceipts(roundTripped.state))).toBe(JSON.stringify(takes))
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
