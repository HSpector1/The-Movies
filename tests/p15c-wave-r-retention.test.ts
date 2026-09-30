// ── P15C Wave R — retention guards over the six named roots (record 1353-C, revision 1353-C3) ──
//
// Authority: 1353-A-p15c-finale-legacy-charter.md §4 row R ("One retention test
// per root (studio.releasedFilms, hollywood.films, both career-event roots,
// theatricalRuns, technology.adoptions): fails if a row disappears or a field a
// v1 rule reads changes") and §5.1's field-treatment table (which facts each v1
// archetype/lens reads, restated per-root in the header comment above each guard
// below). 1353-B/1353-B2 raised no objection to Wave R's scope or method.
// 1353-D's review and 1353-F3's response (1353-C3) raised the GUARD_TIMEOUT_MS
// budget from 120_000 to 180_000 with both measurements stated below; no other
// change to this file. The six guards themselves, their fixtures and their
// injection proofs are otherwise unchanged from 1353-C/1353-C2.
//
// THESE GUARDS PASS AT RED BY DESIGN (classify 'control-passes' in the
// handback): `src/core/campaignLegacy.ts` does not exist yet, but Wave R tests
// EXISTING, already-shipped production roots (studio.releasedFilms,
// hollywood.films, careerEvents x2, theatricalRuns, technology.adoptions), not
// the not-yet-built Legacy law. Each guard is proven by an INJECTED DEFECT in
// the scratch tree (see the handback's injection log for the exact edit,
// failure text and revert-hash confirmation for each of the six roots); the
// injected edits themselves never enter the tests-only patch.
//
// METHOD: a single real, seeded, deterministic campaign is driven through the
// PUBLIC tick API — `generateWorld`, `initializeHollywood` (src/core/hollywood.js,
// the exact activation pattern already used by src/harness/p13a/fixtures.ts's
// `p13aGeneratedStudio`), and the existing `src/harness/roster-wall/campaign.ts`
// weekly driver (`foundRosterWallStudio` + `runRosterWallOperatingWeek`), which
// runs a real casting/greenlight/release POLICY over real ticks — far enough
// that all six roots hold rows. `runRosterWallOperatingWeek` calls the engine's
// `tick()` with no options (develop:false), so player career events never
// populate through it alone; this file instead consumes its PUBLIC
// `stateAfterActions` field and calls `tick(state, {develop:true})` itself, the
// documented option (tick.ts `TickOptions.develop`) that turns on the player's
// own release-career growth pass ("engaged games" — the same semantics D-11.A/
// D-14 already gate FilmResult.participants and TalentCareerEvent on). No
// source file is modified for the base (non-injected) run; the harness's own
// exported functions are used exactly as published.
//
// W1 = week 300, W2 = week 450. At W1 every one of the six roots already holds
// at least one row (studio.releasedFilms: 16, hollywood.films: ~135,
// theatricalRuns: 16, player careerEvents: 96, hollywood.careerEvents: ~762,
// technology.adoptions: 1 — measured directly against this exact scratch tree
// during method setup, see the handback). technology.adoptions is the
// longest-to-fill root (first row at week 277; a second rival adoption does not
// appear until well after week 400), which sets W2 = 450 — chosen so the
// technology.adoptions injection (technologyRival.ts:66, only reached when a
// NEW adoption is pushed) is actually exercised at least once between W1 and
// W2, not merely a vacuously-passing window. The other five roots' injections
// are unconditional-per-tick (see the handback), so they are exercised on
// every one of the 150 ticks between W1 and W2 regardless.
//
// The campaign is computed ONCE and memoized (module-level cached Promise),
// shared by all six guards below, exactly as tests/p15a2-power-ranking-harness
// .test.ts memoizes its own fixture rows. Every one of the six `it()`s below
// `await campaignRun()` as its first statement, so the vitest per-test timeout
// wraps the full campaign build on whichever guard runs first (the memoized
// `Promise` is what makes the other five near-instant, not a bypass of the
// timeout) -- the budget genuinely can fire if the build is slow, it is not
// a number that can never be reached.
//
// 1353-D / 1353-F3: two real measurements set the budget. The real full-suite
// run of all 6 leaves in one process (which pays the campaign-build cost
// exactly once via the memoization above) measured 90.4s. Isolated `-t`
// reruns used only to prove each of the six injections independently (a
// separate, more expensive methodology that deliberately re-pays the
// campaign cost from a fresh process, and once bundles two leaves together)
// reached up to 189.9s under machine load. `GUARD_TIMEOUT_MS` is set to
// 180_000 (over the core 5s default) as a hedge against that load variance,
// not the 90.4s figure alone: if CI hardware is slower or more contended than
// the authoring sandbox, the margin at 120_000 was thinner than the headline
// 90.4s suggested.

