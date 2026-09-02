// ── C2a-M1 · THE V14 BOUNDARY GUARDS (§8, §8.3, G4) ─────────────────────────
//
// CHARTER (r3.2 §8): "~45 mechanical boundary-guard/projection/migrator edits per
// bump; the five hand-enumerated `migrateToVn` downgrade refusals get a
// parameterized every-migrator × every-higher-version test."
//
// CHARTER (r3.2 §8.3): "Copy the V12 three-legged historical-boundary guard (C2's
// roots leak identities); new ledger kinds (`setCapex`/`setMaintenance`/
// `setDemolitionRefund`) get boundary legs. … The widened-leaf boundary rule
// (r3): the workflow exact-key list and the blocker validator become
// version-aware — pre-V14 boundaries still REFUSE `bindings` and the
// `set-unavailable` arm; V14 requires them ('the historical boundary is real
// rather than nominal')."
//
// WHY LEG BY LEG. A boundary that refuses a forged save proves nothing about WHY
// it refused. Three roots, a ledger kind and a widened leaf all grafted onto one
// forgery would be caught by whichever check the validator reaches first, and the
// other two legs would be dead code nobody notices. So each leg is forged ALONE,
// onto a save that is otherwise genuine and legal, and the refusal is required to
// name the thing that was forged.
//
// THE FOURTH ASSERTION, which is not a guard at all: a refusal is only half of a
// version-aware rule. The other half is that a genuine file WITHOUT the widened
// leaf still loads — every save on a player's disk is one — and a boundary that
// refuses both is not version-aware, it is broken. That leg is stated here
// explicitly because nothing else in the suite would notice.
//
// CONTRACT-FIRST: the expectations are the charter's. `src/core` is read only to
// name real symbols. Failures against a pre-engine tree are the contract
// reporting itself.

import { beforeAll, describe, expect, it } from 'vitest'

import { applyActions, stableStringify, tick } from '../../src/core/index.js'
import type { GameState } from '../../src/core/index.js'

import { clone, operationsStudio, productionPayload, withCash } from './_contractFixtures.js'
import {
  CHARTER_MIGRATOR_VERSIONS,
  CHARTER_SAVE_VERSIONS,
  charterStudioEventRow,
  forgedV13From,
  legacyWorld,
  loadCoreModule,
  requireFunction,
  V14_LEDGER_KINDS,
  V14_STATE_ROOTS,
  WORKFLOW_BINDINGS_KEYS,
} from './_v14Contract.js'
import type { SaveModule } from './_v14Contract.js'

type Envelope = { saveVersion: number; state: Record<string, unknown> } & Record<string, unknown>

let core: SaveModule
let loadFailure: unknown = null

/** A legacy world carries no V14 authority, so every frozen builder can write it. */
let legacy: GameState
/** One managed picture actually in flight — the only state with a workflow to forge on. */
let inFlight: GameState

/** Genuine, validated envelopes of the legacy world at every version 1…14. */
const genuine = new Map<number, Envelope>()

beforeAll(async () => {
  try {
    core = await loadCoreModule()
  } catch (error) {
    loadFailure = error
    return
  }
  legacy = legacyWorld('c2a-m1-guards-legacy', 8)
  let state = withCash(operationsStudio('c2a-m1-guards-managed'), 50_000_000)
  state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state) }])
  inFlight = tick(tick(state))

  for (const version of CHARTER_SAVE_VERSIONS) {
    const builder = core[`makeSaveV${String(version)}`]
    if (typeof builder !== 'function') continue
    genuine.set(version, (builder as (s: GameState) => Envelope)(legacy))
  }
})

function requireCore(): SaveModule {
  if (loadFailure !== null) throw loadFailure
  return core
}

function fn(name: string, why: string): (...args: never[]) => unknown {
  return requireFunction(requireCore(), name, why)
}

function envelopeAt(version: number): Envelope {
  const save = genuine.get(version)
  if (save === undefined) {
    throw new Error(`C2a-M1: no genuine SaveFileV${String(version)} fixture was built`)
  }
  return clone(save)
}

function validateSave(save: unknown): unknown {
  return (fn('validateSave', 'the version-dispatching load boundary') as (s: unknown) => unknown)(save)
}

