// P14C.1 MATERIALIZED AGING — independent RED, authored against contract
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/762-c1-api-contract.md
// as amended by its §9/§10/§11 corrections (HEAD at authoring time: b4ea6cd7), and
// against expansion 758 §9 (audit 759-C) / §10 (Owner directive). 762 is BINDING over
// 758 where they differ; 758's §9/§10 are binding over its own body.
//
// OWNERSHIP: tests and fixtures only. This file does not import anything the writer
// has not already scaffolded, and it must not be edited to chase the writer's landing.
//
// RED MECHANISM (memory: "RED-first tests import from a missing module"): `src/core/
// aging.ts` already exists as a THROWING scaffold, so its exports are real functions
// today (imported normally; every call throws). `src/core/save.ts` carries NO V33
// scaffold at all — the five V33 exports contract §6 names do not exist as source-level
// exports yet, so a normal `import { validateSaveV33 } from '../src/core/save.js'`
// would fail `tsc --noEmit` outright (a hard TS2305, not a spurious runtime pass). They
// are therefore reached through a namespace import cast loosely to a plain record, so a
// missing export binds to `undefined` at RUNTIME (caught by the guard case below)
// without breaking the static typecheck the harness also requires clean. This mismatch
// between contract §3 (aging.ts fully scaffolded) and contract §6 (no V33 scaffold
// mentioned or present) is reported at the end of this file's summary, not resolved here.
//
// Every numbered `describe` below corresponds to one "Required coverage" item in the
// dispatch brief. Section 0 exercises the aging.ts primitives directly, before any
// fixture or save-format machinery is involved.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  applyActions, exportSave, generateWorld, importSave, loadSave, LIVE_SAVE_VERSION, tick, validateSaveV32,
} from '../src/core/index.js'
import type { AuthoredTalentInput, GameState, SaveFile, Talent } from '../src/core/index.js'
import { enterRival, initializeHollywood } from '../src/core/hollywood.js'
import { commitPlacement } from '../src/core/placement.js'
import { publicPreferredOpportunity, publicPreferredTerm, publicPriorityOrder } from '../src/core/talentMarket.js'
import { generateIndustryTalent } from '../src/core/worldgen.js'
import { offerForTalent, busyTalentIds } from '../src/core/employment.js'
import * as SaveModule from '../src/core/save.js'
import {
  ageAt, anchorOf, buildTalentProvenance, materializeAges, nextBirthdayWeek, provenanceRowFor, withTalentProvenance,
} from '../src/core/aging.js'
import type { TalentProvenanceRoot, TalentProvenanceRow } from '../src/core/aging.js'

// ── generic plumbing ─────────────────────────────────────────────────────────

const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

/** A state carrying the C.1 root, read/written through one cast so every call site
 * agrees on the shape without requiring `types.ts` to have moved yet (it has not:
 * `GameState` is still `GameStateV32`, per `src/core/types.ts:2287`). */
type ProvenanceState = GameState & { talentProvenance: TalentProvenanceRoot }
const withProvenance = (state: object): ProvenanceState => state as unknown as ProvenanceState

/** The V33 envelope shape, loosely typed because `SaveFileV33` does not exist as a
 * type yet either. Mirrors the `{saveVersion,seed,state,broadcastCache}` shape every
 * `convertVxToVy` in `save.ts` already returns. */
type Envelope = { saveVersion: number; seed: string; state: unknown; broadcastCache: unknown }

// `save.ts` exports none of the five V33 names yet (no scaffold there, unlike
// `aging.ts`). Reached dynamically so a missing export binds to `undefined` — the
// exact hazard the opening guard case below exists to catch — rather than failing
// the typecheck for referencing a name the module does not have.
const dynSave = SaveModule as unknown as Record<string, unknown>
const validateSaveV33 = dynSave['validateSaveV33'] as ((save: unknown) => Envelope) | undefined
const convertV32ToV33 = dynSave['convertV32ToV33'] as ((save: unknown) => Envelope) | undefined
const convertV33ToV32 = dynSave['convertV33ToV32'] as ((save: unknown) => Envelope) | undefined
const migrateToV33 = dynSave['migrateToV33'] as ((save: unknown) => Envelope) | undefined
// P14C.2a (776 S9): `tick()` now requires the V34 lifecycle root on any state whose
// `hollywood` is not null (the market's own rule) — reached normally, since this one
// is not part of C.1's own missing-export RED (save.ts already carries it).
const convertV33ToV34 = SaveModule.convertV33ToV34
const validateSaveV34 = SaveModule.validateSaveV34

const p14 = (relative: string): URL => new URL('./fixtures/' + relative, import.meta.url)

// ── the T0 corpus (761-c1-t0-corpus-minted.md) ───────────────────────────────
const CORPUS_DIR = 'p14/genuine-v32-c1-corpus/'
type CorpusName = 'bare-world' | 'bare-ticked' | 'fresh-tick0' | 'authored' | 'scientist'
const CORPUS_NAMES: readonly CorpusName[] = ['bare-world', 'bare-ticked', 'fresh-tick0', 'authored', 'scientist']
const CORPUS_PINS: Record<CorpusName, { gz: string; raw: string; week: number; bytes: number }> = {
  'bare-world': { gz: '1d3127b89c86d2fe4bf519fcbc0471ab46e377db5cf090ca5e699c3b4a61b0c2', raw: '3c6216d500d86f24e9282a9ede6d10af32670773531b2e79bad16f0794c51a51', week: 0, bytes: 258956 },
  'bare-ticked': { gz: 'a5eb7f4af5fa382a6621ec4b886168c9d964f8c673552b1f66796dc6704724b8', raw: '7a9d5679c169b4e37f5a35684215009118048dbd4b9862f8093b26a49f652ef1', week: 1, bytes: 258956 },
  'fresh-tick0': { gz: '491b6732f85890d5b09eaca7d2a1a9537962121352e2653c1e85af7b9bf288be', raw: '38b97e297598163fb15ba3bf4e139319d84998efcec4595c9c563055aacc26b0', week: 0, bytes: 383685 },
  authored: { gz: 'e70273c1d6973c6a79fb180c368c3d26f2d966d28564cff43a04ce764a5d9eab', raw: 'dedc558d15a5b7902eedc040d15e252913b49834453fc240200515a1a2bc08f4', week: 0, bytes: 391349 },
  scientist: { gz: '655ba574a96fa219b8aa538cdf42a364faf85ea19cb4bb4c6cdd4e1eaedbffc2', raw: '20c9dff60e614b6c7c447f959dfc1e9d43d6852a40328aa3ad5df6c71208d668', week: 260, bytes: 1242288 },
}

function loadCorpus(name: CorpusName): { raw: string; save: ReturnType<typeof validateSaveV32> } {
  const filename = `genuine-v32-${name}.json.gz`
  const fixturePath = p14(CORPUS_DIR + filename)
  expect(existsSync(fixturePath), `T0 corpus fixture missing: ${filename}`).toBe(true)
  const compressed = readFileSync(fixturePath)
  expect(sha256(compressed)).toBe(CORPUS_PINS[name].gz)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha256(raw)).toBe(CORPUS_PINS[name].raw)
  expect(Buffer.byteLength(raw, 'utf8')).toBe(CORPUS_PINS[name].bytes)
  const save = validateSaveV32(JSON.parse(raw))
  expect(save.state.market.tick).toBe(CORPUS_PINS[name].week)
  return { raw, save }
}

