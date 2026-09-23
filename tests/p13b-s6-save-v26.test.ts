// ── P13B-S6 test 7: Save V26 — genuine V25 fixtures + chains, validator
// refusals ────────────────────────────────────────────────────────────────────
//
// Requirement-derived from "S6 — Option-B installation cancellation..." task
// expansion, "Tests" item 7, and the "Delegated implementation decisions"
// bullet: "Save V(next): placement records gain `cancellation:
// CancellationReceipt | null`, adoptions `cancelledWeek: number | null`,
// ledger kind `constructionRefund`; honest lift (null / none); genuine
// fixtures of the prior version minted at its final writer before any S6
// change." Plus the binding "Audit refinements" (adopted at f70221f):
// `PlacementStatus` gains `'cancelled'`; a cancelled adoption
// (`cancelledWeek !== null`) keeps its `physicalProjectIds` and component rows
// as history, is EXEMPT from the v4 clause "operational receipt differs from
// exact physical completion", never becomes operational, and
// `finishTechnologyWeek` skips it — "test 7's validator cases must include: a
// cancelled adoption with a passed original completesWeek is VALID; a
// cancelled placement marked operational is refused."
//
// GENUINE V25 FIXTURES (tests/fixtures/p13b/PROVENANCE.md; minted 2026-09-17
// at the final V25 writer `050fc67`, BEFORE any S6 source change — record
// "S6-T0"): `legacy-v25-sound-mid-deployment-309.json.gz` (sha256
// `7de40f1acdb2824c5a6cf68b749b8290d553ded1780c08b3d91e2e8ab4ce1ccd`) and
// `legacy-v25-lighting-mid-deployment-793.json.gz` (sha256
// `eee66ad715e04a7945746b6cf6f1142d3427f6d669dcac54a9250ef02aa8ae02`). Both
// sha256 values re-verified directly against this exact commit's checked-in
// bytes, 2026-09-17.
//
// RED-by-design: see tests/p13b-s6-receipts.test.ts's header for the full
// statement of the process rule this file follows.
//
// INTERPRETATIONS NAMED:
//   1. `SaveFileV26`/`migrateToV26`/`convertV25ToV26` are accessed through a
//      NAMESPACE import (`import * as save from '../src/core/save.js'`),
//      exactly as `tests/p13b-r07-save-v25.test.ts` did for the not-yet-
//      existing `migrateToV25` at ITS OWN time of writing (V25 has since
//      landed in this tree; V26 has not — this file is in the identical
//      position V25's own test-author file was in). A namespace import never
//      fails resolution on a missing member; this file's sole resolution
//      failure is `installationCancellation.js` (below), which aborts the
//      whole file before any test body runs.
//   2. VALIDATOR-REFUSAL forging technique: this file lifts a GENUINE,
//      lawfully-reached V25 state to V26 (`withV26.migrateToV26`, over an
//      honest V25 envelope reconstructed from the loaded `GameState` — see
//      `s6ForgeV26`), then HAND-CONSTRUCTS the cancellation facts directly on
//      the parsed `GameState` (never on raw JSON text) for the five REFUSED
//      cases — the SAME technique `tests/p13b-r07-save-v25.test.ts` used for
//      its own "mid-setup save/reload" case ("hand-authored... no genuine
//      producer exists yet"). Every hand-authored case is captioned with
//      exactly which single fact it violates. The one VALID case is instead
//      realized with the REAL `cancelInstallation` action followed by a real
//      `advanceTo`: this fixture's own Post fit-out has ALREADY genuinely
//      completed by week 309 (the fixture's own native week), so a
//      hand-forged "everything unstarted, refund in full" receipt for it
//      would contradict the genuine `facilityOpex` history the engine itself
//      already wrote for weeks it was truly operational — a real cancel
//      (against the still-`underConstruction` stage only, exactly as a real
//      `cancelAdoption` would leave an already-complete Post alone) is both
//      simpler and the only lawful way to reach this case.
//   3. The forged CancellationReceipt numbers are deliberately the MINIMAL
//      self-consistent case (cancelled in the SAME week as commit, before any
//      component began: paid $0, refund = full cost, no restoration needed)
//      so each negative case isolates exactly ONE violated fact rather than
//      also depending on this file's own restoration bookkeeping being right.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as save from '../src/core/save.js'
import type { CancellationReceipt, GameState } from '../src/core/types.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
// RED-by-design: src/core/installationCancellation.ts does not exist yet.
// The ONLY import from the new module — everything else above is a real,
// existing module (namespace-imported where the member itself is new, per
// INTERPRETATION 1).
import { cancellationQuote } from '../src/core/installationCancellation.js'

