// Record 1358-C — independent-test-engineer RED for P14B relationship rulings SLICE B, Save44
// (1347-A §4 as amended by 1347-F's Addendum: "Slice B takes projection 57 once"; the log and
// romance validator per D-1312-1/D-1312-2). Authored on a scratch tree (1327-C method) at BASE
// c614b7e9ed62dcb889118ba1eadb8a2bafa7934a with slice A applied (committed `slice-a`), branch
// wip/headless-program-20260916-ts.
//
// AUTHORITY (read in full before use):
//   docs/.../1347-A-p14b-relationship-rulings-charter.md §4 (:88-101): "`validateRelationshipsRoot
//     (raw, 44)` checks the log (ascending weeks, distinct refs, a non-empty subset of slots in
//     slot order, `competitions.length ≤ sharedCompetitions`). It also checks romance (value 0..100,
//     bonds in order, only the last one open) ... `convertV43ToV44` adds `competitions: []` and
//     `romance: null`. The 44→43 downgrade refuses by name when any log row or romance exists ...
//     Conflict evidence comes from the recorded `sharedCompetitions`, because Save42 recorded those
//     under the same dedup rule ... No Rivals label appears until two slotted rows exist after
//     Save44."
//   brief-1358-sliceB-red.md scope item 5 (verbatim): "genuine V43 input migrates with
//     `competitions: []` and `romance: null` on every edge; V42-era competitions (sharedCompetitions
//     > 0 with an empty log) count as conflict evidence but give no Rivals label; the 44->43
//     downgrade is lossless only when both fields are empty on every edge and otherwise refuses by
//     name; a forged log refuses (non-ascending weeks, duplicate production, empty or out-of-order
//     slots, more rows than sharedCompetitions); romance validation (value 0..100, bonds in order,
//     only the last open)."
//
// PARENT API DECISION UNDER TEST: src/core/save.ts: `LIVE_SAVE_VERSION = 44`, `validateSaveV44`,
// `convertV43ToV44`, `convertV44ToV43`, `migrateToV44`, with refusal messages in the Save43 style
// ("migrateToV43: cannot downgrade or discard a ...").
//
// RED MECHANISM: `src/core/save.ts` already exists (an EXISTING module — the same "RED-first tests
// import from a missing module" mechanism as every other slice B file here: a missing named export
// binds to `undefined` under vite, not a resolution error). Every "validator rejects X" leaf follows
// tests/p14d1-rival-shelving-save-v43.test.ts's own documented pitfall guard: a bare `.toThrow()`
// against a call to an UNDEFINED function is a VACUOUS pass (any TypeError satisfies it), so every
// such leaf asserts a CONTENT-SPECIFIC pattern (`.toThrow(/competit|romance|log|slot|bond/i)`) that
// "validateSaveV44 is not a function" does NOT match — it fails loudly and specifically at RED, and
// only a genuine, on-topic domain refusal will satisfy it once implemented.
//
// FIXTURE STRATEGY: genuine V42 input (`genuineV42Week130`, minted at the last Save42 writer,
// 1344-C's own fixture, reused read-only here — "reuse existing authority") is converted through the
// REAL, EXISTING `convertV42ToV43` (slice-independent, unchanged by this record) to get a genuine
// V43 envelope, then HAND-PROJECTED to a well-formed V44-shaped envelope (the
// tests/p14d1-rival-shelving-save-v43.test.ts `baseV43Envelope()` convention: JSON.parse a genuine
// envelope, inject the new field on every row) for the VALIDATOR-focused leaves below — this file
// tests the VALIDATOR in isolation on a hand-built envelope, never inventing a fabricated identity
// or world. The GENUINE, fully-authentic V43-with-shelving-and-a-real-competition input the brief's
// migration leaf needs is minted separately by `1358-P-save43-producer.ts` at
// `tests/fixtures/p14/genuine-v43-pre-romance/`. 1358-C5 (1358-F4 item 5): the recorded mint now
// precedes the recorded RED, so the three leaves that read that fixture (`genuineV43Raw()` below)
// fail at RED on the missing Save44 law, not on the missing file. Each still names the producer if
// the file is absent. No byte or hash pin is hardcoded for a capture this author cannot yet know.
//
// 1358-C5 also applies 1358-F4 items 3-4 and notes 2-5 and 11: the chain and live-route leaves, the
// in-interval ordering leaf, the strip-and-compare and shelving checks on the GENUINE output, the
// V42-era evidence read through the real reads, forged log weeks taken from the edge, the downgrade
// patterns and named typeof guards.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import * as saveModule from '../src/core/save.js'
import * as labelsModule from '../src/core/relationshipLabels.js'
import { hasConflictEvidence } from '../src/core/relationships.js'
import type { GameState } from '../src/core/types.js'
import { genuineV42Week130 } from './p14d1-rival-shelving-fixtures.js'