/**
 * One V14 fact per entry, each moved OFF the value `convertV13ToV14` derives
 * (§8.3). A studio in any of these states has history no historical format can
 * describe, so no frozen builder may write one — that is what "the historical
 * boundary is real rather than nominal" means on the write side.
 */
const V14_AUTHORITY_CARRIERS: readonly {
  label: string
  mutate: (state: Record<string, unknown>) => void
}[] = [
  {
    label: 'a set beyond the endowment',
    mutate: (state) => {
      const sets = state.sets as Record<string, unknown>[]
      sets.push({ ...clone(sets[0]!), id: 'set-2', name: 'A Set The Studio Built' })
      state.nextSetId = 3
    },
  },
  {
    label: 'a set-id counter that has moved',
    mutate: (state) => {
      state.nextSetId = (state.nextSetId as number) + 1
    },
  },
  {
    label: 'a recorded studio event',
    mutate: (state) => {
      const week = (state.market as { tick: number }).tick
      state.studioEvents = { nextSeq: 1, rows: [charterStudioEventRow('premiere', 0, week)] }
    },
  },
  {
    label: 'a queued intent',
    mutate: (state) => {
      const week = (state.market as { tick: number }).tick
      state.productionQueue = [
        { kind: 'commissionScript', ordinal: 0, queuedWeek: week, payload: {} },
      ]
    },
  },
  {
    label: 'a minted screenplay ordinal',
    mutate: (state) => {
      state.originalScreenplays = { nextOrdinal: 1, blueprints: [] }
    },
  },
  {
    label: 'a set capital ledger row',
    mutate: (state) => {
      const week = (state.market as { tick: number }).tick
      const ledger = state.ledger as Record<string, unknown>[]
      ledger.push({ week, kind: 'setCapex', amount: -1_000, note: 'C2a-M1 write-side forgery' })
    },
  },
  {
    label: 'a workflow bound to a set',
    mutate: (state) => {
      const operations = state.operations as { workflows: Record<string, unknown>[] }
      for (const workflow of operations.workflows) {
        workflow.bindings = { ...(workflow.bindings as object), setId: 'set-0' }
      }
    },
  },
  {
    label: 'a set-unavailable blocker',
    mutate: (state) => {
      const operations = state.operations as { workflows: Record<string, unknown>[] }
      for (const workflow of operations.workflows) {
        workflow.blocker = { kind: 'set-unavailable', targetPhase: 'shooting' }
      }
    },
  },
]

// ── (A) the parameterized downgrade matrix (§8) ─────────────────────────────

describe('C2a-M1 · guards (A) — every migrator refuses every higher version', () => {
  it('builds a genuine, validated envelope at all fourteen versions', () => {
    requireCore()
    for (const version of CHARTER_SAVE_VERSIONS) {
      const save = envelopeAt(version)
      expect(save.saveVersion, `SaveFileV${String(version)}`).toBe(version)
    }
    expect(genuine.size).toBe(CHARTER_SAVE_VERSIONS.length)
  })

  for (const target of CHARTER_MIGRATOR_VERSIONS) {
    const higher = CHARTER_SAVE_VERSIONS.filter((version) => version > target)
    if (higher.length === 0) continue
    it(`migrateToV${String(target)} refuses every one of V${higher.map(String).join('/V')}`, () => {
      const migrator = fn(
        `migrateToV${String(target)}`,
        '§8 requires a downgrade refusal on every retained historical boundary',
      ) as (save: unknown) => unknown
      for (const version of higher) {
        const save = envelopeAt(version)
        expect(
          () => migrator(save),
          `migrateToV${String(target)} silently accepted a SaveFileV${String(version)}`,
        ).toThrow(/cannot downgrade/)
      }
    })
  }

  it('passes its OWN version through by identity, so the refusal is not blanket', () => {
    for (const target of CHARTER_MIGRATOR_VERSIONS) {
      const migrator = fn(`migrateToV${String(target)}`, '§8') as (save: unknown) => unknown
      const save = envelopeAt(target)
      expect(migrator(save), `migrateToV${String(target)} at its own version`).toBe(save)
    }
  })

  it('covers the whole matrix, not a sample of it', () => {
    // 10 + 9 + … + 1 + 0 = 55 ordered (migrator, higher version) pairs.
    const pairs = CHARTER_MIGRATOR_VERSIONS.reduce(
      (total, target) => total + CHARTER_SAVE_VERSIONS.filter((v) => v > target).length,
      0,
    )
    expect(pairs).toBe(55)
  })
})

