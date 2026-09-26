// ── P14A.3-T1 bridge tests 1–7 — the world route facts ──────────────────────
//
// Authority: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
// ("P14A.3 — World route facts — task expansion", the Companion basis / Settled
// law / Engine today / Scope / Tests / OPEN / Audit paragraphs, WITH the applied
// audit amendments: test 6 targets the TypeScript unions plus the ONE true wire
// enum rather than a non-existent schema enumeration; test 5 is NON-VACUOUS by
// construction; the settling line is `decisionWeek <= week + 1` while open, not
// a narrower `===`), by reference docs/engineering/p14-preparation-8ef5246a/
// P14-PREPARATION-COMPANION.md §2.1.11 ("World route (P14A.3)") and §2.1.10/R11.
// The landed A.1 wire (`e575fc1`/`562cdf2`, projection 42) and the landed A.2
// wire (`bridge/market.ts`, `a0611b8`, projection 43, T3 closed `bf8b2e4`) are
// reused throughout: `bridge/people.ts` (`marketCaseProjection`, `peopleProjection`,
// the Profile's `presence`/`marketCase` blocks), `bridge/market.ts` (`marketPage`,
// `selected.marketCase`), `bridge/industry.ts` (`industryPage`, `view:'studio'`),
// `src/core/presence.ts` (`studioPresence`, `PresenceEngagement`, `PresenceCredit`),
// `src/core/talentMarket.ts` exports, and `src/core/types.ts` (`FacilityCapability`).
//
// RED-BY-DESIGN: `bridge/world.ts` DOES NOT EXIST AS A FILE in this tree (not
// merely a missing named export of an existing module — verified: `test -f
// bridge/world.ts` reports absent, 2026-09-18). Importing `personWorldRoute`
// from it therefore fails Vite/esbuild MODULE RESOLUTION for this entire file,
// before any describe/it body runs — the strongest, least-ambiguous form of
// this repo's RED-first rule (mirrors tests/bridge-p14a2-market.test.ts's own
// header for `bridge/market.ts`, which was equally absent at that file's T1).
// `personWorldRoute` is imported AND CALLED in every group whose own fact
// depends on it (1, 2, 3, 4, 5's retained clause, 7), per the repo's RED-first
// convention, so the RED cause is never a coincidental regex. Group 6 (the
// TypeScript-union/wire-enum negative pin) needs no call — it is a pin against
// ALREADY-LANDED code, unrelated to the not-yet-existing module — and does not
// call it; the file's RED cause is the top-level import regardless.
//
// ASSUMED SIGNATURES (interpretations — no such module exists anywhere in this
// tree to copy from; only the fields this file actually reads are asserted,
// and every invented name is called out here so the implementer is free to
// choose differently as long as the PINNED FACTS below hold):
//   - `personWorldRoute(state, talentId)` → `{ statusLine: string | null,
//     caseRef: { view: 'market'; targetId: string } | null, reach: 'playerLot'
//     | 'industry' }` — exactly the plan's own `StudioWorldRouteSnapshot` shape
//     and the plan's own two-parameter call (no `week`; `state.market.tick` is
//     already inside `state`). A local `WorldRouteSnapshot` type below is this
//     file's own interpretation, not an import from a schema that does not
//     carry this DTO yet.
//   - The CARRIER fields scope item (2) names (the roster row's
//     `worldStatusLine`; the Industry person row's `caseStatusLine`/`caseRef`)
//     are T2 wiring, not yet on `BridgeRosterRowSnapshot` or the Industry
//     `Person` row's OWN type — this file reads them through a defensive
//     `as unknown as {...}` cast past the not-yet-widened shape, exactly
//     tests/bridge-p14a2-market.test.ts's own convention for `IndustryQuery`'s
//     not-yet-widened `view` enumeration (that file's `marketQuery` helper).
//   - `personWorldRoute`'s `statusLine` candidate copy is quoted VERBATIM from
//     the plan's own scope item (1): `Renewal window open · decides Week N`
//     (open, not settling) and `Decides next week · Week N` (settling, i.e.
//     `decisionWeek <= week + 1` while still open) — U+00B7 MIDDLE DOT, not a
//     bullet or em dash. The plan's own OPEN section flags this exact copy as
//     CANDIDATE, not Owner-decided; this file pins the plan's candidate text
//     to test-to-the-plan, and the pin is expected to move if the Owner later
//     rules differently (recorded, not resolved here).
//
// UNSTATED BY THE PLAN (named, not guessed): whether `caseRef` itself goes
// null once a case closes. The plan states this explicitly for `statusLine`
// ("null for every closed case") but says nothing about `caseRef`'s nullity
// after close — and the underlying facts it composes (`caseForTalent`,
// `marketCaseProjection`, `marketPage`'s own `selected.marketCase`) all stay
// NON-NULL for a settled case (proven GREEN today: tests/bridge-p14a1-market
// .test.ts group 6; tests/bridge-p14a2-market.test.ts group 4's second test).
// This file therefore does not assert `caseRef`'s value after close anywhere
// (test 3 checks `statusLine` only past week 52); a future implementation is
// free to choose either reading without breaking a test here.
//
// PREMISES NOT SATISFIED (named, not invented — reproduced 2026-09-18 via
// disposable `vite-node` probe scripts against the REAL, already-landed
// engine, never against invented data; every probe script was deleted before
// this commit):
//   - Test 5's DEPARTURE clause, AS THE PLAN LITERALLY DESCRIBES IT ("sign a
//     person on a short term, let a rival proposal at a higher tier win the
//     expiry case"), DOES NOT SETTLE under the landed law. Every founding
//     rival roster holds EXACTLY `RIVAL_TEAM_ROLES` (writer 1, director 1,
//     actor 3, craft 1 — src/core/hollywoodStartingData.ts) with ZERO slack,
//     so `survivesFreeze`'s `noSeatForRole` gate (src/core/talentMarket.ts
//     ~936–947) drops ANY rival bid on a player's employee before the first
//     natural churn (week 196, the renewal window for every 208-week founding
//     contract) — reproduced by manually submitting a single, uncontested
//     rival proposal at week 45 (tier 1.25, term 52): the case settles
//     'declined' / 'all proposals dropped', never to the rival. At the first
//     natural churn itself (week 208, term matched to 208) 2–3 rival
//     businesses per seed DO submit a bid (`rivalProposalTrigger` condition
//     (b)/(c)) — but EVERY one is still dropped `noSeatForRole` in 3/3 probed
//     seeds, because each bidding rival's OWN same-role retention case
//     (condition (a), unconditional) settles EARLIER in the SAME weekly
//     settlement pass (`talentMarket.ts` `openCasesAt` array order,
//     `hollywood.activeEmploymentOrdinals` insertion order) and refills its
//     own seat before the player's case is evaluated. A blind scan for a
//     genuine, PERSISTENT post-entry seat deficit across two churn cycles
//     (weeks 0–416, one seed, all four RIVAL_TEAM_ROLES roles) found none —
//     every "short" studio the scan found had simply not yet entered the
//     industry (a DIFFERENT freeze cause, `issuerNotEntered`, equally fatal
//     to a bid). This is a real, reproducible gap between the plan's assumed
//     construction and the landed seat-budget law, not an invented one.
//     Ruling P14A.3-T2b: this specific "moved" construction stays
//     unconstructible, but the REQUIREMENT it serves (a departure happens at
//     the effective week only) is satisfiable through a DIFFERENT genuine
//     construction — group 5 now carries a real `it` (not `it.todo`) that
//     withdraws the player's own proposal on the same open case and lets the
//     seat law itself decline the rival's uncontested bid; see evidence 01
//     §group-5-departure-probe for the original obstacle probe and evidence
//     10b for the T2b re-expression probe.
//   - Test 5's ARRIVAL clause (the audit's own escape hatch: "if the
//     construction cannot be made to settle for the player ... becomes an
//     `it.todo`") does not settle either, for a DIFFERENT reason: a player
//     proposal above a rival's own incumbent bid, on a rival-employee's
//     first-cycle case (week 208 — the only case reachable before the player
//     could plausibly have grown its own standing through play), is
//     out-Copelanded by the rival's own studio Standing in 3/3 probed seeds —
//     the rival wins BOTH the `standing` and `incumbency` descriptors outright
//     (`chooseProposal`/`bandsFor`/`STANDING_BAND_TOLERANCE = 5`). A freshly
//     generated player studio's mean standing stays flat absent any player
//     production (~41.7 at week 208 across audienceAwareness/industryPrestige
//     /commercialConfidence: 35.0/40/50 in the probed seed) while an
//     established rival's own business grows autonomously by its own P12
//     simulation (~73.1 at week 208: 34.0/88.9/96.3 in the same seed) — a gap
//     far outside the ±5 tolerance band. Growing the player's own standing
//     needs real production activity across many weeks, which is out of this
//     read-model slice's scope ("no engine edit ... nothing else"). See
//     `it.todo` in group 5 and evidence 01 §group-5-arrival-probe.
//   - Group 6's negative pin against `FacilityCapability`/`PresenceEngagement`
//     /`PresenceCredit` is a TYPE-LEVEL exhaustiveness check (an object
//     literal or a `switch` that fails to compile the moment the union gains
//     or loses a member), not a runtime enumeration — TypeScript unions do not
//     exist at runtime to introspect directly. This is the standard idiom for
//     pinning a union's exact member set from a test file; it is corroborated
//     with a real generated world's own observed `credit` values (never
//     invented).
//
// SCENARIOS reuse A.1/A.2's proven constructions (`signActor`,
// `openCaseWithBothProposals`, the genuine T0 fixtures under
// `tests/fixtures/p14/legacy-v28-*` / `tests/fixtures/p13b/legacy-v27-*`,
// named in `tests/fixtures/p13b/PROVENANCE.md`), never a hand-forged price or
// receipt.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { peopleProjection } from '../bridge/people.ts'
import { industryPage } from '../bridge/industry.ts'
import { marketPage } from '../bridge/market.ts'
import { BridgeSession } from '../bridge/session.ts'
// NOT-YET-EXISTING: bridge/world.ts does not exist in this tree at all. This
// import is this file's RED cause — Vite/esbuild fails MODULE RESOLUTION here,
// before any test body runs.
import { personWorldRoute } from '../bridge/world.ts'
import { activeContract, applyActions, hiringMarketIds, tick } from '../src/core/index.js'
import type { GameState, FacilityCapability } from '../src/core/types.js'
import { caseForTalent, proposalDraft, submitProposal, withdrawProposal } from '../src/core/talentMarket.js'
import { LIVE_SAVE_VERSION } from '../src/core/save.js'
import { studioPresence } from '../src/core/presence.js'
import type { PresenceCredit, PresenceEngagement } from '../src/core/presence.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

