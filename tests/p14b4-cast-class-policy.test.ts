// Installed reviewed policy-v2; measured fixture-only reconciliation65 follows46/58/59. Original43 retained.
// INERT, UNEXECUTED requirement-first preparation. Intended path:
// tests/p14b4-cast-class-policy.test.ts. No installation/runtime authority.
// Reviewed B4 plan 382252e2, delegated policy hypothesis, not an Owner taste.
// publicPreferredOpportunity is the ONE proposed public read API in this draft;
// its literal spelling needs interface review before installation. No new D3,
// authoring, final-seating, solver or synthetic-settlement export is assumed.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { beginFounding, hiringMarketIds } from '../src/core/employment.js'
import { makeSave } from '../src/core/save.js'
import { flattenParticipants } from '../src/core/starPower.js'
import { careerIdentity, roleOVR } from '../src/core/talentSummary.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import { generateWorld } from '../src/core/worldgen.js'
import type { GameState, Talent, TalentMarketCase, TalentMarketProposal, TalentMarketReceipt } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import * as marketModule from '../src/core/talentMarket.js'
import * as promiseModule from '../src/core/promises.js'
import { publicPreferredOpportunity, publicPreferredTerm, publicPriorityOrder, submitProposal } from '../src/core/talentMarket.js'
import { attachPromise, promiseFeasibility, trustDescriptor } from '../src/core/promises.js'

const clone = <T>(value: T): T => structuredClone(value)
const ACHIEVABLE = 'REASONABLY_ACHIEVABLE'
const P1 = { family: 'APPEARANCE_COUNT', predicate: { count: 1 } } as const
const LEAD = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' } } as const
const FLEX = { family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'leadOrAntagonist' } } as const
const UNPROVEN_ORDER = ['opportunity', 'compensation', 'term', 'trust', 'standing', 'incumbency']
const PROVEN_ORDER = ['compensation', 'term', 'trust', 'incumbency', 'standing', 'opportunity']
type Candidate = typeof P1 | typeof LEAD | typeof FLEX
const primaryDiscipline = { actor: 'acting', director: 'directing', writer: 'writing', craft: 'craft' } as const
type Creative = keyof typeof primaryDiscipline
const creative = (subject: Talent): subject is Talent & { role: Creative } => subject.role !== 'scientist'

function person(state: GameState, id: string) {
  const result = state.talent.find((t) => t.id === id)
  if (result === undefined) throw new Error(`fixture: missing real person ${id}`)
  return result
}
function realProven(state: GameState, id: string): boolean {
  // Existing shared archetype, not priorityOrder[0]. D9's established career
  // identity uses real credits at usable OVR; this introduces no new threshold.
  const subject = person(state, id)
  return subject.age >= 30 || careerIdentity(subject).identityDisciplines.length > 0
}
function expectPreferences(state: GameState, id: string, proven: boolean): void {
  const before = clone(state)
  expect(realProven(state, id)).toBe(proven)
  expect(publicPreferredOpportunity(state, id)).toBe(proven ? 'anyCastAppearance' : 'significantCastRole')
  expect(publicPriorityOrder(state, id)).toEqual(proven ? PROVEN_ORDER : UNPROVEN_ORDER)
  expect(publicPreferredTerm(state, id)).toBe(proven ? TUNING.CONTRACT_TERM_OPTIONS.at(-1) : TUNING.CONTRACT_TERM_OPTIONS[0])
  expect(state).toEqual(before)
}