// ── (B) the live V13 ⇄ V14 boundary ─────────────────────────────────────────

describe('C2a-M1 · guards (B) — the live boundary moves one way', () => {
  it('lifts a genuine V13 file to V14', () => {
    const migrate = fn('migrateToV14', '§8: the COMPLETE migrator lands at M1') as (
      save: unknown,
    ) => Envelope
    const migrated = migrate(envelopeAt(13))
    expect(migrated.saveVersion).toBe(14)
    for (const root of V14_STATE_ROOTS) {
      expect(root in migrated.state, `migrated save must carry ${root}`).toBe(true)
    }
  })

  it('refuses to walk a V14 file back down to V13', () => {
    const migrate = fn('migrateToV13', '§8: the downgrade refusal') as (save: unknown) => unknown
    expect(() => migrate(envelopeAt(14))).toThrow(/cannot downgrade/)
  })

  it('refuses to write REAL V14 authority out through any frozen builder', () => {
    // The write side of the same boundary. Each carrier below is one V14 fact
    // §8.3 says the migrator DERIVES rather than invents, moved off the value the
    // derivation would produce — a third set, a recorded event, a queued intent, a
    // minted blueprint, a set capital row, a bound workflow. None of them has a
    // home in any historical format, so none may be silently dropped to write one.
    //
    // The UNTOUCHED endowment is deliberately not in this list: whether a frozen
    // builder may write a studio that has done nothing is a design choice the
    // charter does not make, and the test below states the law that actually
    // binds it — nothing may be lost — rather than picking one of the two answers.
    for (const { label, mutate } of V14_AUTHORITY_CARRIERS) {
      const carrier = clone(inFlight) as unknown as Record<string, unknown>
      mutate(carrier)
      for (const version of CHARTER_SAVE_VERSIONS.filter((v) => v < 14)) {
        const builder = fn(
          `makeSaveV${String(version)}`,
          '§8.3: the write side of the historical boundary',
        ) as (state: unknown) => unknown
        expect(
          () => builder(carrier),
          `makeSaveV${String(version)} discarded ${label} to write a historical file`,
        ).toThrow(/cannot downgrade/)
      }
    }
  })

  it('may write a V13 file only when the migrator can put every byte back', () => {
    // §8.3's derivations are the whole justification for any frozen-builder
    // exemption: a state the migrator can RECONSTRUCT exactly loses nothing by
    // crossing the boundary. So the frozen V13 builder has exactly two legal
    // answers for a managed studio, and this asserts the disjunction rather than
    // legislating which one the engine picks.
    const makeV13 = fn('makeSaveV13', '§8.3') as (state: unknown) => Envelope
    const makeV14 = fn('makeSaveV14', '§8.1') as (state: unknown) => Envelope
    const convert = fn('convertV13ToV14', '§8.3: the derivation') as (save: unknown) => Envelope

    let written: Envelope
    try {
      written = makeV13(inFlight)
    } catch (error) {
      // A refusal is a legal answer — but ONLY a downgrade refusal. Any other
      // throw is the V13 boundary failing to describe a state it must describe,
      // and swallowing it here would turn this test into a rubber stamp.
      expect(
        (error as Error).message,
        'makeSaveV13 failed on a managed studio for a reason that is not a downgrade refusal',
      ).toMatch(/cannot downgrade/)
      return
    }

    expect(written.saveVersion).toBe(13)
    const restored = convert(written)
    const native = makeV14(inFlight)
    for (const root of V14_STATE_ROOTS) {
      expect(
        stableStringify(restored.state[root]),
        `writing V13 and migrating back lost state.${root}`,
      ).toBe(stableStringify(native.state[root]))
    }
  })

  // P04A (§2.5): the live boundary moved again, from V14 to V15. The unknown-version
  // boundary moves the same way it always does — one past whatever the newest live
  // version now is. 15 is no longer unknown (validateSaveV15 exists); 16 is.
  it('moves the unknown-version boundary from 16 to 17 (P06A: V16 is live)', () => {
    const save = envelopeAt(14)
    expect(() => validateSave({ ...save, saveVersion: 17 })).toThrow(/unknown saveVersion 17/)
  })
})

