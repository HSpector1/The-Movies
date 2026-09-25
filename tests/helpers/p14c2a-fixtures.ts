// P14C.2a T1 shared fixtures. Test-author owned (773/777/775). Loads the genuine T0
// V33 corpus (tests/fixtures/p14/genuine-v33-c2-corpus/, record 775) and the held V32
// C.1 corpus's null-hollywood worlds (tests/fixtures/p14/genuine-v32-c1-corpus/, already
// committed for P14C.1), and builds LABELED SYNTHETIC V34 overlays for isolated boundary
// cases. Never hand-edits a fixture file; every loader re-verifies sha256 from disk.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { convertV32ToV33, validateSaveV33 } from '../../src/core/save.js'
import { birthdaysDueAt } from '../../src/core/aging.js'
import { advanceCareerLifecycleWeek } from '../../src/core/careerLifecycle.js'
import { tick } from '../../src/core/index.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './p14b2-fixtures.js'
export { advanceTo, fund, p13aGeneratedStudio, player }
import type {
  CareerLifecycleRoot, CreativeRole, GameState, GameStateV34, RetirementCause, RetirementRecord, RetirementStatus,
  Talent, TalentProvenanceRow,
} from '../../src/core/types.js'

const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

// ── the genuine outgoing V33 corpus (record 775; MANIFEST.json re-verified by hand) ──
export const C2_CORPUS = {
  'genuine-v33-c2-hard-boundary-and-idle-window': { gz: 'b7c3c0a4d4f26ce6344de9cb681f3310df96338aee1f3dabec409b0e69b119ed', raw: 'c404122a6f0c232f0b41afe5c685972a9140a17ac8ef8be336512ba0b871515e', week: 780 },
  'genuine-v33-c2-rival-in-window': { gz: '5f6e1ab1602bbfba74da127dd0cf3b1df0e6df8eb1b7fe1a8c4eff3b2f27c718', raw: 'd5fbe532d9d5af8eaac98d87ab79ba473a8fb5ece0d32fcae831c77d36cc9655', week: 1040 },
  'genuine-v33-c2-contract-and-case': { gz: '3bda857bd65b28badce1fee25192644ba5b3f16538ed1e9c9b96527fd023c97a', raw: 'b00e4b865974fe7f3b96b51d7b34a9bcfb0689eae00b9093c162548c3cb11804', week: 48 },
  'genuine-v33-c2-seated': { gz: '493b7ecb434f4d965eddadf966c18beafe75561d81d968fd40b11ddc0d915d7e', raw: '52347a8b7374036d0d971fbd4c61b459973333b1331109e99d1a9bb970be5d74', week: 0 },
  'genuine-v33-c2-scientist': { gz: '81a1136a90abc6b0c8ae88684ac379e9f3a6faeafe68b12acd26f3e8b0154714', raw: 'fda192a00c71fa66284cc51a4e9e5e0a41b409e0919a1c0a050f79cb0904bd2f', week: 520 },
  'genuine-v33-c2-migrated-legacy': { gz: '3b85c4b3e77d26728303b5a4ed9f15f75b22852c8a3842e036d0252387fd32d9', raw: 'f6acfbcc90be971907d32da1d140b5aabc88c1b305855e36139fff5ebdece619', week: 260 },
} as const
export type C2CorpusName = keyof typeof C2_CORPUS

export function c2Fixture(name: C2CorpusName): GameState {
  const path = `tests/fixtures/p14/genuine-v33-c2-corpus/${name}.json.gz`
  expect(existsSync(path), `T0 NOT COMPLETE: genuine V33 C.2a artifact missing: ${path}`).toBe(true)
  const compressed = readFileSync(path)
  expect(sha256(compressed), `${name}: compressed bytes drifted from record 775's MANIFEST`).toBe(C2_CORPUS[name].gz)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha256(raw), `${name}: uncompressed bytes drifted from record 775's MANIFEST`).toBe(C2_CORPUS[name].raw)
  const save = validateSaveV33(JSON.parse(raw)) // the genuine frozen V33 validator FIRST
  expect(save.state.market.tick, `${name}: week drifted from record 775's MANIFEST`).toBe(C2_CORPUS[name].week)
  return save.state as unknown as GameState
}

// ── the held null-hollywood V32 worlds (P14C.1 corpus; migrated up to V33 here) ──
const C1_NULL_HOLLYWOOD = {
  'bare-world': { gz: '1d3127b89c86d2fe4bf519fcbc0471ab46e377db5cf090ca5e699c3b4a61b0c2', raw: '3c6216d500d86f24e9282a9ede6d10af32670773531b2e79bad16f0794c51a51', week: 0 },
  'bare-ticked': { gz: 'a5eb7f4af5fa382a6621ec4b886168c9d964f8c673552b1f66796dc6704724b8', raw: '7a9d5679c169b4e37f5a35684215009118048dbd4b9862f8093b26a49f652ef1', week: 1 },
} as const
export type NullHollywoodName = keyof typeof C1_NULL_HOLLYWOOD

/** A null-`hollywood` V33 state (migrated from the held C.1 V32 corpus). A7 needs
 * exactly this shape, and P14C.1's own suite already established these two files as
 * the accepted null-hollywood worlds — reused here, never re-minted. */
