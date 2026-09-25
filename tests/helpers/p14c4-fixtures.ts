// P14C.4 T1 shared fixtures. Test-author owned (782/793). Loads the genuine T0 V34
// corpus (tests/fixtures/p14/genuine-v34-c4-corpus/, record 791) and the T0 provenance
// files' "V34-engine continuation facts" (record 790/791, computed by CONTINUING the
// real unmodified V34 engine — never a C.4 implementation output). Never hand-edits a
// fixture file; every loader re-verifies sha256 from disk, exactly the c2a precedent
// (tests/helpers/p14c2a-fixtures.ts).
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { expect } from 'vitest'
import { convertV34ToV35, validateSaveV34, validateSaveV35 } from '../../src/core/save.js'
import type { SaveFileV34, SaveFileV35 } from '../../src/core/save.js'
import { ageAt } from '../../src/core/aging.js'
import { stream } from '../../src/core/rng.js'
import { TUNING } from '../../src/core/tuning.js'
import { advanceTo, fund, p13aGeneratedStudio, player } from './p14b2-fixtures.js'
export { advanceTo, fund, p13aGeneratedStudio, player }
import type {
  CareerLifecycleRootV35, CohortReceipt, FilmCreativeRole, GameState, GameStateV34, GameStateV35,
} from '../../src/core/types.js'

const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

/** 782 §7.1's own order: "allotted in profession order actor, director, writer, craft." */
export const FILM_ROLE_ORDER: readonly FilmCreativeRole[] = ['actor', 'director', 'writer', 'craft']

// ── the genuine outgoing V34 corpus (record 791; MANIFEST.json re-verified by hand) ──
export const C4_CORPUS = {
  'genuine-v34-c4-mid-year': { gz: '6d1e8373b242b2320fb3b6391fcb509156fef04c9834df5cb8da24ff7a0d1ca9', week: 105 },
  'genuine-v34-c4-cohort-week': { gz: 'b18eee654b57ae7040c6cddfb878f3e358ee735c757adf481fe88ffa97a91b02', week: 104 },
  'genuine-v34-c4-all-statuses': { gz: 'd042e74ab468afe8a43754378caf2301050436679ad8a394c0b5a7da055e21ca', week: 227 },
  'genuine-v34-c4-null-hollywood': { gz: 'a6d3bc7878076ed8cdc0c65e92897c8793fb3380b4450a17f6cc2473d4e0b279', week: 208 },
  'genuine-v34-c4-migrated-chain': { gz: '8638591e467b91f22e19f3c6123c6264f2c899dcd6d139cef8474e6e41a59dc3', week: 988 },
  'genuine-v34-c4-deep-deficit': { gz: '314b8152c0e108f51b0abb3885b7ec06dee520f29deef3bdb0845ed514c1ab5a', week: 2600 },
} as const
export type C4CorpusName = keyof typeof C4_CORPUS

export function c4Fixture(name: C4CorpusName): GameStateV34 {
  const path = `tests/fixtures/p14/genuine-v34-c4-corpus/${name}.json.gz`
  expect(existsSync(path), `T0 NOT COMPLETE: genuine V34 C.4 artifact missing: ${path}`).toBe(true)
  const compressed = readFileSync(path)
  expect(sha256(compressed), `${name}: compressed bytes drifted from record 791's MANIFEST`).toBe(C4_CORPUS[name].gz)
  const raw = gunzipSync(compressed).toString('utf8')
  const save = validateSaveV34(JSON.parse(raw)) // the genuine frozen V34 validator FIRST
  expect(save.state.market.tick, `${name}: week drifted from record 791's MANIFEST`).toBe(C4_CORPUS[name].week)
  return save.state
}

/** A genuine V34 state wrapped in its own save envelope (`makeSave`'s own internal
 * pattern) — the input `convertV34ToV35`/`migrateToV35` expect. */
export function envelopeV34(state: GameStateV34): SaveFileV34 {
  return validateSaveV34({ saveVersion: 34, seed: state.seed, state, broadcastCache: state.broadcastItems })
}

/** A genuine, already-V35-shaped `GameState` wrapped in its own save envelope, so a
 * REAL (post-migration, possibly post-tick) live state can be round-tripped through
 * `validateSaveV35`/`convertV35ToV34` directly. */
export function liveEnvelope(state: GameState): SaveFileV35 {
  return validateSaveV35({ saveVersion: 35, seed: state.seed, state, broadcastCache: state.broadcastItems })
}

/**
 * 782/793 T0 corpus (§8): the live engine is V35 (`GameState = GameStateV35`) — a
 * state that has not yet been migrated has no `cohorts` root at all, and `tick()`ing
 * it throws loudly the first cohort week ("the Save V35 cohort receipts are missing"),
 * exactly as 793 intends (never silently). Every case that ticks or saves a corpus
 * world must migrate it to live FIRST; `c4Fixture` alone (raw V34) is for cases that
 * read the fixture's own untouched save-week state without ever ticking it (B3/B4).
 */
