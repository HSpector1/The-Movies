// P14B.6 D2 — the WITHHELD LINE must not assert an employment fact it cannot know.
//
// Independent RED (record 704-T) + CONTROL, authored against the accepted B.6 predecessor
// (`tests/bridge-p14b6-relationship-read-models.test.ts`, 24/24 green at HEAD 14d2c796). This
// file writes tests only; it does not touch `bridge/relationships.ts` or any production source.
// Requirement: docs/engineering/playability-launch-review/evidence/p14b4-20260919/
// 704-T-d2-red-brief.md (the RED, item DEMONSTRATED 2 of review 702-C). The production change
// this pins is briefed separately at .../705-W-d2-fix-brief.md — not landed by this file.
//
// THE DEFECT. `bridge/relationships.ts` :49 publishes
//     const WITHHELD_LINE = 'Other working ties here are with people you do not employ.'
// whenever a subject holds an edge whose counterpart is absent from `rosterAt(...)` (:77-84),
// which derives the roster from `state.hollywood?.employment ?? []`. `state.hollywood` is
// genuinely nullable (`src/core/types.ts` :1906, `GameStateV19`). On a world with NO `hollywood`
// root at all, `disclosed` is empty, EVERY counterpart falls to withheld, and that sentence
// becomes the block's whole line — a POSITIVE claim about who the player employs, computed from
// a state where employment cannot be read at all, on a world where the player may in fact employ
// that very counterpart through `state.contracts` (the legacy pre-Hollywood root).
//
// CASE A (RED, must fail today). A world with `state.hollywood === null`, a V31 `relationships`
// root holding one edge, and a LIVE `state.contracts` row for the tied counterpart — so the
// claim is not merely unfounded but demonstrably wrong. `relationshipBlockFor` must not say "you
// do not employ" here; it must answer the honest degraded copy 705-W specifies:
//     'No studio roster on record, so working ties are not shown.'
//
// CASE B (CONTROL, must stay GREEN before AND after the fix). A world where `state.hollywood` IS
// present and its `employment` list is genuinely empty (nobody has ever been signed), and the
// subject holds an edge. Here "you do not employ" is TRUE and informative, and the fix must not
// swallow it — this is what stops the fix from being over-broadened to "any empty roster".
//
// HOW EACH WORLD IS BUILT (the engine's own paths, never a hand-shaped state):
//   Case A uses `richFoundedStudio` (`tests/contracts/_contractFixtures.ts`), which opens founding
//   through `beginFoundingHistoricalControl` — the SAME "historical analysis control" device the
//   accepted B.6 suite already relies on to reach a `hollywood === null` world at
//   `tests/bridge-p14b6-relationship-read-models.test.ts` :233-261 (its `w6()`). Contracts are
//   signed through the real `signContract` action, so `state.contracts` is populated the ordinary
//   way; `state.hollywood` stays null because the historical-control founder never calls
//   `initializeHollywood` (`src/core/employment.ts` :538-540).
//   Case B uses the NATIVE `beginFounding` (`src/core/employment.ts` :539), which calls
//   `initializeHollywood` in the SAME step that opens the founding draft. `initializeHollywood`
//   seeds rival businesses immediately (`src/core/hollywood.ts` :160-172), so `hollywood.employment`
//   is NOT literally `[]` on this world — but every row belongs to a RIVAL studioId, never the
//   player's, because no `signContract` action is ever run here (every action, native or not,
//   re-derives the PLAYER'S OWN rows from `state.contracts` through `recordPlayerEmployment`,
//   `src/core/actions.ts` :2985 — an unsigned world can never hold a player row). `rosterAt`
//   (:77-84 of the defect site) filters by `row.studioId !== studioId`, so this is a genuine
//   instance of "the employment list is empty FOR THE VIEWER" even though the root itself holds
//   rival rows — the brief's own wording, restated exactly.
//   Both staged edges are round-tripped through `makeSave`/`validateSaveV31` (the `admitted()`
//   device the accepted B.6 suite calls "LOUDLY STAGED" and validator-admitted, never hand-minted)
//   so each world is a shape the live save format can actually hold.
//
// See the disagreement note at the foot of this file: Case A's premise, while validator-admitted
// and type-legal, is reachable ONLY through the historical-control constructor, not through any
// sequence NATIVE campaign creation can produce.