export function nullHollywoodFixture(name: NullHollywoodName): GameState {
  const path = `tests/fixtures/p14/genuine-v32-c1-corpus/genuine-v32-${name}.json.gz`
  expect(existsSync(path), `held C.1 fixture missing: ${path}`).toBe(true)
  const compressed = readFileSync(path)
  expect(sha256(compressed), `${name}: compressed bytes drifted`).toBe(C1_NULL_HOLLYWOOD[name].gz)
  const raw = gunzipSync(compressed).toString('utf8')
  expect(sha256(raw), `${name}: uncompressed bytes drifted`).toBe(C1_NULL_HOLLYWOOD[name].raw)
  const parsed = JSON.parse(raw)
  expect(parsed.state.market.tick, `${name}: week drifted`).toBe(C1_NULL_HOLLYWOOD[name].week)
  expect(parsed.state.hollywood, `${name}: expected a null-hollywood world`).toBeNull()
  const v33 = convertV32ToV33(parsed)
  return v33.state as unknown as GameState
}

// ── SYNTHETIC V34 overlay (labeled at every call site; never a fixture file edit) ──

/** Attaches a `careerLifecycle` root to a real GameState in memory. GameState is
 * still V33 (the scaffold has not flipped it); this is a SYNTHETIC cast used ONLY to
 * exercise pure lifecycle functions and consumer predicates ahead of the save step.
 * Every unknown field survives a real `tick()`/`applyActions` call (both thread the
 * rest of the state through by spread, never by an explicit field allowlist), so this
 * overlay is safe to carry through natural engine calls. */
export function withSyntheticCareerLifecycle(state: GameState, root: CareerLifecycleRoot): GameStateV34 {
  return { ...state, careerLifecycle: root } as unknown as GameStateV34
}

export function initialSyntheticRoot(boundaryWeek: number): CareerLifecycleRoot {
  return { boundaryWeek, records: [] }
}

/** Builds one lawful `RetirementRecord`, defaults filled from the announcement week
 * onward per 773's own formula (E = max(A+52, endInForce)). Every field can be
 * overridden; the caller is responsible for internal consistency (this is a SYNTHETIC
 * helper, not the production law). */
export function syntheticRecord(overrides: Partial<RetirementRecord> & { personId: string }): RetirementRecord {
  const announcedWeek = overrides.announcedWeek ?? 0
  return {
    profession: 'actor' as CreativeRole,
    intentRulesVersion: 1,
    cause: 'idleInWindow' as RetirementCause,
    announcedWeek,
    ageAtAnnouncement: 61,
    effectiveWeek: announcedWeek + 52,
    status: 'announced' as RetirementStatus,
    finishingFromWeek: null,
    retiredWeek: null,
    ...overrides,
  }
}

/** Clones an EXISTING Talent row (never hand-authors one — Talent carries two dozen
 * generated fields the tests must not have to reconstruct) under a fresh id/role/age,
 * plus its matching `authored_exact_week` provenance row, and PREPENDS both — so a
 * deterministic first-match selector (`staff()`'s fresh hire, `enterRival`'s pick,
 * both named in 773 trap 1) picks this exact person ahead of anyone else of that role.
 * Not added to any `due` bucket: this synthetic person never has a real birthday, by
 * design, since the point is to test the CONSUMER, not the intent step. */
export function prependSyntheticCandidate(
  state: GameState, id: string, role: CreativeRole, age: number,
): GameState {
  const template = state.talent.find((t) => t.role === role) ?? state.talent[0]!
  const person: Talent = { ...template, id, role, age, authored: false }
  const week = state.market.tick
  const row: TalentProvenanceRow = { personId: id, kind: 'authored_exact_week', ageAtEntry: age, entryWeek: week }
  return {
    ...state,
    talent: [person, ...state.talent],
    talentProvenance: { ...state.talentProvenance, rows: [row, ...state.talentProvenance.rows] },
  }
}

/**
 * ONE real tick, with the lifecycle step invoked exactly as 777 §4 specifies it can
 * be driven from outside `tick()` (which does not call it yet): `birthdaysDueAt` is
 * read from the PRE-tick provenance for the week the tick is about to produce
 * (before `materializeAges` consumes that due bucket, same as the contract requires),
 * then `advanceCareerLifecycleWeek` runs on the POST-tick state.
 *
 * DISCLOSED LIMITATION: 777 §4 places the lifecycle step BEFORE
 * `advanceTalentMarketWeek`, which already ran INSIDE this `tick()` call by the time
 * this helper's second half executes — so a same-week market interaction (C1/C2's
 * case invalidation, discovery skipping an announced person) is ONE WEEK LATE here.
 * The A-series intent/settlement law this helper drives does not depend on that
 * ordering; the market tests exercise `advanceTalentMarketWeek` directly on a state
 * that already carries the record at the right week instead of composing through
 * this helper, precisely to avoid that gap.
 */
export function stepWeekWithLifecycle(state: GameStateV34): GameStateV34 {
  const birthdays = birthdaysDueAt(state.talentProvenance, state.market.tick + 1)
  const ticked = tick(state as unknown as GameState) as unknown as GameStateV34
  return advanceCareerLifecycleWeek(ticked, birthdays) as GameStateV34
}

export const sha256Hex = sha256
export const readGz = (path: string): { raw: string; compressed: Buffer } => {
  const compressed = readFileSync(path)
  return { raw: gunzipSync(compressed).toString('utf8'), compressed }
}