import { describe, expect, it } from 'vitest'
import { initializeHollywood } from '../src/core/hollywood.js'
import { tick } from '../src/core/tick.js'
import {
  foundRosterWallStudio,
  runRosterWallOperatingWeek,
  type RosterWallOperatingPolicyId,
} from '../src/harness/roster-wall/campaign.js'
import type { GameState, TalentCareerEvent, TheatricalRun } from '../src/core/types.js'
import type { IndustryFilm } from '../src/core/hollywoodTypes.js'
import type { TechnologyAdoption } from '../src/core/technologyTypes.js'

const SEED = '1353-wave-r-seed-01'
const POLICY: RosterWallOperatingPolicyId = 'direct-package'
const W1 = 300
const W2 = 450
const GUARD_TIMEOUT_MS = 180_000 // see header: 90.4s full-suite / up to 189.9s isolated-under-load measurements

type Snapshot = { w1: GameState; w2: GameState }

let cachedRun: Promise<Snapshot> | null = null

async function campaignRun(): Promise<Snapshot> {
  cachedRun ??= (async () => {
    let state: GameState = foundRosterWallStudio(SEED, POLICY)
    state = initializeHollywood(state, 'fresh')
    let w1: GameState | null = null
    while (state.market.tick < W2) {
      const result = runRosterWallOperatingWeek({ state, operatingPolicyId: POLICY })
      // Real public tick option (see header): turns on the player's own
      // release-career growth pass so player careerEvents/participants populate.
      state = tick(result.stateAfterActions, { develop: true })
      if (state.market.tick === W1) w1 = structuredClone(state)
    }
    if (w1 === null) throw new Error(`campaignRun: W1=${W1} was never observed as an exact tick boundary`)
    return { w1, w2: state }
  })()
  return cachedRun
}

function byId<T>(rows: readonly T[], keyOf: (row: T) => string): Map<string, T> {
  const map = new Map<string, T>()
  for (const row of rows) map.set(keyOf(row), row)
  return map
}