// ── the held pre-B8 fixture (not re-minted for C.1; covers the top of the age draw) ──
const HELD_PIN = { gz: '56f629994f48ea5949a5dad5da44af5bba8ee2943451a05badd3bc4d98793daa', raw: 'ccd30fdf7bd2f379bf44d150e03529b1c83f02086d79812800f4a255c766ea6d', week: 104, bytes: 1007365 }
function loadHeld(): { raw: string; save: ReturnType<typeof validateSaveV32> } {
  const fixturePath = p14('p14/genuine-v32-pre-b8/genuine-v32-owes-two-p1.json.gz')
  expect(existsSync(fixturePath), 'held fixture missing: genuine-v32-owes-two-p1.json.gz').toBe(true)
  const compressed = readFileSync(fixturePath)
  expect(sha256(compressed)).toBe(HELD_PIN.gz)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha256(raw)).toBe(HELD_PIN.raw)
  expect(Buffer.byteLength(raw, 'utf8')).toBe(HELD_PIN.bytes)
  const save = validateSaveV32(JSON.parse(raw))
  expect(save.state.market.tick).toBe(HELD_PIN.week)
  return { raw, save }
}

/** All six held V32 worlds, by display name, each producing a fresh load on demand
 * (never shared/mutated across cases). */
const SIX_WORLDS: readonly { name: string; load: () => { raw: string; save: ReturnType<typeof validateSaveV32> } }[] = [
  ...CORPUS_NAMES.map((name) => ({ name: `genuine-v32-${name}`, load: () => loadCorpus(name) })),
  { name: 'genuine-v32-owes-two-p1', load: loadHeld },
]

/** Migrate a genuine V32 save straight to a provenance-carrying state, via the ONE
 * governed conversion (never through a hand-built envelope). */
function migrateV33(save: ReturnType<typeof validateSaveV32>): { envelope: Envelope; state: ProvenanceState } {
  const envelope = convertV32ToV33!(save)
  return { envelope, state: withProvenance(envelope.state as object) }
}

/** P14C.2a (776 S9): `tick()` throws when a live-industry state carries no
 * lifecycle root — the market's own rule. Cases that TICK a migrated state (as
 * opposed to testing the frozen V33 boundary itself) lift the one further
 * governed step first, so the C.1 aging claims under test still reach a state
 * `tick()` accepts. */
function liftForTick(migrated: { envelope: Envelope; state: ProvenanceState }): { envelope: Envelope; state: ProvenanceState } {
  const live = convertV33ToV34(migrated.envelope as Parameters<typeof convertV33ToV34>[0])
  return { envelope: live, state: withProvenance(live.state as object) }
}

/** The common case: a case that ticks a migrated state and never inspects the
 * envelope's own version tag. */
function migrateForTick(save: ReturnType<typeof validateSaveV32>): ProvenanceState {
  return liftForTick(migrateV33(save)).state
}

function tickN(state: ProvenanceState, n: number): ProvenanceState {
  let next = state
  for (let i = 0; i < n; i++) next = withProvenance(tick(next))
  return next
}

// ══════════════════════════════════════════════════════════════════════════
// 0. GUARD — every C.1 export resolves to a real function, never an
//    `undefined` binding. Written first, per the dispatch brief: an
//    `expect(undefined).toBeUndefined()` mistake would pass silently.
// ══════════════════════════════════════════════════════════════════════════