type RelationshipCompetition = { week: number; productionId: string; slots: string[] }
type RomanceBond = { formedWeek: number; endedWeek: number | null }
type RomanceTrack = { value: number; anchorWeek: number; bonds: RomanceBond[] }
type RawEdge = { edgeId: string; a: string; b: string; sharedCompetitions: number
  competitions: RelationshipCompetition[]; romance: RomanceTrack | null; [key: string]: unknown }
type RawEnvelope = { saveVersion: number; seed: string; state: { relationships: RawEdge[] } & Record<string, unknown>; broadcastCache: unknown[] }
type V44ModuleShape = {
  LIVE_SAVE_VERSION: number
  validateSaveV44: (s: unknown) => RawEnvelope
  convertV43ToV44: (s: unknown) => RawEnvelope
  convertV44ToV43: (s: unknown) => unknown
  migrateToV44: (s: unknown) => RawEnvelope
}
const mods = () => saveModule as unknown as V44ModuleShape
// Read through the module object, as `mods()` does, so a missing slice B export adds no type error.
const rivalsEvidence = (edge: unknown): unknown =>
  (labelsModule as unknown as { professionalRivalsEvidence: (e: unknown) => unknown }).professionalRivalsEvidence(edge)
const stripEdges = (edges: RawEdge[]) => edges.map(({ competitions: _c, romance: _r, ...rest }) => rest)
type Shelving = { rejections: unknown[]; shelved: unknown[] }
const shelvingOf = (envelope: RawEnvelope): Shelving[] =>
  (envelope.state as unknown as { hollywood: { businesses: { screenplayShelving: Shelving }[] } }).hollywood.businesses.map((b) => b.screenplayShelving)

/** The decoded GENUINE V43 capture (1358-P-save43-producer.ts). 1358-F4 item 5 puts the recorded mint
 * before the recorded RED, so at RED this returns the capture and its readers fail on the Save44 law. */
function genuineV43Raw(): string {
  const dir = new URL('./fixtures/p14/genuine-v43-pre-romance/', import.meta.url)
  const manifestPath = new URL('MANIFEST.json', dir)
  assert.ok(existsSync(manifestPath),
    'GENUINE V43 FIXTURE NOT YET MINTED: run docs/engineering/playability-launch-review/evidence/' +
    'p14b4-20260919/1358-P-save43-producer.ts under the parent\'s recorded mint, which 1358-F4 item 5 ' +
    'places before the recorded RED.')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { inputs: { name: string }[] }
  assert.ok(manifest.inputs.length > 0, 'route premise: the manifest names at least one captured week')
  return gunzipSync(readFileSync(new URL(`${manifest.inputs[0]!.name}.json.gz`, dir))).toString('utf8')
}

/** A genuine V43 envelope (real V42 fixture -> the REAL, unchanged `convertV42ToV43`), hand-
 * projected to V44 by adding the empty new fields to every edge (the exact shape
 * `convertV43ToV44` is specified to produce) — the `baseV43Envelope()` convention. */