export function c4LiveFixture(name: C4CorpusName): GameState {
  return convertV34ToV35(envelopeV34(c4Fixture(name))).state
}

/** The T0 minter's own "V34-engine continuation facts" (790/791): per-profession
 * `activeCount`/`activeUnder30` at the world's own next 52k weeks, computed by
 * CONTINUING the real, unmodified V34 engine — never a C.4 implementation output.
 * Read straight from the shipped `.provenance.json`, not transcribed by hand, so a
 * transcription slip cannot silently diverge from the minted record. */
export function c4ContinuationFacts(name: C4CorpusName): {
  w1: { week: number; activeByProfession: Record<FilmCreativeRole, { activeCount: number; activeUnder30: number }> }
  w2: { week: number; activeByProfession: Record<FilmCreativeRole, { activeCount: number; activeUnder30: number }> }
} {
  const path = `tests/fixtures/p14/genuine-v34-c4-corpus/${name}.provenance.json`
  expect(existsSync(path), `T0 NOT COMPLETE: provenance missing: ${path}`).toBe(true)
  const doc = JSON.parse(readFileSync(path, 'utf8')) as {
    week: number
    core: { continuation: { w1: unknown; w2: unknown } }
  }
  expect(doc.week, `${name}: provenance week drifted`).toBe(C4_CORPUS[name].week)
  return doc.core.continuation as never
}

/**
 * ORACLE for 782 §7.1's `active_p`/`young_p` alone, derived from the requirement text,
 * never from `src/core/careerLifecycle.ts` (whose `cohortRequest` only throws):
 *   active_p = talent[0, talentCountBefore) of role p with no `retired` record whose
 *              retiredWeek <= week (announced/finishing count as active — 782 §7 item 1)
 *   young_p  = some active person of role p has ageAt(provenance row, week) < 30
 * Exposed on its own (not just folded into `expectedCohortRequest` below) so a case
 * that isolates ONE of these two facts (B3/B4) checks it directly, rather than
 * re-deriving the whole request formula by hand and risking a second, independent
 * transcription of the youth-floor branch disagreeing with this one.
 */
export function expectedActiveAndYoung(
  state: GameStateV34, week: number,
): Record<FilmCreativeRole, { activeCount: number; young: boolean; activeIds: readonly string[] }> {
  const talentCountBefore = state.talent.length
  const retiredBy = new Set(
    state.careerLifecycle.records
      .filter((r) => r.status === 'retired' && r.retiredWeek !== null && r.retiredWeek <= week)
      .map((r) => r.personId),
  )
  const prefix = state.talent.slice(0, talentCountBefore)
  const out = {} as Record<FilmCreativeRole, { activeCount: number; young: boolean; activeIds: readonly string[] }>
  for (const role of FILM_ROLE_ORDER) {
    const activePeople = prefix.filter((t) => t.role === role && !retiredBy.has(t.id))
    const young = activePeople.some((t) => {
      const row = state.talentProvenance.rows.find((r) => r.personId === t.id)
      expect(row, `${t.id}: no provenance row to read a materialized age from`).toBeDefined()
      return ageAt(row!, week) < TUNING.COHORT_YOUTH_BELOW_AGE
    })
    out[role] = { activeCount: activePeople.length, young, activeIds: activePeople.map((t) => t.id) }
  }
  return out
}

/** The shared clip step (793 §4/782 R3): raw per-profession requests, clipped at
 * `COHORT_MAX_PER_REQUEST`, allotted greedily in `FILM_ROLE_ORDER`. Factored out so
 * both the §7.1 oracle and the §9 oracle below apply the IDENTICAL clip law. */
function clipRaw(raw: Record<FilmCreativeRole, number>): { requested: Record<FilmCreativeRole, number>; clipped: number } {
  let budget = TUNING.COHORT_MAX_PER_REQUEST
  const requested = {} as Record<FilmCreativeRole, number>
  for (const role of FILM_ROLE_ORDER) {
    const take = Math.min(raw[role], budget)
    requested[role] = take
    budget -= take
  }
  const clipped = FILM_ROLE_ORDER.reduce((sum, r) => sum + raw[r], 0) - FILM_ROLE_ORDER.reduce((sum, r) => sum + requested[r], 0)
  return { requested, clipped }
}

/**
 * ORACLE for 782 §7.1 (as REPLACED by §7 item 1), UNAMENDED by §9 — young_p measured
 * AT week `w` itself. Still correct for B3/B4, which do not pin the youth-floor timing
 * itself (they isolate active/retired membership) and read the fixture's own raw,
 * untouched save-week state, never a live-ticked one — 782 §9 has no bearing there.
 *   request_p = max(accepted_p - active_p, young_p ? 0 : 1)
 */