// This file's own interpretation of the plan's `StudioWorldRouteSnapshot` —
// see the header's ASSUMED SIGNATURES note.
type WorldRouteSnapshot = {
  statusLine: string | null
  caseRef: { view: 'market'; targetId: string } | null
  reach: 'playerLot' | 'industry'
}

// ── fixture helpers (reused/re-expressed from tests/bridge-p14a1-market.test.ts
//    and tests/bridge-p14a2-market.test.ts) ──────────────────────────────────

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

/**
 * Walks a FRESH p13a world week by week (never a magic week) to the FIRST week
 * a case exists whose `subjectStudioId` is NOT the player — i.e. the rival's
 * own person, reached only from the Industry roster and the profile per the
 * companion (§2.1.11), never a physical rival lot. Bounded, and throws loudly
 * (a fixture assumption, not a silent skip) if the bound is too low.
 */
function firstRivalOpenCase(seed: string, maxWeek = 260): { state: GameState; talentId: string; rivalStudioId: string } {
  let state: GameState = p13aGeneratedStudio(seed)
  const playerStudioId = state.hollywood!.playerStudioId
  while (state.market.tick < maxWeek) {
    state = tick(state)
    const week = state.market.tick
    for (const kase of state.talentMarket.cases) {
      if (kase.subjectStudioId === playerStudioId) continue
      const view = caseForTalent(state, kase.talentId, week)!
      if (view.status === 'discovered' || view.status === 'proposals_open') {
        return { state, talentId: kase.talentId, rivalStudioId: kase.subjectStudioId }
      }
    }
  }
  throw new Error(`fixture assumption failed: no rival-subject open case found by week ${String(maxWeek)} on seed "${seed}"`)
}