describe('P14B4: one shared public archetype; no new personality or priority-position inference', () => {
  it.each([29, 30])('uses the existing age edge at %i without inventing a career credit', (age) => {
    const generated = p13aGeneratedStudio()
    const subject = generated.talent.find((t) => t.age < 30 && Object.values(t.workHistory).every((n) => n === 0))
    if (subject === undefined) throw new Error('fixture: no genuinely uncredited subject')
    // Explicit synthetic pure-read age INPUT, not a historical birthday or save
    // provenance claim. Every credit/profile/label and all durable roots stay.
    const state = { ...generated, talent: generated.talent.map((t) => t.id === subject.id ? { ...t, age } : t) }
    expect(person(state, subject.id).workHistory).toEqual(subject.workHistory)
    expectPreferences(state, subject.id, age === 30)
  })

  it('a real under-30 release credit supplies the proven branch independently of the age edge', () => {
    // Original43's passive rival search supplied no witness by220. Exact lawful
    // recipe46/58 supplies one through ordinary founding and a real player film.
    // No age, skill, cash, credit or history edits. Legacy operations/development
    // are intentional: this is a release-credit test, not a managed first take.
    let state = beginFounding(generateWorld('p13a-core-causal-01'))
    assert.ok(state.founding)
    const applicants = state.founding.applicantIds.map((id) => person(state, id)).filter(creative)
    const candidates = applicants.filter((t) => t.age < 30 && roleOVR(t, primaryDiscipline[t.role]) >= 60)
    const subject = candidates[0]
    assert.ok(subject, 'fixture: real usable under30 founding applicant required')
    const discipline = primaryDiscipline[subject.role]
    expect(subject.authored).toBe(false)
    expect(subject.workHistory[discipline]).toBe(0)
    expect(careerIdentity(subject).identityDisciplines).toEqual([])
    expectPreferences(state, subject.id, false)
    const crew: Record<Creative, string[]> = { actor: [], director: [], writer: [], craft: [] }
    const need: Record<Creative, number> = { actor: 3, director: 1, writer: 1, craft: 1 }
    for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
      const pool = applicants.filter((t) => t.role === role)
      const selected = role === subject.role ? [subject, ...pool.filter((t) => t.id !== subject.id)] : pool
      expect(selected.length).toBeGreaterThanOrEqual(need[role])
      for (const hire of selected.slice(0, need[role])) {
        state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 52 }])
        crew[role].push(hire.id)
      }
    }
    state = applyActions(state, [{ kind: 'foundStudio' }])
    expect(state.operations.mode).toBe('legacy')
    expect(state.scriptDevelopment.mode).toBe('legacy')
    expect(state.economyEngagedEver).toBe(true)
    const ids = [...crew.writer, ...crew.director, ...crew.actor, ...crew.craft]
    expect(new Set(ids).size).toBe(6)
    expect(ids).toContain(subject.id)
    expect(state.contracts.filter((c) => ids.includes(c.talentId))).toHaveLength(6)
    const concept = [...state.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost || a.id.localeCompare(b.id))[0]!
    state = applyActions(state, [{ kind: 'greenlight', production: { conceptId: concept.id,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
        intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
      writerId: crew.writer[0]!, directorId: crew.director[0]!,
      cast: { lead: crew.actor[0]!, antagonist: crew.actor[1]!, support: crew.actor[2]! }, craftIds: [crew.craft[0]!],
      budget: { negative: concept.baseNegativeCost, marketing: 0 } } }])
    const production = state.studio.activeProductions.at(-1)!
    assert.ok(production.participants)
    expect(flattenParticipants(production.participants).map((p) => p.talentId)).toContain(subject.id)
    const beforeHistory = clone(person(state, subject.id).workHistory)
    for (let step = 0; step < 16 && !state.studio.releasedFilms.some((f) => f.productionId === production.id); step++) {
      const active = state.studio.activeProductions.find((p) => p.id === production.id)
      assert.ok(active, 'unfinished production may not disappear')
      expect(state.careerEvents.filter((e) => e.filmId === production.id)).toEqual([])
      expect(person(state, subject.id).workHistory).toEqual(beforeHistory)
      if (active.remainingTicks === 1) state = applyActions(state, [{ kind: 'commitPictureToRelease', productionId: production.id }])
      state = tick(state, { develop: true }) // existing Ruling-A player-play route
    }
    const film = state.studio.releasedFilms.find((f) => f.productionId === production.id)
    assert.ok(film, 'fixture: actual committed legacy release must complete within16 ticks')
    assert.ok(film.participants)
    expect(flattenParticipants(film.participants).filter((p) => p.talentId === subject.id)).toHaveLength(1)
    const after = person(state, subject.id)
    const events = state.careerEvents.filter((e) => e.filmId === production.id && e.talentId === subject.id)
    expect(after.age).toBeLessThan(30)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ discipline, workHistoryBefore: 0, workHistoryAfter: 1, releaseWeek: film.releaseTick })
    expect(events[0]!.workHistoryAfter).toBe(events[0]!.workHistoryBefore + 1)
    expect(events[0]!.releaseWeek).toBeLessThanOrEqual(state.market.tick)
    expect(state.studio.releasedFilms.some((f) => f.productionId === events[0]!.filmId)).toBe(true)
    expect(after.workHistory[discipline]).toBe(1)
    expect(careerIdentity(after).identityDisciplines).toContain(discipline)
    expectPreferences(state, subject.id, true)
    makeSave(state)
    const later = tick(state, { develop: true })
    expect(later.careerEvents.filter((e) => e.filmId === production.id && e.talentId === subject.id)).toEqual(events)
    expect(person(later, subject.id).workHistory).toEqual(after.workHistory)
  })

  it('irrelevant cash does not change the public preference or create a root, receipt or RNG draw', () => {
    const state = p13aGeneratedStudio()
    const subject = state.talent.find((t) => t.age < 30 && careerIdentity(t).identityDisciplines.length === 0)
    if (subject === undefined) throw new Error('fixture: no unproven subject')
    const changed = { ...state, studio: { ...state.studio, cash: state.studio.cash + 1 }, ledger: [...state.ledger,
      { week: state.market.tick, kind: 'studioRevenue' as const, amount: 1, note: 'policy pure-read disclosed cash input' }] }
    expectPreferences(state, subject.id, false)
    expectPreferences(changed, subject.id, false)
    expect(changed.promises).toEqual(state.promises)
    expect(changed.talentMarket).toEqual(state.talentMarket)
    expect(changed.rngState).toBe(state.rngState)
  })
})