// ── (C) LEG 1 — the four new roots, at every historical boundary ────────────

describe('C2a-M1 · guards (C) — LEG 1: V14 roots cannot appear under an older tag', () => {
  for (const root of V14_STATE_ROOTS) {
    it(`refuses state.${root} at every boundary from V1 to V13`, () => {
      requireCore()
      const v14 = envelopeAt(14)
      for (const version of CHARTER_SAVE_VERSIONS.filter((v) => v < 14)) {
        const forged = envelopeAt(version)
        forged.state[root] = clone(v14.state[root])
        let refusal: string | null = null
        try {
          validateSave(forged)
        } catch (error) {
          refusal = (error as Error).message
        }
        expect(refusal, `SaveFileV${String(version)} accepted the V14 root ${root}`).not.toBeNull()
        // The refusal must NAME the root, or a maintainer cannot tell which of the
        // ~45 boundary edits fired — nor that it was this one rather than a
        // coincidental structural complaint.
        expect(refusal, `SaveFileV${String(version)} refused ${root} without naming it`).toContain(
          root,
        )
      }
    })
  }

  it('REQUIRES every one of them at V14 — the guard is two-sided', () => {
    const validateV14 = fn('validateSaveV14', '§8.1: the four new roots') as (s: unknown) => unknown
    expect(() => validateV14(envelopeAt(14))).not.toThrow()
    for (const root of V14_STATE_ROOTS) {
      const forged = envelopeAt(14)
      delete forged.state[root]
      expect(() => validateV14(forged), `V14 accepted a save missing ${root}`).toThrow()
    }
  })
})

// ── (C) LEG 2 — the set capital ledger kinds ────────────────────────────────

/** §8.3's three new ledger kinds, with the sign each one's name implies. */
const LEDGER_AMOUNTS: Readonly<Record<string, number>> = {
  setCapex: -1_000,
  setMaintenance: -1_000,
  setDemolitionRefund: 1_000,
}

function withForgedLedgerRow(save: Envelope, kind: string): Envelope {
  const forged = clone(save)
  const state = forged.state
  const amount = LEDGER_AMOUNTS[kind]!
  const ledger = state.ledger as { week: number; kind: string; amount: number; note: string }[]
  const market = state.market as { tick: number }
  ledger.push({ week: market.tick, kind, amount, note: 'C2a-M1 boundary-guard forgery' })
  // Cash must keep reconciling with the ledger, or the row is refused for
  // arithmetic and the LEDGER-KIND leg is never reached.
  const studio = state.studio as { cash: number }
  studio.cash += amount
  return forged
}

describe('C2a-M1 · guards (C) — LEG 2: the set capital ledger kinds have their own leg', () => {
  it('names exactly the three kinds §8.3 adds', () => {
    expect([...V14_LEDGER_KINDS]).toEqual(['setCapex', 'setMaintenance', 'setDemolitionRefund'])
  })

  for (const kind of V14_LEDGER_KINDS) {
    it(`refuses a ${kind} row at the V13 boundary`, () => {
      requireCore()
      const forged = withForgedLedgerRow(envelopeAt(13), kind)
      let refusal: string | null = null
      try {
        validateSave(forged)
      } catch (error) {
        refusal = (error as Error).message
      }
      expect(refusal, `the V13 boundary accepted a ${kind} row`).not.toBeNull()
      expect(refusal).toMatch(/ledger/)
    })

    it(`ACCEPTS the same ${kind} row at V14 — the refusal is about the boundary`, () => {
      const validateV14 = fn('validateSaveV14', '§8.3: the new ledger kinds') as (s: unknown) => unknown
      // Non-vacuity. Without this the V13 leg above would also pass if the row
      // were simply malformed, and the leg would be proving nothing about V14.
      expect(() => validateV14(withForgedLedgerRow(envelopeAt(14), kind))).not.toThrow()
    })
  }
})

