// ── P14B.1 test 8: Save V29 — genuine V28 fixture lift, empty new tables, same
// digests, byte-stable round trip, downgrade refused ─────────────────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, "## P14B.1 — First Kept Promise
// Core — task expansion", Scope — engine (10): "Save V29: `convertV28ToV29`
// adds `firstTakes: []`, `promises: []` and `promises: []` on every stored
// proposal; the frozen V≤28 chain is untouched; every B.1 row dated ≥ the
// recording boundary; the V28 downgrade guard as before." Tests item 8: "8
// save: a genuine V28 fixture converts to V29 with empty new tables and the
// same digests; a V29 save round-trips byte-stable; the frozen V≤28 chain's
// tests unchanged; downgrade refused."
//
// RED-FIRST: `src/core/promises.ts` does not exist yet. `firstTakeReceipts`
// is imported from it and CALLED below, so this file fails at module
// resolution before any test body runs (one TS2307, nothing else).
//
// GENUINE V28 FIXTURE (tests/fixtures/p13b/PROVENANCE.md, "V28 (P14A.1 final
// writer, minted at dee8fc1)"): `legacy-v28-open-case-45.json.gz` (week 45,
// sha256 `c9ff26fe70b7216784bf5718ed26d2bef10df8ca836b05050f5e1d7bcaac8afd`) —
// a LIVE, non-terminal case with 2 CURRENT proposals, both `representation:
// null`, so the per-proposal `promises: []` addition has two real rows to
// land on, not zero.
//
// INTERPRETATIONS NAMED:
//   1. `migrateToV29`/`validateSaveV29`/`SaveFileV29` are accessed through a
//      type-WIDENING cast on the `save` namespace import, exactly as
//      tests/p14a1-save-v28.test.ts did for `migrateToV28`/`validateSaveV28`
//      — this widening never fails resolution on a missing member; this
//      file's sole resolution failure is `promises.js` (above). `save.js`
//      itself DOES resolve (it is a real, existing module), so a bare
//      `save.migrateToV29(...)` reference — without the widening cast —
//      would be a genuine, SEPARATE typecheck error ("property does not
//      exist"); the cast is there specifically to keep this file's
//      typecheck output to the one intended TS2307.
//   2. "The same digests": migration is read as a PURE ADDITIVE lift — a
//      migrated V28 proposal's existing `digest` field (computed under the
//      OLD five-tuple `(talentId, issuerStudioId, termWeeks, startWeek,
//      premiumTier)`) is carried UNCHANGED; the widened six-tuple digest
//      formula (companion §2.1.4 line 70, plan item (3)) is read as applying
//      only to proposals submitted or redrawn AFTER B.1 lands, never
//      retroactively recomputed at migration. This is the more defensible
//      reading of R22's "no fabricated pre-P14 relationships... decisions"
//      rule (§8 item 5) applied by analogy (mirroring
//      tests/p14a1-save-v28.test.ts's own R4 premise note), not settled law.
//   3. `firstTakeReceipts(state)` reads the whole root array (`state.
//      firstTakes`), mirroring how `state.talentMarket.receipts` is read
//      directly elsewhere in this suite — only "an empty array on a fresh
//      lift" is asserted, not its exact element shape (covered by
//      tests/p14b1-first-take.test.ts).
//
// PREMISES NOT SATISFIED:
//   - "The frozen V≤28 chain's tests unchanged" is not independently
//     exercised here (that is the natural-chain regression sweep at T4, per
//     the plan's own T1 targeted-verification convention); this file only
//     confirms the ONE genuine V28 fixture used above still validates as V28
//     through the frozen `validateSave` entry point before being lifted.
//   - The exact validator error-message wording for a refused downgrade is
//     not pinned beyond a case-insensitive substring match on "cannot
//     downgrade", mirroring every earlier save-boundary file in this suite.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import type { GameState, GameStateV29 } from '../src/core/types.js'
// RED-by-design: src/core/promises.ts does not exist. firstTakeReceipts is
// CALLED below (it is the smallest useful import for this file's assertions:
// the empty-new-table check ties directly to the first-take root).
import { firstTakeReceipts } from '../src/core/promises.js'

