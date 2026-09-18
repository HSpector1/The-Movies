// ── P14A.2-T1 bridge tests 1–9 — the Talent Market workspace read models ────
//
// Authority: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
// ("P14A.2 — Talent Market workspace read models — task expansion": Settled law,
// Engine today, Scope items (1)–(4) with the FIXED ORDER of the four buckets and
// the live-bucket bound, Persisted facts none, OPEN items, Inherited limits, the
// audit paragraph, and the "Tests" paragraph, groups 1–9), by reference
// docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.11 ("Talent Market workspace (P14A.2)" and "Attention (Core and A.2)"),
// §2.1.8 ("Settlement"), and the disclosure row at line 92 ("after settlement:
// who the person joined and on what term length" — public, "folded by P14A.2's
// Pulse projection into one `retained` or `moved` activity from the two P12
// receipts... salary stays private"). The landed A.1 wire (`e575fc1`/`562cdf2`,
// projection 42): tests/bridge-p14a1-market.test.ts (all eight groups reused
// below — its fixture helpers `signActor`/`openCaseWithBothProposals`, its
// `parseWireValue` schema idiom, its `BridgeSession` quote/command sequence for
// group 8, and its group-6 pin that NO folded industry row exists yet, which
// THIS file's group 7 supersedes per the plan), `bridge/people.ts`
// (`marketCaseProjection`, the private `marketAttentionRows`,
// `MARKET_DECISION_STOP_HORIZON_WEEKS = 1`), `bridge/industry.ts` (the `view`
// dispatch and the two separate `expiry`/`replacement`|`player-contract`
// activity rows a settlement writes today — L102-106/239), `bridge/schema/
// industry-schema.ts` (the `view` enumeration and `StudioIndustryResponse`,
// which do not carry `'market'`/`.market` yet), `bridge/schema/bridge-schema.ts`
// (`PROJECTION_VERSION = 42`; the landed `StudioMarketCaseSnapshot`,
// `StudioMarketProposalSnapshot`, `StudioMarketAttentionRowSnapshot`,
// `StudioMarketPreferencesSnapshot`), `src/core/talentMarket.ts` exports, and
// `src/core/types.ts` (the V28 `TalentMarketState`/`TalentMarketReceipt` roots).
//
// RED-BY-DESIGN: `bridge/market.ts` DOES NOT EXIST AS A FILE in this tree (not
// merely a missing named export of an existing module — verified: `test -f
// bridge/market.ts` reports absent). Importing `marketPage`, `MARKET_CLOSED_
// PAGE_SIZE` and `MARKET_HISTORY_PAGE_SIZE` from it therefore fails Vite/esbuild
// MODULE RESOLUTION for this entire file, before any describe/it body runs —
// the strongest, least-ambiguous form of this repo's RED-first rule (contrast
// tests/bridge-p14a1-market.test.ts's header, which had to reason about a
// missing-NAMED-EXPORT hazard on EXISTING host modules; that hazard does not
// apply here because the module itself is absent). `marketPage` is imported
// AND CALLED in every group below that needs the page, per the repo's RED-first
// convention and the plan's own instruction, so the RED cause is never a
// coincidental regex.
//
// ASSUMED SIGNATURES (interpretations — no such module exists anywhere in this
// tree to copy from; only the fields this file actually reads are asserted, and
// every invented name is called out here so the implementer is free to choose
// differently as long as the PINNED FACTS below hold):
//   - `marketPage(state, request)` — the industry page builder for `view:
//     'market'`, analogous in call shape to the sibling builders `laboratoryPage`
//     / `officePage` / `plansPage` (each `(state, targetId, intents, page,
//     pageSize) => {...}`) and to the plan's own request description ("the
//     request carries `view: 'market'`, `targetId` (talentId or null) and
//     optional `page`/`historyPage` counts"). This file calls it as
//     `marketPage(state, { view: 'market', targetId, page?, historyPage? })`
//     returning `StudioMarketPage` directly (not wrapped in a full
//     `StudioIndustryResponse` envelope — `bridge/industry.ts`'s own `view`
//     dispatch is expected to wrap it at T2, exactly as it wraps `laboratoryPage`
//     today, and is NOT re-tested here beyond group 1's schema-shape check).
//   - `StudioMarketPage`, `StudioMarketCaseDetail` and their nested members:
//     EXACTLY the names and shapes given in the T1 task brief (reproduced in the
//     per-group comments below). Field names inside `StudioMarketCaseRow`,
//     `StudioMarketFreeAgentRow`, `StudioMarketOfferRow` and
//     `StudioMarketEmployerRow` beyond what a test literally reads are NOT
//     pinned — this file reads `talentId`, `decisionWeek`/`closedWeek` (ordering
//     only), `playerOffer`, `issuerStudioId`, price fields already named on the
//     landed `StudioMarketProposalSnapshot`, and interval fields already named
//     on the engine's own `IndustryEmployment`/`Contract`.
//   - the free agent row's "EXISTING hiring intent id": interpreted as the
//     row identifying itself through the ALREADY-EXISTING top-level intent kind
//     `'signContract'` (bridge/schema/intent-schema.ts `AVAILABLE_INTENT_KINDS`)
//     — the same kind `bridge/casting.ts`'s `signActorConversion` already mints
//     for any free agent via `castingDraftToEngine({kind:'signActor', ...})`.
//     No new intent kind is invented (matches the plan's own "no new intent
//     kind" scope line); this file cross-checks the row's carried ask against
//     that EXISTING conversion's own kind, not against an opaque per-instance id
//     (quotes are minted on demand into `session.pendingQuotes`, never sitting
//     pre-existing on a read-only page — there is no static id to reproduce).
//
// PREMISES NOT SATISFIED (named, not invented):
//   - Test 2's "two free agents... equal ask" secondary-key exercise: PROBED
//     empirically (disposable `vite-node` script against the REAL, already-
//     landed `playerOffer`/`marketEligibility`, never against invented data) —
//     25 generated seeds × 4 published terms × week 0, and a further 5 seeds at
//     week 40, zero exact-ask collisions among same-role free agents. The ask
//     formula's per-person jitter is keyed by `talent.id`
//     (`src/core/employment.ts` `stream(seed,'hiring','offer-'+talent.id)`), so
//     a same-stats clone under a fresh id draws a DIFFERENT jitter and does not
//     collide either. This file therefore exercises the PRIMARY free-agent order
//     (role, then ask descending) with two naturally-distinct asks and declares
//     the ask-tie / P12-ordinal / worldgen-index tie-break chain UNEXERCISED.
//   - The free-agent bucket's fourth tie-break key, "the person's worldgen index
//     ... an immutable in-state fact, named as such": grepped negative across
//     `src/core/types.ts` and `src/core/worldgen.ts` (`worldgenIndex`,
//     `seedIndex`, `birthOrdinal` — no match). No exported oracle for this fact
//     exists in this tree. Not exercised; not invented.
//   - Group 7's "correlated ONLY through the `settled` receipt's `eventId`
//     references": `src/core/types.ts`'s landed `TalentMarketReceipt` is
//     `{eventId, kind, week, talentId, studioId, reasons, dropped}` — it carries
//     no field referencing the P12 `expiry`/start `IndustryReceipt.eventId`s,
//     and the GREEN `tests/p14a1-settlement.test.ts` that cites the companion's
//     "referencing... by eventId" sentence never asserts such a field (grepped
//     negative for `eventId` in its body). This file therefore builds the
//     expected pairing through the only real, existing keys — `talentId` AND
//     `week`, joined against `state.hollywood.receipts` — which is unambiguous
//     because at most one case per talentId settles in a given week, and notes
//     that "by eventId" is not literally implemented under this name today.
//   - Group 2(ii)'s "settling" bucket: `src/core/talentMarket.ts`
//     `advanceTalentMarketWeek` settles every case whose decision week has
//     arrived UNCONDITIONALLY and SYNCHRONOUSLY, within the SAME call that
//     advances to that week (no early-return, no separate "pending" tick) — so
//     the engine's own `caseForTalent(...).status === 'decision_pending'` is
//     never observable after a normal `tick()`; it exists only transiently
//     inside `advanceTalentMarketWeek` before `settleCase` closes it in the same
//     pass. This file therefore builds the fixture EXACTLY as the task brief
//     specifies — a state held at week 51 whose case decides at week 52, where
//     `caseForTalent` itself still reads `'proposals_open'` — and pins that the
//     WORKSPACE's OWN "settling" bucket rule (decision week is the very next
//     authoritative week, i.e. the same one-week horizon as
//     `MARKET_DECISION_STOP_HORIZON_WEEKS`/`decisionWeekNear`) is what the
//     implementer must derive, not a literal read of the engine's `status`.
//   - Group 5's "`MARKET_HISTORY_PAGE_SIZE` bound... deterministic paging"
//     beyond a single page: no existing fixture in this tree carries enough
//     employer transitions for one person to overflow a page (every T0 fixture
//     has at most two intervals per subject). This file pins the bound and the
//     single-page shape; a genuine multi-page overflow is not exercised.
//
// SCENARIOS reuse A.1's proven constructions (`signActor`, `openCaseWithBoth
// Proposals`) and the genuine T0 fixtures (`tests/fixtures/p14/legacy-v28-*`,
// `tests/fixtures/p13b/legacy-v27-*`) named in `tests/fixtures/p13b/
// PROVENANCE.md`, never a hand-forged price or receipt.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, BRIDGE_SCHEMA, PROJECTION_VERSION } from '../bridge/schema/bridge-schema.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { peopleProjection, marketCaseProjection } from '../bridge/people.ts'
import { castingDraftToEngine } from '../bridge/casting.ts'
import { industryPage } from '../bridge/industry.ts'
import { BridgeSession } from '../bridge/session.ts'
// NOT-YET-EXISTING: bridge/market.ts does not exist in this tree at all. This
// import is this file's RED cause — Vite/esbuild fails MODULE RESOLUTION here,
// before any test body runs.
import { marketPage, MARKET_CLOSED_PAGE_SIZE, MARKET_HISTORY_PAGE_SIZE } from '../bridge/market.ts'
import { activeContract, applyActions, hiringMarketIds } from '../src/core/index.js'
import type { GameState } from '../src/core/types.js'
import {
  caseDisclosure, caseForTalent, currentProposals, marketEligibility, playerOffer, proposalDraft, submitProposal, UNKNOWN,
} from '../src/core/talentMarket.js'
import { LIVE_SAVE_VERSION } from '../src/core/save.js'
import { PERSON_DISCIPLINE_ORDER, ROLE_TO_DISCIPLINE } from '../src/core/tuning.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

