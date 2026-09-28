// ── P14 task 1304-C: R2 busy-set release refusal (Bridge) + release-copy correction ──
//
// STAGED FILE. Import paths below are written for this file's INTENDED destination,
// `tests/bridge-p14a1-release-busy-set.test.ts` (one level below repo root, beside every
// other `tests/*.test.ts`), per the allowed-writes filename in the 1304-C task brief. It
// is physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/tests/
// (first authored under 1304-stage) and landed in tests/ by the parent at 1308-E.
//
// Requirement source, read in full (see the companion Core RED file's header for the
// full citation trail; not repeated here):
//   - docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md §3.4
//     (Refusal R2, the two-branch disclosure copy of "direction 2") and §3.6.
//   - 1304-A-release-busy-set-proposal.md item 5 ("Bridge: releaseRefusal returns typed
//     codes foundingDraft and seatedOnActiveProduction, with reason copy naming the
//     production title and remedy 'Release after the picture is released, or recast
//     before shooting.'"), independently reviewed and adopted with amendments by
//     1304-B/1304-F. 1304-F's four amendments, all exercised below:
//       1. Projection bump: foundingDraft/seatedOnActiveProduction join
//          CONTRACT_REFUSAL_KINDS (bridge/schema/bridge-schema.ts:1753-1764), which the
//          generated schema enumerates for StudioContractQuoteSnapshot.refusal (:2139);
//          PROJECTION_VERSION moves 55 -> 56 by the underMarketCase precedent
//          (projection 42). NOTE (1304-F "One production increment for R2 and R3"): 56 is
//          the COMBINED R2+R3 bump; R3 lands separately (1305), but R2's own RED needs
//          the literal target value now, and 1304-F records that if R3 is blocked, R2
//          proceeds alone with its own bump rather than waiting — either way the target
//          literal for R2's own schema/projection leaf is 56.
//       2/3. This is that follow-up's schema test (mirrors the underMarketCase coverage
//          precedent, tests/bridge-p14a1-market.test.ts group 1).
//       4. Release confirmation copy: bridge/contract.ts:303 currently reads "Pays $X in
//          termination now (half of the $Y still guaranteed through Week Z)" — false at
//          every remaining term except exactly 52 weeks (companion §3.2/§3.4). It is
//          rewritten from releaseDisclosure (src/core/talentMarket.ts:628), in the two
//          exact branches companion §3.4 direction 2 states. This file's own task brief
//          restates the two REQUIRED substrings precisely: cap applies -> "26 weeks of
//          the $Y still guaranteed through Week Z"; no cap -> "all N remaining weeks of
//          pay" — those two phrases (with the engine's own real numbers substituted) are
//          asserted as substrings below, NOT the whole companion sentence verbatim,
//          because the companion's literal example additionally uses a
//          `campaignDate(...).label` date format ("1934 · Week 12") for "Week Z" that
//          1304-F does not separately re-confirm as binding wire text — pinning that
//          exact date-label choice here would silently fill a gap the parent
//          implementer should decide. The end-week fact itself IS asserted, flexibly:
//          either the raw absolute week number or the campaignDate label is accepted.
//
// CURRENT PRODUCTION FACT (verified directly against bridge/contract.ts, HEAD 993e6b01):
//   - `releaseRefusal` (~:163) checks exactly `noActiveContract` and `onScreenplayTask`;
//     no seat check, no founding check — so `contractActionDecisions`, the quote and the
//     command all currently ACCEPT a release of a seated or founding-draft person (the
//     same Core gap the companion RED file exercises, reached through the Bridge).
//   - `CONTRACT_REFUSAL_KINDS` (bridge/schema/bridge-schema.ts:1753-1764) does not
//     contain `foundingDraft` or `seatedOnActiveProduction`.
//   - `PROJECTION_VERSION` (bridge-schema.ts:1751) is 55, not 56.
//   - `contractQuoteSnapshot`'s consequence line (bridge/contract.ts:303) reads "half of
//     the $Y still guaranteed" unconditionally — never the two-branch companion copy.
// Every assertion below is therefore RED against unchanged production.
//
// FIXTURE PRECEDENT (reused in shape, not by import — this file stands alone):
// tests/bridge-p10a-r1-contract-quote.test.ts's own `founded`/`envelope`/`quoteContract`/
// `submit` helpers (R2/R3 test cases) are the direct style precedent for the BridgeSession
// quote -> command route used below.
//
// PREMISES NOT SATISFIED:
//   - The exact Core-engine error string for either new refusal is not asserted here
//     either (see the companion Core RED file); only the typed Bridge `code` and a
//     keyword-level reason check.
//   - The 1304-A item 5 remedy sentence for `seatedOnActiveProduction`
//     ("Release after the picture is released, or recast before shooting.") IS pinned
//     literally below, since it is the one piece of Bridge copy the adopted, reviewed
//     proposal itself states as exact text and 1304-F does not amend. No equivalent
//     literal remedy text exists in the adopted record for `foundingDraft`, so that
//     remedy is asserted only by keyword ("founding").