export function expectedCohortRequest(
  state: GameStateV34, week: number,
): { requested: Record<FilmCreativeRole, number>; clipped: number; talentCountBefore: number } {
  const talentCountBefore = state.talent.length
  const active = expectedActiveAndYoung(state, week)
  const raw = {} as Record<FilmCreativeRole, number>
  for (const role of FILM_ROLE_ORDER) {
    const accepted = TUNING.COHORT_ACCEPTED_POPULATION[role]
    raw[role] = Math.max(accepted - active[role]!.activeCount, active[role]!.young ? 0 : 1)
  }
  return { ...clipRaw(raw), talentCountBefore }
}

/**
 * 782/793 §9 (amended after the demonstration, record 799, failed 2 of 3 seeds):
 * `young_p` is true iff some ACTIVE PREFIX person of profession p has
 * `ageAt(row, w + 52) < 30` — still under 30 at the NEXT request week, not merely at
 * `w`. A RE-DERIVATION, not an independent measurement: no T0 provenance file
 * captured a look-ahead fact, so this reads the LIVE ticked state's own talent/
 * provenance directly, over the exact prefix the REAL receipt's own `talentCountBefore`
 * names (never re-deriving a fresh active set at `w+52` — retirements between `w` and
 * `w+52` must not change WHO is being aged, only how old they are).
 */
export function expectedYoungLookahead(
  state: GameState, receipt: { readonly week: number; readonly talentCountBefore: number },
): Record<FilmCreativeRole, boolean> {
  const w = receipt.week
  const retiredBy = new Set(
    state.careerLifecycle.records
      .filter((r) => r.status === 'retired' && r.retiredWeek !== null && r.retiredWeek <= w)
      .map((r) => r.personId),
  )
  const prefix = state.talent.slice(0, receipt.talentCountBefore)
  const out = {} as Record<FilmCreativeRole, boolean>
  for (const role of FILM_ROLE_ORDER) {
    const activePeople = prefix.filter((t) => t.role === role && !retiredBy.has(t.id))
    out[role] = activePeople.some((t) => {
      const row = state.talentProvenance.rows.find((r) => r.personId === t.id)
      expect(row, `${t.id}: no provenance row to read a materialized age from`).toBeDefined()
      return ageAt(row!, w + 52) < TUNING.COHORT_YOUTH_BELOW_AGE
    })
  }
  return out
}

/**
 * The full §9 request oracle: `active_p`/deficit from the T0-MEASURED continuation
 * facts (790/791 — an independent cross-check, unchanged by §9), combined with the
 * look-ahead `young_p` RE-DERIVED above (no independent measurement exists for it).
 */
export function expectedCohortRequestS9(
  factsActiveByProfession: Record<FilmCreativeRole, { activeCount: number; activeUnder30: number }>,
  youngLookahead: Record<FilmCreativeRole, boolean>,
): { requested: Record<FilmCreativeRole, number>; clipped: number } {
  const raw = {} as Record<FilmCreativeRole, number>
  for (const role of FILM_ROLE_ORDER) {
    const accepted = TUNING.COHORT_ACCEPTED_POPULATION[role]
    raw[role] = Math.max(accepted - factsActiveByProfession[role]!.activeCount, youngLookahead[role] ? 0 : 1)
  }
  return clipRaw(raw)
}

/** 793 §4's exact documented formula for `cohortEntrantAge`, replicated directly from
 * the API contract's own text (never by reading `careerLifecycle.ts`'s throwing
 * wrapper): `stream(seed, 'worldgen', 'p14c4-cohort-age/v1:' + id).truncatedNormal(24,3,20,32)`. */
export function expectedCohortEntrantAge(seed: string, personId: string): number {
  return stream(seed, 'worldgen', `p14c4-cohort-age/v1:${personId}`).truncatedNormal(
    TUNING.COHORT_ENTRANT_AGE.mean, TUNING.COHORT_ENTRANT_AGE.sd, TUNING.COHORT_ENTRANT_AGE.lo, TUNING.COHORT_ENTRANT_AGE.hi,
  )
}

/** Reads `.cohorts` off a state — a thin, always-safe accessor kept for the many
 * natural-route cases already written against it (`state.careerLifecycle.cohorts`
 * is now a real, always-defined field on a genuine live `GameState`; this just avoids
 * churning every call site). */
export function cohortsOf(state: GameState | GameStateV34 | GameStateV35): readonly CohortReceipt[] | undefined {
  return (state.careerLifecycle as unknown as CareerLifecycleRootV35 | undefined)?.cohorts
}