function baseV44Envelope(): RawEnvelope {
  const v42 = genuineV42Week130()
  const v43 = (saveModule as unknown as { convertV42ToV43: (s: unknown) => RawEnvelope }).convertV42ToV43(v42)
  const parsed = JSON.parse(JSON.stringify(v43)) as RawEnvelope
  parsed.saveVersion = 44
  for (const edge of parsed.state.relationships) {
    edge.competitions = []
    edge.romance = null
  }
  return parsed
}

describe('API decisions this file exercises (existence asserted first)', () => {
  it('LIVE_SAVE_VERSION is 45; validateSaveV44 / convertV43ToV44 / convertV44ToV43 / migrateToV44 exist as functions', () => {
    expect(saveModule.LIVE_SAVE_VERSION).toBe(45)
    expect(typeof mods().validateSaveV44, 'validateSaveV44').toBe('function')
    expect(typeof mods().convertV43ToV44, 'convertV43ToV44').toBe('function')
    expect(typeof mods().convertV44ToV43, 'convertV44ToV43').toBe('function')
    expect(typeof mods().migrateToV44, 'migrateToV44').toBe('function')
  })
})

describe('save-v44: the well-formed empty state validates (control)', () => {
  it('accepts empty competitions and null romance on every edge', () => {
    expect(() => mods().validateSaveV44(baseV44Envelope())).not.toThrow()
  })
})

describe('save-v44: V43 -> V44 migration', () => {
  it('convertV43ToV44 adds competitions: [] and romance: null to every edge of a genuine V43 envelope, and validates', () => {
    const v42 = genuineV42Week130()
    const v43 = (saveModule as unknown as { convertV42ToV43: (s: unknown) => RawEnvelope }).convertV42ToV43(v42)
    assert.ok(v43.state.relationships.length > 0, 'route premise: the genuine week-130 fixture holds at least one relationship edge')
    const v44 = mods().convertV43ToV44(v43)
    expect(v44.saveVersion).toBe(44)
    const validated = mods().validateSaveV44(v44)
    for (const edge of validated.state.relationships) {
      expect(edge.competitions).toEqual([])
      expect(edge.romance).toBeNull()
    }
    // Nothing outside the two new per-edge fields moves (the Save41/Save43 lossless-add pattern).
    expect(stripEdges(validated.state.relationships)).toEqual(stripEdges(v43.state.relationships))
  })

  it('GENUINE V43 input (1358-P-save43-producer.ts mint) migrates with competitions: [] and romance: null on every edge, and preserves its non-empty screenplayShelving', () => {
    const v43 = JSON.parse(genuineV43Raw()) as RawEnvelope
    expect(v43.saveVersion).toBe(43)
    const hasCompetition = v43.state.relationships.some((e) => e.sharedCompetitions >= 1)
    const hasShelving = shelvingOf(v43).some((s) => s.rejections.length > 0 || s.shelved.length > 0)
    expect(hasCompetition, 'producer premise: at least one edge holds sharedCompetitions >= 1').toBe(true)
    expect(hasShelving, 'producer premise: at least one business holds non-empty screenplayShelving').toBe(true)
    const v44 = mods().convertV43ToV44(v43)
    const validated = mods().validateSaveV44(v44)
    for (const edge of validated.state.relationships) {
      expect(edge.competitions).toEqual([])
      expect(edge.romance).toBeNull()
    }
    // 1358-F4 (1358-D note 2): nothing outside the two new fields moves, and the shelving the title names survives.
    expect(stripEdges(validated.state.relationships)).toEqual(stripEdges(v43.state.relationships))
    expect(shelvingOf(validated)).toEqual(shelvingOf(v43))
  })
})

