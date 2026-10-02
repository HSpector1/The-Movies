// Record 1358-C — independent-test-engineer RED for P14B relationship rulings SLICE B, the
// PROFESSIONAL RIVALS label (HIS-014, 1340-O:85-90; 1347-A §2.4 :67-70, §5 `p14b10-labels`).
// Authored on a scratch tree (1327-C method) at BASE c614b7e9ed62dcb889118ba1eadb8a2bafa7934a with
// slice A applied (committed `slice-a`), branch wip/headless-program-20260916-ts.
//
// SCOPE: brief-1358-sliceB-red.md is explicit that "Mentor bullets are slice A's; add only what
// slice B's projection needs" — this file therefore covers ONLY the Rivals bullets and the
// byte-equal read-is-inert leaf for `professionalRivalsEvidence`. It does not re-test Mentor
// (tests/p14b10-mentor-label.test.ts already covers it in full).
//
// AUTHORITY (read in full before use):
//   docs/.../1340-O-owner-rulings-20260929.md HIS-014 (:85-90): "Professional Rivals: at least two
//     distinct recorded competitions between the pair for the same casting slot."
//   docs/.../1347-A-p14b-relationship-rulings-charter.md §2.4 (:66, :67-70): "Professional Rivals.
//     At least two `competitions` rows share a slot ... Rivals means two competitions for the same
//     slot kind, and it is only a label. Conflict means three competitions in any slots, and it
//     gates the tier. A pair that contests both lead and support on one production records one
//     competition with two slots."
//
// PARENT API DECISION UNDER TEST (brief PARENT API DECISIONS):
//   src/core/relationships.ts: `RIVALS_SAME_SLOT_COMPETITIONS = 2` (HIS-014's "at least two",
//     1347-A §3 :78 "Owner definitions, not tuning: ... Rivals' 2 same-slot competitions").
//   src/core/relationshipLabels.ts: `professionalRivalsEvidence(edge: Pick<RelationshipEdge,
//     'competitions'>): { slot: CastSlot; rows: RelationshipCompetition[] } | null` — "the first
//     slot in slot order with two rows; rows are the first two for that slot."
//
// RED MECHANISM: both `src/core/relationships.ts` and `src/core/relationshipLabels.ts` already
// exist (slice A landed `relationshipLabels.ts` with `mentorEvidence`/`MENTOR_FIRST_PICTURES`), so
// a missing named export binds to `undefined` under vite (the "RED-first tests import from a
// missing module" memory) rather than a resolution error — every leaf below is a value/behavioral
// assertion (typeof/exact-value), never existence alone, following tests/p14b10-conflict-evidence
// .test.ts's established pattern for an EXISTING module gaining a new export (no dynamic import
// needed here, unlike slice A's Mentor file, which needed one because the WHOLE module was new).
//
// FIXTURE STRATEGY: `professionalRivalsEvidence`'s own declared parameter type is
// `Pick<RelationshipEdge, 'competitions'>` — a PURE function over the log alone, no engine route
// needed. Every leaf below constructs a minimal `{ competitions: [...] }` object directly (the I3
// staged-object convention), in SLOT ORDER ['lead','antagonist','support'] per 1347-A's own
// enumeration and this repo's `recordCastingCompetition` iteration order
// (src/core/relationships.ts :393). `RelationshipCompetition` is locally redeclared (matching the
// brief's exact shape) rather than type-imported from `types.ts`, where it does not exist yet — the
// same convention tests/p14b10-competitions-log.test.ts and tests/p14b5-relationships.test.ts use.

import { describe, expect, it } from 'vitest'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { CastSlot } from '../src/core/types.js'
import { RIVALS_SAME_SLOT_COMPETITIONS, hasConflictEvidence } from '../src/core/relationships.js'
import { professionalRivalsEvidence } from '../src/core/relationshipLabels.js'

type RelationshipCompetition = { week: number; productionId: string; slots: CastSlot[] }
type RivalsEvidence = { slot: CastSlot; rows: RelationshipCompetition[] }
type RivalsFn = (edge: { competitions: readonly RelationshipCompetition[] }) => RivalsEvidence | null
// Guard against a merely-missing named export binding to `undefined` under vite: called only
// through this wrapper so every leaf's own failure names the reason precisely (matches the
// p14b10-conflict-evidence.test.ts convention for an EXISTING module gaining a new export).
const rivals = professionalRivalsEvidence as unknown as RivalsFn

const row = (week: number, productionId: string, slots: CastSlot[]): RelationshipCompetition => ({ week, productionId, slots })

describe('P14B10 T1 — the new bindings exist (RED at behavior, never a vacuous undefined pass)', () => {
  it('RIVALS_SAME_SLOT_COMPETITIONS is the Owner\'s named 2, and professionalRivalsEvidence is a function', () => {
    // HIS-014 (1340-O:85-90): "at least TWO distinct recorded competitions ... for the same casting slot."
    expect(RIVALS_SAME_SLOT_COMPETITIONS).toBe(2)
    expect(typeof professionalRivalsEvidence, 'professionalRivalsEvidence').toBe('function')
  })
})