const load = (relative: string) => gunzipSync(readFileSync(new URL(relative, import.meta.url))).toString('utf8')
function assertSha256(json: string, expected: string) {
  expect(createHash('sha256').update(json).digest('hex')).toBe(expected)
}

// tests/fixtures/p13b/PROVENANCE.md — V27/V28 sections (P14A.1-T0 / P14A.2-T0).
const V27_RENEWAL_WINDOW = { file: './fixtures/p13b/legacy-v27-renewal-window-456.json.gz', sha256: 'af659268eddcc78da0b893056ba97794a3ed0a159488cb3de36e155b3ec1fa3f', week: 456 }
const V28_OPEN_CASE_45 = { file: './fixtures/p14/legacy-v28-open-case-45.json.gz', sha256: 'c9ff26fe70b7216784bf5718ed26d2bef10df8ca836b05050f5e1d7bcaac8afd', week: 45 }
const V28_SETTLED_208 = { file: './fixtures/p14/legacy-v28-settled-208.json.gz', sha256: '3a468e06925435503d75e2b07772d06d5a2020d26d653d897a8d82ed611d4e4c', week: 209 }
const V28_LEGACY_TERMINATIONS_20 = { file: './fixtures/p14/legacy-v28-legacy-terminations-20.json.gz', sha256: '6957a8570a5655c0c1bf3415024781f1e838ee7f93fd91f7965ced70ce653a32', week: 20 }

function studioQuery(sessionId: string, targetId: string): IndustryQuery {
  return {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId, requestId: 'r-studio', expectedStateRevision: 0,
    type: 'industryQuery', view: 'studio', targetId, page: 0, pageSize: 50, lane: 'recent', period: 'all',
  }
}

// ── group 1: PROJECTION_VERSION 45 / schema / converted law ─────────────────