describe('p15c wave R: retention guards over the six named roots (1353-A §4 row R)', () => {
  // ── 1. studio.releasedFilms (player) ─────────────────────────────────────
  // v1-read fields (1353-A §5.1/§5.3 common rules): `productionId` (stable ID;
  // also the career-event eventId's `${filmId}` half and the tie-break "ID"),
  // `releaseTick` (run-status arithmetic `releaseTick+totalWeeks-1`; the decade
  // partition; the pre-B cut; the release-week tie-break), `criticScore`
  // (artistic-voice acclaim/pan; genre-specialist's "highest critic first"),
  // `boxOffice.total` (commercial-engine's settled gross), `conceptId` (the
  // genre fallback "else its concept" for a film with no career events — not
  // exercised by this fixture, which is fully engaged, but still a field the
  // law would read on an unengaged/M0A save, so still protected here).
  it(
    'wave-r-retention-studio-released-films',
    async () => {
      const { w1, w2 } = await campaignRun()
      expect(w1.studio.releasedFilms.length).toBeGreaterThan(0)
      const w2ById = byId(w2.studio.releasedFilms, (f) => f.productionId)
      for (const row of w1.studio.releasedFilms) {
        const later = w2ById.get(row.productionId)
        if (!later) throw new Error(`RED: studio.releasedFilms row ${row.productionId} present at W1=${W1} is gone at W2=${W2}`)
        expect(later.releaseTick).toBe(row.releaseTick)
        expect(later.criticScore).toBe(row.criticScore)
        expect(later.boxOffice.total).toBe(row.boxOffice.total)
        expect(later.conceptId).toBe(row.conceptId)
      }
    },
    GUARD_TIMEOUT_MS,
  )

  // ── 2. hollywood.films (rivals + authored) ───────────────────────────────
  // Common v1-read fields: `filmId` (stable ID), `studioId`, `genre` (already
  // resolved on FilmIdentity — no concept lookup needed here, unlike the
  // player root), `credits[].{talentId,role}` (talent-foundry's shared public
  // credits; display `name` is not read by any archetype/lens, only the ref
  // IDs are ever persisted per annex E.7, so `name` is deliberately NOT
  // asserted). Authored-only: `provenance`, `released`, `criticScore`,
  // `audienceScore`, `totalGross`, `settled` (all frozen forever; authored
  // facts are pre-1920 history that can never gain a later settlement).
  // Live-only: `provenance`, `result.releaseTick`, `result.criticScore`,
  // `result.boxOffice.total` (all frozen at release, `hollywoodTypes.ts:37-45`
  // / `types.ts:253-276`), and `settledWeek`, which is the ONE field this
  // guard allows to move — but only null -> a week number, never a set value
  // changing to a different one (settlement is a one-time, one-directional
  // transition, not a retention violation). `directCommitment` and
  // `studioRevenueReceived` are deliberately excluded: 1353-A §5.1's table
  // marks "Rival cash, costs, studio revenue" as "Never read", so no v1 rule
  // depends on their stability and this guard does not assert on them.
  it(
    'wave-r-retention-hollywood-films',
    async () => {
      const { w1, w2 } = await campaignRun()
      const w1Films: IndustryFilm[] = w1.hollywood!.films
      const w2Films: IndustryFilm[] = w2.hollywood!.films
      expect(w1Films.length).toBeGreaterThan(0)
      const w2ById = byId(w2Films, (f) => f.filmId)
      for (const row of w1Films) {
        const later = w2ById.get(row.filmId)
        if (!later) throw new Error(`RED: hollywood.films row ${row.filmId} present at W1=${W1} is gone at W2=${W2}`)
        expect(later.studioId).toBe(row.studioId)
        expect(later.genre).toBe(row.genre)
        expect(later.credits.map((c) => ({ talentId: c.talentId, role: c.role }))).toEqual(
          row.credits.map((c) => ({ talentId: c.talentId, role: c.role })),
        )
        expect(later.provenance).toBe(row.provenance)
        if (row.provenance === 'authored-start/v1' && later.provenance === 'authored-start/v1') {
          expect(later.released).toEqual(row.released)
          expect(later.criticScore).toBe(row.criticScore)
          expect(later.audienceScore).toBe(row.audienceScore)
          expect(later.totalGross).toBe(row.totalGross)
          expect(later.settled).toBe(row.settled)
        } else if (row.provenance === 'simulation/v1' && later.provenance === 'simulation/v1') {
          expect(later.result.releaseTick).toBe(row.result.releaseTick)
          expect(later.result.criticScore).toBe(row.result.criticScore)
          expect(later.result.boxOffice.total).toBe(row.result.boxOffice.total)
          // settledWeek: one-directional null -> week transition only.
          if (row.settledWeek !== null) {
            expect(later.settledWeek).toBe(row.settledWeek)
          }
        }
      }
    },
    GUARD_TIMEOUT_MS,
  )

  // ── 3. player careerEvents ────────────────────────────────────────────────
  // v1-read fields, per the §5.3 common rule ("Genre comes from the film's
  // career events... The audience score is the audienceScore on its career
  // events") plus the identity/join/boundary fields every archetype needs:
  // `eventId` (stable ID, `${filmId}:${talentId}`), `talentId` (the discovery
  // identity for talent-foundry), `filmId` (joins back to the released film),
  // `releaseWeek` (decade partition, pre-B cut, tie-break), `genre`,
  // `audienceScore`. `criticScore` on a career event is deliberately NOT
  // asserted: every archetype that reads critic score reads it off the FILM
  // record (FilmResult.criticScore / IndustryFilm's criticScore, already
  // guarded by roots 1-2), never off TalentCareerEvent.criticScore, which the
  // type's own comment marks "recorded for context only" (types.ts:2572).
  // Development/star-power fields (ovrBefore/After, skills*, workHistory*,
  // starPower*, billingWeight, discipline, role, reasonCodes,
  // forecastComparator, realizedOpening/Total, filmTitle) are outside every
  // v1 archetype/lens's read set per §5.3/§5.4 and are not asserted here.
  it(
    'wave-r-retention-player-career-events',
    async () => {
      const { w1, w2 } = await campaignRun()
      expect(w1.careerEvents.length).toBeGreaterThan(0)
      const w2ById = byId(w2.careerEvents, (e) => e.eventId)
      for (const row of w1.careerEvents) {
        const later = w2ById.get(row.eventId)
        if (!later) throw new Error(`RED: player careerEvents row ${row.eventId} present at W1=${W1} is gone at W2=${W2}`)
        expect(later.talentId).toBe(row.talentId)
        expect(later.filmId).toBe(row.filmId)
        expect(later.releaseWeek).toBe(row.releaseWeek)
        expect(later.genre).toBe(row.genre)
        expect(later.audienceScore).toBe(row.audienceScore)
      }
    },
    GUARD_TIMEOUT_MS,
  )

  // ── 4. hollywood.careerEvents (rivals) ───────────────────────────────────
  // Same v1-read field list and same exclusions as guard 3 above (identical
  // TalentCareerEvent shape; hollywoodValidation.ts:430-435 guarantees exactly
  // six per live rival film, so this root is dense from very early on).
  it(
    'wave-r-retention-hollywood-career-events',
    async () => {
      const { w1, w2 } = await campaignRun()
      const w1Events: TalentCareerEvent[] = w1.hollywood!.careerEvents
      const w2Events: TalentCareerEvent[] = w2.hollywood!.careerEvents
      expect(w1Events.length).toBeGreaterThan(0)
      const w2ById = byId(w2Events, (e) => e.eventId)
      for (const row of w1Events) {
        const later = w2ById.get(row.eventId)
        if (!later) throw new Error(`RED: hollywood.careerEvents row ${row.eventId} present at W1=${W1} is gone at W2=${W2}`)
        expect(later.talentId).toBe(row.talentId)
        expect(later.filmId).toBe(row.filmId)
        expect(later.releaseWeek).toBe(row.releaseWeek)
        expect(later.genre).toBe(row.genre)
        expect(later.audienceScore).toBe(row.audienceScore)
      }
    },
    GUARD_TIMEOUT_MS,
  )

  // ── 5. theatricalRuns (player) ───────────────────────────────────────────
  // v1-read fields: `productionId` (join key to the released film),
  // `conceptId` (identity/join, harmless to protect), `releaseTick` (redundant
  // with the film's own, still part of the run-status arithmetic),
  // `totalWeeks` (the other half of "player releaseTick + totalWeeks − 1"),
  // `status` (the most direct signal of "settled" vs "in release at the
  // boundary" — §5.1's "in run at B" treatment). `weeklyGross`, `studioShare`,
  // `cumulativeGrossPaid`, `cumulativeStudioRevenuePaid` and
  // `economyModelVersion` are NOT asserted: no v1 archetype reads the
  // intra-run curve or the blended-share bookkeeping, only the film's own
  // already-settled `boxOffice.total` (root 1) and the run-status arithmetic
  // above.
  it(
    'wave-r-retention-theatrical-runs',
    async () => {
      const { w1, w2 } = await campaignRun()
      const w1Runs: TheatricalRun[] = w1.theatricalRuns
      const w2Runs: TheatricalRun[] = w2.theatricalRuns
      expect(w1Runs.length).toBeGreaterThan(0)
      const w2ById = byId(w2Runs, (r) => r.productionId)
      for (const row of w1Runs) {
        const later = w2ById.get(row.productionId)
        if (!later) throw new Error(`RED: theatricalRuns row ${row.productionId} present at W1=${W1} is gone at W2=${W2}`)
        expect(later.conceptId).toBe(row.conceptId)
        expect(later.releaseTick).toBe(row.releaseTick)
        expect(later.totalWeeks).toBe(row.totalWeeks)
        // status: 'active' at W1 legitimately becomes 'completed' by W2 (a
        // run finishing is not data loss); a run already 'completed' or
        // 'legacyCompleted' at W1 must stay exactly that at W2.
        if (row.status !== 'active') {
          expect(later.status).toBe(row.status)
        }
      }
    },
    GUARD_TIMEOUT_MS,
  )

  // ── 6. technology.adoptions ───────────────────────────────────────────────
  // v1-read fields (technology-pioneer, §5.3 amendment 4): `id` (stable ID,
  // used directly as a contrary ref), `studioId`, `technologyId`,
  // `operationalWeek` (the pioneer/late-window arithmetic), `cancelledWeek`
  // ("not cancelled" + amendment 4's "S's own earliest operational,
  // non-cancelled adoption"). `committedWeek`, `equipmentCost`,
  // `installationCost`, `route`, `physicalProjectIds`, `components`,
  // `equipmentAssetId` are not read by the pioneer predicate and are not
  // asserted.
  it(
    'wave-r-retention-technology-adoptions',
    async () => {
      const { w1, w2 } = await campaignRun()
      const w1Adoptions: TechnologyAdoption[] = w1.technology.adoptions
      const w2Adoptions: TechnologyAdoption[] = w2.technology.adoptions
      expect(w1Adoptions.length).toBeGreaterThan(0)
      const w2ById = byId(w2Adoptions, (a) => a.id)
      for (const row of w1Adoptions) {
        const later = w2ById.get(row.id)
        if (!later) throw new Error(`RED: technology.adoptions row ${row.id} present at W1=${W1} is gone at W2=${W2}`)
        expect(later.studioId).toBe(row.studioId)
        expect(later.technologyId).toBe(row.technologyId)
        expect(later.operationalWeek).toBe(row.operationalWeek)
        expect(later.cancelledWeek).toBe(row.cancelledWeek)
      }
    },
    GUARD_TIMEOUT_MS,
  )
})