describe('Professional Rivals — the positive case (two same-slot competitions)', () => {
  it('two competitions for the SAME slot (lead) give the label, naming that slot and both rows', () => {
    const edge = { competitions: [row(10, 'prod-a', ['lead']), row(20, 'prod-b', ['lead'])] }
    expect(rivals(edge)).toEqual({ slot: 'lead', rows: [row(10, 'prod-a', ['lead']), row(20, 'prod-b', ['lead'])] })
  })

  it('two competitions for the same slot (support) give the label naming support, not lead — no slot-name hardcoding', () => {
    const edge = { competitions: [row(5, 'prod-x', ['support']), row(9, 'prod-y', ['support'])] }
    expect(rivals(edge)).toEqual({ slot: 'support', rows: [row(5, 'prod-x', ['support']), row(9, 'prod-y', ['support'])] })
  })

  it('a THIRD competition for the same slot still names only the FIRST TWO rows for that slot ("rows are the first two for that slot")', () => {
    const edge = { competitions: [row(1, 'prod-1', ['lead']), row(2, 'prod-2', ['lead']), row(3, 'prod-3', ['lead'])] }
    expect(rivals(edge)).toEqual({ slot: 'lead', rows: [row(1, 'prod-1', ['lead']), row(2, 'prod-2', ['lead'])] })
  })

  it('a row holding TWO slots counts toward EACH of its slots: [lead,support] + [lead] gives Rivals for lead, naming both rows', () => {
    // 1347-A §2.4 :70: "A pair that contests both lead and support on one production records one
    // competition with two slots" — that ONE row is evidence for BOTH slots it names, so it must
    // combine with a LATER single-slot row on either shared slot to complete the pair.
    const edge = { competitions: [row(1, 'prod-1', ['lead', 'support']), row(2, 'prod-2', ['lead'])] }
    expect(rivals(edge)).toEqual({ slot: 'lead', rows: [row(1, 'prod-1', ['lead', 'support']), row(2, 'prod-2', ['lead'])] })
  })
})

describe('Professional Rivals — the negative cases', () => {
  it('lead then support (two DIFFERENT slots, one competition each) gives no label', () => {
    const edge = { competitions: [row(1, 'prod-1', ['lead']), row(2, 'prod-2', ['support'])] }
    expect(rivals(edge)).toBeNull()
  })

  it('a single competition alone (any slot) gives no label, whatever RIVALS_SAME_SLOT_COMPETITIONS-many slots it names', () => {
    const edge = { competitions: [row(1, 'prod-1', ['lead', 'antagonist', 'support'])] }
    expect(rivals(edge)).toBeNull()
  })

  it('an empty competitions log gives no label', () => {
    expect(rivals({ competitions: [] })).toBeNull()
  })

  it('the FIRST slot in slot order [lead, antagonist, support] wins when more than one slot separately qualifies', () => {
    // antagonist qualifies (two rows) AND lead qualifies (two rows); slot order names lead.
    const edge = {
      competitions: [
        row(1, 'prod-1', ['antagonist']), row(2, 'prod-2', ['antagonist']),
        row(3, 'prod-3', ['lead']), row(4, 'prod-4', ['lead']),
      ],
    }
    expect(rivals(edge)).toEqual({ slot: 'lead', rows: [row(3, 'prod-3', ['lead']), row(4, 'prod-4', ['lead'])] })
  })
})

describe('Professional Rivals is a DIFFERENT axis from conflict evidence (1347-A §2.4 "how Rivals differs from conflict evidence")', () => {
  // 1358-C5 (1358-F4 titles): the two leaves below fail at RED on the missing Rivals read, so they no
  // longer carry r1's "[control: …]" tag; hasConflictEvidence itself is slice A's.
  it('two same-slot competitions give Rivals but are NOT conflict evidence (2 < RELATIONSHIP_CONFLICT_COMPETITIONS = 3)', () => {
    const competitions = [row(1, 'prod-1', ['lead']), row(2, 'prod-2', ['lead'])]
    expect(rivals({ competitions })).not.toBeNull()
    expect(hasConflictEvidence({ sharedCompetitions: competitions.length })).toBe(false)
  })

  it('three mixed-slot competitions are conflict evidence WITHOUT Rivals (no slot has two rows)', () => {
    const competitions = [row(1, 'prod-1', ['lead']), row(2, 'prod-2', ['antagonist']), row(3, 'prod-3', ['support'])]
    expect(hasConflictEvidence({ sharedCompetitions: competitions.length })).toBe(true)
    expect(rivals({ competitions })).toBeNull()
  })
})

describe('Professional Rivals — reading the label is inert (HIS-014: "labels ... create no additional ... effect by themselves")', () => {
  it('reading professionalRivalsEvidence leaves the whole state byte-equal (serialized text, not toEqual: live state can hold -0)', () => {
    // Pitfall (brief): compare SERIALIZED TEXT, not `toEqual` objects — `toEqual` can report a
    // false difference between `0` and `-0` that a live state may legitimately carry in an
    // unrelated numeric field, which JSON.stringify normalizes identically (both serialize to
    // "0"). 1358-C5 (1358-F4; 1358-D check 2 and note 6): r4 read a free-standing edge, so the
    // state comparison could not fail. The read now takes an edge held in a full generated state, so
    // any write through its argument changes the serialized state.
    const generated = p13aGeneratedStudio()
    const held = { edgeId: 'relationship-edge-0', a: 'p-a', b: 'p-b', closeness: 50, firstSharedWeek: 0, lastEventWeek: 0,
      sharedProductions: 0, sharedSuccesses: 0, sharedFailures: 0, sharedCancellations: 0, sharedCompetitions: 2,
      peakTier: 'Acquaintances', peakTierWeek: 0, recent: [], romance: null,
      competitions: [row(1, 'prod-1', ['lead']), row(2, 'prod-2', ['lead'])] }
    const state = { ...generated, relationships: [held] }
    const beforeText = JSON.stringify(state)
    const result = rivals(state.relationships[0]!)
    expect(result).not.toBeNull() // fixture premise: the read actually exercises the positive path
    expect(JSON.stringify(state)).toBe(beforeText)
  })
})