describe('group 1: PROJECTION_VERSION 46 / schema / converted law', () => {
  it('PROJECTION_VERSION is 46; the schema $id and x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(52)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-52`)
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(52)
  })

  it('personWorldRoute answers for a freshly signed actor with no case yet — reach playerLot, statusLine null, caseRef null', () => {
    const { state, talentId } = signActor(p13aGeneratedStudio('p14a3-bridge-world-schema'), 52)
    // NOT YET EXISTING: personWorldRoute (bridge/world.ts) — this test's RED cause.
    const route = personWorldRoute(state, talentId) as WorldRouteSnapshot
    expect(route).toBeDefined()
    expect(route.statusLine).toBeNull()
    expect(route.caseRef).toBeNull()
    expect(route.reach).toBe('playerLot')
  })

  it('LIVE_SAVE_VERSION is 35 (stale title corrected post-C.4) under projection 46 — no persisted fact of A.3’s own, the converted law is unchanged', () => {
    expect(LIVE_SAVE_VERSION).toBe(37)
  })
})

// ── group 2: the player's own open case ──────────────────────────────────────

describe('group 2: the player\'s own open case — statusLine exact, caseRef, reach, presence, a person without a case', () => {
  it('legacy-v28-open-case-45: statusLine exact, caseRef.targetId, reach playerLot, presence.onLot true; the market page is byte-equal to the Profile; the roster row carries the same line; a person without a case reads null/null', () => {
    const json = load(V28_OPEN_CASE_45.file)
    assertSha256(json, V28_OPEN_CASE_45.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a3-bridge-world-open-case')
    const state = session.gameState
    const kase = state.talentMarket.cases[0]!
    const talentId = kase.talentId
    const view = caseForTalent(state, talentId, state.market.tick)!
    expect(view.decisionWeek).toBe(52) // sanity: the fixture's own known decision week (PROVENANCE)
    expect(view.subjectStudioId).toBe(state.hollywood!.playerStudioId) // sanity: the player's own employee

    // NOT YET EXISTING: personWorldRoute — this test's RED cause.
    const route = personWorldRoute(state, talentId) as WorldRouteSnapshot
    expect(route.statusLine).toBe(`Renewal window open · decides Week ${String(view.decisionWeek)}`)
    expect(route.caseRef).toEqual({ view: 'market', targetId: talentId })
    expect(route.reach).toBe('playerLot')

    const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)!
    expect(profile.presence.onLot).toBe(true)

    const page = marketPage(state, { view: 'market', targetId: talentId })
    expect(page.selected).not.toBeNull()
    expect(page.selected!.marketCase).toEqual(profile.marketCase)

    // Carrier (T2 scope, not yet on the wire): the roster row's own
    // `worldStatusLine` — cast past the not-yet-widened `BridgeRosterRowSnapshot`
    // shape (mirrors tests/bridge-p14a2-market.test.ts's `marketQuery` cast
    // convention for a not-yet-widened wire member).
    const rosterRow = peopleProjection(state).roster.rows.find((r) => r.talentId === talentId) as unknown as { worldStatusLine?: string | null } | undefined
    expect(rosterRow).toBeDefined()
    expect(rosterRow!.worldStatusLine).toBe(route.statusLine)

    // A person without a case reads null/null.
    const noCase = state.talent.find((t) => caseForTalent(state, t.id, state.market.tick) === null)
    expect(noCase).toBeDefined()
    const noCaseRoute = personWorldRoute(state, noCase!.id) as WorldRouteSnapshot
    expect(noCaseRoute.statusLine).toBeNull()
    expect(noCaseRoute.caseRef).toBeNull()
  })
})

// ── group 3: the settling line ───────────────────────────────────────────────