// Controlled chooser INPUT fixture derived from the accepted B2 D3 construction.
// Only cash+matching ledger, subject age, Standing, and one early case/discovery
// are explicit synthetic inputs. Employment, offers, staged promises, frozen
// results, real settlements and binding rows MUST come from their actual owners.
// This is not a natural gameplay, exact all-descriptor-tie, or final-seating claim.
function controlledPair(age: 29 | 30) {
  const talentId = 'person-studio-5a47d054-r04-3'
  const incumbentId = 'studio-5a47d054-r04'
  let state = p13aGeneratedStudio('p13-public-commercial-adoption')
  const cashDelta = 30_000_000 - state.studio.cash
  state = { ...state, studio: { ...state.studio, cash: 30_000_000 }, ledger: [...state.ledger,
    { week: state.market.tick, kind: cashDelta >= 0 ? 'studioRevenue' : 'overhead', amount: cashDelta, note: 'policy controlled D3 cash bootstrap' }] }
  const hired = hiringMarketIds(state, 0).map((id) => person(state, id)).find((t) => t.role === 'actor')
  if (hired === undefined) throw new Error('fixture: no actual week0 actor')
  state = applyActions(state, [{ kind: 'signContract', talentId: hired.id, termWeeks: 52 }])
  state = advanceTo(state, 195)
  let phaseInput: GameState | undefined
  const original = marketModule.advanceTalentMarketWeek
  const observe = vi.spyOn(marketModule, 'advanceTalentMarketWeek').mockImplementation((input) => {
    if (input.market.tick === 196) phaseInput = clone(input)
    return original(input)
  })
  try { tick(state) } finally { observe.mockRestore() }
  if (phaseInput === undefined) throw new Error('fixture: no actual pre-market196 input')
  state = phaseInput
  const playerId = state.hollywood!.playerStudioId
  expect(state.hollywood!.employment.some((e) => e.studioId === playerId && e.terms.talentId === hired.id
    && e.terms.endWeekExclusive === 52 && e.endedWeek === 52)).toBe(true)
  // Original43's zero-history premise was false: measured58 retains13 acting
  // credits at perceived OVR11. The existing archetype requires a USABLE credited
  // discipline, not merely a nonzero counter. Preserve all real credit/history.
  const actualSubject = clone(person(state, talentId))
  const actualIdentity = careerIdentity(actualSubject)
  const credited = actualIdentity.disciplines.filter((d) => d.workHistory > 0)
  const historyBeforeAge = clone({ player: state.careerEvents, industry: state.hollywood!.careerEvents, promises: state.promises })
  expect(credited.length).toBeGreaterThan(0)
  expect(actualIdentity.identityDisciplines).toEqual([])
  for (const discipline of credited) {
    expect(discipline.ovr).toBeLessThan(60)
    expect(discipline.proven).toBe(false)
    expect([...state.careerEvents, ...state.hollywood!.careerEvents].some((e) => e.talentId === talentId
      && e.discipline === discipline.discipline && e.workHistoryAfter > e.workHistoryBefore)).toBe(true)
  }
  state = { ...state, talent: state.talent.map((t) => t.id === talentId ? { ...t, age } : t) }
  expect({ ...person(state, talentId), age: actualSubject.age }).toEqual(actualSubject)
  expect(careerIdentity(person(state, talentId)).identityDisciplines).toEqual([])
  expect(state.careerEvents).toEqual(historyBeforeAge.player)
  expect(state.hollywood!.careerEvents).toEqual(historyBeforeAge.industry)
  expect(state.promises).toEqual(historyBeforeAge.promises)
  expectPreferences(state, talentId, age === 30)
  const employment = state.hollywood!.employment.find((e) => e.studioId === incumbentId && e.terms.talentId === talentId && e.endedWeek === null)
  if (employment === undefined) throw new Error('fixture: actual incumbent row missing')
  expect(employment.terms.endWeekExclusive).toBe(208)
  expect(state.talentMarket.cases.filter((c) => c.talentId === talentId)).toEqual([])
  expect(state.promises.filter((p) => p.beneficiaryPersonId === talentId)).toEqual([])
  const kase: TalentMarketCase = { talentId, subjectStudioId: incumbentId, contractId: employment.contractId,
    openedWeek: state.market.tick, outcome: null, closedWeek: null, reason: null }
  const discovery: TalentMarketReceipt = { eventId: `talent-market-event-${state.talentMarket.receipts.length}`, kind: 'discovered',
    week: state.market.tick, talentId, studioId: incumbentId, reasons: [], dropped: [] }
  state = { ...state, talentMarket: { ...state.talentMarket, cases: [...state.talentMarket.cases, kase],
    receipts: [...state.talentMarket.receipts, discovery] } }
  const entered = state.hollywood!.identities.filter((s) => s.enteredWeek !== null)
  expect(entered).toHaveLength(5)
  for (const issuer of entered) state = submitProposal(state, { talentId, issuerStudioId: issuer.studioId,
    termWeeks: 208, premiumTier: issuer.studioId === playerId ? 1.25 : 1 })
  state = advanceTo(marketModule.advanceTalentMarketWeek(state), 207)
  expect(state.promises.filter((p) => p.beneficiaryPersonId === talentId)).toEqual([])
  const nonpair = entered.filter((s) => ![playerId, incumbentId].includes(s.studioId))
  expect(nonpair).toHaveLength(3)
  for (const issuer of nonpair) {
    const proposal = marketModule.currentProposals(state, talentId).find((p) => p.issuerStudioId === issuer.studioId)!
    expect(proposal.promises).toEqual([])
    expect([proposal.startWeek, proposal.startWeek + proposal.termWeeks]).toEqual([208, 416])
    state = attachPromise(state, talentId, issuer.studioId, { family: 'APPEARANCE_COUNT', predicate: { count: 999 },
      windowStartWeek: 415, dueWeekExclusive: 416 })
    expect(state.promises.at(-1)!.feasibilityReceipt.classification).toBe('IMPOSSIBLE')
  }
  const standing = state.hollywood!.businesses.find((b) => b.studioId === incumbentId)!.standing
  state = { ...state, studio: { ...state.studio, standing: { ...standing } } }
  makeSave(state) // actual live validator, no historical-envelope restamp
  return { state, talentId, playerId, incumbentId, entered, nonpair }
}
type Pair = ReturnType<typeof controlledPair>