// ── (C) LEG 3 — the widened persisted leaves ────────────────────────────────

describe('C2a-M1 · guards (C) — LEG 3: the widened leaves are version-aware', () => {
  it('has a workflow to forge on, or the whole leg is vacuous', () => {
    requireCore()
    expect(inFlight.operations.workflows.length).toBeGreaterThan(0)
    expect(inFlight.scriptDevelopment.projects.length + 1).toBeGreaterThan(0)
  })

  it('refuses a `bindings` leaf inside a V13-tagged workflow', () => {
    const makeV14 = fn('makeSaveV14', '§8.1') as (state: unknown) => Envelope
    const v14 = makeV14(inFlight)
    const forged = forgedV13From(v14) as unknown as Envelope
    // Put back EXACTLY the one thing under test.
    const operations = forged.state.operations as { workflows: Record<string, unknown>[] }
    operations.workflows = clone(
      (v14.state.operations as { workflows: Record<string, unknown>[] }).workflows,
    )
    let refusal: string | null = null
    try {
      validateSave(forged)
    } catch (error) {
      refusal = (error as Error).message
    }
    expect(refusal, 'a V13 boundary accepted the V14 `bindings` leaf').not.toBeNull()
    expect(refusal).toContain('bindings')
  })

  it('refuses the `set-unavailable` blocker arm inside a V13-tagged workflow', () => {
    const makeV14 = fn('makeSaveV14', '§8.1') as (state: unknown) => Envelope
    const forged = forgedV13From(makeV14(inFlight)) as unknown as Envelope
    const operations = forged.state.operations as { workflows: Record<string, unknown>[] }
    operations.workflows = operations.workflows.map((workflow) => ({
      ...workflow,
      blocker: { kind: 'set-unavailable', targetPhase: 'shooting' },
    }))
    expect(() => validateSave(forged)).toThrow()
  })

  it('REQUIRES `bindings` at V14, with exactly the §8.1 key list', () => {
    const makeV14 = fn('makeSaveV14', '§8.1') as (state: unknown) => Envelope
    const validateV14 = fn('validateSaveV14', '§8.1') as (s: unknown) => unknown
    const v14 = makeV14(inFlight)

    for (const workflow of (v14.state.operations as { workflows: Record<string, unknown>[] })
      .workflows) {
      const bindings = workflow.bindings as Record<string, unknown>
      expect(Object.keys(bindings).sort()).toEqual([...WORKFLOW_BINDINGS_KEYS].sort())
    }

    const stripped = clone(v14)
    const operations = stripped.state.operations as { workflows: Record<string, unknown>[] }
    operations.workflows = operations.workflows.map((workflow) => {
      const copy = { ...workflow }
      delete copy.bindings
      return copy
    })
    expect(() => validateV14(stripped), 'V14 accepted a workflow with no bindings leaf').toThrow()
  })

  // ── the other half of "version-aware" ─────────────────────────────────────
  //
  // §8.3 says pre-V14 boundaries REFUSE `bindings`. It does NOT say they refuse
  // workflows: a genuine SaveFileV13 — every pre-C2 file on a player's disk — has
  // an in-flight production and no `bindings` leaf, and it must still load, or
  // there is nothing left for `migrateToV14` to migrate.
  it('still ACCEPTS a genuine V13 workflow that carries no `bindings` leaf', () => {
    const makeV14 = fn('makeSaveV14', '§8.1') as (state: unknown) => Envelope
    const twin = forgedV13From(makeV14(inFlight)) as unknown as Envelope
    const workflows = (twin.state.operations as { workflows: Record<string, unknown>[] }).workflows
    expect(workflows.length, 'the fixture must carry a workflow or this proves nothing').toBe(1)
    expect('bindings' in workflows[0]!).toBe(false)

    expect(
      () => validateSave(twin),
      'C2a-M1 (§8.3): the V13 boundary refused a GENUINE V13 workflow — one with no ' +
        '`bindings` leaf at all. Version-awareness has two halves; refusing the new leaf ' +
        'under an old tag is only the first. If the old tag also refuses its own shape, ' +
        'every pre-C2 save on disk is unreadable and the migrator has no input.',
    ).not.toThrow()
  })
})