// ── fixture helpers (reused/re-expressed from tests/bridge-p14a1-market.test.ts) ──

function signActor(state: GameState, termWeeks: number): { state: GameState; talentId: string } {
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  const signed = applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }])
  return { state: signed, talentId: actorId }
}

/** N distinct actors from the week-0 hiring market, signed in ARRAY ORDER for
 * the SAME term (so their cases share a decision week and their discovery
 * order in `state.talentMarket.cases` matches this function's own order). */
function signActorsSameTerm(seed: string, count: number, termWeeks: number): { state: GameState; talentIds: string[] } {
  const world = p13aGeneratedStudio(seed)
  const candidates = hiringMarketIds(world, 0)
  const actorIds = candidates
    .map((id) => world.talent.find((t) => t.id === id))
    .filter((t) => t?.role === 'actor')
    .slice(0, count)
    .map((t) => t!.id)
  if (actorIds.length < count) throw new Error(`fixture assumption failed: fewer than ${String(count)} actors in the week-0 hiring market`)
  const state = applyActions(world, actorIds.map((talentId) => ({ kind: 'signContract' as const, talentId, termWeeks })))
  return { state, talentIds: actorIds }
}

function openCaseWithBothProposals(seed: string, rivalPremiumTier = 1.0) {
  const { state: signed, talentId } = signActor(p13aGeneratedStudio(seed), 52)
  const atSubmission = advanceTo(signed, 45)
  const playerStudioId = atSubmission.hollywood!.playerStudioId
  const rivalStudioId = atSubmission.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
  let state = submitProposal(atSubmission, { talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
  state = submitProposal(state, { talentId, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: rivalPremiumTier })
  return { state, talentId, playerStudioId, rivalStudioId }
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

/** `bridge/industry.ts`'s own `view` enumeration does not carry `'market'` yet
 * (projection 42); the request is built with the widened shape the plan
 * describes and cast past the not-yet-widened wire type. */
function marketQuery(sessionId: string, targetId: string | null, page = 0, historyPage = 0): IndustryQuery {
  return {
    protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId, requestId: 'r-market', expectedStateRevision: 0,
    type: 'industryQuery', view: 'market', targetId, page, pageSize: 10, lane: 'recent', period: 'all', historyPage,
  } as unknown as IndustryQuery
}

// ── group 1: PROJECTION_VERSION / schema $id / view market / converted law ──

describe('group 1: PROJECTION_VERSION 44 / schema / view market / converted law', () => {
  it('PROJECTION_VERSION is 44; the schema $id and x-project-studio.projectionVersion move with it', () => {
    expect(PROJECTION_VERSION).toBe(44)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-44`)
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(44)
  })

  it('a view:"market" industry request validates against the wire schema, and marketPage answers it', () => {
    const { state } = signActor(p13aGeneratedStudio('p14a2-bridge-schema-market'), 52)
    const request = marketQuery('p14a2-bridge-schema-market', null)
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryRequest, request)).toEqual(request)
    // NOT YET EXISTING: marketPage (bridge/market.ts) — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: null })
    expect(page).toBeDefined()
  })

  it('LIVE_SAVE_VERSION stays 28 under projection 44 — no persisted fact, the converted law is unchanged', () => {
    expect(LIVE_SAVE_VERSION).toBe(29)
  })
})

// ── group 2: buckets — exactly one bucket per case, FIXED ORDER, paged closed ─

describe('group 2: buckets — one bucket per case, fixed order, paged closed', () => {
  it('two open cases sharing a decision week sort renewalWindow by discovery order; a settling case one week before its decision reads under settling, not renewalWindow', () => {
    const { state: signed, talentIds } = signActorsSameTerm('p14a2-bridge-buckets-renewal', 2, 52)
    const state = advanceTo(signed, 40) // both cases open at 40 (renewal window: endWeekExclusive 52 − 12)
    for (const talentId of talentIds) {
      const view = caseForTalent(state, talentId, state.market.tick)!
      // caseStatusAt: week 40 <= openedWeek 40, so the engine's own status is
      // 'discovered' at the very week the window opens (not yet 'proposals_open',
      // which reads true starting the following week) — the renewalWindow BUCKET
      // below is a decisionWeek fact, not a status fact, and is unaffected.
      expect(view.status).toBe('discovered') // sanity: both genuinely open (not settling), read the week they opened
    }
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: null })
    const renewalRows = page.cases.renewalWindow as Array<{ talentId: string }>
    const rowIds = renewalRows.map((r) => r.talentId)
    expect(rowIds).toEqual(talentIds) // discovery order (signing order), since both share decisionWeek 52
    expect(page.cases.settling).toEqual([])
    expect(page.cases.closed.rows).toEqual([])

    // The settling premise (see header): a state held at week 51 (one week
    // before decision 52) still reads 'proposals_open' from the engine itself —
    // advanceTalentMarketWeek settles unconditionally and synchronously at the
    // decision week, so 'decision_pending' is never observable after tick().
    const { state: settlingSigned, talentId: settlingSubject } = signActor(p13aGeneratedStudio('p14a2-bridge-buckets-settling'), 52)
    const settlingState = advanceTo(settlingSigned, 51)
    const settlingView = caseForTalent(settlingState, settlingSubject, settlingState.market.tick)!
    expect(settlingView.status).toBe('proposals_open') // engine's own status — see header premise
    expect(settlingView.decisionWeek).toBe(52)
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const settlingPage = marketPage(settlingState, { view: 'market', targetId: null })
    const settlingRows = settlingPage.cases.settling as Array<{ talentId: string }>
    expect(settlingRows.map((r) => r.talentId)).toContain(settlingSubject)
    expect((settlingPage.cases.renewalWindow as Array<{ talentId: string }>).map((r) => r.talentId)).not.toContain(settlingSubject)
  })

  it('every closed case in the settled-208 fixture is bounded by MARKET_CLOSED_PAGE_SIZE and pages deterministically across two reads; no case appears in a live bucket', () => {
    const json = load(V28_SETTLED_208.file)
    assertSha256(json, V28_SETTLED_208.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a2-bridge-buckets-closed')
    const state = session.gameState
    expect(state.talentMarket.cases.filter((c) => c.outcome === 'settled')).toHaveLength(24) // sanity: T0's own count
    expect(MARKET_CLOSED_PAGE_SIZE).toBeGreaterThan(0)
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page0 = marketPage(state, { view: 'market', targetId: null, page: 0 })
    expect(page0.cases.closed.pageSize).toBe(MARKET_CLOSED_PAGE_SIZE)
    expect(page0.cases.closed.total).toBe(24)
    expect(page0.cases.closed.rows.length).toBe(Math.min(24, MARKET_CLOSED_PAGE_SIZE))
    expect(page0.cases.renewalWindow).toEqual([])
    expect(page0.cases.settling).toEqual([])
    expect(page0.cases.freeAgents).toEqual([]) // no released/expired subject re-enters the market same-week in this fixture

    if (24 > MARKET_CLOSED_PAGE_SIZE) {
      const page1 = marketPage(state, { view: 'market', targetId: null, page: 1 })
      const seenPage0 = new Set((page0.cases.closed.rows as Array<{ talentId: string }>).map((r) => r.talentId))
      const seenPage1 = new Set((page1.cases.closed.rows as Array<{ talentId: string }>).map((r) => r.talentId))
      expect([...seenPage0].some((id) => seenPage1.has(id))).toBe(false) // disjoint pages
      expect(page1.cases.closed.rows.length).toBe(24 - MARKET_CLOSED_PAGE_SIZE)
      // Re-reading page 0 a second time must be byte-identical (deterministic).
      const page0Again = marketPage(state, { view: 'market', targetId: null, page: 0 })
      expect(page0Again.cases.closed.rows).toEqual(page0.cases.closed.rows)
    }
  })

  it('free agents: role in the fixed discipline order, then ask descending (equal-ask secondary key not exercised — see header premise)', () => {
    // The plan scopes this bucket to people in `state.freeAgents` whose
    // `marketEligibility` reads free-agent-signable at the read week — a
    // generated week-0 world starts with `state.freeAgents = []` (header
    // premise), so this fixture POPULATES the pool the way the engine itself
    // does: sign two actors and one writer, then early-release all three
    // (D-11.9), which the engine appends to `state.freeAgents` on release.
    // 'p14a2-bridge-buckets-free-agents' (the original seed) has zero writers
    // in the week-0 hiring market on this worldgen — probed empirically
    // (disposable vite-node script against p13aGeneratedStudio/hiringMarketIds,
    // no invented data) that '-v2' clears the bar (5 actors, 2 writers).
    // hiringMarketIds re-samples the rotating market FRESH against the live
    // signable universe (D-11.14): signing one person shrinks that universe and
    // can shift the deterministic draw for the rest. So each pick below is made
    // from a FRESH read of hiringMarketIds against the state as it stands right
    // before that person's own signContract — never a list pre-computed once
    // against the original world and then batch-applied, which on THIS seed
    // was tried first and demonstrated throwing D-11.14 on the second signing
    // (the shrunk universe re-samples a different set; see evidence 10b).
    let state = p13aGeneratedStudio('p14a2-bridge-buckets-free-agents-v2')
    const actorIds: string[] = []
    for (let i = 0; i < 2; i++) {
      const candidates = hiringMarketIds(state, 0)
      const next = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor' && !actorIds.includes(t.id))
      if (next === undefined) throw new Error(`fixture assumption failed: fewer than 2 actors reachable in sequence on this seed (found ${String(actorIds.length)})`)
      actorIds.push(next.id)
      state = applyActions(state, [{ kind: 'signContract', talentId: next.id, termWeeks: 52 }])
    }
    const writerCandidates = hiringMarketIds(state, 0)
    const writer = writerCandidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'writer')
    if (writer === undefined) throw new Error('fixture assumption failed: no writer reachable in sequence on this seed')
    const writerId = writer.id
    state = applyActions(state, [{ kind: 'signContract', talentId: writerId, termWeeks: 52 }])
    state = applyActions(state, [
      { kind: 'releaseTalent', talentId: actorIds[0]! },
      { kind: 'releaseTalent', talentId: actorIds[1]! },
      { kind: 'releaseTalent', talentId: writerId },
    ])
    const week = state.market.tick
    for (const id of [actorIds[0]!, actorIds[1]!, writerId]) {
      expect(state.freeAgents).toContain(id)
      expect(marketEligibility(state, id, week).status).toBe('free_agent')
    }
    // A role with two DIFFERENT asks, to exercise the ask-descending order —
    // the same jitter-by-id premise as the header note, probed on this seed.
    const askA = playerOffer(state, actorIds[0]!, 52, week).annualSalary
    const askB = playerOffer(state, actorIds[1]!, 52, week).annualSalary
    if (askA === askB) throw new Error('fixture assumption failed: the two released actors share an identical ask on this seed')
    const higher = askA > askB ? actorIds[0]! : actorIds[1]!
    const lower = askA > askB ? actorIds[1]! : actorIds[0]!
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: null })
    const rows = page.cases.freeAgents as Array<{ talentId: string; annualSalary: number; signable: boolean }>
    // The pool holds exactly the three people this fixture released: role in
    // the fixed discipline order (acting before writing), then ask descending
    // within one role.
    expect(rows.map((r) => r.talentId)).toEqual([higher, lower, writerId])
    expect(PERSON_DISCIPLINE_ORDER.indexOf(ROLE_TO_DISCIPLINE.actor)).toBeLessThan(PERSON_DISCIPLINE_ORDER.indexOf(ROLE_TO_DISCIPLINE.writer))
    expect(rows.every((r) => r.signable === true)).toBe(true)
    // The ask is re-derived at the read week through playerOffer, and the row
    // carries the EXISTING 'signContract' hiring path — no new intent kind.
    const conversion = castingDraftToEngine(state, { kind: 'signActor', signTalentId: higher, signTermWeeks: 52 } as never)
    expect(conversion.ok).toBe(true)
    if (conversion.ok) expect(conversion.kind).toBe('signContract')
  })
})

// ── group 3: attention — the five causes, deduplicated, fixed order ─────────

describe('group 3: workspace attention rows', () => {
  it('deduplicated per (cause, talentId), including termsRevised (a rival revision after the player proposed) and decisionWeekNear (one week before the decision)', () => {
    // 'p14a2-bridge-attention' (the original seed) has only 2 actors in the
    // week-0 hiring market on this worldgen — a fixture assumption, not a
    // requirement; probed empirically (disposable vite-node script against
    // p13aGeneratedStudio/hiringMarketIds, no invented data) that '-v2' clears
    // the bar with 3 (t-act-11, t-act-14, t-act-16).
    const { state: signed, talentIds } = signActorsSameTerm('p14a2-bridge-attention-v2', 3, 52)
    let state = advanceTo(signed, 51) // one week before decision 52 for all three
    const playerStudioId = state.hollywood!.playerStudioId
    const rivalStudioId = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const [subjectA, subjectB, subjectC] = talentIds as [string, string, string]
    // subjectC exercises termsRevised: player proposes, then the rival submits
    // TWICE (a genuine revision) before the read.
    state = submitProposal(state, { talentId: subjectC, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.25 })
    state = submitProposal(state, { talentId: subjectC, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.0 })
    state = submitProposal(state, { talentId: subjectC, issuerStudioId: rivalStudioId, termWeeks: 52, premiumTier: 1.05 })
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: null })
    const attention = page.attention as Array<{ cause: string; talentId: string; reason: string }>
    const KNOWN = ['decisionWeekNear', 'newCompetingProposal', 'termsRevised', 'settlementCompleted', 'proposalWouldFail']
    for (const row of attention) expect(KNOWN).toContain(row.cause)
    // decisionWeekNear fires for subjects A and B purely as the incumbent's own
    // subject studio (no proposal needed) — the SAME condition already landed
    // in bridge/people.ts marketAttentionRows.
    expect(attention.some((r) => r.cause === 'decisionWeekNear' && r.talentId === subjectA)).toBe(true)
    expect(attention.some((r) => r.cause === 'decisionWeekNear' && r.talentId === subjectB)).toBe(true)
    expect(attention.some((r) => r.cause === 'termsRevised' && r.talentId === subjectC)).toBe(true)
    // Deduplicated: no (cause, talentId) pair repeats.
    const seen = new Set<string>()
    for (const row of attention) {
      const key = `${row.cause}:${row.talentId}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
    // Fixed order: all three subjects share decisionWeek 52, so ties break by
    // discovery order (signing order) — talentIds[0], then [1], then [2] among
    // rows that share a cause-independent ordering key equal to their case.
    const order = attention.map((r) => talentIds.indexOf(r.talentId)).filter((i) => i >= 0)
    const sorted = [...order].sort((a, b) => a - b)
    // Rows for the SAME talentId stay contiguous under discovery-order-then-
    // cause grouping is an implementation detail; the minimal, defensible pin
    // is that no row for a LATER-discovered talentId precedes every row for an
    // EARLIER-discovered one when both are present for the same cause set —
    // asserted narrowly via decisionWeekNear, which both subjectA and subjectB carry.
    const decisionWeekNearOrder = attention.filter((r) => r.cause === 'decisionWeekNear').map((r) => talentIds.indexOf(r.talentId))
    expect(decisionWeekNearOrder).toEqual([...decisionWeekNearOrder].sort((a, b) => a - b))
    void sorted
  })
})

// ── group 4: candidate rail + offer comparison for `selected` ───────────────

describe('group 4: selected — candidate rail, offer comparison, settlement reasons/dropped', () => {
  it('the rail\'s case block is byte-equal to marketCaseProjection; the own row equals proposalDraft; every competing figure is UNKNOWN', () => {
    const { state, talentId, playerStudioId, rivalStudioId } = openCaseWithBothProposals('p14a2-bridge-selected-rail')
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: talentId })
    const detail = page.selected as {
      // `marketCase`, not `case`: the C# contract generator refuses the reserved
      // C# keyword as a wire member name (CF08-IDENTIFIER-COLLISION) — the plan's
      // pinned name is amended here to the landed member, already used by the
      // Profile for this same block.
      marketCase: unknown
      rail: { talentId: string; role: string; preferences: unknown }
      comparison: Array<{ issuerStudioId: string; premiumTier: unknown; annualSalary: unknown; signingBonus: unknown; termWeeks: number; effectiveWeek: number }>
    } | null
    expect(detail).not.toBeNull()
    const block = marketCaseProjection(state, talentId, playerStudioId)!
    expect(detail!.marketCase).toEqual(block) // by reference to the A.1 DTO, no drift
    expect(detail!.rail.talentId).toBe(talentId)
    expect(detail!.rail.role).toBe(state.talent.find((t) => t.id === talentId)!.role)
    expect(detail!.rail.preferences).toEqual(block.preferences)

    const mine = detail!.comparison.find((r) => r.issuerStudioId === playerStudioId)!
    const redraft = proposalDraft(state, playerStudioId, talentId, 52, 1.25, state.market.tick)
    expect(mine.annualSalary).toBe(redraft.annualSalary)
    expect(mine.signingBonus).toBe(redraft.signingBonus)
    expect(mine.termWeeks).toBe(redraft.termWeeks)

    const theirs = detail!.comparison.find((r) => r.issuerStudioId === rivalStudioId)!
    expect(theirs.premiumTier).toBe(UNKNOWN)
    expect(theirs.annualSalary).toBe(UNKNOWN)
    expect(theirs.signingBonus).toBe(UNKNOWN)
    expect(JSON.stringify(theirs)).not.toMatch(/null/)
  })

  it('after settlement (settled-208): the receipt\'s order-only reasons show; no dropped sentence shows for a case where the player never proposed', () => {
    const json = load(V28_SETTLED_208.file)
    assertSha256(json, V28_SETTLED_208.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a2-bridge-selected-settled')
    const state = session.gameState
    const playerStudioId = state.hollywood!.playerStudioId
    // T0: 36 dropped[] sentences across 18 of the 24 settled receipts. Pick one
    // that genuinely carries a drop sentence.
    const withDrops = state.talentMarket.receipts.find((r) => r.kind === 'settled' && r.dropped.length > 0)!
    expect(withDrops).toBeDefined()
    // Sanity per T0/PROVENANCE: the player issued no proposal anywhere on this
    // fixture (no commitPlacement, no player action at all besides advanceTo).
    expect(currentProposals(state, withDrops.talentId).some((p) => p.issuerStudioId === playerStudioId)).toBe(false)
    expect(state.talentMarket.proposals.some((p) => p.issuerStudioId === playerStudioId)).toBe(false)

    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: withDrops.talentId })
    // `marketCase`, not `case` — see the sibling test's comment (CF08-IDENTIFIER-COLLISION).
    const detail = page.selected as { marketCase: { settlementReasons: string[] }; comparison: unknown[] } | null
    expect(detail).not.toBeNull()
    const disclosure = caseDisclosure(state, withDrops.talentId, playerStudioId, state.market.tick)
    expect(detail!.marketCase.settlementReasons).toEqual(disclosure.settlementReasons)
    for (const reason of detail!.marketCase.settlementReasons) expect(reason).not.toMatch(/\$|\d{3,}/)
    // No dropped[] sentence appears anywhere in the detail JSON for a case the
    // player never proposed in — the A.1/A.2 rule is "the PLAYER's OWN dropped
    // proposal's own sentence", never a rival's, and there is no player row here.
    const detailJson = JSON.stringify(detail)
    for (const sentence of withDrops.dropped) expect(detailJson).not.toContain(sentence)
  })
})