function settlePair(fixture: Pair, input: GameState) {
  let frozen: GameState | undefined
  const actual = promiseModule.trustDescriptor
  const spy = vi.spyOn(promiseModule, 'trustDescriptor').mockImplementation((world, id, issuer, week) => {
    if (id === fixture.talentId && week === 208 && [fixture.playerId, fixture.incumbentId].includes(issuer)
      && !world.hollywood!.employment.some((e) => e.terms.talentId === id && e.terms.startWeek === 208 && e.endedWeek === null)) frozen ??= clone(world)
    return actual(world, id, issuer, week)
  })
  let after: GameState
  try { after = tick(input) } finally { spy.mockRestore() }
  if (frozen === undefined) throw new Error('fixture: no actual pre-commit208 freeze')
  const receipts = after.talentMarket.receipts.filter((r) => r.kind === 'settled' && r.week === 208 && r.talentId === fixture.talentId)
  expect(receipts).toHaveLength(1)
  const receipt = receipts[0]!
  const offers = marketModule.currentProposals(frozen, fixture.talentId)
  expect(offers).toHaveLength(5)
  expect(receipt.dropped).toHaveLength(3)
  for (const issuer of fixture.nonpair) expect(receipt.dropped.some((r) => r.startsWith(issuer.name) && /promise.*feasib/i.test(r))).toBe(true)
  for (const issuer of [fixture.playerId, fixture.incumbentId]) {
    const name = fixture.entered.find((s) => s.studioId === issuer)!.name
    expect(receipt.dropped.some((r) => r.startsWith(name))).toBe(false)
    expect(trustDescriptor(frozen, fixture.talentId, issuer, 208).label).toBe('Reliable')
  }
  const own = offers.find((p) => p.issuerStudioId === fixture.playerId)!
  const incumbent = offers.find((p) => p.issuerStudioId === fixture.incumbentId)!
  expect([own.premiumTier, incumbent.premiumTier]).toEqual([1.25, 1])
  expect(own.termWeeks).toBe(incumbent.termWeeks)
  const mean = (s: GameState['studio']['standing']) => (s.audienceAwareness + s.industryPrestige + s.commercialConfidence) / 3
  expect(Math.abs(mean(frozen.studio.standing) - mean(frozen.hollywood!.businesses.find((b) => b.studioId === fixture.incumbentId)!.standing))).toBeLessThanOrEqual(5)
  expect(receipt.reasons.some((r) => /only proposal/i.test(r))).toBe(false)
  expect(marketModule.currentProposals(after, fixture.talentId)).toEqual([])
  makeSave(after)
  return { after, frozen, receipt, own, incumbent }
}