type Envelope = { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
type SaveModuleWithV29 = typeof save & {
  migrateToV29: (envelope: unknown) => Envelope
  validateSaveV29: (envelope: unknown) => unknown
}
const withV29 = save as SaveModuleWithV29

const FIXTURE = {
  file: './fixtures/p14/legacy-v28-open-case-45.json.gz',
  sha256: 'c9ff26fe70b7216784bf5718ed26d2bef10df8ca836b05050f5e1d7bcaac8afd',
  week: 45,
}

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

type MarketRootWithPromises = {
  cases: unknown[]
  proposals: readonly { digest: string; promises?: readonly string[] }[]
  receipts: unknown[]
  firstTakes?: readonly unknown[]
  promises?: readonly unknown[]
}
// 662-T2 (P14B.5): the live GameState is V31; these readers also take the V29 state this boundary file lifts to.
function marketOf(state: GameState | GameStateV29): MarketRootWithPromises {
  return (state as unknown as { talentMarket: MarketRootWithPromises }).talentMarket
}
function firstTakesOf(state: GameState | GameStateV29): readonly unknown[] {
  return (state as unknown as { firstTakes: readonly unknown[] }).firstTakes
}
function promisesRootOf(state: GameState | GameStateV29): readonly unknown[] {
  return (state as unknown as { promises: readonly unknown[] }).promises
}

describe('P14B.1 test 8: Save V29 (genuine V28 fixture, empty new tables, same digests, round trip, downgrade)', () => {
  it('LIVE_SAVE_VERSION is 33 (stale title corrected post-C.1; the P14B.5 cutover, record 662, made it 31 at the time — the V29 lift this slice pins is the intermediate step)', () => {
    expect(save.LIVE_SAVE_VERSION as number).toBe(33)
  })

  it('genuine V28 open-case-45 fixture: sha256 matches, still validates as V28 through the frozen chain, migrates to V29 with EMPTY firstTakes and promises roots and promises: [] on every existing proposal, otherwise byte-identical', () => {
    const json = load(FIXTURE.file)
    assertSha256(json, FIXTURE.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.saveVersion).toBe(28)
    expect(parsed.state.market.tick).toBe(FIXTURE.week)

    const beforeState = save.validateSave(parsed as never).state as GameState
    const beforeMarket = marketOf(beforeState)
    expect(beforeMarket.proposals.length).toBe(2) // the genuine open-case-45 fixture carries 2 current proposals (PROVENANCE)

    const migrated = withV29.migrateToV29(parsed)
    expect(migrated.saveVersion).toBe(29)
    expect(firstTakeReceipts(migrated.state)).toEqual([])
    expect(firstTakesOf(migrated.state)).toEqual([])
    expect(promisesRootOf(migrated.state)).toEqual([])

    const afterMarket = marketOf(migrated.state)
    expect(afterMarket.proposals.length).toBe(beforeMarket.proposals.length)
    afterMarket.proposals.forEach((p, i) => {
      expect(p.promises).toEqual([]) // migration adds the empty per-proposal field
      expect(p.digest).toBe(beforeMarket.proposals[i]!.digest) // migration never recomputes the digest
    })

    // Strip the two new roots and compare everything else byte-for-byte, exactly
    // as tests/p14a1-save-v28.test.ts does for the V27->V28 lift.
    const { talentMarket: _tm, firstTakes: _ft, promises: _pr, ...afterRest } =
      migrated.state as unknown as { talentMarket: unknown; firstTakes: unknown; promises: unknown } & Record<string, unknown>
    const { talentMarket: _tm2, ...beforeRest } = beforeState as unknown as { talentMarket: unknown } & Record<string, unknown>
    // The proposals array differs only by the added `promises: []` field per
    // row; strip it from both sides' talentMarket before the final compare.
    const stripPromises = (m: MarketRootWithPromises) => ({
      ...m,
      proposals: m.proposals.map(({ promises: _p, ...rest }) => rest),
    })
    expect(JSON.stringify({ ...afterRest, talentMarket: stripPromises(afterMarket) })).toBe(
      JSON.stringify({ ...beforeRest, talentMarket: stripPromises(beforeMarket) }),
    )
  })

  it('a fresh V29 lift round-trips byte-stable through validateSaveV29 -> JSON -> validateSaveV29', () => {
    const json = load(FIXTURE.file)
    const migrated = withV29.migrateToV29(JSON.parse(json))
    const reserialized = JSON.parse(JSON.stringify(migrated)) as Envelope
    const revalidated = withV29.validateSaveV29(reserialized) as Envelope
    expect(JSON.stringify(revalidated.state)).toBe(JSON.stringify(migrated.state))
  })

  it('downgrade REFUSED: a talentMarket carrying any firstTakes or per-proposal promises row refuses V29->V28', () => {
    const json = load(FIXTURE.file)
    const lifted = withV29.migrateToV29(JSON.parse(json))

    const forgedFirstTake = {
      ...lifted,
      state: { ...lifted.state, firstTakes: [{ eventId: 'forged', week: 45, productionId: 'forged', studioId: 'forged', directorId: 'forged', cast: { lead: 'forged', antagonist: 'forged', support: ['forged'] } }] },
    }
    expect(() => save.migrateToV28(forgedFirstTake as never)).toThrow(/cannot downgrade/i)

    const forgedPromiseRoot = { ...lifted, state: { ...lifted.state, promises: [{ promiseId: 'forged' }] } }
    expect(() => save.migrateToV28(forgedPromiseRoot as never)).toThrow(/cannot downgrade/i)

    const market = marketOf(lifted.state)
    const forgedProposalPromise = {
      ...lifted,
      state: {
        ...lifted.state,
        talentMarket: { ...market, proposals: market.proposals.map((p, i) => (i === 0 ? { ...p, promises: ['forged'] } : p)) },
      },
    }
    expect(() => save.migrateToV28(forgedProposalPromise as never)).toThrow(/cannot downgrade/i)
  })

  it('a fresh V29 lift (nothing forged) downgrades LOSSLESS through save.migrateToV28, byte-identical to the pre-lift V28 state', () => {
    const json = load(FIXTURE.file)
    const beforeState = save.validateSave(JSON.parse(json) as never).state as GameState
    const lifted = withV29.migrateToV29(JSON.parse(json))
    const downgraded = save.migrateToV28(lifted as never)
    expect(downgraded.saveVersion).toBe(28)
    expect(JSON.stringify(downgraded.state as GameState)).toBe(JSON.stringify(beforeState))
  })

  // The B5 additive reader recognizes V31 (the live writer cut over at record 662,
  // LIVE_SAVE_VERSION 31); 31 is the current dispatch ceiling, not a change to
  // frozen V29 fixture law.
  it('an unknown saveVersion 34 is refused, naming the handled range "1 through 33 only" (stale numbers corrected post-C.1)', () => {
    const json = load(FIXTURE.file)
    const lifted = withV29.migrateToV29(JSON.parse(json))
    const forged = { ...lifted, saveVersion: 34 }
    expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 33 only/)
  })
})