import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'

import { beginFounding, generateWorld } from '../src/core/index.js'
import { LIVE_SAVE_VERSION, makeSave, validateSaveV32 } from '../src/core/save.js'
import type { GameState, RelationshipDriver, RelationshipTier } from '../src/core/types.js'
import { peopleProjection } from '../bridge/people.ts'
import { contractedByRole, richFoundedStudio } from './contracts/_contractFixtures.ts'

// ── local instruments (nothing here is imported by, or imports from, another test file) ─────────
// The exact edge shape `validateRelationshipsRoot` (`src/core/relationships.ts` :383-479) admits,
// restated from the accepted B.6 suite's own `Edge`/`stageEdge` device (that file :139-146,
// :270-281) so this file carries no dependency on that file's internals.
type Edge = {
  edgeId: string; a: string; b: string; closeness: number; firstSharedWeek: number; lastEventWeek: number
  sharedProductions: number; sharedSuccesses: number; sharedFailures: number; sharedCancellations: number
  peakTier: RelationshipTier; peakTierWeek: number; recent: RelationshipDriver[]
}
const withRoot = (state: GameState, rows: readonly Edge[]): GameState =>
  ({ ...state, relationships: rows } as unknown as GameState)
/** Validator-admitted: the staged root round-trips through makeSave/validateSaveV31, so this is a
 *  shape the real save format can hold — never a hand-minted state the engine cannot produce. */
function admitted(state: GameState): GameState {
  const save = makeSave(state)
  expect(save.saveVersion).toBe(LIVE_SAVE_VERSION)
  validateSaveV32(JSON.parse(JSON.stringify(save)))
  return save.state as GameState
}
/** One edge, staged between `x` and `y` at `week` — the single canonical pair, ordinal id 0. */
const stagedEdge = (x: string, y: string, week: number): Edge => {
  const [a, b] = x < y ? [x, y] : [y, x]
  return {
    edgeId: 'relationship-edge-0', a, b, closeness: 50, firstSharedWeek: week, lastEventWeek: week,
    sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0,
    peakTier: 'Acquaintances', peakTierWeek: week,
    recent: [{ kind: 'sharedProduction', week, ref: 'staged-d2-production', delta: 2 }],
  }
}
/** The published block, read off the SAME carrier a real bridge consumer reads
 *  (`BridgePersonProfileSnapshot.collaborators`, `bridge/people.ts` :530) — never a direct call
 *  with a hand-invented `viewerStudioId`, since production itself resolves that id as
 *  `state.hollywood?.playerStudioId ?? ''` (`bridge/people.ts` :489). */
const collaboratorsOf = (state: GameState, talentId: string): { line: string; rows: readonly unknown[] } => {
  const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)
  assert.ok(profile, `premise: no published profile for ${talentId}`)
  return (profile as unknown as { collaborators: { line: string; rows: readonly unknown[] } }).collaborators
}

const WITHHELD_LINE = 'Other working ties here are with people you do not employ.'
const HONEST_NO_ROOT_LINE = 'No studio roster on record, so working ties are not shown.'