function attachCandidate(fixture: Pair, issuer: string, candidate: Candidate) {
  const state = attachPromise(fixture.state, fixture.talentId, issuer,
    { ...candidate, windowStartWeek: 208, dueWeekExclusive: 415 })
  const proposal = marketModule.currentProposals(state, fixture.talentId).find((p) => p.issuerStudioId === issuer)!
  expect(proposal.promises).toHaveLength(1)
  const root = state.promises.find((p) => p.promiseId === proposal.promises[0])!
  expect(root.predicate).toEqual(candidate.predicate)
  expect(root.family).toBe(candidate.family)
  expect(root.feasibilityReceipt.classification).toBe(ACHIEVABLE)
  expect(root.contractId).toBeNull()
  return { state, root }
}
function assertWonBinding(result: ReturnType<typeof settlePair>, rootId: string, issuer: string) {
  const root = result.after.promises.find((p) => p.promiseId === rootId)!
  expect(result.receipt.studioId).toBe(issuer)
  expect(root.contractId).not.toBeNull()
  const employment = result.after.hollywood!.employment.filter((e) => e.contractId === root.contractId)
  expect(employment).toHaveLength(1)
  expect(employment[0]!.studioId).toBe(issuer)
  expect(employment[0]!.terms.talentId).toBe(root.beneficiaryPersonId)
  expect(employment[0]!.terms.startWeek).toBe(208)
  expect(root.feasibilityReceipt.week).toBe(208)
  expect(root.feasibilityReceipt.classification).toBe(ACHIEVABLE)
}

describe('P14B4: all six D3 class matches through real two-survivor settlements', () => {
  it.each([29, 30] as const)('age %i: mismatch changes only D3, never proposal legality', (age) => {
    const fixture = controlledPair(age)
    const baseline = settlePair(fixture, fixture.state)
    expect(baseline.receipt.studioId).toBe(fixture.playerId)
    expect(baseline.receipt.reasons.some((r) => /compensation/i.test(r))).toBe(true)
    for (const candidate of [P1, LEAD, FLEX]) {
      const attached = attachCandidate(fixture, fixture.incumbentId, candidate)
      const result = settlePair(fixture, attached.state)
      expect(result.receipt.dropped).toEqual(baseline.receipt.dropped)
      expect(result.own.promises).toEqual([])
      expect(result.incumbent.promises).toEqual([attached.root.promiseId])
      const frozenRoot = result.frozen.promises.find((p) => p.promiseId === attached.root.promiseId)!
      expect(promiseFeasibility(result.frozen, { ...frozenRoot,
        startWeek: result.incumbent.startWeek, termWeeks: result.incumbent.termWeeks }, 208).classification).toBe(ACHIEVABLE)
      expectPreferences(result.frozen, fixture.talentId, age === 30)
      const match = age === 30 || candidate.family === 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'
      expect(result.receipt.studioId).toBe(match ? fixture.incumbentId : fixture.playerId)
      expect(result.receipt.reasons.some((r) => /opportunity/i.test(r))).toBe(match)
      if (match) assertWonBinding(result, attached.root.promiseId, fixture.incumbentId)
      else expect(result.after.promises.find((p) => p.promiseId === attached.root.promiseId)!.contractId).toBeNull()
    }
    if (age === 29) {
      // A mismatching P1 can ALSO win on existing descriptors and really bind;
      // merely observing a losing-but-undropped mismatching bid is insufficient.
      const mismatch = attachCandidate(fixture, fixture.playerId, P1)
      const result = settlePair(fixture, mismatch.state)
      expect(result.receipt.dropped).toEqual(baseline.receipt.dropped)
      expect(result.receipt.reasons.some((r) => /opportunity/i.test(r))).toBe(false)
      assertWonBinding(result, mismatch.root.promiseId, fixture.playerId)
    }
  })
})

type ReadObservation = { input: GameState; draft: Parameters<typeof promiseFeasibility>[1]; week: number;
  proposal: TalentMarketProposal; submission: TalentMarketReceipt; receipt: ReturnType<typeof promiseFeasibility> }
type AttachmentObservation = { before: GameState; after: GameState; talentId: string; issuer: string;
  draft: Parameters<typeof attachPromise>[3] }
type FreezeObservation = { input: GameState; draft: Parameters<typeof promiseFeasibility>[1]; week: number;
  receipt: ReturnType<typeof promiseFeasibility> }