// ── group 5: paged career/employer history ───────────────────────────────────

describe('group 5: paged employer/career history', () => {
  it('employer intervals from the P12 rows, rival salaries private, credits by reference, bounded by MARKET_HISTORY_PAGE_SIZE', () => {
    expect(MARKET_HISTORY_PAGE_SIZE).toBeGreaterThan(0)

    // (a) the player's own interval — visible.
    const json = load(V28_OPEN_CASE_45.file)
    assertSha256(json, V28_OPEN_CASE_45.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a2-bridge-history-own')
    const state = session.gameState
    const playerStudioId = state.hollywood!.playerStudioId
    const openCase = state.talentMarket.cases[0]!
    const talentId = openCase.talentId
    const ownInterval = state.hollywood!.employment.find((e) => e.terms.talentId === talentId && e.studioId === playerStudioId)
    expect(ownInterval).toBeDefined() // sanity: the T0 fixture's subject is the player's own actor
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: talentId })
    const detail = page.selected as { history: { employers: Array<{ studioId: string; termWeeks?: number; annualSalary?: number | typeof UNKNOWN }>; pageSize: number; credits: unknown } } | null
    expect(detail).not.toBeNull()
    expect(detail!.history.pageSize).toBe(MARKET_HISTORY_PAGE_SIZE)
    const ownRow = detail!.history.employers.find((r) => r.studioId === playerStudioId)!
    expect(ownRow).toBeDefined()
    if (ownRow.termWeeks !== undefined) expect(ownRow.termWeeks).toBe(ownInterval!.terms.termWeeks)

    // (b) a rival-owned interval — salary PRIVATE (absent, per the plan's own
    // "private means absent" reading).
    const settledJson = load(V28_SETTLED_208.file)
    assertSha256(settledJson, V28_SETTLED_208.sha256)
    const settledSession = BridgeSession.fromSaveJson(settledJson, 'p14a2-bridge-history-rival')
    const settledState = settledSession.gameState
    const settled = settledState.talentMarket.receipts.find((r) => r.kind === 'settled')!
    const rivalInterval = settledState.hollywood!.employment.find((e) => e.terms.talentId === settled.talentId && e.studioId !== settledState.hollywood!.playerStudioId)
    expect(rivalInterval).toBeDefined() // sanity: the winner on this all-rival fixture is a rival studio
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const settledPage = marketPage(settledState, { view: 'market', targetId: settled.talentId })
    const settledDetail = settledPage.selected as { history: { employers: Array<{ studioId: string; annualSalary?: unknown }> } } | null
    const rivalRow = settledDetail!.history.employers.find((r) => r.studioId === rivalInterval!.studioId)
    if (rivalRow !== undefined) {
      const hasSalary = Object.prototype.hasOwnProperty.call(rivalRow, 'annualSalary')
      if (hasSalary) expect((rivalRow as { annualSalary: unknown }).annualSalary).toBe(UNKNOWN)
    }
    expect(JSON.stringify(settledDetail)).not.toContain(String(rivalInterval!.terms.annualSalary))

    // (c) credits by reference to the existing Industry person projection.
    const existingCredits = industryPage(state, 'p14a2-bridge-history-own', 0, {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'p14a2-bridge-history-own', requestId: 'r-credits',
      expectedStateRevision: 0, type: 'industryQuery', view: 'person', targetId: talentId, page: 0, pageSize: 50, lane: 'recent', period: 'all',
    }).credits
    expect(detail!.history.credits).toEqual(existingCredits)
  })
})

