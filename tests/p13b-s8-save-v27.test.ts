// ── P13B-S8 test 7: Save V27 — genuine V26 fixtures, honest lift, conditional
// downgrade refusal, validator refusals for forged rival authority, sentinel
// 28 ─────────────────────────────────────────────────────────────────────
//
// Requirement-derived from "S8 — Symmetric rival research and finance"'s Save
// V27 paragraph ("RivalMoneyKind gains researchSpend, researchCapacity,
// technologyRestoration, technologyRefund (the movement record widens, every
// period carries the four keys at 0 on lift); IndustryReceipt gains
// laboratoryCommitted {planId, facilityId}, laboratoryOperational
// {facilityId}, instrumentOperational {facilityId, technologyId},
// researchSeatAssigned {projectId, talentId}, researchCompleted {projectId}
// ...downgrade to V26 is refused when any rival research fact exists (a NEW
// positive projection projectHollywoodPreV27 in save.ts... throws on any
// rival research fact, strips the four zero movement keys otherwise) and
// lossless otherwise"), the plan's "Tests" item 7 ("Save V(next) + validator
// refusals"), the S8 scope record, and the Audit's S8 LAW item 12: "Downgrade
// refusal (S6, test 7): V27->V26 throws when any of the four new movement
// kinds is non-zero in any period or any of the five new receipt kinds
// exists; lossless otherwise." Plus "the validator's per-studio invariants
// and 'no rival authority without a receipt'" (scope record).
//
// GENUINE V26 FIXTURES (tests/fixtures/p13b/PROVENANCE.md, "V26 fixtures
// (P13B-S7-T0, 2026-09-17)", minted at `ce6945d`, final V26 writer
// `83187c2`): `legacy-v26-sound-mid-deployment-309.json.gz` (sha256
// `11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72`),
// `legacy-v26-lighting-cancelled-793.json.gz` (sha256
// `0b74f4d89d41bd2c596c51e43758b0915bd8daec8cde05476e9aabe954592ce3`),
// `legacy-v26-lighting-restored-795.json.gz` (sha256
// `f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314`). All
// three sha256 values re-verified directly against this exact commit's
// checked-in bytes, 2026-09-18.
//
// RED-by-design: `src/core/rivalResearch.ts` does not exist yet.
// `admitRivalPlans` is the import from that new module and is CALLED below,
// so this file fails at module resolution before any test body runs.
//
// INTERPRETATIONS NAMED:
//   1. `SaveFileV27`/`migrateToV27`/`validateSaveV27`/`projectHollywoodPreV27`
//      are accessed through a NAMESPACE import (`import * as save from
//      '../src/core/save.js'`), exactly as tests/p13b-s6-save-v26.test.ts did
//      for `migrateToV26` at its own time of writing — a namespace import
//      never fails resolution on a missing member; this file's sole
//      resolution failure is `rivalResearch.js` (above), which aborts the
//      whole file before any test body runs.
//   2. VALIDATOR-REFUSAL forging technique: this file lifts a GENUINE,
//      lawfully-reached V26 state to V27 (`withV27.migrateToV27`), then
//      HAND-CONSTRUCTS the rival-research facts directly on the parsed
//      `GameState` for the refused cases, mirroring
//      tests/p13b-s6-save-v26.test.ts's own `s6ForgeV26` technique exactly
//      (renamed `s8ForgeV27` below).
//   3. "cash/reserve" and admission-quote figures used for the LOSSLESS case
//      are the real, exported `TUNING.RESEARCH_LABORATORY_CAPEX` and the
//      real `admitRivalPlans` — the ONE call to the new module in this file.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import { rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { TUNING } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import type { GameState } from '../src/core/types.js'
import type { HollywoodState, RivalBusiness } from '../src/core/hollywoodTypes.js'
// RED-by-design: src/core/rivalResearch.ts does not exist yet. This is the
// ONE import from that new module in this file.
import { admitRivalPlans } from '../src/core/rivalResearch.js'

/** A natural, unforged campaign whose rivals genuinely admit and complete a Laboratory (RIVAL_ARRIVAL_WEEKS rows 1-4 enter at week 0; Lab admission is unconditional and lands week 1; TUNING.RESEARCH_LABORATORY_BUILD_WEEKS=12 completes it week 13) — measured via vite-node probe, 2026-09-18. */
const NATURAL_SEED = 'p13b-s8-save-v27-natural-01'
const NEW_RECEIPT_KINDS = ['laboratoryCommitted', 'laboratoryOperational', 'instrumentOperational', 'researchSeatAssigned', 'researchCompleted']

