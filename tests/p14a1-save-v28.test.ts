// ── P14A.1 test 8: Save V28 — genuine V27 fixtures, honest lift, conditional
// downgrade refusal, validator refusals (forged authority; representation),
// sentinel 29 ─────────────────────────────────────────────────────────────
//
// Requirement source: P14-HEADLESS-PLAN.md, P14A.1 expansion, Tests item 8:
// "8 Save V28 with genuine V27 fixtures; validator refusals incl. the
// `representation` key required and `null` (R10)." Scope paragraph:
// "Persisted facts: a `talentMarket` root (cases, proposals, receipts) —
// **Save V28**." §2. Post-P13 refresh table: "P14A.1 allocates V28 /
// projection 42 at execution; genuine V27 fixtures are minted at the final
// V27 writer before any P14 source change." Companion §2.1.6: "A proposal
// carries one required key `representation` whose value is pinned to `null`
// under P14 root version 1 and validated as such." R22 (§7.2): "One
// governed inner-save step per accepted wave... roots at top level, never
// inside `hollywood`... receipts stamped with in-state facts only; validator
// enforcement of the recording boundary."
//
// GENUINE V27 FIXTURES (tests/fixtures/p13b/PROVENANCE.md, "V27 fixtures
// (P14A.1-T0, 2026-09-18)", minted at `e0676f9`, final V27 writer `ef9ff76`):
// `legacy-v27-natural-rival-labs-20.json.gz` (week 20, sha256
// `00183e1c8feafab9607bb76c942ace3a1bcdbab6d295af26051dbfe9e1aa4948`), no
// player contract inside its renewal window; `legacy-v27-renewal-window-456.json.gz`
// (week 456, sha256 `af659268eddcc78da0b893056ba97794a3ed0a159488cb3de36e155b3ec1fa3f`),
// carrying exactly ONE player contract inside its renewal window — a
// Scientist (src/harness/p13b/legacy-v27-fixtures.ts: `p13aResearchReady()`
// signs the player's Scientist on a 208-week contract at week 260 via
// `applySignContract`, so its window opens at week 456). THE SCIENTIST'S
// MARKET RULE IS OPEN (plan's own text: "the Scientist's retirement window
// and market rule are OPEN"); this fixture pins the subject as a Scientist
// ONLY because it is the one genuine V27 fixture available with a contract
// already inside its renewal window — it is not asserted that market law
// differs for a Scientist, only that this particular fixture's subject
// happens to be one.
//
// RED-by-design: `src/core/talentMarket.ts` does not exist yet.
// `marketEligibility` is the ONE import from that new module (the same
// interpreted name as tests/p14a1-eligibility.test.ts), and it is CALLED
// below, so this file fails at module resolution before any test body runs.
//
// INTERPRETATIONS NAMED:
//   1. `SaveFileV28`/`migrateToV28`/`validateSaveV28` are accessed through a
//      NAMESPACE import (`import * as save from '../src/core/save.js'`),
//      exactly as tests/p13b-s8-save-v27.test.ts did for `migrateToV27` — a
//      namespace import never fails resolution on a missing member; this
//      file's sole resolution failure is `talentMarket.js` (above).
//   2. The empty V28 `talentMarket` root on a fresh lift is assumed to be
//      `{ cases: [], proposals: [], receipts: [] }` (or equivalent empty
//      arrays under those or similarly-named keys) — only "no cases, no
//      proposals, no receipts exist after a lift" is asserted, not exact key
//      names beyond what the fixture-lift assertions read structurally.
//   3. Following tests/p13b-s8-save-v27.test.ts's AMENDED technique:
//      `exportSave`/`importSave` dispatch on the envelope's OWN declared
//      version and never attempt a downgrade, so the downgrade-refused/
//      lossless cases call `save.migrateToV27(v28Envelope)` DIRECTLY.
//
// PREMISES NOT SATISFIED:
//   - Whether migrating a save whose subject is ALREADY inside its renewal
//     window at the migration week (the renewal-window-456 fixture) should
//     immediately open a `discovered` case, or wait for the next live weekly
//     tick's scan, is NOT settled by the plan with migration-time precision:
//     companion §2.1.3 ties discovery to "the accepted weekly scan... the
//     same O(active roster) pass finishHollywoodWeek and staff() already
//     perform," which is a TICK-time mechanism, not a migration-time one.
//     This file asserts the empty-root reading (migration invents nothing;
//     discovery is a live-tick fact) as the more defensible interpretation
//     of R22's "no fabricated pre-P14 relationships... promises... decisions"
//     rule (§8 item 5) applied by analogy, and names the alternative here so
//     a reviewer can check it against T2's actual choice.
//   - The exact validator error-message wording is not pinned beyond a
//     case-insensitive substring match on "cannot downgrade" (mirroring the
//     S6/S8 template) and a substring match on "representation" for the R10
//     refusal.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
// RED-by-design: src/core/talentMarket.ts does not exist. This is the ONE
// import from that new module in this file.
import { marketEligibility } from '../src/core/talentMarket.js'