import { describe, expect, it } from 'vitest'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, type BridgeContractDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { BridgeSession } from '../bridge/session.ts'
import { contractActionDecisions } from '../bridge/contract.ts'
import {
  applyActions,
  beginFounding,
  generateWorld,
  guaranteedComp,
  hiringMarketIds,
  terminationCost,
  weeklySalary,
} from '../src/core/index.js'
import type { CastSlot, CreativeRole, GameState, SegmentId } from '../src/core/index.js'
import { campaignDate } from '../src/core/calendar.ts'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio, advanceTo } from '../src/harness/p13a/fixtures.js'

// ── shared helpers (duplicated in shape from tests/bridge-p10a-r1-contract-quote.test.ts) ──

function envelope(session: BridgeSession, commandId: string, revision = session.stateRevision) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: revision }
}
function quoteContract(session: BridgeSession, commandId: string, draft: BridgeContractDraftPayload) {
  return session.quote({ ...envelope(session, commandId), type: 'quoteContract' as const, draft })
}
function submit(session: BridgeSession, commandId: string, intentId: string, revision?: number) {
  return session.command({ ...envelope(session, commandId, revision), type: 'submitIntent' as const, payload: { intentId } })
}
function dollars(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

type Team = { writerId: string; directorId: string; leadId: string; antagonistId: string; supportId: string; craftId: string }

/** A cash bootstrap before any production choice — mirrors fundTo in the companion Core RED
 * file (tests/p14a1-release-busy-set.test.ts), same 30,000,000 headroom. */
function fundTo(state: GameState, target: number): GameState {
  const delta = target - state.studio.cash
  if (delta === 0) return state
  return {
    ...state,
    studio: { ...state.studio, cash: target },
    ledger: [...state.ledger, {
      week: state.market.tick,
      kind: (delta > 0 ? 'studioRevenue' : 'overhead') as 'studioRevenue' | 'overhead',
      amount: delta,
      note: 'test fixture cash bootstrap',
    }],
  }
}

/** Walk the rotating hiring market forward until a free-agent candidate of `role` appears,
 * then sign them — mirrors signOneOfRole in the companion Core RED file
 * (tests/p14a1-release-busy-set.test.ts); never assumes week-0 presence. */
function signOneOfRole(state: GameState, role: CreativeRole, termWeeks = 208): { state: GameState; id: string } {
  let next = state
  for (let i = 0; i < 60; i++) {
    const candidates = hiringMarketIds(next, next.market.tick)
    const person = candidates.map((id) => next.talent.find((t) => t.id === id)).find((t) => t?.role === role)
    if (person !== undefined) {
      return { state: applyActions(next, [{ kind: 'signContract', talentId: person.id, termWeeks }]), id: person.id }
    }
    next = tick(next)
  }
  throw new Error(`fixture premise failed: no free-agent ${role} found within 60 weeks`)
}

function signTeam(seed: string): { state: GameState; team: Team } {
  let state = p13aGeneratedStudio(seed)
  const writer = signOneOfRole(state, 'writer'); state = writer.state
  const director = signOneOfRole(state, 'director'); state = director.state
  const lead = signOneOfRole(state, 'actor'); state = lead.state
  const antagonist = signOneOfRole(state, 'actor'); state = antagonist.state
  const support = signOneOfRole(state, 'actor'); state = support.state
  const craft = signOneOfRole(state, 'craft'); state = craft.state
  return {
    state,
    team: {
      writerId: writer.id, directorId: director.id, leadId: lead.id,
      antagonistId: antagonist.id, supportId: support.id, craftId: craft.id,
    },
  }
}

/** A light greenlit production (no Set, no rehearsal walk needed — the seat check reads
 * only state.studio.activeProductions, populated the moment greenlight succeeds).
 *
 * 1308-F item 2 (was 1308-X defect 1): reaches the active production the SAME way the
 * companion Core RED file does (`p13aGeneratedStudio` + hiring-market signs, then greenlight
 * directly) — NOT the prior `founded()` managed-studio route (`activateScriptDevelopment`),
 * which requires an authoritative Ready script project before ANY greenlight
 * (`src/core/productionAdmission.ts:108`) and refused this fixture's direct-package draft.
 * Measured on the parent's scratch dry run (1308-X-draft-dry-run.txt): "applyActions:
 * greenlight rejected — managed studios must greenlight an authoritative Ready script
 * project", thrown from `seatedFixture` at the old `founded()`-based construction. All five
 * seated leaves keep their original assertions unchanged (1308-F: "the five seated leaves
 * keep their assertions"). */
function seatedFixture(seed: string) {
  const { state: signedState, team } = signTeam(seed)
  const state = fundTo(signedState, 30_000_000)
  const concept = state.concepts.find((c) =>
    !state.studio.activeProductions.some((p) => p.conceptId === c.id) &&
    !state.studio.releasedFilms.some((f) => f.conceptId === c.id))!
  const cast: Record<CastSlot, string> = { lead: team.leadId, antagonist: team.antagonistId, support: team.supportId }
  const greenlit = applyActions(state, [{ kind: 'greenlight', production: {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: {
      intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
    writerId: team.writerId, directorId: team.directorId, cast, craftIds: [team.craftId],
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  } }])
  const productionId = greenlit.studio.activeProductions.at(-1)!.id
  return {
    state: greenlit, directorId: team.directorId, leadId: team.leadId, antagonistId: team.antagonistId,
    supportId: team.supportId, craftId: team.craftId, writerId: team.writerId, productionId,
  }
}

/** One signed actor, no production, no founding roster — the cheapest legal release
 * subject. Mirrors signActor (tests/p14a1-firing.test.ts), an already-proven pattern. */
function signOne(seed: string, termWeeks: number): { state: GameState; talentId: string } {
  const state = p13aGeneratedStudio(seed)
  const candidates = hiringMarketIds(state, 0)
  const actorId = candidates.map((id) => state.talent.find((t) => t.id === id)).find((t) => t?.role === 'actor')?.id
  if (actorId === undefined) throw new Error('fixture assumption failed: no actor in the week-0 hiring market')
  return { state: applyActions(state, [{ kind: 'signContract', talentId: actorId, termWeeks }]), talentId: actorId }
}

function foundingDraftFixture(seed: string) {
  let state = beginFounding(generateWorld(seed))
  const applicant = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
    .find((t) => t.role === 'actor')!
  state = applyActions(state, [{ kind: 'signContract', talentId: applicant.id, termWeeks: 104 }])
  return { state, signedActorId: applicant.id }
}

describe('P14 1304-C RED (Bridge): R2 seated/founding refusal, schema leaf, release-copy correction', () => {
  it('schema leaf: PROJECTION_VERSION is 56, the schema $id and x-project-studio.projectionVersion move with it, and both new refusal codes reach the generated CONTRACT_REFUSAL_KINDS enum (mirrors the underMarketCase/projection-42 precedent, tests/bridge-p14a1-market.test.ts group 1)', () => {
    expect(PROJECTION_VERSION).toBe(56)
    expect(BRIDGE_SCHEMA.$id).toBe(`urn:project-studio:bridge:protocol-${String(PROTOCOL_VERSION)}:projection-56`)
    expect(BRIDGE_SCHEMA['x-project-studio'].projectionVersion).toBe(56)
    const refusalSchema = (BRIDGE_SCHEMA.$defs as Record<string, unknown>).StudioContractQuoteSnapshot as
      { properties: { refusal: { anyOf: readonly [{ enum: readonly string[] }, unknown] } } }
    const enumMembers = refusalSchema.properties.refusal.anyOf[0].enum
    expect(enumMembers).toContain('foundingDraft')
    expect(enumMembers).toContain('seatedOnActiveProduction')
    // Existing members are additive, never removed (the underMarketCase precedent's own rule).
    expect(enumMembers).toContain('onScreenplayTask')
    expect(enumMembers).toContain('underMarketCase')
  })

  describe.each([
    ['director', (f: ReturnType<typeof seatedFixture>) => f.directorId],
    ['lead', (f: ReturnType<typeof seatedFixture>) => f.leadId],
    ['antagonist', (f: ReturnType<typeof seatedFixture>) => f.antagonistId],
    ['support', (f: ReturnType<typeof seatedFixture>) => f.supportId],
    ['craft', (f: ReturnType<typeof seatedFixture>) => f.craftId],
  ] as const)('seated %s of an active player production', (label, getId) => {
    it(`contractActionDecisions reports releaseAvailable:false for the ${label}; the quote refuses with the typed seatedOnActiveProduction code and the 1304-A remedy sentence; the command refuses too, and commits nothing (produces no successor)`, () => {
      const f = seatedFixture(`1304c-bridge-seated-${label}`)
      const talentId = getId(f)
      const decision = contractActionDecisions(f.state, talentId)
      expect(decision.releaseAvailable).toBe(false)
      expect(decision.releaseReason ?? '').toMatch(/seated|active production/i)

      const session = new BridgeSession(f.state, `1304c-bridge-seated-${label}`)
      const quoted = quoteContract(session, 'q-seated', { verb: 'release', talentId, termWeeks: null })
      expect(quoted.accepted).toBe(true)
      if (!quoted.accepted) return
      expect(quoted.quote.ok).toBe(false)
      expect(quoted.quote.refusal).toBe('seatedOnActiveProduction')
      expect(quoted.quote.refusalReason ?? '').toMatch(/seated|active production/i)
      expect(quoted.quote.refusalRemedy).toBe('Release after the picture is released, or recast before shooting.')
      expect(quoted.quote.startsNow).toBe(false)

      const before = session.gameState
      const committed = submit(session, 'c-seated', quoted.quote.intentId)
      expect(committed.accepted).toBe(false)
      expect(session.gameState).toBe(before) // no successor: the refused intent commits nothing
      expect(session.stateRevision).toBe(0)
    })
  })

  it('founding draft: contractActionDecisions reports releaseAvailable:false with a founding-keyed reason; the quote refuses with the typed foundingDraft code; the command refuses too, and commits nothing', () => {
    const { state, signedActorId } = foundingDraftFixture('1304c-bridge-founding-01')
    expect(state.founding).not.toBeNull()
    const decision = contractActionDecisions(state, signedActorId)
    expect(decision.releaseAvailable).toBe(false)
    expect(decision.releaseReason ?? '').toMatch(/founding/i)

    const session = new BridgeSession(state, '1304c-bridge-founding-01')
    const quoted = quoteContract(session, 'q-founding', { verb: 'release', talentId: signedActorId, termWeeks: null })
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.ok).toBe(false)
    expect(quoted.quote.refusal).toBe('foundingDraft')
    expect(quoted.quote.refusalReason ?? '').toMatch(/founding/i)

    const before = session.gameState
    const committed = submit(session, 'c-founding', quoted.quote.intentId)
    expect(committed.accepted).toBe(false)
    expect(session.gameState).toBe(before)
    expect(session.stateRevision).toBe(0)
  })

  it('a free, unseated, non-founding person still quotes the exact disclosure — the new checks do not over-refuse (regression guard, unaffected by R2)', () => {
    const { state, talentId } = signOne('1304c-bridge-unseated-01', 208)
    const decision = contractActionDecisions(state, talentId)
    expect(decision.releaseAvailable).toBe(true)
    const session = new BridgeSession(state, '1304c-bridge-unseated-01')
    const quoted = quoteContract(session, 'q-free', { verb: 'release', talentId, termWeeks: null })
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.ok).toBe(true)
    expect(quoted.quote.refusal).toBeNull()
  })

  it('release confirmation copy, cap-applies branch (companion §3.4 direction 2): the consequence names "26 weeks of the $<guaranteed> still guaranteed through" the exact end week, the exact charge, and never the word "half"', () => {
    const { state, talentId } = signOne('1304c-bridge-copy-cap-01', 208)
    const contract = state.contracts.find((c) => c.talentId === talentId)!
    const week = state.market.tick
    const remaining = contract.endWeekExclusive - week
    expect(remaining).toBeGreaterThan(26) // fixture premise: the cap genuinely bites
    const cost = terminationCost(contract, week)
    const guaranteed = Math.round(guaranteedComp(contract, week))
    expect(cost).toBe(weeklySalary(contract.annualSalary) * 26)

    const session = new BridgeSession(state, '1304c-bridge-copy-cap-01')
    const quoted = quoteContract(session, 'q-cap', { verb: 'release', talentId, termWeeks: null })
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    const { consequence } = quoted.quote
    expect(consequence.toLowerCase()).not.toContain('half')
    expect(consequence).toContain(dollars(cost))
    expect(consequence).toContain(`26 weeks of the ${dollars(guaranteed)}`)
    expect(consequence).toMatch(/still guaranteed through/)
    const rawWeek = String(contract.endWeekExclusive)
    const dateLabel = campaignDate(contract.endWeekExclusive).label
    expect(
      consequence.includes(rawWeek) || consequence.includes(dateLabel),
      `consequence must name the end week, as either the raw week (${rawWeek}) or the campaign date label (${dateLabel}); got: ${consequence}`,
    ).toBe(true)
  })

  it('release confirmation copy, no-cap branch (companion §3.4 direction 2): the consequence names "all <remaining> remaining weeks of pay", the exact charge (equal to the full remaining guarantee here), and never the word "half"', () => {
    // 52-week term, advanced to 7 weeks remaining — the exact shape of the disclosure-content
    // Core precedent (tests/p14a1-firing.test.ts "the disclosure content per direction 2...").
    const { state, talentId } = signOne('1304c-bridge-copy-nocap-01', 52)
    const contract = state.contracts.find((c) => c.talentId === talentId)!
    const advanced = advanceTo(state, 45) // 52 - 45 = 7 weeks remaining
    const week = advanced.market.tick
    const remaining = contract.endWeekExclusive - week
    expect(remaining).toBeLessThanOrEqual(26)
    expect(remaining).toBeGreaterThan(0)
    const cost = terminationCost(contract, week)
    const guaranteed = Math.round(guaranteedComp(contract, week))
    expect(cost).toBe(guaranteed) // no cap bite: charge equals the full remaining guarantee

    const session = new BridgeSession(advanced, '1304c-bridge-copy-nocap-01')
    const quoted = quoteContract(session, 'q-nocap', { verb: 'release', talentId, termWeeks: null })
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    const { consequence } = quoted.quote
    expect(consequence.toLowerCase()).not.toContain('half')
    expect(consequence).toContain(dollars(cost))
    expect(consequence).toContain(`all ${String(remaining)} remaining weeks of pay`)
  })
})