type SaveModuleWithV26 = typeof save & {
  migrateToV26: (envelope: unknown) => { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
}
const withV26 = save as SaveModuleWithV26

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

const V25_FIXTURES = {
  soundMidDeployment: {
    file: './fixtures/p13b/legacy-v25-sound-mid-deployment-309.json.gz',
    sha256: '7de40f1acdb2824c5a6cf68b749b8290d553ded1780c08b3d91e2e8ab4ce1ccd',
    week: 309,
  },
  lightingMidDeployment: {
    file: './fixtures/p13b/legacy-v25-lighting-mid-deployment-793.json.gz',
    sha256: 'eee66ad715e04a7945746b6cf6f1142d3427f6d669dcac54a9250ef02aa8ae02',
    week: 793,
  },
}

/**
 * Re-wraps a MUTATED `GameState` back into a V26 envelope and round-trips it
 * through the real codec (`exportSave`/`importSave`) — see header
 * INTERPRETATION 2. Returns the reimported envelope; throws whatever
 * `importSave`/`validateSave` throws for an invalid mutation.
 *
 * `genuineV25State` is lifted through `migrateToV26` from an honest V25
 * envelope BEFORE anything is mutated — `save.makeSave` stamps and validates
 * at the LIVE version (26), which a V25-shaped state (no `cancellation` /
 * `cancelledWeek` leaves yet) always fails; the lift is what the real V25→V26
 * migration path does for every genuine save, so this reaches the V26 law
 * the VALID case is testing rather than refusing before `mutate` ever runs.
 */
function s6ForgeV26(genuineV25State: GameState, mutate: (state: GameState) => GameState) {
  const v25Envelope = { saveVersion: 25 as const, seed: genuineV25State.seed, state: genuineV25State, broadcastCache: genuineV25State.broadcastItems }
  const lifted = withV26.migrateToV26(v25Envelope as unknown as Parameters<typeof withV26.migrateToV26>[0])
  const mutated = mutate(lifted.state)
  const envelope = { saveVersion: 26 as const, seed: lifted.seed, state: mutated, broadcastCache: lifted.broadcastCache }
  const json = save.exportSave(envelope as unknown as Parameters<typeof save.exportSave>[0])
  return save.importSave(json)
}

/**
 * P13B-S8 (26 -> 27), P14A.1 (27 -> 28), P14B.1 (28 -> 29): the same forge for a case
 * whose mutation RUNS THE LIVE ENGINE. A live advance writes at the live save
 * version, so the state is lifted through the governed V25→…→V29 chain first and
 * the envelope is stamped at the live version. Nothing about the S6 law under test moves: the V26 leaves and
 * their refusals are validated by the same owners through the live chain.
 */
function s6ForgeLive(genuineV25State: GameState, mutate: (state: GameState) => GameState) {
  const v25Envelope = { saveVersion: 25 as const, seed: genuineV25State.seed, state: genuineV25State, broadcastCache: genuineV25State.broadcastItems }
  const lifted = (save as unknown as { migrateToV32: (envelope: unknown) => { seed: string; state: GameState; broadcastCache: unknown } }).migrateToV32(v25Envelope)
  const mutated = mutate(lifted.state)
  const envelope = { saveVersion: save.LIVE_SAVE_VERSION, seed: lifted.seed, state: mutated, broadcastCache: lifted.broadcastCache }
  const json = save.exportSave(envelope as unknown as Parameters<typeof save.exportSave>[0])
  return save.importSave(json)
}

describe('P13B-S6 Save V26: genuine V25 fixtures, honest lift, chains, validator refusals (test 7)', () => {
  it('genuine V25 sound-mid-deployment fixture: sha256 matches, migrates to V26 with cancellation:null / cancelledWeek:null and no constructionRefund rows, otherwise byte-identical', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    assertSha256(json, V25_FIXTURES.soundMidDeployment.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.saveVersion).toBe(25)
    expect(parsed.state.market.tick).toBe(V25_FIXTURES.soundMidDeployment.week)

    const beforeTechnology = JSON.stringify((save.validateSave(parsed as never).state as GameState).technology)
    const beforePlacement = JSON.stringify((save.validateSave(parsed as never).state as GameState).placement)
    const migrated = withV26.migrateToV26(parsed)
    expect(migrated.saveVersion).toBe(26)
    // Everything else in `technology` is unchanged: strip the new leaf from
    // every adoption (the whole root, not a bare array) and compare — the
    // raw comparison would always fail since the migrated adoptions now
    // carry a `cancelledWeek` leaf the pre-migration technology JSON never had.
    const strippedTechnology = JSON.stringify({
      ...migrated.state.technology,
      adoptions: migrated.state.technology.adoptions.map(({ ...a }) => {
        delete (a as { cancelledWeek?: unknown }).cancelledWeek
        return a
      }),
    })
    expect(strippedTechnology).toBe(beforeTechnology) // no field renamed/reshaped besides the new null leaf
    for (const adoption of migrated.state.technology.adoptions) {
      expect((adoption as unknown as { cancelledWeek: number | null }).cancelledWeek).toBeNull()
    }
    for (const placement of migrated.state.placement.facilities) {
      expect((placement as unknown as { cancellation: CancellationReceipt | null }).cancellation).toBeNull()
    }
    expect(migrated.state.ledger.some(e => e.kind === 'constructionRefund')).toBe(false)
    // Everything else in `placement` is unchanged: strip the new key from
    // every facility, on the WHOLE root (not just the bare facilities array
    // `beforePlacement` never was), and compare.
    const strippedAfter = JSON.stringify({
      ...migrated.state.placement,
      facilities: migrated.state.placement.facilities.map(({ ...f }) => {
        delete (f as { cancellation?: unknown }).cancellation
        return f
      }),
    })
    expect(strippedAfter).toBe(beforePlacement)

    // Genuine usage of `cancellationQuote` (not just an unused import — an
    // unused named import from a not-yet-existing module risks esbuild
    // eliding the import specifier entirely at transform time, which would
    // mask this file's intended single RED cause; MEASURED against this exact
    // file, 2026-09-17, before this call was added: the file loaded and ran
    // with 6 passed / 5 failed instead of failing at module resolution).
    // Still-`underConstruction` at week 309, so the live stage project is
    // genuinely cancellable.
    const liveState = save.validateSave(parsed as never).state as GameState
    const stageProjectId = liveState.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-stage')!.projectId
    expect(cancellationQuote(liveState, { projectId: stageProjectId }).ok).toBe(true)
  })

  it('genuine V25 lighting-mid-deployment fixture: sha256 matches, migrates to V26 honestly (cancellation:null / cancelledWeek:null)', () => {
    const json = load(V25_FIXTURES.lightingMidDeployment.file)
    assertSha256(json, V25_FIXTURES.lightingMidDeployment.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number }
    expect(parsed.saveVersion).toBe(25)
    const migrated = withV26.migrateToV26(parsed)
    expect(migrated.saveVersion).toBe(26)
    for (const adoption of migrated.state.technology.adoptions) {
      expect((adoption as unknown as { cancelledWeek: number | null }).cancelledWeek).toBeNull()
    }
    expect(migrated.state.placement.facilities.every(f =>
      (f as unknown as { cancellation: CancellationReceipt | null }).cancellation === null)).toBe(true)
  })

  it('migrateToV25 / migrateToV24 / migrateToV23 / migrateToV22 / migrateToV21 / migrateToV20 all refuse a V26 save (downgrade chain)', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const v26 = withV26.migrateToV26(JSON.parse(json))
    expect(() => save.migrateToV25(v26 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV24(v26 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV23(v26 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV22(v26 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV21(v26 as never)).toThrow(/cannot downgrade/i)
    expect(() => save.migrateToV20(v26 as never)).toThrow(/cannot downgrade/i)
  })

  it('an unknown saveVersion 33 is refused, naming the handled range "1 through 32 only" (B4 additive reader boundary)', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const v26 = withV26.migrateToV26(JSON.parse(json))
    const forged = { ...v26, saveVersion: 33 }
    expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 32 only/)
  })

  it('VALID: a cancelled adoption with a passed original completesWeek is exempt from the v4 "operational receipt differs" clause', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    const reimported = s6ForgeLive(genuine, state => {
      // REAL cancellation, not a hand-forged receipt (header INTERPRETATION
      // 2): the stage is still genuinely `underConstruction` at week 309
      // (site work 6 of 9 weeks in), so `cancelInstallation` produces its own
      // lawful receipt, refund row, restoration job, adoption `cancelledWeek`
      // stamp and equipment release — every fact the REFUSED cases below
      // hand-forge, for free and genuinely reconciled with the ledger. The
      // Post fit-out — already operational by week 309 in this fixture — is
      // untouched, exactly as a real `cancelAdoption` would leave it:
      // cancelled history standing next to a completed sibling.
      const stageProjectId = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-stage')!.projectId
      const cancelled = applyActions(state, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
      // Real ticks, not a forged `market.tick` jump: a bare number bump would
      // skip the `researchPayroll` ledger rows the studio's continuing
      // Scientist employment owes for every one of those weeks
      // (`technology.ts`'s "missing research payroll for historical Scientist
      // employment"). Advancing through the real engine pays that honestly
      // and carries the stage's own completesWeek (315) past `market.tick` —
      // the "passed original completesWeek" the caption requires — while the
      // cancelled record itself stays permanently out of the completion
      // clock's reach (already proven by tests/p13b-s6-ordering.test.ts case 3).
      return advanceTo(cancelled, 320)
    })
    expect((reimported as { saveVersion: number }).saveVersion).toBe(32) // did NOT throw (at the live version this real advance writes)
  })

  it('REFUSED: a cancelled placement marked operational', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    expect(() => s6ForgeV26(genuine, state => {
      const stagePlacement = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-stage')!
      const receipt: CancellationReceipt = {
        projectId: stagePlacement.projectId, week: 303, refund: 675_000, restorationProjectId: null,
        components: [{ label: 'Stage site adaptation', cost: 450_000, weeks: 9, status: 'unstarted', paid: 0, refunded: 450_000 }],
      }
      return {
        ...state,
        placement: {
          ...state.placement,
          // Contradiction: `status: 'operational'` on a placement that ALSO
          // carries a cancellation receipt. "never becomes operational."
          facilities: state.placement.facilities.map(f =>
            f.id === stagePlacement.id ? { ...f, status: 'operational' as const, cancellation: receipt } : f),
        },
      }
    })).toThrow()
  })

  it('REFUSED: restoration present when no site work ever began (contradicts "restoration project present iff site work began")', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    expect(() => s6ForgeV26(genuine, state => {
      const postPlacement = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-post')!
      // The Post fit-out authors NO `site`-kind component at all — a
      // restorationProjectId here is never lawful, regardless of progress.
      const receipt: CancellationReceipt = {
        projectId: postPlacement.projectId, week: 303, refund: 300_000, restorationProjectId: 'installation-restoration-sound-stage-forged',
        components: [{ label: 'Sound-capable Post fit-out', cost: 300_000, weeks: 6, status: 'unstarted', paid: 0, refunded: 300_000 }],
      }
      return {
        ...state,
        placement: {
          ...state.placement,
          facilities: state.placement.facilities.map(f =>
            f.id === postPlacement.id ? { ...f, status: 'cancelled' as const, cancellation: receipt } : f),
        },
      }
    })).toThrow()
  })

  it('REFUSED: receipt component sums do not reconcile (Σpaid + Σrefunded ≠ cost)', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    expect(() => s6ForgeV26(genuine, state => {
      const postPlacement = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-post')!
      const receipt: CancellationReceipt = {
        projectId: postPlacement.projectId, week: 303, refund: 300_000, restorationProjectId: null,
        // 0 + 299,999 !== 300,000 — off by one dollar.
        components: [{ label: 'Sound-capable Post fit-out', cost: 300_000, weeks: 6, status: 'unstarted', paid: 0, refunded: 299_999 }],
      }
      return {
        ...state,
        placement: {
          ...state.placement,
          facilities: state.placement.facilities.map(f =>
            f.id === postPlacement.id ? { ...f, status: 'cancelled' as const, cancellation: receipt } : f),
        },
      }
    })).toThrow()
  })

  it('REFUSED: a negative component figure', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    expect(() => s6ForgeV26(genuine, state => {
      const postPlacement = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-post')!
      const receipt: CancellationReceipt = {
        projectId: postPlacement.projectId, week: 303, refund: 300_000, restorationProjectId: null,
        components: [{ label: 'Sound-capable Post fit-out', cost: 300_000, weeks: 6, status: 'unstarted', paid: -1, refunded: 300_001 }],
      }
      return {
        ...state,
        placement: {
          ...state.placement,
          facilities: state.placement.facilities.map(f =>
            f.id === postPlacement.id ? { ...f, status: 'cancelled' as const, cancellation: receipt } : f),
        },
      }
    })).toThrow()
  })

  it('REFUSED: the refund ledger row is written twice for one project ("once-only" reconciliation)', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    expect(() => s6ForgeV26(genuine, state => {
      const postPlacement = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-post')!
      const receipt: CancellationReceipt = {
        projectId: postPlacement.projectId, week: 303, refund: 300_000, restorationProjectId: null,
        components: [{ label: 'Sound-capable Post fit-out', cost: 300_000, weeks: 6, status: 'unstarted', paid: 0, refunded: 300_000 }],
      }
      return {
        ...state,
        placement: {
          ...state.placement,
          facilities: state.placement.facilities.map(f =>
            f.id === postPlacement.id ? { ...f, status: 'cancelled' as const, cancellation: receipt } : f),
        },
        // TWO constructionRefund rows for the SAME project — refused.
        ledger: [
          ...state.ledger,
          { week: 303, kind: 'constructionRefund', amount: 300_000, constructionProjectId: postPlacement.projectId, note: 'cancellation refund' },
          { week: 303, kind: 'constructionRefund', amount: 300_000, constructionProjectId: postPlacement.projectId, note: 'cancellation refund (duplicate)' },
        ] as unknown as GameState['ledger'],
      }
    })).toThrow()
  })

  it('REFUSED: the equipment asset stays held while its adoption is cancelled ("asset unheld iff its adoption is cancelled")', () => {
    const json = load(V25_FIXTURES.soundMidDeployment.file)
    const genuine = (save.validateSave(JSON.parse(json) as never).state as GameState)
    expect(() => s6ForgeV26(genuine, state => {
      const stagePlacement = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-stage')!
      const postPlacement = state.placement.facilities.find(f => f.blueprintId === 'synchronized-sound-post')!
      const adoption = state.technology.adoptions.find(a => a.technologyId === 'synchronized-sound')!
      const stageReceipt: CancellationReceipt = {
        projectId: stagePlacement.projectId, week: 303, refund: 675_000, restorationProjectId: null,
        components: [
          { label: 'Stage site adaptation', cost: 450_000, weeks: 9, status: 'unstarted', paid: 0, refunded: 450_000 },
          { label: 'Equipment installation', cost: 150_000, weeks: 3, status: 'unstarted', paid: 0, refunded: 150_000 },
          { label: 'Compatible capture package (with equipment)', cost: 75_000, weeks: 0, status: 'unstarted', paid: 0, refunded: 75_000 },
        ],
      }
      const postReceipt: CancellationReceipt = {
        projectId: postPlacement.projectId, week: 303, refund: 300_000, restorationProjectId: null,
        components: [{ label: 'Sound-capable Post fit-out', cost: 300_000, weeks: 6, status: 'unstarted', paid: 0, refunded: 300_000 }],
      }
      return {
        ...state,
        placement: {
          ...state.placement,
          facilities: state.placement.facilities.map(f =>
            f.id === stagePlacement.id ? { ...f, status: 'cancelled' as const, cancellation: stageReceipt }
            : f.id === postPlacement.id ? { ...f, status: 'cancelled' as const, cancellation: postReceipt }
            : f),
        },
        technology: {
          ...state.technology,
          adoptions: state.technology.adoptions.map(a =>
            a.id === adoption.id ? { ...a, cancelledWeek: 303 } : a),
          // The asset's holderAdoptionId is left UNCHANGED (still held) — refused.
        },
      }
    })).toThrow()
  })
})