// ── group 6: intents from the workspace — the EXISTING marketProposalAction family ─

describe('group 6: workspace intents (Review & Submit / Revise / Withdraw)', () => {
  it('the same quote -> commit -> STALE_REVISION -> revise -> withdraw -> INTENT_NOT_AVAILABLE sequence as A.1 group 8, from a session whose current page is the market page', () => {
    const { state, talentId, playerStudioId } = openCaseWithBothProposals('p14a2-bridge-workspace-intents')
    const session = new BridgeSession(state, 'p14a2-bridge-workspace-intents')

    // Establish "current page is the market page": the request and the direct
    // builder are exercised together (bridge/industry.ts's own `view` dispatch
    // does not carry 'market' yet — see header — so this call is cast past the
    // not-yet-widened wire type; it documents the eventual T2 wiring).
    session.industry(marketQuery(session.sessionId, talentId))
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const before = marketPage(session.gameState, { view: 'market', targetId: talentId })
    expect(before.selected).not.toBeNull()

    const proposeRequest = {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-propose', expectedStateRevision: session.stateRevision,
      type: 'quoteMarketProposal' as const,
      draft: { verb: 'propose' as const, talentId, termWeeks: 52, premiumTier: 1.25 },
    }
    const proposeResponse = session.quote(proposeRequest)
    if (!proposeResponse.accepted) throw new Error(proposeResponse.message)
    expect(proposeResponse.quote.kind).toBe('marketProposalAction')
    const revisionAtPropose = session.stateRevision
    const commitPropose = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-propose', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: proposeResponse.quote.intentId },
    })
    expect(commitPropose.accepted).toBe(true)

    // STALE_REVISION: committing the SAME intentId again at the now-stale revision.
    const staleReplay = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-propose-stale-revision', expectedStateRevision: revisionAtPropose,
      type: 'submitIntent' as const, payload: { intentId: proposeResponse.quote.intentId },
    })
    expect(staleReplay.accepted).toBe(false)
    if (!staleReplay.accepted) expect(staleReplay.reasonCode).toBe('STALE_REVISION')

    // Revise, then withdraw.
    const reviseResponse = session.quote({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-revise', expectedStateRevision: session.stateRevision,
      type: 'quoteMarketProposal' as const,
      draft: { verb: 'revise' as const, talentId, termWeeks: 104, premiumTier: 1.1 },
    })
    if (!reviseResponse.accepted) throw new Error(reviseResponse.message)
    const commitRevise = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-revise', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: reviseResponse.quote.intentId },
    })
    expect(commitRevise.accepted).toBe(true)
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const afterRevise = marketPage(session.gameState, { view: 'market', targetId: talentId })
    const mineAfterRevise = (afterRevise.selected as { comparison: Array<{ issuerStudioId: string; termWeeks: number; premiumTier: number }> }).comparison
      .find((r) => r.issuerStudioId === playerStudioId)!
    expect(mineAfterRevise.termWeeks).toBe(104)
    expect(mineAfterRevise.premiumTier).toBe(1.1)

    const withdrawResponse = session.quote({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'q-withdraw', expectedStateRevision: session.stateRevision,
      type: 'quoteMarketProposal' as const,
      draft: { verb: 'withdraw' as const, talentId, termWeeks: null, premiumTier: null },
    })
    if (!withdrawResponse.accepted) throw new Error(withdrawResponse.message)
    const commitWithdraw = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-withdraw', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: withdrawResponse.quote.intentId },
    })
    expect(commitWithdraw.accepted).toBe(true)

    // INTENT_NOT_AVAILABLE: the ORIGINAL propose-quote's intentId, already
    // superseded and evicted from pendingQuotes by (b)'s own commit, resubmitted
    // at the CORRECT current revision.
    const staleAfterMove = session.command({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      commandId: 'c-propose-stale-after-move', expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const, payload: { intentId: proposeResponse.quote.intentId },
    })
    expect(staleAfterMove.accepted).toBe(false)
    if (!staleAfterMove.accepted) {
      expect(staleAfterMove.reasonCode).toBe('INTENT_NOT_AVAILABLE')
      expect(staleAfterMove.message).toMatch(/not emitted by the current authoritative/)
    }
    expect(AVAILABLE_INTENT_KINDS).toContain('marketProposalAction') // the workspace adds no new kind
  })
})