describe('704-T D2 — the withheld line must not assert an employment fact it cannot know', () => {
  it('CASE A (RED): hollywood===null, a real edge, and a LIVE state.contracts row for the counterpart — must not say "you do not employ", must equal the honest degraded copy', () => {
    let state = richFoundedStudio('p14b6-d2-case-a')
    // PREMISES, read from the engine's own state (never assumed).
    expect(state.hollywood).toBeNull() // beginFoundingHistoricalControl never initializes Hollywood
    expect(state.relationships).toEqual([]) // the V31 root EXISTS (empty, but present)
    const week = state.market.tick
    const directorId = contractedByRole(state, 'director')[0]!.id
    const actorId = contractedByRole(state, 'actor')[0]!.id
    const live = state.contracts.find((c) => c.talentId === actorId)
    assert.ok(live, 'premise: the counterpart holds a state.contracts row at all')
    expect(live.startWeek <= week && week < live.endWeekExclusive).toBe(true) // LIVE at `week`, not merely signed once

    state = admitted(withRoot(state, [stagedEdge(directorId, actorId, week)]))
    expect(state.hollywood).toBeNull() // the premise survives the save round-trip
    expect(state.contracts.some((c) => c.talentId === actorId
      && c.startWeek <= week && week < c.endWeekExclusive)).toBe(true) // still live after the round-trip

    const block = collaboratorsOf(state, directorId)
    expect(block.rows).toEqual([]) // nothing is disclosable: the roster cannot be read at all
    expect(block.line).not.toContain('you do not employ')
    expect(block.line).toBe(HONEST_NO_ROOT_LINE)
  })

  it('CASE B (CONTROL, must stay GREEN before and after the fix): hollywood present, employment empty for the VIEWER (rival rows may exist), subject holds an edge — the TRUE "you do not employ" claim must survive', () => {
    let state = beginFounding(generateWorld('p14b6-d2-case-b'))
    // PREMISES.
    expect(state.hollywood).not.toBeNull() // native beginFounding initializes Hollywood immediately
    const noPlayerRows = (s: GameState): boolean =>
      s.hollywood!.employment.every((e) => e.studioId !== s.hollywood!.playerStudioId)
    expect(noPlayerRows(state)).toBe(true) // nobody has ever been signed BY THE PLAYER on this world
    expect(state.relationships).toEqual([])
    const week = state.market.tick
    const [subject, counterpart] = [...state.talent].map((t) => t.id).sort().slice(0, 2) as [string, string]

    state = admitted(withRoot(state, [stagedEdge(subject, counterpart, week)]))
    expect(state.hollywood).not.toBeNull()
    expect(noPlayerRows(state)).toBe(true) // still nothing for the player, after the round-trip

    const block = collaboratorsOf(state, subject)
    expect(block.rows).toEqual([])
    expect(block.line).toBe(WITHHELD_LINE) // TRUE here: the player really employs nobody
  })
})

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// DISAGREEMENT / SCOPE NOTE (not a test; per the brief's own instruction to say so plainly)
//
// Case A's premise is reachable only through `beginFoundingHistoricalControl` — explicitly NOT the
// path native campaign creation takes. `src/core/employment.ts` :538-540:
//     export function beginFounding(state: GameState): GameState {
//       return initializeHollywood(beginFoundingDraft(state), state.market.tick===0?'fresh':'migration')
//     }
// Native `beginFounding` calls `initializeHollywood` in the SAME transition that opens the
// founding draft, so `state.hollywood` and `state.founding` become non-null together, atomically.
// Signing a contract (`signContract`) requires `state.founding !== null`, so under native play
// there is no reachable moment where a contract can be signed while `state.hollywood` is still
// null — the two conditions this defect needs never coexist on a real campaign.
//
// This does not make the RED wrong: `state.hollywood: HollywoodState | null` really is nullable at
// the type level (`src/core/types.ts` :1906), the staged world is validator-admitted (round-trips
// through `makeSave`/`validateSaveV31` without complaint), and the SAME historical-control
// constructor is already the accepted B.6 suite's own device for reaching this exact shape. But it
// is worth recording plainly: this is a defect in what the bridge CAN emit for a legally
// representable save (and, per the brief, a `migrateToV31` artifact or other non-native path might
// reach it too — not checked here, out of this file's scope), not a defect today's native founding
// sequence will ever trigger for a live player. Reported as required; the RED is authored to the
// brief's specification regardless of this finding.