describe('save-v44: V42-era competitions count as conflict evidence but give no Rivals label (1347-A §4 "what old saves show")', () => {
  it('an edge with sharedCompetitions >= RELATIONSHIP_CONFLICT_COMPETITIONS and an empty competitions log reads conflict evidence but no Rivals label after migration', () => {
    // 1358-F4 (1358-D note 3): r4 only validated a hand-built V44 edge. The count now sits in the V42
    // envelope, as Save42 recorded it; the save goes V42 -> V43 -> V44 through the real converters, and
    // the migrated edge goes through the real reads.
    const v42 = genuineV42Week130() as unknown as RawEnvelope
    const staged = v42.state.relationships[0]
    assert.ok(staged, 'route premise: the genuine fixture holds at least one relationship edge')
    staged.sharedCompetitions = 3 // Save42-era recorded count; the log itself cannot be reconstructed (Q3).
    const v43 = (saveModule as unknown as { convertV42ToV43: (s: unknown) => RawEnvelope }).convertV42ToV43(v42)
    const validated = mods().validateSaveV44(mods().convertV43ToV44(v43))
    const migratedEdge = validated.state.relationships.find((e) => e.edgeId === staged.edgeId)!
    expect(migratedEdge.competitions).toEqual([]) // no Rivals evidence: the log is empty
    expect(migratedEdge.sharedCompetitions).toBe(3)
    expect(hasConflictEvidence(migratedEdge)).toBe(true) // conflict evidence reads the old counter
    expect(rivalsEvidence(migratedEdge)).toBeNull() // and no Rivals label exists
  })
})