describe('0. the C.1 surface resolves to real functions, not undefined bindings', () => {
  it('every aging.ts export is a function', () => {
    const surface = { anchorOf, ageAt, nextBirthdayWeek, provenanceRowFor, buildTalentProvenance, materializeAges, withTalentProvenance }
    for (const [name, value] of Object.entries(surface)) {
      expect(typeof value, `aging.ts export "${name}" is not a function`).toBe('function')
    }
  })

  it('every V33 save export resolves to a function (fails today: save.ts carries none yet)', () => {
    const surface = { validateSaveV33, convertV32ToV33, convertV33ToV32, migrateToV33 }
    for (const [name, value] of Object.entries(surface)) {
      expect(typeof value, `save.ts export "${name}" is undefined, not a function`).toBe('function')
    }
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 0.5 aging.ts primitives, exercised directly and in isolation, before any
//     fixture or save-format machinery is involved.
// ══════════════════════════════════════════════════════════════════════════

describe('0.5 aging.ts primitives in isolation', () => {
  it('anchorOf reads both row kinds through one accessor and derives identically', () => {
    const legacy: TalentProvenanceRow = { personId: 'x', kind: 'legacy_age_anchor', ageAtMigration: 29.75, migrationWeek: 0 }
    const authored: TalentProvenanceRow = { personId: 'y', kind: 'authored_exact_week', ageAtEntry: 29.75, entryWeek: 0 }
    expect(anchorOf(legacy)).toEqual({ age: 29.75, week: 0 })
    expect(anchorOf(authored)).toEqual({ age: 29.75, week: 0 })
  })

  it('provenanceRowFor builds a row whose anchor matches its inputs (actual scaffold arity: 4 args, kind included — see summary)', () => {
    const row = provenanceRowFor('p-1', 41.5, 12, 'authored_exact_week')
    expect(row.personId).toBe('p-1')
    expect(row.kind).toBe('authored_exact_week')
    expect(anchorOf(row)).toEqual({ age: 41.5, week: 12 })
  })

  it('buildTalentProvenance produces exactly one row per person, matching ids, with due fully consistent with ageAt', () => {
    const people = [{ id: 'a', age: 29.75 }, { id: 'b', age: 28.0 }, { id: 'c', age: 40.5 }]
    const root = buildTalentProvenance(people, 0, 'legacy_age_anchor')
    expect(root.rows).toHaveLength(3)
    expect(new Set(root.rows.map((r) => r.personId))).toEqual(new Set(['a', 'b', 'c']))
    for (const row of root.rows) expect(row.kind).toBe('legacy_age_anchor')
    // due is an ARRAY (759-C amendment 14 / contract §2), ascending by week.
    expect(Array.isArray(root.due)).toBe(true)
    const weeks = root.due.map((d) => d.week)
    expect(weeks).toEqual([...weeks].sort((a, b) => a - b))
    // every named person in `due` really is due at that week per the formula.
    for (const bucket of root.due) {
      for (const personId of bucket.personIds) {
        const row = root.rows.find((r) => r.personId === personId)!
        const storedAge = Math.floor(anchorOf(row).age)
        expect(nextBirthdayWeek(row, storedAge)).toBe(bucket.week)
      }
    }
  })

  it('withTalentProvenance appends exactly one row for the given person onto an existing root', () => {
    const empty: TalentProvenanceRoot = { boundaryWeek: 0, rows: [], due: [] }
    const state = withProvenance({ talentProvenance: empty } as unknown as object)
    const next = withProvenance(withTalentProvenance(state, { id: 'new-1', age: 33.2 }))
    expect(next.talentProvenance.rows).toHaveLength(1)
    expect(next.talentProvenance.rows[0]!.personId).toBe('new-1')
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 1. THE FORMULA — ageAt over a table of anchors.
// ══════════════════════════════════════════════════════════════════════════

describe('1. ageAt — the formula, over a table of anchors', () => {
  const owner: TalentProvenanceRow = { personId: 'owner', kind: 'legacy_age_anchor', ageAtMigration: 29.75, migrationWeek: 0 }
  const integer0: TalentProvenanceRow = { personId: 'int0', kind: 'legacy_age_anchor', ageAtMigration: 28.0, migrationWeek: 0 }
  const integer100: TalentProvenanceRow = { personId: 'int100', kind: 'legacy_age_anchor', ageAtMigration: 28.0, migrationWeek: 100 }
  const halfYear: TalentProvenanceRow = { personId: 'half', kind: 'legacy_age_anchor', ageAtMigration: 40.5, migrationWeek: 0 }

  it("the Owner's worked case: 29.75 at +12 weeks is 29, at +13 weeks is 30 (record 761's committed prediction)", () => {
    expect(ageAt(owner, 12)).toBe(29)
    expect(ageAt(owner, 13)).toBe(30)
  })

  it('an exact integer anchor (28.0) is due at exactly +52 weeks, at week 0 and at a non-zero anchor week', () => {
    expect(ageAt(integer0, 51)).toBe(28)
    expect(ageAt(integer0, 52)).toBe(29)
    expect(ageAt(integer100, 151)).toBe(28)
    expect(ageAt(integer100, 152)).toBe(29)
  })

  it('a half-year anchor crosses at week 26 and again exactly one year later at week 78 (either side of the year boundary)', () => {
    expect(ageAt(halfYear, 25)).toBe(40)
    expect(ageAt(halfYear, 26)).toBe(41)
    expect(ageAt(halfYear, 77)).toBe(41)
    expect(ageAt(halfYear, 78)).toBe(42)
  })

  it('the anchor week itself always returns floor(anchorAge), for every anchor in the table', () => {
    expect(ageAt(owner, 0)).toBe(29)
    expect(ageAt(integer0, 0)).toBe(28)
    expect(ageAt(integer100, 100)).toBe(28)
    expect(ageAt(halfYear, 0)).toBe(40)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 2. THE DISPROVED DIRECTION IS REFUTED, not merely replaced.
// ══════════════════════════════════════════════════════════════════════════

describe('2. frac(29.75) * 52 = 39 was the wrong answer, and is explicitly refuted', () => {
  const owner: TalentProvenanceRow = { personId: 'owner', kind: 'legacy_age_anchor', ageAtMigration: 29.75, migrationWeek: 0 }

  it('the crossing is at week 13, and explicitly NOT at week 39', () => {
    const crossing = nextBirthdayWeek(owner, 29)
    expect(crossing).toBe(13)
    expect(crossing).not.toBe(39)
    // and ageAt agrees with the refutation directly:
    expect(ageAt(owner, 39)).toBe(30) // already 30 well before the disproved week
    expect(ageAt(owner, 13)).toBe(30)
    expect(ageAt(owner, 12)).toBe(29)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 3. nextBirthdayWeek AGREES WITH ageAt BY CONSTRUCTION — swept finely enough
//    to hit float-representation edges, catching a naive ceil with no
//    correction step.
// ══════════════════════════════════════════════════════════════════════════

describe('3. nextBirthdayWeek agrees with ageAt by construction', () => {
  // DETERMINISTICALLY VERIFIED (not hopeful): for a0 = n + k/52, the mathematically
  // exact crossing is n+1 at week (52-k), but `Math.ceil(((n+1)-a0)*52)` overshoots to
  // (52-k)+1 for many (n,k) pairs because a0's IEEE-754 representation is not exactly
  // n+k/52. A file-local search (paper/scratch derivation, not shipped) found 1344 such
  // pairs for n in [15,70], k in [1,51]; (n=15, k=2) is used below as the named
  // instance. The self-consistency loop below is swept over the FULL set, so a naive
  // uncorrected implementation fails somewhere in this sweep even if it happens to
  // agree with the corrected result for any single hand-picked anchor.
  it('a named float-representation edge: a0 = 15 + 2/52 seeds ceil to 51, but the true crossing is 50', () => {
    const a0 = 15 + 2 / 52
    const row: TalentProvenanceRow = { personId: 'edge', kind: 'legacy_age_anchor', ageAtMigration: a0, migrationWeek: 0 }
    const naiveSeed = 0 + Math.ceil((15 + 1 - a0) * 52)
    expect(naiveSeed).toBe(51) // the uncorrected seed really does overshoot
    const w = nextBirthdayWeek(row, 15)
    expect(w).toBe(50)
    expect(w).not.toBe(51)
    expect(ageAt(row, w - 1)).toBe(15)
    expect(ageAt(row, w)).toBe(16)
  })

  it('successive birthdays from the same anchor are recomputed and land exactly 52 apart (never drift, never chain a stale +52)', () => {
    const a0 = 15 + 2 / 52
    const row: TalentProvenanceRow = { personId: 'edge', kind: 'legacy_age_anchor', ageAtMigration: a0, migrationWeek: 0 }
    const weeks = [15, 16, 17, 18, 19].map((n) => nextBirthdayWeek(row, n))
    expect(weeks).toEqual([50, 102, 154, 206, 258])
    for (let i = 1; i < weeks.length; i++) expect(weeks[i]! - weeks[i - 1]!).toBe(52)
  })

  it('fine sweep over the deterministically-verified float-representation edges (n in [15,70], k in [1,51]): self-consistency holds on every one', () => {
    let checked = 0
    for (let n = 15; n <= 70; n++) {
      for (let k = 1; k < 52; k++) {
        const a0 = n + k / 52
        const row: TalentProvenanceRow = { personId: `sweep-${n}-${k}`, kind: 'legacy_age_anchor', ageAtMigration: a0, migrationWeek: 0 }
        const w = nextBirthdayWeek(row, n)
        expect(ageAt(row, w - 1), `n=${n} k=${k} a0=${a0}`).toBe(n)
        expect(ageAt(row, w), `n=${n} k=${k} a0=${a0}`).toBe(n + 1)
        // the exact mathematical crossing (independent derivation: 52-k weeks out),
        // never mind how the implementation got there.
        expect(w, `n=${n} k=${k} a0=${a0}`).toBe(52 - k)
        checked++
      }
    }
    expect(checked).toBe(56 * 51) // every (n,k) pair in the swept range actually ran
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 4. MIGRATION, on every one of the six held V32 worlds.
// ══════════════════════════════════════════════════════════════════════════

describe('4. migration on all six held V32 worlds', () => {
  for (const world of SIX_WORLDS) {
    it(`${world.name}: exactly one legacy_age_anchor row per person, bit-exact ageAtMigration, floored talent.age, boundaryWeek === tick`, () => {
      const { save } = world.load()
      const originalPeople = save.state.talent
      const { state } = migrateV33(save)

      expect(state.talentProvenance.boundaryWeek).toBe(save.state.market.tick)
      expect(state.talentProvenance.rows).toHaveLength(originalPeople.length)

      const rowByPerson = new Map(state.talentProvenance.rows.map((r) => [r.personId, r]))
      expect(rowByPerson.size).toBe(originalPeople.length) // no duplicate personId

      for (const person of originalPeople) {
        const row = rowByPerson.get(person.id)
        expect(row, `no provenance row for ${person.id}`).toBeDefined()
        expect(row!.kind).toBe('legacy_age_anchor')
        if (row!.kind === 'legacy_age_anchor') {
          expect(row!.ageAtMigration).toBe(person.age) // bit-exact, unrounded
          expect(row!.migrationWeek).toBe(save.state.market.tick)
        }
        const materializedPerson = state.talent.find((t) => t.id === person.id)!
        expect(materializedPerson.age).toBe(Math.floor(person.age))
      }

      // no row names a person who is not there (condition 1, other direction)
      for (const row of state.talentProvenance.rows) {
        expect(originalPeople.some((p) => p.id === row.personId), `row names unknown person ${row.personId}`).toBe(true)
      }
    })
  }

  it('the two null-hollywood worlds (bare-world, bare-ticked) migrate WITHOUT throwing — the boundary is market.tick, never hollywood.originWeek', () => {
    for (const name of ['bare-world', 'bare-ticked'] as const) {
      const { save } = loadCorpus(name)
      expect(save.state.hollywood).toBeNull()
      let state: ProvenanceState | undefined
      expect(() => { state = migrateV33(save).state }).not.toThrow()
      expect(state!.talentProvenance.boundaryWeek).toBe(save.state.market.tick)
    }
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 5. THE DOWNGRADE IS LOSSLESS IN BYTES, and refused one week past the
//    boundary — naming the downgrade, not an unknown field.
// ══════════════════════════════════════════════════════════════════════════

describe('5. V32 -> V33 -> V32 is byte-identical on every held world, and refused one week past the boundary', () => {
  for (const world of SIX_WORLDS) {
    it(`${world.name}: round trip reproduces the exact original bytes; ticking once past the boundary is refused as a downgrade`, () => {
      const { raw, save } = world.load()
      const { envelope: lifted, state } = migrateV33(save)

      const downgraded = convertV33ToV32!(lifted)
      expect(downgraded.saveVersion).toBe(32)
      expect(exportSave(downgraded as unknown as SaveFile)).toBe(raw) // byte-identical, not merely shape-identical

      // P14C.2a (776 S9): `tick()` now requires the V34 lifecycle root on a
      // live-industry state — lift one further step to tick legally, then strip
      // the root back off before feeding `convertV33ToV32` under test; this
      // case is about ITS OWN downgrade refusal, not the new root.
      const advancedLive = withProvenance(tick(liftForTick({ envelope: lifted, state }).state))
      const { careerLifecycle: _cl, ...advancedRest } = advancedLive as unknown as Record<string, unknown>
      const advancedState = withProvenance(advancedRest)
      const advancedEnvelope: Envelope = { ...lifted, state: advancedState }
      expect(() => convertV33ToV32!(advancedEnvelope)).toThrow()
      let message = ''
      try { convertV33ToV32!(advancedEnvelope) } catch (error) { message = (error as Error).message }
      expect(message.toLowerCase()).toMatch(/downgrade/)
      expect(message.toLowerCase()).not.toMatch(/unknown (field|key)/)
    })
  }
})

// ══════════════════════════════════════════════════════════════════════════
// 6. THE CALENDAR ADVANCE — genuine-v32-authored, authored-0001 crosses 30 at
//    week 13. Asserted at BOTH weeks, and the stronger per-762-§10 invariant
//    (talent[i].age === ageAt(row_i, market.tick)) checked on every state.
// ══════════════════════════════════════════════════════════════════════════

/** Contract 762 §10's corrected, stronger invariant: true on every emitted state. */
function assertAgeInvariant(state: ProvenanceState): void {
  for (const row of state.talentProvenance.rows) {
    const person = state.talent.find((t) => t.id === row.personId)
    expect(person, `provenance row names a person not in talent: ${row.personId}`).toBeDefined()
    expect(person!.age, `talent[${row.personId}].age disagrees with ageAt at tick ${state.market.tick}`).toBe(ageAt(row, state.market.tick))
  }
}

describe('6. the calendar advance', () => {
  it('week 12: authored-0001 is 29; week 13: authored-0001 is 30 — asserted at BOTH weeks, invariant holds throughout', () => {
    const { save } = loadCorpus('authored')
    let state = migrateForTick(save)
    assertAgeInvariant(state)

    state = tickN(state, 12)
    expect(state.market.tick).toBe(12)
    expect(state.talent.find((t) => t.id === 'authored-0001')!.age).toBe(29)
    assertAgeInvariant(state)

    state = withProvenance(tick(state))
    expect(state.market.tick).toBe(13)
    expect(state.talent.find((t) => t.id === 'authored-0001')!.age).toBe(30)
    assertAgeInvariant(state)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 7. THE 30 CROSSING IS A MARKET DECISION — three tests, three different
//    strengths of evidence, kept honestly distinct (765 §2 / its CORRECTION):
//
//    (1) externally observable across the crossing, using the REAL tick() —
//        proves the before/after difference, says nothing about in-tick order.
//    (2) a COMPONENT test: a hand-reconstructed sequence calling
//        `materializeAges` directly and building a successor state by hand.
//        It exercises the aging.ts/talentMarket.ts surface correctly but does
//        NOT run tick() and therefore cannot prove what the real settlement
//        order is — relabeled from "MEASURED"/tick evidence, which it never
//        was, per 765's own finding about itself.
//    (3) REAL evidence: the ACTUAL tick() run across the boundary, on a
//        bounded arrangement (reusing the real 'authored' corpus, never a
//        rewritten fixture) that forces the tick-tail's scheduled rival-entry
//        loop (tick.ts:1092-1096, which runs strictly AFTER the materialize
//        call at :1049 — see 765's CORRECTION to §2) to reuse a specific
//        crossing person as a free agent and price them via the real
//        `offerForTalent` call at hollywood.ts:224. The priced contract is a
//        durable artifact of the real run, not a value we assert on faith.
// ══════════════════════════════════════════════════════════════════════════

describe('7. the 30 crossing is a market decision (talentMarket.ts:690 isProven)', () => {
  it('external observation: publicPriorityOrder/publicPreferredTerm/publicPreferredOpportunity differ across the crossing, attributable to age alone', () => {
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const state12 = tickN(migrated, 12)
    const state13 = withProvenance(tick(state12))
    const id = 'authored-0001'

    expect(state12.talent.find((t) => t.id === id)!.age).toBe(29)
    expect(state13.talent.find((t) => t.id === id)!.age).toBe(30)

    // attribution: rule out that something OTHER than age moved (no work credits
    // appeared between the two states, which is the other input isProven reads).
    const person12 = state12.talent.find((t) => t.id === id)!
    const person13 = state13.talent.find((t) => t.id === id)!
    expect(person13.workHistory).toEqual(person12.workHistory)

    const order12 = publicPriorityOrder(state12, id)
    const order13 = publicPriorityOrder(state13, id)
    expect(order12).not.toEqual(order13)
    expect(order12).toEqual(['opportunity', 'compensation', 'relationships', 'term', 'trust', 'standing', 'incumbency'])
    expect(order13).toEqual(['compensation', 'term', 'trust', 'relationships', 'incumbency', 'standing', 'opportunity'])

    expect(publicPreferredTerm(state12, id)).not.toBe(publicPreferredTerm(state13, id))
    expect(publicPreferredOpportunity(state12, id)).not.toBe(publicPreferredOpportunity(state13, id))
  })

  it('COMPONENT TEST, NOT TICK EVIDENCE (765 §2 finding, applied to itself): a hand-reconstructed successor state, calling `materializeAges` directly and building `tailState` by hand rather than running tick(), shows the aging.ts/talentMarket.ts surface agrees internally — it does NOT and cannot prove what the real tick() settles with, because the real tick() is never called here', () => {
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const state12 = tickN(migrated, 12)
    expect(state12.market.tick).toBe(12)

    // NOT run through tick(): `materializeAges` is called directly and `tailState`
    // is built by hand. This can pass even if the real tick() settles with the OLD
    // age and materializes only afterward (765 §2) — it says nothing about the real
    // in-tick order. See test 3 below (the real tick()) for that evidence.
    const materializedTalent = materializeAges(state12, 13).talent
    const tailState = withProvenance({ ...state12, talent: materializedTalent, market: { ...state12.market, tick: 13 } })

    const order = publicPriorityOrder(tailState, 'authored-0001')
    // eslint-disable-next-line no-console
    console.log('component reconstruction, NOT the real tick, order at the hand-built tail state:', order)
    expect(order).toEqual(['compensation', 'term', 'trust', 'relationships', 'incumbency', 'standing', 'opportunity'])
  })

  it('REAL EVIDENCE: the ACTUAL tick() across the crossing prices a reused free agent through hollywood.ts:224 with the materialized (new) age, never the pre-crossing one — measured on a bounded arrangement, corpus and tick unmodified', () => {
    // Bounded arrangement, not a rewritten fixture (765 §2 disposition): the real
    // 'authored' corpus, ticked normally to week 12 by the real tick(). One
    // not-yet-entered rival identity (measured for this corpus: studio-2e45b791-r05,
    // eligibleWeek 520) is given an eligibleWeek of 13 so its SCHEDULED entry fires
    // on the very tick that crosses 'authored-0001' to 30. Every OTHER free agent of
    // 'authored-0001's role is removed so `enterRival`'s `talent.find(...)` (never
    // authored for a 'scheduled' origin — hollywood.ts:198 — so it always attempts
    // reuse first) deterministically reuses 'authored-0001' rather than some other
    // free actor. Nothing about `tick()`, `enterRival`, `materializeAges` or the
    // market's own decision logic is touched; only the INPUT is arranged.
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const state12 = tickN(migrated, 12)
    expect(state12.market.tick).toBe(12)
    const target = state12.talent.find((t) => t.id === 'authored-0001')!
    expect(target.age).toBe(29) // pre-crossing, confirmed before the real tick runs

    const h = state12.hollywood!
    const reserved = busyTalentIds(state12)
    for (const id of state12.founding?.applicantIds ?? []) reserved.add(id)
    for (const c of state12.contracts) reserved.add(c.talentId)
    for (const ordinal of h.activeEmploymentOrdinals) {
      const e = h.employment[ordinal]!
      if (e.endedWeek === null && e.terms.endWeekExclusive > state12.market.tick) reserved.add(e.terms.talentId)
    }
    const otherFreeSameRole = new Set(
      state12.talent.filter((t) => t.role === target.role && t.id !== target.id && !reserved.has(t.id)).map((t) => t.id),
    )
    expect(otherFreeSameRole.size, 'fixture no longer has other free agents of this role to remove').toBeGreaterThan(0)

    const targetIdentity = h.identities.find((s) => s.studioId === 'studio-2e45b791-r05')
    expect(targetIdentity, 'fixture no longer has the measured not-yet-entered rival identity').toBeDefined()
    expect(targetIdentity!.enteredWeek).toBeNull()

    const newTalent = state12.talent.filter((t) => !otherFreeSameRole.has(t.id))
    const newRows = state12.talentProvenance.rows.filter((r) => !otherFreeSameRole.has(r.personId))
    const newDue = state12.talentProvenance.due
      .map((d) => ({ ...d, personIds: d.personIds.filter((id) => !otherFreeSameRole.has(id)) }))
      .filter((d) => d.personIds.length > 0)
    const newIdentities = h.identities.map((s) => (s.studioId === 'studio-2e45b791-r05' ? { ...s, eligibleWeek: 13 } : s))
    const constructed = withProvenance({
      ...state12,
      talent: newTalent,
      hollywood: { ...h, identities: newIdentities },
      talentProvenance: { ...state12.talentProvenance, rows: newRows, due: newDue },
    })

    // THE REAL FUNCTION. Not reconstructed, not reordered.
    let after: ProvenanceState | undefined
    expect(() => { after = withProvenance(tick(constructed)) }).not.toThrow()
    expect(after!.market.tick).toBe(13)
    const targetAfter = after!.talent.find((t) => t.id === 'authored-0001')!
    expect(targetAfter.age).toBe(30) // materialized by the real tick, not by us

    const contract = after!.hollywood!.employment.find((e) => e.terms.talentId === 'authored-0001')
    expect(contract, 'the scheduled rival did not reuse authored-0001 as predicted — the arrangement no longer holds for this corpus').toBeDefined()

    // MEASURED, against the two possible prices, not assumed: the real contract's
    // terms are re-derived through the same public pricing entry at both candidate
    // ages, and only ONE of the two can match a real, already-committed contract.
    const pricedAtNewAge = offerForTalent(after!.seed, { ...targetAfter, age: 30 }, 208, 13)
    const pricedAtOldAge = offerForTalent(after!.seed, { ...targetAfter, age: 29 }, 208, 13)
    expect(pricedAtNewAge.annualSalary, 'the two candidate ages priced identically on this seed — not distinguishing').not.toBe(pricedAtOldAge.annualSalary)
    // eslint-disable-next-line no-console
    console.log('REAL tick() contract for authored-0001 at the crossing:', JSON.stringify(contract!.terms), 'priced-at-30:', pricedAtNewAge, 'priced-at-29:', pricedAtOldAge)
    expect(contract!.terms.annualSalary).toBe(pricedAtNewAge.annualSalary)
    expect(contract!.terms.signingBonus).toBe(pricedAtNewAge.signingBonus)
    expect(contract!.terms.annualSalary).not.toBe(pricedAtOldAge.annualSalary)

    // This confirms, on the REAL tick() and the REAL settlement-adjacent pricing
    // call, exactly what 765's CORRECTION derived from reading tick.ts: the
    // scheduled rival-entry loop runs after the tail's materialization, and a
    // person crossing 30 on the very tick that produces the crossing week is
    // already 30 to that consumer. It does NOT reach `advanceTalentMarketWeek`
    // itself (tick.ts's terminal line) — the natural corpus opens no talent-market
    // CASE for 'authored-0001' at this boundary (measured: none exists), and
    // constructing one would require fabricating a `TalentMarketCase`/proposal
    // pair rather than arranging the INPUT to a real code path. That narrower gap
    // — whether `advanceTalentMarketWeek`'s own tie-break sees the new age — is
    // named here rather than stood in for: it is structurally downstream of the
    // same materialized `talent` this test already proves is live by the
    // scheduled-entry loop's position, but it is not itself exercised by this test.
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 8. SAVE AND RELOAD at week 12 and week 13.
// ══════════════════════════════════════════════════════════════════════════

describe('8. save and reload at week 12 and week 13', () => {
  for (const week of [12, 13] as const) {
    it(`week ${week}: round trip preserves the age and the live validator accepts the state (P14C.2a: was validateSaveV33, now validateSaveV34 — the round trip is through whatever the live writer stamps, not pinned to V33)`, () => {
      const { save } = loadCorpus('authored')
      const migrated = migrateForTick(save)
      const state = tickN(migrated, week)
      const envelope: Envelope = { saveVersion: LIVE_SAVE_VERSION, seed: state.seed, state, broadcastCache: state.broadcastItems }

      const reloaded = JSON.parse(JSON.stringify(envelope))
      const validated = validateSaveV34(reloaded)
      const reloadedState = withProvenance(validated.state as object)
      expect(reloadedState.talent.find((t) => t.id === 'authored-0001')!.age).toBe(week === 12 ? 29 : 30)
    })
  }

  it('bonus, not explicitly pinned by contract §6: the GENERIC exportSave/importSave/loadSave dispatcher also accepts a live envelope (flags a real gap if validateSave was not given the live saveVersion arm — see summary; P14C.2a: was V33, now V34)', () => {
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const state = tickN(migrated, 13)
    const envelope = { saveVersion: LIVE_SAVE_VERSION, seed: state.seed, state, broadcastCache: state.broadcastItems } as unknown as SaveFile
    const json = exportSave(envelope)
    const reloaded = importSave(json)
    const loaded = loadSave(JSON.parse(json))
    expect(withProvenance((reloaded as unknown as Envelope).state as object).talent.find((t) => t.id === 'authored-0001')!.age).toBe(30)
    expect(withProvenance((loaded as unknown as Envelope).state as object).talent.find((t) => t.id === 'authored-0001')!.age).toBe(30)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 9. SCIENTISTS AGE (759-C amendment 10).
// ══════════════════════════════════════════════════════════════════════════

describe('9. scientists age', () => {
  it('genuine-v32-scientist: t-sci-00 crosses a birthday, its stored age advances, and its provenance row survives', () => {
    const { save } = loadCorpus('scientist')
    const migrated = migrateForTick(save)
    const row = migrated.talentProvenance.rows.find((r) => r.personId === 't-sci-00')
    expect(row, 'no provenance row for t-sci-00').toBeDefined()
    expect(row!.kind).toBe('legacy_age_anchor')

    const before = migrated.talent.find((t) => t.id === 't-sci-00')!.age
    const crossingWeek = nextBirthdayWeek(row!, before)
    expect(crossingWeek).toBeGreaterThan(migrated.market.tick)

    let state = migrated
    while (state.market.tick < crossingWeek) state = withProvenance(tick(state))

    const after = state.talent.find((t) => t.id === 't-sci-00')!.age
    expect(after).toBe(before + 1)

    const rowAfter = state.talentProvenance.rows.find((r) => r.personId === 't-sci-00')
    expect(rowAfter, 'provenance row for the scientist disappeared').toBeDefined()
    expect(ageAt(rowAfter!, state.market.tick)).toBe(after)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 10. ZERO RNG DRAW (Owner directive 2, sharpened §10 of 758).
// ══════════════════════════════════════════════════════════════════════════

describe('10. zero RNG draw', () => {
  it('BINDING: a direct materializeAges call that materializes a birthday leaves rngState byte-identical', () => {
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const state12 = tickN(migrated, 12)
    expect(state12.market.tick).toBe(12)

    const before = state12.rngState
    const materialized = withProvenance(materializeAges(state12, 13))

    expect(materialized.talent.find((t) => t.id === 'authored-0001')!.age).toBe(30) // really materialized a birthday
    expect(materialized.rngState).toBe(before) // byte-identical: no draw was consumed
  })

  it('DIAGNOSTIC, not the pin: an ordinary weekly tick spanning the crossing may legitimately draw RNG for other simulation activity', () => {
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const state12 = tickN(migrated, 12)
    const state13 = withProvenance(tick(state12))
    const changed = state13.rngState !== state12.rngState
    // eslint-disable-next-line no-console
    console.log('DIAGNOSTIC: rngState changed across the crossing tick (12->13)?', changed, '— an ordinary tick may draw for unrelated activity; this is not asserted either way.')
    expect(typeof state12.rngState).toBe('string')
    expect(typeof state13.rngState).toBe('string')
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 11. THE VALIDATOR REFUSES FOUR TAMPERED STATES, each attributable to its
//     own cause.
// ══════════════════════════════════════════════════════════════════════════

describe('11. the validator refuses four tampered states, each attributably', () => {
  function baseState(): ProvenanceState {
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    return tickN(migrated, 13)
  }
  function refusalMessage(state: ProvenanceState): string {
    // P14C.2a: `baseState()` now ticks a live (V34) state, so the envelope built
    // here is live too; `validateSaveV34` delegates to the frozen V33 chain for
    // everything this test tampers with, so the four causes stay distinguishable
    // (each inner message survives inside the wrapping "frozen V33 state is
    // invalid —" prefix).
    const envelope: Envelope = { saveVersion: LIVE_SAVE_VERSION, seed: state.seed, state, broadcastCache: state.broadcastItems }
    const json = JSON.parse(JSON.stringify(envelope))
    try {
      validateSaveV34(json)
      return ''
    } catch (error) {
      return (error as Error).message
    }
  }

  it('refuses a hand-edited talent.age that disagrees with its provenance, a missing row, an extra row naming nobody, and a stale due bucket — each with its own distinguishable message', () => {
    const state = baseState()
    const messages: string[] = []

    // (a) hand-edited age disagreeing with provenance
    const tamperedAge = withProvenance({ ...state, talent: state.talent.map((t) => (t.id === 'authored-0001' ? { ...t, age: t.age + 5 } : t)) })
    const msgAge = refusalMessage(tamperedAge)
    expect(msgAge, 'a hand-edited age was NOT refused').not.toBe('')
    expect(msgAge.toLowerCase()).toMatch(/age/)
    messages.push(msgAge)

    // (b) a missing row
    const tamperedMissing = withProvenance({
      ...state,
      talentProvenance: { ...state.talentProvenance, rows: state.talentProvenance.rows.filter((r) => r.personId !== 'authored-0001') },
    })
    const msgMissing = refusalMessage(tamperedMissing)
    expect(msgMissing, 'a missing provenance row was NOT refused').not.toBe('')
    messages.push(msgMissing)

    // (c) an extra row naming nobody
    const bogusRow: TalentProvenanceRow = { personId: 'nobody-lives-here', kind: 'legacy_age_anchor', ageAtMigration: 40, migrationWeek: 0 }
    const tamperedExtra = withProvenance({ ...state, talentProvenance: { ...state.talentProvenance, rows: [...state.talentProvenance.rows, bogusRow] } })
    const msgExtra = refusalMessage(tamperedExtra)
    expect(msgExtra, 'an extra unknown-person row was NOT refused').not.toBe('')
    messages.push(msgExtra)

    // (d) a stale due bucket (shift every bucket's week by one, breaking the
    // recomputation-from-rows-and-ages agreement)
    const tamperedDue = withProvenance({
      ...state,
      talentProvenance: { ...state.talentProvenance, due: state.talentProvenance.due.map((bucket) => ({ ...bucket, week: bucket.week + 1 })) },
    })
    const msgDue = refusalMessage(tamperedDue)
    expect(msgDue, 'a stale due bucket was NOT refused').not.toBe('')
    expect(msgDue.toLowerCase()).toMatch(/due/)
    messages.push(msgDue)

    // attribution: four distinct causes produce four distinct messages, never one
    // generic shape complaint reused across all of them.
    expect(new Set(messages).size).toBe(4)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 12. materializeAges IS IDEMPOTENT.
// ══════════════════════════════════════════════════════════════════════════

describe('12. materializeAges is idempotent', () => {
  it('twice on the same state returns an equal state', () => {
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const state = tickN(migrated, 13)
    const once = materializeAges(state, state.market.tick)
    const twice = materializeAges(withProvenance(once), state.market.tick)
    expect(twice).toEqual(once)
  })
})

// ══════════════════════════════════════════════════════════════════════════
// 13. PROVENANCE AT THE APPEND, not the mint call — all five sites, plus the
//     759-C amendment 3 / 762 §9 hazards.
// ══════════════════════════════════════════════════════════════════════════

describe('13. provenance is written at the append, not the mint call', () => {
  it('worldgen.ts:544 — every genesis person in a fresh generateWorld() has exactly one row', () => {
    const state = withProvenance(generateWorld('p14c1-red-worldgen-1'))
    expect(state.talentProvenance.rows).toHaveLength(state.talent.length)
    const ids = new Set(state.talentProvenance.rows.map((r) => r.personId))
    expect(ids.size).toBe(state.talent.length)
    for (const person of state.talent) expect(ids.has(person.id)).toBe(true)
  })

  it('actions.ts:826 withCreatedTalent (createTalent) adds exactly one row; the anchor keeps the EXACT pre-floor age (762 §10 / 765 correction: never equal to the already-floored committed person for a fractional entrant), the stored person is its floor, and the birthday crosses 13 weeks after the ACTUAL entry week — never +52', () => {
    const state = generateWorld('p14c1-red-createtalent-1')
    const before = withProvenance(state).talentProvenance.rows.length
    const entryWeek = state.market.tick
    // 29.75 is the Owner's own worked case (contract §1): the anchor is a KNOWN
    // INPUT, supplied here directly, not read back from the already-floored
    // person the append returns. `applyCreateTalent` clamps only the INTEGER
    // range [18,70] (actions.ts) and stores `a.age` unrounded, so this fraction
    // really does reach the anchor unmodified.
    const input: AuthoredTalentInput = {
      name: 'RED Author', role: 'actor', age: 29.75,
      actual: { warmth: 0.3, gravity: -0.4, physicality: 0.7 },
      potentialTier: 'Steady', workEthic: 60,
    }
    const result = withProvenance(applyActions(state, [{ kind: 'createTalent', talent: input }]))
    expect(result.talentProvenance.rows).toHaveLength(before + 1)
    const newPerson = result.talent[result.talent.length - 1]!
    const row = result.talentProvenance.rows.find((r) => r.personId === newPerson.id)
    expect(row, 'no provenance row for the newly created talent').toBeDefined()
    expect(row!.kind).toBe('authored_exact_week')
    if (row!.kind === 'authored_exact_week') {
      // the anchor is the KNOWN INPUT (29.75), never `newPerson.age` (the floor).
      expect(row!.ageAtEntry).toBe(29.75)
      expect(row!.entryWeek).toBe(entryWeek)
    }
    // the committed person carries the floor, never the exact anchor.
    expect(newPerson.age).toBe(29)
    expect(newPerson.age).not.toBe(row!.kind === 'authored_exact_week' ? row!.ageAtEntry : NaN)
    // the birthday crosses 13 weeks after the ACTUAL entry week, never a naive +52
    // from the floored stored age (record 761's committed prediction, 765 correction).
    expect(nextBirthdayWeek(row!, 29)).toBe(entryWeek + 13)
    expect(nextBirthdayWeek(row!, 29)).not.toBe(entryWeek + 52)
  })

  it('actions.ts:2842 recruitScientist adds exactly one row for the recruited scientist', () => {
    const generated = generateWorld('p14c1-red-scientist-append-1')
    let state = initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
    state = commitPlacement(state, { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } })
    while (state.market.tick < 12) state = tick(state)
    const laboratoryFacilityId = state.placement.facilities[0]!.facilityId
    state = applyActions(state, [{ kind: 'installAcousticInstruments', laboratoryFacilityId }])
    while (state.market.tick < 260) state = tick(state)

    const before = withProvenance(state).talentProvenance.rows.length
    state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId }])
    const after = withProvenance(state)
    expect(after.talentProvenance.rows).toHaveLength(before + 1)
    const scientist = state.talent.find((t) => t.role === 'scientist')
    expect(scientist, 'recruitScientist did not add a scientist').toBeDefined()
    const row = after.talentProvenance.rows.find((r) => r.personId === scientist!.id)
    expect(row, 'no provenance row for the recruited scientist').toBeDefined()
  })

  it('hollywood.ts:223 enterRival (762 §9, narrower than record 760): a fresh rival appends one row per NEWLY MINTED person (never for a reused one); the anchor is the EXACT age after the authored-template raise and BEFORE the floor (765 correction — never equal to the already-floored `person.age`), the committed person is that floor, the birthday derives from the actual entry week, and the pricing path (hollywood.ts:224) consumed the committed floor', () => {
    // Deterministic given the seed (verified empirically against the identically-seeded
    // genuine-v32-fresh-tick0, whose own measurement shows 60 -> 84 with 4 integer
    // ages): all four starting rivals are `authored` (origin==='fresh' && row<=4), and
    // `authored` forces `person = undefined` unconditionally (hollywood.ts:215), so
    // EVERY one of the 24 role slots mints fresh — none reuse an existing free agent.
    const { save } = loadCorpus('bare-world')
    const migrated = migrateV33(save).state
    const before = migrated.talent.length

    const result = withProvenance(initializeHollywood(migrated, 'fresh'))
    expect(result.talent.length).toBe(before + 24)
    expect(result.talentProvenance.rows).toHaveLength(result.talent.length)

    const newPeople = result.talent.filter((t) => !migrated.talent.some((m) => m.id === t.id))
    expect(newPeople).toHaveLength(24)
    const raised = newPeople.filter((t) => t.age === 28)
    expect(raised.length).toBeGreaterThanOrEqual(1) // measured: 4, for this exact seed

    let fractionalChecked = 0
    for (const person of newPeople) {
      const row = result.talentProvenance.rows.find((r) => r.personId === person.id)
      expect(row, `no provenance row for newly minted rival hire ${person.id}`).toBeDefined()
      expect(row!.kind).toBe('authored_exact_week')
      if (row!.kind !== 'authored_exact_week') continue

      // The anchor is derived from the KNOWN INPUT — the raw draw, independently
      // reproduced by calling the SAME deterministic mint (`generateIndustryTalent`,
      // keyed only by seed/id/role; the `name` override never touches a stream —
      // worldgen.ts:552) — with the SAME legitimate rival clamp applied
      // (`Math.max(28, drawn)`, hollywood.ts:221). NEVER derived from `person.age`,
      // which is already the floor the append commits (765's exact hole).
      const drawn = generateIndustryTalent(migrated.seed, person.id, person.role)
      const expectedAnchor = Math.max(28, drawn.age)
      expect(row!.ageAtEntry, `entrant ${person.id} anchor disagrees with its independently-derived input`).toBe(expectedAnchor)
      // the committed person is the anchor's FLOOR, never the exact anchor.
      expect(person.age).toBe(Math.floor(expectedAnchor))

      if (!Number.isInteger(expectedAnchor)) {
        fractionalChecked++
        // birthday timing derives from the ACTUAL entry week (762 §10 / 765
        // correction), never a naive +52 from the floored stored age.
        const entryWeek = row!.entryWeek
        const crossing = nextBirthdayWeek(row!, person.age)
        expect(crossing).toBeGreaterThan(entryWeek)
        expect(crossing).toBeLessThan(entryWeek + 52)

        // the pricing path (hollywood.ts:224, `offerForTalent`) consumed the
        // COMMITTED (floored) person, never the unfloored anchor — checked against
        // the REAL contract this same append wrote, not a recomputation standing in
        // for it.
        const contract = result.hollywood!.employment.find((e) => e.terms.talentId === person.id)
        expect(contract, `no employment contract recorded for ${person.id}`).toBeDefined()
        const pricedAtCommitted = offerForTalent(result.seed, person, 208, entryWeek)
        const pricedAtAnchor = offerForTalent(result.seed, { ...person, age: expectedAnchor }, 208, entryWeek)
        expect(contract!.terms.annualSalary).toBe(pricedAtCommitted.annualSalary)
        expect(contract!.terms.signingBonus).toBe(pricedAtCommitted.signingBonus)
        // a naive unfloored price would disagree — proves the path actually branches on it.
        expect(contract!.terms.annualSalary).not.toBe(pricedAtAnchor.annualSalary)
      }
    }
    expect(fractionalChecked, 'no genuinely fractional entrant was minted for this seed — the anchor-vs-floor distinction was never exercised').toBeGreaterThan(0)
  })

  it('enterRival idempotency: re-entering an already-entered rival is a no-op and writes no additional row', () => {
    const { save } = loadCorpus('bare-world')
    const migrated = migrateV33(save).state
    const once = withProvenance(initializeHollywood(migrated, 'fresh'))
    const studioId = once.hollywood!.businesses[0]!.studioId

    const twice = withProvenance(enterRival(once, studioId, 'fresh'))
    expect(twice.talent.length).toBe(once.talent.length)
    expect(twice.talentProvenance.rows.length).toBe(once.talentProvenance.rows.length)
  })

  it('hollywoodTick.ts:136-142 hazard: a rival mints a replacement, cannot afford it, and discards it — NO orphan provenance row is written for the discarded person', () => {
    // Constructed and independently verified reachable (against the CURRENT,
    // pre-C.1 production code, run standalone before this file was finalized): a
    // vacancy is opened for one rival's craft role, every other free craft-role
    // person in the world is removed so no reuse candidate exists, and that rival's
    // cash is driven deeply negative so no offer is affordable. A plain tick() over
    // this state does not throw, and the discarded candidate never appears in
    // `state.talent` — confirmed against the unmodified engine at HEAD before this
    // suite was authored.
    const { save } = loadCorpus('authored')
    const migrated = migrateForTick(save)
    const h = migrated.hollywood!
    const business = h.businesses[0]!
    const studioId = business.studioId
    const employedIds = new Set(h.activeEmploymentOrdinals.map((i) => h.employment[i]!.terms.talentId))

    const craftOrdinalIndex = h.activeEmploymentOrdinals.findIndex((i) => {
      const e = h.employment[i]!
      if (e.studioId !== studioId) return false
      return migrated.talent.find((t) => t.id === e.terms.talentId)?.role === 'craft'
    })
    expect(craftOrdinalIndex, 'fixture no longer has a craft employee to vacate for studio r01').toBeGreaterThanOrEqual(0)
    const craftOrdinal = h.activeEmploymentOrdinals[craftOrdinalIndex]!
    const removedPersonId = h.employment[craftOrdinal]!.terms.talentId

    const newEmployment = h.employment.filter((_e, idx) => idx !== craftOrdinal)
    const remap = (i: number): number => (i > craftOrdinal ? i - 1 : i)
    const newActiveOrdinals = h.activeEmploymentOrdinals.filter((i) => i !== craftOrdinal).map(remap)

    const newTalent: Talent[] = migrated.talent.filter((t) => {
      if (t.role !== 'craft') return true
      if (t.id === removedPersonId) return false
      return employedIds.has(t.id) // keep only craft people already employed elsewhere
    })
    const droppedIds = new Set(migrated.talent.filter((t) => !newTalent.some((nt) => nt.id === t.id)).map((t) => t.id))
    const newRows = migrated.talentProvenance.rows.filter((r) => !droppedIds.has(r.personId))
    const newDue = migrated.talentProvenance.due
      .map((d) => ({ ...d, personIds: d.personIds.filter((id) => !droppedIds.has(id)) }))
      .filter((d) => d.personIds.length > 0)

    const newBusinesses = h.businesses.map((b) => (b.studioId === studioId ? { ...b, account: { ...b.account, cash: -50_000_000 } } : b))
    const newHollywood = { ...h, employment: newEmployment, activeEmploymentOrdinals: newActiveOrdinals, businesses: newBusinesses }
    const constructed = withProvenance({
      ...migrated, talent: newTalent, hollywood: newHollywood,
      talentProvenance: { ...migrated.talentProvenance, rows: newRows, due: newDue },
    })

    let after: ProvenanceState | undefined
    expect(() => { after = withProvenance(tick(constructed)) }).not.toThrow()

    expect(after!.talent.length).toBe(constructed.talent.length) // the discarded candidate never entered state.talent
    expect(after!.talentProvenance.rows).toHaveLength(after!.talent.length) // and no orphan row survives for them either
    const ids = new Set(after!.talent.map((t) => t.id))
    for (const row of after!.talentProvenance.rows) {
      expect(ids.has(row.personId), `orphan provenance row for a discarded/nonexistent person: ${row.personId}`).toBe(true)
    }
  })
})

// keep LIVE_SAVE_VERSION's eventual bump observable in one place, without hard-coding
// "33" anywhere else in this file (759-C's own convention: relative, not a guessed literal).
// P14C.2a (776 S10): C.1 landed at 33 as this test predicted, then C.2a bumped once more.
describe('save version bump (contract §6)', () => {
  it('LIVE_SAVE_VERSION is 34 once C.2a lands (today: 33)', () => {
    expect(LIVE_SAVE_VERSION).toBe(34)
  })
})
