// ── P14A.1-F1-T1: RED regression for the public priority order and the public
// preferred term ──────────────────────────────────────────────────────────
//
// Requirement source: docs/engineering/playability-launch-review/plans/
// P14-HEADLESS-PLAN.md, "## P14A.1-F1 — public priority order regression
// (inherited defect; fix before P14B.1 T0)": "`priorityOrder`
// (`src/core/talentMarket.ts` 636–641) returns
// `['term','compensation','standing','incumbency']` for a capable-but-unproven
// person; companion §2.1.7 orders that archetype opportunity, compensation,
// relationships, term, trust, Standing, incumbency, which reduces over the
// live descriptors to `compensation, term, standing, incumbency`. The proven
// branch `['compensation','term','incumbency','standing']` is correct. ...
// Coupled hazard: `preferredTerm` (643–647) selects the longest term iff
// `priorityOrder(...)[0] === 'compensation'`, so correcting the order alone
// would make every person prefer the longest term."
//
// Law, by reference to docs/engineering/p14-preparation-8ef5246a/
// P14-PREPARATION-COMPANION.md §2.1.7 ("The person-choice rule"): "Ties in
// win count are broken by the person's public priority order over
// descriptors — an archetype derived from public facts and shown on the
// profile (hypothesis: capable-but-unproven and under-30 → opportunity,
// compensation, relationships, term, trust, Standing, incumbency; proven
// veterans → compensation, term, trust, relationships, incumbency, Standing,
// opportunity)". At P14A.1-F1 (T1/T2 below), D3 (opportunity), D4 (trust)
// and D5 (relationships) were all NEUTRAL (talentMarket.ts DESCRIPTOR_ORDER
// comment, ~608–615), so the archetype orders reduced, over the four LIVE
// descriptors only, to `compensation, term, standing, incumbency` (unproven)
// and `compensation, term, incumbency, standing` (proven) — the two arrays
// this file originally pinned.
//
// SUPERSEDED AT P14B.1.T2c (moved-neighbour pin, T2 ruling (v)): P14B.1 (8)
// widened `DESCRIPTOR_ORDER` to six live descriptors — D3 opportunity and D4
// trust go live, D5 relationships stays neutral (moved to P14B.2) — so the
// SAME companion sentence now reduces to the SIX-descriptor orders below.
// The F1 requirement survives inside both: compensation still precedes term
// for the unproven branch, and incumbency still precedes standing for the
// proven one (both named explicitly in each `it` title below).
//   unproven: opportunity, compensation, term, trust, standing, incumbency
//   proven:   compensation, term, trust, incumbency, standing, opportunity
//
// EXPECTED RED (per the assigning brief, HISTORICAL — T1): the unproven-order
// case below failed at T1 (the landed code returned `term` first over the
// four-descriptor reduction); the proven-order case and both
// `publicPreferredTerm` cases passed at T1 (pinning current, correct
// behaviour so T2's fix could not regress or couple them). Both
// `publicPriorityOrder` arrays are moved-neighbour pins as of T2c (values
// only — the two `it`s below assert THIS file's job, never re-litigated);
// the two `publicPreferredTerm` cases and the `it.todo` are UNCHANGED. The
// fifth case (a settlement-level 1–1 Copeland tie) is `it.todo` — see its
// comment for the obstacle, established by measurement, not assumption.

import { describe, expect, it } from 'vitest'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import { publicPriorityOrder, publicPreferredTerm } from '../src/core/talentMarket.js'
import { TUNING } from '../src/core/tuning.js'

// Pure-function fixture: publicPriorityOrder/publicPreferredTerm read only
// `state.talent` (career identity + age) and `TUNING.CONTRACT_TERM_OPTIONS`.
// No market/hollywood machinery is needed for these two functions, so the
// bare generated roster is enough — the archetype is found by search, never
// hardcoded, exactly as `priorityOrder`'s own definition reads it
// (talentMarket.ts ~636: `careerIdentity(talent).identityDisciplines.length
// > 0 || talent.age >= 30` is "proven"; the negation is "capable-but-unproven").
const state = p13aGeneratedStudio()

function findUnproven(): string {
  const t = state.talent.find((p) => p.age < 30 && careerIdentity(p).identityDisciplines.length === 0)
  if (t === undefined) {
    throw new Error('fixture premise failed: no capable-but-unproven (age < 30, no identity-discipline credit) talent on this seed')
  }
  return t.id
}

function findProven(): string {
  const t = state.talent.find((p) => p.age >= 30 || careerIdentity(p).identityDisciplines.length > 0)
  if (t === undefined) {
    throw new Error('fixture premise failed: no proven (identity-discipline credit or age >= 30) talent on this seed')
  }
  return t.id
}