describe('save-v44: the validator rejects a forged competitions log', () => {
  // 1358-F4 (1358-D note 5): every row week comes from the edge's own span, firstSharedWeek (lo) to
  // lastEventWeek (hi), so a validator that also bounds log weeks by the edge refuses only what each
  // leaf forges.
  function withFirstEdge(mutate: (edge: RawEdge, lo: number, hi: number) => void): RawEnvelope {
    const env = baseV44Envelope()
    const edge = env.state.relationships[0]
    assert.ok(edge, 'route premise: the genuine fixture holds at least one relationship edge')
    const lo = edge.firstSharedWeek as number, hi = edge.lastEventWeek as number
    assert.ok(lo < hi, 'route premise: the first edge spans at least two weeks')
    mutate(edge, lo, hi)
    return env
  }

  it('rejects non-ascending weeks across rows', () => {
    const env = withFirstEdge((e, lo, hi) => {
      e.sharedCompetitions = 2
      e.competitions = [{ week: hi, productionId: 'prod-x', slots: ['lead'] }, { week: lo, productionId: 'prod-y', slots: ['lead'] }]
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/competit|week|ascend|order/i)
  })

  it('rejects a duplicate production id across two rows', () => {
    const env = withFirstEdge((e, lo, hi) => {
      e.sharedCompetitions = 2
      e.competitions = [{ week: lo, productionId: 'prod-x', slots: ['lead'] }, { week: hi, productionId: 'prod-x', slots: ['support'] }]
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/competit|duplicate|production/i)
  })

  it('rejects a row with an empty slots array', () => {
    const env = withFirstEdge((e, _lo, hi) => {
      e.sharedCompetitions = 1
      e.competitions = [{ week: hi, productionId: 'prod-x', slots: [] }]
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/competit|slot|empty|non-empty/i)
  })

  it('rejects a row with slots out of slot order (support before lead)', () => {
    const env = withFirstEdge((e, _lo, hi) => {
      e.sharedCompetitions = 1
      e.competitions = [{ week: hi, productionId: 'prod-x', slots: ['support', 'lead'] }]
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/competit|slot|order/i)
  })

  it('rejects more competitions rows than sharedCompetitions', () => {
    const env = withFirstEdge((e, lo, hi) => {
      e.sharedCompetitions = 1
      e.competitions = [{ week: lo, productionId: 'prod-x', slots: ['lead'] }, { week: hi, productionId: 'prod-y', slots: ['lead'] }]
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/competit|shared|exceed/i)
  })

  it('accepts a well-formed two-slot row on one production (the "one production, two slots, one row" shape)', () => {
    const env = withFirstEdge((e, _lo, hi) => {
      e.sharedCompetitions = 1
      e.competitions = [{ week: hi, productionId: 'prod-x', slots: ['lead', 'support'] }]
    })
    expect(() => mods().validateSaveV44(env)).not.toThrow()
  })
})

describe('save-v44: the validator rejects forged romance', () => {
  function withFirstEdge(mutate: (edge: RawEdge) => void): RawEnvelope {
    const env = baseV44Envelope()
    const edge = env.state.relationships[0]
    assert.ok(edge, 'route premise: the genuine fixture holds at least one relationship edge')
    mutate(edge)
    return env
  }

  it('rejects a romance value above 100', () => {
    const env = withFirstEdge((e) => { e.romance = { value: 101, anchorWeek: 10, bonds: [] } })
    expect(() => mods().validateSaveV44(env)).toThrow(/romance|value|0.*100/i)
  })

  it('rejects a negative romance value', () => {
    const env = withFirstEdge((e) => { e.romance = { value: -1, anchorWeek: 10, bonds: [] } })
    expect(() => mods().validateSaveV44(env)).toThrow(/romance|value|negative|0.*100/i)
  })

  it('rejects bonds out of order (a later formedWeek before an earlier one)', () => {
    // 1358-C7 (1358-F6 ruling 1, correcting 1358-F5 ruling 1): endedWeek 101 lies at or after the bond's formedWeek
    // (100) and at or below the save week, inside the week-130 save's recording interval. A formation check can record
    // an ending with no driver (1347-A:56-58), so endedWeek may lie after the edge's lastEventWeek; here 101 equals it.
    // The order of the two bonds stays the leaf's only defect.
    const env = withFirstEdge((e) => {
      e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 100, endedWeek: 101 }, { formedWeek: 50, endedWeek: null }] }
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/romance|bond|order/i)
  })

  it('rejects two open bonds (only the last one may be open)', () => {
    const env = withFirstEdge((e) => {
      e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 10, endedWeek: null }, { formedWeek: 50, endedWeek: null }] }
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/romance|bond|open/i)
  })

  it('accepts a closed earlier bond followed by one open later bond (the re-formation shape)', () => {
    const env = withFirstEdge((e) => {
      e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 10, endedWeek: 40 }, { formedWeek: 100, endedWeek: null }] }
    })
    expect(() => mods().validateSaveV44(env)).not.toThrow()
  })

  it('accepts every bond closed (an ended romance with no currently open bond)', () => {
    const env = withFirstEdge((e) => {
      e.romance = { value: 30, anchorWeek: 100, bonds: [{ formedWeek: 10, endedWeek: 40 }] }
    })
    expect(() => mods().validateSaveV44(env)).not.toThrow()
  })

  // 1358-C8 (1358-F8 ruling 2; 1358-J findings 2 and 3): two stored invariants that no engine route breaks.
  it('rejects an open last bond that formed after the track\'s anchorWeek (formation sets the anchor, and later writes only move it forward)', () => {
    // Value 80 and weeks 100 and 101 sit inside edge 0's span (8 to 101) and the week-130 save, so the anchor is the only defect.
    const env = withFirstEdge((e) => {
      e.romance = { value: 80, anchorWeek: 100, bonds: [{ formedWeek: 101, endedWeek: null }] }
    })
    expect(() => mods().validateSaveV44(env)).toThrow(/romance|bond|anchor/i)
  })

  /** A lawful open bond: value 90, formed and anchored at the edge's own lastEventWeek. */
  const lawfulOpenBond = (edge: RawEdge): RomanceTrack => {
    const week = edge.lastEventWeek as number
    return { value: 90, anchorWeek: week, bonds: [{ formedWeek: week, endedWeek: null }] }
  }

  it('rejects one person holding open bonds on two edges (edges 0 and 1 share person-studio-aca408ec-r01-1)', () => {
    const env = baseV44Envelope()
    const [first, second] = [env.state.relationships[0], env.state.relationships[1]]
    assert.ok(first && second, 'route premise: the genuine fixture holds edges 0 and 1')
    assert.ok([first.a, first.b].some((id) => id === second.a || id === second.b), 'route premise: edges 0 and 1 share a person')
    for (const edge of [first, second]) edge.romance = lawfulOpenBond(edge)
    expect(() => mods().validateSaveV44(env)).toThrow(/romance|bond|open/i)
  })

  it('accepts open bonds on two edges that share no person (edges 0 and 5 split studio r01\'s four people into two pairs)', () => {
    const env = baseV44Envelope()
    const [first, other] = [env.state.relationships[0], env.state.relationships[5]]
    assert.ok(first && other, 'route premise: the genuine fixture holds edges 0 and 5')
    assert.ok(![first.a, first.b].some((id) => id === other.a || id === other.b), 'route premise: edges 0 and 5 share no person')
    for (const edge of [first, other]) edge.romance = lawfulOpenBond(edge)
    expect(() => mods().validateSaveV44(env)).not.toThrow()
  })
})