// ── group 7: the Pulse fold — one retained/moved row per settlement ─────────

describe('group 7: Pulse fold on view:"pulse"', () => {
  it('one activity row per settlement, naming the person/studio/term length, salary absent, correlated by (talentId, week) against the two P12 receipts — never doubled', () => {
    const json = load(V28_SETTLED_208.file)
    assertSha256(json, V28_SETTLED_208.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a2-bridge-pulse-fold')
    const state = session.gameState
    const settled = state.talentMarket.receipts.filter((r) => r.kind === 'settled')
    expect(settled).toHaveLength(24) // T0's own count

    // The expected pairing, built ONLY from the real, existing keys (talentId,
    // week) — see header premise on the absent eventId-reference field.
    const expected = settled.map((r) => {
      const expiry = state.hollywood!.receipts.find((e) => e.kind === 'employment' && e.talentId === r.talentId && e.week === r.week && e.reason === 'expiry')
      const start = state.hollywood!.receipts.find((e) => e.kind === 'employment' && e.talentId === r.talentId && e.week === r.week && (e.reason === 'replacement' || e.reason === 'player-contract'))
      expect(expiry).toBeDefined()
      expect(start).toBeDefined()
      return { talentId: r.talentId, week: r.week, retained: expiry!.studioId === start!.studioId, studioId: start!.studioId }
    })

    const pulse = industryPage(state, 'p14a2-bridge-pulse-fold', 0, {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'p14a2-bridge-pulse-fold', requestId: 'r-pulse',
      expectedStateRevision: 0, type: 'industryQuery', view: 'pulse', targetId: null, page: 0, pageSize: 50, lane: 'recent', period: 'all',
    })
    // P14A.2-T2: bridge/industry.ts's pulse fold landed (cea19cf) — one row per
    // settlement now, never the two unfolded expiry/start rows. The expected
    // count is DERIVED from `expected` (built off the receipts above, not a
    // literal): on this fixture all 24 settlements land in week 208, inside the
    // Pulse's own 13-week window and the single 50-row page, so none is dropped
    // by recency or paging (probed empirically against the landed industryPage;
    // totalRows 32, pageCount 1 — a fixture with older or more-numerous
    // settlements would need to walk pages here).
    const rowsForSettledTalent = pulse.activities.filter((a) => expected.some((e) => e.talentId === a.talentId && e.week === a.week))
    expect(rowsForSettledTalent.length).toBe(expected.length) // one folded row per settlement, never doubled
    // Every folded row: a settlementKind, the person's and joined studio's name
    // in the headline, and the term length in the detail.
    const studioNames = new Map(state.hollywood!.identities.map((s) => [s.studioId, s.name]))
    for (const row of rowsForSettledTalent as Array<{ talentId: string; week: number; settlementKind?: string; headline: string; detail: string }>) {
      const pair = expected.find((e) => e.talentId === row.talentId && e.week === row.week)!
      expect(['retained', 'moved']).toContain(row.settlementKind)
      expect(row.settlementKind).toBe(pair.retained ? 'retained' : 'moved')
      const talent = state.talent.find((t) => t.id === row.talentId)!
      expect(row.headline).toContain(talent.name)
      expect(row.headline).toContain(studioNames.get(pair.studioId) ?? pair.studioId)
      expect(row.detail).toMatch(/\d+ years?/) // term length named
    }
    // No unfolded pair remains for a folded (talentId, week): exactly one row
    // per settlement, never two.
    const byKey = new Map<string, number>()
    for (const row of rowsForSettledTalent as Array<{ talentId: string; week: number }>) {
      const key = `${row.talentId}:${String(row.week)}`
      byKey.set(key, (byKey.get(key) ?? 0) + 1)
    }
    for (const count of byKey.values()) expect(count).toBe(1)
    // Once folded, no row leaks a salary figure — checked across every
    // activity on the page, not only the settlement folds.
    for (const row of pulse.activities) expect(row.detail).not.toMatch(/\$\d/)
  })
})

// ── group 8: disclosure leak check both directions, tier != 1.00 ────────────

describe('group 8: disclosure leak check — workspace and pulse JSON', () => {
  it('the rival\'s real figures at a non-1.00 tier appear nowhere in the workspace or pulse JSON', () => {
    const { state, talentId, rivalStudioId } = openCaseWithBothProposals('p14a2-bridge-leak-check', 1.1)
    const rivalDraft = proposalDraft(state, rivalStudioId, talentId, 52, 1.1, state.market.tick)
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: talentId })
    const pageJson = JSON.stringify(page)
    expect(pageJson).not.toContain(String(rivalDraft.annualSalary))
    expect(pageJson).not.toContain(String(rivalDraft.signingBonus))

    const pulse = industryPage(state, 'p14a2-bridge-leak-check-pulse', 0, {
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'p14a2-bridge-leak-check-pulse', requestId: 'r-pulse',
      expectedStateRevision: 0, type: 'industryQuery', view: 'pulse', targetId: null, page: 0, pageSize: 50, lane: 'recent', period: 'all',
    })
    expect(JSON.stringify(pulse)).not.toContain(String(rivalDraft.annualSalary))
    expect(JSON.stringify(pulse)).not.toContain(String(rivalDraft.signingBonus))

    // Unchanged outside a case: bridge/people.ts contract:null and bridge/
    // industry.ts's "Contract terms are kept private in Industry." sentence.
    const freeAgentOrUncontracted = state.talent.find((t) => activeContract(state, t.id) === undefined && caseForTalent(state, t.id, state.market.tick) === null)
    expect(freeAgentOrUncontracted).toBeDefined()
    const profile = peopleProjection(state).profiles.find((p) => p.talentId === freeAgentOrUncontracted!.id)!
    expect(profile.employment.contract).toBeNull()
    const rivalStudio = state.hollywood!.identities.find((s) => s.role === 'rival' && s.enteredWeek !== null)!.studioId
    const rivalEmployee = state.hollywood!.employment.find((e) => e.studioId === rivalStudio && e.endedWeek === null && caseForTalent(state, e.terms.talentId, state.market.tick) === null)
    if (rivalEmployee !== undefined) {
      const activities = industryPage(state, 'p14a2-bridge-leak-check-employment', 0, {
        protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: 'p14a2-bridge-leak-check-employment', requestId: 'r-employment',
        expectedStateRevision: 0, type: 'industryQuery', view: 'employment', targetId: rivalEmployee.terms.talentId, page: 0, pageSize: 10, lane: 'recent', period: 'all',
      }).activities
      expect(activities.length).toBeGreaterThan(0)
      expect(activities.every((a) => a.detail === 'Actual recorded employment authority. Contract terms are kept private in Industry.')).toBe(true)
    }
  })
})