describe('group 3: the settling line — decisionWeek <= week + 1 while open, null after close', () => {
  it('legacy-v28-open-case-45 walked from 45 to 51 (the settling text) and past 52 (null, closed)', () => {
    const json = load(V28_OPEN_CASE_45.file)
    assertSha256(json, V28_OPEN_CASE_45.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a3-bridge-world-settling')
    const talentId = session.gameState.talentMarket.cases[0]!.talentId

    // At load (week 45, decisionWeek 52): 52 − 45 = 7 > 1, the plain OPEN text.
    // NOT YET EXISTING: personWorldRoute — this test's RED cause.
    const at45 = personWorldRoute(session.gameState, talentId) as WorldRouteSnapshot
    expect(at45.statusLine).toBe('Renewal window open · decides Week 52')

    // Week 51: decisionWeek(52) <= week(51) + 1 — the SETTLING text (the landed
    // A.2 rule, bridge/market.ts ~line 260, not a narrower `===`).
    const at51 = advanceTo(session.gameState, 51)
    expect(caseForTalent(at51, talentId, 51)!.status).toBe('proposals_open') // sanity: the engine's own status, still open
    const routeAt51 = personWorldRoute(at51, talentId) as WorldRouteSnapshot
    expect(routeAt51.statusLine).toBe('Decides next week · Week 52')

    // Past 52: the case has settled — null, every closed case.
    const at53 = advanceTo(at51, 53)
    expect(caseForTalent(at53, talentId, 53)!.status).toBe('settled')
    const routeAt53 = personWorldRoute(at53, talentId) as WorldRouteSnapshot
    expect(routeAt53.statusLine).toBeNull()
  })
})

// ── group 4: a rival's person ────────────────────────────────────────────────

describe('group 4: a rival\'s person — off the player\'s lot, reach industry, the Industry row carries the line, no leak', () => {
  it('the first week a rival-subject case is open (never a magic week): onLot false, canLocate false, reach industry; the Industry roster row of that studio carries caseStatusLine/caseRef; the rival\'s tier/salary (non-1.00) appear nowhere', () => {
    const found = firstRivalOpenCase('p14a3-bridge-world-rival-case')
    const { talentId, rivalStudioId } = found
    const week = found.state.market.tick
    const view = caseForTalent(found.state, talentId, week)!
    expect(view.subjectStudioId).toBe(rivalStudioId) // sanity: genuinely a rival subject, never the player's

    // A controlled, non-1.00 tier for the leak check (mirrors tests/bridge-
    // p14a1-market.test.ts group 5's amendment: tier 1.00 can coincide with an
    // otherwise-public number, so the leak check uses a tier that is not).
    const state = submitProposal(found.state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 208, premiumTier: 1.1 })
    const rivalDraft = proposalDraft(state, rivalStudioId, talentId, 208, 1.1, week)

    // NOT YET EXISTING: personWorldRoute — this test's RED cause.
    const route = personWorldRoute(state, talentId) as WorldRouteSnapshot
    expect(route.reach).toBe('industry')
    expect(route.statusLine).toBe(`Renewal window open · decides Week ${String(view.decisionWeek)}`)
    expect(route.caseRef).toEqual({ view: 'market', targetId: talentId })

    const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)!
    expect(profile.presence.onLot).toBe(false)
    expect(profile.presence.canLocate).toBe(false)

    const studioRoster = industryPage(state, 'p14a3-bridge-world-rival-case', 0, studioQuery('p14a3-bridge-world-rival-case', rivalStudioId)).people
    const row = studioRoster.find((p) => p.talentId === talentId) as unknown as
      { caseStatusLine?: string | null; caseRef?: { view: 'market'; targetId: string } | null } | undefined
    expect(row).toBeDefined()
    expect(row!.caseStatusLine).toBe(route.statusLine)
    expect(row!.caseRef).toEqual(route.caseRef)

    // Leak check, every serialization surface this file can reach: the rival's
    // real tier/salary/bonus appear nowhere in the Profile, the world route, or
    // the Industry studio-roster JSON.
    const leakSurfaces = JSON.stringify({ profile, route, studioRoster })
    expect(leakSurfaces).not.toContain(String(rivalDraft.annualSalary))
    expect(leakSurfaces).not.toContain(String(rivalDraft.signingBonus))
  })
})

// ── group 5: the effective-week law from receipts — NON-VACUOUS by construction ─