const witness = (seed: string | undefined, kind: string, first: ReadObservation, calls: readonly ReadObservation[], rootId: string | null) =>
  `${seed ?? 'default seed'} w${first.week} ${kind}: ${first.proposal.issuerStudioId} -> ${first.proposal.talentId} reads ${calls
    .map((c) => `${c.draft.family}=${c.receipt.classification}${c.receipt.bottleneck === null ? '' : ':' + c.receipt.bottleneck}`).join(', ')}${rootId === null ? '' : ' root ' + rootId}`

describe('P14B4: natural rival policy uses the real shared service, never staged failed candidates', () => {
  it('observes flexible-first, actual P1 fallback, proven P1, and a genuine zero-attachment refusal without extra RNG', () => {
    const evaluate = promiseModule.promiseFeasibility
    const attach = promiseModule.attachPromise
    const market = marketModule.advanceTalentMarketWeek
    let reads: ReadObservation[] = []
    let attachments: AttachmentObservation[] = []
    let freezes: FreezeObservation[] = []
    const seen = new Set<string>()
    const readSpy = vi.spyOn(promiseModule, 'promiseFeasibility').mockImplementation((input, draft, week) => {
      if (draft.promiseId !== undefined) {
        const receipt = evaluate(input, draft, week)
        if (input.talentMarket.proposals.some((p) => p.promises.includes(draft.promiseId!))) {
          freezes.push(clone({ input, draft, week, receipt }))
        }
        return receipt
      }
      if (input.hollywood === null || draft.issuerStudioId === input.hollywood.playerStudioId) return evaluate(input, draft, week)
      const proposals = input.talentMarket.proposals.filter((p) => p.talentId === draft.beneficiaryPersonId && p.issuerStudioId === draft.issuerStudioId)
      if (proposals.length === 0 || proposals[0]!.promises.length !== 0) return evaluate(input, draft, week)
      const before = clone(input), draftBefore = clone(draft)
      const receipt = evaluate(input, draft, week) // transparent actual result, never stubbed
      expect(input).toEqual(before)
      expect(draft).toEqual(draftBefore)
      expect(proposals).toHaveLength(1)
      const proposal = proposals[0]!
      expect(input.hollywood.identities.find((s) => s.studioId === proposal.issuerStudioId)?.role).toBe('rival')
      expect(input.talentMarket.cases.filter((c) => c.talentId === proposal.talentId && c.outcome === null)).toHaveLength(1)
      expect(proposal.submittedWeek).toBe(week)
      expect(week).toBe(input.market.tick)
      const submissions = input.talentMarket.receipts.filter((r) => r.kind === 'proposalSubmitted'
        && r.talentId === proposal.talentId && r.studioId === proposal.issuerStudioId && r.week === week)
      expect(submissions).toHaveLength(1)
      const observed = clone({ input, draft, week, proposal, submission: submissions[0]!, receipt })
      const duplicate = reads.find((r) => r.submission.eventId === observed.submission.eventId
        && r.draft.family === draft.family && JSON.stringify(r.draft.predicate) === JSON.stringify(draft.predicate))
      if (duplicate === undefined) reads.push(observed)
      else expect(observed).toEqual(duplicate) // exact repeat only; never hide changed inputs
      return receipt
    })
    const attachSpy = vi.spyOn(promiseModule, 'attachPromise').mockImplementation((input, id, issuer, draft) => {
      const before = clone(input), draftBefore = clone(draft)
      const after = attach(input, id, issuer, draft) // NO stub, conditional bypass, or duplicate attachment
      expect(input).toEqual(before)
      expect(draft).toEqual(draftBefore)
      expect(after.rngState).toBe(input.rngState)
      attachments.push(clone({ before, after, talentId: id, issuer, draft }))
      return after
    })
    const marketSpy = vi.spyOn(marketModule, 'advanceTalentMarketWeek').mockImplementation((input) => {
      const before = clone(input)
      const after = market(input)
      expect(input).toEqual(before)
      // Whole real market phase, not whole tick: actual reception may consume RNG.
      expect(after.rngState).toBe(input.rngState)
      return after
    })
    // One chain per seed, the same search and in-loop assertions for every seed; `seen` accumulates.
    const scan = (seed?: string) => {
      let state = p13aGeneratedStudio(seed)
      for (let step = 0; step < 220; step++) {
        reads = []; attachments = []; freezes = []
        state = tick(state)
        const submissions = state.talentMarket.receipts.filter((r) => r.kind === 'proposalSubmitted'
          && r.studioId !== null && r.studioId !== state.hollywood!.playerStudioId && r.week === state.market.tick)
        for (const submission of submissions) {
          const calls = reads.filter((r) => r.submission.eventId === submission.eventId)
          expect(calls.length).toBeGreaterThan(0)
          const first = calls[0]!
          expect(first.submission).toEqual(submission)
          const proven = realProven(first.input, first.proposal.talentId)
          const candidates = proven ? [P1] : [FLEX, P1]
          const expectedCount = !proven && first.receipt.classification !== ACHIEVABLE ? 2 : 1
          expect(calls).toHaveLength(expectedCount)
          for (const [index, call] of calls.entries()) {
            expect(call.input).toEqual(first.input) // no failed root, reserve, cash, receipt or RNG in between
            expect(call.proposal).toEqual(first.proposal)
            expect(call.submission).toEqual(submission)
            expect(call.draft).toEqual({ ...candidates[index], issuerStudioId: first.proposal.issuerStudioId,
              beneficiaryPersonId: first.proposal.talentId, startWeek: first.proposal.startWeek, termWeeks: first.proposal.termWeeks,
              windowStartWeek: first.proposal.startWeek, dueWeekExclusive: first.proposal.startWeek + first.proposal.termWeeks })
          }
          const chosen = calls.find((call) => call.receipt.classification === ACHIEVABLE)
          const writes = attachments.filter((a) => a.talentId === first.proposal.talentId && a.issuer === first.proposal.issuerStudioId)
          const current = marketModule.currentProposals(state, first.proposal.talentId).filter((p) => p.issuerStudioId === first.proposal.issuerStudioId)
          const originalCases = first.input.talentMarket.cases.filter((c) => c.talentId === first.proposal.talentId && c.outcome === null)
          expect(originalCases).toHaveLength(1)
          const originalCase = originalCases[0]!
          const finalCases = state.talentMarket.cases.filter((c) => c.talentId === originalCase.talentId
            && c.contractId === originalCase.contractId && c.openedWeek === originalCase.openedWeek)
          expect(finalCases).toHaveLength(1)
          const finalCase = finalCases[0]!
          let terminal: TalentMarketReceipt | undefined
          if (finalCase.outcome === null) {
            expect(finalCase).toEqual(originalCase)
            expect(current).toHaveLength(1)
          } else {
            // Authoring precedes settlement: a genuine decision-week proposal
            // may lawfully close/bind in THIS SAME market phase. Do not skip it.
            expect(['settled', 'declined']).toContain(finalCase.outcome)
            expect(finalCase.closedWeek).toBe(first.week)
            const decision = first.input.hollywood!.employment.find((e) => e.contractId === originalCase.contractId)
            expect(decision).toBeDefined()
            expect(decision!.terms.endWeekExclusive).toBeLessThanOrEqual(first.week)
            expect(marketModule.currentProposals(state, originalCase.talentId)).toEqual([])
            const terminals = state.talentMarket.receipts.filter((r) => r.talentId === originalCase.talentId
              && r.kind === finalCase.outcome && r.week === first.week
              && !first.input.talentMarket.receipts.some((old) => old.eventId === r.eventId))
            expect(terminals).toHaveLength(1)
            terminal = terminals[0]!
            if (terminal.kind === 'settled') {
              expect(terminal.studioId).not.toBeNull()
              const winner = state.hollywood!.employment.filter((e) => e.terms.talentId === originalCase.talentId
                && e.studioId === terminal!.studioId && e.terms.startWeek === first.week && e.endedWeek === null)
              expect(winner).toHaveLength(1)
              expect(first.input.hollywood!.employment.some((e) => e.contractId === winner[0]!.contractId)).toBe(false)
            }
          }
          const beforePair = first.input.promises.filter((p) => p.beneficiaryPersonId === first.proposal.talentId && p.issuerStudioId === first.proposal.issuerStudioId)
          const afterPair = state.promises.filter((p) => p.beneficiaryPersonId === first.proposal.talentId && p.issuerStudioId === first.proposal.issuerStudioId)
          if (chosen === undefined) {
            expect(writes).toEqual([])
            // The negative path is checked even when its actual case closes.
            // No attachment means no newly minted pair root or reservation.
            expect(afterPair).toEqual(beforePair)
            if (terminal === undefined) expect(current).toEqual([first.proposal])
            if (!proven && !seen.has('neither')) console.log(witness(seed, 'neither', first, calls, null))
            if (!proven) seen.add('neither') // requires actual BOTH-candidate refusal
          } else {
            expect(writes).toHaveLength(1)
            const write = writes[0]!
            expect(write.before).toEqual(chosen.input)
            expect(write.after.promises.slice(0, -1)).toEqual(write.before.promises)
            expect(write.after.promises).toHaveLength(write.before.promises.length + 1)
            expect(write.draft).toEqual({ family: chosen.draft.family, predicate: chosen.draft.predicate,
              windowStartWeek: chosen.draft.windowStartWeek, dueWeekExclusive: chosen.draft.dueWeekExclusive })
            const root = write.after.promises.at(-1)!
            // Exact author-time facts belong to immediate actual attach output,
            // before a later same-pass winner receives its freeze receipt.
            const authored = marketModule.currentProposals(write.after, first.proposal.talentId)
              .filter((p) => p.issuerStudioId === first.proposal.issuerStudioId)
            expect(authored).toHaveLength(1)
            const proposal = authored[0]!
            expect(proposal).toEqual({ ...first.proposal, promises: proposal.promises, digest: proposal.digest })
            expect(proposal.promises).toEqual([root.promiseId])
            expect(proposal.digest).not.toBe(first.proposal.digest)
            expect(root).toMatchObject({ family: chosen.draft.family, predicate: chosen.draft.predicate,
              issuerStudioId: first.proposal.issuerStudioId, beneficiaryPersonId: first.proposal.talentId,
              windowStartWeek: first.proposal.startWeek, dueWeekExclusive: first.proposal.startWeek + first.proposal.termWeeks,
              contractId: null, outcome: null, progress: 0, evidenceRefs: [] })
            expect(root.feasibilityReceipt).toEqual(chosen.receipt)
            expect(root.feasibilityReceipt.week).toBe(submission.week)
            expect(afterPair.filter((p) => beforePair.some((old) => old.promiseId === p.promiseId))).toEqual(beforePair)
            const newRoots = afterPair.filter((p) => !beforePair.some((old) => old.promiseId === p.promiseId))
            expect(newRoots).toHaveLength(1)
            const finalRoot = newRoots[0]!
            expect(finalRoot.promiseId).toBe(root.promiseId)
            if (terminal?.kind === 'settled' && terminal.studioId === root.issuerStudioId) {
              const employment = state.hollywood!.employment.filter((e) => e.contractId === finalRoot.contractId)
              expect(employment).toHaveLength(1)
              expect(employment[0]!).toMatchObject({ studioId: root.issuerStudioId, endedWeek: null,
                terms: { talentId: root.beneficiaryPersonId, startWeek: first.week, termWeeks: first.proposal.termWeeks } })
              const matching = freezes.filter((f) => f.draft.promiseId === root.promiseId && f.week === first.week
                && f.receipt.classification === ACHIEVABLE
                && f.input.talentMarket.proposals.some((p) => p.talentId === proposal.talentId
                  && p.issuerStudioId === proposal.issuerStudioId && p.digest === proposal.digest))
              expect(matching.length).toBeGreaterThan(0)
              expect(matching.map((f) => f.receipt)).toContainEqual(finalRoot.feasibilityReceipt)
              for (const frozen of matching) {
                expect(frozen.input.promises.find((p) => p.promiseId === root.promiseId)).toEqual(root)
                expect(frozen.input.hollywood!.employment.some((e) => e.contractId === finalRoot.contractId)).toBe(false)
              }
              expect(finalRoot).toEqual({ ...root, contractId: employment[0]!.contractId,
                feasibilityReceipt: finalRoot.feasibilityReceipt })
              expect(finalRoot.feasibilityReceipt.week).toBe(first.week)
            } else {
              expect(finalRoot).toEqual(root) // open, declined or another studio won
              if (terminal === undefined) expect(current).toEqual([proposal])
            }
            const kind = proven ? 'provenP1' : chosen.draft.family === 'LEAD_OR_SIGNIFICANT_ROLE_COUNT' ? 'flexibleP2' : 'P1fallback'
            if (!seen.has(kind)) console.log(witness(seed, kind, first, calls, root.promiseId))
            seen.add(kind)
          }
        }
        if (seen.size === 4) break
      }
    }
    try {
      scan() // the default seed: every witness it carried before 600-T4 is still required of it below
      expect([...seen].sort()).toEqual(expect.arrayContaining(['flexibleP2', 'neither', 'provenP1']))
      // 600-T4 (record 616 R-6; F-G9-1): the P1-fallback branch (FLEX non-achievable, P1 achievable for an
      // unproven person) has no natural witness on the default seed within 220 ticks (600-T2 D.3). 'seed-b'
      // carries it at w196 (r03 -> r03-4, actor 28: FLEX FRAGILE "needs a picture not yet commissioned", P1
      // REASONABLY_ACHIEVABLE, root promise-36; scan log 600-T4-scan-C-policy-seed-b-seed-c-bottleneck.log),
      // found by this same search with the same in-loop assertions. Never a synthetic state.
      scan('seed-b')
    } finally {
      marketSpy.mockRestore(); attachSpy.mockRestore(); readSpy.mockRestore()
    }
    expect([...seen].sort()).toEqual(['P1fallback', 'flexibleP2', 'neither', 'provenP1'].sort())
  })
})