describe('save-v44: down-conversion (convertV44ToV43)', () => {
  it('accepts the empty state on every edge (round-trips losslessly, Save41/Save43 pattern)', () => {
    const env = baseV44Envelope()
    expect(() => mods().convertV44ToV43(env)).not.toThrow()
  })

  // 1358-F4 (1358-D note 4): each pattern names the downgrade, so a validator refusal cannot satisfy it.
  it('refuses a real competitions log by name', () => {
    const env = baseV44Envelope()
    const edge = env.state.relationships[0]
    assert.ok(edge, 'route premise')
    edge.sharedCompetitions = 1
    edge.competitions = [{ week: edge.lastEventWeek as number, productionId: 'prod-x', slots: ['lead'] }] // the week comes from the edge (note 5)
    expect(() => mods().convertV44ToV43(env)).toThrow(/cannot downgrade.*competit/i)
  })

  it('refuses a real (non-null) romance by name', () => {
    const env = baseV44Envelope()
    const edge = env.state.relationships[0]
    assert.ok(edge, 'route premise')
    edge.romance = { value: 80, anchorWeek: 10, bonds: [{ formedWeek: 10, endedWeek: null }] }
    expect(() => mods().convertV44ToV43(env)).toThrow(/cannot downgrade.*romance/i)
  })
})

describe('save-v44: the chain and the live route (1358-F4 item 3)', () => {
  it('migrateToLive lifts the GENUINE V43 save to Save45 with competitions: [] and romance: null on every edge; makeSave stamps 45 and validateSave dispatches it', () => {
    const live = saveModule.migrateToLive(saveModule.importSave(genuineV43Raw())) as unknown as RawEnvelope
    expect(live.saveVersion).toBe(45)
    for (const edge of live.state.relationships) {
      expect(edge.competitions).toEqual([])
      expect(edge.romance).toBeNull()
    }
    const stamped = saveModule.makeSave(live.state as unknown as GameState)
    expect(stamped.saveVersion).toBe(45)
    expect(saveModule.validateSave(stamped).saveVersion).toBe(45)
  })

  it('migrateToV43(convertV43ToV44(v43)) deep-equals the GENUINE v43: the downgrade drops only the two empty fields', () => {
    const raw = genuineV43Raw()
    // A fresh parse on each side, so a converter that wrote into its input could not hide here.
    const back = saveModule.migrateToV43(mods().convertV43ToV44(JSON.parse(raw)) as unknown as { saveVersion: number })
    expect(back).toEqual(JSON.parse(raw))
  })
})