type SaveModuleWithV27 = typeof save & {
  migrateToV27: (envelope: unknown) => { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
  validateSaveV27: (envelope: unknown) => unknown
}
const withV27 = save as SaveModuleWithV27

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

const V26_FIXTURES = {
  soundMidDeployment: { file: './fixtures/p13b/legacy-v26-sound-mid-deployment-309.json.gz', sha256: '11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72', week: 309 },
  lightingCancelled: { file: './fixtures/p13b/legacy-v26-lighting-cancelled-793.json.gz', sha256: '0b74f4d89d41bd2c596c51e43758b0915bd8daec8cde05476e9aabe954592ce3', week: 793 },
  lightingRestored: { file: './fixtures/p13b/legacy-v26-lighting-restored-795.json.gz', sha256: 'f48da034f2bd64c35b23361ab12726b2ba0a8f02a7d8dc59caa84055f92f5314', week: 795 },
}

/** Re-wraps a MUTATED GameState back into a V27 envelope and round-trips it through the real codec, mirroring tests/p13b-s6-save-v26.test.ts's own `s6ForgeV26`. */
function s8ForgeV27(genuineV26State: GameState, mutate: (state: GameState) => GameState) {
  const v26Envelope = { saveVersion: 26 as const, seed: genuineV26State.seed, state: genuineV26State, broadcastCache: genuineV26State.broadcastItems }
  const lifted = withV27.migrateToV27(v26Envelope as unknown as Parameters<typeof withV27.migrateToV27>[0])
  const mutated = mutate(lifted.state)
  const envelope = { saveVersion: 27 as const, seed: lifted.seed, state: mutated, broadcastCache: lifted.broadcastCache }
  const json = save.exportSave(envelope as unknown as Parameters<typeof save.exportSave>[0])
  return save.importSave(json)
}

function bellwether(state: GameState): { hollywood: HollywoodState; business: RivalBusiness } {
  const hollywood = state.hollywood!
  const identity = hollywood.identities.find(s => s.row === 1)!
  const business = hollywood.businesses.find(b => b.studioId === identity.studioId)!
  return { hollywood, business }
}

describe('P13B-S8 Save V27: genuine V26 fixtures, honest lift, conditional downgrade, validator refusals, sentinel 28 (test 7)', () => {
  it('genuine V26 sound-mid-deployment fixture: sha256 matches, migrates to V27 with the four new RivalMoneyKind movement keys at 0 on every period and NO new receipts, otherwise byte-identical', () => {
    const json = load(V26_FIXTURES.soundMidDeployment.file)
    assertSha256(json, V26_FIXTURES.soundMidDeployment.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.saveVersion).toBe(26)
    expect(parsed.state.market.tick).toBe(V26_FIXTURES.soundMidDeployment.week)

    const beforeHollywood = JSON.stringify((save.validateSave(parsed as never).state as GameState).hollywood)
    const migrated = withV27.migrateToV27(parsed)
    expect(migrated.saveVersion).toBe(27)
    const hollywood = migrated.state.hollywood as unknown as HollywoodState
    for (const business of hollywood.businesses) {
      for (const period of business.account.periods) {
        const m = period.movements as unknown as Record<string, number>
        expect(m.researchSpend).toBe(0)
        expect(m.researchCapacity).toBe(0)
        expect(m.technologyRestoration).toBe(0)
        expect(m.technologyRefund).toBe(0)
      }
    }
    expect(hollywood.receipts.some(r => ['laboratoryCommitted', 'laboratoryOperational', 'instrumentOperational', 'researchSeatAssigned', 'researchCompleted'].includes(r.kind))).toBe(false)
    // Strip the four new keys from every period and compare the whole root byte-for-byte.
    const stripped = JSON.stringify({
      ...hollywood,
      businesses: hollywood.businesses.map(b => ({
        ...b,
        account: {
          ...b.account,
          periods: b.account.periods.map(p => {
            const { researchSpend: _rs, researchCapacity: _rc, technologyRestoration: _tr, technologyRefund: _tf, ...rest } = p.movements as unknown as Record<string, number>
            return { ...p, movements: rest }
          }),
        },
      })),
    })
    expect(stripped).toBe(beforeHollywood)
  })

  it('genuine V26 lighting-cancelled and lighting-restored fixtures: sha256 matches, migrate to V27 honestly (four zero keys, no new receipts)', () => {
    for (const fixture of [V26_FIXTURES.lightingCancelled, V26_FIXTURES.lightingRestored]) {
      const json = load(fixture.file)
      assertSha256(json, fixture.sha256)
      const parsed = JSON.parse(json) as { saveVersion: number }
      expect(parsed.saveVersion).toBe(26)
      const migrated = withV27.migrateToV27(parsed)
      expect(migrated.saveVersion).toBe(27)
      const hollywood = migrated.state.hollywood as unknown as HollywoodState
      expect(hollywood.businesses.every(b => b.account.periods.every(p => {
        const m = p.movements as unknown as Record<string, number>
        return m.researchSpend === 0 && m.researchCapacity === 0 && m.technologyRestoration === 0 && m.technologyRefund === 0
      }))).toBe(true)
    }
  })

  // AMENDED (coordinator, plan authority, 2026-09-18): `exportSave`/`importSave`
  // dispatch on the ENVELOPE's OWN declared version and never attempt a
  // downgrade — routing a V27 envelope through them (as `s8ForgeV27` did)
  // only ever validates it AS V27, so the three cases below now call
  // `save.migrateToV26(v27Envelope)` DIRECTLY, the one function that
  // actually implements the V27->V26 downgrade law (`convertV27ToV26`,
  // reached because `save.ts`'s `migrateToV26` switches on
  // `save.saveVersion === 27`).
  it('downgrade LOSSLESS: a freshly-lifted V27 state (genuine V26 fixture, every new key still zero) downgrades through save.migrateToV26 directly, byte-identical to the source', () => {
    const json = load(V26_FIXTURES.soundMidDeployment.file)
    const parsed = JSON.parse(json) as { saveVersion: number }
    const beforeHollywood = JSON.stringify((save.validateSave(parsed as never).state as GameState).hollywood)
    const lifted = withV27.migrateToV27(parsed)
    const downgraded = save.migrateToV26(lifted as never)
    expect(downgraded.saveVersion).toBe(26)
    expect(JSON.stringify((downgraded.state as GameState).hollywood)).toBe(beforeHollywood)
  })

  it('downgrade REFUSED: a NATURAL campaign whose rival genuinely admitted a Laboratory carries a nonzero researchCapacity movement, and save.migrateToV26 refuses it', () => {
    const natural = advanceTo(p13aGeneratedStudio(NATURAL_SEED), 20)
    const { business } = bellwether(natural)
    const totalResearchCapacity = natural.hollywood!.businesses.find(b => b.studioId === business.studioId)!
      .account.periods.reduce((sum, p) => sum + p.movements.researchCapacity, 0)
    expect(totalResearchCapacity).not.toBe(0) // the fact this refusal depends on is genuinely nonzero, not forged
    const envelope = save.makeSave(natural) // LIVE_SAVE_VERSION is 28 (P14A.1) — a real, validated SaveFileV28
    expect(envelope.saveVersion).toBe(36)
    expect(() => save.migrateToV26(envelope as never)).toThrow(/cannot downgrade/i)
  })

  it('downgrade REFUSED: the same natural campaign also carries a new receipt kind (laboratoryCommitted/laboratoryOperational), independently sufficient to refuse V27->V26', () => {
    const natural = advanceTo(p13aGeneratedStudio(NATURAL_SEED), 20)
    expect(natural.hollywood!.receipts.some(r => NEW_RECEIPT_KINDS.includes(r.kind))).toBe(true)
    const envelope = save.makeSave(natural)
    expect(() => save.migrateToV26(envelope as never)).toThrow(/cannot downgrade/i)
  })

  it('VALIDATOR REFUSED: "no rival authority without a receipt" — a rival Laboratory facility with no laboratoryCommitted/laboratoryOperational receipt is refused', () => {
    const json = load(V26_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    expect(() => s8ForgeV27(genuine, state => {
      const hollywood = state.hollywood as unknown as HollywoodState
      const businesses = hollywood.businesses.map((b, i) => i === 0
        ? { ...b, operations: { ...b.operations, facilities: [...b.operations.facilities, { id: `${b.studioId}:lab-forged`, name: 'Research Laboratory', capability: 'laboratory' as const, capacity: 4 }] } }
        : b)
      // No matching laboratoryCommitted/laboratoryOperational receipt written — refused.
      return { ...state, hollywood: { ...hollywood, businesses } as unknown as GameState['hollywood'] }
    })).toThrow()
  })

  it('an unknown saveVersion 37 is refused, naming the handled range "1 through 36 only" (B4 additive reader boundary; stale numbers corrected post-C.2b)', () => {
    const json = load(V26_FIXTURES.soundMidDeployment.file)
    const v27 = withV27.migrateToV27(JSON.parse(json))
    const forged = { ...v27, saveVersion: 37 }
    expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 36 only/)
  })

  it('genuine usage of admitRivalPlans (not just an unused import — the same measured-risk guard tests/p13b-s6-save-v26.test.ts names for cancellationQuote): admitting a well-funded rival Laboratory books a real, nonzero researchCapacity movement — the same fact the natural-campaign downgrade-refused cases above observe emerging on their own', () => {
    const json = load(V26_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    const { business } = bellwether(genuine)
    const week = genuine.market.tick
    const requiredReserve = rivalWeeklyOperatingCost(business, genuine.hollywood!, week) * business.policy.reserveWeeks
    expect(TUNING.RESEARCH_LABORATORY_CAPEX + requiredReserve).toBeGreaterThan(0)
    const result = admitRivalPlans(genuine) // the ONE call to the new module — proves the import is not a dead specifier
    expect(result).toBeDefined()
  })
})