type SaveModuleWithV28 = typeof save & {
  migrateToV28: (envelope: unknown) => { saveVersion: number; seed: string; state: GameState; broadcastCache: unknown[] }
  validateSaveV28: (envelope: unknown) => unknown
}
const withV28 = save as SaveModuleWithV28

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

const V27_FIXTURES = {
  naturalRivalLabs: { file: './fixtures/p13b/legacy-v27-natural-rival-labs-20.json.gz', sha256: '00183e1c8feafab9607bb76c942ace3a1bcdbab6d295af26051dbfe9e1aa4948', week: 20 },
  renewalWindow: { file: './fixtures/p13b/legacy-v27-renewal-window-456.json.gz', sha256: 'af659268eddcc78da0b893056ba97794a3ed0a159488cb3de36e155b3ec1fa3f', week: 456 },
}

type TalentMarketRoot = { cases: unknown[]; proposals: unknown[]; receipts: unknown[] }
function marketRootOf(state: GameState): TalentMarketRoot {
  return (state as unknown as { talentMarket: TalentMarketRoot }).talentMarket
}

describe('P14A.1 test 8: Save V28 (genuine V27 fixtures, honest lift, downgrade, validator refusals, sentinel 29)', () => {
  it('genuine V27 natural-rival-labs fixture: sha256 matches, migrates to V28 with an EMPTY talentMarket root and no P14 receipts, otherwise byte-identical', () => {
    const json = load(V27_FIXTURES.naturalRivalLabs.file)
    assertSha256(json, V27_FIXTURES.naturalRivalLabs.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.saveVersion).toBe(27)
    expect(parsed.state.market.tick).toBe(V27_FIXTURES.naturalRivalLabs.week)

    const beforeState = (save.validateSave(parsed as never).state as GameState)
    const migrated = withV28.migrateToV28(parsed)
    expect(migrated.saveVersion).toBe(28)
    const market = marketRootOf(migrated.state)
    expect(market.cases).toEqual([])
    expect(market.proposals).toEqual([])
    expect(market.receipts).toEqual([])
    // Strip the new root and compare everything else byte-for-byte.
    const { talentMarket: _tm, ...afterWithoutMarket } = migrated.state as unknown as { talentMarket: unknown } & Record<string, unknown>
    expect(JSON.stringify(afterWithoutMarket)).toBe(JSON.stringify(beforeState))
  })

  it('genuine V27 renewal-window-456 fixture (a player Scientist already inside its 12-week renewal window): still migrates to V28 with an EMPTY talentMarket root — migration invents no case', () => {
    const json = load(V27_FIXTURES.renewalWindow.file)
    assertSha256(json, V27_FIXTURES.renewalWindow.sha256)
    const parsed = JSON.parse(json) as { saveVersion: number; state: { market: { tick: number } } }
    expect(parsed.state.market.tick).toBe(V27_FIXTURES.renewalWindow.week)
    const migrated = withV28.migrateToV28(parsed)
    const market = marketRootOf(migrated.state)
    expect(market.cases).toEqual([])
    expect(market.proposals).toEqual([])
    expect(market.receipts).toEqual([])
  })

  it('genuine usage of marketEligibility (not a dead import): the renewal-window-456 fixture\'s player Scientist subject classifies as renewal_window on the lifted V28 state', () => {
    const json = load(V27_FIXTURES.renewalWindow.file)
    const parsed = JSON.parse(json) as { saveVersion: number }
    const migrated = withV28.migrateToV28(parsed)
    const state = migrated.state
    const subject = state.talent.find((t) => t.role === 'scientist' && state.contracts.some((c) => c.talentId === t.id))
    expect(subject).toBeDefined() // sanity: the fixture genuinely carries a contracted Scientist
    const result = marketEligibility(state, subject!.id, state.market.tick)
    expect(result.status).toBe('renewal_window')
  })

  it('downgrade LOSSLESS: a freshly-lifted V28 state (empty talentMarket root) downgrades through save.migrateToV27 directly, byte-identical to the source', () => {
    const json = load(V27_FIXTURES.naturalRivalLabs.file)
    const parsed = JSON.parse(json) as { saveVersion: number }
    const beforeState = (save.validateSave(parsed as never).state as GameState)
    const lifted = withV28.migrateToV28(parsed)
    const downgraded = save.migrateToV27(lifted as never)
    expect(downgraded.saveVersion).toBe(27)
    expect(JSON.stringify(downgraded.state as GameState)).toBe(JSON.stringify(beforeState))
  })

  it('downgrade REFUSED: a talentMarket root carrying any case/proposal/receipt refuses V28->V27', () => {
    const json = load(V27_FIXTURES.naturalRivalLabs.file)
    const parsed = JSON.parse(json) as { saveVersion: number }
    const lifted = withV28.migrateToV28(parsed)
    const forgedCase = {
      ...lifted,
      state: { ...lifted.state, talentMarket: { cases: [{ talentId: 'forged', status: 'discovered' }], proposals: [], receipts: [] } },
    }
    expect(() => save.migrateToV27(forgedCase as never)).toThrow(/cannot downgrade/i)

    const forgedProposal = {
      ...lifted,
      state: { ...lifted.state, talentMarket: { cases: [], proposals: [{ talentId: 'forged', issuerStudioId: 'forged', representation: null }], receipts: [] } },
    }
    expect(() => save.migrateToV27(forgedProposal as never)).toThrow(/cannot downgrade/i)

    const forgedReceipt = {
      ...lifted,
      state: { ...lifted.state, talentMarket: { cases: [], proposals: [], receipts: [{ kind: 'discovered', talentId: 'forged' }] } },
    }
    expect(() => save.migrateToV27(forgedReceipt as never)).toThrow(/cannot downgrade/i)
  })

  it('VALIDATOR REFUSED: a talentMarket case with no backing discovery receipt is refused (no market authority without a receipt, mirroring the S8 rival-authority invariant)', () => {
    const json = load(V27_FIXTURES.naturalRivalLabs.file)
    const parsed = JSON.parse(json) as { saveVersion: number }
    const lifted = withV28.migrateToV28(parsed)
    const forged = {
      ...lifted,
      state: { ...lifted.state, talentMarket: { cases: [{ talentId: 'forged-subject', status: 'discovered' }], proposals: [], receipts: [] } },
    }
    expect(() => withV28.validateSaveV28(forged as never)).toThrow()
  })

  it('VALIDATOR REFUSED: a proposal missing the required `representation` key, or carrying a non-null value, is refused (R10)', () => {
    const json = load(V27_FIXTURES.naturalRivalLabs.file)
    const parsed = JSON.parse(json) as { saveVersion: number }
    const lifted = withV28.migrateToV28(parsed)
    const missingKey = {
      ...lifted,
      state: { ...lifted.state, talentMarket: { cases: [], proposals: [{ talentId: 'x', issuerStudioId: 'y', termWeeks: 52, premiumTier: 1.0 }], receipts: [] } },
    }
    expect(() => withV28.validateSaveV28(missingKey as never)).toThrow(/representation/i)

    const nonNull = {
      ...lifted,
      state: { ...lifted.state, talentMarket: { cases: [], proposals: [{ talentId: 'x', issuerStudioId: 'y', termWeeks: 52, premiumTier: 1.0, representation: 'agent-1' }], receipts: [] } },
    }
    expect(() => withV28.validateSaveV28(nonNull as never)).toThrow(/representation/i)
  })

  it('an unknown saveVersion 29 is refused, naming the handled range "1 through 28 only"', () => {
    const json = load(V27_FIXTURES.naturalRivalLabs.file)
    const lifted = withV28.migrateToV28(JSON.parse(json))
    const forged = { ...lifted, saveVersion: 29 }
    expect(() => save.validateSave(forged as never)).toThrow(/versions 1 through 28 only/)
  })
})