describe('group 5: the effective-week law from receipts (settled-208 carries no player contract — never used for a player-lot fact; the stayed/moved-away/won-over sets are built through the engine, never read off an empty fixture)', () => {
  it('the retained clause: genuine legacy-v28-open-case-45 (player 1.25 vs rival 1.00, decided 52) stays on the player\'s lot at 51, 52 and 53; the stayed set is asserted non-empty', () => {
    const json = load(V28_OPEN_CASE_45.file)
    assertSha256(json, V28_OPEN_CASE_45.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a3-bridge-world-retained')
    const talentId = session.gameState.talentMarket.cases[0]!.talentId
    const playerStudioId = session.gameState.hollywood!.playerStudioId

    let stateAt53: GameState | null = null
    for (const week of [51, 52, 53]) {
      const state = advanceTo(session.gameState, week)
      if (week === 53) stateAt53 = state
      expect(activeContract(state, talentId, week)).toBeDefined() // never a gap: retained straight through
      // NOT YET EXISTING: personWorldRoute — this test's RED cause.
      const route = personWorldRoute(state, talentId) as WorldRouteSnapshot
      expect(route.reach).toBe('playerLot')
      const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)!
      expect(profile.presence.onLot).toBe(true)
    }
    const receipt = [...stateAt53!.talentMarket.receipts].reverse().find((r) => r.talentId === talentId && r.kind === 'settled')!
    expect(receipt.studioId).toBe(playerStudioId) // genuinely retained by the player, not a vacuous read
    const stayed = stateAt53!.hollywood!.employment.filter((e) => e.studioId === playerStudioId && e.terms.talentId === talentId)
    expect(stayed.length).toBeGreaterThan(0) // the stayed set, asserted non-empty
  })

  // OBSTACLE, STILL TRUE for this ONE construction (probed 2026-09-18,
  // disposable vite-node scripts against the real engine, deleted before
  // that commit — see the file header's PREMISES NOT SATISFIED note and
  // evidence 01 §group-5-departure-probe): the plan's own recipe ("sign a
  // person on a short term, let a rival proposal at a higher tier win the
  // expiry case") does not settle under the landed law. Every founding rival
  // roster holds EXACTLY RIVAL_TEAM_ROLES (writer 1, director 1, actor 3,
  // craft 1 — src/core/hollywoodStartingData.ts) with ZERO slack, so
  // survivesFreeze's noSeatForRole (src/core/talentMarket.ts ~936–947) drops
  // any rival bid on a player employee before the first natural churn (week
  // 196, the renewal window for every 208-week founding contract): reproduced
  // by a manual, uncontested rival proposal at week 45 (declined, "all
  // proposals dropped"). At the first churn itself (week 208) 2-3 rival
  // businesses per seed DO submit a bid (rivalProposalTrigger condition
  // (b)/(c)), but every one is STILL dropped noSeatForRole in 3/3 probed seeds:
  // each bidding rival's OWN same-role retention case (condition (a),
  // unconditional) settles EARLIER in the same weekly settlement pass
  // (talentMarket.ts openCasesAt array order) and refills its own seat before
  // the player's case is evaluated. A blind scan for a genuine, persistent
  // post-entry seat deficit across two churn cycles (weeks 0-416, one seed,
  // all four roles) found none — every "short" studio the scan found had
  // simply not yet entered the industry (a different, equally fatal freeze
  // cause). This is a real, reproducible gap between the plan's assumed
  // "moved" construction and the landed seat-budget law.
  //
  // RE-EXPRESSED (ruling P14A.3-T2b, probed 2026-09-18, disposable vite-node
  // script against the real engine and the genuine V28_OPEN_CASE_45 bytes,
  // deleted before this commit — evidence 10b): the REQUIREMENT the "moved"
  // recipe was meant to exercise — a departure happens at the effective week
  // only — does not need a rival WINNER to be genuine. On the same fixture
  // used by the retained clause above (player 1.25 vs rival 1.00, decided
  // 52), WITHDRAWING the player's own proposal leaves only the rival's
  // uncontested 1.00 bid — and the seat law that blocked every "moved"
  // attempt blocks this bid too: `noSeatForRole` drops it, nobody wins, the
  // case settles `declined` / "all proposals dropped" at the decision week
  // exactly. The person is confirmed on the lot through week 51 (the
  // withdrawal changes nothing early) and off the lot at week 52 (the case's
  // own decision week) — a genuine, non-vacuous departure at the effective
  // week, constructed from the landed law rather than against it.
  it('the departure clause, re-expressed through the declined outcome: on genuine legacy-v28-open-case-45, WITHDRAWING the player\'s own proposal leaves only the rival\'s uncontested 1.00 bid, which the seat law itself drops (noSeatForRole) — onLot stays true through week 51 (no early presence change), the case settles declined/"all proposals dropped" at week 52 exactly, and the person is off the lot at 52', () => {
    const json = load(V28_OPEN_CASE_45.file)
    assertSha256(json, V28_OPEN_CASE_45.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a3-bridge-world-departure')
    const talentId = session.gameState.talentMarket.cases[0]!.talentId
    const playerStudioId = session.gameState.hollywood!.playerStudioId
    const rivalProposal = session.gameState.talentMarket.proposals.find((p) => p.talentId === talentId && p.issuerStudioId !== playerStudioId)!
    expect(rivalProposal).toBeDefined() // sanity: the fixture's own known second proposal
    const rivalStudioId = rivalProposal.issuerStudioId
    const rivalName = session.gameState.hollywood!.identities.find((s) => s.studioId === rivalStudioId)!.name

    let state = withdrawProposal(session.gameState, talentId, playerStudioId)
    expect(state.talentMarket.proposals.filter((p) => p.talentId === talentId).map((p) => p.issuerStudioId)).toEqual([rivalStudioId]) // only the rival's bid remains on the table

    // Weeks between the withdrawal (45) and the decision week (52): the case
    // stays open, and presence never changes early.
    for (const week of [46, 47, 48, 49, 50, 51]) {
      state = advanceTo(state, week)
      expect(caseForTalent(state, talentId, week)!.status).toBe('proposals_open') // still open, never settles early
      const profile = peopleProjection(state).profiles.find((p) => p.talentId === talentId)!
      expect(profile.presence.onLot).toBe(true) // no presence change between the withdrawal and 52
    }

    const at52 = advanceTo(state, 52)
    expect(caseForTalent(at52, talentId, 52)!.status).toBe('declined')
    const kase = at52.talentMarket.cases.find((c) => c.talentId === talentId)
    expect(kase).toBeDefined() // the case exists — never a silent pass
    expect(kase!.outcome).toBe('declined')
    expect(kase!.reason).toBe('all proposals dropped')

    const declineReceipts = at52.talentMarket.receipts.filter((r) => r.talentId === talentId && r.kind === 'declined')
    expect(declineReceipts.length).toBe(1) // the receipt exists — exactly one
    const reason = declineReceipts[0]!.reasons[0]!
    expect(reason.includes(rivalStudioId) || reason.includes(rivalName)).toBe(true) // names the rival whose bid was dropped
    expect(reason.toLowerCase()).toContain('seat') // noSeatForRole specifically, not some other freeze predicate

    expect(activeContract(at52, talentId, 52)).toBeUndefined() // no contract survives — genuinely off, not a stale projection
    const profileAt52 = peopleProjection(at52).profiles.find((p) => p.talentId === talentId)!
    expect(profileAt52.presence.onLot).toBe(false) // departs at the effective week exactly
  })

  // OBSTACLE (probed 2026-09-18, disposable vite-node script, deleted before
  // this commit — see evidence 01 §group-5-arrival-probe; this is the audit's
  // own named escape hatch, "if the construction cannot be made to settle for
  // the player ... becomes an it.todo"): a player proposal above a rival's own
  // incumbent bid on a rival-employee's first-cycle case (week 208, the only
  // case reachable before the player could plausibly have grown its own
  // standing through play) is out-Copelanded by the rival's own studio
  // Standing in 3/3 probed seeds — the rival wins BOTH the standing and
  // incumbency descriptors outright (chooseProposal/bandsFor,
  // STANDING_BAND_TOLERANCE = 5): a freshly generated player studio's mean
  // standing stays flat absent any player production (~41.7 at week 208 in the
  // probed seed: audienceAwareness 35.0, industryPrestige 40, commercial
  // Confidence 50) while an established rival's own business grows
  // autonomously through its own P12 simulation (~73.1 at week 208 in the same
  // seed: 34.0/88.9/96.3) — a gap far outside the +-5 tolerance band. Growing
  // the player's own standing needs real production activity across many
  // weeks, out of this read-model slice's own scope ("no engine edit ...
  // nothing else").
  it.todo('the arrival clause: the player wins a rival-employee\'s case — BLOCKED, the rival\'s own established Standing (~73 at week 208, autonomous growth) beats the fresh player\'s Standing (~42, static absent player production) outright on both the standing and incumbency descriptors in 3/3 probed seeds — src/core/talentMarket.ts chooseProposal/bandsFor/STANDING_BAND_TOLERANCE')
})

// ── group 6: negative pins — the TypeScript unions and the ONE true wire enum ─

describe('group 6: negative pins — the TypeScript unions and the ONE true wire enum (no capability/marker/meeting concept added anywhere)', () => {
  it('FacilityCapability (src/core/types.ts) has exactly its five P13B members — no agency or intermediary member', () => {
    // Type-level exhaustiveness: this object literal fails to COMPILE (an
    // excess key, or a missing key) the moment FacilityCapability gains or
    // loses a member — the union cannot be introspected at runtime directly.
    const EXHAUSTIVE: Record<FacilityCapability, true> = {
      'development-casting': true,
      soundstage: true,
      'set-scenery': true,
      post: true,
      laboratory: true,
    }
    expect(Object.keys(EXHAUSTIVE).sort()).toEqual(['development-casting', 'laboratory', 'post', 'set-scenery', 'soundstage'])
  })

  it('PresenceEngagement and PresenceCredit (src/core/presence.ts) are exactly the P13B sets', () => {
    const ENGAGEMENT_EXHAUSTIVE: Record<PresenceEngagement, true> = {
      production: true, script: true, casting: true, research: true, roster: true,
    }
    expect(Object.keys(ENGAGEMENT_EXHAUSTIVE).sort()).toEqual(['casting', 'production', 'research', 'roster', 'script'])

    // Type-level exhaustive switch: the `default` branch's `never` assignment
    // fails to COMPILE the moment PresenceCredit gains a member not listed
    // here. Exercised for real over a generated world's own observed values —
    // never invented data.
    function assertCreditExhaustive(c: PresenceCredit): void {
      switch (c) {
        case 'writer':
        case 'director':
        case 'lead':
        case 'antagonist':
        case 'support':
        case 'craft':
        case 'auditionee':
        case 'scientist':
        case null:
          return
        default: {
          const neverValue: never = c
          throw new Error(`unexpected PresenceCredit member: ${String(neverValue)}`)
        }
      }
    }
    // A week-0 fresh world carries zero player contracts, and Presence
    // Projection V1 projects contracted people only — genuinely empty, not a
    // bug (probed 2026-09-18, evidence 10b: contracts 0, presence.people 0).
    // Put one real person on the lot through the engine first.
    const { state } = signActor(p13aGeneratedStudio('p14a3-bridge-world-credit-union'), 52)
    const presence = studioPresence(state)
    expect(presence.people.length).toBeGreaterThan(0) // sanity: genuinely exercised over real people
    for (const person of presence.people) assertCreditExhaustive(person.credit)
  })

  it('StudioPersonPresenceSnapshot.engagement (the Profile presence block\'s wire enum) equals PresenceEngagement exactly; credit stays nullable(text())', () => {
    const def = BRIDGE_SCHEMA.$defs.StudioPersonPresenceSnapshot as unknown as {
      properties: {
        engagement: { anyOf: readonly [{ enum: readonly string[] }, unknown] }
        credit: { anyOf: readonly [{ type: string }, unknown] }
      }
    }
    const wireEngagementValues = [...def.properties.engagement.anyOf[0].enum].sort()
    expect(wireEngagementValues).toEqual(['casting', 'production', 'research', 'roster', 'script'])
    expect(def.properties.credit.anyOf[0].type).toBe('string') // plain text on the wire, no enum
  })

  it('no key on any presence DTO in the JSON schema matches /marker|meeting/i', () => {
    const defs = BRIDGE_SCHEMA.$defs as unknown as Record<string, { properties?: Record<string, unknown> }>
    const presenceDefNames = Object.keys(defs).filter((name) => /presence/i.test(name))
    expect(presenceDefNames.length).toBeGreaterThan(0) // sanity: genuinely found the presence DTOs
    for (const name of presenceDefNames) {
      const keys = Object.keys(defs[name]!.properties ?? {})
      expect(keys.length).toBeGreaterThan(0) // sanity: a real, non-empty DTO
      for (const key of keys) expect(key).not.toMatch(/marker|meeting/i)
    }
  })
})

// ── group 7: save/load ────────────────────────────────────────────────────────

describe('group 7: save/load — V28 unchanged, the world route converts and round-trips', () => {
  it('a genuine V27 fixture converts with statusLine null for every person (no case exists anywhere in a converted state)', () => {
    expect(LIVE_SAVE_VERSION).toBe(37)
    const json = load(V27_RENEWAL_WINDOW.file)
    assertSha256(json, V27_RENEWAL_WINDOW.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a3-bridge-world-v27-load')
    const state = session.gameState
    expect(state.market.tick).toBe(V27_RENEWAL_WINDOW.week)
    expect(state.talent.length).toBeGreaterThan(0) // sanity: a real, non-empty roster
    for (const talent of state.talent) {
      // NOT YET EXISTING: personWorldRoute — this test's RED cause.
      const route = personWorldRoute(state, talent.id) as WorldRouteSnapshot
      expect(route.statusLine).toBeNull()
    }
  })

  it('the three genuine V28 T0 fixtures read byte-stable and the world route reads identically across the bridge save/load path', () => {
    for (const fixture of [V28_OPEN_CASE_45, V28_SETTLED_208, V28_LEGACY_TERMINATIONS_20]) {
      const json = load(fixture.file)
      assertSha256(json, fixture.sha256)
      const session = BridgeSession.fromSaveJson(json, `p14a3-bridge-world-v28-${String(fixture.week)}`)
      const saved = session.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'save-1', expectedStateRevision: session.stateRevision })
      expect(saved.accepted).toBe(true)
      if (!saved.accepted) throw new Error(`save refused: ${JSON.stringify(saved)}`)
      // P14B.1-T3 sweep (Save V29 is live): the load CONVERTS this genuine V28
      // fixture by law, so the re-save is V29 bytes — never the fixture's own sha,
      // which stays the provenance pin asserted on the file above.
      expect((JSON.parse(saved.saveJson) as { saveVersion: number }).saveVersion).toBe(37)
      const reloaded = BridgeSession.fromSaveJson(saved.saveJson, `p14a3-bridge-world-v28-reload-${String(fixture.week)}`)
      // A bounded sample: any case subject, plus the first five roster ids.
      const subjectIds = new Set(session.gameState.talentMarket.cases.map((c) => c.talentId))
      for (const t of session.gameState.talent.slice(0, 5)) subjectIds.add(t.id)
      expect(subjectIds.size).toBeGreaterThan(0) // sanity: a real, non-empty sample
      for (const talentId of subjectIds) {
        // NOT YET EXISTING: personWorldRoute — this test's RED cause.
        const before = personWorldRoute(session.gameState, talentId) as WorldRouteSnapshot
        const after = personWorldRoute(reloaded.gameState, talentId) as WorldRouteSnapshot
        expect(after).toEqual(before)
      }
    }
  })

  it('a fresh V28 state round-trips through the bridge save/load path and the world route reads identically on both sides', () => {
    const { state, talentId } = signActor(p13aGeneratedStudio('p14a3-bridge-world-roundtrip'), 52)
    const session = new BridgeSession(state, 'p14a3-bridge-world-roundtrip')
    const saved = session.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'save-1', expectedStateRevision: session.stateRevision })
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(`save refused: ${JSON.stringify(saved)}`)
    const parsed = JSON.parse(saved.saveJson) as { saveVersion: number }
    expect(parsed.saveVersion).toBe(37)
    const reloaded = BridgeSession.fromSaveJson(saved.saveJson, 'p14a3-bridge-world-roundtrip-reload')
    // NOT YET EXISTING: personWorldRoute — this test's RED cause.
    const before = personWorldRoute(session.gameState, talentId) as WorldRouteSnapshot
    const after = personWorldRoute(reloaded.gameState, talentId) as WorldRouteSnapshot
    expect(after).toEqual(before)
  })
})