describe('P14A.1-F1: publicPriorityOrder and publicPreferredTerm against companion §2.1.7', () => {
  it('capable-but-unproven (age < 30, no identity-discipline credit): publicPriorityOrder is the WIDENED six-descriptor order (opportunity, compensation, term, trust, standing, incumbency) — compensation still precedes term (the F1 fix survives the widening)', () => {
    const talentId = findUnproven()
    expect(publicPriorityOrder(state, talentId)).toEqual(['opportunity', 'compensation', 'term', 'trust', 'standing', 'incumbency'])
  })

  it('proven (an identity-discipline credit, or age >= 30): publicPriorityOrder is the WIDENED six-descriptor order (compensation, term, trust, incumbency, standing, opportunity) — incumbency still precedes standing (the F1 fix survives the widening); pinned so neither fix can disturb the other', () => {
    const talentId = findProven()
    expect(publicPriorityOrder(state, talentId)).toEqual(['compensation', 'term', 'trust', 'incumbency', 'standing', 'opportunity'])
  })

  it('proven: publicPreferredTerm is the longest TUNING.CONTRACT_TERM_OPTIONS entry', () => {
    const talentId = findProven()
    const options = TUNING.CONTRACT_TERM_OPTIONS
    expect(publicPreferredTerm(state, talentId)).toBe(options[options.length - 1])
  })

  it('capable-but-unproven: publicPreferredTerm is the shortest TUNING.CONTRACT_TERM_OPTIONS entry — holds today (via the coupled order[0]!==\'compensation\' branch) and must keep holding after T2 decouples it from array order', () => {
    const talentId = findUnproven()
    const options = TUNING.CONTRACT_TERM_OPTIONS
    expect(publicPreferredTerm(state, talentId)).toBe(options[0])
  })

  // NOT CONSTRUCTIBLE under the landed seat law — measured, not assumed, via
  // disposable vite-node probes against p13aGeneratedStudio() (deleted after
  // use, per this repo's own precedent in tests/p14a1-seat-budget.test.ts's
  // header). A talent-market case only ever opens from a row in
  // `hollywood.activeEmploymentOrdinals` nearing ITS OWN expiry
  // (talentMarket.ts advanceTalentMarketWeek, discovery step ~1025–1046), so
  // a case's `subjectStudioId` is always a real incumbent — there is no
  // free-agent case shape to attach two non-incumbent challengers to.
  //
  // On this fixture every founding rival (r01–r04) holds its full
  // RIVAL_TEAM_ROLES seats on every role (writer 1, director 1, actor 3,
  // craft 1) with EVERY founding contract expiring at the identical week
  // 208 — measured directly: at week 40/52 all four rivals show
  // heldPastW(role) === cap on all four roles, so `survivesFreeze`'s
  // `noSeatForRole` predicate drops any second rival proposal on any
  // pre-208 case before ranking; no non-incumbent rival has a seat to bid a
  // genuine second proposal with before week 208.
  //
  // At week 208 itself the seat deficit flips true for every rival on every
  // role simultaneously, so `rivalProposalTrigger` branch (c) fires for
  // every one of the 24 synchronized cases and every entered rival
  // auto-submits through the ordinary weekly `tick()` pass (measured: 36
  // seat-drop sentences across the 24 week-208 receipts on the adjacent
  // seed in tests/p14a1-seat-budget.test.ts, case A) — a hand-picked
  // 2-proposal pairing (one compensation winner, one term winner, both
  // non-incumbent, standing tied) cannot be isolated from that automatic
  // multi-party contest without either accepting uncontrolled extra
  // proposals whose bands this file does not choose, or fabricating a case,
  // a roster count or a decision week this file's own convention (and the
  // assigning brief: "derive the talentId and week from state, never
  // magic") forbids inventing. A player-authored fresh signing sidesteps
  // the saturated founding roster but cannot reach a decision week earlier
  // than +52 weeks (the shortest TUNING.CONTRACT_TERM_OPTIONS entry), by
  // which point whether any rival still has open seats is itself unmeasured
  // and not assumed here.
  it.todo(
    'an unproven subject facing a 1–1 Copeland tie between two non-incumbent proposals (one better on compensation and worse on term, the other reversed; standing and incumbency tied) settles for the compensation winner, with the reason naming compensation — ' +
      'OBSTACLE: no non-incumbent rival holds a free seat on any pre-week-208 case on this seed (every founding rival is at its RIVAL_TEAM_ROLES cap on every role, all expiring together at week 208), and at week 208 the seat deficit trigger fires for every rival on every one of the 24 synchronized cases in the same tick, so a hand-picked 2-proposal pairing cannot be isolated without fabricating state facts this file will not invent.',
  )
})
