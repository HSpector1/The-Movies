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
import { tick } from '../../src/core/index.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './p14b2-fixtures.js'
export { advanceTo, fund, p13aGeneratedStudio, player }
import type {
  CareerLifecycleRootV36, CreativeRole, GameState, RetirementCause, RetirementRecordV36, RetirementStatus,
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
// P14C.4: `root` is now the LIVE V35 shape (793 §2: `CareerLifecycleRootV35`) — every
// overlay this helper builds is threaded through the real `tick()` by callers below
// (`stepWeekWithLifecycle`), so it must carry `cohorts` or the live cohort step throws
// "the Save V35 cohort receipts are missing" the first time it reaches a cohort week
// (796 §4). `CareerLifecycleRoot` itself keeps its frozen V34 shape (793 §2); only this
// helper's own parameter moved, forcing every call site's inline root literal to add
// `cohorts` too.
// P14C.4: the return type moves from `GameStateV34` to `GameState` (= V35) —
// `root` is now genuinely live-shaped, so the result is too, and every live
// consumer below (`applyActions`, `tick`, `hiringMarketIds`, `marketEligibility`,
// ...) can take it directly again, exactly as it could before this bump.
// P14C.2b: `root`'s own shape moves from `CareerLifecycleRootV35` to
// `CareerLifecycleRootV36` — every record now owes `extensionUsed`/
// `extendedFromWeek` (`readExtensionUsed`, `careerLifecycle.ts`, throws loudly on a
// live record missing them), which `syntheticRecord` below now always supplies.
export function withSyntheticCareerLifecycle(state: GameState, root: CareerLifecycleRootV36): GameState {
  return { ...state, careerLifecycle: root } as unknown as GameState
}

export function initialSyntheticRoot(boundaryWeek: number): CareerLifecycleRootV36 {
  return { boundaryWeek, records: [], cohorts: [] }
}

/** Builds one lawful `RetirementRecordV36`, defaults filled from the announcement week
 * onward per 773's own formula (E = max(A+52, endInForce)), plus P14C.2b's own
 * unused-extension default (`extensionUsed: false, extendedFromWeek: null` — none of
 * this file's synthetic scenarios exercise the retirement-extension market). Every
 * field can be overridden; the caller is responsible for internal consistency (this is
 * a SYNTHETIC helper, not the production law). */
export function syntheticRecord(overrides: Partial<RetirementRecordV36> & { personId: string }): RetirementRecordV36 {
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
    extensionUsed: false,
    extendedFromWeek: null,
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
 * ONE real week, driven ENTIRELY by the production `tick()` — no manual
 * re-invocation of `advanceCareerLifecycleWeek`/`birthdaysDueAt` afterward. 777 §4
 * wires the lifecycle step INSIDE `tick()` itself (birthdays captured before
 * `materializeAges` consumes the due bucket, the step run BEFORE
 * `advanceTalentMarketWeek`); this helper exists only so every natural-route case in
 * this suite shares one call site, never to duplicate that wiring itself.
 *
 * CHANGED (783, test-coverage gap 1): an earlier revision of this helper called
 * `advanceCareerLifecycleWeek` a SECOND time after `tick()`. That second call was
 * idempotent (A6b asserts idempotence directly, never through this helper), so every
 * natural-route case built on this helper (A1, A2a, A2b, A5, E1, E2, F1) would have
 * kept passing even if `tick()`'s OWN wiring were removed or misordered — the gap the
 * source review flagged. The second call is gone; the dedicated tick-wiring case in
 * `p14c2a-core-lifecycle.test.ts` drives a bare `tick()` with NO helper at all,
 * precisely to prove `tick()`'s own wiring and its order ahead of the market step.
 */
// P14C.4: `state`/return move from `GameStateV34` to `GameState` (= V35), same
// reasoning as `withSyntheticCareerLifecycle` above — every caller threads a
// genuinely live-shaped state through this helper now.
export function stepWeekWithLifecycle(state: GameState): GameState {
  return tick(state)
}

export const sha256Hex = sha256
export const readGz = (path: string): { raw: string; compressed: Buffer } => {
  const compressed = readFileSync(path)
  return { raw: gunzipSync(compressed).toString('utf8'), compressed }
}