// ── group 9: save/load — V28 unchanged, converted law, byte-stable T0 fixtures ─

describe('group 9: save/load', () => {
  it('LIVE_SAVE_VERSION === 28; a genuine V27 fixture converts to an EMPTY workspace (no attention, no cases, no selected)', () => {
    expect(LIVE_SAVE_VERSION).toBe(29)
    const json = load(V27_RENEWAL_WINDOW.file)
    assertSha256(json, V27_RENEWAL_WINDOW.sha256)
    const session = BridgeSession.fromSaveJson(json, 'p14a2-bridge-v27-load')
    const state = session.gameState
    expect(state.market.tick).toBe(V27_RENEWAL_WINDOW.week)
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const page = marketPage(state, { view: 'market', targetId: null })
    expect(page.attention).toEqual([])
    expect(page.cases.renewalWindow).toEqual([])
    expect(page.cases.settling).toEqual([])
    expect(page.cases.closed.rows).toEqual([])
    expect(page.cases.freeAgents.length + page.cases.renewalWindow.length + page.cases.settling.length).not.toBeGreaterThan(page.cases.freeAgents.length)
    // a migration invents no case for the in-window subject either.
    const subject = state.talent.find((t) => t.role === 'scientist' && state.contracts.some((c) => c.talentId === t.id))
    expect(subject).toBeDefined()
    expect(marketEligibility(state, subject!.id, state.market.tick).status).toBe('renewal_window')
    expect(caseForTalent(state, subject!.id, state.market.tick)).toBeNull()
    const selected = marketPage(state, { view: 'market', targetId: subject!.id }).selected
    expect(selected).toBeNull()
  })

  it('the three genuine V28 T0 fixtures load byte-stable and the market page reads them as T0 pins', () => {
    // open-case-45: one renewalWindow row.
    const openJson = load(V28_OPEN_CASE_45.file)
    assertSha256(openJson, V28_OPEN_CASE_45.sha256)
    const openSession = BridgeSession.fromSaveJson(openJson, 'p14a2-bridge-v28-open')
    const reSavedOpen = openSession.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: openSession.sessionId, commandId: 'save-1', expectedStateRevision: openSession.stateRevision })
    expect(reSavedOpen.accepted).toBe(true)
    if (reSavedOpen.accepted) assertSha256(reSavedOpen.saveJson, V28_OPEN_CASE_45.sha256)
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const openPage = marketPage(openSession.gameState, { view: 'market', targetId: null })
    expect(openPage.cases.renewalWindow).toHaveLength(1)
    expect(openPage.cases.closed.rows).toEqual([])

    // settled-208: 24 closed rows.
    const settledJson = load(V28_SETTLED_208.file)
    assertSha256(settledJson, V28_SETTLED_208.sha256)
    const settledSession = BridgeSession.fromSaveJson(settledJson, 'p14a2-bridge-v28-settled')
    const reSavedSettled = settledSession.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: settledSession.sessionId, commandId: 'save-1', expectedStateRevision: settledSession.stateRevision })
    expect(reSavedSettled.accepted).toBe(true)
    if (reSavedSettled.accepted) assertSha256(reSavedSettled.saveJson, V28_SETTLED_208.sha256)
    const settledPage = marketPage(settledSession.gameState, { view: 'market', targetId: null })
    expect(settledPage.cases.closed.total).toBe(24)

    // legacy-terminations-20: empty workspace; legacyTerminations length 1.
    const legacyJson = load(V28_LEGACY_TERMINATIONS_20.file)
    assertSha256(legacyJson, V28_LEGACY_TERMINATIONS_20.sha256)
    const legacySession = BridgeSession.fromSaveJson(legacyJson, 'p14a2-bridge-v28-legacy')
    const reSavedLegacy = legacySession.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: legacySession.sessionId, commandId: 'save-1', expectedStateRevision: legacySession.stateRevision })
    expect(reSavedLegacy.accepted).toBe(true)
    if (reSavedLegacy.accepted) assertSha256(reSavedLegacy.saveJson, V28_LEGACY_TERMINATIONS_20.sha256)
    expect((legacySession.gameState as unknown as { talentMarket: { legacyTerminations: unknown[] } }).talentMarket.legacyTerminations).toHaveLength(1)
    const legacyPage = marketPage(legacySession.gameState, { view: 'market', targetId: null })
    expect(legacyPage.attention).toEqual([])
    expect(legacyPage.cases.renewalWindow).toEqual([])
    expect(legacyPage.cases.closed.rows).toEqual([])
  })

  it('a V28 save round-trips through the bridge save/load path, and the market page reads identically on both sides', () => {
    const { state } = signActor(p13aGeneratedStudio('p14a2-bridge-roundtrip'), 52)
    const session = new BridgeSession(state, 'p14a2-bridge-roundtrip')
    const saved = session.save({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'save-1', expectedStateRevision: session.stateRevision })
    expect(saved.accepted).toBe(true)
    if (!saved.accepted) throw new Error(`save refused: ${JSON.stringify(saved)}`)
    const parsed = JSON.parse(saved.saveJson) as { saveVersion: number }
    expect(parsed.saveVersion).toBe(29)
    const reloaded = BridgeSession.fromSaveJson(saved.saveJson, 'p14a2-bridge-roundtrip-reload')
    expect(reloaded.gameState).toEqual(JSON.parse(JSON.stringify(session.gameState)))
    // NOT YET EXISTING: marketPage — this test's RED cause.
    const before = marketPage(session.gameState, { view: 'market', targetId: null })
    const after = marketPage(reloaded.gameState, { view: 'market', targetId: null })
    expect(after).toEqual(JSON.parse(JSON.stringify(before)))
  })
})
